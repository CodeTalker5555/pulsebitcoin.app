import{c9 as ze,n as p,bN as ve,ca as be,an as Ne,cb as J,a_ as C,au as Be,aq as z,ab as A,cc as se,bB as ce,cd as ye,ce as Ve,bF as Ke,bv as E,cf as Se,cg as Te,ch as Ce,V as g,bS as pe,bT as Ee,ci as Le,cj as He,ck as _e,bA as Pe,ae as x,b8 as Me,bw as P,bP as me,cl as he,bQ as Ue,cm as ge,bR as Ge,bU as Je,cn as Xe,co as Ye,cp as Ze,cq as we,cr as et,cs as tt,ct as nt,cu as lt,cv as ot,bJ as at,b$ as re,cw as it,cx as ut,cy as rt,cz as st}from"./index.134b1441.js";function de(){if(window.getSelection!==void 0){const e=window.getSelection();e.empty!==void 0?e.empty():e.removeAllRanges!==void 0&&(e.removeAllRanges(),ze.is.mobile!==!0&&e.addRange(document.createRange()))}else document.selection!==void 0&&document.selection.empty()}const We={target:{default:!0},noParentEvent:Boolean,contextMenu:Boolean};function Oe({showing:e,avoidEmit:t,configureAnchorEl:n}){const{props:o,proxy:l,emit:u}=A(),a=p(null);let s;function c(i){return a.value===null?!1:i===void 0||i.touches===void 0||i.touches.length<=1}const r={};n===void 0&&(Object.assign(r,{hide(i){l.hide(i)},toggle(i){l.toggle(i),i.qAnchorHandled=!0},toggleKey(i){ve(i,13)===!0&&r.toggle(i)},contextClick(i){l.hide(i),be(i),Ne(()=>{l.show(i),i.qAnchorHandled=!0})},prevent:be,mobileTouch(i){if(r.mobileCleanup(i),c(i)!==!0)return;l.hide(i),a.value.classList.add("non-selectable");const h=i.target;J(r,"anchor",[[h,"touchmove","mobileCleanup","passive"],[h,"touchend","mobileCleanup","passive"],[h,"touchcancel","mobileCleanup","passive"],[a.value,"contextmenu","prevent","notPassive"]]),s=setTimeout(()=>{l.show(i),i.qAnchorHandled=!0},300)},mobileCleanup(i){a.value.classList.remove("non-selectable"),clearTimeout(s),e.value===!0&&i!==void 0&&de()}}),n=function(i=o.contextMenu){if(o.noParentEvent===!0||a.value===null)return;let h;i===!0?l.$q.platform.is.mobile===!0?h=[[a.value,"touchstart","mobileTouch","passive"]]:h=[[a.value,"mousedown","hide","passive"],[a.value,"contextmenu","contextClick","notPassive"]]:h=[[a.value,"click","toggle","passive"],[a.value,"keyup","toggleKey","passive"]],J(r,"anchor",h)});function v(){se(r,"anchor")}function w(i){for(a.value=i;a.value.classList.contains("q-anchor--skip");)a.value=a.value.parentNode;n()}function y(){if(o.target===!1||o.target===""||l.$el.parentNode===null)a.value=null;else if(o.target===!0)w(l.$el.parentNode);else{let i=o.target;if(typeof o.target=="string")try{i=document.querySelector(o.target)}catch{i=void 0}i!=null?(a.value=i.$el||i,n()):(a.value=null,console.error(`Anchor: target "${o.target}" not found`))}}return C(()=>o.contextMenu,i=>{a.value!==null&&(v(),n(i))}),C(()=>o.target,()=>{a.value!==null&&v(),y()}),C(()=>o.noParentEvent,i=>{a.value!==null&&(i===!0?v():n())}),Be(()=>{y(),t!==!0&&o.modelValue===!0&&a.value===null&&u("update:modelValue",!1)}),z(()=>{clearTimeout(s),v()}),{anchorEl:a,canShow:c,anchorEvents:r}}function Re(e,t){const n=p(null);let o;function l(s,c){const r=`${c!==void 0?"add":"remove"}EventListener`,v=c!==void 0?c:o;s!==window&&s[r]("scroll",v,ce.passive),window[r]("scroll",v,ce.passive),o=c}function u(){n.value!==null&&(l(n.value),n.value=null)}const a=C(()=>e.noParentEvent,()=>{n.value!==null&&(u(),t())});return z(a),{localScrollTarget:n,unconfigureScrollTarget:u,changeScrollEvent:l}}let Ae;const{notPassiveCapture:X}=ce,_=[];function Y(e){clearTimeout(Ae);const t=e.target;if(t===void 0||t.nodeType===8||t.classList.contains("no-pointer-events")===!0)return;let n=ye.length-1;for(;n>=0;){const o=ye[n].$;if(o.type.name!=="QDialog")break;if(o.props.seamless!==!0)return;n--}for(let o=_.length-1;o>=0;o--){const l=_[o];if((l.anchorEl.value===null||l.anchorEl.value.contains(t)===!1)&&(t===document.body||l.innerRef.value!==null&&l.innerRef.value.contains(t)===!1))e.qClickOutside=!0,l.onClickOutside(e);else return}}function De(e){_.push(e),_.length===1&&(document.addEventListener("mousedown",Y,X),document.addEventListener("touchstart",Y,X))}function Z(e){const t=_.findIndex(n=>n===e);t>-1&&(_.splice(t,1),_.length===0&&(clearTimeout(Ae),document.removeEventListener("mousedown",Y,X),document.removeEventListener("touchstart",Y,X)))}let xe,qe;function ee(e){const t=e.split(" ");return t.length!==2?!1:["top","center","bottom"].includes(t[0])!==!0?(console.error("Anchor/Self position must start with one of top/center/bottom"),!1):["left","middle","right","start","end"].includes(t[1])!==!0?(console.error("Anchor/Self position must end with one of left/middle/right/start/end"),!1):!0}function $e(e){return e?!(e.length!==2||typeof e[0]!="number"||typeof e[1]!="number"):!0}const fe={"start#ltr":"left","start#rtl":"right","end#ltr":"right","end#rtl":"left"};["left","middle","right"].forEach(e=>{fe[`${e}#ltr`]=e,fe[`${e}#rtl`]=e});function te(e,t){const n=e.split(" ");return{vertical:n[0],horizontal:fe[`${n[1]}#${t===!0?"rtl":"ltr"}`]}}function ct(e,t){let{top:n,left:o,right:l,bottom:u,width:a,height:s}=e.getBoundingClientRect();return t!==void 0&&(n-=t[1],o-=t[0],u+=t[1],l+=t[0],a+=t[0],s+=t[1]),{top:n,left:o,right:l,bottom:u,width:a,height:s,middle:o+(l-o)/2,center:n+(u-n)/2}}function dt(e){return{top:0,center:e.offsetHeight/2,bottom:e.offsetHeight,left:0,middle:e.offsetWidth/2,right:e.offsetWidth}}function Fe(e){if(Ve.is.ios===!0&&window.visualViewport!==void 0){const s=document.body.style,{offsetLeft:c,offsetTop:r}=window.visualViewport;c!==xe&&(s.setProperty("--q-pe-left",c+"px"),xe=c),r!==qe&&(s.setProperty("--q-pe-top",r+"px"),qe=r)}let t;const{scrollLeft:n,scrollTop:o}=e.el;if(e.absoluteOffset===void 0)t=ct(e.anchorEl,e.cover===!0?[0,0]:e.offset);else{const{top:s,left:c}=e.anchorEl.getBoundingClientRect(),r=s+e.absoluteOffset.top,v=c+e.absoluteOffset.left;t={top:r,left:v,width:1,height:1,right:v+1,center:r,middle:v,bottom:r+1}}let l={maxHeight:e.maxHeight,maxWidth:e.maxWidth,visibility:"visible"};(e.fit===!0||e.cover===!0)&&(l.minWidth=t.width+"px",e.cover===!0&&(l.minHeight=t.height+"px")),Object.assign(e.el.style,l);const u=dt(e.el),a={top:t[e.anchorOrigin.vertical]-u[e.selfOrigin.vertical],left:t[e.anchorOrigin.horizontal]-u[e.selfOrigin.horizontal]};ft(a,t,u,e.anchorOrigin,e.selfOrigin),l={top:a.top+"px",left:a.left+"px"},a.maxHeight!==void 0&&(l.maxHeight=a.maxHeight+"px",t.height>a.maxHeight&&(l.minHeight=l.maxHeight)),a.maxWidth!==void 0&&(l.maxWidth=a.maxWidth+"px",t.width>a.maxWidth&&(l.minWidth=l.maxWidth)),Object.assign(e.el.style,l),e.el.scrollTop!==o&&(e.el.scrollTop=o),e.el.scrollLeft!==n&&(e.el.scrollLeft=n)}function ft(e,t,n,o,l){const u=n.bottom,a=n.right,s=Ke(),c=window.innerHeight-s,r=document.body.clientWidth;if(e.top<0||e.top+u>c)if(l.vertical==="center")e.top=t[o.vertical]>c/2?Math.max(0,c-u):0,e.maxHeight=Math.min(u,c);else if(t[o.vertical]>c/2){const v=Math.min(c,o.vertical==="center"?t.center:o.vertical===l.vertical?t.bottom:t.top);e.maxHeight=Math.min(u,v),e.top=Math.max(0,v-u)}else e.top=Math.max(0,o.vertical==="center"?t.center:o.vertical===l.vertical?t.top:t.bottom),e.maxHeight=Math.min(u,c-e.top);if(e.left<0||e.left+a>r)if(e.maxWidth=Math.min(a,r),l.horizontal==="middle")e.left=t[o.horizontal]>r/2?Math.max(0,r-a):0;else if(t[o.horizontal]>r/2){const v=Math.min(r,o.horizontal==="middle"?t.middle:o.horizontal===l.horizontal?t.right:t.left);e.maxWidth=Math.min(a,v),e.left=Math.max(0,v-e.maxWidth)}else e.left=Math.max(0,o.horizontal==="middle"?t.middle:o.horizontal===l.horizontal?t.left:t.right),e.maxWidth=Math.min(a,r-e.left)}var bt=E({name:"QTooltip",inheritAttrs:!1,props:{...We,...Se,...Te,maxHeight:{type:String,default:null},maxWidth:{type:String,default:null},transitionShow:{default:"jump-down"},transitionHide:{default:"jump-up"},anchor:{type:String,default:"bottom middle",validator:ee},self:{type:String,default:"top middle",validator:ee},offset:{type:Array,default:()=>[14,14],validator:$e},scrollTarget:{default:void 0},delay:{type:Number,default:0},hideDelay:{type:Number,default:0}},emits:[...Ce],setup(e,{slots:t,emit:n,attrs:o}){let l,u;const a=A(),{proxy:{$q:s}}=a,c=p(null),r=p(!1),v=g(()=>te(e.anchor,s.lang.rtl)),w=g(()=>te(e.self,s.lang.rtl)),y=g(()=>e.persistent!==!0),{registerTick:i,removeTick:h}=pe(),{registerTimeout:S,removeTimeout:q}=Ee(),{transition:d,transitionStyle:M}=Le(e,r),{localScrollTarget:W,changeScrollEvent:m,unconfigureScrollTarget:L}=Re(e,U),{anchorEl:k,canShow:ne,anchorEvents:B}=Oe({showing:r,configureAnchorEl:Q}),{show:le,hide:O}=He({showing:r,canShow:ne,handleShow:F,handleHide:N,hideOnRouteChange:y,processOnMount:!0});Object.assign(B,{delayShow:ae,delayHide:K});const{showPortal:D,hidePortal:$,renderPortal:oe}=_e(a,c,G);if(s.platform.is.mobile===!0){const b={anchorEl:k,innerRef:c,onClickOutside(T){return O(T),T.target.classList.contains("q-dialog__backdrop")&&me(T),!0}},I=g(()=>e.modelValue===null&&e.persistent!==!0&&r.value===!0);C(I,T=>{(T===!0?De:Z)(b)}),z(()=>{Z(b)})}function F(b){h(),q(),D(),i(()=>{u=new MutationObserver(()=>H()),u.observe(c.value,{attributes:!1,childList:!0,characterData:!0,subtree:!0}),H(),U()}),l===void 0&&(l=C(()=>s.screen.width+"|"+s.screen.height+"|"+e.self+"|"+e.anchor+"|"+s.lang.rtl,H)),S(()=>{D(!0),n("show",b)},e.transitionDuration)}function N(b){h(),q(),$(),V(),S(()=>{$(!0),n("hide",b)},e.transitionDuration)}function V(){u!==void 0&&(u.disconnect(),u=void 0),l!==void 0&&(l(),l=void 0),L(),se(B,"tooltipTemp")}function H(){const b=c.value;k.value===null||!b||Fe({el:b,offset:e.offset,anchorEl:k.value,anchorOrigin:v.value,selfOrigin:w.value,maxHeight:e.maxHeight,maxWidth:e.maxWidth})}function ae(b){if(s.platform.is.mobile===!0){de(),document.body.classList.add("non-selectable");const I=k.value,T=["touchmove","touchcancel","touchend","click"].map(R=>[I,R,"delayHide","passiveCapture"]);J(B,"tooltipTemp",T)}S(()=>{le(b)},e.delay)}function K(b){q(),s.platform.is.mobile===!0&&(se(B,"tooltipTemp"),de(),setTimeout(()=>{document.body.classList.remove("non-selectable")},10)),S(()=>{O(b)},e.hideDelay)}function Q(){if(e.noParentEvent===!0||k.value===null)return;const b=s.platform.is.mobile===!0?[[k.value,"touchstart","delayShow","passive"]]:[[k.value,"mouseenter","delayShow","passive"],[k.value,"mouseleave","delayHide","passive"]];J(B,"anchor",b)}function U(){if(k.value!==null||e.scrollTarget!==void 0){W.value=Pe(k.value,e.scrollTarget);const b=e.noParentEvent===!0?H:O;m(W.value,b)}}function ie(){return r.value===!0?x("div",{...o,ref:c,class:["q-tooltip q-tooltip--style q-position-engine no-pointer-events",o.class],style:[o.style,M.value],role:"complementary"},P(t.default)):null}function G(){return x(Me,{name:d.value,appear:!0},ie)}return z(V),Object.assign(a.proxy,{updatePosition:H}),oe}}),vt=E({name:"QBtnGroup",props:{unelevated:Boolean,outline:Boolean,flat:Boolean,rounded:Boolean,square:Boolean,push:Boolean,stretch:Boolean,glossy:Boolean,spread:Boolean},setup(e,{slots:t}){const n=g(()=>{const o=["unelevated","outline","flat","rounded","square","push","stretch","glossy"].filter(l=>e[l]===!0).map(l=>`q-btn-group--${l}`).join(" ");return`q-btn-group row no-wrap${o.length>0?" "+o:""}`+(e.spread===!0?" q-btn-group--spread":" inline")});return()=>x("div",{class:n.value},P(t.default))}});let mt=!1;{const e=document.createElement("div"),t=document.createElement("div");e.setAttribute("dir","rtl"),e.style.width="1px",e.style.height="1px",e.style.overflow="auto",t.style.width="1000px",t.style.height="1px",document.body.appendChild(e),e.appendChild(t),e.scrollLeft=-1e3,mt=e.scrollLeft>=0,e.remove()}function yt(e){return e.length!==42?null:`${e.slice(0,6)}...${e.slice(38)}`}function wt(e){return e.length!==66?null:`${e.slice(0,6)}...${e.slice(62)}`}const xt=Intl.NumberFormat("en",{notation:"compact"}),qt=Intl.NumberFormat("en-US"),kt=new Intl.NumberFormat("en",{maximumFractionDigits:0,minimumFractionDigits:0});var Bt=E({name:"QItemLabel",props:{overline:Boolean,caption:Boolean,header:Boolean,lines:[Number,String]},setup(e,{slots:t}){const n=g(()=>parseInt(e.lines,10)),o=g(()=>"q-item__label"+(e.overline===!0?" q-item__label--overline text-overline":"")+(e.caption===!0?" q-item__label--caption text-caption":"")+(e.header===!0?" q-item__label--header":"")+(n.value===1?" ellipsis":"")),l=g(()=>e.lines!==void 0&&n.value>1?{overflow:"hidden",display:"-webkit-box","-webkit-box-orient":"vertical","-webkit-line-clamp":n.value}:null);return()=>x("div",{style:l.value,class:o.value},P(t.default))}}),St=E({name:"QItemSection",props:{avatar:Boolean,thumbnail:Boolean,side:Boolean,top:Boolean,noWrap:Boolean},setup(e,{slots:t}){const n=g(()=>`q-item__section column q-item__section--${e.avatar===!0||e.side===!0||e.thumbnail===!0?"side":"main"}`+(e.top===!0?" q-item__section--top justify-start":" justify-center")+(e.avatar===!0?" q-item__section--avatar":"")+(e.thumbnail===!0?" q-item__section--thumbnail":"")+(e.noWrap===!0?" q-item__section--nowrap":""));return()=>x("div",{class:n.value},P(t.default))}}),Tt=E({name:"QItem",props:{...he,...Ue,tag:{type:String,default:"div"},active:{type:Boolean,default:null},clickable:Boolean,dense:Boolean,insetLevel:Number,tabindex:[String,Number],focused:Boolean,manualFocus:Boolean},emits:["click","keyup"],setup(e,{slots:t,emit:n}){const{proxy:{$q:o}}=A(),l=ge(e,o),{hasRouterLink:u,hasLink:a,linkProps:s,linkClass:c,linkTag:r,navigateToRouterLink:v}=Ge(),w=p(null),y=p(null),i=g(()=>e.clickable===!0||a.value===!0||e.tag==="label"),h=g(()=>e.disable!==!0&&i.value===!0),S=g(()=>"q-item q-item-type row no-wrap"+(e.dense===!0?" q-item--dense":"")+(l.value===!0?" q-item--dark":"")+(a.value===!0&&e.active===null?c.value:e.active===!0?`${e.activeClass!==void 0?` ${e.activeClass}`:""} q-item--active`:"")+(e.disable===!0?" disabled":"")+(h.value===!0?" q-item--clickable q-link cursor-pointer "+(e.manualFocus===!0?"q-manual-focusable":"q-focusable q-hoverable")+(e.focused===!0?" q-manual-focusable--focused":""):"")),q=g(()=>{if(e.insetLevel===void 0)return null;const m=o.lang.rtl===!0?"Right":"Left";return{["padding"+m]:16+e.insetLevel*56+"px"}});function d(m){h.value===!0&&(y.value!==null&&(m.qKeyEvent!==!0&&document.activeElement===w.value?y.value.focus():document.activeElement===y.value&&w.value.focus()),u.value===!0&&v(m),n("click",m))}function M(m){if(h.value===!0&&ve(m,13)===!0){me(m),m.qKeyEvent=!0;const L=new MouseEvent("click",m);L.qKeyEvent=!0,w.value.dispatchEvent(L)}n("keyup",m)}function W(){const m=Je(t.default,[]);return h.value===!0&&m.unshift(x("div",{class:"q-focus-helper",tabindex:-1,ref:y})),m}return()=>{const m={ref:w,class:S.value,style:q.value,onClick:d,onKeyup:M};return h.value===!0?(m.tabindex=e.tabindex||"0",Object.assign(m,s.value)):i.value===!0&&(m["aria-disabled"]="true"),x(r.value,m,W())}}}),Ct=E({name:"QList",props:{...he,bordered:Boolean,dense:Boolean,separator:Boolean,padding:Boolean},setup(e,{slots:t}){const n=A(),o=ge(e,n.proxy.$q),l=g(()=>"q-list"+(e.bordered===!0?" q-list--bordered":"")+(e.dense===!0?" q-list--dense":"")+(e.separator===!0?" q-list--separator":"")+(o.value===!0?" q-list--dark":"")+(e.padding===!0?" q-list--padding":""));return()=>x("div",{class:l.value},P(t.default))}}),ht=E({name:"QMenu",inheritAttrs:!1,props:{...We,...Se,...he,...Te,persistent:Boolean,autoClose:Boolean,separateClosePopup:Boolean,noRouteDismiss:Boolean,noRefocus:Boolean,noFocus:Boolean,fit:Boolean,cover:Boolean,square:Boolean,anchor:{type:String,validator:ee},self:{type:String,validator:ee},offset:{type:Array,validator:$e},scrollTarget:{default:void 0},touchPosition:Boolean,maxHeight:{type:String,default:null},maxWidth:{type:String,default:null}},emits:[...Ce,"click","escape-key"],setup(e,{slots:t,emit:n,attrs:o}){let l=null,u,a,s;const c=A(),{proxy:r}=c,{$q:v}=r,w=p(null),y=p(!1),i=g(()=>e.persistent!==!0&&e.noRouteDismiss!==!0),h=ge(e,v),{registerTick:S,removeTick:q}=pe(),{registerTimeout:d,removeTimeout:M}=Ee(),{transition:W,transitionStyle:m}=Le(e,y),{localScrollTarget:L,changeScrollEvent:k,unconfigureScrollTarget:ne}=Re(e,b),{anchorEl:B,canShow:le}=Oe({showing:y}),{hide:O}=He({showing:y,canShow:le,handleShow:U,handleHide:ie,hideOnRouteChange:i,processOnMount:!0}),{showPortal:D,hidePortal:$,renderPortal:oe}=_e(c,w,Qe),F={anchorEl:B,innerRef:w,onClickOutside(f){if(e.persistent!==!0&&y.value===!0)return O(f),(f.type==="touchstart"||f.target.classList.contains("q-dialog__backdrop"))&&me(f),!0}},N=g(()=>te(e.anchor||(e.cover===!0?"center middle":"bottom start"),v.lang.rtl)),V=g(()=>e.cover===!0?N.value:te(e.self||"top start",v.lang.rtl)),H=g(()=>(e.square===!0?" q-menu--square":"")+(h.value===!0?" q-menu--dark q-dark":"")),ae=g(()=>e.autoClose===!0?{onClick:I}:{}),K=g(()=>y.value===!0&&e.persistent!==!0);C(K,f=>{f===!0?(tt(R),De(F)):(we(R),Z(F))});function Q(){nt(()=>{let f=w.value;f&&f.contains(document.activeElement)!==!0&&(f=f.querySelector("[autofocus], [data-autofocus]")||f,f.focus({preventScroll:!0}))})}function U(f){if(q(),M(),l=e.noRefocus===!1?document.activeElement:null,Xe(T),D(),b(),u=void 0,f!==void 0&&(e.touchPosition||e.contextMenu)){const ue=Ye(f);if(ue.left!==void 0){const{top:Ie,left:je}=B.value.getBoundingClientRect();u={left:ue.left-je,top:ue.top-Ie}}}a===void 0&&(a=C(()=>v.screen.width+"|"+v.screen.height+"|"+e.self+"|"+e.anchor+"|"+v.lang.rtl,j)),e.noFocus!==!0&&document.activeElement.blur(),S(()=>{j(),e.noFocus!==!0&&Q()}),d(()=>{v.platform.is.ios===!0&&(s=e.autoClose,w.value.click()),j(),D(!0),n("show",f)},e.transitionDuration)}function ie(f){q(),M(),$(),G(!0),l!==null&&(f===void 0||f.qClickOutside!==!0)&&(l.focus(),l=null),d(()=>{$(!0),n("hide",f)},e.transitionDuration)}function G(f){u=void 0,a!==void 0&&(a(),a=void 0),(f===!0||y.value===!0)&&(Ze(T),ne(),Z(F),we(R)),f!==!0&&(l=null)}function b(){(B.value!==null||e.scrollTarget!==void 0)&&(L.value=Pe(B.value,e.scrollTarget),k(L.value,j))}function I(f){s!==!0?(et(r,f),n("click",f)):s=!1}function T(f){K.value===!0&&e.noFocus!==!0&&lt(w.value,f.target)!==!0&&Q()}function R(f){n("escape-key"),O(f)}function j(){const f=w.value;f===null||B.value===null||Fe({el:f,offset:e.offset,anchorEl:B.value,anchorOrigin:N.value,selfOrigin:V.value,absoluteOffset:u,fit:e.fit,cover:e.cover,maxHeight:e.maxHeight,maxWidth:e.maxWidth})}function Qe(){return x(Me,{name:W.value,appear:!0},()=>y.value===!0?x("div",{...o,ref:w,tabindex:-1,class:["q-menu q-position-engine scroll"+H.value,o.class],style:[o.style,m.value],...ae.value},P(t.default)):null)}return z(G),Object.assign(r,{focus:Q,updatePosition:j}),oe}}),pt=E({name:"QBtnDropdown",props:{...ot,modelValue:Boolean,split:Boolean,dropdownIcon:String,contentClass:[Array,String,Object],contentStyle:[Array,String,Object],cover:Boolean,persistent:Boolean,noRouteDismiss:Boolean,autoClose:Boolean,menuAnchor:{type:String,default:"bottom end"},menuSelf:{type:String,default:"top end"},menuOffset:Array,disableMainBtn:Boolean,disableDropdown:Boolean,noIconAnimation:Boolean},emits:["update:modelValue","click","before-show","show","before-hide","hide"],setup(e,{slots:t,emit:n}){const{proxy:o}=A(),l=p(e.modelValue),u=p(null),a=g(()=>{const d={"aria-expanded":l.value===!0?"true":"false","aria-haspopup":"true"};return(e.disable===!0||e.split===!1&&e.disableMainBtn===!0||e.disableDropdown===!0)&&(d["aria-disabled"]="true"),d}),s=g(()=>"q-btn-dropdown__arrow"+(l.value===!0&&e.noIconAnimation===!1?" rotate-180":"")+(e.split===!1?" q-btn-dropdown__arrow-container":""));C(()=>e.modelValue,d=>{u.value!==null&&u.value[d?"show":"hide"]()}),C(()=>e.split,q);function c(d){l.value=!0,n("before-show",d)}function r(d){n("show",d),n("update:modelValue",!0)}function v(d){l.value=!1,n("before-hide",d)}function w(d){n("hide",d),n("update:modelValue",!1)}function y(d){n("click",d)}function i(d){it(d),q(),n("click",d)}function h(d){u.value!==null&&u.value.toggle(d)}function S(d){u.value!==null&&u.value.show(d)}function q(d){u.value!==null&&u.value.hide(d)}return Object.assign(o,{show:S,hide:q,toggle:h}),Be(()=>{e.modelValue===!0&&S()}),()=>{const d=[x(at,{class:s.value,name:e.dropdownIcon||o.$q.iconSet.arrow.dropdown})];return e.disableDropdown!==!0&&d.push(x(ht,{ref:u,class:e.contentClass,style:e.contentStyle,cover:e.cover,fit:!0,persistent:e.persistent,noRouteDismiss:e.noRouteDismiss,autoClose:e.autoClose,anchor:e.menuAnchor,self:e.menuSelf,offset:e.menuOffset,separateClosePopup:!0,onBeforeShow:c,onShow:r,onBeforeHide:v,onHide:w},t.default)),e.split===!1?x(re,{class:"q-btn-dropdown q-btn-dropdown--simple",...e,disable:e.disable===!0||e.disableMainBtn===!0,noWrap:!0,round:!1,...a.value,onClick:y},()=>P(t.label,[]).concat(d)):x(vt,{class:"q-btn-dropdown q-btn-dropdown--split no-wrap q-btn-item",outline:e.outline,flat:e.flat,rounded:e.rounded,square:e.square,push:e.push,unelevated:e.unelevated,glossy:e.glossy,stretch:e.stretch},()=>[x(re,{class:"q-btn-dropdown--current",...e,disable:e.disable===!0||e.disableMainBtn===!0,noWrap:!0,iconRight:e.iconRight,round:!1,onClick:i},t.label),x(re,{class:"q-btn-dropdown__arrow-container q-anchor--skip",...a.value,disable:e.disable===!0||e.disableDropdown===!0,outline:e.outline,flat:e.flat,rounded:e.rounded,push:e.push,size:e.size,color:e.color,textColor:e.textColor,dense:e.dense,ripple:e.ripple},()=>d)])}}});function ke(e){if(e===!1)return 0;if(e===!0||e===void 0)return 1;const t=parseInt(e,10);return isNaN(t)?0:t}var Et=ut({name:"close-popup",beforeMount(e,{value:t}){const n={depth:ke(t),handler(o){n.depth!==0&&setTimeout(()=>{const l=rt(e);l!==void 0&&st(l,o,n.depth)})},handlerKey(o){ve(o,13)===!0&&n.handler(o)}};e.__qclosepopup=n,e.addEventListener("click",n.handler),e.addEventListener("keyup",n.handlerKey)},updated(e,{value:t,oldValue:n}){t!==n&&(e.__qclosepopup.depth=ke(t))},beforeUnmount(e){const t=e.__qclosepopup;e.removeEventListener("click",t.handler),e.removeEventListener("keyup",t.handlerKey),delete e.__qclosepopup}});export{Et as C,vt as Q,bt as a,pt as b,Ct as c,Tt as d,St as e,Bt as f,ht as g,qt as h,wt as i,yt as j,kt as k,xt as n,mt as r};
