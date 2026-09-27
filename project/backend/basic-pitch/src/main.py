from basic_pitch.inference import predict_and_save
from basic_pitch import ICASSP_2022_MODEL_PATH
import logging
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
import mlflow
import os
from pathlib import Path
import tempfile
from tempfile import TemporaryDirectory, NamedTemporaryFile
import wave

logger = logging.getLogger(__name__)

# setup MLFlow
MLFLOW_URI = os.getenv("MLFLOW_TRACKING_URI", "http://host.docker.internal:5050")
mlflow.set_tracking_uri(MLFLOW_URI)
mlflow.enable_system_metrics_logging()

output_directory = "/"


app = FastAPI(title="basic-pitch API")

@app.get("/")
async def home():
    logger.info("hello, world")
    return "Hello, World!"

@app.post("/midi")
async def getMidi(audio: UploadFile = File(...)):
    await audio.seek(0)
    audio_data = await audio.read()

    logger.warning("filename: %s", audio.filename)
    logger.warning("content type: %s", audio.content_type)
    logger.warning("received bytes: %d", len(audio_data))
    logger.warning("received header: %s", audio_data[:16])

    mlflow.set_experiment("Basic-Pitch-Midi-Generation")

    with mlflow.start_run() as run:
        mlflow.log_params({
            "model": "./nmp.onnx",
            "save_midi": True,
            "sonify_midi": False,
            "save_notes": False,
            "save_model_outputs": False,
        })

        with NamedTemporaryFile(suffix=".mp3", delete=False) as temp_audio:
            audio_path = Path(temp_audio.name)
            temp_audio.write(audio_data)

        try:
            predict_and_save(
                audio_path_list=[str(audio_path)],
                model_or_model_path="./nmp.onnx",
                output_directory=output_directory,
                save_midi=True,
                sonify_midi=False,
                save_notes=False,
                save_model_outputs=False,
            )

            midi_files = list(Path(output_directory).glob("*.mid"))

            if not midi_files:
                raise RuntimeError(
                    "Basic Pitch did not generate a MIDI file"
                )

            midi_file = midi_files[0]

        finally:
            audio_path.unlink(missing_ok=True)

        return FileResponse(
            path=str(midi_file),
            media_type="audio/midi",
            filename="generated.mid",
        )