import * as Phaser from 'phaser';
import { MISSIONS, MODES } from '../config/content';
import type { MatchResult } from '../types';
import { addButton, panel } from '../ui/uiHelpers';
import { saveService } from '../services/SaveService';
import { xpForNextLevel } from '../services/ProgressionService';
import { audioService } from '../services/AudioService';

export class ResultsScene extends Phaser.Scene {
  constructor(){super('ResultsScene');}

  create():void{
    audioService.bind(this);
    this.cameras.main.setBackgroundColor(0x091522);
    const r=this.registry.get('lastResult') as MatchResult|undefined;
    if(!r){this.scene.start('MainMenuScene');return;}
    audioService.reward();
    const mode=MODES.find(m=>m.id===r.modeId)?.displayName??'MATCH';
    this.add.text(640,48,'MATCH COMPLETE',{fontFamily:'system-ui',fontSize:'38px',fontStyle:'bold',color:'#ffffff'}).setOrigin(0.5);
    this.add.text(640,94,mode,{fontFamily:'system-ui',fontSize:'14px',fontStyle:'bold',color:'#6ecfff'}).setOrigin(0.5);
    this.add.text(640,150,`#${r.placement}`,{fontFamily:'system-ui',fontSize:'72px',fontStyle:'bold',color:r.placement<=3?'#f7d75a':'#ffffff'}).setOrigin(0.5);
    panel(this,640,354,700,318);

    const scoreText=this.add.text(850,234,'0',{fontFamily:'system-ui',fontSize:'18px',fontStyle:'bold',color:'#ffffff'}).setOrigin(1,0);
    const rows:[string,string|number][]=[['Kills',r.kills],['Max Mass',r.maxMass],['Food',r.foodCollected],['Survived',`${r.survivedSeconds}s`]];
    this.add.text(390,234,'Score',{fontFamily:'system-ui',fontSize:'17px',color:'#9bb3ca'});
    rows.forEach((row,i)=>{const y=280+i*44;this.add.text(390,y,String(row[0]),{fontFamily:'system-ui',fontSize:'17px',color:'#9bb3ca'});this.add.text(850,y,String(row[1]),{fontFamily:'system-ui',fontSize:'18px',fontStyle:'bold',color:'#ffffff'}).setOrigin(1,0);});
    const counter={value:0};this.tweens.add({targets:counter,value:r.score,duration:650,ease:'Cubic.Out',onUpdate:()=>scoreText.setText(Math.floor(counter.value).toLocaleString())});

    const reward=this.add.text(640,486,`+${r.coinsEarned} COINS     +${r.xpEarned} XP`,{fontFamily:'system-ui',fontSize:'21px',fontStyle:'bold',color:'#78ef9a'}).setOrigin(0.5).setScale(0.82);
    this.tweens.add({targets:reward,scale:1,duration:420,ease:'Back.Out'});

    const d=saveService.get(),need=xpForNextLevel(d.level),claimable=d.missionState.filter(m=>m.complete&&!m.claimed).length;
    this.add.text(640,526,`Level ${d.level} • ${d.xp}/${need} XP • ${d.coins} coins • ${claimable} mission reward${claimable===1?'':'s'} ready`,{fontFamily:'system-ui',fontSize:'13px',color:'#9bb3ca'}).setOrigin(0.5);
    this.add.rectangle(460,552,360,10,0x1b3049).setOrigin(0,0.5);
    const xpFill=this.add.rectangle(460,552,0,10,0x5ee887).setOrigin(0,0.5);
    this.tweens.add({targets:xpFill,width:360*Phaser.Math.Clamp(d.xp/need,0,1),duration:700,ease:'Cubic.Out'});
    const missionState=d.missionState.find(m=>m.complete&&!m.claimed)??d.missionState.find(m=>!m.claimed)??d.missionState[0];
    const mission=MISSIONS.find(m=>m.id===missionState?.id);
    if(mission&&missionState)this.add.text(640,578,`Mission: ${mission.title}  •  ${Math.floor(missionState.progress)} / ${mission.target}${missionState.complete?'  COMPLETE':''}`,{fontFamily:'system-ui',fontSize:'13px',fontStyle:missionState.complete?'bold':'normal',color:missionState.complete?'#78ef9a':'#a9bfd4'}).setOrigin(0.5);
    if((r.levelUps??0)>0)this.add.text(640,606,`LEVEL UP!  NOW LEVEL ${d.level}`,{fontFamily:'system-ui',fontSize:'17px',fontStyle:'bold',color:'#f7d75a'}).setOrigin(0.5);

    addButton(this,390,650,220,48,'PLAY AGAIN',()=>{this.registry.set('modeId',r.modeId);this.registry.set('arenaId',r.arenaId);this.scene.start('GameScene');},true);
    addButton(this,640,650,180,48,'HOME',()=>this.scene.start('MainMenuScene'));
    addButton(this,890,650,220,48,'CHANGE SKIN',()=>{this.registry.set('openSkins',true);this.scene.start('MainMenuScene');});
  }
}
