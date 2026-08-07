import * as Phaser from 'phaser';
import { saveService } from '../services/SaveService';

export interface InputState { desiredAngle: number | null; boosting: boolean; }

export class PlayerInputController {
  readonly state: InputState = { desiredAngle: null, boosting: false };
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private steerPointerId: number | null = null;
  private boostPointerIds = new Set<number>();
  joystickOrigin = { x: 120, y: 600 };
  joystickVector = { x: 0, y: 0 };

  constructor(private scene: Phaser.Scene, private getHead: () => {x:number;y:number}) {
    const kb = scene.input.keyboard;
    if (kb) this.keys = kb.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,ESC') as Record<string, Phaser.Input.Keyboard.Key>;

    scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const bx = scene.scale.width * (1165 / 1280), by = scene.scale.height * (610 / 720);
      const isBoost = Math.hypot(p.x - bx, p.y - by) <= Math.max(70, scene.scale.width * 0.065);
      if (isBoost) {
        this.boostPointerIds.add(p.id);
        this.state.boosting = true;
        return;
      }
      if (this.steerPointerId !== null) return;
      this.steerPointerId = p.id;
      this.joystickOrigin.x = p.x; this.joystickOrigin.y = p.y;
      this.setFromPointer(p);
    });

    scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.id === this.steerPointerId) this.setFromPointer(p);
    });

    const release = (p: Phaser.Input.Pointer) => {
      this.boostPointerIds.delete(p.id);
      if (p.id === this.steerPointerId) {
        this.steerPointerId = null;
        this.joystickVector.x = 0; this.joystickVector.y = 0;
      }
      this.state.boosting = this.boostPointerIds.size > 0 || Boolean(this.keys?.SPACE?.isDown);
    };
    scene.input.on('pointerup', release);
    scene.input.on('pointerupoutside', release);
  }

  private setFromPointer(p: Phaser.Input.Pointer): void {
    const settings = saveService.get().settings;
    if (settings.controlStyle === 'drag') {
      const head = this.getHead();
      const wp = p.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
      this.state.desiredAngle = Math.atan2(wp.y - head.y, wp.x - head.x);
    } else {
      const dx = p.x - this.joystickOrigin.x, dy = p.y - this.joystickOrigin.y;
      const len = Math.hypot(dx,dy) || 1; const max=68;
      this.joystickVector.x = dx/len*Math.min(max,len); this.joystickVector.y = dy/len*Math.min(max,len);
      if (len > 8) this.state.desiredAngle = Math.atan2(dy, dx);
    }
  }

  update(currentHeading: number): void {
    let dx=0,dy=0;
    if (this.keys) {
      if (this.keys.A.isDown || this.keys.LEFT.isDown) dx--;
      if (this.keys.D.isDown || this.keys.RIGHT.isDown) dx++;
      if (this.keys.W.isDown || this.keys.UP.isDown) dy--;
      if (this.keys.S.isDown || this.keys.DOWN.isDown) dy++;
    }
    if (dx || dy) this.state.desiredAngle = Math.atan2(dy,dx);
    else if (this.steerPointerId === null && this.state.desiredAngle === null) this.state.desiredAngle = currentHeading;
    this.state.boosting = this.boostPointerIds.size > 0 || Boolean(this.keys?.SPACE?.isDown);
  }
}
