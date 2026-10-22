# Android sync update 1.2.7 (28)

These reviewed source files are also applied to the sibling Android project at ../app. The Android project is not a Git checkout, so this source snapshot preserves the update with the website repository. Copy app/ into the Android project's app/ and set versionCode 28 / versionName 1.2.7 in its existing Gradle configuration. Signing credentials and keystores are intentionally excluded.

Built artifacts are in ../app/build/outputs/apk/release/app-release.apk and ../app/build/outputs/bundle/release/app-release.aab. Do not uninstall the production app or clear its storage to test this change. Use a Play internal testing update signed by the same Play app signing key; a locally signed APK may not update a Play-signed installation.

## Behavior

- Google sign-in requires a verified ID token exchanged with Firebase. Device email pickers and predictable-password fallback are removed.
- Both web and Android use POST /api/account-link with a Firebase bearer ID token. The server verifies project/issuer/time and asks Firebase to verify the token. It resolves approved compatibility links or the verified UID for standard users. Never provide a UID or email in the body to select data.
- Failed account resolution stops cloud reads/writes; it never falls back to a guessed folder.
- Account switch/sign-out archives device-private records separately. Unassigned legacy records are retained as local archives, not silently uploaded to another account. Existing cloud folders remain untouched.
- Cloud reads use server snapshots; no empty-cloud auto-upload. Profiles update only after all three collections succeed. Missing/failed reads do not report sync success. Local pre-refresh copies are archived.
- Existing approved legacy accounts continue reading and writing their original folder without duplicate copies. Other legacy accounts require ownership review.

## Firebase configuration

Production PSX Firebase app already had SHA-1 3F:DE:46:00:4D:F7:9A:26:09:DB:E9:B7:E4:4F:A9:D0:18:0A:A5:DE and a SHA-256 fingerprint. They were retained. Added existing local release/upload cert SHA-1 AD:8A:E3:AD:73:29:FB:19:86:BE:48:E6:0C:53:BD:F7:99:15:11:05. Verify the actual Play app-signing certificate against Play Console before rollout; the upload certificate alone is not proof of the store-installed certificate. Firebase config download did not complete in automation. The existing project/app IDs remain in place and google_auth.xml supplies the confirmed production Web OAuth client when generated default_web_client_id is absent.

## Mandatory device acceptance before release

No Android device/emulator was connected during compilation. Builds are not a claim of real-device sign-in or sync success. On Play internal testing verify: existing approved account restores holdings/watchlist; second verified account sees only its own data; sign-out clears visible private records; app/web add and remove the same document; cancellation/config/network failures show errors; old local records remain archived; reinstall restores cloud records only after verified login. Check Google consent and signing certificate on the actual Play-signed build.

This AAB has NOT been uploaded or published to Google Play by this task.
