import torch
from samplings import top_p_sampling, temperature_sampling
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import fastapi
import logging
import mlflow
import time
import os


logger = logging.getLogger(__name__)

# setup ML
MLFLOW_URI = os.getenv("MLFLOW_TRACKING_URI", "http://host.docker.internal:5050")
mlflow.set_tracking_uri(MLFLOW_URI)
mlflow.enable_system_metrics_logging()

tokenizer = AutoTokenizer.from_pretrained('sander-wood/text-to-music')
model = AutoModelForSeq2SeqLM.from_pretrained('sander-wood/text-to-music')
model = model

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def home():
    print("hello, world")

@app.get("/song")
async def generateSong(text: str, max_length: int = 1028, top_p: float=0.9, temperature: float=1.0):
    logger.warning('starting to generate song')
    mlflow.set_experiment("Text-to-Music-Generation")

    with mlflow.start_run():
        mlflow.log_param("prompt_text", text)
        mlflow.log_param("max_length", max_length)
        mlflow.log_param("top_p", top_p)
        mlflow.log_param("temperature", temperature)
        start_time = time.perf_counter()

        input_ids = tokenizer(text, 
                            return_tensors='pt', 
                            truncation=True, 
                            max_length=max_length)['input_ids']

        decoder_start_token_id = model.config.decoder_start_token_id
        eos_token_id = model.config.eos_token_id

        decoder_input_ids = torch.tensor([[decoder_start_token_id]])

        tune = ""
        for t_idx in range(max_length):
            outputs = model(input_ids=input_ids, 
            decoder_input_ids=decoder_input_ids)
            probs = outputs.logits[0][-1]
            probs = torch.nn.Softmax(dim=-1)(probs).detach().numpy()
            sampled_id = temperature_sampling(probs=top_p_sampling(probs, 
                                                                top_p=top_p, 
                                                                return_probs=True),
                                            temperature=temperature)
            decoder_input_ids = torch.cat((decoder_input_ids, torch.tensor([[sampled_id]])), 1)
            if sampled_id!=eos_token_id:
                continue
            else:
                tune = "X:1\n"
                tune += tokenizer.decode(decoder_input_ids[0], skip_special_tokens=True)
                print(tune)
            break

        end_time = time.perf_counter()
        latency = end_time - start_time
        mlflow.log_metric("latency_seconds", latency)
    
        mlflow.log_param("output", tune)
        mlflow.end_run()
    return {"tune": tune}