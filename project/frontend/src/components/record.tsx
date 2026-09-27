import { useEffect, useRef, useState } from "react";
import { Button, Card, Form, Col, Row, Spinner } from "react-bootstrap";
import analyze from "../api/core.api";
import ABCJS from "abcjs";
import { WavRecorder } from "webm-to-wav-converter";
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
  const recorderRef = useRef<InstanceType<typeof WavRecorder> | null>(null); // typescript chill!!
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
      recorderRef.current?.stop();
    };
  }, []);

  async function startRecording() {
    if (!selectedDevice) {
      return;
    }

    const recorder = new WavRecorder();
    recorderRef.current = recorder;

    await recorder.start();
    setRecording(true);
  }

  async function stopRecording() {
    const recorder = recorderRef.current;

    if (!recorder) {
      console.error("No recorder");
      return;
    }

    recorder.stop();

    let blob: Blob | undefined;

    // WavRecorder 1.1.0 has a race condition:
    // stop() triggers MediaRecorder.ondataavailable asynchronously.
    for (let i = 0; i < 20; i++) {
      const result = await (recorder.getBlob() as unknown as Promise<
        Blob | undefined
      >);

      if (result instanceof Blob) {
        blob = result;
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    if (!blob) {
      console.error("WAV blob was never produced");
      return;
    }

    // Create a URL for the audio player
    const url = URL.createObjectURL(blob);

    setRecordingBlob(blob);
    setAudioUrl(url);
    setHasRecording(true);
    setRecording(false);
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

    console.log("Uploaded file:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    setRecordingBlob(file);

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
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
        new File([recordingBlob], "recording.wav", {
          type: "audio/wav",
        }),
      );

      console.warn("Analysis response:", response);
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
                {/* This forces only .wav files for now. */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".wav,audio/wav"
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
