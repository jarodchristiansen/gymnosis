import { Colors, MediaQueries } from "@/styles/variables";
import Link from "next/link";
import { useRouter } from "next/router";
import styled from "styled-components";

interface LandingCardProps {
  headerText: string;
  header2Text?: string;
  bodyText: string;
  renderSignIn: boolean;
  renderLearnMore?: boolean;
}

const LandingCard = ({
  headerText,
  header2Text = "",
  bodyText,
  renderSignIn = false,
  renderLearnMore = false,
}: LandingCardProps) => {
  const router = useRouter();

  const routeToAuth = (path: string) => {
    router.push(`/auth?path=${path}`);
  };

  return (
    <InfoCardContainer renderSignIn={renderSignIn}>
      <div className="info-card-header">
        <h2 className="heading-text">{headerText}</h2>
        {header2Text ? (
          <h2 className="subheading-text">{header2Text}</h2>
        ) : null}
      </div>

      <div className="info-card-body">
        <span className="body-text">{bodyText}</span>
      </div>

      {!!renderLearnMore && (
        <div className="learn-more-container">
          <LearnMoreLink href="/education">Learn more</LearnMoreLink>
        </div>
      )}

      {!!renderSignIn && (
        <div className="button-container">
          <button
            className="secondary-button"
            onClick={() => routeToAuth("SignUp")}
          >
            Sign Up
          </button>
          <button
            className="standardized-button"
            onClick={() => routeToAuth("SignIn")}
          >
            Sign In
          </button>
        </div>
      )}
    </InfoCardContainer>
  );
};

interface InfoCardContainerProps {
  renderSignIn: boolean;
}

const InfoCardContainer = styled.div<InfoCardContainerProps>`
  animation: "fade-in";
  padding: 2rem 0;
  padding: 0 2rem;
  min-width: 18rem;
  position: relative;

  .info-card-header {
    text-align: center;
    color: ${Colors.elegant.white};

    .heading-text {
      font-size: 48px;
      padding-bottom: 1rem;
    }
  }

  .info-card-body {
    text-align: center;
    padding: 1rem 0;

    span {
      font-size: 20px;
      color: ${Colors.elegant.white};
      font-style: ${(props) => (props.renderSignIn ? "normal" : "italic")};
    }
  }

  .learn-more-container {
    text-align: center;
    padding: 0.25rem 0 0.75rem;
  }

  .button-container {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 1rem 0;
  }

  @media ${MediaQueries.LG} {
    padding: 2rem 2rem;
  }
`;

const LearnMoreLink = styled(Link)`
  color: ${Colors.elegant.white};
  font-size: 18px;
  font-weight: 600;
  text-decoration: underline;

  &:hover {
    color: ${Colors.elegant.white};
    opacity: 0.9;
  }
`;

export default LandingCard;
