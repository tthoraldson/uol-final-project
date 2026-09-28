from pathlib import Path
from tempfile import NamedTemporaryFile
from io import BytesIO
from music21 import converter
import numpy as np
import logging
import muspy
import io

logger = logging.getLogger(__name__)

def ensure_default_note_length(abc: str) -> str:
    # TODO: Play around with figuring out what the default note length should be
    lines = abc.splitlines()

    if any(line.startswith("L:") for line in lines):
        return abc

    for i, line in enumerate(lines):
        if line.startswith("K:"):
            lines.insert(i, "L:1/8")
            break
    else:
        lines.append("L:1/8")

    return "\n".join(lines)


def abc_to_midi(abc_string: str) -> bytes:
    score = converter.parseData(
        abc_string,
        format="abc",
    )

    midi_file = BytesIO()
    score.write("midi", fp=midi_file)

    return midi_file.getvalue()

def abc_to_np(abc_string: str, tempo: float):
    music = muspy.read_abc_string(abc_string)

    notes = music.tracks[0].notes

    seconds_per_quarter = 60.0 / tempo
    seconds_per_tick = seconds_per_quarter / music.resolution

    intervals = []
    pitches = []

    for note in notes:
        start = note.time * seconds_per_tick
        end = (note.time + note.duration) * seconds_per_tick

        intervals.append([float(start), float(end)])
        pitches.append(float(note.pitch))

    intervals = np.array(intervals, dtype=float)
    pitches = np.array(pitches, dtype=float)

    return (
        music,
        intervals,
        pitches,
    )