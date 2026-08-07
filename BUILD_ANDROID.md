# Android build notes

The browser build is the source of truth. Validate it first with `npm run build` and `npm run preview`.

1. Install dependencies: `npm install`
2. Build web assets: `npm run build`
3. Dependencies already include Capacitor 8.4.2. Add Android once on a development machine with Android Studio / SDK installed: `npx cap add android`
4. Sync built assets: `npx cap sync android`
5. Open Android Studio: `npx cap open android`
6. In Android Studio, set landscape orientation in the Android manifest/activity configuration if your release policy requires a hard landscape lock.
7. Replace the temporary package ID `com.example.coilarena` in `capacitor.config.ts` before release, then re-create/sync native project identifiers as appropriate.
8. Replace generated launcher icons with original Coil Arena app icons using Android Studio's Image Asset tooling.
9. Build a signed Android App Bundle (AAB) using Android Studio's Generate Signed Bundle workflow and a protected release keystore.

The configured Capacitor `webDir` is `dist`. The web UI already blocks scrolling, pinch zoom and overscroll, fills the viewport, uses safe-area CSS and displays a rotate-device overlay in mobile portrait orientation.
