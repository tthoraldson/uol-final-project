import { createRoot } from "react-dom/client";
import { VexFlow} from "vexflow";

function App() {
    return (
        <></>
    );
}

const { Factory } = VexFlow;
const vf = new Factory({
  renderer: { elementId: 'vexflow', width: 800, height: 200 },
});

const score = vf.EasyScore();
const system = vf.System();

system
  .addStave({
    voices: [
      score.voice(score.notes('C#5/q, B4, A4, G#4')),
    ],
  })
  .addClef('bass')
  .addTimeSignature('4/4');

vf.draw();

createRoot(document.getElementById("root")).render(<App />); 

import { pipeline, TextStreamer } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/Qwen3-0.6B-ONNX",
  { device: "webgpu", dtype: "q4f16" },
);

// Define the list of messages
const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Write me a poem about Machine Learning." },
];

// Generate a response
const output = await generator(messages, {
  max_new_tokens: 512,
  do_sample: false,
  streamer: new TextStreamer(generator.tokenizer, { skip_prompt: true, skip_special_tokens: true }),
});
console.log(output[0].generated_text.at(-1).content);
