import * as T from './vendor/three.module.js';
import {buildWaterModel} from './water-models.js';

// One quiet product vignette. Scroll changes the view; nothing runs on idle.
export function createCalmHero(canvas,stage){
  const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<701?1.25:1.5));
  renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.96;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
  const scene=new T.Scene();scene.fog=new T.Fog(0xeef3ed,15,29);
  const camera=new T.PerspectiveCamera(32,1,.1,60),resources=[];
  const model=buildWaterModel('purifier');scene.add(model.root);model.root.position.set(.46,0,-.18);
  const material=options=>{const m=new T.MeshPhysicalMaterial(options);resources.push(m);return m;};
  function mesh(geometry,mat,parent=scene,position=[0,0,0]){resources.push(geometry);const m=new T.Mesh(geometry,mat);m.position.set(...position);parent.add(m);return m;}
  function texture(canvas){const t=new T.CanvasTexture(canvas);resources.push(t);return t;}
  function paintedCanvas(w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);return c;}

  // Wide studio windows reflect in the chrome, tank and water glass.
  const studio=paintedCanvas(1024,512,(ctx,w,h)=>{
    const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#fffef5');g.addColorStop(.5,'#d8e9ec');g.addColorStop(1,'#7d969f');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    for(const [x,width]of[[70,180],[430,290],[900,60]]){const light=ctx.createLinearGradient(x,0,x+width,0);light.addColorStop(0,'#ffffff00');light.addColorStop(.15,'#ffffff');light.addColorStop(.85,'#ffffff');light.addColorStop(1,'#ffffff00');ctx.fillStyle=light;ctx.fillRect(x,35,width,365);}
  });
  const environmentTexture=texture(studio);environmentTexture.mapping=T.EquirectangularReflectionMapping;
  const pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromEquirectangular(environmentTexture);scene.environment=environment.texture;pmrem.dispose();
  scene.add(new T.HemisphereLight(0xfffdf2,0x839fa9,1.6));
  const sunlight=new T.DirectionalLight(0xfff8e8,2.7);sunlight.position.set(-4.5,7,5);sunlight.castShadow=true;sunlight.shadow.mapSize.set(innerWidth<701?512:1024,innerWidth<701?512:1024);Object.assign(sunlight.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.5,far:23});sunlight.shadow.bias=-.00035;sunlight.shadow.normalBias=.025;scene.add(sunlight);
  const fill=new T.DirectionalLight(0xc5f0ff,1.1);fill.position.set(4,2,-3);scene.add(fill);
  const emissiveMaterials=new Set();
  model.root.traverse(object=>{if(!object.isMesh)return;object.castShadow=!object.material.transparent;object.receiveShadow=!object.material.transparent;object.material.envMapIntensity=.75;if(object.material.emissive?.getHex())emissiveMaterials.add(object.material);});

  const counterY=-1.805;
  const stone=paintedCanvas(256,256,(ctx,w,h)=>{ctx.fillStyle='#f0f2e9';ctx.fillRect(0,0,w,h);let seed=121;for(let i=0;i<2500;i++){seed=(seed*16807)%2147483647;const x=seed%w;seed=(seed*16807)%2147483647;const y=seed%h;ctx.fillStyle=i%2?'#84958b08':'#ffffff36';ctx.fillRect(x,y,1,1);}});
  const stoneMap=texture(stone);stoneMap.wrapS=stoneMap.wrapT=T.RepeatWrapping;stoneMap.repeat.set(7,7);
  const counter=mesh(new T.PlaneGeometry(26,24),material({map:stoneMap,color:0xc3d0c8,roughness:.65,metalness:.015}),scene,[0,counterY,0]);counter.rotation.x=-Math.PI/2;counter.receiveShadow=true;

  // Soft, projected window light is anchored to the counter, not the screen.
  const daylight=paintedCanvas(512,512,(ctx,w,h)=>{ctx.filter='blur(13px)';for(let row=0;row<2;row++)for(let col=0;col<3;col++){const g=ctx.createLinearGradient(0,50+row*190,0,210+row*190);g.addColorStop(0,'#fffdebc0');g.addColorStop(1,'#fffdebf0');ctx.fillStyle=g;ctx.fillRect(55+col*135,50+row*190,112,161);}});
  const lightMaterial=new T.MeshBasicMaterial({map:texture(daylight),transparent:true,opacity:.12,depthWrite:false,blending:T.AdditiveBlending});resources.push(lightMaterial);
  const windowLight=mesh(new T.PlaneGeometry(8,7),lightMaterial,scene,[-1.4,counterY+.012,-1.1]);windowLight.rotation.set(-Math.PI/2,0,-.45);

  const glassGroup=new T.Group();glassGroup.scale.setScalar(1.15);glassGroup.position.set(-1.72,counterY+.677,1.05);scene.add(glassGroup);
  const glassMaterial=material({color:0xcce4ee,roughness:.055,metalness:0,transparent:true,opacity:.38,side:T.FrontSide,clearcoat:.75,envMapIntensity:.3,specularIntensity:.55});
  const profile=[[0,-.58],[.29,-.58],[.325,-.545],[.365,.56],[.344,.56],[.302,-.48],[0,-.48]].map(([x,y])=>new T.Vector2(x,y));
  mesh(new T.LatheGeometry(profile,96),glassMaterial,glassGroup);
  const liquidMaterial=material({color:0xb0dce9,roughness:.045,metalness:0,transparent:true,opacity:.16,side:T.FrontSide,envMapIntensity:.3});
  mesh(new T.CylinderGeometry(.332,.302,.78,80),liquidMaterial,glassGroup,[0,-.085,0]);
  const edgeMaterial=material({color:0xd1e5eb,roughness:.08,metalness:.2,transparent:true,opacity:.65,envMapIntensity:.4});
  const rim=mesh(new T.TorusGeometry(.354,.009,8,80),edgeMaterial,glassGroup,[0,.559,0]);rim.rotation.x=Math.PI/2;
  const baseEdge=mesh(new T.TorusGeometry(.302,.01,8,80),edgeMaterial,glassGroup,[0,-.56,0]);baseEdge.rotation.x=Math.PI/2;
  const meniscus=mesh(new T.TorusGeometry(.331,.006,8,80),liquidMaterial,glassGroup,[0,.307,0]);meniscus.rotation.x=Math.PI/2;
  const glassEdge=new T.LineBasicMaterial({color:0x7398a5,transparent:true,opacity:.38,toneMapped:false});resources.push(glassEdge);
  function contour(points,closed=false){const g=new T.BufferGeometry().setFromPoints(points);resources.push(g);const edge=closed?new T.LineLoop(g,glassEdge):new T.Line(g,glassEdge);glassGroup.add(edge);}
  for(const [r,y]of[[.354,.559],[.302,-.56],[.331,.307]])contour(Array.from({length:80},(_,i)=>{const a=i*Math.PI/40;return new T.Vector3(Math.sin(a)*r,y,Math.cos(a)*r);}),true);
  for(const side of [-1,1])contour([new T.Vector3(side*.29,-.55,.10),new T.Vector3(side*.325,0,.10),new T.Vector3(side*.354,.55,.10)]);

  const shadow=paintedCanvas(128,128,(ctx,w,h)=>{const g=ctx.createRadialGradient(64,64,6,64,64,61);g.addColorStop(0,'#34576c35');g.addColorStop(.5,'#34576c16');g.addColorStop(1,'#34576c00');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);});
  const shadowMaterial=new T.MeshBasicMaterial({map:texture(shadow),transparent:true,depthWrite:false,opacity:.55});resources.push(shadowMaterial);
  const glassShadow=mesh(new T.PlaneGeometry(1.8,1.3),shadowMaterial,scene,[-1.72,counterY+.016,1.05]);glassShadow.rotation.x=-Math.PI/2;
  const caustic=paintedCanvas(256,256,(ctx,w,h)=>{ctx.strokeStyle='#b1efff';ctx.lineWidth=2;ctx.shadowColor='#b1efff';ctx.shadowBlur=9;for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(120+i*5,128-i*3,25+i*15,45+i*7,.45,0,Math.PI*2);ctx.stroke();}});
  const causticMaterial=new T.MeshBasicMaterial({map:texture(caustic),transparent:true,opacity:.24,depthWrite:false,blending:T.AdditiveBlending});resources.push(causticMaterial);
  const reflection=mesh(new T.PlaneGeometry(2.1,1.8),causticMaterial,scene,[-1.72,counterY+.022,1.05]);reflection.rotation.x=-Math.PI/2;
  let progress=0,disposed=false,visible=true,aspect=1;
  function render(){if(!disposed&&visible&&!document.hidden)renderer.render(scene,camera);}
  function positionCamera(){
    const mobile=aspect<1,span=mobile?5.9:7.2,vertical=span/Math.min(aspect,1.45),distance=vertical/(2*Math.tan(T.MathUtils.degToRad(16)));
    const angle=T.MathUtils.degToRad(-26+progress*8);camera.position.set(Math.sin(angle)*distance,distance*.29,Math.cos(angle)*distance);camera.lookAt(.05,-.21,.12);camera.updateProjectionMatrix();
  }
  function setProgress(value){
    progress=T.MathUtils.clamp(value,0,1);
    const reveal=Math.pow(Math.sin(Math.PI*progress),2)*.5;
    model.update(1-reveal);model.root.rotation.set(0,.1,0);
    emissiveMaterials.forEach(m=>m.emissiveIntensity=.18+progress*.22);
    reflection.rotation.z=progress*.12;causticMaterial.opacity=.03+progress*.035;windowLight.position.x=-1.4+progress*.28;
    stage.dataset.assembly=progress.toFixed(3);stage.dataset.reveal=reveal.toFixed(3);positionCamera();render();
  }
  function resize(){if(disposed)return;const {width,height}=stage.getBoundingClientRect();if(width<1||height<1)return;renderer.setSize(width,height,false);camera.aspect=aspect=width/height;positionCamera();render();}
  const ro=new ResizeObserver(resize);ro.observe(stage);
  const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)render();},{rootMargin:'100px'});io.observe(stage);
  const lost=e=>{e.preventDefault();stage.classList.remove('is-3d-ready');};canvas.addEventListener('webglcontextlost',lost);
  const restoreVisibility=()=>{if(!document.hidden)render();};document.addEventListener('visibilitychange',restoreVisibility);
  resize();setProgress(0);stage.classList.add('is-3d-ready');
  return {setProgress,resize,render,dispose(){disposed=true;ro.disconnect();io.disconnect();canvas.removeEventListener('webglcontextlost',lost);document.removeEventListener('visibilitychange',restoreVisibility);model.dispose();resources.forEach(r=>r.dispose());environment.dispose();sunlight.shadow.dispose();renderer.dispose();stage.classList.remove('is-3d-ready');}};
}
