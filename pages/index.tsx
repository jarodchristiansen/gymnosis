import {
  Colors,
  FontFamily,
  FontWeight,
  MediaQueries,
  Padding,
} from "@/styles/variables";
import LandingCard from "components/commons/info-cards/landing-card";
import CTACard from "components/ctas/CTACard";
import ProgressMeter from "components/progressmeter/ProgressMeter";
import type { GetServerSideProps } from "next";
import Image from "next/image";
import styled from "styled-components";

import SEOHead from "../components/seo/SEOHead";

/**
 * Landing page with Info/Sign Up Pages
 */
export default function Home() {
  const cardContent = [
    {
      image: "/landing/avatar-icon.svg",
      title: "Stay Informed",
      text: "Gain a competitive edge with real-time data, comprehensive metrics, and AI assistance in building client plans, as well as insight into trends for your business. Gymnosis provides you with a clear view of your gym universe, empowering you to make informed decisions while helping your client's make the most of their fitness journey.",
    },
    {
      image: "/landing/connected-icon.svg",
      title: "Stay Connected",
      text: "Join a community of fitness enthusiasts. Engage in lively discussions, share insights, and stay connected with the latest trends. Collaborate, learn, and grow together in the exciting realm of fitness technology.",
    },
    {
      image: "/landing/growth-chart-icon.svg",
      title: "Thrive",
      text: "Gymnosis is your gateway to success in the fitness revolution. Unleash the potential of your clients, analyze trends, and identify opportunities to maximize your returns. With Gymnosis, you'll be well-equipped to navigate the fitness landscape with confidence and make waves.",
    },
  ];

  return (
    <AlternateHomePageWrapper>
      <SEOHead
        isHomePage={true}
        metaTitle="Gymnosis - Your All-In-One Gym Management Solution"
        metaDescription="Gymnosis is your all-in-one gym management solution. Seamlessly manage your gym, track your members, and grow your business with Gymnosis AI assistant."
        previewImage="/assets/assets-page.png"
      />

      <div className="top-row">
        <div className="left-card">
          <div className={"landing-svg"}>
            <LandingCard
              headerText={"Gymnosis"}
              bodyText="Your All-in-One Gym Management Solution."
              renderSignIn={false}
              renderLearnMore={true}
            />
          </div>
        </div>

        <Image
          src="/assets/3d-ripple.jpg"
          width={400}
          height={500}
          alt="Chart Page Screenshot"
        />
      </div>
      <Row>
        <h3>Experience Facility Management Like Never Before</h3>
        <div className="site-description-container">
          {cardContent.map((card) => {
            return (
              <div className="card" key={card.title}>
                <div className="card-content">
                  {card.image ? (
                    <div className="card-background">
                      <Image src={card.image} height={150} width={150} alt="" />
                    </div>
                  ) : null}

                  <h4>{card.title}</h4>

                  <div>{card.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Row>

      <div>
        <ProgressMeter currentStep={1} />
      </div>

      <div className="intro-paragraph">
        <p>
          Welcome to Gymnosis, your all-in-one gym facility management
          companion. At Gymnosis, we believe in empowering trainers with the
          knowledge and tools they need to navigate the complexities of fitness
          tracking for clients while managing your business. Whether you
          &apos;re an experienced trainer or just starting out, Gymnosis is
          designed to simplify your journey and help you make informed
          decisions. With our intuitive tracking dashboards, real-time data, AI
          assisted plan building, and vibrant community of enthusiasts, you
          &apos;ll have everything you need to unlock the power of AI for your
          facility. Join us today and discover how knowledge can be your key to
          success in the fitness industry.
        </p>
      </div>

      <div>
        <CTACard />
      </div>
    </AlternateHomePageWrapper>
  );
}

const Row = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  color: black;
  gap: 24px;
  padding: 24px;

  background: linear-gradient(to bottom, #ffffff, #f8f8f8);

  h3 {
    text-align: center;
  }

  .site-description-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    text-align: center;
    grid-gap: 24px;

    .card {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: 32px;
      font-family: ${FontFamily.secondary};
      border-radius: 12px;
      box-shadow: 0px 2px 12px ${Colors.darkGray};
      position: relative;
      text-align: center;
      border: 2px solid ${Colors.modern.accentBlue};

      h4 {
        font-weight: ${FontWeight.bold};
        padding: 0 0 12px 0;
      }

      .card-background {
        padding: 24px 0;
      }
    }
  }

  @media ${MediaQueries.MD} {
    padding: 64px;
  }
`;

const AlternateHomePageWrapper = styled.div`
  .top-row {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: ${Padding.xxlarge} 24px;
    align-items: center;

    img {
      width: 100%;
      align-self: center;
      border-radius: 10px;

      border: 2px solid #ccc;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      aspect-ratio: 16/9;
      object-fit: cover;
      box-shadow: 0px 2px 12px ${Colors.darkGray};
    }

    @media ${MediaQueries.MD} {
      flex-direction: row;
      justify-content: space-evenly;

      img {
        width: 60%;
      }
    }
  }

  .intro-paragraph {
    display: flex;
    flex-direction: column;
    color: white;
    padding: 64px 24px;
    text-align: center;
    background-color: ${Colors.midnight};

    p {
      @media ${MediaQueries.MD} {
        max-width: 70%;
        margin: auto;
      }
    }
  }
`;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
