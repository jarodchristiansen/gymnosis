import { Button } from "@/components/ui";
import { type TrainerRef } from "@/components/plans/TrainerFilter";
import { ASSIGN_TRAINER } from "@/helpers/mutations/user";
import { GET_TRAINERS } from "@/helpers/queries/user";
import { Colors } from "@/styles/variables";
import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import styled from "styled-components";

interface Props {
  clientId: string;
  current?: TrainerRef | null;
}

/** An owner's control for who trains a client. Plans already written keep their trainer. */
const AssignTrainer = ({ clientId, current }: Props) => {
  const [editing, setEditing] = useState(false);
  const [trainerId, setTrainerId] = useState(current?.id ?? "");
  const [error, setError] = useState("");

  const trainers = useQuery(GET_TRAINERS, { skip: !editing });
  const [assign, { loading }] = useMutation(ASSIGN_TRAINER);

  if (!editing) {
    return (
      <Row>
        <span>
          Trainer: <strong>{current?.name ?? "none yet"}</strong>
        </span>
        <Button
          variant="ghost"
          onClick={() => {
            setTrainerId(current?.id ?? "");
            setError("");
            setEditing(true);
          }}
        >
          Change
        </Button>
      </Row>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerId) return setError("Choose a trainer.");
    try {
      // The client comes back with its new trainer, which updates this page from the cache.
      await assign({ variables: { clientId, trainerId } });
      setEditing(false);
    } catch (err) {
      setError(err?.message || "Couldn't change the trainer. Try again.");
    }
  };

  return (
    <Form onSubmit={save} noValidate>
      <label htmlFor="assign-trainer">Trainer</label>
      <div className="controls">
        <select
          id="assign-trainer"
          value={trainerId}
          onChange={(e) => setTrainerId(e.target.value)}
          aria-describedby="assign-trainer-hint"
        >
          <option value="">
            {trainers.loading ? "Loading trainers…" : "Choose a trainer"}
          </option>
          {(trainers.data?.trainers ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name ?? "Trainer"}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setEditing(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
      <p id="assign-trainer-hint" className="hint">
        Plans already written stay with the trainer who wrote them.
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </Form>
  );
};

const Row = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  margin: 8px 0 0;
  font-size: 14px;
  color: ${Colors.midGray};

  strong {
    color: ${Colors.lightGray};
    font-weight: 650;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;

  label {
    font-size: 13px;
    font-weight: 650;
    color: ${Colors.midGray};
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  select {
    flex: 1 1 200px;
    min-height: 44px;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid rgba(242, 238, 232, 0.28);
    background: ${Colors.richBlack};
    color: ${Colors.lightGray};
    font: inherit;
  }

  select:focus-visible {
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
`;

export default AssignTrainer;
