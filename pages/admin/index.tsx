import { FILTER_CONSTS, SEARCH_VALUE_CONSTS } from "@/helpers/Consts";
import { checkIsAdmin } from "@/helpers/auth/auth";
import { GET_USERS } from "@/helpers/queries/user";
import { useLazyQuery } from "@apollo/client";
import { getSession } from "next-auth/react";
import { useEffect, useMemo } from "react";
import styled from "styled-components";

const AdminPage = () => {
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
    fetchUserDetails({
      variables: {
        filter: FILTER_CONSTS.ADMIN,
        value: SEARCH_VALUE_CONSTS.ALL,
      },
    });
  }, []);

  const UserCards = useMemo(() => {
    if (!userData?.getUsers) return [];

    return userData.getUsers.map((user) => {
      return (
        <div data-testid={`user-card`} key={user.id} className="user-row">
          <h6>User Name: {user?.name}</h6>
          <h6>Email: {user?.email}</h6>
          <h6>role: {user?.role}</h6>
        </div>
      );
    });
  }, [userData]);

  return (
    <PageContainer>
      <h1>Admin Page</h1>

      <div>{UserCards}</div>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  color: black;
  padding-top: 36px;

  .user-row {
    display: flex;
    width: 100%;
    padding: 20px;
    margin: auto;
    align-items: center;
    border: 1px solid black;
    justify-content: space-between;
  }
`;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  // @ts-ignore
  if (!checkIsAdmin(session?.user?.role)) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default AdminPage;
