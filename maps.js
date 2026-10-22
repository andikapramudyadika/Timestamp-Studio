// On-demand visible tiles only. Browser HTTP caching and Referer are preserved.
// No scraping, offline prefetch, Google tiles, API keys, or proxy services.
const tileCache=new Map();
export function parseCoordinates(value){
 let text=String(value||'').trim().replace(/[()]/g,'');
 const hemi=text.match(/^([\d.,]+)\s*([NS])\s+([\d.,]+)\s*([EW])$/i);
 if(hemi)return validate(Number(hemi[1].replace(',','.'))*(/s/i.test(hemi[2])?-1:1),Number(hemi[3].replace(',','.'))*(/w/i.test(hemi[4])?-1:1));
 if(/^https?:\/\//i.test(text)){
  try{const url=new URL(text);const at=url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);if(at)return validate(+at[1],+at[2]);text=url.searchParams.get('q')||url.searchParams.get('query')||url.searchParams.get('ll')||'';}catch{return null;}
 }
 const decimalComma=text.match(/^(-?\d+(?:,\d+)?)\s*;\s*(-?\d+(?:,\d+)?)$/);
 if(decimalComma)return validate(+decimalComma[1].replace(',','.'),+decimalComma[2].replace(',','.'));
 const pair=text.match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/);
 return pair?validate(+pair[1],+pair[2]):null;
}
function validate(lat,lon){return Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180?{lat,lon}:null;}
export function formatCoordinates({lat,lon}){const number=n=>Math.abs(n).toFixed(5).replace('.',',');return `${number(lat)}${lat<0?'S':'N'} ${number(lon)}${lon<0?'W':'E'}`;}
export function worldPoint({lat,lon},zoom){const size=256*2**zoom;const sin=Math.sin(Math.max(-85.05112878,Math.min(85.05112878,lat))*Math.PI/180);return{x:(lon+180)/360*size,y:(.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*size};}
export function planTiles(point,zoom,side=512){
 const center=worldPoint(point,zoom),n=2**zoom,left=center.x-side/2,top=center.y-side/2,tiles=[];
 for(let y=Math.floor(top/256);y<=Math.floor((top+side-1e-6)/256);y++)for(let x=Math.floor(left/256);x<=Math.floor((left+side-1e-6)/256);x++)if(y>=0&&y<n)tiles.push({url:`https://tile.openstreetmap.org/${zoom}/${((x%n)+n)%n}/${y}.png`,x:x*256-left,y:y*256-top});
 return{tiles,center:{x:side/2,y:side/2},side};
}
function abortError(){return new DOMException('Permintaan peta dibatalkan.','AbortError');}
function loadTile(url,signal){
 if(signal?.aborted)return Promise.reject(abortError());
 if(tileCache.has(url))return Promise.resolve(tileCache.get(url));
 return new Promise((resolve,reject)=>{
  const image=new Image();image.crossOrigin='anonymous';let timer;
  const cleanup=()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);image.onload=image.onerror=null;};
  const abort=()=>{cleanup();image.src='';reject(abortError());};
  image.onload=()=>{cleanup();if(tileCache.size>=48)tileCache.delete(tileCache.keys().next().value);tileCache.set(url,image);resolve(image);};
  image.onerror=()=>{cleanup();reject(new Error('Peta belum dapat dimuat. Periksa internet, lalu coba lagi.'));};
  timer=setTimeout(()=>{cleanup();image.src='';reject(new Error('Peta terlalu lama merespons. Coba lagi.'));},15000);
  signal?.addEventListener('abort',abort,{once:true});image.src=url;
 });
}
function drawPin(ctx,x,y){
 ctx.save();ctx.translate(x,y);ctx.shadowColor='#0005';ctx.shadowBlur=4;ctx.shadowOffsetY=2;
 ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-7,-19,-28,-32,-28,-50);ctx.arc(0,-50,28,Math.PI,0);ctx.bezierCurveTo(28,-32,7,-19,0,0);ctx.closePath();
 const gradient=ctx.createLinearGradient(-20,-75,22,0);gradient.addColorStop(0,'#ef5146');gradient.addColorStop(1,'#c52b24');ctx.fillStyle=gradient;ctx.fill();ctx.shadowColor='transparent';ctx.strokeStyle='#b62823';ctx.lineWidth=1.4;ctx.stroke();ctx.beginPath();ctx.arc(0,-50,10,0,Math.PI*2);ctx.fillStyle='#a92420';ctx.fill();ctx.restore();
}
export async function createOsmMap(point,zoom=17,{signal}={}){
 if(!validate(point.lat,point.lon))throw new Error('Koordinat tidak valid.');
 if(Math.abs(point.lat)>85.05112878)throw new Error('Peta ini mendukung lintang antara −85,05 dan 85,05.');
 zoom=Math.max(2,Math.min(19,Math.round(zoom)));const plan=planTiles(point,zoom);
 const images=await Promise.all(plan.tiles.map(t=>loadTile(t.url,signal)));if(signal?.aborted)throw abortError();
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#e9eee7';ctx.fillRect(0,0,512,512);
 plan.tiles.forEach((t,i)=>ctx.drawImage(images[i],t.x,t.y,256,256));drawPin(ctx,256,256);
 // Fail before accepting the map if provider/browser CORS prevents photo export.
 ctx.getImageData(0,0,1,1);
 return{image:canvas,width:512,height:512,name:'Peta otomatis OpenStreetMap',kind:'osm',point:{...point},zoom,attribution:'© OpenStreetMap contributors · openstreetmap.org/copyright'};
}
