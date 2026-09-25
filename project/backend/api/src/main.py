import logging
from fastapi import FastAPI

from routers import music_to_text

logger = logging.getLogger(__name__)

app = FastAPI()

app.include_router(music_to_text.router)

@app.get("/")
async def home():
    logger.info("hello, world")
    return "Hello, World!"