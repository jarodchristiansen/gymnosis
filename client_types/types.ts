export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: string; output: string };
};

export type ExerciseInput = {
  exercise?: InputMaybe<Scalars["String"]["input"]>;
  reps?: InputMaybe<Scalars["Int"]["input"]>;
  sets?: InputMaybe<Scalars["Int"]["input"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  acknowledgeFlag: Plan;
  approvePlan: Plan;
  createManualPlan: Plan;
  deliverPlan: Plan;
  draftPlan: Plan;
  reopenPlan: Plan;
  updatePlanDays: Plan;
  updateUsername?: Maybe<User>;
};

export type MutationAcknowledgeFlagArgs = {
  flagId: Scalars["ID"]["input"];
  id: Scalars["ID"]["input"];
  note: Scalars["String"]["input"];
  version: Scalars["Int"]["input"];
};

export type MutationApprovePlanArgs = {
  id: Scalars["ID"]["input"];
  version: Scalars["Int"]["input"];
};

export type MutationCreateManualPlanArgs = {
  clientId: Scalars["ID"]["input"];
};

export type MutationDeliverPlanArgs = {
  id: Scalars["ID"]["input"];
  version: Scalars["Int"]["input"];
};

export type MutationDraftPlanArgs = {
  clientId: Scalars["ID"]["input"];
  input: WorkoutGoalInput;
};

export type MutationReopenPlanArgs = {
  id: Scalars["ID"]["input"];
  note: Scalars["String"]["input"];
  version: Scalars["Int"]["input"];
};

export type MutationUpdatePlanDaysArgs = {
  days: Array<WorkoutRoutineInput>;
  id: Scalars["ID"]["input"];
  version: Scalars["Int"]["input"];
};

export type MutationUpdateUsernameArgs = {
  input?: InputMaybe<UsernameInput>;
};

export type Person = {
  __typename?: "Person";
  id: Scalars["ID"]["output"];
  image?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
};

export type Plan = {
  __typename?: "Plan";
  /** Why the plan can't be approved yet; empty when it can. */
  approvalProblems: Array<Scalars["String"]["output"]>;
  approvedAt?: Maybe<Scalars["Date"]["output"]>;
  client?: Maybe<Person>;
  createdAt?: Maybe<Scalars["Date"]["output"]>;
  days: Array<WorkoutRoutine>;
  deliveredAt?: Maybe<Scalars["Date"]["output"]>;
  events: Array<PlanEvent>;
  flags: Array<PlanFlag>;
  id: Scalars["ID"]["output"];
  source: PlanSource;
  status: PlanStatus;
  trainer?: Maybe<Person>;
  updatedAt?: Maybe<Scalars["Date"]["output"]>;
  version: Scalars["Int"]["output"];
};

export type PlanEvent = {
  __typename?: "PlanEvent";
  action: Scalars["String"]["output"];
  actor?: Maybe<Person>;
  at: Scalars["Date"]["output"];
  changes: Array<Scalars["String"]["output"]>;
  from?: Maybe<Scalars["String"]["output"]>;
  note?: Maybe<Scalars["String"]["output"]>;
  to?: Maybe<Scalars["String"]["output"]>;
};

export type PlanFlag = {
  __typename?: "PlanFlag";
  acknowledged: Scalars["Boolean"]["output"];
  acknowledgedAt?: Maybe<Scalars["Date"]["output"]>;
  acknowledgedBy?: Maybe<Person>;
  day?: Maybe<Scalars["Int"]["output"]>;
  exercise?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  message: Scalars["String"]["output"];
  note?: Maybe<Scalars["String"]["output"]>;
  rule: Scalars["String"]["output"];
  severity: Scalars["String"]["output"];
};

export type PlanSource = {
  __typename?: "PlanSource";
  draftFailed: Scalars["Boolean"]["output"];
  kind: Scalars["String"]["output"];
  model?: Maybe<Scalars["String"]["output"]>;
  promptVersion?: Maybe<Scalars["String"]["output"]>;
};

export enum PlanStatus {
  Approved = "approved",
  Delivered = "delivered",
  Draft = "draft",
}

export type Post = {
  __typename?: "Post";
  category?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  header_image?: Maybe<Scalars["String"]["output"]>;
  post_content?: Maybe<Scalars["String"]["output"]>;
  post_title?: Maybe<Scalars["String"]["output"]>;
  publish_date?: Maybe<Scalars["Date"]["output"]>;
  section?: Maybe<Scalars["String"]["output"]>;
  slug?: Maybe<Scalars["String"]["output"]>;
};

export type PostInput = {
  category?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  header_image?: InputMaybe<Scalars["String"]["input"]>;
  post_content?: InputMaybe<Scalars["String"]["input"]>;
  post_title?: InputMaybe<Scalars["String"]["input"]>;
  publish_date?: InputMaybe<Scalars["Date"]["input"]>;
  section?: InputMaybe<Scalars["String"]["input"]>;
  slug?: InputMaybe<Scalars["String"]["input"]>;
};

export type Query = {
  __typename?: "Query";
  getPost?: Maybe<Post>;
  getPosts?: Maybe<Array<Maybe<Post>>>;
  getUser?: Maybe<User>;
  getUsers?: Maybe<Array<Maybe<User>>>;
  plan?: Maybe<Plan>;
  plans: Array<Plan>;
};

export type QueryGetPostArgs = {
  slug?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryGetPostsArgs = {
  filter?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryGetUserArgs = {
  email?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["String"]["input"]>;
  username?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryGetUsersArgs = {
  filter?: InputMaybe<Scalars["String"]["input"]>;
  value?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryPlanArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryPlansArgs = {
  clientId?: InputMaybe<Scalars["ID"]["input"]>;
  status?: InputMaybe<PlanStatus>;
};

export type User = {
  __typename?: "User";
  createAt?: Maybe<Scalars["Date"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["ID"]["output"]>;
  image?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  role?: Maybe<Scalars["String"]["output"]>;
  username?: Maybe<Scalars["String"]["output"]>;
};

export type UsernameInput = {
  username: Scalars["String"]["input"];
};

export type WorkoutGoalInput = {
  activityLevel: Scalars["String"]["input"];
  age: Scalars["Int"]["input"];
  /** full gym, dumbbells only, or bodyweight only */
  equipment: Scalars["String"]["input"];
  /** beginner, intermediate, or advanced */
  experience: Scalars["String"]["input"];
  goal: Scalars["String"]["input"];
  heightInches: Scalars["Float"]["input"];
  /** Any of: knee, lower back, shoulder, wrist */
  injuries: Array<Scalars["String"]["input"]>;
  sessionsPerWeek: Scalars["Int"]["input"];
  sports: Array<Scalars["String"]["input"]>;
  weightLbs: Scalars["Float"]["input"];
  weightTraining: Scalars["Boolean"]["input"];
};

export type WorkoutRoutine = {
  __typename?: "WorkoutRoutine";
  bodyPart?: Maybe<Scalars["String"]["output"]>;
  day?: Maybe<Scalars["Int"]["output"]>;
  exercises?: Maybe<Array<Maybe<Exercise>>>;
};

export type WorkoutRoutineInput = {
  bodyPart?: InputMaybe<Scalars["String"]["input"]>;
  day?: InputMaybe<Scalars["Int"]["input"]>;
  exercises?: InputMaybe<Array<InputMaybe<ExerciseInput>>>;
};

export type Exercise = {
  __typename?: "exercise";
  exercise?: Maybe<Scalars["String"]["output"]>;
  reps?: Maybe<Scalars["Int"]["output"]>;
  sets?: Maybe<Scalars["Int"]["output"]>;
};
