from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse, Response
import logging
import os
from pathlib import Path
import mlflow
import crepe
from scipy.io import wavfile
import numpy as np
import tempfile
from io import BytesIO

logger = logging.getLogger(__name__)

# setup MLFlow
MLFLOW_URI = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5050")
mlflow.set_tracking_uri(MLFLOW_URI)
mlflow.enable_system_metrics_logging()



app = FastAPI()

@app.get("/")
async def home():
    print("hello, world")


@app.post("/pitch-tracker")
async def pitchTracker(audio: UploadFile = File(...)):
    # TODO:
    # [ ] Add step size param
    # [ ] Add Viterbi param
    with tempfile.NamedTemporaryFile(
        suffix=".wav",
        delete=False
    ) as temp:
        temp.write(await audio.read())
        audio_path = Path(temp.name)

    try:
        sr, audio_data = wavfile.read(audio_path)

        time, frequency, confidence, activation = crepe.predict(
            audio_data,
            sr,
            step_size=10,
            model_capacity="full",
            viterbi=True,
            verbose=1,
        )

        predictions = [
            {
                "time": float(t),
                "frequency": float(freq),
                "confidence": float(conf),
            }
            for t, freq, conf in zip(time, frequency, confidence)
        ]

        return {
            "sample_rate": sr,
            "predictions": predictions,
        }

    finally:
        audio_path.unlink(missing_ok=True)


@app.post("/pitch-tracker-image")
async def pitchTrackerImage(plot_voicing: bool = False, audio: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(
        suffix=".wav",
        delete=False
    ) as temp:
        temp.write(await audio.read())
        audio_path = Path(temp.name)

    try:
        sr, audio_data = wavfile.read(audio_path)

        time, frequency, confidence, activation = crepe.predict(
            audio_data,
            sr,
            step_size=10,
            model_capacity="full",
            viterbi=True,
            verbose=1
        )

        # This part to generate the CREPE plot was taken directly from the crepe repository,
        # since it's not implemented for library usage:
        # https://github.com/marl/crepe/blob/master/crepe/core.py
        import matplotlib.cm
        from imageio import imwrite

        # to draw the low pitches in the bottom
        salience = np.flip(activation, axis=1)
        # this line was changed from the original implementation to handle the new way of grabbing color maps
        inferno = matplotlib.colormaps['inferno'] 
        image = inferno(salience.transpose())

        if plot_voicing:
            # attach a soft and hard voicing detection result under the
            # salience plot
            image = np.pad(image, [(0, 20), (0, 0), (0, 0)], mode='constant')
            image[-20:-10, :, :] = inferno(confidence)[np.newaxis, :, :]
            image[-10:, :, :] = (
                inferno((confidence > 0.5).astype(np.float))[np.newaxis, :, :])

        image_buffer = BytesIO()

        imwrite(
            image_buffer,
            (255 * image).astype(np.uint8),
            format="png"
        )

        return Response(
            content=image_buffer.getvalue(),
            media_type="image/png"
        )

    finally:
        audio_path.unlink(missing_ok=True)