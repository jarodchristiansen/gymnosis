import { PlanResolver } from "./plan";
import { PostResolver } from "./posts";
import { UserResolver } from "./user";
import { dateScalar } from "../scalars";

const resolvers = {
  Date: dateScalar,
  Query: {
    ...PostResolver,
    ...UserResolver.queries,
    ...PlanResolver.queries,
  },
  Mutation: { ...UserResolver.mutations, ...PlanResolver.mutations },
};
module.exports = resolvers;
