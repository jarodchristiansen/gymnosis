import { FILTER_CONSTS } from "@/helpers/Consts";
import { GET_USERS } from "@/helpers/queries/user";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect } from "react";

const UserPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [
    fetchUserDetails,
    {
      data: userData,
      loading: dataLoading,
      error: userError,
      refetch: refetchUser,
    },
  ] = useLazyQuery(GET_USERS, {
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (id) {
      fetchUserDetails({
        variables: {
          filter: FILTER_CONSTS.CLIENT_BY_ID,
          value: id[0],
        },
      });
    }
  }, [id]);

  return (
    <div>
      <h1>User Page - {id}</h1>
    </div>
  );
};

export default UserPage;
