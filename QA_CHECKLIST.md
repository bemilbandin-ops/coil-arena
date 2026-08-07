# Coil Arena QA Checklist

Use this route after `npm install && npm run dev`, then repeat against `npm run build && npm run preview`.

- Startup: preload completes; main menu appears; no fatal console errors; music begins after first user interaction.
- Main menu: cycle all three modes and arenas; open Skins, Shop, Missions, Daily, Settings, Stats and Credits; every Back action works.
- Skins/shop: default skin equips; insufficient funds are rejected; affordable skin purchase deducts coins once; purchased skin equips and persists.
- Gameplay: 3-2-1-GO; mouse/touch/keyboard steer; Space boosts; two-finger steer + bottom-right boost works; Esc/touch pause freezes simulation timers.
- Movement/body: continuous forward motion; no instant reversal; body follows smoothly; starting body is nine visible segments; large tab-resume delta does not jump the snake.
- Growth/audio/VFX: food collects once; mass/body grow; camera zooms/look-ahead follows heading; pickup/growth SFX and lightweight pickup feedback trigger.
- Combat: two-second active-play spawn protection prevents kills; larger snake can defeat smaller at the 1.05 threshold; death mass appears; kill/reward happens once; player death transitions once.
- Bots: five behavior profiles seek food, flee danger, pursue prey, boost and avoid boundaries; Classic/Rush reuse/respawn bots; Battle Royale never respawns them.
- Modes: Classic is 180s; Rush is 90s with denser food/faster player growth; Battle Royale shrinks the safe zone and continues into overtime until one snake remains if necessary.
- HUD: timer, score, kills, mass, rank and Top 5 update; player rank remains visible outside Top 5; danger/prey readability is not color-only.
- Results: placement and all requested stats appear; score counts up; coin/XP reward and XP bar animate; level-up cue appears when applicable; Play Again, Home and Change Skin all work.
- Progression: coins, XP, levels, missions, claims, daily reward, lifetime stats and tutorial completion persist after refresh/reopen.
- Settings: music/SFX volumes, vibration, controls, sensitivity, graphics quality, FPS option and fullscreen respond; reset asks for confirmation.
- Mobile: landscape canvas uses safe areas; portrait rotate overlay appears; no page scroll, text selection, pinch zoom or overscroll.
- Replay lifecycle: play several matches back-to-back and verify no stale snakes, food, timers, overlays, duplicate rewards or destroyed-object errors remain.
