import { formatDate } from "@/components/plans/types";
import { DisplayHeading, Eyebrow, Page, Sheet } from "@/components/ui";
import { FILTER_CONSTS, SEARCH_VALUE_CONSTS } from "@/helpers/Consts";
import { checkIsAdmin } from "@/helpers/auth/auth";
import { GET_USERS } from "@/helpers/queries/user";
import { Colors, FontFamily } from "@/styles/variables";
import { useQuery } from "@apollo/client";
import { getSession } from "next-auth/react";
import styled from "styled-components";

interface AccountRow {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  createAt?: number | null;
}

const AdminPage = () => {
  const { data, loading, error } = useQuery(GET_USERS, {
    variables: {
      filter: FILTER_CONSTS.ADMIN,
      value: SEARCH_VALUE_CONSTS.ALL,
    },
    fetchPolicy: "cache-and-network",
  });
  const accounts: AccountRow[] = data?.getUsers ?? [];

  return (
    <Page width={1000}>
      <Eyebrow>Admin</Eyebrow>
      <Title>Accounts</Title>
      <Lede>
        {loading && !data
          ? "Loading accounts…"
          : `${accounts.length} ${
              accounts.length === 1 ? "account" : "accounts"
            }, newest first. Demo sandbox accounts aren't listed.`}
      </Lede>

      {error && <p role="alert">Couldn&apos;t load accounts. Try reloading.</p>}

      {accounts.length > 0 && (
        <Table as="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Joined</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} data-testid="user-card">
                <th scope="row">{a.name || "—"}</th>
                <td data-label="Email">{a.email}</td>
                <td data-label="Role" className="role">
                  {a.role}
                </td>
                <td data-label="Joined">{formatDate(a.createAt)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Page>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);

  // @ts-expect-error next-auth user extended with role
  if (!checkIsAdmin(session?.user?.role)) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: { session } };
}

const Title = styled(DisplayHeading)`
  font-size: clamp(44px, 8vw, 64px);
`;

const Lede = styled.p`
  margin: 8px 0 24px;
  font-size: 15px;
  color: ${Colors.midGray};
`;

const Table = styled(Sheet)`
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;

  th,
  td {
    padding: 12px 16px;
    text-align: left;
    vertical-align: baseline;
    overflow-wrap: anywhere;
  }

  thead th {
    font-family: ${FontFamily.display};
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${Colors.midGray};
  }

  tbody tr {
    border-top: 1px solid ${Colors.rule};
  }

  tbody th {
    font-weight: 700;
    color: ${Colors.lightGray};
  }

  td {
    color: ${Colors.lightGray};
  }

  .role {
    text-transform: capitalize;
  }

  /* On phones each account becomes a short stack, labelled from the column it came from. */
  @media (max-width: 639px) {
    thead {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }

    tr,
    th,
    td {
      display: block;
    }

    tbody tr {
      padding: 10px 0;
    }

    tbody th,
    td {
      padding: 2px 16px;
    }

    td::before {
      content: attr(data-label) ": ";
      color: ${Colors.midGray};
    }
  }
`;

export default AdminPage;
