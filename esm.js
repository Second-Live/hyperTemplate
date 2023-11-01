/*! (c) Andrea Giammarchi (ISC) */var hyperHTML=function(M){"use strict";const W=[]["indexOf"],A=(e,t,n,r,i,a)=>{var o="selectedIndex"in t;let l=o;for(;r<i;){var s,c=e(n[r],1);t.insertBefore(c,a),o&&l&&c.selected&&(l=!l,s=t["selectedIndex"],t.selectedIndex=s<0?r:W.call(t.querySelectorAll("option"),c)),r++}},$=(e,t)=>e==t,R=e=>e,p=(n,r,i,a,o,l,s)=>{var e=l-o;if(!(e<1))for(;e<=i-r;){let e=r,t=o;for(;e<i&&t<l&&s(n[e],a[t]);)e++,t++;if(t===l)return r;r=e+1}return-1},F=(e,t,n,r,i,a)=>{for(;r<i&&a(n[r],e[t-1]);)r++,t--;return 0===t},v=(e,t,n,r,i)=>n<r?e(t[n],0):0<n?e(t[n-1],-0).nextSibling:i,T=(e,t,n,r)=>{for(;n<r;)((i=e(t[n++],-1)).remove||function(){var e=this["parentNode"];e&&e.removeChild(this)}).call(i);var i},H=(n,r,i,a,o,l,s,c,u,f,h,d,p)=>{{var v=((e,t,n,r,i,a,o)=>{var l=n+a,s=[];let c,u,f,h,d,p,v;e:for(c=0;c<=l;c++){if(50<c)return null;for(v=c-1,d=c?s[c-1]:[0,0],p=s[c]=[],u=-c;u<=c;u+=2){for(h=u===-c||u!==c&&d[v+u-1]<d[v+u+1]?d[v+u+1]:d[v+u-1]+1,f=h-u;h<a&&f<n&&o(r[i+h],e[t+f]);)h++,f++;if(h===a&&f===n)break e;p[c+u]=h}}var m=Array(c/2+l/2);let g=m.length-1;for(c=s.length-1;0<=c;c--){for(;0<h&&0<f&&o(r[i+h-1],e[t+f-1]);)m[g--]=0,h--,f--;if(!c)break;v=c-1,d=c?s[c-1]:[0,0],(u=h-f)===-c||u!==c&&d[v+u-1]<d[v+u+1]?(f--,m[g--]=1):(h--,m[g--]=-1)}return m})(i,a,l,s,c,f,d)||((t,n,r,e,i,a,o,l)=>{let s=0,c=e<l?e:l;var u=Array(c++),f=Array(c);f[0]=-1;for(let e=1;e<c;e++)f[e]=o;var h=i.slice(a,o);for(let e=n;e<r;e++){var d=h.indexOf(t[e]);-1<d&&(d=d+a,-1<(s=((e,t,n)=>{let r=1,i=t;while(r<i){const a=(r+i)/2>>>0;if(n<e[a])i=a;else r=a+1}return r})(f,c,d)))&&(f[s]=d,u[s]={newi:e,oldi:d,prev:u[s-1]})}for(s=--c,--o;f[s]>o;)--s;c=l+e-s;var p=Array(c);let v=u[s];for(--r;v;){for(var{newi:m,oldi:g}=v;m<r;)p[--c]=1,--r;for(;g<o;)p[--c]=-1,--o;p[--c]=0,--r,--o,v=v.prev}for(;n<=r;)p[--c]=1,--r;for(;a<=o;)p[--c]=-1,--o;return p})(i,a,o,l,s,c,u,f),m=n,g=r,y=i,b=a,w=s,N=c,x=h,k=p,E=[],C=v.length;let e=N,t=0;for(;t<C;)switch(v[t++]){case 0:b++,e++;break;case 1:E.push(y[b]),A(m,g,y,b++,b,e<x?m(w[e],0):k);break;case-1:e++}for(t=0;t<C;)switch(v[t++]){case 0:N++;break;case-1:-1<E.indexOf(w[N])?N++:T(m,w,N++,N)}}};const c=(t,n,r,i)=>{var a=(i=i||{}).compare||$,o=i.node||R,i=null==i.before?null:o(i.before,0),l=n.length;let s=l,c=0,u=r.length,f=0;for(;c<s&&f<u&&a(n[c],r[f]);)c++,f++;for(;c<s&&f<u&&a(n[s-1],r[u-1]);)s--,u--;var h=c===s,d=f===u;if(!h||!d)if(h&&f<u)A(o,t,r,f,u,v(o,n,c,l,i));else if(d&&c<s)T(o,n,c,s);else{h=s-c,d=u-f;let e=-1;if(h<d){if(-1<(e=p(r,f,u,n,c,s,a)))return A(o,t,r,f,e,o(n[c],0)),A(o,t,r,e+h,u,v(o,n,s,l,i)),r}else if(d<h&&-1<(e=p(n,c,s,r,f,u,a)))return T(o,n,c,e),T(o,n,e+d,s),r;h<2||d<2?(A(o,t,r,f,u,o(n[c],0)),T(o,n,c,s)):h==d&&F(r,u,n,c,s,a)?A(o,t,r,f,u,v(o,n,s,l,i)):H(o,t,r,f,u,d,n,c,s,h,l,a,i)}return r},n={},i={},a=[],I=i.hasOwnProperty;let Z=0;var f={attributes:n,define:(e,t)=>{e.indexOf("-")<0?(e in i||(Z=a.push(e)),i[e]=t):n[e]=t},invoke:(t,n)=>{for(let e=0;e<Z;e++){var r=a[e];if(I.call(t,r))return i[r](t[r],n)}}};var z,r,G,t={};try{t.WeakMap=WeakMap}catch(e){t.WeakMap=(z=Math.random(),o=Object,r=o.defineProperty,G=o.hasOwnProperty,(o=V.prototype).delete=function(e){return this.has(e)&&delete e[this._]},o.get=function(e){return this.has(e)?e[this._]:void 0},o.has=function(e){return G.call(e,this._)},o.set=function(e,t){return r(e,this._,{configurable:!0,value:t}),this},V)}function V(e){r(this,"_",{value:"_@ungap/weakmap"+z++}),e&&e.forEach(B,this)}function B(e){this.set(e[0],e[1])}var l,s,o=t.WeakMap,q=(l="appendChild",s="cloneNode",t="createTextNode",u=(d="importNode")in(h=M),(e=h.createDocumentFragment())[l](h[t]("g")),e[l](h[t]("")),(u?h[d](e,!0):e[s](!0)).childNodes.length<2?function e(t,n){for(var r=t[s](),i=t.childNodes||[],a=i.length,o=0;n&&o<a;o++)r[l](e(i[o],n));return r}:u?h[d]:function(e,t){return e[s](!!t)}),J="".trim||function(){return String(this).replace(/^\s+|\s+/g,"")},L="-"+Math.random().toFixed(6)+"%",j=!1;try{g=M.createElement("template"),D="tabindex",(y="content")in g&&(g.innerHTML="<p "+D+'="'+L+'"></p>',g[y].childNodes[0].getAttribute(D)==L)||(L="_dt: "+L.slice(1,-1)+";",j=!0)}catch(e){}var _="\x3c!--"+L+"--\x3e",K=/^(?:plaintext|script|style|textarea|title|xmp)$/i,Q=/^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;function U(e){return e.join(_).replace(Y,re).replace(X,te)}var t=" \\f\\n\\r\\t",e="[^"+t+"\\/>\"'=]+",u="["+t+"]+"+e,h="<([A-Za-z]+[A-Za-z0-9:._-]*)((?:",d="(?:\\s*=\\s*(?:'[^']*?'|\"[^\"]*?\"|<[^>]*?>|"+e.replace("\\/","")+"))?)",X=new RegExp(h+u+d+"+)(["+t+"]*/?>)","g"),Y=new RegExp(h+u+d+"*)(["+t+"]*/>)","g"),ee=new RegExp("("+u+"\\s*=\\s*)(['\"]?)"+_+"\\2","gi");function te(e,t,n,r){return"<"+t+n.replace(ee,ne)+r}function ne(e,t,n){return t+(n||'"')+L+(n||'"')}function re(e,t,n){return Q.test(t)?e:"<"+t+n+"></"+t+">"}var ie=j?function(e,t){var n=t.join(" ");return t.slice.call(e,0).sort(function(e,t){return n.indexOf(e.name)<=n.indexOf(t.name)?-1:1})}:function(e,t){return t.slice.call(e,0)};function ae(e,t,n,r){for(var i=e.childNodes,a=i.length,o=0;o<a;){var l=i[o];switch(l.nodeType){case 1:for(var s,c=r.concat(o),u=(O=T=A=C=E=k=x=s=N=w=b=y=g=m=v=p=d=h=f=u=void 0,l),f=t,h=n,d=c,p=u.attributes,v=[],m=[],g=ie(p,h),y=g.length,b=0;b<y;){var w=g[b++],N=w.value===L;if(N||1<(s=w.value.split(_)).length){var x=w.name;if(v.indexOf(x)<0){v.push(x);var x=h.shift().replace(N?/^(?:|[\S\s]*?\s)(\S+?)\s*=\s*('|")?$/:new RegExp("^(?:|[\\S\\s]*?\\s)("+x+")\\s*=\\s*('|\")[\\S\\s]*","i"),"$1"),k=p[x]||p[x.toLowerCase()];if(N)f.push(oe(k,d,x,null));else{for(var E=s.length-2;E--;)h.shift();f.push(oe(k,d,x,s))}}m.push(w)}}for(var C=((b=0)<(y=m.length)&&j&&!("ownerSVGElement"in u));b<y;){var A=m[b++];C&&(A.value=""),u.removeAttribute(A.name)}var T=u.nodeName;if(/^script$/i.test(T)){var O=M.createElement(T);for(y=p.length,b=0;b<y;)O.setAttributeNode(p[b++].cloneNode(!0));O.textContent=u.textContent,u.parentNode.replaceChild(O,u)}ae(l,t,n,c);break;case 8:var S=l.textContent;if(S===L)n.shift(),t.push(K.test(e.nodeName)?le(e,r):{type:"any",node:l,path:r.concat(o)});else switch(S.slice(0,2)){case"/*":if("*/"!==S.slice(-2))break;case"👻":e.removeChild(l),o--,a--}break;case 3:K.test(e.nodeName)&&J.call(l.textContent)===_&&(n.shift(),t.push(le(e,r)))}o++}}function oe(e,t,n,r){return{type:"attr",node:e,path:t,name:n,sparse:r}}function le(e,t){return{type:"text",node:e,path:t}}m=new o;var m,se={get:e=>m.get(e),set:(e,t)=>(m.set(e,t),t)};function ce(o,f){var e=(o.convert||U)(f),t=o.transform,t=(t&&(e=t(e)),Se(e,o.type)),l=(he(t),[]);return ae(t,l,f.slice(0),[]),{content:t,updates:function(s){for(var c=[],u=l.length,e=0,t=0;e<u;){var n=l[e++],r=function(e,t){for(var n=t.length,r=0;r<n;)e=e.childNodes[t[r++]];return e}(s,n.path);switch(n.type){case"any":c.push({fn:o.any(r,[]),sparse:!1});break;case"attr":var i=n.sparse,a=o.attribute(r,n.name,n.node);null===i?c.push({fn:a,sparse:!1}):(t+=i.length-2,c.push({fn:a,sparse:!0,values:i}));break;case"text":c.push({fn:o.text(r),sparse:!1}),r.textContent=""}}return u+=t,function(){var e=arguments.length;if(u!==e-1)throw new Error(e-1+" values instead of "+u+"\n"+f.join("${value}"));for(var t=1,n=1;t<e;){var r=c[t-n];if(r.sparse){var i=r.values,a=i[0],o=1,l=i.length;for(n+=l-2;o<l;)a+=arguments[t++]+i[o++];r.fn(a)}else r.fn(arguments[t++])}return s}}}}var ue=[];function fe(n){var r=ue,i=he;return function(e){var t;return r!==e&&(t=n,e=r=e,i=(t=se.get(e)||se.set(e,ce(t,e))).updates(q.call(M,t.content,!0))),i.apply(null,arguments)}}function he(e){for(var t=e.childNodes,n=t.length;n--;){var r=t[n];1!==r.nodeType&&0===J.call(r.textContent).length&&e.removeChild(r)}}de=/acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i,pe=/([^A-Z])([A-Z]+)/g;var de,pe,ve=function(e,t){var n;return"ownerSVGElement"in e?(n=e,(t=(t=t)?t.cloneNode(!0):(n.setAttribute("style","--hyper:style;"),n.getAttributeNode("style"))).value="",n.setAttributeNode(t),ge(t,!0)):ge(e.style,!1)};function me(e,t,n){return t+"-"+n.toLowerCase()}function ge(i,a){var o,l;return function(e){var t,n,r;switch(typeof e){case"object":if(e){if("object"===o){if(!a&&l!==e)for(n in l)n in e||(i[n]="")}else a?i.value="":i.cssText="";for(n in t=a?{}:i,e)r="number"!=typeof(r=e[n])||de.test(n)?r:r+"px",!a&&/^--/.test(n)?t.setProperty(n,r):t[n]=r;o="object",a?i.value=function(e){var t,n=[];for(t in e)n.push(t.replace(pe,me),":",e[t],";");return n.join("")}(l=t):l=e;break}default:l!=e&&(o="string",l=e,a?i.value=e||"":i.cssText=e||"")}}}ye=[].slice,(g=Ne.prototype).ELEMENT_NODE=1,g.nodeType=111,g.remove=function(e){var t,n=this.childNodes,r=this.firstChild,i=this.lastChild;return this._=null,e&&2===n.length?i.parentNode.removeChild(i):((t=this.ownerDocument.createRange()).setStartBefore(e?n[1]:r),t.setEndAfter(i),t.deleteContents()),r},g.valueOf=function(e){var t=this._,n=null==t;if(n&&(t=this._=this.ownerDocument.createDocumentFragment()),n||e)for(var r=this.childNodes,i=0,a=r.length;i<a;i++)t.appendChild(r[i]);return t};var ye,g,y,be,b,w,N,we=Ne;function Ne(e){e=this.childNodes=ye.call(e,0);this.firstChild=e[0],this.lastChild=e[e.length-1],this.ownerDocument=e[0].ownerDocument,this._=null}const x="ownerSVGElement",xe="connected",ke=(xe,Array["isArray"]),{createDocumentFragment:Ee,createElement:Ce,createElementNS:Ae}=new Proxy({},{get:(e,t)=>M[t].bind(M)}),Te=e=>{var t=Ce("template");return t.innerHTML=e,t.content};let k;const Oe=e=>{(k=k||Ae("http://www.w3.org/2000/svg","svg")).innerHTML=e;e=Ee();return e.append(...k.childNodes),e},Se=(e,t)=>("svg"==t?Oe:Te)(e),Me=we.prototype.nodeType,Le=(y={Event:CustomEvent,WeakSet:WeakSet},be=y.Event,b=y.WeakSet,w=!0,N=null,function(e){if(w){w=!w,N=new b;var t=e.ownerDocument,i=new b,a=new b;try{new MutationObserver(l).observe(t,{subtree:!0,childList:!0})}catch(e){var n=0,r=[],o=function(e){r.push(e),clearTimeout(n),n=setTimeout(function(){l(r.splice(n=0,r.length))},0)};t.addEventListener("DOMNodeRemoved",function(e){o({addedNodes:[],removedNodes:[e.target]})},!0),t.addEventListener("DOMNodeInserted",function(e){o({addedNodes:[e.target],removedNodes:[]})},!0)}function l(e){for(var t,n=e.length,r=0;r<n;r++)s((t=e[r]).removedNodes,"disconnected",a,i),s(t.addedNodes,"connected",i,a)}function s(e,t,n,r){for(var i,a=new be(t),o=e.length,l=0;l<o;1===(i=e[l++]).nodeType&&function e(t,n,r,i,a){N.has(t)&&!i.has(t)&&(a.delete(t),i.add(t),t.dispatchEvent(n));for(var o=t.children||[],l=o.length,s=0;s<l;e(o[s++],n,r,i,a));}(i,a,t,n,r));}}return N.add(e),e}),je=e=>({html:e}),_e=(e,t)=>e.nodeType!==Me?e:1/t<0?t?e.remove(!0):e.lastChild:t?e.valueOf(!0):e.firstChild,De=(e,t)=>{t(e.placeholder),("text"in e?Promise.resolve(e.text).then(String):"any"in e?Promise.resolve(e.any):"html"in e?Promise.resolve(e.html).then(je):Promise.resolve(f.invoke(e,t))).then(t)},E=e=>null!=e&&"then"in e,Pe=/^(?:form|list)$/i,C=[].slice;function O(e){return this.type=e,fe(this)}O.prototype={attribute(n,r,e){var t,i,a,o,l,s=x in n;let c;if("style"===r)return ve(n,e,s);if("."===r.slice(0,1))return o=n,l=r.slice(1),s?t=>{try{o[l]=t}catch(e){o.setAttribute(l,t)}}:e=>{o[l]=e};if("?"===r.slice(0,1))return t=n,i=r.slice(1),e=>{a!==!!e&&((a=!!e)?t.setAttribute(i,""):t.removeAttribute(i))};if(/^on/.test(r)){let t=r.slice(2);return t===xe||"disconnected"===t?Le(n):r.toLowerCase()in n&&(t=t.toLowerCase()),e=>{c!==e&&(c&&n.removeEventListener(t,c,!1),c=e)&&n.addEventListener(t,e,!1)}}if("data"===r||!s&&r in n&&!Pe.test(r))return e=>{c!==e&&(c=e,n[r]!==e&&null==e?(n[r]="",n.removeAttribute(r)):n[r]=e)};if(r in f.attributes)return e=>{e=f.attributes[r](n,e);c!==e&&(null==(c=e)?n.removeAttribute(r):n.setAttribute(r,e))};{let t=!1;const u=e.cloneNode(!0);return e=>{c!==e&&(c=e,u.value!==e)&&(null==e?(t&&(t=!1,n.removeAttributeNode(u)),u.value=e):(u.value=e,t||(t=!0,n.setAttributeNode(u))))}}},any(n,r){const i={node:_e,before:n},a=x in n?"svg":"html";let o=!1,l;const s=e=>{switch(typeof e){case"string":case"number":case"boolean":o?l!==e&&(l=e,r[0].textContent=e):(o=!0,l=e,r=c(n.parentNode,r,[(t=e,n.ownerDocument.createTextNode(t))],i));break;case"function":s(e(n));break;case"object":case"undefined":if(null==e){o=!1,r=c(n.parentNode,r,[],i);break}default:if(o=!1,l=e,ke(e))if(0===e.length)r.length&&(r=c(n.parentNode,r,[],i));else switch(typeof e[0]){case"string":case"number":case"boolean":s({html:e});break;case"object":if(ke(e[0])&&(e=e.concat.apply([],e)),E(e[0])){Promise.all(e).then(s);break}default:r=c(n.parentNode,r,e,i)}else"ELEMENT_NODE"in e?r=c(n.parentNode,r,11===e.nodeType?C.call(e.childNodes):[e],i):E(e)?e.then(s):"placeholder"in e?De(e,s):"text"in e?s(String(e.text)):"any"in e?s(e.any):"html"in e?r=c(n.parentNode,r,C.call(Se([].concat(e.html).join(""),a).childNodes),i):"length"in e?s(C.call(e)):s(f.invoke(e,s))}var t};return s},text(n){let r;const i=e=>{var t;r!==e&&("object"==(t=typeof(r=e))&&e?E(e)?e.then(i):"placeholder"in e?De(e,i):"text"in e?i(String(e.text)):"any"in e?i(e.any):"html"in e?i([].concat(e.html).join("")):"length"in e?i(C.call(e).join("")):i(f.invoke(e,i)):"function"==t?i(e(n)):n.textContent=null==e?"":e)};return i}};const We=new WeakMap;const S=t=>{let n,r,i;return function(...e){return i!==e[0]?(i=e[0],r=new O(t),n=Re(r.apply(r,e))):r.apply(r,e),n}},$e=(e,t)=>{var n=t.indexOf(":");let r=We.get(e),i=t;return-1<n&&(i=t.slice(n+1),t=t.slice(0,n)||"html"),r||We.set(e,r={}),r[i]||(r[i]=S(t))},Re=e=>{var t=e.childNodes,n=t["length"];return 1===n?t[0]:n?new we(t):e},Fe=new WeakMap;function He(...e){var t=Fe.get(this);return t&&t.template===e[0]?t.tagger.apply(null,e):function(e){var t=x in this?"svg":"html",t=new O(t);Fe.set(this,{tagger:t,template:e}),this.textContent="",this.appendChild(t.apply(null,arguments))}.apply(this,e),this}var D=f.define,e=O.prototype;function P(e){return arguments.length<2?null==e?S("html"):"string"==typeof e?P.wire(null,e):"raw"in e?S("html")(e):"nodeType"in e?P.bind(e):$e(e,"html"):("raw"in e?S("html"):P.wire).apply(null,arguments)}return P.bind=e=>He.bind(e),P.define=D,P.diff=c,(P.hyper=P).observe=Le,P.tagger=e,P.wire=(e,t)=>null==e?S(t||"html"):$e(e,t||"html"),P}(document);
export default hyperHTML;
export const {bind, define, diff, hyper, wire} = hyperHTML;
