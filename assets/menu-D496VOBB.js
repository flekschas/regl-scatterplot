import{g as ji,h as za,i as ka,l as $a,q as Ua,j as Va,k as Wa,p as Ha,m as et,w as Ya,n as Ni,t as Ki,o as Ga,r as $t,s as To,u as Za,v as ja,f as Ka,x as qa,y as Xa,z as Ja,A as Po,C as lt,D as Cn,E as cn,F as Qa,G as Co,H as ec,I as tc,J as Mi,K as Bi,L as nc,M as oc,V as ic,N as sc,O as vn,P as rc,Q as ac}from"./vendor-CWN1LCVq.js";(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const d of document.querySelectorAll('link[rel="modulepreload"]'))m(d);new MutationObserver(d=>{for(const c of d)if(c.type==="childList")for(const C of c.addedNodes)C.tagName==="LINK"&&C.rel==="modulepreload"&&m(C)}).observe(document,{childList:!0,subtree:!0});function i(d){const c={};return d.integrity&&(c.integrity=d.integrity),d.referrerPolicy&&(c.referrerPolicy=d.referrerPolicy),d.crossOrigin==="use-credentials"?c.credentials="include":d.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function m(d){if(d.ep)return;d.ep=!0;const c=i(d);fetch(d.href,c)}})();/**
 * KDBush - A fast static index for 2D points
 * @license ISC License
 * @copyright Vladimir Agafonkin 2018
 * @version 4.0.2
 * @see https://github.com/mourner/kdbush/
 */const qi=()=>{const t=[Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array],o=1,i=8;class m{static from(r){if(!(r instanceof ArrayBuffer))throw new Error("Data must be an instance of ArrayBuffer.");const[u,a]=new Uint8Array(r,0,2);if(u!==219)throw new Error("Data does not appear to be in a KDBush format.");const y=a>>4;if(y!==o)throw new Error(`Got v${y} data when expected v${o}.`);const p=t[a&15];if(!p)throw new Error("Unrecognized array type.");const[I]=new Uint16Array(r,2,1),[T]=new Uint32Array(r,4,1);return new m(T,I,p,r)}constructor(r,u=64,a=Float64Array,y){if(isNaN(r)||r<0)throw new Error(`Unexpected numItems value: ${r}.`);this.numItems=+r,this.nodeSize=Math.min(Math.max(+u,2),65535),this.ArrayType=a,this.IndexArrayType=r<65536?Uint16Array:Uint32Array;const p=t.indexOf(this.ArrayType),I=r*2*this.ArrayType.BYTES_PER_ELEMENT,T=r*this.IndexArrayType.BYTES_PER_ELEMENT,A=(8-T%8)%8;if(p<0)throw new Error(`Unexpected typed array class: ${a}.`);y&&y instanceof ArrayBuffer?(this.data=y,this.ids=new this.IndexArrayType(this.data,i,r),this.coords=new this.ArrayType(this.data,i+T+A,r*2),this._pos=r*2,this._finished=!0):(this.data=new ArrayBuffer(i+I+T+A),this.ids=new this.IndexArrayType(this.data,i,r),this.coords=new this.ArrayType(this.data,i+T+A,r*2),this._pos=0,this._finished=!1,new Uint8Array(this.data,0,2).set([219,(o<<4)+p]),new Uint16Array(this.data,2,1)[0]=u,new Uint32Array(this.data,4,1)[0]=r)}add(r,u){const a=this._pos>>1;return this.ids[a]=a,this.coords[this._pos++]=r,this.coords[this._pos++]=u,a}finish(){const r=this._pos>>1;if(r!==this.numItems)throw new Error(`Added ${r} items when expected ${this.numItems}.`);return d(this.ids,this.coords,this.nodeSize,0,this.numItems-1,0),this._finished=!0,this}range(r,u,a,y){if(!this._finished)throw new Error("Data not yet indexed - call index.finish().");const{ids:p,coords:I,nodeSize:T}=this,A=[0,p.length-1,0],P=[];for(;A.length;){const b=A.pop()||0,R=A.pop()||0,G=A.pop()||0;if(R-G<=T){for(let U=G;U<=R;U++){const de=I[2*U],me=I[2*U+1];de>=r&&de<=a&&me>=u&&me<=y&&P.push(p[U])}continue}const W=G+R>>1,_=I[2*W],z=I[2*W+1];_>=r&&_<=a&&z>=u&&z<=y&&P.push(p[W]),(b===0?r<=_:u<=z)&&(A.push(G),A.push(W-1),A.push(1-b)),(b===0?a>=_:y>=z)&&(A.push(W+1),A.push(R),A.push(1-b))}return P}within(r,u,a){if(!this._finished)throw new Error("Data not yet indexed - call index.finish().");const{ids:y,coords:p,nodeSize:I}=this,T=[0,y.length-1,0],A=[],P=a*a;for(;T.length;){const b=T.pop()||0,R=T.pop()||0,G=T.pop()||0;if(R-G<=I){for(let U=G;U<=R;U++)B(p[2*U],p[2*U+1],r,u)<=P&&A.push(y[U]);continue}const W=G+R>>1,_=p[2*W],z=p[2*W+1];B(_,z,r,u)<=P&&A.push(y[W]),(b===0?r-a<=_:u-a<=z)&&(T.push(G),T.push(W-1),T.push(1-b)),(b===0?r+a>=_:u+a>=z)&&(T.push(W+1),T.push(R),T.push(1-b))}return A}}function d(f,r,u,a,y,p){if(y-a<=u)return;const I=a+y>>1;c(f,r,I,a,y,p),d(f,r,u,a,I-1,1-p),d(f,r,u,I+1,y,1-p)}function c(f,r,u,a,y,p){for(;y>a;){if(y-a>600){const P=y-a+1,b=u-a+1,R=Math.log(P),G=.5*Math.exp(2*R/3),W=.5*Math.sqrt(R*G*(P-G)/P)*(b-P/2<0?-1:1),_=Math.max(a,Math.floor(u-b*G/P+W)),z=Math.min(y,Math.floor(u+(P-b)*G/P+W));c(f,r,u,_,z,p)}const I=r[2*u+p];let T=a,A=y;for(C(f,r,a,u),r[2*y+p]>I&&C(f,r,a,y);T<A;){for(C(f,r,T,A),T++,A--;r[2*T+p]<I;)T++;for(;r[2*A+p]>I;)A--}r[2*a+p]===I?C(f,r,a,A):(A++,C(f,r,A,y)),A<=u&&(a=A+1),u<=A&&(y=A-1)}}function C(f,r,u,a){D(f,u,a),D(r,2*u,2*a),D(r,2*u+1,2*a+1)}function D(f,r,u){const a=f[r];f[r]=f[u],f[u]=a}function B(f,r,u,a){const y=f-u,p=r-a;return y*y+p*p}return m},cc=()=>{addEventListener("message",t=>{const o=t.data.points;o.length===0&&self.postMessage({error:new Error("Invalid point data")});const i=new KDBush(o.length,t.data.nodeSize);for(const[m,d]of o)i.add(m,d);i.finish(),postMessage(i.data,[i.data])})},vo=qi(),lc=1e6,dc=t=>{const o=qi.toString(),i=t.toString(),m=`const createKDBushClass = ${o};KDBush = createKDBushClass();const createWorker = ${i};createWorker();`;return new Worker(window.URL.createObjectURL(new Blob([m],{type:"text/javascript"})))},uc=(t,o={nodeSize:16,useWorker:void 0})=>new Promise((i,m)=>{if(t instanceof ArrayBuffer)i(vo.from(t));else if((t.length<lc||o.useWorker===!1)&&o.useWorker!==!0){const d=new vo(t.length,o.nodeSize);for(const c of t)d.add(c[0],c[1]);d.finish(),i(d)}else{const d=dc(cc);d.onmessage=c=>{c.data.error?m(c.data.error):i(vo.from(c.data)),d.terminate()},d.postMessage({points:t,nodeSize:o.nodeSize})}}),fc=!0,mc=8,hc=2,gc="freeform",yc=24,pc=2500,Ec=250,Ge="auto",xc=0,bo=1,wc=2,Fi=3,Sc=4,Ac=Float32Array.BYTES_PER_ELEMENT,Xi=["OES_texture_float","OES_element_index_uint","WEBGL_color_buffer_float","EXT_float_blend"],zi={color:[0,0,0,0],depth:1},_n="panZoom",Ji="lasso",Ho="rotate",ki=[_n,Ji,Ho],Ic=_n,Tc={cubicIn:za,cubicInOut:ji,cubicOut:ka,linear:$a,quadIn:Ua,quadInOut:Va,quadOut:Wa},$i=ji,Ye="continuous",un="categorical",Ui=[Ye,un],Yo="deselect",Zo="lassoEnd",Pc=[Yo,Zo],Vi=3,Cc=[0,.666666667,1,1],vc=2,bc=!1,_c=10,Lc=3,Oc=Zo,Dc=!1,Ln=750,On=500,Dn=100,Rn=250,Rc=24,jo="lasso",Nn="rotate",Mn="merge",Bn="remove",Nc=[jo,Nn,Mn,Bn],Fn="alt",Ko="cmd",Qi="ctrl",es="meta",qo="shift",Mc=[Fn,Ko,Qi,es,qo],Bc={[Bn]:Fn,[Nn]:Fn,[jo]:qo,[Mn]:Ko},Fc=1,zc=Ge,kc=Ge,$c=1,_o=1,Uc="asinh",Vc=6,Wc=2,Hc=2,Lo=null,Yc=2,Gc=2,Oo=null,Zc=null,Do=null,jc=.66,Kc=1,Ro=null,qc=.15,Xc=25,Jc=1,Qc=1,ln=null,el=[.66,.66,.66,Kc],tl=[0,.55,1,1],nl=[1,1,1,1],ol=[0,0,0,1],No=null,il=[.66,.66,.66,.2],sl=[0,.55,1,1],rl=[1,1,1,1],al=[1,1,1,.5],cl=1,ll=1e3,dl=[0,0],ul=1,fl=0,ml=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),hl="IMAGE_LOAD_ERROR",gl=null,yl=!1,pl=[1,1,1,.5],El=!0,xl=!0,wl=!1,Sl=100,Al=1/500,Il="auto",Tl=!1,Pl=200,Cl=500,ts=new Set(["z","valueZ","valueA","value1","category"]),ns=new Set(["w","valueW","valueB","value2","value"]),Xo=15e3,vl=void 0,bl=!1,_l=.5,Ll=!1,Ol="lasso",os=Symbol("SKIP_DEPRECATION_VALUE_TRANSLATION"),Wi="Points have not been drawn",Mo="The instance was already destroyed",Dl="Ignoring draw call as the previous draw call has not yet finished. To avoid this warning `await` the draw call.",Rl=(t,o,i)=>(1-t)*o+i,Nl=(t,o)=>`${t}ms ease-out mainIn ${o}ms 1 normal forwards`,Ml=(t,o)=>`${t}ms ease-out effectIn ${o}ms 1 normal forwards`,Bl=(t,o)=>`${t}ms linear leftSpinIn ${o}ms 1 normal forwards`,Fl=(t,o)=>`${t}ms linear rightSpinIn ${o}ms 1 normal forwards`,zl=(t,o)=>`${t}ms linear circleIn ${o}ms 1 normal forwards`,kl=(t,o,i)=>`
  @keyframes mainIn {
    0% {
      color: ${o};
      opacity: 0;
    }
    0%, ${t}% {
      color: ${o};
      opacity: 1;
    }
    100% {
      color: ${i};
      opacity: 0.8;
    }
  }
`,$l=(t,o,i,m)=>`
  @keyframes effectIn {
    0%, ${t}% {
      opacity: ${i};
      transform: scale(${m});
    }
    ${o}% {
      opacity: 0.66;
      transform: scale(1.5);
    }
    99% {
      opacity: 0;
      transform: scale(2);
    }
    100% {
      opacity: 0;
      transform: scale(0);
    }
  }
`,Ul=(t,o,i)=>`
  @keyframes circleIn {
    0% {
      clip-path: ${o};
      opacity: ${i};
    }
    ${t}% {
      clip-path: ${o};
      opacity: 1;
    }
    ${t+.01}%, 100% {
      clip-path: inset(0);
      opacity: 1;
    }
  }
`,Vl=(t,o)=>`
  @keyframes leftSpinIn {
    0% {
      transform: rotate(${o}deg);
    }
    ${t}%, 100% {
      transform: rotate(360deg);
    }
  }
`,Wl=(t,o)=>`
  @keyframes rightSpinIn {
    0% {
      transform: rotate(${o}deg);
    }
    ${t}%, 100% {
      transform: rotate(180deg);
    }
  }
`,Hl=({time:t=Ln,extraTime:o=On,delay:i=Dn,currentColor:m,targetColor:d,effectOpacity:c,effectScale:C,circleLeftRotation:D,circleRightRotation:B,circleClipPath:f,circleOpacity:r})=>{const u=D/360,a=Rl(u,t,o),y=Math.round((1-u)*t/a*100),p=Math.round(y/2),I=y+(100-y)/4;return{rules:{main:kl(y,m,d),effect:$l(y,I,c,C),circleRight:Wl(p,B),circleLeft:Vl(y,D),circle:Ul(p,f,r)},names:{main:Nl(a,i),effect:Ml(a,i),circleLeft:Bl(a,i),circleRight:Fl(a,i),circle:zl(a,i)}}},Yl=t=>`${t}ms linear mainOut 0s 1 normal forwards`,Gl=t=>`${t}ms linear effectOut 0s 1 normal forwards`,Zl=t=>`${t}ms linear leftSpinOut 0s 1 normal forwards`,jl=t=>`${t}ms linear rightSpinOut 0s 1 normal forwards`,Kl=t=>`${t}ms linear circleOut 0s 1 normal forwards`,ql=(t,o)=>`
  @keyframes mainOut {
    0% {
      color: ${t};
    }
    100% {
      color: ${o};
    }
  }
`,Xl=(t,o)=>`
  @keyframes effectOut {
    0% {
      opacity: ${t};
      transform: scale(${o});
    }
    99% {
      opacity: 0;
      transform: scale(${o+.5});
    }
    100% {
      opacity: 0;
      transform: scale(0);
    }
  }
`,Jl=(t,o)=>`
  @keyframes rightSpinOut {
    0%, ${t}% {
      transform: rotate(${o}deg);
    }
    100% {
      transform: rotate(0deg);
    }
`,Ql=t=>`
  @keyframes leftSpinOut {
    0% {
      transform: rotate(${t}deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
`,ed=(t,o,i)=>`
  @keyframes circleOut {
    0%, ${t}% {
      clip-path: ${o};
      opacity: ${i};
    }
    ${t+.01}% {
      clip-path: inset(0 0 0 50%);
      opacity: ${i};
    }
    100% {
      clip-path: inset(0 0 0 50%);
      opacity: 0;
    }
  }
`,td=({time:t=Rn,currentColor:o,targetColor:i,effectOpacity:m,effectScale:d,circleLeftRotation:c,circleRightRotation:C,circleClipPath:D,circleOpacity:B})=>{const f=c/360,r=f*t,u=Math.min(100,f*100),a=u>50?Math.round((1-50/u)*100):0;return{rules:{main:ql(o,i),effect:Xl(m,d),circleRight:Jl(a,C),circleLeft:Ql(c),circle:ed(a,D,B)},names:{main:Yl(r),effect:Gl(r),circleRight:Zl(r),circleLeft:jl(r),circle:Kl(r)}}},nd=()=>{const t=document.createElement("div"),o=Math.random().toString(36).substring(2,5)+Math.random().toString(36).substring(2,5);t.id=`lasso-long-press-${o}`,t.style.position="fixed",t.style.width="1.25rem",t.style.height="1.25rem",t.style.pointerEvents="none",t.style.transform="translate(-50%,-50%)";const i=document.createElement("div");i.style.position="absolute",i.style.top=0,i.style.left=0,i.style.width="1.25rem",i.style.height="1.25rem",i.style.clipPath="inset(0px 0px 0px 50%)",i.style.opacity=0,t.appendChild(i);const m=document.createElement("div");m.style.position="absolute",m.style.top=0,m.style.left=0,m.style.width="0.8rem",m.style.height="0.8rem",m.style.border="0.2rem solid currentcolor",m.style.borderRadius="0.8rem",m.style.clipPath="inset(0px 50% 0px 0px)",m.style.transform="rotate(0deg)",i.appendChild(m);const d=document.createElement("div");d.style.position="absolute",d.style.top=0,d.style.left=0,d.style.width="0.8rem",d.style.height="0.8rem",d.style.border="0.2rem solid currentcolor",d.style.borderRadius="0.8rem",d.style.clipPath="inset(0px 50% 0px 0px)",d.style.transform="rotate(0deg)",i.appendChild(d);const c=document.createElement("div");return c.style.position="absolute",c.style.top=0,c.style.left=0,c.style.width="1.25rem",c.style.height="1.25rem",c.style.borderRadius="1.25rem",c.style.background="currentcolor",c.style.transform="scale(0)",c.style.opacity=0,t.appendChild(c),{longPress:t,longPressCircle:i,longPressCircleLeft:m,longPressCircleRight:d,longPressEffect:c}},dt=(t,o=null)=>t===null?o:t;let Bo;const is=()=>{if(!Bo){const t=document.createElement("style");document.head.appendChild(t),Bo=t.sheet}return Bo},ve=t=>{const o=is(),i=o.rules.length;return o.insertRule(t,i),i},be=t=>{is().deleteRule(t)},od=`${pc}ms ease scaleInFadeOut 0s 1 normal backwards`,id=(t,o,i)=>`
@keyframes scaleInFadeOut {
  0% {
    opacity: ${t};
    transform: translate(-50%,-50%) scale(${o}) rotate(${i}deg);
  }
  10% {
    opacity: 1;
    transform: translate(-50%,-50%) scale(1) rotate(${i+20}deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%,-50%) scale(0.9) rotate(${i+60}deg);
  }
}
`;let Fo=null;const sd=`${Ec}ms ease fadeScaleOut 0s 1 normal backwards`,rd=(t,o,i)=>`
@keyframes fadeScaleOut {
  0% {
    opacity: ${t};
    transform: translate(-50%,-50%) scale(${o}) rotate(${i}deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%,-50%) scale(0) rotate(${i}deg);
  }
}
`;let zo=null;const ss=(t,{onDraw:o=et,onStart:i=et,onEnd:m=et,enableInitiator:d=fc,initiatorParentElement:c=document.body,longPressIndicatorParentElement:C=document.body,minDelay:D=mc,minDist:B=hc,pointNorm:f=et,type:r=gc,brushSize:u=yc}={})=>{let a=d,y=c,p=C,I=o,T=i,A=m,P=D,b=B,R=f,G=r,W=u;const _=document.createElement("div"),z=Math.random().toString(36).substring(2,5)+Math.random().toString(36).substring(2,5);_.id=`lasso-initiator-${z}`,_.style.position="fixed",_.style.display="flex",_.style.justifyContent="center",_.style.alignItems="center",_.style.zIndex=99,_.style.width="4rem",_.style.height="4rem",_.style.borderRadius="4rem",_.style.opacity=.5,_.style.transform="translate(-50%,-50%) scale(0) rotate(0deg)";const{longPress:U,longPressCircle:de,longPressCircleLeft:me,longPressCircleRight:xe,longPressEffect:ue}=nd();let Le=!1,Pe=!1,ne=[],V=[],ee=[],oe=[],ye,te=!1,ae=null,ce=null,Oe=null,J=null,De=null,ht=null,ie=null,gt=null,Re=null,yt=null;const vt=()=>{Le=!1},H=w=>{const{left:O,top:F}=t.getBoundingClientRect();return[w.clientX-O,w.clientY-F]};window.addEventListener("mouseup",vt);const ke=()=>{_.style.opacity=.5,_.style.transform="translate(-50%,-50%) scale(0) rotate(0deg)"},we=(w,O)=>{const F=getComputedStyle(w),k=+F.opacity,N=F.transform.match(/([0-9.-]+)+/g),L=+N[0],Y=+N[1],q=Math.sqrt(L*L+Y*Y);let $=Math.atan2(Y,L)*(180/Math.PI);return $=O&&$<=0?360+$:$,{opacity:k,scale:q,rotate:$}},Ze=w=>{if(!a||Le)return;const O=w.clientX,F=w.clientY;_.style.top=`${F}px`,_.style.left=`${O}px`;const k=we(_),N=k.opacity,L=k.scale,Y=k.rotate;_.style.opacity=N,_.style.transform=`translate(-50%,-50%) scale(${L}) rotate(${Y}deg)`,_.style.animation="none",$t().then(()=>{Fo!==null&&be(Fo),Fo=ve(id(N,L,Y)),_.style.animation=od,$t().then(()=>{ke()})})},j=()=>{const{opacity:w,scale:O,rotate:F}=we(_);_.style.opacity=w,_.style.transform=`translate(-50%,-50%) scale(${O}) rotate(${F}deg)`,_.style.animation="none",$t(2).then(()=>{zo!==null&&be(zo),zo=ve(rd(w,O,F)),_.style.animation=sd,$t().then(()=>{ke()})})},Se=(w,O,{time:F=Ln,extraTime:k=On,delay:N=Dn}={time:Ln,extraTime:On,delay:Dn})=>{te=!0;const L=getComputedStyle(U);U.style.color=L.color,U.style.top=`${O}px`,U.style.left=`${w}px`,U.style.animation="none";const Y=getComputedStyle(de);de.style.clipPath=Y.clipPath,de.style.opacity=Y.opacity,de.style.animation="none";const q=we(ue);ue.style.opacity=q.opacity,ue.style.transform=`scale(${q.scale})`,ue.style.animation="none";const $=we(me);me.style.transform=`rotate(${$.rotate}deg)`,me.style.animation="none";const K=we(xe);xe.style.transform=`rotate(${K.rotate}deg)`,xe.style.animation="none",$t().then(()=>{if(!te)return;De!==null&&be(De),J!==null&&be(J),Oe!==null&&be(Oe),ce!==null&&be(ce),ae!==null&&be(ae);const{rules:X,names:se}=Hl({time:F,extraTime:k,delay:N,currentColor:L.color||"currentcolor",targetColor:U.dataset.activeColor,effectOpacity:q.opacity||0,effectScale:q.scale||0,circleLeftRotation:$.rotate||0,circleRightRotation:K.rotate||0,circleClipPath:Y.clipPath||"inset(0 0 0 50%)",circleOpacity:Y.opacity||0});ae=ve(X.main),ce=ve(X.effect),Oe=ve(X.circleLeft),J=ve(X.circleRight),De=ve(X.circle),U.style.animation=se.main,ue.style.animation=se.effect,me.style.animation=se.circleLeft,xe.style.animation=se.circleRight,de.style.animation=se.circle})},Ut=({time:w=Rn}={time:Rn})=>{if(!te)return;te=!1;const O=getComputedStyle(U);U.style.color=O.color,U.style.animation="none";const F=getComputedStyle(de);de.style.clipPath=F.clipPath,de.style.opacity=F.opacity,de.style.animation="none";const k=we(ue);ue.style.opacity=k.opacity,ue.style.transform=`scale(${k.scale})`,ue.style.animation="none";const N=F.clipPath.slice(-2,-1)==="x",L=we(me,N);me.style.transform=`rotate(${L.rotate}deg)`,me.style.animation="none";const Y=we(xe);xe.style.transform=`rotate(${Y.rotate}deg)`,xe.style.animation="none",$t().then(()=>{yt!==null&&be(yt),Re!==null&&be(Re),gt!==null&&be(gt),ie!==null&&be(ie),ht!==null&&be(ht);const{rules:q,names:$}=td({time:w,currentColor:O.color||"currentcolor",targetColor:U.dataset.color,effectOpacity:k.opacity||0,effectScale:k.scale||0,circleLeftRotation:L.rotate||0,circleRightRotation:Y.rotate||0,circleClipPath:F.clipPath||"inset(0px)",circleOpacity:F.opacity||1});ht=ve(q.main),ie=ve(q.effect),gt=ve(q.circleLeft),Re=ve(q.circleRight),yt=ve(q.circle),U.style.animation=$.main,ue.style.animation=$.effect,me.style.animation=$.circleLeft,xe.style.animation=$.circleRight,de.style.animation=$.circle})},bt=()=>{I(ne,V)},je=w=>{ne.push(w),V.push(w[0],w[1])},$e=w=>{const[O,F]=w,[k,N]=ne[0];ne[1]=[O,N],ne[2]=[O,F],ne[3]=[k,F],ne[4]=[k,N],V[2]=O,V[3]=N,V[4]=O,V[5]=F,V[6]=k,V[7]=F,V[8]=k,V[9]=N},tt=w=>{ee.push(w)},Ae=()=>Math.abs(R([0,0])[0]-R([W/2,0])[0]),Ce=(w,O,F)=>{const[k,N]=w,[L,Y]=O,q=k-L,$=N-Y,K=Za([q,$]);return[+$/K*F,-q/K*F]},_t=w=>{const O=ee.at(-1),F=Ae();let[k,N]=Ce(w,O,F);const L=ee.length;if(L===1){const $=[O[0]+k,O[1]+N],K=[O[0]-k,O[1]-N];ne.push($,K),V.push($[0],$[1],K[0],K[1]),oe.push([k,N])}else{const $=ee.at(-2),[K,X]=oe.at(-1),se=To(w[0],w[1],O[0],O[1]),Ht=To(O[0],O[1],$[0],$[1]),Te=Math.max(0,Math.min(1,2/3/(Ht/se)));k=Te*k+(1-Te)*K,N=Te*N+(1-Te)*X;const Ve=(k+K)/2,Xe=(N+X)/2,Je=[O[0]+Ve,O[1]+Xe],nt=[O[0]-Ve,O[1]-Xe];ne.splice(L-1,2,Je,nt),V.splice(2*(L-1),4,Je[0],Je[1],nt[0],nt[1]),oe.splice(L,1,[Ve,Xe])}const Y=[w[0]+k,w[1]+N],q=[w[0]-k,w[1]-N];ne.splice(L,0,Y,q),V.splice(2*L,0,Y[0],Y[1],q[0],q[1]),ee.push(w),oe.push([k,N])};let Ke=je,Ne=je;const Ue=w=>{if(ye)To(w[0],w[1],ye[0],ye[1])>b&&(ye=w,Ke(R(w)),ne.length>1&&bt());else{Pe||(Pe=!0,T()),ye=w;const O=R(w);Ne(O)}},Ie=Ki(Ue,P,P),Me=(w,O)=>{const F=H(w);return O?Ie(F):Ue(F)},pt=()=>{ne=[],V=[],ee=[],oe=[],ye=void 0,bt()},Vt=w=>{Ze(w)},Wt=()=>{Le=!0,Pe=!0,pt(),T()},Et=()=>{j()},fn=({merge:w=!1,remove:O=!1}={})=>{Pe=!1;const F=[...ne],k=[...V];return Ie.cancel(),pt(),F.length>0&&A(F,k,{merge:w,remove:O}),F},Lt=w=>{switch(w){case"rectangle":{G=w,Ke=$e,Ne=je;break}case"brush":{G=w,Ke=_t,Ne=tt;break}default:{G="freeform",Ke=je,Ne=je;break}}},qe=w=>{if(w==="onDraw")return I;if(w==="onStart")return T;if(w==="onEnd")return A;if(w==="enableInitiator")return a;if(w==="minDelay")return P;if(w==="minDist")return b;if(w==="pointNorm")return R;if(w==="type")return G;if(w==="brushSize")return W},Ot=({onDraw:w=null,onStart:O=null,onEnd:F=null,enableInitiator:k=null,initiatorParentElement:N=null,longPressIndicatorParentElement:L=null,minDelay:Y=null,minDist:q=null,pointNorm:$=null,type:K=null,brushSize:X=null}={})=>{I=dt(w,I),T=dt(O,T),A=dt(F,A),a=dt(k,a),P=dt(Y,P),b=dt(q,b),R=dt($,R),W=dt(X,W),N!==null&&N!==y&&(y.removeChild(_),N.appendChild(_),y=N),L!==null&&L!==p&&(p.removeChild(U),L.appendChild(U),p=L),a?(_.addEventListener("click",Vt),_.addEventListener("mousedown",Wt),_.addEventListener("mouseleave",Et)):(_.removeEventListener("mousedown",Wt),_.removeEventListener("mouseleave",Et)),K!==null&&Lt(K)},v=()=>{y.removeChild(_),p.removeChild(U),window.removeEventListener("mouseup",vt),_.removeEventListener("click",Vt),_.removeEventListener("mousedown",Wt),_.removeEventListener("mouseleave",Et)},Be=()=>w=>Ga(w,{clear:pt,destroy:v,end:fn,extend:Me,get:qe,set:Ot,showInitiator:Ze,hideInitiator:j,showLongPressIndicator:Se,hideLongPressIndicator:Ut});return y.appendChild(_),p.appendChild(U),Ot({onDraw:I,onStart:T,onEnd:A,enableInitiator:a,initiatorParentElement:y,type:G,brushSize:W}),Ha(Ni("initiator",_),Ni("longPressIndicator",U),Be(),Ya(ss))({})},ad=(t,o)=>t?Xi.reduce((i,m)=>t.hasExtension(m)?i:(console.warn(`WebGL: ${m} extension not supported. Scatterplot might not render properly`),!1),!0):!1,cd=t=>{const o=t.getContext("webgl",{antialias:!0,preserveDrawingBuffer:!0}),i=[];for(const m of Xi)o.getExtension(m)?i.push(m):console.warn(`WebGL: ${m} extension not supported. Scatterplot might not render properly`);return ja({gl:o,extensions:i})},ko=(t,o,i,m)=>Math.sqrt((t-i)**2+(o-m)**2),ld=t=>{let o=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY,m=Number.POSITIVE_INFINITY,d=Number.NEGATIVE_INFINITY;for(let c=0;c<t.length;c+=2)o=t[c]<o?t[c]:o,i=t[c]>i?t[c]:i,m=t[c+1]<m?t[c+1]:m,d=t[c+1]>d?t[c+1]:d;return[o,m,i,d]},dd=([t,o,i,m])=>Number.isFinite(t)&&Number.isFinite(o)&&Number.isFinite(i)&&Number.isFinite(m)&&i-t>0&&m-o>0,ud=/^#?([a-f\d])([a-f\d])([a-f\d])$/i,fd=(t,o=!1)=>t.replace(ud,(i,m,d,c)=>`#${m}${m}${d}${d}${c}${c}`).substring(1).match(/.{2}/g).map(i=>Number.parseInt(i,16)/255**o),ut=(t,o,{minLength:i=0}={})=>Array.isArray(t)&&t.length>=i&&t.every(o),ft=t=>!Number.isNaN(+t)&&+t>=0,bn=t=>!Number.isNaN(+t)&&+t>0,$o=(t,o)=>i=>t.indexOf(i)>=0?i:o,md=(t,o=!1,i=Xo)=>new Promise((m,d)=>{const c=new Image;o&&(c.crossOrigin="anonymous"),c.src=t,c.onload=()=>{m(c)};const C=()=>{d(new Error(hl))};c.onerror=C,setTimeout(C,i)}),Hi=(t,o,i=Xo)=>new Promise((m,d)=>{md(o,o.indexOf(window.location.origin)!==0&&o.indexOf("base64")===-1,i).then(c=>{m(t.texture(c))}).catch(c=>{d(c)})}),hd=(t,o=!1)=>[...fd(t,o),255**!o],gd=/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i,yd=t=>gd.test(t),pd=t=>t>=0&&t<=1,zn=t=>Array.isArray(t)&&t.every(pd),Ed=(t,[o,i]=[])=>{let m,d,c,C,D=!1;for(let B=0,f=t.length-2;B<t.length;B+=2)m=t[B],d=t[B+1],c=t[f],C=t[f+1],d>i!=C>i&&o<(c-m)*(i-d)/(C-d)+m&&(D=!D),f=B;return D},Go=t=>typeof t=="string"||t instanceof String,xd=t=>Number.isInteger(t)&&t>=0&&t<=255,rs=t=>Array.isArray(t)&&t.every(xd),wd=t=>t.length===3&&(zn(t)||rs(t)),Sd=t=>t.length===4&&(zn(t)||rs(t)),mt=t=>Array.isArray(t)&&t.length>0&&(Array.isArray(t[0])||Go(t[0])),Ad=(t,o)=>Array.isArray(t)&&Array.isArray(o)&&t.every(([i,m,d,c],C)=>{const[D,B,f,r]=o[C];return i===D&&m===B&&d===f&&c===r}),dn=(t,o)=>t>o?t:o,Yi=(t,o)=>t<o?t:o,he=(t,o)=>{if(Sd(t)){const i=zn(t);return o&&i||!(o||i)?t:o&&!i?t.map(m=>m/255):t.map(m=>m*255)}if(wd(t)){const i=255**!o,m=zn(t);return o&&m||!(o||m)?[...t,i]:o&&!m?[...t.map(d=>d/255),i]:[...t.map(d=>d*255),i]}return yd(t)?hd(t,o):(console.warn("Only HEX, RGB, and RGBA are handled by this function. Returning white instead."),o?[1,1,1,1]:[255,255,255,255])},Id=t=>Object.entries(t).reduce((o,[i,m])=>(o[m]?o[m]=[...o[m],i]:o[m]=i,o),{}),Gi=t=>.21*t[0]+.72*t[1]+.07*t[2],Td=(t,o,i)=>Math.min(i,Math.max(o,t)),Pd=t=>new Promise((o,i)=>{if(!t||Array.isArray(t))o(t);else{const m=Array.isArray(t.x)||ArrayBuffer.isView(t.x)?t.x.length:0,d=(Array.isArray(t.x)||ArrayBuffer.isView(t.x))&&(u=>t.x[u]),c=(Array.isArray(t.y)||ArrayBuffer.isView(t.y))&&(u=>t.y[u]),C=(Array.isArray(t.line)||ArrayBuffer.isView(t.line))&&(u=>t.line[u]),D=(Array.isArray(t.lineOrder)||ArrayBuffer.isView(t.lineOrder))&&(u=>t.lineOrder[u]),B=Object.keys(t),f=(()=>{const u=B.find(a=>ts.has(a));return u&&(Array.isArray(t[u])||ArrayBuffer.isView(t[u]))&&(a=>t[u][a])})(),r=(()=>{const u=B.find(a=>ns.has(a));return u&&(Array.isArray(t[u])||ArrayBuffer.isView(t[u]))&&(a=>t[u][a])})();d&&c&&f&&r&&C&&D?o(t.x.map((u,a)=>[u,c(a),f(a),r(a),C(a),D(a)])):d&&c&&f&&r&&C?o(Array.from({length:m},(u,a)=>[d(a),c(a),f(a),r(a),C(a)])):d&&c&&f&&r?o(Array.from({length:m},(u,a)=>[d(a),c(a),f(a),r(a)])):d&&c&&f?o(Array.from({length:m},(u,a)=>[d(a),c(a),f(a)])):d&&c?o(Array.from({length:m},(u,a)=>[d(a),c(a)])):i(new Error("You need to specify at least x and y"))}}),Cd=t=>Number.isFinite(t.y)&&!("x"in t),vd=t=>Number.isFinite(t.x)&&!("y"in t),bd=t=>Number.isFinite(t.x)&&Number.isFinite(t.y)&&Number.isFinite(t.width)&&Number.isFinite(t.height),_d=t=>Number.isFinite(t.x1)&&Number.isFinite(t.y1)&&Number.isFinite(t.x2)&&Number.isFinite(t.x2),Ld=t=>"vertices"in t&&t.vertices.length>1,Od=t=>{const o=t.length;for(let i=1;i<o;i++){const m=t[i];let d=i-1;for(;d>-1&&m<t[d];)t[d+1]=t[d],d--;t[d+1]=m}return t},Dd=(t={})=>{let{regl:o,canvas:i=document.createElement("canvas"),gamma:m=$c}=t,d=!1;o||(o=cd(i));const c=ad(o),C=[i.width,i.height],D=o.framebuffer({width:C[0],height:C[1],colorFormat:"rgba",colorType:"float"}),B=o({vert:`
      precision highp float;
      attribute vec2 xy;
      void main () {
        gl_Position = vec4(xy, 0, 1);
      }`,frag:`
      precision highp float;
      uniform vec2 srcRes;
      uniform sampler2D src;
      uniform float gamma;

      vec3 approxLinearToSRGB (vec3 rgb, float gamma) {
        return pow(clamp(rgb, vec3(0), vec3(1)), vec3(1.0 / gamma));
      }

      void main () {
        vec4 color = texture2D(src, gl_FragCoord.xy / srcRes);
        gl_FragColor = vec4(approxLinearToSRGB(color.rgb, gamma), color.a);
      }`,attributes:{xy:[-4,-4,4,-4,0,4]},uniforms:{src:()=>D,srcRes:()=>C,gamma:()=>m},count:3,depth:{enable:!1},blend:{enable:!0,func:{srcRGB:"one",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}}}),f=P=>{const b=P.getContext("2d");b.clearRect(0,0,P.width,P.height),b.drawImage(i,(i.width-P.width)/2,(i.height-P.height)/2,P.width,P.height,0,0,P.width,P.height)},r=(P,b)=>{o.clear(zi),D.use(()=>{o.clear(zi),P()}),B(),f(b)},u=()=>{o.poll()},a=new Set,y=P=>(a.add(P),()=>{a.delete(P)}),p=o.frame(()=>{const P=a.values();let b=P.next();for(;!b.done;)b.value(),b=P.next()}),I=(P,b)=>{const R=P===void 0?Math.min(window.innerWidth,window.screen.availWidth):P,G=b===void 0?Math.min(window.innerHeight,window.screen.availHeight):b;i.width=R*window.devicePixelRatio,i.height=G*window.devicePixelRatio,C[0]=i.width,C[1]=i.height,D.resize(...C)},T=()=>{I()};return t.canvas||(window.addEventListener("resize",T),window.addEventListener("orientationchange",T),I()),{get canvas(){return i},get regl(){return o},get gamma(){return m},set gamma(P){m=+P},get isSupported(){return c},get isDestroyed(){return d},render:r,resize:I,onFrame:y,refresh:u,destroy:()=>{d=!0,window.removeEventListener("resize",T),window.removeEventListener("orientationchange",T),p.cancel(),i=void 0,o.destroy(),o=void 0}}},Rd=`
precision mediump float;

uniform sampler2D texture;

varying vec2 uv;

void main () {
  gl_FragColor = texture2D(texture, uv);
}
`,Nd=`
precision mediump float;

uniform mat4 modelViewProjection;

attribute vec2 position;

varying vec2 uv;

void main () {
  uv = position;
  gl_Position = modelViewProjection * vec4(-1.0 + 2.0 * uv.x, 1.0 - 2.0 * uv.y, 0, 1);
}
`,Md=`precision highp float;

varying vec4 color;

void main() {
  gl_FragColor = color;
}
`,Bd=`precision highp float;

uniform sampler2D startStateTex;
uniform sampler2D endStateTex;
uniform float t;

varying vec2 particleTextureIndex;

void main() {
  // Interpolate x, y, and value
  vec3 start = texture2D(startStateTex, particleTextureIndex).xyw;
  vec3 end = texture2D(endStateTex, particleTextureIndex).xyw;
  vec3 curr = start * (1.0 - t) + end * t;

  // The category cannot be interpolated
  float endCategory = texture2D(endStateTex, particleTextureIndex).z;

  gl_FragColor = vec4(curr.xy, endCategory, curr.z);
}`,Fd=`precision highp float;

attribute vec2 position;
varying vec2 particleTextureIndex;

void main() {
  // map normalized device coords to texture coords
  particleTextureIndex = 0.5 * (1.0 + position);

  gl_Position = vec4(position, 0, 1);
}`,zd=`
precision highp float;

uniform float antiAliasing;

varying vec4 color;
varying float finalPointSize;

float linearstep(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float sdf = length(c) * finalPointSize;
  float alpha = linearstep(finalPointSize + antiAliasing, finalPointSize - antiAliasing, sdf);

  gl_FragColor = vec4(color.rgb, alpha * color.a);
}
`,kd=t=>`
precision highp float;

uniform sampler2D colorTex;
uniform float colorTexRes;
uniform float colorTexEps;
uniform sampler2D stateTex;
uniform float stateTexRes;
uniform float stateTexEps;
uniform float devicePixelRatio;
uniform sampler2D encodingTex;
uniform float encodingTexRes;
uniform float encodingTexEps;
uniform float pointSizeExtra;
uniform float pointOpacityMax;
uniform float pointOpacityScale;
uniform float numPoints;
uniform float globalState;
uniform float isColoredByZ;
uniform float isColoredByW;
uniform float isOpacityByZ;
uniform float isOpacityByW;
uniform float isOpacityByDensity;
uniform float isSizedByZ;
uniform float isSizedByW;
uniform float isPixelAligned;
uniform float colorMultiplicator;
uniform float opacityMultiplicator;
uniform float opacityDensity;
uniform float sizeMultiplicator;
uniform float numColorStates;
uniform float pointScale;
uniform float drawingBufferWidth;
uniform float drawingBufferHeight;
uniform mat4 modelViewProjection;

attribute vec2 stateIndex;

varying vec4 color;
varying float finalPointSize;

void main() {
  vec4 state = texture2D(stateTex, stateIndex);

  if (isPixelAligned < 0.5) {
    gl_Position = modelViewProjection * vec4(state.x, state.y, 0.0, 1.0);
  } else {
    vec4 clipSpacePosition = modelViewProjection * vec4(state.x, state.y, 0.0, 1.0);
    vec2 ndcPosition = clipSpacePosition.xy / clipSpacePosition.w;
    vec2 pixelPos = 0.5 * (ndcPosition + 1.0) * vec2(drawingBufferWidth, drawingBufferHeight);
    pixelPos = floor(pixelPos + 0.5); // Snap to nearest pixel
    vec2 snappedPosition = (pixelPos / vec2(drawingBufferWidth, drawingBufferHeight)) * 2.0 - 1.0;
    gl_Position = vec4(snappedPosition, 0.0, 1.0);
  }


  // Determine color index
  float colorIndexZ =  isColoredByZ * floor(state.z * colorMultiplicator);
  float colorIndexW =  isColoredByW * floor(state.w * colorMultiplicator);

  // Multiply by the number of color states per color
  // I.e., normal, active, hover, background, etc.
  float colorIndex = (colorIndexZ + colorIndexW) * numColorStates;

  // Half a "pixel" or "texel" in texture coordinates
  float colorLinearIndex = colorIndex + globalState;

  // Need to add cEps here to avoid floating point issue that can lead to
  // dramatic changes in which color is loaded as floor(3/2.9999) = 1 but
  // floor(3/3.0001) = 0!
  float colorRowIndex = floor((colorLinearIndex + colorTexEps) / colorTexRes);

  vec2 colorTexIndex = vec2(
    (colorLinearIndex / colorTexRes) - colorRowIndex + colorTexEps,
    colorRowIndex / colorTexRes + colorTexEps
  );

  color = texture2D(colorTex, colorTexIndex);

  // Retrieve point size
  float pointSizeIndexZ = isSizedByZ * floor(state.z * sizeMultiplicator);
  float pointSizeIndexW = isSizedByW * floor(state.w * sizeMultiplicator);
  float pointSizeIndex = pointSizeIndexZ + pointSizeIndexW;

  float pointSizeRowIndex = floor((pointSizeIndex + encodingTexEps) / encodingTexRes);
  vec2 pointSizeTexIndex = vec2(
    (pointSizeIndex / encodingTexRes) - pointSizeRowIndex + encodingTexEps,
    pointSizeRowIndex / encodingTexRes + encodingTexEps
  );
  float pointSize = texture2D(encodingTex, pointSizeTexIndex).x;

  // Retrieve opacity
  ${t===3?"":`
        if (isOpacityByDensity < 0.5) {
          float opacityIndexZ = isOpacityByZ * floor(state.z * opacityMultiplicator);
          float opacityIndexW = isOpacityByW * floor(state.w * opacityMultiplicator);
          float opacityIndex = opacityIndexZ + opacityIndexW;

          float opacityRowIndex = floor((opacityIndex + encodingTexEps) / encodingTexRes);
          vec2 opacityTexIndex = vec2(
            (opacityIndex / encodingTexRes) - opacityRowIndex + encodingTexEps,
            opacityRowIndex / encodingTexRes + encodingTexEps
          );
          color.a = texture2D(encodingTex, opacityTexIndex)[${1+t}];
        } else {
          color.a = min(1.0, opacityDensity + globalState);
        }
      `}

  color.a = min(pointOpacityMax, color.a) * pointOpacityScale;
  finalPointSize = (pointSize * pointScale) + pointSizeExtra;
  gl_PointSize = finalPointSize;
}
`,$d=function(){const o=(f,r,u,a,y)=>{const p=(a-r)*.5,I=(y-u)*.5;return(2*u-2*a+p+I)*f*f*f+(-3*u+3*a-2*p-I)*f*f+p*f+u},i=(f,r,u)=>{const a=u*f,y=Math.floor(a),p=a-y,I=r[Math.max(0,y-1)],T=r[y],A=r[Math.min(u,y+1)],P=r[Math.min(u,y+2)];return[o(p,I[0],T[0],A[0],P[0]),o(p,I[1],T[1],A[1],P[1])]},m=(f,r,u,a)=>(f-u)**2+(r-a)**2;/**
 * Douglas Peucker square segment distance
 * Implementation from https://github.com/mourner/simplify-js
 * @author Vladimir Agafonkin
 * @copyright Vladimir Agafonkin 2013
 * @license BSD
 * @param {array} p - Point
 * @param {array} p1 - First boundary point
 * @param {array} p2 - Second boundary point
 * @return {number} Distance
 */const d=(f,r,u)=>{let a=r[0],y=r[1],p=u[0]-a,I=u[1]-y;if(p!==0||I!==0){const T=((f[0]-a)*p+(f[1]-y)*I)/(p*p+I*I);T>1?(a=u[0],y=u[1]):T>0&&(a+=p*T,y+=I*T)}return p=f[0]-a,I=f[1]-y,p*p+I*I};/**
 * Douglas Peucker step function
 * Implementation from https://github.com/mourner/simplify-js
 * @author Vladimir Agafonkin
 * @copyright Vladimir Agafonkin 2013
 * @license BSD
 * @param   {[type]}  points  [description]
 * @param   {[type]}  first  [description]
 * @param   {[type]}  last  [description]
 * @param   {[type]}  tolerance  [description]
 * @param   {[type]}  simplified  [description]
 * @return  {[type]}  [description]
 */const c=(f,r,u,a,y)=>{let p=a,I;for(let T=r+1;T<u;T++){const A=d(f[T],f[r],f[u]);A>p&&(I=T,p=A)}p>a&&(I-r>1&&c(f,r,I,a,y),y.push(f[I]),u-I>1&&c(f,I,u,a,y))};/**
 * Douglas Peucker. Implementation from https://github.com/mourner/simplify-js
 * @author Vladimir Agafonkin
 * @copyright Vladimir Agafonkin 2013
 * @license BSD
 * @param {array} points - List of points to be simplified
 * @param {number} tolerance - Tolerance level. Points below this distance level will be ignored
 * @return {array} Simplified point list
 */const C=(f,r)=>{const u=f.length-1,a=[f[0]];return c(f,0,u,r,a),a.push(f[u]),a},D=(f,{maxIntPointsPerSegment:r=100,tolerance:u=.002}={})=>{const a=f.length,y=a-1,p=y*r+1,I=u**2;let T=[],A;for(let P=0;P<a-1;P++){let b=[f[P].slice(0,2)];A=f[P];for(let R=1;R<r;R++){const G=(P*r+R)/p,W=i(G,f,y);m(A[0],A[1],W[0],W[1])>I&&(b.push(W),A=W)}b.push(f[P+1]),b=C(b,I),T=T.concat(b.slice(0,b.length-1))}return T.push(f[f.length-1].slice(0,2)),T.flat()},B=f=>{const r={},u=!Number.isNaN(+f[0][5]);return f.forEach(a=>{const y=a[4];r[y]||(r[y]=[]),u?r[y][a[5]]=a:r[y].push(a)}),Object.entries(r).forEach(a=>{r[a[0]]=a[1].filter(y=>y),r[a[0]].reference=a[1][0]}),r};self.onmessage=function(r){(r.data.points?+r.data.points.length:0)||self.postMessage({error:new Error("No points provided")}),r.data.points;const a=B(r.data.points);self.postMessage({points:Object.entries(a).reduce((y,p)=>(y[p[0]]=D(p[1],r.data.options),y[p[0]].reference=p[1].reference,y),{})})}},Ud=(t,o={tolerance:.002,maxIntPointsPerSegment:100})=>new Promise((i,m)=>{const d=Ka($d);d.onmessage=c=>{c.data.error?m(c.data.error):i(c.data.points),d.terminate()},d.postMessage({points:t,options:o})}),Vd="1.13.0",Uo={showRecticle:{replacement:"showReticle",removalVersion:"2",translation:et},recticleColor:{replacement:"reticleColor",removalVersion:"2",translation:et},keyMap:{replacement:"actionKeyMap",removalVersion:"2",translation:Id}},Vo=t=>{const o=Object.keys(t).filter(i=>Uo[i]);for(const i of o){const{replacement:m,removalVersion:d,translation:c}=Uo[i];console.warn(`regl-scatterplot: the "${i}" property is deprecated and will be removed in v${d}. Please use "${m}" instead.`),t[Uo[i].replacement]=t[i]!==os?c(t[i]):t[i],delete t[i]}return t},_e=(t,o,{allowSegment:i=!1,allowDensity:m=!1,allowInherit:d=!1}={})=>ts.has(t)?"valueZ":ns.has(t)?"valueW":t==="segment"?i?"segment":o:t==="density"?m?"density":o:t==="inherit"&&d?"inherit":o,Wo=t=>{switch(t){case"valueZ":return 2;case"valueW":return 3;default:return null}},tu=(t={})=>{const o=qa({async:!t.syncEvents,caseInsensitive:!0}),i=new Float32Array(16),m=new Float32Array(16),d=[0,0];Vo(t);let{renderer:c,antiAliasing:C=_l,pixelAligned:D=Ll,backgroundColor:B=ol,backgroundImage:f=gl,canvas:r=document.createElement("canvas"),colorBy:u=ln,deselectOnDblClick:a=El,deselectOnEscape:y=xl,lassoColor:p=Cc,lassoLineWidth:I=vc,lassoMinDelay:T=_c,lassoMinDist:A=Lc,lassoClearEvent:P=Oc,lassoInitiator:b=bc,lassoInitiatorParentElement:R=document.body,lassoLongPressIndicatorParentElement:G=document.body,lassoOnLongPress:W=Dc,lassoLongPressTime:_=Ln,lassoLongPressAfterEffectTime:z=On,lassoLongPressEffectDelay:U=Dn,lassoLongPressRevertEffectTime:de=Rn,lassoType:me=Ol,lassoBrushSize:xe=Rc,actionKeyMap:ue=Bc,mouseMode:Le=Ic,showReticle:Pe=yl,reticleColor:ne=pl,pointColor:V=el,pointColorActive:ee=tl,pointColorHover:oe=nl,showPointConnections:ye=wl,pointConnectionColor:te=il,pointConnectionColorActive:ae=sl,pointConnectionColorHover:ce=rl,pointConnectionColorBy:Oe=No,pointConnectionOpacity:J=Zc,pointConnectionOpacityBy:De=Do,pointConnectionOpacityActive:ht=jc,pointConnectionSize:ie=Yc,pointConnectionSizeActive:gt=Gc,pointConnectionSizeBy:Re=Oo,pointConnectionMaxIntPointsPerSegment:yt=Sl,pointConnectionTolerance:vt=Al,pointSize:H=Vc,pointSizeSelected:ke=Wc,pointSizeMouseDetection:we=Il,pointOutlineWidth:Ze=Hc,opacity:j=Ge,opacityBy:Se=Ro,opacityByDensityFill:Ut=qc,opacityInactiveMax:bt=Jc,opacityInactiveScale:je=Qc,sizeBy:$e=Lo,pointScaleMode:tt=Uc,height:Ae=kc,width:Ce=zc,annotationLineColor:_t=al,annotationLineWidth:Ke=cl,annotationHVLineLimit:Ne=ll,cameraIsFixed:Ue=bl}=t,Ie=Ce===Ge?1:Ce,Me=Ae===Ge?1:Ae;const{performanceMode:pt=Tl,opacityByDensityDebounceTime:Vt=Xc,spatialIndexUseWorker:Wt=vl}=t,Et=!!(t.renderPointsAsSquares||pt),fn=!!(t.disableAlphaBlending||pt);Le=$o(ki,_n)(Le),c||(c=Dd({regl:t.regl,gamma:t.gamma})),B=he(B,!0),p=he(p,!0),ne=he(ne,!0);let Lt=!1,qe=!1,Ot=Gi(B),v,Be,w,O=!1,F=null,k=[0,0],N=-1,L=[];const Y=new Set,q=new Set;let $=!1;const K=new Set;let X=[],se=0,Ht=0,Te=!1,Ve=[],Xe,Je,nt=t.aspectRatio||Fc,kn,Dt,xt,We,Fe,$n,Yt,Gt,Un,Rt,Zt,jt,Vn=!1,Z=!0,wt=!1,mn;V=mt(V)?[...V]:[V],ee=mt(ee)?[...ee]:[ee],oe=mt(oe)?[...oe]:[oe],V=V.map(e=>he(e,!0)),ee=ee.map(e=>he(e,!0)),oe=oe.map(e=>he(e,!0)),j=!Array.isArray(j)&&Number.isNaN(+j)?V[0][3]:j,j=ut(j,ft,{minLength:1})?[...j]:[j],H=ut(H,ft,{minLength:1})?[...H]:[H];let Wn=_o/H[0];te==="inherit"?te=[...V]:(te=mt(te)?[...te]:[te],te=te.map(e=>he(e,!0))),ae==="inherit"?ae=[...ee]:(ae=mt(ae)?[...ae]:[ae],ae=ae.map(e=>he(e,!0))),ce==="inherit"?ce=[...oe]:(ce=mt(ce)?[...ce]:[ce],ce=ce.map(e=>he(e,!0))),J==="inherit"?J=[...j]:J=ut(J,ft,{minLength:1})?[...J]:[J],ie==="inherit"?ie=[...H]:ie=ut(ie,ft,{minLength:1})?[...ie]:[ie],u=_e(u,ln),Se=_e(Se,Ro,{allowDensity:!0}),$e=_e($e,Lo),Oe=_e(Oe,No,{allowSegment:!0,allowInherit:!0}),De=_e(De,Do,{allowSegment:!0}),Re=_e(Re,Oo,{allowSegment:!0});let ot,it,st,Jo,ze=0,Hn=0,Kt,Yn,qt,hn,gn,yn,pn,St=!1,Xt=null,Gn,Zn,Qo=Pe,rt,Nt=0,He,Mt=0,jn=!1,pe=!1,Bt=!1,Jt=!1,At=un,It=un,le,Ft=!1,ge=t.xScale||null,re=t.yScale||null,En=0,xn=0,wn=0,Sn=0;ge&&(En=ge.domain()[0],xn=ge.domain()[1]-ge.domain()[0],ge.range([0,Ie])),re&&(wn=re.domain()[0],Sn=re.domain()[1]-re.domain()[0],re.range([Me,0]));const ei=e=>-1+e/Ie*2,ti=e=>1+e/Me*-2,as=()=>[ei(d[0]),ti(d[1])],at=(e,n)=>{const s=[e,n,1,1],l=Qa(i,lt(i,kn,lt(i,v.view,xt)));return Cn(s,s,l),s.slice(0,2)},ni=(e=0)=>{const n=ct(),l=(Zt[1]-jt[1])/r.height;return(Un*n+e)*l},Kn=()=>$?X.filter((e,n)=>K.has(n)):X,qn=(e,n,s,l)=>{const g=Xe.range(e,n,s,l);return $?g.filter(x=>K.has(x)):g},oi=()=>{const[e,n]=as(),[s,l]=at(e,n),g=ni(4),x=qn(s-g,l-g,s+g,l+g);let S=g,E=-1;for(const h of x){const[M,fe]=X[h],Ee=ko(M,fe,s,l);Ee<S&&(S=Ee,E=h)}return E},cs=(e,n)=>{Ve=e,Be.setPoints(n),o.publish("lassoExtend",{coordinates:e})},ls=e=>{const n=ld(e);if(!dd(n))return[];const s=qn(...n),l=[];for(const g of s)Ed(e,X[g])&&l.push(g);return l},An=()=>{Ve=[],Be&&Be.clear()},Qt=e=>e&&e.length>4,Tt=(e,n)=>{if($n||!ye||!Qt(X[e[0]]))return;const s=n===0,l=n===1?E=>q.add(E):et,g=Object.keys(e.reduce((E,h)=>{const M=X[h],Ee=Array.isArray(M[4])?M[4][0]:M[4];return E[Ee]=!0,E},{})),x=We.getData().opacities,S=g.filter(E=>!q.has(+E));for(const E of S){const h=Fe[E][0],M=Fe[E][2],fe=Fe[E][3],Ee=h*4+fe*2,Io=Ee+M*2+4;x.__original__===void 0&&(x.__original__=x.slice());for(let kt=Ee;kt<Io;kt++)x[kt]=s?x.__original__[kt]:ht;l(E)}We.getBuffer().opacities.subdata(x,0)},In=e=>[e%ze/ze+Hn,Math.floor(e/ze)/ze+Hn],ds=e=>$&&!K.has(e),Tn=({preventEvent:e=!1}={})=>{P===Yo&&An(),L.length>0&&(e||o.publish("deselect"),q.clear(),Tt(L,0),L=[],Y.clear(),Z=!0)},zt=(e,{merge:n=!1,remove:s=!1,preventEvent:l=!1}={})=>{const g=Array.isArray(e)?e:[e],x=[...L];if(n){if(L=Ja(L,g),x.length===L.length){Z=!0;return}}else if(s){const E=new Set(g);if(L=L.filter(h=>!E.has(h)),x.length===L.length){Z=!0;return}}else{if((L==null?void 0:L.length)>0&&Tt(L,0),x.length>0&&g.length===0){Tn({preventEvent:l});return}L=g}if(Po(x,L)){Z=!0;return}const S=[];Y.clear(),q.clear();for(let E=L.length-1;E>=0;E--){const h=L[E];if(h<0||h>=se||ds(h)){L.splice(E,1);continue}Y.add(h),S.push.apply(S,In(h))}Yn({usage:"dynamic",type:"float",data:S}),Tt(L,1),l||o.publish("select",{points:L}),Z=!0},en=(e,{showReticleOnce:n=!1,preventEvent:s=!1}={})=>{let l=!1;if(!($&&!K.has(e))&&e>=0&&e<se){l=!0;const x=le,S=e!==le;+x>=0&&S&&!Y.has(x)&&Tt([x],0),le=e,qt.subdata(In(e)),Y.has(e)||Tt([e],2),S&&!s&&o.publish("pointover",le)}else l=+le>=0,l&&(Y.has(le)||Tt([le],0),s||o.publish("pointout",le)),le=void 0;l&&(Z=!0,wt=n)},Xn=e=>{const n=r.getBoundingClientRect();return d[0]=e.clientX-n.left,d[1]=e.clientY-n.top,[...d]},Q=ss(r,{onStart:()=>{v.config({isFixed:!0}),O=!0,Te=!0,An(),N>=0&&(clearTimeout(N),N=-1),o.publish("lassoStart")},onDraw:cs,onEnd:(e,n,{merge:s=!1,remove:l=!1}={})=>{v.config({isFixed:Ue}),Ve=[...e];const g=ls(n);zt(g,{merge:s,remove:l}),o.publish("lassoEnd",{coordinates:Ve}),P===Zo&&An()},enableInitiator:b,initiatorParentElement:R,longPressIndicatorParentElement:G,pointNorm:([e,n])=>at(ei(e),ti(n)),minDelay:T,minDist:me==="brush"?Math.max(Vi,A):A,type:me}),us=()=>Le===Ji,tn=(e,n)=>{switch(ue[n]){case Fn:return e.altKey;case Ko:return e.metaKey;case Qi:return e.ctrlKey;case es:return e.metaKey;case qo:return e.shiftKey;default:return!1}},fs=e=>document.elementsFromPoint(e.clientX,e.clientY).some(n=>n===r),ii=e=>{!pe||e.buttons!==1||(O=!0,F=performance.now(),k=Xn(e),Te=us()||tn(e,jo),!Te&&W&&(Q.showLongPressIndicator(e.clientX,e.clientY,{time:_,extraTime:z,delay:U}),N=setTimeout(()=>{N=-1,Te=!0},_)))},Jn=e=>{pe&&(O=!1,N>=0&&(clearTimeout(N),N=-1),Te&&(e.preventDefault(),Te=!1,Q.end({merge:tn(e,Mn),remove:tn(e,Bn)})),W&&Q.hideLongPressIndicator({time:de}))},si=e=>{if(!pe)return;e.preventDefault();const n=Xn(e);if(ko(...n,...k)>=A)return;const s=performance.now()-F;if(!b||s<Cl){const l=oi();l>=0?(L.length>0&&P===Yo&&An(),zt([l],{merge:tn(e,Mn),remove:tn(e,Bn)})):Rt||(Rt=setTimeout(()=>{Rt=null,Q.showInitiator(e)},Pl))}},ri=e=>{Q.hideInitiator(),Rt&&(clearTimeout(Rt),Rt=null),a&&(e.preventDefault(),Tn())},ai=e=>{if(Jt||(Ft=fs(e),Jt=!0),!(pe&&(Ft||O)))return;const n=Xn(e),l=ko(...n,...k)>=A;Ft&&!Te&&en(oi()),Te?(e.preventDefault(),Q.extend(e,!0)):O&&W&&l&&Q.hideLongPressIndicator({time:de}),N>=0&&l&&(clearTimeout(N),N=-1),O&&(Z=!0)},ci=()=>{le=void 0,Ft=!1,Jt=!1,pe&&(+le>=0&&!Y.has(le)&&Tt([le],0),Jn(),Z=!0)},Qn=()=>{const e=Math.max(H.length,j.length);Mt=Math.max(2,Math.ceil(Math.sqrt(e)));const n=new Float32Array(Mt**2*4);for(let s=0;s<e;s++){n[s*4]=H[s]||0,n[s*4+1]=Math.min(1,j[s]||0);const l=Number((ee[s]||ee[0])[3]);n[s*4+2]=Math.min(1,Number.isNaN(l)?1:l);const g=Number((oe[s]||oe[0])[3]);n[s*4+3]=Math.min(1,Number.isNaN(g)?1:g)}return c.regl.texture({data:n,shape:[Mt,Mt,4],type:"float"})},eo=(e=V,n=ee,s=oe)=>{const l=e.length,g=n.length,x=s.length,S=[];if(l===g&&g===x)for(let E=0;E<l;E++)S.push(e[E],n[E],s[E],B);else for(let E=0;E<l;E++){const h=[e[E][0],e[E][1],e[E][2],1],M=u===ln?n[0]:h,fe=u===ln?s[0]:h;S.push(e[E],M,fe,B)}return S},to=()=>{const e=eo(),n=e.length;Nt=Math.max(2,Math.ceil(Math.sqrt(n)));const s=new Float32Array(Nt**2*4);return e.forEach((l,g)=>{s[g*4]=l[0],s[g*4+1]=l[1],s[g*4+2]=l[2],s[g*4+3]=l[3]}),c.regl.texture({data:s,shape:[Nt,Nt,4],type:"float"})},ms=(e,n)=>{Dt[0]=e/Je,Dt[5]=n},no=()=>{Je=Ie/Me,kn=Co([],[1/Je,1,1]),Dt=Co([],[1/Je,1,1]),xt=Co([],[nt,1,1])},hs=e=>{+e<=0||(nt=e)},oo=(e,n)=>s=>{if(!s||s.length===0)return;const g=[...e()];let x=mt(s)?s:[s];if(x=x.map(S=>he(S,!0)),!Ad(g,x)){rt&&rt.destroy();try{n(x),rt=to()}catch{console.error("Invalid colors. Switching back to default colors."),n(g),rt=to()}}},gs=oo(()=>V,e=>{V=e}),ys=oo(()=>ee,e=>{ee=e}),ps=oo(()=>oe,e=>{oe=e}),Es=()=>{const e=at(-1,-1),n=at(1,1),s=(e[0]+1)/2,l=(n[0]+1)/2,g=(e[1]+1)/2,x=(n[1]+1)/2,S=[En+s*xn,En+l*xn],E=[wn+g*Sn,wn+x*Sn];return[S,E]},Pt=()=>{if(!(ge||re))return;const[e,n]=Es();ge&&ge.domain(e),re&&re.domain(n)},io=e=>{Me=Math.max(1,e),r.height=Math.floor(Me*window.devicePixelRatio),re&&(re.range([Me,0]),Pt())},so=e=>{if(e===Ge){Ae=e,r.style.height="100%",window.requestAnimationFrame(()=>{r&&io(r.getBoundingClientRect().height)});return}!+e||+e<=0||(Ae=+e,io(Ae),r.style.height=`${Ae}px`)},ro=()=>{Un=we,we===Ge&&(Un=Array.isArray(H)?ec(H):H)},ao=e=>{const n=Array.isArray(H)?[...H]:H;ut(e,ft,{minLength:1})?H=[...e]:bn(+e)&&(H=[+e]),!(n===H||Po(n,H))&&(He&&He.destroy(),Wn=_o/H[0],He=Qn(),ro())},xs=e=>{!+e||+e<0||(ke=+e)},ws=e=>{!+e||+e<0||(Ze=+e)},co=e=>{Ie=Math.max(1,e),r.width=Math.floor(Ie*window.devicePixelRatio),ge&&(ge.range([0,Ie]),Pt())},lo=e=>{if(e===Ge){Ce=e,r.style.width="100%",window.requestAnimationFrame(()=>{r&&co(r.getBoundingClientRect().width)});return}!+e||+e<=0||(Ce=+e,co(Ce),r.style.width=`${Ie}px`)},Ss=e=>{const n=Array.isArray(j)?[...j]:j;ut(e,ft,{minLength:1})?j=[...e]:bn(+e)&&(j=[+e]),!(n===j||Po(n,j))&&(He&&He.destroy(),He=Qn())},uo=e=>{switch(e){case"valueZ":return At;case"valueW":return It;default:return null}},fo=(e,n)=>{switch(e){case Ye:return s=>Math.round(s*(n.length-1));default:return et}},As=e=>{u=_e(e,ln)},Is=e=>{Se=_e(e,Ro,{allowDensity:!0})},Ts=e=>{$e=_e(e,Lo)},Ps=e=>{Oe=_e(e,No,{allowSegment:!0,allowInherit:!0})},Cs=e=>{De=_e(e,Do,{allowSegment:!0})},vs=e=>{Re=_e(e,Oo,{allowSegment:!0})},bs=()=>C,_s=()=>[r.width,r.height],Ls=()=>f,Os=()=>rt,Ds=()=>Nt,Rs=()=>.5/Nt,Ns=()=>window.devicePixelRatio,Ms=()=>Kt,mo=()=>Yn,Bs=()=>He,Fs=()=>Mt,zs=()=>.5/Mt,li=()=>0,ks=()=>st||ot,$s=()=>ze,Us=()=>.5/ze,ho=()=>Dt,go=()=>v.view,yo=()=>xt,po=()=>lt(m,Dt,lt(m,v.view,xt)),di=()=>window.devicePixelRatio,ui=()=>dn(Wn,v.scaling[0])*window.devicePixelRatio,fi=()=>v.scaling[0]>1?Math.asinh(dn(1,v.scaling[0]))/Math.asinh(1)*window.devicePixelRatio:dn(Wn,v.scaling[0])*window.devicePixelRatio;let ct=fi;tt==="linear"?ct=ui:tt==="constant"&&(ct=di);const mi=()=>$?K.size:se,nn=()=>L.length,Vs=()=>nn()>0?bt:1,Ws=()=>nn()>0?je:1,Hs=()=>+(u==="valueZ"),Ys=()=>+(u==="valueW"),Gs=()=>+(Se==="valueZ"),Zs=()=>+(Se==="valueW"),js=()=>+(Se==="density"),Ks=()=>+($e==="valueZ"),qs=()=>+($e==="valueW"),Xs=()=>+D,Js=()=>u==="valueZ"?At===Ye?V.length-1:1:It===Ye?V.length-1:1,Qs=()=>Se==="valueZ"?At===Ye?j.length-1:1:It===Ye?j.length-1:1,er=()=>$e==="valueZ"?At===Ye?H.length-1:1:It===Ye?H.length-1:1,tr=e=>{if(Se!=="density")return 1;const n=ct(),s=H[0]*n,l=2/(2/v.view[0])*(2/(2/v.view[5])),g=e.viewportHeight,x=e.viewportWidth;let S=Ut*x*g/(Ht*s*s)*Yi(1,l);S*=Et?1:1/(.25*Math.PI);const E=dn(_o,s)+.5;return S*=(s/E)**2,Yi(1,dn(0,S))},nr=c.regl({framebuffer:()=>Jo,vert:Fd,frag:Bd,attributes:{position:[-4,0,4,4,4,-4]},uniforms:{startStateTex:()=>it,endStateTex:()=>ot,t:(e,n)=>n.t},count:3}),Ct=(e,n,s,l=xc,g=Vs,x=Ws)=>c.regl({frag:Et?Md:zd,vert:kd(l),blend:{enable:!fn,func:{srcRGB:"src alpha",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}},depth:{enable:!1},attributes:{stateIndex:{buffer:s,size:2}},uniforms:{antiAliasing:bs,resolution:_s,modelViewProjection:po,devicePixelRatio:Ns,pointScale:()=>ct(),encodingTex:Bs,encodingTexRes:Fs,encodingTexEps:zs,pointOpacityMax:g,pointOpacityScale:x,pointSizeExtra:e,globalState:l,colorTex:Os,colorTexRes:Ds,colorTexEps:Rs,stateTex:ks,stateTexRes:$s,stateTexEps:Us,isColoredByZ:Hs,isColoredByW:Ys,isOpacityByZ:Gs,isOpacityByW:Zs,isOpacityByDensity:js,isSizedByZ:Ks,isSizedByW:qs,isPixelAligned:Xs,colorMultiplicator:Js,opacityMultiplicator:Qs,opacityDensity:tr,sizeMultiplicator:er,numColorStates:Sc,drawingBufferWidth:S=>S.drawingBufferWidth,drawingBufferHeight:S=>S.drawingBufferHeight},count:n,primitive:"points"}),or=Ct(li,mi,Ms),ir=Ct(li,()=>1,()=>qt,wc,()=>1,()=>1),sr=Ct(()=>(ke+Ze*2)*window.devicePixelRatio,nn,mo,bo,()=>1,()=>1),rr=Ct(()=>(ke+Ze)*window.devicePixelRatio,nn,mo,Fi,()=>1,()=>1),ar=Ct(()=>ke*window.devicePixelRatio,nn,mo,bo,()=>1,()=>1),cr=()=>{sr(),rr(),ar()},lr=c.regl({frag:Rd,vert:Nd,attributes:{position:[0,1,0,0,1,0,0,1,1,1,1,0]},uniforms:{modelViewProjection:po,texture:Ls},count:6}),dr=c.regl({vert:`
      precision mediump float;
      uniform mat4 modelViewProjection;
      attribute vec2 position;
      void main () {
        gl_Position = modelViewProjection * vec4(position, 0, 1);
      }`,frag:`
      precision mediump float;
      uniform vec4 color;
      void main () {
        gl_FragColor = vec4(color.rgb, 0.2);
      }`,depth:{enable:!1},blend:{enable:!0,func:{srcRGB:"src alpha",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}},attributes:{position:()=>Ve},uniforms:{modelViewProjection:po,color:()=>p},elements:()=>Xa(Be.getPoints())}),ur=()=>{if(!(le>=0))return;const[e,n]=X[le].slice(0,2),s=[e,n,0,1];lt(i,Dt,lt(i,v.view,xt)),Cn(s,s,i),Yt.setPoints([-1,s[1],1,s[1]]),Gt.setPoints([s[0],1,s[0],-1]),Yt.draw(),Gt.draw(),Ct(()=>(ke+Ze*2)*window.devicePixelRatio,()=>1,qt,bo)(),Ct(()=>(ke+Ze)*window.devicePixelRatio,()=>1,qt,Fi)()},hi=e=>{const n=new Float32Array(e*2);let s=0;for(let l=0;l<e;++l){const g=In(l);n[s]=g[0],n[s+1]=g[1],s+=2}return n},gi=(e,n={})=>{const s=e.length;ze=Math.max(2,Math.ceil(Math.sqrt(s))),Hn=.5/ze;const l=new Float32Array(ze**2*4);let g=!0,x=!0,S=0,E=0,h=0;for(let M=0;M<s;++M)S=M*4,l[S]=e[M][0],l[S+1]=e[M][1],E=e[M][2]||0,h=e[M][3]||0,l[S+2]=E,l[S+3]=h,g&&(g=Number.isInteger(E)),x&&(x=Number.isInteger(h));return n.z&&Ui.includes(n.z)?At=n.z:At=g?un:Ye,n.w&&Ui.includes(n.w)?It=n.w:It=x?un:Ye,c.regl.texture({data:l,shape:[ze,ze,4],type:"float"})},fr=(e,n={})=>{if(!ot)return!1;if(St){const s=it;it=st,s.destroy()}else it=ot;return st=gi(e,n),Jo=c.regl.framebuffer({color:st,depth:!1,stencil:!1}),ot=void 0,!0},mr=()=>!!(it&&st),hr=()=>{it&&(it.destroy(),it=void 0),st&&(st.destroy(),st=void 0)},yi=(e,n={})=>new Promise(s=>{pe=!1;const l=(n==null?void 0:n.preventFilterReset)&&e.length===se;se=e.length,Ht=se,ot&&ot.destroy(),ot=gi(e,{z:n.zDataType,w:n.wDataType}),l||Kt({usage:"static",type:"float",data:hi(se)}),uc(n.spatialIndex||e,{useWorker:Wt}).then(g=>{Xe=g,X=e,pe=!0}).then(s)}),pi=(e,n)=>{hn=v.target,gn=e,yn=v.distance[0],pn=n},gr=()=>hn!==void 0&&gn!==void 0&&yn!==void 0&&pn!==void 0,yr=()=>{hn=void 0,gn=void 0,yn=void 0,pn=void 0},pr=e=>{const n=Oe==="inherit"?u:Oe;if(n==="segment"){const s=te.length-1;return s<1?[]:e.reduce((l,g,x)=>{let S=0;const E=[];for(let M=2;M<g.length;M+=2){const fe=Math.sqrt((g[M-2]-g[M])**2+(g[M-1]-g[M+1])**2);E.push(fe),S+=fe}l[x]=[0];let h=0;for(let M=0;M<g.length/2-1;M++)h+=E[M],l[x].push(Math.floor(h/S*s)*4);return l},[])}if(n){const s=Wo(n),l=fo(uo(n),Oe==="inherit"?V:te);return Fe.reduce((g,[x,S])=>(g[x]=l(S[s])*4,g),[])}return new Array(Fe.length).fill(0)},Er=()=>{const e=De==="inherit"?Se:De;if(e==="segment"){const n=J.length-1;return n<1?[]:Fe.reduce((s,[l,g,x])=>(s[l]=Bi(x,S=>J[Math.floor(S/(x-1)*n)]),s),[])}if(e){const n=Wo(e),s=De==="inherit"?j:J,l=fo(uo(e),s);return Fe.reduce((g,[x,S])=>(g[x]=s[l(S[n])],g),[])}},xr=()=>{const e=Re==="inherit"?$e:Re;if(e==="segment"){const n=ie.length-1;return n<1?[]:Fe.reduce((s,[l,g,x])=>(s[l]=Bi(x,S=>ie[Math.floor(S/(x-1)*n)]),s),[])}if(e){const n=Wo(e),s=Re==="inherit"?H:ie,l=fo(uo(e),s);return Fe.reduce((g,[x,S])=>(g[x]=s[l(S[n])],g),[])}},wr=e=>{Fe=[];let n=0;Object.keys(e).forEach((s,l)=>{Fe[s]=[l,e[s].reference,e[s].length/2,n],n+=e[s].length/2})},on=e=>new Promise(n=>{We.setPoints([]),(e==null?void 0:e.length)>0?($n=!0,Ud(e,{maxIntPointsPerSegment:yt,tolerance:vt}).then(s=>{wr(s);const l=Object.values(s);We.setPoints(l.length===1?l[0]:l,{colorIndices:pr(l),opacities:Er(),widths:xr()}),$n=!1,n()})):n()}),Sr=({preventEvent:e=!1}={})=>($=!1,K.clear(),Kt.subdata(hi(se)),new Promise(n=>{const s=()=>{o.subscribe("draw",()=>{e||o.publish("unfilter"),n()},1),Z=!0};ye||Qt(X[0])?on(Kn()).then(()=>{e||o.publish("pointConnectionsDraw"),s()}):s()})),Ei=(e,{preventEvent:n=!1}={})=>{$=!0,K.clear();const s=Array.isArray(e)?e:[e],l=[],g=[],x=[];for(const E of s)!Number.isFinite(E)||E<0||E>=se||(l.push(E),K.add(E),Y.has(E)&&x.push(E));const S=Od([...l]);for(const E of S)g.push.apply(g,In(E));return Kt.subdata(g),zt(x,{preventEvent:n}),K.has(le)||en(-1,{preventEvent:n}),new Promise(E=>{const h=()=>{o.subscribe("draw",()=>{n||o.publish("filter",{points:l}),E()},1),Z=!0};ye||Qt(X[0])?on(Kn()).then(()=>{n||o.publish("pointConnectionsDraw"),zt(x,{preventEvent:n}),h()}):h()})},xi=()=>qn(jt[0],jt[1],Zt[0],Zt[1]),Ar=Ki(()=>{Ht=xi().length},Vt),Ir=e=>{const[n,s]=hn,[l,g]=gn,x=1-e,S=n*x+l*e,E=s*x+g*e,h=yn*x+pn*e;v.lookAt([S,E],h)},Tr=()=>mr(),Pr=()=>gr(),Cr=(e,n)=>{Xt||(Xt=performance.now());const s=performance.now()-Xt,l=Td(n(s/e),0,1);return Tr()&&nr({t:l}),Pr()&&Ir(l),s<e},vr=()=>{St=!1,Xt=null,Gn=void 0,Zn=void 0,Pe=Qo,hr(),yr(),o.publish("transitionEnd")},Eo=({duration:e=500,easing:n=$i})=>{St&&o.publish("transitionEnd"),St=!0,Xt=null,Gn=e,Zn=Go(n)?Tc[n]||$i:n,Qo=Pe,Pe=!1,o.publish("transitionStart")},br=(e,n={})=>qe?Promise.reject(new Error(Mo)):Lt?Promise.reject(new Error(Dl)):(Lt=!0,Pd(e).then(s=>new Promise(l=>{if(qe){l();return}let g=!1;(!n.preventFilterReset||(s==null?void 0:s.length)!==se)&&($=!1,K.clear());const x=s&&Qt(s[0])&&(ye||n.showPointConnectionsOnce),{zDataType:S,wDataType:E}=n;new Promise(h=>{s?(n.transition&&(s.length===se?g=fr(s,{z:S,w:E}):console.warn("Cannot transition! The number of points between the previous and current draw call must be identical.")),yi(s,{zDataType:S,wDataType:E,preventFilterReset:n.preventFilterReset,spatialIndex:n.spatialIndex}).then(()=>{n.hover!==void 0&&en(n.hover,{preventEvent:!0}),n.select!==void 0&&zt(n.select,{preventEvent:!0}),n.filter!==void 0&&Ei(n.filter,{preventEvent:!0}),x?on(s).then(()=>{o.publish("pointConnectionsDraw"),Z=!0,wt=n.showReticleOnce}).then(()=>l()):h()})):h()}).then(()=>{n.transition&&g?(x?Promise.all([new Promise(h=>{o.subscribe("transitionEnd",()=>{Z=!0,wt=n.showReticleOnce,h()},1)}),new Promise(h=>{o.subscribe("pointConnectionsDraw",h,1)})]).then(()=>l()):o.subscribe("transitionEnd",()=>{Z=!0,wt=n.showReticleOnce,l()},1),Eo({duration:n.transitionDuration,easing:n.transitionEasing})):(x?Promise.all([new Promise(h=>{o.subscribe("draw",h,1)}),new Promise(h=>{o.subscribe("pointConnectionsDraw",h,1)})]).then(()=>l()):o.subscribe("draw",()=>l(),1),Z=!0,wt=n.showReticleOnce)})}).finally(()=>{Lt=!1}))),wi=e=>qe?Promise.reject(new Mo):(Bt=!1,e.length===0?new Promise(n=>{w.clear(),o.subscribe("draw",n,1),Bt=!0,Z=!0}):new Promise(n=>{const s=[],l=new Map,g=[],x=[];let S=-1;const E=h=>{x.push(h.lineWidth||Ke);const M=he(h.lineColor||_t,!0),fe=`[${M.join(",")}]`;if(l.has(fe)){const{idx:Ee}=l.get(fe);g.push(Ee)}else{const Ee=++S;l.set(fe,{idx:Ee,color:M}),g.push(Ee)}};for(const h of e){if(Cd(h)){s.push([h.x1??-Ne,h.y,h.x2??Ne,h.y]),E(h);continue}if(vd(h)){s.push([h.x,h.y1??-Ne,h.x,h.y2??Ne]),E(h);continue}if(_d(h)){s.push([h.x1,h.y1,h.x2,h.y1,h.x2,h.y2,h.x1,h.y2,h.x1,h.y1]),E(h);continue}if(bd(h)){s.push([h.x,h.y,h.x+h.width,h.y,h.x+h.width,h.y+h.height,h.x,h.y+h.height,h.x,h.y]),E(h);continue}Ld(h)&&(s.push(h.vertices.flatMap(et)),E(h))}w.setStyle({color:Array.from(l.values()).sort((h,M)=>h.idx>M.idx?1:-1).map(({color:h})=>h)}),w.setPoints(s.length===1?s.flat():s,{colorIndices:g,widths:x}),o.subscribe("draw",n,1),Bt=!0,Z=!0})),sn=e=>(...n)=>{const s=e(...n);return Z=!0,new Promise(l=>{o.subscribe("draw",()=>l(s),1)})},_r=e=>{let n=Number.POSITIVE_INFINITY,s=Number.NEGATIVE_INFINITY,l=Number.POSITIVE_INFINITY,g=Number.NEGATIVE_INFINITY;for(const x of e){const[S,E]=X[x];n=Math.min(n,S),s=Math.max(s,S),l=Math.min(l,E),g=Math.max(g,E)}return{x:n,y:l,width:s-n,height:g-l}},Si=(e,n={})=>new Promise(s=>{const l=Cn([],[e.x+e.width/2,e.y+e.height/2,0,0],xt).slice(0,2),g=2*Math.atan(1),x=Je/nt,S=e.height*x>=e.width?e.height/2/Math.tan(g/2):e.width/2/Math.tan(g/2)/x;n.transition?(v.config({isFixed:!0}),pi(l,S),o.subscribe("transitionEnd",()=>{s(),v.config({isFixed:Ue})},1),Eo({duration:n.transitionDuration,easing:n.transitionEasing})):(v.lookAt(l,S),o.subscribe("draw",s,1),Z=!0)}),Lr=(e,n={})=>{if(!pe)return Promise.reject(new Error(Wi));const s=_r(e),l=s.x+s.width/2,g=s.y+s.height/2,x=ni(),S=1+(n.padding||0),E=Math.max(s.width,x)*S,h=Math.max(s.height,x)*S,M=l-E/2,fe=g-h/2;return Si({x:M,y:fe,width:E,height:h},n)},Ai=(e,n,s={})=>new Promise(l=>{s.transition?(v.config({isFixed:!0}),pi(e,n),o.subscribe("transitionEnd",()=>{l(),v.config({isFixed:Ue})},1),Eo({duration:s.transitionDuration,easing:s.transitionEasing})):(v.lookAt(e,n),o.subscribe("draw",l,1),Z=!0)}),Or=(e={})=>Ai([0,0],1,e),Dr=e=>{if(!pe)throw new Error(Wi);const n=X[e];if(!n)return;const s=[n[0],n[1],0,1];lt(i,kn,lt(i,v.view,xt)),Cn(s,s,i);const l=Ie*(s[0]+1)/2,g=Me*(.5-s[1]/2);return[l,g]},xo=()=>{We.setStyle({color:eo(te,ae,ce),opacity:J===null?null:J[0],width:ie[0]})},Ii=()=>{const e=Math.round(Ot)>.5?0:255;Q.initiator.style.border=`1px dashed rgba(${e}, ${e}, ${e}, 0.33)`,Q.initiator.style.background=`rgba(${e}, ${e}, ${e}, 0.1)`},Ti=()=>{const e=Math.round(Ot)>.5?0:255;Q.longPressIndicator.style.color=`rgb(${e}, ${e}, ${e})`,Q.longPressIndicator.dataset.color=`rgb(${e}, ${e}, ${e})`;const n=p.map(s=>Math.round(s*255));Q.longPressIndicator.dataset.activeColor=`rgb(${n[0]}, ${n[1]}, ${n[2]})`},Rr=e=>{e&&(B=he(e,!0),Ot=Gi(B),Ii(),Ti())},Nr=e=>{e?Go(e)?Hi(c.regl,e).then(n=>{f=n,Z=!0,o.publish("backgroundImageReady")}).catch(()=>{console.error(`Count not create texture from ${e}`),f=null}):e._reglType==="texture2d"?f=e:f=null:f=null},Mr=e=>{e>0&&v.lookAt(v.target,e,v.rotation)},Br=e=>{e!==null&&v.lookAt(v.target,v.distance[0],e)},Fr=e=>{e&&v.lookAt(e,v.distance[0],v.rotation)},Pi=e=>{e&&v.setView(e)},zr=e=>{Ue=!!e,v.config({isFixed:Ue})},kr=e=>{if(!e)return;p=he(e,!0),Be.setStyle({color:p});const n=p.map(s=>Math.round(s*255));Q.longPressIndicator.dataset.activeColor=`rgb(${n[0]}, ${n[1]}, ${n[2]})`},$r=e=>{Number.isNaN(+e)||+e<1||(I=+e,Be.setStyle({width:I}))},Ur=e=>{+e&&(T=+e,Q.set({minDelay:T}))},Vr=e=>{+e&&(A=+e,Q.set({minDist:A}))},Wr=e=>{P=$o(Pc,P)(e)},Hr=e=>{b=!!e,Q.set({enableInitiator:b})},Yr=e=>{R=e,Q.set({initiatorParentElement:R})},Gr=e=>{G=e,Q.set({longPressIndicatorParentElement:G})},Zr=e=>{W=!!e},jr=e=>{_=Number(e)},Kr=e=>{z=Number(e)},qr=e=>{U=Number(e)},Xr=e=>{de=Number(e)},Jr=e=>{e==="brush"?Q.set({type:e,minDist:Math.max(Vi,A)}):Q.set({type:e,minDist:A}),me=Q.get("type")},Qr=e=>{xe=Number(e)||xe,Q.set({brushSize:xe})},ea=()=>{ue[Nn]?v.config({isRotate:!0,mouseDownMoveModKey:ue[Nn]}):v.config({isRotate:!1})},ta=e=>{ue=Object.entries(e).reduce((n,[s,l])=>(Mc.includes(l)&&Nc.includes(s)&&(n[s]=l),n),{}),ea()},na=e=>{Le=$o(ki,_n)(e),v.config({defaultMouseDownMoveAction:Le===Ho?"rotate":"pan"})},oa=e=>{e!==null&&(Pe=e)},ia=e=>{e&&(ne=he(e,!0),Yt.setStyle({color:ne}),Gt.setStyle({color:ne}))},sa=e=>{e&&(ge=e,En=e.domain()[0],xn=e?e.domain()[1]-e.domain()[0]:0,ge.range([0,Ie]),Pt())},ra=e=>{e&&(re=e,wn=re.domain()[0],Sn=re?re.domain()[1]-re.domain()[0]:0,re.range([Me,0]),Pt())},aa=e=>{a=!!e},ca=e=>{y=!!e},la=e=>{ye=!!e,ye?pe&&Qt(X[0])&&on(Kn()).then(()=>{o.publish("pointConnectionsDraw"),Z=!0}):on()},wo=(e,n)=>s=>{if(s==="inherit")e([...n()]);else{const l=mt(s)?s:[s];e(l.map(g=>he(g,!0)))}xo()},da=wo(e=>{te=e},()=>V),ua=wo(e=>{ae=e},()=>ee),fa=wo(e=>{ce=e},()=>oe),ma=e=>{ut(e,ft,{minLength:1})&&(J=[...e]),bn(+e)&&(J=[+e]),te=te.map(n=>(n[3]=Number.isNaN(+J[0])?n[3]:+J[0],n)),xo()},ha=e=>{!Number.isNaN(+e)&&+e&&(ht=+e)},ga=e=>{ut(e,ft,{minLength:1})&&(ie=[...e]),bn(+e)&&(ie=[+e]),xo()},ya=e=>{!Number.isNaN(+e)&&+e&&(gt=Math.max(0,e))},pa=e=>{yt=Math.max(0,e)},Ea=e=>{vt=Math.max(0,e)},xa=e=>{we=e,ro()},wa=e=>{switch(e){case"linear":{tt=e,ct=ui;break}case"constant":{tt=e,ct=di;break}default:{tt="asinh",ct=fi;break}}},Sa=e=>{Ut=+e},Aa=e=>{bt=+e},Ia=e=>{je=+e},Ta=e=>{_t=he(e)},Pa=e=>{Ke=+e},Ca=e=>{Ne=+e},va=e=>{c.gamma=e},So=e=>{C=Number(e)||.5},Ao=e=>{D=!!e},ba=e=>{const[n]=Object.keys(Vo({[e]:os}));if(n==="aspectRatio")return nt;if(n==="background"||n==="backgroundColor")return B;if(n==="backgroundImage")return f;if(n==="camera")return v;if(n==="cameraTarget")return v.target;if(n==="cameraDistance")return v.distance[0];if(n==="cameraRotation")return v.rotation;if(n==="cameraView")return v.view;if(n==="cameraIsFixed")return Ue;if(n==="canvas")return r;if(n==="colorBy")return u;if(n==="sizeBy")return $e;if(n==="deselectOnDblClick")return a;if(n==="deselectOnEscape")return y;if(n==="height")return Ae;if(n==="lassoColor")return p;if(n==="lassoLineWidth")return I;if(n==="lassoMinDelay")return T;if(n==="lassoMinDist")return A;if(n==="lassoClearEvent")return P;if(n==="lassoInitiator")return b;if(n==="lassoInitiatorElement")return Q.initiator;if(n==="lassoInitiatorParentElement")return R;if(n==="lassoLongPressIndicatorParentElement")return G;if(n==="lassoOnLongPress")return W;if(n==="lassoType")return me;if(n==="lassoBrushSize")return xe;if(n==="mouseMode")return Le;if(n==="opacity")return j.length===1?j[0]:j;if(n==="opacityBy")return Se;if(n==="opacityByDensityFill")return Ut;if(n==="opacityByDensityDebounceTime")return Vt;if(n==="opacityInactiveMax")return bt;if(n==="opacityInactiveScale")return je;if(n==="points")return X;if(n==="hoveredPoint")return le;if(n==="selectedPoints")return[...L];if(n==="filteredPoints")return $?Array.from(K):Array.from({length:X.length},(s,l)=>l);if(n==="pointsInView")return xi();if(n==="pointColor")return V.length===1?V[0]:V;if(n==="pointColorActive")return ee.length===1?ee[0]:ee;if(n==="pointColorHover")return oe.length===1?oe[0]:oe;if(n==="pointOutlineWidth")return Ze;if(n==="pointSize")return H.length===1?H[0]:H;if(n==="pointSizeSelected")return ke;if(n==="pointSizeMouseDetection")return we;if(n==="showPointConnections")return ye;if(n==="pointConnectionColor")return te.length===1?te[0]:te;if(n==="pointConnectionColorActive")return ae.length===1?ae[0]:ae;if(n==="pointConnectionColorHover")return ce.length===1?ce[0]:ce;if(n==="pointConnectionColorBy")return Oe;if(n==="pointConnectionOpacity")return J.length===1?J[0]:J;if(n==="pointConnectionOpacityBy")return De;if(n==="pointConnectionOpacityActive")return ht;if(n==="pointConnectionSize")return ie.length===1?ie[0]:ie;if(n==="pointConnectionSizeActive")return gt;if(n==="pointConnectionSizeBy")return Re;if(n==="pointConnectionMaxIntPointsPerSegment")return yt;if(n==="pointConnectionTolerance")return vt;if(n==="pointScaleMode")return tt;if(n==="reticleColor")return ne;if(n==="regl")return c.regl;if(n==="showReticle")return Pe;if(n==="version")return Vd;if(n==="width")return Ce;if(n==="xScale")return ge;if(n==="yScale")return re;if(n==="performanceMode")return pt;if(n==="renderPointsAsSquares")return Et;if(n==="disableAlphaBlending")return fn;if(n==="gamma")return c.gamma;if(n==="renderer")return c;if(n==="isDestroyed")return qe;if(n==="isDrawing")return Lt;if(n==="isPointsDrawn")return pe;if(n==="isPointsFiltered")return $;if(n==="isAnnotationsDrawn")return Bt;if(n==="zDataType")return At;if(n==="wDataType")return It;if(n==="spatialIndex")return Xe==null?void 0:Xe.data;if(n==="annotationLineColor")return _t;if(n==="annotationLineWidth")return Ke;if(n==="annotationHVLineLimit")return Ne;if(n==="antiAliasing")return C;if(n==="pixelAligned")return D;if(n==="actionKeyMap")return{...ue}},Ci=(e={})=>qe?Promise.reject(new Error(Mo)):(Vo(e),(e.backgroundColor!==void 0||e.background!==void 0)&&Rr(e.backgroundColor||e.background),e.backgroundImage!==void 0&&Nr(e.backgroundImage),e.cameraTarget!==void 0&&Fr(e.cameraTarget),e.cameraDistance!==void 0&&Mr(e.cameraDistance),e.cameraRotation!==void 0&&Br(e.cameraRotation),e.cameraView!==void 0&&Pi(e.cameraView),e.cameraIsFixed!==void 0&&zr(e.cameraIsFixed),e.colorBy!==void 0&&As(e.colorBy),e.pointColor!==void 0&&gs(e.pointColor),e.pointColorActive!==void 0&&ys(e.pointColorActive),e.pointColorHover!==void 0&&ps(e.pointColorHover),e.pointSize!==void 0&&ao(e.pointSize),e.pointSizeSelected!==void 0&&xs(e.pointSizeSelected),e.pointSizeMouseDetection!==void 0&&xa(e.pointSizeMouseDetection),e.sizeBy!==void 0&&Ts(e.sizeBy),e.opacity!==void 0&&Ss(e.opacity),e.showPointConnections!==void 0&&la(e.showPointConnections),e.pointConnectionColor!==void 0&&da(e.pointConnectionColor),e.pointConnectionColorActive!==void 0&&ua(e.pointConnectionColorActive),e.pointConnectionColorHover!==void 0&&fa(e.pointConnectionColorHover),e.pointConnectionColorBy!==void 0&&Ps(e.pointConnectionColorBy),e.pointConnectionOpacityBy!==void 0&&Cs(e.pointConnectionOpacityBy),e.pointConnectionOpacity!==void 0&&ma(e.pointConnectionOpacity),e.pointConnectionOpacityActive!==void 0&&ha(e.pointConnectionOpacityActive),e.pointConnectionSize!==void 0&&ga(e.pointConnectionSize),e.pointConnectionSizeActive!==void 0&&ya(e.pointConnectionSizeActive),e.pointConnectionSizeBy!==void 0&&vs(e.pointConnectionSizeBy),e.pointConnectionMaxIntPointsPerSegment!==void 0&&pa(e.pointConnectionMaxIntPointsPerSegment),e.pointConnectionTolerance!==void 0&&Ea(e.pointConnectionTolerance),e.pointScaleMode!==void 0&&wa(e.pointScaleMode),e.opacityBy!==void 0&&Is(e.opacityBy),e.lassoColor!==void 0&&kr(e.lassoColor),e.lassoLineWidth!==void 0&&$r(e.lassoLineWidth),e.lassoMinDelay!==void 0&&Ur(e.lassoMinDelay),e.lassoMinDist!==void 0&&Vr(e.lassoMinDist),e.lassoClearEvent!==void 0&&Wr(e.lassoClearEvent),e.lassoInitiator!==void 0&&Hr(e.lassoInitiator),e.lassoInitiatorParentElement!==void 0&&Yr(e.lassoInitiatorParentElement),e.lassoLongPressIndicatorParentElement!==void 0&&Gr(e.lassoLongPressIndicatorParentElement),e.lassoOnLongPress!==void 0&&Zr(e.lassoOnLongPress),e.lassoLongPressTime!==void 0&&jr(e.lassoLongPressTime),e.lassoLongPressAfterEffectTime!==void 0&&Kr(e.lassoLongPressAfterEffectTime),e.lassoLongPressEffectDelay!==void 0&&qr(e.lassoLongPressEffectDelay),e.lassoLongPressRevertEffectTime!==void 0&&Xr(e.lassoLongPressRevertEffectTime),e.lassoType!==void 0&&Jr(e.lassoType),e.lassoBrushSize!==void 0&&Qr(e.lassoBrushSize),e.actionKeyMap!==void 0&&ta(e.actionKeyMap),e.mouseMode!==void 0&&na(e.mouseMode),e.showReticle!==void 0&&oa(e.showReticle),e.reticleColor!==void 0&&ia(e.reticleColor),e.pointOutlineWidth!==void 0&&ws(e.pointOutlineWidth),e.height!==void 0&&so(e.height),e.width!==void 0&&lo(e.width),e.aspectRatio!==void 0&&hs(e.aspectRatio),e.xScale!==void 0&&sa(e.xScale),e.yScale!==void 0&&ra(e.yScale),e.deselectOnDblClick!==void 0&&aa(e.deselectOnDblClick),e.deselectOnEscape!==void 0&&ca(e.deselectOnEscape),e.opacityByDensityFill!==void 0&&Sa(e.opacityByDensityFill),e.opacityInactiveMax!==void 0&&Aa(e.opacityInactiveMax),e.opacityInactiveScale!==void 0&&Ia(e.opacityInactiveScale),e.gamma!==void 0&&va(e.gamma),e.annotationLineColor!==void 0&&Ta(e.annotationLineColor),e.annotationLineWidth!==void 0&&Pa(e.annotationLineWidth),e.annotationHVLineLimit!==void 0&&Ca(e.annotationHVLineLimit),e.antiAliasing!==void 0&&So(e.antiAliasing),e.pixelAligned!==void 0&&Ao(e.pixelAligned),new Promise(n=>{window.requestAnimationFrame(()=>{qe||!r||(no(),v.refresh(),c.refresh(),Pn(),n())})})),_a=(e,{preventEvent:n=!1}={})=>{Pi(e),Z=!0,Vn=n},vi=()=>{v||(v=tc(r,{isFixed:Ue,isPanInverted:[!1,!0],defaultMouseDownMoveAction:Le===Ho?"rotate":"pan"})),t.cameraView?v.setView(Mi(t.cameraView)):t.cameraTarget||t.cameraDistance||t.cameraRotation?v.lookAt([...t.cameraTarget||dl],t.cameraDistance||ul,t.cameraRotation||fl):v.setView(Mi(ml)),Zt=at(1,1),jt=at(-1,-1)},La=({preventEvent:e=!1}={})=>{vi(),Pt(),!e&&o.publish("view",{view:v.view,camera:v,xScale:ge,yScale:re})},bi=({key:e})=>{switch(e){case"Escape":{y&&Tn();break}}},_i=()=>{Ft=!0,Jt=!0},Li=()=>{en(),Ft=!1,Jt=!0,Z=!0},Oi=()=>{Z=!0},Di=()=>{yi([]),We.clear()},Oa=()=>{We.clear()},Ri=()=>{wi([])},Da=()=>{Di(),Ri()},rn=()=>{v.refresh();const e=Ce===Ge,n=Ae===Ge;if(e||n){const{width:s,height:l}=r.getBoundingClientRect();e&&co(s),n&&io(l),no(),Z=!0}},Ra=async e=>{r.style.userSelect="none";const n=window.devicePixelRatio,s=H,l=Ce,g=Ae,x=c.canvas.width/n,S=c.canvas.height/n,E=D,h=C,M=(e==null?void 0:e.scale)||1,fe=Array.isArray(H)?H.map(an=>an*M):H*M,Ee=Ie*M,Io=Me*M;ao(fe),lo(Ee),so(Io),Ao((e==null?void 0:e.pixelAligned)||D),So((e==null?void 0:e.antiAliasing)||C),c.resize(Ce,Ae),c.refresh(),await new Promise(an=>{o.subscribe("draw",an,1),Pn()});const kt=r.getContext("2d").getImageData(0,0,r.width,r.height);return c.resize(x,S),c.refresh(),ao(s),lo(l),so(g),Ao(E),So(h),await new Promise(an=>{o.subscribe("draw",an,1),Pn()}),r.style.userSelect=null,kt},Na=e=>e===void 0?r.getContext("2d").getImageData(0,0,r.width,r.height):Ra(e),Ma=()=>{no(),vi(),Pt(),Be=cn(c.regl,{color:p,width:I,is2d:!0}),We=cn(c.regl,{color:eo(te,ae,ce),opacity:J===null?null:J[0],width:ie[0],widthActive:gt,is2d:!0}),Yt=cn(c.regl,{color:ne,width:1,is2d:!0}),Gt=cn(c.regl,{color:ne,width:1,is2d:!0}),w=cn(c.regl,{color:_t,width:Ke,is2d:!0}),ro(),r.addEventListener("wheel",Oi),Kt=c.regl.buffer(),Yn=c.regl.buffer(),qt=c.regl.buffer({usage:"dynamic",type:"float",length:Ac*2}),rt=to(),He=Qn();const e=Ci({backgroundImage:f,width:Ce,height:Ae,actionKeyMap:ue});Ii(),Ti(),window.addEventListener("keyup",bi,!1),window.addEventListener("blur",ci,!1),window.addEventListener("mouseup",Jn,!1),window.addEventListener("mousemove",ai,!1),r.addEventListener("mousedown",ii,!1),r.addEventListener("mouseenter",_i,!1),r.addEventListener("mouseleave",Li,!1),r.addEventListener("click",si,!1),r.addEventListener("dblclick",ri,!1),"ResizeObserver"in window?(mn=new ResizeObserver(rn),mn.observe(r)):(window.addEventListener("resize",rn),window.addEventListener("orientationchange",rn)),e.then(()=>{o.publish("init")})},Ba=c.onFrame(()=>{if(jn=v.tick(),!((pe||Bt)&&(Z||St)))return;St&&!Cr(Gn,Zn)&&vr(),jn&&(Zt=at(1,1),jt=at(-1,-1),Se==="density"&&Ar()),c.render(()=>{const n=r.width/c.canvas.width,s=r.height/c.canvas.height;ms(n,s),f!=null&&f._reglType&&lr(),Ve.length>2&&dr(),St||We.draw({projection:ho(),model:yo(),view:go()});const l=mi();pe&&l>0&&or(),!O&&(Pe||wt)&&ur(),le>=0&&ir(),L.length>0&&cr(),w.draw({projection:ho(),model:yo(),view:go()}),Be.draw({projection:ho(),model:yo(),view:go()})},r);const e={view:v.view,camera:v,xScale:ge,yScale:re};jn&&(Pt(),Vn?Vn=!1:o.publish("view",e)),Z=!1,wt=!1,o.publish("drawing",e,{async:!1}),o.publish("draw",e)}),Pn=()=>{Z=!0},Fa=()=>{pe=!1,Bt=!1,qe=!0,Ba(),window.removeEventListener("keyup",bi,!1),window.removeEventListener("blur",ci,!1),window.removeEventListener("mouseup",Jn,!1),window.removeEventListener("mousemove",ai,!1),r.removeEventListener("mousedown",ii,!1),r.removeEventListener("mouseenter",_i,!1),r.removeEventListener("mouseleave",Li,!1),r.removeEventListener("click",si,!1),r.removeEventListener("dblclick",ri,!1),r.removeEventListener("wheel",Oi,!1),mn?mn.disconnect():(window.removeEventListener("resize",rn),window.removeEventListener("orientationchange",rn)),r=void 0,v.dispose(),v=void 0,Be.destroy(),Q.destroy(),We.destroy(),Yt.destroy(),Gt.destroy(),rt&&rt.destroy(),He&&He.destroy(),t.renderer||c.isDestroyed||c.destroy(),o.publish("destroy"),o.clear()};return Ma(),{get isSupported(){return c.isSupported},clear:sn(Da),clearPoints:sn(Di),clearPointConnections:sn(Oa),clearAnnotations:sn(Ri),createTextureFromUrl:(e,n=Xo)=>Hi(c.regl,e,n),deselect:Tn,destroy:Fa,draw:br,drawAnnotations:wi,filter:Ei,get:ba,getScreenPosition:Dr,hover:en,redraw:Pn,refresh:c.refresh,reset:sn(La),select:zt,set:Ci,export:Na,subscribe:o.subscribe,unfilter:Sr,unsubscribe:o.unsubscribe,view:_a,zoomToLocation:Ai,zoomToArea:Si,zoomToPoints:Lr,zoomToOrigin:Or}};class Zi extends sc{constructor(o,i){super({...i,view:new Wd(o,{props:i.props,viewProps:i.viewProps})})}}class Wd{constructor(o,{props:i,viewProps:m}){this.element=o.createElement("div"),this.element.classList.add("tp-link"),m.bindClassModifiers(this.element);const d=o.createElement("a");m.bindDisabled(d);function c(f){d.href=f??""}function C(f){d.textContent=f??""}function D(f){f?(d.classList.add("active"),d.removeAttribute("href"),d.removeAttribute("target")):(d.classList.remove("active"),c(i.get("link")),B(i.get("newPage")))}function B(f){f?d.target="_blank":d.removeAttribute("target")}vn(i.value("link"),c),vn(i.value("label"),C),vn(i.value("active"),D),vn(i.value("newPage"),B),this.element.appendChild(d),this.linkElement=d}}class Hd extends rc{get label(){return this.controller.props.get("label")??""}set label(o){this.controller.props.set("label",o)}get link(){return this.controller.props.get("link")}set link(o){this.controller.props.set("link",o)}get active(){return this.controller.props.get("active")}set active(o){this.controller.props.set("active",!!o)}get newPage(){return this.controller.props.get("newPage")}set newPage(o){this.controller.props.set("newPage",!!o)}}const Yd=nc({id:"link",type:"blade",accept(t){const o=oc(t,i=>({view:i.required.constant("link"),link:i.required.string,label:i.required.string,active:i.optional.boolean,newPage:i.optional.boolean}));return o?{params:o}:null},controller(t){return new Zi(t.document,{blade:t.blade,props:ic.fromObject({label:t.params.label,link:t.params.link,active:t.params.active,newPage:t.params.newPage}),viewProps:t.viewProps})},api(t){return t.controller instanceof Zi?new Hd(t.controller):null}});function Gd(t,o="file.txt"){const i=document.createElement("a");i.href=URL.createObjectURL(t),i.download=o,document.body.appendChild(i),i.dispatchEvent(new MouseEvent("click",{bubbles:!0,cancelable:!0,view:window})),document.body.removeChild(i)}function Zd(t){const o=new Image;o.onload=()=>{t.get("canvas").toBlob(i=>{Gd(i,"regl-scatterplot.png")})},o.src=t.get("canvas").toDataURL()}function jd(){const t=document.querySelector("#modal"),o=document.querySelector("#modal-text");t.style.display="none",o.textContent=""}function Kd(t,o,i){const m=document.querySelector("#modal");m.style.display="flex";const d=document.querySelector("#modal-text");d.style.color=o?"#cc79A7":"#bbb",d.textContent=t;const c=document.querySelector("#modal-close");i?(c.style.display="block",c.style.background=o?"#cc79A7":"#bbb",c.addEventListener("click",jd,{once:!0})):c.style.display="none"}function nu(t){t.isSupported||Kd("Your browser does not support all necessary WebGL features. The scatter plot might not render properly.",!0,!0)}const qd={numPoints:1e5,pointSize:2,opacity:.33,opacityByDensity:!1,lassoInit:"longPress",lassoType:"freeform",lassoBrushSize:24},Qe=(t,o)=>{if(Array.isArray(t))for(const i of t)i.set(o);else t.set(o)};function ou({scatterplot:t,setNumPoints:o,setPointSize:i,setOpacity:m,opacityChangesDisabled:d}){let c=!1;const C=Array.isArray(t)?t[0]:t,D={...qd,numPoints:0,pointSize:Array.isArray(C.get("pointSize"))?C.get("pointSize")[0]:C.get("pointSize"),opacity:C.get("opacity"),opacityByDensity:C.get("opacityBy")==="density",lassoType:C.get("lassoType"),lassoBrushSize:C.get("lassoBrushSize")},B={...D},f=new ac({title:"Details",container:document.getElementById("controls")});f.registerPlugin({id:"link",plugins:[Yd]});const r=f.addFolder({title:"Settings"}),u=r.addBinding(D,"numPoints",{label:"Num Points",min:1e3,step:1e3,max:2e6});u.disabled=!0,o&&u.on("change",({last:z,value:U})=>{c&&z&&o(U)});const a=r.addBinding(D,"pointSize",{label:"Point Size",min:1,max:32,step:1});a.disabled=Array.isArray(C.get("pointSize")),a.on("change",({value:z})=>{i?i(z):Qe(t,{pointSize:z})});const y=r.addBinding(D,"opacity",{label:"Opacity",min:.01,max:1,step:.01});y.disabled=D.opacityByDensity||!!d,y.on("change",({value:z})=>{m?m(z):Qe(t,{opacity:z})});const p=r.addBinding(D,"opacityByDensity",{label:"Dynamic Opacity"});p.disabled=!!d,p.on("change",({value:z})=>{Qe(t,{opacityBy:z?"density":null}),y.disabled=z}),r.addBinding(D,"lassoInit",{label:"Lasso Init",options:{"On Long Press":"longPress","Via Click Initiator":"clickInitiator"}}).on("change",({value:z})=>{switch(z){case"longPress":{Qe(t,{lassoInitiator:!1,lassoOnLongPress:!0});break}case"clickInitiator":{Qe(t,{lassoInitiator:!0,lassoOnLongPress:!1});break}}}),r.addBinding(D,"lassoType",{label:"Lasso Type",options:{Freeform:"freeform",Brush:"brush",Rectangle:"rectangle"}}).on("change",({value:z})=>{switch(z){case"freeform":{Qe(t,{lassoType:"freeform"});break}case"brush":{Qe(t,{lassoType:"brush"});break}case"rectangle":{Qe(t,{lassoType:"rectangle"});break}}A.hidden=z!=="brush"});const A=r.addBinding(D,"lassoBrushSize",{label:"Brush Size",min:1,max:256,step:1});A.hidden=D.lassoType!=="brush",A.on("change",({value:z})=>{Qe(t,{lassoBrushSize:z})}),r.addButton({title:"Reset"}).on("click",()=>{for(const[z,U]of Object.entries(B))D[z]=U;f.refresh()});const b=f.addFolder({title:"Examples"}),R=window.location.pathname.slice(1);b.addBlade({view:"link",label:"Color Encoding",link:"index.html",active:R===""||R==="index.html"}),b.addBlade({view:"link",label:"Size & Opacity Encoding",link:"size-encoding.html",active:R==="size-encoding.html"}),b.addBlade({view:"link",label:"Dynamic Opacity",link:"dynamic-opacity.html",active:R==="dynamic-opacity.html"}),b.addBlade({view:"link",label:"Axes",link:"axes.html",active:R==="axes.html"}),b.addBlade({view:"link",label:"Text Labels",link:"text-labels.html",active:R==="text-labels.html"}),b.addBlade({view:"link",label:"Annotations",link:"annotations.html",active:R==="annotations.html"}),b.addBlade({view:"link",label:"Multiple Instances",link:"multiple-instances.html",active:R==="multiple-instances.html"}),b.addBlade({view:"link",label:"Transition",link:"transition.html",active:R==="transition.html"}),b.addBlade({view:"link",label:"Point Connections",link:"connected-points.html",active:R==="connected-points.html"}),b.addBlade({view:"link",label:"Point Connections by Line Segments",link:"connected-points-by-segments.html",active:R==="connected-points-by-segments.html"}),b.addBlade({view:"link",label:"Background Image",link:"texture-background.html",active:R==="texture-background.html"}),b.addBlade({view:"link",label:"Performance Mode (20M Points)",link:"performance-mode.html",active:R==="performance-mode.html"}),f.addFolder({title:"Info",expanded:!1}).addBlade({view:"text",label:"version",parse:z=>String(z),value:C.get("version"),disabled:!0}),f.addButton({title:"Download as PNG"}).on("click",()=>{Zd(t)}),f.addButton({title:"Source Code"}).on("click",()=>{window.open("https://github.com/flekschas/regl-scatterplot","_blank").focus()}),C.subscribe("draw",()=>{D.numPoints=C.get("points").length,B.numPoints=D.numPoints,o&&(u.disabled=!1),f.refresh(),c=!0},1)}export{nu as a,ou as b,tu as c,Kd as d,jd as e,Dd as f,Zd as s};
