import * as Phaser from 'phaser';
import type { SpatialItem } from '../systems/SpatialGrid';

export type FoodKind = 'tiny' | 'normal' | 'large' | 'golden' | 'death';

export class FoodOrb implements SpatialItem {
  readonly id: string;
  active = false;
  x = 0; y = 0; value = 1; kind: FoodKind = 'normal';
  readonly view: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, index: number) {
    this.id = `food-${index}`;
    this.view = scene.add.circle(-9999, -9999, 6, 0xffffff, 1).setDepth(3).setVisible(false);
  }

  spawn(x:number,y:number,kind:FoodKind,value:number,color:number): void {
    // Food is deliberately snapped to whole logical pixels. The native viewport
    // then performs one stable transform into physical pixels instead of combining
    // fractional object placement, pulsing scale and CSS canvas interpolation.
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.kind = kind;
    this.value = value;
    this.active = true;

    const radius = kind==='golden'?10:kind==='large'?9:kind==='death'?8:kind==='tiny'?5:7;
    this.view
      .setPosition(this.x,this.y)
      .setRadius(radius)
      .setFillStyle(color,1)
      .setStrokeStyle(0)
      .setScale(1)
      .setVisible(true)
      .setActive(true);
  }

  recycle(): void {
    this.active=false;
    this.view.setVisible(false).setActive(false).setPosition(-9999,-9999).setScale(1);
  }

  animate(_time:number): void {
    // Intentionally static. Fractional pulse scaling made 5-10 px circles shimmer
    // while moving through the camera, which reads as blur at gameplay speed.
    if (this.active && this.view.scaleX !== 1) this.view.setScale(1);
  }
}
