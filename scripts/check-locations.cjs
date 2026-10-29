const assert=require('node:assert/strict'),path=require('node:path');
module.exports=async function checkLocations(browser,url,output){
 const context=await browser.newContext({permissions:['geolocation'],geolocation:{latitude:-4.0034,longitude:122.5286,accuracy:18},viewport:{width:1366,height:900}});
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 let requests=0,delay=0,failure=false;
 await page.route('https://photon.komoot.io/**',async route=>{
  requests++;const lat=new URL(route.request().url()).searchParams.get('lat'),wait=delay,failed=failure;
  if(wait)await new Promise(resolve=>setTimeout(resolve,wait));
  await route.fulfill(failed?{status:503,body:'unavailable'}:{contentType:'application/json',body:JSON.stringify({features:[{properties:{street:`Jalan ${lat}`,locality:'Taman',district:'Kec. Kadia',city:'Kendari',state:'Sulawesi Tenggara'}}]})}).catch(()=>{});
 });
 const fields=()=>page.locator('#timestamp-fields input[type=text]').evaluateAll(inputs=>inputs.map(input=>input.value));
 const idle=()=>page.waitForFunction(()=>!document.querySelector('#fill-location').hasAttribute('aria-busy'));
 const busy=()=>page.waitForFunction(()=>document.querySelector('#fill-location').hasAttribute('aria-busy'));
 const openPresets=()=>page.locator('#location-presets').evaluate(element=>element.open=true);
 try{
  await page.goto(url);await page.locator('[data-tab=text]').click();
  assert.equal(await page.locator('#line-5').inputValue(),'Kota Kendari');assert.equal(await page.locator('#line-6').inputValue(),'Sulawesi Tenggara');
  assert.equal(await page.locator('#line-4').inputValue(),'Kecamatan');
  await page.locator('#auto-location').uncheck();await page.locator('#line-0').fill('Waktu manual');await page.locator('#line-2').fill('Jalan manual');
  const before=await fields();
  await page.locator('#map-coordinates').fill('https://www.google.com/maps/search/?api=1&query=-4.0034,122.5286');await page.locator('#map-coordinates').press('Enter');await page.waitForTimeout(1150);
  assert.deepEqual(await fields(),before);assert.equal(requests,0);
  await page.locator('#auto-location').check();await page.waitForFunction(()=>document.querySelector('#line-4').value==='Kecamatan Kadia');
  assert.equal(requests,1);assert.equal(await page.locator('#line-5').inputValue(),'Kota Kendari');
  const source=await page.locator('#map-coordinates').inputValue(),after=await fields();
  await page.locator('#line-1').fill('Koordinat suntingan bebas');await page.waitForTimeout(1150);
  const manual=await fields();assert.deepEqual(manual.slice(2),after.slice(2));assert.equal(manual[0],after[0]);assert.equal(requests,1);assert.equal(await page.locator('#map-coordinates').inputValue(),source);
  await page.locator('#line-0').fill('Senin, 1 Januari 2024 01.00');await page.locator('#time-now').click();assert.notEqual(await page.locator('#line-0').inputValue(),'Senin, 1 Januari 2024 01.00');
  await page.locator('#line-0').fill('Jam bebas setelah sync');await page.waitForTimeout(1100);assert.equal(await page.locator('#line-0').inputValue(),'Jam bebas setelah sync');
  await page.locator('#line-4').fill('Kadia');await page.locator('#line-4').press('Tab');assert.equal(await page.locator('#line-4').inputValue(),'Kecamatan Kadia');
  // Manual coordinates cancel both a pending debounce and an in-flight lookup.
  let count=requests;await page.locator('#map-coordinates').fill('-2,110');await page.locator('#line-1').fill('Manual selama debounce');await page.waitForTimeout(1150);assert.equal(requests,count);
  delay=500;await page.locator('#map-coordinates').fill('-3,110');await busy();const pending=await fields();await page.locator('#line-1').fill('Manual selama pencarian');await page.waitForTimeout(650);assert.deepEqual((await fields()).slice(2),pending.slice(2));assert.equal(await page.locator('#line-1').inputValue(),'Manual selama pencarian');
  // Per-field manual revisions and time-sync survive a response already in flight.
  await page.locator('#map-coordinates').fill('-5,110');await busy();await page.locator('#line-2').fill('Alamat suntingan saat mencari');await page.locator('#time-now').click();const synced=await page.locator('#line-0').inputValue();await idle();assert.equal(await page.locator('#line-2').inputValue(),'Alamat suntingan saat mencari');assert.equal(await page.locator('#line-0').inputValue(),synced);
  // Latest location wins even when an older request is slow.
  await page.locator('#map-coordinates').fill('-6,110');await busy();delay=0;await page.locator('#map-coordinates').fill('-7,110');await page.locator('#fill-location').click();await idle();await page.waitForTimeout(600);assert.equal(await page.locator('#line-2').inputValue(),'Jalan -7');
  // Browser permission and device position are emulated; no physical GPS claim.
  await page.locator('#device-location').click();await page.waitForFunction(()=>document.querySelector('#location-status').textContent.includes('±18 m'));
  await idle();assert.match(await page.locator('#line-1').inputValue(),/4,00340S 122,52860E/);assert.equal(await page.locator('#device-location').isEnabled(),true);
  await page.evaluate(()=>{window.savedGetPosition=navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);navigator.geolocation.getCurrentPosition=(success,error)=>error({code:1});});
  const denied=await fields();await page.locator('#device-location').click();await page.waitForFunction(()=>document.querySelector('#location-status').textContent.includes('Izin lokasi ditolak'));assert.deepEqual(await fields(),denied);assert.equal(await page.locator('#device-location').isEnabled(),true);assert.equal(await page.locator('#fill-location').isEnabled(),true);
  // Pending device callbacks cannot overwrite new source coordinates.
  await page.evaluate(()=>navigator.geolocation.getCurrentPosition=success=>{window.pendingPosition=success;});await page.locator('#device-location').click();await page.locator('#map-coordinates').fill('-8,110');await page.locator('#fill-location').click();await idle();await page.evaluate(()=>window.pendingPosition({coords:{latitude:-9,longitude:110,accuracy:5}}));assert.equal(await page.locator('#map-coordinates').inputValue(),'-8,110');
  await page.evaluate(()=>navigator.geolocation.getCurrentPosition=window.savedGetPosition);
  failure=true;await page.locator('#map-coordinates').fill('-10,110');await page.locator('#fill-location').click();await page.waitForFunction(()=>document.querySelector('#location-status').classList.contains('error'));assert.equal(await page.locator('#fill-location').isEnabled(),true);failure=false;
  await page.locator('#map-coordinates').fill('https://maps.app.goo.gl/6biK1pfToG9mR3Rg8');count=requests;await page.waitForTimeout(1100);assert.equal(requests,count);assert.equal(await page.locator('#open-maps-link').isVisible(),true);
  // Named presets preserve manual text and time; selecting is separate from applying.
  await openPresets();await page.locator('#save-location-preset').click();assert.equal(await page.locator('#location-preset-name').getAttribute('aria-invalid'),'true');
  await page.locator('#auto-location').uncheck();await page.locator('#map-coordinates').fill('-4.0034,122.5286');await page.locator('#line-1').fill('Koordinat Rumah');await page.locator('#line-2').fill('Jalan Rumah');
  await page.locator('#location-preset-name').fill('Rumah');await page.locator('#save-location-preset').click();const homeId=await page.locator('#location-preset-select').inputValue();assert.ok(homeId);
  await page.locator('#line-1').fill('Koordinat Kantor');await page.locator('#line-2').fill('Jalan Kantor');await page.locator('#location-preset-name').fill('Kantor');await page.locator('#save-location-preset').click();const officeId=await page.locator('#location-preset-select').inputValue();assert.notEqual(homeId,officeId);
  assert.equal(await page.locator('#location-preset-select option').count(),3);
  await page.locator('#location-preset-select').selectOption(homeId);assert.equal(await page.locator('#line-2').inputValue(),'Jalan Kantor');
  await page.locator('#line-0').fill('Waktu dipertahankan');count=requests;await page.locator('#apply-location-preset').click();assert.equal(await page.locator('#line-0').inputValue(),'Waktu dipertahankan');assert.equal(await page.locator('#line-1').inputValue(),'Koordinat Rumah');assert.equal(await page.locator('#line-2').inputValue(),'Jalan Rumah');assert.equal(requests,count);
  await page.locator('#line-2').fill('Jalan Rumah Baru');await page.locator('#save-location-preset').click();assert.equal(await page.locator('#location-preset-select option').count(),3);
  // Failed writes are visible and leave persisted data unchanged.
  const saved=await page.evaluate(()=>localStorage.getItem('timestamp-studio-locations-v1'));
  await page.evaluate(()=>{window.savedStorageSet=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new DOMException('Quota exceeded','QuotaExceededError');};});await page.locator('#location-preset-name').fill('Gagal simpan');await page.locator('#save-location-preset').click();assert.equal(await page.locator('#location-preset-status').evaluate(element=>element.classList.contains('error')),true);assert.equal(await page.evaluate(()=>localStorage.getItem('timestamp-studio-locations-v1')),saved);await page.evaluate(()=>Storage.prototype.setItem=window.savedStorageSet);
  await page.reload();await page.locator('[data-tab=text]').click();await openPresets();assert.equal(await page.locator('#location-preset-select option').count(),3);await page.locator('#location-preset-select').selectOption(homeId);await page.locator('#apply-location-preset').click();assert.equal(await page.locator('#line-2').inputValue(),'Jalan Rumah Baru');
  const loaded=await fields();await page.locator('#delete-location-preset').click();assert.deepEqual(await fields(),loaded);assert.equal(await page.locator('#location-preset-select option').count(),2);await page.reload();await page.locator('[data-tab=text]').click();await openPresets();assert.equal(await page.locator('#location-preset-select option').count(),2);
  // A preset load cancels an older address request even with automatic mode on.
  delay=600;await page.locator('#map-coordinates').fill('-11,110');await busy();await page.locator('#location-preset-select').selectOption(officeId);await page.locator('#apply-location-preset').click();await page.waitForTimeout(750);assert.equal(await page.locator('#line-2').inputValue(),'Jalan Kantor');
  // Old appearance storage remains usable alongside multiple location presets.
  await page.locator('#save-preset').click();const old=await page.evaluate(()=>JSON.parse(localStorage.getItem('timestamp-studio-preset-v1')));assert.equal(old.version,1);await page.locator('#line-2').fill('Sementara');await page.locator('#load-preset').click();assert.equal(await page.locator('#line-2').inputValue(),'Jalan Kantor');
  await page.locator('#demo').evaluate(element=>element.click());
  await page.waitForFunction(()=>!document.querySelector('#empty-state').checkVisibility());
  await page.evaluate(()=>document.querySelector('#toast').classList.remove('visible'));
  await page.locator('.maps-examples').evaluate(element=>element.open=true);
  for(const width of [360,393,430,1366]){
   await page.setViewportSize({width,height:900});await page.locator('#location-presets').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,`${width}-location-presets.png`)});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`presets overflow ${width}`);
   await page.locator('#line-0').scrollIntoViewIfNeeded();await page.locator('#line-0').focus();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:path.join(output,`${width}-time-sync.png`)});
   if(width<761){const metrics=await page.evaluate(()=>({input:document.querySelector('#line-0').getBoundingClientRect().toJSON(),preview:document.querySelector('.preview-panel').getBoundingClientRect().toJSON(),nav:document.querySelector('.mobile-tabs').getBoundingClientRect().toJSON()}));assert.ok(metrics.input.top>=metrics.preview.bottom&&metrics.input.bottom<metrics.nav.top,`time input obscured ${width}`);}
   const button=await page.locator('#time-now').boundingBox();assert.ok(button.height>=44);
   await page.locator('#line-6').scrollIntoViewIfNeeded();await page.locator('#line-6').fill('Sulawesi Tenggara');await page.screenshot({path:path.join(output,`${width}-manual-input.png`)});
  }
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.toast').evaluate(element=>getComputedStyle(element).transitionDuration),'0s');
  assert.deepEqual(errors,[]);console.log('Location checks passed: manual isolation, toggle, sync, GPS emulation/errors/cancellation, stale responses, named presets/reload/update/delete/quota, old settings and 4 widths.');
 }finally{await context.close();}
};
