import { Colors, FontFamily, MediaQueries, Padding } from "@/styles/variables";
import { motion } from "framer-motion";
import { GetServerSideProps } from "next";
import Link from "next/link";
import styled from "styled-components";

import SEOHead from "../../components/seo/SEOHead";

const FadeUp = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

const features = [
  {
    label: "01",
    title: "AI drafts, checked before you see them",
    summary:
      "Answer a short questionnaire about the client and get a structured 7-day workout draft, already checked against safety rules.",
    bullets: [
      "Drafts from the client's goal, body stats, training days, experience, equipment, and injuries",
      "The server builds the prompt and checks the reply; an unusable reply becomes a draft for you to write by hand",
      "Safety rules flag equipment the client doesn't have, movements their injuries rule out, and too much volume for a beginner",
      "Each plan records the model and prompt version that drafted it",
    ],
  },
  {
    label: "02",
    title: "Review, approve, send",
    summary:
      "Every plan moves from draft to approved to sent, and the client only ever sees plans that were sent.",
    bullets: [
      "Edit any part of a draft: days, focus, exercises, sets, and reps",
      "A blocking safety flag has to be fixed, or kept with a note saying why it's safe",
      "Approving is the trainer's recorded sign-off; reopening an approved plan needs a reason",
      "A history on every plan: who changed what, when, and why",
    ],
  },
  {
    label: "03",
    title: "Roles and access",
    summary:
      "Owners, trainers, and clients each see a different app, and the API checks every request against who is signed in.",
    bullets: [
      "Owners see their whole gym: every trainer's clients and plans",
      "Trainers see and write plans for their own clients",
      "Clients see only the plans they were sent",
      "Try each role in a private demo gym, no sign-up",
    ],
  },
];

const roadmap = [
  "Inviting clients and assigning them to trainers (today the demo gym comes set up)",
  "Progress tracking: logging sessions against a plan",
  "Class scheduling, memberships, and owner analytics",
  "Meal plans",
];

export default function EducationPage() {
  return (
    <PageWrapper>
      <SEOHead
        metaTitle="Features — Gymnosis"
        metaDescription="What Gymnosis does today: AI-drafted workouts checked against safety rules, a review that ends in a trainer's sign-off, and role-based access."
      />

      {/* Hero */}
      <PageHero>
        <FadeUp>
          <HeroInner>
            <HeroEyebrow>Features</HeroEyebrow>
            <HeroTitle>Built for the way trainers work</HeroTitle>
            <HeroSubtitle>
              Gymnosis pairs AI-drafted workout plans with a trainer who edits
              and approves them. Here is what works today, and what comes next.
            </HeroSubtitle>
          </HeroInner>
        </FadeUp>
      </PageHero>

      {/* Feature deep-dives */}
      <FeaturesSection>
        {features.map((feature, i) => (
          <FadeUp key={feature.label} delay={i * 0.08}>
            <FeatureBlock>
              <FeatureLabel>{feature.label}</FeatureLabel>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureSummary>{feature.summary}</FeatureSummary>
              <BulletList>
                {feature.bullets.map((bullet) => (
                  <BulletItem key={bullet}>
                    <BulletDot />
                    <span>{bullet}</span>
                  </BulletItem>
                ))}
              </BulletList>
            </FeatureBlock>
          </FadeUp>
        ))}
      </FeaturesSection>

      {/* Documentation stub */}
      <DocsSection>
        <FadeUp>
          <DocsInner>
            <DocsLabel>Roadmap</DocsLabel>
            <DocsTitle>Not built yet</DocsTitle>
            <DocsBody as="ul">
              {roadmap.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </DocsBody>
            <DocsLink href="https://github.com/jarodchristiansen/gymnosis">
              Follow along on GitHub
            </DocsLink>
          </DocsInner>
        </FadeUp>
      </DocsSection>
    </PageWrapper>
  );
}

// ─── Styled components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  background-color: ${Colors.richBlack};
  min-height: 100vh;
`;

const PageHero = styled.section`
  background-color: ${Colors.midnight};
  padding: calc(64px + ${Padding.xxlarge}) 24px ${Padding.xxlarge};
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  @media ${MediaQueries.MD} {
    padding: calc(64px + 64px) 80px 72px;
  }
`;

const HeroInner = styled.div`
  max-width: 700px;
`;

const HeroEyebrow = styled.span`
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${Colors.brand.accent};
  margin-bottom: 16px;
`;

const HeroTitle = styled.h1`
  font-family: ${FontFamily.display};
  font-size: 48px;
  font-weight: 800;
  color: ${Colors.brand.white};
  line-height: 1.08;
  letter-spacing: -0.5px;
  margin-bottom: 20px;

  @media ${MediaQueries.MD} {
    font-size: 56px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 17px;
  line-height: 1.65;
  color: ${Colors.midGray};
  max-width: 560px;
`;

const FeaturesSection = styled.section`
  padding: 72px 24px;
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 860px;
  margin: 0 auto;

  @media ${MediaQueries.MD} {
    padding: 80px 40px;
  }
`;

const FeatureBlock = styled.div`
  padding: 48px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);

  &:last-child {
    border-bottom: none;
  }
`;

const FeatureLabel = styled.span`
  font-family: ${FontFamily.display};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  color: ${Colors.brand.accent};
  text-transform: uppercase;
  display: block;
  margin-bottom: 12px;
`;

const FeatureTitle = styled.h2`
  font-family: ${FontFamily.display};
  font-size: 32px;
  font-weight: 700;
  color: ${Colors.brand.white};
  line-height: 1.15;
  margin-bottom: 16px;

  @media ${MediaQueries.MD} {
    font-size: 36px;
  }
`;

const FeatureSummary = styled.p`
  font-size: 16px;
  line-height: 1.7;
  color: ${Colors.midGray};
  margin-bottom: 28px;
  max-width: 640px;
`;

const BulletList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BulletItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 15px;
  color: ${Colors.brand.white};
  line-height: 1.55;
  opacity: 0.88;
`;

const BulletDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${Colors.brand.accent};
  flex-shrink: 0;
  margin-top: 8px;
`;

const DocsSection = styled.section`
  background-color: ${Colors.surface};
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 72px 24px;

  @media ${MediaQueries.MD} {
    padding: 80px;
  }
`;

const DocsInner = styled.div`
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
`;

const DocsLabel = styled.span`
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${Colors.brand.accent};
  margin-bottom: 16px;
`;

const DocsTitle = styled.h2`
  font-family: ${FontFamily.display};
  font-size: 32px;
  font-weight: 700;
  color: ${Colors.brand.white};
  margin-bottom: 16px;
`;

const DocsBody = styled.p`
  font-size: 15px;
  line-height: 1.7;
  color: ${Colors.midGray};
  margin: 0 0 28px;
  padding: 0;
  list-style: none;

  li + li {
    margin-top: 6px;
  }
`;

const DocsLink = styled(Link)`
  display: inline-block;
  font-size: 15px;
  font-weight: 600;
  color: ${Colors.brand.accent};
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 107, 43, 0.4);
  padding-bottom: 2px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${Colors.brand.accent};
  }
`;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
