import { Colors, FontWeight, MediaQueries } from "@/styles/variables";
import styled from "styled-components";

const FeatureGrid = () => {
  return (
    <GridContainer>
      <div className="features-grid">
        <div className="feature-card">
          <span className="feature-icon">
            {/* Add the corresponding icon here */}
          </span>
          <h4>Portfolio Tracking</h4>
          <p>
            Stay on top of your crypto investments with our intuitive portfolio
            tracking feature.
          </p>
          <p>
            Monitor real-time prices, performance, and allocation across
            multiple assets.
          </p>
          <p>
            Visualize your portfolio growth and make data-driven decisions with
            ease.
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">
            {/* Add the corresponding icon here */}
          </span>
          <h4>Comprehensive Metrics</h4>
          <p>
            Dive deep into financial and on-chain metrics to gain valuable
            insights into crypto assets.
          </p>
          <p>
            Analyze price movements, market capitalization, trading volume, and
            more.
          </p>
          <p>
            Evaluate token fundamentals and historical data to make informed
            investment choices.
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">
            {/* Add the corresponding icon here */}
          </span>
          <h4>Social Community</h4>
          <p>
            Connect with a vibrant community of crypto enthusiasts and
            investors.
          </p>
          <p>
            Engage in discussions, share knowledge, and stay updated on the
            latest trends.
          </p>
          <p>
            Foster valuable connections, collaborate on projects, and explore
            new opportunities.
          </p>
        </div>

        {/* Repeat the above structure for the remaining features */}

        <div className="feature-card">
          <span className="feature-icon">
            {/* Add the corresponding icon here */}
          </span>
          <h4>News and Updates</h4>
          <p>
            Access a curated feed of crypto news, articles, and market updates
            in real-time.
          </p>
          <p>
            Stay informed about industry developments, regulatory changes, and
            market trends.
          </p>
          <p>
            Get a holistic view of the crypto ecosystem and make informed
            decisions based on the latest information.
          </p>
        </div>

        {/* Repeat the above structure for the remaining features */}

        <div className="feature-card">
          <span className="feature-icon">
            {/* Add the corresponding icon here */}
          </span>
          <h4>User-friendly Interface</h4>
          <p>
            Enjoy a sleek and intuitive interface designed for seamless user
            experience.
          </p>
          <p>
            Navigate effortlessly through the apps features and access
            information with ease.
          </p>
          <p>
            Experience the power of crypto in a user-friendly environment that
            simplifies complex concepts.
          </p>
        </div>

        {/* Repeat the above structure for the remaining features */}

        <div className="feature-card">
          <span className="feature-icon">
            {/* Add the corresponding icon here */}
          </span>
          <h4>Security and Privacy</h4>
          <p>
            Rest assured knowing that your data and assets are protected with
            robust security measures.
          </p>
          <p>
            Safeguard your privacy and maintain full control over your personal
            information.
          </p>
        </div>

        {/* Repeat the above structure for the remaining features */}
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
    background-color: ${Colors.elegant.white};
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
