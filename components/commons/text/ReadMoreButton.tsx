import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

type ReadMoreButtonProps = {
  children: string;
};

const ReadMoreButton = ({ children }: ReadMoreButtonProps) => {
  const [shouldShowReadMore, setShouldShowReadMore] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (children && children.length > 250) {
      setShouldShowReadMore(true);
    }
  }, [children]);

  const shortenedText = useMemo(() => {
    if (!children) return "N/A";
    if (!shouldShowReadMore || showMore) return children;
    return children.slice(0, 250);
  }, [shouldShowReadMore, children, showMore]);

  const changeRender = (step: string) => {
    if (step === "Less") {
      setShowMore(false);
      setShouldShowReadMore(true);
    }
    if (step === "More") {
      setShowMore(true);
      setShouldShowReadMore(false);
    }
  };

  return (
    <ReadMoreWrapper>
      {!shouldShowReadMore && !showMore ? children : null}

      {shouldShowReadMore && (
        <div className="content-container">
          {shortenedText}
          <button
            type="button"
            onClick={() => changeRender("More")}
            className="read-more-text standardized-button"
          >
            Read More
          </button>
        </div>
      )}

      {!shouldShowReadMore && showMore && (
        <div className="content-container">
          {children}
          <button
            type="button"
            onClick={() => changeRender("Less")}
            className="read-more-text standardized-button"
          >
            Show Less
          </button>
        </div>
      )}
    </ReadMoreWrapper>
  );
};

const ReadMoreWrapper = styled.div`
  .read-more-text {
    max-width: 12rem;
    margin: 1rem auto;
  }

  .content-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`;

export default ReadMoreButton;
