# Data reliability and public-page performance

## Shipped changes

Forex uses the ExchangeRate-API daily public endpoint, cached server-side for an hour with an eight-second request limit. All eight currencies derive from one timestamped USD snapshot. Source attribution is visible. Values are indicative reference conversions, not invented bank/dealer buy/sell spreads. Missing, future-dated and invalid data is unavailable; observations older than 36 hours are marked delayed.

Mutual-fund numeric values are no longer taken from the locally maintained catalog. A server reader requests the public MUFAP performance report and validates column headings, actual fund valuation date, positive NAV and exact fund name. Missing/ambiguous matches and provider failures produce missing values, never a demo fallback. Returns retain the provider's convention (annualized where applicable), correctly show negative values and do not imply an investment guarantee. The 30-day column is labeled reported, not a calculated monthly investment return. NAV dates are visible in rows and exports, with delayed labels after 72 hours. AUM and fee figures without an observed source are withheld. Filters, fund profiles, sorting and export remain.

IMPORTANT: The MUFAP endpoint returned HTTP 403 on this environment. The reader and fail-closed UI are implemented, but production NAV population is NOT verified as working. Do not claim an operational live mutual-fund feed. A permitted provider/API or source-side access is needed if production also receives 403. Parser tests use synthetic samples of published column headings, not a captured successful HTML response. Existing catalog classification/benchmark/trustee fields remain reference metadata and need separate editorial verification.

Firestore initialization moved out of the authentication module. Public pages still keep the existing signed-in state, while Firestore is loaded by portfolio/watchlist/community routes that need it. Home index chart is split into its own loadable component with reserved loading space. The agreed tagline appears in the footer.

## Measurements

Next production build's estimated first-load JavaScript: home 360 kB before, 158 kB after (about 56% reduction); stocks directory 292 kB before, 148 kB after (about 49% reduction). These are build bundle sizes, not measured Core Web Vitals or guaranteed speed percentages. Real mobile LCP/INP/CLS remains to be measured in PageSpeed Insights/Search Console.

## Remaining work

Mobile-app portfolio sync requires Android verified-auth and migration investigation described in the existing Firebase notes. Stock/news fallback data needs its own audit. This phase does not complete all six growth recommendations or claim those issues are resolved.

## Verification

23 tests pass, including reference FX conversions, missing/future/stale feeds, MUFAP schema/date validation, exact plan matching, negative return formatting and delayed observation labels. Production build and generated SEO audit checked separately. Browser visual verification has not been performed in this phase.
