import { gql } from "apollo-server-micro";

const typeDefs = gql`
  scalar Date

  type User {
    id: ID
    email: String
    name: String
    username: String
    image: String
    createAt: Date
    role: String
    workoutHistory: [WorkoutHistoryEntry]
  }

  type WorkoutHistoryEntry {
    date: Date
    routine: [WorkoutRoutine]
  }

  input UsernameInput {
    username: String!
    email: String
  }

  type Post {
    section: String
    category: String
    publish_date: Date
    slug: String
    header_image: String
    post_title: String
    post_content: String
    description: String
  }

  input PostInput {
    section: String
    category: String
    publish_date: Date
    slug: String
    header_image: String
    post_title: String
    post_content: String
    description: String
  }

  type WorkoutRoutine {
    day: Int
    bodyPart: String
    exercises: [exercise]
  }

  input WorkoutRoutineInput {
    day: Int
    bodyPart: String
    exercises: [ExerciseInput]
  }

  input ExerciseInput {
    exercise: String
    sets: Int
    reps: Int
  }

  type exercise {
    exercise: String
    sets: Int
    reps: Int
  }

  input WorkoutInput {
    routine: [WorkoutRoutineInput]
    id: String
  }

  type Query {
    createWorkout(prompt: String): [WorkoutRoutine]
    getUsers(filter: String, value: String): [User]
    getUser(email: String, id: String): User
    getPost(slug: String): Post
    getPosts(filter: String): [Post]
  }

  type Mutation {
    addWorkoutRoutine(input: WorkoutInput): User
    updateUsername(input: UsernameInput): User
  }
`;

module.exports = typeDefs;
