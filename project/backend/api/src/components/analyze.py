from fastapi import UploadFile
import io
import mir_eval
import numpy as np
import pretty_midi
import muspy
import logging
from io import BytesIO

from routers.basic_pitch import generate_midi
from components.abc_utils import ensure_default_note_length, abc_to_midi
from routers.crepe import generate_pitch

logger = logging.getLogger(__name__)

# Data format/contract!
# {
#     "results": [1, 1, 1, 1, 1, 1, 1, 1],

#     "metrics": {
#         "precision": 1.0,
#         "recall": 1.0,
#         "f_measure": 1.0,
#         "onset_accuracy": 1.0,
#         "offset_accuracy": 1.0,
#         "pitch_accuracy": 1.0,
#     },

#     "timing": {
#         "mean_onset_error": 0.0,
#         "mean_offset_error": 0.0,
#     },

#     "summary": {
#         "notes_expected": 8,
#         "notes_played": 8,
#         "notes_correct": 8,
#         "notes_incorrect": 0,
#         "accuracy": 1.0,
#     },
# }
async def analyze_v1(abc_string: str, audio: UploadFile) -> str:
    user_midi = await generate_midi(audio)

    await audio.seek(0)
    audio_bytes = await audio.read()

    pitch_data = await generate_pitch(audio)

    baseline_midi = abc_to_midi(str)



    correct_notes = matched_notes["correct"]
    incorrect_notes = matched_notes["incorrect"]

    return abc_string

def test_abc_function(abc: str):
    abc = abc.replace("\\n", "\n")
    abc = ensure_default_note_length(abc)

    music = muspy.read_abc_string(abc)

    logger.warning(music)
    logger.warning(music.tracks.notes)

    return music


def midi_to_arrays(midi_data: bytes):
    # break a midi file into its notes, intervals, and pitches
    midi = pretty_midi.PrettyMIDI(io.BytesIO(midi_data))
    notes = []

    for instrument in midi.instruments:
        notes.extend(instrument.notes)

    notes.sort(key=lambda note: note.start)

    intervals = np.array([[note.start, note.end] for note in notes])
    pitches = np.array([note.pitch for note in notes])

    return notes, intervals, pitches

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


music = muspy.read_abc(io.StringIO(abc_string))

ref_intervals = []
ref_pitches = []

# MusPy keeps notes inside track objects
for track in music.tracks:
    for note in track.notes:
        # Convert symbolic MusPy tick times to absolute seconds
        onset_seconds = music.get_time_seconds(note.time)
        offset_seconds = music.get_time_seconds(note.time + note.duration)
        
        ref_intervals.append([onset_seconds, offset_seconds])
        ref_pitches.append(note.pitch)

# Convert to NumPy arrays for mir_eval compatibility
ref_intervals = np.array(ref_intervals)
ref_pitches = np.array(ref_pitches)