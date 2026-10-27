# Search Console indexing audit — 27 October 2026

Reviewed the authenticated Page indexing report and the owner's exported 404 CSV.

- Report: 792 indexed, 214 excluded URLs.
- 158 reported 404s: 157 legacy `/download/document/…pdf` or `/download/attachment/…pdf` URLs and `/stocks/NBP-FUNDS`.
- All 157 original `https://dps.psx.com.pk` targets returned HTTP 200 and PDF content type during the audit. Added permanent redirects preserving file identifiers; no PDF copies or fabricated content.
- NBP Funds is a fund manager announcement identifier, not a listed stock. Redirect its legacy stock URL to Mutual Funds and update announcement links.
- The three duplicate examples (FATIMA/FFC, comparison builder query, PSMC) now return 200 with explicit canonical URLs. Query variants correctly canonicalize to their main page.
- Six alternate URLs are query variants with proper canonicals. Three redirects are HTTP/non-www homepage variants. These exclusions are expected.
- Portfolio and Watchlist deliberately use noindex and are absent from the current sitemap; retain their privacy-oriented indexing settings.
- Checked all 39 crawled/unindexed examples: all return HTTP 200; HTML pages have matching canonical URLs and no noindex directive. Includes new comparisons and asset URLs (font, favicon, social image). Technical eligibility does not guarantee Google's indexing decision.
- Three discovered stock pages (ASL, DSL, TPLI) are accessible. Do not invent technical fixes or mass-submit requests for normal crawl delays.

Verification: production build, SEO checks, and HTTP tests covering all 158 CSV URLs against the local production server. Invalid file paths remain 404. Search Console counts will change only after Google recrawls.
