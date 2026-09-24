from basic_pitch.inference import predict_and_save
from basic_pitch import ICASSP_2022_MODEL_PATH

# Define your input and output parameters
audio_path_list = ["c-major.wav"]
output_directory = "/"

# Run the transcription model
predict_and_save(
    audio_path_list=audio_path_list,
    model_or_model_path="./nmp.onnx",
    output_directory=output_directory,
    save_midi=True,
    sonify_midi=False,
    save_notes=False,
    save_model_outputs=False,
)