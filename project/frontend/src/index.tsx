import { AutoTokenizer, AutoModelForSeq2SeqLM, Tensor } from "@huggingface/transformers";
import { createRoot } from "react-dom/client";
import AudioPlayer from 'react-h5-audio-player';
import { BasicPitch, noteFramesToTime, addPitchBendsToNoteEvents, outputToNotesPoly, } from "@spotify/basic-pitch";
import { TextToMusic } from "./functions/text-to-music";
// import { BasicPitchModel } from "./functions/basic-pitch";
import Navigation from "./components/navigation";
import Music from "./components/music";


function App() {
    return (
        <>
            <Navigation />
            <Music />
        </>
    );
}

const root = document.getElementById("root");

if (!root) {
    throw new Error("Root element not found");
}

createRoot(root).render(<App />);


// Testing out audio player functionality
const Player = () => (
  <AudioPlayer
    autoPlay
    src="http://example.com/audio.mp3"
    onPlay={e => console.log("onPlay")}
    // other props here
  />
);


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


const output = await model.generate({
    ...inputs,
    max_new_tokens: 256,
});

if (!(output instanceof Tensor)) {
    throw new Error("Expected generate() to return a Tensor");
}

const text = tokenizer.decode(
    (output as Tensor)[0],
    { skip_special_tokens: true }
);

const decoderInputIds = new Tensor(
    "int64",
    new BigInt64Array([2n]),
    [1, 1]
);

const encoderOutputs = await model.forward({
    input_ids: inputs.input_ids,
    attention_mask: inputs.attention_mask,
});

console.log(encoderOutputs);
console.log(model.forward_params);

const outputs = await model.forward({
    input_ids: inputs.input_ids,
    attention_mask: inputs.attention_mask,
    decoder_input_ids: decoderInputIds,
});

const logitsTensor = outputs.logits;

const vocabSize = logitsTensor.dims.at(-1);
const data = Array.from(logitsTensor.data);

const lastLogits = data.slice(data.length - vocabSize);

// const textToMusic = TextToMusic.instance;
// const basicPitch = BasicPitchModel.instance;
// basicPitch.runBasicPitch();
// console.warn(textToMusic.loadingState.isLoading);


let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  audioChunks = [];

  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.start();
}

export async function stopRecording() {
  if (!mediaRecorder) {
    throw new Error("Not recording");
  }

  const recorder = mediaRecorder;

  const recording = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(audioChunks, {
        type: recorder.mimeType,
      }));
    };
  });

  recorder.stop();

  // Stop microphone tracks
  recorder.stream.getTracks().forEach((track) => {
    track.stop();
  });

  return recording;
}

export async function transcribeRecording() {
  const blob = await stopRecording();

  // Convert the recorded Blob into an ArrayBuffer
  const arrayBuffer = await blob.arrayBuffer();

  // Decode it into an AudioBuffer
  const audioContext = new AudioContext();

  const audioBuffer = await audioContext.decodeAudioData(
    arrayBuffer
  );

  // Run Basic Pitch
  const basicPitch = new BasicPitch('./models/basic-pitch.json'); 

  const frames: number[][] = [];
  const onsets: number[][] = [];
  const contours: number[][] = [];

  await basicPitch.evaluateModel(
    audioBuffer,

    (f: number[][], o: number[][], c: number[][]) => {
      frames.push(...f);
      onsets.push(...o);
      contours.push(...c);
    },

    (p: number) => {
      console.log(`Basic Pitch: ${p * 100}%`);
    },
  );

  // Convert model output into notes
  const noteEvents = outputToNotesPoly(
    frames,
    onsets,
    0.25,
    0.25,
    5,
  );

  // Add pitch bends
  const notesWithPitchBends = addPitchBendsToNoteEvents(
    contours,
    noteEvents,
  );

  // Convert frames to seconds
  const notes = noteFramesToTime(
    notesWithPitchBends,
  );

  await audioContext.close();

  return notes;
}