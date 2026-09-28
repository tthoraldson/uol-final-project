import { useEffect, useRef, useState } from "react";
import { Button, Card, Form, Col, Row, Spinner } from "react-bootstrap";
import analyze from "../api/core.api";
import ABCJS from "abcjs";
import { Recorder as VmsgRecorder } from "vmsg";
import { useMusic } from "./musicContext";

interface AudioRecorderProps {
  onRecordingComplete?: (audio: Blob) => void;
}

function Recorder({ onRecordingComplete }: AudioRecorderProps) {
  // state
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasRecording, setHasRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // media and audio refs
  const recorderRef = useRef<VmsgRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // abc refs
  const { abc, setFeedback } = useMusic();

  useEffect(() => {
    async function getDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter((device) => device.kind === "audioinput");
        setDevices(inputs);
        if (inputs.length > 0) {
          setSelectedDevice(inputs[0].deviceId);
        }
      } catch (error) {
        console.error("Microphone device permissions missing:", error);
      }
    }
    getDevices();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startRecording() {
    if (!selectedDevice) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: selectedDevice } },
    });

    streamRef.current = stream;

    const recorder = new VmsgRecorder({
      wasmURL: "/vsg/vmsg.wasm",
    });

    recorderRef.current = recorder;

    await recorder.init();
    recorder.startRecording();
    setRecording(true);
  }

  async function stopRecording() {
    const recorder = recorderRef.current;
    if (!recorder) return;

    const audioBlob = await recorder.stopRecording();

    console.log("Recorded blob:", {
      size: audioBlob.size,
      type: audioBlob.type,
    });

    const url = URL.createObjectURL(audioBlob);

    setRecordingBlob(audioBlob);
    setAudioUrl(url);
    setHasRecording(true);
    setRecording(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    recorderRef.current = null;
  }

  function clearRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setRecordingBlob(null);
    setAudioUrl(null);
    setHasRecording(false);
    setRecording(false);
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setRecordingBlob(file);

    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    setHasRecording(true);

    onRecordingComplete?.(file);
  }

  async function analyzeRecording() {
    if (!recordingBlob) {
      console.warn("we here, blob bugs once more");
      return;
    }

    setIsLoading(true);
    try {
      // Analyze the recording
      const response = await analyze(abc, recordingBlob);

      console.warn("Analysis response:", response);
      setFeedback(response["results"]);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="m-2">
      <Card.Body>
        <Row className="mb-2">
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
                  disabled={isLoading}
                >
                  Clear Recording
                </Button>

                <Button onClick={analyzeRecording} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  className="w-100 mb-2"
                  onClick={startRecording}
                >
                  Start Recording
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />

                <Button
                  variant="secondary"
                  className="w-100 mb-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Recording
                </Button>
              </>
            )}
          </Col>
          {recording && <div className="text-danger">● Recording...</div>}
          {audioUrl && recordingBlob && (
            <>
              <Row>
                <Col>
                  <audio controls src={audioUrl} className="w-100 m-2" />
                </Col>
                {/* Debug, add download option */}
                {/* <Col>
                  <a
                    href={audioUrl}
                    download="recording.mp3"
                    className="btn btn-primary m-2"
                  >
                    Download WAV
                  </a>
                </Col> */}
              </Row>
            </>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
}

export default Recorder;
