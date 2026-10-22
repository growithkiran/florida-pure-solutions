import * as T from './vendor/three.module.js';
import {buildWaterModel} from './water-models.js';

export function createProductScene(canvas,stage,kind='purifier'){
  const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<701?1.25:1.5));renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,50),model=buildWaterModel(kind);scene.add(model.root);
  const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d'),g=ctx.createLinearGradient(0,0,0,256);g.addColorStop(0,'#ffffff');g.addColorStop(.5,'#bfdae5');g.addColorStop(1,'#4f6c80');ctx.fillStyle=g;ctx.fillRect(0,0,512,256);ctx.fillStyle='#ffffff';ctx.fillRect(30,30,38,170);ctx.fillRect(215,15,100,180);ctx.fillRect(420,50,30,160);
  const texture=new T.CanvasTexture(c);texture.mapping=T.EquirectangularReflectionMapping;const generator=new T.PMREMGenerator(renderer),environment=generator.fromEquirectangular(texture);scene.environment=environment.texture;texture.dispose();generator.dispose();
  scene.add(new T.HemisphereLight(0xffffff,0x688ba2,1.7));const key=new T.DirectionalLight(0xffffff,3.2);key.position.set(-3,5,6);scene.add(key);const rim=new T.DirectionalLight(0x72d8ff,2.2);rim.position.set(4,1,-2);scene.add(rim);
  let visible=true,disposed=false,progress=0;
  function render(){if(!disposed&&visible&&!document.hidden)renderer.render(scene,camera);}
  function setProgress(value){progress=T.MathUtils.clamp(value,0,1);model.update(progress);stage.dataset.assembly=progress.toFixed(3);render();}
  function resize(){if(disposed)return;const {width,height}=stage.getBoundingClientRect();if(width<1||height<1)return;renderer.setSize(width,height,false);camera.aspect=width/height;const hero=stage.classList.contains('filter-scene');const span=hero?(camera.aspect>1.1?7.3:5.9):model.span*(kind==='whole-home'?1.45:1.3);const vertical=span/Math.min(camera.aspect,1.45);const distance=vertical/(2*Math.tan(T.MathUtils.degToRad(16)));camera.position.set(-distance*.55,distance*.34,distance*.82);camera.lookAt(model.center.x,model.center.y-(kind==="purifier"?(hero ? 0.4 : 0.15):0),model.center.z);camera.updateProjectionMatrix();render();}
  const ro=new ResizeObserver(resize);ro.observe(stage);const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)render();},{rootMargin:'100px'});io.observe(stage);
  const contextLost=e=>{e.preventDefault();stage.classList.remove('is-3d-ready');};canvas.addEventListener('webglcontextlost',contextLost);
  const onVisibility=()=>{if(!document.hidden)render();};document.addEventListener('visibilitychange',onVisibility);resize();setProgress(0);stage.classList.add('is-3d-ready');
  return {setProgress,resize,render,dispose(){disposed=true;ro.disconnect();io.disconnect();canvas.removeEventListener('webglcontextlost',contextLost);document.removeEventListener('visibilitychange',onVisibility);model.dispose();environment.dispose();renderer.dispose();stage.classList.remove('is-3d-ready');}};
}


