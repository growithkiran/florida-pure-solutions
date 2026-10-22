import {mountSectionMotion} from './section-motion.js';
export function initPremiumMotion() {
  const hero=document.querySelector('.hero-premium');if(!hero)return;
  const initialHash=location.hash;
  let userInteracted=false;
  const initialInput=new AbortController();
  for(const type of ['wheel','touchstart','pointerdown','keydown'])window.addEventListener(type,()=>userInteracted=true,{once:true,passive:true,signal:initialInput.signal});
  const homeLink=event=>{const link=event.target.closest('a[href^="#"]');if(!link)return;const hash=link.getAttribute('href'),target=document.getElementById(hash.slice(1));if(!target||hash==='#main')return;event.preventDefault();if(location.hash!==hash)history.pushState(null,'',hash);if(hash==='#home')window.scrollTo({top:0,behavior:'instant'});else target.scrollIntoView({behavior:'instant',block:'start'});globalThis.ScrollTrigger?.update();};
  document.addEventListener('click',homeLink);
  const hashHome=()=>requestAnimationFrame(()=>{if(location.hash==='#home')window.scrollTo({top:0,behavior:'instant'});else document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant',block:'start'});globalThis.ScrollTrigger?.update();});
  window.addEventListener('hashchange',hashHome);
  const staticGraphics=new URLSearchParams(location.search).get('graphics')==='static';
  let disposed=false;
  const services=[...document.querySelectorAll('.service-scene')].map(stage=>({stage,model:null,p:0}));
  const serviceObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const item=services.find(s=>s.stage===entry.target);serviceObserver.unobserve(entry.target);import('./product-scene.js').then(({createProductScene})=>{if(disposed)return;item.model=createProductScene(item.stage.querySelector('canvas'),item.stage,item.stage.dataset.model==='drinking'?'purifier':item.stage.dataset.model);item.model.setProgress(item.p);}).catch(()=>console.info('Static service illustration enabled.'));}},{rootMargin:'220px'});
  if(!staticGraphics)services.forEach(item=>serviceObserver.observe(item.stage));
  const gsap=globalThis.gsap,ScrollTrigger=globalThis.ScrollTrigger;
  const list=document.querySelector('.process-list');const items=[...list.querySelectorAll(':scope > li')];
  const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.classList.add('process-line');svg.setAttribute('aria-hidden','true');
  const track=document.createElementNS(ns,'path'),line=document.createElementNS(ns,'path');track.classList.add('process-track');line.classList.add('process-glow');svg.append(track,line);list.prepend(svg);
  let length=1,processProgress=0;
  const drawProcess=p=>{processProgress=Math.max(0,Math.min(1,p));line.style.strokeDashoffset=String(length*(1-processProgress));items.forEach((li,i)=>li.classList.toggle('is-lit',processProgress>=i/(items.length-1)-.012));};
  const measure=()=>{
    const bounds=list.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
    const points=items.map(li=>{const r=li.querySelector('span').getBoundingClientRect();return [r.left+r.width/2-bounds.left,r.top+r.height/2-bounds.top];});
    const d=points.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' ');track.setAttribute('d',d);line.setAttribute('d',d);length=line.getTotalLength();line.style.strokeDasharray=String(length);drawProcess(processProgress);
  };
  const resize=new ResizeObserver(measure);resize.observe(list);measure();
  const forced=new URLSearchParams(location.search).get('motion')==='reduce'; // Reproducible accessibility QA, no visible control.
  let mm=null,layoutResize=null,refreshFrame=0;
  const refreshAfterRestore=()=>ScrollTrigger?.refresh();
  const cleanup=event=>{if(event.persisted)return;disposed=true;initialInput.abort();mm?.revert();resize.disconnect();layoutResize?.disconnect();cancelAnimationFrame(refreshFrame);serviceObserver.disconnect();services.forEach(item=>item.model?.dispose());svg.remove();document.removeEventListener('click',homeLink);window.removeEventListener('hashchange',hashHome);window.removeEventListener('pagehide',cleanup);window.removeEventListener('pageshow',refreshAfterRestore);};
  window.addEventListener('pagehide',cleanup);
  if(!gsap||!ScrollTrigger){initialInput.abort();drawProcess(1);services.forEach(item=>{item.p=1;item.model?.setProgress(1);});return;}
  gsap.registerPlugin(ScrollTrigger);
  // Planner results and native FAQ disclosures change downstream trigger geometry.
  layoutResize=new ResizeObserver(()=>{cancelAnimationFrame(refreshFrame);refreshFrame=requestAnimationFrame(()=>{if(!disposed)ScrollTrigger.refresh(true);});});
  layoutResize.observe(document.querySelector('main'));
  mm=gsap.matchMedia();
  mm.add({desktop:'(min-width: 901px) and (min-height: 520px)',reduced:'(prefers-reduced-motion: reduce)',all:'all'},context=>{
    const reduced=context.conditions.reduced||forced;
    document.documentElement.dataset.motionPreference=reduced?'reduced':'full';
    if(reduced){drawProcess(1);services.forEach(item=>{item.p=1;item.model?.setProgress(1);});return;}
    gsap.fromTo(hero.querySelectorAll('.headline-line'),{y:20,opacity:.35},{y:0,opacity:1,duration:.8,stagger:.09,ease:'power2.out',clearProps:'transform,opacity'});
    const ripple=hero.querySelector('.headline-ripple path');const rippleLength=ripple.getTotalLength();
    gsap.fromTo(ripple,{strokeDasharray:rippleLength,strokeDashoffset:rippleLength},{strokeDashoffset:0,duration:1.15,delay:.35,ease:'power2.out'});
    const desktop=context.conditions.desktop;
    const stopSectionMotion=mountSectionMotion({gsap,desktop});
    services.forEach(item=>{const state={p:0};item.p=0;item.model?.setProgress(0);gsap.to(state,{p:1,ease:'none',onUpdate:()=>{item.p=state.p;item.model?.setProgress(state.p);},scrollTrigger:{trigger:item.stage,start:'top 90%',end:'bottom 45%',scrub:.45,invalidateOnRefresh:true}});});
    const processState={p:0};drawProcess(0);
    gsap.to(processState,{p:1,ease:'none',onUpdate:()=>drawProcess(processState.p),scrollTrigger:{trigger:list,start:'top 78%',end:desktop?'top 35%':'bottom 58%',scrub:.5,invalidateOnRefresh:true}});
    return ()=>{stopSectionMotion();gsap.set(hero.querySelectorAll('.headline-line'),{clearProps:'all'});};
  });
  const loaded=new Promise(resolve=>document.readyState==='complete'?resolve():window.addEventListener('load',resolve,{once:true}));
  Promise.all([document.fonts.ready,loaded]).then(()=>{if(!disposed){measure();ScrollTrigger.refresh();requestAnimationFrame(()=>{initialInput.abort();if(disposed||userInteracted||!initialHash)return;if(initialHash==='#home')window.scrollTo({top:0,behavior:'instant'});else document.getElementById(initialHash.slice(1))?.scrollIntoView({behavior:'instant',block:'start'});});}});
  window.addEventListener('pageshow',refreshAfterRestore);
}
