# Interaction audit — 22 October 2026

## Implemented fixes
- Visitor-local default appearance: light from 07:00 until 19:00; dark otherwise. An explicit light/dark preference wins on future visits, page navigation and later clock changes. Pre-paint initialization tolerates unavailable storage.
- All eight stock research tabs now select content, expose the selected state, support keyboard arrows/Home/End, preserve hash deep links, and follow browser history. Financial statements link to PSX because the current quote feed does not include them. Company information and symbol-filtered announcements have actual panels and explicit empty states.
- Duplicate/mixed-format chart timestamps are normalized before chart rendering. Last record per timestamp is retained. The KSE30 long-range history previously crashed the home page on duplicate timestamps; 3Y and 5Y were retested after the fix. Stale index fetches are aborted.
- Header stock search ignores stale requests and supports outside-click behavior on mobile and desktop.
- Shared Firebase sign-in entry in the header, portfolio, watchlist and community. Google sign-in and existing-account email/password login use the same Firebase Auth instance; password reset and actionable configuration/provider/popup errors are provided. Uses the official Web app configuration supplied during this audit.
- App portfolio uses users/{Firebase UID}/portfolio. Sold trades support the Android fields sharesSold and sellDate, and derive realized P/L when the app does not store profit. Older web trade fields remain readable. Subscription failures are displayed.
- Signed-in watchlists use users/{Firebase UID}/watchlist, matching Android. Guest browser lists remain separate. An intentionally emptied guest list stays empty after reload.
- Volume-leader preset now has a matching 2,000,000-volume dropdown option. Directory query removal resets filters. Index navigation points to the index section, and the USD snapshot leads to Forex.
- Announcement category matching is case-insensitive; empty categories have visible feedback. Comparison links deduplicate stock symbols. Fund details support labeled dismissal and Escape. Risk disclosure controls are labeled.
- Supplied transparent PNG replaces the former opaque logo; CSS sizing fits its actual artwork. No generated reinterpretation of the logo was used.

## Verification
- Automated regression suite: theme boundaries and stored overrides, pre-paint script with blocked storage, Android/web portfolio record compatibility, realized gain/loss, timestamp values, all stock hash routes, auth error handling, chart timestamp ordering and duplicate removal.
- Source inventory: every native button declaration has an action handler or submit semantics. This is a wiring check, not a substitute for runtime validation of account writes.
- Browser checks: all eight stock tabs and a direct company-info deep link; five stock chart modes and eight timeframes; index switching and long-range chart recovery; six stock screening presets and sort headers; five fund presets, four risk filters and details/close; commodity category/purity controls; currency conversion; six dividend presets and tax toggle; four SIP presets; guest watchlist add/remove/empty persistence/reset; all announcement categories; news source filters and clear; Shariah search/sector filtering; comparison add/remove/deduplication; portfolio trade switching; community sentiment filtering and form open/cancel; sign-in dialog validation and Google configuration-error presentation; saved theme after reload.
- Lint and production build are required before deployment. Browser checks use local preview; no test posts were published and no real account portfolio records were modified.
- CSV handlers were reviewed and invoked. The in-app browser did not deliver a download event, so downloaded-file content was not verified in that browser.

## Firebase setup and remaining acceptance

Update: Authentication has since been enabled. The original Android project key now passes project/domain/Google-provider checks and replaces the invalid Web-key fallback. See [current integration status](firebase-integration.md). The notes below describe the earlier audit findings.
The production project confirmed by the owner is zaloon-aecb6. The original Android-key configuration returned CONFIGURATION_NOT_FOUND. During the audit, the owner supplied an official Web app config in commit 912470a; that update was preserved. The new Web API key currently returns API key not valid from both the public project configuration and Google createAuthUri endpoints. The owner has been asked to verify the exact Console key (or allow propagation if newly created). Web code cannot enable Firebase Authentication or providers with a public API key.

Required Console configuration:
1. Initialize Firebase Authentication and enable Google and Email/Password sign-in.
2. Authorize daulatinvest.com and www.daulatinvest.com. Authorize localhost separately only if local login testing is desired.
3. Register a Firebase Web app and configure its NEXT_PUBLIC_FIREBASE_* settings in deployment if using a distinct browser API key or app ID. Keep the same production project.
4. Keep existing owner-scoped Firestore rules for users/{uid}/portfolio, trades and watchlist. Do not make user data public to resolve permission errors.
5. Complete a real Google/email sign-in and verify that an existing app account displays its own uploaded holdings, watchlist and trade history. Sign-out and account switching must clear the previous account's data.

The Android source includes a legacy local/synthetic-email fallback when Google tokens are unavailable. Such a local session is not equivalent to a verified Firebase Google account. The website deliberately does not reproduce synthetic passwords or access legacy documents by guessed email-derived IDs. App-only local data must first be securely uploaded under the user's verified Firebase UID; separate existing credentials may require password recovery or a controlled account migration.

Successful live account sign-in, private reads/writes, password-reset email delivery, and cross-device data visibility remain unverified until the owner completes Firebase setup and supplies/uses a valid account. Existing feed content, generated sample data and financial formulas have not been independently certified by this interaction audit.
