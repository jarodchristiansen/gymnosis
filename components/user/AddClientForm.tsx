import { Button, Sheet } from "@/components/ui";
import { ADD_CLIENT } from "@/helpers/mutations/user";
import { GET_TRAINERS } from "@/helpers/queries/user";
import { Colors, FontFamily } from "@/styles/variables";
import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import styled from "styled-components";

export interface AddedClient {
  id: string;
  name?: string | null;
}

interface Props {
  /** Owners and admins pick the trainer; a trainer adds clients to themselves. */
  chooseTrainer: boolean;
  /** Demo gyms make up an address, so there's nothing to ask. */
  askEmail: boolean;
  onAdded: (client: AddedClient) => void;
  onCancel: () => void;
}

const AddClientForm = ({
  chooseTrainer,
  askEmail,
  onAdded,
  onCancel,
}: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [error, setError] = useState("");

  const trainers = useQuery(GET_TRAINERS, { skip: !chooseTrainer });
  const [addClient, { loading }] = useMutation(ADD_CLIENT);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Enter the client's name.");
    if (askEmail && !email.trim()) {
      return setError("Enter the email address the client will sign in with.");
    }
    if (chooseTrainer && !trainerId) {
      return setError("Choose a trainer for this client.");
    }
    setError("");

    try {
      const { data } = await addClient({
        variables: {
          input: {
            name: name.trim(),
            ...(askEmail && { email: email.trim() }),
            ...(chooseTrainer && { trainerId }),
          },
        },
      });
      onAdded(data.addClient);
    } catch (err) {
      setError(err?.message || "Couldn't add the client. Try again.");
    }
  };

  return (
    <Form as="form" onSubmit={submit} noValidate aria-labelledby="add-heading">
      <h2 id="add-heading">Add a client</h2>

      <label htmlFor="client-name">Name</label>
      <input
        id="client-name"
        autoComplete="off"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {askEmail ? (
        <>
          <label htmlFor="client-email">Email</label>
          <input
            id="client-email"
            type="email"
            autoComplete="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby="client-email-hint"
          />
          <p id="client-email-hint" className="hint">
            The address they&apos;ll sign in with. If they&apos;ve already
            signed up, they join your gym.
          </p>
        </>
      ) : (
        <p className="hint">
          Demo clients get a made-up email address and are deleted with the demo
          gym.
        </p>
      )}

      {chooseTrainer && (
        <>
          <label htmlFor="client-trainer">Trainer</label>
          <select
            id="client-trainer"
            value={trainerId}
            onChange={(e) => setTrainerId(e.target.value)}
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
        </>
      )}

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      <div className="actions">
        <Button type="submit" disabled={loading}>
          {loading ? "Adding…" : "Add client"}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </Form>
  );
};

const Form = styled(Sheet)`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 0 24px;
  padding: 20px 16px;

  h2 {
    margin: 0 0 6px;
    font-family: ${FontFamily.display};
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  label {
    margin-top: 8px;
    font-size: 13px;
    font-weight: 650;
    color: ${Colors.midGray};
  }

  input,
  select {
    min-height: 44px;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid rgba(242, 238, 232, 0.28);
    background: ${Colors.richBlack};
    color: ${Colors.lightGray};
    font: inherit;
  }

  input:focus-visible,
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
    margin: 4px 0 0;
    font-size: 14px;
    color: ${Colors.flag.block};
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  @media (min-width: 640px) {
    padding: 24px;
    max-width: 520px;
  }
`;

export default AddClientForm;
