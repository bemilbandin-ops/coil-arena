import * as Phaser from 'phaser';
import { GameScene } from './GameScene';
import { Snake } from '../entities/Snake';
import { BotBrain } from '../ai/BotBrain';
import { BOT_NAMES, SKINS } from '../config/content';
import { BalanceConfig } from '../config/balance';

/**
 * Comfort/balance layer over the core simulation.
 * Keeps GameScene's systems intact while reducing visual motion and ensuring
 * new players have several genuinely weaker opponents available to hunt.
 */
export class ComfortGameScene extends GameScene {
  create(): void {
    const runtime = this as unknown as {
      arena: { width:number; height:number; backgroundColor:number; boundaryColor:number; accentColor:number };
      center: { x:number; y:number };
      safeRadius: number;
      snakes: Snake[];
      bots: Map<string, BotBrain>;
      player: Snake;
      snakeGrid: { insert(item:Snake):void };
      randomSafePoint(margin?:number,minSnakeDistance?:number): {x:number;y:number};
      randomSkin(): (typeof SKINS)[number];
      drawArena(): void;
      spawnBot(index:number,reuse?:Snake): void;
      headTouches(attacker:Snake,victim:Snake): boolean;
      updateCamera(): void;
    };

    // Flat ground: no random dots, flowers, stones, or neon tick carpet moving
    // beneath the camera. The boundary is enough spatial reference by itself.
    runtime.drawArena = () => {
      const g = this.add.graphics().setDepth(0);
      g.fillStyle(runtime.arena.backgroundColor, 1);
      g.fillRect(0, 0, runtime.arena.width, runtime.arena.height);
      g.lineStyle(18, runtime.arena.boundaryColor, 0.42);
      g.strokeCircle(runtime.center.x, runtime.center.y, BalanceConfig.arena.radius);
      g.lineStyle(3, runtime.arena.accentColor, 0.18);
      g.strokeCircle(runtime.center.x, runtime.center.y, BalanceConfig.arena.radius - 38);
    };

    // Guarantee a useful prey population instead of spawning almost every bot
    // much larger than the player. The first six bots are deliberately small.
    runtime.spawnBot = (index:number, reuse?:Snake) => {
      const p = runtime.randomSafePoint(300, 220);
      const mass = index < 6 ? Phaser.Math.Between(6, 9) : Phaser.Math.Between(10, 22);
      const heading = Math.random() * Math.PI * 2;

      if (reuse) {
        runtime.bots.delete(reuse.id);
        reuse.respawn(p.x, p.y, heading, mass);
        runtime.bots.set(reuse.id, new BotBrain(reuse, index));
        runtime.snakeGrid.insert(reuse);
        return;
      }

      const bot = new Snake(this, {
        id: `bot-${index}-${Math.floor(this.time.now)}`,
        displayName: BOT_NAMES[index % BOT_NAMES.length],
        isPlayer: false,
        isBot: true,
        x: p.x,
        y: p.y,
        heading,
        skin: runtime.randomSkin(),
        mass,
      });
      runtime.snakes.push(bot);
      runtime.bots.set(bot.id, new BotBrain(bot, index));
      runtime.snakeGrid.insert(bot);
    };

    // Slightly more forgiving contact so a visible hit actually feels like a hit.
    runtime.headTouches = (attacker:Snake, victim:Snake) => {
      const headRadius = (attacker.radius + victim.radius) * 0.9;
      if (Phaser.Math.Distance.Squared(attacker.x, attacker.y, victim.x, victim.y) <= headRadius * headRadius) return true;

      const step = Math.max(1, Math.ceil(victim.segments.length / 24));
      for (let i = 0; i < victim.segments.length; i += step) {
        const seg = victim.segments[i];
        if (!seg.visible) continue;
        const r = attacker.radius + seg.radius * 0.88;
        if (Phaser.Math.Distance.Squared(attacker.x, attacker.y, seg.x, seg.y) <= r * r) return true;
      }
      return false;
    };

    // Keep world geometry at a stable 1:1 logical camera zoom. The previous
    // continuously changing fractional zoom softened small food circles and made
    // their edges shimmer while moving.
    runtime.updateCamera = () => {
      if (!runtime.player.alive) return;
      if (this.cameras.main.zoom !== 1) this.cameras.main.setZoom(1);
      this.cameras.main.setFollowOffset(0, 0);
    };

    super.create();

    this.cameras.main.startFollow(runtime.player.head, true, 0.22, 0.22);
    this.cameras.main.setFollowOffset(0, 0);
    this.cameras.main.setZoom(1);
  }
}
