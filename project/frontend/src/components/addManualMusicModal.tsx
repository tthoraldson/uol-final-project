import { Button, Modal, ModalProps } from "react-bootstrap";
import { useMusic } from "./musicContext";
import { useEffect, useRef, useState } from "react";
import ManualMusicForm from "./addManualMusicForm";
import ABCJS from "abcjs";

function AddManualMusicModal(props: ModalProps) {
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
          Manually Add ABC
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!formOrMusic ? (
          <ManualMusicForm
            onSubmit={async (values) => {
              setCurrentlyGenerating(true);

              console.log("Manual ABC:", values.abc);

              setResAbc(values.abc);
              setFormMusicState(true);

              setCurrentlyGenerating(false);
            }}
            isLoading={currentlyGenerating}
          />
        ) : (
          <>
            <div ref={paperRef} />
            <div className="mt-3">
              <Button
                onClick={() => {
                  setAbc(resAbc);
                  setResAbc("");
                  setFormMusicState(false);
                  props.onHide;
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
              >
                Edit ABC
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

export default AddManualMusicModal;
