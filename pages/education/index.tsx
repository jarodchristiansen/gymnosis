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
    title: "Client tracking that actually works",
    summary:
      "Every client's full history in one place. No more handwritten notes, no more digging through spreadsheets before a session.",
    bullets: [
      "Intake questionnaires with health history, goals, and preferences",
      "Session-by-session workout logs with notes and progression metrics",
      "Progress photos, measurements, and milestone tracking",
      "Shareable progress reports for client check-ins",
    ],
  },
  {
    label: "02",
    title: "AI-assisted planning, with you in control",
    summary:
      "Generate a complete, personalized workout and meal plan from a client questionnaire in minutes. You review and approve every detail before it reaches the client.",
    bullets: [
      "AI drafts plans from intake data: goals, fitness level, schedule, and restrictions",
      "Full edit access before anything is shared with the client",
      "Your approval required at every step. The AI accelerates your work, not replaces it",
      "Plan versioning so you can iterate and track what changed",
    ],
  },
  {
    label: "03",
    title: "Business management for gym owners",
    summary:
      "Class scheduling, trainer assignments, membership tracking, and analytics — without juggling four separate tools.",
    bullets: [
      "Class calendar with trainer assignments and capacity limits",
      "Membership management: active, lapsed, and trial clients at a glance",
      "Business analytics showing revenue trends, class fill rates, and trainer performance",
      "Role-based access: admins see everything, trainers see their clients only",
    ],
  },
];

export default function EducationPage() {
  return (
    <PageWrapper>
      <SEOHead
        metaTitle="Features — Gymnosis"
        metaDescription="A complete look at how Gymnosis helps professional trainers manage clients, build plans, and grow their business."
      />

      {/* Hero */}
      <PageHero>
        <FadeUp>
          <HeroInner>
            <HeroEyebrow>Features</HeroEyebrow>
            <HeroTitle>Built for the way trainers work</HeroTitle>
            <HeroSubtitle>
              Gymnosis combines client tracking, AI-assisted planning, and
              business management into a single platform. Here is what each part
              does.
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
            <DocsLabel>Documentation</DocsLabel>
            <DocsTitle>Full docs are on their way.</DocsTitle>
            <DocsBody>
              We are building out reference documentation for every feature.
              Until then, if you have a question about how something works,
              reach out directly.
            </DocsBody>
            <DocsLink href="mailto:hello@gymnosis.app">
              hello@gymnosis.app
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
  margin-bottom: 28px;
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
