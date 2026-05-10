import { CREATE_WORKOUT } from "@/helpers/queries/user";
import { Colors, MediaQueries } from "@/styles/variables";
import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

const SPORTS_OPTIONS = [
  { value: "running", label: "Running" },
  { value: "swimming", label: "Swimming" },
  { value: "cycling", label: "Cycling" },
  { value: "weightlifting", label: "Weightlifting" },
];

const GOAL_OPTIONS = [
  {
    value: "bulking",
    label: "Build Muscle",
    description: "Gain size and strength",
  },
  {
    value: "getting more lean",
    label: "Get Lean",
    description: "Reduce body fat",
  },
  {
    value: "sport specific",
    label: "Sport Performance",
    description: "Train for athletic goals",
  },
];

interface WorkoutGoalFormProps {
  setFormIsOpen: (open: boolean) => void;
  setAiWorkoutData: (data: unknown) => void;
}

const WorkoutGoalForm = ({
  setFormIsOpen,
  setAiWorkoutData,
}: WorkoutGoalFormProps) => {
  const [clientGoal, setClientGoal] = useState("");
  const [clientWeight, setClientWeight] = useState("");
  const [clientHeight, setClientHeight] = useState("");
  const [clientAge, setClientAge] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [sports, setSports] = useState<string[]>([]);
  const [weightTraining, setWeightTraining] = useState(false);
  const [weightTrainingFrequency, setWeightTrainingFrequency] = useState("");

  const [createWorkout, { data, loading: isGenerating }] =
    useLazyQuery(CREATE_WORKOUT);

  const handleSportToggle = (sport: string) => {
    setSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const clientDetails = `Client Weight Goal: ${clientGoal}
Client Weight: ${clientWeight} lbs
Client Height: ${clientHeight} inches
Client Age: ${clientAge}
Activity Level: ${activityLevel}
Sports Participation: ${sports.join(", ")}
Weight Training: ${weightTraining ? "Yes" : "No"}
Weight Training Frequency: ${weightTrainingFrequency}`;

    const workoutPlanPlaceholders = `
[
  {
    "day": 1,
    "bodyPart": "Chest",
    "exercises": [
      {
        "exercise": "[Exercise1Name]",
        "sets": [Exercise1Sets],
        "reps": [Exercise1Reps]
      },
      {
        "exercise": "[Exercise2Name]",
        "sets": [Exercise2Sets],
        "reps": [Exercise2Reps]
      }
    ]
  },
  {
    "day": 2,
    "bodyPart": "Back",
    "exercises": [
      {
        "exercise": "[Exercise3Name]",
        "sets": [Exercise3Sets],
        "reps": [Exercise3Reps]
      },
      {
        "exercise": "[Exercise4Name]",
        "sets": [Exercise4Sets],
        "reps": [Exercise4Reps]
      }
    ]
  },
 {
    "day": 3,
    "bodyPart": "Rest",
    "exercises": [
    
    ]
  }
]
`;

    const prompt = `Generate a personalized workout plan for the client based on the following details and don't worry about adding text aside from the JavaScript object output:
${clientDetails}

Based on the client's details provided above, create a workout plan. Replace the placeholders in the plan with exercise names, sets, and reps. Ensure that the workout plan is suitable for their ${activityLevel} and ${sports.join(
      ", "
    )} and incorporates ${weightTrainingFrequency} sessions with a minimum of ${
      parseInt(weightTrainingFrequency) > 2 ? 4 : 2
    } lifts per day. Please include rest days for the remaining days that do not have workouts.

${workoutPlanPlaceholders}

Please provide a workout plan in the format of the JavaScript object array above. Complete the entire plan in the object and don't use placeholder data as this will be used in an application. The plan must include ${weightTrainingFrequency} weight training days days to have your recommended routine and can't use things like "continue this pattern for the remaining days". Please also include rest days to fill the remainder of the days that are not used for weight training. Please only provide the JavaScript Object output as the workout routine and no additional text`;

    createWorkout({ variables: { prompt } });
  };

  useEffect(() => {
    if (data?.createWorkout) {
      setAiWorkoutData(data.createWorkout);
      setFormIsOpen(false);
    }
  }, [data, setAiWorkoutData, setFormIsOpen]);

  return (
    <FormWrap>
      <FormIntro>
        <FormTitle>Client Profile</FormTitle>
        <FormSubtitle>
          Provide your client&apos;s details to generate a personalized
          AI-powered workout plan.
        </FormSubtitle>
      </FormIntro>

      <StyledForm onSubmit={handleFormSubmit}>
        <SectionHeading>Physical Profile</SectionHeading>
        <FieldGrid>
          <FieldGroup>
            <FieldLabel htmlFor="client-weight">Weight (lbs)</FieldLabel>
            <FieldInput
              id="client-weight"
              type="number"
              placeholder="e.g. 175"
              value={clientWeight}
              onChange={(e) => setClientWeight(e.target.value)}
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="client-height">Height (inches)</FieldLabel>
            <FieldInput
              id="client-height"
              type="number"
              placeholder="e.g. 70"
              value={clientHeight}
              onChange={(e) => setClientHeight(e.target.value)}
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="client-age">Age</FieldLabel>
            <FieldInput
              id="client-age"
              type="number"
              placeholder="e.g. 28"
              value={clientAge}
              onChange={(e) => setClientAge(e.target.value)}
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="activity-level">Activity Level</FieldLabel>
            <FieldSelect
              id="activity-level"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              required
            >
              <option value="">Select level</option>
              <option value="sedentary">Sedentary</option>
              <option value="lightly active">Lightly Active</option>
              <option value="moderately active">Moderately Active</option>
              <option value="very active">Very Active</option>
            </FieldSelect>
          </FieldGroup>
        </FieldGrid>

        <Divider />

        <SectionHeading>Training Preferences</SectionHeading>

        <FieldGroup>
          <FieldLabel as="span">Primary Goal</FieldLabel>
          <GoalGrid>
            {GOAL_OPTIONS.map(({ value, label, description }) => (
              <GoalCard
                key={value}
                selected={clientGoal === value}
                onClick={() => setClientGoal(value)}
                type="button"
              >
                <input
                  type="radio"
                  name="clientGoal"
                  value={value}
                  checked={clientGoal === value}
                  onChange={() => setClientGoal(value)}
                  style={{ display: "none" }}
                />
                <GoalLabel>{label}</GoalLabel>
                <GoalDesc>{description}</GoalDesc>
              </GoalCard>
            ))}
          </GoalGrid>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel as="span">
            Current Sports &amp; Activities
            <FieldHint>Select all that apply</FieldHint>
          </FieldLabel>
          <SportsGrid>
            {SPORTS_OPTIONS.map(({ value, label }) => (
              <SportChip
                key={value}
                selected={sports.includes(value)}
                type="button"
                onClick={() => handleSportToggle(value)}
              >
                <input
                  type="checkbox"
                  id={`sport-${value}`}
                  value={value}
                  checked={sports.includes(value)}
                  onChange={() => handleSportToggle(value)}
                  style={{ display: "none" }}
                />
                {label}
              </SportChip>
            ))}
          </SportsGrid>
        </FieldGroup>

        <TrainingGrid>
          <FieldGroup>
            <FieldLabel as="span">Currently Weight Training?</FieldLabel>
            <RadioGroup>
              <RadioOption
                selected={weightTraining}
                type="button"
                onClick={() => setWeightTraining(true)}
              >
                <input
                  type="radio"
                  name="weightTraining"
                  value="yes"
                  checked={weightTraining}
                  onChange={() => setWeightTraining(true)}
                  style={{ display: "none" }}
                />
                Yes
              </RadioOption>
              <RadioOption
                selected={!weightTraining}
                type="button"
                onClick={() => setWeightTraining(false)}
              >
                <input
                  type="radio"
                  name="weightTraining"
                  value="no"
                  checked={!weightTraining}
                  onChange={() => setWeightTraining(false)}
                  style={{ display: "none" }}
                />
                No
              </RadioOption>
            </RadioGroup>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="weight-training-frequency">
              Sessions per week
            </FieldLabel>
            <FieldInput
              id="weight-training-frequency"
              type="number"
              placeholder="e.g. 4"
              min={1}
              max={7}
              value={weightTrainingFrequency}
              onChange={(e) => setWeightTrainingFrequency(e.target.value)}
              required
            />
          </FieldGroup>
        </TrainingGrid>

        <SubmitArea>
          <GenerateButton type="submit" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <SpinnerIcon />
                Generating your plan&hellip;
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Generate Workout Plan
              </>
            )}
          </GenerateButton>
          <AiHint>
            {isGenerating
              ? "AI is building a personalized plan — this usually takes 10–20 seconds."
              : "AI will create a fully personalized plan based on these details."}
          </AiHint>
        </SubmitArea>
      </StyledForm>
    </FormWrap>
  );
};

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const FormWrap = styled.div`
  color: ${Colors.brand.white};
`;

const FormIntro = styled.div`
  margin-bottom: 28px;
`;

const FormTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${Colors.brand.white};
  margin: 0 0 6px;
`;

const FormSubtitle = styled.p`
  font-size: 14px;
  color: ${Colors.midGray};
  margin: 0;
  line-height: 1.5;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionHeading = styled.h3`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${Colors.midGray};
  margin: 0 0 2px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  margin: 4px 0;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media ${MediaQueries.MD} {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const TrainingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${Colors.brand.white};
  letter-spacing: 0.2px;
`;

const FieldHint = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: ${Colors.midGray};
`;

const inputBase = `
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 7px;
  padding: 10px 12px;
  font-size: 14px;
  color: white;
  font-family: inherit;
  transition: border-color 0.15s ease, background 0.15s ease;
  width: 100%;

  &::placeholder {
    color: rgba(138, 159, 176, 0.5);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 107, 43, 0.5);
    background: rgba(255, 107, 43, 0.04);
  }
`;

const FieldInput = styled.input`
  ${inputBase}
`;

const FieldSelect = styled.select`
  ${inputBase}
  cursor: pointer;

  option {
    background: #1a1a1c;
    color: white;
  }
`;

const GoalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const GoalCard = styled.button<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 12px 14px;
  background: ${({ selected }) =>
    selected ? "rgba(255, 107, 43, 0.1)" : "rgba(255, 255, 255, 0.04)"};
  border: 1px solid
    ${({ selected }) =>
      selected ? "rgba(255, 107, 43, 0.5)" : "rgba(255, 255, 255, 0.08)"};
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: rgba(255, 107, 43, 0.35);
    background: rgba(255, 107, 43, 0.06);
  }
`;

const GoalLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${Colors.brand.white};
`;

const GoalDesc = styled.span`
  font-size: 11px;
  color: ${Colors.midGray};
`;

const SportsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SportChip = styled.button<{ selected: boolean }>`
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ selected }) => (selected ? Colors.brand.accent : Colors.midGray)};
  background: ${({ selected }) =>
    selected ? "rgba(255, 107, 43, 0.1)" : "rgba(255, 255, 255, 0.04)"};
  border: 1px solid
    ${({ selected }) =>
      selected ? "rgba(255, 107, 43, 0.4)" : "rgba(255, 255, 255, 0.08)"};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: rgba(255, 107, 43, 0.3);
    color: ${Colors.brand.white};
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const RadioOption = styled.button<{ selected: boolean }>`
  flex: 1;
  padding: 9px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ selected }) => (selected ? Colors.brand.accent : Colors.midGray)};
  background: ${({ selected }) =>
    selected ? "rgba(255, 107, 43, 0.1)" : "rgba(255, 255, 255, 0.04)"};
  border: 1px solid
    ${({ selected }) =>
      selected ? "rgba(255, 107, 43, 0.4)" : "rgba(255, 255, 255, 0.08)"};
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: rgba(255, 107, 43, 0.3);
  }
`;

const SubmitArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
`;

const GenerateButton = styled.button`
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

const AiHint = styled.p`
  font-size: 12px;
  color: ${Colors.midGray};
  margin: 0;
  line-height: 1.5;
`;

export default WorkoutGoalForm;
