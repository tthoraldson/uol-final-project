import logging
from fastapi import FastAPI, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware

from routers import music_to_text
from routers import basic_pitch
from routers import utilities
from routers import crepe

logger = logging.getLogger(__name__)

app = FastAPI()

app.include_router(music_to_text.router)
app.include_router(basic_pitch.router)
app.include_router(utilities.router)
app.include_router(crepe.router)

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

@app.post("analyze")
async def analyze(original_abc: str, audio: UploadFile = File(...)):
    return "implementing..."
