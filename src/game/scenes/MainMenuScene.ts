import * as Phaser from 'phaser';
import { ARENAS, DAILY_REWARDS, MISSIONS, MODES, SKINS } from '../config/content';
import { addButton, panel } from '../ui/uiHelpers';
import { claimDaily, claimMission, dailyAvailable, equipSkin, purchaseSkin, xpForNextLevel } from '../services/ProgressionService';
import { saveService } from '../services/SaveService';
import { audioService } from '../services/AudioService';

const UI_RESOLUTION = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
const INK = '#f3f1e8';
const MUTED = '#85939a';
const ACID = '#c3f23f';

const MODE_COPY: Record<string,string> = {
  classic: 'Three minutes. Eat, grow, fight, finish on top.',
  battle: 'One life. The arena closes in. Last snake wins.',
  rush: 'Ninety seconds. More food, faster growth, no downtime.',
};

export class MainMenuScene extends Phaser.Scene {
  private modeIndex=0;
  private arenaIndex=0;
  private layer?:Phaser.GameObjects.Container;

  constructor(){super('MainMenuScene');}

  create():void{
    this.layer=undefined;
    audioService.bind(this);
    this.cameras.main.setBackgroundColor(0x0a1013);
    this.drawBackdrop();
    if(this.registry.get('openSkins')){
      this.registry.set('openSkins',false);
      this.showSkins(false);
    }else this.showHome();
  }

  private drawBackdrop():void{
    const g=this.add.graphics().setDepth(0);
    g.fillStyle(0x0a1013,1);g.fillRect(0,0,1280,720);
    g.fillStyle(0x0d1518,1);g.fillRect(0,0,1280,94);
    g.lineStyle(1,0xffffff,0.08);g.lineBetween(54,94,1226,94);
    g.fillStyle(0xc3f23f,0.035);g.fillCircle(1215,-35,350);
    g.fillStyle(0xffffff,0.018);g.fillCircle(-80,730,430);
  }

  private clearLayer():void{
    this.layer?.destroy(true);
    this.layer=this.add.container(0,0).setDepth(50);
  }

  private track<T extends Phaser.GameObjects.GameObject>(obj:T):T{this.layer?.add(obj);return obj;}

  private text(x:number,y:number,value:string,style:Phaser.Types.GameObjects.Text.TextStyle):Phaser.GameObjects.Text{
    return this.track(this.add.text(x,y,value,style).setResolution(UI_RESOLUTION));
  }

  private brand():void{
    this.text(58,25,'COIL',{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'38px',fontStyle:'bold',color:INK,letterSpacing:-1});
    this.text(151,25,'ARENA',{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'38px',fontStyle:'bold',color:ACID,letterSpacing:-1});
    this.text(60,68,'EAT. GROW. OUTLAST.',{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'10px',fontStyle:'bold',color:'#65747b',letterSpacing:1.8});
  }

  private heading(title:string,subtitle=''):void{
    this.brand();
    this.text(64,128,title,{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'34px',fontStyle:'bold',color:INK,letterSpacing:-0.5});
    if(subtitle)this.text(65,172,subtitle,{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'14px',color:MUTED});
  }

  private topStats():void{
    const d=saveService.get();const xpNeed=xpForNextLevel(d.level);
    this.text(1218,28,`${d.coins.toLocaleString()} COINS`,{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'14px',fontStyle:'bold',color:'#e8d46a',letterSpacing:0.5}).setOrigin(1,0);
    this.text(1080,28,`LEVEL ${d.level}`,{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'14px',fontStyle:'bold',color:INK,letterSpacing:0.5}).setOrigin(1,0);
    this.track(this.add.rectangle(1014,61,204,3,0x283238).setOrigin(0,0.5));
    this.track(this.add.rectangle(1014,61,204*Phaser.Math.Clamp(d.xp/xpNeed,0,1),3,0xc3f23f).setOrigin(0,0.5));
  }

  private button(x:number,y:number,w:number,h:number,label:string,cb:()=>void,primary=false):Phaser.GameObjects.Container{
    const b=addButton(this,x,y,w,h,label,()=>{audioService.ui();cb();},primary);this.track(b);return b;
  }

  private link(x:number,y:number,label:string,cb:()=>void):Phaser.GameObjects.Text{
    const t=this.text(x,y,label,{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',fontStyle:'bold',color:'#aab3b7',letterSpacing:0.8}).setOrigin(0.5).setInteractive({useHandCursor:true});
    t.on('pointerover',()=>t.setColor(ACID));
    t.on('pointerout',()=>t.setColor('#aab3b7'));
    t.on('pointerup',()=>{audioService.ui();cb();});
    return t;
  }

  private selector(x:number,y:number,label:string,value:string,onPrev:()=>void,onNext:()=>void,description=''):void{
    this.text(x,y,label,{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'10px',fontStyle:'bold',color:'#637279',letterSpacing:1.7});
    this.text(x,y+24,value.toUpperCase(),{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'28px',fontStyle:'bold',color:INK,letterSpacing:-0.4});
    this.button(x+340,y+39,42,38,'<',onPrev);
    this.button(x+390,y+39,42,38,'>',onNext);
    if(description)this.text(x,y+64,description,{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',color:MUTED});
  }

  private drawSnakePreview():void{
    const d=saveService.get();
    const skin=SKINS.find(s=>s.id===d.equippedSkinId)??SKINS[0];
    const arena=ARENAS[this.arenaIndex];
    const cx=934,cy=356,radius=247;
    const field=this.add.graphics();
    field.fillStyle(arena.backgroundColor,1);field.fillCircle(cx,cy,radius);
    field.lineStyle(9,0x05090b,0.68);field.strokeCircle(cx,cy,radius-4);
    field.lineStyle(2,arena.accentColor,0.8);field.strokeCircle(cx,cy,radius-13);
    this.track(field);

    const foodColors=[0xf3dd62,0xffffff,arena.accentColor,0xff8b70];
    const food=[[822,260,5],[1045,244,4],[1092,382,6],[808,452,4],[1004,505,5],[876,189,4],[1130,315,3]];
    food.forEach((p,i)=>this.track(this.add.circle(p[0],p[1],p[2],foodColors[i%foodColors.length],0.92)));

    const pts:{x:number;y:number}[]=[];
    for(let i=0;i<31;i++){
      const t=i/30;
      pts.push({x:cx-150+t*300,y:cy+Math.sin(t*Math.PI*2.15-0.5)*82});
    }
    for(let i=0;i<pts.length-1;i++){
      const p=pts[i],t=i/(pts.length-1),size=8+10*t;
      this.track(this.add.circle(p.x+4,p.y+5,size,0x000000,0.18));
    }
    for(let i=0;i<pts.length-1;i++){
      const p=pts[i],t=i/(pts.length-1),size=8+10*t;
      this.track(this.add.circle(p.x,p.y,size,skin.bodyColors[i%skin.bodyColors.length],1));
    }
    const h=pts[pts.length-1],prev=pts[pts.length-2];
    const angle=Math.atan2(h.y-prev.y,h.x-prev.x),hr=20;
    this.track(this.add.circle(h.x+4,h.y+5,hr,0x000000,0.18));
    this.track(this.add.circle(h.x,h.y,hr,skin.headColor,1).setStrokeStyle(2,0x071013,0.36));
    const fx=Math.cos(angle),fy=Math.sin(angle),px=-fy,py=fx;
    for(const side of [-1,1]){
      const ex=h.x+fx*8+px*side*6.5,ey=h.y+fy*8+py*side*6.5;
      this.track(this.add.circle(ex,ey,4.5,0xffffff));
      this.track(this.add.circle(ex+fx*2,ey+fy*2,2.2,0x111719));
    }

    this.text(cx,140,arena.name.toUpperCase(),{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'12px',fontStyle:'bold',color:'#e9eee9',letterSpacing:1.6}).setOrigin(0.5);
    this.text(cx,584,skin.displayName,{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'16px',fontStyle:'bold',color:INK}).setOrigin(0.5);
    this.link(cx,609,'CHANGE SKIN',()=>this.showSkins(false));
  }

  private showHome():void{
    this.clearLayer();this.brand();this.topStats();

    this.text(64,132,'ENTER THE ARENA',{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',fontStyle:'bold',color:ACID,letterSpacing:1.5});
    this.text(64,154,'Grow fast. Pick fights.\nStay alive.',{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'42px',fontStyle:'bold',color:INK,lineSpacing:-3,letterSpacing:-1});

    const mode=MODES[this.modeIndex],arena=ARENAS[this.arenaIndex];
    this.selector(66,286,'MODE',mode.displayName,()=>{this.modeIndex=(this.modeIndex+MODES.length-1)%MODES.length;this.showHome();},()=>{this.modeIndex=(this.modeIndex+1)%MODES.length;this.showHome();},MODE_COPY[mode.id]);
    this.selector(66,386,'ARENA',arena.name,()=>{this.arenaIndex=(this.arenaIndex+ARENAS.length-1)%ARENAS.length;this.showHome();},()=>{this.arenaIndex=(this.arenaIndex+1)%ARENAS.length;this.showHome();});

    this.button(251,520,370,70,`PLAY ${mode.displayName.toUpperCase()}`,()=>{
      this.registry.set('modeId',mode.id);
      this.registry.set('arenaId',arena.id);
      this.scene.start('GameScene');
    },true);
    this.text(66,568,'Drag or swipe to steer. Release to keep your heading.',{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'12px',color:'#6f7f86'});

    this.drawSnakePreview();

    const rail=this.add.graphics();rail.lineStyle(1,0xffffff,0.09);rail.lineBetween(58,640,1222,640);this.track(rail);
    const items:[string,()=>void][]=[
      ['SKINS',()=>this.showSkins(false)],['SHOP',()=>this.showSkins(true)],['MISSIONS',()=>this.showMissions()],
      ['DAILY',()=>this.showDaily()],['SETTINGS',()=>this.showSettings()],['STATS',()=>this.showStats()],
    ];
    const xs=[112,310,508,706,904,1102];
    items.forEach((item,i)=>this.link(xs[i],674,item[0],item[1]));
  }

  private back():void{this.button(116,670,128,40,'BACK',()=>this.showHome());}

  private showSkins(shop:boolean):void{
    this.clearLayer();this.heading(shop?'SKIN SHOP':'SKINS',shop?'Spend match coins on cosmetics.':'Equip any skin you have unlocked.');this.topStats();this.track(panel(this,640,410,1120,465));const d=saveService.get();
    SKINS.forEach((s,i)=>{
      const col=i%4,row=Math.floor(i/4),x=230+col*275,y=300+row*190,unlocked=d.unlockedSkinIds.includes(s.id);
      const card=this.add.graphics();
      card.fillStyle(0x151f24,1);card.fillRect(x-112,y-76,224,150);
      card.lineStyle(d.equippedSkinId===s.id?3:1,d.equippedSkinId===s.id?0xc3f23f:0x39484f,d.equippedSkinId===s.id?1:0.9);card.strokeRect(x-111.5,y-75.5,223,149);this.track(card);
      for(let k=0;k<5;k++)this.track(this.add.circle(x-52+k*26,y-22,13,s.bodyColors[k%s.bodyColors.length]));
      this.track(this.add.circle(x+58,y-22,17,s.headColor));
      this.text(x,y+20,s.displayName,{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'15px',fontStyle:'bold',color:INK}).setOrigin(0.5);
      this.text(x,y+42,s.rarity.toUpperCase(),{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'9px',fontStyle:'bold',color:'#77868d',letterSpacing:1}).setOrigin(0.5);
      const label=unlocked?(d.equippedSkinId===s.id?'EQUIPPED':'EQUIP'):shop?`${s.unlockCost} COINS`:'LOCKED';
      this.button(x,y+93,164,32,label,()=>{if(unlocked)equipSkin(s.id);else if(shop)purchaseSkin(s.id);this.showSkins(shop);},unlocked&&d.equippedSkinId!==s.id);
    });
    this.back();
  }

  private showMissions():void{
    this.clearLayer();this.heading('MISSIONS','Finish objectives, then claim the coins.');this.topStats();this.track(panel(this,640,410,1120,465));
    MISSIONS.forEach((m,i)=>{
      const s=saveService.get().missionState.find(x=>x.id===m.id)!;const x=i%2===0?370:910,y=222+Math.floor(i/2)*100;
      this.text(x-210,y,m.title,{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'16px',fontStyle:'bold',color:INK});
      this.text(x-210,y+27,`${Math.floor(s.progress)} / ${m.target}   —   ${m.reward} coins`,{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',color:s.complete?ACID:MUTED});
      this.button(x+145,y+18,118,36,s.claimed?'CLAIMED':s.complete?'CLAIM':'ACTIVE',()=>{if(s.complete&&!s.claimed)claimMission(m.id);this.showMissions();},s.complete&&!s.claimed);
    });
    this.back();
  }

  private showDaily():void{
    this.clearLayer();this.heading('DAILY REWARD','One local reward per day. Seven-day cycle.');this.topStats();const d=saveService.get();
    DAILY_REWARDS.forEach((v,i)=>{
      const x=180+i*153,active=i===d.dailyReward.cycleDay;
      const g=this.add.graphics();g.fillStyle(active?0xc3f23f:0x172126,1);g.fillRect(x-58,270,116,116);g.lineStyle(1,active?0xc3f23f:0x39484f,1);g.strokeRect(x-57.5,270.5,115,115);this.track(g);
      this.text(x,294,`DAY ${i+1}`,{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'10px',fontStyle:'bold',color:active?'#101817':INK,letterSpacing:1}).setOrigin(0.5);
      this.text(x,331,String(v),{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'26px',fontStyle:'bold',color:active?'#101817':'#e7d66d'}).setOrigin(0.5);
      this.text(x,360,'COINS',{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'9px',fontStyle:'bold',color:active?'#243019':'#728087',letterSpacing:1}).setOrigin(0.5);
    });
    this.button(640,476,320,58,dailyAvailable()?'CLAIM TODAY':'CLAIMED TODAY',()=>{claimDaily();this.showDaily();},dailyAvailable());this.back();
  }

  private showSettings():void{
    this.clearLayer();this.heading('SETTINGS','Changes save immediately.');this.topStats();const d=saveService.get(),s=d.settings;
    const rows:[string,string,()=>void][]=[
      ['Music volume',`${Math.round(s.musicVolume*100)}%`,()=>{s.musicVolume=s.musicVolume>=1?0:Math.min(1,s.musicVolume+0.25);saveService.save();audioService.syncSettings();this.showSettings();}],
      ['SFX volume',`${Math.round(s.sfxVolume*100)}%`,()=>{s.sfxVolume=s.sfxVolume>=1?0:Math.min(1,s.sfxVolume+0.25);saveService.save();this.showSettings();}],
      ['Vibration',s.vibration?'ON':'OFF',()=>{s.vibration=!s.vibration;saveService.save();this.showSettings();}],
      ['Steering',s.controlStyle==='drag'?'FOLLOW DRAG':'JOYSTICK',()=>{s.controlStyle=s.controlStyle==='drag'?'joystick':'drag';saveService.save();this.showSettings();}],
      ['Turn sensitivity',s.controlSensitivity.toFixed(1),()=>{s.controlSensitivity=s.controlSensitivity>=1.4?0.8:s.controlSensitivity+0.2;saveService.save();this.showSettings();}],
      ['Graphics',s.graphics.toUpperCase(),()=>{s.graphics=s.graphics==='high'?'low':s.graphics==='low'?'medium':'high';saveService.save();this.showSettings();}],
      ['FPS target',s.fpsTarget.toUpperCase(),()=>{s.fpsTarget=s.fpsTarget==='auto'?'30':s.fpsTarget==='30'?'60':'auto';saveService.save();this.showSettings();}],
      ['Fullscreen',this.scale.isFullscreen?'ON':'OFF',()=>{if(this.scale.isFullscreen)this.scale.stopFullscreen();else this.scale.startFullscreen();this.time.delayedCall(120,()=>this.showSettings());}],
    ];
    const line=this.add.graphics();line.lineStyle(1,0xffffff,0.07);for(let i=0;i<rows.length;i++)line.lineBetween(310,242+i*50,970,242+i*50);this.track(line);
    rows.forEach((r,i)=>{const y=214+i*50;this.text(330,y,r[0],{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'16px',color:INK});this.button(835,y+8,260,38,r[1],r[2]);});
    this.text(330,620,'FOLLOW DRAG: hold + slide mouse/finger, release to keep heading',{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'12px',color:'#6f7f86'});
    this.button(835,620,260,36,'RESET PROGRESS',()=>{if(window.confirm('Reset all Coil Arena progress?')){saveService.reset();audioService.syncSettings();this.showHome();}});
    this.button(540,620,260,36,'CREDITS',()=>this.showCredits());this.back();
  }

  private showCredits():void{
    this.clearLayer();this.heading('CREDITS');this.topStats();this.track(panel(this,640,390,850,330));
    this.text(640,314,'COIL ARENA',{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'34px',fontStyle:'bold',color:INK}).setOrigin(0.5);
    this.text(640,382,'Built with Phaser 4 + TypeScript\nProcedural game art — no copied game assets\nOffline bots and local progression',{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'15px',align:'center',color:'#9aa8ae',lineSpacing:10}).setOrigin(0.5);
    this.back();
  }

  private showStats():void{
    this.clearLayer();this.heading('LIFETIME STATS');this.topStats();const s=saveService.get().stats;
    const rows=[['Matches',s.matchesPlayed],['Wins',s.wins],['Top 3',s.top3],['Total score',s.totalScore],['Food collected',s.totalFood],['Kills',s.totalKills],['Highest mass',Math.floor(s.highestMass)],['Best rank',s.bestRank],['Longest survival',`${Math.floor(s.longestSurvival)}s`]];
    rows.forEach((r,i)=>{const x=i%2===0?390:850,y=210+Math.floor(i/2)*76;this.text(x-130,y,String(r[0]),{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'15px',color:MUTED});this.text(x+120,y,String(r[1]),{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'21px',fontStyle:'bold',color:INK}).setOrigin(1,0);});
    this.back();
  }
}
