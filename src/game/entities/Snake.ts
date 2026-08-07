import * as Phaser from 'phaser';
import { BalanceConfig } from '../config/balance';
import type { SkinDefinition } from '../types';
import type { SpatialItem } from '../systems/SpatialGrid';

export interface SnakeInit { id:string; displayName:string; isPlayer:boolean; isBot:boolean; x:number; y:number; heading:number; skin:SkinDefinition; mass?:number; }
interface PathPoint { x:number; y:number; d:number; }

function angleDiff(a:number,b:number):number { let d=(b-a+Math.PI)%(Math.PI*2)-Math.PI; if (d<-Math.PI) d+=Math.PI*2; return d; }

export class Snake implements SpatialItem {
  id!:string; displayName!:string; isPlayer!:boolean; isBot!:boolean; active=true; alive=true;
  x!:number; y!:number; heading!:number; mass:number; radius=12; power=10; score=0; kills=0; rank=20; foodCollected=0; maxMass=10; spawnProtected=true; boosting=false;
  readonly head: Phaser.GameObjects.Arc; readonly headGlow: Phaser.GameObjects.Arc; readonly nameText: Phaser.GameObjects.Text; readonly shield: Phaser.GameObjects.Arc;
  readonly eyeLeft: Phaser.GameObjects.Arc; readonly eyeRight: Phaser.GameObjects.Arc; readonly pupilLeft: Phaser.GameObjects.Arc; readonly pupilRight: Phaser.GameObjects.Arc; readonly highlight: Phaser.GameObjects.Arc;
  readonly segments: Phaser.GameObjects.Arc[]=[]; readonly path:PathPoint[]=[];
  private spawnProtectionRemaining=BalanceConfig.snake.spawnProtectionMs; private skin:SkinDefinition; private travel=0; private glowAlpha:number;

  constructor(private scene:Phaser.Scene, init:SnakeInit) {
    Object.assign(this, { id:init.id, displayName:init.displayName, isPlayer:init.isPlayer, isBot:init.isBot, x:init.x, y:init.y, heading:init.heading });
    this.mass=init.mass ?? BalanceConfig.snake.startingMass; this.maxMass=this.mass; this.skin=init.skin; this.glowAlpha=init.skin.glowColor?0.17:0.055;
    this.headGlow=scene.add.circle(this.x,this.y,18,init.skin.glowColor??init.skin.headColor,this.glowAlpha).setDepth(9);
    this.head=scene.add.circle(this.x,this.y,13,init.skin.headColor,1).setDepth(10);
    this.head.setStrokeStyle(2,0xffffff,0.38);
    this.highlight=scene.add.circle(this.x,this.y,3,0xffffff,0.32).setDepth(11);
    this.eyeLeft=scene.add.circle(this.x,this.y,3.4,0xffffff,0.96).setDepth(12);
    this.eyeRight=scene.add.circle(this.x,this.y,3.4,0xffffff,0.96).setDepth(12);
    this.pupilLeft=scene.add.circle(this.x,this.y,1.65,0x14202c,1).setDepth(13);
    this.pupilRight=scene.add.circle(this.x,this.y,1.65,0x14202c,1).setDepth(13);
    this.shield=scene.add.circle(this.x,this.y,20,0x91d7ff,0.1).setStrokeStyle(2,0xbbe9ff,0.75).setDepth(14);
    this.nameText=scene.add.text(this.x,this.y-28,init.isPlayer?'YOU':init.displayName,{fontFamily:'system-ui',fontSize:'12px',fontStyle:'bold',color:'#ffffff',stroke:'#000000',strokeThickness:3}).setOrigin(0.5).setDepth(15);
    for(let i=0;i<BalanceConfig.snake.startingSegments;i++) this.addSegment();
    this.seedPath();
    this.recomputeSize();
  }

  private seedPath():void { this.path.length=0;this.travel=0;for(let i=240;i>=0;i--)this.path.push({x:this.x-Math.cos(this.heading)*i*3,y:this.y-Math.sin(this.heading)*i*3,d:-i*3}); }
  private addSegment():void { const i=this.segments.length; const c=this.skin.bodyColors[i%this.skin.bodyColors.length]; const seg=this.scene.add.circle(this.x,this.y,10,c,1).setDepth(8); seg.setStrokeStyle(1,0x06120b,0.22); this.segments.push(seg); }
  private desiredSegments():number { return Math.min(BalanceConfig.snake.maxVisualSegments, BalanceConfig.snake.startingSegments + Math.floor(Math.max(0,this.mass-BalanceConfig.snake.startingMass)/BalanceConfig.snake.massPerSegment)); }
  private updateFace():void { const fx=Math.cos(this.heading),fy=Math.sin(this.heading),px=-fy,py=fx;const forward=this.radius*0.38,side=this.radius*0.32,pupilForward=this.radius*0.08;this.headGlow.setPosition(this.x,this.y);this.eyeLeft.setPosition(this.x+fx*forward+px*side,this.y+fy*forward+py*side);this.eyeRight.setPosition(this.x+fx*forward-px*side,this.y+fy*forward-py*side);this.pupilLeft.setPosition(this.eyeLeft.x+fx*pupilForward,this.eyeLeft.y+fy*pupilForward);this.pupilRight.setPosition(this.eyeRight.x+fx*pupilForward,this.eyeRight.y+fy*pupilForward);this.highlight.setPosition(this.x-fx*this.radius*0.18+px*this.radius*0.36,this.y-fy*this.radius*0.18+py*this.radius*0.36); }
  private recomputeSize():void { this.radius=BalanceConfig.snake.baseRadius+Math.sqrt(this.mass)*BalanceConfig.snake.radiusScale; this.power=this.mass; this.head.setRadius(this.radius);this.headGlow.setRadius(this.radius+6);const eyeR=Math.max(2.8,this.radius*0.2),pupilR=Math.max(1.25,this.radius*0.095);this.eyeLeft.setRadius(eyeR);this.eyeRight.setRadius(eyeR);this.pupilLeft.setRadius(pupilR);this.pupilRight.setRadius(pupilR);this.highlight.setRadius(Math.max(2,this.radius*0.16));this.shield.setRadius(this.radius+8); const want=this.desiredSegments(); while(this.segments.length<want)this.addSegment(); for(let i=0;i<this.segments.length;i++){ const t=1-i/Math.max(1,this.segments.length); this.segments[i].setRadius(Math.max(4.5,this.radius*(0.58+0.34*t))); this.segments[i].setVisible(i<want); }this.updateFace(); }
  addMass(amount:number,scoreValue=0):void { if(!this.alive)return; this.mass+=amount;this.maxMass=Math.max(this.maxMass,this.mass);this.score+=scoreValue;this.recomputeSize(); }
  setMass(value:number):void { this.mass=Math.max(1,value); this.recomputeSize(); }

  respawn(x:number,y:number,heading:number,mass:number):void { this.active=true;this.alive=true;this.spawnProtected=true;this.spawnProtectionRemaining=BalanceConfig.snake.spawnProtectionMs;this.boosting=false;this.x=x;this.y=y;this.heading=heading;this.mass=mass;this.maxMass=Math.max(this.maxMass,mass);this.head.setVisible(true).setActive(true).setScale(1);this.headGlow.setVisible(true).setActive(true).setAlpha(this.glowAlpha).setScale(1);this.highlight.setVisible(true).setActive(true);this.eyeLeft.setVisible(true).setActive(true);this.eyeRight.setVisible(true).setActive(true);this.pupilLeft.setVisible(true).setActive(true);this.pupilRight.setVisible(true).setActive(true);this.shield.setVisible(true).setActive(true).setPosition(x,y);this.nameText.setVisible(true).setActive(true).setPosition(x,y-this.radius-17).setColor('#ffffff');this.head.setPosition(x,y);this.seedPath();this.recomputeSize();this.nameText.setPosition(x,y-this.radius-17);for(const seg of this.segments)seg.setPosition(x,y); }

  update(deltaMs:number, desiredAngle:number|null, boosting:boolean, arenaCenter:{x:number;y:number}, arenaRadius:number, turnScale=1):void {
    if(!this.alive)return; const clampedDelta=Math.min(deltaMs,50),dt=clampedDelta/1000; if(this.spawnProtected){this.spawnProtectionRemaining-=clampedDelta;if(this.spawnProtectionRemaining<=0){this.spawnProtected=false;this.shield.setVisible(false);}else this.shield.setVisible(true);}else this.shield.setVisible(false);
    const dx=this.x-arenaCenter.x,dy=this.y-arenaCenter.y,dist=Math.hypot(dx,dy); if(dist>arenaRadius-90){ const inward=Math.atan2(arenaCenter.y-this.y,arenaCenter.x-this.x); desiredAngle=desiredAngle===null?inward:desiredAngle+angleDiff(desiredAngle,inward)*0.6; }
    if(desiredAngle!==null){ const maxTurn=Phaser.Math.DegToRad(BalanceConfig.snake.turnSpeedDeg)*turnScale*dt; this.heading+=Phaser.Math.Clamp(angleDiff(this.heading,desiredAngle),-maxTurn,maxTurn); }
    this.boosting=boosting && this.mass>BalanceConfig.snake.boostMinMass; this.head.setScale(this.boosting?1.08:1);this.headGlow.setScale(this.boosting?1.25:1).setAlpha(this.boosting?Math.min(0.34,this.glowAlpha+0.16):this.glowAlpha); const speed=BalanceConfig.snake.baseSpeed*(this.boosting?BalanceConfig.snake.boostMultiplier:1); if(this.boosting)this.setMass(this.mass-BalanceConfig.snake.boostMassPerSecond*dt);
    const ox=this.x,oy=this.y; this.x+=Math.cos(this.heading)*speed*dt; this.y+=Math.sin(this.heading)*speed*dt;
    const ndx=this.x-arenaCenter.x,ndy=this.y-arenaCenter.y,nd=Math.hypot(ndx,ndy); if(nd>arenaRadius){ this.x=arenaCenter.x+ndx/nd*arenaRadius; this.y=arenaCenter.y+ndy/nd*arenaRadius; }
    this.travel+=Math.hypot(this.x-ox,this.y-oy); this.head.setPosition(this.x,this.y); this.shield.setPosition(this.x,this.y); this.nameText.setPosition(this.x,this.y-this.radius-17);this.updateFace();
    this.path.push({x:this.x,y:this.y,d:this.travel}); const spacing=Math.max(8,this.radius*0.9); const history=(this.segments.length+6)*spacing+80; while(this.path.length>2&&this.path[1].d<this.travel-history)this.path.shift();
    let cursor=this.path.length-2; for(let i=0;i<this.segments.length;i++){ const target=this.travel-(i+1)*spacing; while(cursor>0&&this.path[cursor].d>target)cursor--; const a=this.path[cursor]??this.path[0],b=this.path[Math.min(this.path.length-1,cursor+1)]??a; const span=Math.max(0.001,b.d-a.d); const t=Phaser.Math.Clamp((target-a.d)/span,0,1); this.segments[i].setPosition(Phaser.Math.Linear(a.x,b.x,t),Phaser.Math.Linear(a.y,b.y,t)); }
  }

  die():void { if(!this.alive)return; this.alive=false;this.active=false;for(const o of [this.head,this.headGlow,this.highlight,this.eyeLeft,this.eyeRight,this.pupilLeft,this.pupilRight,this.nameText,this.shield])o.setVisible(false);for(const s of this.segments)s.setVisible(false); }
  destroy():void { for(const o of [this.head,this.headGlow,this.highlight,this.eyeLeft,this.eyeRight,this.pupilLeft,this.pupilRight,this.nameText,this.shield])o.destroy();for(const s of this.segments)s.destroy(); }
}
