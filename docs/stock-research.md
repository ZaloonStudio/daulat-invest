# Stock research consolidation — 23 October 2026

Eight sparse tabs become six useful views: Overview, Fundamentals, Technicals, Competitors, Announcements and Profile.

- Overview retains the chart and actual daily trading statistics, adding reported annual/latest-quarter EPS to the snapshot.
- Fundamentals combines annual and quarterly statement history, historical PSX ratios, reported payout history and source financial/Shariah disclosures. Annual EPS and annual-EPS P/E are distinguished from the screener's TTM P/E. Statement amounts remain in PKR thousands; EPS remains PKR per share. Revenue YoY uses positive prior-year revenue. No analyst forecasts or forward multiples are invented.
- Technicals uses daily PSX closing-price history: Wilder RSI(14), SMA20/50/200, EMA20/50, MACD12/26 and its EMA9 signal, average/relative volume20. Closing-price ranges are explicitly labelled closing ranges, not intraday highs/lows. Insufficient history is unavailable, not a default score. These are measured indicators, not a fabricated buy/sell consensus.
- Competitors shows same-sector companies ranked by reported market capitalization, with price, daily change, TTM P/E, yield, cap and 1-year price change. They are sector comparisons, not a claim of identical business models.
- Profile reads the official PSX business description, leadership, contacts, auditor, registrar, fiscal year end, outstanding shares and free-float shares. No ownership structure is inferred from market cap.
- Announcements retain their official document links.

Source: `https://dps.psx.com.pk/company/{symbol}` and its normal authenticated-session AJAX payout request to `/company/payouts`. Research data uses a one-hour source cache and a bounded request timeout. Cached fiscal periods and publication dates remain visible. Company-specific parser fixtures were captured for PRL (industrial) and MEBL (bank), including an explicitly empty PRL payout table and eight returned MEBL payout entries. Empty tables are distinguished from an inaccessible source.

Payout percentages remain as reported by PSX: they are not converted into per-share cash without a verified face value, and not relabelled as investment yields. PSX's reported annual EPS growth/PEG are identified as source-reported rather than recomputed forecasts. Leadership can differ from screenshots of another site; the official source is used.

Old `#ratios-section` and `#dividends-section` links open Fundamentals; `#shariah-section` opens Profile. All panels have server-rendered content, tab controls, accessible keyboard navigation, and a single unchanged canonical stock URL. Useful content is retained when consolidating tabs.

The duplicate sidebar promotion and large stock-page app banner are removed. The large homepage app banner and the app CTA inside mutual fund details are also removed; navigation/footer app links remain available.

Validation: source parser fixtures cover fiscal periods, losses, bank-specific rows, authentic report links, empty-versus-unavailable payouts, safe profile URLs and equity figures. Indicator tests cover flat/rising/falling histories, aligned MACD windows, true zero readings and insufficient data. Mobile-speed testing remains deferred.
