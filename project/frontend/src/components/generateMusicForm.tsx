import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import generateMusic from "../api/text-to-music.api";
import { useMusic } from "./musicContext";

type MusicGenerationFormProps = {
  onSubmit: (values: {
    difficulty: string;
    instrument: string;
    genre: string;
    prompt: string;
  }) => void;
};

function MusicGenerationForm({ onSubmit }: MusicGenerationFormProps) {
  const [difficulty, setDifficulty] = useState("beginner");
  const [instrument, setInstrument] = useState("bass");
  const [genre, setGenre] = useState("rock");
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      difficulty,
      instrument,
      genre,
      prompt,
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Difficulty</Form.Label>
        <Form.Select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Instrument</Form.Label>
        <Form.Select
          value={instrument}
          onChange={(e) => setInstrument(e.target.value)}
        >
          <option value="bass">Bass</option>
          <option value="piano">Piano</option>
          <option value="guitar">Guitar</option>
          <option value="violin">Violin</option>
          <option value="trumpet">Trumpet</option>
          <option value="flute">Flute</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Genre</Form.Label>
        <Form.Select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="jazz">Jazz</option>
          <option value="classical">Classical</option>
          <option value="blues">Blues</option>
          <option value="rock">Rock</option>
          <option value="folk">Folk</option>
          <option value="funk">Funk</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Additional Instructions</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="What else would you like to see in this exercise?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </Form.Group>

      <Button type="submit">Generate Music</Button>
    </Form>
  );
}

export default MusicGenerationForm;
