# SEO audit and deployment

Implemented October 22, 2026.

- Unique titles and descriptions on every public route. Single www HTTPS canonical; filtered/query variants consolidate to the base tool page.
- Stable stock titles, uppercase permanent redirects, WebPage/Corporation and breadcrumb structured data. Removed Offer markup with unsupported price-change properties; this site does not sell shares.
- Organization and WebSite identity, escaped JSON-LD, branded 1200x630 social image and large image preview eligibility.
- Personal portfolio/watchlist noindex, follow; omitted from sitemap but crawlable so Google can see noindex.
- Sitemap deduplicates stock symbols and omits invented last-modified timestamps. Existing robots allows public content and points to the sitemap.
- Server-rendered company links in directory loading fallback. Commodity and forex links in the compact footer. No extra FAQ content.
- Optional GOOGLE_SITE_VERIFICATION environment variable for Search Console's HTML token.

## Validation

Run npm test, npm run build, npm run verify:seo. The last command checks actual prerendered HTML: unique titles, descriptions, exact canonical paths, private/public indexing, social cards, parseable JSON-LD, and unique sitemap URLs including stocks. Dynamic stock pages additionally require HTTP checks after deployment. Build data fetches can log provider timeouts; inspect the resulting history/rates and do not equate a successful build with data freshness.

## External follow-through

Verify the domain in Google Search Console using DNS, or add the HTML token through GOOGLE_SITE_VERIFICATION and redeploy. Submit https://www.daulatinvest.com/sitemap.xml. Inspect the home, stocks directory, an individual stock and the five commodity price pages; request indexing for important new pages. Monitor indexing/canonical reports and real-user Core Web Vitals. Submission and ranking have not been claimed as completed by this code change.

## Remaining editorial/data work

The forex overview contains locally stored rates; the mutual-fund directory uses mutualFundsData.ts. Metadata no longer calls these live feeds. These datasets should be refreshed from licensed/reliable sources with observed timestamps before advertising them as current. Existing PSX/news fallback data also needs a separate freshness audit. No ranking guarantee, fake reviews, keyword stuffing, invented credentials or mass-generated thin pages have been introduced. Owner identity/contact and editorial review details should only be published when supplied and verified.

## Verified results

Production build passed; lint passed; 19 existing tests passed. SEO artifact audit passed for 21 rendered pages and 769 sitemap URLs. Local production HTTP checks: lowercase stock 308 to uppercase; KEL 200 with correct canonical; unknown symbol 404; preview image 200 image/png; robots 200. User confirmed Search Console is already verified; sitemap submission remains an account-side follow-through.
