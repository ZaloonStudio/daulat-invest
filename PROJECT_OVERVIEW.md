# Daulat Invest — Master Project Overview & Architecture Blueprint

**Live Domain:** https://daulatinvest.com  
**GitHub Repository:** https://github.com/ZaloonStudio/daulat-invest (`main` branch)  
**Local Codebase Location:** `C:\Users\My\.gemini\antigravity\scratch\psx_stock_tracker\web`  
**Mobile App Codebase Location:** `C:\Users\My\.gemini\antigravity\scratch\psx_stock_tracker\app`

---

## 1. Project Mission & Identity
Daulat Invest is Pakistan's premier stock market intelligence platform, bridging real-time Pakistan Stock Exchange (PSX) data, mutual funds, gold/commodities, and portfolio tracking into a modern, minimalist fintech terminal inspired by Sarmaaya.pk, Investify.pk, and the Daulat Android mobile app.

---

## 2. Tech Stack & Dependencies
* **Framework:** Next.js 14.2 (App Router with Server & Client Components)
* **Language:** TypeScript 5
* **Styling:** Tailwind CSS (Theme configured with signature dark palette + bright mode toggle)
* **Charting Engine:** TradingView `lightweight-charts` (Area, Candlesticks, LineSeries, Histogram)
* **Icons:** `lucide-react`
* **Deployment:** Vercel (Auto-deploys on `git push origin main`)
* **Live API Engine:** PSX DPS (Data Portal Services) scraper & session token authentication

---

## 3. Core Color Palette & Design Tokens
* **Base Background:** `#0B0E14` (Deep obsidian black)
* **Card Surface:** `#161B22` (Secondary elevation)
* **Hover / Inset:** `#21262D`
* **Borders / Dividers:** `#30363D`
* **Brand Primary:** `#FFB401` (Daulat Gold)
* **Accent Teal / Cyan:** `#00D2B4` (Screener, primary actions)
* **Stock Curve Blue:** `#1988FF` (Company comparison line)
* **Index Curve Red:** `#E53935` (KSE-100 benchmark line)
* **Success / Gains:** `#00C076`
* **Warning / Losses:** `#F85149`
* **Muted Text:** `#8B949E` / `#6E7681`
* **High-Contrast Text:** `#F0F6FC`

---

## 4. Key Pages & Routes Directory
| Route | Component File | Description |
|---|---|---|
| `/` | `src/app/page.tsx` + `HomeClientContainer.tsx` | Main market homepage with Quick Links, KSE-100 Hero Chart, Gold/Commodities widget, Market Movers, Sector breakdown, News & Announcements |
| `/stocks/[symbol]` | `src/app/stocks/[symbol]/page.tsx` | Stock detail page with **Daulat Health Score** (radar + 5 rating bars), **StockHistoryChart** (Index vs Company, Market Cap, SIP, TradingView), sub-navigation tabs, and fundamental research console |
| `/stocks/screener` | `src/app/stocks/screener/page.tsx` | Interactive PSX Stock Screener with 1-click strategy presets (Bluechips, Shariah, High Dividend, Value), custom filters, and CSV export |
| `/mutual-funds` | `src/app/mutual-funds/page.tsx` | Comprehensive directory of 50+ Pakistani Mutual Funds across 8 leading AMCs (Meezan, Alfalah, NBP, MCB, HBL, UBL, Atlas, NIT) with live NAVs, returns, risk profiles, and CSV export |
| `/stocks/compare` | `src/app/stocks/compare/page.tsx` | Multi-stock financial comparison matrix |
| `/commodities` | `src/app/commodities/page.tsx` | Gold 24K (Per Tola / 10g), Silver, Petrol, Crude Oil, and Bullion calculator |
| `/forex` | `src/app/forex/page.tsx` | SBP Interbank & Open market foreign exchange rates |
| `/fear-greed` | `src/app/fear-greed/page.tsx` | PSX Market Sentiment Gauge & Historical Indicator |
| `/dividend-calculator` | `src/app/dividend-calculator/page.tsx` | Dividend yield and payout projector |
| `/sip-calculator` | `src/app/sip-calculator/page.tsx` | Systematic Investment Plan wealth compounder |
| `/news` | `src/app/news/page.tsx` | Curated business & economic news |
| `/community` | `src/app/community/page.tsx` | Investor discussion feed and comment threads |
| `/portfolio` | `src/app/portfolio/page.tsx` | In-browser portfolio tracker & profit/loss calculator |
| `/watchlist` | `src/app/watchlist/page.tsx` | User custom stock watchlist |

---

## 5. Deployment Instructions
1. Run local build check: `npm run build`
2. Commit and push:
   ```bash
   git add .
   git commit -m "Your descriptive commit message"
   git push origin main
   ```
3. Vercel automatically deploys to `https://daulatinvest.com` in ~40 seconds.
