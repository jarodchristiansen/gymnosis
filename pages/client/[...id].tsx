import DashboardContainer from "@/components/client_dashboard/DashboardContainer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const UserPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();

  return (
    <div>
      <h1>User Page - {id}</h1>

      {!!session && <DashboardContainer session={session} />}
    </div>
  );
};

export default UserPage;
