import {LABELS,DEFAULT_LINES,defaultStyle,restoreStyle,formatWita,outputSize,cleanFileName,render,textDetailCrop} from './renderer.js?v=1.6.0';
import {parseCoordinates,formatCoordinates,createOsmMap,createGoogleMap} from './maps.js?v=1.6.0';
const $=id=>document.getElementById(id);
const state={photo:null,map:null,lines:[formatWita(),...DEFAULT_LINES.slice(1)],visible:Array(7).fill(true),style:defaultStyle(),fit:'contain',exportPreset:'original'};
let bounds={},toastTimer,showOriginal=false,previewFrame=0,photoSequence=0,mapSequence=0,exporting=false,dragEnabled=!matchMedia('(max-width:760px)').matches;
let mapTimer,mapController,mapLoading=false,googleKeyVersion=0;
const canvas=$('preview'),ctx=canvas.getContext('2d');
const detailSource=document.createElement('canvas'),detailBackdrop=document.createElement('canvas');
detailBackdrop.width=detailBackdrop.height=1;
const detailBackgrounds={white:'#ffffff',gray:'#e5e7eb'};
const controlMap={'font-size':'fontSize','font-weight':'fontWeight','line-gap':'lineGap','font-family':'fontFamily','text-color':'color','text-position':'position','margin-x':'marginX','margin-y':'marginY','text-opacity':'opacity','text-shadow':'shadow','shadow-depth':'shadowDepth','shadow-side-color':'shadowSideColor','shadow-side-opacity':'shadowSideOpacity','shadow-opacity':'shadowOpacity','shadow-blur':'shadowBlur','shadow-offset-x':'shadowOffsetX','shadow-offset-y':'shadowOffsetY','background-opacity':'background','time-separator':'separator','map-enabled':'mapEnabled','map-size':'mapSize','map-shape':'mapShape','map-position':'mapPosition','map-opacity':'mapOpacity','map-border':'mapBorder'};
const shadowNumbers=['shadow-depth','shadow-side-opacity','shadow-opacity','shadow-blur','shadow-offset-x','shadow-offset-y'];
function notify(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4200);}

LABELS.forEach((label,i)=>{
 const field=document.createElement('div');field.className='field';
 const row=document.createElement('div');row.className='field-label';
 const name=document.createElement('label');name.htmlFor=`line-${i}`;
 const number=document.createElement('span');number.className='field-number';number.textContent=`0${i+1}`;
 name.append(number,document.createTextNode(label));
 const toggle=document.createElement('input');toggle.type='checkbox';toggle.checked=true;toggle.id=`visible-${i}`;toggle.setAttribute('aria-label',`Tampilkan ${label}`);
 const input=document.createElement('input');input.type='text';input.id=`line-${i}`;input.value=state.lines[i];input.autocomplete='off';input.maxLength=250;
 input.addEventListener('input',()=>{state.lines[i]=input.value;schedule();if(i===1){const point=parseCoordinates(input.value);if(point){$('map-coordinates').value=`${point.lat}, ${point.lon}`;queueMap();}}});toggle.addEventListener('change',()=>{state.visible[i]=toggle.checked;schedule();});
 row.append(name,toggle);field.append(row,input);$('timestamp-fields').append(field);
});
function sync(){
 state.lines.forEach((s,i)=>{$(`line-${i}`).value=s;$(`visible-${i}`).checked=state.visible[i];});
 for(const [id,key]of Object.entries(controlMap)){const el=$(id);if(el.type==='checkbox')el.checked=state.style[key];else el.value=state.style[key];}
 updateOutputs();schedule();
}
function updateOutputs(){
 $('font-size-value').textContent=state.style.fontSize+(state.style.fontSize===40?' · Medium':'');
 $('line-gap-value').textContent=state.style.lineGap;
 $('font-weight-value').textContent=state.style.fontWeight;
 $('shadow-blur-value').textContent=state.style.shadowBlur;
 $('shadow-offset-x-value').textContent=state.style.shadowOffsetX;
 $('shadow-offset-y-value').textContent=state.style.shadowOffsetY;
 $('shadow-opacity-value').textContent=state.style.shadowOpacity+'%';
 $('shadow-side-color-value').textContent=state.style.shadowSideColor.toUpperCase();
 $('side-color-swatch').setAttribute('aria-pressed',String(state.style.shadowSideColor.toLowerCase()==='#a6b2c0'));
 $('shadow-depth-value').textContent=state.style.shadowDepth;
 $('shadow-side-opacity-value').textContent=state.style.shadowSideOpacity+'%';
 $('shadow-controls').disabled=!state.style.shadow;

 for(const id of shadowNumbers){$(id).value=state.style[controlMap[id]];const number=$(id+'-number');if(document.activeElement!==number)number.value=state.style[controlMap[id]];}
 for(const [id,key]of [['text-opacity','opacity'],['background-opacity','background'],['map-size','mapSize'],['map-opacity','mapOpacity']])$(id+'-value').textContent=state.style[key]+'%';
 $('export-quality-value').textContent=$('export-quality').value+'%';
}
// Permit intermediate number input (empty or minus sign); commit a valid,
// clamped value on blur, and keep the slider in sync while typing.
for(const id of shadowNumbers){
 const number=$(id+'-number');
 const apply=()=>{
  if(number.value===''||!Number.isFinite(number.valueAsNumber))return;
  const value=Math.min(Number(number.max),Math.max(Number(number.min),number.valueAsNumber));
  const step=Number(number.step),min=Number(number.min);
  state.style[controlMap[id]]=Number((min+Math.round((value-min)/step)*step).toFixed(2));
  updateOutputs();schedule();
 };
 number.addEventListener('input',apply);
 number.addEventListener('blur',()=>{apply();number.value=state.style[controlMap[id]];});
}
for(const [id,key]of Object.entries(controlMap)){
 const el=$(id);el.addEventListener(el.type==='checkbox'||el.tagName==='SELECT'?'change':'input',()=>{
 state.style[key]=el.type==='checkbox'?el.checked:['range','number'].includes(el.type)?Math.min(Number(el.max)||100,Math.max(Number(el.min)||0,Number(el.value)||0)):el.value;
 if(id==='map-position'){state.style.mapX=0;state.style.mapY=0;}
 if(id==='map-enabled'){
  if(!el.checked){clearTimeout(mapTimer);mapController?.abort();++mapSequence;mapLoading=false;$('generate-map').removeAttribute('aria-busy');$('generate-map').querySelector('span').textContent='Buat peta';refreshDownloadAvailability();}
  else if(!state.map)queueMap();
 }
 updateOutputs();schedule();
 });
}
function dimensions(){return state.photo?outputSize(state.photo,state.exportPreset):{w:1200,h:1500};}
function draw(){
 const {w,h}=dimensions();const ratio=Math.min(1,2000/Math.max(w,h));
 canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
 bounds=render(ctx,state,w,h,canvas.width/w,showOriginal||!state.photo);
 const available=$('preview-stage').clientWidth-(matchMedia('(max-width:760px)').matches?32:48);
 const cap=matchMedia('(max-width:760px)').matches?Math.min(280,window.innerHeight*.32):650;
 const displayW=Math.min(available,cap*w/h);
 $('canvas-wrap').style.width=displayW+'px';
 $('resolution').textContent=state.photo?`${w.toLocaleString('id-ID')} × ${h.toLocaleString('id-ID')} px`:'Belum ada foto';
 $('download-size').textContent=state.photo?`${w} × ${h} px`:'Pilih foto terlebih dahulu';
 $('preview-status').textContent=bounds.text?.shrunk?'Teks disesuaikan agar utuh':state.photo?(dragEnabled?'Geser teks atau peta':'Pratinjau hasil'):'Perubahan langsung';
 canvas.classList.toggle('editable',!!state.photo&&dragEnabled);
 drawTextDetail(w,h);
}
function drawTextDetail(w,h){
 if(!$('text-detail').open)return;
 const detail=$('detail-canvas'),select=$('detail-line'),rows=bounds.textRows||[];
 if(!state.photo||!rows.length){
  detail.width=detail.height=detailSource.width=detailSource.height=1;$('detail-viewport').hidden=true;select.disabled=true;
  select.replaceChildren(new Option('Belum ada teks',''));
  $('detail-status').textContent=!state.photo?'Unggah foto atau coba kanvas contoh untuk memeriksa bayangan.':showOriginal?'Kembali ke hasil edit untuk memeriksa bayangan.':'Aktifkan setidaknya satu baris teks untuk melihat detail.';
  return;
 }
 const selected=select.value;
 const rowKeys=rows.map(r=>String(r.index)).join(',');
 if([...select.options].map(o=>o.value).join(',')!==rowKeys){select.replaceChildren(...rows.map(r=>new Option(LABELS[r.index],r.index)));if(rows.some(r=>String(r.index)===selected))select.value=selected;}
 select.disabled=false;
 const row=rows.find(r=>String(r.index)===select.value)||rows[0];
 const crop=textDetailCrop(row,w,h,state.style);
 detail.width=crop.w;detail.height=crop.h;
 // Use a separate scene for the inspection background; export keeps state.photo.
 const background=$('detail-background').value,color=detailBackgrounds[background];
 let detailScene=state;
 if(color){
  const backdropContext=detailBackdrop.getContext('2d');backdropContext.fillStyle=color;backdropContext.fillRect(0,0,1,1);
  // A solid photo at the output aspect ratio fills the entire detail, including contain bars.
  detailScene={...state,photo:{image:detailBackdrop,width:w,height:h},map:null};
 }
 // Render at export resolution before taking a 1:1 crop to keep text and shadow sizes exact.
 if(detailSource.width!==w||detailSource.height!==h){detailSource.width=w;detailSource.height=h;}
 render(detailSource.getContext('2d'),detailScene,w,h,1,false);
 detail.getContext('2d').drawImage(detailSource,crop.x,crop.y,crop.w,crop.h,0,0,crop.w,crop.h);
 detail.dataset.x=crop.x;detail.dataset.y=crop.y;
 $('detail-viewport').hidden=false;$('detail-viewport').style.backgroundColor=color||'#171e1b';
 $('detail-status').textContent=`${crop.w} × ${crop.h} px · ${color?$('detail-background').selectedOptions[0].textContent+' · Khusus pratinjau':'Detail pada resolusi unduhan'}${state.style.shadow?'':' · Bayangan dimatikan'}`;
}
$('side-color-swatch').addEventListener('click',()=>{state.style.shadowSideColor='#a6b2c0';$('shadow-side-color').value='#a6b2c0';updateOutputs();schedule();});
$('text-detail').addEventListener('toggle',()=>{if($('text-detail').open)schedule();else $('detail-canvas').width=$('detail-canvas').height=detailSource.width=detailSource.height=1;});
$('detail-line').addEventListener('change',()=>{$('detail-viewport').scrollLeft=0;schedule();});
$('detail-background').addEventListener('change',schedule);
function schedule(){cancelAnimationFrame(previewFrame);previewFrame=requestAnimationFrame(draw);}
new ResizeObserver(schedule).observe($('preview-stage'));
function releasePhoto(p){if(p?.image?.close)p.image.close();if(p?.url)URL.revokeObjectURL(p.url);}
async function decodeFile(file){
 if(!file||!/^image\/(jpeg|png|webp)$/.test(file.type))throw new Error('Pilih gambar JPG, PNG, atau WebP yang valid.');
 if(file.size>100*1024*1024)throw new Error('Ukuran berkas maksimum 100 MB.');
 const url=URL.createObjectURL(file);const image=new Image();image.src=url;
 try{await image.decode();if(!image.naturalWidth||!image.naturalHeight)throw new Error();return{image,url,width:image.naturalWidth,height:image.naturalHeight,name:file.name};}catch{URL.revokeObjectURL(url);throw new Error('Gambar tidak dapat dibaca. Coba simpan ulang sebagai JPG atau PNG.');}
}
async function uploadPhoto(file){
 if(!file)return;const seq=++photoSequence;
 try{const photo=await decodeFile(file);if(seq!==photoSequence){releasePhoto(photo);return;}releasePhoto(state.photo);state.photo=photo;setPhotoUI(false);notify('Foto siap. Sesuaikan timestamp Anda.');}catch(e){notify(e.message);}
}
function setPhotoUI(demo){
 $('photo-label').textContent=demo?'Ganti dengan foto Anda':state.photo.name;
 $('photo-info').hidden=false;$('photo-info').textContent=`${state.photo.width} × ${state.photo.height} px · ${demo?'Kanvas contoh':'Foto asli tidak diubah'}`;
 $('empty-state').hidden=true;$('demo-label').hidden=!demo;canvas.classList.add('editable');
 refreshDownloadAvailability();$('compare').disabled=false;showOriginal=false;$('compare').setAttribute('aria-pressed','false');$('compare').textContent='Lihat foto asli';schedule();
}
async function uploadMap(file){if(!file)return;clearTimeout(mapTimer);mapController?.abort();mapLoading=false;resetMapButton();const seq=++mapSequence;try{const map=await decodeFile(file);if(seq!==mapSequence){releasePhoto(map);return;}releasePhoto(state.map);state.map=map;state.style.mapEnabled=true;state.style.mapX=state.style.mapY=0;$('map-enabled').checked=true;$('map-label').textContent=file.name;$('remove-map').disabled=false;$('map-empty-note').textContent='Geser peta di pratinjau untuk memindahkannya.';$('map-thumbnail-wrap').hidden=true;$('map-status').classList.remove('error');$('map-status').textContent='Menggunakan gambar unggahan Anda.';schedule();notify('Gambar peta ditambahkan.');}catch(e){notify(e.message);}finally{refreshDownloadAvailability();}}
$('photo-input').addEventListener('change',e=>{uploadPhoto(e.target.files[0]);e.target.value='';});
$('map-input').addEventListener('change',e=>{uploadMap(e.target.files[0]);e.target.value='';});
for(const event of ['dragenter','dragover'])$('photo-drop').addEventListener(event,e=>{e.preventDefault();$('photo-drop').classList.add('dragging');});
for(const event of ['dragleave','drop'])$('photo-drop').addEventListener(event,e=>{e.preventDefault();$('photo-drop').classList.remove('dragging');if(event==='drop')uploadPhoto(e.dataTransfer.files[0]);});
$('remove-map').addEventListener('click',()=>{++mapSequence;clearTimeout(mapTimer);mapController?.abort();mapLoading=false;resetMapButton();releasePhoto(state.map);state.map=null;$('map-label').textContent='Unggah gambar peta';$('remove-map').disabled=true;$('map-thumbnail-wrap').hidden=true;$('map-status').classList.remove('error');$('map-status').textContent='Peta dihapus. Tempel koordinat atau unggah gambar baru.';refreshDownloadAvailability();schedule();});
$('time-now').addEventListener('click',()=>{state.lines[0]=formatWita(new Date(),state.style.separator);$('line-0').value=state.lines[0];schedule();notify('Waktu diperbarui ke WITA.');});
$('compare').addEventListener('click',()=>{showOriginal=!showOriginal;$('compare').textContent=showOriginal?'Kembali ke hasil edit':'Lihat foto asli';$('compare').setAttribute('aria-pressed',String(showOriginal));schedule();});
$('export-size').addEventListener('change',()=>{state.exportPreset=$('export-size').value;$('fit-options').hidden=state.exportPreset==='original';schedule();});
$('export-fit').addEventListener('change',()=>{state.fit=$('export-fit').value;schedule();});
$('export-format').addEventListener('change',()=>{const png=$('export-format').value==='png';$('export-quality').hidden=png;document.querySelector('.quality-label').hidden=png;});
$('export-quality').addEventListener('input',updateOutputs);
$('font-input').addEventListener('change',async e=>{
 const f=e.target.files[0];if(!f)return;
 try{if(f.size>10*1024*1024)throw new Error('Ukuran font maksimum 10 MB.');const face=new FontFace('UploadedTimestamp',await f.arrayBuffer());await face.load();for(const old of document.fonts)if(old.family==='UploadedTimestamp')document.fonts.delete(old);document.fonts.add(face);$('font-family').querySelector('[value=custom]').disabled=false;state.style.fontFamily='custom';$('font-note').textContent=f.name;sync();notify('Font siap digunakan.');}catch{notify('Font tidak dapat dibaca. Gunakan berkas TTF, OTF, atau WOFF yang valid.');}finally{e.target.value='';}
});
$('save-preset').addEventListener('click',()=>{try{localStorage.setItem('timestamp-studio-preset-v1',JSON.stringify({version:1,style:state.style,lines:state.lines,visible:state.visible}));notify('Pengaturan tersimpan di browser ini. Foto dan peta tidak ikut disimpan.');}catch{notify('Browser tidak mengizinkan penyimpanan pengaturan.');}});
$('load-preset').addEventListener('click',()=>{try{const data=JSON.parse(localStorage.getItem('timestamp-studio-preset-v1'));if(!data||data.version!==1||!Array.isArray(data.lines)||data.lines.length!==7)throw new Error();state.style=restoreStyle(data.style);state.lines=data.lines.map(x=>String(x).slice(0,250));state.visible=data.visible?.length===7?data.visible.map(Boolean):Array(7).fill(true);if(state.style.fontFamily==='custom'&&![...document.fonts].some(f=>f.family==='UploadedTimestamp'&&f.status==='loaded')){state.style.fontFamily='camera';notify('Pengaturan dimuat. Unggah kembali font kustom Anda.');}else notify('Pengaturan dimuat.');sync();}catch{notify('Belum ada pengaturan tersimpan di browser ini.');}});
$('reset').addEventListener('click',()=>{state.style=defaultStyle();state.visible=Array(7).fill(true);sync();notify('Tampilan direset. Foto, peta, dan isi teks tetap dipertahankan.');});

document.querySelectorAll('[data-download]').forEach(b=>b.addEventListener('click',async()=>{
 if(!state.photo||exporting||mapLoading)return;exporting=true;
 const buttons=[...document.querySelectorAll('[data-download]')];buttons.forEach(b=>b.disabled=true);
 try{
  await document.fonts.load(`${state.style.fontWeight||380} 32px CameraRoboto`);await document.fonts.ready;const {w,h}=dimensions();const target=document.createElement('canvas');target.width=w;target.height=h;const context=target.getContext('2d');if(!context)throw new Error('Memori tidak cukup untuk menyiapkan foto.');
  render(context,state,w,h,1,false);
  const format=$('export-format').value;
  const blob=await new Promise(resolve=>target.toBlob(resolve,'image/'+format,Number($('export-quality').value)/100));target.width=target.height=1;
  if(!blob)throw new Error('Gagal mengekspor gambar. Coba resolusi 2448 × 3264.');
  const a=document.createElement('a'),url=URL.createObjectURL(blob),stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Makassar',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date()).replace(/\D/g,'');
  a.href=url;a.download=`${cleanFileName(state.photo.name)}_timestamp_${stamp}.${format==='jpeg'?'jpg':'png'}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);notify('Foto selesai dibuat. Unduhan telah dimulai.');
 }catch(e){notify(e.message||'Gagal mengunduh. Coba kembali dengan ukuran foto lebih kecil.');}finally{exporting=false;refreshDownloadAvailability();}
}));

let drag=null;
canvas.addEventListener('pointerdown',e=>{
 if(!state.photo||showOriginal||!dragEnabled)return;const r=canvas.getBoundingClientRect(),{w,h}=dimensions();const x=(e.clientX-r.left)/r.width*w,y=(e.clientY-r.top)/r.height*h;
 const inside=b=>b&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h;
 const type=inside(bounds.text)?'text':inside(bounds.map)?'map':null;if(!type)return;
 drag={type,x:e.clientX,y:e.clientY,mx:type==='text'?state.style.marginX:state.style.mapX,my:type==='text'?state.style.marginY:state.style.mapY};canvas.setPointerCapture(e.pointerId);e.preventDefault();
});
canvas.addEventListener('pointermove',e=>{
 if(!drag)return;const r=canvas.getBoundingClientRect(),s=state.style,pos=drag.type==='text'?s.position:s.mapPosition;
 const x=drag.mx+(e.clientX-drag.x)/r.width*100*(pos.endsWith('r')?-1:1),y=drag.my+(e.clientY-drag.y)/r.height*100*(pos.startsWith('b')?-1:1);
 if(drag.type==='text'){s.marginX=+Math.max(0,Math.min(40,x)).toFixed(1);s.marginY=+Math.max(0,Math.min(40,y)).toFixed(1);$('margin-x').value=s.marginX;$('margin-y').value=s.marginY;}else{s.mapX=Math.max(0,Math.min(90,x));s.mapY=Math.max(0,Math.min(90,y));}schedule();
});
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>drag=null);
$('demo').addEventListener('click',async()=>{
 ++photoSequence;const demo=document.createElement('canvas');demo.width=1536;demo.height=2048;const d=demo.getContext('2d');
 const g=d.createLinearGradient(0,0,1536,2048);g.addColorStop(0,'#30443a');g.addColorStop(.55,'#17261f');g.addColorStop(1,'#0f1712');d.fillStyle=g;d.fillRect(0,0,1536,2048);
 const glow=d.createRadialGradient(450,300,10,650,600,1400);glow.addColorStop(0,'#5c735d55');glow.addColorStop(1,'#111a1200');d.fillStyle=glow;d.fillRect(0,0,1536,2048);
 d.strokeStyle='#80916c15';d.lineWidth=1;for(let x=-2048;x<1536;x+=28){d.beginPath();d.moveTo(x,0);d.lineTo(x+2048,2048);d.stroke();}
 const image=new Image();image.src=demo.toDataURL('image/png');await image.decode();releasePhoto(state.photo);state.photo={image,width:1536,height:2048,name:'kanvas_contoh.png'};setPhotoUI(true);notify('Kanvas contoh aktif. Unggah foto Anda kapan saja.');
});
$('drag-mode').addEventListener('click',()=>{dragEnabled=!dragEnabled;$('drag-mode').setAttribute('aria-pressed',String(dragEnabled));$('drag-mode').textContent=dragEnabled?'Selesai geser':'Geser objek';schedule();});
function refreshDownloadAvailability(){document.querySelectorAll('[data-download]').forEach(b=>b.disabled=!state.photo||exporting||mapLoading);}
function resetMapButton(){$('generate-map').removeAttribute('aria-busy');$('generate-map').querySelector('span').textContent='Buat peta';}
function mapMatches(point,zoom){return point&&state.map?.kind===$('map-provider').value&&state.map.point.lat===point.lat&&state.map.point.lon===point.lon&&state.map.zoom===zoom&&(state.map.kind!=='google'||state.map.keyVersion===googleKeyVersion);}
function mapProviderUI(){const google=$('map-provider').value==='google';$('google-map-settings').hidden=!google;$('map-privacy').textContent=`Koordinat digunakan untuk meminta peta ke ${google?'Google Maps':'OpenStreetMap'}. Foto tetap di perangkat Anda.`;}
function queueMap(){
 clearTimeout(mapTimer);const point=parseCoordinates($('map-coordinates').value),zoom=+$('map-zoom').value;
 $('map-status').classList.remove('error');
 if(mapMatches(point,zoom))return;
 ++mapSequence;mapController?.abort();mapLoading=false;$('generate-map').removeAttribute('aria-busy');$('generate-map').querySelector('span').textContent='Buat peta';
 if(state.map?.kind){releasePhoto(state.map);state.map=null;$('map-thumbnail-wrap').hidden=true;$('remove-map').disabled=true;}
 const needsKey=$('map-provider').value==='google'&&!$('google-api-key').value.trim();
 if(needsKey)$('map-status').textContent='Google Maps · masukkan API key, atau unggah gambar Google Maps.';
 else if($('auto-map').checked&&$('map-enabled').checked&&point){mapLoading=true;$('map-status').textContent='Menyiapkan peta…';mapTimer=setTimeout(()=>generateMap(),900);}
 else if(!point)$('map-status').textContent='Tempel koordinat lengkap, misalnya pasangan lintang dan bujur.';
 else $('map-status').textContent='Klik Buat peta untuk menggunakan koordinat ini.';
 refreshDownloadAvailability();schedule();
}
async function generateMap(){
 clearTimeout(mapTimer);const point=parseCoordinates($('map-coordinates').value);
 if(!point){$('map-status').textContent='Tempel pasangan lintang, bujur yang valid. Tautan pendek Google Maps perlu dibuka dahulu untuk menyalin koordinatnya.';return;}
 const zoom=+$('map-zoom').value;
 if(mapMatches(point,zoom)){$('map-status').textContent='Peta sudah sesuai dengan koordinat ini.';return;}
 const google=$('map-provider').value==='google';
 if(google&&!$('google-api-key').value.trim()){$('map-status').textContent='Masukkan API key Google Maps, atau unggah gambar Google Maps Anda.';return;}
 mapController?.abort();mapController=new AbortController();const seq=++mapSequence;mapLoading=true;
 releasePhoto(state.map);state.map=null;$('map-thumbnail-wrap').hidden=true;$('remove-map').disabled=true;$('map-label').textContent='Unggah gambar peta';
 $('generate-map').setAttribute('aria-busy','true');$('generate-map').querySelector('span').textContent='Memuat peta…';$('map-status').classList.remove('error');$('map-status').textContent=`Mengambil peta ${google?'Google Maps':'OpenStreetMap'}…`;
 state.lines[1]=formatCoordinates(point);$('line-1').value=state.lines[1];refreshDownloadAvailability();schedule();
 try{
  const map=await (google?createGoogleMap(point,zoom,{apiKey:$('google-api-key').value,signal:mapController.signal}):createOsmMap(point,zoom,{signal:mapController.signal}));if(seq!==mapSequence)return;
  map.keyVersion=googleKeyVersion;
  state.map=map;state.style.mapEnabled=true;state.style.mapShape='square';state.style.mapX=state.style.mapY=0;$('map-enabled').checked=true;$('map-shape').value='square';
  $('map-thumbnail').src=map.image.toDataURL('image/png');$('map-thumbnail-wrap').hidden=false;$('remove-map').disabled=false;
  const credit=$('map-attribution');credit.href=google?'https://maps.google.com/':'https://www.openstreetmap.org/copyright';credit.textContent=google?`Google Maps · ${map.attribution}`:'© OpenStreetMap contributors';
  $('map-status').textContent=`Peta ${google?'Google Maps':'OpenStreetMap'} siap · pin merah pada koordinat yang ditempel.`;$('map-empty-note').textContent='Nama penyedia dan atribusi peta ikut disimpan pada hasil foto.';schedule();
 }catch(e){if(seq===mapSequence&&e.name!=='AbortError'){$('map-status').textContent=e.message||'Peta tidak dapat dimuat. Coba lagi atau unggah gambar.';$('map-status').classList.add('error');}}
 finally{if(seq===mapSequence){mapLoading=false;$('generate-map').removeAttribute('aria-busy');$('generate-map').querySelector('span').textContent='Buat peta';refreshDownloadAvailability();}}
}
$('map-coordinates').addEventListener('input',()=>{$('map-status').classList.remove('error');queueMap();});
$('map-coordinates').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();generateMap();}});
$('auto-map').addEventListener('change',queueMap);
$('map-zoom').addEventListener('input',()=>$('map-zoom-value').textContent=$('map-zoom').value);
$('map-zoom').addEventListener('change',queueMap);
$('generate-map').addEventListener('click',generateMap);
$('map-provider').addEventListener('change',()=>{mapProviderUI();queueMap();});
$('google-api-key').addEventListener('input',()=>{++googleKeyVersion;queueMap();});
$('google-api-key').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.target.blur();generateMap();}});
document.body.dataset.mobileTab='photo';
for(const button of document.querySelectorAll('[data-tab]'))button.addEventListener('click',()=>{document.body.dataset.mobileTab=button.dataset.tab;for(const b of document.querySelectorAll('[data-tab]')){b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));}window.scrollTo({top:0,behavior:'instant'});});
mapProviderUI();sync();document.fonts.load('380 32px CameraRoboto').then(schedule);document.fonts.ready.then(schedule);
