import * as Phaser from 'phaser';
import './styles/game.css';
import { BootScene } from './game/scenes/BootScene';
import { PreloadScene } from './game/scenes/PreloadScene';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { ComfortGameScene } from './game/scenes/ComfortGameScene';
import { ResultsScene } from './game/scenes/ResultsScene';
import {
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  applyGameplayViewport,
  bindGameplayViewport,
  bindStaticViewport,
} from './game/render/Viewport';

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
const initialBackingWidth = Math.max(1, Math.round(initialDisplaySize.width * initialPixelRatio));
const initialBackingHeight = Math.max(1, Math.round(initialDisplaySize.height * initialPixelRatio));
const initialBackingFit = Math.min(initialBackingWidth / LOGICAL_WIDTH, initialBackingHeight / LOGICAL_HEIGHT);

// Phaser Text is rendered into its own texture before the camera scales it.
// Match that texture detail to the actual physical-pixel camera scale so glyphs
// are never enlarged from a lower-resolution text texture.
const TEXT_RESOLUTION = Math.min(6, Math.max(2, Math.ceil(initialBackingFit)));
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

class PresentationPreloadScene extends PreloadScene {
  preload(): void {
    bindStaticViewport(this);
    super.preload();
  }
}

class PresentationMainMenuScene extends MainMenuScene {
  create(): void {
    bindStaticViewport(this);
    super.create();
  }
}

class PresentationResultsScene extends ResultsScene {
  create(): void {
    bindStaticViewport(this);
    super.create();
  }
}

class PresentationGameScene extends ComfortGameScene {
  create(): void {
    super.create();

    const runtime = this as unknown as {
      player: { alive: boolean };
      updateCamera(): void;
    };

    // Keep gameplay on one stable camera scale. The only scale applied is the
    // logical 1280x720 -> physical backing-buffer transform in Viewport.ts.
    runtime.updateCamera = () => {
      if (!runtime.player.alive) return;
      applyGameplayViewport(this);
    };

    bindGameplayViewport(this);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',

  // The canvas backing store is physical-pixel sized. ScaleManager zoom only
  // controls its CSS box, so one backing pixel maps to one device pixel on a
  // normal high-DPI display instead of letting the browser enlarge a CSS-sized
  // canvas after Phaser has rendered it.
  width: initialBackingWidth,
  height: initialBackingHeight,
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
  scene: [
    BootScene,
    PresentationPreloadScene,
    PresentationMainMenuScene,
    PresentationGameScene,
    PresentationResultsScene,
  ],
};

const game = new Phaser.Game(config);

function syncPhysicalBackingBuffer(): void {
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

window.addEventListener('resize', syncPhysicalBackingBuffer, { passive: true });

const gameContainer = document.getElementById('game-container');
if (gameContainer && typeof ResizeObserver !== 'undefined') {
  const resizeObserver = new ResizeObserver(syncPhysicalBackingBuffer);
  resizeObserver.observe(gameContainer);
}

window.requestAnimationFrame(syncPhysicalBackingBuffer);
