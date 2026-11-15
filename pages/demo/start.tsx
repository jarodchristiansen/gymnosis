import { getSession } from "next-auth/react";

/**
 * Where a demo sign-in lands: sends each role to the page that shows it best.
 */
const DemoStart = () => null;

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user) {
    return { redirect: { destination: "/", permanent: false } };
  }
  const destination = user.role === "client" ? `/client/${user.id}` : "/plans";
  return { redirect: { destination, permanent: false } };
}

export default DemoStart;
