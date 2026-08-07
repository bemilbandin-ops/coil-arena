import * as Phaser from 'phaser';

const AUDIO: Array<[string, string]> = [
  ['music-loop', '/assets/audio/music.wav'],
  ['sfx-ui', '/assets/audio/ui.wav'],
  ['sfx-pickup', '/assets/audio/pickup.wav'],
  ['sfx-large', '/assets/audio/large.wav'],
  ['sfx-growth', '/assets/audio/growth.wav'],
  ['sfx-kill', '/assets/audio/kill.wav'],
  ['sfx-death', '/assets/audio/death.wav'],
  ['sfx-start', '/assets/audio/start.wav'],
  ['sfx-end', '/assets/audio/end.wav'],
  ['sfx-reward', '/assets/audio/reward.wav'],
  ['sfx-levelup', '/assets/audio/levelup.wav'],
];

export class PreloadScene extends Phaser.Scene {
  private failedAudio = 0;
  constructor(){ super('PreloadScene'); }

  preload(): void {
    this.cameras.main.setBackgroundColor(0x091522);
    this.add.text(640,300,'COIL ARENA',{fontFamily:'system-ui',fontSize:'42px',fontStyle:'bold',color:'#ffffff'}).setOrigin(0.5);
    this.add.text(640,348,'Loading arena systems…',{fontFamily:'system-ui',fontSize:'14px',color:'#9bb3ca'}).setOrigin(0.5);
    this.add.rectangle(440,385,400,12,0x1d334c).setOrigin(0,0.5);
    const fill=this.add.rectangle(440,385,400,12,0x5ee887).setOrigin(0,0.5).setScale(0,1);
    this.load.on('progress',(value:number)=>fill.setScale(Phaser.Math.Clamp(value,0,1),1));
    this.load.on('loaderror',()=>{this.failedAudio++;});
    for (const [key, path] of AUDIO) this.load.audio(key, path);
  }

  create():void {
    // Optional audio failure never blocks core gameplay.
    if(this.failedAudio>0) console.warn(`Coil Arena: ${this.failedAudio} optional audio asset(s) failed to load.`);
    this.scene.start('MainMenuScene');
  }
}
