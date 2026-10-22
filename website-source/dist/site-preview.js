// Tiny synchronous bootstrap: visible only with JS, bounded by a safety timeout.
(() => {
  const root=document.documentElement;
  let finished=false,resolveReady;
  const started=performance.now();
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches||new URLSearchParams(location.search).get('motion')==='reduce';
  if(reduce)root.dataset.previewReduced='true';
  globalThis.fpsPreviewReady=new Promise(resolve=>{resolveReady=resolve;});
  root.classList.add('site-opening');
  root.dataset.previewState='opening';
  function finish(){
    if(finished)return;finished=true;
    clearTimeout(safety);
    const preview=document.getElementById('site-preview');
    if(preview){if(preview.contains(document.activeElement))document.querySelector('.header .logo')?.focus({preventScroll:true});preview.setAttribute('aria-hidden','true');preview.inert=true;}
    if(preview&&!reduce)preview.classList.add('is-leaving');
    root.classList.remove('site-opening');
    root.dataset.previewState='complete';
    root.dataset.previewMs=String(Math.round(performance.now()-started));
    document.removeEventListener('keydown',onKey);
    resolveReady();
    if(preview){if(reduce)preview.remove();else setTimeout(()=>preview.remove(),280);}
  }
  function onKey(event){if(event.key==='Escape'||event.key==='Tab')finish();}
  document.addEventListener('keydown',onKey,{capture:false});
  const safety=setTimeout(finish,2500);
  document.addEventListener('DOMContentLoaded',()=>{
    if(finished){document.getElementById('site-preview')?.remove();return;}
    document.querySelector('#preview-skip')?.addEventListener('click',finish,{once:true});
    const image=document.querySelector('.hero-photograph img,.service-hero figure img');
    const pictureReady=image?.decode?image.decode().catch(()=>{}):Promise.resolve();
    Promise.allSettled([document.fonts?.ready||Promise.resolve(),pictureReady]).then(finish);
  },{once:true});
})();
