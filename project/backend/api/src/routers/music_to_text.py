import logging
import os
import httpx
import json
from fastapi import APIRouter

logger = logging.getLogger(__name__)

TEXT_TO_MUSIC_API = os.getenv("TEXT_TO_MUSIC_URL") or "http://text-to-music:8080"

router = APIRouter(
    prefix="/music-to-text",
    tags=["music-to-text"])

@router.get("/")
def root():
    logger.info("music-to-text root")
    return "Hello from the music-to-text router"


@router.get("/generate")
async def generate(prompt: str = "a simple jazz bass solo"):
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(
            TEXT_TO_MUSIC_API + "/generate",
            params={
                "prompt": prompt
            }
        )

    response.raise_for_status()

    return response.json()