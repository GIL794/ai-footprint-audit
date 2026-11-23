import {launch} from './cdp.mjs';
const b=await launch(); let failed=0;
const ok=(n,v,d='')=>{console.log((v?'PASS ':'FAIL ')+n+(v?'':' '+d));if(!v)failed++};
const go=async(q='')=>{await b.send('Page.navigate',{url:'http://127.0.0.1:8765/index.html'+q});await new Promise(r=>setTimeout(r,900))};
// round 6: every single override and pairs, both modes: published-scope wording must follow each field
const OVR={pWh:'pWh=1',pMl:'pMl=3',bCo2:'bCo2=1',sWh:'sWh=1',gCo2:'gCo2=100'};
const combos=[[],...Object.keys(OVR).map(k=>[k]),['pWh','bCo2'],['pMl','bCo2'],['pWh','pMl'],['sWh','gCo2'],['pWh','pMl','bCo2','sWh','gCo2']];
let matrixBad=[];
for(const mode of ['modern','conservative'])for(const c of combos){
  for(const tab of ['personalWater','digitalEnergy']){
  const q='?mode='+mode+'&tab='+tab+(c.length?'&'+c.map(k=>OVR[k]).join('&'):'');
  await go(q);
  const g=await b.ev(`({intro:document.getElementById('tab-what').textContent,chart:document.getElementById('chart-container').textContent,list:document.getElementById('answer-list').textContent,main:document.getElementById('answer-main').textContent,cards:document.querySelector('.stat-cards').textContent})`);
  const has=k=>c.includes(k), bad=m=>matrixBad.push(q+' :: '+m);
  if(tab==='personalWater'){
    if(has('pWh')&&(/data centre electricity|example rate/.test(g.intro)||/Data centre electricity only/.test(g.chart)))bad('pWh custom but intro/chart assert data-centre/example');
    if(!has('pWh')&&(!/data centre electricity/.test(g.intro)||!/Data centre electricity only/.test(g.chart)))bad('pWh default but data-centre scope missing');
    if(has('bCo2')&&/beef burger|raw beef|beef herds|dairy herds/.test(g.intro+g.chart))bad('burger custom but beef scope asserted');
    if(!has('bCo2')&&!/making one beef burger/.test(g.intro))bad('burger default but intro lost beef wording');
  }
  if(tab==='digitalEnergy'){
    if(has('sWh')&&/2019|device, the network|router/.test(g.chart))bad('video custom but 2019/device scope asserted: '+g.chart.slice(0,200));
    if(!has('sWh')&&!/2019/.test(g.chart))bad('video default lost 2019');
    if(has('pWh')&&/Counts the data centre only/.test(g.chart))bad('prompt custom but data-centre-only asserted');
  }
  if(has('pMl')&&(/power-plant/.test(g.cards)&&!/custom/.test(g.cards)||/cooling water( plus| only)/.test(g.list)))bad('water custom but cooling/power-plant asserted');
  if(!has('pMl')&&mode==='conservative'&&!/power-plant/.test(g.cards))bad('older default water card lost power-plant');
  if(!has('pWh')&&!/typical \(median\)|older figure/.test(g.main))bad('default electricity lost median/older caveat');
  if(has('pWh')&&/typical \(median\)|older figure/.test(g.main))bad('electricity custom but median caveat kept');
  }
}
ok('single-override and combination matrix, both modes ('+(combos.length*4)+' pages): published-scope wording follows each field',matrixBad.length===0,matrixBad.slice(0,6).join(' || '));

b.close();console.log(failed?'FAILED '+failed:'ALL PASSED');process.exit(failed?1:0);
