import { Colors, FontFamily } from "@/styles/variables";
import styled from "styled-components";
import type { PlanStatus } from "./types";

export const STATUS_LABELS: Record<PlanStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  delivered: "Sent",
};

const TONES: Record<PlanStatus, { fg: string; bg: string }> = {
  draft: { fg: Colors.flag.warn, bg: "rgba(242, 193, 78, 0.1)" },
  approved: { fg: Colors.brand.accentLight, bg: "rgba(255, 159, 112, 0.1)" },
  delivered: { fg: Colors.flag.ok, bg: "rgba(134, 217, 160, 0.1)" },
};

const StatusBadge = ({ status }: { status: PlanStatus }) => (
  <Badge status={status}>{STATUS_LABELS[status]}</Badge>
);

const Badge = styled.span<{ status: PlanStatus }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-family: ${FontFamily.display};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ status }) => TONES[status].fg};
  background: ${({ status }) => TONES[status].bg};
  border: 1px solid ${Colors.brand.surface};
  white-space: nowrap;
`;

export default StatusBadge;
