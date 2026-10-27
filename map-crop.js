// Work only on local pixels. Detection looks for the two edges of a square
// touching the lower-left corner; it never sends the source photo to a service.
export function cropRect(width,height,percent=30,left=0,bottom=0){
 const side=Math.max(1,Math.min(width,height,Math.round(width*Math.max(10,Math.min(60,Number(percent)||30))/100)));
 const x=Math.max(0,Math.min(width-side,Math.round(width*(Number(left)||0)/100)));
 const y=Math.max(0,Math.min(height-side,Math.round(height-side-height*(Number(bottom)||0)/100)));
 return {x,y,w:side,h:side};
}
export function detectMapSquare({data,width,height}){
 const rgb=(x,y,c)=>data[(y*width+x)*4+c];
 const distance=(x1,y1,x2,y2)=>{let n=0;for(let c=0;c<3;c++)n+=Math.abs(rgb(x1,y1,c)-rgb(x2,y2,c));return n/3;};
 const min=Math.max(12,Math.floor(width*.12)),max=Math.min(width-3,height-3,Math.ceil(width*.6));
 const score=side=>{
  const y=height-side,step=Math.max(1,Math.floor(side/110));let horizontal=0,vertical=0,light=0,count=0;
  for(let i=3;i<side-3;i+=step){horizontal+=distance(i,y-2,i,y+2);vertical+=distance(side-2,y+i,side+2,y+i);light+=(rgb(i,y+Math.floor(side/2),0)+rgb(i,y+Math.floor(side/2),1)+rgb(i,y+Math.floor(side/2),2))/3>175?1:0;count++;}
  if(!count)return 0;horizontal/=count;vertical/=count;
  return (Math.min(horizontal,vertical)*.7+(horizontal+vertical)*.15)*(light/count>.35?1:.45);
 };
 let side=Math.round(width*.3),best=0;
 for(let s=min;s<=max;s++){const n=score(s);if(n>best){best=n;side=s;}}
 return {side:best>=16?side:Math.round(width*.3),confidence:best>=16?'detected':'estimated',score:best};
}
export function detectMapCrop(source){
 const scale=Math.min(1,900/Math.max(source.width,source.height));
 const sample=document.createElement('canvas');sample.width=Math.round(source.width*scale);sample.height=Math.round(source.height*scale);
 const context=sample.getContext('2d',{willReadFrequently:true});context.drawImage(source.image,0,0,sample.width,sample.height);
 const result=detectMapSquare(context.getImageData(0,0,sample.width,sample.height));
 sample.width=sample.height=1;
 let side=Math.round(result.side/Math.round(source.width*scale)*source.width);
 if(result.confidence==='detected')side=refineEdge(source,side,Math.ceil(4/scale)+2);
 return {...result,side,percent:Math.round(side/source.width*10000)/100};
}
function refineEdge(source,approx,radius){
 // Two narrow strips retain native pixel edges without allocating a full-size
 // copy of a large photo. The preview detector only supplies the neighborhood.
 const low=Math.max(3,approx-radius),high=Math.min(source.width-2,source.height-2,approx+radius),top=source.height-high;
 const h=document.createElement('canvas'),v=document.createElement('canvas');h.width=high;h.height=high-low+2;v.width=high-low+2;v.height=high;
 const hc=h.getContext('2d',{willReadFrequently:true}),vc=v.getContext('2d',{willReadFrequently:true});
 hc.drawImage(source.image,0,top-1,h.width,h.height,0,0,h.width,h.height);
 vc.drawImage(source.image,low-1,top,v.width,v.height,0,0,v.width,v.height);
 const hd=hc.getImageData(0,0,h.width,h.height).data,vd=vc.getImageData(0,0,v.width,v.height).data;
 const diff=(data,width,x1,y1,x2,y2)=>{let n=0;for(let c=0;c<3;c++)n+=Math.abs(data[(y1*width+x1)*4+c]-data[(y2*width+x2)*4+c]);return n/3;};
 let best=-1,side=approx;
 for(let s=low;s<=high;s++){
  let row=0,col=0,count=0;const step=Math.max(1,Math.floor(s/180));
  for(let i=3;i<s-3;i+=step){row+=diff(hd,h.width,i,high-s,i,high-s+1);col+=diff(vd,v.width,s-low,high-s+i,s-low+1,high-s+i);count++;}
  const score=(Math.min(row,col)*.7+(row+col)*.15)/Math.max(1,count);
  if(score>best){best=score;side=s;}
 }
 h.width=h.height=v.width=v.height=1;return side;
}
export function extractMap(source,rect){
 const image=document.createElement('canvas');image.width=rect.w;image.height=rect.h;
 image.getContext('2d').drawImage(source.image,rect.x,rect.y,rect.w,rect.h,0,0,rect.w,rect.h);
 return {image,width:rect.w,height:rect.h,name:source.name,cropped:true};
}
