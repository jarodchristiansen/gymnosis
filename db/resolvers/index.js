import { PlanResolver } from "./plan";
import { UserResolver } from "./user";
import { dateScalar } from "../scalars";

const resolvers = {
  Date: dateScalar,
  Query: {
    ...UserResolver.queries,
    ...PlanResolver.queries,
  },
  Mutation: { ...UserResolver.mutations, ...PlanResolver.mutations },
  User: UserResolver.fields,
};
module.exports = resolvers;
