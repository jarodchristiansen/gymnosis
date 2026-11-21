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
    "Whose client this is. Staff only; null for everyone else."
    trainer: Person
  }

  input UsernameInput {
    username: String!
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

  input WorkoutGoalInput {
    goal: String!
    weightLbs: Float!
    heightInches: Float!
    age: Int!
    activityLevel: String!
    sports: [String!]!
    weightTraining: Boolean!
    sessionsPerWeek: Int!
    "beginner, intermediate, or advanced"
    experience: String!
    "full gym, dumbbells only, or bodyweight only"
    equipment: String!
    "Any of: knee, lower back, shoulder, wrist"
    injuries: [String!]!
  }

  enum PlanStatus {
    draft
    approved
    delivered
  }

  type Person {
    id: ID!
    name: String
    image: String
  }

  type PlanSource {
    kind: String!
    model: String
    promptVersion: String
    draftFailed: Boolean!
  }

  type PlanFlag {
    id: ID!
    rule: String!
    severity: String!
    day: Int
    exercise: String
    message: String!
    acknowledged: Boolean!
    acknowledgedBy: Person
    acknowledgedAt: Date
    note: String
  }

  type PlanEvent {
    at: Date!
    actor: Person
    action: String!
    from: String
    to: String
    note: String
    changes: [String!]!
  }

  type Plan {
    id: ID!
    status: PlanStatus!
    version: Int!
    days: [WorkoutRoutine!]!
    client: Person
    trainer: Person
    source: PlanSource!
    flags: [PlanFlag!]!
    events: [PlanEvent!]!
    "Why the plan can't be approved yet; empty when it can."
    approvalProblems: [String!]!
    createdAt: Date
    updatedAt: Date
    approvedAt: Date
    deliveredAt: Date
  }

  type Query {
    plans(status: PlanStatus, clientId: ID): [Plan!]!
    plan(id: ID!): Plan
    getUsers(filter: String, value: String): [User]
    getUser(email: String, id: String, username: String): User
  }

  type Mutation {
    draftPlan(clientId: ID!, input: WorkoutGoalInput!): Plan!
    createManualPlan(clientId: ID!): Plan!
    updatePlanDays(id: ID!, version: Int!, days: [WorkoutRoutineInput!]!): Plan!
    acknowledgeFlag(id: ID!, version: Int!, flagId: ID!, note: String!): Plan!
    approvePlan(id: ID!, version: Int!): Plan!
    reopenPlan(id: ID!, version: Int!, note: String!): Plan!
    deliverPlan(id: ID!, version: Int!): Plan!
    updateUsername(input: UsernameInput): User
  }
`;

module.exports = typeDefs;
