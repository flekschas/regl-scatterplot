import{d as p,c as h,a as u,b as g,e as F}from"./menu-D496VOBB.js";import{t as d}from"./apache-arrow-szX3Jr2h.js";import"./vendor-CWN1LCVq.js";const m=["#FFFF00","#1CFFD9","#FF34FF","#FF4A46","#008941","#1966FF","#C00069","#FFDBE5","#FF9900","#8148D5"],y=fetch("https://storage.googleapis.com/flekschas/regl-scatterplot/cities.arrow");p("Loading...");const w=document.querySelector("#footer");w.classList.remove("hidden");const f=document.querySelector("#info-content");f.innerHTML=`
<p><a href="https://www.geonames.org/about.html" target="_blank">GeoNames – Cities Dataset</a> visualized in three: by the cities' geographic location, by the total population across contintents, and by the citie's latitude distribution.</p>
`;const C=document.querySelector("#canvas");let S=1.5;const e=h({canvas:C,pointSize:S,lassoOnLongPress:!0});u(e);console.log(`Scatterplot v${e.get("version")}`);g({scatterplot:e,opacityChangesDisabled:!0});y.then(a=>d(a)).then(a=>{F();const o=a.data[0].children.map(t=>t.values),n=o[o.length-2],r=o[o.length-1],s=new Float32Array(n.length);for(let t=0;t<n.length;t++)s[t]=1;e.draw({x:o[0],y:o[1],z:r,w:n}),e.set({colorBy:"z",pointColor:m,opacityBy:"w",opacity:Array.from({length:10},(t,l)=>.33+l/9*.33)});let i=0;const c=()=>{i++;const t=i%3*2;e.draw({x:o[t],y:o[t+1],z:r,w:[n,s,s][i%3]},{transition:!0,transitionDuration:750,transitionEasing:"quadInOut"}).then(()=>{setTimeout(c,2500)})};setTimeout(c,2500)});
