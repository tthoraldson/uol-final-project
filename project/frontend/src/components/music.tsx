import { useEffect, useRef, useState } from "react";
import ABCJS from "abcjs";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import generateMusic from "../api/text-to-music.api";
import { useMusic } from "./musicContext";
import Recorder from "./record";
import GenerateMusicModal from "./generateMusicModal";

// @ts-expect-error - hates importing CSS this way
import "./music.css";
import React from "react";
import AddManualMusicModal from "./addManualMusicModal";

// starter code was from this abcjs example: https://examples.abcjs.net/full-synth.html
function Music() {
  const [modalShow, setModalShow] = React.useState(false);
  const [manualModalShow, setManualModalShow] = React.useState(false);

  const paperRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLDivElement>(null);

  const { abc, setAbc, feedback, setFeedback } = useMusic();

  useEffect(() => {
    if (!paperRef.current || !audioRef.current || !abc) {
      return;
    }

    // Render the sheet music
    const visualObj = ABCJS.renderAbc(paperRef.current, abc, {
      scale: 1.5,
      add_classes: true,
    });

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

    // Display feedback, if any
    if (feedback && feedback.length > 0) {
      feedback.forEach((result, index) => {
        if (result === 1) {
          makeNoteGreen(index);
        } else if (result === 0) {
          makeNoteRed(index);
        }
      });
    }
  }, [abc, feedback]);

  function makeNoteGreen(index: number) {
    if (!paperRef.current) return;

    const notes = paperRef.current.querySelectorAll(".abcjs-note");

    const note = notes[index];

    if (note) {
      note.classList.add("correct-note");
    }
  }

  function makeNoteRed(index: number) {
    if (!paperRef.current) return;

    const notes = paperRef.current.querySelectorAll(".abcjs-note");

    const note = notes[index];

    if (note) {
      note.classList.add("incorrect-note");
    }
  }

  return (
    <>
      <Card className="m-2" style={{ minWidth: "300px", minHeight: "200px" }}>
        <Card.Body>
          <Row className="mb-2">
            <Card.Title>Sight Reading Exercise</Card.Title>
            <div ref={paperRef} />
          </Row>
          <Row>
            <div id="audio" ref={audioRef} />
          </Row>
          <div
            className="m-1"
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <div className="m-1">
              <Button
                variant="primary"
                className="w-auto"
                onClick={() => setModalShow(true)}
              >
                Generate Music
              </Button>
            </div>

            <div className="m-1">
              <Button
                variant="secondary"
                className="w-auto"
                onClick={() => setManualModalShow(true)}
              >
                Add Manual ABC
              </Button>
            </div>
            {feedback && feedback.length > 0 && (
              <div className="m-1">
                <Button
                  variant="danger"
                  className="w-auto"
                  onClick={() => setFeedback([])}
                >
                  Remove Feedback
                </Button>
              </div>
            )}
            {/* Debug, adjusting note color */}
            {/* <div className="m-1">
              <Button
                variant="danger"
                className="w-auto"
                onClick={() => makeNoteGreen(2)}
              >
                Make Note green
              </Button>
            </div> */}
          </div>
        </Card.Body>
      </Card>
      <Recorder />

      <GenerateMusicModal show={modalShow} onHide={() => setModalShow(false)} />
      <AddManualMusicModal
        show={manualModalShow}
        onHide={() => setManualModalShow(false)}
      />
    </>
  );
}

export default Music;
