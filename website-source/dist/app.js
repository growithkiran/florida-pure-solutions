import {initFitCarousel} from './fit-carousel.js';
import {createResult,validateAnswers} from './planner.js';
import {makeReport} from './report.js';
import {initPremiumMotion} from './premium-motion.js';
if(globalThis.fpsPreviewReady)globalThis.fpsPreviewReady.then(initFitCarousel);else initFitCarousel();
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const icon=name=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('aria-hidden','true');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#i-'+name);svg.append(use);return svg;};
const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(cls)node.className=cls;return node;};
// Icons beside visible copy are decorative. Controls have names in HTML.
$$('svg').filter(s=>!s.closest('.svg-library')).forEach(s=>s.setAttribute('aria-hidden','true'));
const menu=$('.menu-toggle'),nav=$('.nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
addEventListener('resize',()=>{if(innerWidth>900)closeMenu();});
document.addEventListener('keydown',()=>document.documentElement.dataset.inputMode='keyboard',{capture:true});
document.addEventListener('pointerdown',()=>document.documentElement.dataset.inputMode='pointer',{capture:true});
if(globalThis.fpsPreviewReady)globalThis.fpsPreviewReady.then(initPremiumMotion);else initPremiumMotion();
const concerns={
 taste:['Make the first sip a fresh start.','Describe when you notice the taste or smell, and which taps it affects. A water test helps guide a conversation about the right filtration approach.'],
 scale:['A clearer picture of those spots.','Spots and buildup are useful things to discuss. Ask about a hardness test, and how water softening differs from filtration before choosing equipment.'],
 drinking:['Start where you fill your glass.','If drinking and cooking are your focus, ask about a dedicated kitchen system. Compare countertop and under-sink options around your space and test results.'],
 unknown:['You don’t have to know yet.','Bring your questions. A consultation can help identify your water source, explain what a water test includes, and give you a sensible place to begin.']
};let selectedConcern='taste',result=null;
const concernImages={taste:['glass-illustrative.webp','Illustrative glass of clear water'],scale:['concern-scale.webp','Illustrative faucet with visible dry water spots'],drinking:['kitchen-illustrative.webp','Illustrative kitchen drinking-water faucet'],unknown:['concern-unknown.webp','Illustrative water sample bottle and drinking glass']};
Object.values(concernImages).forEach(([src])=>{const preload=new Image();preload.src='./assets/'+src;});
$$('[data-concern]').forEach(button=>button.addEventListener('click',()=>{selectedConcern=button.dataset.concern;$$('[data-concern]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$('#concern-title').textContent=concerns[selectedConcern][0];$('#concern-copy').textContent=concerns[selectedConcern][1];const [src,alt]=concernImages[selectedConcern];$('#concern-image').src='./assets/'+src;$('#concern-image').alt=alt;$('.concern-visual').dataset.image=selectedConcern;if(globalThis.gsap&&document.documentElement.dataset.inputMode!=='keyboard'&&document.documentElement.dataset.motionPreference!=='reduced'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)gsap.fromTo($('#concern-image'),{opacity:.65},{opacity:1,duration:.18,ease:'power2.out',overwrite:true});else if(globalThis.gsap){gsap.killTweensOf($('#concern-image'));gsap.set($('#concern-image'),{opacity:1});}}));
function pickConcern(value){const input=$('input[name="concerns"][value="'+value+'"]');if(input){input.checked=true;syncUnknown(input);}}
function syncUnknown(input){const fields=$$('input[name="concerns"]');if(input.checked){if(input.value==='unknown')fields.filter(i=>i!==input).forEach(i=>i.checked=false);else fields.find(i=>i.value==='unknown').checked=false;}}
$$('input[name="concerns"]').forEach(i=>i.addEventListener('change',()=>syncUnknown(i)));
$('#concern-plan').addEventListener('click',()=>{pickConcern(selectedConcern);showEdit(false);});
$$('[data-service]').forEach(a=>a.addEventListener('click',()=>{$('#scope').value=a.dataset.service;if(a.dataset.service==='care')pickConcern('care');if(a.dataset.service==='drinking')pickConcern('drinking');showEdit(false);}));
function clearPlannerErrors(){$('#planner-errors').hidden=true;$$('#planner-form .field-error').forEach(p=>p.hidden=true);$$('#planner-form [aria-invalid]').forEach(i=>{i.removeAttribute('aria-invalid');i.removeAttribute('aria-describedby');});}
function showEdit(focus=true){$('#planner-form').hidden=false;$('#plan-result').hidden=true;if(focus)$('input[name="source"]:checked,input[name="source"]').focus();}
$('#edit-plan').addEventListener('click',()=>showEdit());
$('#planner-form').addEventListener('submit',event=>{
 event.preventDefault();clearPlannerErrors();const data=new FormData(event.currentTarget);const input={source:data.get('source'),concerns:data.getAll('concerns'),scope:data.get('scope'),existing:data.get('existing')};const errors=validateAnswers(input);
 if(errors.length){const box=$('#planner-errors');box.replaceChildren(el('strong','Please check your answers.'));for(const err of errors){const fields=$$(err.field),first=fields[0];first.id ||= 'planner-'+(first.name||'field');const a=el('a',err.text);a.href='#'+first.id;a.addEventListener('click',e=>{e.preventDefault();first.focus();});box.append(a);$('#'+err.id).hidden=false;fields.forEach(f=>{f.setAttribute('aria-invalid','true');f.setAttribute('aria-describedby',err.id);});}box.hidden=false;box.focus();return;}
 result=createResult(input);renderResult(result);$('#planner-form').hidden=true;$('#plan-result').hidden=false;$('#plan-result').focus({preventScroll:true});$('#plan-result').scrollIntoView({block:'start'});
});
function renderResult(r){const root=$('#result-content');root.replaceChildren();root.append(el('p',r.reportId+' · '+r.generatedDateLabel+' · Rule '+r.ruleVersion,'report-meta'));const dl=el('dl',null,'answer-list');r.answerRows.forEach(row=>{const group=el('div');group.append(el('dt',row.label),el('dd',row.value));dl.append(group);});root.append(dl);
 [['Questions and preparation',r.findings,'ul'],['Your next steps',r.nextSteps,'ol']].forEach(([title,list,type])=>{const section=el('section',null,'result-section');section.append(el('h4',title));const ul=el(type);list.forEach(item=>ul.append(el('li',item)));section.append(ul);root.append(section);});
 root.append(el('p',r.evidence+' '+r.limitations,'result-limit'));$('#pdf-status').textContent='';$('#download-pdf').textContent='Download my PDF';$('#download-pdf').prepend(icon('download'));}
$('#download-pdf').addEventListener('click',async()=>{if(!result)return;const btn=$('#download-pdf');btn.disabled=true;btn.textContent='Preparing your PDF…';$('#pdf-status').textContent='';try{const blob=await makeReport(result);const url=URL.createObjectURL(blob);const a=el('a');a.href=url;a.download=result.reportId+'-water-plan.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);$('#pdf-status').textContent='Your PDF was generated. Check your browser downloads.';}catch(error){$('#pdf-status').textContent='The PDF could not be generated. Your plan is still here. Retry the download or use the print fallback.';console.warn('Report generation unavailable:',error.message);}finally{btn.disabled=false;btn.textContent='Download my PDF';btn.prepend(icon('download'));}});
$('#print-plan').addEventListener('click',()=>window.print());
$('#privacy-open').addEventListener('click',()=>$('#privacy-dialog').showModal());$('#privacy-dialog .dialog-close').addEventListener('click',()=>$('#privacy-dialog').close());
for(const dialog of $$('dialog'))dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
