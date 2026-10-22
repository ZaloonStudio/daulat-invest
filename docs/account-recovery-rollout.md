# Shared verified account resolution and legacy recovery

## Production behavior

Web and Android resolve cloud ownership through /api/account-link. It accepts only a Firebase ID token in Authorization, never an email, desired UID, legacy path, synthetic password or Google access token. Project/issuer/expiry are prefiltered, Firebase accounts:lookup verifies the token, disabled/mismatched identities fail closed, and responses are private/no-store. Tokens are not logged or persisted by the endpoint. No service-account credential is needed or exposed.

Normal verified users resolve to their Firebase UID. The approved legacy link registry in src/lib/account-data-owner.ts is now server-authoritative and shared by both platforms. Owner's already-confirmed link remains intact. Other existing legacy folders have no trustworthy email/owner metadata; no safe universal automatic mapping can be inferred from a 32-bit hash. The update prevents new legacy-only identities and supplies a reviewed recovery path, not a claim that every historical account has been migrated.

## Approving a legacy account

1. Have the user sign in with verified Google on web. The empty portfolio has a recovery mailto link to the configured Firebase public support address; it prepopulates only the signed-in email and recovery reference. The application does not send mail automatically.
2. In project-owner Firebase Console, identify the verified Auth UID and confirm the claimant's app login and actual holdings using independent ownership evidence. A matching email hash alone is insufficient; ambiguous ownership must not be linked.
3. Check both the canonical UID folder and legacy folder. If both have data, reconcile conflicts with the owner first; do not redirect away from unrelated records, overwrite a portfolio, or copy blindly.
4. Add an explicit UID-to-legacy link only after approval; run tests, build and deploy. Web refresh/retry and Android verified sign-in then resolve the same folder, with original document IDs.
5. For full physical migration later, export a backup, run an idempotent conflict-aware administrator migration, and retire legacy writes only after the old app is no longer in use. This task deliberately does not copy/delete live holdings.

## Security rollout limitation

The existing shared Firebase project has temporary open Firestore rules expiring November 12, 2026. They were not broadened or extended. They remain a database authorization risk and need a separate coordinated rules rollout with the Play app update and reviewed legacy mappings; authenticated account resolution alone is not a Firestore security boundary. Do not claim full production security or permanent all-user rollout until that work and device acceptance are complete. Other apps share this project, so global rules must not be silently locked down.

## Validation

30 web tests cover invalid/expired/foreign-project tokens, Firebase rejection despite plausible claims, disabled/UID-mismatched accounts, body spoofing, approved vs standard owner resolution, no-store responses and unavailable-service failures. Next production build and Android signed APK/AAB compile. Real Android Google sign-in, cross-device mutations and production token-backed lookup still require acceptance on a signed-in/device session; no live financial records were mutated for testing.

## Production acceptance update

After deployment, an existing authenticated Chrome session successfully resolved the shared service and rendered all 15 confirmed owner holdings on the live website. Anonymous and malformed-token production API requests both returned 401 with private/no-store headers. Financial records were not modified. Native Android sign-in/mutations still need device testing.

Google Play internal-testing draft 1.2.7 (28) — Verified account sync was created with release notes and saved. No bundle was uploaded: Chrome extension file URL access was disabled and blocked fileChooser.setFiles. No track was rolled out and the existing closed test was left unchanged.
