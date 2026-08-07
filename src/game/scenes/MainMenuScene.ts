import * as Phaser from 'phaser';
import { ARENAS, DAILY_REWARDS, MISSIONS, MODES, SKINS } from '../config/content';
import { addButton, panel } from '../ui/uiHelpers';
import { claimDaily, claimMission, dailyAvailable, equipSkin, purchaseSkin, xpForNextLevel } from '../services/ProgressionService';
import { saveService } from '../services/SaveService';
import { audioService } from '../services/AudioService';

const MODE_COPY: Record<string,string> = {
  classic: '3 minutes • respawning rivals • highest score wins',
  battle: 'No respawns • shrinking arena • last snake alive wins',
  rush: '90 seconds • more food • faster growth • pure chaos',
};

export class MainMenuScene extends Phaser.Scene {
  private modeIndex=0;
  private arenaIndex=0;
  private layer?:Phaser.GameObjects.Container;

  constructor(){super('MainMenuScene');}

  create():void{
    this.layer=undefined;
    audioService.bind(this);
    this.cameras.main.setBackgroundColor(0x07111d);
    this.drawBackdrop();
    if(this.registry.get('openSkins')){
      this.registry.set('openSkins',false);
      this.showSkins(false);
    }else this.showHome();
  }

  private drawBackdrop():void{
    const g=this.add.graphics().setDepth(0);
    g.fillStyle(0x07111d,1);g.fillRect(0,0,1280,720);
    g.fillStyle(0x0b2431,0.72);g.fillCircle(1150,80,340);
    g.fillStyle(0x10243a,0.6);g.fillCircle(1050,650,430);
    g.lineStyle(1,0x9fe8ff,0.035);
    for(let x=0;x<=1280;x+=64)g.lineBetween(x,0,x,720);
    for(let y=0;y<=720;y+=64)g.lineBetween(0,y,1280,y);
    for(let i=0;i<24;i++){
      const x=Phaser.Math.Between(680,1260),y=Phaser.Math.Between(30,700),r=Phaser.Math.Between(2,7);
      g.fillStyle([0x55e69a,0x67d9ff,0xff6cba][i%3],0.16);g.fillCircle(x,y,r);
    }
  }

  private clearLayer():void{
    this.layer?.destroy(true);
    this.layer=this.add.container(0,0).setDepth(50);
  }

  private track<T extends Phaser.GameObjects.GameObject>(obj:T):T{this.layer?.add(obj);return obj;}

  private brand():void{
    this.track(this.add.text(62,38,'COIL',{fontFamily:'Inter, system-ui, sans-serif',fontSize:'34px',fontStyle:'bold',color:'#f6fbff'}));
    this.track(this.add.text(157,38,'ARENA',{fontFamily:'Inter, system-ui, sans-serif',fontSize:'34px',fontStyle:'bold',color:'#67e894'}));
    this.track(this.add.text(64,79,'OFFLINE SNAKE COMBAT',{fontFamily:'Inter, system-ui, sans-serif',fontSize:'11px',fontStyle:'bold',color:'#6f8da8'}));
  }

  private heading(title:string,subtitle=''):void{
    this.brand();
    this.track(this.add.text(64,128,title,{fontFamily:'Inter, system-ui, sans-serif',fontSize:'36px',fontStyle:'bold',color:'#ffffff'}));
    if(subtitle)this.track(this.add.text(66,174,subtitle,{fontFamily:'Inter, system-ui, sans-serif',fontSize:'15px',color:'#8ea8bf'}));
  }

  private topStats():void{
    const d=saveService.get();const xpNeed=xpForNextLevel(d.level);
    const coin=this.add.graphics();coin.fillStyle(0x10263a,0.95);coin.fillRoundedRect(928,34,136,42,16);coin.lineStyle(1,0xf5d862,0.28);coin.strokeRoundedRect(929,35,134,40,15);this.track(coin);
    this.track(this.add.circle(950,55,7,0xf5d862));
    this.track(this.add.text(969,43,d.coins.toLocaleString(),{fontFamily:'Inter, system-ui, sans-serif',fontSize:'17px',fontStyle:'bold',color:'#fff2a8'}));

    const level=this.add.graphics();level.fillStyle(0x10263a,0.95);level.fillRoundedRect(1080,34,150,42,16);level.lineStyle(1,0x67e894,0.22);level.strokeRoundedRect(1081,35,148,40,15);this.track(level);
    this.track(this.add.text(1096,43,`LV ${d.level}`,{fontFamily:'Inter, system-ui, sans-serif',fontSize:'15px',fontStyle:'bold',color:'#f3f8ff'}));
    this.track(this.add.rectangle(1148,53,64,6,0x223d50).setOrigin(0,0.5));
    this.track(this.add.rectangle(1148,53,64*Phaser.Math.Clamp(d.xp/xpNeed,0,1),6,0x67e894).setOrigin(0,0.5));
  }

  private button(x:number,y:number,w:number,h:number,label:string,cb:()=>void,primary=false):Phaser.GameObjects.Container{
    const b=addButton(this,x,y,w,h,label,()=>{audioService.ui();cb();},primary);this.track(b);return b;
  }

  private drawSnakePreview():void{
    const d=saveService.get();const skin=SKINS.find(s=>s.id===d.equippedSkinId)??SKINS[0];
    const cx=942,cy=342;
    const halo=this.add.graphics();
    halo.fillStyle(0x0d2435,0.72);halo.fillCircle(cx,cy,238);
    halo.lineStyle(2,ARENAS[this.arenaIndex].accentColor,0.18);halo.strokeCircle(cx,cy,207);
    halo.lineStyle(1,0xffffff,0.07);halo.strokeCircle(cx,cy,171);this.track(halo);

    for(let i=0;i<16;i++){
      const a=i*2.399,r=48+(i%5)*26;
      this.track(this.add.circle(cx+Math.cos(a)*r,cy+Math.sin(a)*r,3+(i%3),[0x63e0ff,0xff78bd,0xf6df64][i%3],0.72));
    }

    const pts:{x:number;y:number}[]=[];
    for(let i=0;i<34;i++){
      const a=-0.25+i*0.32;
      const r=34+i*4.2;
      pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r*0.78});
    }
    for(let i=0;i<pts.length-1;i++){
      const p=pts[i];const t=i/(pts.length-1);const radius=7.5+7*t;
      this.track(this.add.circle(p.x,p.y,radius,skin.bodyColors[i%skin.bodyColors.length],1).setStrokeStyle(1,0x041018,0.28));
    }
    const h=pts[pts.length-1];const prev=pts[pts.length-2];const angle=Math.atan2(h.y-prev.y,h.x-prev.x);
    const hr=18;
    this.track(this.add.circle(h.x,h.y,hr+8,skin.glowColor??skin.headColor,skin.glowColor?0.17:0.07));
    this.track(this.add.circle(h.x,h.y,hr,skin.headColor,1).setStrokeStyle(2,0xffffff,0.38));
    const fx=Math.cos(angle),fy=Math.sin(angle),px=-fy,py=fx;
    for(const side of [-1,1]){
      const ex=h.x+fx*7+px*side*6,ey=h.y+fy*7+py*side*6;
      this.track(this.add.circle(ex,ey,4,0xffffff));this.track(this.add.circle(ex+fx*1.8,ey+fy*1.8,2,0x0c1822));
    }

    this.track(this.add.text(cx,592,'CURRENT SKIN',{fontFamily:'Inter, system-ui, sans-serif',fontSize:'11px',fontStyle:'bold',color:'#6f8da8'}).setOrigin(0.5));
    this.track(this.add.text(cx,614,skin.displayName.toUpperCase(),{fontFamily:'Inter, system-ui, sans-serif',fontSize:'18px',fontStyle:'bold',color:'#f5f9ff'}).setOrigin(0.5));
    this.button(cx,660,184,38,'CHANGE SKIN',()=>this.showSkins(false));
  }

  private showHome():void{
    this.clearLayer();this.brand();this.topStats();

    this.track(panel(this,342,390,560,548));
    this.track(this.add.text(92,142,'CHOOSE YOUR RUN',{fontFamily:'Inter, system-ui, sans-serif',fontSize:'28px',fontStyle:'bold',color:'#f5f9ff'}));
    this.track(this.add.text(92,180,'Pick a mode, pick an arena, then get moving.',{fontFamily:'Inter, system-ui, sans-serif',fontSize:'15px',color:'#8fa9bf'}));

    MODES.forEach((mode,i)=>this.button(158+i*170,242,154,44,mode.displayName,()=>{this.modeIndex=i;this.showHome();},i===this.modeIndex));
    this.track(this.add.text(92,284,MODE_COPY[MODES[this.modeIndex].id],{fontFamily:'Inter, system-ui, sans-serif',fontSize:'14px',color:'#b8c9d8'}));

    this.track(this.add.text(92,334,'ARENA',{fontFamily:'Inter, system-ui, sans-serif',fontSize:'11px',fontStyle:'bold',color:'#6f8da8'}));
    this.button(128,380,52,42,'‹',()=>{this.arenaIndex=(this.arenaIndex+ARENAS.length-1)%ARENAS.length;this.showHome();});
    const arenaCard=this.add.graphics();arenaCard.fillStyle(ARENAS[this.arenaIndex].backgroundColor,0.88);arenaCard.fillRoundedRect(164,356,302,48,14);arenaCard.lineStyle(1.5,ARENAS[this.arenaIndex].accentColor,0.48);arenaCard.strokeRoundedRect(165,357,300,46,13);this.track(arenaCard);
    this.track(this.add.circle(192,380,7,ARENAS[this.arenaIndex].accentColor));
    this.track(this.add.text(214,367,ARENAS[this.arenaIndex].name,{fontFamily:'Inter, system-ui, sans-serif',fontSize:'18px',fontStyle:'bold',color:'#ffffff'}));
    this.button(502,380,52,42,'›',()=>{this.arenaIndex=(this.arenaIndex+1)%ARENAS.length;this.showHome();});

    this.button(312,456,438,68,'PLAY NOW',()=>{this.registry.set('modeId',MODES[this.modeIndex].id);this.registry.set('arenaId',ARENAS[this.arenaIndex].id);this.scene.start('GameScene');},true);
    this.track(this.add.text(312,503,'Drag mouse / finger to steer • release to hold direction',{fontFamily:'Inter, system-ui, sans-serif',fontSize:'12px',color:'#708ba3'}).setOrigin(0.5));

    const items:[string,()=>void][]=[['SKINS',()=>this.showSkins(false)],['SHOP',()=>this.showSkins(true)],['MISSIONS',()=>this.showMissions()],['DAILY',()=>this.showDaily()],['SETTINGS',()=>this.showSettings()],['STATS',()=>this.showStats()]];
    items.forEach((it,i)=>this.button(147+(i%3)*165,562+Math.floor(i/3)*55,148,40,it[0],it[1]));

    this.drawSnakePreview();
  }

  private back():void{this.button(112,666,150,42,'BACK',()=>this.showHome());}

  private showSkins(shop:boolean):void{
    this.clearLayer();this.heading(shop?'SKIN SHOP':'SKINS',shop?'Unlock original cosmetics with earned coins.':'Equip any unlocked skin.');this.topStats();this.track(panel(this,640,410,1120,465));const d=saveService.get();
    SKINS.forEach((s,i)=>{const col=i%4,row=Math.floor(i/4),x=230+col*275,y=300+row*190;const unlocked=d.unlockedSkinIds.includes(s.id);const card=this.add.graphics();card.fillStyle(0x152b40,0.9);card.fillRoundedRect(x-112,y-76,224,150,18);card.lineStyle(2,d.equippedSkinId===s.id?0x67e894:0x395777,d.equippedSkinId===s.id?0.85:0.48);card.strokeRoundedRect(x-111,y-75,222,148,17);this.track(card);this.track(this.add.circle(x,y-38,24,s.headColor));for(let k=0;k<5;k++)this.track(this.add.circle(x-52+k*26,y,13,s.bodyColors[k%s.bodyColors.length]));this.track(this.add.text(x,y+28,s.displayName,{fontFamily:'Inter, system-ui, sans-serif',fontSize:'15px',fontStyle:'bold',color:'#ffffff'}).setOrigin(0.5));this.track(this.add.text(x,y+50,s.rarity.toUpperCase(),{fontFamily:'Inter, system-ui, sans-serif',fontSize:'10px',color:'#7f99af'}).setOrigin(0.5));const label=unlocked?(d.equippedSkinId===s.id?'EQUIPPED':'EQUIP'):shop?`${s.unlockCost} COINS`:'LOCKED';this.button(x,y+94,166,34,label,()=>{if(unlocked)equipSkin(s.id);else if(shop)purchaseSkin(s.id);this.showSkins(shop);},unlocked&&d.equippedSkinId!==s.id);});this.back();
  }

  private showMissions():void{
    this.clearLayer();this.heading('MISSIONS','Complete goals, then claim coin rewards.');this.topStats();this.track(panel(this,640,410,1120,465));
    MISSIONS.forEach((m,i)=>{const s=saveService.get().missionState.find(x=>x.id===m.id)!;const x=i%2===0?370:910,y=222+Math.floor(i/2)*100;this.track(this.add.text(x-210,y,m.title,{fontFamily:'Inter, system-ui, sans-serif',fontSize:'16px',fontStyle:'bold',color:'#ffffff'}));this.track(this.add.text(x-210,y+27,`${Math.floor(s.progress)} / ${m.target}   •   ${m.reward} coins`,{fontFamily:'Inter, system-ui, sans-serif',fontSize:'13px',color:s.complete?'#78ef9a':'#8ea8bf'}));this.button(x+145,y+18,118,36,s.claimed?'CLAIMED':s.complete?'CLAIM':'ACTIVE',()=>{if(s.complete&&!s.claimed)claimMission(m.id);this.showMissions();},s.complete&&!s.claimed);});this.back();
  }

  private showDaily():void{
    this.clearLayer();this.heading('DAILY REWARD','A simple seven-day offline reward cycle.');this.topStats();const d=saveService.get();
    DAILY_REWARDS.forEach((v,i)=>{const x=180+i*153;const active=i===d.dailyReward.cycleDay;this.track(this.add.circle(x,325,54,active?0x244f3b:0x142b40,0.98).setStrokeStyle(2,active?0x67e894:0x395777,active?0.75:0.42));this.track(this.add.text(x,309,`DAY ${i+1}`,{fontFamily:'Inter, system-ui, sans-serif',fontSize:'11px',fontStyle:'bold',color:'#ffffff'}).setOrigin(0.5));this.track(this.add.text(x,339,`${v}`,{fontFamily:'Inter, system-ui, sans-serif',fontSize:'20px',fontStyle:'bold',color:'#f7d75a'}).setOrigin(0.5));});
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
    rows.forEach((r,i)=>{const y=214+i*50;this.track(this.add.text(330,y,r[0],{fontFamily:'Inter, system-ui, sans-serif',fontSize:'17px',color:'#eaf2f8'}));this.button(835,y+8,260,40,r[1],r[2]);});
    this.track(this.add.text(330,620,'FOLLOW DRAG: hold + slide mouse/finger, release to keep heading',{fontFamily:'Inter, system-ui, sans-serif',fontSize:'12px',color:'#6f8da8'}));
    this.button(835,620,260,36,'RESET PROGRESS',()=>{if(window.confirm('Reset all Coil Arena progress?')){saveService.reset();audioService.syncSettings();this.showHome();}});this.button(540,620,260,36,'CREDITS',()=>this.showCredits());this.back();
  }

  private showCredits():void{this.clearLayer();this.heading('CREDITS','Original offline game implementation.');this.topStats();this.track(panel(this,640,390,850,330));this.track(this.add.text(640,320,'COIL ARENA',{fontFamily:'Inter, system-ui, sans-serif',fontSize:'32px',fontStyle:'bold',color:'#ffffff'}).setOrigin(0.5));this.track(this.add.text(640,390,'Built with Phaser 4 + TypeScript\nProcedural game art • no copied game assets\nOffline bots and local progression',{fontFamily:'Inter, system-ui, sans-serif',fontSize:'16px',align:'center',color:'#a9bed0',lineSpacing:10}).setOrigin(0.5));this.back();}

  private showStats():void{this.clearLayer();this.heading('LIFETIME STATS');this.topStats();const s=saveService.get().stats;const rows=[['Matches',s.matchesPlayed],['Wins',s.wins],['Top 3',s.top3],['Total score',s.totalScore],['Food collected',s.totalFood],['Kills',s.totalKills],['Highest mass',Math.floor(s.highestMass)],['Best rank',s.bestRank],['Longest survival',`${Math.floor(s.longestSurvival)}s`]];rows.forEach((r,i)=>{const x=i%2===0?390:850,y=210+Math.floor(i/2)*76;this.track(this.add.text(x-130,y,String(r[0]),{fontFamily:'Inter, system-ui, sans-serif',fontSize:'16px',color:'#8ea8bf'}));this.track(this.add.text(x+120,y,String(r[1]),{fontFamily:'Inter, system-ui, sans-serif',fontSize:'20px',fontStyle:'bold',color:'#ffffff'}).setOrigin(1,0));});this.back();}
}
