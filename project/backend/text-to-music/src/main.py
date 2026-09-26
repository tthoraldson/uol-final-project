import torch
from samplings import top_p_sampling, temperature_sampling
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import fastapi
import logging
import mlflow
import mlflow.transformers
import time
import os
from fastapi import FastAPI
import pandas as pd
from music21 import converter, clef
import tempfile
from pathlib import Path


logger = logging.getLogger(__name__)

# setup MLFlow
#MLFLOW_URI = os.getenv("MLFLOW_TRACKING_URI", "http://host.docker.internal:5050")
MLFLOW_URI = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5050")
mlflow.set_tracking_uri(MLFLOW_URI)
mlflow.enable_system_metrics_logging()

tokenizer = AutoTokenizer.from_pretrained('sander-wood/text-to-music')
model = AutoModelForSeq2SeqLM.from_pretrained('sander-wood/text-to-music')
model = model

app = FastAPI()

@app.get("/")
async def home():
    print("hello, world")

@app.get("/generate")
async def generateSong(prompt: str, max_length: int = 524, top_p: float=0.9, temperature: float=1.0, clef: str = "treble"):
    logger.warning('starting to generate song')
    mlflow.set_experiment("Text-to-Music-Generation")

    with mlflow.start_run():
        # mlflow.transformers.log_model(
        #     transformers_model={
        #         "model": model,
        #         "tokenizer": tokenizer,
        #     },
        #     artifact_path="model",
        # )
        mlflow.log_param("prompt_text", prompt)
        mlflow.log_param("max_length", max_length)
        mlflow.log_param("top_p", top_p)
        mlflow.log_param("temperature", temperature)
        start_time = time.perf_counter()

        input_ids = tokenizer(prompt, 
                            return_tensors='pt', 
                            truncation=True, 
                            max_length=max_length)['input_ids']

        decoder_start_token_id = model.config.decoder_start_token_id
        eos_token_id = model.config.eos_token_id

        decoder_input_ids = torch.tensor([[decoder_start_token_id]])

        tune = ""
        generation_log = []
        with torch.inference_mode():
            for t_idx in range(max_length):
                # Where are we on these long generation loops?
                if t_idx % max(1, max_length // 4) == 0:
                    progress = (t_idx / max_length) * 100
                    logger.warning(
                        f"Generation progress: {progress:.0f}% "
                        f"({t_idx}/{max_length} tokens)"
                    )

                step_start = time.perf_counter()
                outputs = model(input_ids=input_ids, 
                decoder_input_ids=decoder_input_ids)
                probs = outputs.logits[0][-1]
                probs = torch.nn.Softmax(dim=-1)(probs).detach().numpy()
                sampled_id = temperature_sampling(probs=top_p_sampling(probs, 
                                                                    top_p=top_p, 
                                                                    return_probs=True),
                                                temperature=temperature)
                decoder_input_ids = torch.cat((decoder_input_ids, torch.tensor([[sampled_id]])), 1)
                
                is_eos = sampled_id == eos_token_id
                decoded = tokenizer.decode(
                    decoder_input_ids[0],
                    skip_special_tokens=True
                )

                step_time = time.perf_counter() - step_start

                generation_log.append({
                    "step": t_idx,
                    "token_id": sampled_id,
                    "token": tokenizer.decode([sampled_id]),
                    "generated_text": decoded,
                    "is_eos": is_eos,
                    "step_time_seconds": step_time,
                })
                
                if sampled_id!=eos_token_id:
                    continue
                else:
                    break

            end_time = time.perf_counter()
            latency = end_time - start_time
            mlflow.log_metric("latency_seconds", latency)

            tune = "X:1\n"
            tune += tokenizer.decode(decoder_input_ids[0], skip_special_tokens=True)
            print(tune)
        
            mlflow.log_param("output", tune)

            generation_df = pd.DataFrame(generation_log)

            mlflow.log_table(
                generation_df,
                artifact_file="generation_log.json"
            )

            mlflow.end_run()
    return {"tune": tune}


# def first_n_bars_abc(abc_notation: str, n: int = 8):
#     score = converter.parse(abc_notation, format="abc")

#     first_bars = score.measures(1, n)

#     with tempfile.TemporaryDirectory() as temp_dir:
#         output_path = Path(temp_dir) / "output.abc"

#         first_bars.write("abc", fp=str(output_path))

#         return output_path.read_text()