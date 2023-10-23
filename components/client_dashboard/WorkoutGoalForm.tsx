import { useState } from "react";
import styled from "styled-components";

const WorkoutGoalForm = () => {
  const [clientGoal, setClientGoal] = useState("");

  // Function to handle form submission and send data to OpenAI API
  const handleFormSubmit = () => {
    // Formulate a query to send to OpenAI API using clientGoal and other inputs
    const query = `Client goal: ${clientGoal}`;
    // Send the query to the OpenAI API (implement this part)
    // You can use a library like Axios to make API requests.
  };

  return (
    <div>
      <WorkoutBuilderForm onSubmit={handleFormSubmit}>
        <div>
          <p>Client Weight Goal: </p>

          <label>
            <input
              type="radio"
              name="clientGoal"
              value="bulking"
              onChange={(e) => setClientGoal(e.target.value)}
            />
            Bulking
          </label>
          <label>
            <input
              type="radio"
              name="clientGoal"
              value="getting more lean"
              onChange={(e) => setClientGoal(e.target.value)}
            />
            Getting More Lean
          </label>
          <label>
            <input
              type="radio"
              name="clientGoal"
              value="sport specific"
              onChange={(e) => setClientGoal(e.target.value)}
            />
            Sport Specific
          </label>
        </div>

        <div>
          <label>
            <input
              type="radio"
              name="clientGoal"
              value="bulking"
              onChange={(e) => setClientGoal(e.target.value)}
            />
            Bulking
          </label>
          <label>
            <input
              type="radio"
              name="clientGoal"
              value="getting more lean"
              onChange={(e) => setClientGoal(e.target.value)}
            />
            Getting More Lean
          </label>
          <label>
            <input
              type="radio"
              name="clientGoal"
              value="sport specific"
              onChange={(e) => setClientGoal(e.target.value)}
            />
            Sport Specific
          </label>
        </div>

        <div>
          <label>
            <input
              type="radio"
              name="clientGoal"
              value="bulking"
              onChange={(e) => setClientGoal(e.target.value)}
            />
            Bulking
          </label>
          <label>
            <input
              type="radio"
              name="clientGoal"
              value="getting more lean"
              onChange={(e) => setClientGoal(e.target.value)}
            />
            Getting More Lean
          </label>
          <label>
            <input
              type="radio"
              name="clientGoal"
              value="sport specific"
              onChange={(e) => setClientGoal(e.target.value)}
            />
            Sport Specific
          </label>
        </div>

        <button type="submit">Submit</button>
      </WorkoutBuilderForm>
    </div>
  );
};

const WorkoutBuilderForm = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;

  div {
    display: flex;
  }
`;

export default WorkoutGoalForm;
