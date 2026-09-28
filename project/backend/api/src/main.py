import logging
from fastapi import FastAPI, UploadFile, File, Response, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from routers import music_to_text
from routers import basic_pitch
from routers import utilities
from routers import crepe

from components.analyze import analyze_v1, test_abc_function

logger = logging.getLogger(__name__)

app = FastAPI(title="Backend API")


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

@app.post("/analyze")
async def analyze(original_abc: str = Form(...), audio: UploadFile = File(...)):
    audio_data = await audio.read()

    logger.warning(
        "Basic Pitch received audio: filename=%s content_type=%s bytes=%d",
        audio.filename,
        audio.content_type,
        len(audio_data),
    )
    
    result = await analyze_v1(original_abc, audio)
    return result


@app.post("/test")
async def test(abc: str):
    return test_abc_function(abc)