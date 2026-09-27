import { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

type ManualMusicFormProps = {
  onSubmit: (values: { abc: string }) => void;
  isLoading: boolean;
};

function ManualMusicForm({ onSubmit, isLoading }: ManualMusicFormProps) {
  const [abc, setAbc] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      abc,
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <fieldset disabled={isLoading}>
        <Form.Group className="mb-3">
          <Form.Label>ABC Notation</Form.Label>
          <Form.Control
            as="textarea"
            rows={12}
            placeholder={`X:1
T:Manual ABC Exercise
M:4/4
L:1/4
K:C
C C G G | A A G2`}
            value={abc}
            onChange={(e) => setAbc(e.target.value)}
            spellCheck={false}
            style={{
              fontFamily: "monospace",
            }}
          />
        </Form.Group>
      </fieldset>

      <Button type="submit" disabled={isLoading || !abc.trim()}>
        {isLoading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Loading...
          </>
        ) : (
          "Use ABC"
        )}
      </Button>
    </Form>
  );
}

export default ManualMusicForm;
