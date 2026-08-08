import * as Phaser from 'phaser';
import './styles/game.css';
import { BootScene } from './game/scenes/BootScene';
import { PreloadScene } from './game/scenes/PreloadScene';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { ComfortGameScene } from './game/scenes/ComfortGameScene';
import { ResultsScene } from './game/scenes/ResultsScene';

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;
const TEXT_RESOLUTION = Math.max(2, window.devicePixelRatio || 1);

function renderPixelRatio(): number {
  return Math.max(1, window.devicePixelRatio || 1);
}

function displaySize(): { width: number; height: number } {
  const container = document.getElementById('game-container');
  return {
    width: Math.max(1, container?.clientWidth || window.innerWidth),
    height: Math.max(1, container?.clientHeight || window.innerHeight),
  };
}

const initialDisplaySize = displaySize();
const initialPixelRatio = renderPixelRatio();

// Text is rendered into its own texture. Keep those textures high-resolution even
// when the camera scales the logical 1280x720 layout up to the native canvas.
const originalTextResolution = Phaser.GameObjects.Text.prototype.setResolution;
Phaser.GameObjects.Text.prototype.setResolution = function (value: number): Phaser.GameObjects.Text {
  return originalTextResolution.call(this, Math.max(value, TEXT_RESOLUTION));
};

const originalTextFactory = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (
  x: number,
  y: number,
  text: string | string[],
  style?: Phaser.Types.GameObjects.Text.TextStyle,
): Phaser.GameObjects.Text {
  return originalTextFactory.call(this, x, y, text, style).setResolution(TEXT_RESOLUTION);
};

function viewportScale(scene: Phaser.Scene): number {
  const { width, height } = scene.scale.gameSize;
  return Math.min(width / LOGICAL_WIDTH, height / LOGICAL_HEIGHT);
}

function applyLogicalViewport(scene: Phaser.Scene, logicalZoom = 1, centerLogicalView = false): void {
  const { width, height } = scene.scale.gameSize;
  const fit = viewportScale(scene);
  const viewportWidth = LOGICAL_WIDTH * fit;
  const viewportHeight = LOGICAL_HEIGHT * fit;
  const camera = scene.cameras.main;

  camera.setViewport(
    Math.round((width - viewportWidth) / 2),
    Math.round((height - viewportHeight) / 2),
    Math.round(viewportWidth),
    Math.round(viewportHeight),
  );
  camera.setZoom(fit * logicalZoom);

  // Phaser camera scroll values are expressed in unzoomed game pixels. When a
  // large high-DPI viewport is zoomed down to the 1280x720 logical scene, leaving
  // scroll at (0, 0) makes the camera look inward from the logical top-left.
  // Static scenes should always frame the complete logical canvas instead.
  if (centerLogicalView) camera.centerOn(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
}

function keepLogicalViewport(
  scene: Phaser.Scene,
  getLogicalZoom: () => number,
  centerLogicalView = false,
): void {
  const resize = () => applyLogicalViewport(scene, getLogicalZoom(), centerLogicalView);
  resize();
  scene.scale.on('resize', resize);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.scale.off('resize', resize));
}

class NativePreloadScene extends PreloadScene {
  preload(): void {
    applyLogicalViewport(this, 1, true);
    super.preload();
  }
}

class NativeMainMenuScene extends MainMenuScene {
  create(): void {
    super.create();
    keepLogicalViewport(this, () => 1, true);
  }
}

class NativeResultsScene extends ResultsScene {
  create(): void {
    super.create();
    keepLogicalViewport(this, () => 1, true);
  }
}

class NativeGameScene extends ComfortGameScene {
  create(): void {
    super.create();

    const runtime = this as unknown as {
      player: { alive: boolean; mass: number };
      updateCamera(): void;
    };
    let logicalZoom = 0.98;

    runtime.updateCamera = () => {
      if (!runtime.player.alive) return;
      const targetLogicalZoom = Phaser.Math.Clamp(1.01 - Math.sqrt(runtime.player.mass) * 0.005, 0.86, 0.99);
      logicalZoom = Phaser.Math.Linear(logicalZoom, targetLogicalZoom, 0.012);
      this.cameras.main.setZoom(viewportScale(this) * logicalZoom);
      this.cameras.main.setFollowOffset(0, 0);
    };

    // Gameplay owns camera centering through startFollow(), so don't force the
    // logical center here. Only keep its high-DPI viewport and zoom in sync.
    keepLogicalViewport(this, () => logicalZoom);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  // Phaser 4 renders the canvas backing store at the configured game size. Keep
  // that backing store at physical-device resolution, then shrink only the CSS
  // display size through ScaleManager zoom. Camera coordinates stay logical.
  width: Math.round(initialDisplaySize.width * initialPixelRatio),
  height: Math.round(initialDisplaySize.height * initialPixelRatio),
  backgroundColor: '#0d1726',
  antialias: true,
  render: { antialias: true, pixelArt: false, roundPixels: false },
  scale: {
    mode: Phaser.Scale.NONE,
    zoom: 1 / initialPixelRatio,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: false,
  },
  fps: { target: 60, forceSetTimeOut: false },
  input: { activePointers: 2 },
  scene: [BootScene, NativePreloadScene, NativeMainMenuScene, NativeGameScene, NativeResultsScene],
};

const game = new Phaser.Game(config);

function syncHighDpiBackingBuffer(): void {
  const pixelRatio = renderPixelRatio();
  const size = displaySize();
  const backingWidth = Math.max(1, Math.round(size.width * pixelRatio));
  const backingHeight = Math.max(1, Math.round(size.height * pixelRatio));
  const cssZoom = 1 / pixelRatio;
  const scale = game.scale;

  const zoomChanged = Math.abs(scale.zoom - cssZoom) > 0.0001;
  const sizeChanged = scale.gameSize.width !== backingWidth || scale.gameSize.height !== backingHeight;

  if (zoomChanged) scale.setZoom(cssZoom);
  if (sizeChanged) scale.resize(backingWidth, backingHeight);
}

window.addEventListener('resize', syncHighDpiBackingBuffer, { passive: true });

const gameContainer = document.getElementById('game-container');
if (gameContainer && typeof ResizeObserver !== 'undefined') {
  const resizeObserver = new ResizeObserver(syncHighDpiBackingBuffer);
  resizeObserver.observe(gameContainer);
}

window.requestAnimationFrame(syncHighDpiBackingBuffer);
