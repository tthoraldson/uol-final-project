import { useEffect, useRef, useState } from "react";
import ABCJS from "abcjs";
import { Button, Container, Row } from "react-bootstrap";
import generateMusic from "../api/text-to-music.api";
import Recorder from "./record";

// @ts-expect-error - hates importing CSS this way
import "./music.css";

// starter code was from this abcjs example: https://examples.abcjs.net/full-synth.html
function Music() {
  const paperRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLDivElement>(null);

  const [abc, setAbc] = useState("");

  useEffect(() => {
    if (!paperRef.current || !audioRef.current || !abc) {
      return;
    }

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
  }, [abc]);

  return (
    <>
      <Container></Container>
      <Row>
        <div ref={paperRef} />
      </Row>
      <Row>
        <div id="audio" ref={audioRef} />
      </Row>
      <Row>
        <Button
          onClick={async () => {
            const result = await generateMusic(
              "This is a short piece of jazz bass. It's in 4/4. It's 4 bars long.",
            );

            setAbc(result);
          }}
        >
          Generate Music
        </Button>
      </Row>

      <Recorder />
    </>
  );
}

export default Music;
