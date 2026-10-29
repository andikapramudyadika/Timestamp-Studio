import {LABELS,DEFAULT_LINES,defaultStyle,normalizeHex,restoreStyle,formatWita,outputSize,cleanFileName,render,textDetailCrop} from './renderer.js?v=1.7.1';
import {parseCoordinates,shortMapsLink,formatCoordinates,createOsmMap,createGoogleMap} from './maps.js?v=1.7.1';
import {lookupAddress,districtName,getDeviceLocation} from './location.js?v=1.7.1';
import {readLocations,saveLocation,deleteLocation,presetName} from './location-presets.js?v=1.7.1';
import {cropRect,detectMapCrop,extractMap} from './map-crop.js?v=1.7.1';
const $=id=>document.getElementById(id);
const state={photo:null,map:null,lines:[formatWita(),...DEFAULT_LINES.slice(1)],visible:Array(7).fill(true),style:defaultStyle(),fit:'contain',exportPreset:'original'};
state.lines[5]='Kota Kendari';state.lines[6]='Sulawesi Tenggara';
let bounds={},toastTimer,showOriginal=false,previewFrame=0,photoSequence=0,mapSequence=0,exporting=false,dragEnabled=!matchMedia('(max-width:760px)').matches;
let mapTimer,mapController,mapLoading=false,googleKeyVersion=0;
const canvas=$('preview'),ctx=canvas.getContext('2d');
const detailSource=document.createElement('canvas'),detailBackdrop=document.createElement('canvas');
detailBackdrop.width=detailBackdrop.height=1;
const detailBackgrounds={white:'#ffffff',gray:'#e5e7eb'};
const controlMap={'font-size':'fontSize','font-weight':'fontWeight','line-gap':'lineGap','font-family':'fontFamily','text-color':'color','text-position':'position','margin-x':'marginX','margin-y':'marginY','text-opacity':'opacity' ,'background-opacity':'background','time-separator':'separator','map-enabled':'mapEnabled','map-size':'mapSize','map-shape':'mapShape','map-position':'mapPosition','map-opacity':'mapOpacity','map-border':'mapBorder'};
let locationTimer,locationController,locationSequence=0,lastLocation='',mapSource=null,cropFrame=0,detailTimer;
const fieldRevisions=Array(7).fill(0);
function notify(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4200);}

function cancelLocation(){
 clearTimeout(locationTimer);locationTimer=null;locationController?.abort();++locationSequence;
 $('fill-location').disabled=false;
 $('fill-location').removeAttribute('aria-busy');$('fill-location').querySelector('span').textContent='Isi alamat & waktu';
 $('device-location').disabled=false;$('device-location').removeAttribute('aria-busy');$('device-location').querySelector('span').textContent='Gunakan lokasi perangkat';
}
function locationInputStatus(){
 const value=$('map-coordinates').value.trim(),short=shortMapsLink(value),link=$('open-maps-link');
 link.hidden=!short;if(short)link.href=short;
 if(short){$('location-status').textContent='Buka tautan pendek, lalu salin URL lengkap dari bilah alamat Google Maps atau koordinat titiknya.';return null;}
 const point=parseCoordinates(value);
 if(!point){$('location-status').textContent=value?'Masukkan pasangan lintang, bujur yang valid atau URL Google Maps dengan koordinat.':'Tempel link atau koordinat. Semua detail tetap bisa diedit manual.';return null;}
 return point;
}
function queueLocation(){
 cancelLocation();const point=locationInputStatus();$('location-status').classList.remove('error');
 if(!point)return;
 if(!$('auto-location').checked){$('location-status').textContent='Pengisian otomatis dimatikan. Tekan Isi alamat & waktu atau edit manual.';return;}
 const key=`${point.lat},${point.lon}`;if(key===lastLocation)return;
 const revisions=[...fieldRevisions];$('location-status').textContent='Menyiapkan detail lokasi…';
 locationTimer=setTimeout(()=>fillLocation(false,revisions),1000);
}
async function fillLocation(force=false,revisions=[...fieldRevisions],accuracy=null){
 cancelLocation();const point=locationInputStatus();if(!point)return;
 const key=`${point.lat},${point.lon}`;if(!force&&lastLocation===key)return;
 const seq=locationSequence,controller=new AbortController();locationController=controller;
 $('fill-location').disabled=true;
 const assign=(i,value)=>{if(fieldRevisions[i]===revisions[i]){state.lines[i]=value;$(`line-${i}`).value=value;}};
 assign(0,formatWita(new Date(),state.style.separator));assign(1,formatCoordinates(point));schedule();
 $('fill-location').setAttribute('aria-busy','true');$('fill-location').querySelector('span').textContent='Mencari alamat…';
 const accuracyNote=accuracy===null?'':` Akurasi lokasi perangkat ±${accuracy} m.`;
 $('location-status').classList.remove('error');$('location-status').textContent='Mengambil alamat untuk titik ini… Anda tetap bisa mengedit teks.'+accuracyNote;
 try{
  const result=await lookupAddress(point,{signal:controller.signal});if(seq!==locationSequence)return;
  let missing=0,retained=0;
  for(const [index,value]of Object.entries(result)){const i=Number(index);if(!value)missing++;if(fieldRevisions[i]!==revisions[i])retained++;assign(i,value);}
  lastLocation=key;
  $('location-status').textContent=missing?'Lokasi & waktu terisi. Beberapa detail alamat belum tersedia; lengkapi manual.':'Alamat & waktu WITA terisi. Ketuk kolom mana pun untuk mengedit.';
  if(retained)$('location-status').textContent+=' Perubahan manual Anda dipertahankan.';
  $('location-status').textContent+=accuracyNote;
  schedule();
 }catch(e){if(seq===locationSequence&&e.name!=='AbortError'){$('location-status').classList.add('error');$('location-status').textContent=(e.message||'Pencarian alamat gagal.')+' Koordinat dan waktu diperbarui jika belum diedit; periksa alamat sebelumnya atau isi manual.'+accuracyNote;}}
 finally{if(seq===locationSequence){$('fill-location').disabled=false;$('fill-location').removeAttribute('aria-busy');$('fill-location').querySelector('span').textContent='Isi alamat & waktu';}}
}

async function fillDeviceLocation(){
 cancelLocation();const seq=locationSequence,revisions=[...fieldRevisions],controller=new AbortController();locationController=controller;
 $('device-location').disabled=true;$('device-location').setAttribute('aria-busy','true');$('device-location').querySelector('span').textContent='Mengambil lokasi…';$('fill-location').disabled=true;
 $('location-status').classList.remove('error');$('location-status').textContent='Izinkan akses lokasi jika diminta. Mengambil posisi perangkat…';
 try{
  const point=await getDeviceLocation({signal:controller.signal});if(seq!==locationSequence)return;
  $('map-coordinates').value=`${point.lat}, ${point.lon}`;
  queueMap();await fillLocation(true,revisions,point.accuracy);
 }catch(error){if(seq===locationSequence&&error.name!=='AbortError'){$('location-status').classList.add('error');$('location-status').textContent=error.message;}}
 finally{if(seq===locationSequence)cancelLocation();}
}

LABELS.forEach((label,i)=>{
 const field=document.createElement('div');field.className='field';
 const row=document.createElement('div');row.className='field-label';
 const name=document.createElement('label');name.htmlFor=`line-${i}`;
 const number=document.createElement('span');number.className='field-number';number.textContent=`0${i+1}`;
 name.append(number,document.createTextNode(label));
 const toggle=document.createElement('input');toggle.type='checkbox';toggle.checked=true;toggle.id=`visible-${i}`;toggle.setAttribute('aria-label',`Tampilkan ${label}`);
 const input=document.createElement('input');input.type='text';input.id=`line-${i}`;input.value=state.lines[i];input.placeholder=label;input.autocomplete='off';input.maxLength=250;
 input.addEventListener('input',()=>{fieldRevisions[i]++;state.lines[i]=input.value;schedule();if(i===1){cancelLocation();lastLocation='';$('location-status').classList.remove('error');$('location-status').textContent='Koordinat detail diedit manual. Alamat dan sumber lokasi tidak berubah.';}});toggle.addEventListener('change',()=>{state.visible[i]=toggle.checked;schedule();});
 if(i===4)input.addEventListener('blur',()=>{const value=districtName(input.value);if(value!==input.value){fieldRevisions[i]++;state.lines[i]=input.value=value;schedule();}});
 row.append(name,toggle);field.append(row);
 if(i===0){const actions=document.createElement('div');actions.className='quick-actions time-sync';const button=document.createElement('button');button.id='time-now';button.className='text-button';button.textContent='↻ Sync hari, tanggal & waktu';button.setAttribute('aria-label','Sinkronkan hari, tanggal dan waktu ke WITA sekarang');const zone=document.createElement('span');zone.textContent='WITA';actions.append(button,zone);field.append(actions);}
 if(i===1)input.setAttribute('aria-describedby','manual-coordinate-note');
 field.append(input);
 if(i===1){const note=document.createElement('p');note.id='manual-coordinate-note';note.className='hint';note.textContent='Edit teks koordinat di sini tanpa mengubah alamat. Untuk mencari alamat, gunakan isian Link Google Maps atau koordinat di atas.';field.append(note);}
 $('timestamp-fields').append(field);
});

function locationPresetStatus(message,error=false){$('location-preset-status').textContent=message;$('location-preset-status').classList.toggle('error',error);}
function refreshLocationPresets(selected=$('location-preset-select').value){
 try{
  const locations=readLocations(localStorage),select=$('location-preset-select');select.replaceChildren(new Option(locations.length?'Pilih lokasi tersimpan':'Belum ada preset lokasi',''));
  for(const item of locations)select.add(new Option(item.name,item.id));
  select.disabled=!locations.length;select.value=locations.some(item=>item.id===selected)?selected:'';
  $('apply-location-preset').disabled=$('delete-location-preset').disabled=!select.value;
  const name=presetName($('location-preset-name').value).toLocaleLowerCase('id');
  $('save-location-preset').querySelector('span').textContent=locations.some(item=>item.name.toLocaleLowerCase('id')===name)?'Perbarui lokasi tersimpan':'Simpan lokasi saat ini';
 }catch{locationPresetStatus('Preset lokasi tidak dapat dibaca atau penyimpanan browser diblokir. Data lama tetap dipertahankan.',true);$('location-preset-select').disabled=$('apply-location-preset').disabled=$('delete-location-preset').disabled=true;}
}
$('location-preset-name').addEventListener('input',()=>{refreshLocationPresets();$('location-preset-name').removeAttribute('aria-invalid');});
$('location-preset-name').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();$('save-location-preset').click();}});
$('location-preset-select').addEventListener('change',()=>{
 try{const item=readLocations(localStorage).find(item=>item.id===$('location-preset-select').value);$('location-preset-name').value=item?.name||'';refreshLocationPresets();locationPresetStatus(item?'Tekan Gunakan untuk memuat, atau Perbarui untuk menyimpan detail saat ini dengan nama ini.':'Pilih lokasi atau beri nama untuk menyimpan lokasi baru.');}catch{locationPresetStatus('Preset lokasi belum dapat dibaca.',true);}
});
$('save-location-preset').addEventListener('click',()=>{
 if(!presetName($('location-preset-name').value)){$('location-preset-name').setAttribute('aria-invalid','true');$('location-preset-name').focus();locationPresetStatus('Beri nama lokasi terlebih dahulu.',true);return;}
 if(locationTimer||$('fill-location').hasAttribute('aria-busy')||$('device-location').hasAttribute('aria-busy')){locationPresetStatus('Tunggu pencarian lokasi selesai sebelum menyimpan preset.',true);return;}
 try{const result=saveLocation(localStorage,{name:$('location-preset-name').value,lines:state.lines.slice(1),source:$('map-coordinates').value});refreshLocationPresets(result.id);locationPresetStatus(result.updated?'Preset lokasi diperbarui.':'Preset lokasi tersimpan di browser ini.');}
 catch(error){locationPresetStatus(error.message.includes('preset')||error.message.includes('lokasi')?error.message:'Lokasi gagal disimpan. Penyimpanan browser mungkin penuh atau diblokir.',true);}
});
$('apply-location-preset').addEventListener('click',()=>{
 try{
  const item=readLocations(localStorage).find(item=>item.id===$('location-preset-select').value);if(!item)throw new Error();
  cancelLocation();lastLocation='';fieldRevisions.forEach((_,i)=>fieldRevisions[i]++);
  state.lines.splice(1,6,...item.lines);$('map-coordinates').value=item.source;locationInputStatus();queueMap();sync();
  $('location-status').classList.remove('error');$('location-status').textContent=`Preset ${item.name} digunakan. Alamat tersimpan dimuat tanpa pencarian ulang; waktu tetap dipertahankan.`;
  locationPresetStatus('Lokasi dimuat. Gunakan Sync hari, tanggal & waktu bila diperlukan.');
 }catch{refreshLocationPresets();locationPresetStatus('Preset lokasi belum dapat dimuat. Pilih kembali lokasi tersimpan.',true);}
});
$('delete-location-preset').addEventListener('click',()=>{
 try{deleteLocation(localStorage,$('location-preset-select').value);$('location-preset-name').value='';refreshLocationPresets('');locationPresetStatus('Preset lokasi dihapus. Detail timestamp saat ini tetap dipertahankan.');}
 catch{locationPresetStatus('Preset belum dapat dihapus. Penyimpanan browser mungkin diblokir.',true);}
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
 for(const [id,key] of [['text-color-hex','color']]){if(document.activeElement!==$(id)){$(id).value=state.style[key].toUpperCase();}}
 for(const [id,key]of [['text-opacity','opacity'],['background-opacity','background'],['map-size','mapSize'],['map-opacity','mapOpacity']])$(id+'-value').textContent=state.style[key]+'%';
 $('export-quality-value').textContent=$('export-quality').value+'%';
}
// HEX edits are committed only when complete; incomplete/invalid text never
// reaches Canvas or saved settings. The picker and swatch use the same state.
for(const [id,picker,key] of [['text-color-hex','text-color','color']]){
 const input=$(id),error=$(id+'-error');
 const apply=()=>{
  const color=normalizeHex(input.value);
  if(!color)return false;
  state.style[key]=color;$(picker).value=color;input.removeAttribute('aria-invalid');error.hidden=true;updateOutputs();schedule();return true;
 };
 input.addEventListener('input',()=>{if(!apply()){input.removeAttribute('aria-invalid');error.hidden=true;}});
 input.addEventListener('blur',()=>{if(apply())input.value=state.style[key].toUpperCase();else{input.setAttribute('aria-invalid','true');error.textContent='Gunakan HEX 3 atau 6 digit, misalnya #929292.';error.hidden=false;}});
 input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();input.blur();}});
 $(picker).addEventListener('input',()=>{input.value=state.style[key].toUpperCase();input.removeAttribute('aria-invalid');error.hidden=true;});
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
 const {w,h}=dimensions();const ratio=Math.min(1,Math.max(760,Math.min(1600,$('preview-stage').clientWidth*devicePixelRatio))/Math.max(w,h));
 const cw=Math.round(w*ratio),ch=Math.round(h*ratio);if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
 bounds=render(ctx,state,w,h,canvas.width/w,showOriginal||!state.photo);
 const mobile=matchMedia('(max-width:760px)').matches;
 const available=$('preview-stage').clientWidth-(mobile?24:48);
 const viewportHeight=window.visualViewport?.height||window.innerHeight;
 const cap=mobile?Math.min(document.body.dataset.mobileTab==='photo'?360:235,viewportHeight*(document.body.dataset.mobileTab==='photo'?.43:.28)):Math.max(240,Math.min(630,window.innerHeight-390));
 const displayW=Math.min(available,cap*w/h);
 $('canvas-wrap').style.width=displayW+'px';
 $('resolution').textContent=state.photo?`${w.toLocaleString('id-ID')} × ${h.toLocaleString('id-ID')} px`:'Belum ada foto';
 $('download-size').textContent=state.photo?`${w} × ${h} px`:'Pilih foto terlebih dahulu';
 $('preview-status').textContent=bounds.text?.shrunk?'Teks disesuaikan agar utuh':state.photo?(dragEnabled?'Geser teks atau peta':'Pratinjau hasil'):'Perubahan langsung';
 canvas.classList.toggle('editable',!!state.photo&&dragEnabled);
 clearTimeout(detailTimer);if($('text-detail').open)detailTimer=setTimeout(()=>drawTextDetail(w,h),140);
}
function drawTextDetail(w,h){
 if(!$('text-detail').open||document.body.dataset.mobileTab!=='text')return;
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
$('text-detail').addEventListener('toggle',()=>{if($('text-detail').open)schedule();else $('detail-canvas').width=$('detail-canvas').height=detailSource.width=detailSource.height=1;});
$('detail-line').addEventListener('change',()=>{$('detail-viewport').scrollLeft=0;schedule();});
$('detail-background').addEventListener('change',schedule);
function schedule(){if(previewFrame)return;previewFrame=requestAnimationFrame(()=>{previewFrame=0;const t=performance.now();draw();performance.clearMeasures('studio-preview');performance.measure('studio-preview',{start:t,end:performance.now()});});}
new ResizeObserver(schedule).observe($('preview-stage'));
function keepEditorFieldVisible(){
 if(!matchMedia('(max-width:760px)').matches)return;
 const field=document.activeElement;if(!field?.matches('input:not([type=file]):not([type=checkbox]),select')||!field.closest('.editor'))return;
 const preview=document.querySelector('.preview-panel'),viewport=window.visualViewport;
 const top=Math.max(document.querySelector('.topbar').getBoundingClientRect().bottom,getComputedStyle(preview).position==='sticky'?preview.getBoundingClientRect().bottom:0,viewport?.offsetTop||0)+12;
 const bottom=Math.min(document.querySelector('.mobile-tabs').getBoundingClientRect().top,(viewport?.offsetTop||0)+(viewport?.height||innerHeight))-12;
 const rect=field.getBoundingClientRect();if(rect.top<top||rect.bottom>bottom)window.scrollBy({top:rect.top-(top+Math.max(0,(bottom-top-rect.height)/2)),behavior:'instant'});
}
document.querySelector('.editor').addEventListener('focusin',()=>requestAnimationFrame(keepEditorFieldVisible));
window.visualViewport?.addEventListener('resize',()=>{document.body.classList.toggle('keyboard-open',window.visualViewport.height<innerHeight*.75);schedule();requestAnimationFrame(keepEditorFieldVisible);});
function releasePhoto(p){if(p?.image?.close)p.image.close();if(p?.url)URL.revokeObjectURL(p.url);}
async function decodeFile(file){
 if(!file||!/^image\/(jpeg|png|webp)$/.test(file.type))throw new Error('Pilih gambar JPG, PNG, atau WebP yang valid.');
 if(file.size>100*1024*1024)throw new Error('Ukuran berkas maksimum 100 MB.');
 const url=URL.createObjectURL(file);const image=new Image();image.src=url;
 try{await image.decode();if(!image.naturalWidth||!image.naturalHeight)throw new Error();return{image,url,width:image.naturalWidth,height:image.naturalHeight,name:file.name};}catch{URL.revokeObjectURL(url);throw new Error('Gambar tidak dapat dibaca. Coba simpan ulang sebagai JPG atau PNG.');}
}
async function uploadPhoto(file){
 if(!file)return;const seq=++photoSequence;
 $('photo-drop').setAttribute('aria-busy','true');$('photo-label').textContent='Membaca foto…';
 try{const photo=await decodeFile(file);if(seq!==photoSequence){releasePhoto(photo);return;}releasePhoto(state.photo);state.photo=photo;setPhotoUI(false);notify('Foto siap. Sesuaikan timestamp Anda.');}catch(e){if(seq===photoSequence){$('photo-label').textContent=state.photo?.name||'Pilih foto untuk mulai';notify(e.message);}}finally{if(seq===photoSequence)$('photo-drop').removeAttribute('aria-busy');}
}
function setPhotoUI(demo){
 $('drag-mode').disabled=false;$('drag-mode').setAttribute('aria-pressed',String(dragEnabled));$('drag-mode').textContent=dragEnabled?'Selesai geser':'Geser objek';
 $('photo-label').textContent=demo?'Ganti dengan foto Anda':state.photo.name;
 $('photo-info').hidden=false;$('photo-info').textContent=`${state.photo.width} × ${state.photo.height} px · ${demo?'Kanvas contoh':'Foto asli tidak diubah'}`;
 $('empty-state').hidden=true;$('demo-label').hidden=!demo;canvas.classList.add('editable');
 refreshDownloadAvailability();$('compare').disabled=false;showOriginal=false;$('compare').setAttribute('aria-pressed','false');$('compare').textContent='Lihat foto asli';schedule();
}
function showMapThumbnail(map){
 $('map-thumbnail').src=map.image.toDataURL?map.image.toDataURL('image/png'):map.url;
 $('map-thumbnail-wrap').hidden=false;$('map-attribution').hidden=!map.kind;
}
function applyCrop(){
 if(!mapSource)return;
 const rect=cropRect(mapSource.width,mapSource.height,$('crop-size').value,$('crop-left').value,$('crop-bottom').value);
 releasePhoto(state.map);state.map=extractMap(mapSource,rect);$('crop-size-value').textContent=$('crop-size').value+'%';
 $('crop-result').textContent=rect.w+' × '+rect.h+' px · potongan asli';
 showMapThumbnail(state.map);schedule();
}
async function uploadMap(file,fromPhoto=false){
 if(!file)return;clearTimeout(mapTimer);mapController?.abort();mapLoading=true;resetMapButton();const seq=++mapSequence;
 $('map-upload-status').textContent=fromPhoto?'Mencari peta di sudut kiri bawah…':'Membaca gambar peta…';$('map-uploads').setAttribute('aria-busy','true');refreshDownloadAvailability();
 try{
  const source=await decodeFile(file);if(seq!==mapSequence){releasePhoto(source);return;}
  releasePhoto(mapSource);mapSource=null;releasePhoto(state.map);
  if(fromPhoto){
   mapSource=source;const result=detectMapCrop(source);$('crop-size').value=result.percent;$('crop-left').value=$('crop-bottom').value=0;
   $('crop-settings').hidden=false;$('crop-settings').open=false;applyCrop();
   $('map-upload-status').textContent=(result.confidence==='detected'?'Peta terdeteksi dan dipotong otomatis.':'Potongan perkiraan 30%. Periksa hasil atau sesuaikan potongan.')+' '+$('crop-result').textContent;
  }else{state.map=source;$('crop-settings').hidden=true;$('map-upload-status').textContent='Gambar peta siap · '+source.width+' × '+source.height+' px';showMapThumbnail(source);}
  state.style.mapEnabled=true;state.style.mapX=state.style.mapY=0;$('map-enabled').checked=true;$('map-label').textContent=file.name;$('remove-map').disabled=false;
  $('map-empty-note').textContent='Logo dan label pada gambar peta tetap dipertahankan.';$('map-status').classList.remove('error');$('map-status').textContent='Menggunakan gambar peta Anda.';
  schedule();notify(fromPhoto?'Peta dari foto Timestamp siap digunakan.':'Gambar peta ditambahkan.');
 }catch(e){if(seq===mapSequence){$('map-upload-status').textContent=e.message;notify(e.message);}}
 finally{if(seq===mapSequence){mapLoading=false;$('map-uploads').removeAttribute('aria-busy');refreshDownloadAvailability();}}
}
for(const id of ['crop-size','crop-left','crop-bottom'])$(id).addEventListener('input',()=>{if(cropFrame)return;cropFrame=requestAnimationFrame(()=>{cropFrame=0;applyCrop();});});
$('timestamp-map-input').addEventListener('change',e=>{uploadMap(e.target.files[0],true);e.target.value='';});
$('photo-input').addEventListener('change',e=>{uploadPhoto(e.target.files[0]);e.target.value='';});
$('map-input').addEventListener('change',e=>{uploadMap(e.target.files[0]);e.target.value='';});
for(const event of ['dragenter','dragover'])$('photo-drop').addEventListener(event,e=>{e.preventDefault();$('photo-drop').classList.add('dragging');});
for(const event of ['dragleave','drop'])$('photo-drop').addEventListener(event,e=>{e.preventDefault();$('photo-drop').classList.remove('dragging');if(event==='drop')uploadPhoto(e.dataTransfer.files[0]);});
$('remove-map').addEventListener('click',()=>{++mapSequence;clearTimeout(mapTimer);mapController?.abort();mapLoading=false;resetMapButton();releasePhoto(state.map);state.map=null;releasePhoto(mapSource);mapSource=null;$('crop-settings').hidden=true;$('map-upload-status').textContent='';$('map-label').textContent='Unggah gambar peta';$('remove-map').disabled=true;$('map-thumbnail-wrap').hidden=true;$('map-status').classList.remove('error');$('map-status').textContent='Peta dihapus. Tempel koordinat atau unggah gambar baru.';refreshDownloadAvailability();schedule();});
$('time-now').addEventListener('click',()=>{fieldRevisions[0]++;state.lines[0]=formatWita(new Date(),state.style.separator);$('line-0').value=state.lines[0];schedule();notify('Waktu diperbarui ke WITA.');});
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
$('load-preset').addEventListener('click',()=>{try{const data=JSON.parse(localStorage.getItem('timestamp-studio-preset-v1'));if(!data||data.version!==1||!Array.isArray(data.lines)||data.lines.length!==7)throw new Error();cancelLocation();fieldRevisions.forEach((_,i)=>fieldRevisions[i]++);state.style=restoreStyle(data.style);state.lines=data.lines.map(x=>String(x).slice(0,250));state.visible=data.visible?.length===7?data.visible.map(Boolean):Array(7).fill(true);if(state.style.fontFamily==='custom'&&![...document.fonts].some(f=>f.family==='UploadedTimestamp'&&f.status==='loaded')){state.style.fontFamily='camera';notify('Pengaturan dimuat. Unggah kembali font kustom Anda.');}else notify('Pengaturan dimuat.');sync();}catch{notify('Belum ada pengaturan tersimpan di browser ini.');}});
$('reset').addEventListener('click',()=>{state.style=defaultStyle();state.visible=Array(7).fill(true);sync();notify('Tampilan direset. Foto, peta, dan isi teks tetap dipertahankan.');});

document.querySelectorAll('[data-download]').forEach(b=>b.addEventListener('click',async()=>{
 if(!state.photo||exporting||mapLoading)return;exporting=true;
 const buttons=[...document.querySelectorAll('[data-download]')];buttons.forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true');});$('preview-status').textContent='Menyiapkan foto resolusi penuh…';
 try{
  await document.fonts.load(`${state.style.fontWeight||380} 32px CameraRoboto`);await document.fonts.ready;const {w,h}=dimensions();const target=document.createElement('canvas');target.width=w;target.height=h;const context=target.getContext('2d');if(!context)throw new Error('Memori tidak cukup untuk menyiapkan foto.');
  render(context,state,w,h,1,false);
  const format=$('export-format').value;
  const blob=await new Promise(resolve=>target.toBlob(resolve,'image/'+format,Number($('export-quality').value)/100));target.width=target.height=1;
  if(!blob)throw new Error('Gagal mengekspor gambar. Coba resolusi 2448 × 3264.');
  const a=document.createElement('a'),url=URL.createObjectURL(blob),stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Makassar',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date()).replace(/\D/g,'');
  a.href=url;a.download=`${cleanFileName(state.photo.name)}_timestamp_${stamp}.${format==='jpeg'?'jpg':'png'}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);notify('Foto selesai dibuat. Unduhan telah dimulai.');
 }catch(e){notify(e.message||'Gagal mengunduh. Coba kembali dengan ukuran foto lebih kecil.');}finally{exporting=false;buttons.forEach(b=>b.removeAttribute('aria-busy'));refreshDownloadAvailability();schedule();}
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
function resetMapButton(){$('generate-map').removeAttribute('aria-busy');$('generate-map').querySelector('span').textContent='Buat peta';if($('map-uploads').hasAttribute('aria-busy')){$('map-uploads').removeAttribute('aria-busy');$('map-upload-status').textContent='Unggahan dibatalkan. Pilih gambar kembali.';}}
function mapMatches(point,zoom){return point&&state.map?.kind===$('map-provider').value&&state.map.point.lat===point.lat&&state.map.point.lon===point.lon&&state.map.zoom===zoom&&(state.map.kind!=='google'||state.map.keyVersion===googleKeyVersion);}
function mapProviderUI(){const google=$('map-provider').value==='google';$('google-map-settings').hidden=!google;$('map-privacy').textContent=`Koordinat digunakan untuk meminta peta ke ${google?'Google Maps':'OpenStreetMap'}. Foto tetap di perangkat Anda.`;}
function queueMap(){
 clearTimeout(mapTimer);const point=parseCoordinates($('map-coordinates').value),zoom=+$('map-zoom').value;
 $('map-status').classList.remove('error');
 if(mapMatches(point,zoom))return;
 ++mapSequence;mapController?.abort();mapLoading=false;resetMapButton();
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
 releasePhoto(mapSource);mapSource=null;$('crop-settings').hidden=true;
 releasePhoto(state.map);state.map=null;$('map-thumbnail-wrap').hidden=true;$('remove-map').disabled=true;$('map-label').textContent='Unggah gambar peta';
 $('generate-map').setAttribute('aria-busy','true');$('generate-map').querySelector('span').textContent='Memuat peta…';$('map-status').classList.remove('error');$('map-status').textContent=`Mengambil peta ${google?'Google Maps':'OpenStreetMap'}…`;
 refreshDownloadAvailability();schedule();
 try{
  const map=await (google?createGoogleMap(point,zoom,{apiKey:$('google-api-key').value,signal:mapController.signal}):createOsmMap(point,zoom,{signal:mapController.signal}));if(seq!==mapSequence)return;
  map.keyVersion=googleKeyVersion;
  state.map=map;state.style.mapEnabled=true;state.style.mapShape='square';state.style.mapX=state.style.mapY=0;$('map-enabled').checked=true;$('map-shape').value='square';
  $('map-thumbnail').src=map.image.toDataURL('image/png');$('map-thumbnail-wrap').hidden=false;$('remove-map').disabled=false;
  const credit=$('map-attribution');credit.hidden=false;credit.href=google?'https://maps.google.com/':'https://www.openstreetmap.org/copyright';credit.textContent=google?`Google Maps · ${map.attribution}`:'© OpenStreetMap contributors';
  $('map-status').textContent=`Peta ${google?'Google Maps':'OpenStreetMap'} siap · pin merah pada koordinat yang ditempel.`;$('map-empty-note').textContent='Nama penyedia dan atribusi peta ikut disimpan pada hasil foto.';schedule();
 }catch(e){if(seq===mapSequence&&e.name!=='AbortError'){$('map-status').textContent=e.message||'Peta tidak dapat dimuat. Coba lagi atau unggah gambar.';$('map-status').classList.add('error');}}
 finally{if(seq===mapSequence){mapLoading=false;$('generate-map').removeAttribute('aria-busy');$('generate-map').querySelector('span').textContent='Buat peta';refreshDownloadAvailability();}}
}
$('map-coordinates').addEventListener('input',()=>{queueLocation();queueMap();});
$('map-coordinates').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if($('auto-location').checked)fillLocation(true);generateMap();}});
$('auto-map').addEventListener('change',queueMap);
$('map-zoom').addEventListener('input',()=>$('map-zoom-value').textContent=$('map-zoom').value);
$('map-zoom').addEventListener('change',queueMap);
$('generate-map').addEventListener('click',generateMap);
$('map-provider').addEventListener('change',()=>{mapProviderUI();queueMap();});
$('google-api-key').addEventListener('input',()=>{++googleKeyVersion;queueMap();});
$('google-api-key').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.target.blur();generateMap();}});
document.body.dataset.mobileTab='photo';
$('continue-text').addEventListener('click',()=>document.querySelector('.mobile-tabs [data-tab=text]').click());
for(const button of document.querySelectorAll('[data-tab]'))button.addEventListener('click',()=>{document.body.dataset.mobileTab=button.dataset.tab;for(const b of document.querySelectorAll('[data-tab]')){b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));}schedule();window.scrollTo({top:0,behavior:'instant'});});
$('fill-location').addEventListener('click',()=>fillLocation(true));
$('device-location').addEventListener('click',fillDeviceLocation);
$('auto-location').addEventListener('change',()=>{$('auto-location').checked?queueLocation():cancelLocation();});
refreshLocationPresets();mapProviderUI();sync();document.fonts.load('380 32px CameraRoboto').then(schedule);document.fonts.ready.then(schedule);
