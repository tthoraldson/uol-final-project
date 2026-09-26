from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
import logging
import os
from pathlib import Path
import mlflow
import crepe
from scipy.io import wavfile
import tempfile

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
async def getMidi(audio: UploadFile = File(...)):
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