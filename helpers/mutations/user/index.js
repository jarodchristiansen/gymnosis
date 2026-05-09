import { gql } from "@apollo/client";

export const ADD_WORKOUT_ROUTINE = gql`
  mutation addWorkoutRoutine($input: WorkoutInput) {
    addWorkoutRoutine(input: $input) {
      email
      id
      name
      username
    }
  }
`;

export const UPDATE_USERNAME = gql`
  mutation updateUsername($input: UsernameInput) {
    updateUsername(input: $input) {
      createAt
      email
      id
      image
      name
      username
    }
  }
`;
