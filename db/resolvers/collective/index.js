import CollectiveStats from "../../models/collective";

export const CollectiveResolver = {
  getCollectiveStats: async () => {
    try {
      const collectiveStats = await CollectiveStats.find().catch(
        (err) => new Error(err)
      );

      if (!collectiveStats?.length) {
        return collectiveStats;
      }
      if (collectiveStats.length > 1) {
        return collectiveStats.slice(-1);
      }
      return collectiveStats[0];
    } catch (err) {
      throw new Error(err);
    }
  },
};
