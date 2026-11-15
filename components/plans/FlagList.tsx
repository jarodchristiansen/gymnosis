import { Colors } from "@/styles/variables";
import { useState } from "react";
import styled from "styled-components";
import { PrimaryButton } from "./PlanEditor";
import { formatDate, type PlanFlag } from "./types";

interface FlagListProps {
  flags: PlanFlag[];
  // False once the plan has left draft; acknowledged flags stay visible as a record.
  canAcknowledge: boolean;
  onAcknowledge: (flagId: string, note: string) => Promise<void>;
}

const AcknowledgeForm = ({
  flag,
  onAcknowledge,
}: {
  flag: PlanFlag;
  onAcknowledge: FlagListProps["onAcknowledge"];
}) => {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <LinkButton type="button" onClick={() => setOpen(true)}>
        Keep it, with a note
      </LinkButton>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await onAcknowledge(flag.id, note);
        } finally {
          setBusy(false);
        }
      }}
    >
      <NoteLabel htmlFor={`note-${flag.id}`}>
        Why is this safe for this client?
      </NoteLabel>
      <NoteRow>
        <input
          id={`note-${flag.id}`}
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
        />
        <PrimaryButton type="submit" disabled={busy || !note.trim()}>
          Acknowledge
        </PrimaryButton>
      </NoteRow>
    </form>
  );
};

/**
 * Safety-rule findings on a plan. Blocking flags stop approval until the trainer edits the plan
 * so the finding goes away, or acknowledges it with a reason.
 */
const FlagList = ({ flags, canAcknowledge, onAcknowledge }: FlagListProps) => {
  if (flags.length === 0) {
    return <Clear>No safety flags. The rules found nothing to check.</Clear>;
  }

  const order = (f: PlanFlag) =>
    f.severity === "block" && !f.acknowledged ? 0 : f.acknowledged ? 2 : 1;

  return (
    <List>
      {[...flags]
        .sort((a, b) => order(a) - order(b))
        .map((flag) => (
          <Item key={flag.id} tone={flag.acknowledged ? "done" : flag.severity}>
            <Kind>
              {flag.acknowledged
                ? "Acknowledged"
                : flag.severity === "block"
                ? "Blocks approval"
                : "Worth a look"}
            </Kind>
            <p>{flag.message}</p>
            {flag.acknowledged && (
              <Meta>
                {flag.acknowledgedBy?.name ?? "A trainer"} on{" "}
                {formatDate(flag.acknowledgedAt)}: &ldquo;{flag.note}&rdquo;
              </Meta>
            )}
            {canAcknowledge &&
              flag.severity === "block" &&
              !flag.acknowledged && (
                <AcknowledgeForm flag={flag} onAcknowledge={onAcknowledge} />
              )}
          </Item>
        ))}
    </List>
  );
};

const TONES = {
  block: "#FF8A80",
  warn: "#FFD08A",
  done: Colors.midGray,
};

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Item = styled.li<{ tone: keyof typeof TONES }>`
  padding: 12px 14px;
  border-radius: 8px;
  background: ${Colors.surface};
  border-left: 3px solid ${({ tone }) => TONES[tone]};

  p {
    margin: 4px 0 0;
    font-size: 14px;
    color: ${Colors.lightGray};
  }
`;

const Kind = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${Colors.midGray};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Meta = styled.p`
  && {
    color: ${Colors.midGray};
    font-size: 13px;
  }
`;

const LinkButton = styled.button`
  margin-top: 8px;
  background: none;
  border: none;
  padding: 4px 0;
  color: ${Colors.brand.accentLight};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const NoteLabel = styled.label`
  display: block;
  margin: 10px 0 4px;
  font-size: 13px;
  color: ${Colors.midGray};
`;

const NoteRow = styled.div`
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
    color: ${Colors.brand.white};
    font-size: 14px;
  }
`;

const Clear = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${Colors.midGray};
`;

export default FlagList;
