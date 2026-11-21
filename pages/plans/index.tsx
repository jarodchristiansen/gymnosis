import StatusBadge from "@/components/plans/StatusBadge";
import TrainerFilter, {
  trainersIn,
  type TrainerRef,
} from "@/components/plans/TrainerFilter";
import { formatDate, type PlanStatus } from "@/components/plans/types";
import { checkIsStaff, checkSeesWholeGym } from "@/helpers/auth/auth";
import { GET_PLANS } from "@/helpers/queries/plans";
import { DisplayHeading, Eyebrow } from "@/components/ui";
import { Colors, FontFamily } from "@/styles/variables";
import { useQuery } from "@apollo/client";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";

interface QueuePlan {
  id: string;
  status: PlanStatus;
  client?: { id: string; name?: string | null } | null;
  trainer?: TrainerRef | null;
  source: { kind: string; draftFailed: boolean };
  flags: { id: string; severity: string; acknowledged: boolean }[];
  days: { exercises: unknown[] }[];
  updatedAt?: number | null;
}

const SECTIONS: { status: PlanStatus; title: string; empty: string }[] = [
  {
    status: "draft",
    title: "Drafts to review",
    empty: "No drafts. Start one from a client's page.",
  },
  {
    status: "approved",
    title: "Approved, ready to send",
    empty: "Nothing waiting to be sent.",
  },
  {
    status: "delivered",
    title: "Sent to clients",
    empty: "No plans sent yet.",
  },
];

const summary = (plan: QueuePlan) => {
  if (plan.source.draftFailed && plan.days.length === 0) {
    return "Needs writing by hand";
  }
  const open = plan.flags.filter(
    (f) => f.severity === "block" && !f.acknowledged
  ).length;
  const training = plan.days.filter((d) => d.exercises.length > 0).length;
  const parts = [`${training} training day${training === 1 ? "" : "s"}`];
  if (plan.status === "draft" && open > 0) {
    parts.push(`${open} flag${open === 1 ? "" : "s"} to resolve`);
  }
  return parts.join(" · ");
};

const PlansPage = () => {
  const { data, loading, error } = useQuery(GET_PLANS, {
    fetchPolicy: "cache-and-network",
  });
  const allPlans: QueuePlan[] = data?.plans ?? [];

  const { data: session } = useSession();
  // @ts-expect-error next-auth user extended with role
  const wholeGym = checkSeesWholeGym(session?.user?.role);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const trainers = wholeGym ? trainersIn(allPlans.map((p) => p.trainer)) : [];
  const plans = trainerId
    ? allPlans.filter((p) => p.trainer?.id === trainerId)
    : allPlans;

  return (
    <Page>
      <Eyebrow>{wholeGym ? "Your gym" : "Your queue"}</Eyebrow>
      <Title>Plans</Title>
      <Lede>
        {wholeGym
          ? "Every trainer's plans, by where each is in review."
          : "Every plan you're working on, by where it is in review."}{" "}
        Clients only see plans once they&apos;re sent.
      </Lede>

      <TrainerFilter
        trainers={trainers}
        selected={trainerId}
        onChange={setTrainerId}
      />

      {error && <p role="alert">Couldn&apos;t load plans. Try reloading.</p>}

      {SECTIONS.map(({ status, title, empty }) => {
        const items = plans.filter((p) => p.status === status);
        return (
          <Section key={status} aria-labelledby={`${status}-heading`}>
            <h2 id={`${status}-heading`}>
              {title} <Count>{loading && !data ? "" : items.length}</Count>
            </h2>
            {items.length === 0 ? (
              <Empty>{loading && !data ? "Loading…" : empty}</Empty>
            ) : (
              <List>
                {items.map((plan) => (
                  <li key={plan.id}>
                    <Row href={`/plans/${plan.id}`}>
                      <span className="who">
                        {plan.client?.name ?? "Client"}
                      </span>
                      <span className="what">
                        {wholeGym && plan.trainer?.name
                          ? `${plan.trainer.name} · `
                          : ""}
                        {summary(plan)}
                      </span>
                      <span className="when">{formatDate(plan.updatedAt)}</span>
                      <StatusBadge status={plan.status} />
                    </Row>
                  </li>
                ))}
              </List>
            )}
          </Section>
        );
      })}
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
  padding: 32px 16px 64px;
  color: ${Colors.lightGray};
`;

const Title = styled(DisplayHeading)`
  font-size: clamp(44px, 8vw, 64px);
`;

const Lede = styled.p`
  margin: 8px 0 24px;
  color: ${Colors.midGray};
  font-size: 15px;
`;

const Section = styled.section`
  margin-bottom: 28px;

  h2 {
    margin: 0 0 10px;
    font-family: ${FontFamily.display};
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${Colors.lightGray};
  }
`;

const Count = styled.span`
  color: ${Colors.midGray};
  font-weight: 400;
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
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "who badge"
    "what when";
  gap: 4px 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 8px;
  background: ${Colors.surface};
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: inherit;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    border-color: ${Colors.brand.accent};
  }

  > :last-child {
    grid-area: badge;
    justify-self: end;
  }

  .who {
    grid-area: who;
    font-weight: 700;
    color: ${Colors.brand.white};
  }

  .what {
    grid-area: what;
  }

  .when {
    grid-area: when;
    text-align: right;
  }

  .what,
  .when {
    font-size: 13px;
    color: ${Colors.midGray};
  }

  @media (min-width: 640px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr) 110px 96px;
    grid-template-areas: "who what when badge";
  }
`;

const Empty = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${Colors.midGray};
`;

export default PlansPage;
