import { FILTER_CONSTS, SEARCH_VALUE_CONSTS } from "@/helpers/Consts";
import { checkIsAdminOrTrainer } from "@/helpers/auth/auth";
import { GET_USERS } from "@/helpers/queries/user";
import { Colors, MediaQueries } from "@/styles/variables";
import { useLazyQuery } from "@apollo/client";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import styled from "styled-components";

const getInitials = (name: string): string => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const formatJoinDate = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const ClientPage = () => {
  const [fetchUserDetails, { data: userData, loading }] = useLazyQuery(
    GET_USERS,
    { fetchPolicy: "cache-and-network" }
  );

  useEffect(() => {
    fetchUserDetails({
      variables: {
        filter: FILTER_CONSTS.CLIENT_BY_ROLE,
        value: SEARCH_VALUE_CONSTS.ROLE_CLIENT,
      },
    });
  }, [fetchUserDetails]);

  const clients = useMemo(() => userData?.getUsers ?? [], [userData]);

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>Your Clients</PageTitle>
          {!loading && (
            <ClientCount>
              {clients.length} {clients.length === 1 ? "client" : "clients"}
            </ClientCount>
          )}
        </div>
      </PageHeader>

      {loading && (
        <CardGrid>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i}>
              <div className="skeleton-avatar" />
              <div className="skeleton-content">
                <div className="skeleton-line long" />
                <div className="skeleton-line short" />
              </div>
            </SkeletonCard>
          ))}
        </CardGrid>
      )}

      {!loading && clients.length === 0 && (
        <EmptyState>
          <EmptyIcon>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </EmptyIcon>
          <h3>No clients yet</h3>
          <p>
            Clients will appear here once they have been added to your roster.
          </p>
        </EmptyState>
      )}

      {!loading && clients.length > 0 && (
        <CardGrid>
          {clients.map((user) => (
            <ClientCard
              key={user.id}
              href={`client/${user.id}`}
              data-testid="user-card"
            >
              <Avatar>{getInitials(user.name)}</Avatar>
              <ClientInfo>
                <ClientName>{user.name}</ClientName>
                <ClientEmail>{user.email}</ClientEmail>
                {user.createAt && (
                  <JoinDate>
                    Member since {formatJoinDate(user.createAt)}
                  </JoinDate>
                )}
              </ClientInfo>
              <ChevronIcon>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </ChevronIcon>
            </ClientCard>
          ))}
        </CardGrid>
      )}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px 64px;
  color: ${Colors.brand.white};
`;

const PageHeader = styled.div`
  padding: 40px 0 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${Colors.brand.white};
  margin: 0 0 6px;
  letter-spacing: -0.5px;
`;

const ClientCount = styled.p`
  font-size: 14px;
  color: ${Colors.midGray};
  margin: 0;
`;

const CardGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media ${MediaQueries.MD} {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

const ClientCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: ${Colors.surface};
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover {
    border-color: rgba(255, 107, 43, 0.4);
    background: rgba(255, 107, 43, 0.04);

    svg {
      transform: translateX(2px);
      color: ${Colors.brand.accent};
    }
  }
`;

const Avatar = styled.div`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${Colors.brand.accent},
    ${Colors.brand.accentHover}
  );
  color: white;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
`;

const ClientInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ClientName = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: ${Colors.brand.white};
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ClientEmail = styled.p`
  font-size: 13px;
  color: ${Colors.midGray};
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JoinDate = styled.p`
  font-size: 11px;
  color: rgba(138, 159, 176, 0.65);
  margin: 0;
  margin-top: 4px;
`;

const ChevronIcon = styled.div`
  flex-shrink: 0;
  color: ${Colors.midGray};
  display: flex;
  align-items: center;
  transition: transform 0.15s ease, color 0.15s ease;

  svg {
    transition: transform 0.15s ease, color 0.15s ease;
  }
`;

const SkeletonCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: ${Colors.surface};
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;

  @keyframes shimmer {
    0% {
      background-position: -400px 0;
    }
    100% {
      background-position: 400px 0;
    }
  }

  .skeleton-avatar {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 75%
    );
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite;
  }

  .skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .skeleton-line {
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 75%
    );
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite;

    &.long {
      width: 55%;
    }

    &.short {
      width: 38%;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 72px 24px;
  text-align: center;
  color: ${Colors.midGray};

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: ${Colors.brand.white};
    margin: 16px 0 8px;
  }

  p {
    font-size: 14px;
    line-height: 1.6;
    max-width: 320px;
    margin: 0;
  }
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Colors.midGray};
`;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  // @ts-ignore
  if (!checkIsAdminOrTrainer(session?.user?.role)) {
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

export default ClientPage;
