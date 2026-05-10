import { Colors, FontFamily, MediaQueries } from "@/styles/variables";
import Link from "next/link";
import { useRouter } from "next/router";
import styled from "styled-components";

interface LandingCardProps {
  headerText: string;
  header2Text?: string;
  bodyText: string;
  renderSignIn: boolean;
  renderLearnMore?: boolean;
  renderGetStarted?: boolean;
}

const LandingCard = ({
  headerText,
  header2Text = "",
  bodyText,
  renderSignIn = false,
  renderLearnMore = false,
  renderGetStarted = false,
}: LandingCardProps) => {
  const router = useRouter();

  const routeToAuth = (path: string) => {
    router.push(`/auth?path=${path}`);
  };

  return (
    <InfoCardContainer renderSignIn={renderSignIn}>
      <div className="info-card-header">
        <AccentBadge>AI-assisted · Human-verified</AccentBadge>
        <h2 className="heading-text">{headerText}</h2>
        {header2Text ? (
          <h2 className="subheading-text">{header2Text}</h2>
        ) : null}
      </div>

      <div className="info-card-body">
        <span className="body-text">{bodyText}</span>
      </div>

      {!!renderGetStarted && (
        <div className="hero-cta-container">
          <GetStartedButton onClick={() => routeToAuth("SignUp")}>
            Get Started Free
          </GetStartedButton>
          {!!renderLearnMore && (
            <LearnMoreLink href="/education">Learn more →</LearnMoreLink>
          )}
        </div>
      )}

      {!renderGetStarted && !!renderLearnMore && (
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

const AccentBadge = styled.span`
  display: inline-block;
  background: rgba(255, 107, 43, 0.14);
  color: ${Colors.brand.accent};
  border: 1px solid rgba(255, 107, 43, 0.3);
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 4px 14px;
  margin-bottom: 20px;
`;

const InfoCardContainer = styled.div<InfoCardContainerProps>`
  padding: 0 2rem;
  min-width: 18rem;
  position: relative;

  .info-card-header {
    text-align: center;
    color: ${Colors.brand.white};

    .heading-text {
      font-family: ${FontFamily.display};
      font-size: 56px;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.05;
      padding-bottom: 0.75rem;
    }
  }

  .info-card-body {
    text-align: center;
    padding: 0.75rem 0;

    span {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.78);
      line-height: 1.6;
    }
  }

  .hero-cta-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 1.5rem 0 0.5rem;
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

    .info-card-header {
      text-align: left;
    }

    .info-card-body {
      text-align: left;
    }

    .hero-cta-container {
      align-items: flex-start;
    }

    .learn-more-container {
      text-align: left;
    }
  }
`;

const GetStartedButton = styled.button`
  background-color: ${Colors.brand.accent};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px 36px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease,
    box-shadow 0.2s ease;
  letter-spacing: 0.2px;
  box-shadow: 0 0 24px rgba(255, 107, 43, 0.35);

  &:hover {
    background-color: ${Colors.brand.accentHover};
    transform: translateY(-1px);
    box-shadow: 0 0 36px rgba(255, 107, 43, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LearnMoreLink = styled(Link)`
  color: ${Colors.brand.white};
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  opacity: 0.65;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

export default LandingCard;
