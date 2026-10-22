# Homepage and Market separation — 23 October 2026

- Homepage order: introduction → gold/forex/commodities → chart with five key indices → toolkit → community → news → announcements.
- The homepage shortlist is KSE100, ALLSHR, KSE30, KMI30 and PSXDIV20. It keeps provider values intact and never substitutes a specialist index when a key one is missing. Clicking a row changes the chart.
- `/market` is a dedicated, indexable page with all available PSX indices, interactive chart selection, market movers/filter controls, the full index performance table and sector performance. BKTI, OGTI and other specialist indices remain available there. Navbar desktop/mobile Market links now use `/market`; the route is included in the sitemap and has its own canonical metadata.
- The former eight-row index-table limit is removed. The old homepage chart anchor remains functional. Stock breadcrumbs now point to the Market page.
- News images come from the same RSS item as the headline: Dawn `media:content`/thumbnail and Express Tribune's `image/img` field. Only HTTPS publisher image hosts are accepted. Actual publisher photos replace placeholders when present; the neutral fallback remains for genuinely missing/failed images. Both homepage and news page use lazy-loaded images with asynchronous decoding.

Checks: five-index selection/order/missing-feed behavior; real publisher image extraction and rejection of foreign/insecure image URLs; existing market-data, account, chart and research regression tests. First five currently returned Tribune image URLs responded HTTP 200 with image content types during implementation. Production UI verification checks placement, chart switching, full Market content and rendered news images.
