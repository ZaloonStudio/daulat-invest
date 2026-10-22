# Supplemental stock fundamentals

Stock research keeps the official PSX statements, payout history and quotes, and adds SCSTrade snapshot ratios from the same public endpoint used by the Android app. The server caches requests for one hour and limits upstream requests to eight seconds.

Book value also appears in the overview snapshot. Fundamentals groups valuation, profitability/returns and financial health in three compact panels. Every ratio uses its own source reporting period; missing periods are explicitly unavailable. Source-snapshot P/B, EV and EV/EBITDA are not presented as recalculations from the PSX quote.

The parser verifies the requested company symbol, preserves genuine zero and negative values, and leaves missing or malformed values null. No bundled Android defaults or estimated ratios are used. SCSTrade reports asset turnover as a percentage; it is converted to times by dividing by 100. Inventory turnover is retained as the source numeric turnover value, consistent with the Android display.

Regression coverage uses a captured PRL span fixture and checks periods, units, wrong-company rejection, missing values, zero and losses. Live smoke checks covered PRL, MEBL and KEL; bank-specific unavailable ratios remain unavailable.
