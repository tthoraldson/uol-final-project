import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import music_to_text

logger = logging.getLogger(__name__)

app = FastAPI()

app.include_router(music_to_text.router)

# oooooo scary! Remove if someday this gets deployed out there in the real world
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def home():
    logger.info("hello, world")
    return "Hello, World!"