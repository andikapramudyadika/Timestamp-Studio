export const LABELS = ['Hari, tanggal dan waktu','Koordinat','Nama lorong / jalan','Kelurahan','Kecamatan','Kabupaten / kota','Provinsi'];
export const DEFAULT_LINES = ['Kamis, 22 Oktober 2026 12.37','Koordinat lokasi','Nama jalan / lorong','Kelurahan','Kecamatan','Kabupaten / kota','Provinsi'];
export const defaultStyle = () => ({fontSize:40,fontWeight:380,lineGap:10.25,fontFamily:'camera',color:'#ffffff',opacity:100,shadow:true,shadowBlur:2,shadowReference:3264,shadowOffset:2,shadowOffsetX:2,shadowOffsetY:2,shadowOpacity:34,background:0,position:'br',marginX:0,marginY:0,separator:'.',mapEnabled:true,mapSize:30,mapShape:'square',mapPosition:'bl',mapOpacity:65,mapBorder:false,mapX:0,mapY:0});
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
 const bounds={text:null,map:null};
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
  if(map.attribution){
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
  if(s.background){ctx.fillStyle=`rgba(0,0,0,${s.background/100})`;ctx.fillRect(x0-edge,y0-edge,x1-x0+2*edge,y1-y0+2*edge);}
  ctx.globalAlpha=s.opacity/100;ctx.fillStyle=s.color;ctx.textAlign='left';ctx.textBaseline='alphabetic';
  if(s.shadow){const offsetUnit=Math.max(width,height)/(s.shadowReference||3264);ctx.shadowColor=`rgba(0,0,0,${(s.shadowOpacity??34)/100})`;ctx.shadowBlur=(s.shadowBlur??2)*unit;ctx.shadowOffsetX=(s.shadowOffsetX??s.shadowOffset??2)*offsetUnit;ctx.shadowOffsetY=(s.shadowOffsetY??s.shadowOffset??2)*offsetUnit;}
  for(let i=0;i<rows.length;i++)ctx.fillText(rows[i].text,positions[i].x,positions[i].y);
 }
 ctx.restore();return bounds;
}
