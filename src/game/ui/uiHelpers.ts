import * as Phaser from 'phaser';

function paintButton(g:Phaser.GameObjects.Graphics,w:number,h:number,primary:boolean,state:'idle'|'hover'|'down'):void{
  const fill = primary ? (state==='down'?0x47cf78:state==='hover'?0x72f29d:0x5ee887) : (state==='down'?0x14283d:state==='hover'?0x27435f:0x1d344d);
  const stroke = primary ? 0xbaffce : 0x587493;
  g.clear();
  g.fillStyle(0x000000,state==='down'?0.12:0.22);g.fillRoundedRect(-w/2+2,-h/2+5,w,h,Math.min(16,h/2));
  g.fillStyle(fill,1);g.fillRoundedRect(-w/2,-h/2,w,h,Math.min(16,h/2));
  g.lineStyle(primary?2:1.5,stroke,primary?0.72:0.56);g.strokeRoundedRect(-w/2+1,-h/2+1,w-2,h-2,Math.min(15,h/2-1));
  if(primary){g.fillStyle(0xffffff,0.12);g.fillRoundedRect(-w/2+3,-h/2+3,w-6,Math.max(5,h*0.28),Math.min(12,h/2));}
}

export function addButton(scene:Phaser.Scene,x:number,y:number,w:number,h:number,label:string,onClick:()=>void,primary=false):Phaser.GameObjects.Container{
  const bg=scene.add.graphics();paintButton(bg,w,h,primary,'idle');
  const text=scene.add.text(0,-1,label,{fontFamily:'Inter, system-ui, sans-serif',fontSize:primary?'18px':'16px',fontStyle:'bold',color:primary?'#082017':'#f3f8ff',letterSpacing:0.5}).setOrigin(0.5);
  const c=scene.add.container(x,y,[bg,text]).setSize(w,h).setInteractive({useHandCursor:true});
  c.on('pointerover',()=>{paintButton(bg,w,h,primary,'hover');c.setScale(1.015);});
  c.on('pointerout',()=>{paintButton(bg,w,h,primary,'idle');c.setScale(1);});
  c.on('pointerdown',()=>{paintButton(bg,w,h,primary,'down');c.setScale(0.985);});
  c.on('pointerup',()=>{paintButton(bg,w,h,primary,'hover');c.setScale(1.015);onClick();});
  return c;
}

export function panel(scene:Phaser.Scene,x:number,y:number,w:number,h:number):Phaser.GameObjects.Graphics{
  const g=scene.add.graphics();
  g.fillStyle(0x000000,0.22);g.fillRoundedRect(x-w/2+5,y-h/2+8,w,h,24);
  g.fillStyle(0x102236,0.93);g.fillRoundedRect(x-w/2,y-h/2,w,h,24);
  g.lineStyle(1.5,0x55718f,0.38);g.strokeRoundedRect(x-w/2+1,y-h/2+1,w-2,h-2,23);
  g.lineStyle(1,0xffffff,0.06);g.lineBetween(x-w/2+24,y-h/2+1,x+w/2-24,y-h/2+1);
  return g;
}
