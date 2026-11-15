import { gql } from "@apollo/client";

import { PLAN_FIELDS } from "../../queries/plans";

const planMutation = (name, signature, args) => gql`
  mutation ${name}(${signature}) {
    ${name}(${args}) {
      ...PlanFields
    }
  }
  ${PLAN_FIELDS}
`;

export const DRAFT_PLAN = planMutation(
  "draftPlan",
  "$clientId: ID!, $input: WorkoutGoalInput!",
  "clientId: $clientId, input: $input"
);

export const CREATE_MANUAL_PLAN = planMutation(
  "createManualPlan",
  "$clientId: ID!",
  "clientId: $clientId"
);

export const UPDATE_PLAN_DAYS = planMutation(
  "updatePlanDays",
  "$id: ID!, $version: Int!, $days: [WorkoutRoutineInput!]!",
  "id: $id, version: $version, days: $days"
);

export const ACKNOWLEDGE_FLAG = planMutation(
  "acknowledgeFlag",
  "$id: ID!, $version: Int!, $flagId: ID!, $note: String!",
  "id: $id, version: $version, flagId: $flagId, note: $note"
);

export const APPROVE_PLAN = planMutation(
  "approvePlan",
  "$id: ID!, $version: Int!",
  "id: $id, version: $version"
);

export const REOPEN_PLAN = planMutation(
  "reopenPlan",
  "$id: ID!, $version: Int!, $note: String!",
  "id: $id, version: $version, note: $note"
);

export const DELIVER_PLAN = planMutation(
  "deliverPlan",
  "$id: ID!, $version: Int!",
  "id: $id, version: $version"
);
