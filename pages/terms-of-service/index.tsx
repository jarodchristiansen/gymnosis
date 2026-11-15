import SEOHead from "@/components/seo/SEOHead";
import { DisplayHeading, Eyebrow, Page } from "@/components/ui";
import { Colors } from "@/styles/variables";
import styled from "styled-components";

const AboutAndTermsPage = () => (
  <Page width={760}>
    <SEOHead
      metaTitle="About and terms — Gymnosis"
      metaDescription="Gymnosis is a portfolio project, not a commercial service. What it is, what it stores, and what it isn't."
    />
    <Eyebrow>About and terms</Eyebrow>
    <Title>A portfolio project, not a service</Title>

    <Body>
      <p>
        Gymnosis is a portfolio project by{" "}
        <a href="https://jarod-christiansen.vercel.app">Jarod Christiansen</a>,
        built to show AI-assisted software with a human in charge. It is not a
        commercial product, no gyms use it, and it comes with no warranty or
        guarantee of availability. It may change or go offline at any time.
      </p>

      <h2>Not medical or fitness advice</h2>
      <p>
        Workout plans here are drafted by an AI model and checked by simple,
        keyword-based rules. Neither is a substitute for a qualified trainer,
        physiotherapist, or doctor. Don&apos;t follow a plan from this site
        without that advice, especially with an injury or health condition.
      </p>

      <h2>What it stores</h2>
      <ul>
        <li>
          If you sign in with Google or GitHub: your name, email address, and
          profile picture from that provider, and a username.
        </li>
        <li>
          Workout plans, questionnaire answers, and the history of changes to
          each plan.
        </li>
        <li>
          Counters used for rate limits, keyed by account or IP address, which
          expire within a day.
        </li>
      </ul>
      <p>
        There are no analytics or tracking scripts. Questionnaire answers are
        sent to Groq to draft plans.
      </p>

      <h2>The demo</h2>
      <p>
        &ldquo;Try as…&rdquo; creates a private demo gym filled with made-up
        people and example plans. Everything in it is deleted automatically
        after 24 hours.
      </p>

      <h2>Questions or removal</h2>
      <p>
        To ask a question or have an account removed, open an issue on the{" "}
        <a href="https://github.com/jarodchristiansen/gymnosis/issues">
          GitHub repository
        </a>
        .
      </p>
    </Body>
  </Page>
);

const Title = styled(DisplayHeading)`
  font-size: clamp(38px, 7vw, 56px);
  margin-bottom: 24px;
`;

const Body = styled.div`
  color: ${Colors.lightGray};
  font-size: 16px;
  line-height: 1.7;

  h2 {
    margin: 32px 0 8px;
    font-size: 18px;
    color: ${Colors.lightGray};
  }

  p,
  ul {
    margin: 0 0 12px;
  }

  ul {
    padding-left: 20px;
  }

  li + li {
    margin-top: 6px;
  }

  a {
    color: ${Colors.brand.accentLight};
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

export default AboutAndTermsPage;
