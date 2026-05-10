import { Colors, FontFamily, MediaQueries, Padding } from "@/styles/variables";
import { motion } from "framer-motion";
import { GetServerSideProps } from "next";
import styled from "styled-components";

import SEOHead from "../../components/seo/SEOHead";

const FadeUp = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

type Article = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tag: string;
};

const articles: Article[] = [];

export default function NewsPage() {
  return (
    <PageWrapper>
      <SEOHead
        metaTitle="News & Updates — Gymnosis"
        metaDescription="The latest news, product updates, and announcements from the Gymnosis team."
      />

      {/* Hero */}
      <PageHero>
        <FadeUp>
          <HeroEyebrow>Newsfeed</HeroEyebrow>
          <HeroTitle>News &amp; Updates</HeroTitle>
          <HeroSubtitle>
            Product releases, announcements, and thoughts from the Gymnosis
            team.
          </HeroSubtitle>
        </FadeUp>
      </PageHero>

      {/* Article list / empty state */}
      <ContentSection>
        {articles.length > 0 ? (
          <ArticleGrid>
            {articles.map((article) => (
              <ArticleCard key={article.slug}>
                <ArticleTag>{article.tag}</ArticleTag>
                <ArticleTitle>{article.title}</ArticleTitle>
                <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>
                <ArticleMeta>{article.date}</ArticleMeta>
              </ArticleCard>
            ))}
          </ArticleGrid>
        ) : (
          <EmptyState>
            <FadeUp>
              <EmptyIcon aria-hidden="true">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                  <path d="M18 14h-8" />
                  <path d="M15 18h-5" />
                  <path d="M10 6h8v4h-8V6Z" />
                </svg>
              </EmptyIcon>
              <EmptyTitle>Nothing here yet.</EmptyTitle>
              <EmptyBody>
                We are just getting started. Check back soon for product
                updates, tips for trainers, and announcements from the Gymnosis
                team.
              </EmptyBody>
              <EmptySocial>
                Follow us on{" "}
                <EmptySocialLink
                  href="https://instagram.com/gymnosis"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </EmptySocialLink>{" "}
                for the latest in the meantime.
              </EmptySocial>
            </FadeUp>
          </EmptyState>
        )}
      </ContentSection>
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
  max-width: 520px;
`;

const ContentSection = styled.section`
  padding: 72px 24px;
  max-width: 900px;
  margin: 0 auto;

  @media ${MediaQueries.MD} {
    padding: 80px 40px;
  }
`;

const ArticleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media ${MediaQueries.MD} {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ArticleCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border-top: 3px solid ${Colors.brand.accent};
  border-left: 1px solid rgba(255, 255, 255, 0.07);
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 107, 43, 0.04);
  }
`;

const ArticleTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: ${Colors.brand.accent};
`;

const ArticleTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${Colors.brand.white};
  line-height: 1.3;
`;

const ArticleExcerpt = styled.p`
  font-size: 14px;
  line-height: 1.7;
  color: ${Colors.midGray};
  flex: 1;
`;

const ArticleMeta = styled.span`
  font-size: 12px;
  color: ${Colors.midGray};
  opacity: 0.6;
  margin-top: 4px;
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
`;

const EmptyIcon = styled.div`
  color: ${Colors.brand.accent};
  opacity: 0.6;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h2`
  font-family: ${FontFamily.display};
  font-size: 28px;
  font-weight: 700;
  color: ${Colors.brand.white};
  margin-bottom: 12px;
`;

const EmptyBody = styled.p`
  font-size: 15px;
  line-height: 1.7;
  color: ${Colors.midGray};
  max-width: 440px;
  margin-bottom: 20px;
`;

const EmptySocial = styled.p`
  font-size: 14px;
  color: ${Colors.midGray};
`;

const EmptySocialLink = styled.a`
  color: ${Colors.brand.accent};
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 107, 43, 0.4);
  padding-bottom: 1px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${Colors.brand.accent};
  }
`;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
