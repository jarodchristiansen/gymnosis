import { PostResolver } from "./posts";
import { UserResolver } from "./user";
import { dateScalar } from "../scalars";

const resolvers = {
  Date: dateScalar,
  Query: { ...PostResolver, ...UserResolver.queries },
  Mutation: { ...UserResolver.mutations },
};
module.exports = resolvers;
