import logging
import os
import httpx
import json
from fastapi import APIRouter, UploadFile, File, Response


logger = logging.getLogger(__name__)

BASIC_PITCH_API = os.getenv("BASIC_PITCH_API") or "http://basic-pitch:8090"

router = APIRouter(
    prefix="/basic-pitch",
    tags=["basic-pitch"])

@router.get("/")
def root():
    logger.info("music-to-text root")
    return "Hello from the music-to-text router"


@router.post("/midi")
async def getMidi(audio: UploadFile = File(...)):
    midi_data = await generate_midi(audio)

    return Response(
        content=midi_data,
        media_type="audio/midi",
    )


async def generate_midi(audio: UploadFile) -> bytes:
    await audio.seek(0)

    audio_data = await audio.read()

    logger.warning("generate_midi bytes: %d", len(audio_data))
    logger.warning("generate_midi header: %r", audio_data[:16])

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            BASIC_PITCH_API + "/midi",
            files={
                "audio": (
                    audio.filename,
                    audio_data,
                    audio.content_type,
                )
            },
        )

    response.raise_for_status()

    return response.content