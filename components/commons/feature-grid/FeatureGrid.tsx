import { Colors, FontWeight, MediaQueries } from "@/styles/variables";
import styled from "styled-components";

const FeatureGrid = () => {
  return (
    <GridContainer>
      <div className="features-grid">
        <div className="feature-card">
          <span className="feature-icon"></span>
          <h4>AI Workout Planning</h4>
          <p>Build personalized workout routines powered by AI.</p>
          <p>
            Describe your goals and get a complete, structured plan in seconds.
          </p>
          <p>Adapts to any fitness level, equipment, and schedule.</p>
        </div>

        <div className="feature-card">
          <span className="feature-icon"></span>
          <h4>Client Progress Tracking</h4>
          <p>Monitor your clients&apos; progress with clear, visual metrics.</p>
          <p>Log workout history and track improvements over time.</p>
          <p>
            Keep every client motivated with transparent, data-driven results.
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-icon"></span>
          <h4>Trainer Dashboard</h4>
          <p>Manage your schedule, clients, and routines from one place.</p>
          <p>Get a bird&apos;s-eye view of your entire roster at a glance.</p>
          <p>Spend less time on admin and more time coaching.</p>
        </div>

        <div className="feature-card">
          <span className="feature-icon"></span>
          <h4>Member Profiles</h4>
          <p>Detailed profiles for every gym member.</p>
          <p>Store fitness history, goals, and preferences in one place.</p>
          <p>Personalize every member&apos;s experience from day one.</p>
        </div>

        <div className="feature-card">
          <span className="feature-icon"></span>
          <h4>Facility Management</h4>
          <p>Keep your gym organized and running smoothly.</p>
          <p>Track equipment, spaces, and operational details with ease.</p>
          <p>Scale from a single studio to a multi-location operation.</p>
        </div>

        <div className="feature-card">
          <span className="feature-icon"></span>
          <h4>Secure &amp; Private</h4>
          <p>Your data stays yours — secure by design.</p>
          <p>Role-based access keeps sensitive information where it belongs.</p>
          <p>Built with privacy best practices at every layer.</p>
        </div>
      </div>
    </GridContainer>
  );
};

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.lightGray};
  padding: 36px 14px;
  text-align: center;
  /* align-items: center; */

  h3 {
    align-self: center;
    font-weight: ${FontWeight.bold};
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-gap: 24px;
    margin-top: 24px;

    @media ${MediaQueries.MD} {
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    }
  }

  .feature-card {
    background-color: ${Colors.brand.white};
    border: 2px solid ${Colors.darkGray};
    padding: 16px;
    border-radius: 12px;
  }

  .feature-icon {
    /* Add styles for the feature icon */
  }

  h4 {
    margin-top: 0;
    margin-bottom: 12px;
  }

  p {
    margin-top: 0;
    margin-bottom: 8px;
  }
`;

export default FeatureGrid;
