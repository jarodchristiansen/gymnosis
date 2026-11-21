import { Button } from "@/components/ui";
import { errorMessage } from "@/components/plans/types";
import { CREATE_MANUAL_PLAN, DRAFT_PLAN } from "@/helpers/mutations/plans";
import { Colors, FontFamily } from "@/styles/variables";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useState } from "react";
import styled from "styled-components";
import WorkoutGoalForm, { type WorkoutGoalInput } from "./WorkoutGoalForm";

interface WorkoutBuilderProps {
  clientId: string;
}

/**
 * Starts a plan for a client, from an AI draft or from scratch, then opens it for review.
 */
const WorkoutBuilder = ({ clientId }: WorkoutBuilderProps) => {
  const router = useRouter();
  const [manualError, setManualError] = useState("");
  const [draftPlan, { loading: drafting }] = useMutation(DRAFT_PLAN);
  const [createManual, { loading: creating }] = useMutation(CREATE_MANUAL_PLAN);

  const handleDraft = async (input: WorkoutGoalInput) => {
    const { data } = await draftPlan({ variables: { clientId, input } });
    if (data?.draftPlan?.id) router.push(`/plans/${data.draftPlan.id}`);
  };

  const handleManual = async () => {
    setManualError("");
    try {
      const { data } = await createManual({ variables: { clientId } });
      if (data?.createManualPlan?.id) {
        router.push(`/plans/${data.createManualPlan.id}`);
      }
    } catch (err) {
      setManualError(errorMessage(err, "Couldn't start a plan. Try again."));
    }
  };

  return (
    <WorkoutBuilderContainer>
      <BuilderHeader>
        <BuilderTitle>Start a workout plan</BuilderTitle>
        <ManualRow>
          <span>Rather write it yourself?</span>
          <Button
            variant="secondary"
            type="button"
            onClick={handleManual}
            disabled={creating}
          >
            Start from scratch
          </Button>
        </ManualRow>
        {manualError && <Problem role="alert">{manualError}</Problem>}
      </BuilderHeader>

      <WorkoutGoalForm onSubmit={handleDraft} isGenerating={drafting} />
    </WorkoutBuilderContainer>
  );
};

const WorkoutBuilderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const BuilderHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BuilderTitle = styled.h2`
  margin: 8px 0 0;
  font-family: ${FontFamily.display};
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: ${Colors.lightGray};
`;

const ManualRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${Colors.midGray};
`;

const Problem = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${Colors.flag.block};
`;

export default WorkoutBuilder;
