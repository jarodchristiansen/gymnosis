import SEOHead from "@/components/seo/SEOHead";
import { DisplayHeading, Eyebrow, Page } from "@/components/ui";
import { Colors } from "@/styles/variables";
import styled from "styled-components";

const AboutAndTermsPage = () => (
  <Page width={760}>
    <SEOHead
      metaTitle="About, terms, and privacy — Gymnosis"
      metaDescription="Gymnosis is a portfolio project, not a commercial service. What it is, what it isn't, and what it does with your data."
    />
    <Eyebrow>About, terms, and privacy</Eyebrow>
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

      <h2 id="privacy">Privacy: what it stores</h2>
      <p>
        Jarod Christiansen runs this site and decides what happens to its data.
      </p>
      <ul>
        <li>
          If you sign in with Google or GitHub: your name, email address, and
          profile picture from that provider, and a username.
        </li>
        <li>
          Workout plans and the history of changes to each plan. Questionnaire
          answers include age, height, weight, goals, equipment, and injuries,
          which count as health information, so only enter them for yourself or
          with the person&apos;s permission.
        </li>
        <li>
          Counters used for rate limits, keyed by account or IP address, which
          expire within a day.
        </li>
      </ul>

      <h2>Who else handles it</h2>
      <ul>
        <li>MongoDB Atlas stores the database.</li>
        <li>
          Vercel hosts the site and keeps short-lived request logs, which
          include IP addresses.
        </li>
        <li>
          Groq receives questionnaire answers to draft a plan. It doesn&apos;t
          receive names or email addresses.
        </li>
        <li>Google or GitHub, if you sign in with them.</li>
      </ul>
      <p>
        Nothing is sold or shared for advertising. There are no analytics or
        tracking scripts. The only cookies are the ones that keep you signed in.
      </p>

      <h2>How long it&apos;s kept</h2>
      <p>
        Account data stays until you ask for it to be removed. The demo gym, and
        everything in it, is deleted automatically after 24 hours. The site
        isn&apos;t meant for anyone under 16.
      </p>

      <h2>The demo</h2>
      <p>
        &ldquo;Try as…&rdquo; creates a private demo gym filled with made-up
        people and example plans. Nothing in it is real.
      </p>

      <h2>Questions or removal</h2>
      <p>
        To ask a question, or to have your account and its data removed, open an
        issue on the{" "}
        <a href="https://github.com/jarodchristiansen/gymnosis/issues">
          GitHub repository
        </a>
        . Issues are public: give your Gymnosis username, and don&apos;t post
        your email address or anything else personal.
      </p>
      <p className="updated">Last updated November 21, 2026.</p>
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

  .updated {
    margin-top: 32px;
    font-size: 14px;
    color: ${Colors.midGray};
  }

  a {
    color: ${Colors.brand.accentLight};
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

export default AboutAndTermsPage;
