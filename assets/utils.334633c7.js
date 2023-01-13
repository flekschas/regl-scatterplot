import{c as pa,b as qo,d as Ra,l as Da,q as ba,e as Ma,f as Na,g as Ba,p as Fa,i as gt,w as $a,h as Bo,t as Xo,j as za,n as ft,k as Ua,m as ka,o as Va,u as Ha,r as mt,s as Vt,v as Wa,x as Fo,y as Dn,K as Ya,z as Ga,A as $o,C as zo}from"./vendor.cfd24b35.js";const Za=function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const d of document.querySelectorAll('link[rel="modulepreload"]'))u(d);new MutationObserver(d=>{for(const r of d)if(r.type==="childList")for(const L of r.addedNodes)L.tagName==="LINK"&&L.rel==="modulepreload"&&u(L)}).observe(document,{childList:!0,subtree:!0});function s(d){const r={};return d.integrity&&(r.integrity=d.integrity),d.referrerpolicy&&(r.referrerPolicy=d.referrerpolicy),d.crossorigin==="use-credentials"?r.credentials="include":d.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function u(d){if(d.ep)return;d.ep=!0;const r=s(d);fetch(d.href,r)}};Za();const _e="auto",ja=0,bn=1,Ka=2,Uo=3,qa=4,Xa=Float32Array.BYTES_PER_ELEMENT,Jo=["OES_texture_float","OES_element_index_uint","WEBGL_color_buffer_float","EXT_float_blend"],ko={color:[0,0,0,0],depth:1},Kn="panZoom",Qo="lasso",ei="rotate",Ja=[Kn,Qo,ei],Qa=Kn,er={cubicIn:pa,cubicInOut:qo,cubicOut:Ra,linear:Da,quadIn:ba,quadInOut:Ma,quadOut:Na},Vo=qo,Gn="deselect",qn="lassoEnd",tr=[Gn,qn],nr=[0,.666666667,1,1],or=2,ir=!1,sr=10,ar=3,rr=qn,cr=!1,Yt=750,Gt=500,Zt=100,jt=250,Xn="lasso",Kt="rotate",qt="merge",lr=[Xn,Kt,qt],Jn="alt",Qn="cmd",ti="ctrl",ni="meta",eo="shift",ur=[Jn,Qn,ti,ni,eo],dr={[Jn]:Kt,[eo]:Xn,[Qn]:qt},fr=1,mr=_e,gr=_e,hr=1,Mn=1,yr=6,Er=2,xr=2,Nn=null,Tr=2,Cr=2,Bn=null,Sr=null,Fn=null,Ir=.66,Ar=1,$n=null,Or=.15,vr=25,wr=1,_r=1,wt=null,Lr=[.66,.66,.66,Ar],Pr=[0,.55,1,1],pr=[1,1,1,1],Rr=[0,0,0,1],zn=null,Dr=[.66,.66,.66,.2],br=[0,.55,1,1],Mr=[1,1,1,1],Nr=[0,0],Br=1,Fr=0,$r=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),zr="IMAGE_LOAD_ERROR",Ur=null,kr=!1,Vr=[1,1,1,.5],Hr=!0,Wr=!0,Yr=!1,Gr=100,Zr=1/500,jr="auto",Kr=!1,qr=200,Xr=500,oi=new Set(["z","valueZ","valueA","value1","category"]),ii=new Set(["w","valueW","valueB","value2","value"]),to=15e3,Jr=(t,n)=>t?Jo.reduce((s,u)=>t.hasExtension(u)?s:(n||console.warn(`WebGL: ${u} extension not supported. Scatterplot might not render properly`),!1),!0):!1,Qr=t=>{const n=t.getContext("webgl",{antialias:!0,preserveDrawingBuffer:!0}),s=[];return Jo.forEach(u=>{n.getExtension(u)?s.push(u):console.warn(`WebGL: ${u} extension not supported. Scatterplot might not render properly`)}),Ba({gl:n,extensions:s})},Ho=(t,n,s,u)=>Math.sqrt((t-s)**2+(n-u)**2),ec=t=>{let n=1/0,s=-1/0,u=1/0,d=-1/0;for(let r=0;r<t.length;r+=2)n=t[r]<n?t[r]:n,s=t[r]>s?t[r]:s,u=t[r+1]<u?t[r+1]:u,d=t[r+1]>d?t[r+1]:d;return[n,u,s,d]},tc=(t,n=!1)=>t.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(s,u,d,r)=>`#${u}${u}${d}${d}${r}${r}`).substring(1).match(/.{2}/g).map(s=>parseInt(s,16)/255**n),ke=(t,n,{minLength:s=0}={})=>Array.isArray(t)&&t.length>=s&&t.every(n),Ve=t=>!Number.isNaN(+t)&&+t>=0,Ht=t=>!Number.isNaN(+t)&&+t>0,Wo=(t,n)=>s=>t.indexOf(s)>=0?s:n,nc=(t,n=!1,s=to)=>new Promise((u,d)=>{const r=new Image;n&&(r.crossOrigin="anonymous"),r.src=t,r.onload=()=>{u(r)};const L=()=>{d(new Error(zr))};r.onerror=L,setTimeout(L,s)}),Yo=(t,n,s=to)=>new Promise((u,d)=>{nc(n,n.indexOf(window.location.origin)!==0&&n.indexOf("base64")===-1,s).then(r=>{u(t.texture(r))}).catch(r=>{d(r)})}),oc=(t,n=!1)=>[...tc(t,n),255**!n],ic=t=>/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(t),sc=t=>t>=0&&t<=1,Xt=t=>Array.isArray(t)&&t.every(sc),ac=(t,[n,s]=[])=>{let u,d,r,L,B=!1;for(let x=0,h=t.length-2;x<t.length;x+=2)u=t[x],d=t[x+1],r=t[h],L=t[h+1],d>s!=L>s&&n<(r-u)*(s-d)/(L-d)+u&&(B=!B),h=x;return B},Zn=t=>typeof t=="string"||t instanceof String,rc=t=>Number.isInteger(t)&&t>=0&&t<=255,si=t=>Array.isArray(t)&&t.every(rc),cc=t=>t.length===3&&(Xt(t)||si(t)),lc=t=>t.length===4&&(Xt(t)||si(t)),He=t=>Array.isArray(t)&&t.length&&(Array.isArray(t[0])||Zn(t[0])),Wt=(t,n)=>t>n?t:n,Go=(t,n)=>t<n?t:n,le=(t,n)=>{if(lc(t)){const s=Xt(t);return n&&s||!n&&!s?t:n&&!s?t.map(u=>u/255):t.map(u=>u*255)}if(cc(t)){const s=255**!n,u=Xt(t);return n&&u||!n&&!u?[...t,s]:n&&!u?[...t.map(d=>d/255),s]:[...t.map(d=>d*255),s]}return ic(t)?oc(t,n):(console.warn("Only HEX, RGB, and RGBA are handled by this function. Returning white instead."),n?[1,1,1,1]:[255,255,255,255])},Zo=t=>Object.entries(t).reduce((n,[s,u])=>(n[u]?n[u]=[...n[u],s]:n[u]=s,n),{}),jo=t=>.21*t[0]+.72*t[1]+.07*t[2],uc=(t,n,s)=>Math.min(s,Math.max(n,t)),dc=(t={})=>{let{regl:n,canvas:s=document.createElement("canvas"),gamma:u=hr}=t;n||(n=Qr(s));const d=Jr(n),r=[s.width,s.height],L=n.framebuffer({width:r[0],height:r[1],colorFormat:"rgba",colorType:"float"}),B=n({vert:`
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
      }`,attributes:{xy:[-4,-4,4,-4,0,4]},uniforms:{src:()=>L,srcRes:()=>r,gamma:()=>u},count:3,depth:{enable:!1},blend:{enable:!0,func:{srcRGB:"one",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}}}),x=S=>{const g=S.getContext("2d");g.clearRect(0,0,S.width,S.height),g.drawImage(s,(s.width-S.width)/2,(s.height-S.height)/2,S.width,S.height,0,0,S.width,S.height)},h=(S,g)=>{n.clear(ko),L.use(()=>{n.clear(ko),S()}),B(),x(g)},E=()=>{n.poll()},C=new Set,m=S=>(C.add(S),()=>{C.delete(S)}),T=n.frame(()=>{const S=C.values();let g=S.next();for(;!g.done;)g.value(),g=S.next()}),I=()=>{s.width=window.innerWidth*window.devicePixelRatio,s.height=window.innerHeight*window.devicePixelRatio,r[0]=s.width,r[1]=s.height,L.resize(...r)};return t.canvas||(window.addEventListener("resize",I),window.addEventListener("orientationchange",I),I()),{get canvas(){return s},get regl(){return n},get gamma(){return u},set gamma(S){u=+S},get isSupported(){return d},render:h,onFrame:m,refresh:E,destroy:()=>{T.cancel(),s=void 0,n=void 0,window.removeEventListener("resize",I),window.removeEventListener("orientationchange",I)}}},fc=!0,Un=8,Ko=2,mc=2500,gc=250,hc=()=>{const t=document.createElement("div"),n=Math.random().toString(36).substring(2,5)+Math.random().toString(36).substring(2,5);t.id=`lasso-long-press-${n}`,t.style.position="fixed",t.style.width="1.5rem",t.style.height="1.5rem",t.style.pointerEvents="none",t.style.transform="translate(-50%,-50%)";const s=document.createElement("div");s.style.position="absolute",s.style.top=0,s.style.left=0,s.style.width="1.5rem",s.style.height="1.5rem",s.style.clipPath="inset(0px 0px 0px 50%)",s.style.opacity=0,t.appendChild(s);const u=document.createElement("div");u.style.position="absolute",u.style.top=0,u.style.left=0,u.style.width="1rem",u.style.height="1rem",u.style.border="0.25rem solid currentcolor",u.style.borderRadius="1rem",u.style.clipPath="inset(0px 50% 0px 0px)",u.style.transform="rotate(0deg)",s.appendChild(u);const d=document.createElement("div");d.style.position="absolute",d.style.top=0,d.style.left=0,d.style.width="1rem",d.style.height="1rem",d.style.border="0.25rem solid currentcolor",d.style.borderRadius="1rem",d.style.clipPath="inset(0px 50% 0px 0px)",d.style.transform="rotate(0deg)",s.appendChild(d);const r=document.createElement("div");return r.style.position="absolute",r.style.top=0,r.style.left=0,r.style.width="1.5rem",r.style.height="1.5rem",r.style.borderRadius="1.5rem",r.style.background="currentcolor",r.style.transform="scale(0)",r.style.opacity=0,t.appendChild(r),{longPress:t,longPressCircle:s,longPressCircleLeft:u,longPressCircleRight:d,longPressEffect:r}},yc=(t,n,s)=>(1-t)*n+s,Ec=(t,n)=>`${t}ms ease-out mainIn ${n}ms 1 normal forwards`,xc=(t,n)=>`${t}ms ease-out effectIn ${n}ms 1 normal forwards`,Tc=(t,n)=>`${t}ms linear leftSpinIn ${n}ms 1 normal forwards`,Cc=(t,n)=>`${t}ms linear rightSpinIn ${n}ms 1 normal forwards`,Sc=(t,n)=>`${t}ms linear circleIn ${n}ms 1 normal forwards`,Ic=(t,n,s)=>`
  @keyframes mainIn {
    0%, ${t}% {
      color: ${n};
    }
    100% {
      color: ${s};
    }
  }
`,Ac=(t,n,s,u)=>`
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
`,Oc=(t,n,s)=>`
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
`,wc=(t,n)=>`
  @keyframes rightSpinIn {
    0% {
      transform: rotate(${n}deg);
    }
    ${t}%, 100% {
      transform: rotate(180deg);
    }
  }
`,_c=({time:t=Yt,extraTime:n=Gt,delay:s=Zt,currentColor:u,targetColor:d,effectOpacity:r,effectScale:L,circleLeftRotation:B,circleRightRotation:x,circleClipPath:h,circleOpacity:E})=>{const C=B/360,m=yc(C,t,n),T=Math.round((1-C)*t/m*100),I=Math.round(T/2),O=T+(100-T)/4;return{rules:{main:Ic(T,u,d),effect:Ac(T,O,r,L),circleRight:wc(I,x),circleLeft:vc(T,B),circle:Oc(I,h,E)},names:{main:Ec(m,s),effect:xc(m,s),circleLeft:Tc(m,s),circleRight:Cc(m,s),circle:Sc(m,s)}}},Lc=t=>`${t}ms linear mainOut 0s 1 normal forwards`,Pc=t=>`${t}ms linear effectOut 0s 1 normal forwards`,pc=t=>`${t}ms linear leftSpinOut 0s 1 normal forwards`,Rc=t=>`${t}ms linear rightSpinOut 0s 1 normal forwards`,Dc=t=>`${t}ms linear circleOut 0s 1 normal forwards`,bc=(t,n)=>`
  @keyframes mainOut {
    0% {
      color: ${t};
    }
    100% {
      color: ${n};
    }
  }
`,Mc=(t,n)=>`
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
`,Nc=(t,n)=>`
  @keyframes rightSpinOut {
    0%, ${t}% {
      transform: rotate(${n}deg);
    }
    100% {
      transform: rotate(0deg);
    }
`,Bc=t=>`
  @keyframes leftSpinOut {
    0% {
      transform: rotate(${t}deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
`,Fc=(t,n,s)=>`
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
`,$c=({time:t=jt,currentColor:n,targetColor:s,effectOpacity:u,effectScale:d,circleLeftRotation:r,circleRightRotation:L,circleClipPath:B,circleOpacity:x})=>{const h=r/360,E=h*t,C=Math.min(100,h*100),m=C>50?Math.round((1-50/C)*100):0;return{rules:{main:bc(n,s),effect:Mc(u,d),circleRight:Nc(m,L),circleLeft:Bc(r),circle:Fc(m,B,x)},names:{main:Lc(E),effect:Pc(E),circleRight:pc(E),circleLeft:Rc(E),circle:Dc(E)}}},_t=(t,n=null)=>t===null?n:t,ai=document.createElement("style");document.head.appendChild(ai);const jn=ai.sheet,ye=t=>{const n=jn.rules.length;return jn.insertRule(t,n),n},Ee=t=>{jn.deleteRule(t)},zc=`${mc}ms ease scaleInFadeOut 0s 1 normal backwards`,Uc=(t,n,s)=>`
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
`;let kn=null;const kc=`${gc}ms ease fadeScaleOut 0s 1 normal backwards`,Vc=(t,n,s)=>`
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
`;let Vn=null;const ri=(t,{onDraw:n=gt,onStart:s=gt,onEnd:u=gt,enableInitiator:d=fc,initiatorParentElement:r=document.body,longPressIndicatorParentElement:L=document.body,minDelay:B=Un,minDist:x=Ko,pointNorm:h=gt}={})=>{let E=d,C=r,m=L,T=n,I=s,O=u,S=h;const g=document.createElement("div"),te=Math.random().toString(36).substring(2,5)+Math.random().toString(36).substring(2,5);g.id=`lasso-initiator-${te}`,g.style.position="fixed",g.style.display="flex",g.style.justifyContent="center",g.style.alignItems="center",g.style.zIndex=99,g.style.width="4rem",g.style.height="4rem",g.style.borderRadius="4rem",g.style.opacity=.5,g.style.transform="translate(-50%,-50%) scale(0) rotate(0deg)";const{longPress:p,longPressCircle:q,longPressCircleLeft:ue,longPressCircleRight:ne,longPressEffect:se}=hc();let Le=!1,Pe=!1,ae=[],re=[],M,V=!1,Y=null,pe=null,z=null,X=null,J=null,Te=null,F=null,Ce=null,We=null,G=null;const et=()=>{Le=!1},Re=v=>{const{left:l,top:w}=t.getBoundingClientRect();return[v.clientX-l,v.clientY-w]};window.addEventListener("mouseup",et);const tt=()=>{g.style.opacity=.5,g.style.transform="translate(-50%,-50%) scale(0) rotate(0deg)"},ge=(v,l)=>{const w=getComputedStyle(v),H=+w.opacity,ee=w.transform.match(/([0-9.-]+)+/g),Z=+ee[0],b=+ee[1],P=Math.sqrt(Z*Z+b*b);let $=Math.atan2(b,Z)*(180/Math.PI);return $=l&&$<=0?360+$:$,{opacity:H,scale:P,rotate:$}},N=v=>{if(!E||Le)return;const l=v.clientX,w=v.clientY;g.style.top=`${w}px`,g.style.left=`${l}px`;const H=ge(g),ee=H.opacity,Z=H.scale,b=H.rotate;g.style.opacity=ee,g.style.transform=`translate(-50%,-50%) scale(${Z}) rotate(${b}deg)`,g.style.animation="none",ft().then(()=>{kn!==null&&Ee(kn),kn=ye(Uc(ee,Z,b)),g.style.animation=zc,ft().then(()=>{tt()})})},we=()=>{const{opacity:v,scale:l,rotate:w}=ge(g);g.style.opacity=v,g.style.transform=`translate(-50%,-50%) scale(${l}) rotate(${w}deg)`,g.style.animation="none",ft(2).then(()=>{Vn!==null&&Ee(Vn),Vn=ye(Vc(v,l,w)),g.style.animation=kc,ft().then(()=>{tt()})})},nt=(v,l,{time:w=Yt,extraTime:H=Gt,delay:ee=Zt}={time:Yt,extraTime:Gt,delay:Zt})=>{V=!0;const Z=getComputedStyle(p);p.style.color=Z.color,p.style.top=`${l}px`,p.style.left=`${v}px`,p.style.animation="none";const b=getComputedStyle(q);q.style.clipPath=b.clipPath,q.style.opacity=b.opacity,q.style.animation="none";const P=ge(se);se.style.opacity=P.opacity,se.style.transform=`scale(${P.scale})`,se.style.animation="none";const $=ge(ue);ue.style.transform=`rotate(${$.rotate}deg)`,ue.style.animation="none";const Ge=ge(ne);ne.style.transform=`rotate(${Ge.rotate}deg)`,ne.style.animation="none",ft().then(()=>{if(!V)return;J!==null&&Ee(J),X!==null&&Ee(X),z!==null&&Ee(z),pe!==null&&Ee(pe),Y!==null&&Ee(Y);const{rules:fe,names:De}=_c({time:w,extraTime:H,delay:ee,currentColor:Z.color||"currentcolor",targetColor:p.dataset.activeColor,effectOpacity:P.opacity||0,effectScale:P.scale||0,circleLeftRotation:$.rotate||0,circleRightRotation:Ge.rotate||0,circleClipPath:b.clipPath||"inset(0 0 0 50%)",circleOpacity:b.opacity||0});Y=ye(fe.main),pe=ye(fe.effect),z=ye(fe.circleLeft),X=ye(fe.circleRight),J=ye(fe.circle),p.style.animation=De.main,se.style.animation=De.effect,ue.style.animation=De.circleLeft,ne.style.animation=De.circleRight,q.style.animation=De.circle})},Me=({time:v=jt}={time:jt})=>{if(!V)return;V=!1;const l=getComputedStyle(p);p.style.color=l.color,p.style.animation="none";const w=getComputedStyle(q);q.style.clipPath=w.clipPath,q.style.opacity=w.opacity,q.style.animation="none";const H=ge(se);se.style.opacity=H.opacity,se.style.transform=`scale(${H.scale})`,se.style.animation="none";const ee=w.clipPath.slice(-2,-1)==="x",Z=ge(ue,ee);ue.style.transform=`rotate(${Z.rotate}deg)`,ue.style.animation="none";const b=ge(ne);ne.style.transform=`rotate(${b.rotate}deg)`,ne.style.animation="none",ft().then(()=>{G!==null&&Ee(G),We!==null&&Ee(We),Ce!==null&&Ee(Ce),F!==null&&Ee(F),Te!==null&&Ee(Te);const{rules:P,names:$}=$c({time:v,currentColor:l.color||"currentcolor",targetColor:p.dataset.color,effectOpacity:H.opacity||0,effectScale:H.scale||0,circleLeftRotation:Z.rotate||0,circleRightRotation:b.rotate||0,circleClipPath:w.clipPath||"inset(0px)",circleOpacity:w.opacity||1});Te=ye(P.main),F=ye(P.effect),Ce=ye(P.circleLeft),We=ye(P.circleRight),G=ye(P.circle),p.style.animation=$.main,se.style.animation=$.effect,ue.style.animation=$.circleLeft,ne.style.animation=$.circleRight,q.style.animation=$.circle})},U=()=>{T(ae,re)},ce=v=>{if(M){if(Ua(v[0],v[1],M[0],M[1])>Ko){M=v;const w=S(v);ae.push(w),re.push(w[0],w[1]),ae.length>1&&U()}}else{Pe||(Pe=!0,I()),M=v;const l=S(v);ae=[l],re=[l[0],l[1]]}},ot=Xo(ce,Un,Un),ht=(v,l)=>{const w=Re(v);return l?ot(w):ce(w)},Ye=()=>{ae=[],re=[],M=void 0,U()},Se=v=>{N(v)},de=()=>{Le=!0,Pe=!0,Ye(),I()},he=()=>{we()},Ie=({merge:v=!1}={})=>{Pe=!1;const l=[...ae],w=[...re];return ot.cancel(),Ye(),l.length&&O(l,w,{merge:v}),l},Ae=({onDraw:v=null,onStart:l=null,onEnd:w=null,enableInitiator:H=null,initiatorParentElement:ee=null,longPressIndicatorParentElement:Z=null,minDelay:b=null,minDist:P=null,pointNorm:$=null}={})=>{T=_t(v,T),I=_t(l,I),O=_t(w,O),E=_t(H,E),S=_t($,S),ee!==null&&ee!==C&&(C.removeChild(g),ee.appendChild(g),C=ee),Z!==null&&Z!==m&&(m.removeChild(p),Z.appendChild(p),m=Z),E?(g.addEventListener("click",Se),g.addEventListener("mousedown",de),g.addEventListener("mouseleave",he)):(g.removeEventListener("mousedown",de),g.removeEventListener("mouseleave",he))},it=()=>{C.removeChild(g),m.removeChild(p),window.removeEventListener("mouseup",et),g.removeEventListener("click",Se),g.removeEventListener("mousedown",de),g.removeEventListener("mouseleave",he)},Lt=()=>v=>za(v,{clear:Ye,destroy:it,end:Ie,extend:ht,set:Ae,showInitiator:N,hideInitiator:we,showLongPressIndicator:nt,hideLongPressIndicator:Me});return C.appendChild(g),m.appendChild(p),Ae({onDraw:T,onStart:I,onEnd:O,enableInitiator:E,initiatorParentElement:C}),Fa(Bo("initiator",g),Bo("longPressIndicator",p),Lt(),$a(ri))({})},Hc=`
precision mediump float;

uniform sampler2D texture;

varying vec2 uv;

void main () {
  gl_FragColor = texture2D(texture, uv);
}
`,Wc=`
precision mediump float;

uniform mat4 modelViewProjection;

attribute vec2 position;

varying vec2 uv;

void main () {
  uv = position;
  gl_Position = modelViewProjection * vec4(-1.0 + 2.0 * uv.x, 1.0 - 2.0 * uv.y, 0, 1);
}
`,Yc=`
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
`,Gc=`precision highp float;

varying vec4 color;

void main() {
  gl_FragColor = color;
}
`,Zc=t=>`
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
`,jc=`precision highp float;

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
}`,Kc=`precision highp float;

attribute vec2 position;
varying vec2 particleTextureIndex;

void main() {
  // map normalized device coords to texture coords
  particleTextureIndex = 0.5 * (1.0 + position);

  gl_Position = vec4(position, 0, 1);
}`,qc=function(){const n=(h,E,C,m,T)=>{const I=(m-E)*.5,O=(T-C)*.5;return(2*C-2*m+I+O)*h*h*h+(-3*C+3*m-2*I-O)*h*h+I*h+C},s=(h,E,C)=>{const m=C*h,T=Math.floor(m),I=m-T,O=E[Math.max(0,T-1)],S=E[T],g=E[Math.min(C,T+1)],te=E[Math.min(C,T+2)];return[n(I,O[0],S[0],g[0],te[0]),n(I,O[1],S[1],g[1],te[1])]},u=(h,E,C,m)=>(h-C)**2+(E-m)**2;/**
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
 */const L=(h,E)=>{const C=h.length-1,m=[h[0]];return r(h,0,C,E,m),m.push(h[C]),m},B=(h,{maxIntPointsPerSegment:E=100,tolerance:C=.002}={})=>{const m=h.length,T=m-1,I=T*E+1,O=C**2;let S=[],g;for(let te=0;te<m-1;te++){let p=[h[te].slice(0,2)];g=h[te];for(let q=1;q<E;q++){const ue=(te*E+q)/I,ne=s(ue,h,T);u(g[0],g[1],ne[0],ne[1])>O&&(p.push(ne),g=ne)}p.push(h[te+1]),p=L(p,O),S=S.concat(p.slice(0,p.length-1))}return S.push(h[h.length-1].slice(0,2)),S.flat()},x=h=>{const E={},C=!Number.isNaN(+h[0][5]);return h.forEach(m=>{const T=m[4];E[T]||(E[T]=[]),C?E[T][m[5]]=m:E[T].push(m)}),Object.entries(E).forEach(m=>{E[m[0]]=m[1].filter(T=>T),E[m[0]].reference=m[1][0]}),E};self.onmessage=function(E){(E.data.points?+E.data.points.length:0)||self.postMessage({error:new Error("No points provided")}),E.data.points;const m=x(E.data.points);self.postMessage({points:Object.entries(m).reduce((T,I)=>(T[I[0]]=B(I[1],E.data.options),T[I[0]].reference=I[1].reference,T),{})})}},Xc=(t,n={tolerance:.002,maxIntPointsPerSegment:100})=>new Promise((s,u)=>{const d=ka(qc);d.onmessage=r=>{r.data.error?u(r.data.error):s(r.data.points),d.terminate()},d.postMessage({points:t,options:n})}),Jc="1.4.2",Hn={showRecticle:"showReticle",recticleColor:"reticleColor"},Wn=t=>{Object.keys(t).filter(n=>Hn[n]).forEach(n=>{console.warn(`regl-scatterplot: the "${n}" property is deprecated. Please use "${Hn[n]}" instead.`),t[Hn[n]]=t[n],delete t[n]})},xe=(t,n,{allowSegment:s=!1,allowDensity:u=!1}={})=>oi.has(t)?"valueZ":ii.has(t)?"valueW":t==="segment"?s?"segment":n:t==="density"&&u?"density":n,Yn=t=>{switch(t){case"valueZ":return 2;case"valueW":return 3;default:return null}},al=(t={})=>{const n=Va({async:!t.syncEvents,caseInsensitive:!0}),s=new Float32Array(16),u=new Float32Array(16),d=[0,0];Wn(t);let{renderer:r,backgroundColor:L=Rr,backgroundImage:B=Ur,canvas:x=document.createElement("canvas"),colorBy:h=wt,deselectOnDblClick:E=Hr,deselectOnEscape:C=Wr,lassoColor:m=nr,lassoLineWidth:T=or,lassoMinDelay:I=sr,lassoMinDist:O=ar,lassoClearEvent:S=rr,lassoInitiator:g=ir,lassoInitiatorParentElement:te=document.body,lassoOnLongPress:p=cr,lassoLongPressTime:q=Yt,lassoLongPressAfterEffectTime:ue=Gt,lassoLongPressEffectDelay:ne=Zt,lassoLongPressRevertEffectTime:se=jt,keyMap:Le=dr,mouseMode:Pe=Qa,showReticle:ae=kr,reticleColor:re=Vr,pointColor:M=Lr,pointColorActive:V=Pr,pointColorHover:Y=pr,showPointConnections:pe=Yr,pointConnectionColor:z=Dr,pointConnectionColorActive:X=br,pointConnectionColorHover:J=Mr,pointConnectionColorBy:Te=zn,pointConnectionOpacity:F=Sr,pointConnectionOpacityBy:Ce=Fn,pointConnectionOpacityActive:We=Ir,pointConnectionSize:G=Tr,pointConnectionSizeActive:et=Cr,pointConnectionSizeBy:Re=Bn,pointConnectionMaxIntPointsPerSegment:tt=Gr,pointConnectionTolerance:ge=Zr,pointSize:N=yr,pointSizeSelected:we=Er,pointSizeMouseDetection:nt=jr,pointOutlineWidth:Me=xr,opacity:U=_e,opacityBy:ce=$n,opacityByDensityFill:ot=Or,opacityInactiveMax:ht=wr,opacityInactiveScale:Ye=_r,sizeBy:Se=Nn,height:de=gr,width:he=mr}=t,Ie=he===_e?1:he,Ae=de===_e?1:de;const{performanceMode:it=Kr,opacityByDensityDebounceTime:Lt=vr}=t;r||(r=dc({regl:t.regl,gamma:t.gamma})),L=le(L,!0),m=le(m,!0),re=le(re,!0);let v=jo(L),l,w,H=!1,ee=null,Z=[0,0],b=-1,P=[];const $=new Set,Ge=new Set;let fe=0,De=0,Ne=!1,Ze=[],me,st,Jt=fr,no,at,yt,be,Oe,Qt,Et,xt,Pt,pt=Zo(Le),rt,Tt,Ct,en=!1,W=!0,ct=!1,Rt;M=He(M)?[...M]:[M],V=He(V)?[...V]:[V],Y=He(Y)?[...Y]:[Y],M=M.map(e=>le(e,!0)),V=V.map(e=>le(e,!0)),Y=Y.map(e=>le(e,!0)),U=!Array.isArray(U)&&Number.isNaN(+U)?M[0][3]:U,U=ke(U,Ve,{minLength:1})?[...U]:[U],N=ke(N,Ve,{minLength:1})?[...N]:[N];let oo=Mn/N[0];z==="inherit"?z=[...M]:(z=He(z)?[...z]:[z],z=z.map(e=>le(e,!0))),X==="inherit"?X=[...V]:(X=He(X)?[...X]:[X],X=X.map(e=>le(e,!0))),J==="inherit"?J=[...Y]:(J=He(J)?[...J]:[J],J=J.map(e=>le(e,!0))),F==="inherit"?F=[...U]:F=ke(F,Ve,{minLength:1})?[...F]:[F],G==="inherit"?G=[...N]:G=ke(G,Ve,{minLength:1})?[...G]:[G],h=xe(h,wt),ce=xe(ce,$n,{allowDensity:!0}),Se=xe(Se,Nn),Te=xe(Te,zn,{allowSegment:!0}),Ce=xe(Ce,Fn,{allowSegment:!0}),Re=xe(Re,Bn,{allowSegment:!0});let Be,Fe,$e,io,ve=0,tn=0,nn,on,St,Dt,bt,Mt,Nt,je=!1,It=null,sn,an,so=ae,lt,ut=0,Bt,dt=0,rn=!1,ze=!1,Ke=0,qe=0,oe,At=!1,ie=t.xScale||null,K=t.yScale||null,Ft=0,$t=0,zt=0,Ut=0;ie&&(Ft=ie.domain()[0],$t=ie.domain()[1]-ie.domain()[0],ie.range([0,Ie])),K&&(zt=K.domain()[0],Ut=K.domain()[1]-K.domain()[0],K.range([Ae,0]));const ao=e=>-1+e/Ie*2,ro=e=>1+e/Ae*-2,ci=()=>[ao(d[0]),ro(d[1])],Ue=(e,o)=>{const i=[e,o,1,1],a=Wa(s,mt(s,no,mt(s,l.view,yt)));return Fo(i,i,a),i.slice(0,2)},co=()=>{const e=wn(),i=(Tt[1]-Ct[1])/Ae;return Pt*e*i*.66},lo=()=>{const[e,o]=ci(),[i,a]=Ue(e,o),c=co(),f=me.range(i-c,a-c,i+c,a+c);let y=c,A;return f.forEach(k=>{const[R,j]=me.points[k],D=Ho(R,j,i,a);D<y&&(y=D,A=k)}),y<Pt/Ie*2?A:-1},li=(e,o)=>{Ze=e,w.setPoints(o),n.publish("lassoExtend",{coordinates:e})},ui=e=>{const o=ec(e),i=me.range(...o),a=[];return i.forEach(c=>{ac(e,me.points[c])&&a.push(c)}),a},kt=()=>{Ze=[],w&&w.clear()},cn=e=>e&&e.length>4,Xe=(e,o)=>{if(Qt||!pe||!cn(me.points[e[0]]))return;const i=o===0,a=o===1?y=>Ge.add(y):gt,c=Object.keys(e.reduce((y,A)=>{const k=me.points[A],j=Array.isArray(k[4])?k[4][0]:k[4];return y[j]=!0,y},{})),f=be.getData().opacities;c.filter(y=>!Ge.has(+y)).forEach(y=>{const A=Oe[y][0],k=Oe[y][2],R=Oe[y][3],j=A*4+R*2,D=j+k*2+4;f.__original__===void 0&&(f.__original__=f.slice());for(let _=j;_<D;_++)f[_]=i?f.__original__[_]:We;a(y)}),be.getBuffer().opacities.subdata(f,0)},ln=e=>[e%ve/ve+tn,Math.floor(e/ve)/ve+tn],un=({preventEvent:e=!1}={})=>{S===Gn&&kt(),P.length&&(e||n.publish("deselect"),Ge.clear(),Xe(P,0),P=[],$.clear(),W=!0)},dn=(e,{merge:o=!1,preventEvent:i=!1}={})=>{const a=Array.isArray(e)?e:[e];o?P=Ha(P,a):(P&&P.length&&Xe(P,0),P=a);const c=[];$.clear(),Ge.clear();for(let f=P.length-1;f>=0;f--){const y=P[f];if(y<0||y>=fe)P.splice(f,1);else{$.add(y);const A=ln(y);c.push(A[0]),c.push(A[1])}}on({usage:"dynamic",type:"float",data:c}),Xe(P,1),i||n.publish("select",{points:P}),W=!0},fn=e=>{const o=x.getBoundingClientRect();return d[0]=e.clientX-o.left,d[1]=e.clientY-o.top,[...d]},Q=ri(x,{onStart:()=>{l.config({isFixed:!0}),H=!0,Ne=!0,kt(),b>=0&&(clearTimeout(b),b=-1),n.publish("lassoStart")},onDraw:li,onEnd:(e,o,{merge:i=!1}={})=>{l.config({isFixed:!1}),Ze=[...e];const a=ui(o);dn(a,{merge:i}),n.publish("lassoEnd",{coordinates:Ze}),S===qn&&kt()},enableInitiator:g,initiatorParentElement:te,pointNorm:([e,o])=>Ue(ao(e),ro(o))}),di=()=>Pe===Qo,mn=(e,o)=>{switch(pt[o]){case Jn:return e.altKey;case Qn:return e.metaKey;case ti:return e.ctrlKey;case ni:return e.metaKey;case eo:return e.shiftKey;default:return!1}},uo=e=>{!ze||e.buttons!==1||(H=!0,ee=performance.now(),Z=fn(e),Ne=di()||mn(e,Xn),!Ne&&p&&(Q.showLongPressIndicator(e.clientX,e.clientY,{time:q,extraTime:ue,delay:ne}),b=setTimeout(()=>{b=-1,Ne=!0},q)))},gn=e=>{!ze||(H=!1,b>=0&&(clearTimeout(b),b=-1),Ne&&(e.preventDefault(),Ne=!1,Q.end({merge:mn(e,qt)})),p&&Q.hideLongPressIndicator({time:se}))},fo=e=>{if(!ze)return;e.preventDefault();const o=fn(e);if(Ho(...o,...Z)>=O)return;const i=performance.now()-ee;if(!g||i<Xr){const a=lo();a>=0?(P.length&&S===Gn&&kt(),dn([a],{merge:mn(e,qt)})):rt||(rt=setTimeout(()=>{rt=null,Q.showInitiator(e)},qr))}},mo=e=>{Q.hideInitiator(),rt&&(clearTimeout(rt),rt=null),E&&(e.preventDefault(),un())},go=e=>{!ze||!At&&!H||(fn(e),At&&!Ne&&Rn(lo()),Ne?(e.preventDefault(),Q.extend(e,!0)):p&&Q.hideLongPressIndicator({time:se}),b>=0&&(clearTimeout(b),b=-1),H&&(W=!0))},ho=()=>{!ze||(+oe>=0&&!$.has(oe)&&Xe([oe],0),oe=void 0,At=!1,gn(),W=!0)},hn=()=>{const e=Math.max(N.length,U.length);dt=Math.max(2,Math.ceil(Math.sqrt(e)));const o=new Float32Array(dt**2*4);for(let i=0;i<e;i++){o[i*4]=N[i]||0,o[i*4+1]=Math.min(1,U[i]||0);const a=Number((V[i]||V[0])[3]);o[i*4+2]=Math.min(1,Number.isNaN(a)?1:a);const c=Number((Y[i]||Y[0])[3]);o[i*4+3]=Math.min(1,Number.isNaN(c)?1:c)}return r.regl.texture({data:o,shape:[dt,dt,4],type:"float"})},yo=(e=M,o=V,i=Y)=>{const a=e.length,c=o.length,f=i.length,y=[];if(a===c&&c===f)for(let A=0;A<a;A++)y.push(e[A],o[A],i[A],L);else for(let A=0;A<a;A++){const k=[e[A][0],e[A][1],e[A][2],1],R=h===wt?o[0]:k,j=h===wt?i[0]:k;y.push(e[A],R,j,L)}return y},yn=()=>{const e=yo(),o=e.length;ut=Math.max(2,Math.ceil(Math.sqrt(o)));const i=new Float32Array(ut**2*4);return e.forEach((a,c)=>{i[c*4]=a[0],i[c*4+1]=a[1],i[c*4+2]=a[2],i[c*4+3]=a[3]}),r.regl.texture({data:i,shape:[ut,ut,4],type:"float"})},fi=(e,o)=>{at[0]=e/st,at[5]=o},En=()=>{st=Ie/Ae,no=Dn([],[1/st,1,1]),at=Dn([],[1/st,1,1]),yt=Dn([],[Jt,1,1])},mi=e=>{+e<=0||(Jt=e)},xn=(e,o)=>i=>{if(!i||!i.length)return;const c=[...e()];let f=He(i)?i:[i];f=f.map(y=>le(y,!0)),lt&&lt.destroy();try{o(f),lt=yn()}catch{console.error("Invalid colors. Switching back to default colors."),o(c),lt=yn()}},gi=xn(()=>M,e=>{M=e}),hi=xn(()=>V,e=>{V=e}),yi=xn(()=>Y,e=>{Y=e}),Ei=()=>{const e=Ue(-1,-1),o=Ue(1,1),i=(e[0]+1)/2,a=(o[0]+1)/2,c=(e[1]+1)/2,f=(o[1]+1)/2,y=[Ft+i*$t,Ft+a*$t],A=[zt+c*Ut,zt+f*Ut];return[y,A]},Je=()=>{if(!ie&&!K)return;const[e,o]=Ei();ie&&ie.domain(e),K&&K.domain(o)},Tn=e=>{Ae=Math.max(1,e),x.height=Math.floor(Ae*window.devicePixelRatio),K&&(K.range([Ae,0]),Je())},xi=e=>{if(e===_e){de=e,x.style.height="100%",window.requestAnimationFrame(()=>{x&&Tn(x.getBoundingClientRect().height)});return}!+e||+e<=0||(de=+e,Tn(de),x.style.height=`${de}px`)},Cn=()=>{Pt=nt,nt===_e&&(Pt=Array.isArray(N)?N[Math.floor(N.length/2)]:N)},Ti=e=>{ke(e,Ve,{minLength:1})&&(N=[...e]),Ht(+e)&&(N=[+e]),oo=Mn/N[0],Bt=hn(),Cn()},Ci=e=>{!+e||+e<0||(we=+e)},Si=e=>{!+e||+e<0||(Me=+e)},Sn=e=>{Ie=Math.max(1,e),x.width=Math.floor(Ie*window.devicePixelRatio),ie&&(ie.range([0,Ie]),Je())},Ii=e=>{if(e===_e){he=e,x.style.width="100%",window.requestAnimationFrame(()=>{x&&Sn(x.getBoundingClientRect().width)});return}!+e||+e<=0||(he=+e,Sn(he),x.style.width=`${Ie}px`)},Ai=e=>{ke(e,Ve,{minLength:1})&&(U=[...e]),Ht(+e)&&(U=[+e]),Bt=hn()},In=e=>{switch(e){case"valueZ":return Ke>1?"categorical":"continuous";case"valueW":return qe>1?"categorical":"continuous";default:return null}},An=(e,o)=>{switch(e){case"continuous":return i=>Math.round(i*(o.length-1));case"categorical":default:return gt}},Oi=e=>{h=xe(e,wt)},vi=e=>{ce=xe(e,$n,{allowDensity:!0})},wi=e=>{Se=xe(e,Nn)},_i=e=>{Te=xe(e,zn,{allowSegment:!0})},Li=e=>{Ce=xe(e,Fn,{allowSegment:!0})},Pi=e=>{Re=xe(e,Bn,{allowSegment:!0})},pi=()=>[x.width,x.height],Ri=()=>B,Di=()=>lt,bi=()=>ut,Mi=()=>.5/ut,Ni=()=>window.devicePixelRatio,Bi=()=>nn,On=()=>on,Fi=()=>Bt,$i=()=>dt,zi=()=>.5/dt,Eo=()=>0,Ui=()=>$e||Be,ki=()=>ve,Vi=()=>.5/ve,xo=()=>at,To=()=>l.view,Co=()=>yt,vn=()=>mt(u,at,mt(u,l.view,yt)),wn=()=>l.scaling[0]>1?Math.asinh(Wt(1,l.scaling[0]))/Math.asinh(1)*window.devicePixelRatio:Wt(oo,l.scaling[0])*window.devicePixelRatio,Hi=()=>fe,Ot=()=>P.length,Wi=()=>Ot()>0?ht:1,Yi=()=>Ot()>0?Ye:1,Gi=()=>+(h==="valueZ"),Zi=()=>+(h==="valueW"),ji=()=>+(ce==="valueZ"),Ki=()=>+(ce==="valueW"),qi=()=>+(ce==="density"),Xi=()=>+(Se==="valueZ"),Ji=()=>+(Se==="valueW"),Qi=()=>h==="valueZ"?Ke<=1?M.length-1:1:qe<=1?M.length-1:1,es=()=>ce==="valueZ"?Ke<=1?U.length-1:1:qe<=1?U.length-1:1,ts=()=>Se==="valueZ"?Ke<=1?N.length-1:1:qe<=1?N.length-1:1,ns=e=>{if(ce!=="density")return 1;const o=wn(),i=N[0]*o,a=2/(2/l.view[0])*(2/(2/l.view[5])),c=e.viewportHeight,f=e.viewportWidth;let y=ot*f*c/(De*i*i)*Go(1,a);y*=it?1:1/(.25*Math.PI);const A=Wt(Mn,i)+.5;return y*=(i/A)**2,Go(1,Wt(0,y))},os=r.regl({framebuffer:()=>io,vert:Kc,frag:jc,attributes:{position:[-4,0,4,4,4,-4]},uniforms:{startStateTex:()=>Fe,endStateTex:()=>Be,t:(e,o)=>o.t},count:3}),Qe=(e,o,i,a=ja,c=Wi,f=Yi)=>r.regl({frag:it?Gc:Yc,vert:Zc(a),blend:{enable:!it,func:{srcRGB:"src alpha",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}},depth:{enable:!1},attributes:{stateIndex:{buffer:i,size:2}},uniforms:{resolution:pi,modelViewProjection:vn,devicePixelRatio:Ni,pointScale:wn,encodingTex:Fi,encodingTexRes:$i,encodingTexEps:zi,pointOpacityMax:c,pointOpacityScale:f,pointSizeExtra:e,globalState:a,colorTex:Di,colorTexRes:bi,colorTexEps:Mi,stateTex:Ui,stateTexRes:ki,stateTexEps:Vi,isColoredByZ:Gi,isColoredByW:Zi,isOpacityByZ:ji,isOpacityByW:Ki,isOpacityByDensity:qi,isSizedByZ:Xi,isSizedByW:Ji,colorMultiplicator:Qi,opacityMultiplicator:es,opacityDensity:ns,sizeMultiplicator:ts,numColorStates:qa},count:o,primitive:"points"}),is=Qe(Eo,Hi,Bi),ss=Qe(Eo,()=>1,()=>St,Ka,()=>1,()=>1),as=Qe(()=>(we+Me*2)*window.devicePixelRatio,Ot,On,bn,()=>1,()=>1),rs=Qe(()=>(we+Me)*window.devicePixelRatio,Ot,On,Uo,()=>1,()=>1),cs=Qe(()=>we*window.devicePixelRatio,Ot,On,bn,()=>1,()=>1),ls=()=>{as(),rs(),cs()},us=r.regl({frag:Hc,vert:Wc,attributes:{position:[0,1,0,0,1,0,0,1,1,1,1,0]},uniforms:{modelViewProjection:vn,texture:Ri},count:6}),ds=r.regl({vert:`
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
      }`,depth:{enable:!1},blend:{enable:!0,func:{srcRGB:"src alpha",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}},attributes:{position:()=>Ze},uniforms:{modelViewProjection:vn,color:()=>m},elements:()=>Array.from({length:Ze.length-2},(e,o)=>[0,o+1,o+2])}),fs=()=>{if(!(oe>=0))return;const[e,o]=me.points[oe].slice(0,2),i=[e,o,0,1];mt(s,at,mt(s,l.view,yt)),Fo(i,i,s),Et.setPoints([-1,i[1],1,i[1]]),xt.setPoints([i[0],1,i[0],-1]),Et.draw(),xt.draw(),Qe(()=>(we+Me*2)*window.devicePixelRatio,()=>1,St,bn)(),Qe(()=>(we+Me)*window.devicePixelRatio,()=>1,St,Uo)()},ms=e=>{const o=new Float32Array(e*2);let i=0;for(let a=0;a<e;++a){const c=ln(a);o[i]=c[0],o[i+1]=c[1],i+=2}return o},So=e=>{const o=e.length;ve=Math.max(2,Math.ceil(Math.sqrt(o))),tn=.5/ve;const i=new Float32Array(ve**2*4);Ke=0,qe=0;for(let a=0;a<o;++a)i[a*4]=e[a][0],i[a*4+1]=e[a][1],i[a*4+2]=e[a][2]||0,i[a*4+3]=e[a][3]||0,Ke=Math.max(Ke,i[a*4+2]),qe=Math.max(qe,i[a*4+3]);return r.regl.texture({data:i,shape:[ve,ve,4],type:"float"})},gs=e=>{if(!Be)return!1;if(je){const o=Fe;Fe=$e,o.destroy()}else Fe=Be;return $e=So(e),io=r.regl.framebuffer({color:$e,depth:!1,stencil:!1}),Be=void 0,!0},hs=()=>Boolean(Fe&&$e),ys=()=>{Fe&&(Fe.destroy(),Fe=void 0),$e&&($e.destroy(),$e=void 0)},Io=e=>{ze=!1,fe=e.length,De=fe,Be&&Be.destroy(),Be=So(e),nn({usage:"static",type:"float",data:ms(fe)}),me=new Ya(e,o=>o[0],o=>o[1],16),ze=!0},Ao=(e,o)=>{Dt=l.target,bt=e,Mt=l.distance[0],Nt=o},Es=()=>Boolean(Dt!==void 0&&bt!==void 0&&Mt!==void 0&&Nt!==void 0),xs=()=>{Dt=void 0,bt=void 0,Mt=void 0,Nt=void 0},Ts=e=>{const o=Te==="inherit"?h:Te;if(o==="segment"){const i=z.length-1;return i<1?[]:e.reduce((a,c,f)=>{let y=0;const A=[];for(let R=2;R<c.length;R+=2){const j=Math.sqrt((c[R-2]-c[R])**2+(c[R-1]-c[R+1])**2);A.push(j),y+=j}a[f]=[0];let k=0;for(let R=0;R<c.length/2-1;R++)k+=A[R],a[f].push(Math.floor(k/y*i)*4);return a},[])}if(o){const i=Yn(o),a=An(In(o),Te==="inherit"?M:z);return Oe.reduce((c,[f,y])=>(c[f]=a(y[i])*4,c),[])}return Array(Oe.length).fill(0)},Cs=()=>{const e=Ce==="inherit"?ce:Ce;if(e==="segment"){const o=F.length-1;return o<1?[]:Oe.reduce((i,[a,c,f])=>(i[a]=zo(f,y=>F[Math.floor(y/(f-1)*o)]),i),[])}if(e){const o=Yn(e),i=Ce==="inherit"?U:F,a=An(In(e),i);return Oe.reduce((c,[f,y])=>(c[f]=i[a(y[o])],c),[])}},Ss=()=>{const e=Re==="inherit"?Se:Re;if(e==="segment"){const o=G.length-1;return o<1?[]:Oe.reduce((i,[a,c,f])=>(i[a]=zo(f,y=>G[Math.floor(y/(f-1)*o)]),i),[])}if(e){const o=Yn(e),i=Re==="inherit"?N:G,a=An(In(e),i);return Oe.reduce((c,[f,y])=>(c[f]=i[a(y[o])],c),[])}},Is=e=>{Oe=[];let o=0;Object.keys(e).forEach((i,a)=>{Oe[i]=[a,e[i].reference,e[i].length/2,o],o+=e[i].length/2})},_n=e=>new Promise(o=>{be.setPoints([]),!e||!e.length?o():(Qt=!0,Xc(e,{maxIntPointsPerSegment:tt,tolerance:ge}).then(i=>{Is(i);const a=Object.values(i);be.setPoints(a,{colorIndices:Ts(a),opacities:Cs(),widths:Ss()}),Qt=!1,o()}))}),Oo=()=>me.range(Ct[0],Ct[1],Tt[0],Tt[1]),As=Xo(()=>{De=Oo().length},Lt),Os=e=>{const[o,i]=Dt,[a,c]=bt,f=1-e,y=o*f+a*e,A=i*f+c*e,k=Mt*f+Nt*e;l.lookAt([y,A],k)},vs=()=>hs(),ws=()=>Es(),_s=(e,o)=>{It||(It=performance.now());const i=performance.now()-It,a=uc(o(i/e),0,1);return vs()&&os({t:a}),ws()&&Os(a),i<e},Ls=()=>{je=!1,It=null,sn=void 0,an=void 0,ae=so,ys(),xs(),n.publish("transitionEnd")},Ln=({duration:e=500,easing:o=Vo})=>{je&&n.publish("transitionEnd"),je=!0,It=null,sn=e,an=Zn(o)?er[o]||Vo:o,so=ae,ae=!1,n.publish("transitionStart")},Ps=e=>new Promise((o,i)=>{if(!e||Array.isArray(e))o(e);else{const a=Array.isArray(e.x)||ArrayBuffer.isView(e.x)?e.x.length:0,c=(Array.isArray(e.x)||ArrayBuffer.isView(e.x))&&(D=>e.x[D]),f=(Array.isArray(e.y)||ArrayBuffer.isView(e.y))&&(D=>e.y[D]),y=(Array.isArray(e.line)||ArrayBuffer.isView(e.line))&&(D=>e.line[D]),A=(Array.isArray(e.lineOrder)||ArrayBuffer.isView(e.lineOrder))&&(D=>e.lineOrder[D]),k=Object.keys(e),R=(()=>{const D=k.find(_=>oi.has(_));return D&&(Array.isArray(e[D])||ArrayBuffer.isView(e[D]))&&(_=>e[D][_])})(),j=(()=>{const D=k.find(_=>ii.has(_));return D&&(Array.isArray(e[D])||ArrayBuffer.isView(e[D]))&&(_=>e[D][_])})();c&&f&&R&&j&&y&&A?o(e.x.map((D,_)=>[D,f(_),R(_),j(_),y(_),A(_)])):c&&f&&R&&j&&y?o(Array.from({length:a},(D,_)=>[c(_),f(_),R(_),j(_),y(_)])):c&&f&&R&&j?o(Array.from({length:a},(D,_)=>[c(_),f(_),R(_),j(_)])):c&&f&&R?o(Array.from({length:a},(D,_)=>[c(_),f(_),R(_)])):c&&f?o(Array.from({length:a},(D,_)=>[c(_),f(_)])):i(new Error("You need to specify at least x and y"))}}),ps=(e,o={})=>Ps(e).then(i=>new Promise(a=>{let c=!1;i&&(o.transition&&(i.length===fe?c=gs(i):console.warn("Cannot transition! The number of points between the previous and current draw call must be identical.")),Io(i),(pe||o.showPointConnectionsOnce&&cn(i[0]))&&_n(i).then(()=>{n.publish("pointConnectionsDraw"),W=!0,ct=o.showReticleOnce})),o.transition&&c?(n.subscribe("transitionEnd",()=>{W=!0,ct=o.showReticleOnce,a()},1),Ln({duration:o.transitionDuration,easing:o.transitionEasing})):(n.subscribe("draw",a,1),W=!0,ct=o.showReticleOnce)})),vo=e=>(...o)=>{const i=e(...o);return W=!0,i},Rs=e=>{let o=1/0,i=-1/0,a=1/0,c=-1/0;for(let f=0;f<e.length;f++){const[y,A]=me.points[e[f]];o=Math.min(o,y),i=Math.max(i,y),a=Math.min(a,A),c=Math.max(c,A)}return{x:o,y:a,width:i-o,height:c-a}},wo=(e,o={})=>new Promise(i=>{const a=[e.x+e.width/2,e.y+e.height/2],c=2*Math.atan(1/l.view[5]),f=e.height*st>e.width?e.height/2/Math.tan(c/2):e.width/2/Math.tan(c*st/2);o.transition?(l.config({isFixed:!0}),Ao(a,f),n.subscribe("transitionEnd",()=>{i(),l.config({isFixed:!1})},1),Ln({duration:o.transitionDuration,easing:o.transitionEasing})):(l.lookAt(a,f),n.subscribe("draw",i,1),W=!0)}),Ds=(e,o={})=>{const i=Rs(e),a=i.x+i.width/2,c=i.y+i.height/2,f=co(),y=1+(o.padding||0),A=Math.max(i.width,f)*y,k=Math.max(i.height,f)*y,R=a-A/2,j=c-k/2;return wo({x:R,y:j,width:A,height:k},o)},_o=(e,o,i={})=>new Promise(a=>{i.transition?(l.config({isFixed:!0}),Ao(e,o),n.subscribe("transitionEnd",()=>{a(),l.config({isFixed:!1})},1),Ln({duration:i.transitionDuration,easing:i.transitionEasing})):(l.lookAt(e,o),n.subscribe("draw",a,1),W=!0)}),bs=(e={})=>_o([0,0],1,e),Pn=()=>{be.setStyle({color:yo(z,X,J),opacity:F===null?null:F[0],width:G[0]})},Lo=()=>{const e=Math.round(v)>.5?0:255;Q.initiator.style.border=`1px dashed rgba(${e}, ${e}, ${e}, 0.33)`,Q.initiator.style.background=`rgba(${e}, ${e}, ${e}, 0.1)`},Po=()=>{const e=Math.round(v)>.5?Math.round(v*255)-85:Math.round(v*255)+85;Q.longPressIndicator.style.color=`rgb(${e}, ${e}, ${e})`,Q.longPressIndicator.dataset.color=`rgb(${e}, ${e}, ${e})`;const o=m.map(i=>Math.round(i*255));Q.longPressIndicator.dataset.activeColor=`rgb(${o[0]}, ${o[1]}, ${o[2]})`},Ms=e=>{!e||(L=le(e,!0),v=jo(L),Lo(),Po())},Ns=e=>{e?Zn(e)?Yo(r.regl,e).then(o=>{B=o,W=!0,n.publish("backgroundImageReady")}).catch(()=>{console.error(`Count not create texture from ${e}`),B=null}):e._reglType==="texture2d"?B=e:B=null:B=null},Bs=e=>{e>0&&l.lookAt(l.target,e,l.rotation)},Fs=e=>{e!==null&&l.lookAt(l.target,l.distance[0],e)},$s=e=>{e&&l.lookAt(e,l.distance[0],l.rotation)},po=e=>{e&&l.setView(e)},zs=e=>{if(!e)return;m=le(e,!0),w.setStyle({color:m});const o=m.map(i=>Math.round(i*255));Q.longPressIndicator.dataset.activeColor=`rgb(${o[0]}, ${o[1]}, ${o[2]})`},Us=e=>{Number.isNaN(+e)||+e<1||(T=+e,w.setStyle({width:T}))},ks=e=>{!+e||(I=+e,Q.set({minDelay:I}))},Vs=e=>{!+e||(O=+e,Q.set({minDist:O}))},Hs=e=>{S=Wo(tr,S)(e)},Ws=e=>{g=Boolean(e),Q.set({enableInitiator:g})},Ys=e=>{te=e,Q.set({startInitiatorParentElement:te})},Gs=e=>{p=Boolean(e)},Zs=e=>{q=Number(e)},js=e=>{ue=Number(e)},Ks=e=>{ne=Number(e)},qs=e=>{se=Number(e)},Xs=e=>{Le=Object.entries(e).reduce((o,[i,a])=>(ur.includes(i)&&lr.includes(a)&&(o[i]=a),o),{}),pt=Zo(Le),pt[Kt]?l.config({isRotate:!0,mouseDownMoveModKey:pt[Kt]}):l.config({isRotate:!1})},Js=e=>{Pe=Wo(Ja,Kn)(e),l.config({defaultMouseDownMoveAction:Pe===ei?"rotate":"pan"})},Qs=e=>{e!==null&&(ae=e)},ea=e=>{!e||(re=le(e,!0),Et.setStyle({color:re}),xt.setStyle({color:re}))},ta=e=>{!e||(ie=e,Ft=e.domain()[0],$t=e?e.domain()[1]-e.domain()[0]:0,ie.range([0,Ie]),Je())},na=e=>{!e||(K=e,zt=K.domain()[0],Ut=K?K.domain()[1]-K.domain()[0]:0,K.range([Ae,0]),Je())},oa=e=>{E=!!e},ia=e=>{C=!!e},sa=e=>{pe=!!e,pe?cn(me.points[0])&&_n(me.points).then(()=>{n.publish("pointConnectionsDraw"),W=!0}):_n()},pn=(e,o)=>i=>{if(i==="inherit")e([...o()]);else{const a=He(i)?i:[i];e(a.map(c=>le(c,!0)))}Pn()},aa=pn(e=>{z=e},()=>M),ra=pn(e=>{X=e},()=>V),ca=pn(e=>{J=e},()=>Y),la=e=>{ke(e,Ve,{minLength:1})&&(F=[...e]),Ht(+e)&&(F=[+e]),z=z.map(o=>(o[3]=Number.isNaN(+F[0])?o[3]:+F[0],o)),Pn()},ua=e=>{!Number.isNaN(+e)&&+e&&(We=+e)},da=e=>{ke(e,Ve,{minLength:1})&&(G=[...e]),Ht(+e)&&(G=[+e]),Pn()},fa=e=>{!Number.isNaN(+e)&&+e&&(et=Math.max(0,e))},ma=e=>{tt=Math.max(0,e)},ga=e=>{ge=Math.max(0,e)},ha=e=>{nt=e,Cn()},ya=e=>{ot=+e},Ea=e=>{ht=+e},xa=e=>{Ye=+e},Ta=e=>{r.gamma=e},Ca=e=>{if(Wn({property:!0}),e==="aspectRatio")return Jt;if(e==="background"||e==="backgroundColor")return L;if(e==="backgroundImage")return B;if(e==="camera")return l;if(e==="cameraTarget")return l.target;if(e==="cameraDistance")return l.distance[0];if(e==="cameraRotation")return l.rotation;if(e==="cameraView")return l.view;if(e==="canvas")return x;if(e==="colorBy")return h;if(e==="sizeBy")return Se;if(e==="deselectOnDblClick")return E;if(e==="deselectOnEscape")return C;if(e==="height")return de;if(e==="lassoColor")return m;if(e==="lassoLineWidth")return T;if(e==="lassoMinDelay")return I;if(e==="lassoMinDist")return O;if(e==="lassoClearEvent")return S;if(e==="lassoInitiator")return g;if(e==="lassoInitiatorElement")return Q.initiator;if(e==="lassoInitiatorParentElement")return te;if(e==="keyMap")return{...Le};if(e==="mouseMode")return Pe;if(e==="opacity")return U.length===1?U[0]:U;if(e==="opacityBy")return ce;if(e==="opacityByDensityFill")return ot;if(e==="opacityByDensityDebounceTime")return Lt;if(e==="opacityInactiveMax")return ht;if(e==="opacityInactiveScale")return Ye;if(e==="points")return me.points;if(e==="pointsInView")return Oo();if(e==="pointColor")return M.length===1?M[0]:M;if(e==="pointColorActive")return V.length===1?V[0]:V;if(e==="pointColorHover")return Y.length===1?Y[0]:Y;if(e==="pointOutlineWidth")return Me;if(e==="pointSize")return N.length===1?N[0]:N;if(e==="pointSizeSelected")return we;if(e==="pointSizeMouseDetection")return nt;if(e==="showPointConnections")return pe;if(e==="pointConnectionColor")return z.length===1?z[0]:z;if(e==="pointConnectionColorActive")return X.length===1?X[0]:X;if(e==="pointConnectionColorHover")return J.length===1?J[0]:J;if(e==="pointConnectionColorBy")return Te;if(e==="pointConnectionOpacity")return F.length===1?F[0]:F;if(e==="pointConnectionOpacityBy")return Ce;if(e==="pointConnectionOpacityActive")return We;if(e==="pointConnectionSize")return G.length===1?G[0]:G;if(e==="pointConnectionSizeActive")return et;if(e==="pointConnectionSizeBy")return Re;if(e==="pointConnectionMaxIntPointsPerSegment")return tt;if(e==="pointConnectionTolerance")return ge;if(e==="reticleColor")return re;if(e==="regl")return r.regl;if(e==="showReticle")return ae;if(e==="version")return Jc;if(e==="width")return he;if(e==="xScale")return ie;if(e==="yScale")return K;if(e==="performanceMode")return it;if(e==="gamma")return r.gamma;if(e==="renderer")return r},Ro=(e={})=>(Wn(e),(e.backgroundColor!==void 0||e.background!==void 0)&&Ms(e.backgroundColor||e.background),e.backgroundImage!==void 0&&Ns(e.backgroundImage),e.cameraTarget!==void 0&&$s(e.cameraTarget),e.cameraDistance!==void 0&&Bs(e.cameraDistance),e.cameraRotation!==void 0&&Fs(e.cameraRotation),e.cameraView!==void 0&&po(e.cameraView),e.colorBy!==void 0&&Oi(e.colorBy),e.pointColor!==void 0&&gi(e.pointColor),e.pointColorActive!==void 0&&hi(e.pointColorActive),e.pointColorHover!==void 0&&yi(e.pointColorHover),e.pointSize!==void 0&&Ti(e.pointSize),e.pointSizeSelected!==void 0&&Ci(e.pointSizeSelected),e.pointSizeMouseDetection!==void 0&&ha(e.pointSizeMouseDetection),e.sizeBy!==void 0&&wi(e.sizeBy),e.opacity!==void 0&&Ai(e.opacity),e.showPointConnections!==void 0&&sa(e.showPointConnections),e.pointConnectionColor!==void 0&&aa(e.pointConnectionColor),e.pointConnectionColorActive!==void 0&&ra(e.pointConnectionColorActive),e.pointConnectionColorHover!==void 0&&ca(e.pointConnectionColorHover),e.pointConnectionColorBy!==void 0&&_i(e.pointConnectionColorBy),e.pointConnectionOpacityBy!==void 0&&Li(e.pointConnectionOpacityBy),e.pointConnectionOpacity!==void 0&&la(e.pointConnectionOpacity),e.pointConnectionOpacityActive!==void 0&&ua(e.pointConnectionOpacityActive),e.pointConnectionSize!==void 0&&da(e.pointConnectionSize),e.pointConnectionSizeActive!==void 0&&fa(e.pointConnectionSizeActive),e.pointConnectionSizeBy!==void 0&&Pi(e.pointConnectionSizeBy),e.pointConnectionMaxIntPointsPerSegment!==void 0&&ma(e.pointConnectionMaxIntPointsPerSegment),e.pointConnectionTolerance!==void 0&&ga(e.pointConnectionTolerance),e.opacityBy!==void 0&&vi(e.opacityBy),e.lassoColor!==void 0&&zs(e.lassoColor),e.lassoLineWidth!==void 0&&Us(e.lassoLineWidth),e.lassoMinDelay!==void 0&&ks(e.lassoMinDelay),e.lassoMinDist!==void 0&&Vs(e.lassoMinDist),e.lassoClearEvent!==void 0&&Hs(e.lassoClearEvent),e.lassoInitiator!==void 0&&Ws(e.lassoInitiator),e.lassoInitiatorParentElement!==void 0&&Ys(e.lassoInitiatorParentElement),e.lassoOnLongPress!==void 0&&Gs(e.lassoOnLongPress),e.lassoLongPressTime!==void 0&&Zs(e.lassoLongPressTime),e.lassoLongPressAfterEffectTime!==void 0&&js(e.lassoLongPressAfterEffectTime),e.lassoLongPressEffectDelay!==void 0&&Ks(e.lassoLongPressEffectDelay),e.lassoLongPressRevertEffectTime!==void 0&&qs(e.lassoLongPressRevertEffectTime),e.keyMap!==void 0&&Xs(e.keyMap),e.mouseMode!==void 0&&Js(e.mouseMode),e.showReticle!==void 0&&Qs(e.showReticle),e.reticleColor!==void 0&&ea(e.reticleColor),e.pointOutlineWidth!==void 0&&Si(e.pointOutlineWidth),e.height!==void 0&&xi(e.height),e.width!==void 0&&Ii(e.width),e.aspectRatio!==void 0&&mi(e.aspectRatio),e.xScale!==void 0&&ta(e.xScale),e.yScale!==void 0&&na(e.yScale),e.deselectOnDblClick!==void 0&&oa(e.deselectOnDblClick),e.deselectOnEscape!==void 0&&ia(e.deselectOnEscape),e.opacityByDensityFill!==void 0&&ya(e.opacityByDensityFill),e.opacityInactiveMax!==void 0&&Ea(e.opacityInactiveMax),e.opacityInactiveScale!==void 0&&xa(e.opacityInactiveScale),e.gamma!==void 0&&Ta(e.gamma),new Promise(o=>{window.requestAnimationFrame(()=>{!x||(En(),l.refresh(),r.refresh(),W=!0,o())})})),Sa=(e,{preventEvent:o=!1}={})=>{po(e),W=!0,en=o},Rn=(e,{showReticleOnce:o=!1,preventEvent:i=!1}={})=>{let a=!1;if(e>=0&&e<fe){a=!0;const c=oe,f=e!==oe;+c>=0&&f&&!$.has(c)&&Xe([c],0),oe=e,St.subdata(ln(e)),$.has(e)||Xe([e],2),f&&!i&&n.publish("pointover",oe)}else a=+oe>=0,a&&($.has(oe)||Xe([oe],0),i||n.publish("pointout",oe)),oe=void 0;a&&(W=!0,ct=o)},Do=()=>{l||(l=Ga(x,{isPanInverted:[!1,!0]})),t.cameraView?l.setView($o(t.cameraView)):t.cameraTarget||t.cameraDistance||t.cameraRotation?l.lookAt([...t.cameraTarget||Nr],t.cameraDistance||Br,t.cameraRotation||Fr):l.setView($o($r)),Tt=Ue(1,1),Ct=Ue(-1,-1)},Ia=({preventEvent:e=!1}={})=>{Do(),Je(),!e&&n.publish("view",{view:l.view,camera:l,xScale:ie,yScale:K})},bo=({key:e})=>{switch(e){case"Escape":C&&un();break}},Mo=()=>{At=!0},No=()=>{Rn(),At=!1,W=!0},Aa=()=>{W=!0},Oa=()=>{Io([]),be.clear()},vt=()=>{l.refresh();const e=he===_e,o=de===_e;if(e||o){const{width:i,height:a}=x.getBoundingClientRect();e&&Sn(i),o&&Tn(a),En(),W=!0}},va=()=>x.getContext("2d").getImageData(0,0,x.width,x.height),wa=()=>{En(),Do(),Je(),w=Vt(r.regl,{color:m,width:T,is2d:!0}),be=Vt(r.regl,{color:z,colorHover:J,colorActive:X,opacity:F===null?null:F[0],width:G[0],widthActive:et,is2d:!0}),Et=Vt(r.regl,{color:re,width:1,is2d:!0}),xt=Vt(r.regl,{color:re,width:1,is2d:!0}),Cn(),x.addEventListener("wheel",Aa),nn=r.regl.buffer(),on=r.regl.buffer(),St=r.regl.buffer({usage:"dynamic",type:"float",length:Xa*2}),lt=yn(),Bt=hn();const e=Ro({backgroundImage:B,width:he,height:de,keyMap:Le});Lo(),Po(),window.addEventListener("keyup",bo,!1),window.addEventListener("blur",ho,!1),window.addEventListener("mouseup",gn,!1),window.addEventListener("mousemove",go,!1),x.addEventListener("mousedown",uo,!1),x.addEventListener("mouseenter",Mo,!1),x.addEventListener("mouseleave",No,!1),x.addEventListener("click",fo,!1),x.addEventListener("dblclick",mo,!1),"ResizeObserver"in window?(Rt=new ResizeObserver(vt),Rt.observe(x)):(window.addEventListener("resize",vt),window.addEventListener("orientationchange",vt)),e.then(()=>{n.publish("init")})},_a=r.onFrame(()=>{rn=l.tick(),!(!ze||!(W||je))&&(je&&!_s(sn,an)&&Ls(),rn&&(Tt=Ue(1,1),Ct=Ue(-1,-1),ce==="density"&&As()),r.render(()=>{const e=x.width/r.canvas.width,o=x.height/r.canvas.height;fi(e,o),B&&B._reglType&&us(),Ze.length>2&&ds(),je||be.draw({projection:xo(),model:Co(),view:To()}),is(),!H&&(ae||ct)&&fs(),oe>=0&&ss(),P.length&&ls(),w.draw({projection:xo(),model:Co(),view:To()})},x),rn&&(Je(),en?en=!1:n.publish("view",{view:l.view,camera:l,xScale:ie,yScale:K})),W=!1,ct=!1,n.publish("draw"))}),La=()=>{W=!0},Pa=()=>{_a(),window.removeEventListener("keyup",bo,!1),window.removeEventListener("blur",ho,!1),window.removeEventListener("mouseup",gn,!1),window.removeEventListener("mousemove",go,!1),x.removeEventListener("mousedown",uo,!1),x.removeEventListener("mouseenter",Mo,!1),x.removeEventListener("mouseleave",No,!1),x.removeEventListener("click",fo,!1),x.removeEventListener("dblclick",mo,!1),Rt?Rt.disconnect():(window.removeEventListener("resize",vt),window.removeEventListener("orientationchange",vt)),x=void 0,l.dispose(),l=void 0,w.destroy(),be.destroy(),Et.destroy(),xt.destroy(),n.publish("destroy"),n.clear(),t.renderer||r.destroy()};return wa(),{get isSupported(){return r.isSupported},clear:vo(Oa),createTextureFromUrl:(e,o=to)=>Yo(r.regl,e,o),deselect:un,destroy:Pa,draw:ps,get:Ca,hover:Rn,redraw:La,refresh:r.refresh,reset:vo(Ia),select:dn,set:Ro,export:va,subscribe:n.subscribe,unsubscribe:n.unsubscribe,view:Sa,zoomToLocation:_o,zoomToArea:wo,zoomToPoints:Ds,zoomToOrigin:bs}};function Qc(t,n="file.txt"){const s=document.createElement("a");s.href=URL.createObjectURL(t),s.download=n,document.body.appendChild(s),s.dispatchEvent(new MouseEvent("click",{bubbles:!0,cancelable:!0,view:window})),document.body.removeChild(s)}function rl(t){const n=new Image;n.onload=()=>{t.get("canvas").toBlob(s=>{Qc(s,"scatter.png")})},n.src=t.get("canvas").toDataURL()}function el(){const t=document.querySelector("#modal"),n=document.querySelector("#modal-text");t.style.display="none",n.textContent=""}function tl(t,n,s){const u=document.querySelector("#modal");u.style.display="flex";const d=document.querySelector("#modal-text");d.style.color=n?"#cc79A7":"#bbb",d.textContent=t;const r=document.querySelector("#modal-close");s?(r.style.display="block",r.style.background=n?"#cc79A7":"#bbb",r.addEventListener("click",el,{once:!0})):r.style.display="none"}function cl(t){t.isSupported||tl("Your browser does not support all necessary WebGL features. The scatter plot might not render properly.",!0,!0)}export{cl as a,tl as b,al as c,dc as d,el as e,rl as s};
