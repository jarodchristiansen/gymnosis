import FlagList from "@/components/plans/FlagList";
import PlanDays from "@/components/plans/PlanDays";
import PlanEditor from "@/components/plans/PlanEditor";
import { Button } from "@/components/ui";
import PlanTimeline from "@/components/plans/PlanTimeline";
import StatusBadge from "@/components/plans/StatusBadge";
import {
  errorCode,
  errorMessage,
  formatDate,
  type Plan,
  type PlanDay,
} from "@/components/plans/types";
import { checkIsStaff } from "@/helpers/auth/auth";
import {
  ACKNOWLEDGE_FLAG,
  APPROVE_PLAN,
  DELIVER_PLAN,
  REOPEN_PLAN,
  UPDATE_PLAN_DAYS,
} from "@/helpers/mutations/plans";
import { GET_PLAN } from "@/helpers/queries/plans";
import { Colors, MediaQueries } from "@/styles/variables";
import { useMutation, useQuery } from "@apollo/client";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import styled from "styled-components";

const SOURCE_LABELS = {
  ai: "AI draft",
  manual: "Written by hand",
  legacy: "Saved before review states",
  seed: "Example plan in the demo gym",
};

const PlanPage = () => {
  const router = useRouter();
  const id = String(router.query.id ?? "");
  const { data: session } = useSession();
  // @ts-expect-error next-auth user extended with role
  const isStaff = checkIsStaff(session?.user?.role);

  const { data, loading, error, refetch } = useQuery(GET_PLAN, {
    variables: { id },
    skip: !id,
  });
  const plan: Plan | undefined = data?.plan;

  const [notice, setNotice] = useState("");
  const [reopening, setReopening] = useState(false);
  const [reopenNote, setReopenNote] = useState("");

  const [updateDays, { loading: saving }] = useMutation(UPDATE_PLAN_DAYS);
  const [acknowledge] = useMutation(ACKNOWLEDGE_FLAG);
  const [approve, { loading: approving }] = useMutation(APPROVE_PLAN);
  const [reopen, { loading: reopeningBusy }] = useMutation(REOPEN_PLAN);
  const [deliver, { loading: delivering }] = useMutation(DELIVER_PLAN);

  // Every mutation names the version it started from. If someone else changed the plan first,
  // reload it and say so rather than overwrite their work.
  const run = async (action: () => Promise<unknown>, done?: string) => {
    setNotice("");
    try {
      await action();
      if (done) setNotice(done);
    } catch (err) {
      if (errorCode(err) === "CONFLICT") await refetch();
      setNotice(errorMessage(err, "That didn't work. Try again."));
    }
  };

  if (loading) return <Page aria-busy="true">Loading plan…</Page>;
  if (error || !plan) {
    return (
      <Page>
        <h1>Plan not found</h1>
        <p>It may have been removed, or you may not have access to it.</p>
      </Page>
    );
  }

  const vars = { id: plan.id, version: plan.version };
  const isDraft = plan.status === "draft";
  const ready = plan.approvalProblems.length === 0;

  if (!isStaff) {
    return (
      <Page>
        <Header>
          <h1>Your workout plan</h1>
          <Sub>
            From {plan.trainer?.name ?? "your trainer"}
            {plan.deliveredAt ? `, ${formatDate(plan.deliveredAt)}` : ""}
          </Sub>
        </Header>
        <PlanDays days={plan.days} />
      </Page>
    );
  }

  return (
    <Page>
      <BackLink href={`/client/${plan.client?.id ?? ""}`}>
        ← {plan.client?.name ?? "Client"}
      </BackLink>

      <Header>
        <TitleRow>
          <h1>Plan for {plan.client?.name ?? "client"}</h1>
          <StatusBadge status={plan.status} />
        </TitleRow>
        <Sub>
          {SOURCE_LABELS[plan.source.kind]}
          {plan.source.model ? ` · ${plan.source.model}` : ""}
          {plan.source.promptVersion ? ` · ${plan.source.promptVersion}` : ""}
          {plan.updatedAt
            ? ` · updated ${formatDate(plan.updatedAt, true)}`
            : ""}
        </Sub>
      </Header>

      {plan.source.draftFailed && isDraft && (
        <Callout role="note">
          The AI&apos;s reply wasn&apos;t a usable plan, so nothing was filled
          in. Write this one by hand, or go back and draft again.
        </Callout>
      )}

      <p aria-live="polite" className="notice">
        {notice}
      </p>

      <Layout>
        <Main>
          <Section aria-labelledby="week-heading">
            <h2 id="week-heading">The week</h2>
            {isDraft ? (
              <PlanEditor
                key={`${plan.id}-${plan.version}`}
                days={plan.days}
                saving={saving}
                onSave={(days: PlanDay[]) =>
                  run(
                    () => updateDays({ variables: { ...vars, days } }),
                    "Saved."
                  )
                }
              />
            ) : (
              <PlanDays days={plan.days} />
            )}
          </Section>
        </Main>

        <Side>
          <Section aria-labelledby="actions-heading">
            <h2 id="actions-heading">Next step</h2>
            {isDraft && (
              <>
                <p>
                  Approving is your sign-off that this plan is right for{" "}
                  {plan.client?.name ?? "the client"}. The client won&apos;t see
                  it until you send it.
                </p>
                {!ready && (
                  <Problems>
                    {plan.approvalProblems.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </Problems>
                )}
                <Button
                  type="button"
                  disabled={!ready || approving}
                  onClick={() =>
                    run(() => approve({ variables: vars }), "Approved.")
                  }
                >
                  Approve plan
                </Button>
              </>
            )}

            {plan.status === "approved" && (
              <>
                <p>
                  Approved {formatDate(plan.approvedAt, true)}. Send it when
                  you&apos;re ready, or reopen it to make changes.
                </p>
                <ButtonRow>
                  <Button
                    type="button"
                    disabled={delivering}
                    onClick={() =>
                      run(
                        () => deliver({ variables: vars }),
                        "Sent to the client."
                      )
                    }
                  >
                    Send to client
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setReopening((v) => !v)}
                    aria-expanded={reopening}
                  >
                    Reopen for edits
                  </Button>
                </ButtonRow>
                {reopening && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      run(
                        () =>
                          reopen({ variables: { ...vars, note: reopenNote } }),
                        "Reopened."
                      ).then(() => setReopenNote(""));
                    }}
                  >
                    <label htmlFor="reopen-note">What needs to change?</label>
                    <NoteRow>
                      <input
                        id="reopen-note"
                        value={reopenNote}
                        onChange={(e) => setReopenNote(e.target.value)}
                        required
                      />
                      <Button
                        variant="secondary"
                        type="submit"
                        disabled={reopeningBusy || !reopenNote.trim()}
                      >
                        Reopen
                      </Button>
                    </NoteRow>
                  </form>
                )}
              </>
            )}

            {plan.status === "delivered" && (
              <p>
                Sent to the client {formatDate(plan.deliveredAt, true)}. To
                change it, start a new plan from the client&apos;s page.
              </p>
            )}
          </Section>

          <Section aria-labelledby="flags-heading">
            <h2 id="flags-heading">Safety flags</h2>
            <FlagList
              flags={plan.flags}
              canAcknowledge={isDraft}
              onAcknowledge={(flagId, note) =>
                run(
                  () => acknowledge({ variables: { ...vars, flagId, note } }),
                  "Flag acknowledged."
                )
              }
            />
          </Section>

          <Section aria-labelledby="history-heading">
            <h2 id="history-heading">History</h2>
            <PlanTimeline events={plan.events} />
          </Section>
        </Side>
      </Layout>
    </Page>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: "/auth?path=SignIn", permanent: false } };
  }
  return { props: { session } };
}

const Page = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 16px 64px;
  color: ${Colors.lightGray};

  h1 {
    margin: 0;
    font-size: 26px;
    color: ${Colors.brand.white};
  }

  .notice {
    min-height: 1.4em;
    margin: 8px 0;
    color: ${Colors.brand.accentLight};
    font-size: 14px;
  }
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 16px;
  color: ${Colors.midGray};
  font-size: 14px;
  text-decoration: none;

  &:hover {
    color: ${Colors.brand.white};
  }
`;

const Header = styled.header`
  margin-bottom: 12px;
`;

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

const Sub = styled.p`
  margin: 6px 0 0;
  font-size: 14px;
  color: ${Colors.midGray};
`;

const Callout = styled.div`
  padding: 12px 14px;
  border-radius: 8px;
  background: rgba(255, 107, 43, 0.1);
  border: 1px solid rgba(255, 107, 43, 0.35);
  font-size: 14px;
`;

const Layout = styled.div`
  display: grid;
  gap: 32px;

  @media ${MediaQueries.LG} {
    grid-template-columns: minmax(0, 1fr) 340px;
  }
`;

const Main = styled.div`
  min-width: 0;
`;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Section = styled.section`
  h2 {
    margin: 0 0 12px;
    font-size: 16px;
    color: ${Colors.brand.white};
  }

  p {
    font-size: 14px;
    line-height: 1.6;
  }

  label {
    display: block;
    margin: 12px 0 4px;
    font-size: 13px;
    color: ${Colors.midGray};
  }
`;

const Problems = styled.ul`
  margin: 0 0 12px;
  padding-left: 18px;
  font-size: 14px;
  color: #ffd08a;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const NoteRow = styled.div`
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
    color: ${Colors.brand.white};
  }
`;

export default PlanPage;
