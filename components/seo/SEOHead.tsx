import Head from "next/head";
import { useRouter } from "next/router";

interface SEOHeadProps {
  isHomePage?: boolean;
  metaTitle: string;
  metaDescription: string;
  previewImage?: string;
}

const SEOHead = ({
  isHomePage = false,
  metaTitle,
  metaDescription,
  previewImage,
}: SEOHeadProps) => {
  const router = useRouter();
  const { pathname } = router;

  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" type="image/png" href="/images/dumbbell.svg" />

      <title>{metaTitle && metaTitle}</title>
      {isHomePage && (
        <>
          <meta
            name="google-site-verification"
            content="sYZ6VaJuOfDFRSGlLK4-ISx-yHIfZVRdiEK6RXh3eUM"
          />
          <meta
            name="ahrefs-site-verification"
            content="36afae7f6a8e6e641fd27c84b465e990d8323de93402b68c2c27779626abd7b1"
          ></meta>
        </>
      )}

      {pathname && (
        <meta
          property="og:url"
          content={`https://gymnosis.vercel.app/${pathname}`}
        />
      )}

      <meta property="og:type" content="website" />
      {/* <meta property="fb:app_id" content="your fb id" /> */}

      <meta
        property="og:title"
        content={metaTitle ? metaTitle : "Gymnosis: Gym Management Software"}
      />

      <meta
        name="description"
        content={
          metaDescription
            ? metaDescription
            : "Gymnosis: Gym Management Software"
        }
      />
      <meta
        name="twitter:card"
        content={metaTitle ? metaTitle : "Gymnosis: Gym Management Software"}
      />

      {pathname && <meta name="twitter:site" content={pathname} />}

      <meta
        property="og:description"
        content={
          metaDescription
            ? metaDescription
            : "Gymnosis: Gym Management Software"
        }
      />
      <meta property="og:image" content={previewImage && previewImage} />
      <meta property="og:image:width" content="400" />
      <meta property="og:image:height" content="400" />
    </Head>
  );
};

export default SEOHead;
