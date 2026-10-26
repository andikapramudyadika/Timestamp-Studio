import test from 'node:test';
import assert from 'node:assert/strict';
import {formatWita,fitRect,outputSize,cleanFileName,render,defaultStyle,SHADOW_PRESETS,shadowColor,textDetailCrop} from '../renderer.js';
test('WITA crosses midnight independently of host timezone',()=>{assert.equal(formatWita(new Date('2026-10-21T16:37:00Z')),'Kamis, 22 Oktober 2026 00.37');assert.equal(formatWita(new Date('2026-10-22T04:37:00Z'),':'),'Kamis, 22 Oktober 2026 12:37');});
test('image fitting keeps proportions for contain and cover',()=>{assert.deepEqual(fitRect(400,200,300,400),{x:0,y:125,w:300,h:150});assert.deepEqual(fitRect(400,200,300,400,'cover'),{x:-250,y:0,w:800,h:400});});
test('original and custom output sizes',()=>{assert.deepEqual(outputSize({width:3072,height:4096},'original'),{w:3072,h:4096});assert.deepEqual(outputSize({width:3072,height:4096},'pixellab'),{w:2448,h:3264});assert.equal(cleanFileName('foto:u ji.jpg'),'foto_u ji');});
function context(){const calls=[];return {calls,font:'',measureText(t){return{width:t.length*parseFloat(this.font.split(' ')[1])*.5,actualBoundingBoxAscent:30,actualBoundingBoxDescent:5};},save(){},restore(){},scale(){},clearRect(){},fillRect(){},drawImage(...x){calls.push(['image',...x]);},fillText(...x){calls.push(['text',...x]);},beginPath(){},rect(){},clip(){},strokeRect(){}};}
test('hidden rows disappear without changing order and original comparison omits overlays',()=>{const scene={photo:{image:{},width:300,height:400},map:null,lines:['waktu','koordinat','jalan','kelurahan','kecamatan','kota','provinsi'],visible:[true,false,true,true,true,true,true],style:defaultStyle()};const c=context();const b=render(c,scene,300,400);assert.deepEqual(c.calls.filter(x=>x[0]==='text').map(x=>x[1]),['waktu','jalan','kelurahan','kecamatan','kota','provinsi']);assert.ok(b.text.x>=0&&b.text.y>=0);const original=context();render(original,scene,300,400,1,true);assert.equal(original.calls.filter(x=>x[0]==='text').length,0);assert.equal(original.calls.filter(x=>x[0]==='image').length,1);});
test('map crops inside its bounds and disappears when disabled',()=>{const s=defaultStyle();const scene={photo:null,map:{image:{},width:400,height:200},lines:[],visible:[],style:s};const c=context();const b=render(c,scene,300,400);assert.deepEqual(b.map,{x:0,y:310,w:90,h:90});assert.equal(c.calls.filter(x=>x[0]==='image').length,1);s.mapEnabled=false;assert.equal(render(context(),scene,300,400).map,null);});
test('Camera baselines advance bottom-up by ink height, preserving descenders',()=>{
 const c=context();c.measureText=text=>({width:100,actualBoundingBoxLeft:-5,actualBoundingBoxRight:95,actualBoundingBoxAscent:30,actualBoundingBoxDescent:text==='descender'?10:0});
 const s=defaultStyle();s.fontSize=40;s.lineGap=10;s.shadow=false;
 const scene={photo:null,map:null,lines:['upper','descender'],visible:[true,true],style:s};render(c,scene,960,1280);
 const rows=c.calls.filter(x=>x[0]==='text');assert.equal(rows[1][3],1270);assert.equal(rows[1][3]-rows[0][3],50);assert.equal(rows[0][2],860);
});
test('shadow controls use the reference scale and can be disabled',()=>{
 const s=defaultStyle();const scene={photo:null,map:null,lines:['text'],visible:[true],style:s};const c=context();render(c,scene,2448,3264);assert.equal(c.shadowBlur,2.55);assert.equal(c.shadowOffsetX,1.9124999999999999);assert.equal(c.shadowOffsetY,1.9124999999999999);assert.equal(c.shadowColor,'rgba(0,0,0,0.35)');assert.match(c.font,/^380 /);
 const apk=context();Object.assign(s,{shadowReference:1280,shadowOffsetX:1,shadowOffsetY:1,shadowOpacity:50});render(apk,scene,3072,4096);assert.equal(apk.shadowOffsetX,3.2);assert.equal(apk.shadowColor,'rgba(0,0,0,0.5)');
 s.shadow=false;const noShadow=context();render(noShadow,scene,3072,4096);assert.equal(noShadow.shadowColor,'transparent');assert.equal(noShadow.shadowBlur,0);
});
test('preview scales shadow lengths along with the photo, including old saved styles',()=>{
 for(const style of [defaultStyle(),{...defaultStyle(),shadowReference:3264,shadowOpacity:34,shadowOffsetX:2,shadowOffsetY:2,shadowBlur:2}]){
  const scene={lines:['text'],visible:[true],style};const full=context(),preview=context();
  render(full,scene,2448,3264);render(preview,scene,2448,3264,.25);
  for(const key of ['shadowBlur','shadowOffsetX','shadowOffsetY'])assert.equal(preview[key],full[key]*.25,key);
 }
});
test('Google map brand and provider attribution appear in the exported render',()=>{
 const scene={map:{image:{},width:1024,height:1024,brand:'Google Maps',attribution:'Map data ©2026 Google'},lines:[],visible:[],style:defaultStyle()};
 const c=context();render(c,scene,2448,3264);
 assert.deepEqual(c.calls.filter(x=>x[0]==='text').map(x=>x[1]),['Google Maps','Map data ©2026 Google']);
});
test('automatic map attribution remains independent of map transparency',()=>{
 const s=defaultStyle();const scene={photo:null,map:{image:{},width:512,height:512,attribution:'© OpenStreetMap contributors'},lines:[],visible:[],style:s};const c=context();render(c,scene,1536,2048);assert.equal(s.mapOpacity,65);assert.ok(c.calls.some(x=>x[0]==='text'&&x[1]==='© OpenStreetMap contributors'));
});

test('legacy camera preset preserves v1.3 output while thin is lighter',()=>{
 const scene={lines:['text'],visible:[true],style:{...defaultStyle(),...SHADOW_PRESETS.camera}};
 const old=context();render(old,scene,2448,3264);
 assert.equal(old.shadowBlur,3.1875);assert.equal(old.shadowOffsetX,3.1875);assert.equal(old.shadowColor,'rgba(0,0,0,0.55)');
 Object.assign(scene.style,SHADOW_PRESETS.thin);const thin=context();render(thin,scene,2448,3264);
 assert.ok(thin.shadowBlur<old.shadowBlur);assert.ok(thin.shadowOffsetX<old.shadowOffsetX);
 assert.equal(thin.font,old.font);assert.deepEqual(thin.calls,old.calls);
});
test('custom shadow colors combine with opacity, including zero and old presets without color',()=>{
 assert.equal(shadowColor({shadowColor:'#6A7080',shadowOpacity:32}),'rgba(106,112,128,0.32)');
 assert.equal(shadowColor({shadowColor:'#444444',shadowOpacity:0}),'rgba(68,68,68,0)');
 assert.equal(shadowColor({shadowOpacity:55}),'rgba(0,0,0,0.55)');
 assert.equal(shadowColor({shadowColor:'invalid',shadowOpacity:300}),'rgba(0,0,0,1)');
 const style={...defaultStyle(),shadowColor:'#444444',shadowOpacity:32,shadowOffsetX:-.75,shadowOffsetY:-1.25};
 const scene={lines:['text'],visible:[true],style};const full=context(),preview=context();
 render(full,scene,2448,3264);render(preview,scene,2448,3264,.25);
 assert.equal(full.shadowColor,'rgba(68,68,68,0.32)');assert.equal(preview.shadowColor,full.shadowColor);
 assert.ok(full.shadowOffsetX<0&&full.shadowOffsetY<0);assert.equal(preview.shadowOffsetX,full.shadowOffsetX*.25);
});
test('text detail tracks visible row indexes and stays inside output bounds',()=>{
 const style=defaultStyle(),scene={lines:['first','hidden','last'],visible:[true,false,true],style};
 const full=render(context(),scene,2448,3264),preview=render(context(),scene,2448,3264,.25);
 assert.deepEqual(full.textRows.map(r=>r.index),[0,2]);assert.deepEqual(full.textRows,preview.textRows);
 for(const row of full.textRows){const crop=textDetailCrop(row,2448,3264,style);assert.ok(Number.isInteger(crop.x)&&Number.isInteger(crop.y));assert.ok(crop.x>=0&&crop.y>=0&&crop.x+crop.w<=2448&&crop.y+crop.h<=3264);assert.ok(crop.x<=row.x&&crop.y<=row.y);}
 assert.deepEqual(textDetailCrop({x:0,y:0,w:50,h:30},100,80,{shadow:false}),{x:0,y:0,w:62,h:42});
 assert.deepEqual(textDetailCrop({x:60,y:60,w:40,h:20},100,80,{shadow:false}),{x:48,y:48,w:52,h:32});
 assert.deepEqual(render(context(),scene,2448,3264,1,true).textRows,[]);
});
