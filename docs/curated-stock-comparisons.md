# Curated PSX comparison pages

Thirteen explicit same-sector pairs are defined in `src/lib/stock-comparisons.ts`. The initial set includes all three pairings of FATIMA, FFC and EFERT, plus three banking, two auto, two exploration/production, two cement and one refinery comparison. This is a curated selection, not a claim that a sector contains only these companies.

Each pair has server-rendered company names, market and valuation rows, sector-specific fundamentals, individual reporting periods, source links, breadcrumbs, a unique title/description and a self-canonical URL. Quotes come from PSX DPS; detailed fundamentals come from the existing hourly-cached SCSTrade company snapshots. Calculated price/book uses the PSX quote and positive reported book value. Unknown values stay missing. No financial winner, forecast or investment recommendation is generated.

Canonical pages are built statically and revalidated every five minutes on access. Feed caches retain their existing refresh policies. Reverse order, case variants and a small set of explicit company-name aliases permanently redirect to the canonical pair. Unsupported pairs return 404 rather than generating arbitrary pages.

All canonical pairs appear in the XML sitemap and comparison hub. Participating stock pages provide server-rendered links to their curated comparisons, outside the client-side research tabs. Generic comparison customization still supports query-string stock selection.

Schema uses WebPage/Corporation references and BreadcrumbList only; it does not claim a supported comparison rich result, rating or guaranteed ranking. Google ultimately controls indexing and search presentation.
