from basic_pitch.inference import predict_and_save
from basic_pitch import ICASSP_2022_MODEL_PATH
import logging
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
import mlflow
import os
from pathlib import Path
from tempfile import TemporaryDirectory, NamedTemporaryFile

logger = logging.getLogger(__name__)

# setup MLFlow
MLFLOW_URI = os.getenv("MLFLOW_TRACKING_URI", "http://host.docker.internal:5050")
mlflow.set_tracking_uri(MLFLOW_URI)
mlflow.enable_system_metrics_logging()

audio_path_list = ["c-major.wav"]
output_directory = "/"


app = FastAPI()

@app.get("/")
async def home():
    logger.info("hello, world")
    return "Hello, World!"

@app.post("/midi")
async def getMidi(audio: UploadFile = File(...)):
    logger.info("inside getMidi()")
    mlflow.set_experiment("Basic-Pitch-Midi-Generation")

    with mlflow.start_run() as run:
        mlflow.log_params({
                "model": "./nmp.onnx",
                "save_midi": True,
                "sonify_midi": False,
                "save_notes": False,
                "save_model_outputs": False,
            })


        with NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
            audio_path = Path(temp_audio.name)

            while chunk := await audio.read(1024 * 1024):
                temp_audio.write(chunk)
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

            midi_files = list(
                Path(output_directory).glob("*.mid")
            )

            if not midi_files:
                raise RuntimeError("Basic Pitch did not generate a MIDI file")

            midi_file = midi_files[0]


        finally:
            return FileResponse(
                path=str(midi_file),
                media_type="audio/midi",
                filename="generated.mid",
            )
