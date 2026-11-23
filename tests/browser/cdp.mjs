import {spawn} from 'node:child_process';
import fs from 'node:fs';
export async function launch(){
  const ch=spawn('google-chrome',['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port=9333','--user-data-dir=/tmp/chprof'+Date.now(),'about:blank'],{stdio:'ignore'});
  let list;
  for(let i=0;i<50;i++){try{list=await (await fetch('http://127.0.0.1:9333/json')).json();if(list.find(t=>t.type==='page'))break}catch{};await new Promise(r=>setTimeout(r,200))}
  const t=list.find(t=>t.type==='page');
  const ws=new WebSocket(t.webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
  let id=0;const pend={};const events=[];
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend[m.id]){pend[m.id](m)}else events.push(m)};
  const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pend[i]=m=>m.error?rej(new Error(JSON.stringify(m.error))):res(m.result);ws.send(JSON.stringify({id:i,method,params}))});
  await send('Page.enable');await send('Runtime.enable');
  const ev=async(expr)=>{const r=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails).slice(0,300));return r.result.value};
  const goto=async(url)=>{await send('Page.navigate',{url});await new Promise(r=>setTimeout(r,1800))};
  const shot=async(path,full=true)=>{const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:full});fs.writeFileSync(path,Buffer.from(r.data,'base64'))};
  const type=async(text)=>{for(const ch of text){await send('Input.dispatchKeyEvent',{type:'keyDown',key:ch,text:ch,code:ch==='.'?'Period':'Digit'+ch,windowsVirtualKeyCode:ch==='.'?190:ch.charCodeAt(0)});await send('Input.dispatchKeyEvent',{type:'keyUp',key:ch,code:ch==='.'?'Period':'Digit'+ch})}};
  const key=async(k,vk,code)=>{await send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:k,code:code||k,windowsVirtualKeyCode:vk});await send('Input.dispatchKeyEvent',{type:'keyUp',key:k,code:code||k,windowsVirtualKeyCode:vk})};
  return {send,ev,goto,shot,type,key,events,close:()=>{ch.kill()}};
}
