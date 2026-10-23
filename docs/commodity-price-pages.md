# Commodity price pages

The homepage cards link to five server-rendered pages: `/gold-price-pakistan`, `/silver-price-pakistan`, `/petrol-price-pakistan`, `/usd-to-pkr`, and `/brent-crude-oil-price`. Both gold weights share one canonical page. Each page has its own title, description, canonical URL, Open Graph metadata, visible breadcrumb, WebPage/BreadcrumbList JSON-LD, related links and sitemap entry. No rating, offer, or guaranteed search-position claims are generated.

## Price sources

- Gold/silver: dated APGJSA-attributed daily reports from Mettis Global, refreshed through its public commodities index every 30 minutes. See `bullion-local-feed.md` for validation and source limits. XAUS / Yahoo international benchmarks remain the separately labelled fallback.
- Petrol: https://autoones.com/fuel-prices-api — the same endpoint used by Android, with its effective date. At implementation, its petrol value matched PSO's published fuel page. This is not continuous independent verification of every future rate.
- Energy: Yahoo Finance BZ=F, CL=F and NG=F futures quotes; source timestamp and USD units retained. PKR overview values use the shared FX reference.
- USD/PKR: XAUS's aggregated FX reference. Not labelled an SBP fixing or a cash-exchange quote. Static fallback FX (`fx_stale`) is rejected.

Snapshots are server-cached for five minutes (petrol: one hour). Pages revalidate after five minutes; a loaded page is a snapshot rather than a streaming feed. Provider failures display unavailable values, never fixed sample prices. Delayed observations carry their original time. Existing PSX feeds and account integrations are unchanged.

## Price history and calculators

All five pages now place the chart directly beneath a compact price header, ahead of the calculator. FAQ sections, long guides, and the methodology sidebar were removed. Sources, dates, benchmark and currency basis remain as concise labels. SEO metadata, structured breadcrumbs, crawlable links and sitemap entries remain.

Charts use the same Lightweight Charts library as stocks, with crosshairs, drag-to-pan, wheel/pinch zoom, price/time axes, theme-aware labels and responsive sizing. Periods: 1D, 1W, 1M, 6M, 1Y, 3Y, 5Y, All. All is capped at 25 calendar years of available data. Full five-year daily observations are combined with older monthly closes; actual start/end dates are visible. Providers with shorter records do not receive invented observations.

Gold (GC=F), silver (SI=F), USD/PKR (PKR=X) and Brent (BZ=F) history comes from Yahoo Finance with host fallback. Gold daily history can also fall back to the same GC=F history through XAUS. Metals use historical FX rather than one current rate across past years: daily/intraday samples join the latest prior currency observation within seven days, while monthly closes align by exchange-calendar month. Conversion starts where both metal and FX records exist. These remain futures-based indicative values, not local Sarafa quotes. Chart and calculator share weight/purity controls; quantity affects only the calculator.

Petrol uses AutoOnes daily records with monthly closes for earlier coverage. At implementation the available daily history began 24 July 2026; no intraday feed existed, so only its 1D selector is disabled. The stepped petrol chart shows notified prices. Monthly closes are dated at month end and cannot extend daily coverage backwards using a partial month's final value.

Current gold/silver quotes prefer validated dated local reports; the original XAUS / Yahoo benchmark pipeline remains the separately attributed fallback. FX retains its original source. No fitted premium is used. Missing prices are unavailable, never sample data.

One tola = 11.6638038 grams; one troy ounce = 31.1034768 grams. Purity estimates use 22/24. Calculator estimates exclude dealer spreads, making charges and taxes. The overview retains Gold/Silver/Energy filters, gold calculator, WTI and natural gas rows.

## Verification

- `npm test`: conversion/purity, malformed values, timestamp sorting/deduplication, historical FX joins without indefinite fill, monthly FX calendar alignment, the 25-year cap, and unique routes, plus existing regression tests.
- `npm run build`: production build, type checking and lint.
- Generated build artifacts checked for all five populated histories, period controls, chart-before-calculator ordering, absence of FAQ/guide/sidebar sections, canonical tags and metadata.
- Visual/browser interaction checks were not performed because browser preview access was blocked in this session. No search ranking or Google indexing claim is made; discovery/indexing remains Google's decision.
