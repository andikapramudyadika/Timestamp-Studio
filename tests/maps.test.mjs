import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCoordinates,formatCoordinates,worldPoint,planTiles,googleViewport,createGoogleMap} from '../maps.js';
test('Google copied coordinates, parentheses, hemisphere format and decimal comma',()=>{
 assert.deepEqual(parseCoordinates('(-3.123456,122.654321)'),{lat:-3.123456,lon:122.654321});
 assert.deepEqual(parseCoordinates('3,12345S 122,65432E'),{lat:-3.12345,lon:122.65432});
 assert.deepEqual(parseCoordinates('-3,12345;122,65432'),{lat:-3.12345,lon:122.65432});
 assert.deepEqual(parseCoordinates('https://www.google.com/maps/@-3.12345,122.65432,17z'),{lat:-3.12345,lon:122.65432});
 assert.deepEqual(parseCoordinates('https://maps.google.com/?q=-3.12345,122.65432'),{lat:-3.12345,lon:122.65432});
});
test('reject invalid or ambiguous values instead of placing a false pin',()=>{
 for(const value of ['', '91,0','0,181','nama lokasi','1,2,3','https://maps.app.goo.gl/example','NaN,12'])assert.equal(parseCoordinates(value),null,value);
 assert.deepEqual(parseCoordinates('0,0'),{lat:0,lon:0});
});
test('coordinate text uses the correct hemisphere and decimal commas',()=>{assert.equal(formatCoordinates({lat:-3.123456,lon:122.654321}),'3,12346S 122,65432E');assert.equal(formatCoordinates({lat:1,lon:-2}),'1,00000N 2,00000W');});
test('Mercator origin and pin center are correct at every zoom',()=>{
 assert.deepEqual(worldPoint({lat:0,lon:0},0),{x:128,y:128});
 for(const zoom of [13,16,17,19]){const plan=planTiles({lat:-3.12,lon:122.65},zoom);assert.deepEqual(plan.center,{x:256,y:256});assert.ok(plan.tiles.length>=4&&plan.tiles.length<=9);assert.ok(plan.tiles.every(t=>t.url.startsWith('https://tile.openstreetmap.org/')));const left=Math.min(...plan.tiles.map(t=>t.x)),right=Math.max(...plan.tiles.map(t=>t.x+256));assert.ok(left<=0&&right>=512);}
});
test('dateline tile X coordinates wrap within the world',()=>{for(const lon of [-180,180]){const p=planTiles({lat:0,lon},4);assert.ok(p.tiles.every(t=>{const x=+t.url.split('/')[4];return x>=0&&x<16;}));}});
test('Google attribution viewport covers the requested center and wraps at the dateline',()=>{
 const p={lat:-3.99,lon:122.51},v=googleViewport(p,17);assert.ok(v.north>p.lat&&v.south<p.lat&&v.west<p.lon&&v.east>p.lon);
 const edge=googleViewport({lat:0,lon:179.9999},17);assert.ok(edge.west>0&&edge.east<0);
 const pole=googleViewport({lat:85.05,lon:0},2);assert.ok(pole.north<=85.05112878&&pole.south<pole.north);
});
test('Google rejects missing keys and invalid locations before making a request',async()=>{
 await assert.rejects(createGoogleMap({lat:0,lon:0}),/API key/);
 await assert.rejects(createGoogleMap({lat:90,lon:0},17,{apiKey:'fixture'}),/Koordinat/);
 const controller=new AbortController();controller.abort();
 await assert.rejects(createGoogleMap({lat:0,lon:0},17,{apiKey:'fixture',signal:controller.signal}),{name:'AbortError'});
});
test('Google authorization and quota errors give actionable messages without exposing the key',async()=>{
 const original=globalThis.fetch;
 try{for(const [status,message]of [[403,/API key/],[429,/Kuota/]]){
  globalThis.fetch=async()=>({ok:false,status});
  await assert.rejects(createGoogleMap({lat:0,lon:0},17,{apiKey:'private-fixture-key'}),error=>message.test(error.message)&&!error.message.includes('private-fixture-key'));
 }}finally{globalThis.fetch=original;}
});
