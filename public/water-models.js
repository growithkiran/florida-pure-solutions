import * as T from './vendor/three.module.js';

// Original approximate geometry inspired by the supplied shape reference.
// No manufacturer, certification, UV or product-performance claim is implied.
export function buildWaterModel(kind) {
  const root=new T.Group(),resources=[],parts=[];
  const mat=o=>{const m=new T.MeshPhysicalMaterial(o);resources.push(m);return m;};
  const navy=mat({color:0x102b3d,roughness:.28,metalness:.35,clearcoat:.6});
  const black=mat({color:0x081722,roughness:.21,metalness:.25,clearcoat:1});
  const silver=mat({color:0xd0dfe5,roughness:.24,metalness:.8});
  const blue=mat({color:0x176fb5,roughness:.28,metalness:.35});
  const ivory=mat({color:0xe5e9e7,roughness:.6});
  const clear=mat({color:0x8ecddd,roughness:.12,transparent:true,opacity:.22,depthWrite:false,side:T.DoubleSide,clearcoat:1});
  const water=mat({color:0x168bc8,roughness:.16,transparent:true,opacity:.24,depthWrite:false,side:T.DoubleSide});
  const glow=mat({color:0x4bd5ff,emissive:0x1595d8,emissiveIntensity:.5,roughness:.3});
  function mesh(g,m,parent=root,pos=[0,0,0]){resources.push(g);const o=new T.Mesh(g,m);o.position.set(...pos);parent.add(o);return o;}
  function box(w,h,d,m,parent=root,pos=[0,0,0],radius=.07){
    const r=Math.min(radius,w/3,h/3,d/3),s=new T.Shape(),x=-w/2+r,y=-h/2+r,W=w-2*r,H=h-2*r;
    s.moveTo(x,y-r);s.lineTo(x+W,y-r);s.quadraticCurveTo(x+W+r,y-r,x+W+r,y);s.lineTo(x+W+r,y+H);s.quadraticCurveTo(x+W+r,y+H+r,x+W,y+H+r);s.lineTo(x,y+H+r);s.quadraticCurveTo(x-r,y+H+r,x-r,y+H);s.lineTo(x-r,y);s.quadraticCurveTo(x-r,y-r,x,y-r);
    const g=new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r,bevelThickness:r,curveSegments:12});g.translate(0,0,-d/2+r);return mesh(g,m,parent,pos);
  }
  function cylinder(r,h,m,parent=root,pos=[0,0,0],rt=r){return mesh(new T.CylinderGeometry(rt,r,h,64),m,parent,pos);}
  function ring(r,t,m,parent,pos){const o=mesh(new T.TorusGeometry(r,t,10,64),m,parent,pos);o.rotation.x=Math.PI/2;return o;}
  function assemblyPart(parent,axis,amount){const origin=parent.position.clone();parts.push({parent,origin,axis,amount});}
  function cartridge(parent,x,y,z,scale=1){
    const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);
    cylinder(.25,1.65,ivory,g);
    const pg=new T.BoxGeometry(.022,1.48,.075);resources.push(pg);const pleats=new T.InstancedMesh(pg,ivory,48),dummy=new T.Object3D();
    for(let i=0;i<48;i++){const a=i*Math.PI/24;dummy.position.set(Math.sin(a)*.265,0,Math.cos(a)*.265);dummy.rotation.y=a;dummy.updateMatrix();pleats.setMatrixAt(i,dummy.matrix);pleats.setColorAt(i,new T.Color(i%2?0xa6b8bd:0xffffff));}g.add(pleats);
    for(const yy of [-.82,.82]){cylinder(.31,.13,silver,g,[0,yy,0]);ring(.3,.022,glow,g,[0,yy+.04,0]);}
    cylinder(.15,.16,blue,g,[0,.96,0]);return g;
  }
  function pipe(points,parent=root,r=.055,m=silver){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(curve,48,r,10,false),m,parent);}
  function makePurifier(){
    root.scale.setScalar(1.05);
    box(3.35,.24,2.3,navy,root,[0,-1.48,0],.1);
    box(1.45,2.87,2.08,navy,root,[.91,.03,0],.12);
    box(1.48,.09,2.1,silver,root,[.91,1.48,0],.03);
    const reservoir=new T.Group();reservoir.position.set(-.96,-.05,-.24);root.add(reservoir);
    box(1.35,2.75,1.67,clear,reservoir,[0,0,0],.12);
    box(1.23,1.86,1.54,water,reservoir,[0,-.36,0],.1);
    box(1.34,.13,1.7,navy,reservoir,[0,1.44,0],.05);
    box(.65,.065,.7,silver,reservoir,[0,1.54,0],.025);
    assemblyPart(reservoir,'x',-.48);
    const filters=new T.Group();root.add(filters);cartridge(filters,-1.02,.02,.48,.88);cartridge(filters,-.35,.02,.48,.88);assemblyPart(filters,'y',.65);
    const lid=new T.Group();lid.position.set(-.69,1.28,.6);root.add(lid);box(1.42,.18,1.02,navy,lid,[0,0,0],.07);box(1.2,.04,.75,silver,lid,[0,.12,0],.02);assemblyPart(lid,'y',.7);
    const face=new T.Group();face.position.set(.91,.1,1.12);root.add(face);
    box(1.32,2.48,.19,black,face,[0,0,0],.085);box(1.37,.085,.23,silver,face,[0,1.25,0],.03);
    // Authored screen symbols: no temperature, quality score or claimed specification.
    const c=document.createElement('canvas');c.width=256;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#071620';ctx.fillRect(0,0,256,256);ctx.strokeStyle='#78d9ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(128,42);ctx.bezierCurveTo(90,90,95,115,128,115);ctx.bezierCurveTo(161,115,166,90,128,42);ctx.stroke();ctx.strokeStyle='#c6e9ef';for(const x of [68,128,188]){ctx.beginPath();ctx.arc(x,178,15,0,Math.PI*2);ctx.stroke();}ctx.fillStyle='#88c2d5';ctx.fillRect(92,135,72,3);
    const texture=new T.CanvasTexture(c);resources.push(texture);const screenMat=new T.MeshBasicMaterial({map:texture});resources.push(screenMat);mesh(new T.PlaneGeometry(1.04,1.04),screenMat,face,[0,.42,.106]);
    const nozzle=cylinder(.09,.37,silver,face,[0,-.42,.2]);nozzle.rotation.x=Math.PI/2;nozzle.position.z=.26;
    box(.77,.075,.57,navy,face,[0,-1.13,.32],.035);for(let i=0;i<7;i++)box(.027,.012,.37,silver,face,[-.27+i*.09,-1.083,.35],.004);
    assemblyPart(face,'z',.7);
    box(.04,2.57,.05,glow,root,[.17,.04,1.055],.01);
    for(const x of [-1.3,1.3])for(const z of [-.8,.8])cylinder(.13,.13,black,root,[x,-1.65,z]);
    return {center:new T.Vector3(0,.12,0),span:5.55};
  }
  function makeWholeHome(){
    for(const [x,s] of [[-.65,1],[.7,.82]]){
      const tank=new T.Group();tank.position.set(x,-.13,0);tank.scale.setScalar(s);root.add(tank);
      const profile=[new T.Vector2(0,-1.35),new T.Vector2(.39,-1.35),new T.Vector2(.5,-1.2),new T.Vector2(.5,.93),new T.Vector2(.36,1.16),new T.Vector2(.16,1.2)];mesh(new T.LatheGeometry(profile,64),blue,tank);cylinder(.28,.27,navy,tank,[0,1.32,0]);ring(.49,.025,silver,tank,[0,-1.17,0]);box(.45,.55,.02,navy,tank,[0,.25,.49],.01);ring(.28,.025,glow,tank,[0,1.2,0]);
    }
    const pipes=new T.Group();root.add(pipes);pipe([[-1.35,1.4,0],[-.65,1.4,0],[-.65,1.6,0],[.7,1.6,0],[.7,1.2,0],[1.3,1.2,0]],pipes,.065);cylinder(.14,.1,blue,pipes,[.1,1.67,0]);box(.48,.04,.08,blue,pipes,[.1,1.76,0],.015);assemblyPart(pipes,'y',.35);
    return {center:new T.Vector3(0,.1,0),span:4.15};
  }
  function makeCare(){
    const main=cartridge(root,0,0,.1,1.22);const cap=new T.Group();cap.position.set(0,1.24,.1);root.add(cap);cylinder(.43,.2,navy,cap);ring(.4,.035,glow,cap,[0,-.1,0]);assemblyPart(cap,'y',.65);
    for(const x of [-1.05,1.05]){const g=cartridge(root,x,-.13,.05,.77);g.rotation.z=x>0?-.12:.12;}
    assemblyPart(main,'y',-.15);return {center:new T.Vector3(0,.22,0),span:4.1};
  }
  const framing=kind==='whole-home'?makeWholeHome():kind==='care'?makeCare():makePurifier();
  function update(p){const remaining=Math.pow(1-p,2);for(const {parent,origin,axis,amount}of parts){parent.position.copy(origin);parent.position[axis]+=amount*remaining;}root.rotation.y=.08+p*.15;root.rotation.x=-.018;glow.emissiveIntensity=.25+p*.85;}
  update(0);
  return {root,...framing,update,dispose(){resources.forEach(x=>x.dispose());}};
}
