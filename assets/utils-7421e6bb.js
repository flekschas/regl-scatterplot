import{g as Ei,h as oa,i as ia,l as sa,q as ra,j as aa,k as ca,m as la,p as ua,n as ut,w as fa,o as oi,t as xi,r as da,s as It,u as ma,f as ha,v as ga,x as ya,y as Ea,z as je,A as ln,C as Wt,D as xa,E as Qn,F as Ta,G as wa,H as ii,I as si}from"./vendor-fecc589d.js";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const d of document.querySelectorAll('link[rel="modulepreload"]'))m(d);new MutationObserver(d=>{for(const a of d)if(a.type==="childList")for(const L of a.addedNodes)L.tagName==="LINK"&&L.rel==="modulepreload"&&m(L)}).observe(document,{childList:!0,subtree:!0});function s(d){const a={};return d.integrity&&(a.integrity=d.integrity),d.referrerPolicy&&(a.referrerPolicy=d.referrerPolicy),d.crossOrigin==="use-credentials"?a.credentials="include":d.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function m(d){if(d.ep)return;d.ep=!0;const a=s(d);fetch(d.href,a)}})();/**
 * KDBush - A fast static index for 2D points
 * @license ISC License
 * @copyright Vladimir Agafonkin 2018
 * @version 4.0.2
 * @see https://github.com/mourner/kdbush/
 */const Ti=()=>{const t=[Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array],n=1,s=8;class m{static from(l){if(!(l instanceof ArrayBuffer))throw new Error("Data must be an instance of ArrayBuffer.");const[u,r]=new Uint8Array(l,0,2);if(u!==219)throw new Error("Data does not appear to be in a KDBush format.");const y=r>>4;if(y!==n)throw new Error(`Got v${y} data when expected v${n}.`);const w=t[r&15];if(!w)throw new Error("Unrecognized array type.");const[C]=new Uint16Array(l,2,1),[I]=new Uint32Array(l,4,1);return new m(I,C,w,l)}constructor(l,u=64,r=Float64Array,y){if(isNaN(l)||l<0)throw new Error(`Unexpected numItems value: ${l}.`);this.numItems=+l,this.nodeSize=Math.min(Math.max(+u,2),65535),this.ArrayType=r,this.IndexArrayType=l<65536?Uint16Array:Uint32Array;const w=t.indexOf(this.ArrayType),C=l*2*this.ArrayType.BYTES_PER_ELEMENT,I=l*this.IndexArrayType.BYTES_PER_ELEMENT,f=(8-I%8)%8;if(w<0)throw new Error(`Unexpected typed array class: ${r}.`);y&&y instanceof ArrayBuffer?(this.data=y,this.ids=new this.IndexArrayType(this.data,s,l),this.coords=new this.ArrayType(this.data,s+I+f,l*2),this._pos=l*2,this._finished=!0):(this.data=new ArrayBuffer(s+C+I+f),this.ids=new this.IndexArrayType(this.data,s,l),this.coords=new this.ArrayType(this.data,s+I+f,l*2),this._pos=0,this._finished=!1,new Uint8Array(this.data,0,2).set([219,(n<<4)+w]),new Uint16Array(this.data,2,1)[0]=u,new Uint32Array(this.data,4,1)[0]=l)}add(l,u){const r=this._pos>>1;return this.ids[r]=r,this.coords[this._pos++]=l,this.coords[this._pos++]=u,r}finish(){const l=this._pos>>1;if(l!==this.numItems)throw new Error(`Added ${l} items when expected ${this.numItems}.`);return d(this.ids,this.coords,this.nodeSize,0,this.numItems-1,0),this._finished=!0,this}range(l,u,r,y){if(!this._finished)throw new Error("Data not yet indexed - call index.finish().");const{ids:w,coords:C,nodeSize:I}=this,f=[0,w.length-1,0],P=[];for(;f.length;){const _=f.pop()||0,b=f.pop()||0,F=f.pop()||0;if(b-F<=I){for(let G=F;G<=b;G++){const se=C[2*G],re=C[2*G+1];se>=l&&se<=r&&re>=u&&re<=y&&P.push(w[G])}continue}const R=F+b>>1,$=C[2*R],q=C[2*R+1];$>=l&&$<=r&&q>=u&&q<=y&&P.push(w[R]),(_===0?l<=$:u<=q)&&(f.push(F),f.push(R-1),f.push(1-_)),(_===0?r>=$:y>=q)&&(f.push(R+1),f.push(b),f.push(1-_))}return P}within(l,u,r){if(!this._finished)throw new Error("Data not yet indexed - call index.finish().");const{ids:y,coords:w,nodeSize:C}=this,I=[0,y.length-1,0],f=[],P=r*r;for(;I.length;){const _=I.pop()||0,b=I.pop()||0,F=I.pop()||0;if(b-F<=C){for(let G=F;G<=b;G++)A(w[2*G],w[2*G+1],l,u)<=P&&f.push(y[G]);continue}const R=F+b>>1,$=w[2*R],q=w[2*R+1];A($,q,l,u)<=P&&f.push(y[R]),(_===0?l-r<=$:u-r<=q)&&(I.push(F),I.push(R-1),I.push(1-_)),(_===0?l+r>=$:u+r>=q)&&(I.push(R+1),I.push(b),I.push(1-_))}return f}}function d(h,l,u,r,y,w){if(y-r<=u)return;const C=r+y>>1;a(h,l,C,r,y,w),d(h,l,u,r,C-1,1-w),d(h,l,u,C+1,y,1-w)}function a(h,l,u,r,y,w){for(;y>r;){if(y-r>600){const P=y-r+1,_=u-r+1,b=Math.log(P),F=.5*Math.exp(2*b/3),R=.5*Math.sqrt(b*F*(P-F)/P)*(_-P/2<0?-1:1),$=Math.max(r,Math.floor(u-_*F/P+R)),q=Math.min(y,Math.floor(u+(P-_)*F/P+R));a(h,l,u,$,q,w)}const C=l[2*u+w];let I=r,f=y;for(L(h,l,r,u),l[2*y+w]>C&&L(h,l,r,y);I<f;){for(L(h,l,I,f),I++,f--;l[2*I+w]<C;)I++;for(;l[2*f+w]>C;)f--}l[2*r+w]===C?L(h,l,r,f):(f++,L(h,l,f,y)),f<=u&&(r=f+1),u<=f&&(y=f-1)}}function L(h,l,u,r){p(h,u,r),p(l,2*u,2*r),p(l,2*u+1,2*r+1)}function p(h,l,u){const r=h[l];h[l]=h[u],h[u]=r}function A(h,l,u,r){const y=h-u,w=l-r;return y*y+w*w}return m},Sa=()=>{addEventListener("message",t=>{const n=t.data.points;n.length||self.postMessage({error:new Error("Invalid point data")});const s=new KDBush(n.length,t.data.nodeSize);for(let m=0;m<n.length;++m)s.add(n[m][0],n[m][1]);s.finish(),postMessage(s.data,[s.data])})},eo=Ti(),Ca=1e6,Aa=t=>{let n=Ti.toString();n=n.substring(10,n.length-18);let s=t.toString();return s=s.substring(10,s.length-2),new Worker(window.URL.createObjectURL(new Blob([`${n};${s}`],{type:"text/javascript"})))},Ia=(t,n={nodeSize:16,useWorker:void 0})=>new Promise((s,m)=>{if(t instanceof ArrayBuffer)s(eo.from(t));else if((t.length<Ca||n.useWorker===!1)&&n.useWorker!==!0){const d=new eo(t.length,n.nodeSize);for(let a=0;a<t.length;++a)d.add(t[a][0],t[a][1]);d.finish(),s(d)}else{const d=Aa(Sa);d.onmessage=a=>{a.data.error?m(a.data.error):s(eo.from(a.data)),d.terminate()},d.postMessage({points:t,nodeSize:n.nodeSize})}}),Me="auto",Oa=0,to=1,La=2,ri=3,_a=4,Pa=Float32Array.BYTES_PER_ELEMENT,wi=["OES_texture_float","OES_element_index_uint","WEBGL_color_buffer_float","EXT_float_blend"],ai={color:[0,0,0,0],depth:1},To="panZoom",Si="lasso",Ci="rotate",va=[To,Si,Ci],pa=To,Da={cubicIn:oa,cubicInOut:Ei,cubicOut:ia,linear:sa,quadIn:ra,quadInOut:aa,quadOut:ca},ci=Ei,Re="continuous",Ot="categorical",li=[Re,Ot],Eo="deselect",wo="lassoEnd",ba=[Eo,wo],Ra=[0,.666666667,1,1],Ma=2,Na=!1,Fa=10,Ba=3,$a=wo,za=!1,dn=750,mn=500,hn=100,gn=250,So="lasso",yn="rotate",En="merge",Ua=[So,yn,En],Co="alt",Ao="cmd",Ai="ctrl",Ii="meta",Io="shift",ka=[Co,Ao,Ai,Ii,Io],Wa={[Co]:yn,[Io]:So,[Ao]:En},Va=1,Ha=Me,Ya=Me,Ga=1,no=1,Za=6,ja=2,Ka=2,oo=null,qa=2,Xa=2,io=null,Ja=null,so=null,Qa=.66,ec=1,ro=null,tc=.15,nc=25,oc=1,ic=1,Vt=null,sc=[.66,.66,.66,ec],rc=[0,.55,1,1],ac=[1,1,1,1],cc=[0,0,0,1],ao=null,lc=[.66,.66,.66,.2],uc=[0,.55,1,1],fc=[1,1,1,1],dc=[1,1,1,.5],mc=1,hc=1e3,gc=[0,0],yc=1,Ec=0,xc=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),Tc="IMAGE_LOAD_ERROR",wc=null,Sc=!1,Cc=[1,1,1,.5],Ac=!0,Ic=!0,Oc=!1,Lc=100,_c=1/500,Pc="auto",vc=!1,pc=200,Dc=500,Oi=new Set(["z","valueZ","valueA","value1","category"]),Li=new Set(["w","valueW","valueB","value2","value"]),Oo=15e3,bc=void 0,ui="Points have not been drawn",Rc=(t,n)=>t?wi.reduce((s,m)=>t.hasExtension(m)?s:(n||console.warn(`WebGL: ${m} extension not supported. Scatterplot might not render properly`),!1),!0):!1,Mc=t=>{const n=t.getContext("webgl",{antialias:!0,preserveDrawingBuffer:!0}),s=[];return wi.forEach(m=>{n.getExtension(m)?s.push(m):console.warn(`WebGL: ${m} extension not supported. Scatterplot might not render properly`)}),la({gl:n,extensions:s})},co=(t,n,s,m)=>Math.sqrt((t-s)**2+(n-m)**2),Nc=t=>{let n=1/0,s=-1/0,m=1/0,d=-1/0;for(let a=0;a<t.length;a+=2)n=t[a]<n?t[a]:n,s=t[a]>s?t[a]:s,m=t[a+1]<m?t[a+1]:m,d=t[a+1]>d?t[a+1]:d;return[n,m,s,d]},Fc=([t,n,s,m])=>Number.isFinite(t)&&Number.isFinite(n)&&Number.isFinite(s)&&Number.isFinite(m)&&s-t>0&&m-n>0,Bc=(t,n=!1)=>t.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(s,m,d,a)=>`#${m}${m}${d}${d}${a}${a}`).substring(1).match(/.{2}/g).map(s=>parseInt(s,16)/255**n),Ke=(t,n,{minLength:s=0}={})=>Array.isArray(t)&&t.length>=s&&t.every(n),qe=t=>!Number.isNaN(+t)&&+t>=0,un=t=>!Number.isNaN(+t)&&+t>0,fi=(t,n)=>s=>t.indexOf(s)>=0?s:n,$c=(t,n=!1,s=Oo)=>new Promise((m,d)=>{const a=new Image;n&&(a.crossOrigin="anonymous"),a.src=t,a.onload=()=>{m(a)};const L=()=>{d(new Error(Tc))};a.onerror=L,setTimeout(L,s)}),di=(t,n,s=Oo)=>new Promise((m,d)=>{$c(n,n.indexOf(window.location.origin)!==0&&n.indexOf("base64")===-1,s).then(a=>{m(t.texture(a))}).catch(a=>{d(a)})}),zc=(t,n=!1)=>[...Bc(t,n),255**!n],Uc=t=>/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(t),kc=t=>t>=0&&t<=1,xn=t=>Array.isArray(t)&&t.every(kc),Wc=(t,[n,s]=[])=>{let m,d,a,L,p=!1;for(let A=0,h=t.length-2;A<t.length;A+=2)m=t[A],d=t[A+1],a=t[h],L=t[h+1],d>s!=L>s&&n<(a-m)*(s-d)/(L-d)+m&&(p=!p),h=A;return p},xo=t=>typeof t=="string"||t instanceof String,Vc=t=>Number.isInteger(t)&&t>=0&&t<=255,_i=t=>Array.isArray(t)&&t.every(Vc),Hc=t=>t.length===3&&(xn(t)||_i(t)),Yc=t=>t.length===4&&(xn(t)||_i(t)),Xe=t=>Array.isArray(t)&&t.length&&(Array.isArray(t[0])||xo(t[0])),fn=(t,n)=>t>n?t:n,mi=(t,n)=>t<n?t:n,le=(t,n)=>{if(Yc(t)){const s=xn(t);return n&&s||!n&&!s?t:n&&!s?t.map(m=>m/255):t.map(m=>m*255)}if(Hc(t)){const s=255**!n,m=xn(t);return n&&m||!n&&!m?[...t,s]:n&&!m?[...t.map(d=>d/255),s]:[...t.map(d=>d*255),s]}return Uc(t)?zc(t,n):(console.warn("Only HEX, RGB, and RGBA are handled by this function. Returning white instead."),n?[1,1,1,1]:[255,255,255,255])},hi=t=>Object.entries(t).reduce((n,[s,m])=>(n[m]?n[m]=[...n[m],s]:n[m]=s,n),{}),gi=t=>.21*t[0]+.72*t[1]+.07*t[2],Gc=(t,n,s)=>Math.min(s,Math.max(n,t)),Zc=t=>new Promise((n,s)=>{if(!t||Array.isArray(t))n(t);else{const m=Array.isArray(t.x)||ArrayBuffer.isView(t.x)?t.x.length:0,d=(Array.isArray(t.x)||ArrayBuffer.isView(t.x))&&(u=>t.x[u]),a=(Array.isArray(t.y)||ArrayBuffer.isView(t.y))&&(u=>t.y[u]),L=(Array.isArray(t.line)||ArrayBuffer.isView(t.line))&&(u=>t.line[u]),p=(Array.isArray(t.lineOrder)||ArrayBuffer.isView(t.lineOrder))&&(u=>t.lineOrder[u]),A=Object.keys(t),h=(()=>{const u=A.find(r=>Oi.has(r));return u&&(Array.isArray(t[u])||ArrayBuffer.isView(t[u]))&&(r=>t[u][r])})(),l=(()=>{const u=A.find(r=>Li.has(r));return u&&(Array.isArray(t[u])||ArrayBuffer.isView(t[u]))&&(r=>t[u][r])})();d&&a&&h&&l&&L&&p?n(t.x.map((u,r)=>[u,a(r),h(r),l(r),L(r),p(r)])):d&&a&&h&&l&&L?n(Array.from({length:m},(u,r)=>[d(r),a(r),h(r),l(r),L(r)])):d&&a&&h&&l?n(Array.from({length:m},(u,r)=>[d(r),a(r),h(r),l(r)])):d&&a&&h?n(Array.from({length:m},(u,r)=>[d(r),a(r),h(r)])):d&&a?n(Array.from({length:m},(u,r)=>[d(r),a(r)])):s(new Error("You need to specify at least x and y"))}}),jc=t=>Number.isFinite(t.y)&&!("x"in t),Kc=t=>Number.isFinite(t.x)&&!("y"in t),qc=t=>Number.isFinite(t.x)&&Number.isFinite(t.y)&&Number.isFinite(t.width)&&Number.isFinite(t.height),Xc=t=>Number.isFinite(t.x1)&&Number.isFinite(t.y1)&&Number.isFinite(t.x2)&&Number.isFinite(t.x2),Jc=t=>"vertices"in t&&t.vertices.length>1,Qc=(t={})=>{let{regl:n,canvas:s=document.createElement("canvas"),gamma:m=Ga}=t,d=!1;n||(n=Mc(s));const a=Rc(n),L=[s.width,s.height],p=n.framebuffer({width:L[0],height:L[1],colorFormat:"rgba",colorType:"float"}),A=n({vert:`
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
      }`,attributes:{xy:[-4,-4,4,-4,0,4]},uniforms:{src:()=>p,srcRes:()=>L,gamma:()=>m},count:3,depth:{enable:!1},blend:{enable:!0,func:{srcRGB:"one",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}}}),h=f=>{const P=f.getContext("2d");P.clearRect(0,0,f.width,f.height),P.drawImage(s,(s.width-f.width)/2,(s.height-f.height)/2,f.width,f.height,0,0,f.width,f.height)},l=(f,P)=>{n.clear(ai),p.use(()=>{n.clear(ai),f()}),A(),h(P)},u=()=>{n.poll()},r=new Set,y=f=>(r.add(f),()=>{r.delete(f)}),w=n.frame(()=>{const f=r.values();let P=f.next();for(;!P.done;)P.value(),P=f.next()}),C=()=>{s.width=window.innerWidth*window.devicePixelRatio,s.height=window.innerHeight*window.devicePixelRatio,L[0]=s.width,L[1]=s.height,p.resize(...L)};return t.canvas||(window.addEventListener("resize",C),window.addEventListener("orientationchange",C),C()),{get canvas(){return s},get regl(){return n},get gamma(){return m},set gamma(f){m=+f},get isSupported(){return a},get isDestroyed(){return d},render:l,onFrame:y,refresh:u,destroy:()=>{d=!0,window.removeEventListener("resize",C),window.removeEventListener("orientationchange",C),w.cancel(),s=void 0,n.destroy(),n=void 0}}},el=!0,lo=8,yi=2,tl=2500,nl=250,ol=()=>{const t=document.createElement("div"),n=Math.random().toString(36).substring(2,5)+Math.random().toString(36).substring(2,5);t.id=`lasso-long-press-${n}`,t.style.position="fixed",t.style.width="1.25rem",t.style.height="1.25rem",t.style.pointerEvents="none",t.style.transform="translate(-50%,-50%)";const s=document.createElement("div");s.style.position="absolute",s.style.top=0,s.style.left=0,s.style.width="1.25rem",s.style.height="1.25rem",s.style.clipPath="inset(0px 0px 0px 50%)",s.style.opacity=0,t.appendChild(s);const m=document.createElement("div");m.style.position="absolute",m.style.top=0,m.style.left=0,m.style.width="0.8rem",m.style.height="0.8rem",m.style.border="0.2rem solid currentcolor",m.style.borderRadius="0.8rem",m.style.clipPath="inset(0px 50% 0px 0px)",m.style.transform="rotate(0deg)",s.appendChild(m);const d=document.createElement("div");d.style.position="absolute",d.style.top=0,d.style.left=0,d.style.width="0.8rem",d.style.height="0.8rem",d.style.border="0.2rem solid currentcolor",d.style.borderRadius="0.8rem",d.style.clipPath="inset(0px 50% 0px 0px)",d.style.transform="rotate(0deg)",s.appendChild(d);const a=document.createElement("div");return a.style.position="absolute",a.style.top=0,a.style.left=0,a.style.width="1.25rem",a.style.height="1.25rem",a.style.borderRadius="1.25rem",a.style.background="currentcolor",a.style.transform="scale(0)",a.style.opacity=0,t.appendChild(a),{longPress:t,longPressCircle:s,longPressCircleLeft:m,longPressCircleRight:d,longPressEffect:a}},il=(t,n,s)=>(1-t)*n+s,sl=(t,n)=>`${t}ms ease-out mainIn ${n}ms 1 normal forwards`,rl=(t,n)=>`${t}ms ease-out effectIn ${n}ms 1 normal forwards`,al=(t,n)=>`${t}ms linear leftSpinIn ${n}ms 1 normal forwards`,cl=(t,n)=>`${t}ms linear rightSpinIn ${n}ms 1 normal forwards`,ll=(t,n)=>`${t}ms linear circleIn ${n}ms 1 normal forwards`,ul=(t,n,s)=>`
  @keyframes mainIn {
    0% {
      color: ${n};
      opacity: 0;
    }
    0%, ${t}% {
      color: ${n};
      opacity: 1;
    }
    100% {
      color: ${s};
      opacity: 0.8;
    }
  }
`,fl=(t,n,s,m)=>`
  @keyframes effectIn {
    0%, ${t}% {
      opacity: ${s};
      transform: scale(${m});
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
`,dl=(t,n,s)=>`
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
`,ml=(t,n)=>`
  @keyframes leftSpinIn {
    0% {
      transform: rotate(${n}deg);
    }
    ${t}%, 100% {
      transform: rotate(360deg);
    }
  }
`,hl=(t,n)=>`
  @keyframes rightSpinIn {
    0% {
      transform: rotate(${n}deg);
    }
    ${t}%, 100% {
      transform: rotate(180deg);
    }
  }
`,gl=({time:t=dn,extraTime:n=mn,delay:s=hn,currentColor:m,targetColor:d,effectOpacity:a,effectScale:L,circleLeftRotation:p,circleRightRotation:A,circleClipPath:h,circleOpacity:l})=>{const u=p/360,r=il(u,t,n),y=Math.round((1-u)*t/r*100),w=Math.round(y/2),C=y+(100-y)/4;return{rules:{main:ul(y,m,d),effect:fl(y,C,a,L),circleRight:hl(w,A),circleLeft:ml(y,p),circle:dl(w,h,l)},names:{main:sl(r,s),effect:rl(r,s),circleLeft:al(r,s),circleRight:cl(r,s),circle:ll(r,s)}}},yl=t=>`${t}ms linear mainOut 0s 1 normal forwards`,El=t=>`${t}ms linear effectOut 0s 1 normal forwards`,xl=t=>`${t}ms linear leftSpinOut 0s 1 normal forwards`,Tl=t=>`${t}ms linear rightSpinOut 0s 1 normal forwards`,wl=t=>`${t}ms linear circleOut 0s 1 normal forwards`,Sl=(t,n)=>`
  @keyframes mainOut {
    0% {
      color: ${t};
    }
    100% {
      color: ${n};
    }
  }
`,Cl=(t,n)=>`
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
`,Al=(t,n)=>`
  @keyframes rightSpinOut {
    0%, ${t}% {
      transform: rotate(${n}deg);
    }
    100% {
      transform: rotate(0deg);
    }
`,Il=t=>`
  @keyframes leftSpinOut {
    0% {
      transform: rotate(${t}deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
`,Ol=(t,n,s)=>`
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
`,Ll=({time:t=gn,currentColor:n,targetColor:s,effectOpacity:m,effectScale:d,circleLeftRotation:a,circleRightRotation:L,circleClipPath:p,circleOpacity:A})=>{const h=a/360,l=h*t,u=Math.min(100,h*100),r=u>50?Math.round((1-50/u)*100):0;return{rules:{main:Sl(n,s),effect:Cl(m,d),circleRight:Al(r,L),circleLeft:Il(a),circle:Ol(r,p,A)},names:{main:yl(l),effect:El(l),circleRight:xl(l),circleLeft:Tl(l),circle:wl(l)}}},Ht=(t,n=null)=>t===null?n:t;let uo;const Pi=()=>{if(!uo){const t=document.createElement("style");document.head.appendChild(t),uo=t.sheet}return uo},Ee=t=>{const n=Pi(),s=n.rules.length;return n.insertRule(t,s),s},xe=t=>{Pi().deleteRule(t)},_l=`${tl}ms ease scaleInFadeOut 0s 1 normal backwards`,Pl=(t,n,s)=>`
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
`;let fo=null;const vl=`${nl}ms ease fadeScaleOut 0s 1 normal backwards`,pl=(t,n,s)=>`
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
`;let mo=null;const vi=(t,{onDraw:n=ut,onStart:s=ut,onEnd:m=ut,enableInitiator:d=el,initiatorParentElement:a=document.body,longPressIndicatorParentElement:L=document.body,minDelay:p=lo,minDist:A=yi,pointNorm:h=ut}={})=>{let l=d,u=a,r=L,y=n,w=s,C=m,I=h;const f=document.createElement("div"),P=Math.random().toString(36).substring(2,5)+Math.random().toString(36).substring(2,5);f.id=`lasso-initiator-${P}`,f.style.position="fixed",f.style.display="flex",f.style.justifyContent="center",f.style.alignItems="center",f.style.zIndex=99,f.style.width="4rem",f.style.height="4rem",f.style.borderRadius="4rem",f.style.opacity=.5,f.style.transform="translate(-50%,-50%) scale(0) rotate(0deg)";const{longPress:_,longPressCircle:b,longPressCircleLeft:F,longPressCircleRight:R,longPressEffect:$}=ol();let q=!1,G=!1,se=[],re=[],z,Z=!1,X=null,we=null,W=null,ne=null,oe=null,Se=null,U=null,Ce=null,Je=null,J=null;const ft=()=>{q=!1},Ne=v=>{const{left:M,top:N}=t.getBoundingClientRect();return[v.clientX-M,v.clientY-N]};window.addEventListener("mouseup",ft);const dt=()=>{f.style.opacity=.5,f.style.transform="translate(-50%,-50%) scale(0) rotate(0deg)"},ge=(v,M)=>{const N=getComputedStyle(v),ce=+N.opacity,Q=N.transform.match(/([0-9.-]+)+/g),j=+Q[0],S=+Q[1],H=Math.sqrt(j*j+S*S);let Y=Math.atan2(S,j)*(180/Math.PI);return Y=M&&Y<=0?360+Y:Y,{opacity:ce,scale:H,rotate:Y}},k=v=>{if(!l||q)return;const M=v.clientX,N=v.clientY;f.style.top=`${N}px`,f.style.left=`${M}px`;const ce=ge(f),Q=ce.opacity,j=ce.scale,S=ce.rotate;f.style.opacity=Q,f.style.transform=`translate(-50%,-50%) scale(${j}) rotate(${S}deg)`,f.style.animation="none",It().then(()=>{fo!==null&&xe(fo),fo=Ee(Pl(Q,j,S)),f.style.animation=_l,It().then(()=>{dt()})})},pe=()=>{const{opacity:v,scale:M,rotate:N}=ge(f);f.style.opacity=v,f.style.transform=`translate(-50%,-50%) scale(${M}) rotate(${N}deg)`,f.style.animation="none",It(2).then(()=>{mo!==null&&xe(mo),mo=Ee(pl(v,M,N)),f.style.animation=vl,It().then(()=>{dt()})})},mt=(v,M,{time:N=dn,extraTime:ce=mn,delay:Q=hn}={time:dn,extraTime:mn,delay:hn})=>{Z=!0;const j=getComputedStyle(_);_.style.color=j.color,_.style.top=`${M}px`,_.style.left=`${v}px`,_.style.animation="none";const S=getComputedStyle(b);b.style.clipPath=S.clipPath,b.style.opacity=S.opacity,b.style.animation="none";const H=ge($);$.style.opacity=H.opacity,$.style.transform=`scale(${H.scale})`,$.style.animation="none";const Y=ge(F);F.style.transform=`rotate(${Y.rotate}deg)`,F.style.animation="none";const De=ge(R);R.style.transform=`rotate(${De.rotate}deg)`,R.style.animation="none",It().then(()=>{if(!Z)return;oe!==null&&xe(oe),ne!==null&&xe(ne),W!==null&&xe(W),we!==null&&xe(we),X!==null&&xe(X);const{rules:ke,names:Fe}=gl({time:N,extraTime:ce,delay:Q,currentColor:j.color||"currentcolor",targetColor:_.dataset.activeColor,effectOpacity:H.opacity||0,effectScale:H.scale||0,circleLeftRotation:Y.rotate||0,circleRightRotation:De.rotate||0,circleClipPath:S.clipPath||"inset(0 0 0 50%)",circleOpacity:S.opacity||0});X=Ee(ke.main),we=Ee(ke.effect),W=Ee(ke.circleLeft),ne=Ee(ke.circleRight),oe=Ee(ke.circle),_.style.animation=Fe.main,$.style.animation=Fe.effect,F.style.animation=Fe.circleLeft,R.style.animation=Fe.circleRight,b.style.animation=Fe.circle})},ze=({time:v=gn}={time:gn})=>{if(!Z)return;Z=!1;const M=getComputedStyle(_);_.style.color=M.color,_.style.animation="none";const N=getComputedStyle(b);b.style.clipPath=N.clipPath,b.style.opacity=N.opacity,b.style.animation="none";const ce=ge($);$.style.opacity=ce.opacity,$.style.transform=`scale(${ce.scale})`,$.style.animation="none";const Q=N.clipPath.slice(-2,-1)==="x",j=ge(F,Q);F.style.transform=`rotate(${j.rotate}deg)`,F.style.animation="none";const S=ge(R);R.style.transform=`rotate(${S.rotate}deg)`,R.style.animation="none",It().then(()=>{J!==null&&xe(J),Je!==null&&xe(Je),Ce!==null&&xe(Ce),U!==null&&xe(U),Se!==null&&xe(Se);const{rules:H,names:Y}=Ll({time:v,currentColor:M.color||"currentcolor",targetColor:_.dataset.color,effectOpacity:ce.opacity||0,effectScale:ce.scale||0,circleLeftRotation:j.rotate||0,circleRightRotation:S.rotate||0,circleClipPath:N.clipPath||"inset(0px)",circleOpacity:N.opacity||1});Se=Ee(H.main),U=Ee(H.effect),Ce=Ee(H.circleLeft),Je=Ee(H.circleRight),J=Ee(H.circle),_.style.animation=Y.main,$.style.animation=Y.effect,F.style.animation=Y.circleLeft,R.style.animation=Y.circleRight,b.style.animation=Y.circle})},V=()=>{y(se,re)},de=v=>{if(z){if(ma(v[0],v[1],z[0],z[1])>yi){z=v;const N=I(v);se.push(N),re.push(N[0],N[1]),se.length>1&&V()}}else{G||(G=!0,w()),z=v;const M=I(v);se=[M],re=[M[0],M[1]]}},ht=xi(de,lo,lo),Lt=(v,M)=>{const N=Ne(v);return M?ht(N):de(N)},Qe=()=>{se=[],re=[],z=void 0,V()},Ae=v=>{k(v)},he=()=>{q=!0,G=!0,Qe(),w()},ye=()=>{pe()},gt=({merge:v=!1}={})=>{G=!1;const M=[...se],N=[...re];return ht.cancel(),Qe(),M.length&&C(M,N,{merge:v}),M},et=({onDraw:v=null,onStart:M=null,onEnd:N=null,enableInitiator:ce=null,initiatorParentElement:Q=null,longPressIndicatorParentElement:j=null,minDelay:S=null,minDist:H=null,pointNorm:Y=null}={})=>{y=Ht(v,y),w=Ht(M,w),C=Ht(N,C),l=Ht(ce,l),I=Ht(Y,I),Q!==null&&Q!==u&&(u.removeChild(f),Q.appendChild(f),u=Q),j!==null&&j!==r&&(r.removeChild(_),j.appendChild(_),r=j),l?(f.addEventListener("click",Ae),f.addEventListener("mousedown",he),f.addEventListener("mouseleave",ye)):(f.removeEventListener("mousedown",he),f.removeEventListener("mouseleave",ye))},Ue=()=>{u.removeChild(f),r.removeChild(_),window.removeEventListener("mouseup",ft),f.removeEventListener("click",Ae),f.removeEventListener("mousedown",he),f.removeEventListener("mouseleave",ye)},Ie=()=>v=>da(v,{clear:Qe,destroy:Ue,end:gt,extend:Lt,set:et,showInitiator:k,hideInitiator:pe,showLongPressIndicator:mt,hideLongPressIndicator:ze});return u.appendChild(f),r.appendChild(_),et({onDraw:y,onStart:w,onEnd:C,enableInitiator:l,initiatorParentElement:u}),ua(oi("initiator",f),oi("longPressIndicator",_),Ie(),fa(vi))({})},Dl=`
precision mediump float;

uniform sampler2D texture;

varying vec2 uv;

void main () {
  gl_FragColor = texture2D(texture, uv);
}
`,bl=`
precision mediump float;

uniform mat4 modelViewProjection;

attribute vec2 position;

varying vec2 uv;

void main () {
  uv = position;
  gl_Position = modelViewProjection * vec4(-1.0 + 2.0 * uv.x, 1.0 - 2.0 * uv.y, 0, 1);
}
`,Rl=`
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
`,Ml=`precision highp float;

varying vec4 color;

void main() {
  gl_FragColor = color;
}
`,Nl=t=>`
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
`,Fl=`precision highp float;

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
}`,Bl=`precision highp float;

attribute vec2 position;
varying vec2 particleTextureIndex;

void main() {
  // map normalized device coords to texture coords
  particleTextureIndex = 0.5 * (1.0 + position);

  gl_Position = vec4(position, 0, 1);
}`,$l=function(){const n=(h,l,u,r,y)=>{const w=(r-l)*.5,C=(y-u)*.5;return(2*u-2*r+w+C)*h*h*h+(-3*u+3*r-2*w-C)*h*h+w*h+u},s=(h,l,u)=>{const r=u*h,y=Math.floor(r),w=r-y,C=l[Math.max(0,y-1)],I=l[y],f=l[Math.min(u,y+1)],P=l[Math.min(u,y+2)];return[n(w,C[0],I[0],f[0],P[0]),n(w,C[1],I[1],f[1],P[1])]},m=(h,l,u,r)=>(h-u)**2+(l-r)**2;/**
 * Douglas Peucker square segment distance
 * Implementation from https://github.com/mourner/simplify-js
 * @author Vladimir Agafonkin
 * @copyright Vladimir Agafonkin 2013
 * @license BSD
 * @param {array} p - Point
 * @param {array} p1 - First boundary point
 * @param {array} p2 - Second boundary point
 * @return {number} Distance
 */const d=(h,l,u)=>{let r=l[0],y=l[1],w=u[0]-r,C=u[1]-y;if(w!==0||C!==0){const I=((h[0]-r)*w+(h[1]-y)*C)/(w*w+C*C);I>1?(r=u[0],y=u[1]):I>0&&(r+=w*I,y+=C*I)}return w=h[0]-r,C=h[1]-y,w*w+C*C};/**
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
 */const a=(h,l,u,r,y)=>{let w=r,C;for(let I=l+1;I<u;I++){const f=d(h[I],h[l],h[u]);f>w&&(C=I,w=f)}w>r&&(C-l>1&&a(h,l,C,r,y),y.push(h[C]),u-C>1&&a(h,C,u,r,y))};/**
 * Douglas Peucker. Implementation from https://github.com/mourner/simplify-js
 * @author Vladimir Agafonkin
 * @copyright Vladimir Agafonkin 2013
 * @license BSD
 * @param {array} points - List of points to be simplified
 * @param {number} tolerance - Tolerance level. Points below this distance level will be ignored
 * @return {array} Simplified point list
 */const L=(h,l)=>{const u=h.length-1,r=[h[0]];return a(h,0,u,l,r),r.push(h[u]),r},p=(h,{maxIntPointsPerSegment:l=100,tolerance:u=.002}={})=>{const r=h.length,y=r-1,w=y*l+1,C=u**2;let I=[],f;for(let P=0;P<r-1;P++){let _=[h[P].slice(0,2)];f=h[P];for(let b=1;b<l;b++){const F=(P*l+b)/w,R=s(F,h,y);m(f[0],f[1],R[0],R[1])>C&&(_.push(R),f=R)}_.push(h[P+1]),_=L(_,C),I=I.concat(_.slice(0,_.length-1))}return I.push(h[h.length-1].slice(0,2)),I.flat()},A=h=>{const l={},u=!Number.isNaN(+h[0][5]);return h.forEach(r=>{const y=r[4];l[y]||(l[y]=[]),u?l[y][r[5]]=r:l[y].push(r)}),Object.entries(l).forEach(r=>{l[r[0]]=r[1].filter(y=>y),l[r[0]].reference=r[1][0]}),l};self.onmessage=function(l){(l.data.points?+l.data.points.length:0)||self.postMessage({error:new Error("No points provided")}),l.data.points;const r=A(l.data.points);self.postMessage({points:Object.entries(r).reduce((y,w)=>(y[w[0]]=p(w[1],l.data.options),y[w[0]].reference=w[1].reference,y),{})})}},zl=(t,n={tolerance:.002,maxIntPointsPerSegment:100})=>new Promise((s,m)=>{const d=ha($l);d.onmessage=a=>{a.data.error?m(a.data.error):s(a.data.points),d.terminate()},d.postMessage({points:t,options:n})}),Ul="1.9.6",ho={showRecticle:"showReticle",recticleColor:"reticleColor"},go=t=>{Object.keys(t).filter(n=>ho[n]).forEach(n=>{console.warn(`regl-scatterplot: the "${n}" property is deprecated. Please use "${ho[n]}" instead.`),t[ho[n]]=t[n],delete t[n]})},Te=(t,n,{allowSegment:s=!1,allowDensity:m=!1,allowInherit:d=!1}={})=>Oi.has(t)?"valueZ":Li.has(t)?"valueW":t==="segment"?s?"segment":n:t==="density"?m?"density":n:t==="inherit"&&d?"inherit":n,yo=t=>{switch(t){case"valueZ":return 2;case"valueW":return 3;default:return null}},jl=(t={})=>{const n=ga({async:!t.syncEvents,caseInsensitive:!0}),s=new Float32Array(16),m=new Float32Array(16),d=[0,0];go(t);let{renderer:a,backgroundColor:L=cc,backgroundImage:p=wc,canvas:A=document.createElement("canvas"),colorBy:h=Vt,deselectOnDblClick:l=Ac,deselectOnEscape:u=Ic,lassoColor:r=Ra,lassoLineWidth:y=Ma,lassoMinDelay:w=Fa,lassoMinDist:C=Ba,lassoClearEvent:I=$a,lassoInitiator:f=Na,lassoInitiatorParentElement:P=document.body,lassoOnLongPress:_=za,lassoLongPressTime:b=dn,lassoLongPressAfterEffectTime:F=mn,lassoLongPressEffectDelay:R=hn,lassoLongPressRevertEffectTime:$=gn,keyMap:q=Wa,mouseMode:G=pa,showReticle:se=Sc,reticleColor:re=Cc,pointColor:z=sc,pointColorActive:Z=rc,pointColorHover:X=ac,showPointConnections:we=Oc,pointConnectionColor:W=lc,pointConnectionColorActive:ne=uc,pointConnectionColorHover:oe=fc,pointConnectionColorBy:Se=ao,pointConnectionOpacity:U=Ja,pointConnectionOpacityBy:Ce=so,pointConnectionOpacityActive:Je=Qa,pointConnectionSize:J=qa,pointConnectionSizeActive:ft=Xa,pointConnectionSizeBy:Ne=io,pointConnectionMaxIntPointsPerSegment:dt=Lc,pointConnectionTolerance:ge=_c,pointSize:k=Za,pointSizeSelected:pe=ja,pointSizeMouseDetection:mt=Pc,pointOutlineWidth:ze=Ka,opacity:V=Me,opacityBy:de=ro,opacityByDensityFill:ht=tc,opacityInactiveMax:Lt=oc,opacityInactiveScale:Qe=ic,sizeBy:Ae=oo,height:he=Ya,width:ye=Ha,annotationLineColor:gt=dc,annotationLineWidth:et=mc,annotationHVLineLimit:Ue=hc}=t,Ie=ye===Me?1:ye,v=he===Me?1:he;const{performanceMode:M=vc,opacityByDensityDebounceTime:N=nc,spatialIndexUseWorker:ce=bc}=t;a||(a=Qc({regl:t.regl,gamma:t.gamma})),L=le(L,!0),r=le(r,!0),re=le(re,!0);let Q=!1,j=gi(L),S,H,Y,De=!1,ke=null,Fe=[0,0],Oe=-1,K=[];const We=new Set,Yt=new Set;let be=!1;const Le=new Set;let ue=[],_e=0,Tn=0,Ve=!1,tt=[],_t,Pt,Gt=t.aspectRatio||Va,wn,yt,nt,Be,Pe,Sn,vt,pt,Cn,Zt=hi(q),Et,Dt,bt,An=!1,B=!0,ot=!1,jt;z=Xe(z)?[...z]:[z],Z=Xe(Z)?[...Z]:[Z],X=Xe(X)?[...X]:[X],z=z.map(e=>le(e,!0)),Z=Z.map(e=>le(e,!0)),X=X.map(e=>le(e,!0)),V=!Array.isArray(V)&&Number.isNaN(+V)?z[0][3]:V,V=Ke(V,qe,{minLength:1})?[...V]:[V],k=Ke(k,qe,{minLength:1})?[...k]:[k];let Lo=no/k[0];W==="inherit"?W=[...z]:(W=Xe(W)?[...W]:[W],W=W.map(e=>le(e,!0))),ne==="inherit"?ne=[...Z]:(ne=Xe(ne)?[...ne]:[ne],ne=ne.map(e=>le(e,!0))),oe==="inherit"?oe=[...X]:(oe=Xe(oe)?[...oe]:[oe],oe=oe.map(e=>le(e,!0))),U==="inherit"?U=[...V]:U=Ke(U,qe,{minLength:1})?[...U]:[U],J==="inherit"?J=[...k]:J=Ke(J,qe,{minLength:1})?[...J]:[J],h=Te(h,Vt),de=Te(de,ro,{allowDensity:!0}),Ae=Te(Ae,oo),Se=Te(Se,ao,{allowSegment:!0,allowInherit:!0}),Ce=Te(Ce,so,{allowSegment:!0}),Ne=Te(Ne,io,{allowSegment:!0});let He,Ye,Ge,_o,ve=0,In=0,Rt,On,Mt,Kt,qt,Xt,Jt,it=!1,Nt=null,Ln,_n,Po=se,xt,Tt=0,Qt,wt=0,Pn=!1,me=!1,St=!1,Ft=!1,st=Ot,rt=Ot,ie,Ct=!1,fe=t.xScale||null,ee=t.yScale||null,en=0,tn=0,nn=0,on=0;fe&&(en=fe.domain()[0],tn=fe.domain()[1]-fe.domain()[0],fe.range([0,Ie])),ee&&(nn=ee.domain()[0],on=ee.domain()[1]-ee.domain()[0],ee.range([v,0]));const vo=e=>-1+e/Ie*2,po=e=>1+e/v*-2,pi=()=>[vo(d[0]),po(d[1])],Ze=(e,o)=>{const i=[e,o,1,1],c=xa(s,je(s,wn,je(s,S.view,nt)));return ln(i,i,c),i.slice(0,2)},Do=(e=0)=>{const o=Kn(),c=(Dt[1]-bt[1])/A.height;return(Cn*o+e)*c},vn=()=>be?ue.filter((e,o)=>Le.has(o)):ue,pn=(e,o,i,c)=>{const g=_t.range(e,o,i,c);return be?g.filter(T=>Le.has(T)):g},bo=()=>{const[e,o]=pi(),[i,c]=Ze(e,o),g=Do(4),T=pn(i-g,c-g,i+g,c+g);let x=g,O=-1;return T.forEach(E=>{const[D,ae]=ue[E],$e=co(D,ae,i,c);$e<x&&(x=$e,O=E)}),O},Di=(e,o)=>{tt=e,H.setPoints(o),n.publish("lassoExtend",{coordinates:e})},bi=e=>{const o=Nc(e);if(!Fc(o))return[];const i=pn(...o),c=[];return i.forEach(g=>{Wc(e,ue[g])&&c.push(g)}),c},sn=()=>{tt=[],H&&H.clear()},Bt=e=>e&&e.length>4,at=(e,o)=>{if(Sn||!we||!Bt(ue[e[0]]))return;const i=o===0,c=o===1?x=>Yt.add(x):ut,g=Object.keys(e.reduce((x,O)=>{const E=ue[O],ae=Array.isArray(E[4])?E[4][0]:E[4];return x[ae]=!0,x},{})),T=Be.getData().opacities;g.filter(x=>!Yt.has(+x)).forEach(x=>{const O=Pe[x][0],E=Pe[x][2],D=Pe[x][3],ae=O*4+D*2,$e=ae+E*2+4;T.__original__===void 0&&(T.__original__=T.slice());for(let cn=ae;cn<$e;cn++)T[cn]=i?T.__original__[cn]:Je;c(x)}),Be.getBuffer().opacities.subdata(T,0)},rn=e=>[e%ve/ve+In,Math.floor(e/ve)/ve+In],Ri=e=>be&&!Le.has(e),an=({preventEvent:e=!1}={})=>{I===Eo&&sn(),K.length&&(e||n.publish("deselect"),Yt.clear(),at(K,0),K=[],We.clear(),B=!0)},At=(e,{merge:o=!1,preventEvent:i=!1}={})=>{const c=Array.isArray(e)?e:[e],g=[...K];if(o){if(K=ya(K,c),g.length===K.length){B=!0;return}}else{if(K&&K.length&&at(K,0),g.length>0&&c.length===0){an({preventEvent:i});return}K=c}if(Ea(g,K)){B=!0;return}const T=[];We.clear(),Yt.clear();for(let x=K.length-1;x>=0;x--){const O=K[x];if(O<0||O>=_e||Ri(O)){K.splice(x,1);continue}We.add(O),T.push.apply(T,rn(O))}On({usage:"dynamic",type:"float",data:T}),at(K,1),i||n.publish("select",{points:K}),B=!0},$t=(e,{showReticleOnce:o=!1,preventEvent:i=!1}={})=>{let c=!1;if(!(be&&!Le.has(e))&&e>=0&&e<_e){c=!0;const T=ie,x=e!==ie;+T>=0&&x&&!We.has(T)&&at([T],0),ie=e,Mt.subdata(rn(e)),We.has(e)||at([e],2),x&&!i&&n.publish("pointover",ie)}else c=+ie>=0,c&&(We.has(ie)||at([ie],0),i||n.publish("pointout",ie)),ie=void 0;c&&(B=!0,ot=o)},Dn=e=>{const o=A.getBoundingClientRect();return d[0]=e.clientX-o.left,d[1]=e.clientY-o.top,[...d]},te=vi(A,{onStart:()=>{S.config({isFixed:!0}),De=!0,Ve=!0,sn(),Oe>=0&&(clearTimeout(Oe),Oe=-1),n.publish("lassoStart")},onDraw:Di,onEnd:(e,o,{merge:i=!1}={})=>{S.config({isFixed:!1}),tt=[...e];const c=bi(o);At(c,{merge:i}),n.publish("lassoEnd",{coordinates:tt}),I===wo&&sn()},enableInitiator:f,initiatorParentElement:P,pointNorm:([e,o])=>Ze(vo(e),po(o))}),Mi=()=>G===Si,bn=(e,o)=>{switch(Zt[o]){case Co:return e.altKey;case Ao:return e.metaKey;case Ai:return e.ctrlKey;case Ii:return e.metaKey;case Io:return e.shiftKey;default:return!1}},Ni=e=>document.elementsFromPoint(e.clientX,e.clientY).some(o=>o===A),Ro=e=>{!me||e.buttons!==1||(De=!0,ke=performance.now(),Fe=Dn(e),Ve=Mi()||bn(e,So),!Ve&&_&&(te.showLongPressIndicator(e.clientX,e.clientY,{time:b,extraTime:F,delay:R}),Oe=setTimeout(()=>{Oe=-1,Ve=!0},b)))},Rn=e=>{me&&(De=!1,Oe>=0&&(clearTimeout(Oe),Oe=-1),Ve&&(e.preventDefault(),Ve=!1,te.end({merge:bn(e,En)})),_&&te.hideLongPressIndicator({time:$}))},Mo=e=>{if(!me)return;e.preventDefault();const o=Dn(e);if(co(...o,...Fe)>=C)return;const i=performance.now()-ke;if(!f||i<Dc){const c=bo();c>=0?(K.length&&I===Eo&&sn(),At([c],{merge:bn(e,En)})):Et||(Et=setTimeout(()=>{Et=null,te.showInitiator(e)},pc))}},No=e=>{te.hideInitiator(),Et&&(clearTimeout(Et),Et=null),l&&(e.preventDefault(),an())},Fo=e=>{if(Ft||(Ct=Ni(e),Ft=!0),!me||!Ct&&!De)return;const o=Dn(e),c=co(...o,...Fe)>=C;Ct&&!Ve&&$t(bo()),Ve?(e.preventDefault(),te.extend(e,!0)):De&&_&&c&&te.hideLongPressIndicator({time:$}),Oe>=0&&c&&(clearTimeout(Oe),Oe=-1),De&&(B=!0)},Bo=()=>{ie=void 0,Ct=!1,Ft=!1,me&&(+ie>=0&&!We.has(ie)&&at([ie],0),Rn(),B=!0)},Mn=()=>{const e=Math.max(k.length,V.length);wt=Math.max(2,Math.ceil(Math.sqrt(e)));const o=new Float32Array(wt**2*4);for(let i=0;i<e;i++){o[i*4]=k[i]||0,o[i*4+1]=Math.min(1,V[i]||0);const c=Number((Z[i]||Z[0])[3]);o[i*4+2]=Math.min(1,Number.isNaN(c)?1:c);const g=Number((X[i]||X[0])[3]);o[i*4+3]=Math.min(1,Number.isNaN(g)?1:g)}return a.regl.texture({data:o,shape:[wt,wt,4],type:"float"})},Nn=(e=z,o=Z,i=X)=>{const c=e.length,g=o.length,T=i.length,x=[];if(c===g&&g===T)for(let O=0;O<c;O++)x.push(e[O],o[O],i[O],L);else for(let O=0;O<c;O++){const E=[e[O][0],e[O][1],e[O][2],1],D=h===Vt?o[0]:E,ae=h===Vt?i[0]:E;x.push(e[O],D,ae,L)}return x},Fn=()=>{const e=Nn(),o=e.length;Tt=Math.max(2,Math.ceil(Math.sqrt(o)));const i=new Float32Array(Tt**2*4);return e.forEach((c,g)=>{i[g*4]=c[0],i[g*4+1]=c[1],i[g*4+2]=c[2],i[g*4+3]=c[3]}),a.regl.texture({data:i,shape:[Tt,Tt,4],type:"float"})},Fi=(e,o)=>{yt[0]=e/Pt,yt[5]=o},Bn=()=>{Pt=Ie/v,wn=Qn([],[1/Pt,1,1]),yt=Qn([],[1/Pt,1,1]),nt=Qn([],[Gt,1,1])},Bi=e=>{+e<=0||(Gt=e)},$n=(e,o)=>i=>{if(!i||!i.length)return;const g=[...e()];let T=Xe(i)?i:[i];T=T.map(x=>le(x,!0)),xt&&xt.destroy();try{o(T),xt=Fn()}catch{console.error("Invalid colors. Switching back to default colors."),o(g),xt=Fn()}},$i=$n(()=>z,e=>{z=e}),zi=$n(()=>Z,e=>{Z=e}),Ui=$n(()=>X,e=>{X=e}),ki=()=>{const e=Ze(-1,-1),o=Ze(1,1),i=(e[0]+1)/2,c=(o[0]+1)/2,g=(e[1]+1)/2,T=(o[1]+1)/2,x=[en+i*tn,en+c*tn],O=[nn+g*on,nn+T*on];return[x,O]},ct=()=>{if(!fe&&!ee)return;const[e,o]=ki();fe&&fe.domain(e),ee&&ee.domain(o)},zn=e=>{v=Math.max(1,e),A.height=Math.floor(v*window.devicePixelRatio),ee&&(ee.range([v,0]),ct())},Wi=e=>{if(e===Me){he=e,A.style.height="100%",window.requestAnimationFrame(()=>{A&&zn(A.getBoundingClientRect().height)});return}!+e||+e<=0||(he=+e,zn(he),A.style.height=`${he}px`)},Un=()=>{Cn=mt,mt===Me&&(Cn=Array.isArray(k)?Ta(k):k)},Vi=e=>{Ke(e,qe,{minLength:1})&&(k=[...e]),un(+e)&&(k=[+e]),Lo=no/k[0],Qt=Mn(),Un()},Hi=e=>{!+e||+e<0||(pe=+e)},Yi=e=>{!+e||+e<0||(ze=+e)},kn=e=>{Ie=Math.max(1,e),A.width=Math.floor(Ie*window.devicePixelRatio),fe&&(fe.range([0,Ie]),ct())},Gi=e=>{if(e===Me){ye=e,A.style.width="100%",window.requestAnimationFrame(()=>{A&&kn(A.getBoundingClientRect().width)});return}!+e||+e<=0||(ye=+e,kn(ye),A.style.width=`${Ie}px`)},Zi=e=>{Ke(e,qe,{minLength:1})&&(V=[...e]),un(+e)&&(V=[+e]),Qt=Mn()},Wn=e=>{switch(e){case"valueZ":return st;case"valueW":return rt;default:return null}},Vn=(e,o)=>{switch(e){case Re:return i=>Math.round(i*(o.length-1));case Ot:default:return ut}},ji=e=>{h=Te(e,Vt)},Ki=e=>{de=Te(e,ro,{allowDensity:!0})},qi=e=>{Ae=Te(e,oo)},Xi=e=>{Se=Te(e,ao,{allowSegment:!0,allowInherit:!0})},Ji=e=>{Ce=Te(e,so,{allowSegment:!0})},Qi=e=>{Ne=Te(e,io,{allowSegment:!0})},es=()=>[A.width,A.height],ts=()=>p,ns=()=>xt,os=()=>Tt,is=()=>.5/Tt,ss=()=>window.devicePixelRatio,rs=()=>Rt,Hn=()=>On,as=()=>Qt,cs=()=>wt,ls=()=>.5/wt,$o=()=>0,us=()=>Ge||He,fs=()=>ve,ds=()=>.5/ve,Yn=()=>yt,Gn=()=>S.view,Zn=()=>nt,jn=()=>je(m,yt,je(m,S.view,nt)),Kn=()=>S.scaling[0]>1?Math.asinh(fn(1,S.scaling[0]))/Math.asinh(1)*window.devicePixelRatio:fn(Lo,S.scaling[0])*window.devicePixelRatio,ms=()=>be?Le.size:_e,zt=()=>K.length,hs=()=>zt()>0?Lt:1,gs=()=>zt()>0?Qe:1,ys=()=>+(h==="valueZ"),Es=()=>+(h==="valueW"),xs=()=>+(de==="valueZ"),Ts=()=>+(de==="valueW"),ws=()=>+(de==="density"),Ss=()=>+(Ae==="valueZ"),Cs=()=>+(Ae==="valueW"),As=()=>h==="valueZ"?st===Re?z.length-1:1:rt===Re?z.length-1:1,Is=()=>de==="valueZ"?st===Re?V.length-1:1:rt===Re?V.length-1:1,Os=()=>Ae==="valueZ"?st===Re?k.length-1:1:rt===Re?k.length-1:1,Ls=e=>{if(de!=="density")return 1;const o=Kn(),i=k[0]*o,c=2/(2/S.view[0])*(2/(2/S.view[5])),g=e.viewportHeight,T=e.viewportWidth;let x=ht*T*g/(Tn*i*i)*mi(1,c);x*=M?1:1/(.25*Math.PI);const O=fn(no,i)+.5;return x*=(i/O)**2,mi(1,fn(0,x))},_s=a.regl({framebuffer:()=>_o,vert:Bl,frag:Fl,attributes:{position:[-4,0,4,4,4,-4]},uniforms:{startStateTex:()=>Ye,endStateTex:()=>He,t:(e,o)=>o.t},count:3}),lt=(e,o,i,c=Oa,g=hs,T=gs)=>a.regl({frag:M?Ml:Rl,vert:Nl(c),blend:{enable:!M,func:{srcRGB:"src alpha",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}},depth:{enable:!1},attributes:{stateIndex:{buffer:i,size:2}},uniforms:{resolution:es,modelViewProjection:jn,devicePixelRatio:ss,pointScale:Kn,encodingTex:as,encodingTexRes:cs,encodingTexEps:ls,pointOpacityMax:g,pointOpacityScale:T,pointSizeExtra:e,globalState:c,colorTex:ns,colorTexRes:os,colorTexEps:is,stateTex:us,stateTexRes:fs,stateTexEps:ds,isColoredByZ:ys,isColoredByW:Es,isOpacityByZ:xs,isOpacityByW:Ts,isOpacityByDensity:ws,isSizedByZ:Ss,isSizedByW:Cs,colorMultiplicator:As,opacityMultiplicator:Is,opacityDensity:Ls,sizeMultiplicator:Os,numColorStates:_a},count:o,primitive:"points"}),Ps=lt($o,ms,rs),vs=lt($o,()=>1,()=>Mt,La,()=>1,()=>1),ps=lt(()=>(pe+ze*2)*window.devicePixelRatio,zt,Hn,to,()=>1,()=>1),Ds=lt(()=>(pe+ze)*window.devicePixelRatio,zt,Hn,ri,()=>1,()=>1),bs=lt(()=>pe*window.devicePixelRatio,zt,Hn,to,()=>1,()=>1),Rs=()=>{ps(),Ds(),bs()},Ms=a.regl({frag:Dl,vert:bl,attributes:{position:[0,1,0,0,1,0,0,1,1,1,1,0]},uniforms:{modelViewProjection:jn,texture:ts},count:6}),Ns=a.regl({vert:`
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
      }`,depth:{enable:!1},blend:{enable:!0,func:{srcRGB:"src alpha",srcAlpha:"one",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}},attributes:{position:()=>tt},uniforms:{modelViewProjection:jn,color:()=>r},elements:()=>Array.from({length:tt.length-2},(e,o)=>[0,o+1,o+2])}),Fs=()=>{if(!(ie>=0))return;const[e,o]=ue[ie].slice(0,2),i=[e,o,0,1];je(s,yt,je(s,S.view,nt)),ln(i,i,s),vt.setPoints([-1,i[1],1,i[1]]),pt.setPoints([i[0],1,i[0],-1]),vt.draw(),pt.draw(),lt(()=>(pe+ze*2)*window.devicePixelRatio,()=>1,Mt,to)(),lt(()=>(pe+ze)*window.devicePixelRatio,()=>1,Mt,ri)()},zo=e=>{const o=new Float32Array(e*2);let i=0;for(let c=0;c<e;++c){const g=rn(c);o[i]=g[0],o[i+1]=g[1],i+=2}return o},Uo=(e,o={})=>{const i=e.length;ve=Math.max(2,Math.ceil(Math.sqrt(i))),In=.5/ve;const c=new Float32Array(ve**2*4);let g=!0,T=!0,x=0,O=0,E=0;for(let D=0;D<i;++D)x=D*4,c[x]=e[D][0],c[x+1]=e[D][1],O=e[D][2]||0,E=e[D][3]||0,c[x+2]=O,c[x+3]=E,g&&(g=Number.isInteger(O)),T&&(T=Number.isInteger(E));return o.z&&li.includes(o.z)?st=o.z:st=g?Ot:Re,o.w&&li.includes(o.w)?rt=o.w:rt=T?Ot:Re,a.regl.texture({data:c,shape:[ve,ve,4],type:"float"})},Bs=(e,o={})=>{if(!He)return!1;if(it){const i=Ye;Ye=Ge,i.destroy()}else Ye=He;return Ge=Uo(e,o),_o=a.regl.framebuffer({color:Ge,depth:!1,stencil:!1}),He=void 0,!0},$s=()=>!!(Ye&&Ge),zs=()=>{Ye&&(Ye.destroy(),Ye=void 0),Ge&&(Ge.destroy(),Ge=void 0)},ko=(e,o={})=>new Promise(i=>{me=!1;const c=(o==null?void 0:o.preventFilterReset)&&e.length===_e;_e=e.length,Tn=_e,He&&He.destroy(),He=Uo(e,{z:o.zDataType,w:o.wDataType}),c||Rt({usage:"static",type:"float",data:zo(_e)}),Ia(o.spatialIndex||e,{useWorker:ce}).then(g=>{_t=g,ue=e,me=!0}).then(i)}),Wo=(e,o)=>{Kt=S.target,qt=e,Xt=S.distance[0],Jt=o},Us=()=>Kt!==void 0&&qt!==void 0&&Xt!==void 0&&Jt!==void 0,ks=()=>{Kt=void 0,qt=void 0,Xt=void 0,Jt=void 0},Ws=e=>{const o=Se==="inherit"?h:Se;if(o==="segment"){const i=W.length-1;return i<1?[]:e.reduce((c,g,T)=>{let x=0;const O=[];for(let D=2;D<g.length;D+=2){const ae=Math.sqrt((g[D-2]-g[D])**2+(g[D-1]-g[D+1])**2);O.push(ae),x+=ae}c[T]=[0];let E=0;for(let D=0;D<g.length/2-1;D++)E+=O[D],c[T].push(Math.floor(E/x*i)*4);return c},[])}if(o){const i=yo(o),c=Vn(Wn(o),Se==="inherit"?z:W);return Pe.reduce((g,[T,x])=>(g[T]=c(x[i])*4,g),[])}return Array(Pe.length).fill(0)},Vs=()=>{const e=Ce==="inherit"?de:Ce;if(e==="segment"){const o=U.length-1;return o<1?[]:Pe.reduce((i,[c,g,T])=>(i[c]=si(T,x=>U[Math.floor(x/(T-1)*o)]),i),[])}if(e){const o=yo(e),i=Ce==="inherit"?V:U,c=Vn(Wn(e),i);return Pe.reduce((g,[T,x])=>(g[T]=i[c(x[o])],g),[])}},Hs=()=>{const e=Ne==="inherit"?Ae:Ne;if(e==="segment"){const o=J.length-1;return o<1?[]:Pe.reduce((i,[c,g,T])=>(i[c]=si(T,x=>J[Math.floor(x/(T-1)*o)]),i),[])}if(e){const o=yo(e),i=Ne==="inherit"?k:J,c=Vn(Wn(e),i);return Pe.reduce((g,[T,x])=>(g[T]=i[c(x[o])],g),[])}},Ys=e=>{Pe=[];let o=0;Object.keys(e).forEach((i,c)=>{Pe[i]=[c,e[i].reference,e[i].length/2,o],o+=e[i].length/2})},Ut=e=>new Promise(o=>{Be.setPoints([]),!e||!e.length?o():(Sn=!0,zl(e,{maxIntPointsPerSegment:dt,tolerance:ge}).then(i=>{Ys(i);const c=Object.values(i);Be.setPoints(c.length===1?c[0]:c,{colorIndices:Ws(c),opacities:Vs(),widths:Hs()}),Sn=!1,o()}))}),Gs=({preventEvent:e=!1}={})=>(be=!1,Le.clear(),Rt.subdata(zo(_e)),new Promise(o=>{const i=()=>{n.subscribe("draw",()=>{e||n.publish("unfilter"),o()},1),B=!0};we||Bt(ue[0])?Ut(vn()).then(()=>{e||n.publish("pointConnectionsDraw"),i()}):i()})),Vo=(e,{preventEvent:o=!1}={})=>{const i=Array.isArray(e)?e:[e];be=!0,Le.clear();const c=[],g=[];for(let T=i.length-1;T>=0;T--){const x=i[T];if(x<0||x>=_e){i.splice(T,1);continue}Le.add(x),c.push.apply(c,rn(x)),We.has(x)&&g.push(x)}return Rt.subdata(c),At(g,{preventEvent:o}),Le.has(ie)||$t(-1,{preventEvent:o}),new Promise(T=>{const x=()=>{n.subscribe("draw",()=>{o||n.publish("filter",{points:i}),T()},1),B=!0};we||Bt(ue[0])?Ut(vn()).then(()=>{o||n.publish("pointConnectionsDraw"),At(g,{preventEvent:o}),x()}):x()})},Ho=()=>pn(bt[0],bt[1],Dt[0],Dt[1]),Zs=xi(()=>{Tn=Ho().length},N),js=e=>{const[o,i]=Kt,[c,g]=qt,T=1-e,x=o*T+c*e,O=i*T+g*e,E=Xt*T+Jt*e;S.lookAt([x,O],E)},Ks=()=>$s(),qs=()=>Us(),Xs=(e,o)=>{Nt||(Nt=performance.now());const i=performance.now()-Nt,c=Gc(o(i/e),0,1);return Ks()&&_s({t:c}),qs()&&js(c),i<e},Js=()=>{it=!1,Nt=null,Ln=void 0,_n=void 0,se=Po,zs(),ks(),n.publish("transitionEnd")},qn=({duration:e=500,easing:o=ci})=>{it&&n.publish("transitionEnd"),it=!0,Nt=null,Ln=e,_n=xo(o)?Da[o]||ci:o,Po=se,se=!1,n.publish("transitionStart")},Qs=(e,o={})=>Q?Promise.reject(new Error("The instance was already destroyed")):Zc(e).then(i=>new Promise(c=>{if(Q){c();return}let g=!1;(!o.preventFilterReset||(i==null?void 0:i.length)!==_e)&&(be=!1,Le.clear());const T=i&&Bt(i[0])&&(we||o.showPointConnectionsOnce),{zDataType:x,wDataType:O}=o;new Promise(E=>{i?(o.transition&&(i.length===_e?g=Bs(i,{z:x,w:O}):console.warn("Cannot transition! The number of points between the previous and current draw call must be identical.")),ko(i,{zDataType:x,wDataType:O,preventFilterReset:o.preventFilterReset,spatialIndex:o.spatialIndex}).then(()=>{o.hover!==void 0&&$t(o.hover,{preventEvent:!0}),o.select!==void 0&&At(o.select,{preventEvent:!0}),o.filter!==void 0&&Vo(o.filter,{preventEvent:!0}),T?Ut(i).then(()=>{n.publish("pointConnectionsDraw"),B=!0,ot=o.showReticleOnce}).then(c):E()})):E()}).then(()=>{o.transition&&g?(T?Promise.all([new Promise(E=>{n.subscribe("transitionEnd",()=>{B=!0,ot=o.showReticleOnce,E()},1)}),new Promise(E=>{n.subscribe("pointConnectionsDraw",E,1)})]).then(c):n.subscribe("transitionEnd",()=>{B=!0,ot=o.showReticleOnce,c()},1),qn({duration:o.transitionDuration,easing:o.transitionEasing})):(T?Promise.all([new Promise(E=>{n.subscribe("draw",E,1)}),new Promise(E=>{n.subscribe("pointConnectionsDraw",E,1)})]).then(c):n.subscribe("draw",c,1),B=!0,ot=o.showReticleOnce)})})),er=e=>Q?Promise.reject(new Error("The instance was already destroyed")):(St=!1,e.length===0?new Promise(o=>{Y.clear(),n.subscribe("draw",o,1),St=!0,B=!0}):new Promise(o=>{const i=[],c=new Map,g=[],T=[];let x=-1;const O=E=>{T.push(E.lineWidth||et);const D=le(E.lineColor||gt,!0),ae=`[${D.join(",")}]`;if(c.has(ae)){const{idx:$e}=c.get(ae);g.push($e)}else{const $e=++x;c.set(ae,{idx:$e,color:D}),g.push($e)}};for(const E of e){if(jc(E)){i.push([-Ue,E.y,Ue,E.y]),O(E);continue}if(Kc(E)){i.push([E.x,-Ue,E.x,Ue]),O(E);continue}if(Xc(E)){i.push([E.x1,E.y1,E.x2,E.y1,E.x2,E.y2,E.x1,E.y2,E.x1,E.y1]),O(E);continue}if(qc(E)){i.push([E.x,E.y,E.x+E.width,E.y,E.x+E.width,E.y+E.height,E.x,E.y+E.height,E.x,E.y]),O(E);continue}Jc(E)&&(i.push(E.vertices.flatMap(ut)),O(E))}Y.setStyle({color:Array.from(c.values()).sort((E,D)=>E.idx>D.idx?1:-1).map(({color:E})=>E)}),Y.setPoints(i,{colorIndices:g,widths:T}),n.subscribe("draw",o,1),St=!0,B=!0})),Yo=e=>(...o)=>{const i=e(...o);return B=!0,i},tr=e=>{let o=1/0,i=-1/0,c=1/0,g=-1/0;for(let T=0;T<e.length;T++){const[x,O]=ue[e[T]];o=Math.min(o,x),i=Math.max(i,x),c=Math.min(c,O),g=Math.max(g,O)}return{x:o,y:c,width:i-o,height:g-c}},Go=(e,o={})=>new Promise(i=>{const c=ln([],[e.x+e.width/2,e.y+e.height/2,0,0],nt).slice(0,2),g=2*Math.atan(1),T=Pt/Gt,x=e.height*T>=e.width?e.height/2/Math.tan(g/2):e.width/2/Math.tan(g/2)/T;o.transition?(S.config({isFixed:!0}),Wo(c,x),n.subscribe("transitionEnd",()=>{i(),S.config({isFixed:!1})},1),qn({duration:o.transitionDuration,easing:o.transitionEasing})):(S.lookAt(c,x),n.subscribe("draw",i,1),B=!0)}),nr=(e,o={})=>{if(!me)return Promise.reject(new Error(ui));const i=tr(e),c=i.x+i.width/2,g=i.y+i.height/2,T=Do(),x=1+(o.padding||0),O=Math.max(i.width,T)*x,E=Math.max(i.height,T)*x,D=c-O/2,ae=g-E/2;return Go({x:D,y:ae,width:O,height:E},o)},Zo=(e,o,i={})=>new Promise(c=>{i.transition?(S.config({isFixed:!0}),Wo(e,o),n.subscribe("transitionEnd",()=>{c(),S.config({isFixed:!1})},1),qn({duration:i.transitionDuration,easing:i.transitionEasing})):(S.lookAt(e,o),n.subscribe("draw",c,1),B=!0)}),or=(e={})=>Zo([0,0],1,e),ir=e=>{if(!me)throw new Error(ui);const o=ue[e];if(!o)return;const i=[o[0],o[1],0,1];je(s,wn,je(s,S.view,nt)),ln(i,i,s);const c=Ie*(i[0]+1)/2,g=v*(.5-i[1]/2);return[c,g]},Xn=()=>{Be.setStyle({color:Nn(W,ne,oe),opacity:U===null?null:U[0],width:J[0]})},jo=()=>{const e=Math.round(j)>.5?0:255;te.initiator.style.border=`1px dashed rgba(${e}, ${e}, ${e}, 0.33)`,te.initiator.style.background=`rgba(${e}, ${e}, ${e}, 0.1)`},Ko=()=>{const e=Math.round(j)>.5?0:255;te.longPressIndicator.style.color=`rgb(${e}, ${e}, ${e})`,te.longPressIndicator.dataset.color=`rgb(${e}, ${e}, ${e})`;const o=r.map(i=>Math.round(i*255));te.longPressIndicator.dataset.activeColor=`rgb(${o[0]}, ${o[1]}, ${o[2]})`},sr=e=>{e&&(L=le(e,!0),j=gi(L),jo(),Ko())},rr=e=>{e?xo(e)?di(a.regl,e).then(o=>{p=o,B=!0,n.publish("backgroundImageReady")}).catch(()=>{console.error(`Count not create texture from ${e}`),p=null}):e._reglType==="texture2d"?p=e:p=null:p=null},ar=e=>{e>0&&S.lookAt(S.target,e,S.rotation)},cr=e=>{e!==null&&S.lookAt(S.target,S.distance[0],e)},lr=e=>{e&&S.lookAt(e,S.distance[0],S.rotation)},qo=e=>{e&&S.setView(e)},ur=e=>{if(!e)return;r=le(e,!0),H.setStyle({color:r});const o=r.map(i=>Math.round(i*255));te.longPressIndicator.dataset.activeColor=`rgb(${o[0]}, ${o[1]}, ${o[2]})`},fr=e=>{Number.isNaN(+e)||+e<1||(y=+e,H.setStyle({width:y}))},dr=e=>{+e&&(w=+e,te.set({minDelay:w}))},mr=e=>{+e&&(C=+e,te.set({minDist:C}))},hr=e=>{I=fi(ba,I)(e)},gr=e=>{f=!!e,te.set({enableInitiator:f})},yr=e=>{P=e,te.set({startInitiatorParentElement:P})},Er=e=>{_=!!e},xr=e=>{b=Number(e)},Tr=e=>{F=Number(e)},wr=e=>{R=Number(e)},Sr=e=>{$=Number(e)},Cr=e=>{q=Object.entries(e).reduce((o,[i,c])=>(ka.includes(i)&&Ua.includes(c)&&(o[i]=c),o),{}),Zt=hi(q),Zt[yn]?S.config({isRotate:!0,mouseDownMoveModKey:Zt[yn]}):S.config({isRotate:!1})},Ar=e=>{G=fi(va,To)(e),S.config({defaultMouseDownMoveAction:G===Ci?"rotate":"pan"})},Ir=e=>{e!==null&&(se=e)},Or=e=>{e&&(re=le(e,!0),vt.setStyle({color:re}),pt.setStyle({color:re}))},Lr=e=>{e&&(fe=e,en=e.domain()[0],tn=e?e.domain()[1]-e.domain()[0]:0,fe.range([0,Ie]),ct())},_r=e=>{e&&(ee=e,nn=ee.domain()[0],on=ee?ee.domain()[1]-ee.domain()[0]:0,ee.range([v,0]),ct())},Pr=e=>{l=!!e},vr=e=>{u=!!e},pr=e=>{we=!!e,we?me&&Bt(ue[0])&&Ut(vn()).then(()=>{n.publish("pointConnectionsDraw"),B=!0}):Ut()},Jn=(e,o)=>i=>{if(i==="inherit")e([...o()]);else{const c=Xe(i)?i:[i];e(c.map(g=>le(g,!0)))}Xn()},Dr=Jn(e=>{W=e},()=>z),br=Jn(e=>{ne=e},()=>Z),Rr=Jn(e=>{oe=e},()=>X),Mr=e=>{Ke(e,qe,{minLength:1})&&(U=[...e]),un(+e)&&(U=[+e]),W=W.map(o=>(o[3]=Number.isNaN(+U[0])?o[3]:+U[0],o)),Xn()},Nr=e=>{!Number.isNaN(+e)&&+e&&(Je=+e)},Fr=e=>{Ke(e,qe,{minLength:1})&&(J=[...e]),un(+e)&&(J=[+e]),Xn()},Br=e=>{!Number.isNaN(+e)&&+e&&(ft=Math.max(0,e))},$r=e=>{dt=Math.max(0,e)},zr=e=>{ge=Math.max(0,e)},Ur=e=>{mt=e,Un()},kr=e=>{ht=+e},Wr=e=>{Lt=+e},Vr=e=>{Qe=+e},Hr=e=>{gt=le(e)},Yr=e=>{et=+e},Gr=e=>{Ue=+e},Zr=e=>{a.gamma=e},jr=e=>{if(go({property:!0}),e==="aspectRatio")return Gt;if(e==="background"||e==="backgroundColor")return L;if(e==="backgroundImage")return p;if(e==="camera")return S;if(e==="cameraTarget")return S.target;if(e==="cameraDistance")return S.distance[0];if(e==="cameraRotation")return S.rotation;if(e==="cameraView")return S.view;if(e==="canvas")return A;if(e==="colorBy")return h;if(e==="sizeBy")return Ae;if(e==="deselectOnDblClick")return l;if(e==="deselectOnEscape")return u;if(e==="height")return he;if(e==="lassoColor")return r;if(e==="lassoLineWidth")return y;if(e==="lassoMinDelay")return w;if(e==="lassoMinDist")return C;if(e==="lassoClearEvent")return I;if(e==="lassoInitiator")return f;if(e==="lassoInitiatorElement")return te.initiator;if(e==="lassoInitiatorParentElement")return P;if(e==="keyMap")return{...q};if(e==="mouseMode")return G;if(e==="opacity")return V.length===1?V[0]:V;if(e==="opacityBy")return de;if(e==="opacityByDensityFill")return ht;if(e==="opacityByDensityDebounceTime")return N;if(e==="opacityInactiveMax")return Lt;if(e==="opacityInactiveScale")return Qe;if(e==="points")return ue;if(e==="hoveredPoint")return ie;if(e==="selectedPoints")return[...K];if(e==="filteredPoints")return be?Array.from(Le):Array.from({length:ue.length},(o,i)=>i);if(e==="pointsInView")return Ho();if(e==="pointColor")return z.length===1?z[0]:z;if(e==="pointColorActive")return Z.length===1?Z[0]:Z;if(e==="pointColorHover")return X.length===1?X[0]:X;if(e==="pointOutlineWidth")return ze;if(e==="pointSize")return k.length===1?k[0]:k;if(e==="pointSizeSelected")return pe;if(e==="pointSizeMouseDetection")return mt;if(e==="showPointConnections")return we;if(e==="pointConnectionColor")return W.length===1?W[0]:W;if(e==="pointConnectionColorActive")return ne.length===1?ne[0]:ne;if(e==="pointConnectionColorHover")return oe.length===1?oe[0]:oe;if(e==="pointConnectionColorBy")return Se;if(e==="pointConnectionOpacity")return U.length===1?U[0]:U;if(e==="pointConnectionOpacityBy")return Ce;if(e==="pointConnectionOpacityActive")return Je;if(e==="pointConnectionSize")return J.length===1?J[0]:J;if(e==="pointConnectionSizeActive")return ft;if(e==="pointConnectionSizeBy")return Ne;if(e==="pointConnectionMaxIntPointsPerSegment")return dt;if(e==="pointConnectionTolerance")return ge;if(e==="reticleColor")return re;if(e==="regl")return a.regl;if(e==="showReticle")return se;if(e==="version")return Ul;if(e==="width")return ye;if(e==="xScale")return fe;if(e==="yScale")return ee;if(e==="performanceMode")return M;if(e==="gamma")return a.gamma;if(e==="renderer")return a;if(e==="isDestroyed")return Q;if(e==="isPointsDrawn")return me;if(e==="isPointsFiltered")return be;if(e==="isAnnotationsDrawn")return St;if(e==="zDataType")return st;if(e==="wDataType")return rt;if(e==="spatialIndex")return _t==null?void 0:_t.data;if(e==="annotationLineColor")return gt;if(e==="annotationLineWidth")return et;if(e==="annotationHVLineLimit")return Ue},Xo=(e={})=>(go(e),(e.backgroundColor!==void 0||e.background!==void 0)&&sr(e.backgroundColor||e.background),e.backgroundImage!==void 0&&rr(e.backgroundImage),e.cameraTarget!==void 0&&lr(e.cameraTarget),e.cameraDistance!==void 0&&ar(e.cameraDistance),e.cameraRotation!==void 0&&cr(e.cameraRotation),e.cameraView!==void 0&&qo(e.cameraView),e.colorBy!==void 0&&ji(e.colorBy),e.pointColor!==void 0&&$i(e.pointColor),e.pointColorActive!==void 0&&zi(e.pointColorActive),e.pointColorHover!==void 0&&Ui(e.pointColorHover),e.pointSize!==void 0&&Vi(e.pointSize),e.pointSizeSelected!==void 0&&Hi(e.pointSizeSelected),e.pointSizeMouseDetection!==void 0&&Ur(e.pointSizeMouseDetection),e.sizeBy!==void 0&&qi(e.sizeBy),e.opacity!==void 0&&Zi(e.opacity),e.showPointConnections!==void 0&&pr(e.showPointConnections),e.pointConnectionColor!==void 0&&Dr(e.pointConnectionColor),e.pointConnectionColorActive!==void 0&&br(e.pointConnectionColorActive),e.pointConnectionColorHover!==void 0&&Rr(e.pointConnectionColorHover),e.pointConnectionColorBy!==void 0&&Xi(e.pointConnectionColorBy),e.pointConnectionOpacityBy!==void 0&&Ji(e.pointConnectionOpacityBy),e.pointConnectionOpacity!==void 0&&Mr(e.pointConnectionOpacity),e.pointConnectionOpacityActive!==void 0&&Nr(e.pointConnectionOpacityActive),e.pointConnectionSize!==void 0&&Fr(e.pointConnectionSize),e.pointConnectionSizeActive!==void 0&&Br(e.pointConnectionSizeActive),e.pointConnectionSizeBy!==void 0&&Qi(e.pointConnectionSizeBy),e.pointConnectionMaxIntPointsPerSegment!==void 0&&$r(e.pointConnectionMaxIntPointsPerSegment),e.pointConnectionTolerance!==void 0&&zr(e.pointConnectionTolerance),e.opacityBy!==void 0&&Ki(e.opacityBy),e.lassoColor!==void 0&&ur(e.lassoColor),e.lassoLineWidth!==void 0&&fr(e.lassoLineWidth),e.lassoMinDelay!==void 0&&dr(e.lassoMinDelay),e.lassoMinDist!==void 0&&mr(e.lassoMinDist),e.lassoClearEvent!==void 0&&hr(e.lassoClearEvent),e.lassoInitiator!==void 0&&gr(e.lassoInitiator),e.lassoInitiatorParentElement!==void 0&&yr(e.lassoInitiatorParentElement),e.lassoOnLongPress!==void 0&&Er(e.lassoOnLongPress),e.lassoLongPressTime!==void 0&&xr(e.lassoLongPressTime),e.lassoLongPressAfterEffectTime!==void 0&&Tr(e.lassoLongPressAfterEffectTime),e.lassoLongPressEffectDelay!==void 0&&wr(e.lassoLongPressEffectDelay),e.lassoLongPressRevertEffectTime!==void 0&&Sr(e.lassoLongPressRevertEffectTime),e.keyMap!==void 0&&Cr(e.keyMap),e.mouseMode!==void 0&&Ar(e.mouseMode),e.showReticle!==void 0&&Ir(e.showReticle),e.reticleColor!==void 0&&Or(e.reticleColor),e.pointOutlineWidth!==void 0&&Yi(e.pointOutlineWidth),e.height!==void 0&&Wi(e.height),e.width!==void 0&&Gi(e.width),e.aspectRatio!==void 0&&Bi(e.aspectRatio),e.xScale!==void 0&&Lr(e.xScale),e.yScale!==void 0&&_r(e.yScale),e.deselectOnDblClick!==void 0&&Pr(e.deselectOnDblClick),e.deselectOnEscape!==void 0&&vr(e.deselectOnEscape),e.opacityByDensityFill!==void 0&&kr(e.opacityByDensityFill),e.opacityInactiveMax!==void 0&&Wr(e.opacityInactiveMax),e.opacityInactiveScale!==void 0&&Vr(e.opacityInactiveScale),e.gamma!==void 0&&Zr(e.gamma),e.annotationLineColor!==void 0&&Hr(e.annotationLineColor),e.annotationLineWidth!==void 0&&Yr(e.annotationLineWidth),e.annotationHVLineLimit!==void 0&&Gr(e.annotationHVLineLimit),new Promise(o=>{window.requestAnimationFrame(()=>{A&&(Bn(),S.refresh(),a.refresh(),B=!0,o())})})),Kr=(e,{preventEvent:o=!1}={})=>{qo(e),B=!0,An=o},Jo=()=>{S||(S=wa(A,{isPanInverted:[!1,!0]})),t.cameraView?S.setView(ii(t.cameraView)):t.cameraTarget||t.cameraDistance||t.cameraRotation?S.lookAt([...t.cameraTarget||gc],t.cameraDistance||yc,t.cameraRotation||Ec):S.setView(ii(xc)),Dt=Ze(1,1),bt=Ze(-1,-1)},qr=({preventEvent:e=!1}={})=>{Jo(),ct(),!e&&n.publish("view",{view:S.view,camera:S,xScale:fe,yScale:ee})},Qo=({key:e})=>{switch(e){case"Escape":u&&an();break}},ei=()=>{Ct=!0,Ft=!0},ti=()=>{$t(),Ct=!1,Ft=!0,B=!0},ni=()=>{B=!0},Xr=()=>{ko([]),Be.clear()},kt=()=>{S.refresh();const e=ye===Me,o=he===Me;if(e||o){const{width:i,height:c}=A.getBoundingClientRect();e&&kn(i),o&&zn(c),Bn(),B=!0}},Jr=()=>A.getContext("2d").getImageData(0,0,A.width,A.height),Qr=()=>{Bn(),Jo(),ct(),H=Wt(a.regl,{color:r,width:y,is2d:!0}),Be=Wt(a.regl,{color:Nn(W,ne,oe),opacity:U===null?null:U[0],width:J[0],widthActive:ft,is2d:!0}),vt=Wt(a.regl,{color:re,width:1,is2d:!0}),pt=Wt(a.regl,{color:re,width:1,is2d:!0}),Y=Wt(a.regl,{color:gt,width:et,is2d:!0}),Un(),A.addEventListener("wheel",ni),Rt=a.regl.buffer(),On=a.regl.buffer(),Mt=a.regl.buffer({usage:"dynamic",type:"float",length:Pa*2}),xt=Fn(),Qt=Mn();const e=Xo({backgroundImage:p,width:ye,height:he,keyMap:q});jo(),Ko(),window.addEventListener("keyup",Qo,!1),window.addEventListener("blur",Bo,!1),window.addEventListener("mouseup",Rn,!1),window.addEventListener("mousemove",Fo,!1),A.addEventListener("mousedown",Ro,!1),A.addEventListener("mouseenter",ei,!1),A.addEventListener("mouseleave",ti,!1),A.addEventListener("click",Mo,!1),A.addEventListener("dblclick",No,!1),"ResizeObserver"in window?(jt=new ResizeObserver(kt),jt.observe(A)):(window.addEventListener("resize",kt),window.addEventListener("orientationchange",kt)),e.then(()=>{n.publish("init")})},ea=a.onFrame(()=>{if(Pn=S.tick(),!(me||St)||!(B||it))return;it&&!Xs(Ln,_n)&&Js(),Pn&&(Dt=Ze(1,1),bt=Ze(-1,-1),de==="density"&&Zs()),a.render(()=>{const o=A.width/a.canvas.width,i=A.height/a.canvas.height;Fi(o,i),p&&p._reglType&&Ms(),tt.length>2&&Ns(),it||Be.draw({projection:Yn(),model:Zn(),view:Gn()}),me&&Ps(),!De&&(se||ot)&&Fs(),ie>=0&&vs(),K.length&&Rs(),Y.draw({projection:Yn(),model:Zn(),view:Gn()}),H.draw({projection:Yn(),model:Zn(),view:Gn()})},A);const e={view:S.view,camera:S,xScale:fe,yScale:ee};Pn&&(ct(),An?An=!1:n.publish("view",e)),B=!1,ot=!1,n.publish("drawing",e,{async:!1}),n.publish("draw",e)}),ta=()=>{B=!0},na=()=>{me=!1,St=!1,Q=!0,ea(),window.removeEventListener("keyup",Qo,!1),window.removeEventListener("blur",Bo,!1),window.removeEventListener("mouseup",Rn,!1),window.removeEventListener("mousemove",Fo,!1),A.removeEventListener("mousedown",Ro,!1),A.removeEventListener("mouseenter",ei,!1),A.removeEventListener("mouseleave",ti,!1),A.removeEventListener("click",Mo,!1),A.removeEventListener("dblclick",No,!1),A.removeEventListener("wheel",ni,!1),jt?jt.disconnect():(window.removeEventListener("resize",kt),window.removeEventListener("orientationchange",kt)),A=void 0,S.dispose(),S=void 0,H.destroy(),te.destroy(),Be.destroy(),vt.destroy(),pt.destroy(),!t.renderer&&!a.isDestroyed&&a.destroy(),n.publish("destroy"),n.clear()};return Qr(),{get isSupported(){return a.isSupported},clear:Yo(Xr),createTextureFromUrl:(e,o=Oo)=>di(a.regl,e,o),deselect:an,destroy:na,draw:Qs,drawAnnotations:er,filter:Vo,get:jr,getScreenPosition:ir,hover:$t,redraw:ta,refresh:a.refresh,reset:Yo(qr),select:At,set:Xo,export:Jr,subscribe:n.subscribe,unfilter:Gs,unsubscribe:n.unsubscribe,view:Kr,zoomToLocation:Zo,zoomToArea:Go,zoomToPoints:nr,zoomToOrigin:or}};function kl(t,n="file.txt"){const s=document.createElement("a");s.href=URL.createObjectURL(t),s.download=n,document.body.appendChild(s),s.dispatchEvent(new MouseEvent("click",{bubbles:!0,cancelable:!0,view:window})),document.body.removeChild(s)}function Kl(t){const n=new Image;n.onload=()=>{t.get("canvas").toBlob(s=>{kl(s,"scatter.png")})},n.src=t.get("canvas").toDataURL()}function Wl(){const t=document.querySelector("#modal"),n=document.querySelector("#modal-text");t.style.display="none",n.textContent=""}function Vl(t,n,s){const m=document.querySelector("#modal");m.style.display="flex";const d=document.querySelector("#modal-text");d.style.color=n?"#cc79A7":"#bbb",d.textContent=t;const a=document.querySelector("#modal-close");s?(a.style.display="block",a.style.background=n?"#cc79A7":"#bbb",a.addEventListener("click",Wl,{once:!0})):a.style.display="none"}function ql(t){t.isSupported||Vl("Your browser does not support all necessary WebGL features. The scatter plot might not render properly.",!0,!0)}export{ql as a,Vl as b,jl as c,Wl as d,Qc as e,Kl as s};
