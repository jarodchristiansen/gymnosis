import SEOHead from "@/components/seo/SEOHead";
import { Button, DisplayHeading, Eyebrow, Page, Sheet } from "@/components/ui";
import UsernameForm from "@/components/user/UsernameForm";
import { GET_USER } from "@/helpers/queries/user";
import { Colors, FontFamily } from "@/styles/variables";
import { useQuery } from "@apollo/client";
import { getSession, useSession } from "next-auth/react";
import { useState } from "react";
import styled from "styled-components";

const ROLE_LABELS = {
  admin: "Admin",
  owner: "Gym owner",
  trainer: "Trainer",
  client: "Client",
};

/** The signed-in person's own account. Read by id from the session, so a rename never strands it. */
const AccountPage = () => {
  const { data: session } = useSession();
  // @ts-expect-error next-auth user extended with id
  const id = session?.user?.id;
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data, loading, error } = useQuery(GET_USER, {
    variables: { id },
    skip: !id,
  });
  const user = data?.getUser;

  return (
    <Page width={640}>
      <SEOHead metaTitle="Account — Gymnosis" metaDescription="Your account." />
      <Eyebrow>Account</Eyebrow>
      <Title>{user?.name ?? (loading ? "Loading…" : "Your account")}</Title>

      {error && (
        <p role="alert">Couldn&apos;t load your account. Try reloading.</p>
      )}

      {user && (
        <Details as="dl">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{ROLE_LABELS[user.role] ?? user.role}</dd>
          </div>
          <div>
            <dt>Username</dt>
            <dd>
              {editing ? (
                <UsernameForm
                  current={user.username}
                  onCancel={() => setEditing(false)}
                  onSaved={() => {
                    setEditing(false);
                    setSaved(true);
                  }}
                />
              ) : (
                <span className="with-action">
                  <span>{user.username || "Not set"}</span>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSaved(false);
                      setEditing(true);
                    }}
                  >
                    Change
                  </Button>
                </span>
              )}
              {saved && !editing && (
                <span role="status" className="saved">
                  Saved.
                </span>
              )}
            </dd>
          </div>
        </Details>
      )}
    </Page>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return { redirect: { destination: "/auth", permanent: false } };
  }

  return { props: { session } };
}

const Title = styled(DisplayHeading)`
  font-size: clamp(40px, 8vw, 56px);
  overflow-wrap: anywhere;
`;

const Details = styled(Sheet)`
  margin: 24px 0 0;

  > div {
    display: grid;
    gap: 4px 16px;
    padding: 14px 16px;
    border-top: 1px solid ${Colors.rule};

    @media (min-width: 560px) {
      grid-template-columns: 112px minmax(0, 1fr);
      align-items: baseline;
    }
  }

  > div:first-child {
    border-top: 0;
  }

  dt {
    font-family: ${FontFamily.display};
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${Colors.midGray};
  }

  dd {
    margin: 0;
    color: ${Colors.lightGray};
    overflow-wrap: anywhere;
  }

  .with-action {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 12px;
  }

  .saved {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    color: ${Colors.flag.ok};
  }
`;

export default AccountPage;
