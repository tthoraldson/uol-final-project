import logging
import os
import httpx
import json
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import av

logger = logging.getLogger(__name__)

CREPE_API = os.getenv("CREPE_URL") or "http://crepe:8060"

router = APIRouter(
    prefix="/crepe",
    tags=["crepe"])

@router.get("/")
def root():
    return "Hello from thecrepe router"


@router.get("/pitch-tracker")
async def run_crepe_with_image(audio: UploadFile = File(...)):
    # TODO:
    # [ ] Add step size param
    # [ ] Add Viterbi param
    async with httpx.AsyncClient(timeout=500.0) as client:
        response = await client.post(
            CREPE_API + "/pitch-tracker",
            params={
                "prompt": prompt
            }
        )

    response.raise_for_status()

    return JSONResponse(
        content=response.json(),
        status_code=response.status_code,
    )


@router.post("/pitch-tracker")
async def run_crepe(audio: UploadFile = File(...)):
    async with httpx.AsyncClient(timeout=500.0) as client:
        audio_data = await audio.read()

        response = await client.post(
            CREPE_API + "/pitch-tracker",
            files={
                "audio": (
                    audio.filename,
                    audio_data,
                    audio.content_type,
                )
            },
        )

    response.raise_for_status()

    return JSONResponse(
        content=response.json(),
        status_code=response.status_code,
    )


async def generate_pitch(audio: UploadFile):
    await audio.seek(0)
    audio_data = await audio.read()

    async with httpx.AsyncClient(timeout=500.0) as client:
        response = await client.post(
            CREPE_API + "/pitch-tracker",
            files={
                "audio": (
                    audio.filename,
                    audio_data,
                    audio.content_type,
                )
            },
        )

    response.raise_for_status()

    return response.json()