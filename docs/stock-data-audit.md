# Stock data audit — 23 October 2026

Sample: PRL (refinery), MEBL (bank), LUCK (cement), HUBC and KEL (power), UNITY (missing EPS coverage), EPCL (loss-making annual results).

## Findings and changes

- The official company pages identify P/E as TTM, based on unconsolidated financials. Keep that distinct from price divided by the latest annual EPS. PRL's TTM and annual P/E differ legitimately.
- SCSTrade explicitly identifies LUCK and HUBC as consolidated. Preserve that basis beside the supplemental ratios and overview book value, rather than implying they share the PSX unconsolidated statement basis. If the source gives no basis, say so.
- Supplemental price-sensitive ratios can use a different price snapshot than the PSX quote. Display the source snapshot price. Do not silently recalculate enterprise value from incompatible data.
- KEL's latest available annual data is FY2024. Mark older reporting years in the fundamentals panel and overview snapshot; retain the original period.
- UNITY's official tables omit EPS. Preserve unavailable EPS and annual P/E rather than deriving EPS from net income and today's shares.
- EPCL's FY2025 EPS is negative. Preserve losses, and leave annual P/E unavailable when EPS is zero, missing or negative.
- Revenue growth labeled YoY now requires consecutive reporting years, preventing a multi-year change from being described as annual growth.
- Asset turnover conversion follows the actual source unit (% versus x). Enterprise value in millions converts to billions; absent magnitude units stay unavailable.

## Verification

`node scripts/audit-stocks.cjs` writes the captured sample to `stock-audit-latest.json`. It checks independent company-page closing prices and annual EPS, screener dividend yields, price-change arithmetic, and market cap against source share counts. Quotes move across endpoint requests; the price comparison allows 0.5% or Rs0.01, and dividend yield allows 0.02 percentage points. Differences require review rather than being silently corrected.

Regression tests cover source-basis detection, source-unit changes, missing values, losses, non-consecutive years and old-report labels. The normal production build checks types and lint.

## Limits

This is a seven-company sample and an integration/calculation audit, not a verification of every number against signed issuer accounts. PSX payout rows and dividend yields remain source-reported; an empty payout response does not establish that a company has never paid dividends. No upstream report, date or payout is rewritten to resolve source omissions. Provider snapshot time and financial reporting period are separate concepts. Mutual-fund NAV availability and news coverage are separate follow-up work.
