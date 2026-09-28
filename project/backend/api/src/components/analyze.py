from fastapi import UploadFile
import io
import mir_eval
import numpy as np
import pretty_midi
import muspy
import logging
from io import BytesIO
import librosa

from routers.basic_pitch import generate_midi
from components.abc_utils import ensure_default_note_length, abc_to_midi, abc_to_np
from routers.crepe import generate_pitch

logger = logging.getLogger(__name__)


async def analyze_v1(abc_string: str, audio: UploadFile):
    # determine tempo
    await audio.seek(0)
    audio_bytes = await audio.read()

    audio_data, sr = librosa.load(
        BytesIO(audio_bytes),
        sr=None,
        mono=True,
    )

    tempo, _ = librosa.beat.beat_track(
        y=audio_data,
        sr=sr,
    )

    # np to actual number
    tempo = float(np.asarray(tempo).reshape(-1)[0])

    # expected notes from the ABC/muspy representation
    music, expected_intervals, expected_pitches = abc_to_np(abc_string, tempo)

    # get midi from basic-pitch
    audio.seek(0)
    user_midi = await generate_midi(audio)

    # get pitch frequency data from CREPE
    await audio.seek(0)
    pitch_data = await generate_pitch(audio)

    # get np.array object from midi
    notes, recognized_intervals, recognized_pitches = midi_to_arrays(
        user_midi
    )

    # Calculate metrics on midi to np interval arrays
    # quite often getting shape mismatch errors here
    matching = mir_eval.transcription.match_notes(
        expected_intervals,
        expected_pitches,
        recognized_intervals,
        recognized_pitches,
    )

    results = np.zeros(len(expected_pitches), dtype=int)

    f1, precision, recall, overlap = (
        mir_eval.transcription.precision_recall_f1_overlap(
            expected_intervals,
            expected_pitches,
            recognized_intervals,
            recognized_pitches,
        )
    )

    # convert crepe data into individual np.array
    #logger.warn(pitch_data)
    estimated_time = np.array(
    [frame["time"] for frame in pitch_data["predictions"]],
    dtype=float,
)

    estimated_frequency = np.array(
        [frame["frequency"] for frame in pitch_data["predictions"]],
        dtype=float,
    )
    reference_frequency = np.zeros_like(estimated_time)


    
    for (start, end), pitch in zip(
        expected_intervals,
        expected_pitches,
    ):
        mask = (
            (estimated_time >= start)
            & (estimated_time < end)
        )

        reference_frequency[mask] = librosa.midi_to_hz(
            pitch
        )

    crepe_metrics = mir_eval.melody.evaluate(
        estimated_time,
        reference_frequency,
        estimated_time,
        estimated_frequency,
    )

    return {
        "results": results.tolist(),
        "metrics": {
            "basic_pitch": {
                "precision": float(precision),
                "recall": float(recall),
                "f_measure": float(f1),
                "average_overlap_ratio": float(overlap),
            },
            "crepe": {
                "voicing_recall": float(
                    crepe_metrics["Voicing Recall"]
                ),
                "voicing_false_alarm": float(
                    crepe_metrics["Voicing False Alarm"]
                ),
                "raw_pitch_accuracy": float(
                    crepe_metrics["Raw Pitch Accuracy"]
                ),
                "raw_chroma_accuracy": float(
                    crepe_metrics["Raw Chroma Accuracy"]
                ),
                "overall_accuracy": float(
                    crepe_metrics["Overall Accuracy"]
                ),
            },
        },
        "summary": {
            "notes_expected": len(expected_pitches),
            "notes_played": len(recognized_pitches),
            "notes_correct": len(matching),
            "notes_incorrect": (
                len(expected_pitches) - len(matching)
            ),
        },
        "pitch_data": pitch_data,
    }


def test_abc_function(abc: str):
    abc = abc.replace("\\n", "\n")
    abc = ensure_default_note_length(abc)

    music = muspy.read_abc_string(abc)

    logger.warning(music)
    logger.warning(music.tracks.notes)

    return music


def midi_to_arrays(midi_data: bytes):
    midi = pretty_midi.PrettyMIDI(io.BytesIO(midi_data))
    notes = []

    for instrument in midi.instruments:
        notes.extend(instrument.notes)

    notes.sort(key=lambda note: note.start)

    intervals = np.array(
        [[note.start, note.end] for note in notes],
        dtype=float,
    )

    pitches = np.array(
        [note.pitch for note in notes],
        dtype=float,
    )

    return intervals, pitches

def midi_match_notes(baseline_midi: bytes, user_midi: bytes):
    # use mir_eval to compare the baseline to the basic_pitch recognized midi notes
    baseline_notes, baseline_intervals, baseline_pitches = midi_to_arrays(baseline_midi)
    recognized_notes, recognized_intervals, recognized_pitches = midi_to_arrays(user_midi)

    matching = mir_eval.transcription.match_notes(
        baseline_intervals,
        baseline_pitches,
        recognized_intervals,
        recognized_pitches,
    )

    results = np.zeros(len(expected_pitches), dtype=int)

    f1, precision, recall, overlap = mir_eval.transcription.precision_recall_f1_overlap(
            baseline_intervals,
            baseline_pitches,
            recognized_intervals,
            recognized_pitches,
        )

    matched_baseline_indexes = {
        baseline_index
        for baseline_index, recognized_index in matching
    }

    return {
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "overlap": overlap,
        "matching": matching,
        "correct": i in matched_baseline_indexes,
        "incorrect": i not in matched_baseline_indexes,
    }


def midi_to_arrays(midi_data: bytes):
    midi = pretty_midi.PrettyMIDI(io.BytesIO(midi_data))

    notes = []

    for instrument in midi.instruments:
        notes.extend(instrument.notes)

    notes.sort(key=lambda note: note.start)

    intervals = np.array(
        [[note.start, note.end] for note in notes]
    )

    pitches = np.array(
        [note.pitch for note in notes]
    )

    return notes, intervals, pitches

def crepe_to_midi(pitch_data):
    times = np.array([
        frame["time"]
        for frame in pitch_data
    ])

    frequencies = np.array([
        frame["frequency"]
        for frame in pitch_data
    ])

    midi_pitches = librosa.hz_to_midi(frequencies)

    return times, midi_pitches

def evaluate_crepe(expected_intervals, expected_pitches, pitch_data):
    # CREPE timestamps and frequencies
    estimated_time = np.array(
        [frame["time"] for frame in pitch_data],
        dtype=float,
    )

    estimated_frequency = np.array(
        [frame["frequency"] for frame in pitch_data],
        dtype=float,
    )

    # Build the expected F0 curve using CREPE's timebase
    reference_frequency = np.zeros_like(estimated_time)

    for (start, end), pitch in zip(
        expected_intervals,
        expected_pitches,
    ):
        mask = (
            (estimated_time >= start)
            & (estimated_time < end)
        )

        reference_frequency[mask] = librosa.midi_to_hz(pitch)

    return mir_eval.melody.evaluate(
        estimated_time,
        reference_frequency,
        estimated_time,
        estimated_frequency,
    )