import { gql } from "@apollo/client";

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

const CLIENT_FIELDS = `
  id
  email
  name
  username
  image
  createAt
  role
  trainer {
    id
    name
  }
`;

export const ADD_CLIENT = gql`
  mutation addClient($input: AddClientInput!) {
    addClient(input: $input) {
      ${CLIENT_FIELDS}
    }
  }
`;

export const ASSIGN_TRAINER = gql`
  mutation assignTrainer($clientId: ID!, $trainerId: ID!) {
    assignTrainer(clientId: $clientId, trainerId: $trainerId) {
      ${CLIENT_FIELDS}
    }
  }
`;
