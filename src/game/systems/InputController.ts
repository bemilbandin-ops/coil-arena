import * as Phaser from 'phaser';
import { saveService } from '../services/SaveService';

export interface InputState { desiredAngle: number | null; boosting: boolean; }

export class PlayerInputController {
  readonly state: InputState = { desiredAngle: null, boosting: false };
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private steerPointer: Phaser.Input.Pointer | null = null;
  private boostPointerIds = new Set<number>();
  private keyboardWasSteering = false;
  private lockHeadingOnNextUpdate = false;

  joystickOrigin = { x: 120, y: 600 };
  joystickVector = { x: 0, y: 0 };

  constructor(private scene: Phaser.Scene, private getHead: () => {x:number;y:number}) {
    const kb = scene.input.keyboard;
    if (kb) this.keys = kb.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,ESC') as Record<string, Phaser.Input.Keyboard.Key>;

    scene.input.on('pointerdown', this.onPointerDown, this);
    scene.input.on('pointermove', this.onPointerMove, this);
    scene.input.on('pointerup', this.onPointerRelease, this);
    scene.input.on('pointerupoutside', this.onPointerRelease, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  get pointerSteering(): boolean { return this.steerPointer !== null; }

  private onPointerDown(p: Phaser.Input.Pointer): void {
    const bx = this.scene.scale.width * (1165 / 1280);
    const by = this.scene.scale.height * (610 / 720);
    const isBoost = Math.hypot(p.x - bx, p.y - by) <= Math.max(70, this.scene.scale.width * 0.065);
    if (isBoost) {
      this.boostPointerIds.add(p.id);
      this.state.boosting = true;
      return;
    }

    if (this.steerPointer) return;
    this.steerPointer = p;
    this.joystickOrigin.x = p.x;
    this.joystickOrigin.y = p.y;
    this.setFromPointer(p);
  }

  private onPointerMove(p: Phaser.Input.Pointer): void {
    if (p.id === this.steerPointer?.id) this.setFromPointer(p);
  }

  private onPointerRelease(p: Phaser.Input.Pointer): void {
    this.boostPointerIds.delete(p.id);
    if (p.id === this.steerPointer?.id) {
      this.steerPointer = null;
      this.joystickVector.x = 0;
      this.joystickVector.y = 0;
      // Freeze the direction the snake is actually facing on release. This avoids
      // continuing to rotate toward an old pointer target after the finger/mouse is up.
      this.lockHeadingOnNextUpdate = true;
    }
    this.state.boosting = this.boostPointerIds.size > 0 || Boolean(this.keys?.SPACE?.isDown);
  }

  private setFromPointer(p: Phaser.Input.Pointer): void {
    const settings = saveService.get().settings;
    if (settings.controlStyle === 'drag') {
      // Re-evaluate against the live camera so the snake follows the finger/mouse
      // position continuously while the pointer is held and moved across the screen.
      const head = this.getHead();
      const wp = p.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
      const dx = wp.x - head.x;
      const dy = wp.y - head.y;
      if (dx * dx + dy * dy > 36) this.state.desiredAngle = Math.atan2(dy, dx);
      return;
    }

    const dx = p.x - this.joystickOrigin.x;
    const dy = p.y - this.joystickOrigin.y;
    const len = Math.hypot(dx, dy) || 1;
    const max = 68;
    this.joystickVector.x = dx / len * Math.min(max, len);
    this.joystickVector.y = dy / len * Math.min(max, len);
    if (len > 8) this.state.desiredAngle = Math.atan2(dy, dx);
  }

  update(currentHeading: number): void {
    // Pointer steering wins over keyboard. Recalculate every frame while held so a
    // stationary finger remains a stable screen-space steering target as the camera moves.
    if (this.steerPointer) {
      this.setFromPointer(this.steerPointer);
      this.keyboardWasSteering = false;
    } else {
      let dx = 0;
      let dy = 0;
      if (this.keys) {
        if (this.keys.A.isDown || this.keys.LEFT.isDown) dx--;
        if (this.keys.D.isDown || this.keys.RIGHT.isDown) dx++;
        if (this.keys.W.isDown || this.keys.UP.isDown) dy--;
        if (this.keys.S.isDown || this.keys.DOWN.isDown) dy++;
      }

      if (dx || dy) {
        // Left/right by themselves behave like steering a wheel: they keep turning
        // only while held. Add a vertical key and WASD/arrows become a directional vector.
        if (dy === 0 && dx !== 0) {
          this.state.desiredAngle = currentHeading + dx * Phaser.Math.DegToRad(42);
        } else {
          this.state.desiredAngle = Math.atan2(dy, dx);
        }
        this.keyboardWasSteering = true;
        this.lockHeadingOnNextUpdate = false;
      } else if (this.keyboardWasSteering || this.lockHeadingOnNextUpdate) {
        // Releasing a steering input means "continue exactly this way".
        this.state.desiredAngle = currentHeading;
        this.keyboardWasSteering = false;
        this.lockHeadingOnNextUpdate = false;
      } else if (this.state.desiredAngle === null) {
        this.state.desiredAngle = currentHeading;
      }
    }

    this.state.boosting = this.boostPointerIds.size > 0 || Boolean(this.keys?.SPACE?.isDown);
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerRelease, this);
    this.scene.input.off('pointerupoutside', this.onPointerRelease, this);
  }
}
