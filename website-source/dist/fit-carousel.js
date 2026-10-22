export function initFitCarousel(){
  const root=document.querySelector('.fit-carousel');if(!root)return;
  const tabs=[...root.querySelectorAll('[role=tab]')],chips=[...root.querySelectorAll('.fit-chip')],cards=[...root.querySelectorAll('.fit-card')];
  const count=root.querySelector('.fit-count'),announcement=root.querySelector('#fit-announcement');
  const media=matchMedia('(prefers-reduced-motion: reduce)'),forced=new URLSearchParams(location.search).get('motion')==='reduce';
  let active=0,reduced=media.matches||forced;
  const abort=new AbortController(),options={signal:abort.signal};
  const gsap=globalThis.gsap;let context=null,movers=[];
  root.classList.add('is-carousel-ready');root.querySelector('.fit-controls').hidden=false;tabs.forEach(tab=>tab.disabled=false);
  const distance=i=>{let n=(i-active+cards.length)%cards.length;if(n>cards.length/2)n-=cards.length;return n;};
  root.dataset.rotation='manual';
  if(gsap){context=gsap.context(()=>{
    movers=cards.map((card,i)=>({card:Object.fromEntries(['x','scaleX','scaleY','rotation','opacity'].map(key=>[key,gsap.quickTo(card,key,{duration:.55,ease:'power3.out'})])),chip:Object.fromEntries(['y','opacity'].map(key=>[key,gsap.quickTo(chips[i],key,{duration:.48,ease:'power3.out'})]))}));
  },root);}
  function render(instant=false){
    const small=matchMedia('(max-width: 700px)').matches,offset=Math.min(86,root.querySelector('.fit-deck').clientWidth*.24),step=small?66:80;
    const paint=()=>cards.forEach((card,i)=>{
      const diff=distance(i),selected=diff===0,values={x:diff*offset,scaleX:selected?1:.84,scaleY:selected?1:.84,rotation:diff*5,opacity:selected?1:.38},chipValues={y:diff*step-28,opacity:selected?1:.9};
      card.dataset.state=selected?'active':diff<0?'previous':'next';card.style.zIndex=selected?'3':'1';card.setAttribute('aria-hidden',String(!selected));
      tabs[i].setAttribute('aria-selected',String(selected));tabs[i].tabIndex=selected?0:-1;
      if(gsap){if(instant||reduced){Object.values(movers[i].card).forEach(m=>m.tween.pause());Object.values(movers[i].chip).forEach(m=>m.tween.pause());gsap.set(card,values);gsap.set(chips[i],chipValues);}else{Object.entries(values).forEach(([key,value])=>movers[i].card[key](value));Object.entries(chipValues).forEach(([key,value])=>movers[i].chip[key](value));}}
      else{card.style.transform=`translateX(${values.x}px) scale(${values.scaleX}) rotate(${values.rotation}deg)`;card.style.opacity=values.opacity;chips[i].style.transform=`translateY(${chipValues.y}px)`;chips[i].style.opacity=chipValues.opacity;}
    });
    if(context)context.add(paint);else paint();count.textContent=`0${active+1} / 0${cards.length}`;root.dataset.active=String(active);
  }
  function choose(index,keyboard=false){active=(index+cards.length)%cards.length;announcement.textContent=`${tabs[active].textContent.trim()} selected, ${active+1} of ${cards.length}.`;render(keyboard);}
  tabs.forEach((tab,i)=>{tab.addEventListener('click',event=>choose(i,event.detail===0),options);tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowDown'||event.key==='ArrowRight')next=active+1;else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=active-1;else if(event.key==='Home')next=0;else if(event.key==='End')next=cards.length-1;else return;event.preventDefault();choose(next,true);tabs[active].focus({preventScroll:true});},options);});
  root.querySelector('.fit-prev').addEventListener('click',event=>choose(active-1,event.detail===0),options);root.querySelector('.fit-next').addEventListener('click',event=>choose(active+1,event.detail===0),options);
  const resize=new ResizeObserver(()=>render(true));resize.observe(root.querySelector('.fit-deck'));
  const motionChange=()=>{reduced=media.matches||forced;render(true);};media.addEventListener('change',motionChange);
  const dispose=event=>{if(event.persisted)return;abort.abort();resize.disconnect();media.removeEventListener('change',motionChange);context?.revert();root.classList.remove('is-carousel-ready');};
  window.addEventListener('pagehide',dispose,options);render(true);
}
