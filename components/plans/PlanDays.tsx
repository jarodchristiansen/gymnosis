import { Colors, MediaQueries } from "@/styles/variables";
import styled from "styled-components";
import type { PlanDay } from "./types";

/**
 * A read-only view of a plan's week.
 */
const PlanDays = ({ days }: { days: PlanDay[] }) => {
  if (days.length === 0) {
    return <Empty>This plan has no days yet.</Empty>;
  }

  return (
    <DayList>
      {days.map((day) => (
        <DayCard key={day.day}>
          <DayHeading>
            <span className="day">Day {day.day}</span>
            <span className="focus">{day.bodyPart}</span>
          </DayHeading>
          {day.exercises.length === 0 ? (
            <Rest>Rest and recovery</Rest>
          ) : (
            <ExerciseList>
              {day.exercises.map((e, i) => (
                <li key={i}>
                  <span>{e.exercise}</span>
                  <span className="dose">
                    {e.sets} × {e.reps}
                  </span>
                </li>
              ))}
            </ExerciseList>
          )}
        </DayCard>
      ))}
    </DayList>
  );
};

const DayList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;

  @media ${MediaQueries.MD} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const DayCard = styled.li`
  background: ${Colors.surface};
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 16px;
`;

const DayHeading = styled.h3`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 10px;
  font-size: 14px;

  .day {
    color: ${Colors.midGray};
    font-weight: 600;
  }

  .focus {
    color: ${Colors.brand.white};
    font-weight: 700;
  }
`;

const ExerciseList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 0;
    font-size: 14px;
    color: ${Colors.lightGray};
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .dose {
    color: ${Colors.midGray};
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
`;

const Rest = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${Colors.midGray};
`;

const Empty = styled.p`
  color: ${Colors.midGray};
`;

export default PlanDays;
