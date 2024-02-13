import{g as li,h as Ya,i as Ga,l as Za,q as ja,j as Ka,k as qa,m as Xa,p as Ja,n as Ct,w as Qa,o as Ko,t as ui,r as er,s as Tt,u as tr,f as nr,v as or,x as ir,y as sr,z as Ye,A as kn,C as Qt,D as ar,E as Vn,F as rr,K as cr,G as lr,H as qo,I as Xo}from"./vendor-b0595fa4.js";(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const m of document.querySelectorAll('link[rel="modulepreload"]'))f(m);new MutationObserver(m=>{for(const r of m)if(r.type==="childList")for(const D of r.addedNodes)D.tagName==="LINK"&&D.rel==="modulepreload"&&f(D)}).observe(document,{childList:!0,subtree:!0});function s(m){const r={};return m.integrity&&(r.integrity=m.integrity),m.referrerPolicy&&(r.referrerPolicy=m.referrerPolicy),m.crossOrigin==="use-credentials"?r.credentials="include":m.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function f(m){if(m.ep)return;m.ep=!0;const r=s(m);fetch(m.href,r)}})();const Me="auto",ur=0,Hn=1,fr=2,Jo=3,dr=4,mr=Float32Array.BYTES_PER_ELEMENT,fi=["OES_texture_float","OES_element_index_uint","WEBGL_color_buffer_float","EXT_float_blend"],Qo={color:[0,0,0,0],depth:1},ao="panZoom",di="lasso",mi="rotate",gr=[ao,di,mi],hr=ao,yr={cubicIn:Ya,cubicInOut:li,cubicOut:Ga,linear:Za,quadIn:ja,quadInOut:Ka,quadOut:qa},ei=li,pe="continuous",St="categorical",ti=[pe,St],io="deselect",ro="lassoEnd",Er=[io,ro],xr=[0,.666666667,1,1],Tr=2,Sr=!1,Cr=10,Ir=3,wr=ro,Ar=!1,nn=750,on=500,sn=100,an=250,co="lasso",rn="rotate",cn="merge",Or=[co,rn,cn],lo="alt",uo="cmd",gi="ctrl",hi="meta",fo="shift",Pr=[lo,uo,gi,hi,fo],vr={[lo]:rn,[fo]:co,[uo]:cn},_r=1,Lr=Me,Dr=Me,br=1,Wn=1,Rr=6,pr=2,Mr=2,Yn=null,Nr=2,Br=2,Gn=null,Fr=null,Zn=null,$r=.66,zr=1,jn=null,Ur=.15,kr=25,Vr=1,Hr=1,Bt=null,Wr=[.66,.66,.66,zr],Yr=[0,.55,1,1],Gr=[1,1,1,1],Zr=[0,0,0,1],Kn=null,jr=[.66,.66,.66,.2],Kr=[0,.55,1,1],qr=[1,1,1,1],Xr=[0,0],Jr=1,Qr=0,ec=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),tc="IMAGE_LOAD_ERROR",nc=null,oc=!1,ic=[1,1,1,.5],sc=!0,ac=!0,rc=!1,cc=100,lc=1/500,uc="auto",fc=!1,dc=200,mc=500,yi=new Set(["z","valueZ","valueA","value1","category"]),Ei=new Set(["w","valueW","valueB","value2","value"]),mo=15e3,ni="Points have not been drawn",gc=(t,o)=>t?fi.reduce((s,f)=>t.hasExtension(f)?s:(o||console.warn(`WebGL: ${f} extension not supported. Scatterplot might not render properly`),!1),!0):!1,hc=t=>{const o=t.getContext("webgl",{antialias:!0,preserveDrawingBuffer:!0}),s=[];return fi.forEach(f=>{o.getExtension(f)?s.push(f):console.warn(`WebGL: ${f} extension not supported. Scatterplot might not render properly`)}),Xa({gl:o,extensions:s})},qn=(t,o,s,f)=>Math.sqrt((t-s)**2+(o-f)**2),yc=t=>{let o=1/0,s=-1/0,f=1/0,m=-1/0;for(let r=0;r<t.length;r+=2)o=t[r]<o?t[r]:o,s=t[r]>s?t[r]:s,f=t[r+1]<f?t[r+1]:f,m=t[r+1]>m?t[r+1]:m;return[o,f,s,m]},Ec=([t,o,s,f])=>Number.isFinite(t)&&Number.isFinite(o)&&Number.isFinite(s)&&Number.isFinite(f)&&s-t>0&&f-o>0,xc=(t,o=!1)=>t.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(s,f,m,r)=>`#${f}${f}${m}${m}${r}${r}`).substring(1).match(/.{2}/g).map(s=>parseInt(s,16)/255**o),Ge=(t,o,{minLength:s=0}={})=>Array.isArray(t)&&t.length>=s&&t.every(o),Ze=t=>!Number.isNaN(+t)&&+t>=0,en=t=>!Number.isNaN(+t)&&+t>0,oi=(t,o)=>s=>t.indexOf(s)>=0?s:o,Tc=(t,o=!1,s=mo)=>new Promise((f,m)=>{const r=new Image;o&&(r.crossOrigin="anonymous"),r.src=t,r.onload=()=>{f(r)};const D=()=>{m(new Error(tc))};r.onerror=D,setTimeout(D,s)}),ii=(t,o,s=mo)=>new Promise((f,m)=>{Tc(o,o.indexOf(window.location.origin)!==0&&o.indexOf("base64")===-1,s).then(r=>{f(t.texture(r))}).catch(r=>{m(r)})}),Sc=(t,o=!1)=>[...xc(t,o),255**!o],Cc=t=>/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(t),Ic=t=>t>=0&&t<=1,ln=t=>Array.isArray(t)&&t.every(Ic),wc=(t,[o,s]=[])=>{let f,m,r,D,F=!1;for(let x=0,y=t.length-2;x<t.length;x+=2)f=t[x],m=t[x+1],r=t[y],D=t[y+1],m>s!=D>s&&o<(r-f)*(s-m)/(D-m)+f&&(F=!F),y=x;return F},so=t=>typeof t=="string"||t instanceof String,Ac=t=>Number.isInteger(t)&&t>=0&&t<=255,xi=t=>Array.isArray(t)&&t.every(Ac),Oc=t=>t.length===3&&(ln(t)||xi(t)),Pc=t=>t.length===4&&(ln(t)||xi(t)),je=t=>Array.isArray(t)&&t.length&&(Array.isArray(t[0])||so(t[0])),tn=(t,o)=>t>o?t:o,si=(t,o)=>t<o?t:o,fe=(t,o)=>{if(Pc(t)){const s=ln(t);return o&&s||!o&&!s?t:o&&!s?t.map(f=>f/255):t.map(f=>f*255)}if(Oc(t)){const s=255**!o,f=ln(t);return o&&f||!o&&!f?[...t,s]:o&&!f?[...t.map(m=>m/255),s]:[...t.map(m=>m*255),s]}return Cc(t)?Sc(t,o):(console.warn("Only HEX, RGB, and RGBA are handled by this function. Returning white instead."),o?[1,1,1,1]:[255,255,255,255])},ai=t=>Object.entries(t).reduce((o,[s,f])=>(o[f]?o[f]=[...o[f],s]:o[f]=s,o),{}),ri=t=>.21*t[0]+.72*t[1]+.07*t[2],vc=(t,o,s)=>Math.min(s,Math.max(o,t)),_c=(t={})=>{let{regl:o,canvas:s=document.createElement("canvas"),gamma:f=br}=t;o||(o=hc(s));const m=gc(o),r=[s.width,s.height],D=o.framebuffer({width:r[0],height:r[1],colorFormat:"rgba",colorType:"float"}),F=o({vert:`
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
      }`,attributes:{xy:[-4,-4,4,-4,0,4]},uniforms:{src:()=>D,srcRes:()=>r,gamma:()=>f},count:3,depth:{enable:!1},blend:{enable:!0,func:{srcRGB:"one",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}}}),x=I=>{const h=I.getContext("2d");h.clearRect(0,0,I.width,I.height),h.drawImage(s,(s.width-I.width)/2,(s.height-I.height)/2,I.width,I.height,0,0,I.width,I.height)},y=(I,h)=>{o.clear(Qo),D.use(()=>{o.clear(Qo),I()}),F(),x(h)},E=()=>{o.poll()},C=new Set,g=I=>(C.add(I),()=>{C.delete(I)}),T=o.frame(()=>{const I=C.values();let h=I.next();for(;!h.done;)h.value(),h=I.next()}),w=()=>{s.width=window.innerWidth*window.devicePixelRatio,s.height=window.innerHeight*window.devicePixelRatio,r[0]=s.width,r[1]=s.height,D.resize(...r)};return t.canvas||(window.addEventListener("resize",w),window.addEventListener("orientationchange",w),w()),{get canvas(){return s},get regl(){return o},get gamma(){return f},set gamma(I){f=+I},get isSupported(){return m},render:y,onFrame:g,refresh:E,destroy:()=>{T.cancel(),s=void 0,o=void 0,window.removeEventListener("resize",w),window.removeEventListener("orientationchange",w)}}},Lc=!0,Xn=8,ci=2,Dc=2500,bc=250,Rc=()=>{const t=document.createElement("div"),o=Math.random().toString(36).substring(2,5)+Math.random().toString(36).substring(2,5);t.id=`lasso-long-press-${o}`,t.style.position="fixed",t.style.width="1.25rem",t.style.height="1.25rem",t.style.pointerEvents="none",t.style.transform="translate(-50%,-50%)";const s=document.createElement("div");s.style.position="absolute",s.style.top=0,s.style.left=0,s.style.width="1.25rem",s.style.height="1.25rem",s.style.clipPath="inset(0px 0px 0px 50%)",s.style.opacity=0,t.appendChild(s);const f=document.createElement("div");f.style.position="absolute",f.style.top=0,f.style.left=0,f.style.width="0.8rem",f.style.height="0.8rem",f.style.border="0.2rem solid currentcolor",f.style.borderRadius="0.8rem",f.style.clipPath="inset(0px 50% 0px 0px)",f.style.transform="rotate(0deg)",s.appendChild(f);const m=document.createElement("div");m.style.position="absolute",m.style.top=0,m.style.left=0,m.style.width="0.8rem",m.style.height="0.8rem",m.style.border="0.2rem solid currentcolor",m.style.borderRadius="0.8rem",m.style.clipPath="inset(0px 50% 0px 0px)",m.style.transform="rotate(0deg)",s.appendChild(m);const r=document.createElement("div");return r.style.position="absolute",r.style.top=0,r.style.left=0,r.style.width="1.25rem",r.style.height="1.25rem",r.style.borderRadius="1.25rem",r.style.background="currentcolor",r.style.transform="scale(0)",r.style.opacity=0,t.appendChild(r),{longPress:t,longPressCircle:s,longPressCircleLeft:f,longPressCircleRight:m,longPressEffect:r}},pc=(t,o,s)=>(1-t)*o+s,Mc=(t,o)=>`${t}ms ease-out mainIn ${o}ms 1 normal forwards`,Nc=(t,o)=>`${t}ms ease-out effectIn ${o}ms 1 normal forwards`,Bc=(t,o)=>`${t}ms linear leftSpinIn ${o}ms 1 normal forwards`,Fc=(t,o)=>`${t}ms linear rightSpinIn ${o}ms 1 normal forwards`,$c=(t,o)=>`${t}ms linear circleIn ${o}ms 1 normal forwards`,zc=(t,o,s)=>`
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
      color: ${s};
      opacity: 0.8;
    }
  }
`,Uc=(t,o,s,f)=>`
  @keyframes effectIn {
    0%, ${t}% {
      opacity: ${s};
      transform: scale(${f});
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
`,kc=(t,o,s)=>`
  @keyframes circleIn {
    0% {
      clip-path: ${o};
      opacity: ${s};
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
`,Vc=(t,o)=>`
  @keyframes leftSpinIn {
    0% {
      transform: rotate(${o}deg);
    }
    ${t}%, 100% {
      transform: rotate(360deg);
    }
  }
`,Hc=(t,o)=>`
  @keyframes rightSpinIn {
    0% {
      transform: rotate(${o}deg);
    }
    ${t}%, 100% {
      transform: rotate(180deg);
    }
  }
`,Wc=({time:t=nn,extraTime:o=on,delay:s=sn,currentColor:f,targetColor:m,effectOpacity:r,effectScale:D,circleLeftRotation:F,circleRightRotation:x,circleClipPath:y,circleOpacity:E})=>{const C=F/360,g=pc(C,t,o),T=Math.round((1-C)*t/g*100),w=Math.round(T/2),A=T+(100-T)/4;return{rules:{main:zc(T,f,m),effect:Uc(T,A,r,D),circleRight:Hc(w,x),circleLeft:Vc(T,F),circle:kc(w,y,E)},names:{main:Mc(g,s),effect:Nc(g,s),circleLeft:Bc(g,s),circleRight:Fc(g,s),circle:$c(g,s)}}},Yc=t=>`${t}ms linear mainOut 0s 1 normal forwards`,Gc=t=>`${t}ms linear effectOut 0s 1 normal forwards`,Zc=t=>`${t}ms linear leftSpinOut 0s 1 normal forwards`,jc=t=>`${t}ms linear rightSpinOut 0s 1 normal forwards`,Kc=t=>`${t}ms linear circleOut 0s 1 normal forwards`,qc=(t,o)=>`
  @keyframes mainOut {
    0% {
      color: ${t};
    }
    100% {
      color: ${o};
    }
  }
`,Xc=(t,o)=>`
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
`,Jc=(t,o)=>`
  @keyframes rightSpinOut {
    0%, ${t}% {
      transform: rotate(${o}deg);
    }
    100% {
      transform: rotate(0deg);
    }
`,Qc=t=>`
  @keyframes leftSpinOut {
    0% {
      transform: rotate(${t}deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
`,el=(t,o,s)=>`
  @keyframes circleOut {
    0%, ${t}% {
      clip-path: ${o};
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
`,tl=({time:t=an,currentColor:o,targetColor:s,effectOpacity:f,effectScale:m,circleLeftRotation:r,circleRightRotation:D,circleClipPath:F,circleOpacity:x})=>{const y=r/360,E=y*t,C=Math.min(100,y*100),g=C>50?Math.round((1-50/C)*100):0;return{rules:{main:qc(o,s),effect:Xc(f,m),circleRight:Jc(g,D),circleLeft:Qc(r),circle:el(g,F,x)},names:{main:Yc(E),effect:Gc(E),circleRight:Zc(E),circleLeft:jc(E),circle:Kc(E)}}},Ft=(t,o=null)=>t===null?o:t;let Jn;const Ti=()=>{if(!Jn){const t=document.createElement("style");document.head.appendChild(t),Jn=t.sheet}return Jn},Ee=t=>{const o=Ti(),s=o.rules.length;return o.insertRule(t,s),s},xe=t=>{Ti().deleteRule(t)},nl=`${Dc}ms ease scaleInFadeOut 0s 1 normal backwards`,ol=(t,o,s)=>`
@keyframes scaleInFadeOut {
  0% {
    opacity: ${t};
    transform: translate(-50%,-50%) scale(${o}) rotate(${s}deg);
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
`;let Qn=null;const il=`${bc}ms ease fadeScaleOut 0s 1 normal backwards`,sl=(t,o,s)=>`
@keyframes fadeScaleOut {
  0% {
    opacity: ${t};
    transform: translate(-50%,-50%) scale(${o}) rotate(${s}deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%,-50%) scale(0) rotate(${s}deg);
  }
}
`;let eo=null;const Si=(t,{onDraw:o=Ct,onStart:s=Ct,onEnd:f=Ct,enableInitiator:m=Lc,initiatorParentElement:r=document.body,longPressIndicatorParentElement:D=document.body,minDelay:F=Xn,minDist:x=ci,pointNorm:y=Ct}={})=>{let E=m,C=r,g=D,T=o,w=s,A=f,I=y;const h=document.createElement("div"),ne=Math.random().toString(36).substring(2,5)+Math.random().toString(36).substring(2,5);h.id=`lasso-initiator-${ne}`,h.style.position="fixed",h.style.display="flex",h.style.justifyContent="center",h.style.alignItems="center",h.style.zIndex=99,h.style.width="4rem",h.style.height="4rem",h.style.borderRadius="4rem",h.style.opacity=.5,h.style.transform="translate(-50%,-50%) scale(0) rotate(0deg)";const{longPress:R,longPressCircle:J,longPressCircleLeft:de,longPressCircleRight:oe,longPressEffect:re}=Rc();let Ne=!1,Be=!1,ce=[],le=[],N,W=!1,Y=null,Se=null,k=null,Q=null,ee=null,Ce=null,$=null,Ie=null,Ke=null,G=null;const st=()=>{Ne=!1},Fe=P=>{const{left:b,top:u}=t.getBoundingClientRect();return[P.clientX-b,P.clientY-u]};window.addEventListener("mouseup",st);const at=()=>{h.style.opacity=.5,h.style.transform="translate(-50%,-50%) scale(0) rotate(0deg)"},ge=(P,b)=>{const u=getComputedStyle(P),U=+u.opacity,H=u.transform.match(/([0-9.-]+)+/g),Z=+H[0],K=+H[1],B=Math.sqrt(Z*Z+K*K);let O=Math.atan2(K,Z)*(180/Math.PI);return O=b&&O<=0?360+O:O,{opacity:U,scale:B,rotate:O}},z=P=>{if(!E||Ne)return;const b=P.clientX,u=P.clientY;h.style.top=`${u}px`,h.style.left=`${b}px`;const U=ge(h),H=U.opacity,Z=U.scale,K=U.rotate;h.style.opacity=H,h.style.transform=`translate(-50%,-50%) scale(${Z}) rotate(${K}deg)`,h.style.animation="none",Tt().then(()=>{Qn!==null&&xe(Qn),Qn=Ee(ol(H,Z,K)),h.style.animation=nl,Tt().then(()=>{at()})})},Le=()=>{const{opacity:P,scale:b,rotate:u}=ge(h);h.style.opacity=P,h.style.transform=`translate(-50%,-50%) scale(${b}) rotate(${u}deg)`,h.style.animation="none",Tt(2).then(()=>{eo!==null&&xe(eo),eo=Ee(sl(P,b,u)),h.style.animation=il,Tt().then(()=>{at()})})},rt=(P,b,{time:u=nn,extraTime:U=on,delay:H=sn}={time:nn,extraTime:on,delay:sn})=>{W=!0;const Z=getComputedStyle(R);R.style.color=Z.color,R.style.top=`${b}px`,R.style.left=`${P}px`,R.style.animation="none";const K=getComputedStyle(J);J.style.clipPath=K.clipPath,J.style.opacity=K.opacity,J.style.animation="none";const B=ge(re);re.style.opacity=B.opacity,re.style.transform=`scale(${B.scale})`,re.style.animation="none";const O=ge(de);de.style.transform=`rotate(${O.rotate}deg)`,de.style.animation="none";const Pe=ge(oe);oe.style.transform=`rotate(${Pe.rotate}deg)`,oe.style.animation="none",Tt().then(()=>{if(!W)return;ee!==null&&xe(ee),Q!==null&&xe(Q),k!==null&&xe(k),Se!==null&&xe(Se),Y!==null&&xe(Y);const{rules:De,names:se}=Wc({time:u,extraTime:U,delay:H,currentColor:Z.color||"currentcolor",targetColor:R.dataset.activeColor,effectOpacity:B.opacity||0,effectScale:B.scale||0,circleLeftRotation:O.rotate||0,circleRightRotation:Pe.rotate||0,circleClipPath:K.clipPath||"inset(0 0 0 50%)",circleOpacity:K.opacity||0});Y=Ee(De.main),Se=Ee(De.effect),k=Ee(De.circleLeft),Q=Ee(De.circleRight),ee=Ee(De.circle),R.style.animation=se.main,re.style.animation=se.effect,de.style.animation=se.circleLeft,oe.style.animation=se.circleRight,J.style.animation=se.circle})},ze=({time:P=an}={time:an})=>{if(!W)return;W=!1;const b=getComputedStyle(R);R.style.color=b.color,R.style.animation="none";const u=getComputedStyle(J);J.style.clipPath=u.clipPath,J.style.opacity=u.opacity,J.style.animation="none";const U=ge(re);re.style.opacity=U.opacity,re.style.transform=`scale(${U.scale})`,re.style.animation="none";const H=u.clipPath.slice(-2,-1)==="x",Z=ge(de,H);de.style.transform=`rotate(${Z.rotate}deg)`,de.style.animation="none";const K=ge(oe);oe.style.transform=`rotate(${K.rotate}deg)`,oe.style.animation="none",Tt().then(()=>{G!==null&&xe(G),Ke!==null&&xe(Ke),Ie!==null&&xe(Ie),$!==null&&xe($),Ce!==null&&xe(Ce);const{rules:B,names:O}=tl({time:P,currentColor:b.color||"currentcolor",targetColor:R.dataset.color,effectOpacity:U.opacity||0,effectScale:U.scale||0,circleLeftRotation:Z.rotate||0,circleRightRotation:K.rotate||0,circleClipPath:u.clipPath||"inset(0px)",circleOpacity:u.opacity||1});Ce=Ee(B.main),$=Ee(B.effect),Ie=Ee(B.circleLeft),Ke=Ee(B.circleRight),G=Ee(B.circle),R.style.animation=O.main,re.style.animation=O.effect,de.style.animation=O.circleLeft,oe.style.animation=O.circleRight,J.style.animation=O.circle})},V=()=>{T(ce,le)},ue=P=>{if(N){if(tr(P[0],P[1],N[0],N[1])>ci){N=P;const u=I(P);ce.push(u),le.push(u[0],u[1]),ce.length>1&&V()}}else{Be||(Be=!0,w()),N=P;const b=I(P);ce=[b],le=[b[0],b[1]]}},ct=ui(ue,Xn,Xn),It=(P,b)=>{const u=Fe(P);return b?ct(u):ue(u)},qe=()=>{ce=[],le=[],N=void 0,V()},we=P=>{z(P)},me=()=>{Ne=!0,Be=!0,qe(),w()},he=()=>{Le()},Ae=({merge:P=!1}={})=>{Be=!1;const b=[...ce],u=[...le];return ct.cancel(),qe(),b.length&&A(b,u,{merge:P}),b},Oe=({onDraw:P=null,onStart:b=null,onEnd:u=null,enableInitiator:U=null,initiatorParentElement:H=null,longPressIndicatorParentElement:Z=null,minDelay:K=null,minDist:B=null,pointNorm:O=null}={})=>{T=Ft(P,T),w=Ft(b,w),A=Ft(u,A),E=Ft(U,E),I=Ft(O,I),H!==null&&H!==C&&(C.removeChild(h),H.appendChild(h),C=H),Z!==null&&Z!==g&&(g.removeChild(R),Z.appendChild(R),g=Z),E?(h.addEventListener("click",we),h.addEventListener("mousedown",me),h.addEventListener("mouseleave",he)):(h.removeEventListener("mousedown",me),h.removeEventListener("mouseleave",he))},lt=()=>{C.removeChild(h),g.removeChild(R),window.removeEventListener("mouseup",st),h.removeEventListener("click",we),h.removeEventListener("mousedown",me),h.removeEventListener("mouseleave",he)},$t=()=>P=>er(P,{clear:qe,destroy:lt,end:Ae,extend:It,set:Oe,showInitiator:z,hideInitiator:Le,showLongPressIndicator:rt,hideLongPressIndicator:ze});return C.appendChild(h),g.appendChild(R),Oe({onDraw:T,onStart:w,onEnd:A,enableInitiator:E,initiatorParentElement:C}),Ja(Ko("initiator",h),Ko("longPressIndicator",R),$t(),Qa(Si))({})},al=`
precision mediump float;

uniform sampler2D texture;

varying vec2 uv;

void main () {
  gl_FragColor = texture2D(texture, uv);
}
`,rl=`
precision mediump float;

uniform mat4 modelViewProjection;

attribute vec2 position;

varying vec2 uv;

void main () {
  uv = position;
  gl_Position = modelViewProjection * vec4(-1.0 + 2.0 * uv.x, 1.0 - 2.0 * uv.y, 0, 1);
}
`,cl=`
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
`,ll=`precision highp float;

varying vec4 color;

void main() {
  gl_FragColor = color;
}
`,ul=t=>`
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
`,fl=`precision highp float;

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
}`,dl=`precision highp float;

attribute vec2 position;
varying vec2 particleTextureIndex;

void main() {
  // map normalized device coords to texture coords
  particleTextureIndex = 0.5 * (1.0 + position);

  gl_Position = vec4(position, 0, 1);
}`,ml=function(){const o=(y,E,C,g,T)=>{const w=(g-E)*.5,A=(T-C)*.5;return(2*C-2*g+w+A)*y*y*y+(-3*C+3*g-2*w-A)*y*y+w*y+C},s=(y,E,C)=>{const g=C*y,T=Math.floor(g),w=g-T,A=E[Math.max(0,T-1)],I=E[T],h=E[Math.min(C,T+1)],ne=E[Math.min(C,T+2)];return[o(w,A[0],I[0],h[0],ne[0]),o(w,A[1],I[1],h[1],ne[1])]},f=(y,E,C,g)=>(y-C)**2+(E-g)**2;/**
 * Douglas Peucker square segment distance
 * Implementation from https://github.com/mourner/simplify-js
 * @author Vladimir Agafonkin
 * @copyright Vladimir Agafonkin 2013
 * @license BSD
 * @param {array} p - Point
 * @param {array} p1 - First boundary point
 * @param {array} p2 - Second boundary point
 * @return {number} Distance
 */const m=(y,E,C)=>{let g=E[0],T=E[1],w=C[0]-g,A=C[1]-T;if(w!==0||A!==0){const I=((y[0]-g)*w+(y[1]-T)*A)/(w*w+A*A);I>1?(g=C[0],T=C[1]):I>0&&(g+=w*I,T+=A*I)}return w=y[0]-g,A=y[1]-T,w*w+A*A};/**
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
 */const r=(y,E,C,g,T)=>{let w=g,A;for(let I=E+1;I<C;I++){const h=m(y[I],y[E],y[C]);h>w&&(A=I,w=h)}w>g&&(A-E>1&&r(y,E,A,g,T),T.push(y[A]),C-A>1&&r(y,A,C,g,T))};/**
 * Douglas Peucker. Implementation from https://github.com/mourner/simplify-js
 * @author Vladimir Agafonkin
 * @copyright Vladimir Agafonkin 2013
 * @license BSD
 * @param {array} points - List of points to be simplified
 * @param {number} tolerance - Tolerance level. Points below this distance level will be ignored
 * @return {array} Simplified point list
 */const D=(y,E)=>{const C=y.length-1,g=[y[0]];return r(y,0,C,E,g),g.push(y[C]),g},F=(y,{maxIntPointsPerSegment:E=100,tolerance:C=.002}={})=>{const g=y.length,T=g-1,w=T*E+1,A=C**2;let I=[],h;for(let ne=0;ne<g-1;ne++){let R=[y[ne].slice(0,2)];h=y[ne];for(let J=1;J<E;J++){const de=(ne*E+J)/w,oe=s(de,y,T);f(h[0],h[1],oe[0],oe[1])>A&&(R.push(oe),h=oe)}R.push(y[ne+1]),R=D(R,A),I=I.concat(R.slice(0,R.length-1))}return I.push(y[y.length-1].slice(0,2)),I.flat()},x=y=>{const E={},C=!Number.isNaN(+y[0][5]);return y.forEach(g=>{const T=g[4];E[T]||(E[T]=[]),C?E[T][g[5]]=g:E[T].push(g)}),Object.entries(E).forEach(g=>{E[g[0]]=g[1].filter(T=>T),E[g[0]].reference=g[1][0]}),E};self.onmessage=function(E){(E.data.points?+E.data.points.length:0)||self.postMessage({error:new Error("No points provided")}),E.data.points;const g=x(E.data.points);self.postMessage({points:Object.entries(g).reduce((T,w)=>(T[w[0]]=F(w[1],E.data.options),T[w[0]].reference=w[1].reference,T),{})})}},gl=(t,o={tolerance:.002,maxIntPointsPerSegment:100})=>new Promise((s,f)=>{const m=nr(ml);m.onmessage=r=>{r.data.error?f(r.data.error):s(r.data.points),m.terminate()},m.postMessage({points:t,options:o})}),hl="1.8.5",to={showRecticle:"showReticle",recticleColor:"reticleColor"},no=t=>{Object.keys(t).filter(o=>to[o]).forEach(o=>{console.warn(`regl-scatterplot: the "${o}" property is deprecated. Please use "${to[o]}" instead.`),t[to[o]]=t[o],delete t[o]})},Te=(t,o,{allowSegment:s=!1,allowDensity:f=!1}={})=>yi.has(t)?"valueZ":Ei.has(t)?"valueW":t==="segment"?s?"segment":o:t==="density"&&f?"density":o,oo=t=>{switch(t){case"valueZ":return 2;case"valueW":return 3;default:return null}},wl=(t={})=>{const o=or({async:!t.syncEvents,caseInsensitive:!0}),s=new Float32Array(16),f=new Float32Array(16),m=[0,0];no(t);let{renderer:r,backgroundColor:D=Zr,backgroundImage:F=nc,canvas:x=document.createElement("canvas"),colorBy:y=Bt,deselectOnDblClick:E=sc,deselectOnEscape:C=ac,lassoColor:g=xr,lassoLineWidth:T=Tr,lassoMinDelay:w=Cr,lassoMinDist:A=Ir,lassoClearEvent:I=wr,lassoInitiator:h=Sr,lassoInitiatorParentElement:ne=document.body,lassoOnLongPress:R=Ar,lassoLongPressTime:J=nn,lassoLongPressAfterEffectTime:de=on,lassoLongPressEffectDelay:oe=sn,lassoLongPressRevertEffectTime:re=an,keyMap:Ne=vr,mouseMode:Be=hr,showReticle:ce=oc,reticleColor:le=ic,pointColor:N=Wr,pointColorActive:W=Yr,pointColorHover:Y=Gr,showPointConnections:Se=rc,pointConnectionColor:k=jr,pointConnectionColorActive:Q=Kr,pointConnectionColorHover:ee=qr,pointConnectionColorBy:Ce=Kn,pointConnectionOpacity:$=Fr,pointConnectionOpacityBy:Ie=Zn,pointConnectionOpacityActive:Ke=$r,pointConnectionSize:G=Nr,pointConnectionSizeActive:st=Br,pointConnectionSizeBy:Fe=Gn,pointConnectionMaxIntPointsPerSegment:at=cc,pointConnectionTolerance:ge=lc,pointSize:z=Rr,pointSizeSelected:Le=pr,pointSizeMouseDetection:rt=uc,pointOutlineWidth:ze=Mr,opacity:V=Me,opacityBy:ue=jn,opacityByDensityFill:ct=Ur,opacityInactiveMax:It=Vr,opacityInactiveScale:qe=Hr,sizeBy:we=Yn,height:me=Dr,width:he=Lr}=t,Ae=he===Me?1:he,Oe=me===Me?1:me;const{performanceMode:lt=fc,opacityByDensityDebounceTime:$t=kr}=t;r||(r=_c({regl:t.regl,gamma:t.gamma})),D=fe(D,!0),g=fe(g,!0),le=fe(le,!0);let P=!1,b=ri(D),u,U,H=!1,Z=null,K=[0,0],B=-1,O=[];const Pe=new Set,De=new Set;let se=!1;const be=new Set;let Re=0,un=0,Ue=!1,Xe=[],ie,ut,fn=t.aspectRatio||_r,dn,ft,dt,$e,ve,mn,wt,At,gn,zt=ai(Ne),mt,Ot,Pt,hn=!1,M=!0,Je=!1,Ut;N=je(N)?[...N]:[N],W=je(W)?[...W]:[W],Y=je(Y)?[...Y]:[Y],N=N.map(e=>fe(e,!0)),W=W.map(e=>fe(e,!0)),Y=Y.map(e=>fe(e,!0)),V=!Array.isArray(V)&&Number.isNaN(+V)?N[0][3]:V,V=Ge(V,Ze,{minLength:1})?[...V]:[V],z=Ge(z,Ze,{minLength:1})?[...z]:[z];let go=Wn/z[0];k==="inherit"?k=[...N]:(k=je(k)?[...k]:[k],k=k.map(e=>fe(e,!0))),Q==="inherit"?Q=[...W]:(Q=je(Q)?[...Q]:[Q],Q=Q.map(e=>fe(e,!0))),ee==="inherit"?ee=[...Y]:(ee=je(ee)?[...ee]:[ee],ee=ee.map(e=>fe(e,!0))),$==="inherit"?$=[...V]:$=Ge($,Ze,{minLength:1})?[...$]:[$],G==="inherit"?G=[...z]:G=Ge(G,Ze,{minLength:1})?[...G]:[G],y=Te(y,Bt),ue=Te(ue,jn,{allowDensity:!0}),we=Te(we,Yn),Ce=Te(Ce,Kn,{allowSegment:!0}),Ie=Te(Ie,Zn,{allowSegment:!0}),Fe=Te(Fe,Gn,{allowSegment:!0});let ke,Ve,He,ho,_e=0,yn=0,vt,En,_t,kt,Vt,Ht,Wt,Qe=!1,Lt=null,xn,Tn,yo=ce,gt,ht=0,Yt,yt=0,Sn=!1,ye=!1,Dt=!1,et=St,tt=St,te,Et=!1,ae=t.xScale||null,q=t.yScale||null,Gt=0,Zt=0,jt=0,Kt=0;ae&&(Gt=ae.domain()[0],Zt=ae.domain()[1]-ae.domain()[0],ae.range([0,Ae])),q&&(jt=q.domain()[0],Kt=q.domain()[1]-q.domain()[0],q.range([Oe,0]));const Eo=e=>-1+e/Ae*2,xo=e=>1+e/Oe*-2,Ci=()=>[Eo(m[0]),xo(m[1])],We=(e,n)=>{const i=[e,n,1,1],a=ar(s,Ye(s,dn,Ye(s,u.view,dt)));return kn(i,i,a),i.slice(0,2)},To=(e=0)=>{const n=Fn(),a=(Ot[1]-Pt[1])/x.height;return(gn*n+e)*a},Cn=()=>se?ie.points.filter((e,n)=>be.has(n)):ie.points,In=(e,n,i,a)=>{const c=ie.range(e,n,i,a);return se?c.filter(l=>be.has(l)):c},So=()=>{const[e,n]=Ci(),[i,a]=We(e,n),c=To(4),l=In(i-c,a-c,i+c,a+c);let d=c,S=-1;return l.forEach(L=>{const[v,j]=ie.points[L],p=qn(v,j,i,a);p<d&&(d=p,S=L)}),S},Ii=(e,n)=>{Xe=e,U.setPoints(n),o.publish("lassoExtend",{coordinates:e})},wi=e=>{const n=yc(e);if(!Ec(n))return[];const i=In(...n),a=[];return i.forEach(c=>{wc(e,ie.points[c])&&a.push(c)}),a},qt=()=>{Xe=[],U&&U.clear()},bt=e=>e&&e.length>4,nt=(e,n)=>{if(mn||!Se||!bt(ie.points[e[0]]))return;const i=n===0,a=n===1?d=>De.add(d):Ct,c=Object.keys(e.reduce((d,S)=>{const L=ie.points[S],j=Array.isArray(L[4])?L[4][0]:L[4];return d[j]=!0,d},{})),l=$e.getData().opacities;c.filter(d=>!De.has(+d)).forEach(d=>{const S=ve[d][0],L=ve[d][2],v=ve[d][3],j=S*4+v*2,p=j+L*2+4;l.__original__===void 0&&(l.__original__=l.slice());for(let _=j;_<p;_++)l[_]=i?l.__original__[_]:Ke;a(d)}),$e.getBuffer().opacities.subdata(l,0)},Xt=e=>[e%_e/_e+yn,Math.floor(e/_e)/_e+yn],Ai=e=>se&&!be.has(e),Jt=({preventEvent:e=!1}={})=>{I===io&&qt(),O.length&&(e||o.publish("deselect"),De.clear(),nt(O,0),O=[],Pe.clear(),M=!0)},xt=(e,{merge:n=!1,preventEvent:i=!1}={})=>{const a=Array.isArray(e)?e:[e],c=[...O];if(n){if(O=ir(O,a),c.length===O.length){M=!0;return}}else{if(O&&O.length&&nt(O,0),c.length>0&&a.length===0){Jt({preventEvent:i});return}O=a}if(sr(c,O)){M=!0;return}const l=[];Pe.clear(),De.clear();for(let d=O.length-1;d>=0;d--){const S=O[d];if(S<0||S>=Re||Ai(S)){O.splice(d,1);continue}Pe.add(S),l.push.apply(l,Xt(S))}En({usage:"dynamic",type:"float",data:l}),nt(O,1),i||o.publish("select",{points:O}),M=!0},Rt=(e,{showReticleOnce:n=!1,preventEvent:i=!1}={})=>{let a=!1;if(e>=0&&e<Re){a=!0;const c=te,l=e!==te;+c>=0&&l&&!Pe.has(c)&&nt([c],0),te=e,_t.subdata(Xt(e)),Pe.has(e)||nt([e],2),l&&!i&&o.publish("pointover",te)}else a=+te>=0,a&&(Pe.has(te)||nt([te],0),i||o.publish("pointout",te)),te=void 0;a&&(M=!0,Je=n)},wn=e=>{const n=x.getBoundingClientRect();return m[0]=e.clientX-n.left,m[1]=e.clientY-n.top,[...m]},X=Si(x,{onStart:()=>{u.config({isFixed:!0}),H=!0,Ue=!0,qt(),B>=0&&(clearTimeout(B),B=-1),o.publish("lassoStart")},onDraw:Ii,onEnd:(e,n,{merge:i=!1}={})=>{u.config({isFixed:!1}),Xe=[...e];const a=wi(n);xt(a,{merge:i}),o.publish("lassoEnd",{coordinates:Xe}),I===ro&&qt()},enableInitiator:h,initiatorParentElement:ne,pointNorm:([e,n])=>We(Eo(e),xo(n))}),Oi=()=>Be===di,An=(e,n)=>{switch(zt[n]){case lo:return e.altKey;case uo:return e.metaKey;case gi:return e.ctrlKey;case hi:return e.metaKey;case fo:return e.shiftKey;default:return!1}},Pi=e=>document.elementsFromPoint(e.clientX,e.clientY).some(n=>n===x),Co=e=>{!ye||e.buttons!==1||(H=!0,Z=performance.now(),K=wn(e),Ue=Oi()||An(e,co),!Ue&&R&&(X.showLongPressIndicator(e.clientX,e.clientY,{time:J,extraTime:de,delay:oe}),B=setTimeout(()=>{B=-1,Ue=!0},J)))},On=e=>{ye&&(H=!1,B>=0&&(clearTimeout(B),B=-1),Ue&&(e.preventDefault(),Ue=!1,X.end({merge:An(e,cn)})),R&&X.hideLongPressIndicator({time:re}))},Io=e=>{if(!ye)return;e.preventDefault();const n=wn(e);if(qn(...n,...K)>=A)return;const i=performance.now()-Z;if(!h||i<mc){const a=So();a>=0?(O.length&&I===io&&qt(),xt([a],{merge:An(e,cn)})):mt||(mt=setTimeout(()=>{mt=null,X.showInitiator(e)},dc))}},wo=e=>{X.hideInitiator(),mt&&(clearTimeout(mt),mt=null),E&&(e.preventDefault(),Jt())},Ao=e=>{if(Dt||(Et=Pi(e),Dt=!0),!ye||!Et&&!H)return;const n=wn(e),a=qn(...n,...K)>=A;Et&&!Ue&&Rt(So()),Ue?(e.preventDefault(),X.extend(e,!0)):H&&R&&a&&X.hideLongPressIndicator({time:re}),B>=0&&a&&(clearTimeout(B),B=-1),H&&(M=!0)},Oo=()=>{te=void 0,Et=!1,Dt=!1,ye&&(+te>=0&&!Pe.has(te)&&nt([te],0),On(),M=!0)},Pn=()=>{const e=Math.max(z.length,V.length);yt=Math.max(2,Math.ceil(Math.sqrt(e)));const n=new Float32Array(yt**2*4);for(let i=0;i<e;i++){n[i*4]=z[i]||0,n[i*4+1]=Math.min(1,V[i]||0);const a=Number((W[i]||W[0])[3]);n[i*4+2]=Math.min(1,Number.isNaN(a)?1:a);const c=Number((Y[i]||Y[0])[3]);n[i*4+3]=Math.min(1,Number.isNaN(c)?1:c)}return r.regl.texture({data:n,shape:[yt,yt,4],type:"float"})},Po=(e=N,n=W,i=Y)=>{const a=e.length,c=n.length,l=i.length,d=[];if(a===c&&c===l)for(let S=0;S<a;S++)d.push(e[S],n[S],i[S],D);else for(let S=0;S<a;S++){const L=[e[S][0],e[S][1],e[S][2],1],v=y===Bt?n[0]:L,j=y===Bt?i[0]:L;d.push(e[S],v,j,D)}return d},vn=()=>{const e=Po(),n=e.length;ht=Math.max(2,Math.ceil(Math.sqrt(n)));const i=new Float32Array(ht**2*4);return e.forEach((a,c)=>{i[c*4]=a[0],i[c*4+1]=a[1],i[c*4+2]=a[2],i[c*4+3]=a[3]}),r.regl.texture({data:i,shape:[ht,ht,4],type:"float"})},vi=(e,n)=>{ft[0]=e/ut,ft[5]=n},_n=()=>{ut=Ae/Oe,dn=Vn([],[1/ut,1,1]),ft=Vn([],[1/ut,1,1]),dt=Vn([],[fn,1,1])},_i=e=>{+e<=0||(fn=e)},Ln=(e,n)=>i=>{if(!i||!i.length)return;const c=[...e()];let l=je(i)?i:[i];l=l.map(d=>fe(d,!0)),gt&&gt.destroy();try{n(l),gt=vn()}catch{console.error("Invalid colors. Switching back to default colors."),n(c),gt=vn()}},Li=Ln(()=>N,e=>{N=e}),Di=Ln(()=>W,e=>{W=e}),bi=Ln(()=>Y,e=>{Y=e}),Ri=()=>{const e=We(-1,-1),n=We(1,1),i=(e[0]+1)/2,a=(n[0]+1)/2,c=(e[1]+1)/2,l=(n[1]+1)/2,d=[Gt+i*Zt,Gt+a*Zt],S=[jt+c*Kt,jt+l*Kt];return[d,S]},ot=()=>{if(!ae&&!q)return;const[e,n]=Ri();ae&&ae.domain(e),q&&q.domain(n)},Dn=e=>{Oe=Math.max(1,e),x.height=Math.floor(Oe*window.devicePixelRatio),q&&(q.range([Oe,0]),ot())},pi=e=>{if(e===Me){me=e,x.style.height="100%",window.requestAnimationFrame(()=>{x&&Dn(x.getBoundingClientRect().height)});return}!+e||+e<=0||(me=+e,Dn(me),x.style.height=`${me}px`)},bn=()=>{gn=rt,rt===Me&&(gn=Array.isArray(z)?rr(z):z)},Mi=e=>{Ge(e,Ze,{minLength:1})&&(z=[...e]),en(+e)&&(z=[+e]),go=Wn/z[0],Yt=Pn(),bn()},Ni=e=>{!+e||+e<0||(Le=+e)},Bi=e=>{!+e||+e<0||(ze=+e)},Rn=e=>{Ae=Math.max(1,e),x.width=Math.floor(Ae*window.devicePixelRatio),ae&&(ae.range([0,Ae]),ot())},Fi=e=>{if(e===Me){he=e,x.style.width="100%",window.requestAnimationFrame(()=>{x&&Rn(x.getBoundingClientRect().width)});return}!+e||+e<=0||(he=+e,Rn(he),x.style.width=`${Ae}px`)},$i=e=>{Ge(e,Ze,{minLength:1})&&(V=[...e]),en(+e)&&(V=[+e]),Yt=Pn()},pn=e=>{switch(e){case"valueZ":return et;case"valueW":return tt;default:return null}},Mn=(e,n)=>{switch(e){case pe:return i=>Math.round(i*(n.length-1));case St:default:return Ct}},zi=e=>{y=Te(e,Bt)},Ui=e=>{ue=Te(e,jn,{allowDensity:!0})},ki=e=>{we=Te(e,Yn)},Vi=e=>{Ce=Te(e,Kn,{allowSegment:!0})},Hi=e=>{Ie=Te(e,Zn,{allowSegment:!0})},Wi=e=>{Fe=Te(e,Gn,{allowSegment:!0})},Yi=()=>[x.width,x.height],Gi=()=>F,Zi=()=>gt,ji=()=>ht,Ki=()=>.5/ht,qi=()=>window.devicePixelRatio,Xi=()=>vt,Nn=()=>En,Ji=()=>Yt,Qi=()=>yt,es=()=>.5/yt,vo=()=>0,ts=()=>He||ke,ns=()=>_e,os=()=>.5/_e,_o=()=>ft,Lo=()=>u.view,Do=()=>dt,Bn=()=>Ye(f,ft,Ye(f,u.view,dt)),Fn=()=>u.scaling[0]>1?Math.asinh(tn(1,u.scaling[0]))/Math.asinh(1)*window.devicePixelRatio:tn(go,u.scaling[0])*window.devicePixelRatio,is=()=>se?be.size:Re,pt=()=>O.length,ss=()=>pt()>0?It:1,as=()=>pt()>0?qe:1,rs=()=>+(y==="valueZ"),cs=()=>+(y==="valueW"),ls=()=>+(ue==="valueZ"),us=()=>+(ue==="valueW"),fs=()=>+(ue==="density"),ds=()=>+(we==="valueZ"),ms=()=>+(we==="valueW"),gs=()=>y==="valueZ"?et===pe?N.length-1:1:tt===pe?N.length-1:1,hs=()=>ue==="valueZ"?et===pe?V.length-1:1:tt===pe?V.length-1:1,ys=()=>we==="valueZ"?et===pe?z.length-1:1:tt===pe?z.length-1:1,Es=e=>{if(ue!=="density")return 1;const n=Fn(),i=z[0]*n,a=2/(2/u.view[0])*(2/(2/u.view[5])),c=e.viewportHeight,l=e.viewportWidth;let d=ct*l*c/(un*i*i)*si(1,a);d*=lt?1:1/(.25*Math.PI);const S=tn(Wn,i)+.5;return d*=(i/S)**2,si(1,tn(0,d))},xs=r.regl({framebuffer:()=>ho,vert:dl,frag:fl,attributes:{position:[-4,0,4,4,4,-4]},uniforms:{startStateTex:()=>Ve,endStateTex:()=>ke,t:(e,n)=>n.t},count:3}),it=(e,n,i,a=ur,c=ss,l=as)=>r.regl({frag:lt?ll:cl,vert:ul(a),blend:{enable:!lt,func:{srcRGB:"src alpha",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}},depth:{enable:!1},attributes:{stateIndex:{buffer:i,size:2}},uniforms:{resolution:Yi,modelViewProjection:Bn,devicePixelRatio:qi,pointScale:Fn,encodingTex:Ji,encodingTexRes:Qi,encodingTexEps:es,pointOpacityMax:c,pointOpacityScale:l,pointSizeExtra:e,globalState:a,colorTex:Zi,colorTexRes:ji,colorTexEps:Ki,stateTex:ts,stateTexRes:ns,stateTexEps:os,isColoredByZ:rs,isColoredByW:cs,isOpacityByZ:ls,isOpacityByW:us,isOpacityByDensity:fs,isSizedByZ:ds,isSizedByW:ms,colorMultiplicator:gs,opacityMultiplicator:hs,opacityDensity:Es,sizeMultiplicator:ys,numColorStates:dr},count:n,primitive:"points"}),Ts=it(vo,is,Xi),Ss=it(vo,()=>1,()=>_t,fr,()=>1,()=>1),Cs=it(()=>(Le+ze*2)*window.devicePixelRatio,pt,Nn,Hn,()=>1,()=>1),Is=it(()=>(Le+ze)*window.devicePixelRatio,pt,Nn,Jo,()=>1,()=>1),ws=it(()=>Le*window.devicePixelRatio,pt,Nn,Hn,()=>1,()=>1),As=()=>{Cs(),Is(),ws()},Os=r.regl({frag:al,vert:rl,attributes:{position:[0,1,0,0,1,0,0,1,1,1,1,0]},uniforms:{modelViewProjection:Bn,texture:Gi},count:6}),Ps=r.regl({vert:`
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
      }`,depth:{enable:!1},blend:{enable:!0,func:{srcRGB:"src alpha",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}},attributes:{position:()=>Xe},uniforms:{modelViewProjection:Bn,color:()=>g},elements:()=>Array.from({length:Xe.length-2},(e,n)=>[0,n+1,n+2])}),vs=()=>{if(!(te>=0))return;const[e,n]=ie.points[te].slice(0,2),i=[e,n,0,1];Ye(s,ft,Ye(s,u.view,dt)),kn(i,i,s),wt.setPoints([-1,i[1],1,i[1]]),At.setPoints([i[0],1,i[0],-1]),wt.draw(),At.draw(),it(()=>(Le+ze*2)*window.devicePixelRatio,()=>1,_t,Hn)(),it(()=>(Le+ze)*window.devicePixelRatio,()=>1,_t,Jo)()},bo=e=>{const n=new Float32Array(e*2);let i=0;for(let a=0;a<e;++a){const c=Xt(a);n[i]=c[0],n[i+1]=c[1],i+=2}return n},Ro=(e,n={})=>{const i=e.length;_e=Math.max(2,Math.ceil(Math.sqrt(i))),yn=.5/_e;const a=new Float32Array(_e**2*4);let c=!0,l=!0,d=0,S=0,L=0;for(let v=0;v<i;++v)d=v*4,a[d]=e[v][0],a[d+1]=e[v][1],S=e[v][2]||0,L=e[v][3]||0,a[d+2]=S,a[d+3]=L,c&&(c=Number.isInteger(S)),l&&(l=Number.isInteger(L));return n.z&&ti.includes(n.z)?et=n.z:et=c?St:pe,n.w&&ti.includes(n.w)?tt=n.w:tt=l?St:pe,r.regl.texture({data:a,shape:[_e,_e,4],type:"float"})},_s=(e,n={})=>{if(!ke)return!1;if(Qe){const i=Ve;Ve=He,i.destroy()}else Ve=ke;return He=Ro(e,n),ho=r.regl.framebuffer({color:He,depth:!1,stencil:!1}),ke=void 0,!0},Ls=()=>!!(Ve&&He),Ds=()=>{Ve&&(Ve.destroy(),Ve=void 0),He&&(He.destroy(),He=void 0)},po=(e,n={})=>{ye=!1,Re=e.length,un=Re,ke&&ke.destroy(),ke=Ro(e,n),vt({usage:"static",type:"float",data:bo(Re)}),ie=new cr(e,i=>i[0],i=>i[1],16),ye=!0},Mo=(e,n)=>{kt=u.target,Vt=e,Ht=u.distance[0],Wt=n},bs=()=>kt!==void 0&&Vt!==void 0&&Ht!==void 0&&Wt!==void 0,Rs=()=>{kt=void 0,Vt=void 0,Ht=void 0,Wt=void 0},ps=e=>{const n=Ce==="inherit"?y:Ce;if(n==="segment"){const i=k.length-1;return i<1?[]:e.reduce((a,c,l)=>{let d=0;const S=[];for(let v=2;v<c.length;v+=2){const j=Math.sqrt((c[v-2]-c[v])**2+(c[v-1]-c[v+1])**2);S.push(j),d+=j}a[l]=[0];let L=0;for(let v=0;v<c.length/2-1;v++)L+=S[v],a[l].push(Math.floor(L/d*i)*4);return a},[])}if(n){const i=oo(n),a=Mn(pn(n),Ce==="inherit"?N:k);return ve.reduce((c,[l,d])=>(c[l]=a(d[i])*4,c),[])}return Array(ve.length).fill(0)},Ms=()=>{const e=Ie==="inherit"?ue:Ie;if(e==="segment"){const n=$.length-1;return n<1?[]:ve.reduce((i,[a,c,l])=>(i[a]=Xo(l,d=>$[Math.floor(d/(l-1)*n)]),i),[])}if(e){const n=oo(e),i=Ie==="inherit"?V:$,a=Mn(pn(e),i);return ve.reduce((c,[l,d])=>(c[l]=i[a(d[n])],c),[])}},Ns=()=>{const e=Fe==="inherit"?we:Fe;if(e==="segment"){const n=G.length-1;return n<1?[]:ve.reduce((i,[a,c,l])=>(i[a]=Xo(l,d=>G[Math.floor(d/(l-1)*n)]),i),[])}if(e){const n=oo(e),i=Fe==="inherit"?z:G,a=Mn(pn(e),i);return ve.reduce((c,[l,d])=>(c[l]=i[a(d[n])],c),[])}},Bs=e=>{ve=[];let n=0;Object.keys(e).forEach((i,a)=>{ve[i]=[a,e[i].reference,e[i].length/2,n],n+=e[i].length/2})},Mt=e=>new Promise(n=>{$e.setPoints([]),!e||!e.length?n():(mn=!0,gl(e,{maxIntPointsPerSegment:at,tolerance:ge}).then(i=>{Bs(i);const a=Object.values(i);$e.setPoints(a.length===1?a[0]:a,{colorIndices:ps(a),opacities:Ms(),widths:Ns()}),mn=!1,n()}))}),Fs=({preventEvent:e=!1}={})=>(se=!1,be.clear(),vt.subdata(bo(Re)),new Promise(n=>{const i=()=>{o.subscribe("draw",()=>{e||o.publish("unfilter"),n()},1),M=!0};Se||bt(ie.points[0])?Mt(Cn()).then(()=>{e||o.publish("pointConnectionsDraw"),i()}):i()})),No=(e,{preventEvent:n=!1}={})=>{const i=Array.isArray(e)?e:[e];se=!0,be.clear();const a=[],c=[];for(let l=i.length-1;l>=0;l--){const d=i[l];if(d<0||d>=Re){i.splice(l,1);continue}be.add(d),a.push.apply(a,Xt(d)),Pe.has(d)&&c.push(d)}return vt.subdata(a),xt(c,{preventEvent:n}),be.has(te)||Rt(-1,{preventEvent:n}),new Promise(l=>{const d=()=>{o.subscribe("draw",()=>{n||o.publish("filter",{points:i}),l()},1),M=!0};Se||bt(ie.points[0])?Mt(Cn()).then(()=>{n||o.publish("pointConnectionsDraw"),xt(c,{preventEvent:n}),d()}):d()})},Bo=()=>In(Pt[0],Pt[1],Ot[0],Ot[1]),$s=ui(()=>{un=Bo().length},$t),zs=e=>{const[n,i]=kt,[a,c]=Vt,l=1-e,d=n*l+a*e,S=i*l+c*e,L=Ht*l+Wt*e;u.lookAt([d,S],L)},Us=()=>Ls(),ks=()=>bs(),Vs=(e,n)=>{Lt||(Lt=performance.now());const i=performance.now()-Lt,a=vc(n(i/e),0,1);return Us()&&xs({t:a}),ks()&&zs(a),i<e},Hs=()=>{Qe=!1,Lt=null,xn=void 0,Tn=void 0,ce=yo,Ds(),Rs(),o.publish("transitionEnd")},$n=({duration:e=500,easing:n=ei})=>{Qe&&o.publish("transitionEnd"),Qe=!0,Lt=null,xn=e,Tn=so(n)?yr[n]||ei:n,yo=ce,ce=!1,o.publish("transitionStart")},Ws=e=>new Promise((n,i)=>{if(!e||Array.isArray(e))n(e);else{const a=Array.isArray(e.x)||ArrayBuffer.isView(e.x)?e.x.length:0,c=(Array.isArray(e.x)||ArrayBuffer.isView(e.x))&&(p=>e.x[p]),l=(Array.isArray(e.y)||ArrayBuffer.isView(e.y))&&(p=>e.y[p]),d=(Array.isArray(e.line)||ArrayBuffer.isView(e.line))&&(p=>e.line[p]),S=(Array.isArray(e.lineOrder)||ArrayBuffer.isView(e.lineOrder))&&(p=>e.lineOrder[p]),L=Object.keys(e),v=(()=>{const p=L.find(_=>yi.has(_));return p&&(Array.isArray(e[p])||ArrayBuffer.isView(e[p]))&&(_=>e[p][_])})(),j=(()=>{const p=L.find(_=>Ei.has(_));return p&&(Array.isArray(e[p])||ArrayBuffer.isView(e[p]))&&(_=>e[p][_])})();c&&l&&v&&j&&d&&S?n(e.x.map((p,_)=>[p,l(_),v(_),j(_),d(_),S(_)])):c&&l&&v&&j&&d?n(Array.from({length:a},(p,_)=>[c(_),l(_),v(_),j(_),d(_)])):c&&l&&v&&j?n(Array.from({length:a},(p,_)=>[c(_),l(_),v(_),j(_)])):c&&l&&v?n(Array.from({length:a},(p,_)=>[c(_),l(_),v(_)])):c&&l?n(Array.from({length:a},(p,_)=>[c(_),l(_)])):i(new Error("You need to specify at least x and y"))}}),Ys=(e,n={})=>P?Promise.reject(new Error("The instance was already destroyed")):Ws(e).then(i=>new Promise(a=>{if(P){a();return}let c=!1;(!n.preventFilterReset||(i==null?void 0:i.length)!==Re)&&(se=!1,be.clear());const l=i&&bt(i[0])&&(Se||n.showPointConnectionsOnce),{zDataType:d,wDataType:S}=n;i&&(n.transition&&(i.length===Re?c=_s(i,{z:d,w:S}):console.warn("Cannot transition! The number of points between the previous and current draw call must be identical.")),po(i,{z:d,w:S}),n.hover!==void 0&&Rt(n.hover,{preventEvent:!0}),n.select!==void 0&&xt(n.select,{preventEvent:!0}),n.filter!==void 0&&No(n.filter,{preventEvent:!0}),l&&Mt(i).then(()=>{o.publish("pointConnectionsDraw"),M=!0,Je=n.showReticleOnce})),n.transition&&c?(l?Promise.all([new Promise(L=>{o.subscribe("transitionEnd",()=>{M=!0,Je=n.showReticleOnce,L()},1)}),new Promise(L=>{o.subscribe("pointConnectionsDraw",L,1)})]).then(a):o.subscribe("transitionEnd",()=>{M=!0,Je=n.showReticleOnce,a()},1),$n({duration:n.transitionDuration,easing:n.transitionEasing})):(l?Promise.all([new Promise(L=>{o.subscribe("draw",L,1)}),new Promise(L=>{o.subscribe("pointConnectionsDraw",L,1)})]).then(a):o.subscribe("draw",a,1),M=!0,Je=n.showReticleOnce)})),Fo=e=>(...n)=>{const i=e(...n);return M=!0,i},Gs=e=>{let n=1/0,i=-1/0,a=1/0,c=-1/0;for(let l=0;l<e.length;l++){const[d,S]=ie.points[e[l]];n=Math.min(n,d),i=Math.max(i,d),a=Math.min(a,S),c=Math.max(c,S)}return{x:n,y:a,width:i-n,height:c-a}},$o=(e,n={})=>new Promise(i=>{const a=[e.x+e.width/2,e.y+e.height/2],c=2*Math.atan(1),l=e.height*ut>e.width?e.height/2/Math.tan(c/2):e.width/2/Math.tan(c*ut/2);n.transition?(u.config({isFixed:!0}),Mo(a,l),o.subscribe("transitionEnd",()=>{i(),u.config({isFixed:!1})},1),$n({duration:n.transitionDuration,easing:n.transitionEasing})):(u.lookAt(a,l),o.subscribe("draw",i,1),M=!0)}),Zs=(e,n={})=>{if(!ye)return Promise.reject(new Error(ni));const i=Gs(e),a=i.x+i.width/2,c=i.y+i.height/2,l=To(),d=1+(n.padding||0),S=Math.max(i.width,l)*d,L=Math.max(i.height,l)*d,v=a-S/2,j=c-L/2;return $o({x:v,y:j,width:S,height:L},n)},zo=(e,n,i={})=>new Promise(a=>{i.transition?(u.config({isFixed:!0}),Mo(e,n),o.subscribe("transitionEnd",()=>{a(),u.config({isFixed:!1})},1),$n({duration:i.transitionDuration,easing:i.transitionEasing})):(u.lookAt(e,n),o.subscribe("draw",a,1),M=!0)}),js=(e={})=>zo([0,0],1,e),Ks=e=>{if(!ye)throw new Error(ni);const n=ie.points[e];if(!n)return;const i=[n[0],n[1],0,1];Ye(s,dn,Ye(s,u.view,dt)),kn(i,i,s);const a=Ae*(i[0]+1)/2,c=Oe*(.5-i[1]/2);return[a,c]},zn=()=>{$e.setStyle({color:Po(k,Q,ee),opacity:$===null?null:$[0],width:G[0]})},Uo=()=>{const e=Math.round(b)>.5?0:255;X.initiator.style.border=`1px dashed rgba(${e}, ${e}, ${e}, 0.33)`,X.initiator.style.background=`rgba(${e}, ${e}, ${e}, 0.1)`},ko=()=>{const e=Math.round(b)>.5?0:255;X.longPressIndicator.style.color=`rgb(${e}, ${e}, ${e})`,X.longPressIndicator.dataset.color=`rgb(${e}, ${e}, ${e})`;const n=g.map(i=>Math.round(i*255));X.longPressIndicator.dataset.activeColor=`rgb(${n[0]}, ${n[1]}, ${n[2]})`},qs=e=>{e&&(D=fe(e,!0),b=ri(D),Uo(),ko())},Xs=e=>{e?so(e)?ii(r.regl,e).then(n=>{F=n,M=!0,o.publish("backgroundImageReady")}).catch(()=>{console.error(`Count not create texture from ${e}`),F=null}):e._reglType==="texture2d"?F=e:F=null:F=null},Js=e=>{e>0&&u.lookAt(u.target,e,u.rotation)},Qs=e=>{e!==null&&u.lookAt(u.target,u.distance[0],e)},ea=e=>{e&&u.lookAt(e,u.distance[0],u.rotation)},Vo=e=>{e&&u.setView(e)},ta=e=>{if(!e)return;g=fe(e,!0),U.setStyle({color:g});const n=g.map(i=>Math.round(i*255));X.longPressIndicator.dataset.activeColor=`rgb(${n[0]}, ${n[1]}, ${n[2]})`},na=e=>{Number.isNaN(+e)||+e<1||(T=+e,U.setStyle({width:T}))},oa=e=>{+e&&(w=+e,X.set({minDelay:w}))},ia=e=>{+e&&(A=+e,X.set({minDist:A}))},sa=e=>{I=oi(Er,I)(e)},aa=e=>{h=!!e,X.set({enableInitiator:h})},ra=e=>{ne=e,X.set({startInitiatorParentElement:ne})},ca=e=>{R=!!e},la=e=>{J=Number(e)},ua=e=>{de=Number(e)},fa=e=>{oe=Number(e)},da=e=>{re=Number(e)},ma=e=>{Ne=Object.entries(e).reduce((n,[i,a])=>(Pr.includes(i)&&Or.includes(a)&&(n[i]=a),n),{}),zt=ai(Ne),zt[rn]?u.config({isRotate:!0,mouseDownMoveModKey:zt[rn]}):u.config({isRotate:!1})},ga=e=>{Be=oi(gr,ao)(e),u.config({defaultMouseDownMoveAction:Be===mi?"rotate":"pan"})},ha=e=>{e!==null&&(ce=e)},ya=e=>{e&&(le=fe(e,!0),wt.setStyle({color:le}),At.setStyle({color:le}))},Ea=e=>{e&&(ae=e,Gt=e.domain()[0],Zt=e?e.domain()[1]-e.domain()[0]:0,ae.range([0,Ae]),ot())},xa=e=>{e&&(q=e,jt=q.domain()[0],Kt=q?q.domain()[1]-q.domain()[0]:0,q.range([Oe,0]),ot())},Ta=e=>{E=!!e},Sa=e=>{C=!!e},Ca=e=>{Se=!!e,Se?bt(ie.points[0])&&Mt(Cn()).then(()=>{o.publish("pointConnectionsDraw"),M=!0}):Mt()},Un=(e,n)=>i=>{if(i==="inherit")e([...n()]);else{const a=je(i)?i:[i];e(a.map(c=>fe(c,!0)))}zn()},Ia=Un(e=>{k=e},()=>N),wa=Un(e=>{Q=e},()=>W),Aa=Un(e=>{ee=e},()=>Y),Oa=e=>{Ge(e,Ze,{minLength:1})&&($=[...e]),en(+e)&&($=[+e]),k=k.map(n=>(n[3]=Number.isNaN(+$[0])?n[3]:+$[0],n)),zn()},Pa=e=>{!Number.isNaN(+e)&&+e&&(Ke=+e)},va=e=>{Ge(e,Ze,{minLength:1})&&(G=[...e]),en(+e)&&(G=[+e]),zn()},_a=e=>{!Number.isNaN(+e)&&+e&&(st=Math.max(0,e))},La=e=>{at=Math.max(0,e)},Da=e=>{ge=Math.max(0,e)},ba=e=>{rt=e,bn()},Ra=e=>{ct=+e},pa=e=>{It=+e},Ma=e=>{qe=+e},Na=e=>{r.gamma=e},Ba=e=>{if(no({property:!0}),e==="aspectRatio")return fn;if(e==="background"||e==="backgroundColor")return D;if(e==="backgroundImage")return F;if(e==="camera")return u;if(e==="cameraTarget")return u.target;if(e==="cameraDistance")return u.distance[0];if(e==="cameraRotation")return u.rotation;if(e==="cameraView")return u.view;if(e==="canvas")return x;if(e==="colorBy")return y;if(e==="sizeBy")return we;if(e==="deselectOnDblClick")return E;if(e==="deselectOnEscape")return C;if(e==="height")return me;if(e==="lassoColor")return g;if(e==="lassoLineWidth")return T;if(e==="lassoMinDelay")return w;if(e==="lassoMinDist")return A;if(e==="lassoClearEvent")return I;if(e==="lassoInitiator")return h;if(e==="lassoInitiatorElement")return X.initiator;if(e==="lassoInitiatorParentElement")return ne;if(e==="keyMap")return{...Ne};if(e==="mouseMode")return Be;if(e==="opacity")return V.length===1?V[0]:V;if(e==="opacityBy")return ue;if(e==="opacityByDensityFill")return ct;if(e==="opacityByDensityDebounceTime")return $t;if(e==="opacityInactiveMax")return It;if(e==="opacityInactiveScale")return qe;if(e==="points")return ie.points;if(e==="hoveredPoint")return te;if(e==="selectedPoints")return[...O];if(e==="filteredPoints")return se?Array.from(be):Array.from({length:ie.points.length},(n,i)=>i);if(e==="pointsInView")return Bo();if(e==="pointColor")return N.length===1?N[0]:N;if(e==="pointColorActive")return W.length===1?W[0]:W;if(e==="pointColorHover")return Y.length===1?Y[0]:Y;if(e==="pointOutlineWidth")return ze;if(e==="pointSize")return z.length===1?z[0]:z;if(e==="pointSizeSelected")return Le;if(e==="pointSizeMouseDetection")return rt;if(e==="showPointConnections")return Se;if(e==="pointConnectionColor")return k.length===1?k[0]:k;if(e==="pointConnectionColorActive")return Q.length===1?Q[0]:Q;if(e==="pointConnectionColorHover")return ee.length===1?ee[0]:ee;if(e==="pointConnectionColorBy")return Ce;if(e==="pointConnectionOpacity")return $.length===1?$[0]:$;if(e==="pointConnectionOpacityBy")return Ie;if(e==="pointConnectionOpacityActive")return Ke;if(e==="pointConnectionSize")return G.length===1?G[0]:G;if(e==="pointConnectionSizeActive")return st;if(e==="pointConnectionSizeBy")return Fe;if(e==="pointConnectionMaxIntPointsPerSegment")return at;if(e==="pointConnectionTolerance")return ge;if(e==="reticleColor")return le;if(e==="regl")return r.regl;if(e==="showReticle")return ce;if(e==="version")return hl;if(e==="width")return he;if(e==="xScale")return ae;if(e==="yScale")return q;if(e==="performanceMode")return lt;if(e==="gamma")return r.gamma;if(e==="renderer")return r;if(e==="isDestroyed")return P;if(e==="isPointsDrawn")return ye;if(e==="isPointsFiltered")return se;if(e==="zDataType")return et;if(e==="wDataType")return tt},Ho=(e={})=>(no(e),(e.backgroundColor!==void 0||e.background!==void 0)&&qs(e.backgroundColor||e.background),e.backgroundImage!==void 0&&Xs(e.backgroundImage),e.cameraTarget!==void 0&&ea(e.cameraTarget),e.cameraDistance!==void 0&&Js(e.cameraDistance),e.cameraRotation!==void 0&&Qs(e.cameraRotation),e.cameraView!==void 0&&Vo(e.cameraView),e.colorBy!==void 0&&zi(e.colorBy),e.pointColor!==void 0&&Li(e.pointColor),e.pointColorActive!==void 0&&Di(e.pointColorActive),e.pointColorHover!==void 0&&bi(e.pointColorHover),e.pointSize!==void 0&&Mi(e.pointSize),e.pointSizeSelected!==void 0&&Ni(e.pointSizeSelected),e.pointSizeMouseDetection!==void 0&&ba(e.pointSizeMouseDetection),e.sizeBy!==void 0&&ki(e.sizeBy),e.opacity!==void 0&&$i(e.opacity),e.showPointConnections!==void 0&&Ca(e.showPointConnections),e.pointConnectionColor!==void 0&&Ia(e.pointConnectionColor),e.pointConnectionColorActive!==void 0&&wa(e.pointConnectionColorActive),e.pointConnectionColorHover!==void 0&&Aa(e.pointConnectionColorHover),e.pointConnectionColorBy!==void 0&&Vi(e.pointConnectionColorBy),e.pointConnectionOpacityBy!==void 0&&Hi(e.pointConnectionOpacityBy),e.pointConnectionOpacity!==void 0&&Oa(e.pointConnectionOpacity),e.pointConnectionOpacityActive!==void 0&&Pa(e.pointConnectionOpacityActive),e.pointConnectionSize!==void 0&&va(e.pointConnectionSize),e.pointConnectionSizeActive!==void 0&&_a(e.pointConnectionSizeActive),e.pointConnectionSizeBy!==void 0&&Wi(e.pointConnectionSizeBy),e.pointConnectionMaxIntPointsPerSegment!==void 0&&La(e.pointConnectionMaxIntPointsPerSegment),e.pointConnectionTolerance!==void 0&&Da(e.pointConnectionTolerance),e.opacityBy!==void 0&&Ui(e.opacityBy),e.lassoColor!==void 0&&ta(e.lassoColor),e.lassoLineWidth!==void 0&&na(e.lassoLineWidth),e.lassoMinDelay!==void 0&&oa(e.lassoMinDelay),e.lassoMinDist!==void 0&&ia(e.lassoMinDist),e.lassoClearEvent!==void 0&&sa(e.lassoClearEvent),e.lassoInitiator!==void 0&&aa(e.lassoInitiator),e.lassoInitiatorParentElement!==void 0&&ra(e.lassoInitiatorParentElement),e.lassoOnLongPress!==void 0&&ca(e.lassoOnLongPress),e.lassoLongPressTime!==void 0&&la(e.lassoLongPressTime),e.lassoLongPressAfterEffectTime!==void 0&&ua(e.lassoLongPressAfterEffectTime),e.lassoLongPressEffectDelay!==void 0&&fa(e.lassoLongPressEffectDelay),e.lassoLongPressRevertEffectTime!==void 0&&da(e.lassoLongPressRevertEffectTime),e.keyMap!==void 0&&ma(e.keyMap),e.mouseMode!==void 0&&ga(e.mouseMode),e.showReticle!==void 0&&ha(e.showReticle),e.reticleColor!==void 0&&ya(e.reticleColor),e.pointOutlineWidth!==void 0&&Bi(e.pointOutlineWidth),e.height!==void 0&&pi(e.height),e.width!==void 0&&Fi(e.width),e.aspectRatio!==void 0&&_i(e.aspectRatio),e.xScale!==void 0&&Ea(e.xScale),e.yScale!==void 0&&xa(e.yScale),e.deselectOnDblClick!==void 0&&Ta(e.deselectOnDblClick),e.deselectOnEscape!==void 0&&Sa(e.deselectOnEscape),e.opacityByDensityFill!==void 0&&Ra(e.opacityByDensityFill),e.opacityInactiveMax!==void 0&&pa(e.opacityInactiveMax),e.opacityInactiveScale!==void 0&&Ma(e.opacityInactiveScale),e.gamma!==void 0&&Na(e.gamma),new Promise(n=>{window.requestAnimationFrame(()=>{x&&(_n(),u.refresh(),r.refresh(),M=!0,n())})})),Fa=(e,{preventEvent:n=!1}={})=>{Vo(e),M=!0,hn=n},Wo=()=>{u||(u=lr(x,{isPanInverted:[!1,!0]})),t.cameraView?u.setView(qo(t.cameraView)):t.cameraTarget||t.cameraDistance||t.cameraRotation?u.lookAt([...t.cameraTarget||Xr],t.cameraDistance||Jr,t.cameraRotation||Qr):u.setView(qo(ec)),Ot=We(1,1),Pt=We(-1,-1)},$a=({preventEvent:e=!1}={})=>{Wo(),ot(),!e&&o.publish("view",{view:u.view,camera:u,xScale:ae,yScale:q})},Yo=({key:e})=>{switch(e){case"Escape":C&&Jt();break}},Go=()=>{Et=!0,Dt=!0},Zo=()=>{Rt(),Et=!1,Dt=!0,M=!0},jo=()=>{M=!0},za=()=>{po([]),$e.clear()},Nt=()=>{u.refresh();const e=he===Me,n=me===Me;if(e||n){const{width:i,height:a}=x.getBoundingClientRect();e&&Rn(i),n&&Dn(a),_n(),M=!0}},Ua=()=>x.getContext("2d").getImageData(0,0,x.width,x.height),ka=()=>{_n(),Wo(),ot(),U=Qt(r.regl,{color:g,width:T,is2d:!0}),$e=Qt(r.regl,{color:k,colorHover:ee,colorActive:Q,opacity:$===null?null:$[0],width:G[0],widthActive:st,is2d:!0}),wt=Qt(r.regl,{color:le,width:1,is2d:!0}),At=Qt(r.regl,{color:le,width:1,is2d:!0}),bn(),x.addEventListener("wheel",jo),vt=r.regl.buffer(),En=r.regl.buffer(),_t=r.regl.buffer({usage:"dynamic",type:"float",length:mr*2}),gt=vn(),Yt=Pn();const e=Ho({backgroundImage:F,width:he,height:me,keyMap:Ne});Uo(),ko(),window.addEventListener("keyup",Yo,!1),window.addEventListener("blur",Oo,!1),window.addEventListener("mouseup",On,!1),window.addEventListener("mousemove",Ao,!1),x.addEventListener("mousedown",Co,!1),x.addEventListener("mouseenter",Go,!1),x.addEventListener("mouseleave",Zo,!1),x.addEventListener("click",Io,!1),x.addEventListener("dblclick",wo,!1),"ResizeObserver"in window?(Ut=new ResizeObserver(Nt),Ut.observe(x)):(window.addEventListener("resize",Nt),window.addEventListener("orientationchange",Nt)),e.then(()=>{o.publish("init")})},Va=r.onFrame(()=>{Sn=u.tick(),!(!ye||!(M||Qe))&&(Qe&&!Vs(xn,Tn)&&Hs(),Sn&&(Ot=We(1,1),Pt=We(-1,-1),ue==="density"&&$s()),r.render(()=>{const e=x.width/r.canvas.width,n=x.height/r.canvas.height;vi(e,n),F&&F._reglType&&Os(),Xe.length>2&&Ps(),Qe||$e.draw({projection:_o(),model:Do(),view:Lo()}),Ts(),!H&&(ce||Je)&&vs(),te>=0&&Ss(),O.length&&As(),U.draw({projection:_o(),model:Do(),view:Lo()})},x),Sn&&(ot(),hn?hn=!1:o.publish("view",{view:u.view,camera:u,xScale:ae,yScale:q})),M=!1,Je=!1,o.publish("draw"))}),Ha=()=>{M=!0},Wa=()=>{ye=!1,P=!0,Va(),window.removeEventListener("keyup",Yo,!1),window.removeEventListener("blur",Oo,!1),window.removeEventListener("mouseup",On,!1),window.removeEventListener("mousemove",Ao,!1),x.removeEventListener("mousedown",Co,!1),x.removeEventListener("mouseenter",Go,!1),x.removeEventListener("mouseleave",Zo,!1),x.removeEventListener("click",Io,!1),x.removeEventListener("dblclick",wo,!1),x.removeEventListener("wheel",jo,!1),Ut?Ut.disconnect():(window.removeEventListener("resize",Nt),window.removeEventListener("orientationchange",Nt)),x=void 0,u.dispose(),u=void 0,U.destroy(),X.destroy(),$e.destroy(),wt.destroy(),At.destroy(),t.renderer||r.destroy(),o.publish("destroy"),o.clear()};return ka(),{get isSupported(){return r.isSupported},clear:Fo(za),createTextureFromUrl:(e,n=mo)=>ii(r.regl,e,n),deselect:Jt,destroy:Wa,draw:Ys,filter:No,get:Ba,getScreenPosition:Ks,hover:Rt,redraw:Ha,refresh:r.refresh,reset:Fo($a),select:xt,set:Ho,export:Ua,subscribe:o.subscribe,unfilter:Fs,unsubscribe:o.unsubscribe,view:Fa,zoomToLocation:zo,zoomToArea:$o,zoomToPoints:Zs,zoomToOrigin:js}};function yl(t,o="file.txt"){const s=document.createElement("a");s.href=URL.createObjectURL(t),s.download=o,document.body.appendChild(s),s.dispatchEvent(new MouseEvent("click",{bubbles:!0,cancelable:!0,view:window})),document.body.removeChild(s)}function Al(t){const o=new Image;o.onload=()=>{t.get("canvas").toBlob(s=>{yl(s,"scatter.png")})},o.src=t.get("canvas").toDataURL()}function El(){const t=document.querySelector("#modal"),o=document.querySelector("#modal-text");t.style.display="none",o.textContent=""}function xl(t,o,s){const f=document.querySelector("#modal");f.style.display="flex";const m=document.querySelector("#modal-text");m.style.color=o?"#cc79A7":"#bbb",m.textContent=t;const r=document.querySelector("#modal-close");s?(r.style.display="block",r.style.background=o?"#cc79A7":"#bbb",r.addEventListener("click",El,{once:!0})):r.style.display="none"}function Ol(t){t.isSupported||xl("Your browser does not support all necessary WebGL features. The scatter plot might not render properly.",!0,!0)}export{Ol as a,xl as b,wl as c,El as d,_c as e,Al as s};
