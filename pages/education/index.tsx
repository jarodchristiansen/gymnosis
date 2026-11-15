import SEOHead from "@/components/seo/SEOHead";
import { ButtonLink, DisplayHeading, Eyebrow } from "@/components/ui";
import { Colors, FontFamily, MediaQueries } from "@/styles/variables";
import styled from "styled-components";

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
      "Each plan records the model and prompt version that drafted it, and an eval harness scores each prompt version against ten fixture questionnaires",
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

export default function FeaturesPage() {
  return (
    <Page>
      <SEOHead
        metaTitle="Features — Gymnosis"
        metaDescription="What Gymnosis does today: AI-drafted workouts checked against safety rules, a review that ends in a trainer's sign-off, and role-based access."
      />

      <Header>
        <Eyebrow>Features</Eyebrow>
        <Title>What works today</Title>
        <Lede>
          Gymnosis pairs AI-drafted workout plans with a trainer who edits and
          approves them. Here is what it does now, and what it doesn&apos;t yet.
        </Lede>
      </Header>

      <Features>
        {features.map((f) => (
          <Feature key={f.label} aria-labelledby={`feature-${f.label}`}>
            <span className="n" aria-hidden="true">
              {f.label}
            </span>
            <div>
              <h2 id={`feature-${f.label}`}>{f.title}</h2>
              <p className="summary">{f.summary}</p>
              <ul>
                {f.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </Feature>
        ))}
      </Features>

      <Roadmap aria-labelledby="roadmap-heading">
        <Eyebrow tone="muted">Roadmap</Eyebrow>
        <h2 id="roadmap-heading">Not built yet</h2>
        <ul>
          {roadmap.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Actions>
          <ButtonLink href="/#demo">Try the demo</ButtonLink>
          <ButtonLink
            variant="secondary"
            href="https://github.com/jarodchristiansen/gymnosis"
          >
            Source on GitHub
          </ButtonLink>
        </Actions>
      </Roadmap>
    </Page>
  );
}

const Page = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 16px 80px;

  @media ${MediaQueries.MD} {
    padding: 64px 24px 112px;
  }
`;

const Header = styled.header`
  margin-bottom: 40px;
`;

const Title = styled(DisplayHeading)`
  font-size: clamp(46px, 9vw, 80px);
`;

const Lede = styled.p`
  max-width: 36em;
  margin: 16px 0 0;
  font-size: 18px;
  line-height: 1.6;
  color: ${Colors.lightGray};
`;

const Features = styled.div`
  border-top: 2px solid rgba(242, 238, 232, 0.16);
`;

const Feature = styled.section`
  display: grid;
  gap: 8px 24px;
  padding: 32px 0;
  border-bottom: 1px solid ${Colors.rule};

  @media ${MediaQueries.MD} {
    grid-template-columns: 96px minmax(0, 1fr);
  }

  .n {
    font-family: ${FontFamily.display};
    font-size: 48px;
    font-weight: 700;
    line-height: 1;
    color: ${Colors.brand.accent};
  }

  h2 {
    margin: 0;
    font-family: ${FontFamily.display};
    font-size: clamp(28px, 4vw, 36px);
    font-weight: 700;
    letter-spacing: 0.01em;
    line-height: 1.05;
    text-transform: uppercase;
  }

  .summary {
    margin: 10px 0 14px;
    font-size: 17px;
    color: ${Colors.lightGray};
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    position: relative;
    padding: 8px 0 8px 22px;
    border-top: 1px solid ${Colors.rule};
    color: ${Colors.midGray};
  }

  li::before {
    content: "";
    position: absolute;
    left: 2px;
    top: 18px;
    width: 8px;
    height: 2px;
    background: ${Colors.brand.accent};
  }
`;

const Roadmap = styled.section`
  margin-top: 48px;
  padding: 24px 20px;
  border: 1px dashed rgba(242, 238, 232, 0.24);
  border-radius: 8px;

  @media ${MediaQueries.MD} {
    padding: 32px;
  }

  h2 {
    margin: 0 0 12px;
    font-family: ${FontFamily.display};
    font-size: 32px;
    font-weight: 700;
    text-transform: uppercase;
  }

  ul {
    margin: 0;
    padding-left: 20px;
    color: ${Colors.lightGray};
  }

  li + li {
    margin-top: 6px;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
`;
