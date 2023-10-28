import { gql } from "@apollo/client";

export const GET_USER = gql`
  query GET_USER($email: String, $id: String) {
    getUser(email: $email, id: $id) {
      id
      email
      name
      username
      image
      createAt
      favorites {
        title
        symbol
        image
      }
    }
  }
`;

export const GET_USERS = gql`
  query GET_USERS($filter: String, $value: String) {
    getUsers(filter: $filter, value: $value) {
      id
      email
      name
      username
      image
      createAt
      role
      favorites {
        title
        symbol
        image
      }
    }
  }
`;

export const GET_USER_HOLDINGS = gql`
  query getUserExchangeData($input: UserExchangeInput) {
    getUserExchangeData(input: $input) {
      balances {
        symbol
        balance
        ticker
        usd
      }
    }
  }
`;

export const CREATE_WORKOUT = gql`
  query createWorkout($prompt: String) {
    createWorkout(prompt: $prompt) {
      day
      bodyPart
      exercises {
        exercise
        sets
        reps
      }
    }
  }
`;
