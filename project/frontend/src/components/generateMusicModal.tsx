import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import type { ModalProps } from "react-bootstrap";
import MusicGenerationForm from "./generateMusicForm";

function GenerateMusicModal(props: ModalProps) {
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
        <MusicGenerationForm
          onSubmit={(values) => {
            console.log(values);
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default GenerateMusicModal;
