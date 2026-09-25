import { useEffect, useRef } from "react";
import ABCJS from "abcjs";
import Recorder from "./record";

// @ts-expect-error - hates importing CSS this way
import "./music.css";
import { Container, Row } from "react-bootstrap";

// starter code was from this abcjs example: https://examples.abcjs.net/full-synth.html
function Music() {
  const paperRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!paperRef.current || !audioRef.current) {
      return;
    }

    const abc = `
X:1
T:C Major Scale
M:4/4
L:1/4
K:C clef=bass
C, D, E, F, | G, A, B, C | C, D, E, F, | G, A, B, C |
C, D, E, F, | G, A, B, C | C, D, E, F, | G, A, B, C |
C, D, E, F, | G, A, B, C | C, D, E, F, | G, A, B, C |
`;

    // Render the sheet music
    const visualObj = ABCJS.renderAbc(paperRef.current, abc, { scale: 1.5 });

    // Create the audio player
    const synthControl = new ABCJS.synth.SynthController();

    synthControl.load("#audio", null, {
      displayRestart: true,
      displayPlay: true,
      displayProgress: true,
    });

    // Create and initialize the sound buffer
    const createSynth = new ABCJS.synth.CreateSynth();

    createSynth
      .init({
        visualObj: visualObj[0],
      })
      .then(() => {
        return synthControl.setTune(visualObj[0], false);
      })
      .then(() => {
        console.log("Audio loaded");
      })
      .catch((error) => {
        console.error("Audio problem:", error);
      });
  }, []);

  return (
    <>
      <Container></Container>
      <Row>
        <div ref={paperRef} />
      </Row>
      <Row>
        <div id="audio" ref={audioRef} />
      </Row>

      <Recorder />
    </>
  );
}

export default Music;
