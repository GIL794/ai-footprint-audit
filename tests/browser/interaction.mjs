import {launch} from './cdp.mjs';
import fs from 'node:fs'; fs.mkdirSync('/tmp/ai-footprint-dl',{recursive:true}); fs.mkdirSync('/tmp/ai-footprint-out',{recursive:true});
const b=await launch();
const errs=[];
const pull=()=>{for(const e of b.events.splice(0)){if(e.method==='Runtime.exceptionThrown')errs.push('EXC '+JSON.stringify(e.params.exceptionDetails.exception?.description||e.params.exceptionDetails.text).slice(0,200));if(e.method==='Runtime.consoleAPICalled'&&['error','warning'].includes(e.params.type))errs.push('CON '+e.params.type+' '+JSON.stringify(e.params.args.map(a=>a.value||a.description)).slice(0,200));if(e.method==='Log.entryAdded'&&e.params.entry.level==='error')errs.push('LOG '+e.params.entry.text+' '+(e.params.entry.url||''))}};
await b.send('Log.enable');
await b.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:'/tmp/ai-footprint-dl'});
const t=(id)=>b.ev(`document.getElementById('${id}').textContent`);
const v=(id)=>b.ev(`document.getElementById('${id}').value`);
const R=[];const ok=(n,c,d='')=>{R.push((c?'PASS ':'FAIL ')+n+(d?' :: '+d:''))};
await b.goto('http://127.0.0.1:8765/index.html');
pull(); ok('loads without console/page errors',errs.length===0,errs.join(' | '));
ok('answer sentence present',/25 AI questions a day/.test(await t('answer-main')),await t('answer-main'));
ok('default numbers',(await t('out-ai-energy'))==='2.19 kWh'&&(await t('out-ai-carbon'))==='1 kg CO₂e',`${await t('out-ai-water')} | ${await t('out-ai-energy')} | ${await t('out-ai-carbon')}`);
// D1 decimal typing
await b.ev(`document.getElementById('advanced').open=true`);
const typeInto=async(id,text)=>{await b.ev(`(()=>{const e=document.getElementById('${id}');e.focus();e.select()})()`);await b.key('Backspace',8);for(const ch of text)await b.type(ch)};
await typeInto('inp-prompt-wh','0.55');
ok('D1 typed 0.55 stays 0.55',(await v('inp-prompt-wh'))==='0.55',await v('inp-prompt-wh'));
ok('D1 result uses 0.55',(await t('out-ai-energy'))==='5.02 kWh',await t('out-ai-energy'));
await typeInto('inp-burger-co2','7.25'); ok('D1 burger carbon 7.25',(await v('inp-burger-co2'))==='7.25',await v('inp-burger-co2'));
await typeInto('inp-grid-co2','300.5'); ok('D1 grid 300.5',(await v('inp-grid-co2'))==='300.5',await v('inp-grid-co2'));
await typeInto('inp-prompt-water','1.25'); ok('D1 water 1.25',(await v('inp-prompt-water'))==='1.25');
// invalid input
await typeInto('inp-stream-wh','-5'); ok('negative shows message',(await t('err-stream-wh')).length>0,await t('err-stream-wh'));
await b.ev(`document.getElementById('inp-stream-wh').blur()`);
ok('blur restores value in use',(await v('inp-stream-wh'))==='77',await v('inp-stream-wh'));
ok('custom note visible',await b.ev(`!document.getElementById('custom-note').hidden`));
ok('url has overrides, no NaN',/pWh=0.55/.test(await b.ev('location.search'))&&!/NaN/.test(await b.ev('location.search')),await b.ev('location.search'));
// clear field -> default
await typeInto('inp-prompt-wh',''); ok('clearing returns to default',(await b.ev('location.search')).indexOf('pWh')<0);
// reset
await b.ev(`document.getElementById('btn-reset').click()`);
ok('reset clears note + url',await b.ev(`document.getElementById('custom-note').hidden`)&&(await b.ev('location.search'))==='',await b.ev('location.search'));
// D3 burger system selector and wording
await b.ev(`(function(){var e=document.getElementById('sel-beef');e.value='dairy';e.dispatchEvent(new Event('change',{bubbles:true}))})()`);
ok('beef selector updates url + answer',/beef=dairy/.test(await b.ev('location.search'))&&/dairy herds/.test(await t('answer-list')),await b.ev('location.search'));
await b.ev(`(function(){var e=document.getElementById('sel-beef');e.value='beef';e.dispatchEvent(new Event('change',{bubbles:true}))})()`);
ok('answer wording: no broken <0.1 sentence, says greenhouse gases',!/of carbon dioxide|<0\.1%/.test(await t('answer')) && /greenhouse gases/.test(await t('answer')),await t('answer'));
ok('no water equivalence on the page',!/of the water behind|burgers\W+worth of water|share of water/i.test(await b.ev('document.body.innerText'))&&/Why there is no water comparison/.test(await b.ev('document.body.innerText')));
ok('carbon labelled scenario',/scenario/.test(await t('answer'))&&/scenario/.test(await t('out-ai-carbon-sub')),await t('out-ai-carbon-sub'));
ok('removed figures not on page',!/228|1\.07|training allowance|1\.8 L/.test(await b.ev('document.body.innerText')));
// D4: pressed state and override
await b.ev(`document.getElementById('btn-modern').click()`);
await typeInto('inp-prompt-wh','2.9');
ok('D4 custom note shown when override while Modern',await b.ev(`!document.getElementById('custom-note').hidden`));
await b.ev(`document.getElementById('btn-modern').click()`);
ok('D4 clicking mode clears prompt override',(await v('inp-prompt-wh'))==='0.24',await v('inp-prompt-wh'));
// D2 bad URL
await b.goto('http://127.0.0.1:8765/index.html?prompts=abc&burgers=-5&stream=99&tab=zzz&pWh=x');
pull();
const body=await b.ev('document.body.innerText');
ok('D2 no NaN anywhere',!/NaN|undefined|Infinity/.test(body)&&!/NaN/.test(await b.ev('location.search')),(body.match(/NaN|undefined|Infinity/g)||[]).join());
ok('D2 sliders clamped',(await v('slider-burgers'))==='0'&&(await v('slider-stream'))==='8'&&(await v('slider-prompts'))==='25',`${await v('slider-prompts')},${await v('slider-burgers')},${await v('slider-stream')}`);
ok('D2 a tab is selected',(await b.ev(`document.querySelectorAll('.tab-btn[aria-selected=true]').length`))===1);
// tabs keyboard
await b.goto('http://127.0.0.1:8765/index.html');
await b.ev(`document.getElementById('tab-personalWater').focus()`);
await b.key('ArrowRight',39,'ArrowRight');
ok('D9 arrow key moves tab',await b.ev(`document.getElementById('tab-digitalEnergy').getAttribute('aria-selected')==='true'&&document.activeElement.id==='tab-digitalEnergy'`));
await b.key('End',35,'End'); ok('End goes to last tab',await b.ev(`document.activeElement.id==='tab-growth'`));
ok('growth notice explains the different measures',/different measures/.test(await t('chart-notice')),await t('chart-notice'));
ok('tabpanel labelled by active tab',await b.ev(`document.getElementById('chart-panel').getAttribute('aria-labelledby')==='tab-growth'`));
await b.ev(`document.getElementById('tab-growth').click()`);
ok('growth tab draws 5 bars',(await b.ev(`document.querySelectorAll('#chart-container .bar-fill').length`))===5);
await b.ev(`document.getElementById('tab-personalWater').click()`);
const lin=await b.ev(`document.querySelector('#chart-container .bar-row:nth-child(2) .bar-fill, #chart-container > div:nth-child(2) .bar-fill').style.width`);
await b.ev(`document.getElementById('chk-log').click()`);
const log=await b.ev(`document.querySelector('#chart-container > div:nth-child(2) .bar-fill').style.width`);
ok('log scale changes bars and explains itself',lin!==log&&/squashed/.test(await t('log-help')),`${lin} -> ${log} | ${await t('log-help')}`);
await b.ev(`document.getElementById('chk-log').click()`);
// clipboard fallback / success
await b.ev(`document.getElementById('btn-share-url').click()`); await new Promise(r=>setTimeout(r,500));
ok('share button gives feedback',(await t('copy-feedback')).length>10,await t('copy-feedback'));
pull();ok('no unhandled errors after share click',!errs.some(e=>e.startsWith('EXC')),errs.join('|'));
// exports
for(const id of ['btn-export-csv','btn-export-json','btn-export-png']){await b.ev(`document.getElementById('${id}').click()`);await new Promise(r=>setTimeout(r,700))}
const files=fs.readdirSync('/tmp/ai-footprint-dl');
ok('3 exports downloaded',['csv','json','png'].every(x=>files.some(f=>f.endsWith('.'+x))),files.join());
console.log(R.join('\n'));
await b.shot('/tmp/ai-footprint-out/desktop-default.png');
await b.close();process.exit(0)
