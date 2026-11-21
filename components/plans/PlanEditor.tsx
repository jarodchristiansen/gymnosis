import { Button } from "@/components/ui";
import { Colors, FontFamily, MediaQueries } from "@/styles/variables";
import { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import type { PlanDay, PlanFlag } from "./types";

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
  // Open findings, marked on the exercise they're about.
  flags?: PlanFlag[];
  onSave: (days: PlanDay[]) => Promise<void>;
  saving: boolean;
}

const MAX_DAYS = 7;

const toNumber = (value: string) => (value.trim() === "" ? NaN : Number(value));

/**
 * Edits a draft plan's week as a ruled training sheet. The parent remounts it (by plan version)
 * after each save, so the fields always start from what the server holds.
 */
const PlanEditor = ({ days, flags = [], onSave, saving }: PlanEditorProps) => {
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

  // The worst open finding for an exercise, matched the way the rules key them.
  const flagFor = (day: number, exercise: string) => {
    const open = flags.filter(
      (f) => !f.acknowledged && f.day === day && f.exercise === exercise.trim()
    );
    if (open.some((f) => f.severity === "block")) return "block";
    return open.length ? "warn" : undefined;
  };

  return (
    <Editor aria-label="Edit plan">
      {draft.length === 0 && (
        <Empty>
          No days yet. Add the first day, then add exercises to it. A day with
          no exercises is a rest day.
        </Empty>
      )}

      {draft.map((d) => (
        <Day key={d.key}>
          <DayHead>
            <span className="n" aria-hidden="true">
              D{d.day}
            </span>
            <label className="visually-hidden" htmlFor={`focus-${d.key}`}>
              Focus for day {d.day}
            </label>
            <FocusInput
              id={`focus-${d.key}`}
              type="text"
              placeholder="Focus, e.g. Legs or Rest"
              value={d.bodyPart}
              onChange={(e) =>
                updateDay(d.key, (day) => ({
                  ...day,
                  bodyPart: e.target.value,
                }))
              }
            />
            <Button
              variant="ghost"
              onClick={() =>
                setDraft((state) => state.filter((x) => x.key !== d.key))
              }
            >
              Remove day {d.day}
            </Button>
          </DayHead>

          {d.exercises.length === 0 ? (
            <Hint>Rest day.</Hint>
          ) : (
            <Rows>
              <ColumnLabels aria-hidden="true">
                <span />
                <span>Exercise</span>
                <span className="num">Sets</span>
                <span className="num">Reps</span>
                <span />
              </ColumnLabels>
              {d.exercises.map((e, i) => {
                const flag = flagFor(d.day, e.exercise);
                const name = e.exercise.trim() || `exercise ${i + 1}`;
                return (
                  <Row key={e.key} className={flag}>
                    <span className="mark" aria-hidden="true">
                      {flag ? "!" : ""}
                    </span>
                    <label
                      className="visually-hidden"
                      htmlFor={`name-${e.key}`}
                    >
                      Exercise {i + 1} on day {d.day}
                      {flag === "block" ? ", flagged" : ""}
                    </label>
                    <CellInput
                      id={`name-${e.key}`}
                      type="text"
                      className="name"
                      value={e.exercise}
                      onChange={(ev) =>
                        updateExercise(
                          d.key,
                          e.key,
                          "exercise",
                          ev.target.value
                        )
                      }
                    />
                    <label
                      className="visually-hidden"
                      htmlFor={`sets-${e.key}`}
                    >
                      Sets of exercise {i + 1} on day {d.day}
                    </label>
                    <CellInput
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
                    <label
                      className="visually-hidden"
                      htmlFor={`reps-${e.key}`}
                    >
                      Reps of exercise {i + 1} on day {d.day}
                    </label>
                    <CellInput
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
                    <RemoveButton
                      type="button"
                      aria-label={`Remove ${name} from day ${d.day}`}
                      onClick={() =>
                        updateDay(d.key, (day) => ({
                          ...day,
                          exercises: day.exercises.filter(
                            (x) => x.key !== e.key
                          ),
                        }))
                      }
                    >
                      ×
                    </RemoveButton>
                  </Row>
                );
              })}
            </Rows>
          )}

          <Button
            variant="ghost"
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
            <span aria-hidden="true">+ </span>Add exercise to day {d.day}
          </Button>
        </Day>
      ))}

      {draft.length < MAX_DAYS && (
        <AddDay>
          <Button variant="secondary" onClick={addDay}>
            Add a day
          </Button>
        </AddDay>
      )}

      <SaveBar dirty={dirty}>
        <span>{dirty ? "Unsaved changes" : "All changes saved"}</span>
        <Button onClick={handleSave} disabled={!dirty || saving}>
          {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </Button>
        {problem && <Problem role="alert">{problem}</Problem>}
      </SaveBar>
    </Editor>
  );
};

const Editor = styled.section`
  background: ${Colors.surface};
  border: 1px solid ${Colors.rule};
  border-radius: 8px;
`;

const Day = styled.div`
  padding: 14px 14px 8px;
  border-bottom: 1px solid ${Colors.rule};

  @media ${MediaQueries.MD} {
    padding: 18px 22px 10px;
  }
`;

const DayHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .n {
    min-width: 34px;
    font-family: ${FontFamily.display};
    font-size: 24px;
    font-weight: 700;
    color: ${Colors.brand.accentLight};
  }

  > button {
    margin-left: auto;
    font-size: 13px;
    white-space: nowrap;
  }
`;

// Inputs drawn as lines on a sheet: no boxes until you're in them.
const underline = `
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 6px 4px;
  border: none;
  border-bottom: 1px solid rgba(242, 238, 232, 0.2);
  border-radius: 0;
  background: transparent;
  color: ${Colors.lightGray};
  font: inherit;

  &:hover {
    border-bottom-color: rgba(242, 238, 232, 0.4);
  }

  &:focus-visible {
    outline: none;
    border-bottom: 2px solid ${Colors.brand.accent};
    background: rgba(242, 238, 232, 0.04);
  }

  &::placeholder {
    color: ${Colors.midGray};
  }
`;

const FocusInput = styled.input`
  ${underline}
  flex: 1;
  max-width: 320px;
  font-size: 16px;
  font-weight: 650;
`;

const Rows = styled.div`
  margin-top: 4px;
`;

const grid = `
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) 48px 48px 40px;
  gap: 6px;
  align-items: center;

  @media ${MediaQueries.MD} {
    grid-template-columns: 22px minmax(0, 1fr) 72px 72px 44px;
    gap: 10px;
  }
`;

const ColumnLabels = styled.div`
  ${grid}
  padding: 6px 0 0;
  font-family: ${FontFamily.display};
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${Colors.midGray};

  .num {
    text-align: right;
    padding-right: 4px;
  }
`;

const Row = styled.div`
  ${grid}

  .mark {
    display: inline-grid;
    place-items: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 800;
  }

  &.block .mark,
  &.warn .mark {
    border: 1.5px solid currentColor;
  }

  &.block {
    color: ${Colors.flag.block};
  }

  &.warn {
    color: ${Colors.flag.warn};
  }

  /* Pencil under a flagged exercise, as on the sheet on the home page. */
  &.block .name {
    text-decoration: underline wavy ${Colors.flag.block};
    text-underline-offset: 6px;
  }

  &.warn .name {
    text-decoration: underline wavy ${Colors.flag.warn};
    text-underline-offset: 6px;
  }
`;

const CellInput = styled.input`
  ${underline}
  font-variant-numeric: tabular-nums;

  &[type="number"] {
    text-align: right;
  }
`;

const RemoveButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  background: none;
  color: ${Colors.midGray};
  font-size: 22px;
  line-height: 1;
  cursor: pointer;

  &:hover {
    color: ${Colors.flag.block};
    background: rgba(242, 238, 232, 0.05);
  }

  @media ${MediaQueries.MD} {
    width: 44px;
    height: 44px;
  }
`;

const AddDay = styled.div`
  padding: 16px 14px;

  @media ${MediaQueries.MD} {
    padding: 18px 22px;
  }
`;

// Sticks to the bottom of the screen while there's something to save.
const SaveBar = styled.div<{ dirty: boolean }>`
  position: ${({ dirty }) => (dirty ? "sticky" : "static")};
  bottom: 0;
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  padding: 12px 14px;
  border-top: 1px solid ${Colors.rule};
  border-radius: 0 0 8px 8px;
  background: ${({ dirty }) => (dirty ? "#24221F" : Colors.surface)};
  font-size: 14px;
  color: ${Colors.midGray};

  @media ${MediaQueries.MD} {
    padding: 12px 22px;
  }
`;

const Empty = styled.p`
  margin: 0;
  padding: 18px 22px;
  font-size: 14px;
  color: ${Colors.midGray};
`;

const Hint = styled.p`
  margin: 8px 0 4px;
  font-size: 14px;
  color: ${Colors.midGray};
`;

const Problem = styled.p`
  flex-basis: 100%;
  margin: 0;
  font-size: 14px;
  color: ${Colors.flag.block};
`;

export default PlanEditor;
