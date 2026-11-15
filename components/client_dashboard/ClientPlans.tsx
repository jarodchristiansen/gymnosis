import { Button } from "@/components/ui";
import PlanDays from "@/components/plans/PlanDays";
import StatusBadge from "@/components/plans/StatusBadge";
import { formatDate, type Plan } from "@/components/plans/types";
import { GET_PLANS } from "@/helpers/queries/plans";
import { Colors } from "@/styles/variables";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import styled from "styled-components";

interface ClientPlansProps {
  clientId: string;
  // Staff see every plan for the client and can start one; clients see what was sent to them.
  isStaff: boolean;
  onBuildWorkout?: () => void;
}

const ClientPlans = ({
  clientId,
  isStaff,
  onBuildWorkout,
}: ClientPlansProps) => {
  const { data, loading, error } = useQuery(GET_PLANS, {
    variables: isStaff ? { clientId } : {},
    fetchPolicy: "cache-and-network",
  });
  const plans: Plan[] = data?.plans ?? [];

  if (loading && !data) return <Muted>Loading plans…</Muted>;
  if (error) return <Muted role="alert">Couldn&apos;t load plans.</Muted>;

  if (plans.length === 0) {
    return (
      <Empty>
        <h3>No workout plans yet</h3>
        <Muted>
          {isStaff
            ? "This client doesn't have a plan yet. Draft one from their questionnaire, or write one yourself."
            : "Your trainer hasn't sent you a plan yet. It will show up here once they do."}
        </Muted>
        {isStaff && onBuildWorkout && (
          <Button type="button" onClick={onBuildWorkout}>
            Start a plan
          </Button>
        )}
      </Empty>
    );
  }

  if (!isStaff) {
    const [latest, ...earlier] = plans;
    return (
      <Stack>
        <Heading>
          <h3>Your current plan</h3>
          <Muted>Sent {formatDate(latest.deliveredAt)}</Muted>
        </Heading>
        <PlanDays days={latest.days} />
        {earlier.length > 0 && (
          <>
            <h3>Earlier plans</h3>
            <List>
              {earlier.map((plan) => (
                <li key={plan.id}>
                  <Row href={`/plans/${plan.id}`}>
                    <span>Sent {formatDate(plan.deliveredAt)}</span>
                  </Row>
                </li>
              ))}
            </List>
          </>
        )}
      </Stack>
    );
  }

  return (
    <Stack>
      <Heading>
        <h3>
          {plans.length} {plans.length === 1 ? "plan" : "plans"}
        </h3>
        {onBuildWorkout && (
          <Button type="button" onClick={onBuildWorkout}>
            Start a plan
          </Button>
        )}
      </Heading>
      <List>
        {plans.map((plan) => (
          <li key={plan.id}>
            <Row href={`/plans/${plan.id}`}>
              <span>
                {plan.status === "delivered"
                  ? `Sent ${formatDate(plan.deliveredAt)}`
                  : `Updated ${formatDate(plan.updatedAt)}`}
              </span>
              <StatusBadge status={plan.status} />
            </Row>
          </li>
        ))}
      </List>
    </Stack>
  );
};

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  h3 {
    margin: 0;
    font-size: 16px;
    color: ${Colors.brand.white};
  }
`;

const Heading = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  background: ${Colors.surface};
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: ${Colors.lightGray};
  font-size: 14px;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    border-color: ${Colors.brand.accent};
  }
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 24px;
  border-radius: 10px;
  background: ${Colors.surface};

  h3 {
    margin: 0;
    color: ${Colors.brand.white};
  }
`;

const Muted = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${Colors.midGray};
`;

export default ClientPlans;
