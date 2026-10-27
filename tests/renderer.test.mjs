import test from 'node:test';
import assert from 'node:assert/strict';
import {formatWita,fitRect,outputSize,cleanFileName,render,defaultStyle,SHADOW_STYLE,normalizeHex,textDetailCrop,shadowMetrics,restoreStyle} from '../renderer.js';
test('WITA crosses midnight independently of host timezone',()=>{assert.equal(formatWita(new Date('2026-10-21T16:37:00Z')),'Kamis, 22 Oktober 2026 00.37');assert.equal(formatWita(new Date('2026-10-22T04:37:00Z'),':'),'Kamis, 22 Oktober 2026 12:37');});
test('image fitting keeps proportions for contain and cover',()=>{assert.deepEqual(fitRect(400,200,300,400),{x:0,y:125,w:300,h:150});assert.deepEqual(fitRect(400,200,300,400,'cover'),{x:-250,y:0,w:800,h:400});});
test('original and custom output sizes',()=>{assert.deepEqual(outputSize({width:3072,height:4096},'original'),{w:3072,h:4096});assert.deepEqual(outputSize({width:3072,height:4096},'pixellab'),{w:2448,h:3264});assert.equal(cleanFileName('foto:u ji.jpg'),'foto_u ji');});
function plainStyle(){return {...defaultStyle(),shadow:false};}
function context(){const calls=[];return {calls,font:'',measureText(t){return{width:t.length*parseFloat(this.font.split(' ')[1])*.5,actualBoundingBoxAscent:30,actualBoundingBoxDescent:5};},save(){},restore(){},scale(){},clearRect(){},fillRect(){},drawImage(...x){calls.push(['image',...x]);},fillText(...x){calls.push(['text',...x]);},beginPath(){},rect(){},clip(){},strokeRect(){}};}
test('hidden rows disappear without changing order and original comparison omits overlays',()=>{const scene={photo:{image:{},width:300,height:400},map:null,lines:['waktu','koordinat','jalan','kelurahan','kecamatan','kota','provinsi'],visible:[true,false,true,true,true,true,true],style:plainStyle()};const c=context();const b=render(c,scene,300,400);assert.deepEqual(c.calls.filter(x=>x[0]==='text').map(x=>x[1]),['waktu','jalan','kelurahan','kecamatan','kota','provinsi']);assert.ok(b.text.x>=0&&b.text.y>=0);const original=context();render(original,scene,300,400,1,true);assert.equal(original.calls.filter(x=>x[0]==='text').length,0);assert.equal(original.calls.filter(x=>x[0]==='image').length,1);});
test('map crops inside its bounds and disappears when disabled',()=>{const s=plainStyle();const scene={photo:null,map:{image:{},width:400,height:200},lines:[],visible:[],style:s};const c=context();const b=render(c,scene,300,400);assert.deepEqual(b.map,{x:0,y:310,w:90,h:90});assert.equal(c.calls.filter(x=>x[0]==='image').length,1);s.mapEnabled=false;assert.equal(render(context(),scene,300,400).map,null);});
test('Camera baselines advance bottom-up by ink height, preserving descenders',()=>{
 const c=context();c.measureText=text=>({width:100,actualBoundingBoxLeft:-5,actualBoundingBoxRight:95,actualBoundingBoxAscent:30,actualBoundingBoxDescent:text==='descender'?10:0});
 const s=plainStyle();s.fontSize=40;s.lineGap=10;s.shadow=false;
 const scene={photo:null,map:null,lines:['upper','descender'],visible:[true,true],style:s};render(c,scene,960,1280);
 const rows=c.calls.filter(x=>x[0]==='text');assert.equal(rows[1][3],1270);assert.equal(rows[1][3]-rows[0][3],50);assert.equal(rows[0][2],860);
});
test('Google map brand and provider attribution appear in the exported render',()=>{
 const scene={map:{image:{},width:1024,height:1024,brand:'Google Maps',attribution:'Map data ©2026 Google'},lines:[],visible:[],style:plainStyle()};
 const c=context();render(c,scene,2448,3264);
 assert.deepEqual(c.calls.filter(x=>x[0]==='text').map(x=>x[1]),['Google Maps','Map data ©2026 Google']);
});
test('automatic map attribution remains independent of map transparency',()=>{
 const s=plainStyle();const scene={photo:null,map:{image:{},width:512,height:512,attribution:'© OpenStreetMap contributors'},lines:[],visible:[],style:s};const c=context();render(c,scene,1536,2048);assert.equal(s.mapOpacity,65);assert.ok(c.calls.some(x=>x[0]==='text'&&x[1]==='© OpenStreetMap contributors'));
});

test('text detail tracks visible row indexes and stays inside output bounds',()=>{
 const style=plainStyle(),scene={lines:['first','hidden','last'],visible:[true,false,true],style};
 const full=render(context(),scene,2448,3264),preview=render(context(),scene,2448,3264,.25);
 assert.deepEqual(full.textRows.map(r=>r.index),[0,2]);assert.deepEqual(full.textRows,preview.textRows);
 for(const row of full.textRows){const crop=textDetailCrop(row,2448,3264,style);assert.ok(Number.isInteger(crop.x)&&Number.isInteger(crop.y));assert.ok(crop.x>=0&&crop.y>=0&&crop.x+crop.w<=2448&&crop.y+crop.h<=3264);assert.ok(crop.x<=row.x&&crop.y<=row.y);}
 assert.deepEqual(textDetailCrop({x:0,y:0,w:50,h:30},100,80,{shadow:false}),{x:0,y:0,w:62,h:42});
 assert.deepEqual(textDetailCrop({x:60,y:60,w:40,h:20},100,80,{shadow:false}),{x:48,y:48,w:52,h:32});
 assert.deepEqual(render(context(),scene,2448,3264,1,true).textRows,[]);
});



function shadowContext(){
 const c=context(),layers=[],images=[],passes=[];
 c.canvas={ownerDocument:{createElement(){const glyphs=[];const layer={width:0,height:0,getContext(){return {set font(v){layer.font=v;},set fillStyle(v){layer.color=v;},fillText(...args){glyphs.push(args);}};},glyphs};layers.push(layer);return layer;}}};
 c.drawImage=function(layer,x,y){images.push({x,y,alpha:this.globalAlpha,color:layer.color,font:layer.font,glyphs:[...layer.glyphs]});};
 c.fillText=function(text,x,y){passes.push({text,x,y,alpha:this.globalAlpha,fill:this.fillStyle,blur:this.shadowBlur,dx:this.shadowOffsetX,dy:this.shadowOffsetY});};
 return {c,layers,images,passes};
}
test('sole shadow style defaults to connected gray sides; Android blur conversion is preserved',()=>{
 const s=defaultStyle();assert.equal(s.shadowSideColor,'#929292');assert.equal(s.shadowSideOpacity,100);assert.equal(s.shadowDepth,1.1);assert.equal('shadowMode' in s,false);
 const m=shadowMetrics(s,960,1280);assert.ok(Math.abs(m.blur-3.3094)<1e-9);assert.equal(m.x,1.5);assert.equal(m.depth,1.1);
 assert.ok(Math.abs(shadowMetrics(s,3072,4096).depth-3.52)<1e-9);
});
test('all saved presets preserve other settings and lock the v1.6.1 shadow',()=>{
 for(const mode of [undefined,'single','layered','dex']){
  const s=restoreStyle({fontSize:56,mapSize:22,shadow:false,shadowMode:mode,shadowOpacity:55,shadowReference:3264});
  assert.equal(s.fontSize,56);assert.equal(s.mapSize,22);assert.equal(s.shadow,true);
  assert.equal(s.shadowOpacity,SHADOW_STYLE.shadowOpacity);assert.equal('shadowMode' in s,false);assert.equal('shadowReference' in s,false);
 }
 const s={...defaultStyle(),shadowSideColor:'#778899',shadowDepth:2.2,shadowSideOpacity:50};
 assert.deepEqual(restoreStyle(JSON.parse(JSON.stringify(s))),defaultStyle());
 assert.deepEqual(restoreStyle(null),defaultStyle());
});
test('side silhouette is connected and composited once; foreground geometry stays unchanged',()=>{
 const style={...defaultStyle(),shadowSideOpacity:50,opacity:80},scene={lines:['text'],visible:[true],style};
 const {c,images,passes}=shadowContext(),bounds=render(c,scene,960,1280);
 assert.equal(images.length,1);assert.equal(images[0].color,'#929292');assert.equal(images[0].alpha,.4);
 const glyphs=images[0].glyphs;assert.ok(glyphs.length>=5);
 for(let i=1;i<glyphs.length;i++){assert.ok(glyphs[i][1]-glyphs[i-1][1]<=.25);assert.ok(glyphs[i][2]-glyphs[i-1][2]<=.25);}
 assert.equal(passes.length,2);assert.ok(passes[0].x<0);assert.equal(passes[0].alpha,1);assert.equal(passes[1].fill,'#ffffff');assert.equal(passes[1].alpha,.8);assert.equal(passes[1].blur,0);
 style.shadow=false;const no=shadowContext();assert.deepEqual(render(no.c,scene,960,1280),bounds);assert.equal(no.images.length,0);assert.equal(no.passes.length,1);
});
test('full-resolution sides and shadow lengths keep the same preview scale',()=>{
 const scene={lines:['text'],visible:[true],style:defaultStyle()},full=shadowContext(),preview=shadowContext();
 assert.deepEqual(render(full.c,scene,2448,3264),render(preview.c,scene,2448,3264,.25));
 assert.deepEqual(full.images,preview.images);
 for(const k of ['blur','dx','dy'])assert.equal(preview.passes[0][k],full.passes[0][k]*.25);
});
test('zero depth or side opacity skips sides; zero text alpha skips every shadow',()=>{
 for(const patch of [{shadowDepth:0},{shadowSideOpacity:0}]){const r=shadowContext();render(r.c,{lines:['text'],visible:[true],style:{...defaultStyle(),...patch}},960,1280);assert.equal(r.images.length,0);}
 const r=shadowContext();render(r.c,{lines:['text'],visible:[true],style:{...defaultStyle(),opacity:0}},960,1280);assert.equal(r.images.length,0);assert.equal(r.passes.length,1);assert.equal(r.passes[0].alpha,0);
});

test('HEX input accepts six/three digits with optional hash and rejects unsafe or incomplete values',()=>{
 for(const value of ['#929292','929292','  #929292  '])assert.equal(normalizeHex(value),'#929292');
 assert.equal(normalizeHex('#A6B2C0'),'#a6b2c0');assert.equal(normalizeHex('abc'),'#aabbcc');assert.equal(normalizeHex('#FFF'),'#ffffff');
 for(const value of ['', '#', '#12', '#1234', '#12345G', '#12345678', 'red', null, 123])assert.equal(normalizeHex(value),null);
});
