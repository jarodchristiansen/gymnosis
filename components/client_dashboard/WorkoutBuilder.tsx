import { useState } from "react";
import styled from "styled-components";
import RoutineBuilder from "./RoutineBuilder";
import WorkoutGoalForm from "./WorkoutGoalForm";

const WorkoutBuilder = () => {
  const [formIsOpen, setFormIsOpen] = useState(true);
  const [aiWorkoutData, setAiWorkoutData] = useState(null);

  return (
    <WorkoutBuilderContainer>
      <h2>Client Goal</h2>

      {formIsOpen && !aiWorkoutData && (
        <WorkoutGoalForm
          setFormIsOpen={setFormIsOpen}
          setAiWorkoutData={setAiWorkoutData}
        />
      )}

      {!formIsOpen && <RoutineBuilder aiWorkoutData={aiWorkoutData} />}
    </WorkoutBuilderContainer>
  );
};

const WorkoutBuilderContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 2px solid black;
`;

export default WorkoutBuilder;
