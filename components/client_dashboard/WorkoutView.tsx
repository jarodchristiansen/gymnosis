import { Button } from "@/components/ui";
import { useState } from "react";
import ClientPlans from "./ClientPlans";
import WorkoutBuilder from "./WorkoutBuilder";

interface WorkoutViewProps {
  clientId: string;
  canBuild: boolean;
}

/**
 * A client's plans, or, for staff who chose "Start a plan", the builder in their place.
 */
const WorkoutView = ({ clientId, canBuild }: WorkoutViewProps) => {
  const [building, setBuilding] = useState(false);

  if (canBuild && building) {
    return (
      <div>
        <Button variant="ghost" onClick={() => setBuilding(false)}>
          ← Back to plans
        </Button>
        <WorkoutBuilder clientId={clientId} />
      </div>
    );
  }

  return (
    <ClientPlans
      clientId={clientId}
      isStaff={canBuild}
      onBuildWorkout={canBuild ? () => setBuilding(true) : undefined}
    />
  );
};

export default WorkoutView;
