// Photon uses OpenStreetMap address data. Requests happen only after a complete
// user-entered coordinate, are debounced in app.js, and cached for this session.
const addressCache=new Map();
export const LOCATION_ENDPOINT='https://photon.komoot.io/reverse';
const clean=value=>typeof value==='string'?value.trim().slice(0,250):'';
const prefix=(value,label)=>!value||new RegExp(`^${label}\\b`,'i').test(value)?value:`${label} ${value}`;
export function addressLines(data){
 const p=data?.features?.[0]?.properties;
 if(!p)throw new Error('Alamat belum ditemukan. Isi detail lokasi secara manual.');
 const city=clean(p.city||p.county),district=clean(p.district),village=clean(p.locality||p.suburb);
 // Photon district can mean a suburb/kelurahan as well as a city district.
 // Only add Kecamatan when the hierarchy or an explicit prefix supports it.
 const hasDistrict=!!village||/^(?:Kecamatan|Kec\.|Distrik)\s/i.test(district);
 return {2:clean(p.street),3:village?prefix(village,'Kelurahan'):hasDistrict?'':district,4:hasDistrict?prefix(district,'Kecamatan'):'',5:city,6:clean(p.state)};
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
