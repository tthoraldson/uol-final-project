from pathlib import Path
from tempfile import NamedTemporaryFile
import subprocess


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