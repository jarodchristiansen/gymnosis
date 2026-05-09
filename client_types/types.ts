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
  addWorkoutRoutine?: Maybe<User>;
  updateUsername?: Maybe<User>;
};

export type MutationAddWorkoutRoutineArgs = {
  input?: InputMaybe<WorkoutInput>;
};

export type MutationUpdateUsernameArgs = {
  input?: InputMaybe<UsernameInput>;
};

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
  createWorkout?: Maybe<Array<Maybe<WorkoutRoutine>>>;
  getPost?: Maybe<Post>;
  getPosts?: Maybe<Array<Maybe<Post>>>;
  getUser?: Maybe<User>;
  getUsers?: Maybe<Array<Maybe<User>>>;
};

export type QueryCreateWorkoutArgs = {
  prompt?: InputMaybe<Scalars["String"]["input"]>;
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
};

export type QueryGetUsersArgs = {
  filter?: InputMaybe<Scalars["String"]["input"]>;
  value?: InputMaybe<Scalars["String"]["input"]>;
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
  email?: InputMaybe<Scalars["String"]["input"]>;
  username: Scalars["String"]["input"];
};

export type WorkoutInput = {
  id?: InputMaybe<Scalars["String"]["input"]>;
  routine?: InputMaybe<Array<InputMaybe<WorkoutRoutineInput>>>;
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
