import { Colors } from "@/styles/variables";
import styled from "styled-components";
import { formatDate, type PlanEvent } from "./types";

const LABELS: Record<string, string> = {
  drafted: "Drafted by AI",
  draft_failed: "AI draft failed",
  created: "Started a plan by hand",
  edited: "Edited the plan",
  flag_acknowledged: "Acknowledged a safety flag",
  approve: "Approved",
  reopen: "Reopened for edits",
  deliver: "Sent to the client",
  imported: "Imported",
};

/**
 * The plan's audit trail, oldest first: who did what, when, and what changed.
 */
const PlanTimeline = ({ events }: { events: PlanEvent[] }) => (
  <List>
    {events.map((event, i) => (
      <li key={i}>
        <Heading>
          <strong>{LABELS[event.action] ?? event.action}</strong>
          <span>
            {event.actor?.name ? `${event.actor.name} · ` : ""}
            <time dateTime={new Date(Number(event.at)).toISOString()}>
              {formatDate(event.at, true)}
            </time>
          </span>
        </Heading>
        {event.note && <Note>{event.note}</Note>}
        {event.changes.length > 0 && (
          <Changes>
            {event.changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </Changes>
        )}
      </li>
    ))}
  </List>
);

const List = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0 0 0 16px;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;

  > li {
    position: relative;
  }

  > li::before {
    content: "";
    position: absolute;
    left: -22px;
    top: 5px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${Colors.brand.accent};
  }
`;

const Heading = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 12px;
  font-size: 14px;

  strong {
    color: ${Colors.brand.white};
  }

  span {
    color: ${Colors.midGray};
    font-size: 13px;
  }
`;

const Note = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  color: ${Colors.lightGray};
`;

const Changes = styled.ul`
  margin: 6px 0 0;
  padding-left: 18px;
  font-size: 13px;
  color: ${Colors.midGray};
`;

export default PlanTimeline;
