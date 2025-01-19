import{c as u,a as y,b as i}from"./menu-D496VOBB.js";import"./vendor-CWN1LCVq.js";const b=document.querySelector("#canvas");let e={x:[],y:[],z:[],w:[]},$=1e5,d=2,m=.33,c=[];const g=10,f=2,p=!0,v=[1,1,.878431373,.33],w=o=>{const s=e.x[o],a=e.y[o],n=e.z[o],r=e.w[o];console.log(`Out point: ${o}`,`X: ${s}
Y: ${a}
Category: ${n}
Value: ${r}`)},x=o=>{const s=e.x[o],a=e.y[o],n=e.z[o],r=e.w[o];console.log(`Out point: ${o}`,`X: ${s}
Y: ${a}
Category: ${n}
Value: ${r}`)},M=({points:o})=>{if(c=o,c.length===1){const s=e.x[c[0]],a=e.y[c[0]],n=e.z[c[0]],r=e.w[c[0]];console.log(`Selected: ${o}`,`X: ${s}
Y: ${a}
Category: ${n}
Value: ${r}`)}},C=()=>{console.log("Deselected:",c),c=[]},t=u({canvas:b,lassoMinDelay:g,lassoMinDist:f,pointSize:d,showReticle:p,reticleColor:v,opacity:m,lassoOnLongPress:!0,lassoType:"brush"});y(t);console.log(`Scatterplot v${t.get("version")}`);t.subscribe("pointover",w);t.subscribe("pointout",x);t.subscribe("select",M);t.subscribe("deselect",C);const S=o=>({x:Array.from({length:o},()=>-1+Math.random()*2),y:Array.from({length:o},()=>-1+Math.random()*2),z:Array.from({length:o},()=>Math.round(Math.random())),w:Array.from({length:o},()=>Math.random())}),l=o=>{e=S($),t.draw(e)};i({scatterplot:t,setNumPoints:l});const h=["#3a78aa","#aa3a99"];t.set({colorBy:"category",pointColor:h});const z=["#002072","#162b79","#233680","#2e4186","#394d8d","#425894","#4b649a","#5570a1","#5e7ca7","#6789ae","#7195b4","#7ba2ba","#85aec0","#90bbc6","#9cc7cc","#a9d4d2","#b8e0d7","#c8ecdc","#ddf7df","#ffffe0"];t.set({colorBy:"value",pointColor:z});l();
