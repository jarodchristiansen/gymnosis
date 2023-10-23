import { MediaQueries } from "@/styles/variables";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import styled from "styled-components";
import WorkoutView from "./WorkoutView";

const DashboardContainer = ({ session: data }) => {
  const [activeTab, setActiveTab] = useState("Workouts");

  const { name, email, role, image, workoutHistory } = data?.user;

  const renderTabContent = () => {
    switch (activeTab) {
      case "Workouts":
        return (
          <div>
            <WorkoutView />
          </div>
        );
      case "MealPlan":
        return <div>Meal Plan Content</div>;
      case "History":
        return <div>History Content</div>;
      default:
        return null;
    }
  };

  return (
    <DashboardContainerDiv>
      <h1>Dashboard</h1>

      <div className="client-info-div">
        <div>
          <Image
            src={data?.user?.image}
            alt="Picture of the author"
            width={200}
            height={200}
          />
        </div>

        <div className="client-info-grid">
          <div>
            <h3>Column 1</h3>

            <div>
              <h6>User Name: {!!name && name}</h6>
              <h6>Email: {!!email && email}</h6>
              <h6>role: {!!role && role}</h6>
            </div>
          </div>

          <div>
            <h3>Column 2</h3>
            <div>
              <h6>User Name: {!!name && name}</h6>
              <h6>Email: {!!email && email}</h6>
              <h6>role: {!!role && role}</h6>
            </div>
          </div>

          <div>
            <h3>Column 3</h3>
            <div>
              <h6>User Name: {!!name && name}</h6>
              <h6>Email: {!!email && email}</h6>
              <h6>role: {!!role && role}</h6>
            </div>
          </div>
        </div>
      </div>

      <DashboardContainerGrid>
        <div className="tab-buttons">
          <button onClick={() => setActiveTab("Workouts")}>Workouts</button>
          <button onClick={() => setActiveTab("MealPlan")}>Meal Plan</button>
          <button onClick={() => setActiveTab("History")}>History</button>
        </div>

        {renderTabContent()}
      </DashboardContainerGrid>
    </DashboardContainerDiv>
  );
};

const DashboardContainerDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: 12px;
  background-color: white;
  color: black;

  .client-info-div {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 24px;

    @media ${MediaQueries.LG} {
      flex-direction: row;
      align-items: flex-start;
      gap: 48px;
    }

    .client-info-grid {
      gap: 24px;

      @media ${MediaQueries.LG} {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
    }
  }
`;

const DashboardContainerGrid = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 24px;
`;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  // @ts-ignore
  if (!checkIsAdminOrTrainer(session?.user?.role)) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default DashboardContainer;
