import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import type { ModalProps } from "react-bootstrap";
import MusicGenerationForm from "./generateMusicForm";
import generateMusic from "../api/text-to-music.api";
import { useMusic } from "./musicContext";
import { useEffect, useRef, useState } from "react";
import ABCJS from "abcjs";

function GenerateMusicModal(props: ModalProps) {
  const { setAbc } = useMusic();
  const [formOrMusic, setFormMusicState] = useState(false); // fakse = form, true = music
  const [currentlyGenerating, setCurrentlyGenerating] = useState(false);
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
              setCurrentlyGenerating(true);
              // TODO: Better prompt handling... this doesn't get great results
              const prompt = `
        This is a ${values.difficulty} ${values.genre} piece
        for ${values.instrument}.
        ${values.prompt}
      `.trim();
              const result = await generateMusic(prompt);
              setResAbc(result);
              setFormMusicState(true);
              setCurrentlyGenerating(false);
            }}
            isLoading={currentlyGenerating}
          />
        ) : (
          <>
            <div ref={paperRef} />
            <div>
              <Button
                onClick={() => {
                  setAbc(resAbc);
                  setResAbc("");
                  setFormMusicState(false);
                }}
                className="me-2"
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setResAbc("");
                  setFormMusicState(false);
                }}
                className="me-2"
              >
                Generate New
              </Button>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

function createprompt() {}

export default GenerateMusicModal;
