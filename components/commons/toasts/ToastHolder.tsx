import { Colors } from "@/styles/variables";
import styled from "styled-components";

export type ToastHolderProps = {
  toggleShowA: () => void;
  showA: boolean;
  toastText?: string;
};

const ToastHolder = ({
  toggleShowA,
  showA,
  toastText = "Action completed successfully.",
}: ToastHolderProps) => {
  if (!showA) return null;

  return (
    <ToastWrapper role="status" aria-live="polite">
      <ToastHeader>
        <span>Notification</span>
        <CloseButton
          type="button"
          onClick={toggleShowA}
          aria-label="Dismiss notification"
        >
          ×
        </CloseButton>
      </ToastHeader>
      <ToastBody>{toastText}</ToastBody>
    </ToastWrapper>
  );
};

const ToastWrapper = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: ${Colors.surface};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  min-width: 280px;
  max-width: 360px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 1100;
  overflow: hidden;
`;

const ToastHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background-color: ${Colors.brand.accent};
  color: ${Colors.brand.white};
  font-weight: 600;
  font-size: 14px;
`;

const ToastBody = styled.div`
  padding: 12px 14px;
  font-size: 14px;
  color: ${Colors.lightGray};
  line-height: 1.5;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${Colors.brand.white};
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`;

export default ToastHolder;
