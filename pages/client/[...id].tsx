import DashboardContainer from "@/components/client_dashboard/DashboardContainer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const UserPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();

  //   const [
  //     fetchUserDetails,
  //     {
  //       data: userData,
  //       loading: dataLoading,
  //       error: userError,
  //       refetch: refetchUser,
  //     },
  //   ] = useLazyQuery(GET_USERS, {
  //     fetchPolicy: "cache-and-network",
  //   });

  //   useEffect(() => {
  //     if (id) {
  //       fetchUserDetails({
  //         variables: {
  //           filter: FILTER_CONSTS.CLIENT_BY_ID,
  //           value: id[0],
  //         },
  //       });
  //     }
  //   }, [id]);
  return (
    <div>
      <h1>User Page - {id}</h1>

      {!!session && <DashboardContainer session={session} />}
    </div>
  );
};

export default UserPage;
