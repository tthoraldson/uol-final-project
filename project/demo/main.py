import gradio as gr
import crepe
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import librosa
import json
import ast
import uuid
from pathlib import Path
import abjad

OUTPUT_DIR = Path("generated_scores")
OUTPUT_DIR.mkdir(exist_ok=True)


def parse_notes_string(notes_string):
        # Already a Python list
    if isinstance(notes_string, list):
        return notes_string

    # String representation of a list
    if isinstance(notes_string, str):
        try:
            parsed = ast.literal_eval(notes_string)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass


def note_to_abjad(note_name, duration="4"):
    pitch = note_name[:-1].lower()
    octave = int(note_name[-1])

    # LilyPond octave notation:
    # C4 = c'
    if octave >= 4:
        octave_marks = "'" * (octave - 3)
    else:
        octave_marks = "," * (3 - octave)

    return f"{pitch}{octave_marks}{duration}"


def render_notes_to_abjad_image(notes_string, clef="bass"):
    notes = parse_notes_string(notes_string)

    abjad_notes = [
        abjad.Note(note_to_abjad(note))
        for note in notes
    ]

    staff = abjad.Staff(abjad_notes)
    abjad.attach(abjad.Clef(clef), staff[0])

    file_id = uuid.uuid4().hex
    output_path = OUTPUT_DIR / file_id

    result = abjad.persist.as_png(staff, str(output_path))

    # Abjad usually returns a tuple like:
    # ('generated_scores/abc123.png', ...)
    if isinstance(result, tuple):
        print(result)
        return result[0][0]

    return str(output_path.with_suffix(".png"))

def generate_score_midi():
    return

def analyze_pitch(audio):
    """
    audio from Gradio is usually:
    (sample_rate, numpy_array)
    """
    if audio is None:
        return None, "No audio provided."

    sr, y = audio

    if len(y.shape) > 1:
        y = np.mean(y, axis=1)


    y = y.astype(np.float32)
    if np.max(np.abs(y)) > 0:
        y = y / np.max(np.abs(y))

    time, frequency, confidence, activation = crepe.predict(
        y,
        sr,
        model_capacity='small',
        viterbi=True,
        step_size=10
    )

    df = pd.DataFrame({
        "time_seconds": time,
        "frequency_hz": frequency,
        "confidence": confidence
    })

    # Basic summary
    confident = df[df["confidence"] > 0.7]

    if len(confident) == 0:
        summary = "No confident pitch detected."
    else:
        avg_pitch = confident["frequency_hz"].mean()
        plot = plot_pitch(df)
        notes = estimate_notes_per_second(df)
        score = render_notes_to_abjad_image(notes)

    return df, plot, notes, score

def plot_pitch(df):
    fig, ax = plt.subplots(figsize=(8, 4))

    ax.plot(
        df["time_seconds"],
        df["frequency_hz"],
        linewidth=1,
        label="Frequency"
    )

    # Optional: only show confident detections
    confident = df[df["confidence"] > 0.7]
    ax.scatter(
        confident["time_seconds"],
        confident["frequency_hz"],
        color="red",
        s=8,
        label="Confidence > 0.7"
    )

    ax.set_title("Hertz/seconds")
    ax.set_xlabel("seconds")
    ax.set_ylabel("Hertz")
    ax.grid(True)
    ax.legend()

    return fig

def estimate_notes_per_second(df, confidence_threshold=0.7):
    # Keep only confident predictions
    df = df[df["confidence"] >= confidence_threshold].copy()

    df["note"] = librosa.hz_to_note(df["frequency_hz"])

    # Group predictions by whole second
    df["second"] = df["time_seconds"].astype(int)

    notes = (
        df.groupby("second")["note"]
          .agg(lambda x: x.mode().iloc[0] if not x.mode().empty else None)
          .tolist()
    )

    return notes

with gr.Blocks() as demo:
    gr.Markdown("# Sight Reading")

    with gr.Tab("Analyze Pitch"):
        audio_input = gr.Audio(
            sources=["microphone", "upload"],
            type="numpy",
            label="Record or upload audio"
        )

        pitch_df = gr.Dataframe(label="Pitch Detection Results")
        pitch_plot = gr.Plot(label="Pitch Plot")
        notes_text = gr.Text(label="Notes Per Second")
        score = gr.Image(label="Rendered Score")

        analyze_button = gr.Button("Analyze")

        analyze_button.click(
            fn=analyze_pitch,
            inputs=audio_input,
            outputs=[pitch_df, pitch_plot, notes_text, score]
        )

demo.launch(server_name="0.0.0.0", server_port=7860)