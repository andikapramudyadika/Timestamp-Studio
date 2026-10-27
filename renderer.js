export const LABELS = ['Hari, tanggal dan waktu','Koordinat','Nama lorong / jalan','Kelurahan','Kecamatan','Kabupaten / kota','Provinsi'];
export const DEFAULT_LINES = ['Kamis, 22 Oktober 2026 12.37','Koordinat lokasi','Nama jalan / lorong','Kelurahan','Kecamatan','Kabupaten / kota','Provinsi'];
export const SHADOW_STYLE = {shadow:true,shadowStyleVersion:2,shadowBlur:2,shadowOffsetX:1.5,shadowOffsetY:1.5,shadowOpacity:30,shadowSideColor:'#a6b2c0',shadowSideOpacity:100,shadowDepth:1};
export const defaultStyle = () => ({fontSize:40,fontWeight:380,lineGap:10.25,fontFamily:'camera',color:'#ffffff',opacity:100,...SHADOW_STYLE,background:0,position:'br',marginX:0,marginY:0,separator:'.',mapEnabled:true,mapSize:30,mapShape:'square',mapPosition:'bl',mapOpacity:65,mapBorder:false,mapX:0,mapY:0});
const clamp=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
export function shadowMetrics(style,width,height) {
 // Preserve the calibrated long-edge scale of the existing text layout.
 const unit=Math.max(width,height)/1280,radius=clamp(style.shadowBlur,0,6,2)*unit;
 return {blur:radius>0?2*(.57735*radius+.5):0,
  x:clamp(style.shadowOffsetX,-5,5,1.5)*unit,y:clamp(style.shadowOffsetY,-5,5,1.5)*unit,
  depth:clamp(style.shadowDepth,0,4,1)*unit};
}
export function restoreStyle(saved={}) {
 if(!saved||typeof saved!=='object'||Array.isArray(saved))saved={};
 const defaults=defaultStyle(),current=saved.shadowStyleVersion===2;
 // Retired shadow presets migrate to the sole 3D style. Preserve other settings
 // and the shadow switch; never reintroduce removed modes from localStorage.
 for(const key of Object.keys(defaults)){
  if(Object.hasOwn(saved,key)&&(!key.startsWith('shadow')||key==='shadow'||current))defaults[key]=saved[key];
 }
 return defaults;
}
function sideLayer(ctx,row,position,depth,color){
 // Rasterize a connected opaque silhouette, then apply opacity once on composite.
 // Per-line surfaces limit memory at full photo resolution.
 const layer=ctx.canvas?.ownerDocument?.createElement('canvas')??(typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(1,1):null);
 if(!layer)throw new Error('Browser tidak mendukung kanvas untuk sisi huruf.');
 const x=Math.floor(position.x-row.left)-2,y=Math.floor(position.y-row.ascent)-2;
 layer.width=Math.max(1,Math.ceil(row.width+depth+5));layer.height=Math.max(1,Math.ceil(row.ascent+row.descent+depth+5));
 const c=layer.getContext('2d');c.font=ctx.font;c.textAlign='left';c.textBaseline='alphabetic';c.fillStyle=/^#[\da-f]{6}$/i.test(color)?color:'#a6b2c0';
 const steps=Math.max(1,Math.ceil(depth/.25));
 for(let i=0;i<=steps;i++){const d=depth*i/steps;c.fillText(row.text,position.x-x+d,position.y-y+d);}
 return {layer,x,y};
}
// Crop output coordinates without resizing: include both shadow layers.
export function textDetailCrop(row,width,height,style) {
 const m=shadowMetrics(style,width,height);
 const core=m.depth;
 const padding=style.shadow?Math.ceil(Math.max(12,m.blur*3+Math.max(Math.abs(m.x),Math.abs(m.y))+4,core+4)):12;
 const x=Math.max(0,Math.floor(row.x-padding)),y=Math.max(0,Math.floor(row.y-padding));
 return {x,y,w:Math.max(1,Math.min(width,Math.ceil(row.x+row.w+padding))-x),h:Math.max(1,Math.min(height,Math.ceil(row.y+row.h+padding))-y)};
}
export function formatWita(date = new Date(), separator = '.') {
 const parts = new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Makassar',weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
 const get = k => parts.find(p=>p.type===k)?.value || '';
 return `${get('weekday')}, ${get('day')} ${get('month')} ${get('year')} ${get('hour')}${separator}${get('minute')}`;
}
export function fitRect(sw,sh,tw,th,mode='contain') {
 const scale=mode==='cover'?Math.max(tw/sw,th/sh):Math.min(tw/sw,th/sh);
 return {x:(tw-sw*scale)/2,y:(th-sh*scale)/2,w:sw*scale,h:sh*scale};
}
export function outputSize(photo, preset) {return preset==='pixellab'?{w:2448,h:3264}:{w:photo.width,h:photo.height};}
export function cleanFileName(name) {return (name||'foto').replace(/\.[^.]+$/,'').replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').slice(0,100)||'foto';}
export function fontStack(name) {return name==='custom'?'"UploadedTimestamp"':name==='arial'?'Arial, sans-serif':'"CameraRoboto", Roboto, Arial, sans-serif';}

// Render once in output coordinates. The preview uses an exact uniform scale of
// these coordinates, including full-resolution rounding of Android's font size.
export function render(ctx, scene, width, height, scale=1, original=false) {
 const {photo,map,lines,visible,style:s,fit='contain'}=scene;
 ctx.save();ctx.scale(scale,scale);ctx.clearRect(0,0,width,height);ctx.fillStyle='#111713';ctx.fillRect(0,0,width,height);
 if(photo){const r=fitRect(photo.width,photo.height,width,height,fit);ctx.drawImage(photo.image,r.x,r.y,r.w,r.h);}
 const bounds={text:null,map:null,textRows:[]};
 if(original){ctx.restore();return bounds;}
 // Android captures a landscape sensor buffer before applying EXIF rotation.
 // The long edge reproduces the scale of the supplied portrait reference.
 const unit=Math.max(width,height)/1280;
 const baseSize=Math.max(1,Math.trunc(s.fontSize*unit));
 const active=lines.filter((line,i)=>visible[i]&&line.trim()).map(x=>x.trim());
 if(s.mapEnabled&&map){
  const mw=width*s.mapSize/100;const mh=s.mapShape==='square'?mw:Math.min(height,map.height/map.width*mw);
  const right=s.mapPosition.endsWith('r'),bottom=s.mapPosition.startsWith('b');
  const mx=Math.max(0,Math.min(width-mw,width*s.mapX/100));const my=Math.max(0,Math.min(height-mh,height*s.mapY/100));
  const x=right?width-mw-mx:mx,y=bottom?height-mh-my:my;
  ctx.save();ctx.globalAlpha=s.mapOpacity/100;
  const f=fitRect(map.width,map.height,mw,mh,s.mapShape==='square'?'cover':'contain');
  ctx.beginPath();ctx.rect(x,y,mw,mh);ctx.clip();ctx.drawImage(map.image,x+f.x,y+f.y,f.w,f.h);ctx.restore();
  if(s.mapBorder){ctx.save();ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1,unit*.7);ctx.strokeRect(x+ctx.lineWidth/2,y+ctx.lineWidth/2,mw-ctx.lineWidth,mh-ctx.lineWidth);ctx.restore();}
  bounds.map={x,y,w:mw,h:mh};
  if(map.brand){
   // Google attribution is drawn over the map at full opacity, including exports.
   ctx.save();const fs=Math.max(10,mw/36),padding=fs*.45,strip=fs*3.5;
   ctx.fillStyle='rgba(255,255,255,.96)';ctx.fillRect(x,y+mh-strip,mw,strip);
   ctx.fillStyle='#26372f';ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`500 ${fs*1.25}px Arial, sans-serif`;
   ctx.fillText(map.brand,x+padding,y+mh-strip+fs,mw-padding*2);
   ctx.font=`400 ${fs}px Arial, sans-serif`;ctx.fillText(map.attribution,x+padding,y+mh-fs*.85,mw-padding*2);ctx.restore();
  }else if(map.attribution){
   // Attribution stays readable at full opacity, independently of map opacity.
   ctx.save();const fontSize=Math.max(8,mw/35),strip=fontSize*1.65;ctx.fillStyle='rgba(255,255,255,.96)';ctx.fillRect(x,y+mh-strip,mw,strip);ctx.fillStyle='#26372f';ctx.font=`400 ${fontSize}px Arial, sans-serif`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(map.attribution,x+fontSize*.35,y+mh-strip/2,mw-fontSize*.7);ctx.restore();
  }
 }
 if(active.length){
  // Android positions each line using its ink rectangle, rather than its
  // typographic advance, and keeps a quarter-font inset at the edges.
  const edge=baseSize/4, mx=width*s.marginX/100+edge,my=height*s.marginY/100+edge;
  ctx.textAlign='left';
  const weight=Math.max(250,Math.min(500,Number(s.fontWeight)||380));
  ctx.font=`${weight} ${baseSize}px ${fontStack(s.fontFamily)}`;
  const maxWidth=Math.max(...active.map(t=>ctx.measureText(t).width));
  let factor=Math.min(1,Math.max(1,width-2*mx)/Math.max(1,maxWidth));
  const measure=size=>{ctx.font=`${weight} ${size}px ${fontStack(s.fontFamily)}`;return active.map(text=>{const m=ctx.measureText(text);return {text,width:Math.ceil(m.actualBoundingBoxLeft+m.actualBoundingBoxRight)||m.width,left:m.actualBoundingBoxLeft||0,ascent:m.actualBoundingBoxAscent||size*.75,descent:m.actualBoundingBoxDescent||0};});};
  let size=baseSize*factor, rows=measure(size),gap=s.lineGap*unit*factor;
  const blockHeight=()=>rows.reduce((n,r)=>n+r.ascent+r.descent,0)+gap*(rows.length-1)+rows.at(-1).descent-rows[0].descent;
  let total=blockHeight();
  if(total>height-2*my){const ratio=Math.max(1,height-2*my)/total;factor*=ratio;size=baseSize*factor;rows=measure(size);gap=s.lineGap*unit*factor;total=blockHeight();}
  const right=s.position.endsWith('r'),bottom=s.position.startsWith('b');
  // Match Camera's bottom-up baseline advance: ink height + an interline gap.
  // Placing all rows by the same CSS line-height loses the descender spacing.
  let baseline=height-my;const positions=[];
  for(let i=rows.length-1;i>=0;i--){const r=rows[i];positions[i]={x:right?width-mx-r.width:mx,y:baseline};baseline-=r.ascent+r.descent+gap;}
  const top=Math.min(...rows.map((r,i)=>positions[i].y-r.ascent));
  if(!bottom){const shift=my-top;positions.forEach(p=>p.y+=shift);}
  const x0=Math.min(...rows.map((r,i)=>positions[i].x-r.left)),x1=Math.max(...rows.map((r,i)=>positions[i].x-r.left+r.width));
  const y0=Math.min(...rows.map((r,i)=>positions[i].y-r.ascent)),y1=Math.max(...rows.map((r,i)=>positions[i].y+r.descent));
  bounds.text={x:x0,y:y0,w:x1-x0,h:y1-y0,shrunk:factor<.99};
  const indexes=lines.flatMap((line,i)=>visible[i]&&line.trim()?[i]:[]);
  bounds.textRows=rows.map((r,i)=>({index:indexes[i],x:positions[i].x-r.left,y:positions[i].y-r.ascent,w:r.width,h:r.ascent+r.descent}));
  if(s.background){ctx.fillStyle=`rgba(0,0,0,${s.background/100})`;ctx.fillRect(x0-edge,y0-edge,x1-x0+2*edge,y1-y0+2*edge);}
  ctx.globalAlpha=s.opacity/100;ctx.fillStyle=s.color;ctx.textAlign='left';ctx.textBaseline='alphabetic';
  // Canvas shadow lengths ignore the transform: scale in device pixels.
  const m=shadowMetrics(s,width,height);
  ctx.shadowColor='transparent';ctx.shadowBlur=ctx.shadowOffsetX=ctx.shadowOffsetY=0;
  if(s.shadow){
   const textAlpha=clamp(s.opacity,0,100,100)/100;
   const softAlpha=textAlpha*clamp(s.shadowOpacity,0,100,30)/100;
   // The source glyphs are outside the photo; only their compensated shadow
   // enters the canvas. This avoids an extra visible text fill.
   if(softAlpha>0){
    const shift=width+maxWidth+Math.abs(m.x)+m.blur*4+100;
    ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();
    ctx.globalAlpha=1;ctx.fillStyle='#000000';ctx.shadowColor=`rgba(0,0,0,${softAlpha})`;
    ctx.shadowBlur=m.blur*scale;ctx.shadowOffsetX=(shift+m.x)*scale;ctx.shadowOffsetY=m.y*scale;
    for(let i=0;i<rows.length;i++)ctx.fillText(rows[i].text,positions[i].x-shift,positions[i].y);
    ctx.restore();
   }
   ctx.shadowColor='transparent';ctx.shadowBlur=ctx.shadowOffsetX=ctx.shadowOffsetY=0;
   const sideAlpha=textAlpha*clamp(s.shadowSideOpacity,0,100,100)/100;
   if(m.depth>0&&sideAlpha>0){
    ctx.globalAlpha=sideAlpha;
    for(let i=0;i<rows.length;i++){
     const {layer,x,y}=sideLayer(ctx,rows[i],positions[i],m.depth,s.shadowSideColor);
     ctx.drawImage(layer,x,y);layer.width=layer.height=1;
    }
   }
   ctx.globalAlpha=textAlpha;ctx.fillStyle=s.color;
  }
  for(let i=0;i<rows.length;i++)ctx.fillText(rows[i].text,positions[i].x,positions[i].y);
 }
 ctx.restore();return bounds;
}
