# Commodity price pages

The homepage cards link to five server-rendered pages: `/gold-price-pakistan`, `/silver-price-pakistan`, `/petrol-price-pakistan`, `/usd-to-pkr`, and `/brent-crude-oil-price`. Both gold weights share one canonical page. Each page has its own title, description, canonical URL, Open Graph metadata, visible breadcrumb, WebPage/BreadcrumbList JSON-LD, related links and sitemap entry. No rating, offer, or guaranteed search-position claims are generated.

## Price sources

- Gold/silver: https://xaus.com/api/ — international indicative prices, converted with the available PKR FX rate. Never labelled an official Sarafa quote.
- Petrol: https://autoones.com/fuel-prices-api — the same endpoint used by Android, with its effective date. At implementation, its petrol value matched PSO's published fuel page. This is not continuous independent verification of every future rate.
- Energy: Yahoo Finance BZ=F, CL=F and NG=F futures quotes; source timestamp and USD units retained. PKR overview values use the shared FX reference.
- USD/PKR: XAUS's aggregated FX reference. Not labelled an SBP fixing or a cash-exchange quote. Static fallback FX (`fx_stale`) is rejected.

Snapshots are server-cached for five minutes (petrol: one hour). Pages revalidate after five minutes; a loaded page is a snapshot rather than a streaming feed. Provider failures display unavailable values, never fixed sample prices. Delayed observations carry their original time. Existing PSX feeds and account integrations are unchanged.

## Gold history and calculators

1D uses XAUS intraday spot samples. 1W/1M/1Y use daily GC=F gold futures history through XAUS, with a direct Yahoo fallback. These are different benchmarks, explicitly labelled. All points use the latest available FX rate held constant across the series, so the chart is not a historical local PKR/Sarafa series. Local premiums and historical currency movement are excluded. Weight and 22K/24K controls apply to the chart and calculator; quantity affects only the calculator. Missing periods show an empty-state message, and source dates remain visible.

One tola = 11.6638038 grams; one troy ounce = 31.1034768 grams. Purity estimates use 22/24. Calculator estimates exclude dealer spreads, making charges and taxes. The overview retains Gold/Silver/Energy filters, gold calculator, WTI and natural gas rows.

## Verification

- `npm test`: conversion/purity, malformed values, timestamp sorting/deduplication, and unique routes, plus existing regression tests.
- `npm run build`: production build, type checking and lint.
- Generated build artifacts checked for one H1 per page, canonical tags, metadata, valid breadcrumb JSON-LD, homepage links and sitemap membership. Gold chart HTML and both history arrays confirmed populated.
- Visual/browser interaction checks were not performed because browser preview access was blocked in this session. No search ranking or Google indexing claim is made; discovery/indexing remains Google's decision.
