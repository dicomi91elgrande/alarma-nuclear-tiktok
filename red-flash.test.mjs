import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

test('Webhook: límite inclusivo, combos, duplicados y datos inválidos', async () => {
  const child = spawn(process.execPath, ['red-flash-server.mjs'], {env:{...process.env,RED_FLASH_PORT:'13191'},stdio:['ignore','pipe','pipe']});
  try {
    await Promise.race([once(child.stdout,'data'), once(child,'exit').then(() => {throw new Error('Servidor cerrado');}),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Tiempo agotado')),5000).unref())]);
    const send = async body => {
      const response = await fetch('http://127.0.0.1:13191/interactive/gift',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      return {status:response.status,...await response.json()};
    };
    assert.equal((await send({coins:999})).triggered,false);
    assert.equal((await send({coins:1000})).triggered,true);
    assert.equal((await send({coins:1001})).triggered,true);
    assert.equal((await send({coins:1,repeatCount:1000,countMode:'unit'})).triggered,false);
    assert.equal((await send({coins:100,repeatCount:10,countMode:'combo',repeatEnd:false})).triggered,false);
    assert.equal((await send({coins:100,repeatCount:10,countMode:'combo',repeatEnd:true})).triggered,true);
    assert.equal((await send({coins:1000,eventId:'abc',username:'a'})).triggered,true);
    assert.equal((await send({coins:1000,eventId:'abc',username:'a'})).duplicate,true);
    for(const coins of [null,-1,'{coins}','no',1.5]) assert.equal((await send({coins})).status,400);
    const stream = await fetch('http://127.0.0.1:13191/events');
    const reader = stream.body.getReader();
    const {value} = await reader.read();
    const state = JSON.parse(new TextDecoder().decode(value).split('data: ')[1]);
    assert.ok(state.activeUntil > Date.now()+6000);
    assert.ok(state.activeUntil <= Date.now()+7000);
    await reader.cancel();
    const overlay = await fetch('http://127.0.0.1:13191/overlay');
    assert.equal(overlay.status,200);
    assert.match(await overlay.text(),/inset:0/);
    assert.equal((await fetch('http://127.0.0.1:13191/',{headers:{Origin:'http://example.com'}})).status,403);
  } finally { child.kill(); await once(child,'exit'); }
});
