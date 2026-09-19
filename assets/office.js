// The intern's office — a 3D room where he reads the vote, buys the stock, and hands it out. Rehearsal only; every number he prints is tagged SIM.
import * as THREE from '/assets/three.module.min.js';

export function startOffice(o){
  const box=o.box, Q=o.Q, fmt=o.fmt, log=o.log, onState=o.onState||function(){}, votes=o.votes;
  const LIST=Object.keys(Q.quotes);
  const red=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const gl=document.getElementById('gl'), ov=document.getElementById('ov');

  // ---------- renderer / scene ----------
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;renderer.outputColorSpace=THREE.SRGBColorSpace;
  gl.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(30,1,0.1,200);
  scene.add(new THREE.HemisphereLight(0xe6eef8,0x9a9384,0.85));
  const sun=new THREE.DirectionalLight(0xfff3e0,1.5);sun.position.set(10,18,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  const sc=sun.shadow.camera;sc.left=-18;sc.right=18;sc.top=18;sc.bottom=-18;sc.near=1;sc.far=60;sun.shadow.bias=-0.0005;sun.shadow.radius=3;scene.add(sun);
  const fill=new THREE.DirectionalLight(0xd6e4ff,0.45);fill.position.set(-12,8,10);scene.add(fill);

  const M=(c,p)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.8,metalness:0},p||{}));
  const mat={wall:M(0xe8e4d8,{roughness:1}),base:M(0xcfcabd),deskT:M(0xd9c3a0),leg:M(0x9aa0a6,{metalness:.5,roughness:.4}),mon:M(0x202124,{roughness:.4}),
    white:M(0xf6f6f4),paper:M(0xf3f3ef,{roughness:1}),ink:M(0x1b1b1b,{roughness:.5}),orange:M(0xf07a1a),blue:M(0x2b56c9),green:M(0x2f9e5b),
    skin:M(0xf1c9a5,{roughness:.55}),hair:M(0x3a2a1e),shirt:M(0xf7f7f5),glass:M(0x222222,{roughness:.3,metalness:.2}),cab:M(0xbfb9aa),cabD:M(0x8e887a),
    plant:M(0x4f8a4a,{roughness:1}),pot:M(0xb86a3c),cup:M(0xf3efe6),lid:M(0xe9e4d8),tray:M(0xc9b48f),steel:M(0xb9bec4,{metalness:.7,roughness:.35}),
    water:M(0x9fd0ff,{transparent:true,opacity:.6,roughness:.1})};
  const mesh=(g,m,x,y,z,p)=>{const o_=new THREE.Mesh(g,m);o_.position.set(x||0,y||0,z||0);o_.castShadow=true;o_.receiveShadow=true;(p||scene).add(o_);return o_};
  const BOX=(a,b,c)=>new THREE.BoxGeometry(a,b,c),CYL=(a,b,h,s)=>new THREE.CylinderGeometry(a,b,h,s||24),SPH=(r,a,b)=>new THREE.SphereGeometry(r,a||24,b||18),CAP=(r,l)=>new THREE.CapsuleGeometry(r,l,6,18);

  // ---------- room ----------
  const RW=20,RD=14; // floor x∈[-13,13], z∈[-9,9]; back wall z=-9, left wall x=-13
  const carpet=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.fillStyle=(i+j)%2?'#a9b3bd':'#b6bfc8';x.fillRect(i*64,j*64,64,64)}
    x.fillStyle='rgba(0,0,0,.06)';for(let i=0;i<4000;i++)x.fillRect(Math.random()*256,Math.random()*256,1,1);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(RW/2.5,RD/2.5);return t})();
  const floor=new THREE.Mesh(new THREE.BoxGeometry(RW,.4,RD),[mat.base,mat.base,new THREE.MeshStandardMaterial({map:carpet,roughness:.95}),mat.base,mat.base,mat.base]);floor.position.y=-.2;floor.receiveShadow=true;scene.add(floor);
  const backW=mesh(BOX(RW,7,.4),mat.wall,0,3.5,-RD/2-.2);const leftW=mesh(BOX(.4,7,RD),mat.wall,-RW/2-.2,3.5,0);
  mesh(BOX(RW,.5,.5),mat.base,0,.25,-RD/2-.05);mesh(BOX(.5,.5,RD),mat.base,-RW/2-.05,.25,0);
  // window on the back wall (right side) with a pale sky
  const winMat=M(0xcfe6fb,{emissive:0xcfe6fb,emissiveIntensity:.35});const win=mesh(BOX(5,3,.2),winMat,7,3.6,-RD/2+.12);win.castShadow=false;
  // ceiling lamp over the desk + a rug + a framed badge on the wall
  const lampMat=M(0xfff6dd,{emissive:0xfff6dd,emissiveIntensity:0});mesh(CYL(.02,.02,1.4,6),mat.steel,-4.5,6.8,0).castShadow=false;const lamp=mesh(new THREE.ConeGeometry(.55,.4,24,1,true),M(0x2b2b2b,{side:THREE.DoubleSide}),-4.5,6.0,0);lamp.castShadow=false;mesh(SPH(.16,12,10),lampMat,-4.5,5.9,0).castShadow=false;const lampL=new THREE.PointLight(0xfff0d0,0,9,2);lampL.position.set(-4.5,5.7,0);scene.add(lampL);
  const rug=mesh(BOX(6,.04,4.4),M(0x7c8fb0,{roughness:1}),-5,.02,0);rug.castShadow=false;mesh(BOX(5.6,.045,4.0),M(0x92a4c4,{roughness:1}),-5,.02,0).castShadow=false;
  [[7,2.1,5.2,.18],[7,5.1,5.2,.18],[4.5,3.6,.18,3.2],[9.5,3.6,.18,3.2],[7,3.6,.14,3.2],[7,3.6,5.2,.14]].forEach(a=>mesh(BOX(a[2],a[3],.26),mat.white,a[0],a[1],-RD/2+.14).castShadow=false);
  // door on the left wall
  mesh(BOX(.2,4.4,2.2),M(0xd8cdb5),-RW/2+.12,2.2,4);mesh(SPH(.09),mat.steel,-RW/2+.28,2.1,3.3);
  // clock on the back wall, real UTC hands
  const clock=new THREE.Group();clock.position.set(-6.8,5.3,-RD/2+.15);scene.add(clock);
  mesh(CYL(.7,.7,.12,32),mat.white,0,0,0,clock).rotation.x=Math.PI/2;mesh(new THREE.TorusGeometry(.7,.05,8,40),mat.ink,0,0,.06,clock);
  const hH=mesh(BOX(.06,.36,.03),mat.ink,0,0,.1,clock),hM=mesh(BOX(.04,.52,.03),mat.ink,0,0,.11,clock),hS=mesh(BOX(.02,.58,.02),mat.orange,0,0,.12,clock);
  hH.geometry.translate(0,.18,0);hM.geometry.translate(0,.26,0);hS.geometry.translate(0,.24,0);
  // framed badge: employee of the month, day 1
  mesh(BOX(1.5,1.9,.08),M(0x3a2a1e),-8.2,4.2,-RD/2+.14).castShadow=false;const frameMat=new THREE.MeshStandardMaterial({roughness:.7});const framed=mesh(BOX(1.3,1.7,.02),frameMat,-8.2,4.2,-RD/2+.2);framed.castShadow=false;

  // ---------- the vote board on the back wall ----------
  const boardC=document.createElement('canvas');boardC.width=1024;boardC.height=640;const bx=boardC.getContext('2d');
  const boardTex=new THREE.CanvasTexture(boardC);boardTex.colorSpace=THREE.SRGBColorSpace;
  const board=mesh(BOX(8,5,.16),new THREE.MeshStandardMaterial({map:boardTex,roughness:.6}),-.5,3.7,-RD/2+.16);board.castShadow=false;
  mesh(BOX(8.3,5.3,.1),mat.steel,-.5,3.7,-RD/2+.1).castShadow=false;
  let WIN=null;function drawBoard(){const v=votes(),tot=LIST.reduce((a,t)=>a+(v[t]||0),0),max=Math.max(1,...LIST.map(t=>v[t]||0));
    bx.fillStyle='#fbfbf8';bx.fillRect(0,0,1024,640);bx.fillStyle='#2b56c9';bx.fillRect(0,0,1024,74);
    bx.fillStyle='#fff';bx.font='bold 40px Inter, DejaVu Sans, sans-serif';bx.textAlign='left';bx.fillText("TODAY'S VOTE",28,52);
    bx.font='bold 22px IBM Plex Mono, DejaVu Sans Mono, monospace';bx.textAlign='right';bx.fillText(tot?tot+' VOTES · SIM':'NO VOTES YET · OPENS WITH THE TOKEN',996,50);
    const rank=LIST.slice().sort((a,b)=>(v[b]||0)-(v[a]||0)||LIST.indexOf(a)-LIST.indexOf(b));
    rank.forEach((tk,i)=>{const col=i%2,row=Math.floor(i/2),x0=28+col*500,y0=104+row*104,n=v[tk]||0,q=Q.quotes[tk],ch=(q.price-q.prev)/q.prev*100;
      bx.fillStyle='#1c2030';bx.font='bold 34px IBM Plex Mono, DejaVu Sans Mono, monospace';bx.textAlign='left';bx.fillText(tk,x0,y0+34);
      bx.fillStyle=ch>=0?'#2f9e5b':'#c8332b';bx.font='bold 20px IBM Plex Mono, DejaVu Sans Mono, monospace';bx.fillText((ch>=0?'+':'')+ch.toFixed(2)+'%',x0+150,y0+32);
      if(tk===WIN){bx.fillStyle='rgba(240,122,26,.16)';bx.fillRect(x0-12,y0-2,486,96);bx.fillStyle='#f07a1a';bx.font='bold 18px IBM Plex Mono, DejaVu Sans Mono, monospace';bx.textAlign='right';bx.fillText('RESULT · BUYING',x0+460,y0+18)}bx.fillStyle='#e6e4dc';bx.fillRect(x0,y0+52,460,22);if(n){bx.fillStyle=i===0?'#f07a1a':'#2b56c9';bx.fillRect(x0,y0+52,Math.max(14,460*n/max),22)}
      bx.fillStyle='#6a6f7a';bx.font='bold 18px IBM Plex Mono, DejaVu Sans Mono, monospace';bx.textAlign='right';bx.fillText(n?n+(n>1?' votes':' vote'):'—',x0+460,y0+38)});
    bx.fillStyle='#6a6f7a';bx.font='20px IBM Plex Mono, DejaVu Sans Mono, monospace';bx.textAlign='left';bx.fillText('closes 15:30 UTC · he buys the winner at 15:35',28,622);
    boardTex.needsUpdate=true}
  drawBoard();

  // ---------- desk + monitor ----------
  const desk=new THREE.Group();desk.position.set(-6.6,0,0);scene.add(desk); // along the left wall, the intern sits at x≈-6.4 facing -x
  mesh(BOX(1.8,.12,4.8),mat.deskT,0,1.35,0,desk);[[-.75,-2.2],[.75,-2.2],[-.75,2.2],[.75,2.2]].forEach(a=>mesh(CYL(.05,.05,1.3,10),mat.leg,a[0],.65,a[1],desk));
  const monC=document.createElement('canvas');monC.width=512;monC.height=320;const mc=monC.getContext('2d');const monTex=new THREE.CanvasTexture(monC);monTex.colorSpace=THREE.SRGBColorSpace;
  const mon=new THREE.Group();mon.position.set(-.35,1.41,0);mon.rotation.y=Math.PI/2;desk.add(mon);
  mesh(CYL(.28,.32,.04),mat.mon,0,.02,0,mon);mesh(BOX(.08,.5,.06),mat.mon,0,.28,0,mon);mesh(BOX(1.7,1.05,.06),mat.mon,0,1.0,0,mon);
  const scr=mesh(BOX(1.56,.92,.02),new THREE.MeshStandardMaterial({map:monTex,emissiveMap:monTex,emissive:0xffffff,emissiveIntensity:.7,roughness:.4}),0,1.0,.035,mon);scr.castShadow=false;
  mesh(BOX(.36,.04,1.1),M(0xe8e8e4),.5,1.43,0,desk);mesh(CAP(.06,.08),M(0xe8e8e4),.5,1.45,.8,desk).rotation.z=Math.PI/2;
  let paperY=1.41;for(let i=0;i<12;i++){const p=mesh(BOX(.8,.025,.6),mat.paper,.1+(Math.random()-.5)*.04,paperY,-1.8,desk);p.rotation.y=(Math.random()-.5)*.1;paperY+=.027}
  mesh(CYL(.1,.09,.22,20),mat.white,.45,1.52,1.7,desk);
  const chair=new THREE.Group();chair.position.set(-3.9,0,.9);scene.add(chair);mesh(CYL(.4,.4,.08,20),mat.ink,0,.06,0,chair);mesh(CYL(.05,.05,.7,8),mat.steel,0,.4,0,chair);mesh(BOX(1.1,.14,1.1),mat.blue,0,.8,0,chair);mesh(BOX(.14,1.2,1.1),mat.blue,.55,1.4,0,chair);
  function drawMon(order){mc.fillStyle='#0f1a2e';mc.fillRect(0,0,512,320);mc.fillStyle='#2b4a8a';mc.fillRect(0,0,512,36);mc.fillStyle='#fff';mc.font='bold 20px Inter, DejaVu Sans, sans-serif';mc.textAlign='left';mc.fillText('BUY ORDERS — INTERN',14,26);
    const rank=LIST.slice().sort((a,b)=>{const qa=Q.quotes[a],qb=Q.quotes[b];return (qb.price-qb.prev)/qb.prev-(qa.price-qa.prev)/qa.prev}).slice(0,6);
    rank.forEach((tk,i)=>{const q=Q.quotes[tk],ch=(q.price-q.prev)/q.prev*100,y=66+i*30;mc.fillStyle='#dfe6f5';mc.font='bold 20px IBM Plex Mono, DejaVu Sans Mono, monospace';mc.fillText(tk,16,y);mc.fillStyle='#9fb3d9';mc.fillText(fmt(q.price),130,y);mc.fillStyle=ch>=0?'#39c66d':'#e05252';mc.fillText((ch>=0?'+':'')+ch.toFixed(2)+'%',290,y)});
    mc.fillStyle=order?'#39c66d':'#233a66';mc.fillRect(400,60,96,44);mc.fillStyle='#fff';mc.font='bold 22px Inter, DejaVu Sans, sans-serif';mc.textAlign='center';mc.fillText('BUY',448,90);
    mc.textAlign='left';mc.fillStyle='#9fb3d9';mc.font='16px IBM Plex Mono, DejaVu Sans Mono, monospace';mc.fillText(order?('filled · '+order+' · SIM'):'no order · vote first',16,300);monTex.needsUpdate=true}
  drawMon(null);

  // ---------- printer (side table by the desk) ----------
  const printer=new THREE.Group();printer.position.set(-7.2,0,-4.6);scene.add(printer);
  mesh(BOX(1.6,.1,1.2),mat.deskT,0,1.0,0,printer);[[-.7,-.5],[.7,-.5],[-.7,.5],[.7,.5]].forEach(a=>mesh(CYL(.04,.04,1,8),mat.leg,a[0],.5,a[1],printer));
  mesh(BOX(1.2,.5,.9),M(0xd9d9d4),0,1.3,0,printer);mesh(BOX(.9,.06,.5),mat.ink,0,1.57,0,printer);
  const slip=mesh(BOX(.5,.01,.001),mat.paper,0,1.42,.5,printer);slip.visible=false;

  // ---------- pigeonholes (holders) on the back wall ----------
  const holes=[];const cab=new THREE.Group();cab.position.set(5.5,0,-RD/2+.5);scene.add(cab);
  const HC=6,HR=4,HW=.95,HH=.72;mesh(BOX(HC*HW+.2,HR*HH+.2,.9),mat.cab,0,1.0+HR*HH/2,0,cab);
  for(let r=0;r<HR;r++)for(let c=0;c<HC;c++){const x=(c-(HC-1)/2)*HW,y=1.0+.1+r*HH+HH/2-.02;const h=mesh(BOX(HW-.12,HH-.12,.8),new THREE.MeshStandardMaterial({color:0x8e887a,roughness:.9,emissive:0xf07a1a,emissiveIntensity:0}),x,y,.08,cab);h.castShadow=false;
    const tag=mesh(BOX(.5,.14,.02),mat.paper,x,y-HH/2+.2,.5,cab);tag.castShadow=false;holes.push({m:h,pos:new THREE.Vector3(cab.position.x+x,y,cab.position.z+.5),flash:0})}
  mesh(BOX(HC*HW+.2,.12,1.0),mat.cabD,0,1.0,0,cab);
  // water cooler + plant
  const cool=new THREE.Group();cool.position.set(8.6,0,-1.8);scene.add(cool);mesh(BOX(.7,2.2,.7),M(0xdcdcd8),0,1.1,0,cool);mesh(CYL(.32,.36,1.0,20),mat.water,0,2.7,0,cool);mesh(SPH(.36,20,14),mat.water,0,3.2,0,cool);mesh(BOX(.1,.14,.16),mat.blue,.3,1.7,.4,cool);
  const plant=new THREE.Group();plant.position.set(-8.8,0,-5.9);scene.add(plant);mesh(CYL(.45,.35,.8,16),mat.pot,0,.4,0,plant);for(let i=0;i<7;i++){const l=mesh(new THREE.ConeGeometry(.22,1.3+Math.random()*.7,6),mat.plant,Math.cos(i)*.25,1.4,Math.sin(i)*.25,plant);l.rotation.z=Math.cos(i)*.5;l.rotation.x=Math.sin(i)*.5}

  // ---------- the intern ----------
  function badgeTex(){const c=document.createElement('canvas');c.width=128;c.height=192;const x=c.getContext('2d');x.fillStyle='#fbfbfa';x.fillRect(0,0,128,192);x.fillStyle='#f07a1a';x.fillRect(0,0,128,40);x.fillStyle='#fff';x.font='bold 24px Inter, DejaVu Sans, sans-serif';x.textAlign='center';x.fillText('$INTERN',64,29);
    x.fillStyle='#dedcd6';x.fillRect(24,50,80,74);x.fillStyle='#f1c9a5';x.beginPath();x.arc(64,82,22,0,7);x.fill();x.fillStyle='#3a2a1e';x.beginPath();x.arc(64,72,22,Math.PI,0);x.fill();x.fillStyle='#2b2b2b';x.font='bold 17px Inter, DejaVu Sans, sans-serif';x.fillText('$INTERN',64,152);x.fillStyle='#888';x.font='12px Inter, sans-serif';x.fillText('DAY 1',64,172);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
  function intern(){const g=new THREE.Group();const body=mesh(CAP(.62,.55),mat.shirt,0,1.25,0,g);body.scale.set(1,1,.82);
    const col=mesh(new THREE.TorusGeometry(.34,.075,12,40),mat.white,0,1.87,.02,g);col.rotation.x=Math.PI/2;col.scale.set(1,.85,1);
    for(let i=0;i<3;i++)mesh(SPH(.035,10,8),M(0xd9d6cf),0,1.67-i*.2,.56-i*.01,g);
    const legs=[];[-.22,.22].forEach(x=>{const lg=new THREE.Group();lg.position.set(x,.6,0);g.add(lg);mesh(CYL(.13,.12,.55,10),M(0x2e3a55),0,-.28,0,lg);mesh(BOX(.3,.16,.44),mat.ink,0,-.58,.06,lg);legs.push(lg)});
    const armL=new THREE.Group(),armR=new THREE.Group();armL.position.set(-.62,1.53,0);armR.position.set(.62,1.53,0);g.add(armL,armR);
    [armL,armR].forEach(a=>{mesh(CYL(.2,.19,.32,14),mat.shirt,0,-.1,0,a);mesh(CAP(.13,.45),mat.skin,0,-.5,0,a);mesh(SPH(.17,16,12),mat.skin,0,-.85,0,a)});
    mesh(CYL(.2,.22,.3,14),mat.skin,0,1.93,0,g);
    const head=new THREE.Group();head.position.set(0,2.57,0);g.add(head);const hd=mesh(SPH(.72,36,28),mat.skin,0,0,0,head);hd.scale.set(1,1.02,.96);
    mesh(new THREE.SphereGeometry(.745,36,28,0,Math.PI*2,0,Math.PI*.47),mat.hair,0,.02,-.02,head);const fr=mesh(SPH(.5,24,16),mat.hair,0,.45,.42,head);fr.scale.set(1,.22,.7);fr.rotation.x=-.35;
    const cl=mesh(new THREE.ConeGeometry(.09,.42,8),mat.hair,.12,.86,-.05,head);cl.rotation.z=-.35;cl.rotation.x=-.25;const cl2=mesh(new THREE.ConeGeometry(.07,.32,8),mat.hair,-.08,.84,-.1,head);cl2.rotation.z=.4;
    mesh(SPH(.11,12,10),mat.skin,-.7,-.02,0,head);mesh(SPH(.11,12,10),mat.skin,.7,-.02,0,head);
    const eyes=[];[-1,1].forEach(s=>{const e=mesh(SPH(.2,20,16),mat.white,s*.26,.02,.6,head);e.scale.set(1,1.12,.55);eyes.push(e);const ir=mesh(SPH(.105,16,12),M(0x2a4f8f,{roughness:.35}),s*.24,.01,.74,head);ir.scale.set(1,1,.5);mesh(SPH(.06,10,8),mat.ink,s*.235,0,.78,head);
      const hl=mesh(SPH(.035,8,6),M(0xffffff,{emissive:0xffffff,emissiveIntensity:.8}),s*.21+.03,.06,.82,head);hl.castShadow=false;const b=mesh(BOX(.28,.05,.05),mat.hair,s*.27,.31,.62,head);b.rotation.z=s*-.28;b.rotation.x=.3;
      const fr_=mesh(new THREE.TorusGeometry(.235,.02,8,32),mat.glass,s*.26,.02,.66,head);fr_.castShadow=false});
    mesh(BOX(.1,.02,.02),mat.glass,0,.04,.7,head);mesh(SPH(.09,12,10),M(0xe8b48f),0,-.16,.7,head);
    const sm=mesh(new THREE.TorusGeometry(.2,.045,8,32,Math.PI),M(0x7a2a2a),0,-.34,.62,head);sm.rotation.z=Math.PI;sm.rotation.x=.2;sm.scale.set(1,.8,1);mesh(BOX(.22,.06,.05),mat.white,0,-.31,.66,head);
    [-1,1].forEach(s=>{const bl=mesh(SPH(.1,12,10),M(0xf0a08a,{transparent:true,opacity:.55}),s*.48,-.2,.5,head);bl.scale.set(1,.6,.4);bl.castShadow=false});
    const path=new THREE.CatmullRomCurve3([new THREE.Vector3(-.15,1.5,.62),new THREE.Vector3(-.3,1.75,.44),new THREE.Vector3(-.31,1.99,.02),new THREE.Vector3(0,2.01,-.3),new THREE.Vector3(.31,1.99,.02),new THREE.Vector3(.3,1.75,.44),new THREE.Vector3(.15,1.5,.62)],true,'catmullrom',.6);
    mesh(new THREE.TubeGeometry(path,80,.028,8,true),mat.orange,0,0,0,g);
    const bd=mesh(BOX(.48,.68,.03),new THREE.MeshStandardMaterial({map:badgeTex(),roughness:.6}),0,1.15,.67,g);bd.rotation.x=-.08;mesh(BOX(.12,.05,.04),mat.steel,0,1.495,.63,g);
    const pen=mesh(CYL(.022,.022,.46,8),mat.blue,.7,.16,-.16,head);pen.rotation.z=1.35;pen.rotation.x=.35;
    // things he can hold
    const hold=new THREE.Group();hold.position.set(0,.55,.85);g.add(hold);
    const tray=new THREE.Group();mesh(BOX(.9,.06,.9),mat.tray,0,0,0,tray);[[-.22,-.22],[.22,-.22],[-.22,.22],[.22,.22]].forEach(a=>{mesh(CYL(.13,.1,.34,16),mat.cup,a[0],.2,a[1],tray);mesh(CYL(.14,.14,.05,16),mat.lid,a[0],.39,a[1],tray)});tray.visible=false;hold.add(tray);
    const parcel=mesh(BOX(.7,.5,.5),mat.orange,0,.25,0,hold);mesh(BOX(.72,.08,.52),mat.white,0,.25,0,parcel);parcel.visible=false;
    const paper=mesh(BOX(.5,.01,.7),mat.paper,0,.02,0,hold);paper.visible=false;
    g.scale.setScalar(.95);
    return {g,head,armL,armR,legs,eyes,hold,tray,parcel,paper}}
  const I=intern();scene.add(I.g);frameMat.map=badgeTex();frameMat.needsUpdate=true;
  // ---------- a coworker who wanders through ----------
  const boss=intern();boss.g.traverse(m=>{if(m.material===mat.shirt)m.material=M(0x4a5568);if(m.material===mat.hair)m.material=M(0x8a8a86)});boss.g.scale.setScalar(1.08);boss.g.position.set(-RW/2-1.5,0,4);boss.g.visible=false;scene.add(boss.g);
  let bossSt='away',bossT=30000+Math.random()*20000,bossFrom=null,bossTo=null;
  const BOSS_PATH=[new THREE.Vector3(-RW/2+.6,0,4),new THREE.Vector3(-1,0,3.2),new THREE.Vector3(6.6,0,-1.2)];
  function stepBoss(dt,ts){if(bossSt==='away'){bossT-=dt;if(bossT<=0&&!document.hidden){bossSt='in';boss.g.visible=true;boss.g.position.copy(BOSS_PATH[0]);bossLeg=0;bossTo=BOSS_PATH[1].clone();say2(boss,'just checking',1800)}return}
    if(bossSt==='in'||bossSt==='out'){const d=bossTo.clone().sub(boss.g.position);d.y=0;const dist=d.length(),step=2.4*dt/1000;
      if(dist<=step){boss.g.position.copy(bossTo);if(bossSt==='in'){bossLeg++;if(bossLeg<BOSS_PATH.length){bossTo=BOSS_PATH[bossLeg].clone()}else{bossSt='look';bossT=2600;boss.g.rotation.y=Math.atan2(I.g.position.x-boss.g.position.x,I.g.position.z-boss.g.position.z)}}else{boss.g.visible=false;bossSt='away';bossT=45000+Math.random()*40000}}
      else{d.normalize();boss.g.position.addScaledVector(d,step);boss.g.rotation.y+=angDiff(Math.atan2(d.x,d.z),boss.g.rotation.y)*.2;boss.legs[0].rotation.x=Math.sin(ts/95)*.7;boss.legs[1].rotation.x=-Math.sin(ts/95)*.7;boss.g.position.y=Math.abs(Math.sin(ts/95))*.04}}
    else if(bossSt==='look'){bossT-=dt;if(bossT<=0){bossSt='out';bossLeg=0;bossTo=BOSS_PATH[0].clone().add(new THREE.Vector3(-1.6,0,0));say2(boss,cur?'good':'looks busy',1500)}}}
  let bossLeg=0;function say2(who,html,life){const p=who.g.position.clone();p.y+=2.95;return pop(p,html,'',life)}
  const SPOTS={desk:{p:new THREE.Vector3(-4.5,0,0),face:Math.PI*1.5},board:{p:new THREE.Vector3(-.5,0,-4.4),face:Math.PI},printer:{p:new THREE.Vector3(-5.4,0,-4.6),face:Math.PI*1.5},holes:{p:new THREE.Vector3(5.5,0,-4.5),face:Math.PI},cooler:{p:new THREE.Vector3(7.1,0,-1.3),face:Math.PI*.5},mid:{p:new THREE.Vector3(1,0,1),face:0}};
  I.g.position.copy(SPOTS.desk.p);I.g.rotation.y=SPOTS.desk.face;

  // ---------- overlays (HTML projected) ----------
  function pop(worldPos,html,cls,life){const m=document.createElement('div');m.className='msg'+(cls?' '+cls:'');m.innerHTML=html;m.dataset.x=worldPos.x;m.dataset.y=worldPos.y;m.dataset.z=worldPos.z;ov.appendChild(m);setTimeout(()=>m.remove(),life||3800);return m}
  function say(html,life){const p=I.g.position.clone();p.y+=2.75;return pop(p,html,'',life)}
  const parcels=[];const parcelGeo=new THREE.BoxGeometry(.28,.2,.2);

  // ---------- the day, as a state machine ----------
  let st='idle',t=0,from=null,to=null,face=0,queue=[],cur=null,cycles=0,lastAuto=0,idleTimer=0,typing=0;
  const speed=3.2;
  function walkTo(spot,then){queue.push({kind:'walk',spot:spot});if(then)queue.push({kind:'do',fn:then})}
  function wait(ms,fn){queue.push({kind:'wait',ms:ms,fn:fn})}
  function leader(){const v=votes();let best=null,bn=0;LIST.forEach(tk=>{const n=v[tk]||0;if(n>bn){bn=n;best=tk}});return best?{tk:best,n:bn,why:'the vote'}:{tk:topMover(),n:0,why:'no votes, top mover'}}
  function topMover(){return LIST.slice().sort((a,b)=>{const qa=Q.quotes[a],qb=Q.quotes[b];return (qb.price-qb.prev)/qb.prev-(qa.price-qa.prev)/qa.prev})[0]}
  function runDay(potUSDG){if(cur)return false;const L=leader(),tk=L.tk,q=Q.quotes[tk],pot=potUSDG||1000,toYou=pot*.9,shares=toYou/q.price,n=Math.min(holes.length,8+Math.floor(Math.random()*8)),each=shares/n;cur={tk,q,pot,toYou,shares,n,each,why:L.why};
    onState('reading');
    walkTo('board',()=>{WIN=tk;drawBoard();I.head.rotation.x=-.25;say('<b>'+tk+'</b> '+(L.n?'wins with '+L.n+(L.n>1?' votes':' vote'):'— no votes yet, so today it\'s the top mover')+'<i>SIM</i>',3200);log('vote closed. '+tk+' — '+L.why+'. I post before I buy.',true)});
    wait(2600,()=>{I.head.rotation.x=0;onState('buying')});
    walkTo('desk',()=>{typing=2200;I.armL.rotation.x=-1.0;I.armR.rotation.x=-1.0});
    wait(1400,()=>{drawMon(shares.toFixed(4)+' '+tk+' @ '+fmt(q.price));const p=new THREE.Vector3(-7,3.3,0);pop(p,'<b>BUY</b> '+shares.toFixed(4)+' '+tk+' at '+fmt(q.price)+' · '+toYou.toLocaleString('en-US')+' USDG<i>SIM</i>','win',4200);log('SIM · bought '+shares.toFixed(4)+' '+tk+' at '+fmt(q.price)+' with '+toYou.toLocaleString('en-US')+' USDG (90% of a '+pot.toLocaleString('en-US')+' USDG pot). quote, guard, dry-run, swap. nothing moved.',true)});
    wait(1200,()=>{I.armL.rotation.x=0;I.armR.rotation.x=0;slip.visible=true;slip.scale.y=1;slip.position.z=.5;onState('printing')});
    walkTo('printer',()=>{slip.visible=false;I.paper.visible=true;I.armL.rotation.x=-.7;I.armR.rotation.x=-.7;say('receipt<i>SIM</i>',1500)});
    wait(700,()=>{I.paper.visible=false;I.parcel.visible=true;onState('delivering')});
    walkTo('holes',()=>{const picks=holes.slice().sort(()=>Math.random()-.5).slice(0,n);picks.forEach((h,i)=>{parcels.push({m:null,a:I.g.position.clone().add(new THREE.Vector3(0,1.4,.6)),b:h.pos.clone(),t:-i*.22,h:h});setTimeout(()=>{if(i<4||i===n-1)pop(h.pos.clone().add(new THREE.Vector3(0,.45,0)),'+'+each.toFixed(4)+' '+tk,'plus',1600)},i*220+900)});
      say('<b>'+each.toFixed(4)+' '+tk+'</b> each · '+n+' wallets<i>SIM</i>',3400);log('SIM · sent '+each.toFixed(4)+' '+tk+' to each of '+n+' wallets by balance. not a claim. a transfer. nothing moved.',true)});
    wait(n*220+1400,()=>{I.parcel.visible=false;I.armL.rotation.x=0;I.armR.rotation.x=0;cycles++;onState('done',cycles)});
    walkTo('desk',()=>{cur=null;WIN=null;drawBoard();onState('idle');drawMon(null)});
    return true}
  function idleErrand(){if(cur||queue.length)return;const r=Math.random();
    if(r<.45){onState('coffee');walkTo('cooler',()=>{I.tray.visible=true;I.armL.rotation.x=-.62;I.armR.rotation.x=-.62;say('coffee run',1400)});wait(900);walkTo('desk',()=>{I.tray.visible=false;I.armL.rotation.x=0;I.armR.rotation.x=0;onState('idle')})}
    else if(r<.75){onState('reading');walkTo('board',()=>{I.head.rotation.x=-.25;const L=leader();say(L.n?'<b>'+L.tk+'</b> leads · '+L.n+(L.n>1?' votes':' vote'):'no votes yet',2200)});wait(1800,()=>{I.head.rotation.x=0});walkTo('desk',()=>onState('idle'))}
    else{typing=2600}}
  function stepIntern(dt,ts){
    if(st==='idle'){if(queue.length){const q=queue.shift();if(q.kind==='walk'){const s=SPOTS[q.spot];from=I.g.position.clone();to=s.p.clone();face=s.face;st='walk';t=0}else if(q.kind==='wait'){st='wait';t=q.ms;cur_fn=q.fn}else if(q.kind==='do'){q.fn()}}
      else{idleTimer+=dt;if(typing>0){typing-=dt;I.armL.rotation.x=-1+Math.sin(ts/70)*.1;I.armR.rotation.x=-1-Math.sin(ts/70)*.1;if(typing<=0){I.armL.rotation.x=0;I.armR.rotation.x=0}}
        if(!document.hidden&&idleTimer>7000+Math.random()*6000){idleTimer=0;if(ts-lastAuto>52000){lastAuto=ts;runDay()}else idleErrand()}}
      I.g.position.y=Math.sin(ts/900)*.02}
    else if(st==='wait'){t-=dt;if(t<=0){st='idle';if(cur_fn)cur_fn();cur_fn=null}}
    else if(st==='walk'){const d=to.clone().sub(I.g.position);d.y=0;const dist=d.length(),step=speed*dt/1000;
      if(dist<=step){I.g.position.copy(to);st='turn';t=0;I.legs[0].rotation.x=I.legs[1].rotation.x=0}else{d.normalize();I.g.position.addScaledVector(d,step);const ty=Math.atan2(d.x,d.z);I.g.rotation.y+=angDiff(ty,I.g.rotation.y)*.2;I.legs[0].rotation.x=Math.sin(ts/85)*.75;I.legs[1].rotation.x=-Math.sin(ts/85)*.75;if(!I.parcel.visible&&!I.tray.visible&&!I.paper.visible){I.armL.rotation.x=-Math.sin(ts/85)*.5;I.armR.rotation.x=Math.sin(ts/85)*.5}I.g.position.y=Math.abs(Math.sin(ts/85))*.05}}
    else if(st==='turn'){const df=angDiff(face,I.g.rotation.y);I.g.rotation.y+=df*.25;if(Math.abs(df)<.03){I.g.rotation.y=face;st='idle'}}}
  let cur_fn=null;function angDiff(a,b){let d=a-b;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d}

  // ---------- camera ----------
  let yaw=.62,pitch=.48,dist=26,tYaw=yaw,tPitch=pitch,tDist=dist,drag=null,mx=0,my=0,fit=1;const HOME=new THREE.Vector3(-.5,1.5,-1.5),look=HOME.clone(),tLook=HOME.clone();
  function baseDist(){return 26*fit}function setZoom(z){tDist=Math.max(14,Math.min(60*fit,z))}
  const zi=document.getElementById('zIn'),zo=document.getElementById('zOut'),zr=document.getElementById('zRst');
  if(zi){zi.onclick=()=>setZoom(tDist/1.2);zo.onclick=()=>setZoom(tDist*1.2);zr.onclick=()=>unfocus()}
  box.addEventListener('dblclick',()=>unfocus());
  box.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();setZoom(tDist*(e.deltaY<0?.9:1.1))},{passive:false});
  box.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,.ballot,.status,.ctl'))return;drag={x:e.clientX,y:e.clientY,yaw:tYaw,pitch:tPitch,moved:false};box.setPointerCapture(e.pointerId)});
  box.addEventListener('pointermove',e=>{const r=box.getBoundingClientRect();mx=((e.clientX-r.left)/r.width-.5)*2;my=((e.clientY-r.top)/r.height-.5)*2;
    if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>3)drag.moved=true;tYaw=Math.max(-.2,Math.min(1.35,drag.yaw-dx*.006));tPitch=Math.max(.2,Math.min(1.1,drag.pitch+dy*.004));box.classList.add('drag')}});
  const FOCUS=[{m:board,look:new THREE.Vector3(-.5,3.6,-6.9),dist:13,yaw:.15,pitch:.18,what:'board'},{m:scr,look:new THREE.Vector3(-7,2.4,0),dist:9,yaw:1.1,pitch:.25,what:'desk'},{m:cab,look:new THREE.Vector3(5.5,2.4,-6.4),dist:12,yaw:.3,pitch:.2,what:'holes'},{m:printer,look:new THREE.Vector3(-7.2,1.4,-4.6),dist:8,yaw:.9,pitch:.35,what:'printer'}];
  let focused=null;
  function pickFocus(cx,cy){const r=renderer.domElement.getBoundingClientRect();ndc.set(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);const hits=ray.intersectObjects(FOCUS.map(f=>f.m),true);if(!hits.length)return null;let o=hits[0].object;while(o){const f=FOCUS.find(f=>f.m===o);if(f)return f;o=o.parent}return null}
  function focus(f){if(!f||focused===f){unfocus();return}focused=f;tLook.copy(f.look);tDist=f.dist*fit;tYaw=f.yaw;tPitch=f.pitch;box.classList.add('focus');const names={board:'the board',desk:'my desk',holes:'the holders',printer:'the printer'};onFocus(names[f.what])}
  function unfocus(){focused=null;tLook.copy(HOME);tDist=baseDist();tYaw=.62;tPitch=.48;box.classList.remove('focus');onFocus(null)}
  const onFocus=o.onFocus||function(){};
  box.addEventListener('pointerup',e=>{if(drag&&!drag.moved){if(pickIntern(e.clientX,e.clientY)){say(cur?'busy':'waiting for the vote',1400);if(!cur&&!queue.length)idleTimer=1e9}else{const f=pickFocus(e.clientX,e.clientY);if(f)focus(f);else if(focused)unfocus()}}drag=null;box.classList.remove('drag')});
  box.addEventListener('pointermove',e=>{if(drag)return;const f=pickFocus(e.clientX,e.clientY);box.style.cursor=f?'pointer':''});
  box.addEventListener('pointerleave',()=>{mx=0;my=0});
  const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
  function pickIntern(cx,cy){const r=renderer.domElement.getBoundingClientRect();ndc.set(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);return ray.intersectObject(I.g,true).length>0}
  function project(v){const p=v.clone().project(camera);const r=renderer.domElement.getBoundingClientRect(),br=box.getBoundingClientRect();return {x:(p.x+1)/2*r.width+(r.left-br.left),y:(1-p.y)/2*r.height+(r.top-br.top),z:p.z}}
  function resize(){const w=box.clientWidth,h=box.clientHeight;renderer.setSize(w,h,false);renderer.domElement.style.width=w+'px';renderer.domElement.style.height=h+'px';camera.aspect=w/h;camera.updateProjectionMatrix();const was=fit;fit=Math.max(1,1.15/camera.aspect);HOME.y=camera.aspect<.8?-1.4:1.5;if(!focused)tLook.copy(HOME);if(Math.abs(tDist-26*was)<.01||was!==fit)tDist=baseDist()}
  resize();dist=tDist;addEventListener('resize',resize);

  // ---------- loop ----------
  let last=0,frames=0,turbo=1;
  function frame(ts){const dt=(last?Math.min(120,ts-last):16)*turbo;last=ts;frames++;
    yaw+=(tYaw+mx*.05-yaw)*.06;pitch+=(tPitch+my*.03-pitch)*.06;dist+=(tDist-dist)*.08;look.lerp(tLook,.08);
    camera.position.set(look.x+Math.sin(yaw)*Math.cos(pitch)*dist,look.y+Math.sin(pitch)*dist,look.z+Math.cos(yaw)*Math.cos(pitch)*dist);camera.lookAt(look);
    if(!red){stepIntern(dt,ts);stepBoss(dt,ts)}
    // time of day: the window and the sun follow UTC
    {const h=new Date().getUTCHours()+new Date().getUTCMinutes()/60;const day=Math.max(0,Math.sin((h-6)/12*Math.PI));sun.intensity=.6+day*1.0;winMat.emissiveIntensity=.2+day*.35;winMat.color.setHex(day>.15?0xcfe6fb:0x2a3550);winMat.emissive.setHex(day>.15?0xcfe6fb:0x2a3550);lampMat.emissiveIntensity=day>.3?0:1.2;lampL.intensity=day>.3?0:2.2}
    // clock
    const n=new Date();hS.rotation.z=-n.getUTCSeconds()/60*Math.PI*2;hM.rotation.z=-(n.getUTCMinutes()+n.getUTCSeconds()/60)/60*Math.PI*2;hH.rotation.z=-((n.getUTCHours()%12)+n.getUTCMinutes()/60)/12*Math.PI*2;
    // blink
    const bl=(ts%3400)<110?.1:1;I.eyes.forEach(e=>e.scale.y=1.12*bl);
    // parcels
    for(let i=parcels.length-1;i>=0;i--){const p=parcels[i];p.t+=dt/900;if(p.t<0)continue;if(!p.m){p.m=new THREE.Mesh(parcelGeo,mat.orange);p.m.castShadow=true;scene.add(p.m)}const k=Math.min(1,p.t);p.m.position.lerpVectors(p.a,p.b,k);p.m.position.y+=Math.sin(k*Math.PI)*2.2;p.m.rotation.x+=dt/300;if(k>=1){scene.remove(p.m);p.h.flash=1;parcels.splice(i,1)}}
    holes.forEach(h=>{if(h.flash>0){h.m.material.emissiveIntensity=h.flash*.9;h.flash=Math.max(0,h.flash-dt/900)}});
    if(slip.visible){slip.position.z=Math.min(.95,slip.position.z+dt/1200)}
    ov.querySelectorAll('.msg').forEach(el=>{const v=new THREE.Vector3(+el.dataset.x,+el.dataset.y,+el.dataset.z);const p=project(v);el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.opacity=(p.z>1)?0:''});
    renderer.render(scene,camera);
    if(!(red&&frames>3))requestAnimationFrame(frame)}
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange',()=>{last=0});

  return {set turbo(v){turbo=v},focus:(w)=>{const f=FOCUS.find(f=>f.what===w);if(f)focus(f)},unfocus,get focused(){return focused&&focused.what},runDay,voted:(tk)=>{drawBoard();if(!cur&&Math.random()<.5){I.head.rotation.y=Math.atan2(board.position.x-I.g.position.x,board.position.z-I.g.position.z)-I.g.rotation.y;setTimeout(()=>{I.head.rotation.y=0},1500)}pop(new THREE.Vector3(-.5,6.4,-6.8),'+1 '+tk,'plus',1400)},redraw:()=>{drawBoard();drawMon(null)},get busy(){return !!cur},get cycles(){return cycles},get zoom(){return tDist},intern:I,renderer};
}
