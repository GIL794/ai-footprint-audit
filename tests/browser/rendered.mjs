import {launch} from './cdp.mjs';
import fs from 'node:fs';
const OUT='/tmp/ai-review-rendered'; fs.mkdirSync(OUT,{recursive:true});
const b=await launch(); let failed=0;
const ok=(n,v,d='')=>{console.log((v?'PASS ':'FAIL ')+n+(v?'':' '+d));if(!v)failed++};
const go=async(q='')=>b.goto('http://127.0.0.1:8765/index.html'+q);
const text=()=>b.ev('document.body.innerText');
// actual rendered pixel width of each bar relative to its track
const px=()=>b.ev(`[...document.querySelectorAll('#chart-container .bar-fill')].map(f=>({w:f.getBoundingClientRect().width,t:f.parentElement.getBoundingClientRect().width}))`);
await go('?pWh=0&bCo2=0'); let w=await px();
ok('zero values render 0px bars (real pixels)',w.length===2&&w.every(x=>x.w===0),JSON.stringify(w));
await go('?pWh=0&bCo2=0&tab=digitalEnergy'); w=await px();
ok('zero prompt bar is 0px on energy tab',w[2].w===0&&w[0].w>0,JSON.stringify(w));
await go('?pWh=0&bCo2=0&tab=digitalEnergy&scale=log'); w=await px();
ok('zero prompt bar is 0px on squashed scale',w[2].w===0,JSON.stringify(w));
await go('?pWh=0.0001&tab=digitalEnergy'); w=await px();
ok('tiny positive bar is visible but flagged as sliver',w[2].w>0&&w[2].w<=4.5&&/thin sliver/.test(await text())&&/minimum visible width/.test(await b.ev(`document.getElementById('log-help').textContent`)),JSON.stringify(w));
await go('?tab=digitalEnergy'); w=await px();
ok('default linear: video full, prompt proportional (0.24/77)',Math.abs(w[0].w/w[0].t-1)<0.01&&Math.abs(w[2].w/w[0].w-0.24/77)<0.002||w[2].w<=4.5,JSON.stringify(w));
await b.ev(`document.getElementById('chk-log').click()`); await new Promise(r=>setTimeout(r,600)); w=await px();
const f=w.map(x=>x.w/x.t*100), dec=Math.log10(77/0.24), exp=[100,(1+Math.log10(0.3/0.24))/(1+dec)*100,100/(1+dec)];
ok('squashed scale = 1+log10(v/min), rendered',f.every((v,i)=>Math.abs(v-exp[i])<0.6),JSON.stringify({f,exp}));
// unit invariance: scale all three by 1000 (custom prompt+video ×1000 cannot move search), so compare via ratio check of two prompt values
await go('?tab=digitalEnergy&scale=log&pWh=0.24&sWh=77'); const a1=await px();
ok('custom values equal to defaults give same squashed bars',Math.abs(a1[2].w/a1[2].t*100-exp[2])<0.6);
await go('?tab=growth&scale=log'); w=await px();
ok('growth squashed: all positive, ordered by value',w.every(x=>x.w>0)&&Math.max(...w.map(x=>x.w))>0);
// custom provenance
await go('?pWh=1&pMl=3&bCo2=1&sWh=1&gCo2=100&tab=digitalEnergy'); let t=await text();
ok('custom energy tab: no 2019 / Gemini 2025 attribution of custom values',!/2019/.test(t.replace(/Methods|Words/,''))||false,(t.match(/.{40}2019.{40}/g)||[]).join(' | '));
ok('custom energy tab names custom prompt and video',/your custom value/.test(t)&&/custom figure for one hour of video/.test(t)&&!/Gemini, 2025/i.test(await b.ev(`document.getElementById('chart-container').textContent`)));
ok('custom answer/cards say custom video rate',/video hours at your custom rate/.test(await b.ev(`document.querySelector('.stat-cards').textContent`))&&/at your custom rate/.test(await b.ev(`document.getElementById('answer-list').textContent`)));
await go('?pWh=1&pMl=3&bCo2=1&sWh=1&gCo2=100&tab=personalWater');
ok('custom burger chart not described as published studies',!/published life-cycle/.test(await b.ev(`document.getElementById('chart-container').textContent`))&&/custom carbon figure/.test(await b.ev(`document.getElementById('chart-container').textContent`)));
ok('no share/total chart and no percent-share claim',!(await b.ev(`!!document.getElementById('stack-carbon')`))&&!/of the greenhouse gases|Shares of/.test(await text())&&/no share or total/.test(await text()));
ok('annual wording is a what-if, not "your AI use"',/what-if/i.test(await text())&&!/year of your (own )?AI use/.test(await text()));
ok('no bare lower-bound claim',!/a lower bound|, lower bound/.test(await text()));
// exports
await b.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:OUT});
for(const id of ['json','csv','png'])await b.ev(`document.getElementById('btn-export-${id}').click()`);
await new Promise(r=>setTimeout(r,800));
const j=JSON.parse(fs.readFileSync(OUT+'/ai-footprint-estimate.json')); const c=fs.readFileSync(OUT+'/ai-footprint-estimate.csv','utf8');
ok('JSON custom scope does not claim 2019 viewing or published example for custom inputs',j.scope.custom===true&&!/2019 typical viewing/.test(j.scope.video)&&!/Published per-prompt example/.test(j.scope.ai)&&j.scope.custom_fields.length===5,JSON.stringify(j.scope));
ok('JSON results have no share/total',!('total' in j.results.carbonKg)&&!('aiSharePct' in j.results.carbonKg)&&!('total' in j.results.energyKwh));
ok('CSV has no total row',!/Total \(limited/.test(c));
await go(''); for(const id of ['json'])await b.ev(`document.getElementById('btn-export-${id}').click()`); await new Promise(r=>setTimeout(r,800));
const j2=JSON.parse(fs.readFileSync(OUT+'/ai-footprint-estimate.json'));
ok('default JSON keeps 2019 video description and custom=false',j2.scope.custom===false&&/2019/.test(j2.scope.video));

// boundary inheritance + wording
await go('?pWh=1&pMl=3&bCo2=1&sWh=1&gCo2=100&tab=digitalEnergy');
let cust=await text();
ok('custom note says boundaries are unchecked',/cannot check what your numbers count/.test(cust));
ok('custom: no "About 1 prompts" grammar slip',!/About 1 prompts/.test(cust)&&/About 1 prompt uses/.test(cust));
ok('custom energy chart does not assert data-centre-only for custom prompt',!/Counts the data centre only/.test(await b.ev(`document.getElementById('chart-container').textContent`)));
await go('?pWh=1&pMl=3&bCo2=1&sWh=1&gCo2=100');
const ct=await b.ev(`document.getElementById('chart-container').textContent+' '+document.getElementById('answer-list').textContent`);
ok('custom burger/water/video wording asserts no published boundary',!/raw beef|beef herds|dairy herds|cooling water|data centre electricity only/i.test(ct.replace(/dairy herds\)\s*$/,'')),ct);
await b.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:OUT});
await b.ev(`document.getElementById('btn-export-json').click()`); await new Promise(r=>setTimeout(r,800));
const jc=JSON.parse(fs.readFileSync(OUT+'/ai-footprint-estimate.json'));
ok('custom JSON scope: boundaries unknown, none asserted',/unknown/.test(jc.scope.water)&&/unknown/.test(jc.scope.video)&&/unknown/.test(jc.scope.ai)&&!/Operational data-centre/.test(jc.scope.ai)&&!/cooling consumption/.test(jc.scope.water));
await go('?tab=growth');
ok('growth tab does not ask whether efficiency keeps up',!/keeping up|as a result/i.test(await text()));


// round 3: mode flag vs override, burger intro, PNG canvas text, mobile table
await go('?mode=conservative&pMl=3');
ok('conservative + custom water: card does not claim power-plant water',!/includes power-plant/.test(await b.ev(`document.querySelector('.stat-cards').textContent`))&&/custom rate/.test(await b.ev(`document.getElementById('out-ai-water-sub').textContent`)));
await b.ev(`window.__t=[];const f=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(t){window.__t.push(String(t));return f.apply(this,arguments)};document.getElementById('btn-export-png').click()`);
await new Promise(r=>setTimeout(r,500));
const png=(await b.ev(`window.__t.join(' | ')`));
ok('conservative + custom water: PNG text no power-plant/cooling claim',!/power-plant|cooling/i.test(png)||/your custom rate/.test(png)&&!/incl\. power-plant|cooling only \)/i.test(png),png);
await go('?pWh=1&bCo2=1&gCo2=100');
const intro=await b.ev(`document.getElementById('tab-what').textContent+' '+document.getElementById('help-burgers').textContent+' '+document.getElementById('help-beef').textContent`);
ok('custom burger intro/helps do not assert published beef scope',!/raw beef|beef burger|published studies|beef herds/i.test(intro)&&/custom/.test(intro),intro);
await go('?pWh=1&pMl=3&bCo2=1&gCo2=100&mode=conservative');
ok('water-why and mode-help flag custom',/may count something different/.test(await text())&&/replace the matching published/.test(await text()));
await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
for(const q of ['','?mode=conservative&pWh=1&pMl=3']){await go(q);
const broken=await b.ev(`(()=>{const out=[];const tb=document.querySelector('table.range-table');const w=document.createTreeWalker(tb,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const re=/\S+/g;let m;while(m=re.exec(n.textContent)){const r=document.createRange();r.setStart(n,m.index);r.setEnd(n,m.index+m[0].length);if(r.getClientRects().length>1)out.push(m[0])}}return {out,over:tb.scrollWidth>tb.parentElement.clientWidth+1}})()`);
ok('mobile 390 estimate table: no word broken mid-word, no overflow '+q,broken.out.length===0&&!broken.over,JSON.stringify(broken));}
await b.send('Emulation.clearDeviceMetricsOverride');


// round 4
await go('?pWh=0');
const zl=await b.ev(`document.getElementById('answer-list').textContent`);
ok('zero AI energy: answer ends with complete sentence, not fragment',!/0% of\.|comparable with\./.test(zl)||false,zl);
ok('zero AI energy: burger line names what 0% is of',/0% of one beef burger from beef herds/.test(zl),zl);
await go('?pWh=0&bCo2=0'); const zl2=await b.ev(`document.getElementById('answer-list').textContent`);
ok('zero burger factor: no dangling fragment',!/(of|with)\.(\s|$)/.test(zl2),zl2);
await go('?pWh=1&pMl=3&bCo2=1&gCo2=100'); const tt=await text();
ok('static paragraphs flag published-only scope when custom',/With your own numbers, what each one counts is up to you/.test(await b.ev(`document.getElementById('share-why-custom').textContent`))&&/Not counted \(in the published examples\)/.test(await b.ev(`document.getElementById('advanced').innerHTML.replace(/<[^>]+>/g,'')`)));
await go(''); await b.ev(`document.getElementById('advanced').open=true`);
const adv=await b.ev(`document.getElementById('advanced').innerText`);
ok('method note present: median, WUE, company-authored, not independently verified',/median/.test(adv)&&/1\.15 litres per kWh/.test(adv)&&/not independently verified/.test(adv)&&/not metered per prompt/.test(adv));


// round 5: per-field qualifiers
await go('?pMl=3');
const am=await b.ev(`document.getElementById('answer-main').textContent`);
ok('only water custom: median caveat kept for default electricity, water named custom',/typical \(median\) prompt/.test(am)&&/custom water per prompt/.test(am)&&!/custom electricity/.test(am),am);
await b.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:OUT});
await b.ev(`document.getElementById('btn-export-json').click()`); await new Promise(r=>setTimeout(r,800));
const jw=JSON.parse(fs.readFileSync(OUT+'/ai-footprint-estimate.json'));
ok('only water custom: JSON ai scope stays published, water scope unknown',/Published per-prompt example/.test(jw.scope.ai)&&/unknown/.test(jw.scope.water),JSON.stringify(jw.scope));
await go('?pWh=1');
const am2=await b.ev(`document.getElementById('answer-main').textContent`);
ok('only electricity custom: no median caveat, says custom electricity',!/typical \(median\)/.test(am2)&&/custom electricity per prompt/.test(am2)&&!/custom water/.test(am2),am2);


console.log(failed?'FAILED '+failed:'ALL PASSED'); process.exit(failed?1:0);
