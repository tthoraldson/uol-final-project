import { createRoot } from "react-dom/client";
import { VexFlow} from "vexflow";
import { Home } from "./pages/home"

function App() {
    return (
        <BrowserRouter>

            <Navigation />

            <div className="container mt-4">
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </div>

        </BrowserRouter>
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
