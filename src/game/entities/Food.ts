import * as Phaser from 'phaser';
import type { SpatialItem } from '../systems/SpatialGrid';

export type FoodKind = 'tiny' | 'normal' | 'large' | 'golden' | 'death';

export class FoodOrb implements SpatialItem {
  readonly id: string;
  active = false;
  x = 0; y = 0; value = 1; kind: FoodKind = 'normal';
  readonly view: Phaser.GameObjects.Arc;
  private phase = Math.random() * Math.PI * 2;
  constructor(scene: Phaser.Scene, index: number) { this.id=`food-${index}`; this.view=scene.add.circle(-9999,-9999,5,0xffffff,1).setDepth(3).setVisible(false); }
  spawn(x:number,y:number,kind:FoodKind,value:number,color:number): void { this.x=x;this.y=y;this.kind=kind;this.value=value;this.active=true; const radius = kind==='golden'?8:kind==='large'?7:kind==='death'?6:kind==='tiny'?3.5:5; this.view.setPosition(x,y).setRadius(radius).setFillStyle(color,1).setVisible(true).setActive(true); }
  recycle(): void { this.active=false; this.view.setVisible(false).setActive(false).setPosition(-9999,-9999); }
  animate(time:number): void { if (!this.active) return; const s=1+Math.sin(time*0.004+this.phase)*0.09; this.view.setScale(s); }
}
