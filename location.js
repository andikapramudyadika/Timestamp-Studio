// Photon uses OpenStreetMap address data. Requests happen only after a complete
// user-entered coordinate, are debounced in app.js, and cached for this session.
const addressCache=new Map();
export const LOCATION_ENDPOINT='https://photon.komoot.io/reverse';
const clean=value=>typeof value==='string'?value.trim().slice(0,250):'';
const prefix=(value,label)=>!value||new RegExp(`^${label}\\b`,'i').test(value)?value:`${label} ${value}`;
export function districtName(value){const name=clean(value).replace(/^(?:(?:Kecamatan|Kec\.?|Distrik)\s+)+/i,'').trim();return name?prefix(name,'Kecamatan'):'';}
export function addressLines(data){
 const p=data?.features?.[0]?.properties;
 if(!p)throw new Error('Alamat belum ditemukan. Isi detail lokasi secara manual.');
 const city=clean(p.city||p.county),district=clean(p.district),village=clean(p.locality||p.suburb);
 // Photon district can mean a suburb/kelurahan as well as a city district.
 // Only add Kecamatan when the hierarchy or an explicit prefix supports it.
 const hasDistrict=!!village||/^(?:Kecamatan|Kec\.|Distrik)\s/i.test(district);
 return {2:clean(p.street),3:village?prefix(village,'Kelurahan'):hasDistrict?'':district,4:hasDistrict?districtName(district):'',5:/^Kendari$/i.test(city)?'Kota Kendari':city,6:clean(p.state)};
}

// One explicit request, with cancellation and a wall-clock limit even while the
// browser is waiting for permission. A late callback cannot change newer input.
export function getDeviceLocation({signal,geolocation=globalThis.navigator?.geolocation,secure=globalThis.isSecureContext}={}){
 return new Promise((resolve,reject)=>{
  if(signal?.aborted){reject(new DOMException('Dibatalkan','AbortError'));return;}
  if(!secure){reject(new Error('Lokasi perangkat memerlukan HTTPS atau localhost.'));return;}
  if(!geolocation){reject(new Error('Browser ini tidak mendukung lokasi perangkat. Gunakan link Maps atau isi manual.'));return;}
  let settled=false,timer;
  const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);error?reject(error):resolve(value);};
  const abort=()=>finish(new DOMException('Dibatalkan','AbortError'));
  signal?.addEventListener('abort',abort,{once:true});
  timer=setTimeout(()=>finish(new Error('Pengambilan lokasi terlalu lama. Periksa izin lokasi, lalu coba lagi.')),25000);
  try{geolocation.getCurrentPosition(position=>{
   const {latitude:lat,longitude:lon,accuracy}=position.coords||{};
   if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180){finish(new Error('Koordinat perangkat tidak valid. Coba lagi atau isi manual.'));return;}
   finish(null,{lat,lon,accuracy:Number.isFinite(accuracy)&&accuracy>=0?Math.max(1,Math.round(accuracy)):null});
  },error=>finish(new Error(error.code===1?'Izin lokasi ditolak. Izinkan lokasi pada pengaturan situs, atau gunakan link Maps.':error.code===3?'Pengambilan lokasi terlalu lama. Aktifkan lokasi perangkat dan coba lagi.':'Lokasi belum tersedia. Aktifkan lokasi perangkat atau coba di tempat terbuka.')),{enableHighAccuracy:true,timeout:15000,maximumAge:0});}
  catch{finish(new Error('Lokasi perangkat tidak dapat diakses. Periksa izin lokasi atau gunakan link Maps.'));}
 });
}
export async function lookupAddress(point,{signal}={}){
 const key=`${point.lat.toFixed(6)},${point.lon.toFixed(6)}`;
 if(signal?.aborted)throw new DOMException('Dibatalkan','AbortError');
 if(addressCache.has(key))return addressCache.get(key);
 const url=new URL(LOCATION_ENDPOINT);url.search=new URLSearchParams({lat:point.lat,lon:point.lon,limit:1,lang:'default'});
 const controller=new AbortController(),abort=()=>controller.abort();
 signal?.addEventListener('abort',abort,{once:true});
 const timeout=setTimeout(abort,12000);
 try{
  const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error(response.status===429?'Layanan alamat sedang sibuk. Coba lagi sebentar, atau isi manual.':'Alamat belum dapat diambil. Periksa internet atau isi manual.');
  const result=addressLines(await response.json());
  if(addressCache.size>=40)addressCache.delete(addressCache.keys().next().value);
  addressCache.set(key,result);return result;
 }catch(error){if(controller.signal.aborted&&!signal?.aborted)throw new Error('Pencarian alamat terlalu lama. Coba lagi atau isi manual.');throw error;}
 finally{clearTimeout(timeout);signal?.removeEventListener('abort',abort);}
}
