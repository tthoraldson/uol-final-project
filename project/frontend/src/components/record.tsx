import { useEffect, useRef, useState } from "react";
import { Button, Card, Form, Col, Row, Spinner } from "react-bootstrap";
import analyze from "../api/core.api";
import ABCJS from "abcjs";
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // abc refs
  const { abc } = useMusic();

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

      setRecordingBlob(blob);

      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      setHasRecording(true);
      onRecordingComplete?.(blob);

      stream.getTracks().forEach((track) => track.stop());
    };

    recorder.start();
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function clearRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setHasRecording(false);
    setRecordingBlob(null);
    chunksRef.current = [];
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setRecordingBlob(file);
    setAudioUrl(URL.createObjectURL(file));
    setHasRecording(true);

    onRecordingComplete?.(file);
  }

  async function analyzeRecording() {
    if (!recordingBlob) {
      console.warn("we here");
      return;
    }
    setIsLoading(true);

    try {
      // Generate baseline MIDI from the ABC
      const midi = ABCJS.synth.getMidiFile(abc, {
        midiOutputType: "binary",
      });

      // Analyze the recording
      const response = await analyze(
        abc,
        new File([midi], "baseline.mid", {
          type: "audio/midi",
        }),
        new File([recordingBlob], "recording.webm", {
          type: "audio/webm",
        }),
      );

      console.warn("Analysis response:", response);

      // Temporary delay to test loading state
      await new Promise((resolve) => setTimeout(resolve, 5000));
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
                  variant="secondary"
                  className="w-100 mb-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Recording
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  hidden
                  onChange={handleFileUpload}
                />

                <Button
                  variant="primary"
                  className="w-100 mb-2"
                  onClick={startRecording}
                  disabled={!selectedDevice}
                >
                  Start Recording
                </Button>
              </>
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
