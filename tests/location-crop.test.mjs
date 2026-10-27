import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCoordinates,shortMapsLink} from '../maps.js';
import {addressLines,lookupAddress} from '../location.js';
import {cropRect,detectMapSquare} from '../map-crop.js';

test('place pin takes priority over camera center; encoded queries and navigation links work',()=>{
 assert.deepEqual(parseCoordinates('https://www.google.com/maps/place/Test/@-4,122,17z/data=!3m1!4b1!3d-4.0034!4d122.5286'),{lat:-4.0034,lon:122.5286});
 for(const query of ['query','q','ll','destination'])assert.deepEqual(parseCoordinates(`https://www.google.com/maps/?${query}=-4.0034%2C122.5286`),{lat:-4.0034,lon:122.5286});
 assert.equal(parseCoordinates('https://evil.example/maps/@-4,122,17z'),null);
 assert.ok(shortMapsLink('https://maps.app.goo.gl/test'));
 for(const value of ['https://evil.example/?x=maps.app.goo.gl','javascript:alert(1)','https://goo.gl/other'])assert.equal(shortMapsLink(value),null);
});
test('address fields map available Indonesian administrative levels and leave missing levels empty',()=>{
 assert.deepEqual(addressLines({features:[{properties:{street:'Jalan Contoh',locality:'Kelurahan Baru',district:'Kambu',city:'Kota Kendari',state:'Sulawesi Tenggara'}}]}),{2:'Jalan Contoh',3:'Kelurahan Baru',4:'Kecamatan Kambu',5:'Kota Kendari',6:'Sulawesi Tenggara'});
 assert.deepEqual(addressLines({features:[{properties:{state:'Provinsi'}}]}),{2:'',3:'',4:'',5:'',6:'Provinsi'});
 assert.deepEqual(addressLines({features:[{properties:{district:'Anduonohu',city:'Kendari',state:'Sulawesi Tenggara'}}]}),{2:'',3:'Anduonohu',4:'',5:'Kendari',6:'Sulawesi Tenggara'});
 assert.throws(()=>addressLines({features:[]}),/belum ditemukan/);
});
test('address lookup caches successes, rejects HTTP errors, and respects abort',async()=>{
 const original=globalThis.fetch;let count=0;
 try{
  globalThis.fetch=async()=>{count++;return {ok:true,json:async()=>({features:[{properties:{state:'Test'}}]})};};
  const point={lat:1.234567,lon:123};await lookupAddress(point);await lookupAddress(point);assert.equal(count,1);
  const abort=new AbortController();abort.abort();await assert.rejects(lookupAddress(point,{signal:abort.signal}),{name:'AbortError'});
  globalThis.fetch=async()=>({ok:false,status:429});await assert.rejects(lookupAddress({lat:1.5,lon:123}),/sibuk/);
 }finally{globalThis.fetch=original;}
});
test('crop geometry stays square, preserves source pixels, and clamps to image boundaries',()=>{
 assert.deepEqual(cropRect(1368,1824),{x:0,y:1414,w:410,h:410});
 for(const dims of [[1368,1824],[2000,800],[1,1],[80,140]])for(const p of [10,30,60,100]){
  const r=cropRect(...dims,p,40,40);assert.equal(r.w,r.h);assert.ok(r.x>=0&&r.y>=0&&r.x+r.w<=dims[0]&&r.y+r.h<=dims[1]);
 }
});
test('detects different lower-left map sizes and returns an explicit estimate for a plain image',()=>{
 for(const side of [60,90,135]){
  const width=300,height=400,data=new Uint8ClampedArray(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4,v=x<side&&y>=height-side?235:60;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}
  const found=detectMapSquare({data,width,height});assert.ok(Math.abs(found.side-side)<=2,JSON.stringify(found));assert.equal(found.confidence,'detected');
 }
 const found=detectMapSquare({data:new Uint8ClampedArray(300*400*4),width:300,height:400});assert.equal(found.confidence,'estimated');assert.equal(found.side,90);
});
