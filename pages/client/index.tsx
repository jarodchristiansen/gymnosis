import { FILTER_CONSTS, SEARCH_VALUE_CONSTS } from "@/helpers/Consts";
import { GET_USERS } from "@/helpers/queries/user";
import { useLazyQuery } from "@apollo/client";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import styled from "styled-components";

const ClientPage = () => {
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
        filter: FILTER_CONSTS.CLIENT_BY_ROLE,
        value: SEARCH_VALUE_CONSTS.ROLE_CLIENT,
      },
    });
  }, []);

  const UserCards = useMemo(() => {
    if (!userData?.getUsers) return [];

    return userData.getUsers.map((user) => {
      return (
        <div data-testid={`user-card`} key={user.id} className="user-row">
          <Link href={`client/${user?.id}`}>
            <h6>User Name: {user?.name}</h6>
            <h6>Email: {user?.email}</h6>
            <h6>role: {user?.role}</h6>
          </Link>
        </div>
      );
    });
  }, [userData]);

  return (
    <PageContainer>
      <h1>Client Search Page</h1>

      {UserCards}
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

export default ClientPage;
