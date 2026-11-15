import { gql } from "@apollo/client";

export const GET_USER = gql`
  query GET_USER($email: String, $id: String, $username: String) {
    getUser(email: $email, id: $id, username: $username) {
      id
      email
      name
      username
      image
      createAt
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
    }
  }
`;
