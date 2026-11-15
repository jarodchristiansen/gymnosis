import { Button } from "@/components/ui";
import { UPDATE_USERNAME } from "@/helpers/mutations/user";
import { Colors } from "@/styles/variables";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import styled from "styled-components";

// Mirrors the server's rule, so most mistakes are caught before a round trip.
const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,30}$/;
const RULE = "3 to 30 letters, numbers, dots, dashes, or underscores.";

interface Props {
  current?: string | null;
  onCancel: () => void;
  onSaved: () => void;
}

const UsernameForm = ({ current, onCancel, onSaved }: Props) => {
  const [value, setValue] = useState(current ?? "");
  const [error, setError] = useState("");
  const [updateUsername, { loading }] = useMutation(UPDATE_USERNAME);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = value.trim();
    if (!USERNAME_PATTERN.test(username)) {
      setError(`Usernames are ${RULE}`);
      return;
    }
    setError("");
    try {
      await updateUsername({ variables: { input: { username } } });
      onSaved();
    } catch (err) {
      setError(err?.message || "Couldn't save the username. Try again.");
    }
  };

  return (
    <Form onSubmit={submit} noValidate>
      <label htmlFor="username">Username</label>
      <input
        id="username"
        name="username"
        autoComplete="username"
        spellCheck={false}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-describedby="username-rule"
        aria-invalid={error ? true : undefined}
      />
      <p id="username-rule" className="hint">
        {RULE}
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="actions">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </Form>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 650;
    color: ${Colors.midGray};
  }

  input {
    min-height: 44px;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid rgba(242, 238, 232, 0.28);
    background: ${Colors.richBlack};
    color: ${Colors.lightGray};
    font: inherit;
  }

  input:focus-visible {
    outline: 2px solid ${Colors.brand.accentLight};
    outline-offset: 1px;
  }

  .hint {
    margin: 0;
    font-size: 13px;
    color: ${Colors.midGray};
  }

  .error {
    margin: 0;
    font-size: 14px;
    color: ${Colors.flag.block};
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 6px;
  }
`;

export default UsernameForm;
