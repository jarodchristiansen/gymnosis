import { useRef, useState } from "react";
import styled from "styled-components";
import { dummyRoutine } from "../../helpers/dummyData/dummyRoutine";

const RoutineBuilder = () => {
  const [routineData, setRoutineData] = useState(dummyRoutine);
  const [isFormValid, setIsFormValid] = useState(true);
  const [firstInvalidExercise, setFirstInvalidExercise] = useState(null); // State to store the first invalid exercise
  const scrollRef = useRef(null); // Reference for scrolling

  const handleExerciseChange = (day, exerciseIndex, property, value) => {
    const updatedRoutine = [...routineData];
    updatedRoutine[day - 1].exercises[exerciseIndex][property] = value;
    setRoutineData(updatedRoutine);
  };

  const handleAddExercise = (day) => {
    const updatedRoutine = [...routineData];
    updatedRoutine[day - 1].exercises.push({ exercise: "", sets: 0, reps: 0 });
    setRoutineData(updatedRoutine);
  };

  const handleRemoveExercise = (day, exerciseIndex) => {
    const updatedRoutine = [...routineData];
    updatedRoutine[day - 1].exercises.splice(exerciseIndex, 1);
    setRoutineData(updatedRoutine);
  };

  const handleSaveRoutine = () => {
    const firstInvalid = routineData
      .map((day) =>
        day.exercises.map((exercise, exerciseIndex) => ({
          day: day.day,
          exerciseIndex,
          isValid:
            exercise.exercise.trim() !== "" &&
            exercise.sets > 0 &&
            exercise.reps.toString().trim() !== "",
        }))
      )
      .flat()
      .find((entry) => !entry.isValid);

    // Set the form validity state.
    setIsFormValid(!firstInvalid);

    if (firstInvalid) {
      // Set the first invalid exercise to scroll to it.
      setFirstInvalidExercise(firstInvalid);

      // Scroll to the first invalid exercise.
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({
          behavior: "smooth",
        });
      }
    } else {
      // Here, you can implement the logic to save the routine to your database.
      // Use the 'routineData' state to access the data.
      // You may send this data via GraphQL or use any other method based on your backend setup.
      console.log("Routine is valid. Save to the database:", routineData);
    }
  };

  return (
    <div>
      {routineData.map((dayData, dayIndex) => (
        <DayRow key={dayData.day}>
          <h2>Day {dayData.day}</h2>
          <p>Body Part: {dayData.bodyPart}</p>
          <div>
            {dayData.exercises.map((exercise, exerciseIndex) => (
              <FormRow
                key={exerciseIndex}
                ref={
                  firstInvalidExercise &&
                  firstInvalidExercise.day === dayData.day &&
                  firstInvalidExercise.exerciseIndex === exerciseIndex
                    ? scrollRef
                    : null
                }
                style={
                  firstInvalidExercise &&
                  firstInvalidExercise.day === dayData.day &&
                  firstInvalidExercise.exerciseIndex === exerciseIndex
                    ? { border: "2px solid red" }
                    : null
                }
              >
                <div>
                  <label>Exercise</label>
                  <input
                    type="text"
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
                </div>
                <div>
                  <label>Sets</label>
                  <input
                    type="number"
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
                </div>
                <div>
                  <label>Reps</label>
                  <input
                    type="text"
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
                </div>
                <div>
                  <button
                    onClick={() =>
                      handleRemoveExercise(dayData.day, exerciseIndex)
                    }
                  >
                    Remove
                  </button>
                </div>
              </FormRow>
            ))}
            <div>
              <button onClick={() => handleAddExercise(dayData.day)}>
                Add Exercise
              </button>
            </div>
          </div>
        </DayRow>
      ))}
      <div>
        <button onClick={handleSaveRoutine}>Save Routine</button>
        {!isFormValid && (
          <ValidationMessage>
            Please ensure all exercises have a name, sets, and reps.
          </ValidationMessage>
        )}
      </div>
    </div>
  );
};

const DayRow = styled.div`
  padding: 24px;

  &:nth-of-type(odd) {
    background-color: lightgray;
  }
`;

const FormRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;

  div {
    display: flex;
    gap: 8px;
  }
`;

const ValidationMessage = styled.p`
  color: red;
`;

export default RoutineBuilder;
