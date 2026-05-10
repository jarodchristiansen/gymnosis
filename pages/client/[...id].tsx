import DashboardContainer from "@/components/client_dashboard/DashboardContainer";
import { GET_USER } from "@/helpers/queries/user";
import { Colors } from "@/styles/variables";
import { useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import styled from "styled-components";

const UserPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();

  const clientId = Array.isArray(id) ? id[0] : id;

  const { data: clientData, loading: clientLoading } = useQuery(GET_USER, {
    variables: { id: clientId },
    skip: !clientId,
  });

  const clientUser = clientData?.getUser;
  const clientName = clientUser?.name ?? "Client";

  return (
    <PageContainer>
      <PageHeader>
        <BackLink href="/client">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Your Clients
        </BackLink>
        {clientLoading ? (
          <NameSkeleton />
        ) : (
          <ClientHeading>{clientName}</ClientHeading>
        )}
      </PageHeader>

      {!!session && clientId && !clientLoading && (
        <DashboardContainer
          session={session}
          clientId={clientId}
          clientUser={clientUser}
        />
      )}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px 80px;
  color: ${Colors.brand.white};
`;

const PageHeader = styled.div`
  padding: 32px 0 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  margin-bottom: 36px;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: ${Colors.midGray};
  text-decoration: none;
  margin-bottom: 16px;
  transition: color 0.15s ease;

  &:hover {
    color: ${Colors.brand.white};
  }
`;

const ClientHeading = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${Colors.brand.white};
  margin: 0;
  letter-spacing: -0.4px;
`;

const NameSkeleton = styled.div`
  height: 32px;
  width: 200px;
  border-radius: 6px;
  margin-top: 4px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 800px 100%;

  @keyframes shimmer {
    0% {
      background-position: -400px 0;
    }
    100% {
      background-position: 400px 0;
    }
  }

  animation: shimmer 1.4s infinite;
`;

export default UserPage;
