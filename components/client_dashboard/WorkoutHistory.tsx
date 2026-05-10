import { Colors, MediaQueries } from "@/styles/variables";
import { useState } from "react";
import styled from "styled-components";
import type { WorkoutHistoryEntry } from "./DashboardContainer";

interface WorkoutHistoryProps {
  workoutHistory: WorkoutHistoryEntry[];
  onBuildWorkout: () => void;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "Unknown date";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Unknown date";
  }
};

const WorkoutHistory = ({
  workoutHistory,
  onBuildWorkout,
}: WorkoutHistoryProps) => {
  const [expandedEntry, setExpandedEntry] = useState<number | null>(
    workoutHistory.length > 0 ? 0 : null
  );

  if (!workoutHistory || workoutHistory.length === 0) {
    return (
      <EmptyContainer>
        <EmptyIcon>
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </EmptyIcon>
        <EmptyTitle>No workout plans yet</EmptyTitle>
        <EmptyMessage>
          This client does not have a workout plan assigned. Build a
          personalized AI-generated plan to get them started.
        </EmptyMessage>
        <BuildButton type="button" onClick={onBuildWorkout}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Build a Workout Plan
        </BuildButton>
      </EmptyContainer>
    );
  }

  // Newest first
  const sorted = [...workoutHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <HistoryContainer>
      <HistoryHeader>
        <HistoryTitle>
          {sorted.length} {sorted.length === 1 ? "plan" : "plans"} on file
        </HistoryTitle>
        <NewPlanButton type="button" onClick={onBuildWorkout}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Plan
        </NewPlanButton>
      </HistoryHeader>

      <EntryList>
        {sorted.map((entry, index) => {
          const isOpen = expandedEntry === index;
          const activeDays = entry.routine?.filter(
            (d) => d.exercises && d.exercises.length > 0
          );
          const totalExercises =
            activeDays?.reduce((acc, d) => acc + d.exercises.length, 0) ?? 0;

          return (
            <EntryCard key={index} open={isOpen}>
              <EntryToggle
                type="button"
                onClick={() => setExpandedEntry(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <EntryMeta>
                  <EntryDate>{formatDate(entry.date)}</EntryDate>
                  {index === 0 && <LatestBadge>Latest</LatestBadge>}
                </EntryMeta>
                <EntrySummary>
                  <SummaryChip>{entry.routine?.length ?? 0} days</SummaryChip>
                  <SummaryChip>{totalExercises} exercises</SummaryChip>
                </EntrySummary>
                <ChevronWrap open={isOpen}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </ChevronWrap>
              </EntryToggle>

              {isOpen && (
                <RoutineGrid>
                  {entry.routine?.map((day) => {
                    const isRest =
                      day.bodyPart?.toLowerCase() === "rest" ||
                      !day.exercises?.length;
                    return (
                      <DayCard key={day.day} isRest={isRest}>
                        <DayHeader>
                          <DayNum>Day {day.day}</DayNum>
                          <BodyPartTag isRest={isRest}>
                            {day.bodyPart}
                          </BodyPartTag>
                        </DayHeader>
                        {!isRest && (
                          <ExerciseList>
                            {day.exercises.map((ex, ei) => (
                              <ExerciseItem key={ei}>
                                <ExerciseName>{ex.exercise}</ExerciseName>
                                <ExerciseDetail>
                                  {ex.sets} sets &times; {ex.reps} reps
                                </ExerciseDetail>
                              </ExerciseItem>
                            ))}
                          </ExerciseList>
                        )}
                        {isRest && <RestLabel>Rest &amp; Recovery</RestLabel>}
                      </DayCard>
                    );
                  })}
                </RoutineGrid>
              )}
            </EntryCard>
          );
        })}
      </EntryList>
    </HistoryContainer>
  );
};

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 24px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 107, 43, 0.07);
  border: 1px solid rgba(255, 107, 43, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Colors.brand.accent};
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
  font-size: 17px;
  font-weight: 600;
  color: ${Colors.brand.white};
  margin: 0 0 10px;
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  line-height: 1.65;
  color: ${Colors.midGray};
  max-width: 340px;
  margin: 0 0 28px;
`;

const BuildButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: ${Colors.brand.accent};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover {
    background: ${Colors.brand.accentHover};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HistoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HistoryTitle = styled.span`
  font-size: 13px;
  color: ${Colors.midGray};
`;

const NewPlanButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  color: ${Colors.brand.accent};
  background: rgba(255, 107, 43, 0.08);
  border: 1px solid rgba(255, 107, 43, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 107, 43, 0.15);
  }
`;

const EntryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EntryCard = styled.div<{ open: boolean }>`
  border: 1px solid
    ${({ open }) =>
      open ? "rgba(255, 107, 43, 0.25)" : "rgba(255, 255, 255, 0.07)"};
  border-radius: 10px;
  overflow: hidden;
  background: ${({ open }) =>
    open ? "rgba(255, 107, 43, 0.03)" : "rgba(255, 255, 255, 0.02)"};
  transition: border-color 0.15s ease, background 0.15s ease;
`;

const EntryToggle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const EntryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const EntryDate = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${Colors.brand.white};
`;

const LatestBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${Colors.brand.accent};
  background: rgba(255, 107, 43, 0.1);
  border: 1px solid rgba(255, 107, 43, 0.2);
  border-radius: 4px;
  padding: 1px 6px;
`;

const EntrySummary = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

const SummaryChip = styled.span`
  font-size: 11px;
  color: ${Colors.midGray};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 4px;
  padding: 2px 8px;
`;

const ChevronWrap = styled.div<{ open: boolean }>`
  flex-shrink: 0;
  color: ${Colors.midGray};
  transform: ${({ open }) => (open ? "rotate(180deg)" : "rotate(0deg)")};
  transition: transform 0.2s ease;
`;

const RoutineGrid = styled.div`
  padding: 4px 16px 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  @media ${MediaQueries.MD} {
    grid-template-columns: repeat(3, 1fr);
  }

  @media ${MediaQueries.LG} {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const DayCard = styled.div<{ isRest: boolean }>`
  padding: 12px;
  border-radius: 8px;
  background: ${({ isRest }) =>
    isRest ? "rgba(255,255,255,0.02)" : "rgba(255, 255, 255, 0.04)"};
  border: 1px solid
    ${({ isRest }) =>
      isRest ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)"};
`;

const DayHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const DayNum = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${Colors.brand.white};
  letter-spacing: 0.3px;
`;

const BodyPartTag = styled.span<{ isRest: boolean }>`
  font-size: 10px;
  font-weight: 600;
  color: ${({ isRest }) => (isRest ? Colors.midGray : Colors.brand.accent)};
  background: ${({ isRest }) =>
    isRest ? "rgba(255,255,255,0.05)" : "rgba(255,107,43,0.1)"};
  border: 1px solid
    ${({ isRest }) =>
      isRest ? "rgba(255,255,255,0.06)" : "rgba(255,107,43,0.2)"};
  border-radius: 3px;
  padding: 1px 6px;
`;

const ExerciseList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ExerciseItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const ExerciseName = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${Colors.brand.white};
  line-height: 1.3;
`;

const ExerciseDetail = styled.span`
  font-size: 11px;
  color: ${Colors.midGray};
`;

const RestLabel = styled.p`
  font-size: 12px;
  color: ${Colors.midGray};
  font-style: italic;
  margin: 0;
`;

export default WorkoutHistory;
