# Local bullion rates and public-provider research

Daily local quotes now prefer dated APGJSA-attributed Mettis Global reports discovered through the public /Commodities page. Only numeric rates, date and source URL are used; article bodies are not republished. Public category and up to three report requests are server-cached for 30 minutes. Changed markup, blocked access, invalid dates, absent association attribution or inconsistent weight conversions fail closed. Reports older than four calendar days are not eligible. Prior-day quotes retain the original date. A source outage uses the existing explicitly labelled international benchmark; the app never invents a local premium.

Current report independently checked on 23 October 2026:
- Mettis: https://mettisglobal.news/Gold-price-in-Pakistan-falls-Rs7000-per-tola-64471
- Business Recorder: https://www.brecorder.com/news/40445628
Both report gold Rs424,536/tola and silver Rs5,865/tola. Mettis reports Rs363,971 and Rs5,028 per 10 grams. Preserve reported 10g numbers rather than rounding a tola conversion back into a supposedly quoted 10g rate. This is publisher-attributed market data, not a direct association API. Independent corroboration was done for this date; future updates are not automatically certified by a second publisher.

Historical metal charts retain futures prices converted using historical FX. They have their own source and international-chart title; local daily announcements are not inserted into or used to rescale that history. Calculators use the displayed current quote. No new estimated-value disclaimer or FAQ copy is added.

## Research workflow

Run `node scripts/research-bullion.mjs --samples 3 --interval-seconds 60`. It stores public numeric snapshots in ignored `research/bullion/observations.jsonl` and a summary JSON. Calls are limited to a maximum of 24 samples with at least 60 seconds between rounds. No background scheduler or paid subscription is created.

Both source clocks are kept separate from collection time. Sarafa.pk currently exposes a date and wall-clock display without a timezone-qualified price observation timestamp. These samples are quarantined from fitting, rather than assuming PKT. Fetching pages together does not make their underlying market observations contemporaneous. Comparative differences and implied FX are research diagnostics, not proven vendor adjustments.

Only aligned observations within 60 seconds, at least 20 observations across five dates, qualify for research-only fixed-rupee and percentage models. The last 30% of records are held out for evaluation. No model is deployed into prices. Public API city/pathoor adjustments do not establish its upstream gold/silver formula.

First run: three rounds / six metal observations. Sarafa gold stayed Rs413,200/tola and silver Rs5,600/tola. No eligible aligned observations, so no fitted formula. More rows alone cannot fix unknown source timestamps.
