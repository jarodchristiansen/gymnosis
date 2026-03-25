import glob from "glob";
import { GET_POSTS } from "@/helpers/queries/posts";
import client from "../apollo-client";

/**
 * returns the dynamic sitemap with posts from apollo query
 */
const Sitemap = () => {
  return null;
};

/**
 * @param {string} origin Site origin without trailing slash
 * @param {string} filePath Path from glob, e.g. pages/news/index.tsx
 * @returns {string | null}
 */
const pageFileToAbsoluteUrl = (origin, filePath) => {
  const normalized = filePath.replace(/\\/g, "/");
  if (normalized.includes("/api/")) {
    return null;
  }
  let route = normalized
    .replace(/^pages\//, "")
    .replace(/\.(tsx|jsx|ts|js)$/, "");
  if (route.endsWith("/index")) {
    route = route.slice(0, -"/index".length);
  } else if (route === "index") {
    route = "";
  }
  const pathname = route === "" ? "/" : `/${route}`;
  return `${origin}${pathname}`;
};

const getSiteTitle = async () => {
  const result = await client.query({
    query: GET_POSTS,
    variables: {
      filter: "Education",
    },
  });

  return { data: result };
};

export const getServerSideProps = async ({ res }) => {
  const origin = (
    process.env.BASE_URL ?? "https://gymnosis.vercel.app"
  ).replace(/\/$/, "");

  const response = await getSiteTitle();
  const data = response?.data?.data?.getPosts;

  const postPaths = data
    ? data.map((post) => {
        return `${origin}/${post.section.toLowerCase()}${post.slug}`;
      })
    : [];

  const pagesDir = "pages/**/*.tsx";
  let pagesPaths = glob.sync(pagesDir);

  pagesPaths = pagesPaths
    .filter((path) => !path.includes("["))
    .filter((path) => !path.includes("/_"))
    .filter((path) => !path.includes("404"));

  const pageUrls = pagesPaths
    .map((p) => pageFileToAbsoluteUrl(origin, p))
    .filter(Boolean);

  const dynamicPaths = [`${origin}/newsfeed`, `${origin}/user`];
  const primaryUrls = [`${origin}/`, `${origin}/news`, `${origin}/education`];

  const allPaths = [
    ...new Set([...primaryUrls, ...dynamicPaths, ...pageUrls, ...postPaths]),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/1" xmlns:news="http://www.google.com/schemas/sitemap-news/1" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">

  ${allPaths
    .map((url) => {
      return `
        <url>
          <loc>${url}</loc>
          <changefreq>monthly</changefreq>
          <priority>1.0</priority>
        </url>
      `;
    })
    .join("")}

    </urlset>

    `;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;
