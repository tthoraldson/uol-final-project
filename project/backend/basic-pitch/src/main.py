from basic_pitch.inference import predict_and_save
from basic_pitch import ICASSP_2022_MODEL_PATH

# Define your input and output parameters
audio_path_list = ["path/to/your/audio.wav"]
output_directory = "path/to/output_folder"

# Run the transcription model
predict_and_save(
    audio_path_list=audio_path_list,
    output_directory=output_directory,
    save_midi=True,
    sonify_midi=False,
    save_model_outputs=False,
)