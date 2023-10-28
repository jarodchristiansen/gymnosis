import { useState } from "react";
import styled from "styled-components";
import WorkoutBuilder from "./WorkoutBuilder";
import WorkoutHistory from "./WorkoutHistory";

interface TabButtonProps {
  active: boolean;
}

const WorkoutView = ({ id }) => {
  const [view, setView] = useState<string>("history");

  const handleTabChange = (tab) => {
    setView(tab);
  };

  const renderContent = () => {
    if (view === "history") {
      return (
        <div>
          {/* Display workout plan history */}
          <h3>Workout Plan History</h3>
          {/* Add code to fetch and display workout plan history */}
          <WorkoutHistory />
        </div>
      );
    } else if (view === "builder") {
      return (
        <div>
          {/* Create a new workout plan */}
          <h3>Workout Plan Builder</h3>

          <WorkoutBuilder id={id} />
          {/* Add code for building a new workout plan */}
        </div>
      );
    }
  };

  return (
    <WorkoutContainer>
      <Tabs>
        <TabButton
          onClick={() => handleTabChange("history")}
          active={view === "history"}
        >
          History
        </TabButton>
        <TabButton
          onClick={() => handleTabChange("builder")}
          active={view === "builder"}
        >
          Builder
        </TabButton>
      </Tabs>
      {renderContent()}
    </WorkoutContainer>
  );
};

const WorkoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 2px solid black;
  padding: 24px;
`;

const Tabs = styled.div`
  justify-content: center;
  padding: 24px;
  display: flex;
  gap: 16px;
`;

const TabButton = styled.button<TabButtonProps>`
  padding: 8px 16px;
  background-color: ${(props) => (props.active ? "#007bff" : "lightgray")};
  color: white;
  border: none;
  cursor: pointer;
`;

export default WorkoutView;
