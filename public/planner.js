export const labels = Object.freeze({
 source:{city:'City / utility water',well:'Private well water',unknown:'Water source not yet known'},
 concerns:{taste:'Taste or smell',scale:'Spots or buildup',drinking:'Drinking water',care:'Filter replacement',unknown:'Water concerns not yet known'},
 scope:{'whole-home':'Whole home',drinking:'Kitchen / drinking water',care:'Existing system care',unknown:'Starting point not yet decided'},
 existing:{yes:'Existing filter system',no:'No existing filter system',unknown:'Existing system not yet known'}
});
export function validateAnswers(input){
 const errors=[];
 if(!Object.hasOwn(labels.source,input.source))errors.push({id:'source-error',field:'input[name="source"]',text:'Choose your water source, or select Not sure.'});
 if(!Array.isArray(input.concerns)||!input.concerns.length||input.concerns.some(c=>!Object.hasOwn(labels.concerns,c)))errors.push({id:'concerns-error',field:'input[name="concerns"]',text:'Choose at least one topic, including Not sure yet.'});
 if(!Object.hasOwn(labels.scope,input.scope)||!Object.hasOwn(labels.existing,input.existing))errors.push({id:'source-error',field:'#scope',text:'Choose a valid starting point and existing-system answer.'});
 return errors;
}
export function createResult(input,{now=new Date(),id=crypto.randomUUID()}={}){
 if(validateAnswers(input).length)throw new Error('Please complete the planner choices.');
 const concerns=[...new Set(input.concerns)];
 const answers={source:input.source,concerns:concerns.length>1?concerns.filter(c=>c!=='unknown'):concerns,scope:input.scope,existing:input.existing};
 const findings=[];
 if(answers.source==='city')findings.push('Bring your utility name and most recent Consumer Confidence Report, if available. Ask what additional testing is appropriate at your tap.');
 if(answers.source==='well')findings.push('Tell the consultant your home uses a private well. Bring any recent laboratory water-test results and ask which tests are appropriate before choosing treatment.');
 if(answers.source==='unknown')findings.push('Your water source is not yet known. Check a water bill, ask your utility or property manager, or discuss how to identify it at your consultation.');
 const concernAdvice={taste:'Note when you notice the taste or smell, and whether it affects one tap or several. Ask what testing and treatment fit the specific finding.',scale:'Photograph spots or buildup and ask about a hardness test. Filtration and softening do different jobs; do not assume one system addresses both.',drinking:'Describe where you drink and cook with water. Ask about countertop or under-sink options, including reverse osmosis, and model-specific performance and maintenance.',care:'Bring your filter brand, model, installation date and last replacement date. Confirm cartridge compatibility and the manufacturer-recommended maintenance schedule.',unknown:'You do not need to identify a specific problem first. Bring your questions and ask what an in-home test includes and what it cannot determine.'};
 answers.concerns.forEach(c=>findings.push(concernAdvice[c]));
 if(answers.scope==='whole-home')findings.push('For a whole-home discussion, note the main water-line location, household size and peak water-use needs. The system should be sized after review.');
 if(answers.scope==='drinking')findings.push('For a kitchen system, check available countertop or under-sink space and access to plumbing. Installation suitability needs to be confirmed.');
 if(answers.scope==='care'&& !answers.concerns.includes('care'))findings.push(concernAdvice.care);
 if(answers.scope==='unknown')findings.push('Your starting point is undecided. Ask the consultant to compare treating the whole home with treating a specific drinking-water tap.');
 if(answers.existing==='yes')findings.push('Keep the existing system details handy and ask whether a replacement, adjustment or maintenance visit is appropriate.');
 if(answers.existing==='unknown')findings.push('Whether a filter is already installed is unknown. Ask for help identifying any existing equipment.');
 const result={toolId:'fps-water-consultation-planner',ruleVersion:'1.0.0',reportId:'FPS-'+id.slice(0,8).toUpperCase(),generatedAt:now.toISOString(),generatedDateLabel:now.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}),context:'Florida residential water consultation',answers,
 answerRows:[{label:'Water source',value:labels.source[answers.source]},{label:'Discussion topics',value:answers.concerns.map(c=>labels.concerns[c]).join(', ')},{label:'Starting point',value:labels.scope[answers.scope]},{label:'Existing filtration',value:labels.existing[answers.existing]}],
 findings, evidence:'Planning guidance based on your selected topics, not measured water quality or a system recommendation.',
 nextSteps:['Confirm service coverage for your city or ZIP code with Florida Pure Solutions.','Ask about the free in-home consultation and water test, including its scope and any additional testing.','Review the exact model, certified reduction claims, installation quote and maintenance requirements before deciding.'],
 limitations:'This plan is not a water test, water-safety determination, diagnosis, equipment recommendation or quote. Unknown answers remain unknown. A specific model must be checked for the particular concern; appearance, taste and smell do not establish water safety.',
 contact:{name:'Florida Pure Solutions',phone:'+1 877-295-7873',booking:'#book',calendarStatus:'Demo calendar is not connected. No appointment has been made.'},
 sources:[{title:'EPA: Home Drinking Water Filtration Facts',url:'https://www.epa.gov/ground-water-and-drinking-water/home-drinking-water-filtration-fact-sheet'},{title:'Florida Pure Solutions: Current Consultation Offer',url:'https://floridapuresolutions.square.site/'}]};
 return Object.freeze(result);
}
