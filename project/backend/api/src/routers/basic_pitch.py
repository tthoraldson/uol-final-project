import logging
import os
import httpx
import json
from fastapi import APIRouter


logger = logging.getLogger(__name__)

BASIC_PITCH_API = os.getenv("BASIC_PITCH_API") or "http://basic-pitch:8080"

router = APIRouter(
    prefix="/music-to-text",
    tags=["music-to-text"])

@router.get("/")
def root():
    logger.info("music-to-text root")
    return "Hello from the music-to-text router"


@router.get("/generate")
async def generate(prompt: str = "a simple jazz bass solo"):
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.get(
            TEXT_TO_MUSIC_API + "/generate",
            params={
                "prompt": prompt
            }
        )

    response.raise_for_status()
    logger.warn('response', response)

    return response.json()