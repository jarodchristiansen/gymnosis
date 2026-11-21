import { gql } from "@apollo/client";

export const PLAN_FIELDS = gql`
  fragment PlanFields on Plan {
    id
    status
    version
    days {
      day
      bodyPart
      exercises {
        exercise
        sets
        reps
      }
    }
    client {
      id
      name
      image
    }
    trainer {
      id
      name
    }
    source {
      kind
      model
      promptVersion
      draftFailed
    }
    flags {
      id
      rule
      severity
      day
      exercise
      message
      acknowledged
      acknowledgedBy {
        id
        name
      }
      acknowledgedAt
      note
    }
    events {
      at
      actor {
        id
        name
      }
      action
      from
      to
      note
      changes
    }
    approvalProblems
    createdAt
    updatedAt
    approvedAt
    deliveredAt
  }
`;

export const GET_PLAN = gql`
  query GET_PLAN($id: ID!) {
    plan(id: $id) {
      ...PlanFields
    }
  }
  ${PLAN_FIELDS}
`;

export const GET_PLANS = gql`
  query GET_PLANS($status: PlanStatus, $clientId: ID) {
    plans(status: $status, clientId: $clientId) {
      id
      status
      version
      days {
        day
        bodyPart
        exercises {
          exercise
          sets
          reps
        }
      }
      client {
        id
        name
      }
      trainer {
        id
        name
      }
      source {
        kind
        draftFailed
      }
      flags {
        id
        severity
        acknowledged
      }
      updatedAt
      deliveredAt
    }
  }
`;
