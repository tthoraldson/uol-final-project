from pathlib import Path
from tempfile import NamedTemporaryFile
from io import BytesIO
from music21 import converter


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