import{c as z,a as A,b as E}from"./menu-CKBxhbUC.js";import{l as C,a as I,b as P,s as $}from"./d3-IoKfXBi0.js";import"./vendor-DRFCw67i.js";const f=document.querySelector("#parent-wrapper"),x=document.querySelector("#canvas-wrapper"),B=document.querySelector("#canvas"),s=document.createElement("div");s.style.cssText=`
  position: absolute;
  top: 10px;
  left: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  max-width: 400px;
  max-height: calc(100vh - 20px);
  overflow-y: auto;
  z-index: 1000;
`;f.appendChild(s);const L=[0,100],D=[0,100],w=C().domain(L),M=C().domain(D),p=I(w),u=P(M),c=$(f).append("svg"),m=c.append("g"),y=c.append("g"),q=20,H=40;c.node().style.position="absolute";c.node().style.top=0;c.node().style.left=0;c.node().style.width="100%";c.node().style.height="100%";c.node().style.pointerEvents="none";x.style.right=`${H}px`;x.style.bottom=`${q}px`;let{width:h,height:g}=x.getBoundingClientRect();m.attr("transform",`translate(0, ${g})`).call(p);y.attr("transform",`translate(${h}, 0)`).call(u);p.tickSizeInner(-g);u.tickSizeInner(-h);let v=[],N=5e3,T=4,W=.66;const j=({points:n})=>{console.log("Selected:",n.length,"points")},F=()=>{console.log("Deselected")},e=z({canvas:B,pointSize:T,opacity:W,xScale:w,yScale:M,showReticle:!0,lassoInitiator:!0,pointColor:[.33,.5,1,1],pointColorActive:[1,.5,0,1]});A(e);console.log(`Scatterplot v${e.get("version")}`);e.subscribe("select",j);e.subscribe("deselect",F);e.subscribe("view",n=>{m.call(p.scale(n.xScale)),y.call(u.scale(n.yScale))});e.subscribe("init",()=>{m.call(p.scale(e.get("xScale"))),y.call(u.scale(e.get("yScale")))},1);const R=()=>{({width:h,height:g}=x.getBoundingClientRect()),m.attr("transform",`translate(0, ${g})`).call(p),y.attr("transform",`translate(${h}, 0)`).call(u),p.tickSizeInner(-g),u.tickSizeInner(-h)};window.addEventListener("resize",R);window.addEventListener("orientationchange",R);const G=n=>{const l=[];for(let i=0;i<n;i++){const t=Math.random()*100,d=Math.random()*100,a=t/100*2-1,o=d/100*2-1;l.push([a,o,Math.round(Math.random()*4),Math.random(),t,d])}return l},k=n=>{v=G(n),e.draw(v)};E({scatterplot:e,setNumPoints:k});e.set({colorBy:"category",pointColor:["#3a84cc","#56bf92","#eecb62","#c76526","#d192b7"]});const r=(n,l,i=!1)=>{const t=document.createElement("button");return t.textContent=n,t.style.cssText=`
    padding: 6px 10px;
    background: #3a84cc;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
    white-space: nowrap;
    text-align: center;
    ${i?"grid-column: 1 / -1;":""}
  `,t.addEventListener("mouseenter",()=>{t.style.background="#2a6cb0"}),t.addEventListener("mouseleave",()=>{t.style.background="#3a84cc"}),t.addEventListener("click",l),t};s.appendChild(r("△ Bottom-Left",()=>{e.lassoSelect([[10,10],[40,10],[10,40]])}));s.appendChild(r("○ Top-Right",()=>{const d=[];for(let a=0;a<16;a++){const o=a/16*Math.PI*2;d.push([75+Math.cos(o)*20,75+Math.sin(o)*20])}e.lassoSelect(d)}));s.appendChild(r("▭ Center",()=>{e.lassoSelect([[30,30],[70,30],[70,70],[30,70]])}));s.appendChild(r("+ Diagonal (Merge)",()=>{e.lassoSelect([[0,40],[60,100],[70,100],[10,40]],{merge:!0})}));s.appendChild(r("− Center (Remove)",()=>{e.lassoSelect([[40,40],[60,40],[60,60],[40,60]],{remove:!0})}));s.appendChild(r("★ Star",()=>{const a=[];for(let o=0;o<10;o++){const b=o/10*Math.PI*2-Math.PI/2,S=o%2===0?30:15;a.push([50+Math.cos(b)*S,50+Math.sin(b)*S])}e.lassoSelect(a)}));s.appendChild(r("✕ Deselect All",()=>{e.deselect()},!0));k(N);
