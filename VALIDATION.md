# Validation record

This file distinguishes checks that were actually executed from checks blocked by the preparation sandbox.

## Executed successfully

- Strict TypeScript semantic check of every file under `src/` using TypeScript 5.8.3 plus sandbox-only declarations for unavailable Phaser/Vitest packages: PASS.
- TypeScript emission of the current source followed by `node --check` on all 23 emitted JavaScript modules: PASS.
- Executable pure-logic checks: PASS for reward placement scaling, increasing XP curve, malformed-save recovery, invalid-value clamping, mission progression, mission claim idempotence, the 1.05 combat threshold, deterministic leaderboard ordering and spatial-grid relocation.
- Content acceptance counts: PASS — 3 modes, 3 arenas, 8 skins, 30 bot names, 8 missions and 7 daily-reward entries.
- Local audio integrity: PASS — 11 bundled mono 16-bit 22,050 Hz WAV assets opened successfully and contain audio frames.
- Unfinished-marker scan: PASS — no banned unfinished-work markers were found in the shipped source or release documentation.

The declaration shims and emitted validation directories used for these sandbox checks are not part of the shipped project archive.

## Blocked by sandbox infrastructure

The sandbox npm registry returned E404 for `phaser@4.2.1`, so `npm install`, dependency-resolved `npm run typecheck`, `npm test`, `npm run build` and `npm run preview` could not be executed here. The real `package.json` remains configured for the public npm ecosystem and does not depend on the sandbox declarations.

Graphical Chromium QA against localhost/file URLs was also restricted by the sandbox browser policy. Therefore this preparation record does not claim that the complete visual/manual route was browser-executed in this environment. Run the commands and route in `QA_CHECKLIST.md` on a normal development machine with public npm access before release.
