import StatusBadge from "@/components/plans/StatusBadge";
import TrainerFilter, {
  trainersIn,
  type TrainerRef,
} from "@/components/plans/TrainerFilter";
import { formatDate, type PlanStatus } from "@/components/plans/types";
import { DisplayHeading, Eyebrow } from "@/components/ui";
import { FILTER_CONSTS, SEARCH_VALUE_CONSTS } from "@/helpers/Consts";
import { checkIsStaff, checkSeesWholeGym } from "@/helpers/auth/auth";
import { GET_PLANS } from "@/helpers/queries/plans";
import { GET_USERS } from "@/helpers/queries/user";
import { Colors, FontFamily, MediaQueries } from "@/styles/variables";
import { useQuery } from "@apollo/client";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";

interface ClientRow {
  id: string;
  name?: string | null;
  createAt?: number | null;
  trainer?: TrainerRef | null;
}

interface LatestPlan {
  status: PlanStatus;
  updatedAt?: number | null;
  flags: { severity: string; acknowledged: boolean }[];
  client?: { id: string } | null;
}

const latestFor = (plans: LatestPlan[], clientId: string) =>
  plans.find((p) => p.client?.id === clientId);

const summary = (plan?: LatestPlan) => {
  if (!plan) return "No plan yet";
  const open = plan.flags.filter(
    (f) => f.severity === "block" && !f.acknowledged
  ).length;
  if (plan.status === "draft" && open > 0) {
    return `Draft · ${open} flag${open === 1 ? "" : "s"} to resolve`;
  }
  return `Updated ${formatDate(plan.updatedAt)}`;
};

interface Group {
  key: string;
  title?: string;
  clients: ClientRow[];
}

/** One untitled group for a trainer; for an owner, a group per trainer, unassigned clients last. */
const groupClients = (
  clients: ClientRow[],
  trainers: TrainerRef[],
  byTrainer: boolean
): Group[] => {
  if (!byTrainer) return [{ key: "all", clients }];
  const groups: Group[] = trainers.map((t) => ({
    key: t.id,
    title: t.name ?? "Trainer",
    clients: clients.filter((c) => c.trainer?.id === t.id),
  }));
  groups.push({
    key: "none",
    title: "No trainer yet",
    clients: clients.filter((c) => !c.trainer),
  });
  return groups.filter((g) => g.clients.length > 0);
};

const ClientsPage = () => {
  const users = useQuery(GET_USERS, {
    variables: {
      filter: FILTER_CONSTS.CLIENT_BY_ROLE,
      value: SEARCH_VALUE_CONSTS.ROLE_CLIENT,
    },
    fetchPolicy: "cache-and-network",
  });
  // Plans come newest first, so the first one per client is their latest.
  const plans = useQuery(GET_PLANS, { fetchPolicy: "cache-and-network" });

  const clients: ClientRow[] = users.data?.getUsers ?? [];
  const latest: LatestPlan[] = plans.data?.plans ?? [];
  const loading = users.loading && !users.data;

  const { data: session } = useSession();
  // @ts-expect-error next-auth user extended with role
  const wholeGym = checkSeesWholeGym(session?.user?.role);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const trainers = wholeGym ? trainersIn(clients.map((c) => c.trainer)) : [];
  const shown = trainerId
    ? clients.filter((c) => c.trainer?.id === trainerId)
    : clients;
  const groups = groupClients(shown, trainers, wholeGym);

  return (
    <Page>
      <Eyebrow>{wholeGym ? "Your gym" : "Your roster"}</Eyebrow>
      <Title>Clients</Title>
      <Lede>
        {loading
          ? "Loading clients…"
          : `${clients.length} ${clients.length === 1 ? "client" : "clients"}${
              wholeGym ? ", by trainer" : ""
            }, with where each one's latest plan stands.`}
      </Lede>

      <TrainerFilter
        trainers={trainers}
        selected={trainerId}
        onChange={setTrainerId}
      />

      {users.error && (
        <p role="alert">Couldn&apos;t load clients. Try reloading.</p>
      )}

      {!loading && clients.length === 0 && (
        <Empty>
          <h2>No clients yet</h2>
          <p>
            Clients appear here once they&apos;re assigned to you. To see how it
            works with a full roster, try the demo from the home page.
          </p>
        </Empty>
      )}

      {groups.map((group) => (
        <section
          key={group.key}
          aria-labelledby={group.title ? `group-${group.key}` : undefined}
        >
          {group.title && (
            <GroupHeading id={`group-${group.key}`}>
              {group.title} <span>{group.clients.length}</span>
            </GroupHeading>
          )}
          <List>
            {group.clients.map((client) => {
              const plan = latestFor(latest, client.id);
              return (
                <li key={client.id}>
                  <Row href={`/client/${client.id}`} data-testid="user-card">
                    <span className="who">{client.name ?? "Client"}</span>
                    <span className="what">{summary(plan)}</span>
                    {plan ? (
                      <StatusBadge status={plan.status} />
                    ) : (
                      <span className="none">Start one</span>
                    )}
                  </Row>
                </li>
              );
            })}
          </List>
        </section>
      ))}
    </Page>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);

  // @ts-expect-error next-auth user extended with role
  if (!checkIsStaff(session?.user?.role)) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: { session } };
}

const Page = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 16px 72px;
  color: ${Colors.lightGray};

  @media ${MediaQueries.MD} {
    padding: 48px 24px 96px;
  }
`;

const Title = styled(DisplayHeading)`
  font-size: clamp(44px, 8vw, 64px);
`;

const Lede = styled.p`
  margin: 8px 0 24px;
  font-size: 15px;
  color: ${Colors.midGray};
`;

const GroupHeading = styled.h2`
  margin: 24px 0 10px;
  font-family: ${FontFamily.display};
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${Colors.lightGray};

  span {
    color: ${Colors.midGray};
    font-weight: 400;
  }
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Row = styled(Link)`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    "who badge"
    "what badge";
  gap: 2px 12px;
  align-items: center;
  min-height: 56px;
  padding: 12px 14px;
  border-radius: 8px;
  background: ${Colors.surface};
  border: 1px solid ${Colors.rule};
  color: inherit;
  text-decoration: none;

  &:hover {
    border-color: ${Colors.brand.accent};
  }

  > :last-child {
    grid-area: badge;
    justify-self: end;
  }

  .who {
    grid-area: who;
    font-weight: 700;
  }

  .what {
    grid-area: what;
    font-size: 13px;
    color: ${Colors.midGray};
  }

  .none {
    font-size: 13px;
    font-weight: 650;
    color: ${Colors.brand.accentLight};
  }

  @media (min-width: 640px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) 96px;
    grid-template-areas: "who what badge";
  }
`;

const Empty = styled.div`
  padding: 24px;
  border: 1px dashed rgba(242, 238, 232, 0.2);
  border-radius: 8px;

  h2 {
    margin: 0 0 6px;
    font-size: 18px;
  }

  p {
    margin: 0;
    color: ${Colors.midGray};
  }
`;

export default ClientsPage;
