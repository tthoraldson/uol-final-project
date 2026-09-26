import logging
import os
import httpx
import json
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

CREPE_API = os.getenv("CREPE_URL") or "http://crepe:8060"

router = APIRouter(
    prefix="/crepe",
    tags=["crepe"])

@router.get("/")
def root():
    return "Hello from thecrepe router"


@router.get("/pitch-tracker")
async def generate(audio: UploadFile = File(...)):
    # TODO:
    # [ ] Add step size param
    # [ ] Add Viterbi param
    async with httpx.AsyncClient(timeout=500.0) as client:
        response = await client.get(
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