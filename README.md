# Coil Arena

Coil Arena is an original offline-first snake-arena game built with Phaser 4.2.1, TypeScript and Vite. The browser game includes Classic, Battle Royale and Rush; Meadow, Desert and Neon arenas; 20-snake matches with five bot personality profiles; food, growth, boosting, size-based body combat, death mass, leaderboard, camera scaling/look-ahead, results and replay; persistent coins, XP/levels, eight skins, shop, eight missions, seven-day rewards, settings, tutorial and lifetime stats.

The project bundles original procedural visuals and locally generated WAV music/SFX. Core play requires no account, credentials or network service after the web app assets are served.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. The game is landscape-first and shows a rotate-device overlay on mobile portrait screens.

## Validate and build

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

`npm run build` writes the production web app to `dist/`.

## Controls

- Mouse/touch drag: steer toward the pointer
- Joystick style: select in Settings, then steer from the left side
- WASD / Arrow keys: desktop steering
- Space: boost
- Esc: pause/resume
- Touch bottom-right boost area: boost; multi-touch steering + boost is supported

## Architecture

- `src/game/scenes`: boot, preload, menu, gameplay and results
- `src/game/entities`: snake rendering/state and pooled food entities
- `src/game/ai`: staggered bot decisions and personality profiles
- `src/game/systems`: normalized input, spatial grid and pure combat/ranking rules
- `src/game/services`: local save, progression, event bus, real local audio and future service hooks
- `src/game/networking`: offline session and disabled online-session shell
- `src/game/config`: centralized balance, modes, arenas, skins, missions and rewards
- `public/assets`: local audio and original app icon

## Gameplay systems

The snake body follows distance-sampled path history, so segment spacing is not tied to frame rate. Food and snake proximity use spatial grids instead of global every-object scans. Combat uses the configured 1.05 power threshold and bounded body-segment sampling. Classic and Rush recycle bot snakes on respawn; Battle Royale has no respawns and a shrinking safe zone. Match rewards are granted once before Results, then save immediately.

## Development notes

`npm test` covers pure progression, save recovery, combat threshold, leaderboard ordering, spatial-grid movement and required content counts. `QA_CHECKLIST.md` contains the manual acceptance route. `VALIDATION.md` records what was and was not executable in the build environment used to prepare this project.

For Android packaging, see `BUILD_ANDROID.md`.
