import gradio as gr
import crepe
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import librosa

def analyze_pitch(audio):
    """
    audio from Gradio is usually:
    (sample_rate, numpy_array)
    """
    if audio is None:
        return None, "No audio provided."

    sr, y = audio

    # Convert stereo to mono if needed
    if len(y.shape) > 1:
        y = np.mean(y, axis=1)

    # Normalize audio
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

    return df, plot, notes

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

    # Convert frequency -> note name
    df["note"] = librosa.hz_to_note(df["frequency_hz"])

    # Group predictions by whole second
    df["second"] = df["time_seconds"].astype(int)

    notes = (
        df.groupby("second")["note"]
          .agg(lambda x: x.mode().iloc[0] if not x.mode().empty else None)
          .tolist()
    )

    return notes

demo = gr.Interface(
    fn=analyze_pitch,
    inputs=gr.Audio(
        sources=["microphone", "upload"],
        type="numpy",
        label="Record or upload audio"
    ),
    outputs=[
        gr.Dataframe(label="Pitch Detection Results"),
        gr.Plot(label="Pitch Plot"),
        gr.Text(label="Note")
    ],
    title="Sight Reading",
    description="Record or upload audio and analyze pitch using CREPE."
)


if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)