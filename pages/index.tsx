import DemoLauncher from "@/components/demo/DemoLauncher";
import PlanSheetPreview from "@/components/landing/PlanSheetPreview";
import SEOHead from "@/components/seo/SEOHead";
import { ButtonLink, DisplayHeading, Eyebrow, Sheet } from "@/components/ui";
import { Colors, FontFamily, MediaQueries } from "@/styles/variables";
import styled from "styled-components";

const STEPS = [
  {
    n: "01",
    title: "Draft",
    body: "A short questionnaire becomes a 7-day draft. The server builds the prompt from validated answers, asks the model for schema-shaped JSON, and checks the reply. The safety rules run before anyone sees it.",
    recorded: "The model and prompt version that wrote it",
  },
  {
    n: "02",
    title: "Review",
    body: "The trainer edits anything: days, exercises, sets, reps. Each blocking flag has to be fixed, or kept with a note saying why it's safe for this client.",
    recorded: "Every edit as a readable diff, every flag kept and why",
  },
  {
    n: "03",
    title: "Approve and send",
    body: "Approval is the trainer's sign-off. The client sees the plan only once it's sent, and never sees the draft, the flags, or the notes.",
    recorded: "Who approved it, who sent it, and when",
  },
];

const RULES = [
  {
    rule: "Equipment",
    example: "Barbell back squat, for a client training with bodyweight only",
    effect: "block",
  },
  {
    rule: "Knee injury",
    example: "Box jumps; deep lunges are worth a second look",
    effect: "block",
  },
  {
    rule: "Lower back",
    example: "Deadlifts and other heavy spinal loading",
    effect: "block",
  },
  {
    rule: "Shoulder",
    example: "Overhead pressing, snatches, handstands",
    effect: "block",
  },
  {
    rule: "Beginners",
    example:
      "Olympic lifts like cleans and snatches; high volume is worth a second look",
    effect: "block",
  },
  {
    rule: "Schedule",
    example: "Five training days drafted when the client asked for three",
    effect: "warn",
  },
];

const ROLES = [
  {
    role: "Trainer",
    sees: "Their own clients and every plan for them, flags, notes, and history included.",
  },
  {
    role: "Owner",
    sees: "The whole gym: every trainer, every client, every plan.",
  },
  {
    role: "Client",
    sees: "Only the plans their trainer has sent. Nothing in draft, ever.",
  },
];

export default function Home() {
  return (
    <>
      <SEOHead
        isHomePage
        metaTitle="Gymnosis: AI drafts the plan, a trainer signs it off"
        metaDescription="Workout plans drafted by AI, checked against the client's injuries, equipment, and experience, and approved by a trainer before the client sees them."
        previewImage="/assets/gymnosis.png"
      />

      <Hero>
        <HeroText>
          <Eyebrow>AI-assisted · human-verified</Eyebrow>
          <Title>
            AI drafts the plan.
            <br />A trainer signs it off.
          </Title>
          <Lede>
            Gymnosis drafts a week of training from a client questionnaire,
            checks it against their injuries, equipment, and experience, and
            holds it until a trainer approves it.
          </Lede>
          <Actions>
            <ButtonLink href="#demo">Try the demo</ButtonLink>
            <ButtonLink href="#review" variant="secondary">
              How review works
            </ButtonLink>
          </Actions>
          <Footnote>
            A portfolio project: working software, made-up data. No gyms use it
            yet.
          </Footnote>
        </HeroText>
        <PlanSheetPreview />
      </Hero>

      <Section id="review" aria-labelledby="review-heading">
        <SectionHead>
          <Eyebrow>The review</Eyebrow>
          <SectionTitle id="review-heading">
            Nothing reaches a client unchecked
          </SectionTitle>
        </SectionHead>
        <Steps>
          {STEPS.map((step) => (
            <Step key={step.n}>
              <span className="n" aria-hidden="true">
                {step.n}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <p className="recorded">
                <span>Recorded</span>
                {step.recorded}
              </p>
            </Step>
          ))}
        </Steps>
      </Section>

      <Section aria-labelledby="rules-heading">
        <SectionHead>
          <Eyebrow>Safety rules</Eyebrow>
          <SectionTitle id="rules-heading">
            What gets flagged before a trainer sees it
          </SectionTitle>
          <SectionLede>
            The rules read exercise names against the client&apos;s answers.
            They&apos;re simple and deterministic, so the trainer knows exactly
            why something was flagged. They support the trainer&apos;s
            judgement; they don&apos;t replace it.
          </SectionLede>
        </SectionHead>
        <RuleList>
          {RULES.map((r) => (
            <li key={r.rule}>
              <span className="rule">{r.rule}</span>
              <span className="example">{r.example}</span>
              <span className={`effect ${r.effect}`}>
                {r.effect === "block" ? "Blocks approval" : "Worth a look"}
              </span>
            </li>
          ))}
        </RuleList>
      </Section>

      <Section aria-labelledby="roles-heading">
        <SectionHead>
          <Eyebrow>Who sees what</Eyebrow>
          <SectionTitle id="roles-heading">
            Enforced by the API, not just the menus
          </SectionTitle>
        </SectionHead>
        <Roles>
          {ROLES.map((r) => (
            <RoleCard key={r.role}>
              <h3>{r.role}</h3>
              <p>{r.sees}</p>
            </RoleCard>
          ))}
        </Roles>
      </Section>

      <DemoSection id="demo" aria-labelledby="demo-heading">
        <SectionHead>
          <Eyebrow>Try it</Eyebrow>
          <SectionTitle id="demo-heading">
            Step into a demo gym. <Nowrap>No sign-up.</Nowrap>
          </SectionTitle>
          <SectionLede>
            Review Riley&apos;s flagged draft as their trainer, see the plan
            Marcus was sent as a client, or look across the whole gym as its
            owner. You can also draft a real plan for a client who has none.
          </SectionLede>
        </SectionHead>
        <DemoLauncher />
      </DemoSection>
    </>
  );
}

const Hero = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px 64px;
  display: grid;
  gap: 48px;
  align-items: center;

  @media ${MediaQueries.LG} {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    gap: 64px;
    padding: 72px 24px 96px;
  }
`;

const HeroText = styled.div`
  max-width: 600px;
`;

const Title = styled(DisplayHeading)`
  font-size: clamp(46px, 10.5vw, 92px);
`;

const Lede = styled.p`
  margin: 20px 0 0;
  max-width: 34em;
  font-size: 18px;
  line-height: 1.6;
  color: ${Colors.lightGray};

  @media ${MediaQueries.MD} {
    font-size: 19px;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
`;

const Footnote = styled.p`
  margin: 18px 0 0;
  font-size: 14px;
  color: ${Colors.midGray};
`;

const Section = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 16px;
  border-top: 1px solid ${Colors.rule};
  scroll-margin-top: 72px;

  @media ${MediaQueries.MD} {
    padding: 88px 24px;
  }
`;

const SectionHead = styled.div`
  max-width: 720px;
  margin-bottom: 36px;
`;

const SectionTitle = styled(DisplayHeading).attrs({ as: "h2" })`
  font-size: clamp(34px, 6vw, 56px);
`;

const SectionLede = styled.p`
  margin: 16px 0 0;
  font-size: 17px;
  line-height: 1.65;
  color: ${Colors.midGray};
`;

const Steps = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 16px;

  @media ${MediaQueries.LG} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Step = styled.li`
  position: relative;
  padding: 24px 22px;
  background: ${Colors.surface};
  border: 1px solid ${Colors.rule};
  border-radius: 8px;

  .n {
    display: block;
    font-family: ${FontFamily.display};
    font-size: 44px;
    font-weight: 700;
    line-height: 1;
    color: ${Colors.brand.accent};
  }

  h3 {
    margin: 10px 0 8px;
    font-family: ${FontFamily.display};
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  p {
    margin: 0;
    font-size: 15px;
    line-height: 1.65;
    color: ${Colors.lightGray};
  }

  .recorded {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px dashed rgba(242, 238, 232, 0.18);
    color: ${Colors.midGray};
  }

  .recorded span {
    display: block;
    font-family: ${FontFamily.display};
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${Colors.brand.accentLight};
  }
`;

const RuleList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 2px solid rgba(242, 238, 232, 0.16);

  li {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "rule effect"
      "example example";
    gap: 4px 16px;
    padding: 16px 0;
    border-bottom: 1px solid ${Colors.rule};
  }

  .rule {
    grid-area: rule;
    font-family: ${FontFamily.display};
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .example {
    grid-area: example;
    color: ${Colors.midGray};
  }

  .effect {
    grid-area: effect;
    align-self: center;
    font-size: 13px;
    font-weight: 650;
    white-space: nowrap;
  }

  .effect.block {
    color: ${Colors.flag.block};
  }

  .effect.warn {
    color: ${Colors.flag.warn};
  }

  @media ${MediaQueries.MD} {
    li {
      grid-template-columns: 200px 1fr auto;
      grid-template-areas: "rule example effect";
      align-items: baseline;
    }
  }
`;

const Roles = styled.div`
  display: grid;
  gap: 16px;

  @media ${MediaQueries.MD} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const RoleCard = styled(Sheet)`
  padding: 22px;

  h3 {
    margin: 0 0 6px;
    font-family: ${FontFamily.display};
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  p {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    color: ${Colors.lightGray};
  }
`;

const Nowrap = styled.span`
  white-space: nowrap;
`;

const DemoSection = styled(Section)`
  padding-bottom: 96px;
`;
