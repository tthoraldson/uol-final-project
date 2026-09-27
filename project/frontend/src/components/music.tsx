import { useEffect, useRef, useState } from "react";
import ABCJS from "abcjs";
import { Button, Card, Container, Row } from "react-bootstrap";
import generateMusic from "../api/text-to-music.api";
import { useMusic } from "./musicContext";
import Recorder from "./record";
import GenerateMusicModal from "./generateMusicModal";

// @ts-expect-error - hates importing CSS this way
import "./music.css";
import React from "react";

// starter code was from this abcjs example: https://examples.abcjs.net/full-synth.html
function Music() {
  const [modalShow, setModalShow] = React.useState(false);

  const paperRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLDivElement>(null);

  const { abc, setAbc } = useMusic();

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
      <Card className="m-2" style={{ minWidth: "300px", minHeight: "200px" }}>
        <Card.Body>
          <Row className="mb-2">
            <Card.Title>Cool Music area (Title in Progress)</Card.Title>
            <div ref={paperRef} />
          </Row>
          <Row>
            <div id="audio" ref={audioRef} />
          </Row>
          <Row>
            {/* <Button
          onClick={async () => {
            const result = await generateMusic(
              "This is a simple song. Like kids music.",
            );

            setAbc(result);
          }}
        >
          Generate Music
        </Button> */}
            <Button variant="primary" onClick={() => setModalShow(true)}>
              Generate Music
            </Button>
          </Row>

          <Row></Row>
        </Card.Body>
      </Card>
      <Recorder />

      <GenerateMusicModal show={modalShow} onHide={() => setModalShow(false)} />
    </>
  );
}

export default Music;
