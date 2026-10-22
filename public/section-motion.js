// Called inside the existing GSAP matchMedia owner. CSS is the complete fallback.
export function mountSectionMotion({gsap,desktop}) {
  const entrances=[],depth=[];
  const groups=[...document.querySelectorAll('.section-intro,.planner-intro,.booking-copy,.faq-intro,.daily-copy,.decision-header,.care-intro,.process-prep')];
  const collections=[...document.querySelectorAll('.concern-tabs,.solutions-grid,.decision-grid,.care-table,.care-feature-grid,.faq-list,.service-strip')];
  let keyboard=document.documentElement.dataset.inputMode==='keyboard';
  function reveal(group,targets,travel=desktop?28:16){
    if(!targets.length)return;
    if(keyboard||group.dataset.revealSeen==='true'){group.dataset.revealState='complete';return;}
    group.dataset.revealState='waiting';
    const tween=gsap.fromTo(targets,{y:travel,opacity:.22},{y:0,opacity:1,duration:.68,stagger:.06,ease:'power3.out',clearProps:'transform,opacity',
      onStart:()=>{group.dataset.revealSeen='true';group.dataset.revealState='playing';},
      onComplete:()=>{group.dataset.revealState='complete';},
      scrollTrigger:{trigger:group,start:'top 88%',once:true,invalidateOnRefresh:true}});
    entrances.push({tween,group});
  }
  groups.forEach(group=>reveal(group,[...group.children]));
  collections.forEach(group=>reveal(group,[...group.children].filter(el=>!el.matches('svg'))));
  document.querySelectorAll('.planner-workspace,.booking-panel').forEach(group=>reveal(group,[group],desktop?24:14));
  document.querySelectorAll('.process-list>li').forEach(group=>reveal(group,[...group.children].filter(el=>!el.matches('span')),desktop?26:14));
  const photo=document.querySelector('.daily-visual img');
  const rule=document.querySelector('.decision-line');
  if(!keyboard&&photo){depth.push(gsap.fromTo(photo,{scale:1.07,y:desktop?-22:-12},{scale:1.02,y:desktop?22:12,ease:'none',scrollTrigger:{trigger:photo.parentElement,start:'top bottom',end:'bottom top',scrub:.7,invalidateOnRefresh:true}}));}
  if(!keyboard&&rule){depth.push(gsap.fromTo(rule,{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{trigger:'.decision-grid',start:'top 88%',end:'top 35%',scrub:.5,invalidateOnRefresh:true}}));}
  // Keyboard navigation must never wait for a reveal or move a focused control.
  const settle=event=>{
    if(keyboard||['Shift','Control','Meta','Alt'].includes(event.key))return;
    keyboard=true;
    entrances.forEach(({tween,group})=>{tween.scrollTrigger?.kill(false,true);tween.progress(1).pause();group.dataset.revealSeen='true';group.dataset.revealState='complete';});
    depth.forEach(tween=>{tween.scrollTrigger?.kill(false,true);tween.revert();});
  };
  // Decorative pointer light on informational cards; no touch or keyboard motion.
  const pointerEvents=new AbortController();
  const pointerQuery=matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.care-feature').forEach(card=>{
    card.addEventListener('pointermove',event=>{
      if(keyboard||event.pointerType!=='mouse'||!pointerQuery.matches)return;
      const bounds=card.getBoundingClientRect();
      card.style.setProperty('--care-x',`${event.clientX-bounds.left}px`);
      card.style.setProperty('--care-y',`${event.clientY-bounds.top}px`);
    },{passive:true,signal:pointerEvents.signal});
  });
  document.addEventListener('keydown',settle,{capture:true});
  return ()=>{pointerEvents.abort();document.querySelectorAll('.care-feature').forEach(card=>{card.style.removeProperty('--care-x');card.style.removeProperty('--care-y');});document.removeEventListener('keydown',settle,{capture:true});};
}
