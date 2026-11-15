import { Colors, FontFamily, MediaQueries } from "@/styles/variables";
import styled from "styled-components";
import type { PlanDay } from "./types";

/**
 * A read-only week, laid out like a training sheet: one ruled table, a group per day.
 */
const PlanDays = ({ days }: { days: PlanDay[] }) => {
  if (days.length === 0) {
    return <Empty>This plan has no days yet.</Empty>;
  }

  return (
    <Sheet>
      <table>
        <caption className="visually-hidden">The week, day by day</caption>
        <thead>
          <tr>
            <th scope="col">Exercise</th>
            <th scope="col" className="dose">
              Sets × reps
            </th>
          </tr>
        </thead>
        {days.map((day) => (
          <tbody key={day.day}>
            <tr className="day">
              <th scope="rowgroup" colSpan={2}>
                <span className="n">D{day.day}</span> {day.bodyPart}
              </th>
            </tr>
            {day.exercises.length === 0 ? (
              <tr className="rest">
                <td colSpan={2}>Rest and recovery</td>
              </tr>
            ) : (
              day.exercises.map((e, i) => (
                <tr key={i}>
                  <td>{e.exercise}</td>
                  <td className="dose">
                    {e.sets} × {e.reps}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        ))}
      </table>
    </Sheet>
  );
};

const Sheet = styled.div`
  padding: 6px 16px 14px;
  background: ${Colors.surface};
  border: 1px solid ${Colors.rule};
  border-radius: 8px;

  @media ${MediaQueries.MD} {
    padding: 8px 24px 18px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 15px;
    font-variant-numeric: tabular-nums;
  }

  thead th {
    padding: 12px 0 6px;
    font-family: ${FontFamily.display};
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-align: left;
    color: ${Colors.midGray};
    border-bottom: 2px solid rgba(242, 238, 232, 0.16);
  }

  .dose {
    text-align: right;
    white-space: nowrap;
  }

  tr.day th {
    padding: 16px 0 4px;
    font-weight: 650;
    text-align: left;
    color: ${Colors.lightGray};
  }

  .n {
    margin-right: 8px;
    font-family: ${FontFamily.display};
    font-weight: 700;
    color: ${Colors.brand.accentLight};
  }

  td {
    padding: 9px 0;
    border-top: 1px solid ${Colors.rule};
    color: ${Colors.lightGray};
  }

  td.dose {
    color: ${Colors.midGray};
  }

  tr.rest td {
    color: ${Colors.midGray};
  }
`;

const Empty = styled.p`
  color: ${Colors.midGray};
`;

export default PlanDays;
