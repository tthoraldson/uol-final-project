import { useEffect, useRef, useState } from "react";
import { Button, Card, Form, Col, Row } from "react-bootstrap";

interface AudioRecorderProps {
  onRecordingComplete?: (audio: Blob) => void;
}

function Recorder({ onRecordingComplete }: AudioRecorderProps) {
  // state
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasRecording, setHasRecording] = useState(false);

  // media and audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    async function getDevices() {
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((device) => device.kind === "audioinput");

      setDevices(inputs);

      if (inputs.length > 0) {
        setSelectedDevice(inputs[0].deviceId);
      }
    }

    getDevices().catch(console.error);

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startRecording() {
    if (!selectedDevice) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: {
          exact: selectedDevice,
        },
      },
    });

    streamRef.current = stream;
    chunksRef.current = [];

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: "audio/webm",
      });

      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      onRecordingComplete?.(blob);

      stream.getTracks().forEach((track) => track.stop());
    };

    recorder.start();
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    setHasRecording(true);
  }

  function clearRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setHasRecording(false);
    chunksRef.current = [];
  }

  function analyzeRecording() {
    console.warn("implement meeeeee");
  }

  return (
    <Card className="m-2">
      <Card.Body>
        <Row class="mb-2">
          <Col xs={9}>
            <Card.Title>Recorder</Card.Title>

            <Form.Group>
              <Form.Label>Audio Input</Form.Label>

              <Form.Select
                value={selectedDevice}
                onChange={(event) => setSelectedDevice(event.target.value)}
                disabled={recording}
                className="mb-2"
              >
                {devices.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={3} className="d-flex flex-column justify-content-end">
            {recording ? (
              <Button
                variant="danger"
                className="w-100 mb-2"
                onClick={stopRecording}
              >
                Stop Recording
              </Button>
            ) : hasRecording ? (
              <>
                <Button
                  variant="danger"
                  className="w-100 mb-2"
                  onClick={clearRecording}
                >
                  Clear Recording
                </Button>

                <Button
                  variant="primary"
                  className="w-100 mb-2"
                  onClick={analyzeRecording}
                >
                  Analyze
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                className="w-100 mb-2"
                onClick={startRecording}
                disabled={!selectedDevice}
              >
                Start Recording
              </Button>
            )}
          </Col>
          {recording && <div className="text-danger">● Recording...</div>}
          {audioUrl && <audio controls src={audioUrl} className="w-100 m-2" />}
        </Row>
      </Card.Body>
    </Card>
  );
}

export default Recorder;
