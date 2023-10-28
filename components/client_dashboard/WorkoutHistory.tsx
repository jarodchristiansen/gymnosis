import { GET_USER } from "@/helpers/queries/user";
import { useLazyQuery } from "@apollo/client";

const WorkoutHistory = () => {
  const [
    fetchUserDetails,
    {
      data: userData,
      loading: dataLoading,
      error: userError,
      refetch: refetchUser,
    },
  ] = useLazyQuery(GET_USER, {
    fetchPolicy: "network-only",
  });

  return (
    <div>
      <h1>Workout History</h1>
    </div>
  );
};

export default WorkoutHistory;
