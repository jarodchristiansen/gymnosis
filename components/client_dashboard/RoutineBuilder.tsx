import { ADD_WORKOUT_ROUTINE } from "@/helpers/mutations/user";
import { Colors, MediaQueries } from "@/styles/variables";
import { useMutation } from "@apollo/client";
import { useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

interface Exercise {
  exercise: string;
  sets: number | string;
  reps: number | string;
}

interface DayRoutine {
  day: number;
  bodyPart: string;
  exercises: Exercise[];
}

interface RoutineBuilderProps {
  aiWorkoutData: DayRoutine[] | null;
  clientId: string;
}

const RoutineBuilder = ({ aiWorkoutData, clientId }: RoutineBuilderProps) => {
  const [routineData, setRoutineData] = useState<DayRoutine[]>(
    aiWorkoutData ?? []
  );
  const [isFormValid, setIsFormValid] = useState(true);
  const [firstInvalidExercise, setFirstInvalidExercise] = useState<{
    day: number;
    exerciseIndex: number;
  } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [addRoutine, { loading: isSaving }] = useMutation(ADD_WORKOUT_ROUTINE);

  if (!aiWorkoutData || aiWorkoutData.length === 0) {
    return (
      <ErrorState>
        <ErrorIcon>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </ErrorIcon>
        <h3>No workout data available</h3>
        <p>Go back and generate a plan using the Client Goal form.</p>
      </ErrorState>
    );
  }

  const handleExerciseChange = (
    day: number,
    exerciseIndex: number,
    property: keyof Exercise,
    value: string
  ) => {
    const updated = [...routineData];
    updated[day - 1] = {
      ...updated[day - 1],
      exercises: updated[day - 1].exercises.map((ex, i) =>
        i === exerciseIndex ? { ...ex, [property]: value } : ex
      ),
    };
    setRoutineData(updated);
  };

  const handleAddExercise = (day: number) => {
    const updated = [...routineData];
    updated[day - 1] = {
      ...updated[day - 1],
      exercises: [
        ...updated[day - 1].exercises,
        { exercise: "", sets: 0, reps: 0 },
      ],
    };
    setRoutineData(updated);
  };

  const handleRemoveExercise = (day: number, exerciseIndex: number) => {
    const updated = [...routineData];
    updated[day - 1] = {
      ...updated[day - 1],
      exercises: updated[day - 1].exercises.filter(
        (_, i) => i !== exerciseIndex
      ),
    };
    setRoutineData(updated);
  };

  const handleSaveRoutine = async () => {
    const firstInvalid = routineData
      .flatMap((day) =>
        day.exercises.map((exercise, exerciseIndex) => ({
          day: day.day,
          exerciseIndex,
          isValid:
            exercise.exercise.toString().trim() !== "" &&
            Number(exercise.sets) > 0 &&
            exercise.reps.toString().trim() !== "",
        }))
      )
      .find((entry) => !entry.isValid);

    setIsFormValid(!firstInvalid);

    if (firstInvalid) {
      setFirstInvalidExercise(firstInvalid);
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    const cleanRoutine = routineData.map((day) => ({
      day: day.day,
      bodyPart: day.bodyPart,
      exercises: day.exercises.map((ex) => ({
        exercise: ex.exercise,
        sets: Number(ex.sets),
        reps: ex.reps,
      })),
    }));

    try {
      await addRoutine({
        variables: {
          input: {
            id: clientId,
            routine: cleanRoutine,
          },
        },
      });
      setSaveSuccess(true);
    } catch {
      // error surfaced via mutation error state below
    }
  };

  if (saveSuccess) {
    return (
      <SuccessState>
        <SuccessIcon>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </SuccessIcon>
        <h3>Workout plan saved</h3>
        <p>The plan has been added to this client&apos;s profile.</p>
      </SuccessState>
    );
  }

  return (
    <BuilderWrap>
      <PlanSummary>
        <span>{routineData.length} days</span>
        <Dot />
        <span>
          {routineData.reduce((acc, d) => acc + d.exercises.length, 0)} total
          exercises
        </span>
      </PlanSummary>

      {routineData.map((dayData) => {
        const isRest =
          dayData.bodyPart?.toLowerCase() === "rest" ||
          dayData.exercises.length === 0;
        return (
          <DayCard key={dayData.day}>
            <DayHeader>
              <DayLabel>Day {dayData.day}</DayLabel>
              <BodyPartBadge isRest={isRest}>{dayData.bodyPart}</BodyPartBadge>
            </DayHeader>

            {isRest ? (
              <RestNote>Rest &amp; Recovery</RestNote>
            ) : (
              <>
                {dayData.exercises.map((exercise, exerciseIndex) => {
                  const isInvalid =
                    firstInvalidExercise &&
                    firstInvalidExercise.day === dayData.day &&
                    firstInvalidExercise.exerciseIndex === exerciseIndex;
                  return (
                    <ExerciseRow
                      key={`day-${dayData.day}-ex-${exerciseIndex}-${exercise.exercise}`}
                      ref={isInvalid ? scrollRef : null}
                      invalid={!!isInvalid}
                    >
                      <ExerciseFieldGroup wide>
                        <ExerciseLabel
                          htmlFor={`exercise-name-${dayData.day}-${exerciseIndex}`}
                        >
                          Exercise
                        </ExerciseLabel>
                        <ExerciseInput
                          id={`exercise-name-${dayData.day}-${exerciseIndex}`}
                          type="text"
                          placeholder="e.g. Bench Press"
                          value={exercise.exercise}
                          onChange={(e) =>
                            handleExerciseChange(
                              dayData.day,
                              exerciseIndex,
                              "exercise",
                              e.target.value
                            )
                          }
                        />
                      </ExerciseFieldGroup>

                      <ExerciseFieldGroup>
                        <ExerciseLabel
                          htmlFor={`exercise-sets-${dayData.day}-${exerciseIndex}`}
                        >
                          Sets
                        </ExerciseLabel>
                        <ExerciseInput
                          id={`exercise-sets-${dayData.day}-${exerciseIndex}`}
                          type="number"
                          placeholder="3"
                          value={exercise.sets}
                          min={1}
                          onChange={(e) =>
                            handleExerciseChange(
                              dayData.day,
                              exerciseIndex,
                              "sets",
                              e.target.value
                            )
                          }
                        />
                      </ExerciseFieldGroup>

                      <ExerciseFieldGroup>
                        <ExerciseLabel
                          htmlFor={`exercise-reps-${dayData.day}-${exerciseIndex}`}
                        >
                          Reps
                        </ExerciseLabel>
                        <ExerciseInput
                          id={`exercise-reps-${dayData.day}-${exerciseIndex}`}
                          type="text"
                          placeholder="10"
                          value={exercise.reps}
                          min={1}
                          onChange={(e) =>
                            handleExerciseChange(
                              dayData.day,
                              exerciseIndex,
                              "reps",
                              e.target.value
                            )
                          }
                        />
                      </ExerciseFieldGroup>

                      <RemoveButton
                        type="button"
                        aria-label="Remove exercise"
                        onClick={() =>
                          handleRemoveExercise(dayData.day, exerciseIndex)
                        }
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </RemoveButton>
                    </ExerciseRow>
                  );
                })}

                <AddExerciseButton
                  type="button"
                  onClick={() => handleAddExercise(dayData.day)}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Exercise
                </AddExerciseButton>
              </>
            )}
          </DayCard>
        );
      })}

      <SaveArea>
        {!isFormValid && (
          <ValidationMessage>
            Please fill in a name, sets, and reps for every exercise before
            saving.
          </ValidationMessage>
        )}
        <SaveButton
          type="button"
          onClick={handleSaveRoutine}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <SpinnerIcon />
              Saving&hellip;
            </>
          ) : (
            <>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Workout Plan
            </>
          )}
        </SaveButton>
      </SaveArea>
    </BuilderWrap>
  );
};

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const BuilderWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PlanSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: ${Colors.midGray};
  margin-bottom: 4px;
`;

const Dot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: ${Colors.midGray};
`;

const DayCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DayHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DayLabel = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${Colors.brand.white};
  letter-spacing: 0.3px;
`;

const BodyPartBadge = styled.span<{ isRest: boolean }>`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 4px;
  color: ${({ isRest }) => (isRest ? Colors.midGray : Colors.brand.accent)};
  background: ${({ isRest }) =>
    isRest ? "rgba(255,255,255,0.05)" : "rgba(255, 107, 43, 0.1)"};
  border: 1px solid
    ${({ isRest }) =>
      isRest ? "rgba(255,255,255,0.08)" : "rgba(255, 107, 43, 0.2)"};
`;

const RestNote = styled.p`
  font-size: 13px;
  color: ${Colors.midGray};
  font-style: italic;
  margin: 0;
`;

const ExerciseRow = styled.div<{ invalid: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 7px;
  border: 1px solid
    ${({ invalid }) =>
      invalid ? "rgba(255, 80, 80, 0.5)" : "rgba(255, 255, 255, 0.06)"};
  background: ${({ invalid }) =>
    invalid ? "rgba(255, 80, 80, 0.05)" : "transparent"};
  transition: border-color 0.15s ease;

  @media ${MediaQueries.MD} {
    gap: 14px;
  }
`;

const ExerciseFieldGroup = styled.div<{ wide?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: ${({ wide }) => (wide ? 2 : 1)};
  min-width: 0;
`;

const ExerciseLabel = styled.label`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: ${Colors.midGray};
`;

const ExerciseInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  color: white;
  font-family: inherit;
  width: 100%;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: rgba(138, 159, 176, 0.4);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 107, 43, 0.4);
  }
`;

const RemoveButton = styled.button`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 80, 80, 0.08);
  border: 1px solid rgba(255, 80, 80, 0.15);
  border-radius: 6px;
  color: rgba(255, 100, 100, 0.8);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  margin-bottom: 1px;

  &:hover {
    background: rgba(255, 80, 80, 0.18);
    color: rgb(255, 100, 100);
  }
`;

const AddExerciseButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  color: ${Colors.midGray};
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
  align-self: flex-start;

  &:hover {
    color: ${Colors.brand.white};
    border-color: rgba(255, 255, 255, 0.25);
  }
`;

const SaveArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  margin-top: 4px;
`;

const SaveButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  color: white;
  background: ${Colors.brand.accent};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease, opacity 0.15s ease;
  align-self: flex-start;

  &:hover:not(:disabled) {
    background: ${Colors.brand.accentHover};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SpinnerIcon = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

const ValidationMessage = styled.p`
  font-size: 13px;
  color: rgb(255, 100, 100);
  margin: 0;
  padding: 10px 14px;
  background: rgba(255, 80, 80, 0.07);
  border: 1px solid rgba(255, 80, 80, 0.2);
  border-radius: 7px;
`;

const SuccessState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 24px;
  text-align: center;

  h3 {
    font-size: 17px;
    font-weight: 600;
    color: ${Colors.brand.white};
    margin: 16px 0 8px;
  }

  p {
    font-size: 14px;
    color: ${Colors.midGray};
    margin: 0;
  }
`;

const SuccessIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(74, 222, 128);
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
  color: ${Colors.midGray};

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: ${Colors.brand.white};
    margin: 14px 0 8px;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
`;

const ErrorIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 80, 80, 0.07);
  border: 1px solid rgba(255, 80, 80, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(255, 100, 100);
`;

export default RoutineBuilder;
