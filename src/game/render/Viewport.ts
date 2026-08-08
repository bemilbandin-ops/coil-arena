import * as Phaser from 'phaser';

export const LOGICAL_WIDTH = 1280;
export const LOGICAL_HEIGHT = 720;
export const LOGICAL_HALF_WIDTH = LOGICAL_WIDTH / 2;
export const LOGICAL_HALF_HEIGHT = LOGICAL_HEIGHT / 2;

export interface LogicalViewport {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export function getLogicalViewport(scene: Phaser.Scene): LogicalViewport {
  const gameWidth = Math.max(1, scene.scale.gameSize.width);
  const gameHeight = Math.max(1, scene.scale.gameSize.height);
  const scale = Math.max(0.01, Math.min(gameWidth / LOGICAL_WIDTH, gameHeight / LOGICAL_HEIGHT));
  const width = Math.round(LOGICAL_WIDTH * scale);
  const height = Math.round(LOGICAL_HEIGHT * scale);

  return {
    x: Math.round((gameWidth - width) / 2),
    y: Math.round((gameHeight - height) / 2),
    width,
    height,
    scale,
  };
}

/**
 * Maps the existing 1280x720 presentation coordinates directly onto a native
 * RESIZE canvas. Camera origin is deliberately top-left: with origin (0, 0),
 * logical x/y are simply multiplied by the fit scale instead of being zoomed
 * around the physical center of the larger canvas.
 */
export function applyStaticViewport(scene: Phaser.Scene): LogicalViewport {
  const viewport = getLogicalViewport(scene);
  const camera = scene.cameras.main;

  camera
    .setViewport(viewport.x, viewport.y, viewport.width, viewport.height)
    .setOrigin(0, 0)
    .setScroll(0, 0)
    .setZoom(viewport.scale);

  return viewport;
}

/**
 * Gameplay uses the same native viewport, but follows a world-space target.
 * With a top-left camera origin, a 640x360 follow offset places the followed
 * object at the center of the logical 1280x720 view while HUD objects with
 * scrollFactor(0) retain their existing screen-space coordinates.
 */
export function applyGameplayViewport(scene: Phaser.Scene): LogicalViewport {
  const viewport = getLogicalViewport(scene);
  const camera = scene.cameras.main;

  camera
    .setViewport(viewport.x, viewport.y, viewport.width, viewport.height)
    .setOrigin(0, 0)
    .setZoom(viewport.scale)
    .setFollowOffset(LOGICAL_HALF_WIDTH, LOGICAL_HALF_HEIGHT);

  return viewport;
}

function bindViewport(scene: Phaser.Scene, apply: () => void): void {
  apply();
  scene.scale.on(Phaser.Scale.Events.RESIZE, apply);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.scale.off(Phaser.Scale.Events.RESIZE, apply);
  });
}

export function bindStaticViewport(scene: Phaser.Scene): void {
  bindViewport(scene, () => { applyStaticViewport(scene); });
}

export function bindGameplayViewport(scene: Phaser.Scene): void {
  bindViewport(scene, () => { applyGameplayViewport(scene); });
}
