import * as Phaser from 'phaser';

const UI_RESOLUTION = Math.min(2, Math.max(1, window.devicePixelRatio || 1));

function paintButton(g:Phaser.GameObjects.Graphics,w:number,h:number,primary:boolean,state:'idle'|'hover'|'down'):void{
  const fill = primary
    ? (state==='down'?0xa8d52f:state==='hover'?0xd4ff57:0xc3f23f)
    : (state==='down'?0x18232b:state==='hover'?0x26343d:0x202b33);
  const stroke = primary ? 0x0c1518 : 0x3b4b54;
  g.clear();
  g.fillStyle(fill,1);
  g.fillRoundedRect(-w/2,-h/2,w,h,6);
  g.lineStyle(primary?2:1,stroke,primary?0.42:0.72);
  g.strokeRoundedRect(-w/2+0.5,-h/2+0.5,w-1,h-1,6);
}

export function addButton(scene:Phaser.Scene,x:number,y:number,w:number,h:number,label:string,onClick:()=>void,primary=false):Phaser.GameObjects.Container{
  const bg=scene.add.graphics();
  paintButton(bg,w,h,primary,'idle');
  const text=scene.add.text(0,0,label,{
    fontFamily:'Arial, Helvetica, sans-serif',
    fontSize:primary?'19px':'14px',
    fontStyle:'bold',
    color:primary?'#101817':'#f4f3ed',
    letterSpacing:primary?1.1:0.6,
  }).setOrigin(0.5).setResolution(UI_RESOLUTION);
  const c=scene.add.container(x,y,[bg,text]).setSize(w,h).setInteractive({useHandCursor:true});
  c.on('pointerover',()=>paintButton(bg,w,h,primary,'hover'));
  c.on('pointerout',()=>paintButton(bg,w,h,primary,'idle'));
  c.on('pointerdown',()=>paintButton(bg,w,h,primary,'down'));
  c.on('pointerup',()=>{paintButton(bg,w,h,primary,'hover');onClick();});
  return c;
}

export function panel(scene:Phaser.Scene,x:number,y:number,w:number,h:number):Phaser.GameObjects.Graphics{
  const g=scene.add.graphics();
  g.fillStyle(0x10181d,0.97);
  g.fillRoundedRect(x-w/2,y-h/2,w,h,10);
  g.lineStyle(1,0x34444d,0.85);
  g.strokeRoundedRect(x-w/2+0.5,y-h/2+0.5,w-1,h-1,10);
  return g;
}
