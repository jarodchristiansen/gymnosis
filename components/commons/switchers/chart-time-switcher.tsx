import styled from "styled-components";

interface UnderlineProps {
  selected: boolean;
}

interface ChartTimeSwitcherProps {
  is14Days: boolean;
  onChange: () => void;
}

const ChartTimeSwitcher = ({ is14Days, onChange }: ChartTimeSwitcherProps) => {
  return (
    <TimeSwitcherWrapper>
      <TimeOption
        type="button"
        aria-pressed={is14Days}
        className={is14Days ? "selected" : undefined}
        onClick={() => onChange()}
      >
        14 days
      </TimeOption>
      <TimeOption
        type="button"
        aria-pressed={!is14Days}
        className={!is14Days ? "selected" : undefined}
        onClick={() => onChange()}
      >
        1 year
      </TimeOption>
      <Underline selected={is14Days} />
    </TimeSwitcherWrapper>
  );
};

export default ChartTimeSwitcher;

const TimeSwitcherWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f2f2f2;
`;

const TimeOption = styled.button`
  position: relative;
  padding: 5px 10px;
  margin-right: 10px;
  background-color: transparent;
  border: none;
  font: inherit;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: color 0.3s ease;

  &:hover {
    background-color: #e2e2e2;
  }

  &.selected {
    color: #000000;
  }
`;

const Underline = styled.div<UnderlineProps>`
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #4a06c9;
  transform: scaleX(${(props) => (props.selected ? 1 : 0)});
  transform-origin: ${(props) => (props.selected ? "left" : "right")};
  transition: transform 5.3s ease;
`;
