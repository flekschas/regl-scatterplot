import{c as q,a as H,s as k}from"./utils.334633c7.js";import"./vendor.cfd24b35.js";const I=document.querySelector("#canvas"),u=document.querySelector("#num-points"),v=document.querySelector("#num-points-value"),y=document.querySelector("#point-size"),P=document.querySelector("#point-size-value"),g=document.querySelector("#opacity"),C=document.querySelector("#opacity-value"),S=document.querySelector("#click-lasso-initiator"),z=document.querySelector("#reset"),w=document.querySelector("#export"),h=document.querySelector("#example-transition");h.setAttribute("class","active");h.removeAttribute("href");let o=[],i=[],s=1e5,a=2,c=.33,r=[];const $=10,A=2,T=!0,D=[1,1,.878431373,.33],V=({points:t})=>{if(console.log("Selected:",t),r=t,r.length===1){const n=o[r[0]];console.log(`X: ${n[0]}
Y: ${n[1]}
Category: ${n[2]}
Value: ${n[3]}`)}},x=()=>{console.log("Deselected:",r),r=[]},e=q({canvas:I,lassoMinDelay:$,lassoMinDist:A,pointSize:a,showReticle:T,reticleColor:D,lassoInitiator:!0});H(e);w.addEventListener("click",()=>k(e));console.log(`Scatterplot v${e.get("version")}`);e.subscribe("select",V);e.subscribe("deselect",x);const B=t=>[...new Array(Math.round(t/2)).fill().map(()=>[-1+Math.random(),-1+Math.random()*2/3,0,Math.random()*.33]),...new Array(Math.round(t/2)).fill().map(()=>[Math.random(),-1+Math.random()*2,1,.66+Math.random()*.33])],E=t=>{s=t,u.value=s,v.innerHTML=s,o=B(s),i=[o,o.map(([n,d,p,m],b)=>b<o.length/2?[n,(d+1)*3-1,p,m+.66]:[n,(d+1)/3-1,p,m-.66])],e.draw(o)},O=t=>{v.innerHTML=`${+t.target.value} <em>release to redraw</em>`};u.addEventListener("input",O);const N=t=>E(+t.target.value);u.addEventListener("change",N);const f=t=>{a=t,y.value=a,P.innerHTML=a,e.set({pointSize:a})},R=t=>f(+t.target.value);y.addEventListener("input",R);const M=t=>{c=t,g.value=c,C.innerHTML=c,e.set({opacity:c})},X=t=>M(+t.target.value);g.addEventListener("input",X);const Y=t=>{e.set({lassoInitiator:t.target.checked})};S.addEventListener("change",Y);S.checked=e.get("lassoInitiator");const j=()=>{e.reset()};z.addEventListener("click",j);const F=["#3a78aa","#aa3a99"];e.set({colorBy:"category",pointColor:F});const G=["#ff80cb","#df80b8","#bf80a5","#9f8092","#808080","#75919f","#6ba3bf","#61b5df","#57c7ff"];e.set({colorBy:"value",pointColor:G});f(a);M(c);E(s);let l=0;const L=()=>{l++,e.draw(i[l%i.length],{transition:!0,transitionDuration:1e3-(l-1)%5*150,transitionEasing:"quadInOut"}).then(()=>{setTimeout(L,+!(l%5)*3e3)})};L();
