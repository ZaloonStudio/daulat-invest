# Dated NAV sources — 23 October 2026

The public MUFAP report still returns HTTP403 in this environment. NBP and HBL official endpoints are independently accessible and supply dated NAVs for seven exact-name funds in the existing 28-fund directory.

- HBL: `https://hblasset.com/products/` uses a public read-only POST (`action=load_hbl_products`) to its WordPress AJAX endpoint. Parse `nav_nav` with `nav_updated_date`. The separate month-end performance fields are withheld: MTD is not rolling30D, and the performance dates differ from NAV dates. No return convention is inferred from the asset category.
- NBP: `https://www.nbpfunds.com/fund-prices/fund-nav-view/` publishes dated offer and redemption prices. Its own FAQ (`https://www.nbpfunds.com/investor-education/faqs/general/`) defines redemption price as NAV. Select the redemption column and retain the label `NAV / redemption`; never use the higher offer price. No performance returns are provided by this adapter.

Each populated fund shows its own source link and valuation date. NAVs retain four decimal places in the table, details and CSV. The CSV also includes provenance and return basis. Coverage status counts matched catalog entries, not all records returned by an upstream endpoint. A filter can show only funds with observed NAVs.

Requests run independently in parallel, have eight-second timeouts and use a15-minute Next data cache. MUFAP remains enabled when accessible. Match exact normalized fund/plan names and require matching AMC for direct feeds. Prefer the newest observation; duplicate same-source records or conflicting NAVs for the same date remain unavailable. Missing values never fall back to the catalog's legacy illustrative numbers.

English valuation dates are validated against actual calendar days; ambiguous numeric dates and future valuations are rejected. Older dates retain the existing delayed label after72hours. The modal's return-convention label now follows the source rather than always saying annualized.

`node scripts/audit-funds.cjs` records live coverage in `fund-audit-latest.json`. Captured primary-source fixtures test column selection, exact plan matching, precision, missing/future values, independent source failures and total outages.

## Remaining coverage

This does not restore the full MUFAP feed. Meezan, MCB, Alfalah, NIT and Atlas pages also blocked direct reads, and the tested UBL endpoint failed to connect. No challenges were bypassed and no search result was imported as a financial feed. The remaining21 catalog funds and unverified returns stay unavailable. Broader coverage needs accessible official data endpoints or an authorized licensed feed. Reference catalog profiles are not represented as a full current AMC/category audit.
