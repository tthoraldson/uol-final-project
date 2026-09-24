from basic_pitch.inference import predict_and_save
from basic_pitch import ICASSP_2022_MODEL_PATH
import logging
from fastapi import FastAPI
import mlflow
import os

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
    print("hello, world")

@app.get("/midi")
async def getMidi():
    print("hello, world")

    predict_and_save(
        audio_path_list=audio_path_list,
        model_or_model_path="./nmp.onnx",
        output_directory=output_directory,
        save_midi=True,
        sonify_midi=False,
        save_notes=False,
        save_model_outputs=False,
    )