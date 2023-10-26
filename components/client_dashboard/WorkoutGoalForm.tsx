import { MediaQueries } from "@/styles/variables";
import { useState } from "react";
import styled from "styled-components";

const WorkoutGoalForm = ({ setFormIsOpen }) => {
  const [clientGoal, setClientGoal] = useState("");
  const [clientWeight, setClientWeight] = useState("");
  const [clientHeight, setClientHeight] = useState("");
  const [clientAge, setClientAge] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [sports, setSports] = useState([]);
  const [weightTraining, setWeightTraining] = useState(false);
  const [weightTrainingFrequency, setWeightTrainingFrequency] = useState("");

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Formulate a query to send to OpenAI API using form inputs
    // Combine the collected client details into a single string.
    const clientDetails = `Client Weight Goal: ${clientGoal}
Client Weight: ${clientWeight} lbs
Client Height: ${clientHeight} inches
Client Age: ${clientAge}
Activity Level: ${activityLevel}
Sports Participation: ${sports.join(", ")}
Weight Training: ${weightTraining ? "Yes" : "No"}
Weight Training Frequency: ${weightTrainingFrequency}`;

    // Define placeholders for workout plan elements.
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
    }
  }
]
`;

    // Use the combined client details and workout plan placeholders in the prompt.
    const prompt = `Generate a personalized workout plan for the client based on the following details and don't worry about adding text aside from the JavaScript object output:
${clientDetails}

Based on the client's details provided above, create a workout plan. Replace the placeholders in the plan with exercise names, sets, and reps. Ensure that the workout plan is suitable for their ${activityLevel} and ${sports.join(
      ", "
    )} and incorporates ${weightTrainingFrequency} sessions with a minimum of ${
      parseInt(weightTrainingFrequency) > 2 ? 4 : 2
    } lifts per day. Please include rest days for the remaining days that do not have workouts.

${workoutPlanPlaceholders}

Please provide a workout plan in the format of the JavaScript object array above. Complete the entire plan in the object and don't use placeholder data as this will be used in an application. I need all 5 days to have your recommended routine and can't use  things like "continue this pattern for the remaining days". Please only provide the JavaScript Object output as the workout routine and no additional text`;

    // Send this prompt to the OpenAI API and use the response, which should be a JavaScript object array.

    // Send this prompt to the OpenAI API and use the response to generate the workout plan.

    console.log({ prompt });

    setFormIsOpen(false);
  };

  return (
    <div>
      <WorkoutBuilderForm onSubmit={handleFormSubmit}>
        <div className="grid-container">
          <div>
            <label>Client Weight Goal</label>
            <label>
              <input
                type="radio"
                name="clientGoal"
                value="bulking"
                checked={clientGoal === "bulking"}
                onChange={(e) => setClientGoal(e.target.value)}
              />
              Bulking
            </label>
            <label>
              <input
                type="radio"
                name="clientGoal"
                value="getting more lean"
                checked={clientGoal === "getting more lean"}
                onChange={(e) => setClientGoal(e.target.value)}
              />
              Getting More Lean
            </label>
            <label>
              <input
                type="radio"
                name="clientGoal"
                value="sport specific"
                checked={clientGoal === "sport specific"}
                onChange={(e) => setClientGoal(e.target.value)}
              />
              Sport Specific
            </label>
          </div>

          <div>
            <label>Client Weight (lbs)</label>
            <input
              type="number"
              value={clientWeight}
              onChange={(e) => setClientWeight(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Client Height (inches)</label>
            <input
              type="number"
              value={clientHeight}
              onChange={(e) => setClientHeight(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Client Age</label>
            <input
              type="number"
              value={clientAge}
              onChange={(e) => setClientAge(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Client Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              required
            >
              <option value="">Select</option>
              <option value="sedentary">Sedentary</option>
              <option value="lightly active">Lightly Active</option>
              <option value="moderately active">Moderately Active</option>
              <option value="very active">Very Active</option>
            </select>
          </div>

          <div>
            <label>Sports You Participate In (select multiple)</label>
            <select
              multiple
              value={sports}
              onChange={(e) => {
                const options = e.target.options;
                const selectedSports = [];
                for (let i = 0; i < options.length; i++) {
                  if (options[i].selected) {
                    selectedSports.push(options[i].value);
                  }
                }
                setSports(selectedSports);
              }}
            >
              <option value="running">Running</option>
              <option value="swimming">Swimming</option>
              <option value="cycling">Cycling</option>
              <option value="weightlifting">Weightlifting</option>
            </select>
          </div>

          <div>
            <label>Do You Currently Weight Train?</label>
            <label>
              <input
                type="radio"
                name="weightTraining"
                value="yes"
                checked={weightTraining}
                onChange={() => setWeightTraining(true)}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="weightTraining"
                value="no"
                checked={!weightTraining}
                onChange={() => setWeightTraining(false)}
              />
              No
            </label>
          </div>

          <div>
            <label>Weight Training Frequency (times per week)</label>
            <input
              type="number"
              value={weightTrainingFrequency}
              onChange={(e) => setWeightTrainingFrequency(e.target.value)}
            />
          </div>
        </div>

        <button className="submit-button" type="submit">
          Submit
        </button>
      </WorkoutBuilderForm>
    </div>
  );
};

const WorkoutBuilderForm = styled.form`
  .grid-container {
    display: flex;
    flex-direction: column;

    @media ${MediaQueries.LG} {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    div {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
    }

    label {
      font-weight: bold;
      margin-bottom: 5px;
    }
  }
`;

export default WorkoutGoalForm;
