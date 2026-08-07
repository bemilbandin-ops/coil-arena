# Known limitations

- Online multiplayer is not implemented. `OnlineMatchSession` is a disabled shell; the complete playable path is offline as required by the browser-first design.
- The native `android/` project is not committed because the preparation environment did not include Android Studio/SDK. `capacitor.config.ts` and `BUILD_ANDROID.md` contain the creation, sync and AAB steps.
- Combat samples a bounded subset of very long snake bodies instead of every visible body segment on every candidate pair. This preserves body-contact combat while controlling hot-path work in 20-snake matches.
- The in-game 30 FPS setting throttles gameplay simulation updates; it does not force the browser compositor/display refresh rate to 30 Hz.
- A full dependency-resolved Vite production build and graphical Chromium playthrough could not be executed in the preparation sandbox because its internal npm mirror returns E404 for Phaser and local/file browser navigation is restricted. Project-owned TypeScript, emitted JavaScript syntax, pure logic and bundled audio were validated separately; see `VALIDATION.md`.
