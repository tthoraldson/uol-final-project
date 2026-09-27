import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import type { ModalProps } from "react-bootstrap";
import MusicGenerationForm from "./generateMusicForm";
import generateMusic from "../api/text-to-music.api";
import { useMusic } from "./musicContext";
import React, { useEffect, useRef, useState } from "react";
import ABCJS from "abcjs";

function GenerateMusicModal(props: ModalProps) {
  const { setAbc } = useMusic();
  const [formOrMusic, setFormMusicState] = React.useState(false); // fakse = form, true = music
  const [currentlyGenerating, setCurrentlyGenerating] = React.useState(false);
  const [resAbc, setResAbc] = useState("");
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!paperRef.current || !resAbc) {
      return;
    }

    ABCJS.renderAbc(paperRef.current, resAbc, { scale: 1.5 });
  }, [formOrMusic]);

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Generate Exercise
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!formOrMusic ? (
          <MusicGenerationForm
            onSubmit={async (values) => {
              console.log(values);
              const result = await generateMusic(
                "This is a simple song. Like kids music.",
              );
              setResAbc(result);
              setFormMusicState(true);
            }}
          />
        ) : (
          <>
            <div ref={paperRef} />
            <Button
              onClick={() => {
                setAbc(resAbc);
                setResAbc("");
                setFormMusicState(false);
              }}
            >
              Save
            </Button>
            <Button
              onClick={() => {
                setResAbc("");
                setFormMusicState(false);
              }}
            >
              Generate New
            </Button>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default GenerateMusicModal;
