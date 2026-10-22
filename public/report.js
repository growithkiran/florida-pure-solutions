export async function makeReport(result){
 if(!globalThis.PDFLib)throw new Error('The PDF library could not load. Please retry, or print the plan.');
 const {PDFDocument,StandardFonts,rgb}=globalThis.PDFLib;
 const doc=await PDFDocument.create();
 doc.setTitle('Water Consultation Plan | Florida Pure Solutions');doc.setAuthor('Florida Pure Solutions');doc.setSubject(result.reportId);doc.setCreationDate(new Date(result.generatedAt));
 let font,bold;
 if(globalThis.fontkit){
  doc.registerFontkit(globalThis.fontkit);
  const fontData=await Promise.all(['manrope-regular.ttf','manrope-bold.ttf'].map(async f=>{const r=await fetch(new URL('./assets/'+f,import.meta.url));if(!r.ok)throw new Error('Report font failed to load. Retry, or print your plan.');return r.arrayBuffer();}));
  [font,bold]=await Promise.all(fontData.map(d=>doc.embedFont(d,{subset:true})));
 }else{font=await doc.embedFont(StandardFonts.Helvetica);bold=await doc.embedFont(StandardFonts.HelveticaBold);}
 const blue=rgb(.027,.322,.78),ink=rgb(.075,.173,.251),muted=rgb(.27,.38,.46),light=rgb(.92,.96,.98);
 const W=595.28,H=841.89,left=48,maxWidth=W-96;
 let page,y;let count=0;
 const addPage=()=>{page=doc.addPage([W,H]);count++;y=H-58;page.drawRectangle({x:0,y:H-12,width:W,height:12,color:blue});page.drawText('FLORIDA PURE SOLUTIONS',{x:left,y,size:10,font:bold,color:blue});page.drawText(result.reportId,{x:W-150,y,size:9,font,color:muted});y-=35;};
 const ensure=(space)=>{if(y-space<58)addPage();};
 const clean=s=>String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');
 const wrap=(str,size,face,width=maxWidth)=>{
  const lines=[];for(const para of clean(str).split('\n')){let line='';for(const word of para.split(/\s+/)){if(!word)continue;let remaining=word;while(face.widthOfTextAtSize(remaining,size)>width){let part='';for(const c of remaining){if(face.widthOfTextAtSize(part+c,size)>width)break;part+=c;}if(!part)throw new Error('Report text cannot be laid out.');if(line){lines.push(line);line='';}lines.push(part);remaining=remaining.slice(part.length);}const next=line?line+' '+remaining:remaining;if(face.widthOfTextAtSize(next,size)>width){lines.push(line);line=remaining;}else line=next;}lines.push(line);}return lines;
 };
 const text=(s,{size=10,face=font,color=ink,gap=7,indent=0}={})=>{const lines=wrap(s,size,face,maxWidth-indent);ensure(Math.min(lines.length*size*1.65+gap,H-160));for(const line of lines){ensure(size+6);if(line)page.drawText(line,{x:left+indent,y,size,font:face,color});y-=size*1.65;}y-=gap;};
 const heading=s=>{ensure(60);y-=8;text(s,{size:14,face:bold,color:blue,gap:8});};
 addPage();
 try{const r=await fetch(new URL('./assets/florida-pure-logo.png',import.meta.url));if(r.ok){const logo=await doc.embedPng(await r.arrayBuffer());page.drawImage(logo,{x:W-130,y:H-180,width:88,height:88});}}catch{/* text brand remains readable if optional logo fails */}
 text('Your Water\nConsultation Plan',{size:27,face:bold,gap:12});
 text('Created '+result.generatedDateLabel+' | Rule version '+result.ruleVersion,{size:9,color:muted,gap:15});
 text(result.context,{size:11,face:bold});text(result.evidence,{size:9,color:muted,gap:10});
 heading('Your starting point');
 for(const row of result.answerRows){text(row.label.toUpperCase(),{size:8,face:bold,color:muted,gap:0});text(row.value,{size:10,gap:9});}
 heading('Questions and preparation');
 result.findings.forEach((f,i)=>text((i+1)+'. '+f,{size:10,gap:10}));
 heading('Your next steps');result.nextSteps.forEach((s,i)=>text((i+1)+'. '+s,{size:10,gap:10}));
 heading('Keep in mind');text(result.limitations,{size:9,color:muted});
 heading('Talk with Florida Pure Solutions');text(result.contact.phone,{size:14,face:bold,color:blue});text(result.contact.calendarStatus,{size:9});text('Return to the consultation panel on the website or call to discuss an appointment. Your PDF and planner are ungated; no contact details have been submitted.',{size:9});
 heading('Sources');for(const source of result.sources){text(source.title,{size:9,face:bold,gap:1});text(source.url,{size:8,color:muted,gap:10});}
 for(const [i,p]of doc.getPages().entries()){p.drawRectangle({x:left,y:37,width:maxWidth,height:1,color:light});p.drawText('Consultation preparation only | '+result.reportId,{x:left,y:24,size:8,font,color:muted});p.drawText('Page '+(i+1)+' of '+count,{x:W-105,y:24,size:8,font,color:muted});}
 return new Blob([await doc.save()],{type:'application/pdf'});
}
