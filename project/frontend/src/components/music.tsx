import { useEffect } from "react";
import Container from 'react-bootstrap/Container';
import VexFlow from 'vexflow';
import { TextToMusic } from '../functions/text-to-music';

function Music() {
    useEffect(() => {
    initializeSomething();
  }, []);

  function initializeSomething() {
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
    .addTimeSignature('2/4');

    vf.draw();

console.warn('hello');
  }
    return (
        <Container>
            <div id="vexflow"></div>
            <button onClick={testTextToMusic}>
                Test Text to Music
            </button>
        </Container>
    )
}

async function testTextToMusic() {
    try {
        console.log("Starting text-to-music test...");

        const textToMusic = TextToMusic.instance;

        const tune = await textToMusic.generateMusic(
            "This is a traditional Irish dance music."
        );

        console.log("Generated tune:");
        console.log(tune);
    } catch (error) {
        console.error("Text-to-music test failed:", error);
    }
}

export default Music;