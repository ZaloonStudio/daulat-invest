# Market data accuracy audit — 23 October 2026

## Implemented

- PSX daily OHLC, previous close, rupee change and daily volume now use the public market-watch response used by PSX itself. Screener metrics are joined by symbol; its 30-day average volume remains a separate field. Free float is a share count, not a percentage.
- Exchange breadth, volume, session state and source timestamp come from the trading panel. The timestamp is the report observation, not the website visitor's clock. Index opening and 52-week prices are not inferred from previous close or daily ranges.
- Securities present only in the screener remain discoverable; their session fields are explicitly marked unavailable. Their percentage-based previous close uses `price / (1 + percentage / 100)`. They are excluded from daily volume leaders.
- All random chart fallbacks, seeded company health scores, invented book values, example payout histories and hardcoded market/news/announcement fallbacks were removed.
- Stock comparison aligns real observations by Pakistan trading date and rebases each series to 100. Calendar periods use dates rather than a misleading count of trading rows. SIP buys fractional shares at the first available close of each month. Historical dividends, costs and tax are excluded. Market-cap history is explicitly an estimate using today's reported share count, not historical outstanding shares.
- TradingView opens the external chart rather than displaying fabricated OHLC candles. Intraday stock data is requested separately from daily history.
- News uses Dawn and The Express Tribune business RSS, keeps its publication date and actual article URL, and displays headlines without fabricated summaries or unrelated news photos. The checked cache interval is five minutes; this is not a streaming news service.
- Announcements parse PSX's actual HTML response and actual attachment/document links, with company-symbol filtering on stock pages. Rows without a source PDF are omitted; no PDF identifiers are guessed.
- Dividend calculator presets use reported PSX price/yield, with DPS identified as implied. The 15%/30% choices are tax scenarios, not a claim of universal applicable rates.
- Portfolio missing quotes no longer silently use purchase cost as current price. Incomplete valuations and profit/loss are shown unavailable.
- Mutual fund reporting basis is retained where the source identifies annualized/absolute returns. The directory defaults to alphabetical order, indicates valuation dates and missing figures, and avoids treating different categories' returns as directly comparable.

## Source access and limits

Public source contracts checked:

- https://dps.psx.com.pk/trading-panel
- https://dps.psx.com.pk/screener
- https://dps.psx.com.pk/market-watch (PSX's normal AJAX request headers)
- https://dps.psx.com.pk/timeseries/eod/KEL
- https://dps.psx.com.pk/announcements (PSX's normal company POST form)
- https://www.dawn.com/feeds/business
- https://www.mufap.com.pk/Industry/IndustryStatDaily?tab=1

MUFAP returned HTTP 403 with a browser challenge in this environment. Al Meezan's official prices page and NIT's home page also returned challenges; UBL's prices page failed to connect. No challenges were bypassed, no search snippets were turned into a financial feed, and no unverified provider was substituted. Reliable fund NAV/return coverage remains dependent on permitted report/API access. The existing MUFAP adapter shows unavailable values when access or validation fails; a successful live MUFAP table has not yet been validated against it. Fund profile metadata remains reference information.

PSX historical corporate-action adjustment behavior has not been independently reconciled. Comparisons are labelled price returns, not total returns. The sentiment model uses a fixed 250-million-share volume reference; its UI now discloses that assumption rather than claiming a measured trailing baseline or institutional flows.

## Verification

`tests/fixtures/` contains small public-source excerpts captured on 23 October 2026, with market observations from 22 October. RSS fixtures retain only a headline, URL and publication date, not the article body. They are test inputs and are never production fallbacks.

Tests cover actual daily-versus-average volume mapping, source timestamps, zero breadth, authentic attachment links, RSS dates/domain validation, matched-date comparison, monthly share purchases, fund return basis and upstream outages. Mobile performance testing is deferred per the user's instruction.

## Fund profile corrections

Conventional equity categories for NBP Stock Fund and Alfalah GHP Stock Fund, conventional income/moderate risk for NBP Mahana Amdani Fund, and Islamic income/moderate risk for Meezan Daily Income Fund were checked against official AMC pages:

- https://www.nbpfunds.com/investment-options/conventional-funds/equity-funds/nafa-stock-fund/
- https://www.nbpfunds.com/investment-options/conventional-funds/income-funds/nbp-mahana-amdani-fund/
- https://alfalahamc.com/downloads/key-fact-statement/key-fact-statements-of-conventional-funds/
- https://www.almeezangroup.com/regular-investor/mutual-funds/meezan-daily-income-plan-i/

The inaccurate MUFAP-verified-benchmarks badge was removed. Unverified trustee/benchmark entries are no longer presented as current facts. Complete current fund/plan verification remains pending provider access.

Production verification found Dawn unavailable from the deployment even though it worked locally. The independent Express Tribune business feed (https://tribune.com.pk/feed/business), linked from its official RSS page, was added with publisher-specific URL validation. Either feed can fail independently without manufacturing news.
