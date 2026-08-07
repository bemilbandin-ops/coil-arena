import * as Phaser from 'phaser';
import type { SpatialItem } from '../systems/SpatialGrid';

export type FoodKind = 'tiny' | 'normal' | 'large' | 'golden' | 'death';

export class FoodOrb implements SpatialItem {
  readonly id: string;
  active = false;
  x = 0; y = 0; value = 1; kind: FoodKind = 'normal';
  readonly view: Phaser.GameObjects.Arc;
  private phase = Math.random() * Math.PI * 2;

  constructor(scene: Phaser.Scene, index: number) {
    this.id = `food-${index}`;
    this.view = scene.add.circle(-9999, -9999, 5, 0xffffff, 1).setDepth(3).setVisible(false);
  }

  spawn(x:number,y:number,kind:FoodKind,value:number,color:number): void {
    this.x=x; this.y=y; this.kind=kind; this.value=value; this.active=true;
    const radius = kind==='golden'?9:kind==='large'?8:kind==='death'?7:kind==='tiny'?4.5:6;
    this.view
      .setPosition(x,y)
      .setRadius(radius)
      .setFillStyle(color,0.96)
      .setStrokeStyle(kind==='tiny'?0:1,0xffffff,kind==='tiny'?0:0.18)
      .setScale(1)
      .setVisible(true)
      .setActive(true);
  }

  recycle(): void {
    this.active=false;
    this.view.setVisible(false).setActive(false).setPosition(-9999,-9999).setScale(1);
  }

  animate(time:number): void {
    if (!this.active) return;
    // Keep the common pickup field visually still. Only valuable pickups breathe,
    // and at a much lower amplitude, so the whole ground no longer shimmers.
    if (this.kind==='golden' || this.kind==='large') {
      this.view.setScale(1 + Math.sin(time*0.0025 + this.phase) * 0.025);
    } else if (this.view.scaleX !== 1) {
      this.view.setScale(1);
    }
  }
}
