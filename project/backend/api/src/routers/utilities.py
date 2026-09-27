import logging
from pathlib import Path
from tempfile import NamedTemporaryFile
import matplotlib.pyplot as plt
import pretty_midi
import librosa
from fastapi import APIRouter, File, UploadFile
from fastapi.responses import Response
from routers.basic_pitch import generate_midi

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/utilities",
    tags=["utilities"])

@router.post("/midi-image")
async def midi_image(midi_file: UploadFile = File(...)):
    midi_data = await midi_file.read()

    image_data = create_midi_image(midi_data)

    return Response(
        content=image_data,
        media_type="image/png",
    )

@router.post("/basic-pitch-midi-image")
async def midi_image(wav: UploadFile = File(...)):
    midi_file = generate_midi(wav)
    midi_data = await midi_file.read()

    image_data = create_midi_image(midi_data)

    return Response(
        content=image_data,
        media_type="image/png",
    )


def create_midi_image(midi_data: bytes) -> bytes:
    pm = pretty_midi.PrettyMIDI(BytesIO(midi_data))
    plt.figure(figsize=(8, 4))
    plot_piano_roll(pm, 56, 70)
    image_buffer = BytesIO()

    plt.savefig(
        image_buffer,
        format="png",
        dpi=150,
        bbox_inches="tight",
    )

    plt.close()

    return image_buffer.getvalue()

# This function is from a tutorial:
# https://github.com/craffel/pretty-midi/blob/main/Tutorial.ipynb
def plot_piano_roll(pm, start_pitch, end_pitch, fs=100):
    # Use librosa's specshow function for displaying the piano roll
    librosa.display.specshow(pm.get_piano_roll(fs)[start_pitch:end_pitch],
                             hop_length=1, sr=fs, x_axis='time', y_axis='cqt_note',
                             fmin=pretty_midi.note_number_to_hz(start_pitch))