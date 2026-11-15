/**
 * The public pages, for search engines. Everything else needs a sign-in.
 */
const PUBLIC_PATHS = ["/", "/education", "/auth", "/terms-of-service"];

const Sitemap = () => null;

export const getServerSideProps = async ({ res }) => {
  const origin = (
    process.env.NEXTAUTH_URL ?? "https://gymnosis.vercel.app"
  ).replace(/\/$/, "");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_PATHS.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join(
  "\n"
)}
</urlset>
`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default Sitemap;
