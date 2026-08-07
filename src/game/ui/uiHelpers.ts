import * as Phaser from 'phaser';

export function addButton(scene:Phaser.Scene,x:number,y:number,w:number,h:number,label:string,onClick:()=>void,primary=false):Phaser.GameObjects.Container{
  const bg=scene.add.rectangle(0,0,w,h,primary?0x5ee887:0x20354f,0.96).setStrokeStyle(2,primary?0xb9ffd0:0x5c7594,0.7);
  const text=scene.add.text(0,0,label,{fontFamily:'system-ui',fontSize:'18px',fontStyle:'bold',color:'#ffffff'}).setOrigin(0.5);
  const c=scene.add.container(x,y,[bg,text]).setDepth(100).setSize(w,h).setInteractive({useHandCursor:true});
  c.on('pointerover',()=>c.setScale(1.03));c.on('pointerout',()=>c.setScale(1));c.on('pointerdown',()=>c.setScale(0.98));c.on('pointerup',()=>{c.setScale(1.03);onClick();});return c;
}
export function panel(scene:Phaser.Scene,x:number,y:number,w:number,h:number):Phaser.GameObjects.Rectangle{return scene.add.rectangle(x,y,w,h,0x102033,0.94).setStrokeStyle(2,0x4b6687,0.55);}
