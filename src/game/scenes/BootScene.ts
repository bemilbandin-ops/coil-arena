import * as Phaser from 'phaser';
import { saveService } from '../services/SaveService';

export class BootScene extends Phaser.Scene {
  constructor(){super('BootScene');}
  create():void{
    saveService.load();
    document.addEventListener('visibilitychange',()=>{ if(document.hidden) this.game.loop.sleep(); else this.game.loop.wake(); });
    this.scene.start('PreloadScene');
  }
}
