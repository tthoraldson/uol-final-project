import logging
import os
import httpx
import json
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from components.abc_utils import change_clef_via_cli, format_abc

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
    async with httpx.AsyncClient(timeout=500.0) as client:
        response = await client.get(
            TEXT_TO_MUSIC_API + "/generate",
            params={
                "prompt": prompt
            }
        )

    response.raise_for_status()
    
    data = response.json()

    valid_abc = format_abc(data["tune"])
    valid_abc = change_clef_via_cli(valid_abc, 'bass')
    
    data["tune"] = valid_abc

    return JSONResponse(
        content=response.json(),
        status_code=response.status_code,
    )