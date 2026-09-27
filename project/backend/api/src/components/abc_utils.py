from pathlib import Path
from tempfile import NamedTemporaryFile
import subprocess


def format_abc(abc_string: str) -> str:
    """
    Standardizes and formats an ABC string using the container's native abc2abc tool.
    Operates entirely in-memory using stdin/stdout to bypass temporary file locks.
    """
    # Passing "-" tells abc2abc to read the string directly from the input stream
    command = ["abc2abc", "-"]
    
    try:
        process = subprocess.run(
            command,
            input=abc_string,
            text=True,
            capture_output=True,
            check=True
        )
        return process.stdout
    except subprocess.CalledProcessError as e:
        print(f"ABC formatting Error: {e.stderr}")
        # Fall back to returning the original string if the CLI tool fails
        return abc_string 

def change_clef_via_cli(abc_string: str, clef_name: str = "bass") -> str:
    if clef_name not in ["treble", "bass", "alto", "tenor"]:
        raise ValueError(f"Unsupported clef: {clef_name}")


    # Need to add -t 0 even though we won't transpose to access the useclef featurehttps://www.mankier.com/1/abc2abc
    command = [
        "abc2abc", 
        "-",                        
        "-nokeys",                  
        "-usekey", "0",             
        "-useclef", clef_name,      
        "-t", "0"                   
    ]

    try:
        process = subprocess.run(
            command,
            input=abc_string,
            text=True,
            capture_output=True,
            check=True
        )
        return process.stdout
        
    except subprocess.CalledProcessError as e:
        print(f"CLI Error Output: {e.stderr}")
        raise RuntimeError(f"abc2abc failed to process string: {e.stderr}")

def abc_to_midi(abc_string: str) -> bytes:
    with NamedTemporaryFile(
        mode="w",
        suffix=".abc",
        encoding="utf-8",
    ) as temp:
        temp.write(abc_string)
        temp.flush()

        score = converter.parse(temp.name, format="abc")

    with NamedTemporaryFile(
        suffix=".mid",
        delete=False,
    ) as output:
        midi_path = Path(output.name)

    try:
        score.write("midi", fp=str(midi_path))
        return midi_path.read_bytes()
    finally:
        midi_path.unlink(missing_ok=True)


def _ensure_default_note_length(abc_string: str) -> str:
    # This fixes errors when using music21, as music-to-text doesn't always add the right headers
    lines = abc_string.splitlines()

    if any(line.startswith("L:") for line in lines):
        return abc_string

    # add default note length before K:
    for i, line in enumerate(lines):
        if line.startswith("K:"):
            lines.insert(i, "L:1/8")
            break
    else:
        lines.append("L:1/8")

    return "\n".join(lines)