import { Colors, MediaQueries } from "@/styles/variables";
import { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import type { PlanDay } from "./types";

// Inputs hold text while editing; the server checks and converts on save.
interface DraftExercise {
  key: number;
  exercise: string;
  sets: string;
  reps: string;
}

interface DraftDay {
  key: number;
  day: number;
  bodyPart: string;
  exercises: DraftExercise[];
}

interface PlanEditorProps {
  days: PlanDay[];
  onSave: (days: PlanDay[]) => Promise<void>;
  saving: boolean;
}

const MAX_DAYS = 7;

const toNumber = (value: string) => (value.trim() === "" ? NaN : Number(value));

/**
 * Edits a draft plan's week. The parent remounts it (by plan version) after each save, so the
 * fields always start from what the server holds.
 */
const PlanEditor = ({ days, onSave, saving }: PlanEditorProps) => {
  const nextKey = useRef(0);
  const key = () => (nextKey.current += 1);

  const initial = useMemo(
    () =>
      days.map((d) => ({
        key: key(),
        day: d.day,
        bodyPart: d.bodyPart,
        exercises: d.exercises.map((e) => ({
          key: key(),
          exercise: e.exercise,
          sets: String(e.sets),
          reps: String(e.reps),
        })),
      })),
    // Only the first render's days; later changes arrive as a remount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [draft, setDraft] = useState<DraftDay[]>(initial);
  const [problem, setProblem] = useState("");

  const toDays = (state: DraftDay[]): PlanDay[] =>
    state.map((d) => ({
      day: d.day,
      bodyPart: d.bodyPart.trim(),
      exercises: d.exercises.map((e) => ({
        exercise: e.exercise.trim(),
        sets: toNumber(e.sets),
        reps: toNumber(e.reps),
      })),
    }));

  const dirty =
    JSON.stringify(toDays(draft)) !== JSON.stringify(toDays(initial));

  const updateDay = (dayKey: number, change: (d: DraftDay) => DraftDay) =>
    setDraft((state) => state.map((d) => (d.key === dayKey ? change(d) : d)));

  const updateExercise = (
    dayKey: number,
    exerciseKey: number,
    field: "exercise" | "sets" | "reps",
    value: string
  ) =>
    updateDay(dayKey, (d) => ({
      ...d,
      exercises: d.exercises.map((e) =>
        e.key === exerciseKey ? { ...e, [field]: value } : e
      ),
    }));

  const addDay = () => {
    const used = new Set(draft.map((d) => d.day));
    const day = [1, 2, 3, 4, 5, 6, 7].find((n) => !used.has(n));
    if (!day) return;
    setDraft((state) =>
      [...state, { key: key(), day, bodyPart: "", exercises: [] }].sort(
        (a, b) => a.day - b.day
      )
    );
  };

  const handleSave = async () => {
    const result = toDays(draft);
    const blank = result.find(
      (d) => !d.bodyPart || d.exercises.some((e) => !e.exercise)
    );
    if (blank) {
      setProblem(
        `Day ${blank.day}: give the day a focus and every exercise a name.`
      );
      return;
    }
    setProblem("");
    await onSave(result);
  };

  return (
    <Editor aria-label="Edit plan">
      {draft.length === 0 && (
        <Hint>
          No days yet. Add the first day, then add exercises to it. A day with
          no exercises is a rest day.
        </Hint>
      )}

      {draft.map((d) => (
        <DayCard key={d.key}>
          <DayHeader>
            <h3>Day {d.day}</h3>
            <FocusField>
              <label htmlFor={`focus-${d.key}`}>Focus</label>
              <input
                id={`focus-${d.key}`}
                type="text"
                placeholder="e.g. Legs, or Rest"
                value={d.bodyPart}
                onChange={(e) =>
                  updateDay(d.key, (day) => ({
                    ...day,
                    bodyPart: e.target.value,
                  }))
                }
              />
            </FocusField>
            <TextButton
              type="button"
              onClick={() =>
                setDraft((state) => state.filter((x) => x.key !== d.key))
              }
            >
              Remove day {d.day}
            </TextButton>
          </DayHeader>

          {d.exercises.length === 0 && <Hint>Rest day.</Hint>}

          {d.exercises.map((e, i) => (
            <ExerciseRow key={e.key}>
              <Field className="name">
                <label htmlFor={`name-${e.key}`}>Exercise {i + 1}</label>
                <input
                  id={`name-${e.key}`}
                  type="text"
                  value={e.exercise}
                  onChange={(ev) =>
                    updateExercise(d.key, e.key, "exercise", ev.target.value)
                  }
                />
              </Field>
              <Field>
                <label htmlFor={`sets-${e.key}`}>Sets</label>
                <input
                  id={`sets-${e.key}`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10}
                  value={e.sets}
                  onChange={(ev) =>
                    updateExercise(d.key, e.key, "sets", ev.target.value)
                  }
                />
              </Field>
              <Field>
                <label htmlFor={`reps-${e.key}`}>Reps</label>
                <input
                  id={`reps-${e.key}`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={50}
                  value={e.reps}
                  onChange={(ev) =>
                    updateExercise(d.key, e.key, "reps", ev.target.value)
                  }
                />
              </Field>
              <TextButton
                type="button"
                aria-label={`Remove ${
                  e.exercise || `exercise ${i + 1}`
                } from day ${d.day}`}
                onClick={() =>
                  updateDay(d.key, (day) => ({
                    ...day,
                    exercises: day.exercises.filter((x) => x.key !== e.key),
                  }))
                }
              >
                Remove
              </TextButton>
            </ExerciseRow>
          ))}

          <TextButton
            type="button"
            onClick={() =>
              updateDay(d.key, (day) => ({
                ...day,
                exercises: [
                  ...day.exercises,
                  { key: key(), exercise: "", sets: "3", reps: "10" },
                ],
              }))
            }
          >
            Add exercise to day {d.day}
          </TextButton>
        </DayCard>
      ))}

      <Footer>
        {draft.length < MAX_DAYS && (
          <SecondaryButton type="button" onClick={addDay}>
            Add a day
          </SecondaryButton>
        )}
        <PrimaryButton
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
        >
          {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </PrimaryButton>
        {problem && <Problem role="alert">{problem}</Problem>}
      </Footer>
    </Editor>
  );
};

const Editor = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DayCard = styled.div`
  background: ${Colors.surface};
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DayHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;

  h3 {
    margin: 0 0 8px;
    font-size: 15px;
    color: ${Colors.brand.white};
    min-width: 52px;
  }
`;

const inputStyles = `
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: ${Colors.brand.white};
  font-size: 14px;

  &:focus-visible {
    outline: 2px solid ${Colors.brand.accent};
    outline-offset: 1px;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 72px;

  &.name {
    flex: 1 1 200px;
    width: auto;
  }

  label {
    font-size: 12px;
    color: ${Colors.midGray};
  }

  input {
    ${inputStyles}
  }
`;

const FocusField = styled(Field)`
  flex: 1 1 180px;
  width: auto;
`;

const ExerciseRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px;

  @media ${MediaQueries.MD} {
    flex-wrap: nowrap;
  }
`;

const TextButton = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  padding: 8px 4px;
  color: ${Colors.brand.accentLight};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${Colors.brand.accent};
    border-radius: 4px;
  }
`;

const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

export const PrimaryButton = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  background: ${Colors.brand.accent};
  color: ${Colors.richBlack};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${Colors.brand.accentHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${Colors.brand.white};
    outline-offset: 2px;
  }
`;

export const SecondaryButton = styled(PrimaryButton)`
  background: transparent;
  color: ${Colors.brand.white};
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const Hint = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${Colors.midGray};
`;

const Problem = styled.p`
  flex-basis: 100%;
  margin: 0;
  font-size: 14px;
  color: #ff8a80;
`;

export default PlanEditor;
