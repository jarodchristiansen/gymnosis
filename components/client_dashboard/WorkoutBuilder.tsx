import { Colors } from "@/styles/variables";
import { useState } from "react";
import styled from "styled-components";
import RoutineBuilder from "./RoutineBuilder";
import WorkoutGoalForm from "./WorkoutGoalForm";

interface WorkoutBuilderProps {
  clientId: string;
}

const WorkoutBuilder = ({ clientId }: WorkoutBuilderProps) => {
  const [formIsOpen, setFormIsOpen] = useState(true);
  const [aiWorkoutData, setAiWorkoutData] = useState(null);

  return (
    <WorkoutBuilderContainer>
      <BuilderHeader>
        <BuilderTitle>Build a Workout Plan</BuilderTitle>
        {formIsOpen && (
          <StepIndicator>Step 1 of 2 &mdash; Client details</StepIndicator>
        )}
        {!formIsOpen && (
          <StepIndicator>Step 2 of 2 &mdash; Review &amp; save</StepIndicator>
        )}
      </BuilderHeader>

      {formIsOpen && !aiWorkoutData && (
        <WorkoutGoalForm
          setFormIsOpen={setFormIsOpen}
          setAiWorkoutData={setAiWorkoutData}
        />
      )}

      {!formIsOpen && (
        <RoutineBuilder aiWorkoutData={aiWorkoutData} clientId={clientId} />
      )}
    </WorkoutBuilderContainer>
  );
};

const WorkoutBuilderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const BuilderHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
`;

const BuilderTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${Colors.brand.white};
  margin: 0;
`;

const StepIndicator = styled.span`
  font-size: 12px;
  color: ${Colors.midGray};
`;

export default WorkoutBuilder;
