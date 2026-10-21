# Firebase login and Android portfolio integration

The website uses the production zaloon-aecb6 project, Web app 1:400676871624:web:a1d9167dee32844ba934fd, and the existing project API key already distributed with Android. After the owner enabled Authentication, this key returned the expected Firebase project number 400676871624 and both authorized website domains. The earlier supplied Web key returned API_KEY_INVALID and is no longer the fallback. NEXT_PUBLIC_FIREBASE_API_KEY can override the default, but an override must pass the same verification.

## Login and session
- The header, portfolio, watchlist and community share one Firebase Auth instance.
- Google uses the enabled Firebase Google provider; email/password uses the account credentials already created for the app.
- Persistent local browser storage restores the session after refresh, with session-only and in-memory fallbacks when persistent storage is unavailable.
- No service-account secret is shipped to the browser. Google access tokens are not used to guess another user's document path.

## Shared cloud records
| Android collection | Web behavior |
| --- | --- |
| users/{verified Firebase UID}/portfolio | Live holdings, same document IDs, symbol/companyName/shares/buyPrice/buyDate |
| users/{verified Firebase UID}/trades | Live realized trades, Android sharesSold/sellDate supported; missing profit derived from quantity and sale/purchase prices |
| users/{verified Firebase UID}/watchlist | Live symbol list; additions/removals update the same user-scoped documents |

Portfolio loading waits for both collections. Sign-out/account changes mask old-account records immediately, unsubscribe listeners and ignore obsolete callbacks. Permission errors are visible and portfolio sync can be retried. Guest browser watchlists stay separate from cloud accounts.

## Verification
Run npm run verify:firebase to check the actual configured API key against the expected project, authorized domains and Google Auth URI generation. This performs no account creation or data writes. npm test covers Android record compatibility and portfolio calculations. npm run build checks production compilation.

Complete the following acceptance check with a real existing app account:
1. Open https://www.daulatinvest.com/portfolio in a normal browser and sign in with the same Google/email identity used for cloud sync in Android.
2. Confirm holdings, quantities, cost basis, trade history and watchlist match that account's uploaded records.
3. Refresh the page and confirm the session persists.
4. Verify changes appear on the other device after its normal cloud refresh.
5. Sign out and ensure account records disappear; another account must never show the previous account's data.

The browser automation session did not have a real authenticated app account. Private reads/writes, password-reset delivery and cross-device visibility are therefore not claimed as verified. No live holdings were added/deleted during testing.

## Existing Android fallback sessions
The Android source contains a legacy local/synthetic-email fallback when a Google ID token is unavailable. Such sessions do not necessarily correspond to a verified Google Firebase UID. The web application deliberately does not reconstruct synthetic passwords or read guessed email-derived user IDs. Local-only app records need a secure upload under the verified account before they can appear on the website. This website update does not publish a new Android release or migrate legacy accounts.
