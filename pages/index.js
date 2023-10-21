import { FormatUnixTime } from "@/helpers/formatters/time";
import { GET_NEWS_FEED } from "@/helpers/queries/news-feed";
import {
  Colors,
  FontFamily,
  FontWeight,
  MediaQueries,
  Padding,
} from "@/styles/variables";
import client from "apollo-client";
import LandingCard from "components/commons/info-cards/landing-card";
import CTACard from "components/ctas/CTACard";
import ProgressMeter from "components/progressmeter/ProgressMeter";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import styled from "styled-components";

import SEOHead from "../components/seo/SEOHead";

/**
 *
 * @param data: Response from GetNewsFeed query, renders the news feed at bottom of landing page
 * @returns Landing page with Info/Sign Up Pages
 */
export default function Home({ data }) {
  const { data: session, status } = useSession();

  const newsFeedContent = useMemo(() => {
    if (!data?.getNewsFeed?.length) return [];

    return data.getNewsFeed.slice(0, 5).map((story) => {
      return (
        <NewsItem key={story?.guid}>
          <Link href={story?.guid} passHref legacyBehavior>
            <a target="_blank">
              <h4 className="partner-header">
                {story.title.slice(0, 40) + "..."}
              </h4>
            </a>
          </Link>

          <div className="source-container">
            <div className="image-container">
              <Image
                src={story.source_info?.img}
                height={70}
                width={70}
                alt="block-logo"
                className="source-image"
                unoptimized={true}
              />
            </div>

            <span className="source-name">{story?.source_info?.name}</span>
          </div>

          <Image
            src={story.imageurl}
            height={190}
            width={190}
            alt="block-logo"
            className="article-image"
            unoptimized={true}
          />

          <span>Published: {FormatUnixTime(story?.published_on)}</span>
        </NewsItem>
      );
    });
  }, [data]);

  let id = session?.user?.id;

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
              // header2Text="Your All-in-One Crypto Companion."
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
          {cardContent &&
            cardContent.map((card) => {
              return (
                <div className="card" key={card?.text}>
                  <div className="card-content">
                    {card?.image && (
                      <div className="card-background">
                        <Image src={card.image} height={150} width={150} />{" "}
                      </div>
                    )}

                    <h4>{card?.title}</h4>

                    <div>{card?.text}</div>
                  </div>
                </div>
              );
            })}
        </div>
      </Row>

      <div>
        <ProgressMeter currentStep={1} />
      </div>

      {/* <div>
        <FeatureGrid />
      </div> */}

      {/* <div>
        <ReviewList />
      </div> */}

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
      /* &:hover {
        border: 2px solid blue;
        cursor: pointer;
      } */
      text-align: center;
      border: 2px solid ${Colors.modern.accentBlue};

      /* background: linear-gradient(180deg, transparent 0%, #0088ff 100%); */

      h4 {
        font-weight: ${FontWeight.bold};
        padding: 0 0 12px 0;
      }

      .card-background {
        padding: 24px 0;

        /* img {
          border-radius: 50%;
          border: 2px solid black;
        } */
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

const NewsItem = styled.div`
  border: 1.5px solid gray;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  padding: 1rem 1rem;
  justify-content: start;
  max-height: 28rem;
  min-width: 20rem;
  text-align: center;
  align-items: center;
  gap: 1rem;
  box-shadow: 2px 4px 10px #b9b7b7;
  position: relative;
  background-color: white;

  cursor: grab;

  .partner-header {
    background-color: #e9e9e937;
    border-radius: 8px;
  }

  h4 {
    font-weight: 500;
  }

  a:hover {
    text-decoration: underline;
  }

  .article-image {
    border-radius: 12px;
  }

  .source-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    font-size: 18px;
    max-height: 8rem;
    border-bottom: 1px solid lightgray;
    width: 100%;

    .source-name {
      font-weight: bold;
    }

    .source-image {
      border-radius: 50%;
    }
  }

  span {
    font-weight: 600;
  }

  @media ${MediaQueries.MD} {
    max-height: 30rem;
    min-width: 22rem;
  }
`;

const getNewsFeed = async () => {
  const result = await client.query({
    query: GET_NEWS_FEED,
  });

  return { data: result };
};

export const getServerSideProps = async (context) => {
  let data = {};

  const response = await getNewsFeed(); // any async promise here.

  data = response.data;

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: data, // will be passed to the page component as props
  };
};
