import WorkoutView from "@/components/client_dashboard/WorkoutView";
import { DisplayHeading, Eyebrow } from "@/components/ui";
import { checkIsStaff } from "@/helpers/auth/auth";
import { GET_USER } from "@/helpers/queries/user";
import { Colors, MediaQueries } from "@/styles/variables";
import { useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import styled from "styled-components";

/**
 * One client's plans. Staff see every plan and can start one; a client sees their own sent plans.
 */
const ClientPlansPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const clientId = Array.isArray(id) ? id[0] : id;
  const { data: session } = useSession();
  // @ts-expect-error next-auth user extended with role
  const isStaff = checkIsStaff(session?.user?.role);

  const { data, loading, error } = useQuery(GET_USER, {
    variables: { id: clientId },
    skip: !clientId,
  });
  const client = data?.getUser;

  if (!session || !clientId) return <Page aria-busy="true" />;

  if (error) {
    return (
      <Page>
        <Title>Client not found</Title>
        <Sub>They may have been removed, or you may not have access.</Sub>
      </Page>
    );
  }

  return (
    <Page>
      {isStaff && <BackLink href="/client">← Clients</BackLink>}
      <Header>
        <Eyebrow>{isStaff ? "Client" : "My plan"}</Eyebrow>
        <Title>
          {isStaff
            ? loading
              ? "Loading…"
              : client?.name ?? "Client"
            : "Your plans"}
        </Title>
        {isStaff && client?.username && (
          <Sub>
            @{client.username}
            {client.email ? ` · ${client.email}` : ""}
          </Sub>
        )}
      </Header>

      <WorkoutView clientId={clientId} canBuild={isStaff} />
    </Page>
  );
};

const Page = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px 72px;
  color: ${Colors.lightGray};

  @media ${MediaQueries.MD} {
    padding: 40px 24px 96px;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: 14px;
  color: ${Colors.midGray};

  &:hover {
    color: ${Colors.lightGray};
  }
`;

const Header = styled.header`
  margin-bottom: 24px;
`;

const Title = styled(DisplayHeading)`
  font-size: clamp(40px, 8vw, 64px);
`;

const Sub = styled.p`
  margin: 8px 0 0;
  font-size: 14px;
  color: ${Colors.midGray};
`;

export default ClientPlansPage;
