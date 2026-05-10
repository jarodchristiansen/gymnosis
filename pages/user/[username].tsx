import SideMenu from "@/components/commons/sidebar-nav";
import EditUserDetails from "@/components/user/edit-user-details";
import { GET_USER } from "@/helpers/queries/user/index";
import { Colors, MediaQueries } from "@/styles/variables";
import { useLazyQuery } from "@apollo/client";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

/**
 *
 * @returns User Profile Page with edit/profile pages connected as query strings
 */
const ProfilePage = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);

  const [fetchUserDetails, { data }] = useLazyQuery(GET_USER, {
    fetchPolicy: "network-only",
  });

  const router = useRouter();

  const slug = useMemo(() => {
    const raw = router.query?.username;
    const username = Array.isArray(raw) ? raw[0] : raw;
    if (!username) {
      return "";
    }
    fetchUserDetails({
      variables: {
        id: username,
      },
    });
    return username;
  }, [fetchUserDetails, router.query?.username]);

  // @ts-expect-error next-auth user extended with username in DB strategy
  const id = session?.user?.username;

  const isUsersProfile = id === slug;

  useEffect(() => {
    if (data?.getUser) {
      setUser(data.getUser);
    }
  }, [data?.getUser]);

  const viewState = useMemo(() => {
    const raw = router.query?.view;
    if (!raw) return "Main";
    return Array.isArray(raw) ? raw[0] : raw;
  }, [router.query?.view]);

  const routeToMain = () => {
    router.push(`/user/${id}`);
  };

  const routeEditUser = () => {
    router.push(`/user/${id}?view=edit_user`);
  };

  const redirectNonUser = useCallback(() => {
    if (viewState === "edit_user") {
      router.push("/");
    }
  }, [router, viewState]);

  const navLinks = [
    { name: "Profile", stateChanger: () => routeToMain() },
    { name: "Edit Account", stateChanger: () => routeEditUser() },
  ];

  useEffect(() => {
    if (!isUsersProfile && !!user) {
      redirectNonUser();
    }
  }, [isUsersProfile, viewState, user, redirectNonUser]);

  return (
    <PageWrapper>
      <Head>
        <link rel="icon" type="image/png" href="/images/dumbbell.svg" />
        <title>Profile</title>
      </Head>

      <CentralWrapper>
        {isUsersProfile && (
          <div className="side-menu-container">
            <SideMenu navLinks={navLinks} />
          </div>
        )}

        <div className="page-wrapper">
          {viewState === "Main" && (
            <>
              <div className="switch-container">
                <button
                  type="button"
                  className="standardized-button"
                  onClick={routeEditUser}
                >
                  Edit Profile
                </button>
              </div>

              <UserDetailsCard>
                <div className="detail-header">
                  <h2>User Details</h2>
                </div>

                <div className="detail-row">
                  <h4>Name:</h4>
                  <h4>{user?.name}</h4>
                </div>

                <div className="detail-row">
                  <h4>Email:</h4>
                  <h4>{user?.email}</h4>
                </div>

                {data?.getUser && (
                  <>
                    <div className="detail-row">
                      <h4>Username:</h4>
                      <h4>{data.getUser?.username}</h4>
                    </div>

                    <div className="detail-row">
                      <h4>Profile Pic:</h4>
                      <Image
                        src={data.getUser?.image}
                        height={50}
                        width={50}
                        alt="block-logo"
                        unoptimized={true}
                      />
                    </div>
                  </>
                )}
              </UserDetailsCard>
            </>
          )}

          {viewState === "edit_user" && isUsersProfile && (
            <>
              <div className="switch-container">
                <button
                  type="button"
                  className="standardized-button"
                  onClick={routeToMain}
                >
                  View Profile
                </button>
              </div>

              <EditUserDetails user={user} fetchedUser={data?.getUser} />
            </>
          )}
        </div>
      </CentralWrapper>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  padding-bottom: 4rem;
`;

const CentralWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;

  gap: 3rem;

  .side-menu-container {
    display: none;

    @media ${MediaQueries.MD} {
      display: unset;
    }
  }

  .page-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    gap: 3rem;
    padding-top: 3rem;
  }

  .switch-container {
    display: flex;
    gap: 1rem;

    @media ${MediaQueries.MD} {
      display: none;
    }
  }

  .back-button {
    align-self: flex-start;
    padding: 0 1rem;
    color: ${Colors.brand.accent};
    font-weight: bold;
    font-size: 18px;
  }
`;

const UserDetailsCard = styled.div`
  width: 100%;
  border: 2px solid black;
  border-radius: 14px;
  background-color: ${Colors.lightGray};

  .detail-header {
    display: flex;
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }

  .detail-row {
    padding: 1rem 2rem;
    margin: auto;
    width: 100%;
    display: flex;
    white-space: nowrap;
    justify-content: space-between;
    border-top: 1px solid black;
    gap: 1rem;
    overflow-x: auto;

    ::-webkit-scrollbar {
      display: none;
      -ms-overflow-style: none; /* IE and Edge */
      scrollbar-width: none; /* Firefox */
    }
  }

  @media ${MediaQueries.MD} {
    width: 30rem;
  }
`;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default ProfilePage;
