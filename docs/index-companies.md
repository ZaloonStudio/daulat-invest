# Index companies

Selecting an index on Market opens its Companies view; Chart remains available beside it. Homepage index shortcuts open the same list. Each company links to its stock page. Search and price, daily change, or volume sorting operate only within the selected index.

Membership comes from the existing PSX screener LISTED IN field merged into market quotes. Exact normalized tokens are matched, symbols deduplicated, and untraded members retained. Production membership is never a hardcoded list. Missing membership is shown as unavailable; an unexpected count for a fixed-size index is flagged.

Shareable example: `/market?index=KSE30&view=companies`. Direct requests render the selected membership on the server. Query variants keep the canonical `/market` URL. Source membership refreshes with the existing market feed cache.

Verification: captured PSX KSE30 fixture contains 30 members; tests cover exact matching, aliases, deduplication and untraded members. Browser checks cover full lists, search, sorting, navigation, chart switching and reload.
