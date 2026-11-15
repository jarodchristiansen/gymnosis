import {
  Colors,
  FontFamily,
  FontWeight,
  MediaQueries,
  Padding,
} from "@/styles/variables";
import LandingCard from "components/commons/info-cards/landing-card";
import CTACard from "components/ctas/CTACard";
import { motion } from "framer-motion";
import type { GetServerSideProps } from "next";
import Image from "next/image";
import styled from "styled-components";

import SEOHead from "../components/seo/SEOHead";

const FadeUp = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

const ScaleUp = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.55, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const cardContent = [
  {
    image: "/landing/avatar-icon.svg",
    alt: "Client profile and tracking icon",
    title: "Stop losing track of clients",
    text: "Every client's saved plans in one place, newest first, so you're not digging through notes or spreadsheets before a session.",
  },
  {
    image: "/landing/connected-icon.svg",
    alt: "AI planning and connections icon",
    title: "Build better plans, faster",
    text: "Fill in a short client questionnaire and get a structured 7-day workout draft. You edit it and save it; nothing reaches the client until you do.",
  },
  {
    image: "/landing/growth-chart-icon.svg",
    alt: "Roles and access icon",
    title: "A view for everyone in the gym",
    text: "Admins see every account, trainers see clients, and clients see only their own plans. The API enforces it, not just the menus.",
  },
];

const features = [
  {
    icon: "/landing/metrics.svg",
    title: "AI writes the first draft. You make it perfect.",
    description:
      "The draft follows the client's goal, activity level, and training days. You swap exercises, adjust sets and reps, and decide what gets saved.",
  },
  {
    icon: "/landing/security.svg",
    title: "Client data, scoped by role.",
    description:
      "Every request is checked against who's signed in. Trainers can read and write plans for clients, and clients can read only their own.",
  },
  {
    icon: "/landing/ui.svg",
    title: "Plans you can actually edit.",
    description:
      "The draft opens in an editor, not a wall of text. Change anything, then save it to the client's history in one step.",
  },
];

const howItWorksSteps = [
  {
    n: "01",
    title: "Clients sign up",
    body: "Clients create an account with Google or GitHub, and appear in the client list.",
  },
  {
    n: "02",
    title: "Generate a plan",
    body: "Answer a few questions about the client, and AI drafts a 7-day workout plan, structured and ready for your review.",
  },
  {
    n: "03",
    title: "Review and deliver",
    body: "Edit the draft and save it. The client sees the plan you saved, never the raw draft.",
  },
];

export default function Home() {
  return (
    <AlternateHomePageWrapper>
      <SEOHead
        isHomePage={true}
        metaTitle="Gymnosis — Gym Management Software for Professional Trainers"
        metaDescription="AI-assisted workout planning for personal trainers: the AI drafts a plan from a client questionnaire, and a trainer edits and saves it before the client sees it."
        previewImage="/assets/gymnosis.png"
      />

      {/* Hero */}
      <div className="top-row">
        <div className="left-card">
          <FadeUp>
            <LandingCard
              headerText="Run a smarter gym."
              bodyText="AI drafts the workout plan. A trainer edits and approves it before the client sees it."
              renderSignIn={false}
              renderLearnMore={true}
              renderGetStarted={true}
            />
          </FadeUp>
        </div>

        <FadeUp delay={0.1}>
          <Image
            src="/assets/gymnosis.png"
            width={600}
            height={400}
            alt="Gymnosis client dashboard showing a client's workout plans"
            priority
            className="hero-image"
          />
        </FadeUp>
      </div>

      {/* Social proof strip */}
      <FadeUp>
        <SocialProofRow>
          <TrustStatement>
            <span className="trust-headline">
              Trainers stay in charge of every plan.
            </span>
            <span className="trust-subline">
              AI drafts never go straight to a client. Only trainers and admins
              can save a plan to a client&apos;s record.
            </span>
          </TrustStatement>
          <StatsRow>
            <StatItem>
              <span className="stat-value">3</span>
              <span className="stat-label">roles, each with its own view</span>
            </StatItem>
            <StatItem>
              <span className="stat-value">7-day</span>
              <span className="stat-label">
                plans drafted from a questionnaire
              </span>
            </StatItem>
            <StatItem>
              <span className="stat-value">Every</span>
              <span className="stat-label">
                plan saved by a trainer, not the AI
              </span>
            </StatItem>
          </StatsRow>
        </SocialProofRow>
      </FadeUp>

      {/* Feature cards */}
      <Row>
        <FadeUp>
          <h3>Built to solve real trainer problems</h3>
        </FadeUp>
        <div className="site-description-container">
          {cardContent.map((card, i) => (
            <FadeUp key={card.title} delay={i * 0.1}>
              <div className="card">
                <div className="card-content">
                  {card.image ? (
                    <div className="card-background">
                      <Image
                        src={card.image}
                        height={36}
                        width={36}
                        alt={card.alt}
                      />
                    </div>
                  ) : null}
                  <h4>{card.title}</h4>
                  <div>{card.text}</div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </Row>

      {/* How it works */}
      <HowItWorksSection>
        <FadeUp>
          <h3>How it works</h3>
        </FadeUp>
        <div className="steps-row">
          {howItWorksSteps.map((step, i) => (
            <FadeUp key={step.n} delay={i * 0.12}>
              <StepCard>
                <span className="step-number-bg">{step.n}</span>
                <div className="step-content">
                  <span className="step-label">{step.n}</span>
                  <h4>{step.title}</h4>
                  <p>{step.body}</p>
                </div>
              </StepCard>
            </FadeUp>
          ))}
        </div>
      </HowItWorksSection>

      {/* Key features strip */}
      <FeaturesStrip aria-label="Key features">
        <FadeUp>
          <FeaturesHeading>
            Everything you need, nothing you don&apos;t
          </FeaturesHeading>
        </FadeUp>
        <FeaturesGrid>
          {features.map((feature) => (
            <FeatureItem key={feature.title}>
              <Image src={feature.icon} width={44} height={44} alt="" />
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </FeatureItem>
          ))}
        </FeaturesGrid>
      </FeaturesStrip>

      {/* CTA */}
      <ScaleUp>
        <CTACard />
      </ScaleUp>
    </AlternateHomePageWrapper>
  );
}

// ─── Styled components ────────────────────────────────────────────────────────

const AlternateHomePageWrapper = styled.div`
  .top-row {
    display: flex;
    flex-direction: column;
    gap: 48px;
    padding: ${Padding.xxlarge} 24px 64px;
    align-items: center;
    background-color: ${Colors.midnight};

    .hero-image {
      width: 100%;
      align-self: center;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0px 8px 40px rgba(0, 0, 0, 0.5),
        0 0 80px rgba(255, 107, 43, 0.07);
      aspect-ratio: 16/9;
      object-fit: cover;
    }

    @media ${MediaQueries.MD} {
      flex-direction: row;
      justify-content: space-between;
      gap: 64px;
      padding: 80px 64px;

      .hero-image {
        width: 52%;
        flex-shrink: 0;
      }
    }
  }
`;

const SocialProofRow = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 48px 24px;
  background-color: ${Colors.richBlack};
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  @media ${MediaQueries.MD} {
    flex-direction: row;
    justify-content: space-between;
    padding: 48px 80px;
    gap: 64px;
  }
`;

const TrustStatement = styled.div`
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .trust-headline {
    font-family: ${FontFamily.display};
    font-size: 22px;
    font-weight: 700;
    color: ${Colors.brand.white};
    line-height: 1.3;
    letter-spacing: -0.2px;
  }

  .trust-subline {
    font-size: 15px;
    line-height: 1.65;
    color: ${Colors.midGray};
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  justify-content: center;

  @media ${MediaQueries.MD} {
    flex-wrap: nowrap;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 110px;

  .stat-value {
    font-family: ${FontFamily.display};
    font-size: 28px;
    font-weight: 700;
    color: ${Colors.brand.accent};
    text-align: center;
    line-height: 1;
  }

  .stat-label {
    font-size: 12px;
    color: ${Colors.midGray};
    text-align: center;
    line-height: 1.4;
    max-width: 100px;
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.richBlack};
  gap: 32px;
  padding: 64px 24px;

  h3 {
    text-align: center;
    font-family: ${FontFamily.display};
    font-size: 32px;
    font-weight: 700;
    color: ${Colors.brand.white};
    margin-bottom: 0;
  }

  .site-description-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    grid-gap: 24px;

    .card {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: 32px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      text-align: center;
      border-top: 3px solid ${Colors.brand.accent};
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      transition: background 0.2s ease;
      height: 100%;

      &:hover {
        background: rgba(255, 107, 43, 0.04);
      }

      h4 {
        font-weight: ${FontWeight.bold};
        font-size: 17px;
        color: ${Colors.brand.white};
        padding: 0 0 4px 0;
      }

      div {
        font-size: 15px;
        line-height: 1.7;
        color: ${Colors.midGray};
      }

      .card-background {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: rgba(255, 107, 43, 0.1);
        border: 1px solid rgba(255, 107, 43, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 8px;
      }
    }
  }

  @media ${MediaQueries.MD} {
    padding: 80px;
  }
`;

const HowItWorksSection = styled.section`
  padding: 64px 24px;
  background-color: ${Colors.surface};
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  h3 {
    text-align: center;
    font-family: ${FontFamily.display};
    font-size: 32px;
    font-weight: 700;
    color: ${Colors.brand.white};
    margin-bottom: 48px;
  }

  .steps-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    max-width: 960px;
    margin: 0 auto;

    @media ${MediaQueries.MD} {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media ${MediaQueries.MD} {
    padding: 80px;
  }
`;

const StepCard = styled.div`
  position: relative;
  padding: 32px 28px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 3px solid ${Colors.brand.accent};
  border-left: 1px solid rgba(255, 255, 255, 0.07);
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  overflow: hidden;
  height: 100%;

  .step-number-bg {
    position: absolute;
    top: -12px;
    right: 16px;
    font-family: ${FontFamily.display};
    font-size: 80px;
    font-weight: 800;
    color: white;
    opacity: 0.05;
    line-height: 1;
    pointer-events: none;
    user-select: none;
  }

  .step-content {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .step-label {
    font-family: ${FontFamily.display};
    font-size: 13px;
    font-weight: 700;
    color: ${Colors.brand.accent};
    letter-spacing: 1.5px;
  }

  h4 {
    font-size: 18px;
    font-weight: 700;
    color: ${Colors.brand.white};
    line-height: 1.3;
  }

  p {
    font-size: 14px;
    color: ${Colors.midGray};
    line-height: 1.75;
  }
`;

const FeaturesStrip = styled.section`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.midnight};
  padding: 64px 24px;
  gap: 40px;

  @media ${MediaQueries.MD} {
    padding: 72px 80px;
    gap: 48px;
  }
`;

const FeaturesHeading = styled.h3`
  text-align: center;
  font-family: ${FontFamily.display};
  font-size: 32px;
  font-weight: 700;
  color: ${Colors.brand.white};
  margin: 0;
`;

const FeaturesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;

  @media ${MediaQueries.MD} {
    flex-direction: row;
  }
`;

const FeatureItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  h4 {
    font-size: 17px;
    font-weight: 700;
    color: ${Colors.brand.white};
    line-height: 1.35;
  }

  p {
    font-size: 14px;
    color: ${Colors.midGray};
    line-height: 1.75;
  }

  @media ${MediaQueries.MD} {
    flex: 1;
    border-bottom: none;
    border-right: 1px solid rgba(255, 255, 255, 0.06);

    &:last-child {
      border-right: none;
    }
  }
`;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
