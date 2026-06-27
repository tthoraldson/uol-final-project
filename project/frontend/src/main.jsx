import { createRoot } from "react-dom/client";
import { VexFlow} from "vexflow";

function App() {
  return <h1>Hello from Vite</h1>;
}

const { Factory } = VexFlow;
const vf = new Factory({
  renderer: { elementId: 'vexflow', width: 500, height: 200 },
});

const score = vf.EasyScore();
const system = vf.System();

system
  .addStave({
    voices: [
      score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
      score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
    ],
  })
  .addClef('treble')
  .addTimeSignature('4/4');

vf.draw();

createRoot(document.getElementById("root")).render(<App />); 