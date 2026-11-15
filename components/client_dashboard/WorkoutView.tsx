import { Colors } from "@/styles/variables";
import { useState } from "react";
import styled from "styled-components";
import ClientPlans from "./ClientPlans";
import WorkoutBuilder from "./WorkoutBuilder";

interface WorkoutViewProps {
  clientId: string;
  canBuild: boolean;
}

type WorkoutTab = "history" | "builder";

const WorkoutView = ({ clientId, canBuild }: WorkoutViewProps) => {
  const [view, setView] = useState<WorkoutTab>("history");

  const renderContent = () => {
    if (view === "history" || !canBuild) {
      return (
        <ClientPlans
          clientId={clientId}
          isStaff={canBuild}
          onBuildWorkout={canBuild ? () => setView("builder") : undefined}
        />
      );
    }
    return <WorkoutBuilder clientId={clientId} />;
  };

  if (!canBuild) {
    return <WorkoutContainer>{renderContent()}</WorkoutContainer>;
  }

  return (
    <WorkoutContainer>
      <SubTabBar role="tablist" aria-label="Workout sections">
        <SubTabButton
          role="tab"
          type="button"
          aria-selected={view === "history"}
          active={view === "history"}
          onClick={() => setView("history")}
        >
          Plans
        </SubTabButton>
        <SubTabButton
          role="tab"
          type="button"
          aria-selected={view === "builder"}
          active={view === "builder"}
          onClick={() => setView("builder")}
        >
          Start a plan
        </SubTabButton>
      </SubTabBar>

      <SubTabContent>{renderContent()}</SubTabContent>
    </WorkoutContainer>
  );
};

const WorkoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const SubTabBar = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  padding-bottom: 0;
`;

const SubTabButton = styled.button<{ active: boolean }>`
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ active }) => (active ? Colors.brand.white : Colors.midGray)};
  background: ${({ active }) =>
    active ? "rgba(255, 107, 43, 0.1)" : "transparent"};
  border: none;
  border-radius: 6px 6px 0 0;
  border-bottom: 2px solid
    ${({ active }) => (active ? Colors.brand.accent : "transparent")};
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
  margin-bottom: -1px;

  &:hover {
    color: ${Colors.brand.white};
    background: rgba(255, 255, 255, 0.04);
  }
`;

const SubTabContent = styled.div`
  padding-top: 4px;
`;

export default WorkoutView;
