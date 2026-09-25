from basic_pitch.inference import predict_and_save
from basic_pitch import ICASSP_2022_MODEL_PATH
import logging
from fastapi import FastAPI
import mlflow
import os
from pathlib import Path
from tempfile import TemporaryDirectory
from bokeh.io import export_png
from pretty_midi import PrettyMIDI
from visual_midi import Plotter

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

@app.get("/midi")
async def getMidi(midi: str):
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

        predict_and_save(
            audio_path_list=audio_path_list,
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

        mlflow.log_artifact(
                str(midi_file),
                artifact_path="midi",
            )

        html_file = Path(output_directory) / "midi.html"

        make_midi_html(
            str(midi_file),
            str(html_file),
        )

        mlflow.log_artifact(
            str(html_file),
            artifact_path="visualization",
        )

        return {
            "status": "success",
            "run_id": run.info.run_id,
            "midi": str(midi_file),
        }



def make_midi_html(midi_file: str, html_file: str):
    midi = PrettyMIDI(midi_file)

    plotter = Plotter()

    plotter.save(
        midi,
        html_file,
    )
