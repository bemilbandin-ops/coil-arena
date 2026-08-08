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

function applyLogicalViewport(scene: Phaser.Scene, logicalZoom = 1): void {
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
}

function keepLogicalViewport(scene: Phaser.Scene, getLogicalZoom: () => number): void {
  const resize = () => applyLogicalViewport(scene, getLogicalZoom());
  resize();
  scene.scale.on('resize', resize);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.scale.off('resize', resize));
}

class NativePreloadScene extends PreloadScene {
  preload(): void {
    applyLogicalViewport(this);
    super.preload();
  }
}

class NativeMainMenuScene extends MainMenuScene {
  create(): void {
    super.create();
    keepLogicalViewport(this, () => 1);
  }
}

class NativeResultsScene extends ResultsScene {
  create(): void {
    super.create();
    keepLogicalViewport(this, () => 1);
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

    keepLogicalViewport(this, () => logicalZoom);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: LOGICAL_WIDTH,
  height: LOGICAL_HEIGHT,
  backgroundColor: '#0d1726',
  antialias: true,
  render: { antialias: true, pixelArt: false, roundPixels: false },
  scale: {
    // RESIZE changes the canvas itself to the available area. The camera then
    // maps the existing 1280x720 game coordinates into a centered 16:9 viewport.
    // This avoids FIT's CSS stretching while preserving every existing layout.
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true,
  },
  fps: { target: 60, forceSetTimeOut: false },
  input: { activePointers: 2 },
  scene: [BootScene, NativePreloadScene, NativeMainMenuScene, NativeGameScene, NativeResultsScene],
};

new Phaser.Game(config);
