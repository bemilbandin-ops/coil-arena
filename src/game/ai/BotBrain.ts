import * as Phaser from 'phaser';
import { BalanceConfig } from '../config/balance';
import type { FoodOrb } from '../entities/Food';
import type { Snake } from '../entities/Snake';

export type BotPersonality = 'Aggressive'|'Cautious'|'Greedy'|'Balanced'|'Opportunist';
export interface BotPerception { foods:FoodOrb[]; snakes:Snake[]; center:{x:number;y:number}; radius:number; }

const PERSONALITIES:BotPersonality[]=['Aggressive','Cautious','Greedy','Balanced','Opportunist'];
export class BotBrain {
  desiredAngle:number; boosting=false; private nextThink=0; readonly personality:BotPersonality;
  constructor(private snake:Snake,index:number){this.desiredAngle=snake.heading;this.personality=PERSONALITIES[index%PERSONALITIES.length];this.nextThink=index*17;}
  think(now:number,p:BotPerception):void{
    if(now<this.nextThink||!this.snake.alive)return; this.nextThink=now+BalanceConfig.bot.thinkIntervalMs+Math.random()*110;
    const s=this.snake; let danger:Snake|null=null, dangerD=Infinity, prey:Snake|null=null, preyScore=-Infinity;
    for(const o of p.snakes){if(o===s||!o.alive||o.spawnProtected)continue;const d=Phaser.Math.Distance.Between(s.x,s.y,o.x,o.y);if(o.power>s.power*1.05&&d<dangerD){danger=o;dangerD=d;} if(s.power>=o.power*1.05){const score=o.mass*2-d*0.08;if(score>preyScore){preyScore=score;prey=o;}}}
    const cautious=this.personality==='Cautious'; if(danger && dangerD<(cautious?300:210)){this.desiredAngle=Math.atan2(s.y-danger.y,s.x-danger.x);this.boosting=s.mass>18;return;}
    const aggressive=this.personality==='Aggressive'||this.personality==='Opportunist'; if(prey && (aggressive||preyScore>18)){this.desiredAngle=Math.atan2(prey.y-s.y,prey.x-s.x);this.boosting=aggressive&&Phaser.Math.Distance.Between(s.x,s.y,prey.x,prey.y)<220;return;}
    let best:FoodOrb|null=null,bestScore=-Infinity;for(const f of p.foods){if(!f.active)continue;const d=Phaser.Math.Distance.Between(s.x,s.y,f.x,f.y);const value=f.value*(this.personality==='Greedy'?2:1);const score=value*12-d*0.08;if(score>bestScore){bestScore=score;best=f;}}
    if(best){this.desiredAngle=Math.atan2(best.y-s.y,best.x-s.x);this.boosting=false;return;}
    const edge=Phaser.Math.Distance.Between(s.x,s.y,p.center.x,p.center.y);if(edge>p.radius-220){this.desiredAngle=Math.atan2(p.center.y-s.y,p.center.x-s.x);return;}
    this.desiredAngle+=Phaser.Math.FloatBetween(-0.6,0.6);this.boosting=false;
  }
}
