# News feed audit — 23 October 2026

Only publisher RSS headlines, original article links, image URLs and publication timestamps are used. No article body or invented summary is displayed. This validates feed handling, not the factual truth of each publisher's reporting.

## Changes

- Accept articles from the last14days. Label stories older than72hours, and show timestamp in Asia/Karachi consistently on home, News and company news.
- Require a timezone-bearing RSS timestamp. Reject future dates, credentials, nonstandard ports, wrong hosts and malformed article routes. Remove tracking queries/fragments from publisher links.
- Deduplicate article IDs despite slug/URL variations, plus repeated normalized titles within a publisher. Connected duplicate groups are resolved consistently. Independent publishers' coverage is retained, not merged by fuzzy topic similarity. Feed display is capped at50headlines.
- Show both source statuses, including failures and feeds with no recent stories. One publisher's outage does not discard the healthy publisher. HTTP200 challenge HTML is not accepted as RSS. Each request has an eight-second timeout and five-minute Next data caching.
- Search trims surrounding whitespace. Full feed failure no longer suggests that clearing filters will fix upstream availability.
- Stock Announcements panels now include company news from the current feed. Matching uses clear company-name phrases or explicit ticker notation (`PSX:LUCK`, `$LUCK`, `(LUCK)`), with selected brand aliases. Generic industry words and plain symbol substrings do not match. It is deliberately conservative and can miss headlines that use only an ambiguous abbreviation. Empty matches mean no matched headline in this feed, not that no company news exists anywhere.

## Verification

`node scripts/audit-news.cjs` records source statuses, dated article samples and sample link HEAD checks in `news-audit-latest.json`. HTTP403 or a timeout on an article link is an unverified read, not proof that the publisher URL is broken. The matching sample is reported even when no company-specific headlines are present.

Regression tests cover URL identity chains, repeated titles, age and timezone validation, PKT date rollover, false company matches, partial outages, malformed HTML and empty recent feeds. Production UI checks cover source status, filters, publication time and the stock news panel. No publisher availability guarantee or claim of complete news coverage is made.
