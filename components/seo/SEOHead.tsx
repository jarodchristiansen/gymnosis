import Head from "next/head";
import { useRouter } from "next/router";

interface SEOHeadProps {
  isHomePage?: boolean;
  metaTitle: string;
  metaDescription: string;
  previewImage?: string;
}

const DEFAULT_META_TITLE = "Gymnosis: Gym Management Software";
const DEFAULT_META_DESCRIPTION = "Gymnosis: Gym Management Software";

const SEOHead = ({
  isHomePage = false,
  metaTitle,
  metaDescription,
  previewImage,
}: SEOHeadProps) => {
  const router = useRouter();
  const { pathname } = router;

  const resolvedTitle = metaTitle || DEFAULT_META_TITLE;
  const resolvedDescription = metaDescription || DEFAULT_META_DESCRIPTION;
  const twitterCard = previewImage ? "summary_large_image" : "summary";
  const ogImage = previewImage ?? "";

  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" type="image/png" href="/images/dumbbell.svg" />

      <title>{resolvedTitle}</title>
      {isHomePage ? (
        <>
          <meta
            name="google-site-verification"
            content="sYZ6VaJuOfDFRSGlLK4-ISx-yHIfZVRdiEK6RXh3eUM"
          />
          <meta
            name="ahrefs-site-verification"
            content="36afae7f6a8e6e641fd27c84b465e990d8323de93402b68c2c27779626abd7b1"
          />
        </>
      ) : null}

      {pathname ? (
        <meta
          property="og:url"
          content={`https://gymnosis.vercel.app/${pathname}`}
        />
      ) : null}

      <meta property="og:type" content="website" />

      <meta property="og:title" content={resolvedTitle} />

      <meta name="description" content={resolvedDescription} />
      <meta name="twitter:card" content={twitterCard} />

      {pathname ? <meta name="twitter:site" content={pathname} /> : null}

      <meta property="og:description" content={resolvedDescription} />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta property="og:image:width" content="400" />
      <meta property="og:image:height" content="400" />
    </Head>
  );
};

export default SEOHead;
