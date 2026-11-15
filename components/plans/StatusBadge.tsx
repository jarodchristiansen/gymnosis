import { Colors } from "@/styles/variables";
import styled from "styled-components";
import type { PlanStatus } from "./types";

export const STATUS_LABELS: Record<PlanStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  delivered: "Delivered",
};

const TONES: Record<PlanStatus, { fg: string; bg: string }> = {
  draft: { fg: "#FFD08A", bg: "rgba(255, 176, 59, 0.12)" },
  approved: { fg: "#8FD3FF", bg: "rgba(80, 170, 255, 0.12)" },
  delivered: { fg: "#8EE6A8", bg: "rgba(72, 199, 116, 0.12)" },
};

const StatusBadge = ({ status }: { status: PlanStatus }) => (
  <Badge status={status}>{STATUS_LABELS[status]}</Badge>
);

const Badge = styled.span<{ status: PlanStatus }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: ${({ status }) => TONES[status].fg};
  background: ${({ status }) => TONES[status].bg};
  border: 1px solid ${Colors.brand.surface};
  white-space: nowrap;
`;

export default StatusBadge;
