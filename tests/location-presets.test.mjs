import test from 'node:test';
import assert from 'node:assert/strict';
import {LOCATION_PRESETS_KEY,readLocations,saveLocation,deleteLocation} from '../location-presets.js';
import {districtName,getDeviceLocation} from '../location.js';
const memory=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};};
const sample=name=>({name,lines:['4,00340S 122,52860E','Jalan Contoh','Kelurahan Contoh','Kecamatan Kadia','Kota Kendari','Sulawesi Tenggara'],source:'https://www.google.com/maps/search/?api=1&query=-4.0034,122.5286'});

test('multiple locations survive reload, update by name and delete independently of old settings',()=>{
 const storage=memory();storage.setItem('timestamp-studio-preset-v1','old settings');
 const home=saveLocation(storage,sample(' Rumah '),()=> 'home');saveLocation(storage,sample('Kantor'),()=> 'office');
 assert.deepEqual(readLocations(storage).map(item=>item.name),['Rumah','Kantor']);
 const changed=sample('RUMAH');changed.lines[1]='Jalan Baru';
 assert.deepEqual(saveLocation(storage,changed),{id:home.id,updated:true});
 assert.equal(readLocations(storage)[0].lines[1],'Jalan Baru');assert.equal(readLocations(storage).length,2);
 deleteLocation(storage,'home');assert.equal(readLocations(storage)[0].name,'Kantor');
 assert.equal(storage.getItem('timestamp-studio-preset-v1'),'old settings');
 assert.throws(()=>deleteLocation(storage,'missing'),/tidak tersedia/);
});

test('location storage excludes photo, API key, time and style; unsupported source is not persisted',()=>{
 const storage=memory(),input=sample('<img src=x onerror=alert(1)>');input.source='javascript:alert(1)';input.photo='private-photo';input.apiKey='secret';input.style={};input.time='old time';
 saveLocation(storage,input,()=> 'safe');const item=readLocations(storage)[0];
 assert.equal(item.source,'');assert.equal(item.name,input.name);assert.deepEqual(Object.keys(item).sort(),['id','lines','name','source']);
 assert.equal(storage.getItem(LOCATION_PRESETS_KEY).includes('secret'),false);
 assert.throws(()=>saveLocation(storage,sample(' ')),/nama/);
});

test('malformed storage, wrong versions and write failures leave existing locations intact',()=>{
 for(const raw of ['broken','null',JSON.stringify({version:2,locations:[]}),JSON.stringify({version:1,locations:[{id:'x',name:'Home',lines:[],source:''}]})]){
  const storage=memory();storage.setItem(LOCATION_PRESETS_KEY,raw);assert.throws(()=>saveLocation(storage,sample('Home')));assert.equal(storage.getItem(LOCATION_PRESETS_KEY),raw);
 }
 const storage=memory();saveLocation(storage,sample('Rumah'),()=> 'one');const raw=storage.getItem(LOCATION_PRESETS_KEY);
 storage.setItem=()=>{throw new Error('QuotaExceededError');};assert.throws(()=>saveLocation(storage,sample('Kantor'),()=> 'two'),/Quota/);assert.equal(storage.getItem(LOCATION_PRESETS_KEY),raw);
});

test('district prefix is consistent without duplication and allows blank manual input',()=>{
 for(const name of ['Kadia','Kec. Kadia','Kec Kadia','Distrik Kadia','Kecamatan Kadia','Kecamatan Kecamatan Kadia'])assert.equal(districtName(name),'Kecamatan Kadia');
 assert.equal(districtName(''),'');assert.equal(districtName('Kecamatan'),'Kecamatan');
});

test('device location asks for a fresh accurate position and reports estimated accuracy',async()=>{
 let options;const geolocation={getCurrentPosition:(success,error,value)=>{options=value;success({coords:{latitude:-4.0034,longitude:122.5286,accuracy:12.4}});}};
 assert.deepEqual(await getDeviceLocation({secure:true,geolocation}),{lat:-4.0034,lon:122.5286,accuracy:12});
 assert.deepEqual(options,{enableHighAccuracy:true,timeout:15000,maximumAge:0});
});

test('device location handles permission, unsupported browser, insecure page and invalid fixes',async()=>{
 await assert.rejects(getDeviceLocation({secure:false}),/HTTPS/);
 await assert.rejects(getDeviceLocation({secure:true,geolocation:null}),/tidak mendukung/);
 for(const [code,message]of [[1,/Izin lokasi ditolak/],[2,/belum tersedia/],[3,/terlalu lama/]])await assert.rejects(getDeviceLocation({secure:true,geolocation:{getCurrentPosition:(success,error)=>error({code})}}),message);
 await assert.rejects(getDeviceLocation({secure:true,geolocation:{getCurrentPosition:success=>success({coords:{latitude:91,longitude:0}})}}),/tidak valid/);
});

test('aborted device requests ignore late callbacks and do not keep timers alive',async()=>{
 const controller=new AbortController();let success;
 const result=getDeviceLocation({secure:true,signal:controller.signal,geolocation:{getCurrentPosition:callback=>{success=callback;}}});
 controller.abort();await assert.rejects(result,{name:'AbortError'});success({coords:{latitude:0,longitude:0,accuracy:1}});
 await assert.rejects(getDeviceLocation({secure:true,signal:controller.signal}),{name:'AbortError'});
});
