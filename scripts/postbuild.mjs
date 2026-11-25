// Runs after `vite build`.
//
// 1. Copies dist/index.html to dist/404.html. The app uses a hash router
//    (addresses look like /#/board/riverside-library), so deep links already work on any static
//    host. The 404.html copy means a mistyped path still opens the app instead
//    of a bare server error page, on nginx, GitHub Pages and most static hosts.
// 2. Fills in your public address (VITE_SITE_URL) in the social card tag and
//    writes robots.txt and sitemap.xml.
import { readFileSync, writeFileSync } from "node:fs";

const site = (process.env.VITE_SITE_URL ?? "").replace(/\/$/, "");

const html = readFileSync("dist/index.html", "utf8").replaceAll("__SITE_URL__", site);
writeFileSync("dist/index.html", html);
writeFileSync("dist/404.html", html);

const base = site || "https://example.com";
writeFileSync(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc></url>
</urlset>
`,
);

// Boards are usually private. Set VITE_ALLOW_INDEXING=true to let search engines in.
const allow = process.env.VITE_ALLOW_INDEXING === "true";
writeFileSync(
  "dist/robots.txt",
  `User-agent: *\n${allow ? "Allow: /" : "Disallow: /"}\n${site ? `Sitemap: ${site}/sitemap.xml\n` : ""}`,
);

console.log("Wrote 404.html, robots.txt and sitemap.xml");
