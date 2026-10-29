// Location presets are separate from the existing version:1 appearance preset.
// Only six editable location lines and their Maps input are persisted.
import {parseCoordinates,shortMapsLink} from './maps.js?v=1.7.1';
export const LOCATION_PRESETS_KEY='timestamp-studio-locations-v1';
export const presetName=value=>String(value??'').trim().slice(0,60);
const nameKey=value=>presetName(value).toLocaleLowerCase('id');
export function readLocations(storage){
 const raw=storage.getItem(LOCATION_PRESETS_KEY);
 if(raw===null)return [];
 const data=JSON.parse(raw);
 if(data?.version!==1||!Array.isArray(data.locations)||data.locations.length>100)throw new Error('Data preset lokasi tidak dapat dibaca. Data tersimpan tetap dipertahankan.');
 const names=new Set(),ids=new Set();
 return data.locations.map(item=>{
  if(!item||typeof item.id!=='string'||!item.id||item.id.length>100||typeof item.name!=='string'||!presetName(item.name)||!Array.isArray(item.lines)||item.lines.length!==6||item.lines.some(line=>typeof line!=='string')||typeof item.source!=='string'||names.has(nameKey(item.name))||ids.has(item.id))throw new Error('Data preset lokasi tidak dapat dibaca. Data tersimpan tetap dipertahankan.');
  names.add(nameKey(item.name));ids.add(item.id);
  const source=item.source.slice(0,2000);
  return {id:item.id,name:presetName(item.name),lines:item.lines.map(line=>line.slice(0,250)),source:parseCoordinates(source)||shortMapsLink(source)?source:''};
 });
}
export function saveLocation(storage,{name,lines,source},createId=()=>globalThis.crypto.randomUUID()){
 const locations=readLocations(storage),label=presetName(name);
 if(!label)throw new Error('Beri nama lokasi terlebih dahulu.');
 if(!Array.isArray(lines)||lines.length!==6||lines.some(line=>typeof line!=='string'))throw new Error('Detail lokasi tidak valid.');
 const existing=locations.find(item=>nameKey(item.name)===nameKey(label));
 if(!existing&&locations.length>=100)throw new Error('Maksimum 100 preset lokasi. Hapus salah satu untuk menyimpan lokasi baru.');
 const input=String(source??'').trim().slice(0,2000);
 const item={id:existing?.id||createId(),name:label,lines:lines.map(line=>line.slice(0,250)),source:parseCoordinates(input)||shortMapsLink(input)?input:''};
 if(existing)locations[locations.indexOf(existing)]=item;else locations.push(item);
 storage.setItem(LOCATION_PRESETS_KEY,JSON.stringify({version:1,locations}));
 return {id:item.id,updated:!!existing};
}
export function deleteLocation(storage,id){
 const locations=readLocations(storage);
 if(!locations.some(item=>item.id===id))throw new Error('Preset lokasi sudah tidak tersedia.');
 storage.setItem(LOCATION_PRESETS_KEY,JSON.stringify({version:1,locations:locations.filter(item=>item.id!==id)}));
}
