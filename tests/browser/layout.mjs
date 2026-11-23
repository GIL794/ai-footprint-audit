import {launch} from './cdp.mjs';
import fs from 'node:fs'; fs.mkdirSync('/tmp/ai-footprint-dl',{recursive:true}); fs.mkdirSync('/tmp/ai-footprint-out',{recursive:true});
const b=await launch();
const R=[];const ok=(n,c,d='')=>{R.push((c?'PASS ':'FAIL ')+n+(d?' :: '+d:''))};
const t=(id)=>b.ev(`document.getElementById('${id}').textContent`);
const vp=async(w,h,mobile)=>{await b.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile})};
// file://
await b.goto('file://' + process.cwd() + '/index.html');
ok('D6 file:// answer renders',/25 AI questions/.test(await t('answer-main')),await t('answer-main'));
ok('D6 file:// chart rows',(await b.ev(`document.querySelectorAll('#chart-container .bar-row, #chart-container > div').length`))>=2);
ok('D6 file:// sources rows',(await b.ev(`document.querySelectorAll('#sources-tbody tr').length`))>10,await b.ev(`document.querySelectorAll('#sources-tbody tr').length`));
await b.ev(`document.getElementById('btn-conservative').click()`);
ok('D6 file:// buttons work',await b.ev(`document.getElementById('btn-conservative').getAttribute('aria-pressed')==='true'`)&&/91|litres/.test(await t('answer-main')),await t('answer-main'));
await b.shot('/tmp/ai-footprint-out/file-protocol-works.png',false);
// D4 recheck
await b.goto('http://127.0.0.1:8765/index.html');
await b.ev(`document.getElementById('advanced').open=true;(()=>{const e=document.getElementById('inp-prompt-wh');e.focus();e.select()})()`);
await b.key('Backspace',8);for(const ch of '2.9')await b.type(ch);
await b.ev(`document.getElementById('btn-modern').click()`);
ok('D4 clicking Modern while field focused resets field',(await b.ev(`document.getElementById('inp-prompt-wh').value`))==='0.24');
// widths
for(const [w,h,m] of [[320,640,true],[390,844,true],[1280,900,false]]){
  await vp(w,h,m); await b.goto('http://127.0.0.1:8765/index.html'); await b.ev(`document.getElementById('advanced').open=true`);
  const sw=await b.ev('document.documentElement.scrollWidth'); ok(`no sideways scroll at ${w}`,sw<=w,`scrollWidth ${sw}`);
  const small=await b.ev(`[...document.querySelectorAll('button,input:not([type=range]):not([type=checkbox]),summary,a.btn,.check')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.height<43.5}).map(e=>e.id||e.tagName+':'+e.textContent.trim().slice(0,20))`);
  ok(`touch targets >=44px at ${w}`,small.length===0,small.join(','));
  const clip=await b.ev(`[...document.querySelectorAll('.sources td, .sources th')].filter(e=>e.scrollWidth>e.clientWidth+1).length`); ok(`sources cells not clipped at ${w}`,clip===0,String(clip));
  const h1=await b.ev(`document.querySelector('#try-heading').getBoundingClientRect().top+scrollY`); ok(`calculator starts near top at ${w}`,h1<600,String(Math.round(h1)));
  await b.shot(`/tmp/out/${w}-full.png`,true);
}
// keyboard tab traversal
await vp(1280,900,false); await b.goto('http://127.0.0.1:8765/index.html');
const order=[];for(let i=0;i<16;i++){await b.key('Tab',9,'Tab');order.push(await b.ev(`document.activeElement.id||document.activeElement.tagName`))}
ok('tab order logical',order.slice(0,9).join()==='slider-prompts,slider-burgers,sel-beef,slider-stream,btn-modern,btn-conservative,btn-share-url,btn-export-png,btn-export-csv',order.join());
// a11y basics
ok('only one live region',(await b.ev(`document.querySelectorAll('[aria-live]').length`))===1);
ok('all inputs labelled',(await b.ev(`[...document.querySelectorAll('input')].filter(i=>!i.labels||!i.labels.length).map(i=>i.id).join()`))==='');
ok('lang + title',await b.ev(`document.documentElement.lang==='en'&&document.title.length>10`));
console.log(R.join('\n'));
await b.close();process.exit(0)
