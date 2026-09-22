import { AutoTokenizer, AutoModelForSeq2SeqLM } from "@huggingface/transformers";
import { VexFlow} from "vexflow";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

import { env } from "@huggingface/transformers";

env.useBrowserCache = false;


import Navigation from "/components/navigation.jsx"


function App() {
    return (
        <>
        <Navigation />
        <Player />
        </>
    );
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);


// Testing out audio player functionality
const Player = () => (
  <AudioPlayer
    autoPlay
    src="http://example.com/audio.mp3"
    onPlay={e => console.log("onPlay")}
    // other props here
  />
);


// Testing out vexflow functionality
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


const tokenizer = await AutoTokenizer.from_pretrained(
    "tthoraldson/text-to-music-onnxruntime"
);

const model = await AutoModelForSeq2SeqLM.from_pretrained(
    "tthoraldson/text-to-music-onnxruntime",
    {
        dtype: "fp32",
        revision: "main",
    }
);

const inputs = await tokenizer(
    "This is a traditional Irish dance music."
);

console.log(
    Array.from(inputs.input_ids.data)
);

const output = await model.generate({
    ...inputs,
    max_new_tokens: 256,
});

const text = tokenizer.decode(
    output[0],
    { skip_special_tokens: true }
);

console.log("output:", text);
console.log("output IDs:", output[0].tolist());

console.log("input IDs:", Array.from(inputs.input_ids.data));
console.log("decoded:", tokenizer.decode(inputs.input_ids));