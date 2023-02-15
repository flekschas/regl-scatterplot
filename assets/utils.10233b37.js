import{c as Ra,b as Xo,d as Da,l as ba,q as Ma,e as Na,f as Ba,g as Fa,p as $a,i as gt,w as za,h as Fo,t as Jo,j as Ua,n as ft,k as ka,m as Va,o as Ha,u as Wa,r as mt,s as Vt,v as Ya,x as $o,y as bn,K as Ga,z as Za,A as zo,C as Uo}from"./vendor.cfd24b35.js";const ja=function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const d of document.querySelectorAll('link[rel="modulepreload"]'))u(d);new MutationObserver(d=>{for(const r of d)if(r.type==="childList")for(const L of r.addedNodes)L.tagName==="LINK"&&L.rel==="modulepreload"&&u(L)}).observe(document,{childList:!0,subtree:!0});function s(d){const r={};return d.integrity&&(r.integrity=d.integrity),d.referrerpolicy&&(r.referrerPolicy=d.referrerpolicy),d.crossorigin==="use-credentials"?r.credentials="include":d.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function u(d){if(d.ep)return;d.ep=!0;const r=s(d);fetch(d.href,r)}};ja();const Pe="auto",Ka=0,Mn=1,qa=2,ko=3,Xa=4,Ja=Float32Array.BYTES_PER_ELEMENT,Qo=["OES_texture_float","OES_element_index_uint","WEBGL_color_buffer_float","EXT_float_blend"],Vo={color:[0,0,0,0],depth:1},qn="panZoom",ei="lasso",ti="rotate",Qa=[qn,ei,ti],er=qn,tr={cubicIn:Ra,cubicInOut:Xo,cubicOut:Da,linear:ba,quadIn:Ma,quadInOut:Na,quadOut:Ba},Ho=Xo,jn="deselect",Xn="lassoEnd",nr=[jn,Xn],or=[0,.666666667,1,1],ir=2,sr=!1,ar=10,rr=3,cr=Xn,lr=!1,Yt=750,Gt=500,Zt=100,jt=250,Jn="lasso",Kt="rotate",qt="merge",ur=[Jn,Kt,qt],Qn="alt",eo="cmd",ni="ctrl",oi="meta",to="shift",dr=[Qn,eo,ni,oi,to],fr={[Qn]:Kt,[to]:Jn,[eo]:qt},mr=1,gr=Pe,hr=Pe,yr=1,Nn=1,Er=6,xr=2,Tr=2,Bn=null,Cr=2,Sr=2,Fn=null,Ir=null,$n=null,Ar=.66,Or=1,zn=null,wr=.15,vr=25,_r=1,Lr=1,vt=null,Pr=[.66,.66,.66,Or],pr=[0,.55,1,1],Rr=[1,1,1,1],Dr=[0,0,0,1],Un=null,br=[.66,.66,.66,.2],Mr=[0,.55,1,1],Nr=[1,1,1,1],Br=[0,0],Fr=1,$r=0,zr=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),Ur="IMAGE_LOAD_ERROR",kr=null,Vr=!1,Hr=[1,1,1,.5],Wr=!0,Yr=!0,Gr=!1,Zr=100,jr=1/500,Kr="auto",qr=!1,Xr=200,Jr=500,ii=new Set(["z","valueZ","valueA","value1","category"]),si=new Set(["w","valueW","valueB","value2","value"]),no=15e3,Qr=(t,n)=>t?Qo.reduce((s,u)=>t.hasExtension(u)?s:(n||console.warn(`WebGL: ${u} extension not supported. Scatterplot might not render properly`),!1),!0):!1,ec=t=>{const n=t.getContext("webgl",{antialias:!0,preserveDrawingBuffer:!0}),s=[];return Qo.forEach(u=>{n.getExtension(u)?s.push(u):console.warn(`WebGL: ${u} extension not supported. Scatterplot might not render properly`)}),Fa({gl:n,extensions:s})},Wo=(t,n,s,u)=>Math.sqrt((t-s)**2+(n-u)**2),tc=t=>{let n=1/0,s=-1/0,u=1/0,d=-1/0;for(let r=0;r<t.length;r+=2)n=t[r]<n?t[r]:n,s=t[r]>s?t[r]:s,u=t[r+1]<u?t[r+1]:u,d=t[r+1]>d?t[r+1]:d;return[n,u,s,d]},nc=(t,n=!1)=>t.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(s,u,d,r)=>`#${u}${u}${d}${d}${r}${r}`).substring(1).match(/.{2}/g).map(s=>parseInt(s,16)/255**n),Ve=(t,n,{minLength:s=0}={})=>Array.isArray(t)&&t.length>=s&&t.every(n),He=t=>!Number.isNaN(+t)&&+t>=0,Ht=t=>!Number.isNaN(+t)&&+t>0,Yo=(t,n)=>s=>t.indexOf(s)>=0?s:n,oc=(t,n=!1,s=no)=>new Promise((u,d)=>{const r=new Image;n&&(r.crossOrigin="anonymous"),r.src=t,r.onload=()=>{u(r)};const L=()=>{d(new Error(Ur))};r.onerror=L,setTimeout(L,s)}),Go=(t,n,s=no)=>new Promise((u,d)=>{oc(n,n.indexOf(window.location.origin)!==0&&n.indexOf("base64")===-1,s).then(r=>{u(t.texture(r))}).catch(r=>{d(r)})}),ic=(t,n=!1)=>[...nc(t,n),255**!n],sc=t=>/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(t),ac=t=>t>=0&&t<=1,Xt=t=>Array.isArray(t)&&t.every(ac),rc=(t,[n,s]=[])=>{let u,d,r,L,B=!1;for(let x=0,h=t.length-2;x<t.length;x+=2)u=t[x],d=t[x+1],r=t[h],L=t[h+1],d>s!=L>s&&n<(r-u)*(s-d)/(L-d)+u&&(B=!B),h=x;return B},Kn=t=>typeof t=="string"||t instanceof String,cc=t=>Number.isInteger(t)&&t>=0&&t<=255,ai=t=>Array.isArray(t)&&t.every(cc),lc=t=>t.length===3&&(Xt(t)||ai(t)),uc=t=>t.length===4&&(Xt(t)||ai(t)),We=t=>Array.isArray(t)&&t.length&&(Array.isArray(t[0])||Kn(t[0])),Wt=(t,n)=>t>n?t:n,Zo=(t,n)=>t<n?t:n,le=(t,n)=>{if(uc(t)){const s=Xt(t);return n&&s||!n&&!s?t:n&&!s?t.map(u=>u/255):t.map(u=>u*255)}if(lc(t)){const s=255**!n,u=Xt(t);return n&&u||!n&&!u?[...t,s]:n&&!u?[...t.map(d=>d/255),s]:[...t.map(d=>d*255),s]}return sc(t)?ic(t,n):(console.warn("Only HEX, RGB, and RGBA are handled by this function. Returning white instead."),n?[1,1,1,1]:[255,255,255,255])},jo=t=>Object.entries(t).reduce((n,[s,u])=>(n[u]?n[u]=[...n[u],s]:n[u]=s,n),{}),Ko=t=>.21*t[0]+.72*t[1]+.07*t[2],dc=(t,n,s)=>Math.min(s,Math.max(n,t)),fc=(t={})=>{let{regl:n,canvas:s=document.createElement("canvas"),gamma:u=yr}=t;n||(n=ec(s));const d=Qr(n),r=[s.width,s.height],L=n.framebuffer({width:r[0],height:r[1],colorFormat:"rgba",colorType:"float"}),B=n({vert:`
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
      }`,attributes:{xy:[-4,-4,4,-4,0,4]},uniforms:{src:()=>L,srcRes:()=>r,gamma:()=>u},count:3,depth:{enable:!1},blend:{enable:!0,func:{srcRGB:"one",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}}}),x=S=>{const g=S.getContext("2d");g.clearRect(0,0,S.width,S.height),g.drawImage(s,(s.width-S.width)/2,(s.height-S.height)/2,S.width,S.height,0,0,S.width,S.height)},h=(S,g)=>{n.clear(Vo),L.use(()=>{n.clear(Vo),S()}),B(),x(g)},E=()=>{n.poll()},C=new Set,m=S=>(C.add(S),()=>{C.delete(S)}),T=n.frame(()=>{const S=C.values();let g=S.next();for(;!g.done;)g.value(),g=S.next()}),I=()=>{s.width=window.innerWidth*window.devicePixelRatio,s.height=window.innerHeight*window.devicePixelRatio,r[0]=s.width,r[1]=s.height,L.resize(...r)};return t.canvas||(window.addEventListener("resize",I),window.addEventListener("orientationchange",I),I()),{get canvas(){return s},get regl(){return n},get gamma(){return u},set gamma(S){u=+S},get isSupported(){return d},render:h,onFrame:m,refresh:E,destroy:()=>{T.cancel(),s=void 0,n=void 0,window.removeEventListener("resize",I),window.removeEventListener("orientationchange",I)}}},mc=!0,kn=8,qo=2,gc=2500,hc=250,yc=()=>{const t=document.createElement("div"),n=Math.random().toString(36).substring(2,5)+Math.random().toString(36).substring(2,5);t.id=`lasso-long-press-${n}`,t.style.position="fixed",t.style.width="1.5rem",t.style.height="1.5rem",t.style.pointerEvents="none",t.style.transform="translate(-50%,-50%)";const s=document.createElement("div");s.style.position="absolute",s.style.top=0,s.style.left=0,s.style.width="1.5rem",s.style.height="1.5rem",s.style.clipPath="inset(0px 0px 0px 50%)",s.style.opacity=0,t.appendChild(s);const u=document.createElement("div");u.style.position="absolute",u.style.top=0,u.style.left=0,u.style.width="1rem",u.style.height="1rem",u.style.border="0.25rem solid currentcolor",u.style.borderRadius="1rem",u.style.clipPath="inset(0px 50% 0px 0px)",u.style.transform="rotate(0deg)",s.appendChild(u);const d=document.createElement("div");d.style.position="absolute",d.style.top=0,d.style.left=0,d.style.width="1rem",d.style.height="1rem",d.style.border="0.25rem solid currentcolor",d.style.borderRadius="1rem",d.style.clipPath="inset(0px 50% 0px 0px)",d.style.transform="rotate(0deg)",s.appendChild(d);const r=document.createElement("div");return r.style.position="absolute",r.style.top=0,r.style.left=0,r.style.width="1.5rem",r.style.height="1.5rem",r.style.borderRadius="1.5rem",r.style.background="currentcolor",r.style.transform="scale(0)",r.style.opacity=0,t.appendChild(r),{longPress:t,longPressCircle:s,longPressCircleLeft:u,longPressCircleRight:d,longPressEffect:r}},Ec=(t,n,s)=>(1-t)*n+s,xc=(t,n)=>`${t}ms ease-out mainIn ${n}ms 1 normal forwards`,Tc=(t,n)=>`${t}ms ease-out effectIn ${n}ms 1 normal forwards`,Cc=(t,n)=>`${t}ms linear leftSpinIn ${n}ms 1 normal forwards`,Sc=(t,n)=>`${t}ms linear rightSpinIn ${n}ms 1 normal forwards`,Ic=(t,n)=>`${t}ms linear circleIn ${n}ms 1 normal forwards`,Ac=(t,n,s)=>`
  @keyframes mainIn {
    0%, ${t}% {
      color: ${n};
    }
    100% {
      color: ${s};
    }
  }
`,Oc=(t,n,s,u)=>`
  @keyframes effectIn {
    0%, ${t}% {
      opacity: ${s};
      transform: scale(${u});
    }
    ${n}% {
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
`,wc=(t,n,s)=>`
  @keyframes circleIn {
    0% {
      clip-path: ${n};
      opacity: ${s};
    }
    ${t}% {
      clip-path: ${n};
      opacity: 1;
    }
    ${t+.01}%, 100% {
      clip-path: inset(0);
      opacity: 1;
    }
  }
`,vc=(t,n)=>`
  @keyframes leftSpinIn {
    0% {
      transform: rotate(${n}deg);
    }
    ${t}%, 100% {
      transform: rotate(360deg);
    }
  }
`,_c=(t,n)=>`
  @keyframes rightSpinIn {
    0% {
      transform: rotate(${n}deg);
    }
    ${t}%, 100% {
      transform: rotate(180deg);
    }
  }
`,Lc=({time:t=Yt,extraTime:n=Gt,delay:s=Zt,currentColor:u,targetColor:d,effectOpacity:r,effectScale:L,circleLeftRotation:B,circleRightRotation:x,circleClipPath:h,circleOpacity:E})=>{const C=B/360,m=Ec(C,t,n),T=Math.round((1-C)*t/m*100),I=Math.round(T/2),O=T+(100-T)/4;return{rules:{main:Ac(T,u,d),effect:Oc(T,O,r,L),circleRight:_c(I,x),circleLeft:vc(T,B),circle:wc(I,h,E)},names:{main:xc(m,s),effect:Tc(m,s),circleLeft:Cc(m,s),circleRight:Sc(m,s),circle:Ic(m,s)}}},Pc=t=>`${t}ms linear mainOut 0s 1 normal forwards`,pc=t=>`${t}ms linear effectOut 0s 1 normal forwards`,Rc=t=>`${t}ms linear leftSpinOut 0s 1 normal forwards`,Dc=t=>`${t}ms linear rightSpinOut 0s 1 normal forwards`,bc=t=>`${t}ms linear circleOut 0s 1 normal forwards`,Mc=(t,n)=>`
  @keyframes mainOut {
    0% {
      color: ${t};
    }
    100% {
      color: ${n};
    }
  }
`,Nc=(t,n)=>`
  @keyframes effectOut {
    0% {
      opacity: ${t};
      transform: scale(${n});
    }
    99% {
      opacity: 0;
      transform: scale(${n+.5});
    }
    100% {
      opacity: 0;
      transform: scale(0);
    }
  }
`,Bc=(t,n)=>`
  @keyframes rightSpinOut {
    0%, ${t}% {
      transform: rotate(${n}deg);
    }
    100% {
      transform: rotate(0deg);
    }
`,Fc=t=>`
  @keyframes leftSpinOut {
    0% {
      transform: rotate(${t}deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
`,$c=(t,n,s)=>`
  @keyframes circleOut {
    0%, ${t}% {
      clip-path: ${n};
      opacity: ${s};
    }
    ${t+.01}% {
      clip-path: inset(0 0 0 50%);
      opacity: ${s};
    }
    100% {
      clip-path: inset(0 0 0 50%);
      opacity: 0;
    }
  }
`,zc=({time:t=jt,currentColor:n,targetColor:s,effectOpacity:u,effectScale:d,circleLeftRotation:r,circleRightRotation:L,circleClipPath:B,circleOpacity:x})=>{const h=r/360,E=h*t,C=Math.min(100,h*100),m=C>50?Math.round((1-50/C)*100):0;return{rules:{main:Mc(n,s),effect:Nc(u,d),circleRight:Bc(m,L),circleLeft:Fc(r),circle:$c(m,B,x)},names:{main:Pc(E),effect:pc(E),circleRight:Rc(E),circleLeft:Dc(E),circle:bc(E)}}},_t=(t,n=null)=>t===null?n:t;let Vn;const ri=()=>{if(!Vn){const t=document.createElement("style");document.head.appendChild(t),Vn=t.sheet}return Vn},ye=t=>{const n=ri(),s=n.rules.length;return n.insertRule(t,s),s},Ee=t=>{ri().deleteRule(t)},Uc=`${gc}ms ease scaleInFadeOut 0s 1 normal backwards`,kc=(t,n,s)=>`
@keyframes scaleInFadeOut {
  0% {
    opacity: ${t};
    transform: translate(-50%,-50%) scale(${n}) rotate(${s}deg);
  }
  10% {
    opacity: 1;
    transform: translate(-50%,-50%) scale(1) rotate(${s+20}deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%,-50%) scale(0.9) rotate(${s+60}deg);
  }
}
`;let Hn=null;const Vc=`${hc}ms ease fadeScaleOut 0s 1 normal backwards`,Hc=(t,n,s)=>`
@keyframes fadeScaleOut {
  0% {
    opacity: ${t};
    transform: translate(-50%,-50%) scale(${n}) rotate(${s}deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%,-50%) scale(0) rotate(${s}deg);
  }
}
`;let Wn=null;const ci=(t,{onDraw:n=gt,onStart:s=gt,onEnd:u=gt,enableInitiator:d=mc,initiatorParentElement:r=document.body,longPressIndicatorParentElement:L=document.body,minDelay:B=kn,minDist:x=qo,pointNorm:h=gt}={})=>{let E=d,C=r,m=L,T=n,I=s,O=u,S=h;const g=document.createElement("div"),te=Math.random().toString(36).substring(2,5)+Math.random().toString(36).substring(2,5);g.id=`lasso-initiator-${te}`,g.style.position="fixed",g.style.display="flex",g.style.justifyContent="center",g.style.alignItems="center",g.style.zIndex=99,g.style.width="4rem",g.style.height="4rem",g.style.borderRadius="4rem",g.style.opacity=.5,g.style.transform="translate(-50%,-50%) scale(0) rotate(0deg)";const{longPress:p,longPressCircle:q,longPressCircleLeft:ue,longPressCircleRight:ne,longPressEffect:se}=yc();let pe=!1,Re=!1,ae=[],re=[],b,V=!1,Y=null,De=null,z=null,X=null,J=null,Te=null,F=null,Ce=null,Ye=null,G=null;const et=()=>{pe=!1},be=v=>{const{left:P,top:l}=t.getBoundingClientRect();return[v.clientX-P,v.clientY-l]};window.addEventListener("mouseup",et);const tt=()=>{g.style.opacity=.5,g.style.transform="translate(-50%,-50%) scale(0) rotate(0deg)"},ge=(v,P)=>{const l=getComputedStyle(v),$=+l.opacity,H=l.transform.match(/([0-9.-]+)+/g),Z=+H[0],Q=+H[1],N=Math.sqrt(Z*Z+Q*Q);let _=Math.atan2(Q,Z)*(180/Math.PI);return _=P&&_<=0?360+_:_,{opacity:$,scale:N,rotate:_}},M=v=>{if(!E||pe)return;const P=v.clientX,l=v.clientY;g.style.top=`${l}px`,g.style.left=`${P}px`;const $=ge(g),H=$.opacity,Z=$.scale,Q=$.rotate;g.style.opacity=H,g.style.transform=`translate(-50%,-50%) scale(${Z}) rotate(${Q}deg)`,g.style.animation="none",ft().then(()=>{Hn!==null&&Ee(Hn),Hn=ye(kc(H,Z,Q)),g.style.animation=Uc,ft().then(()=>{tt()})})},ve=()=>{const{opacity:v,scale:P,rotate:l}=ge(g);g.style.opacity=v,g.style.transform=`translate(-50%,-50%) scale(${P}) rotate(${l}deg)`,g.style.animation="none",ft(2).then(()=>{Wn!==null&&Ee(Wn),Wn=ye(Hc(v,P,l)),g.style.animation=Vc,ft().then(()=>{tt()})})},nt=(v,P,{time:l=Yt,extraTime:$=Gt,delay:H=Zt}={time:Yt,extraTime:Gt,delay:Zt})=>{V=!0;const Z=getComputedStyle(p);p.style.color=Z.color,p.style.top=`${P}px`,p.style.left=`${v}px`,p.style.animation="none";const Q=getComputedStyle(q);q.style.clipPath=Q.clipPath,q.style.opacity=Q.opacity,q.style.animation="none";const N=ge(se);se.style.opacity=N.opacity,se.style.transform=`scale(${N.scale})`,se.style.animation="none";const _=ge(ue);ue.style.transform=`rotate(${_.rotate}deg)`,ue.style.animation="none";const _e=ge(ne);ne.style.transform=`rotate(${_e.rotate}deg)`,ne.style.animation="none",ft().then(()=>{if(!V)return;J!==null&&Ee(J),X!==null&&Ee(X),z!==null&&Ee(z),De!==null&&Ee(De),Y!==null&&Ee(Y);const{rules:Le,names:fe}=Lc({time:l,extraTime:$,delay:H,currentColor:Z.color||"currentcolor",targetColor:p.dataset.activeColor,effectOpacity:N.opacity||0,effectScale:N.scale||0,circleLeftRotation:_.rotate||0,circleRightRotation:_e.rotate||0,circleClipPath:Q.clipPath||"inset(0 0 0 50%)",circleOpacity:Q.opacity||0});Y=ye(Le.main),De=ye(Le.effect),z=ye(Le.circleLeft),X=ye(Le.circleRight),J=ye(Le.circle),p.style.animation=fe.main,se.style.animation=fe.effect,ue.style.animation=fe.circleLeft,ne.style.animation=fe.circleRight,q.style.animation=fe.circle})},Ne=({time:v=jt}={time:jt})=>{if(!V)return;V=!1;const P=getComputedStyle(p);p.style.color=P.color,p.style.animation="none";const l=getComputedStyle(q);q.style.clipPath=l.clipPath,q.style.opacity=l.opacity,q.style.animation="none";const $=ge(se);se.style.opacity=$.opacity,se.style.transform=`scale(${$.scale})`,se.style.animation="none";const H=l.clipPath.slice(-2,-1)==="x",Z=ge(ue,H);ue.style.transform=`rotate(${Z.rotate}deg)`,ue.style.animation="none";const Q=ge(ne);ne.style.transform=`rotate(${Q.rotate}deg)`,ne.style.animation="none",ft().then(()=>{G!==null&&Ee(G),Ye!==null&&Ee(Ye),Ce!==null&&Ee(Ce),F!==null&&Ee(F),Te!==null&&Ee(Te);const{rules:N,names:_}=zc({time:v,currentColor:P.color||"currentcolor",targetColor:p.dataset.color,effectOpacity:$.opacity||0,effectScale:$.scale||0,circleLeftRotation:Z.rotate||0,circleRightRotation:Q.rotate||0,circleClipPath:l.clipPath||"inset(0px)",circleOpacity:l.opacity||1});Te=ye(N.main),F=ye(N.effect),Ce=ye(N.circleLeft),Ye=ye(N.circleRight),G=ye(N.circle),p.style.animation=_.main,se.style.animation=_.effect,ue.style.animation=_.circleLeft,ne.style.animation=_.circleRight,q.style.animation=_.circle})},U=()=>{T(ae,re)},ce=v=>{if(b){if(ka(v[0],v[1],b[0],b[1])>qo){b=v;const l=S(v);ae.push(l),re.push(l[0],l[1]),ae.length>1&&U()}}else{Re||(Re=!0,I()),b=v;const P=S(v);ae=[P],re=[P[0],P[1]]}},ot=Jo(ce,kn,kn),ht=(v,P)=>{const l=be(v);return P?ot(l):ce(l)},Ge=()=>{ae=[],re=[],b=void 0,U()},Se=v=>{M(v)},de=()=>{pe=!0,Re=!0,Ge(),I()},he=()=>{ve()},Ie=({merge:v=!1}={})=>{Re=!1;const P=[...ae],l=[...re];return ot.cancel(),Ge(),P.length&&O(P,l,{merge:v}),P},Ae=({onDraw:v=null,onStart:P=null,onEnd:l=null,enableInitiator:$=null,initiatorParentElement:H=null,longPressIndicatorParentElement:Z=null,minDelay:Q=null,minDist:N=null,pointNorm:_=null}={})=>{T=_t(v,T),I=_t(P,I),O=_t(l,O),E=_t($,E),S=_t(_,S),H!==null&&H!==C&&(C.removeChild(g),H.appendChild(g),C=H),Z!==null&&Z!==m&&(m.removeChild(p),Z.appendChild(p),m=Z),E?(g.addEventListener("click",Se),g.addEventListener("mousedown",de),g.addEventListener("mouseleave",he)):(g.removeEventListener("mousedown",de),g.removeEventListener("mouseleave",he))},it=()=>{C.removeChild(g),m.removeChild(p),window.removeEventListener("mouseup",et),g.removeEventListener("click",Se),g.removeEventListener("mousedown",de),g.removeEventListener("mouseleave",he)},Lt=()=>v=>Ua(v,{clear:Ge,destroy:it,end:Ie,extend:ht,set:Ae,showInitiator:M,hideInitiator:ve,showLongPressIndicator:nt,hideLongPressIndicator:Ne});return C.appendChild(g),m.appendChild(p),Ae({onDraw:T,onStart:I,onEnd:O,enableInitiator:E,initiatorParentElement:C}),$a(Fo("initiator",g),Fo("longPressIndicator",p),Lt(),za(ci))({})},Wc=`
precision mediump float;

uniform sampler2D texture;

varying vec2 uv;

void main () {
  gl_FragColor = texture2D(texture, uv);
}
`,Yc=`
precision mediump float;

uniform mat4 modelViewProjection;

attribute vec2 position;

varying vec2 uv;

void main () {
  uv = position;
  gl_Position = modelViewProjection * vec4(-1.0 + 2.0 * uv.x, 1.0 - 2.0 * uv.y, 0, 1);
}
`,Gc=`
precision highp float;

varying vec4 color;
varying float finalPointSize;

float linearstep(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float sdf = length(c) * finalPointSize;
  float alpha = linearstep(finalPointSize + 0.5, finalPointSize - 0.5, sdf);

  gl_FragColor = vec4(color.rgb, alpha * color.a);
}
`,Zc=`precision highp float;

varying vec4 color;

void main() {
  gl_FragColor = color;
}
`,jc=t=>`
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
uniform float colorMultiplicator;
uniform float opacityMultiplicator;
uniform float opacityDensity;
uniform float sizeMultiplicator;
uniform float numColorStates;
uniform float pointScale;
uniform mat4 modelViewProjection;

attribute vec2 stateIndex;

varying vec4 color;
varying float finalPointSize;

void main() {
  vec4 state = texture2D(stateTex, stateIndex);

  gl_Position = modelViewProjection * vec4(state.x, state.y, 0.0, 1.0);

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
  ${(()=>t===3?"":`
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
      `)()}

  color.a = min(pointOpacityMax, color.a) * pointOpacityScale;
  finalPointSize = (pointSize * pointScale) + pointSizeExtra;
  gl_PointSize = finalPointSize;
}
`,Kc=`precision highp float;

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
}`,qc=`precision highp float;

attribute vec2 position;
varying vec2 particleTextureIndex;

void main() {
  // map normalized device coords to texture coords
  particleTextureIndex = 0.5 * (1.0 + position);

  gl_Position = vec4(position, 0, 1);
}`,Xc=function(){const n=(h,E,C,m,T)=>{const I=(m-E)*.5,O=(T-C)*.5;return(2*C-2*m+I+O)*h*h*h+(-3*C+3*m-2*I-O)*h*h+I*h+C},s=(h,E,C)=>{const m=C*h,T=Math.floor(m),I=m-T,O=E[Math.max(0,T-1)],S=E[T],g=E[Math.min(C,T+1)],te=E[Math.min(C,T+2)];return[n(I,O[0],S[0],g[0],te[0]),n(I,O[1],S[1],g[1],te[1])]},u=(h,E,C,m)=>(h-C)**2+(E-m)**2;/**
 * Douglas Peucker square segment distance
 * Implementation from https://github.com/mourner/simplify-js
 * @author Vladimir Agafonkin
 * @copyright Vladimir Agafonkin 2013
 * @license BSD
 * @param {array} p - Point
 * @param {array} p1 - First boundary point
 * @param {array} p2 - Second boundary point
 * @return {number} Distance
 */const d=(h,E,C)=>{let m=E[0],T=E[1],I=C[0]-m,O=C[1]-T;if(I!==0||O!==0){const S=((h[0]-m)*I+(h[1]-T)*O)/(I*I+O*O);S>1?(m=C[0],T=C[1]):S>0&&(m+=I*S,T+=O*S)}return I=h[0]-m,O=h[1]-T,I*I+O*O};/**
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
 */const r=(h,E,C,m,T)=>{let I=m,O;for(let S=E+1;S<C;S++){const g=d(h[S],h[E],h[C]);g>I&&(O=S,I=g)}I>m&&(O-E>1&&r(h,E,O,m,T),T.push(h[O]),C-O>1&&r(h,O,C,m,T))};/**
 * Douglas Peucker. Implementation from https://github.com/mourner/simplify-js
 * @author Vladimir Agafonkin
 * @copyright Vladimir Agafonkin 2013
 * @license BSD
 * @param {array} points - List of points to be simplified
 * @param {number} tolerance - Tolerance level. Points below this distance level will be ignored
 * @return {array} Simplified point list
 */const L=(h,E)=>{const C=h.length-1,m=[h[0]];return r(h,0,C,E,m),m.push(h[C]),m},B=(h,{maxIntPointsPerSegment:E=100,tolerance:C=.002}={})=>{const m=h.length,T=m-1,I=T*E+1,O=C**2;let S=[],g;for(let te=0;te<m-1;te++){let p=[h[te].slice(0,2)];g=h[te];for(let q=1;q<E;q++){const ue=(te*E+q)/I,ne=s(ue,h,T);u(g[0],g[1],ne[0],ne[1])>O&&(p.push(ne),g=ne)}p.push(h[te+1]),p=L(p,O),S=S.concat(p.slice(0,p.length-1))}return S.push(h[h.length-1].slice(0,2)),S.flat()},x=h=>{const E={},C=!Number.isNaN(+h[0][5]);return h.forEach(m=>{const T=m[4];E[T]||(E[T]=[]),C?E[T][m[5]]=m:E[T].push(m)}),Object.entries(E).forEach(m=>{E[m[0]]=m[1].filter(T=>T),E[m[0]].reference=m[1][0]}),E};self.onmessage=function(E){(E.data.points?+E.data.points.length:0)||self.postMessage({error:new Error("No points provided")}),E.data.points;const m=x(E.data.points);self.postMessage({points:Object.entries(m).reduce((T,I)=>(T[I[0]]=B(I[1],E.data.options),T[I[0]].reference=I[1].reference,T),{})})}},Jc=(t,n={tolerance:.002,maxIntPointsPerSegment:100})=>new Promise((s,u)=>{const d=Va(Xc);d.onmessage=r=>{r.data.error?u(r.data.error):s(r.data.points),d.terminate()},d.postMessage({points:t,options:n})}),Qc="1.5.1",Yn={showRecticle:"showReticle",recticleColor:"reticleColor"},Gn=t=>{Object.keys(t).filter(n=>Yn[n]).forEach(n=>{console.warn(`regl-scatterplot: the "${n}" property is deprecated. Please use "${Yn[n]}" instead.`),t[Yn[n]]=t[n],delete t[n]})},xe=(t,n,{allowSegment:s=!1,allowDensity:u=!1}={})=>ii.has(t)?"valueZ":si.has(t)?"valueW":t==="segment"?s?"segment":n:t==="density"&&u?"density":n,Zn=t=>{switch(t){case"valueZ":return 2;case"valueW":return 3;default:return null}},rl=(t={})=>{const n=Ha({async:!t.syncEvents,caseInsensitive:!0}),s=new Float32Array(16),u=new Float32Array(16),d=[0,0];Gn(t);let{renderer:r,backgroundColor:L=Dr,backgroundImage:B=kr,canvas:x=document.createElement("canvas"),colorBy:h=vt,deselectOnDblClick:E=Wr,deselectOnEscape:C=Yr,lassoColor:m=or,lassoLineWidth:T=ir,lassoMinDelay:I=ar,lassoMinDist:O=rr,lassoClearEvent:S=cr,lassoInitiator:g=sr,lassoInitiatorParentElement:te=document.body,lassoOnLongPress:p=lr,lassoLongPressTime:q=Yt,lassoLongPressAfterEffectTime:ue=Gt,lassoLongPressEffectDelay:ne=Zt,lassoLongPressRevertEffectTime:se=jt,keyMap:pe=fr,mouseMode:Re=er,showReticle:ae=Vr,reticleColor:re=Hr,pointColor:b=Pr,pointColorActive:V=pr,pointColorHover:Y=Rr,showPointConnections:De=Gr,pointConnectionColor:z=br,pointConnectionColorActive:X=Mr,pointConnectionColorHover:J=Nr,pointConnectionColorBy:Te=Un,pointConnectionOpacity:F=Ir,pointConnectionOpacityBy:Ce=$n,pointConnectionOpacityActive:Ye=Ar,pointConnectionSize:G=Cr,pointConnectionSizeActive:et=Sr,pointConnectionSizeBy:be=Fn,pointConnectionMaxIntPointsPerSegment:tt=Zr,pointConnectionTolerance:ge=jr,pointSize:M=Er,pointSizeSelected:ve=xr,pointSizeMouseDetection:nt=Kr,pointOutlineWidth:Ne=Tr,opacity:U=Pe,opacityBy:ce=zn,opacityByDensityFill:ot=wr,opacityInactiveMax:ht=_r,opacityInactiveScale:Ge=Lr,sizeBy:Se=Bn,height:de=hr,width:he=gr}=t,Ie=he===Pe?1:he,Ae=de===Pe?1:de;const{performanceMode:it=qr,opacityByDensityDebounceTime:Lt=vr}=t;r||(r=fc({regl:t.regl,gamma:t.gamma})),L=le(L,!0),m=le(m,!0),re=le(re,!0);let v=!1,P=Ko(L),l,$,H=!1,Z=null,Q=[0,0],N=-1,_=[];const _e=new Set,Le=new Set;let fe=0,Jt=0,Be=!1,Ze=[],me,st,Qt=mr,oo,at,yt,Me,Oe,en,Et,xt,Pt,pt=jo(pe),rt,Tt,Ct,tn=!1,W=!0,ct=!1,Rt;b=We(b)?[...b]:[b],V=We(V)?[...V]:[V],Y=We(Y)?[...Y]:[Y],b=b.map(e=>le(e,!0)),V=V.map(e=>le(e,!0)),Y=Y.map(e=>le(e,!0)),U=!Array.isArray(U)&&Number.isNaN(+U)?b[0][3]:U,U=Ve(U,He,{minLength:1})?[...U]:[U],M=Ve(M,He,{minLength:1})?[...M]:[M];let io=Nn/M[0];z==="inherit"?z=[...b]:(z=We(z)?[...z]:[z],z=z.map(e=>le(e,!0))),X==="inherit"?X=[...V]:(X=We(X)?[...X]:[X],X=X.map(e=>le(e,!0))),J==="inherit"?J=[...Y]:(J=We(J)?[...J]:[J],J=J.map(e=>le(e,!0))),F==="inherit"?F=[...U]:F=Ve(F,He,{minLength:1})?[...F]:[F],G==="inherit"?G=[...M]:G=Ve(G,He,{minLength:1})?[...G]:[G],h=xe(h,vt),ce=xe(ce,zn,{allowDensity:!0}),Se=xe(Se,Bn),Te=xe(Te,Un,{allowSegment:!0}),Ce=xe(Ce,$n,{allowSegment:!0}),be=xe(be,Fn,{allowSegment:!0});let Fe,$e,ze,so,we=0,nn=0,on,sn,St,Dt,bt,Mt,Nt,je=!1,It=null,an,rn,ao=ae,lt,ut=0,Bt,dt=0,cn=!1,Ue=!1,Ke=0,qe=0,oe,At=!1,ie=t.xScale||null,K=t.yScale||null,Ft=0,$t=0,zt=0,Ut=0;ie&&(Ft=ie.domain()[0],$t=ie.domain()[1]-ie.domain()[0],ie.range([0,Ie])),K&&(zt=K.domain()[0],Ut=K.domain()[1]-K.domain()[0],K.range([Ae,0]));const ro=e=>-1+e/Ie*2,co=e=>1+e/Ae*-2,li=()=>[ro(d[0]),co(d[1])],ke=(e,o)=>{const i=[e,o,1,1],a=Ya(s,mt(s,oo,mt(s,l.view,yt)));return $o(i,i,a),i.slice(0,2)},lo=()=>{const e=_n(),i=(Tt[1]-Ct[1])/Ae;return Pt*e*i*.66},uo=()=>{const[e,o]=li(),[i,a]=ke(e,o),c=lo(),f=me.range(i-c,a-c,i+c,a+c);let y=c,A;return f.forEach(k=>{const[R,j]=me.points[k],D=Wo(R,j,i,a);D<y&&(y=D,A=k)}),y<Pt/Ie*2?A:-1},ui=(e,o)=>{Ze=e,$.setPoints(o),n.publish("lassoExtend",{coordinates:e})},di=e=>{const o=tc(e),i=me.range(...o),a=[];return i.forEach(c=>{rc(e,me.points[c])&&a.push(c)}),a},kt=()=>{Ze=[],$&&$.clear()},ln=e=>e&&e.length>4,Xe=(e,o)=>{if(en||!De||!ln(me.points[e[0]]))return;const i=o===0,a=o===1?y=>Le.add(y):gt,c=Object.keys(e.reduce((y,A)=>{const k=me.points[A],j=Array.isArray(k[4])?k[4][0]:k[4];return y[j]=!0,y},{})),f=Me.getData().opacities;c.filter(y=>!Le.has(+y)).forEach(y=>{const A=Oe[y][0],k=Oe[y][2],R=Oe[y][3],j=A*4+R*2,D=j+k*2+4;f.__original__===void 0&&(f.__original__=f.slice());for(let w=j;w<D;w++)f[w]=i?f.__original__[w]:Ye;a(y)}),Me.getBuffer().opacities.subdata(f,0)},un=e=>[e%we/we+nn,Math.floor(e/we)/we+nn],dn=({preventEvent:e=!1}={})=>{S===jn&&kt(),_.length&&(e||n.publish("deselect"),Le.clear(),Xe(_,0),_=[],_e.clear(),W=!0)},fn=(e,{merge:o=!1,preventEvent:i=!1}={})=>{const a=Array.isArray(e)?e:[e];o?_=Wa(_,a):(_&&_.length&&Xe(_,0),_=a);const c=[];_e.clear(),Le.clear();for(let f=_.length-1;f>=0;f--){const y=_[f];if(y<0||y>=fe)_.splice(f,1);else{_e.add(y);const A=un(y);c.push(A[0]),c.push(A[1])}}sn({usage:"dynamic",type:"float",data:c}),Xe(_,1),i||n.publish("select",{points:_}),W=!0},mn=e=>{const o=x.getBoundingClientRect();return d[0]=e.clientX-o.left,d[1]=e.clientY-o.top,[...d]},ee=ci(x,{onStart:()=>{l.config({isFixed:!0}),H=!0,Be=!0,kt(),N>=0&&(clearTimeout(N),N=-1),n.publish("lassoStart")},onDraw:ui,onEnd:(e,o,{merge:i=!1}={})=>{l.config({isFixed:!1}),Ze=[...e];const a=di(o);fn(a,{merge:i}),n.publish("lassoEnd",{coordinates:Ze}),S===Xn&&kt()},enableInitiator:g,initiatorParentElement:te,pointNorm:([e,o])=>ke(ro(e),co(o))}),fi=()=>Re===ei,gn=(e,o)=>{switch(pt[o]){case Qn:return e.altKey;case eo:return e.metaKey;case ni:return e.ctrlKey;case oi:return e.metaKey;case to:return e.shiftKey;default:return!1}},fo=e=>{!Ue||e.buttons!==1||(H=!0,Z=performance.now(),Q=mn(e),Be=fi()||gn(e,Jn),!Be&&p&&(ee.showLongPressIndicator(e.clientX,e.clientY,{time:q,extraTime:ue,delay:ne}),N=setTimeout(()=>{N=-1,Be=!0},q)))},hn=e=>{!Ue||(H=!1,N>=0&&(clearTimeout(N),N=-1),Be&&(e.preventDefault(),Be=!1,ee.end({merge:gn(e,qt)})),p&&ee.hideLongPressIndicator({time:se}))},mo=e=>{if(!Ue)return;e.preventDefault();const o=mn(e);if(Wo(...o,...Q)>=O)return;const i=performance.now()-Z;if(!g||i<Jr){const a=uo();a>=0?(_.length&&S===jn&&kt(),fn([a],{merge:gn(e,qt)})):rt||(rt=setTimeout(()=>{rt=null,ee.showInitiator(e)},Xr))}},go=e=>{ee.hideInitiator(),rt&&(clearTimeout(rt),rt=null),E&&(e.preventDefault(),dn())},ho=e=>{!Ue||!At&&!H||(mn(e),At&&!Be&&Dn(uo()),Be?(e.preventDefault(),ee.extend(e,!0)):p&&ee.hideLongPressIndicator({time:se}),N>=0&&(clearTimeout(N),N=-1),H&&(W=!0))},yo=()=>{!Ue||(+oe>=0&&!_e.has(oe)&&Xe([oe],0),oe=void 0,At=!1,hn(),W=!0)},yn=()=>{const e=Math.max(M.length,U.length);dt=Math.max(2,Math.ceil(Math.sqrt(e)));const o=new Float32Array(dt**2*4);for(let i=0;i<e;i++){o[i*4]=M[i]||0,o[i*4+1]=Math.min(1,U[i]||0);const a=Number((V[i]||V[0])[3]);o[i*4+2]=Math.min(1,Number.isNaN(a)?1:a);const c=Number((Y[i]||Y[0])[3]);o[i*4+3]=Math.min(1,Number.isNaN(c)?1:c)}return r.regl.texture({data:o,shape:[dt,dt,4],type:"float"})},Eo=(e=b,o=V,i=Y)=>{const a=e.length,c=o.length,f=i.length,y=[];if(a===c&&c===f)for(let A=0;A<a;A++)y.push(e[A],o[A],i[A],L);else for(let A=0;A<a;A++){const k=[e[A][0],e[A][1],e[A][2],1],R=h===vt?o[0]:k,j=h===vt?i[0]:k;y.push(e[A],R,j,L)}return y},En=()=>{const e=Eo(),o=e.length;ut=Math.max(2,Math.ceil(Math.sqrt(o)));const i=new Float32Array(ut**2*4);return e.forEach((a,c)=>{i[c*4]=a[0],i[c*4+1]=a[1],i[c*4+2]=a[2],i[c*4+3]=a[3]}),r.regl.texture({data:i,shape:[ut,ut,4],type:"float"})},mi=(e,o)=>{at[0]=e/st,at[5]=o},xn=()=>{st=Ie/Ae,oo=bn([],[1/st,1,1]),at=bn([],[1/st,1,1]),yt=bn([],[Qt,1,1])},gi=e=>{+e<=0||(Qt=e)},Tn=(e,o)=>i=>{if(!i||!i.length)return;const c=[...e()];let f=We(i)?i:[i];f=f.map(y=>le(y,!0)),lt&&lt.destroy();try{o(f),lt=En()}catch{console.error("Invalid colors. Switching back to default colors."),o(c),lt=En()}},hi=Tn(()=>b,e=>{b=e}),yi=Tn(()=>V,e=>{V=e}),Ei=Tn(()=>Y,e=>{Y=e}),xi=()=>{const e=ke(-1,-1),o=ke(1,1),i=(e[0]+1)/2,a=(o[0]+1)/2,c=(e[1]+1)/2,f=(o[1]+1)/2,y=[Ft+i*$t,Ft+a*$t],A=[zt+c*Ut,zt+f*Ut];return[y,A]},Je=()=>{if(!ie&&!K)return;const[e,o]=xi();ie&&ie.domain(e),K&&K.domain(o)},Cn=e=>{Ae=Math.max(1,e),x.height=Math.floor(Ae*window.devicePixelRatio),K&&(K.range([Ae,0]),Je())},Ti=e=>{if(e===Pe){de=e,x.style.height="100%",window.requestAnimationFrame(()=>{x&&Cn(x.getBoundingClientRect().height)});return}!+e||+e<=0||(de=+e,Cn(de),x.style.height=`${de}px`)},Sn=()=>{Pt=nt,nt===Pe&&(Pt=Array.isArray(M)?M[Math.floor(M.length/2)]:M)},Ci=e=>{Ve(e,He,{minLength:1})&&(M=[...e]),Ht(+e)&&(M=[+e]),io=Nn/M[0],Bt=yn(),Sn()},Si=e=>{!+e||+e<0||(ve=+e)},Ii=e=>{!+e||+e<0||(Ne=+e)},In=e=>{Ie=Math.max(1,e),x.width=Math.floor(Ie*window.devicePixelRatio),ie&&(ie.range([0,Ie]),Je())},Ai=e=>{if(e===Pe){he=e,x.style.width="100%",window.requestAnimationFrame(()=>{x&&In(x.getBoundingClientRect().width)});return}!+e||+e<=0||(he=+e,In(he),x.style.width=`${Ie}px`)},Oi=e=>{Ve(e,He,{minLength:1})&&(U=[...e]),Ht(+e)&&(U=[+e]),Bt=yn()},An=e=>{switch(e){case"valueZ":return Ke>1?"categorical":"continuous";case"valueW":return qe>1?"categorical":"continuous";default:return null}},On=(e,o)=>{switch(e){case"continuous":return i=>Math.round(i*(o.length-1));case"categorical":default:return gt}},wi=e=>{h=xe(e,vt)},vi=e=>{ce=xe(e,zn,{allowDensity:!0})},_i=e=>{Se=xe(e,Bn)},Li=e=>{Te=xe(e,Un,{allowSegment:!0})},Pi=e=>{Ce=xe(e,$n,{allowSegment:!0})},pi=e=>{be=xe(e,Fn,{allowSegment:!0})},Ri=()=>[x.width,x.height],Di=()=>B,bi=()=>lt,Mi=()=>ut,Ni=()=>.5/ut,Bi=()=>window.devicePixelRatio,Fi=()=>on,wn=()=>sn,$i=()=>Bt,zi=()=>dt,Ui=()=>.5/dt,xo=()=>0,ki=()=>ze||Fe,Vi=()=>we,Hi=()=>.5/we,To=()=>at,Co=()=>l.view,So=()=>yt,vn=()=>mt(u,at,mt(u,l.view,yt)),_n=()=>l.scaling[0]>1?Math.asinh(Wt(1,l.scaling[0]))/Math.asinh(1)*window.devicePixelRatio:Wt(io,l.scaling[0])*window.devicePixelRatio,Wi=()=>fe,Ot=()=>_.length,Yi=()=>Ot()>0?ht:1,Gi=()=>Ot()>0?Ge:1,Zi=()=>+(h==="valueZ"),ji=()=>+(h==="valueW"),Ki=()=>+(ce==="valueZ"),qi=()=>+(ce==="valueW"),Xi=()=>+(ce==="density"),Ji=()=>+(Se==="valueZ"),Qi=()=>+(Se==="valueW"),es=()=>h==="valueZ"?Ke<=1?b.length-1:1:qe<=1?b.length-1:1,ts=()=>ce==="valueZ"?Ke<=1?U.length-1:1:qe<=1?U.length-1:1,ns=()=>Se==="valueZ"?Ke<=1?M.length-1:1:qe<=1?M.length-1:1,os=e=>{if(ce!=="density")return 1;const o=_n(),i=M[0]*o,a=2/(2/l.view[0])*(2/(2/l.view[5])),c=e.viewportHeight,f=e.viewportWidth;let y=ot*f*c/(Jt*i*i)*Zo(1,a);y*=it?1:1/(.25*Math.PI);const A=Wt(Nn,i)+.5;return y*=(i/A)**2,Zo(1,Wt(0,y))},is=r.regl({framebuffer:()=>so,vert:qc,frag:Kc,attributes:{position:[-4,0,4,4,4,-4]},uniforms:{startStateTex:()=>$e,endStateTex:()=>Fe,t:(e,o)=>o.t},count:3}),Qe=(e,o,i,a=Ka,c=Yi,f=Gi)=>r.regl({frag:it?Zc:Gc,vert:jc(a),blend:{enable:!it,func:{srcRGB:"src alpha",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}},depth:{enable:!1},attributes:{stateIndex:{buffer:i,size:2}},uniforms:{resolution:Ri,modelViewProjection:vn,devicePixelRatio:Bi,pointScale:_n,encodingTex:$i,encodingTexRes:zi,encodingTexEps:Ui,pointOpacityMax:c,pointOpacityScale:f,pointSizeExtra:e,globalState:a,colorTex:bi,colorTexRes:Mi,colorTexEps:Ni,stateTex:ki,stateTexRes:Vi,stateTexEps:Hi,isColoredByZ:Zi,isColoredByW:ji,isOpacityByZ:Ki,isOpacityByW:qi,isOpacityByDensity:Xi,isSizedByZ:Ji,isSizedByW:Qi,colorMultiplicator:es,opacityMultiplicator:ts,opacityDensity:os,sizeMultiplicator:ns,numColorStates:Xa},count:o,primitive:"points"}),ss=Qe(xo,Wi,Fi),as=Qe(xo,()=>1,()=>St,qa,()=>1,()=>1),rs=Qe(()=>(ve+Ne*2)*window.devicePixelRatio,Ot,wn,Mn,()=>1,()=>1),cs=Qe(()=>(ve+Ne)*window.devicePixelRatio,Ot,wn,ko,()=>1,()=>1),ls=Qe(()=>ve*window.devicePixelRatio,Ot,wn,Mn,()=>1,()=>1),us=()=>{rs(),cs(),ls()},ds=r.regl({frag:Wc,vert:Yc,attributes:{position:[0,1,0,0,1,0,0,1,1,1,1,0]},uniforms:{modelViewProjection:vn,texture:Di},count:6}),fs=r.regl({vert:`
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
      }`,depth:{enable:!1},blend:{enable:!0,func:{srcRGB:"src alpha",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}},attributes:{position:()=>Ze},uniforms:{modelViewProjection:vn,color:()=>m},elements:()=>Array.from({length:Ze.length-2},(e,o)=>[0,o+1,o+2])}),ms=()=>{if(!(oe>=0))return;const[e,o]=me.points[oe].slice(0,2),i=[e,o,0,1];mt(s,at,mt(s,l.view,yt)),$o(i,i,s),Et.setPoints([-1,i[1],1,i[1]]),xt.setPoints([i[0],1,i[0],-1]),Et.draw(),xt.draw(),Qe(()=>(ve+Ne*2)*window.devicePixelRatio,()=>1,St,Mn)(),Qe(()=>(ve+Ne)*window.devicePixelRatio,()=>1,St,ko)()},gs=e=>{const o=new Float32Array(e*2);let i=0;for(let a=0;a<e;++a){const c=un(a);o[i]=c[0],o[i+1]=c[1],i+=2}return o},Io=e=>{const o=e.length;we=Math.max(2,Math.ceil(Math.sqrt(o))),nn=.5/we;const i=new Float32Array(we**2*4);Ke=0,qe=0;for(let a=0;a<o;++a)i[a*4]=e[a][0],i[a*4+1]=e[a][1],i[a*4+2]=e[a][2]||0,i[a*4+3]=e[a][3]||0,Ke=Math.max(Ke,i[a*4+2]),qe=Math.max(qe,i[a*4+3]);return r.regl.texture({data:i,shape:[we,we,4],type:"float"})},hs=e=>{if(!Fe)return!1;if(je){const o=$e;$e=ze,o.destroy()}else $e=Fe;return ze=Io(e),so=r.regl.framebuffer({color:ze,depth:!1,stencil:!1}),Fe=void 0,!0},ys=()=>Boolean($e&&ze),Es=()=>{$e&&($e.destroy(),$e=void 0),ze&&(ze.destroy(),ze=void 0)},Ao=e=>{Ue=!1,fe=e.length,Jt=fe,Fe&&Fe.destroy(),Fe=Io(e),on({usage:"static",type:"float",data:gs(fe)}),me=new Ga(e,o=>o[0],o=>o[1],16),Ue=!0},Oo=(e,o)=>{Dt=l.target,bt=e,Mt=l.distance[0],Nt=o},xs=()=>Boolean(Dt!==void 0&&bt!==void 0&&Mt!==void 0&&Nt!==void 0),Ts=()=>{Dt=void 0,bt=void 0,Mt=void 0,Nt=void 0},Cs=e=>{const o=Te==="inherit"?h:Te;if(o==="segment"){const i=z.length-1;return i<1?[]:e.reduce((a,c,f)=>{let y=0;const A=[];for(let R=2;R<c.length;R+=2){const j=Math.sqrt((c[R-2]-c[R])**2+(c[R-1]-c[R+1])**2);A.push(j),y+=j}a[f]=[0];let k=0;for(let R=0;R<c.length/2-1;R++)k+=A[R],a[f].push(Math.floor(k/y*i)*4);return a},[])}if(o){const i=Zn(o),a=On(An(o),Te==="inherit"?b:z);return Oe.reduce((c,[f,y])=>(c[f]=a(y[i])*4,c),[])}return Array(Oe.length).fill(0)},Ss=()=>{const e=Ce==="inherit"?ce:Ce;if(e==="segment"){const o=F.length-1;return o<1?[]:Oe.reduce((i,[a,c,f])=>(i[a]=Uo(f,y=>F[Math.floor(y/(f-1)*o)]),i),[])}if(e){const o=Zn(e),i=Ce==="inherit"?U:F,a=On(An(e),i);return Oe.reduce((c,[f,y])=>(c[f]=i[a(y[o])],c),[])}},Is=()=>{const e=be==="inherit"?Se:be;if(e==="segment"){const o=G.length-1;return o<1?[]:Oe.reduce((i,[a,c,f])=>(i[a]=Uo(f,y=>G[Math.floor(y/(f-1)*o)]),i),[])}if(e){const o=Zn(e),i=be==="inherit"?M:G,a=On(An(e),i);return Oe.reduce((c,[f,y])=>(c[f]=i[a(y[o])],c),[])}},As=e=>{Oe=[];let o=0;Object.keys(e).forEach((i,a)=>{Oe[i]=[a,e[i].reference,e[i].length/2,o],o+=e[i].length/2})},Ln=e=>new Promise(o=>{Me.setPoints([]),!e||!e.length?o():(en=!0,Jc(e,{maxIntPointsPerSegment:tt,tolerance:ge}).then(i=>{As(i);const a=Object.values(i);Me.setPoints(a,{colorIndices:Cs(a),opacities:Ss(),widths:Is()}),en=!1,o()}))}),wo=()=>me.range(Ct[0],Ct[1],Tt[0],Tt[1]),Os=Jo(()=>{Jt=wo().length},Lt),ws=e=>{const[o,i]=Dt,[a,c]=bt,f=1-e,y=o*f+a*e,A=i*f+c*e,k=Mt*f+Nt*e;l.lookAt([y,A],k)},vs=()=>ys(),_s=()=>xs(),Ls=(e,o)=>{It||(It=performance.now());const i=performance.now()-It,a=dc(o(i/e),0,1);return vs()&&is({t:a}),_s()&&ws(a),i<e},Ps=()=>{je=!1,It=null,an=void 0,rn=void 0,ae=ao,Es(),Ts(),n.publish("transitionEnd")},Pn=({duration:e=500,easing:o=Ho})=>{je&&n.publish("transitionEnd"),je=!0,It=null,an=e,rn=Kn(o)?tr[o]||Ho:o,ao=ae,ae=!1,n.publish("transitionStart")},ps=e=>new Promise((o,i)=>{if(!e||Array.isArray(e))o(e);else{const a=Array.isArray(e.x)||ArrayBuffer.isView(e.x)?e.x.length:0,c=(Array.isArray(e.x)||ArrayBuffer.isView(e.x))&&(D=>e.x[D]),f=(Array.isArray(e.y)||ArrayBuffer.isView(e.y))&&(D=>e.y[D]),y=(Array.isArray(e.line)||ArrayBuffer.isView(e.line))&&(D=>e.line[D]),A=(Array.isArray(e.lineOrder)||ArrayBuffer.isView(e.lineOrder))&&(D=>e.lineOrder[D]),k=Object.keys(e),R=(()=>{const D=k.find(w=>ii.has(w));return D&&(Array.isArray(e[D])||ArrayBuffer.isView(e[D]))&&(w=>e[D][w])})(),j=(()=>{const D=k.find(w=>si.has(w));return D&&(Array.isArray(e[D])||ArrayBuffer.isView(e[D]))&&(w=>e[D][w])})();c&&f&&R&&j&&y&&A?o(e.x.map((D,w)=>[D,f(w),R(w),j(w),y(w),A(w)])):c&&f&&R&&j&&y?o(Array.from({length:a},(D,w)=>[c(w),f(w),R(w),j(w),y(w)])):c&&f&&R&&j?o(Array.from({length:a},(D,w)=>[c(w),f(w),R(w),j(w)])):c&&f&&R?o(Array.from({length:a},(D,w)=>[c(w),f(w),R(w)])):c&&f?o(Array.from({length:a},(D,w)=>[c(w),f(w)])):i(new Error("You need to specify at least x and y"))}}),Rs=(e,o={})=>v?Promise.reject(new Error("The instance was already destroyed")):ps(e).then(i=>new Promise(a=>{if(v){a();return}let c=!1;i&&(o.transition&&(i.length===fe?c=hs(i):console.warn("Cannot transition! The number of points between the previous and current draw call must be identical.")),Ao(i),(De||o.showPointConnectionsOnce&&ln(i[0]))&&Ln(i).then(()=>{n.publish("pointConnectionsDraw"),W=!0,ct=o.showReticleOnce})),o.transition&&c?(n.subscribe("transitionEnd",()=>{W=!0,ct=o.showReticleOnce,a()},1),Pn({duration:o.transitionDuration,easing:o.transitionEasing})):(n.subscribe("draw",a,1),W=!0,ct=o.showReticleOnce)})),vo=e=>(...o)=>{const i=e(...o);return W=!0,i},Ds=e=>{let o=1/0,i=-1/0,a=1/0,c=-1/0;for(let f=0;f<e.length;f++){const[y,A]=me.points[e[f]];o=Math.min(o,y),i=Math.max(i,y),a=Math.min(a,A),c=Math.max(c,A)}return{x:o,y:a,width:i-o,height:c-a}},_o=(e,o={})=>new Promise(i=>{const a=[e.x+e.width/2,e.y+e.height/2],c=2*Math.atan(1/l.view[5]),f=e.height*st>e.width?e.height/2/Math.tan(c/2):e.width/2/Math.tan(c*st/2);o.transition?(l.config({isFixed:!0}),Oo(a,f),n.subscribe("transitionEnd",()=>{i(),l.config({isFixed:!1})},1),Pn({duration:o.transitionDuration,easing:o.transitionEasing})):(l.lookAt(a,f),n.subscribe("draw",i,1),W=!0)}),bs=(e,o={})=>{const i=Ds(e),a=i.x+i.width/2,c=i.y+i.height/2,f=lo(),y=1+(o.padding||0),A=Math.max(i.width,f)*y,k=Math.max(i.height,f)*y,R=a-A/2,j=c-k/2;return _o({x:R,y:j,width:A,height:k},o)},Lo=(e,o,i={})=>new Promise(a=>{i.transition?(l.config({isFixed:!0}),Oo(e,o),n.subscribe("transitionEnd",()=>{a(),l.config({isFixed:!1})},1),Pn({duration:i.transitionDuration,easing:i.transitionEasing})):(l.lookAt(e,o),n.subscribe("draw",a,1),W=!0)}),Ms=(e={})=>Lo([0,0],1,e),pn=()=>{Me.setStyle({color:Eo(z,X,J),opacity:F===null?null:F[0],width:G[0]})},Po=()=>{const e=Math.round(P)>.5?0:255;ee.initiator.style.border=`1px dashed rgba(${e}, ${e}, ${e}, 0.33)`,ee.initiator.style.background=`rgba(${e}, ${e}, ${e}, 0.1)`},po=()=>{const e=Math.round(P)>.5?Math.round(P*255)-85:Math.round(P*255)+85;ee.longPressIndicator.style.color=`rgb(${e}, ${e}, ${e})`,ee.longPressIndicator.dataset.color=`rgb(${e}, ${e}, ${e})`;const o=m.map(i=>Math.round(i*255));ee.longPressIndicator.dataset.activeColor=`rgb(${o[0]}, ${o[1]}, ${o[2]})`},Ns=e=>{!e||(L=le(e,!0),P=Ko(L),Po(),po())},Bs=e=>{e?Kn(e)?Go(r.regl,e).then(o=>{B=o,W=!0,n.publish("backgroundImageReady")}).catch(()=>{console.error(`Count not create texture from ${e}`),B=null}):e._reglType==="texture2d"?B=e:B=null:B=null},Fs=e=>{e>0&&l.lookAt(l.target,e,l.rotation)},$s=e=>{e!==null&&l.lookAt(l.target,l.distance[0],e)},zs=e=>{e&&l.lookAt(e,l.distance[0],l.rotation)},Ro=e=>{e&&l.setView(e)},Us=e=>{if(!e)return;m=le(e,!0),$.setStyle({color:m});const o=m.map(i=>Math.round(i*255));ee.longPressIndicator.dataset.activeColor=`rgb(${o[0]}, ${o[1]}, ${o[2]})`},ks=e=>{Number.isNaN(+e)||+e<1||(T=+e,$.setStyle({width:T}))},Vs=e=>{!+e||(I=+e,ee.set({minDelay:I}))},Hs=e=>{!+e||(O=+e,ee.set({minDist:O}))},Ws=e=>{S=Yo(nr,S)(e)},Ys=e=>{g=Boolean(e),ee.set({enableInitiator:g})},Gs=e=>{te=e,ee.set({startInitiatorParentElement:te})},Zs=e=>{p=Boolean(e)},js=e=>{q=Number(e)},Ks=e=>{ue=Number(e)},qs=e=>{ne=Number(e)},Xs=e=>{se=Number(e)},Js=e=>{pe=Object.entries(e).reduce((o,[i,a])=>(dr.includes(i)&&ur.includes(a)&&(o[i]=a),o),{}),pt=jo(pe),pt[Kt]?l.config({isRotate:!0,mouseDownMoveModKey:pt[Kt]}):l.config({isRotate:!1})},Qs=e=>{Re=Yo(Qa,qn)(e),l.config({defaultMouseDownMoveAction:Re===ti?"rotate":"pan"})},ea=e=>{e!==null&&(ae=e)},ta=e=>{!e||(re=le(e,!0),Et.setStyle({color:re}),xt.setStyle({color:re}))},na=e=>{!e||(ie=e,Ft=e.domain()[0],$t=e?e.domain()[1]-e.domain()[0]:0,ie.range([0,Ie]),Je())},oa=e=>{!e||(K=e,zt=K.domain()[0],Ut=K?K.domain()[1]-K.domain()[0]:0,K.range([Ae,0]),Je())},ia=e=>{E=!!e},sa=e=>{C=!!e},aa=e=>{De=!!e,De?ln(me.points[0])&&Ln(me.points).then(()=>{n.publish("pointConnectionsDraw"),W=!0}):Ln()},Rn=(e,o)=>i=>{if(i==="inherit")e([...o()]);else{const a=We(i)?i:[i];e(a.map(c=>le(c,!0)))}pn()},ra=Rn(e=>{z=e},()=>b),ca=Rn(e=>{X=e},()=>V),la=Rn(e=>{J=e},()=>Y),ua=e=>{Ve(e,He,{minLength:1})&&(F=[...e]),Ht(+e)&&(F=[+e]),z=z.map(o=>(o[3]=Number.isNaN(+F[0])?o[3]:+F[0],o)),pn()},da=e=>{!Number.isNaN(+e)&&+e&&(Ye=+e)},fa=e=>{Ve(e,He,{minLength:1})&&(G=[...e]),Ht(+e)&&(G=[+e]),pn()},ma=e=>{!Number.isNaN(+e)&&+e&&(et=Math.max(0,e))},ga=e=>{tt=Math.max(0,e)},ha=e=>{ge=Math.max(0,e)},ya=e=>{nt=e,Sn()},Ea=e=>{ot=+e},xa=e=>{ht=+e},Ta=e=>{Ge=+e},Ca=e=>{r.gamma=e},Sa=e=>{if(Gn({property:!0}),e==="aspectRatio")return Qt;if(e==="background"||e==="backgroundColor")return L;if(e==="backgroundImage")return B;if(e==="camera")return l;if(e==="cameraTarget")return l.target;if(e==="cameraDistance")return l.distance[0];if(e==="cameraRotation")return l.rotation;if(e==="cameraView")return l.view;if(e==="canvas")return x;if(e==="colorBy")return h;if(e==="sizeBy")return Se;if(e==="deselectOnDblClick")return E;if(e==="deselectOnEscape")return C;if(e==="height")return de;if(e==="lassoColor")return m;if(e==="lassoLineWidth")return T;if(e==="lassoMinDelay")return I;if(e==="lassoMinDist")return O;if(e==="lassoClearEvent")return S;if(e==="lassoInitiator")return g;if(e==="lassoInitiatorElement")return ee.initiator;if(e==="lassoInitiatorParentElement")return te;if(e==="keyMap")return{...pe};if(e==="mouseMode")return Re;if(e==="opacity")return U.length===1?U[0]:U;if(e==="opacityBy")return ce;if(e==="opacityByDensityFill")return ot;if(e==="opacityByDensityDebounceTime")return Lt;if(e==="opacityInactiveMax")return ht;if(e==="opacityInactiveScale")return Ge;if(e==="points")return me.points;if(e==="pointsInView")return wo();if(e==="pointColor")return b.length===1?b[0]:b;if(e==="pointColorActive")return V.length===1?V[0]:V;if(e==="pointColorHover")return Y.length===1?Y[0]:Y;if(e==="pointOutlineWidth")return Ne;if(e==="pointSize")return M.length===1?M[0]:M;if(e==="pointSizeSelected")return ve;if(e==="pointSizeMouseDetection")return nt;if(e==="showPointConnections")return De;if(e==="pointConnectionColor")return z.length===1?z[0]:z;if(e==="pointConnectionColorActive")return X.length===1?X[0]:X;if(e==="pointConnectionColorHover")return J.length===1?J[0]:J;if(e==="pointConnectionColorBy")return Te;if(e==="pointConnectionOpacity")return F.length===1?F[0]:F;if(e==="pointConnectionOpacityBy")return Ce;if(e==="pointConnectionOpacityActive")return Ye;if(e==="pointConnectionSize")return G.length===1?G[0]:G;if(e==="pointConnectionSizeActive")return et;if(e==="pointConnectionSizeBy")return be;if(e==="pointConnectionMaxIntPointsPerSegment")return tt;if(e==="pointConnectionTolerance")return ge;if(e==="reticleColor")return re;if(e==="regl")return r.regl;if(e==="showReticle")return ae;if(e==="version")return Qc;if(e==="width")return he;if(e==="xScale")return ie;if(e==="yScale")return K;if(e==="performanceMode")return it;if(e==="gamma")return r.gamma;if(e==="renderer")return r},Do=(e={})=>(Gn(e),(e.backgroundColor!==void 0||e.background!==void 0)&&Ns(e.backgroundColor||e.background),e.backgroundImage!==void 0&&Bs(e.backgroundImage),e.cameraTarget!==void 0&&zs(e.cameraTarget),e.cameraDistance!==void 0&&Fs(e.cameraDistance),e.cameraRotation!==void 0&&$s(e.cameraRotation),e.cameraView!==void 0&&Ro(e.cameraView),e.colorBy!==void 0&&wi(e.colorBy),e.pointColor!==void 0&&hi(e.pointColor),e.pointColorActive!==void 0&&yi(e.pointColorActive),e.pointColorHover!==void 0&&Ei(e.pointColorHover),e.pointSize!==void 0&&Ci(e.pointSize),e.pointSizeSelected!==void 0&&Si(e.pointSizeSelected),e.pointSizeMouseDetection!==void 0&&ya(e.pointSizeMouseDetection),e.sizeBy!==void 0&&_i(e.sizeBy),e.opacity!==void 0&&Oi(e.opacity),e.showPointConnections!==void 0&&aa(e.showPointConnections),e.pointConnectionColor!==void 0&&ra(e.pointConnectionColor),e.pointConnectionColorActive!==void 0&&ca(e.pointConnectionColorActive),e.pointConnectionColorHover!==void 0&&la(e.pointConnectionColorHover),e.pointConnectionColorBy!==void 0&&Li(e.pointConnectionColorBy),e.pointConnectionOpacityBy!==void 0&&Pi(e.pointConnectionOpacityBy),e.pointConnectionOpacity!==void 0&&ua(e.pointConnectionOpacity),e.pointConnectionOpacityActive!==void 0&&da(e.pointConnectionOpacityActive),e.pointConnectionSize!==void 0&&fa(e.pointConnectionSize),e.pointConnectionSizeActive!==void 0&&ma(e.pointConnectionSizeActive),e.pointConnectionSizeBy!==void 0&&pi(e.pointConnectionSizeBy),e.pointConnectionMaxIntPointsPerSegment!==void 0&&ga(e.pointConnectionMaxIntPointsPerSegment),e.pointConnectionTolerance!==void 0&&ha(e.pointConnectionTolerance),e.opacityBy!==void 0&&vi(e.opacityBy),e.lassoColor!==void 0&&Us(e.lassoColor),e.lassoLineWidth!==void 0&&ks(e.lassoLineWidth),e.lassoMinDelay!==void 0&&Vs(e.lassoMinDelay),e.lassoMinDist!==void 0&&Hs(e.lassoMinDist),e.lassoClearEvent!==void 0&&Ws(e.lassoClearEvent),e.lassoInitiator!==void 0&&Ys(e.lassoInitiator),e.lassoInitiatorParentElement!==void 0&&Gs(e.lassoInitiatorParentElement),e.lassoOnLongPress!==void 0&&Zs(e.lassoOnLongPress),e.lassoLongPressTime!==void 0&&js(e.lassoLongPressTime),e.lassoLongPressAfterEffectTime!==void 0&&Ks(e.lassoLongPressAfterEffectTime),e.lassoLongPressEffectDelay!==void 0&&qs(e.lassoLongPressEffectDelay),e.lassoLongPressRevertEffectTime!==void 0&&Xs(e.lassoLongPressRevertEffectTime),e.keyMap!==void 0&&Js(e.keyMap),e.mouseMode!==void 0&&Qs(e.mouseMode),e.showReticle!==void 0&&ea(e.showReticle),e.reticleColor!==void 0&&ta(e.reticleColor),e.pointOutlineWidth!==void 0&&Ii(e.pointOutlineWidth),e.height!==void 0&&Ti(e.height),e.width!==void 0&&Ai(e.width),e.aspectRatio!==void 0&&gi(e.aspectRatio),e.xScale!==void 0&&na(e.xScale),e.yScale!==void 0&&oa(e.yScale),e.deselectOnDblClick!==void 0&&ia(e.deselectOnDblClick),e.deselectOnEscape!==void 0&&sa(e.deselectOnEscape),e.opacityByDensityFill!==void 0&&Ea(e.opacityByDensityFill),e.opacityInactiveMax!==void 0&&xa(e.opacityInactiveMax),e.opacityInactiveScale!==void 0&&Ta(e.opacityInactiveScale),e.gamma!==void 0&&Ca(e.gamma),new Promise(o=>{window.requestAnimationFrame(()=>{!x||(xn(),l.refresh(),r.refresh(),W=!0,o())})})),Ia=(e,{preventEvent:o=!1}={})=>{Ro(e),W=!0,tn=o},Dn=(e,{showReticleOnce:o=!1,preventEvent:i=!1}={})=>{let a=!1;if(e>=0&&e<fe){a=!0;const c=oe,f=e!==oe;+c>=0&&f&&!_e.has(c)&&Xe([c],0),oe=e,St.subdata(un(e)),_e.has(e)||Xe([e],2),f&&!i&&n.publish("pointover",oe)}else a=+oe>=0,a&&(_e.has(oe)||Xe([oe],0),i||n.publish("pointout",oe)),oe=void 0;a&&(W=!0,ct=o)},bo=()=>{l||(l=Za(x,{isPanInverted:[!1,!0]})),t.cameraView?l.setView(zo(t.cameraView)):t.cameraTarget||t.cameraDistance||t.cameraRotation?l.lookAt([...t.cameraTarget||Br],t.cameraDistance||Fr,t.cameraRotation||$r):l.setView(zo(zr)),Tt=ke(1,1),Ct=ke(-1,-1)},Aa=({preventEvent:e=!1}={})=>{bo(),Je(),!e&&n.publish("view",{view:l.view,camera:l,xScale:ie,yScale:K})},Mo=({key:e})=>{switch(e){case"Escape":C&&dn();break}},No=()=>{At=!0},Bo=()=>{Dn(),At=!1,W=!0},Oa=()=>{W=!0},wa=()=>{Ao([]),Me.clear()},wt=()=>{l.refresh();const e=he===Pe,o=de===Pe;if(e||o){const{width:i,height:a}=x.getBoundingClientRect();e&&In(i),o&&Cn(a),xn(),W=!0}},va=()=>x.getContext("2d").getImageData(0,0,x.width,x.height),_a=()=>{xn(),bo(),Je(),$=Vt(r.regl,{color:m,width:T,is2d:!0}),Me=Vt(r.regl,{color:z,colorHover:J,colorActive:X,opacity:F===null?null:F[0],width:G[0],widthActive:et,is2d:!0}),Et=Vt(r.regl,{color:re,width:1,is2d:!0}),xt=Vt(r.regl,{color:re,width:1,is2d:!0}),Sn(),x.addEventListener("wheel",Oa),on=r.regl.buffer(),sn=r.regl.buffer(),St=r.regl.buffer({usage:"dynamic",type:"float",length:Ja*2}),lt=En(),Bt=yn();const e=Do({backgroundImage:B,width:he,height:de,keyMap:pe});Po(),po(),window.addEventListener("keyup",Mo,!1),window.addEventListener("blur",yo,!1),window.addEventListener("mouseup",hn,!1),window.addEventListener("mousemove",ho,!1),x.addEventListener("mousedown",fo,!1),x.addEventListener("mouseenter",No,!1),x.addEventListener("mouseleave",Bo,!1),x.addEventListener("click",mo,!1),x.addEventListener("dblclick",go,!1),"ResizeObserver"in window?(Rt=new ResizeObserver(wt),Rt.observe(x)):(window.addEventListener("resize",wt),window.addEventListener("orientationchange",wt)),e.then(()=>{n.publish("init")})},La=r.onFrame(()=>{cn=l.tick(),!(!Ue||!(W||je))&&(je&&!Ls(an,rn)&&Ps(),cn&&(Tt=ke(1,1),Ct=ke(-1,-1),ce==="density"&&Os()),r.render(()=>{const e=x.width/r.canvas.width,o=x.height/r.canvas.height;mi(e,o),B&&B._reglType&&ds(),Ze.length>2&&fs(),je||Me.draw({projection:To(),model:So(),view:Co()}),ss(),!H&&(ae||ct)&&ms(),oe>=0&&as(),_.length&&us(),$.draw({projection:To(),model:So(),view:Co()})},x),cn&&(Je(),tn?tn=!1:n.publish("view",{view:l.view,camera:l,xScale:ie,yScale:K})),W=!1,ct=!1,n.publish("draw"))}),Pa=()=>{W=!0},pa=()=>{v=!0,La(),window.removeEventListener("keyup",Mo,!1),window.removeEventListener("blur",yo,!1),window.removeEventListener("mouseup",hn,!1),window.removeEventListener("mousemove",ho,!1),x.removeEventListener("mousedown",fo,!1),x.removeEventListener("mouseenter",No,!1),x.removeEventListener("mouseleave",Bo,!1),x.removeEventListener("click",mo,!1),x.removeEventListener("dblclick",go,!1),Rt?Rt.disconnect():(window.removeEventListener("resize",wt),window.removeEventListener("orientationchange",wt)),x=void 0,l.dispose(),l=void 0,$.destroy(),Me.destroy(),Et.destroy(),xt.destroy(),t.renderer||r.destroy(),n.publish("destroy"),n.clear()};return _a(),{get isSupported(){return r.isSupported},clear:vo(wa),createTextureFromUrl:(e,o=no)=>Go(r.regl,e,o),deselect:dn,destroy:pa,draw:Rs,get:Sa,hover:Dn,redraw:Pa,refresh:r.refresh,reset:vo(Aa),select:fn,set:Do,export:va,subscribe:n.subscribe,unsubscribe:n.unsubscribe,view:Ia,zoomToLocation:Lo,zoomToArea:_o,zoomToPoints:bs,zoomToOrigin:Ms}};function el(t,n="file.txt"){const s=document.createElement("a");s.href=URL.createObjectURL(t),s.download=n,document.body.appendChild(s),s.dispatchEvent(new MouseEvent("click",{bubbles:!0,cancelable:!0,view:window})),document.body.removeChild(s)}function cl(t){const n=new Image;n.onload=()=>{t.get("canvas").toBlob(s=>{el(s,"scatter.png")})},n.src=t.get("canvas").toDataURL()}function tl(){const t=document.querySelector("#modal"),n=document.querySelector("#modal-text");t.style.display="none",n.textContent=""}function nl(t,n,s){const u=document.querySelector("#modal");u.style.display="flex";const d=document.querySelector("#modal-text");d.style.color=n?"#cc79A7":"#bbb",d.textContent=t;const r=document.querySelector("#modal-close");s?(r.style.display="block",r.style.background=n?"#cc79A7":"#bbb",r.addEventListener("click",tl,{once:!0})):r.style.display="none"}function ll(t){t.isSupported||nl("Your browser does not support all necessary WebGL features. The scatter plot might not render properly.",!0,!0)}export{ll as a,nl as b,rl as c,tl as d,fc as e,cl as s};
