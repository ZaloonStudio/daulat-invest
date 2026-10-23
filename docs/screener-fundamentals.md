# Advanced screener fundamentals

The screener offers seven PSX market filters and 19 supplemental fundamental filters. Supplemental values are requested only when an advanced filter or advanced sort is selected; active metrics also become sortable results columns.

The public SCSTrade stock search POST query supplies 17 historical/source valuation metrics together. Expected P/E and expected growth each use independent requests: their smaller coverage must not exclude companies with historical ratios. Three bounded requests are cached for one hour, rather than crawling hundreds of company pages for each visitor.

Source: https://www.scstrade.com/stocksearch/StockSearch.aspx

Values are exact published source ratios, not recalculated using the current PSX price. Reporting periods vary; the interface labels the source and estimates. The source does not provide individual reporting dates in this bulk response. Retrieval time is not a financial statement date. Company detail pages retain the individually dated fundamentals.

Unknown values are omitted. Zero/nonpositive expected P/E, PEG, P/B and EV/EBITDA are excluded as nonmeaningful multiples. Negative returns and margins remain filterable. Duplicate symbols with ambiguous financial bases are excluded. Conflicting consolidated/unconsolidated figures are never merged. CSV includes detailed ratio source and financial basis.

An unavailable request marks its metrics unavailable, so an outage cannot masquerade as zero matching companies. Healthy metrics remain usable. An entirely failed source returns 503 with retry in the interface.

ROIC is not available in this source and is not substituted with ROE or ROCE. Expected figures are SCSTrade estimates, not Daulat forecasts or analyst consensus.

Tests cover captured PRL/MEBL/LUCK/SYS fields, negative returns, missing values, ambiguous identities, partial outages, basis conflicts, source mapping, range filtering and exports.
