import { Colors } from "@/styles/variables";
import styled from "styled-components";

export interface TrainerRef {
  id: string;
  name?: string | null;
}

/** The distinct trainers behind a list of plans or clients, by name. */
export const trainersIn = (trainers: (TrainerRef | null | undefined)[]) => {
  const byId = new Map<string, TrainerRef>();
  for (const t of trainers) if (t?.id && !byId.has(t.id)) byId.set(t.id, t);
  return Array.from(byId.values()).sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "")
  );
};

interface Props {
  trainers: TrainerRef[];
  /** A trainer's id, or null for everyone. */
  selected: string | null;
  onChange: (trainerId: string | null) => void;
}

/** Narrows an owner's view to one trainer. Hidden when there's only one to choose. */
const TrainerFilter = ({ trainers, selected, onChange }: Props) => {
  if (trainers.length < 2) return null;

  const options = [{ id: null, name: "All trainers" }, ...trainers];
  return (
    <Group role="group" aria-label="Filter by trainer">
      {options.map((t) => (
        <button
          key={t.id ?? "all"}
          type="button"
          aria-pressed={selected === t.id}
          onClick={() => onChange(t.id)}
        >
          {t.name ?? "Trainer"}
        </button>
      ))}
    </Group>
  );
};

const Group = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 24px;

  button {
    min-height: 36px;
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid rgba(242, 238, 232, 0.28);
    background: transparent;
    color: ${Colors.lightGray};
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  button:hover {
    border-color: rgba(242, 238, 232, 0.45);
  }

  button[aria-pressed="true"] {
    background: ${Colors.lightGray};
    border-color: ${Colors.lightGray};
    color: ${Colors.ink};
  }

  button:focus-visible {
    outline: 2px solid ${Colors.brand.accentLight};
    outline-offset: 2px;
  }
`;

export default TrainerFilter;
