// Optional browser checks: npm install --no-save playwright (or provide
// PLAYWRIGHT_MODULE_PATH), then npm run test:browser. No runtime app dependency.
const fs=require('node:fs/promises'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
async function check(){
 const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf'};
 const server=http.createServer(async(req,res)=>{try{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(p.endsWith('/')?p+'index.html':p));if(!file.startsWith(root+path.sep)||file.includes(path.sep+'.git'+path.sep)){res.writeHead(403);return res.end();}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 const output=path.resolve(process.env.QA_OUTPUT_DIR||path.join(root,'test-results'));
 try{
  await fs.mkdir(output,{recursive:true});browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1366,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://photon.komoot.io/**',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({features:[{properties:{street:'Jalan Contoh',locality:'Taman',district:'Kecamatan Contoh',city:'Kota Contoh',state:'Provinsi Contoh'}}]})}));
  await page.goto(`http://127.0.0.1:${server.address().port}`);await page.evaluate(()=>document.fonts.ready);assert.equal(await page.locator('[id^=shadow-]').count(),0);
  await page.locator('#demo').click();await page.waitForFunction(()=>!document.querySelector('[data-download]').disabled);
  await page.locator('[data-tab=text]').click();await page.locator('#map-coordinates').fill('-1,110');await page.waitForFunction(()=>document.querySelector('#line-6').value==='Provinsi Contoh');await page.locator('#line-6').fill('Provinsi manual');
  const source=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=800;c.height=1000;const ctx=c.getContext('2d');ctx.fillStyle='#454545';ctx.fillRect(0,0,800,1000);ctx.fillStyle='#f4f4f4';ctx.fillRect(0,760,240,240);ctx.fillStyle='#3186a0';ctx.fillRect(90,760,7,240);ctx.fillStyle='#b43830';ctx.beginPath();ctx.arc(120,860,15,0,Math.PI*2);ctx.fill();return c.toDataURL();});
  await page.locator('[data-tab=map]').click();await page.locator('#timestamp-map-input').setInputFiles({name:'timestamp-fixture.png',mimeType:'image/png',buffer:Buffer.from(source.split(',')[1],'base64')});await page.waitForFunction(()=>document.querySelector('#map-upload-status').textContent.includes('px'));assert.match(await page.locator('#map-upload-status').textContent(),/240 × 240/);
  for(const width of [360,393,430,1366]){await page.setViewportSize({width,height:900});for(const tab of ['photo','text','map','export']){await page.locator(`[data-tab=${tab}]`).click();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}/${tab} horizontal overflow`);await page.evaluate(()=>document.querySelector('#toast').classList.remove('visible'));await page.screenshot({path:path.join(output,`${width}-${tab}.png`)});}}
  await page.locator('[data-tab=text]').click();await page.locator('#save-preset').click();await page.locator('#reset').click();await page.locator('#load-preset').click();assert.equal(await page.locator('#line-6').inputValue(),'Provinsi manual');
  await page.locator('[data-tab=export]').click();await page.locator('#export-format').selectOption('png');const download=page.waitForEvent('download');await page.locator('.download-main').click();await (await download).saveAs(path.join(output,'export.png'));
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.toast').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');assert.deepEqual(errors,[]);
  console.log('Browser checks passed: 4 widths × 4 sections, address/manual editing, crop, settings, PNG export, reduced motion; '+output);
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
}
module.exports=check;
if(require.main===module)check().catch(e=>{console.error(e);process.exitCode=1;});
