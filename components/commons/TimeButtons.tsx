import React from "react";

interface TimeButtonsProps {
  availTimes: number[];
  setTimeQuery: (time: number) => void;
  refetch: any;
}

const TimeButtons = ({
  availTimes,
  setTimeQuery,
  refetch,
}: TimeButtonsProps) => {
  return (
    <div>
      {availTimes &&
        availTimes.map((time) => (
          <button
            type="button"
            key={time}
            className={"standardized-button"}
            onClick={() => {
              setTimeQuery(time);
              refetch({
                time,
              });
            }}
          >
            -{time}-
          </button>
        ))}
    </div>
  );
};

export default TimeButtons;
