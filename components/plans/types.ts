export type PlanStatus = "draft" | "approved" | "delivered";

export interface Exercise {
  exercise: string;
  sets: number;
  reps: number;
}

export interface PlanDay {
  day: number;
  bodyPart: string;
  exercises: Exercise[];
}

export interface Person {
  id: string;
  name?: string | null;
  image?: string | null;
}

export interface PlanFlag {
  id: string;
  rule: string;
  severity: "block" | "warn";
  day?: number | null;
  exercise?: string | null;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: Person | null;
  acknowledgedAt?: number | null;
  note?: string | null;
}

export interface PlanEvent {
  at: number;
  actor?: Person | null;
  action: string;
  from?: string | null;
  to?: string | null;
  note?: string | null;
  changes: string[];
}

export interface Plan {
  id: string;
  status: PlanStatus;
  version: number;
  days: PlanDay[];
  client?: Person | null;
  trainer?: Person | null;
  source: {
    kind: "ai" | "manual" | "legacy";
    model?: string | null;
    promptVersion?: string | null;
    draftFailed: boolean;
  };
  flags: PlanFlag[];
  events: PlanEvent[];
  approvalProblems: string[];
  createdAt?: number | null;
  updatedAt?: number | null;
  approvedAt?: number | null;
  deliveredAt?: number | null;
}

/** The API's Date scalar arrives as epoch milliseconds. */
export const formatDate = (
  value?: number | string | null,
  withTime = false
) => {
  if (value == null) return "";
  const date = new Date(Number(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
};

/** The message to show for an Apollo error. */
export const errorMessage = (err: unknown, fallback: string) => {
  const graphQLErrors = (err as { graphQLErrors?: { message: string }[] })
    ?.graphQLErrors;
  return graphQLErrors?.[0]?.message ?? fallback;
};

export const errorCode = (err: unknown) =>
  (
    err as {
      graphQLErrors?: { extensions?: { code?: string } }[];
    }
  )?.graphQLErrors?.[0]?.extensions?.code;
