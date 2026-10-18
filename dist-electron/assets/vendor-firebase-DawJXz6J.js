import{o as Bm,_ as ka}from"./vendor-libs-DYvsOzI3.js";var _u={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fh=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},qm=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=n[t++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=n[t++],o=n[t++],a=n[t++],c=((i&7)<<18|(s&63)<<12|(o&63)<<6|a&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const s=n[t++],o=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},ph={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){const s=n[i],o=i+1<n.length,a=o?n[i+1]:0,c=i+2<n.length,u=c?n[i+2]:0,l=s>>2,h=(s&3)<<4|a>>4;let d=(a&15)<<2|u>>6,f=u&63;c||(f=64,o||(d=64)),r.push(t[l],t[h],t[d],t[f])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(fh(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):qm(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){const s=t[n.charAt(i++)],a=i<n.length?t[n.charAt(i)]:0;++i;const u=i<n.length?t[n.charAt(i)]:64;++i;const h=i<n.length?t[n.charAt(i)]:64;if(++i,s==null||a==null||u==null||h==null)throw new $m;const d=s<<2|a>>4;if(r.push(d),u!==64){const f=a<<4&240|u>>2;if(r.push(f),h!==64){const I=u<<6&192|h;r.push(I)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class $m extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Gm=function(n){const e=fh(n);return ph.encodeByteArray(e,!0)},_s=function(n){return Gm(n).replace(/\./g,"")},mh=function(n){try{return ph.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jm(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zm=()=>jm().__FIREBASE_DEFAULTS__,Km=()=>{if(typeof process>"u"||typeof _u>"u")return;const n=_u.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Hm=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&mh(n[1]);return e&&JSON.parse(e)},Gs=()=>{try{return zm()||Km()||Hm()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Wm=n=>{var e,t;return(t=(e=Gs())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},Na=n=>{const e=Wm(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},gh=()=>{var n;return(n=Gs())===null||n===void 0?void 0:n.config},Qm=n=>{var e;return(e=Gs())===null||e===void 0?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ym{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _h(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",i=n.iat||0,s=n.sub||n.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}}},n);return[_s(JSON.stringify(t)),_s(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ue(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Jm(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ue())}function Xm(){var n;const e=(n=Gs())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Zm(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function eg(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function tg(){const n=ue();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function yh(){return!Xm()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Ih(){try{return typeof indexedDB=="object"}catch{return!1}}function ng(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var s;e(((s=i.error)===null||s===void 0?void 0:s.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rg="FirebaseError";class je extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=rg,Object.setPrototypeOf(this,je.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ii.prototype.create)}}class Ii{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?ig(s,r):"Error",a=`${this.serviceName}: ${o} (${i}).`;return new je(i,a,r)}}function ig(n,e){return n.replace(sg,(t,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const sg=/\{\$([^}]+)}/g;function og(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function Ct(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const i of t){if(!r.includes(i))return!1;const s=n[i],o=e[i];if(yu(s)&&yu(o)){if(!Ct(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!t.includes(i))return!1;return!0}function yu(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ei(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function xr(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,s]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function Or(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function ag(n,e){const t=new cg(n,e);return t.subscribe.bind(t)}class cg{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");ug(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=Do),i.error===void 0&&(i.error=Do),i.complete===void 0&&(i.complete=Do);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function ug(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Do(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function M(n){return n&&n._delegate?n._delegate:n}class st{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yt="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lg{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Ym;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(dg(e))try{this.getOrInitializeService({instanceIdentifier:Yt})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=Yt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Yt){return this.instances.has(e)}getOptions(e=Yt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[s,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(s);r===a&&o.resolve(i)}return i}onInit(e,t){var r;const i=this.normalizeInstanceIdentifier(t),s=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;s.add(e),this.onInitCallbacks.set(i,s);const o=this.instances.get(i);return o&&e(o,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:hg(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Yt){return this.component?this.component.multipleInstances?e:Yt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function hg(n){return n===Yt?void 0:n}function dg(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fg{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new lg(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var F;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(F||(F={}));const pg={debug:F.DEBUG,verbose:F.VERBOSE,info:F.INFO,warn:F.WARN,error:F.ERROR,silent:F.SILENT},mg=F.INFO,gg={[F.DEBUG]:"log",[F.VERBOSE]:"log",[F.INFO]:"info",[F.WARN]:"warn",[F.ERROR]:"error"},_g=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),i=gg[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class xa{constructor(e){this.name=e,this._logLevel=mg,this._logHandler=_g,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in F))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?pg[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,F.DEBUG,...e),this._logHandler(this,F.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,F.VERBOSE,...e),this._logHandler(this,F.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,F.INFO,...e),this._logHandler(this,F.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,F.WARN,...e),this._logHandler(this,F.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,F.ERROR,...e),this._logHandler(this,F.ERROR,...e)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yg{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Ig(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function Ig(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Wo="@firebase/app",Iu="0.9.28";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ln=new xa("@firebase/app"),Eg="@firebase/app-compat",Tg="@firebase/analytics-compat",wg="@firebase/analytics",vg="@firebase/app-check-compat",Ag="@firebase/app-check",Rg="@firebase/auth",Pg="@firebase/auth-compat",Sg="@firebase/database",bg="@firebase/database-compat",Cg="@firebase/functions",Dg="@firebase/functions-compat",Vg="@firebase/installations",kg="@firebase/installations-compat",Ng="@firebase/messaging",xg="@firebase/messaging-compat",Og="@firebase/performance",Lg="@firebase/performance-compat",Mg="@firebase/remote-config",Fg="@firebase/remote-config-compat",Ug="@firebase/storage",Bg="@firebase/storage-compat",qg="@firebase/firestore",$g="@firebase/firestore-compat",Gg="firebase",jg="10.8.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ys="[DEFAULT]",zg={[Wo]:"fire-core",[Eg]:"fire-core-compat",[wg]:"fire-analytics",[Tg]:"fire-analytics-compat",[Ag]:"fire-app-check",[vg]:"fire-app-check-compat",[Rg]:"fire-auth",[Pg]:"fire-auth-compat",[Sg]:"fire-rtdb",[bg]:"fire-rtdb-compat",[Cg]:"fire-fn",[Dg]:"fire-fn-compat",[Vg]:"fire-iid",[kg]:"fire-iid-compat",[Ng]:"fire-fcm",[xg]:"fire-fcm-compat",[Og]:"fire-perf",[Lg]:"fire-perf-compat",[Mg]:"fire-rc",[Fg]:"fire-rc-compat",[Ug]:"fire-gcs",[Bg]:"fire-gcs-compat",[qg]:"fire-fst",[$g]:"fire-fst-compat","fire-js":"fire-js",[Gg]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Is=new Map,Qo=new Map;function Kg(n,e){try{n.container.addComponent(e)}catch(t){ln.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Dt(n){const e=n.name;if(Qo.has(e))return ln.debug(`There were multiple attempts to register component ${e}.`),!1;Qo.set(e,n);for(const t of Is.values())Kg(t,n);return!0}function cr(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Hg(n,e,t=ys){cr(n,e).clearInstance(t)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wg={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}."},St=new Ii("app","Firebase",Wg);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qg{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new st("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw St.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const An=jg;function Yg(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:ys,automaticDataCollectionEnabled:!1},e),i=r.name;if(typeof i!="string"||!i)throw St.create("bad-app-name",{appName:String(i)});if(t||(t=gh()),!t)throw St.create("no-options");const s=Is.get(i);if(s){if(Ct(t,s.options)&&Ct(r,s.config))return s;throw St.create("duplicate-app",{appName:i})}const o=new fg(i);for(const c of Qo.values())o.addComponent(c);const a=new Qg(t,r,o);return Is.set(i,a),a}function Oa(n=ys){const e=Is.get(n);if(!e&&n===ys&&gh())return Yg();if(!e)throw St.create("no-app",{appName:n});return e}function Be(n,e,t){var r;let i=(r=zg[n])!==null&&r!==void 0?r:n;t&&(i+=`-${t}`);const s=i.match(/\s|\//),o=e.match(/\s|\//);if(s||o){const a=[`Unable to register library "${i}" with version "${e}":`];s&&a.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&o&&a.push("and"),o&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),ln.warn(a.join(" "));return}Dt(new st(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jg="firebase-heartbeat-database",Xg=1,Yr="firebase-heartbeat-store";let Vo=null;function Eh(){return Vo||(Vo=Bm(Jg,Xg,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Yr)}catch(t){console.warn(t)}}}}).catch(n=>{throw St.create("idb-open",{originalErrorMessage:n.message})})),Vo}async function Zg(n){try{const t=(await Eh()).transaction(Yr),r=await t.objectStore(Yr).get(Th(n));return await t.done,r}catch(e){if(e instanceof je)ln.warn(e.message);else{const t=St.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});ln.warn(t.message)}}}async function Eu(n,e){try{const r=(await Eh()).transaction(Yr,"readwrite");await r.objectStore(Yr).put(e,Th(n)),await r.done}catch(t){if(t instanceof je)ln.warn(t.message);else{const r=St.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});ln.warn(r.message)}}}function Th(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const e_=1024,t_=720*60*60*1e3;class n_{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new i_(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=Tu();if(!(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null))&&!(this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s)))return this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(o=>{const a=new Date(o.date).valueOf();return Date.now()-a<=t_}),this._storage.overwrite(this._heartbeatsCache)}async getHeartbeatsHeader(){var e;if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Tu(),{heartbeatsToSend:r,unsentEntries:i}=r_(this._heartbeatsCache.heartbeats),s=_s(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}}function Tu(){return new Date().toISOString().substring(0,10)}function r_(n,e=e_){const t=[];let r=n.slice();for(const i of n){const s=t.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),wu(t)>e){s.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),wu(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class i_{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ih()?ng().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Zg(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return Eu(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return Eu(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function wu(n){return _s(JSON.stringify({version:2,heartbeats:n})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function s_(n){Dt(new st("platform-logger",e=>new yg(e),"PRIVATE")),Dt(new st("heartbeat",e=>new n_(e),"PRIVATE")),Be(Wo,Iu,n),Be(Wo,Iu,"esm2017"),Be("fire-js","")}s_("");var o_="firebase",a_="10.8.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Be(o_,a_,"app");function wh(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const c_=wh,vh=new Ii("auth","Firebase",wh());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Es=new xa("@firebase/auth");function u_(n,...e){Es.logLevel<=F.WARN&&Es.warn(`Auth (${An}): ${n}`,...e)}function ss(n,...e){Es.logLevel<=F.ERROR&&Es.error(`Auth (${An}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qe(n,...e){throw La(n,...e)}function Xe(n,...e){return La(n,...e)}function Ah(n,e,t){const r=Object.assign(Object.assign({},c_()),{[e]:t});return new Ii("auth","Firebase",r).create(e,{appName:n.name})}function l_(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&qe(n,"argument-error"),Ah(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function La(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return vh.create(n,...e)}function V(n,e,...t){if(!n)throw La(e,...t)}function tt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw ss(e),new Error(e)}function ot(n,e){n||tt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yo(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function h_(){return vu()==="http:"||vu()==="https:"}function vu(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function d_(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(h_()||Zm()||"connection"in navigator)?navigator.onLine:!0}function f_(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ti{constructor(e,t){this.shortDelay=e,this.longDelay=t,ot(t>e,"Short delay should be less than long delay!"),this.isMobile=Jm()||eg()}get(){return d_()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ma(n,e){ot(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rh{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;tt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;tt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;tt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const p_={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const m_=new Ti(3e4,6e4);function ut(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function ze(n,e,t,r,i={}){return Ph(n,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});const a=Ei(Object.assign({key:n.config.apiKey},o)).slice(1),c=await n._getAdditionalHeaders();return c["Content-Type"]="application/json",n.languageCode&&(c["X-Firebase-Locale"]=n.languageCode),Rh.fetch()(Sh(n,n.config.apiHost,t,a),Object.assign({method:e,headers:c,referrerPolicy:"no-referrer"},s))})}async function Ph(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},p_),e);try{const i=new __(n),s=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw zi(n,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const a=s.ok?o.errorMessage:o.error.message,[c,u]=a.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw zi(n,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw zi(n,"email-already-in-use",o);if(c==="USER_DISABLED")throw zi(n,"user-disabled",o);const l=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw Ah(n,l,u);qe(n,l)}}catch(i){if(i instanceof je)throw i;qe(n,"network-request-failed",{message:String(i)})}}async function wi(n,e,t,r,i={}){const s=await ze(n,e,t,r,i);return"mfaPendingCredential"in s&&qe(n,"multi-factor-auth-required",{_serverResponse:s}),s}function Sh(n,e,t,r){const i=`${e}${t}?${r}`;return n.config.emulator?Ma(n.config,i):`${n.config.apiScheme}://${i}`}function g_(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class __{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(Xe(this.auth,"network-request-failed")),m_.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function zi(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const i=Xe(n,e,r);return i.customData._tokenResponse=t,i}function Au(n){return n!==void 0&&n.enterprise!==void 0}class y_{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return g_(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}}async function I_(n,e){return ze(n,"GET","/v2/recaptchaConfig",ut(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function E_(n,e){return ze(n,"POST","/v1/accounts:delete",e)}async function T_(n,e){return ze(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qr(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function w_(n,e=!1){const t=M(n),r=await t.getIdToken(e),i=Fa(r);V(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:qr(ko(i.auth_time)),issuedAtTime:qr(ko(i.iat)),expirationTime:qr(ko(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function ko(n){return Number(n)*1e3}function Fa(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return ss("JWT malformed, contained fewer than 3 sections"),null;try{const i=mh(t);return i?JSON.parse(i):(ss("Failed to decode base64 JWT payload"),null)}catch(i){return ss("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function v_(n){const e=Fa(n);return V(e,"internal-error"),V(typeof e.exp<"u","internal-error"),V(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hn(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof je&&A_(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function A_({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class R_{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const i=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bh{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=qr(this.lastLoginAt),this.creationTime=qr(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Jr(n){var e;const t=n.auth,r=await n.getIdToken(),i=await hn(n,T_(t,{idToken:r}));V(i==null?void 0:i.users.length,t,"internal-error");const s=i.users[0];n._notifyReloadListener(s);const o=!((e=s.providerUserInfo)===null||e===void 0)&&e.length?b_(s.providerUserInfo):[],a=S_(n.providerData,o),c=n.isAnonymous,u=!(n.email&&s.passwordHash)&&!(a!=null&&a.length),l=c?u:!1,h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:a,metadata:new bh(s.createdAt,s.lastLoginAt),isAnonymous:l};Object.assign(n,h)}async function P_(n){const e=M(n);await Jr(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function S_(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function b_(n){return n.map(e=>{var{providerId:t}=e,r=ka(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function C_(n,e){const t=await Ph(n,{},async()=>{const r=Ei({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=n.config,o=Sh(n,i,"/v1/token",`key=${s}`),a=await n._getAdditionalHeaders();return a["Content-Type"]="application/x-www-form-urlencoded",Rh.fetch()(o,{method:"POST",headers:a,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function D_(n,e){return ze(n,"POST","/v2/accounts:revokeToken",ut(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xr{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){V(e.idToken,"internal-error"),V(typeof e.idToken<"u","internal-error"),V(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):v_(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}async getToken(e,t=!1){return V(!this.accessToken||this.refreshToken,e,"user-token-expired"),!t&&this.accessToken&&!this.isExpired?this.accessToken:this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:i,expiresIn:s}=await C_(e,t);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:i,expirationTime:s}=t,o=new Xr;return r&&(V(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(V(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(V(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Xr,this.toJSON())}_performRefresh(){return tt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pt(n,e){V(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class on{constructor(e){var{uid:t,auth:r,stsTokenManager:i}=e,s=ka(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new R_(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new bh(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await hn(this,this.stsTokenManager.getToken(this.auth,e));return V(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return w_(this,e)}reload(){return P_(this)}_assign(e){this!==e&&(V(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new on(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){V(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await Jr(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){const e=await this.getIdToken();return await hn(this,E_(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,i,s,o,a,c,u,l;const h=(r=t.displayName)!==null&&r!==void 0?r:void 0,d=(i=t.email)!==null&&i!==void 0?i:void 0,f=(s=t.phoneNumber)!==null&&s!==void 0?s:void 0,I=(o=t.photoURL)!==null&&o!==void 0?o:void 0,E=(a=t.tenantId)!==null&&a!==void 0?a:void 0,y=(c=t._redirectEventId)!==null&&c!==void 0?c:void 0,P=(u=t.createdAt)!==null&&u!==void 0?u:void 0,C=(l=t.lastLoginAt)!==null&&l!==void 0?l:void 0,{uid:A,emailVerified:D,isAnonymous:$,providerData:O,stsTokenManager:Z}=t;V(A&&Z,e,"internal-error");const we=Xr.fromJSON(this.name,Z);V(typeof A=="string",e,"internal-error"),pt(h,e.name),pt(d,e.name),V(typeof D=="boolean",e,"internal-error"),V(typeof $=="boolean",e,"internal-error"),pt(f,e.name),pt(I,e.name),pt(E,e.name),pt(y,e.name),pt(P,e.name),pt(C,e.name);const Rr=new on({uid:A,auth:e,email:d,emailVerified:D,displayName:h,isAnonymous:$,photoURL:I,phoneNumber:f,tenantId:E,stsTokenManager:we,createdAt:P,lastLoginAt:C});return O&&Array.isArray(O)&&(Rr.providerData=O.map(ji=>Object.assign({},ji))),y&&(Rr._redirectEventId=y),Rr}static async _fromIdTokenResponse(e,t,r=!1){const i=new Xr;i.updateFromServerResponse(t);const s=new on({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await Jr(s),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ru=new Map;function nt(n){ot(n instanceof Function,"Expected a class definition");let e=Ru.get(n);return e?(ot(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Ru.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ch{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Ch.type="NONE";const Pu=Ch;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function os(n,e,t){return`firebase:${n}:${e}:${t}`}class Un{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=os(this.userKey,i.apiKey,s),this.fullPersistenceKey=os("persistence",i.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?on._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new Un(nt(Pu),e,r);const i=(await Promise.all(t.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let s=i[0]||nt(Pu);const o=os(r,e.config.apiKey,e.name);let a=null;for(const u of t)try{const l=await u._get(o);if(l){const h=on._fromJSON(e,l);u!==s&&(a=h),s=u;break}}catch{}const c=i.filter(u=>u._shouldAllowMigration);return!s._shouldAllowMigration||!c.length?new Un(s,e,r):(s=c[0],a&&await s._set(o,a.toJSON()),await Promise.all(t.map(async u=>{if(u!==s)try{await u._remove(o)}catch{}})),new Un(s,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Su(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(kh(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Dh(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(xh(e))return"Blackberry";if(Oh(e))return"Webos";if(Ua(e))return"Safari";if((e.includes("chrome/")||Vh(e))&&!e.includes("edge/"))return"Chrome";if(Nh(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Dh(n=ue()){return/firefox\//i.test(n)}function Ua(n=ue()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Vh(n=ue()){return/crios\//i.test(n)}function kh(n=ue()){return/iemobile/i.test(n)}function Nh(n=ue()){return/android/i.test(n)}function xh(n=ue()){return/blackberry/i.test(n)}function Oh(n=ue()){return/webos/i.test(n)}function js(n=ue()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function V_(n=ue()){var e;return js(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function k_(){return tg()&&document.documentMode===10}function Lh(n=ue()){return js(n)||Nh(n)||Oh(n)||xh(n)||/windows phone/i.test(n)||kh(n)}function N_(){try{return!!(window&&window!==window.top)}catch{return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mh(n,e=[]){let t;switch(n){case"Browser":t=Su(ue());break;case"Worker":t=`${Su(ue())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${An}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x_{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=s=>new Promise((o,a)=>{try{const c=e(s);o(c)}catch(c){a(c)}});r.onAbort=t,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function O_(n,e={}){return ze(n,"GET","/v2/passwordPolicy",ut(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const L_=6;class M_{constructor(e){var t,r,i,s;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=o.minPasswordLength)!==null&&t!==void 0?t:L_,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(s=e.forceUpgradeOnSignin)!==null&&s!==void 0?s:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,i,s,o,a;const c={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,c),this.validatePasswordCharacterOptions(e,c),c.isValid&&(c.isValid=(t=c.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),c.isValid&&(c.isValid=(r=c.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),c.isValid&&(c.isValid=(i=c.containsLowercaseLetter)!==null&&i!==void 0?i:!0),c.isValid&&(c.isValid=(s=c.containsUppercaseLetter)!==null&&s!==void 0?s:!0),c.isValid&&(c.isValid=(o=c.containsNumericCharacter)!==null&&o!==void 0?o:!0),c.isValid&&(c.isValid=(a=c.containsNonAlphanumericCharacter)!==null&&a!==void 0?a:!0),c}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F_{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new bu(this),this.idTokenSubscription=new bu(this),this.beforeStateQueue=new x_(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=vh,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=nt(t)),this._initializationPromise=this.queue(async()=>{var r,i;if(!this._deleted&&(this.persistenceManager=await Un.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)===null||i===void 0?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUser(e){var t;const r=await this.assertedPersistence.getCurrentUser();let i=r,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,a=i==null?void 0:i._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===a)&&(c!=null&&c.user)&&(i=c.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return V(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Jr(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=f_()}async _delete(){this._deleted=!0}async updateCurrentUser(e){const t=e?M(e):null;return t&&V(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&V(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0)}setPersistence(e){return this.queue(async()=>{await this.assertedPersistence.setPersistence(nt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await O_(this),t=new M_(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new Ii("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await D_(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&nt(e)||this._popupRedirectResolver;V(t,this,"argument-error"),this.redirectPersistenceManager=await Un.create(this,[nt(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};const s=typeof t=="function"?t:t.next.bind(t);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(V(a,this,"internal-error"),a.then(()=>{o||s(this.currentUser)}),typeof t=="function"){const c=e.addObserver(t,r,i);return()=>{o=!0,c()}}else{const c=e.addObserver(t);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return V(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Mh(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const i=await this._getAppCheckToken();return i&&(t["X-Firebase-AppCheck"]=i),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&u_(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function Ut(n){return M(n)}class bu{constructor(e){this.auth=e,this.observer=null,this.addObserver=ag(t=>this.observer=t)}get next(){return V(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let zs={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function U_(n){zs=n}function Fh(n){return zs.loadJS(n)}function B_(){return zs.recaptchaEnterpriseScript}function q_(){return zs.gapiScript}function $_(n){return`__${n}${Math.floor(Math.random()*1e6)}`}const G_="recaptcha-enterprise",j_="NO_RECAPTCHA";class z_{constructor(e){this.type=G_,this.auth=Ut(e)}async verify(e="verify",t=!1){async function r(s){if(!t){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(o,a)=>{I_(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)a(new Error("recaptcha Enterprise site key undefined"));else{const u=new y_(c);return s.tenantId==null?s._agentRecaptchaConfig=u:s._tenantRecaptchaConfigs[s.tenantId]=u,o(u.siteKey)}}).catch(c=>{a(c)})})}function i(s,o,a){const c=window.grecaptcha;Au(c)?c.enterprise.ready(()=>{c.enterprise.execute(s,{action:e}).then(u=>{o(u)}).catch(()=>{o(j_)})}):a(Error("No reCAPTCHA enterprise script loaded."))}return new Promise((s,o)=>{r(this.auth).then(a=>{if(!t&&Au(window.grecaptcha))i(a,s,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let c=B_();c.length!==0&&(c+=a),Fh(c).then(()=>{i(a,s,o)}).catch(u=>{o(u)})}}).catch(a=>{o(a)})})}}async function Cu(n,e,t,r=!1){const i=new z_(n);let s;try{s=await i.verify(t)}catch{s=await i.verify(t,!0)}const o=Object.assign({},e);return r?Object.assign(o,{captchaResp:s}):Object.assign(o,{captchaResponse:s}),Object.assign(o,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(o,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),o}async function Ts(n,e,t,r){var i;if(!((i=n._getRecaptchaConfig())===null||i===void 0)&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const s=await Cu(n,e,t,t==="getOobCode");return r(n,s)}else return r(n,e).catch(async s=>{if(s.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const o=await Cu(n,e,t,t==="getOobCode");return r(n,o)}else return Promise.reject(s)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _P(n,e){const t=cr(n,"auth");if(t.isInitialized()){const i=t.getImmediate(),s=t.getOptions();if(Ct(s,e??{}))return i;qe(i,"already-initialized")}return t.initialize({options:e})}function K_(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(nt);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ba{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return tt("not implemented")}_getIdTokenResponse(e){return tt("not implemented")}_linkToIdToken(e,t){return tt("not implemented")}_getReauthenticationResolver(e){return tt("not implemented")}}async function H_(n,e){return ze(n,"POST","/v1/accounts:update",e)}async function W_(n,e){return ze(n,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Q_(n,e){return wi(n,"POST","/v1/accounts:signInWithPassword",ut(n,e))}async function Uh(n,e){return ze(n,"POST","/v1/accounts:sendOobCode",ut(n,e))}async function Y_(n,e){return Uh(n,e)}async function J_(n,e){return Uh(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function X_(n,e){return wi(n,"POST","/v1/accounts:signInWithEmailLink",ut(n,e))}async function Z_(n,e){return wi(n,"POST","/v1/accounts:signInWithEmailLink",ut(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zr extends Ba{constructor(e,t,r,i=null){super("password",r),this._email=e,this._password=t,this._tenantId=i}static _fromEmailAndPassword(e,t){return new Zr(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new Zr(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Ts(e,t,"signInWithPassword",Q_);case"emailLink":return X_(e,{email:this._email,oobCode:this._password});default:qe(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Ts(e,r,"signUpPassword",W_);case"emailLink":return Z_(e,{idToken:t,email:this._email,oobCode:this._password});default:qe(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Bn(n,e){return wi(n,"POST","/v1/accounts:signInWithIdp",ut(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ey="http://localhost";class dn extends Ba{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new dn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):qe("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i}=t,s=ka(t,["providerId","signInMethod"]);if(!r||!i)return null;const o=new dn(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Bn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Bn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Bn(e,t)}buildRequest(){const e={requestUri:ey,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Ei(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ty(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function ny(n){const e=xr(Or(n)).link,t=e?xr(Or(e)).deep_link_id:null,r=xr(Or(n)).deep_link_id;return(r?xr(Or(r)).link:null)||r||t||e||n}class qa{constructor(e){var t,r,i,s,o,a;const c=xr(Or(e)),u=(t=c.apiKey)!==null&&t!==void 0?t:null,l=(r=c.oobCode)!==null&&r!==void 0?r:null,h=ty((i=c.mode)!==null&&i!==void 0?i:null);V(u&&l&&h,"argument-error"),this.apiKey=u,this.operation=h,this.code=l,this.continueUrl=(s=c.continueUrl)!==null&&s!==void 0?s:null,this.languageCode=(o=c.languageCode)!==null&&o!==void 0?o:null,this.tenantId=(a=c.tenantId)!==null&&a!==void 0?a:null}static parseLink(e){const t=ny(e);try{return new qa(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ur{constructor(){this.providerId=ur.PROVIDER_ID}static credential(e,t){return Zr._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=qa.parseLink(t);return V(r,"argument-error"),Zr._fromEmailAndCode(e,r.code,r.tenantId)}}ur.PROVIDER_ID="password";ur.EMAIL_PASSWORD_SIGN_IN_METHOD="password";ur.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $a{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vi extends $a{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _t extends vi{constructor(){super("facebook.com")}static credential(e){return dn._fromParams({providerId:_t.PROVIDER_ID,signInMethod:_t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return _t.credentialFromTaggedObject(e)}static credentialFromError(e){return _t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return _t.credential(e.oauthAccessToken)}catch{return null}}}_t.FACEBOOK_SIGN_IN_METHOD="facebook.com";_t.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yt extends vi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return dn._fromParams({providerId:yt.PROVIDER_ID,signInMethod:yt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return yt.credentialFromTaggedObject(e)}static credentialFromError(e){return yt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return yt.credential(t,r)}catch{return null}}}yt.GOOGLE_SIGN_IN_METHOD="google.com";yt.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class It extends vi{constructor(){super("github.com")}static credential(e){return dn._fromParams({providerId:It.PROVIDER_ID,signInMethod:It.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return It.credentialFromTaggedObject(e)}static credentialFromError(e){return It.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return It.credential(e.oauthAccessToken)}catch{return null}}}It.GITHUB_SIGN_IN_METHOD="github.com";It.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Et extends vi{constructor(){super("twitter.com")}static credential(e,t){return dn._fromParams({providerId:Et.PROVIDER_ID,signInMethod:Et.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Et.credentialFromTaggedObject(e)}static credentialFromError(e){return Et.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return Et.credential(t,r)}catch{return null}}}Et.TWITTER_SIGN_IN_METHOD="twitter.com";Et.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ry(n,e){return wi(n,"POST","/v1/accounts:signUp",ut(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,i=!1){const s=await on._fromIdTokenResponse(e,r,i),o=Du(r);return new fn({user:s,providerId:o,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const i=Du(r);return new fn({user:e,providerId:i,_tokenResponse:r,operationType:t})}}function Du(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ws extends je{constructor(e,t,r,i){var s;super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,ws.prototype),this.customData={appName:e.name,tenantId:(s=e.tenantId)!==null&&s!==void 0?s:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new ws(e,t,r,i)}}function Bh(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?ws._fromErrorAndOperation(n,s,e,r):s})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iy(n){return new Set(n.map(({providerId:e})=>e).filter(e=>!!e))}async function qh(n,e,t=!1){const r=await hn(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return fn._forOperation(n,"link",r)}async function sy(n,e,t){await Jr(e);const r=iy(e.providerData);V(r.has(t)===n,e.auth,"provider-already-linked")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function oy(n,e,t=!1){const{auth:r}=n,i="reauthenticate";try{const s=await hn(n,Bh(r,i,e,n),t);V(s.idToken,r,"internal-error");const o=Fa(s.idToken);V(o,r,"internal-error");const{sub:a}=o;return V(n.uid===a,r,"user-mismatch"),fn._forOperation(n,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&qe(r,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $h(n,e,t=!1){const r="signIn",i=await Bh(n,r,e),s=await fn._fromIdTokenResponse(n,r,i);return t||await n._updateCurrentUser(s.user),s}async function ay(n,e){return $h(Ut(n),e)}async function yP(n,e){const t=M(n);return await sy(!1,t,e.providerId),qh(t,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gh(n,e,t){var r;V(((r=t.url)===null||r===void 0?void 0:r.length)>0,n,"invalid-continue-uri"),V(typeof t.dynamicLinkDomain>"u"||t.dynamicLinkDomain.length>0,n,"invalid-dynamic-link-domain"),e.continueUrl=t.url,e.dynamicLinkDomain=t.dynamicLinkDomain,e.canHandleCodeInApp=t.handleCodeInApp,t.iOS&&(V(t.iOS.bundleId.length>0,n,"missing-ios-bundle-id"),e.iOSBundleId=t.iOS.bundleId),t.android&&(V(t.android.packageName.length>0,n,"missing-android-pkg-name"),e.androidInstallApp=t.android.installApp,e.androidMinimumVersionCode=t.android.minimumVersion,e.androidPackageName=t.android.packageName)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function jh(n){const e=Ut(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function IP(n,e,t){const r=Ut(n),i={requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"};t&&Gh(r,i,t),await Ts(r,i,"getOobCode",J_)}async function EP(n,e,t){const r=Ut(n),o=await Ts(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",ry).catch(c=>{throw c.code==="auth/password-does-not-meet-requirements"&&jh(n),c}),a=await fn._fromIdTokenResponse(r,"signIn",o);return await r._updateCurrentUser(a.user),a}function TP(n,e,t){return ay(M(n),ur.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&jh(n),r})}async function wP(n,e){const t=M(n),i={requestType:"VERIFY_EMAIL",idToken:await n.getIdToken()};e&&Gh(t.auth,i,e);const{email:s}=await Y_(t.auth,i);s!==n.email&&await n.reload()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function cy(n,e){return ze(n,"POST","/v1/accounts:update",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function vP(n,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;const r=M(n),s={idToken:await r.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},o=await hn(r,cy(r.auth,s));r.displayName=o.displayName||null,r.photoURL=o.photoUrl||null;const a=r.providerData.find(({providerId:c})=>c==="password");a&&(a.displayName=r.displayName,a.photoURL=r.photoURL),await r._updateTokensIfNecessary(o)}function AP(n,e){return uy(M(n),null,e)}async function uy(n,e,t){const{auth:r}=n,s={idToken:await n.getIdToken(),returnSecureToken:!0};t&&(s.password=t);const o=await hn(n,H_(r,s));await n._updateTokensIfNecessary(o,!0)}function RP(n,e,t,r){return M(n).onAuthStateChanged(e,t,r)}function PP(n){return M(n).signOut()}const Vu="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zh{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Vu,"1"),this.storage.removeItem(Vu),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ly(){const n=ue();return Ua(n)||js(n)}const hy=1e3,dy=10;class Kh extends zh{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.safariLocalStorageNotSynced=ly()&&N_(),this.fallbackToPolling=Lh(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,a,c)=>{this.notifyListeners(o,c)});return}const r=e.key;if(t?this.detachListener():this.stopPolling(),this.safariLocalStorageNotSynced){const o=this.storage.getItem(r);if(e.newValue!==o)e.newValue!==null?this.storage.setItem(r,e.newValue):this.storage.removeItem(r);else if(this.localCache[r]===e.newValue&&!t)return}const i=()=>{const o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);k_()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,dy):i()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},hy)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Kh.type="LOCAL";const SP=Kh;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hh extends zh{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Hh.type="SESSION";const fy=Hh;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wh(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bt(){return window}function py(n){bt().location.href=n}new Ti(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qh(n,e){return e?nt(e):(V(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ga extends Ba{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Bn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Bn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Bn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function my(n){return $h(n.auth,new Ga(n),n.bypassAuthState)}function gy(n){const{auth:e,user:t}=n;return V(t,e,"internal-error"),oy(t,new Ga(n),n.bypassAuthState)}async function _y(n){const{auth:e,user:t}=n;return V(t,e,"internal-error"),qh(t,new Ga(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yh{constructor(e,t,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:i,tenantId:s,error:o,type:a}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:t,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(c))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return my;case"linkViaPopup":case"linkViaRedirect":return _y;case"reauthViaPopup":case"reauthViaRedirect":return gy;default:qe(this.auth,"internal-error")}}resolve(e){ot(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){ot(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yy=new Ti(2e3,1e4);async function bP(n,e,t){const r=Ut(n);l_(n,e,$a);const i=Qh(r,t);return new nn(r,"signInViaPopup",e,i).executeNotNull()}class nn extends Yh{constructor(e,t,r,i,s){super(e,t,i,s),this.provider=r,this.authWindow=null,this.pollId=null,nn.currentPopupAction&&nn.currentPopupAction.cancel(),nn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return V(e,this.auth,"internal-error"),e}async onExecution(){ot(this.filter.length===1,"Popup operations only handle one event");const e=Wh();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Xe(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Xe(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,nn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Xe(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,yy.get())};e()}}nn.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Iy="pendingRedirect",as=new Map;class Ey extends Yh{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=as.get(this.auth._key());if(!e){try{const r=await Ty(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}as.set(this.auth._key(),e)}return this.bypassAuthState||as.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Ty(n,e){const t=Ay(e),r=vy(n);if(!await r._isAvailable())return!1;const i=await r._get(t)==="true";return await r._remove(t),i}function wy(n,e){as.set(n._key(),e)}function vy(n){return nt(n._redirectPersistence)}function Ay(n){return os(Iy,n.config.apiKey,n.name)}async function Ry(n,e,t=!1){const r=Ut(n),i=Qh(r,e),o=await new Ey(r,i,t).execute();return o&&!t&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Py=600*1e3;class Sy{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!by(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Jh(e)){const i=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(Xe(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Py&&this.cachedEventUids.clear(),this.cachedEventUids.has(ku(e))}saveEventToCache(e){this.cachedEventUids.add(ku(e)),this.lastProcessedEventTime=Date.now()}}function ku(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Jh({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function by(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Jh(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Cy(n,e={}){return ze(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dy=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Vy=/^https?/;async function ky(n){if(n.config.emulator)return;const{authorizedDomains:e}=await Cy(n);for(const t of e)try{if(Ny(t))return}catch{}qe(n,"unauthorized-domain")}function Ny(n){const e=Yo(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!Vy.test(t))return!1;if(Dy.test(n))return r===n;const i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xy=new Ti(3e4,6e4);function Nu(){const n=bt().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function Oy(n){return new Promise((e,t)=>{var r,i,s;function o(){Nu(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Nu(),t(Xe(n,"network-request-failed"))},timeout:xy.get()})}if(!((i=(r=bt().gapi)===null||r===void 0?void 0:r.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((s=bt().gapi)===null||s===void 0)&&s.load)o();else{const a=$_("iframefcb");return bt()[a]=()=>{gapi.load?o():t(Xe(n,"network-request-failed"))},Fh(`${q_()}?onload=${a}`).catch(c=>t(c))}}).catch(e=>{throw cs=null,e})}let cs=null;function Ly(n){return cs=cs||Oy(n),cs}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const My=new Ti(5e3,15e3),Fy="__/auth/iframe",Uy="emulator/auth/iframe",By={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},qy=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function $y(n){const e=n.config;V(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Ma(e,Uy):`https://${n.config.authDomain}/${Fy}`,r={apiKey:e.apiKey,appName:n.name,v:An},i=qy.get(n.config.apiHost);i&&(r.eid=i);const s=n._getFrameworks();return s.length&&(r.fw=s.join(",")),`${t}?${Ei(r).slice(1)}`}async function Gy(n){const e=await Ly(n),t=bt().gapi;return V(t,n,"internal-error"),e.open({where:document.body,url:$y(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:By,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const o=Xe(n,"network-request-failed"),a=bt().setTimeout(()=>{s(o)},My.get());function c(){bt().clearTimeout(a),i(r)}r.ping(c).then(c,()=>{s(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jy={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},zy=500,Ky=600,Hy="_blank",Wy="http://localhost";class xu{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Qy(n,e,t,r=zy,i=Ky){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let a="";const c=Object.assign(Object.assign({},jy),{width:r.toString(),height:i.toString(),top:s,left:o}),u=ue().toLowerCase();t&&(a=Vh(u)?Hy:t),Dh(u)&&(e=e||Wy,c.scrollbars="yes");const l=Object.entries(c).reduce((d,[f,I])=>`${d}${f}=${I},`,"");if(V_(u)&&a!=="_self")return Yy(e||"",a),new xu(null);const h=window.open(e||"",a,l);V(h,n,"popup-blocked");try{h.focus()}catch{}return new xu(h)}function Yy(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jy="__/auth/handler",Xy="emulator/auth/handler",Zy=encodeURIComponent("fac");async function Ou(n,e,t,r,i,s){V(n.config.authDomain,n,"auth-domain-config-required"),V(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:An,eventId:i};if(e instanceof $a){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",og(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[l,h]of Object.entries({}))o[l]=h}if(e instanceof vi){const l=e.getScopes().filter(h=>h!=="");l.length>0&&(o.scopes=l.join(","))}n.tenantId&&(o.tid=n.tenantId);const a=o;for(const l of Object.keys(a))a[l]===void 0&&delete a[l];const c=await n._getAppCheckToken(),u=c?`#${Zy}=${encodeURIComponent(c)}`:"";return`${eI(n)}?${Ei(a).slice(1)}${u}`}function eI({config:n}){return n.emulator?Ma(n,Xy):`https://${n.authDomain}/${Jy}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const No="webStorageSupport";class tI{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=fy,this._completeRedirectFn=Ry,this._overrideRedirectResult=wy}async _openPopup(e,t,r,i){var s;ot((s=this.eventManagers[e._key()])===null||s===void 0?void 0:s.manager,"_initialize() not called before _openPopup()");const o=await Ou(e,t,r,Yo(),i);return Qy(e,o,Wh())}async _openRedirect(e,t,r,i){await this._originValidation(e);const s=await Ou(e,t,r,Yo(),i);return py(s),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:s}=this.eventManagers[t];return i?Promise.resolve(i):(ot(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await Gy(e),r=new Sy(e);return t.register("authEvent",i=>(V(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(No,{type:No},i=>{var s;const o=(s=i==null?void 0:i[0])===null||s===void 0?void 0:s[No];o!==void 0&&t(!!o),qe(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=ky(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Lh()||Ua()||js()}}const CP=tI;var Lu="@firebase/auth",Mu="1.6.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nI{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){V(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rI(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function iI(n){Dt(new st("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=r.options;V(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:o,authDomain:a,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Mh(n)},u=new F_(r,i,s,c);return K_(u,t),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Dt(new st("auth-internal",e=>{const t=Ut(e.getProvider("auth").getImmediate());return(r=>new nI(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Be(Lu,Mu,rI(n)),Be(Lu,Mu,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sI=300;Qm("authIdTokenMaxAge");function oI(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}U_({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{const s=Xe("internal-error");s.customData=i,t(s)},r.type="text/javascript",r.charset="UTF-8",oI().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});iI("Browser");var aI=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},v,ja=ja||{},N=aI||self;function Ks(n){var e=typeof n;return e=e!="object"?e:n?Array.isArray(n)?"array":e:"null",e=="array"||e=="object"&&typeof n.length=="number"}function Hs(n){var e=typeof n;return e=="object"&&n!=null||e=="function"}function cI(n,e,t){return n.call.apply(n.bind,arguments)}function uI(n,e,t){if(!n)throw Error();if(2<arguments.length){var r=Array.prototype.slice.call(arguments,2);return function(){var i=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(i,r),n.apply(e,i)}}return function(){return n.apply(e,arguments)}}function Re(n,e,t){return Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?Re=cI:Re=uI,Re.apply(null,arguments)}function Ki(n,e){var t=Array.prototype.slice.call(arguments,1);return function(){var r=t.slice();return r.push.apply(r,arguments),n.apply(this,r)}}function ge(n,e){function t(){}t.prototype=e.prototype,n.$=e.prototype,n.prototype=new t,n.prototype.constructor=n,n.ac=function(r,i,s){for(var o=Array(arguments.length-2),a=2;a<arguments.length;a++)o[a-2]=arguments[a];return e.prototype[i].apply(r,o)}}function Bt(){this.s=this.s,this.o=this.o}var lI=0;Bt.prototype.s=!1;Bt.prototype.sa=function(){!this.s&&(this.s=!0,this.N(),lI!=0)};Bt.prototype.N=function(){if(this.o)for(;this.o.length;)this.o.shift()()};const Xh=Array.prototype.indexOf?function(n,e){return Array.prototype.indexOf.call(n,e,void 0)}:function(n,e){if(typeof n=="string")return typeof e!="string"||e.length!=1?-1:n.indexOf(e,0);for(let t=0;t<n.length;t++)if(t in n&&n[t]===e)return t;return-1};function za(n){const e=n.length;if(0<e){const t=Array(e);for(let r=0;r<e;r++)t[r]=n[r];return t}return[]}function Fu(n,e){for(let t=1;t<arguments.length;t++){const r=arguments[t];if(Ks(r)){const i=n.length||0,s=r.length||0;n.length=i+s;for(let o=0;o<s;o++)n[i+o]=r[o]}else n.push(r)}}function Pe(n,e){this.type=n,this.g=this.target=e,this.defaultPrevented=!1}Pe.prototype.h=function(){this.defaultPrevented=!0};var hI=(function(){if(!N.addEventListener||!Object.defineProperty)return!1;var n=!1,e=Object.defineProperty({},"passive",{get:function(){n=!0}});try{const t=()=>{};N.addEventListener("test",t,e),N.removeEventListener("test",t,e)}catch{}return n})();function ei(n){return/^[\s\xa0]*$/.test(n)}function Ws(){var n=N.navigator;return n&&(n=n.userAgent)?n:""}function Ke(n){return Ws().indexOf(n)!=-1}function Ka(n){return Ka[" "](n),n}Ka[" "]=function(){};function dI(n,e){var t=sE;return Object.prototype.hasOwnProperty.call(t,n)?t[n]:t[n]=e(n)}var fI=Ke("Opera"),Kn=Ke("Trident")||Ke("MSIE"),Zh=Ke("Edge"),Jo=Zh||Kn,ed=Ke("Gecko")&&!(Ws().toLowerCase().indexOf("webkit")!=-1&&!Ke("Edge"))&&!(Ke("Trident")||Ke("MSIE"))&&!Ke("Edge"),pI=Ws().toLowerCase().indexOf("webkit")!=-1&&!Ke("Edge");function td(){var n=N.document;return n?n.documentMode:void 0}var Xo;e:{var xo="",Oo=(function(){var n=Ws();if(ed)return/rv:([^\);]+)(\)|;)/.exec(n);if(Zh)return/Edge\/([\d\.]+)/.exec(n);if(Kn)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(n);if(pI)return/WebKit\/(\S+)/.exec(n);if(fI)return/(?:Version)[ \/]?(\S+)/.exec(n)})();if(Oo&&(xo=Oo?Oo[1]:""),Kn){var Lo=td();if(Lo!=null&&Lo>parseFloat(xo)){Xo=String(Lo);break e}}Xo=xo}var Zo;if(N.document&&Kn){var Uu=td();Zo=Uu||parseInt(Xo,10)||void 0}else Zo=void 0;var mI=Zo;function ti(n,e){if(Pe.call(this,n?n.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,n){var t=this.type=n.type,r=n.changedTouches&&n.changedTouches.length?n.changedTouches[0]:null;if(this.target=n.target||n.srcElement,this.g=e,e=n.relatedTarget){if(ed){e:{try{Ka(e.nodeName);var i=!0;break e}catch{}i=!1}i||(e=null)}}else t=="mouseover"?e=n.fromElement:t=="mouseout"&&(e=n.toElement);this.relatedTarget=e,r?(this.clientX=r.clientX!==void 0?r.clientX:r.pageX,this.clientY=r.clientY!==void 0?r.clientY:r.pageY,this.screenX=r.screenX||0,this.screenY=r.screenY||0):(this.clientX=n.clientX!==void 0?n.clientX:n.pageX,this.clientY=n.clientY!==void 0?n.clientY:n.pageY,this.screenX=n.screenX||0,this.screenY=n.screenY||0),this.button=n.button,this.key=n.key||"",this.ctrlKey=n.ctrlKey,this.altKey=n.altKey,this.shiftKey=n.shiftKey,this.metaKey=n.metaKey,this.pointerId=n.pointerId||0,this.pointerType=typeof n.pointerType=="string"?n.pointerType:gI[n.pointerType]||"",this.state=n.state,this.i=n,n.defaultPrevented&&ti.$.h.call(this)}}ge(ti,Pe);var gI={2:"touch",3:"pen",4:"mouse"};ti.prototype.h=function(){ti.$.h.call(this);var n=this.i;n.preventDefault?n.preventDefault():n.returnValue=!1};var Qs="closure_listenable_"+(1e6*Math.random()|0),_I=0;function yI(n,e,t,r,i){this.listener=n,this.proxy=null,this.src=e,this.type=t,this.capture=!!r,this.la=i,this.key=++_I,this.fa=this.ia=!1}function Ys(n){n.fa=!0,n.listener=null,n.proxy=null,n.src=null,n.la=null}function Ha(n,e,t){for(const r in n)e.call(t,n[r],r,n)}function II(n,e){for(const t in n)e.call(void 0,n[t],t,n)}function nd(n){const e={};for(const t in n)e[t]=n[t];return e}const Bu="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function rd(n,e){let t,r;for(let i=1;i<arguments.length;i++){r=arguments[i];for(t in r)n[t]=r[t];for(let s=0;s<Bu.length;s++)t=Bu[s],Object.prototype.hasOwnProperty.call(r,t)&&(n[t]=r[t])}}function Js(n){this.src=n,this.g={},this.h=0}Js.prototype.add=function(n,e,t,r,i){var s=n.toString();n=this.g[s],n||(n=this.g[s]=[],this.h++);var o=ta(n,e,r,i);return-1<o?(e=n[o],t||(e.ia=!1)):(e=new yI(e,this.src,s,!!r,i),e.ia=t,n.push(e)),e};function ea(n,e){var t=e.type;if(t in n.g){var r=n.g[t],i=Xh(r,e),s;(s=0<=i)&&Array.prototype.splice.call(r,i,1),s&&(Ys(e),n.g[t].length==0&&(delete n.g[t],n.h--))}}function ta(n,e,t,r){for(var i=0;i<n.length;++i){var s=n[i];if(!s.fa&&s.listener==e&&s.capture==!!t&&s.la==r)return i}return-1}var Wa="closure_lm_"+(1e6*Math.random()|0),Mo={};function id(n,e,t,r,i){if(Array.isArray(e)){for(var s=0;s<e.length;s++)id(n,e[s],t,r,i);return null}return t=ad(t),n&&n[Qs]?n.O(e,t,Hs(r)?!!r.capture:!1,i):EI(n,e,t,!1,r,i)}function EI(n,e,t,r,i,s){if(!e)throw Error("Invalid event type");var o=Hs(i)?!!i.capture:!!i,a=Ya(n);if(a||(n[Wa]=a=new Js(n)),t=a.add(e,t,r,o,s),t.proxy)return t;if(r=TI(),t.proxy=r,r.src=n,r.listener=t,n.addEventListener)hI||(i=o),i===void 0&&(i=!1),n.addEventListener(e.toString(),r,i);else if(n.attachEvent)n.attachEvent(od(e.toString()),r);else if(n.addListener&&n.removeListener)n.addListener(r);else throw Error("addEventListener and attachEvent are unavailable.");return t}function TI(){function n(t){return e.call(n.src,n.listener,t)}const e=wI;return n}function sd(n,e,t,r,i){if(Array.isArray(e))for(var s=0;s<e.length;s++)sd(n,e[s],t,r,i);else r=Hs(r)?!!r.capture:!!r,t=ad(t),n&&n[Qs]?(n=n.i,e=String(e).toString(),e in n.g&&(s=n.g[e],t=ta(s,t,r,i),-1<t&&(Ys(s[t]),Array.prototype.splice.call(s,t,1),s.length==0&&(delete n.g[e],n.h--)))):n&&(n=Ya(n))&&(e=n.g[e.toString()],n=-1,e&&(n=ta(e,t,r,i)),(t=-1<n?e[n]:null)&&Qa(t))}function Qa(n){if(typeof n!="number"&&n&&!n.fa){var e=n.src;if(e&&e[Qs])ea(e.i,n);else{var t=n.type,r=n.proxy;e.removeEventListener?e.removeEventListener(t,r,n.capture):e.detachEvent?e.detachEvent(od(t),r):e.addListener&&e.removeListener&&e.removeListener(r),(t=Ya(e))?(ea(t,n),t.h==0&&(t.src=null,e[Wa]=null)):Ys(n)}}}function od(n){return n in Mo?Mo[n]:Mo[n]="on"+n}function wI(n,e){if(n.fa)n=!0;else{e=new ti(e,this);var t=n.listener,r=n.la||n.src;n.ia&&Qa(n),n=t.call(r,e)}return n}function Ya(n){return n=n[Wa],n instanceof Js?n:null}var Fo="__closure_events_fn_"+(1e9*Math.random()>>>0);function ad(n){return typeof n=="function"?n:(n[Fo]||(n[Fo]=function(e){return n.handleEvent(e)}),n[Fo])}function pe(){Bt.call(this),this.i=new Js(this),this.S=this,this.J=null}ge(pe,Bt);pe.prototype[Qs]=!0;pe.prototype.removeEventListener=function(n,e,t,r){sd(this,n,e,t,r)};function Te(n,e){var t,r=n.J;if(r)for(t=[];r;r=r.J)t.push(r);if(n=n.S,r=e.type||e,typeof e=="string")e=new Pe(e,n);else if(e instanceof Pe)e.target=e.target||n;else{var i=e;e=new Pe(r,n),rd(e,i)}if(i=!0,t)for(var s=t.length-1;0<=s;s--){var o=e.g=t[s];i=Hi(o,r,!0,e)&&i}if(o=e.g=n,i=Hi(o,r,!0,e)&&i,i=Hi(o,r,!1,e)&&i,t)for(s=0;s<t.length;s++)o=e.g=t[s],i=Hi(o,r,!1,e)&&i}pe.prototype.N=function(){if(pe.$.N.call(this),this.i){var n=this.i,e;for(e in n.g){for(var t=n.g[e],r=0;r<t.length;r++)Ys(t[r]);delete n.g[e],n.h--}}this.J=null};pe.prototype.O=function(n,e,t,r){return this.i.add(String(n),e,!1,t,r)};pe.prototype.P=function(n,e,t,r){return this.i.add(String(n),e,!0,t,r)};function Hi(n,e,t,r){if(e=n.i.g[String(e)],!e)return!0;e=e.concat();for(var i=!0,s=0;s<e.length;++s){var o=e[s];if(o&&!o.fa&&o.capture==t){var a=o.listener,c=o.la||o.src;o.ia&&ea(n.i,o),i=a.call(c,r)!==!1&&i}}return i&&!r.defaultPrevented}var Ja=N.JSON.stringify;class vI{constructor(e,t){this.i=e,this.j=t,this.h=0,this.g=null}get(){let e;return 0<this.h?(this.h--,e=this.g,this.g=e.next,e.next=null):e=this.i(),e}}function AI(){var n=Xa;let e=null;return n.g&&(e=n.g,n.g=n.g.next,n.g||(n.h=null),e.next=null),e}class RI{constructor(){this.h=this.g=null}add(e,t){const r=cd.get();r.set(e,t),this.h?this.h.next=r:this.g=r,this.h=r}}var cd=new vI(()=>new PI,n=>n.reset());class PI{constructor(){this.next=this.g=this.h=null}set(e,t){this.h=e,this.g=t,this.next=null}reset(){this.next=this.g=this.h=null}}function SI(n){var e=1;n=n.split(":");const t=[];for(;0<e&&n.length;)t.push(n.shift()),e--;return n.length&&t.push(n.join(":")),t}function bI(n){N.setTimeout(()=>{throw n},0)}let ni,ri=!1,Xa=new RI,ud=()=>{const n=N.Promise.resolve(void 0);ni=()=>{n.then(CI)}};var CI=()=>{for(var n;n=AI();){try{n.h.call(n.g)}catch(t){bI(t)}var e=cd;e.j(n),100>e.h&&(e.h++,n.next=e.g,e.g=n)}ri=!1};function Xs(n,e){pe.call(this),this.h=n||1,this.g=e||N,this.j=Re(this.qb,this),this.l=Date.now()}ge(Xs,pe);v=Xs.prototype;v.ga=!1;v.T=null;v.qb=function(){if(this.ga){var n=Date.now()-this.l;0<n&&n<.8*this.h?this.T=this.g.setTimeout(this.j,this.h-n):(this.T&&(this.g.clearTimeout(this.T),this.T=null),Te(this,"tick"),this.ga&&(Za(this),this.start()))}};v.start=function(){this.ga=!0,this.T||(this.T=this.g.setTimeout(this.j,this.h),this.l=Date.now())};function Za(n){n.ga=!1,n.T&&(n.g.clearTimeout(n.T),n.T=null)}v.N=function(){Xs.$.N.call(this),Za(this),delete this.g};function ec(n,e,t){if(typeof n=="function")t&&(n=Re(n,t));else if(n&&typeof n.handleEvent=="function")n=Re(n.handleEvent,n);else throw Error("Invalid listener argument");return 2147483647<Number(e)?-1:N.setTimeout(n,e||0)}function ld(n){n.g=ec(()=>{n.g=null,n.i&&(n.i=!1,ld(n))},n.j);const e=n.h;n.h=null,n.m.apply(null,e)}class DI extends Bt{constructor(e,t){super(),this.m=e,this.j=t,this.h=null,this.i=!1,this.g=null}l(e){this.h=arguments,this.g?this.i=!0:ld(this)}N(){super.N(),this.g&&(N.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ii(n){Bt.call(this),this.h=n,this.g={}}ge(ii,Bt);var qu=[];function hd(n,e,t,r){Array.isArray(t)||(t&&(qu[0]=t.toString()),t=qu);for(var i=0;i<t.length;i++){var s=id(e,t[i],r||n.handleEvent,!1,n.h||n);if(!s)break;n.g[s.key]=s}}function dd(n){Ha(n.g,function(e,t){this.g.hasOwnProperty(t)&&Qa(e)},n),n.g={}}ii.prototype.N=function(){ii.$.N.call(this),dd(this)};ii.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};function Zs(){this.g=!0}Zs.prototype.Ea=function(){this.g=!1};function VI(n,e,t,r,i,s){n.info(function(){if(n.g)if(s)for(var o="",a=s.split("&"),c=0;c<a.length;c++){var u=a[c].split("=");if(1<u.length){var l=u[0];u=u[1];var h=l.split("_");o=2<=h.length&&h[1]=="type"?o+(l+"="+u+"&"):o+(l+"=redacted&")}}else o=null;else o=s;return"XMLHTTP REQ ("+r+") [attempt "+i+"]: "+e+`
`+t+`
`+o})}function kI(n,e,t,r,i,s,o){n.info(function(){return"XMLHTTP RESP ("+r+") [ attempt "+i+"]: "+e+`
`+t+`
`+s+" "+o})}function Fn(n,e,t,r){n.info(function(){return"XMLHTTP TEXT ("+e+"): "+xI(n,t)+(r?" "+r:"")})}function NI(n,e){n.info(function(){return"TIMEOUT: "+e})}Zs.prototype.info=function(){};function xI(n,e){if(!n.g)return e;if(!e)return null;try{var t=JSON.parse(e);if(t){for(n=0;n<t.length;n++)if(Array.isArray(t[n])){var r=t[n];if(!(2>r.length)){var i=r[1];if(Array.isArray(i)&&!(1>i.length)){var s=i[0];if(s!="noop"&&s!="stop"&&s!="close")for(var o=1;o<i.length;o++)i[o]=""}}}}return Ja(t)}catch{return e}}var Rn={},$u=null;function eo(){return $u=$u||new pe}Rn.Ta="serverreachability";function fd(n){Pe.call(this,Rn.Ta,n)}ge(fd,Pe);function si(n){const e=eo();Te(e,new fd(e))}Rn.STAT_EVENT="statevent";function pd(n,e){Pe.call(this,Rn.STAT_EVENT,n),this.stat=e}ge(pd,Pe);function Ce(n){const e=eo();Te(e,new pd(e,n))}Rn.Ua="timingevent";function md(n,e){Pe.call(this,Rn.Ua,n),this.size=e}ge(md,Pe);function Ai(n,e){if(typeof n!="function")throw Error("Fn must not be null and must be a function");return N.setTimeout(function(){n()},e)}var to={NO_ERROR:0,rb:1,Eb:2,Db:3,yb:4,Cb:5,Fb:6,Qa:7,TIMEOUT:8,Ib:9},gd={wb:"complete",Sb:"success",Ra:"error",Qa:"abort",Kb:"ready",Lb:"readystatechange",TIMEOUT:"timeout",Gb:"incrementaldata",Jb:"progress",zb:"downloadprogress",$b:"uploadprogress"};function tc(){}tc.prototype.h=null;function Gu(n){return n.h||(n.h=n.i())}function _d(){}var Ri={OPEN:"a",vb:"b",Ra:"c",Hb:"d"};function nc(){Pe.call(this,"d")}ge(nc,Pe);function rc(){Pe.call(this,"c")}ge(rc,Pe);var na;function no(){}ge(no,tc);no.prototype.g=function(){return new XMLHttpRequest};no.prototype.i=function(){return{}};na=new no;function Pi(n,e,t,r){this.l=n,this.j=e,this.m=t,this.W=r||1,this.U=new ii(this),this.P=OI,n=Jo?125:void 0,this.V=new Xs(n),this.I=null,this.i=!1,this.u=this.B=this.A=this.L=this.G=this.Y=this.C=null,this.F=[],this.g=null,this.o=0,this.s=this.v=null,this.ca=-1,this.J=!1,this.O=0,this.M=null,this.ba=this.K=this.aa=this.S=!1,this.h=new yd}function yd(){this.i=null,this.g="",this.h=!1}var OI=45e3,Id={},ra={};v=Pi.prototype;v.setTimeout=function(n){this.P=n};function ia(n,e,t){n.L=1,n.A=io(at(e)),n.u=t,n.S=!0,Ed(n,null)}function Ed(n,e){n.G=Date.now(),Si(n),n.B=at(n.A);var t=n.B,r=n.W;Array.isArray(r)||(r=[String(r)]),bd(t.i,"t",r),n.o=0,t=n.l.J,n.h=new yd,n.g=Qd(n.l,t?e:null,!n.u),0<n.O&&(n.M=new DI(Re(n.Pa,n,n.g),n.O)),hd(n.U,n.g,"readystatechange",n.nb),e=n.I?nd(n.I):{},n.u?(n.v||(n.v="POST"),e["Content-Type"]="application/x-www-form-urlencoded",n.g.ha(n.B,n.v,n.u,e)):(n.v="GET",n.g.ha(n.B,n.v,null,e)),si(),VI(n.j,n.v,n.B,n.m,n.W,n.u)}v.nb=function(n){n=n.target;const e=this.M;e&&He(n)==3?e.l():this.Pa(n)};v.Pa=function(n){try{if(n==this.g)e:{const l=He(this.g);var e=this.g.Ia();const h=this.g.da();if(!(3>l)&&(l!=3||Jo||this.g&&(this.h.h||this.g.ja()||Hu(this.g)))){this.J||l!=4||e==7||(e==8||0>=h?si(3):si(2)),ro(this);var t=this.g.da();this.ca=t;t:if(Td(this)){var r=Hu(this.g);n="";var i=r.length,s=He(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){rn(this),$r(this);var o="";break t}this.h.i=new N.TextDecoder}for(e=0;e<i;e++)this.h.h=!0,n+=this.h.i.decode(r[e],{stream:s&&e==i-1});r.length=0,this.h.g+=n,this.o=0,o=this.h.g}else o=this.g.ja();if(this.i=t==200,kI(this.j,this.v,this.B,this.m,this.W,l,t),this.i){if(this.aa&&!this.K){t:{if(this.g){var a,c=this.g;if((a=c.g?c.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!ei(a)){var u=a;break t}}u=null}if(t=u)Fn(this.j,this.m,t,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,sa(this,t);else{this.i=!1,this.s=3,Ce(12),rn(this),$r(this);break e}}this.S?(wd(this,l,o),Jo&&this.i&&l==3&&(hd(this.U,this.V,"tick",this.mb),this.V.start())):(Fn(this.j,this.m,o,null),sa(this,o)),l==4&&rn(this),this.i&&!this.J&&(l==4?zd(this.l,this):(this.i=!1,Si(this)))}else nE(this.g),t==400&&0<o.indexOf("Unknown SID")?(this.s=3,Ce(12)):(this.s=0,Ce(13)),rn(this),$r(this)}}}catch{}finally{}};function Td(n){return n.g?n.v=="GET"&&n.L!=2&&n.l.Ha:!1}function wd(n,e,t){let r=!0,i;for(;!n.J&&n.o<t.length;)if(i=LI(n,t),i==ra){e==4&&(n.s=4,Ce(14),r=!1),Fn(n.j,n.m,null,"[Incomplete Response]");break}else if(i==Id){n.s=4,Ce(15),Fn(n.j,n.m,t,"[Invalid Chunk]"),r=!1;break}else Fn(n.j,n.m,i,null),sa(n,i);Td(n)&&n.o!=0&&(n.h.g=n.h.g.slice(n.o),n.o=0),e!=4||t.length!=0||n.h.h||(n.s=1,Ce(16),r=!1),n.i=n.i&&r,r?0<t.length&&!n.ba&&(n.ba=!0,e=n.l,e.g==n&&e.ca&&!e.M&&(e.l.info("Great, no buffering proxy detected. Bytes received: "+t.length),uc(e),e.M=!0,Ce(11))):(Fn(n.j,n.m,t,"[Invalid Chunked Response]"),rn(n),$r(n))}v.mb=function(){if(this.g){var n=He(this.g),e=this.g.ja();this.o<e.length&&(ro(this),wd(this,n,e),this.i&&n!=4&&Si(this))}};function LI(n,e){var t=n.o,r=e.indexOf(`
`,t);return r==-1?ra:(t=Number(e.substring(t,r)),isNaN(t)?Id:(r+=1,r+t>e.length?ra:(e=e.slice(r,r+t),n.o=r+t,e)))}v.cancel=function(){this.J=!0,rn(this)};function Si(n){n.Y=Date.now()+n.P,vd(n,n.P)}function vd(n,e){if(n.C!=null)throw Error("WatchDog timer not null");n.C=Ai(Re(n.lb,n),e)}function ro(n){n.C&&(N.clearTimeout(n.C),n.C=null)}v.lb=function(){this.C=null;const n=Date.now();0<=n-this.Y?(NI(this.j,this.B),this.L!=2&&(si(),Ce(17)),rn(this),this.s=2,$r(this)):vd(this,this.Y-n)};function $r(n){n.l.H==0||n.J||zd(n.l,n)}function rn(n){ro(n);var e=n.M;e&&typeof e.sa=="function"&&e.sa(),n.M=null,Za(n.V),dd(n.U),n.g&&(e=n.g,n.g=null,e.abort(),e.sa())}function sa(n,e){try{var t=n.l;if(t.H!=0&&(t.g==n||oa(t.i,n))){if(!n.K&&oa(t.i,n)&&t.H==3){try{var r=t.Ja.g.parse(e)}catch{r=null}if(Array.isArray(r)&&r.length==3){var i=r;if(i[0]==0){e:if(!t.u){if(t.g)if(t.g.G+3e3<n.G)Rs(t),co(t);else break e;cc(t),Ce(18)}}else t.Fa=i[1],0<t.Fa-t.V&&37500>i[2]&&t.G&&t.A==0&&!t.v&&(t.v=Ai(Re(t.ib,t),6e3));if(1>=Vd(t.i)&&t.oa){try{t.oa()}catch{}t.oa=void 0}}else sn(t,11)}else if((n.K||t.g==n)&&Rs(t),!ei(e))for(i=t.Ja.g.parse(e),e=0;e<i.length;e++){let u=i[e];if(t.V=u[0],u=u[1],t.H==2)if(u[0]=="c"){t.K=u[1],t.pa=u[2];const l=u[3];l!=null&&(t.ra=l,t.l.info("VER="+t.ra));const h=u[4];h!=null&&(t.Ga=h,t.l.info("SVER="+t.Ga));const d=u[5];d!=null&&typeof d=="number"&&0<d&&(r=1.5*d,t.L=r,t.l.info("backChannelRequestTimeoutMs_="+r)),r=t;const f=n.g;if(f){const I=f.g?f.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(I){var s=r.i;s.g||I.indexOf("spdy")==-1&&I.indexOf("quic")==-1&&I.indexOf("h2")==-1||(s.j=s.l,s.g=new Set,s.h&&(ic(s,s.h),s.h=null))}if(r.F){const E=f.g?f.g.getResponseHeader("X-HTTP-Session-Id"):null;E&&(r.Da=E,W(r.I,r.F,E))}}t.H=3,t.h&&t.h.Ba(),t.ca&&(t.S=Date.now()-n.G,t.l.info("Handshake RTT: "+t.S+"ms")),r=t;var o=n;if(r.wa=Wd(r,r.J?r.pa:null,r.Y),o.K){kd(r.i,o);var a=o,c=r.L;c&&a.setTimeout(c),a.C&&(ro(a),Si(a)),r.g=o}else Gd(r);0<t.j.length&&uo(t)}else u[0]!="stop"&&u[0]!="close"||sn(t,7);else t.H==3&&(u[0]=="stop"||u[0]=="close"?u[0]=="stop"?sn(t,7):ac(t):u[0]!="noop"&&t.h&&t.h.Aa(u),t.A=0)}}si(4)}catch{}}function MI(n){if(n.Z&&typeof n.Z=="function")return n.Z();if(typeof Map<"u"&&n instanceof Map||typeof Set<"u"&&n instanceof Set)return Array.from(n.values());if(typeof n=="string")return n.split("");if(Ks(n)){for(var e=[],t=n.length,r=0;r<t;r++)e.push(n[r]);return e}e=[],t=0;for(r in n)e[t++]=n[r];return e}function FI(n){if(n.ta&&typeof n.ta=="function")return n.ta();if(!n.Z||typeof n.Z!="function"){if(typeof Map<"u"&&n instanceof Map)return Array.from(n.keys());if(!(typeof Set<"u"&&n instanceof Set)){if(Ks(n)||typeof n=="string"){var e=[];n=n.length;for(var t=0;t<n;t++)e.push(t);return e}e=[],t=0;for(const r in n)e[t++]=r;return e}}}function Ad(n,e){if(n.forEach&&typeof n.forEach=="function")n.forEach(e,void 0);else if(Ks(n)||typeof n=="string")Array.prototype.forEach.call(n,e,void 0);else for(var t=FI(n),r=MI(n),i=r.length,s=0;s<i;s++)e.call(void 0,r[s],t&&t[s],n)}var Rd=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function UI(n,e){if(n){n=n.split("&");for(var t=0;t<n.length;t++){var r=n[t].indexOf("="),i=null;if(0<=r){var s=n[t].substring(0,r);i=n[t].substring(r+1)}else s=n[t];e(s,i?decodeURIComponent(i.replace(/\+/g," ")):"")}}}function an(n){if(this.g=this.s=this.j="",this.m=null,this.o=this.l="",this.h=!1,n instanceof an){this.h=n.h,vs(this,n.j),this.s=n.s,this.g=n.g,As(this,n.m),this.l=n.l;var e=n.i,t=new oi;t.i=e.i,e.g&&(t.g=new Map(e.g),t.h=e.h),ju(this,t),this.o=n.o}else n&&(e=String(n).match(Rd))?(this.h=!1,vs(this,e[1]||"",!0),this.s=Lr(e[2]||""),this.g=Lr(e[3]||"",!0),As(this,e[4]),this.l=Lr(e[5]||"",!0),ju(this,e[6]||"",!0),this.o=Lr(e[7]||"")):(this.h=!1,this.i=new oi(null,this.h))}an.prototype.toString=function(){var n=[],e=this.j;e&&n.push(Mr(e,zu,!0),":");var t=this.g;return(t||e=="file")&&(n.push("//"),(e=this.s)&&n.push(Mr(e,zu,!0),"@"),n.push(encodeURIComponent(String(t)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),t=this.m,t!=null&&n.push(":",String(t))),(t=this.l)&&(this.g&&t.charAt(0)!="/"&&n.push("/"),n.push(Mr(t,t.charAt(0)=="/"?$I:qI,!0))),(t=this.i.toString())&&n.push("?",t),(t=this.o)&&n.push("#",Mr(t,jI)),n.join("")};function at(n){return new an(n)}function vs(n,e,t){n.j=t?Lr(e,!0):e,n.j&&(n.j=n.j.replace(/:$/,""))}function As(n,e){if(e){if(e=Number(e),isNaN(e)||0>e)throw Error("Bad port number "+e);n.m=e}else n.m=null}function ju(n,e,t){e instanceof oi?(n.i=e,zI(n.i,n.h)):(t||(e=Mr(e,GI)),n.i=new oi(e,n.h))}function W(n,e,t){n.i.set(e,t)}function io(n){return W(n,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),n}function Lr(n,e){return n?e?decodeURI(n.replace(/%25/g,"%2525")):decodeURIComponent(n):""}function Mr(n,e,t){return typeof n=="string"?(n=encodeURI(n).replace(e,BI),t&&(n=n.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),n):null}function BI(n){return n=n.charCodeAt(0),"%"+(n>>4&15).toString(16)+(n&15).toString(16)}var zu=/[#\/\?@]/g,qI=/[#\?:]/g,$I=/[#\?]/g,GI=/[#\?@]/g,jI=/#/g;function oi(n,e){this.h=this.g=null,this.i=n||null,this.j=!!e}function qt(n){n.g||(n.g=new Map,n.h=0,n.i&&UI(n.i,function(e,t){n.add(decodeURIComponent(e.replace(/\+/g," ")),t)}))}v=oi.prototype;v.add=function(n,e){qt(this),this.i=null,n=lr(this,n);var t=this.g.get(n);return t||this.g.set(n,t=[]),t.push(e),this.h+=1,this};function Pd(n,e){qt(n),e=lr(n,e),n.g.has(e)&&(n.i=null,n.h-=n.g.get(e).length,n.g.delete(e))}function Sd(n,e){return qt(n),e=lr(n,e),n.g.has(e)}v.forEach=function(n,e){qt(this),this.g.forEach(function(t,r){t.forEach(function(i){n.call(e,i,r,this)},this)},this)};v.ta=function(){qt(this);const n=Array.from(this.g.values()),e=Array.from(this.g.keys()),t=[];for(let r=0;r<e.length;r++){const i=n[r];for(let s=0;s<i.length;s++)t.push(e[r])}return t};v.Z=function(n){qt(this);let e=[];if(typeof n=="string")Sd(this,n)&&(e=e.concat(this.g.get(lr(this,n))));else{n=Array.from(this.g.values());for(let t=0;t<n.length;t++)e=e.concat(n[t])}return e};v.set=function(n,e){return qt(this),this.i=null,n=lr(this,n),Sd(this,n)&&(this.h-=this.g.get(n).length),this.g.set(n,[e]),this.h+=1,this};v.get=function(n,e){return n?(n=this.Z(n),0<n.length?String(n[0]):e):e};function bd(n,e,t){Pd(n,e),0<t.length&&(n.i=null,n.g.set(lr(n,e),za(t)),n.h+=t.length)}v.toString=function(){if(this.i)return this.i;if(!this.g)return"";const n=[],e=Array.from(this.g.keys());for(var t=0;t<e.length;t++){var r=e[t];const s=encodeURIComponent(String(r)),o=this.Z(r);for(r=0;r<o.length;r++){var i=s;o[r]!==""&&(i+="="+encodeURIComponent(String(o[r]))),n.push(i)}}return this.i=n.join("&")};function lr(n,e){return e=String(e),n.j&&(e=e.toLowerCase()),e}function zI(n,e){e&&!n.j&&(qt(n),n.i=null,n.g.forEach(function(t,r){var i=r.toLowerCase();r!=i&&(Pd(this,r),bd(this,i,t))},n)),n.j=e}var KI=class{constructor(n,e){this.g=n,this.map=e}};function Cd(n){this.l=n||HI,N.PerformanceNavigationTiming?(n=N.performance.getEntriesByType("navigation"),n=0<n.length&&(n[0].nextHopProtocol=="hq"||n[0].nextHopProtocol=="h2")):n=!!(N.g&&N.g.Ka&&N.g.Ka()&&N.g.Ka().dc),this.j=n?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}var HI=10;function Dd(n){return n.h?!0:n.g?n.g.size>=n.j:!1}function Vd(n){return n.h?1:n.g?n.g.size:0}function oa(n,e){return n.h?n.h==e:n.g?n.g.has(e):!1}function ic(n,e){n.g?n.g.add(e):n.h=e}function kd(n,e){n.h&&n.h==e?n.h=null:n.g&&n.g.has(e)&&n.g.delete(e)}Cd.prototype.cancel=function(){if(this.i=Nd(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const n of this.g.values())n.cancel();this.g.clear()}};function Nd(n){if(n.h!=null)return n.i.concat(n.h.F);if(n.g!=null&&n.g.size!==0){let e=n.i;for(const t of n.g.values())e=e.concat(t.F);return e}return za(n.i)}var WI=class{stringify(n){return N.JSON.stringify(n,void 0)}parse(n){return N.JSON.parse(n,void 0)}};function QI(){this.g=new WI}function YI(n,e,t){const r=t||"";try{Ad(n,function(i,s){let o=i;Hs(i)&&(o=Ja(i)),e.push(r+s+"="+encodeURIComponent(o))})}catch(i){throw e.push(r+"type="+encodeURIComponent("_badmap")),i}}function JI(n,e){const t=new Zs;if(N.Image){const r=new Image;r.onload=Ki(Wi,t,r,"TestLoadImage: loaded",!0,e),r.onerror=Ki(Wi,t,r,"TestLoadImage: error",!1,e),r.onabort=Ki(Wi,t,r,"TestLoadImage: abort",!1,e),r.ontimeout=Ki(Wi,t,r,"TestLoadImage: timeout",!1,e),N.setTimeout(function(){r.ontimeout&&r.ontimeout()},1e4),r.src=n}else e(!1)}function Wi(n,e,t,r,i){try{e.onload=null,e.onerror=null,e.onabort=null,e.ontimeout=null,i(r)}catch{}}function so(n){this.l=n.ec||null,this.j=n.ob||!1}ge(so,tc);so.prototype.g=function(){return new oo(this.l,this.j)};so.prototype.i=(function(n){return function(){return n}})({});function oo(n,e){pe.call(this),this.F=n,this.u=e,this.m=void 0,this.readyState=sc,this.status=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.v=new Headers,this.h=null,this.C="GET",this.B="",this.g=!1,this.A=this.j=this.l=null}ge(oo,pe);var sc=0;v=oo.prototype;v.open=function(n,e){if(this.readyState!=sc)throw this.abort(),Error("Error reopening a connection");this.C=n,this.B=e,this.readyState=1,ai(this)};v.send=function(n){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const e={headers:this.v,method:this.C,credentials:this.m,cache:void 0};n&&(e.body=n),(this.F||N).fetch(new Request(this.B,e)).then(this.$a.bind(this),this.ka.bind(this))};v.abort=function(){this.response=this.responseText="",this.v=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,bi(this)),this.readyState=sc};v.$a=function(n){if(this.g&&(this.l=n,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=n.headers,this.readyState=2,ai(this)),this.g&&(this.readyState=3,ai(this),this.g)))if(this.responseType==="arraybuffer")n.arrayBuffer().then(this.Ya.bind(this),this.ka.bind(this));else if(typeof N.ReadableStream<"u"&&"body"in n){if(this.j=n.body.getReader(),this.u){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.A=new TextDecoder;xd(this)}else n.text().then(this.Za.bind(this),this.ka.bind(this))};function xd(n){n.j.read().then(n.Xa.bind(n)).catch(n.ka.bind(n))}v.Xa=function(n){if(this.g){if(this.u&&n.value)this.response.push(n.value);else if(!this.u){var e=n.value?n.value:new Uint8Array(0);(e=this.A.decode(e,{stream:!n.done}))&&(this.response=this.responseText+=e)}n.done?bi(this):ai(this),this.readyState==3&&xd(this)}};v.Za=function(n){this.g&&(this.response=this.responseText=n,bi(this))};v.Ya=function(n){this.g&&(this.response=n,bi(this))};v.ka=function(){this.g&&bi(this)};function bi(n){n.readyState=4,n.l=null,n.j=null,n.A=null,ai(n)}v.setRequestHeader=function(n,e){this.v.append(n,e)};v.getResponseHeader=function(n){return this.h&&this.h.get(n.toLowerCase())||""};v.getAllResponseHeaders=function(){if(!this.h)return"";const n=[],e=this.h.entries();for(var t=e.next();!t.done;)t=t.value,n.push(t[0]+": "+t[1]),t=e.next();return n.join(`\r
`)};function ai(n){n.onreadystatechange&&n.onreadystatechange.call(n)}Object.defineProperty(oo.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(n){this.m=n?"include":"same-origin"}});var XI=N.JSON.parse;function ne(n){pe.call(this),this.headers=new Map,this.u=n||null,this.h=!1,this.C=this.g=null,this.I="",this.m=0,this.j="",this.l=this.G=this.v=this.F=!1,this.B=0,this.A=null,this.K=Od,this.L=this.M=!1}ge(ne,pe);var Od="",ZI=/^https?$/i,eE=["POST","PUT"];v=ne.prototype;v.Oa=function(n){this.M=n};v.ha=function(n,e,t,r){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.I+"; newUri="+n);e=e?e.toUpperCase():"GET",this.I=n,this.j="",this.m=0,this.F=!1,this.h=!0,this.g=this.u?this.u.g():na.g(),this.C=this.u?Gu(this.u):Gu(na),this.g.onreadystatechange=Re(this.La,this);try{this.G=!0,this.g.open(e,String(n),!0),this.G=!1}catch(s){Ku(this,s);return}if(n=t||"",t=new Map(this.headers),r)if(Object.getPrototypeOf(r)===Object.prototype)for(var i in r)t.set(i,r[i]);else if(typeof r.keys=="function"&&typeof r.get=="function")for(const s of r.keys())t.set(s,r.get(s));else throw Error("Unknown input type for opt_headers: "+String(r));r=Array.from(t.keys()).find(s=>s.toLowerCase()=="content-type"),i=N.FormData&&n instanceof N.FormData,!(0<=Xh(eE,e))||r||i||t.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[s,o]of t)this.g.setRequestHeader(s,o);this.K&&(this.g.responseType=this.K),"withCredentials"in this.g&&this.g.withCredentials!==this.M&&(this.g.withCredentials=this.M);try{Fd(this),0<this.B&&((this.L=tE(this.g))?(this.g.timeout=this.B,this.g.ontimeout=Re(this.ua,this)):this.A=ec(this.ua,this.B,this)),this.v=!0,this.g.send(n),this.v=!1}catch(s){Ku(this,s)}};function tE(n){return Kn&&typeof n.timeout=="number"&&n.ontimeout!==void 0}v.ua=function(){typeof ja<"u"&&this.g&&(this.j="Timed out after "+this.B+"ms, aborting",this.m=8,Te(this,"timeout"),this.abort(8))};function Ku(n,e){n.h=!1,n.g&&(n.l=!0,n.g.abort(),n.l=!1),n.j=e,n.m=5,Ld(n),ao(n)}function Ld(n){n.F||(n.F=!0,Te(n,"complete"),Te(n,"error"))}v.abort=function(n){this.g&&this.h&&(this.h=!1,this.l=!0,this.g.abort(),this.l=!1,this.m=n||7,Te(this,"complete"),Te(this,"abort"),ao(this))};v.N=function(){this.g&&(this.h&&(this.h=!1,this.l=!0,this.g.abort(),this.l=!1),ao(this,!0)),ne.$.N.call(this)};v.La=function(){this.s||(this.G||this.v||this.l?Md(this):this.kb())};v.kb=function(){Md(this)};function Md(n){if(n.h&&typeof ja<"u"&&(!n.C[1]||He(n)!=4||n.da()!=2)){if(n.v&&He(n)==4)ec(n.La,0,n);else if(Te(n,"readystatechange"),He(n)==4){n.h=!1;try{const o=n.da();e:switch(o){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var e=!0;break e;default:e=!1}var t;if(!(t=e)){var r;if(r=o===0){var i=String(n.I).match(Rd)[1]||null;!i&&N.self&&N.self.location&&(i=N.self.location.protocol.slice(0,-1)),r=!ZI.test(i?i.toLowerCase():"")}t=r}if(t)Te(n,"complete"),Te(n,"success");else{n.m=6;try{var s=2<He(n)?n.g.statusText:""}catch{s=""}n.j=s+" ["+n.da()+"]",Ld(n)}}finally{ao(n)}}}}function ao(n,e){if(n.g){Fd(n);const t=n.g,r=n.C[0]?()=>{}:null;n.g=null,n.C=null,e||Te(n,"ready");try{t.onreadystatechange=r}catch{}}}function Fd(n){n.g&&n.L&&(n.g.ontimeout=null),n.A&&(N.clearTimeout(n.A),n.A=null)}v.isActive=function(){return!!this.g};function He(n){return n.g?n.g.readyState:0}v.da=function(){try{return 2<He(this)?this.g.status:-1}catch{return-1}};v.ja=function(){try{return this.g?this.g.responseText:""}catch{return""}};v.Wa=function(n){if(this.g){var e=this.g.responseText;return n&&e.indexOf(n)==0&&(e=e.substring(n.length)),XI(e)}};function Hu(n){try{if(!n.g)return null;if("response"in n.g)return n.g.response;switch(n.K){case Od:case"text":return n.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in n.g)return n.g.mozResponseArrayBuffer}return null}catch{return null}}function nE(n){const e={};n=(n.g&&2<=He(n)&&n.g.getAllResponseHeaders()||"").split(`\r
`);for(let r=0;r<n.length;r++){if(ei(n[r]))continue;var t=SI(n[r]);const i=t[0];if(t=t[1],typeof t!="string")continue;t=t.trim();const s=e[i]||[];e[i]=s,s.push(t)}II(e,function(r){return r.join(", ")})}v.Ia=function(){return this.m};v.Sa=function(){return typeof this.j=="string"?this.j:String(this.j)};function Ud(n){let e="";return Ha(n,function(t,r){e+=r,e+=":",e+=t,e+=`\r
`}),e}function oc(n,e,t){e:{for(r in t){var r=!1;break e}r=!0}r||(t=Ud(t),typeof n=="string"?t!=null&&encodeURIComponent(String(t)):W(n,e,t))}function Pr(n,e,t){return t&&t.internalChannelParams&&t.internalChannelParams[n]||e}function Bd(n){this.Ga=0,this.j=[],this.l=new Zs,this.pa=this.wa=this.I=this.Y=this.g=this.Da=this.F=this.na=this.o=this.U=this.s=null,this.fb=this.W=0,this.cb=Pr("failFast",!1,n),this.G=this.v=this.u=this.m=this.h=null,this.aa=!0,this.Fa=this.V=-1,this.ba=this.A=this.C=0,this.ab=Pr("baseRetryDelayMs",5e3,n),this.hb=Pr("retryDelaySeedMs",1e4,n),this.eb=Pr("forwardChannelMaxRetries",2,n),this.xa=Pr("forwardChannelRequestTimeoutMs",2e4,n),this.va=n&&n.xmlHttpFactory||void 0,this.Ha=n&&n.useFetchStreams||!1,this.L=void 0,this.J=n&&n.supportsCrossDomainXhr||!1,this.K="",this.i=new Cd(n&&n.concurrentRequestLimit),this.Ja=new QI,this.P=n&&n.fastHandshake||!1,this.O=n&&n.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.bb=n&&n.bc||!1,n&&n.Ea&&this.l.Ea(),n&&n.forceLongPolling&&(this.aa=!1),this.ca=!this.P&&this.aa&&n&&n.detectBufferingProxy||!1,this.qa=void 0,n&&n.longPollingTimeout&&0<n.longPollingTimeout&&(this.qa=n.longPollingTimeout),this.oa=void 0,this.S=0,this.M=!1,this.ma=this.B=null}v=Bd.prototype;v.ra=8;v.H=1;function ac(n){if(qd(n),n.H==3){var e=n.W++,t=at(n.I);if(W(t,"SID",n.K),W(t,"RID",e),W(t,"TYPE","terminate"),Ci(n,t),e=new Pi(n,n.l,e),e.L=2,e.A=io(at(t)),t=!1,N.navigator&&N.navigator.sendBeacon)try{t=N.navigator.sendBeacon(e.A.toString(),"")}catch{}!t&&N.Image&&(new Image().src=e.A,t=!0),t||(e.g=Qd(e.l,null),e.g.ha(e.A)),e.G=Date.now(),Si(e)}Hd(n)}function co(n){n.g&&(uc(n),n.g.cancel(),n.g=null)}function qd(n){co(n),n.u&&(N.clearTimeout(n.u),n.u=null),Rs(n),n.i.cancel(),n.m&&(typeof n.m=="number"&&N.clearTimeout(n.m),n.m=null)}function uo(n){if(!Dd(n.i)&&!n.m){n.m=!0;var e=n.Na;ni||ud(),ri||(ni(),ri=!0),Xa.add(e,n),n.C=0}}function rE(n,e){return Vd(n.i)>=n.i.j-(n.m?1:0)?!1:n.m?(n.j=e.F.concat(n.j),!0):n.H==1||n.H==2||n.C>=(n.cb?0:n.eb)?!1:(n.m=Ai(Re(n.Na,n,e),Kd(n,n.C)),n.C++,!0)}v.Na=function(n){if(this.m)if(this.m=null,this.H==1){if(!n){this.W=Math.floor(1e5*Math.random()),n=this.W++;const i=new Pi(this,this.l,n);let s=this.s;if(this.U&&(s?(s=nd(s),rd(s,this.U)):s=this.U),this.o!==null||this.O||(i.I=s,s=null),this.P)e:{for(var e=0,t=0;t<this.j.length;t++){t:{var r=this.j[t];if("__data__"in r.map&&(r=r.map.__data__,typeof r=="string")){r=r.length;break t}r=void 0}if(r===void 0)break;if(e+=r,4096<e){e=t;break e}if(e===4096||t===this.j.length-1){e=t+1;break e}}e=1e3}else e=1e3;e=$d(this,i,e),t=at(this.I),W(t,"RID",n),W(t,"CVER",22),this.F&&W(t,"X-HTTP-Session-Id",this.F),Ci(this,t),s&&(this.O?e="headers="+encodeURIComponent(String(Ud(s)))+"&"+e:this.o&&oc(t,this.o,s)),ic(this.i,i),this.bb&&W(t,"TYPE","init"),this.P?(W(t,"$req",e),W(t,"SID","null"),i.aa=!0,ia(i,t,null)):ia(i,t,e),this.H=2}}else this.H==3&&(n?Wu(this,n):this.j.length==0||Dd(this.i)||Wu(this))};function Wu(n,e){var t;e?t=e.m:t=n.W++;const r=at(n.I);W(r,"SID",n.K),W(r,"RID",t),W(r,"AID",n.V),Ci(n,r),n.o&&n.s&&oc(r,n.o,n.s),t=new Pi(n,n.l,t,n.C+1),n.o===null&&(t.I=n.s),e&&(n.j=e.F.concat(n.j)),e=$d(n,t,1e3),t.setTimeout(Math.round(.5*n.xa)+Math.round(.5*n.xa*Math.random())),ic(n.i,t),ia(t,r,e)}function Ci(n,e){n.na&&Ha(n.na,function(t,r){W(e,r,t)}),n.h&&Ad({},function(t,r){W(e,r,t)})}function $d(n,e,t){t=Math.min(n.j.length,t);var r=n.h?Re(n.h.Va,n.h,n):null;e:{var i=n.j;let s=-1;for(;;){const o=["count="+t];s==-1?0<t?(s=i[0].g,o.push("ofs="+s)):s=0:o.push("ofs="+s);let a=!0;for(let c=0;c<t;c++){let u=i[c].g;const l=i[c].map;if(u-=s,0>u)s=Math.max(0,i[c].g-100),a=!1;else try{YI(l,o,"req"+u+"_")}catch{r&&r(l)}}if(a){r=o.join("&");break e}}}return n=n.j.splice(0,t),e.F=n,r}function Gd(n){if(!n.g&&!n.u){n.ba=1;var e=n.Ma;ni||ud(),ri||(ni(),ri=!0),Xa.add(e,n),n.A=0}}function cc(n){return n.g||n.u||3<=n.A?!1:(n.ba++,n.u=Ai(Re(n.Ma,n),Kd(n,n.A)),n.A++,!0)}v.Ma=function(){if(this.u=null,jd(this),this.ca&&!(this.M||this.g==null||0>=this.S)){var n=2*this.S;this.l.info("BP detection timer enabled: "+n),this.B=Ai(Re(this.jb,this),n)}};v.jb=function(){this.B&&(this.B=null,this.l.info("BP detection timeout reached."),this.l.info("Buffering proxy detected and switch to long-polling!"),this.G=!1,this.M=!0,Ce(10),co(this),jd(this))};function uc(n){n.B!=null&&(N.clearTimeout(n.B),n.B=null)}function jd(n){n.g=new Pi(n,n.l,"rpc",n.ba),n.o===null&&(n.g.I=n.s),n.g.O=0;var e=at(n.wa);W(e,"RID","rpc"),W(e,"SID",n.K),W(e,"AID",n.V),W(e,"CI",n.G?"0":"1"),!n.G&&n.qa&&W(e,"TO",n.qa),W(e,"TYPE","xmlhttp"),Ci(n,e),n.o&&n.s&&oc(e,n.o,n.s),n.L&&n.g.setTimeout(n.L);var t=n.g;n=n.pa,t.L=1,t.A=io(at(e)),t.u=null,t.S=!0,Ed(t,n)}v.ib=function(){this.v!=null&&(this.v=null,co(this),cc(this),Ce(19))};function Rs(n){n.v!=null&&(N.clearTimeout(n.v),n.v=null)}function zd(n,e){var t=null;if(n.g==e){Rs(n),uc(n),n.g=null;var r=2}else if(oa(n.i,e))t=e.F,kd(n.i,e),r=1;else return;if(n.H!=0){if(e.i)if(r==1){t=e.u?e.u.length:0,e=Date.now()-e.G;var i=n.C;r=eo(),Te(r,new md(r,t)),uo(n)}else Gd(n);else if(i=e.s,i==3||i==0&&0<e.ca||!(r==1&&rE(n,e)||r==2&&cc(n)))switch(t&&0<t.length&&(e=n.i,e.i=e.i.concat(t)),i){case 1:sn(n,5);break;case 4:sn(n,10);break;case 3:sn(n,6);break;default:sn(n,2)}}}function Kd(n,e){let t=n.ab+Math.floor(Math.random()*n.hb);return n.isActive()||(t*=2),t*e}function sn(n,e){if(n.l.info("Error code "+e),e==2){var t=null;n.h&&(t=null);var r=Re(n.pb,n);t||(t=new an("//www.google.com/images/cleardot.gif"),N.location&&N.location.protocol=="http"||vs(t,"https"),io(t)),JI(t.toString(),r)}else Ce(2);n.H=0,n.h&&n.h.za(e),Hd(n),qd(n)}v.pb=function(n){n?(this.l.info("Successfully pinged google.com"),Ce(2)):(this.l.info("Failed to ping google.com"),Ce(1))};function Hd(n){if(n.H=0,n.ma=[],n.h){const e=Nd(n.i);(e.length!=0||n.j.length!=0)&&(Fu(n.ma,e),Fu(n.ma,n.j),n.i.i.length=0,za(n.j),n.j.length=0),n.h.ya()}}function Wd(n,e,t){var r=t instanceof an?at(t):new an(t);if(r.g!="")e&&(r.g=e+"."+r.g),As(r,r.m);else{var i=N.location;r=i.protocol,e=e?e+"."+i.hostname:i.hostname,i=+i.port;var s=new an(null);r&&vs(s,r),e&&(s.g=e),i&&As(s,i),t&&(s.l=t),r=s}return t=n.F,e=n.Da,t&&e&&W(r,t,e),W(r,"VER",n.ra),Ci(n,r),r}function Qd(n,e,t){if(e&&!n.J)throw Error("Can't create secondary domain capable XhrIo object.");return e=n.Ha&&!n.va?new ne(new so({ob:t})):new ne(n.va),e.Oa(n.J),e}v.isActive=function(){return!!this.h&&this.h.isActive(this)};function Yd(){}v=Yd.prototype;v.Ba=function(){};v.Aa=function(){};v.za=function(){};v.ya=function(){};v.isActive=function(){return!0};v.Va=function(){};function Ps(){if(Kn&&!(10<=Number(mI)))throw Error("Environmental error: no available transport.")}Ps.prototype.g=function(n,e){return new Le(n,e)};function Le(n,e){pe.call(this),this.g=new Bd(e),this.l=n,this.h=e&&e.messageUrlParams||null,n=e&&e.messageHeaders||null,e&&e.clientProtocolHeaderRequired&&(n?n["X-Client-Protocol"]="webchannel":n={"X-Client-Protocol":"webchannel"}),this.g.s=n,n=e&&e.initMessageHeaders||null,e&&e.messageContentType&&(n?n["X-WebChannel-Content-Type"]=e.messageContentType:n={"X-WebChannel-Content-Type":e.messageContentType}),e&&e.Ca&&(n?n["X-WebChannel-Client-Profile"]=e.Ca:n={"X-WebChannel-Client-Profile":e.Ca}),this.g.U=n,(n=e&&e.cc)&&!ei(n)&&(this.g.o=n),this.A=e&&e.supportsCrossDomainXhr||!1,this.v=e&&e.sendRawJson||!1,(e=e&&e.httpSessionIdParam)&&!ei(e)&&(this.g.F=e,n=this.h,n!==null&&e in n&&(n=this.h,e in n&&delete n[e])),this.j=new hr(this)}ge(Le,pe);Le.prototype.m=function(){this.g.h=this.j,this.A&&(this.g.J=!0);var n=this.g,e=this.l,t=this.h||void 0;Ce(0),n.Y=e,n.na=t||{},n.G=n.aa,n.I=Wd(n,null,n.Y),uo(n)};Le.prototype.close=function(){ac(this.g)};Le.prototype.u=function(n){var e=this.g;if(typeof n=="string"){var t={};t.__data__=n,n=t}else this.v&&(t={},t.__data__=Ja(n),n=t);e.j.push(new KI(e.fb++,n)),e.H==3&&uo(e)};Le.prototype.N=function(){this.g.h=null,delete this.j,ac(this.g),delete this.g,Le.$.N.call(this)};function Jd(n){nc.call(this),n.__headers__&&(this.headers=n.__headers__,this.statusCode=n.__status__,delete n.__headers__,delete n.__status__);var e=n.__sm__;if(e){e:{for(const t in e){n=t;break e}n=void 0}(this.i=n)&&(n=this.i,e=e!==null&&n in e?e[n]:void 0),this.data=e}else this.data=n}ge(Jd,nc);function Xd(){rc.call(this),this.status=1}ge(Xd,rc);function hr(n){this.g=n}ge(hr,Yd);hr.prototype.Ba=function(){Te(this.g,"a")};hr.prototype.Aa=function(n){Te(this.g,new Jd(n))};hr.prototype.za=function(n){Te(this.g,new Xd)};hr.prototype.ya=function(){Te(this.g,"b")};function iE(){this.blockSize=-1}function Ge(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.m=Array(this.blockSize),this.i=this.h=0,this.reset()}ge(Ge,iE);Ge.prototype.reset=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.i=this.h=0};function Uo(n,e,t){t||(t=0);var r=Array(16);if(typeof e=="string")for(var i=0;16>i;++i)r[i]=e.charCodeAt(t++)|e.charCodeAt(t++)<<8|e.charCodeAt(t++)<<16|e.charCodeAt(t++)<<24;else for(i=0;16>i;++i)r[i]=e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24;e=n.g[0],t=n.g[1],i=n.g[2];var s=n.g[3],o=e+(s^t&(i^s))+r[0]+3614090360&4294967295;e=t+(o<<7&4294967295|o>>>25),o=s+(i^e&(t^i))+r[1]+3905402710&4294967295,s=e+(o<<12&4294967295|o>>>20),o=i+(t^s&(e^t))+r[2]+606105819&4294967295,i=s+(o<<17&4294967295|o>>>15),o=t+(e^i&(s^e))+r[3]+3250441966&4294967295,t=i+(o<<22&4294967295|o>>>10),o=e+(s^t&(i^s))+r[4]+4118548399&4294967295,e=t+(o<<7&4294967295|o>>>25),o=s+(i^e&(t^i))+r[5]+1200080426&4294967295,s=e+(o<<12&4294967295|o>>>20),o=i+(t^s&(e^t))+r[6]+2821735955&4294967295,i=s+(o<<17&4294967295|o>>>15),o=t+(e^i&(s^e))+r[7]+4249261313&4294967295,t=i+(o<<22&4294967295|o>>>10),o=e+(s^t&(i^s))+r[8]+1770035416&4294967295,e=t+(o<<7&4294967295|o>>>25),o=s+(i^e&(t^i))+r[9]+2336552879&4294967295,s=e+(o<<12&4294967295|o>>>20),o=i+(t^s&(e^t))+r[10]+4294925233&4294967295,i=s+(o<<17&4294967295|o>>>15),o=t+(e^i&(s^e))+r[11]+2304563134&4294967295,t=i+(o<<22&4294967295|o>>>10),o=e+(s^t&(i^s))+r[12]+1804603682&4294967295,e=t+(o<<7&4294967295|o>>>25),o=s+(i^e&(t^i))+r[13]+4254626195&4294967295,s=e+(o<<12&4294967295|o>>>20),o=i+(t^s&(e^t))+r[14]+2792965006&4294967295,i=s+(o<<17&4294967295|o>>>15),o=t+(e^i&(s^e))+r[15]+1236535329&4294967295,t=i+(o<<22&4294967295|o>>>10),o=e+(i^s&(t^i))+r[1]+4129170786&4294967295,e=t+(o<<5&4294967295|o>>>27),o=s+(t^i&(e^t))+r[6]+3225465664&4294967295,s=e+(o<<9&4294967295|o>>>23),o=i+(e^t&(s^e))+r[11]+643717713&4294967295,i=s+(o<<14&4294967295|o>>>18),o=t+(s^e&(i^s))+r[0]+3921069994&4294967295,t=i+(o<<20&4294967295|o>>>12),o=e+(i^s&(t^i))+r[5]+3593408605&4294967295,e=t+(o<<5&4294967295|o>>>27),o=s+(t^i&(e^t))+r[10]+38016083&4294967295,s=e+(o<<9&4294967295|o>>>23),o=i+(e^t&(s^e))+r[15]+3634488961&4294967295,i=s+(o<<14&4294967295|o>>>18),o=t+(s^e&(i^s))+r[4]+3889429448&4294967295,t=i+(o<<20&4294967295|o>>>12),o=e+(i^s&(t^i))+r[9]+568446438&4294967295,e=t+(o<<5&4294967295|o>>>27),o=s+(t^i&(e^t))+r[14]+3275163606&4294967295,s=e+(o<<9&4294967295|o>>>23),o=i+(e^t&(s^e))+r[3]+4107603335&4294967295,i=s+(o<<14&4294967295|o>>>18),o=t+(s^e&(i^s))+r[8]+1163531501&4294967295,t=i+(o<<20&4294967295|o>>>12),o=e+(i^s&(t^i))+r[13]+2850285829&4294967295,e=t+(o<<5&4294967295|o>>>27),o=s+(t^i&(e^t))+r[2]+4243563512&4294967295,s=e+(o<<9&4294967295|o>>>23),o=i+(e^t&(s^e))+r[7]+1735328473&4294967295,i=s+(o<<14&4294967295|o>>>18),o=t+(s^e&(i^s))+r[12]+2368359562&4294967295,t=i+(o<<20&4294967295|o>>>12),o=e+(t^i^s)+r[5]+4294588738&4294967295,e=t+(o<<4&4294967295|o>>>28),o=s+(e^t^i)+r[8]+2272392833&4294967295,s=e+(o<<11&4294967295|o>>>21),o=i+(s^e^t)+r[11]+1839030562&4294967295,i=s+(o<<16&4294967295|o>>>16),o=t+(i^s^e)+r[14]+4259657740&4294967295,t=i+(o<<23&4294967295|o>>>9),o=e+(t^i^s)+r[1]+2763975236&4294967295,e=t+(o<<4&4294967295|o>>>28),o=s+(e^t^i)+r[4]+1272893353&4294967295,s=e+(o<<11&4294967295|o>>>21),o=i+(s^e^t)+r[7]+4139469664&4294967295,i=s+(o<<16&4294967295|o>>>16),o=t+(i^s^e)+r[10]+3200236656&4294967295,t=i+(o<<23&4294967295|o>>>9),o=e+(t^i^s)+r[13]+681279174&4294967295,e=t+(o<<4&4294967295|o>>>28),o=s+(e^t^i)+r[0]+3936430074&4294967295,s=e+(o<<11&4294967295|o>>>21),o=i+(s^e^t)+r[3]+3572445317&4294967295,i=s+(o<<16&4294967295|o>>>16),o=t+(i^s^e)+r[6]+76029189&4294967295,t=i+(o<<23&4294967295|o>>>9),o=e+(t^i^s)+r[9]+3654602809&4294967295,e=t+(o<<4&4294967295|o>>>28),o=s+(e^t^i)+r[12]+3873151461&4294967295,s=e+(o<<11&4294967295|o>>>21),o=i+(s^e^t)+r[15]+530742520&4294967295,i=s+(o<<16&4294967295|o>>>16),o=t+(i^s^e)+r[2]+3299628645&4294967295,t=i+(o<<23&4294967295|o>>>9),o=e+(i^(t|~s))+r[0]+4096336452&4294967295,e=t+(o<<6&4294967295|o>>>26),o=s+(t^(e|~i))+r[7]+1126891415&4294967295,s=e+(o<<10&4294967295|o>>>22),o=i+(e^(s|~t))+r[14]+2878612391&4294967295,i=s+(o<<15&4294967295|o>>>17),o=t+(s^(i|~e))+r[5]+4237533241&4294967295,t=i+(o<<21&4294967295|o>>>11),o=e+(i^(t|~s))+r[12]+1700485571&4294967295,e=t+(o<<6&4294967295|o>>>26),o=s+(t^(e|~i))+r[3]+2399980690&4294967295,s=e+(o<<10&4294967295|o>>>22),o=i+(e^(s|~t))+r[10]+4293915773&4294967295,i=s+(o<<15&4294967295|o>>>17),o=t+(s^(i|~e))+r[1]+2240044497&4294967295,t=i+(o<<21&4294967295|o>>>11),o=e+(i^(t|~s))+r[8]+1873313359&4294967295,e=t+(o<<6&4294967295|o>>>26),o=s+(t^(e|~i))+r[15]+4264355552&4294967295,s=e+(o<<10&4294967295|o>>>22),o=i+(e^(s|~t))+r[6]+2734768916&4294967295,i=s+(o<<15&4294967295|o>>>17),o=t+(s^(i|~e))+r[13]+1309151649&4294967295,t=i+(o<<21&4294967295|o>>>11),o=e+(i^(t|~s))+r[4]+4149444226&4294967295,e=t+(o<<6&4294967295|o>>>26),o=s+(t^(e|~i))+r[11]+3174756917&4294967295,s=e+(o<<10&4294967295|o>>>22),o=i+(e^(s|~t))+r[2]+718787259&4294967295,i=s+(o<<15&4294967295|o>>>17),o=t+(s^(i|~e))+r[9]+3951481745&4294967295,n.g[0]=n.g[0]+e&4294967295,n.g[1]=n.g[1]+(i+(o<<21&4294967295|o>>>11))&4294967295,n.g[2]=n.g[2]+i&4294967295,n.g[3]=n.g[3]+s&4294967295}Ge.prototype.j=function(n,e){e===void 0&&(e=n.length);for(var t=e-this.blockSize,r=this.m,i=this.h,s=0;s<e;){if(i==0)for(;s<=t;)Uo(this,n,s),s+=this.blockSize;if(typeof n=="string"){for(;s<e;)if(r[i++]=n.charCodeAt(s++),i==this.blockSize){Uo(this,r),i=0;break}}else for(;s<e;)if(r[i++]=n[s++],i==this.blockSize){Uo(this,r),i=0;break}}this.h=i,this.i+=e};Ge.prototype.l=function(){var n=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);n[0]=128;for(var e=1;e<n.length-8;++e)n[e]=0;var t=8*this.i;for(e=n.length-8;e<n.length;++e)n[e]=t&255,t/=256;for(this.j(n),n=Array(16),e=t=0;4>e;++e)for(var r=0;32>r;r+=8)n[t++]=this.g[e]>>>r&255;return n};function j(n,e){this.h=e;for(var t=[],r=!0,i=n.length-1;0<=i;i--){var s=n[i]|0;r&&s==e||(t[i]=s,r=!1)}this.g=t}var sE={};function lc(n){return-128<=n&&128>n?dI(n,function(e){return new j([e|0],0>e?-1:0)}):new j([n|0],0>n?-1:0)}function We(n){if(isNaN(n)||!isFinite(n))return qn;if(0>n)return Ie(We(-n));for(var e=[],t=1,r=0;n>=t;r++)e[r]=n/t|0,t*=aa;return new j(e,0)}function Zd(n,e){if(n.length==0)throw Error("number format error: empty string");if(e=e||10,2>e||36<e)throw Error("radix out of range: "+e);if(n.charAt(0)=="-")return Ie(Zd(n.substring(1),e));if(0<=n.indexOf("-"))throw Error('number format error: interior "-" character');for(var t=We(Math.pow(e,8)),r=qn,i=0;i<n.length;i+=8){var s=Math.min(8,n.length-i),o=parseInt(n.substring(i,i+s),e);8>s?(s=We(Math.pow(e,s)),r=r.R(s).add(We(o))):(r=r.R(t),r=r.add(We(o)))}return r}var aa=4294967296,qn=lc(0),ca=lc(1),Qu=lc(16777216);v=j.prototype;v.ea=function(){if(Fe(this))return-Ie(this).ea();for(var n=0,e=1,t=0;t<this.g.length;t++){var r=this.D(t);n+=(0<=r?r:aa+r)*e,e*=aa}return n};v.toString=function(n){if(n=n||10,2>n||36<n)throw Error("radix out of range: "+n);if(rt(this))return"0";if(Fe(this))return"-"+Ie(this).toString(n);for(var e=We(Math.pow(n,6)),t=this,r="";;){var i=bs(t,e).g;t=Ss(t,i.R(e));var s=((0<t.g.length?t.g[0]:t.h)>>>0).toString(n);if(t=i,rt(t))return s+r;for(;6>s.length;)s="0"+s;r=s+r}};v.D=function(n){return 0>n?0:n<this.g.length?this.g[n]:this.h};function rt(n){if(n.h!=0)return!1;for(var e=0;e<n.g.length;e++)if(n.g[e]!=0)return!1;return!0}function Fe(n){return n.h==-1}v.X=function(n){return n=Ss(this,n),Fe(n)?-1:rt(n)?0:1};function Ie(n){for(var e=n.g.length,t=[],r=0;r<e;r++)t[r]=~n.g[r];return new j(t,~n.h).add(ca)}v.abs=function(){return Fe(this)?Ie(this):this};v.add=function(n){for(var e=Math.max(this.g.length,n.g.length),t=[],r=0,i=0;i<=e;i++){var s=r+(this.D(i)&65535)+(n.D(i)&65535),o=(s>>>16)+(this.D(i)>>>16)+(n.D(i)>>>16);r=o>>>16,s&=65535,o&=65535,t[i]=o<<16|s}return new j(t,t[t.length-1]&-2147483648?-1:0)};function Ss(n,e){return n.add(Ie(e))}v.R=function(n){if(rt(this)||rt(n))return qn;if(Fe(this))return Fe(n)?Ie(this).R(Ie(n)):Ie(Ie(this).R(n));if(Fe(n))return Ie(this.R(Ie(n)));if(0>this.X(Qu)&&0>n.X(Qu))return We(this.ea()*n.ea());for(var e=this.g.length+n.g.length,t=[],r=0;r<2*e;r++)t[r]=0;for(r=0;r<this.g.length;r++)for(var i=0;i<n.g.length;i++){var s=this.D(r)>>>16,o=this.D(r)&65535,a=n.D(i)>>>16,c=n.D(i)&65535;t[2*r+2*i]+=o*c,Qi(t,2*r+2*i),t[2*r+2*i+1]+=s*c,Qi(t,2*r+2*i+1),t[2*r+2*i+1]+=o*a,Qi(t,2*r+2*i+1),t[2*r+2*i+2]+=s*a,Qi(t,2*r+2*i+2)}for(r=0;r<e;r++)t[r]=t[2*r+1]<<16|t[2*r];for(r=e;r<2*e;r++)t[r]=0;return new j(t,0)};function Qi(n,e){for(;(n[e]&65535)!=n[e];)n[e+1]+=n[e]>>>16,n[e]&=65535,e++}function Sr(n,e){this.g=n,this.h=e}function bs(n,e){if(rt(e))throw Error("division by zero");if(rt(n))return new Sr(qn,qn);if(Fe(n))return e=bs(Ie(n),e),new Sr(Ie(e.g),Ie(e.h));if(Fe(e))return e=bs(n,Ie(e)),new Sr(Ie(e.g),e.h);if(30<n.g.length){if(Fe(n)||Fe(e))throw Error("slowDivide_ only works with positive integers.");for(var t=ca,r=e;0>=r.X(n);)t=Yu(t),r=Yu(r);var i=Cn(t,1),s=Cn(r,1);for(r=Cn(r,2),t=Cn(t,2);!rt(r);){var o=s.add(r);0>=o.X(n)&&(i=i.add(t),s=o),r=Cn(r,1),t=Cn(t,1)}return e=Ss(n,i.R(e)),new Sr(i,e)}for(i=qn;0<=n.X(e);){for(t=Math.max(1,Math.floor(n.ea()/e.ea())),r=Math.ceil(Math.log(t)/Math.LN2),r=48>=r?1:Math.pow(2,r-48),s=We(t),o=s.R(e);Fe(o)||0<o.X(n);)t-=r,s=We(t),o=s.R(e);rt(s)&&(s=ca),i=i.add(s),n=Ss(n,o)}return new Sr(i,n)}v.gb=function(n){return bs(this,n).h};v.and=function(n){for(var e=Math.max(this.g.length,n.g.length),t=[],r=0;r<e;r++)t[r]=this.D(r)&n.D(r);return new j(t,this.h&n.h)};v.or=function(n){for(var e=Math.max(this.g.length,n.g.length),t=[],r=0;r<e;r++)t[r]=this.D(r)|n.D(r);return new j(t,this.h|n.h)};v.xor=function(n){for(var e=Math.max(this.g.length,n.g.length),t=[],r=0;r<e;r++)t[r]=this.D(r)^n.D(r);return new j(t,this.h^n.h)};function Yu(n){for(var e=n.g.length+1,t=[],r=0;r<e;r++)t[r]=n.D(r)<<1|n.D(r-1)>>>31;return new j(t,n.h)}function Cn(n,e){var t=e>>5;e%=32;for(var r=n.g.length-t,i=[],s=0;s<r;s++)i[s]=0<e?n.D(s+t)>>>e|n.D(s+t+1)<<32-e:n.D(s+t);return new j(i,n.h)}Ps.prototype.createWebChannel=Ps.prototype.g;Le.prototype.send=Le.prototype.u;Le.prototype.open=Le.prototype.m;Le.prototype.close=Le.prototype.close;to.NO_ERROR=0;to.TIMEOUT=8;to.HTTP_ERROR=6;gd.COMPLETE="complete";_d.EventType=Ri;Ri.OPEN="a";Ri.CLOSE="b";Ri.ERROR="c";Ri.MESSAGE="d";pe.prototype.listen=pe.prototype.O;ne.prototype.listenOnce=ne.prototype.P;ne.prototype.getLastError=ne.prototype.Sa;ne.prototype.getLastErrorCode=ne.prototype.Ia;ne.prototype.getStatus=ne.prototype.da;ne.prototype.getResponseJson=ne.prototype.Wa;ne.prototype.getResponseText=ne.prototype.ja;ne.prototype.send=ne.prototype.ha;ne.prototype.setWithCredentials=ne.prototype.Oa;Ge.prototype.digest=Ge.prototype.l;Ge.prototype.reset=Ge.prototype.reset;Ge.prototype.update=Ge.prototype.j;j.prototype.add=j.prototype.add;j.prototype.multiply=j.prototype.R;j.prototype.modulo=j.prototype.gb;j.prototype.compare=j.prototype.X;j.prototype.toNumber=j.prototype.ea;j.prototype.toString=j.prototype.toString;j.prototype.getBits=j.prototype.D;j.fromNumber=We;j.fromString=Zd;var oE=function(){return new Ps},aE=function(){return eo()},Bo=to,cE=gd,uE=Rn,Ju={xb:0,Ab:1,Bb:2,Ub:3,Zb:4,Wb:5,Xb:6,Vb:7,Tb:8,Yb:9,PROXY:10,NOPROXY:11,Rb:12,Nb:13,Ob:14,Mb:15,Pb:16,Qb:17,tb:18,sb:19,ub:20},Yi=_d,lE=ne,hE=Ge,$n=j;const Xu="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fe{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}fe.UNAUTHENTICATED=new fe(null),fe.GOOGLE_CREDENTIALS=new fe("google-credentials-uid"),fe.FIRST_PARTY=new fe("first-party-uid"),fe.MOCK_USER=new fe("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let dr="10.8.1";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vt=new xa("@firebase/firestore");function xn(){return Vt.logLevel}function dE(n){Vt.setLogLevel(n)}function _(n,...e){if(Vt.logLevel<=F.DEBUG){const t=e.map(hc);Vt.debug(`Firestore (${dr}): ${n}`,...t)}}function oe(n,...e){if(Vt.logLevel<=F.ERROR){const t=e.map(hc);Vt.error(`Firestore (${dr}): ${n}`,...t)}}function xe(n,...e){if(Vt.logLevel<=F.WARN){const t=e.map(hc);Vt.warn(`Firestore (${dr}): ${n}`,...t)}}function hc(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return(function(t){return JSON.stringify(t)})(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function R(n="Unexpected state"){const e=`FIRESTORE (${dr}) INTERNAL ASSERTION FAILED: `+n;throw oe(e),new Error(e)}function S(n,e){n||R()}function fE(n,e){n||R()}function T(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const m={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class g extends je{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class he{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ef{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class tf{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(fe.UNAUTHENTICATED)))}shutdown(){}}class pE{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class mE{constructor(e){this.t=e,this.currentUser=fe.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){let r=this.i;const i=c=>this.i!==r?(r=this.i,t(c)):Promise.resolve();let s=new he;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new he,e.enqueueRetryable((()=>i(this.currentUser)))};const o=()=>{const c=s;e.enqueueRetryable((async()=>{await c.promise,await i(this.currentUser)}))},a=c=>{_("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.auth.addAuthTokenListener(this.o),o()};this.t.onInit((c=>a(c))),setTimeout((()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?a(c):(_("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new he)}}),0),o()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((r=>this.i!==e?(_("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(S(typeof r.accessToken=="string"),new ef(r.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.auth.removeAuthTokenListener(this.o)}u(){const e=this.auth&&this.auth.getUid();return S(e===null||typeof e=="string"),new fe(e)}}class gE{constructor(e,t,r){this.l=e,this.h=t,this.P=r,this.type="FirstParty",this.user=fe.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class _E{constructor(e,t,r){this.l=e,this.h=t,this.P=r}getToken(){return Promise.resolve(new gE(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable((()=>t(fe.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class nf{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class yE{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){const r=s=>{s.error!=null&&_("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const o=s.token!==this.R;return this.R=s.token,_("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable((()=>r(s)))};const i=s=>{_("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.appCheck.addTokenListener(this.o)};this.A.onInit((s=>i(s))),setTimeout((()=>{if(!this.appCheck){const s=this.A.getImmediate({optional:!0});s?i(s):_("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(S(typeof t.token=="string"),this.R=t.token,new nf(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.appCheck.removeTokenListener(this.o)}}class IE{getToken(){return Promise.resolve(new nf(""))}invalidateToken(){}start(e,t){}shutdown(){}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function EE(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dc{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const i=EE(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<t&&(r+=e.charAt(i[s]%e.length))}return r}}function k(n,e){return n<e?-1:n>e?1:0}function Hn(n,e,t){return n.length===e.length&&n.every(((r,i)=>t(r,e[i])))}function rf(n){return n+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class X{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new g(m.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new g(m.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new g(m.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new g(m.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return X.fromMillis(Date.now())}static fromDate(e){return X.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*t));return new X(t,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?k(this.nanoseconds,e.nanoseconds):k(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class b{constructor(e){this.timestamp=e}static fromTimestamp(e){return new b(e)}static min(){return new b(new X(0,0))}static max(){return new b(new X(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ci{constructor(e,t,r){t===void 0?t=0:t>e.length&&R(),r===void 0?r=e.length-t:r>e.length-t&&R(),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return ci.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof ci?e.forEach((r=>{t.push(r)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let i=0;i<r;i++){const s=e.get(i),o=t.get(i);if(s<o)return-1;if(s>o)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class U extends ci{construct(e,t,r){return new U(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new g(m.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter((i=>i.length>0)))}return new U(t)}static emptyPath(){return new U([])}}const TE=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Y extends ci{construct(e,t,r){return new Y(e,t,r)}static isValidIdentifier(e){return TE.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Y.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new Y(["__name__"])}static fromServerFormat(e){const t=[];let r="",i=0;const s=()=>{if(r.length===0)throw new g(m.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;i<e.length;){const a=e[i];if(a==="\\"){if(i+1===e.length)throw new g(m.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[i+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new g(m.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=c,i+=2}else a==="`"?(o=!o,i++):a!=="."||o?(r+=a,i++):(s(),i++)}if(s(),o)throw new g(m.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Y(t)}static emptyPath(){return new Y([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class w{constructor(e){this.path=e}static fromPath(e){return new w(U.fromString(e))}static fromName(e){return new w(U.fromString(e).popFirst(5))}static empty(){return new w(U.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&U.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return U.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new w(new U(e.slice()))}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wn{constructor(e,t,r,i){this.indexId=e,this.collectionGroup=t,this.fields=r,this.indexState=i}}function ua(n){return n.fields.find((e=>e.kind===2))}function Jt(n){return n.fields.filter((e=>e.kind!==2))}function wE(n,e){let t=k(n.collectionGroup,e.collectionGroup);if(t!==0)return t;for(let r=0;r<Math.min(n.fields.length,e.fields.length);++r)if(t=vE(n.fields[r],e.fields[r]),t!==0)return t;return k(n.fields.length,e.fields.length)}Wn.UNKNOWN_ID=-1;class cn{constructor(e,t){this.fieldPath=e,this.kind=t}}function vE(n,e){const t=Y.comparator(n.fieldPath,e.fieldPath);return t!==0?t:k(n.kind,e.kind)}class Qn{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new Qn(0,Me.min())}}function sf(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,i=b.fromTimestamp(r===1e9?new X(t+1,0):new X(t,r));return new Me(i,w.empty(),e)}function of(n){return new Me(n.readTime,n.key,-1)}class Me{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new Me(b.min(),w.empty(),-1)}static max(){return new Me(b.max(),w.empty(),-1)}}function fc(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=w.comparator(n.documentKey,e.documentKey),t!==0?t:k(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const af="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class cf{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $t(n){if(n.code!==m.FAILED_PRECONDITION||n.message!==af)throw n;_("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class p{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&R(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new p(((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(t,s).next(r,i)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof p?t:p.resolve(t)}catch(t){return p.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):p.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):p.reject(t)}static resolve(e){return new p(((t,r)=>{t(e)}))}static reject(e){return new p(((t,r)=>{r(e)}))}static waitFor(e){return new p(((t,r)=>{let i=0,s=0,o=!1;e.forEach((a=>{++i,a.next((()=>{++s,o&&s===i&&t()}),(c=>r(c)))})),o=!0,s===i&&t()}))}static or(e){let t=p.resolve(!1);for(const r of e)t=t.next((i=>i?p.resolve(i):r()));return t}static forEach(e,t){const r=[];return e.forEach(((i,s)=>{r.push(t.call(this,i,s))})),this.waitFor(r)}static mapArray(e,t){return new p(((r,i)=>{const s=e.length,o=new Array(s);let a=0;for(let c=0;c<s;c++){const u=c;t(e[u]).next((l=>{o[u]=l,++a,a===s&&r(o)}),(l=>i(l)))}}))}static doWhile(e,t){return new p(((r,i)=>{const s=()=>{e()===!0?t().next((()=>{s()}),i):r()};s()}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lo{constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.V=new he,this.transaction.oncomplete=()=>{this.V.resolve()},this.transaction.onabort=()=>{t.error?this.V.reject(new Gr(e,t.error)):this.V.resolve()},this.transaction.onerror=r=>{const i=pc(r.target.error);this.V.reject(new Gr(e,i))}}static open(e,t,r,i){try{return new lo(t,e.transaction(i,r))}catch(s){throw new Gr(t,s)}}get m(){return this.V.promise}abort(e){e&&this.V.reject(e),this.aborted||(_("SimpleDb","Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}g(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new RE(t)}}class Ue{constructor(e,t,r){this.name=e,this.version=t,this.p=r,Ue.S(ue())===12.2&&oe("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}static delete(e){return _("SimpleDb","Removing database:",e),Xt(window.indexedDB.deleteDatabase(e)).toPromise()}static D(){if(!Ih())return!1;if(Ue.C())return!0;const e=ue(),t=Ue.S(e),r=0<t&&t<10,i=Ue.v(e),s=0<i&&i<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||r||s)}static C(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)===null||e===void 0?void 0:e.F)==="YES"}static M(e,t){return e.store(t)}static S(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),r=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(r)}static v(e){const t=e.match(/Android ([\d.]+)/i),r=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(r)}async O(e){return this.db||(_("SimpleDb","Opening database:",this.name),this.db=await new Promise(((t,r)=>{const i=indexedDB.open(this.name,this.version);i.onsuccess=s=>{const o=s.target.result;t(o)},i.onblocked=()=>{r(new Gr(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},i.onerror=s=>{const o=s.target.error;o.name==="VersionError"?r(new g(m.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?r(new g(m.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):r(new Gr(e,o))},i.onupgradeneeded=s=>{_("SimpleDb",'Database "'+this.name+'" requires upgrade from version:',s.oldVersion);const o=s.target.result;this.p.N(o,i.transaction,s.oldVersion,this.version).next((()=>{_("SimpleDb","Database upgrade to version "+this.version+" complete")}))}}))),this.B&&(this.db.onversionchange=t=>this.B(t)),this.db}L(e){this.B=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,r,i){const s=t==="readonly";let o=0;for(;;){++o;try{this.db=await this.O(e);const a=lo.open(this.db,e,s?"readonly":"readwrite",r),c=i(a).next((u=>(a.g(),u))).catch((u=>(a.abort(u),p.reject(u)))).toPromise();return c.catch((()=>{})),await a.m,c}catch(a){const c=a,u=c.name!=="FirebaseError"&&o<3;if(_("SimpleDb","Transaction failed with error:",c.message,"Retrying:",u),this.close(),!u)return Promise.reject(c)}}}close(){this.db&&this.db.close(),this.db=void 0}}class AE{constructor(e){this.k=e,this.q=!1,this.K=null}get isDone(){return this.q}get $(){return this.K}set cursor(e){this.k=e}done(){this.q=!0}U(e){this.K=e}delete(){return Xt(this.k.delete())}}class Gr extends g{constructor(e,t){super(m.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function Gt(n){return n.name==="IndexedDbTransactionError"}class RE{constructor(e){this.store=e}put(e,t){let r;return t!==void 0?(_("SimpleDb","PUT",this.store.name,e,t),r=this.store.put(t,e)):(_("SimpleDb","PUT",this.store.name,"<auto-key>",e),r=this.store.put(e)),Xt(r)}add(e){return _("SimpleDb","ADD",this.store.name,e,e),Xt(this.store.add(e))}get(e){return Xt(this.store.get(e)).next((t=>(t===void 0&&(t=null),_("SimpleDb","GET",this.store.name,e,t),t)))}delete(e){return _("SimpleDb","DELETE",this.store.name,e),Xt(this.store.delete(e))}count(){return _("SimpleDb","COUNT",this.store.name),Xt(this.store.count())}W(e,t){const r=this.options(e,t),i=r.index?this.store.index(r.index):this.store;if(typeof i.getAll=="function"){const s=i.getAll(r.range);return new p(((o,a)=>{s.onerror=c=>{a(c.target.error)},s.onsuccess=c=>{o(c.target.result)}}))}{const s=this.cursor(r),o=[];return this.G(s,((a,c)=>{o.push(c)})).next((()=>o))}}j(e,t){const r=this.store.getAll(e,t===null?void 0:t);return new p(((i,s)=>{r.onerror=o=>{s(o.target.error)},r.onsuccess=o=>{i(o.target.result)}}))}H(e,t){_("SimpleDb","DELETE ALL",this.store.name);const r=this.options(e,t);r.J=!1;const i=this.cursor(r);return this.G(i,((s,o,a)=>a.delete()))}Y(e,t){let r;t?r=e:(r={},t=e);const i=this.cursor(r);return this.G(i,t)}Z(e){const t=this.cursor({});return new p(((r,i)=>{t.onerror=s=>{const o=pc(s.target.error);i(o)},t.onsuccess=s=>{const o=s.target.result;o?e(o.primaryKey,o.value).next((a=>{a?o.continue():r()})):r()}}))}G(e,t){const r=[];return new p(((i,s)=>{e.onerror=o=>{s(o.target.error)},e.onsuccess=o=>{const a=o.target.result;if(!a)return void i();const c=new AE(a),u=t(a.primaryKey,a.value,c);if(u instanceof p){const l=u.catch((h=>(c.done(),p.reject(h))));r.push(l)}c.isDone?i():c.$===null?a.continue():a.continue(c.$)}})).next((()=>p.waitFor(r)))}options(e,t){let r;return e!==void 0&&(typeof e=="string"?r=e:t=e),{index:r,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const r=this.store.index(e.index);return e.J?r.openKeyCursor(e.range,t):r.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function Xt(n){return new p(((e,t)=>{n.onsuccess=r=>{const i=r.target.result;e(i)},n.onerror=r=>{const i=pc(r.target.error);t(i)}}))}let Zu=!1;function pc(n){const e=Ue.S(ue());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(n.message.indexOf(t)>=0){const r=new g("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return Zu||(Zu=!0,setTimeout((()=>{throw r}),0)),r}}return n}class PE{constructor(e,t){this.asyncQueue=e,this.X=t,this.task=null}start(){this.ee(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}ee(e){_("IndexBackfiller",`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,(async()=>{this.task=null;try{_("IndexBackfiller",`Documents written: ${await this.X.te()}`)}catch(t){Gt(t)?_("IndexBackfiller","Ignoring IndexedDB error during index backfill: ",t):await $t(t)}await this.ee(6e4)}))}}class SE{constructor(e,t){this.localStore=e,this.persistence=t}async te(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",(t=>this.ne(t,e)))}ne(e,t){const r=new Set;let i=t,s=!0;return p.doWhile((()=>s===!0&&i>0),(()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next((o=>{if(o!==null&&!r.has(o))return _("IndexBackfiller",`Processing collection: ${o}`),this.re(e,o,i).next((a=>{i-=a,r.add(o)}));s=!1})))).next((()=>t-i))}re(e,t,r){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next((i=>this.localStore.localDocuments.getNextDocuments(e,t,i,r).next((s=>{const o=s.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next((()=>this.ie(i,s))).next((a=>(_("IndexBackfiller",`Updating offset: ${a}`),this.localStore.indexManager.updateCollectionGroup(e,t,a)))).next((()=>o.size))}))))}ie(e,t){let r=e;return t.changes.forEach(((i,s)=>{const o=of(s);fc(o,r)>0&&(r=o)})),new Me(r.readTime,r.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ve{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.se(r),this.oe=r=>t.writeSequenceNumber(r))}se(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.oe&&this.oe(e),e}}Ve._e=-1;function Di(n){return n==null}function ui(n){return n===0&&1/n==-1/0}function uf(n){return typeof n=="number"&&Number.isInteger(n)&&!ui(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Se(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=el(e)),e=bE(n.get(t),e);return el(e)}function bE(n,e){let t=e;const r=n.length;for(let i=0;i<r;i++){const s=n.charAt(i);switch(s){case"\0":t+="";break;case"":t+="";break;default:t+=s}}return t}function el(n){return n+""}function Qe(n){const e=n.length;if(S(e>=2),e===2)return S(n.charAt(0)===""&&n.charAt(1)===""),U.emptyPath();const t=e-2,r=[];let i="";for(let s=0;s<e;){const o=n.indexOf("",s);switch((o<0||o>t)&&R(),n.charAt(o+1)){case"":const a=n.substring(s,o);let c;i.length===0?c=a:(i+=a,c=i,i=""),r.push(c);break;case"":i+=n.substring(s,o),i+="\0";break;case"":i+=n.substring(s,o+1);break;default:R()}s=o+2}return new U(r)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tl=["userId","batchId"];/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function us(n,e){return[n,Se(e)]}function lf(n,e,t){return[n,Se(e),t]}const CE={},DE=["prefixPath","collectionGroup","readTime","documentId"],VE=["prefixPath","collectionGroup","documentId"],kE=["collectionGroup","readTime","prefixPath","documentId"],NE=["canonicalId","targetId"],xE=["targetId","path"],OE=["path","targetId"],LE=["collectionId","parent"],ME=["indexId","uid"],FE=["uid","sequenceNumber"],UE=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],BE=["indexId","uid","orderedDocumentKey"],qE=["userId","collectionPath","documentId"],$E=["userId","collectionPath","largestBatchId"],GE=["userId","collectionGroup","largestBatchId"],hf=["mutationQueues","mutations","documentMutations","remoteDocuments","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries"],jE=[...hf,"documentOverlays"],df=["mutationQueues","mutations","documentMutations","remoteDocumentsV14","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries","documentOverlays"],ff=df,zE=[...ff,"indexConfiguration","indexState","indexEntries"];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class la extends cf{constructor(e,t){super(),this.ae=e,this.currentSequenceNumber=t}}function _e(n,e){const t=T(n);return Ue.M(t.ae,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nl(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function jt(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function pf(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class H{constructor(e,t){this.comparator=e,this.root=t||ye.EMPTY}insert(e,t){return new H(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,ye.BLACK,null,null))}remove(e){return new H(this.comparator,this.root.remove(e,this.comparator).copy(null,null,ye.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return t+r.left.size;i<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,r)=>(e(t,r),!1)))}toString(){const e=[];return this.inorderTraversal(((t,r)=>(e.push(`${t}:${r}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Ji(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Ji(this.root,e,this.comparator,!1)}getReverseIterator(){return new Ji(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Ji(this.root,e,this.comparator,!0)}}class Ji{constructor(e,t,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class ye{constructor(e,t,r,i,s){this.key=e,this.value=t,this.color=r??ye.RED,this.left=i??ye.EMPTY,this.right=s??ye.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,i,s){return new ye(e??this.key,t??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,r),null):s===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return ye.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return ye.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,ye.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,ye.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw R();const e=this.left.check();if(e!==this.right.check())throw R();return e+(this.isRed()?0:1)}}ye.EMPTY=null,ye.RED=!0,ye.BLACK=!1;ye.EMPTY=new class{constructor(){this.size=0}get key(){throw R()}get value(){throw R()}get color(){throw R()}get left(){throw R()}get right(){throw R()}copy(e,t,r,i,s){return this}insert(e,t,r){return new ye(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class z{constructor(e){this.comparator=e,this.data=new H(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,r)=>(e(t),!1)))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new rl(this.data.getIterator())}getIteratorFrom(e){return new rl(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((r=>{t=t.add(r)})),t}isEqual(e){if(!(e instanceof z)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new z(this.comparator);return t.data=e,t}}class rl{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function Dn(n){return n.hasNext()?n.getNext():void 0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ke{constructor(e){this.fields=e,e.sort(Y.comparator)}static empty(){return new ke([])}unionWith(e){let t=new z(Y.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new ke(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Hn(this.fields,e.fields,((t,r)=>t.isEqual(r)))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mf extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function KE(){return typeof atob<"u"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class le{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new mf("Invalid base64 string: "+s):s}})(e);return new le(t)}static fromUint8Array(e){const t=(function(i){let s="";for(let o=0;o<i.length;++o)s+=String.fromCharCode(i[o]);return s})(e);return new le(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return k(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}le.EMPTY_BYTE_STRING=new le("");const HE=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function kt(n){if(S(!!n),typeof n=="string"){let e=0;const t=HE.exec(n);if(S(!!t),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ee(n.seconds),nanos:ee(n.nanos)}}function ee(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function ct(n){return typeof n=="string"?le.fromBase64String(n):le.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ho(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function fo(n){const e=n.mapValue.fields.__previous_value__;return ho(e)?fo(e):e}function li(n){const e=kt(n.mapValue.fields.__local_write_time__.timestampValue);return new X(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WE{constructor(e,t,r,i,s,o,a,c,u){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=o,this.autoDetectLongPolling=a,this.longPollingOptions=c,this.useFetchStreams=u}}class Nt{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new Nt("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof Nt&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rt={mapValue:{fields:{__type__:{stringValue:"__max__"}}}},ls={nullValue:"NULL_VALUE"};function xt(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?ho(n)?4:gf(n)?9007199254740991:10:R()}function et(n,e){if(n===e)return!0;const t=xt(n);if(t!==xt(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return li(n).isEqual(li(e));case 3:return(function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;const o=kt(i.timestampValue),a=kt(s.timestampValue);return o.seconds===a.seconds&&o.nanos===a.nanos})(n,e);case 5:return n.stringValue===e.stringValue;case 6:return(function(i,s){return ct(i.bytesValue).isEqual(ct(s.bytesValue))})(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return(function(i,s){return ee(i.geoPointValue.latitude)===ee(s.geoPointValue.latitude)&&ee(i.geoPointValue.longitude)===ee(s.geoPointValue.longitude)})(n,e);case 2:return(function(i,s){if("integerValue"in i&&"integerValue"in s)return ee(i.integerValue)===ee(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){const o=ee(i.doubleValue),a=ee(s.doubleValue);return o===a?ui(o)===ui(a):isNaN(o)&&isNaN(a)}return!1})(n,e);case 9:return Hn(n.arrayValue.values||[],e.arrayValue.values||[],et);case 10:return(function(i,s){const o=i.mapValue.fields||{},a=s.mapValue.fields||{};if(nl(o)!==nl(a))return!1;for(const c in o)if(o.hasOwnProperty(c)&&(a[c]===void 0||!et(o[c],a[c])))return!1;return!0})(n,e);default:return R()}}function hi(n,e){return(n.values||[]).find((t=>et(t,e)))!==void 0}function Ot(n,e){if(n===e)return 0;const t=xt(n),r=xt(e);if(t!==r)return k(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return k(n.booleanValue,e.booleanValue);case 2:return(function(s,o){const a=ee(s.integerValue||s.doubleValue),c=ee(o.integerValue||o.doubleValue);return a<c?-1:a>c?1:a===c?0:isNaN(a)?isNaN(c)?0:-1:1})(n,e);case 3:return il(n.timestampValue,e.timestampValue);case 4:return il(li(n),li(e));case 5:return k(n.stringValue,e.stringValue);case 6:return(function(s,o){const a=ct(s),c=ct(o);return a.compareTo(c)})(n.bytesValue,e.bytesValue);case 7:return(function(s,o){const a=s.split("/"),c=o.split("/");for(let u=0;u<a.length&&u<c.length;u++){const l=k(a[u],c[u]);if(l!==0)return l}return k(a.length,c.length)})(n.referenceValue,e.referenceValue);case 8:return(function(s,o){const a=k(ee(s.latitude),ee(o.latitude));return a!==0?a:k(ee(s.longitude),ee(o.longitude))})(n.geoPointValue,e.geoPointValue);case 9:return(function(s,o){const a=s.values||[],c=o.values||[];for(let u=0;u<a.length&&u<c.length;++u){const l=Ot(a[u],c[u]);if(l)return l}return k(a.length,c.length)})(n.arrayValue,e.arrayValue);case 10:return(function(s,o){if(s===Rt.mapValue&&o===Rt.mapValue)return 0;if(s===Rt.mapValue)return 1;if(o===Rt.mapValue)return-1;const a=s.fields||{},c=Object.keys(a),u=o.fields||{},l=Object.keys(u);c.sort(),l.sort();for(let h=0;h<c.length&&h<l.length;++h){const d=k(c[h],l[h]);if(d!==0)return d;const f=Ot(a[c[h]],u[l[h]]);if(f!==0)return f}return k(c.length,l.length)})(n.mapValue,e.mapValue);default:throw R()}}function il(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return k(n,e);const t=kt(n),r=kt(e),i=k(t.seconds,r.seconds);return i!==0?i:k(t.nanos,r.nanos)}function Yn(n){return ha(n)}function ha(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?(function(t){const r=kt(t);return`time(${r.seconds},${r.nanos})`})(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?(function(t){return ct(t).toBase64()})(n.bytesValue):"referenceValue"in n?(function(t){return w.fromName(t).toString()})(n.referenceValue):"geoPointValue"in n?(function(t){return`geo(${t.latitude},${t.longitude})`})(n.geoPointValue):"arrayValue"in n?(function(t){let r="[",i=!0;for(const s of t.values||[])i?i=!1:r+=",",r+=ha(s);return r+"]"})(n.arrayValue):"mapValue"in n?(function(t){const r=Object.keys(t.fields||{}).sort();let i="{",s=!0;for(const o of r)s?s=!1:i+=",",i+=`${o}:${ha(t.fields[o])}`;return i+"}"})(n.mapValue):R()}function hs(n){switch(xt(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=fo(n);return e?16+hs(e):16;case 5:return 2*n.stringValue.length;case 6:return ct(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return(function(r){return(r.values||[]).reduce(((i,s)=>i+hs(s)),0)})(n.arrayValue);case 10:return(function(r){let i=0;return jt(r.fields,((s,o)=>{i+=s.length+hs(o)})),i})(n.mapValue);default:throw R()}}function pn(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function da(n){return!!n&&"integerValue"in n}function di(n){return!!n&&"arrayValue"in n}function sl(n){return!!n&&"nullValue"in n}function ol(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function ds(n){return!!n&&"mapValue"in n}function jr(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return jt(n.mapValue.fields,((t,r)=>e.mapValue.fields[t]=jr(r))),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=jr(n.arrayValue.values[t]);return e}return Object.assign({},n)}function gf(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}function QE(n){return"nullValue"in n?ls:"booleanValue"in n?{booleanValue:!1}:"integerValue"in n||"doubleValue"in n?{doubleValue:NaN}:"timestampValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in n?{stringValue:""}:"bytesValue"in n?{bytesValue:""}:"referenceValue"in n?pn(Nt.empty(),w.empty()):"geoPointValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in n?{arrayValue:{}}:"mapValue"in n?{mapValue:{}}:R()}function YE(n){return"nullValue"in n?{booleanValue:!1}:"booleanValue"in n?{doubleValue:NaN}:"integerValue"in n||"doubleValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in n?{stringValue:""}:"stringValue"in n?{bytesValue:""}:"bytesValue"in n?pn(Nt.empty(),w.empty()):"referenceValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in n?{arrayValue:{}}:"arrayValue"in n?{mapValue:{}}:"mapValue"in n?Rt:R()}function al(n,e){const t=Ot(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?-1:!n.inclusive&&e.inclusive?1:0}function cl(n,e){const t=Ot(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?1:!n.inclusive&&e.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ee{constructor(e){this.value=e}static empty(){return new Ee({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!ds(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=jr(t)}setAll(e){let t=Y.emptyPath(),r={},i=[];e.forEach(((o,a)=>{if(!t.isImmediateParentOf(a)){const c=this.getFieldsMap(t);this.applyChanges(c,r,i),r={},i=[],t=a.popLast()}o?r[a.lastSegment()]=jr(o):i.push(a.lastSegment())}));const s=this.getFieldsMap(t);this.applyChanges(s,r,i)}delete(e){const t=this.field(e.popLast());ds(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return et(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=t.mapValue.fields[e.get(r)];ds(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,r){jt(t,((i,s)=>e[i]=s));for(const i of r)delete e[i]}clone(){return new Ee(jr(this.value))}}function _f(n){const e=[];return jt(n.fields,((t,r)=>{const i=new Y([t]);if(ds(r)){const s=_f(r.mapValue).fields;if(s.length===0)e.push(i);else for(const o of s)e.push(i.child(o))}else e.push(i)})),new ke(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Q{constructor(e,t,r,i,s,o,a){this.key=e,this.documentType=t,this.version=r,this.readTime=i,this.createTime=s,this.data=o,this.documentState=a}static newInvalidDocument(e){return new Q(e,0,b.min(),b.min(),b.min(),Ee.empty(),0)}static newFoundDocument(e,t,r,i){return new Q(e,1,t,b.min(),r,i,0)}static newNoDocument(e,t){return new Q(e,2,t,b.min(),b.min(),Ee.empty(),0)}static newUnknownDocument(e,t){return new Q(e,3,t,b.min(),b.min(),Ee.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(b.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Ee.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Ee.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=b.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Q&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Q(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lt{constructor(e,t){this.position=e,this.inclusive=t}}function ul(n,e,t){let r=0;for(let i=0;i<n.position.length;i++){const s=e[i],o=n.position[i];if(s.field.isKeyField()?r=w.comparator(w.fromName(o.referenceValue),t.key):r=Ot(o,t.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function ll(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!et(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi{constructor(e,t="asc"){this.field=e,this.dir=t}}function JE(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yf{}class B extends yf{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new XE(e,t,r):t==="array-contains"?new tT(e,r):t==="in"?new Af(e,r):t==="not-in"?new nT(e,r):t==="array-contains-any"?new rT(e,r):new B(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new ZE(e,r):new eT(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(Ot(t,this.value)):t!==null&&xt(this.value)===xt(t)&&this.matchesComparison(Ot(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return R()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class G extends yf{constructor(e,t){super(),this.filters=e,this.op=t,this.ue=null}static create(e,t){return new G(e,t)}matches(e){return Jn(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.ue!==null||(this.ue=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.ue}getFilters(){return Object.assign([],this.filters)}}function Jn(n){return n.op==="and"}function fa(n){return n.op==="or"}function mc(n){return If(n)&&Jn(n)}function If(n){for(const e of n.filters)if(e instanceof G)return!1;return!0}function pa(n){if(n instanceof B)return n.field.canonicalString()+n.op.toString()+Yn(n.value);if(mc(n))return n.filters.map((e=>pa(e))).join(",");{const e=n.filters.map((t=>pa(t))).join(",");return`${n.op}(${e})`}}function Ef(n,e){return n instanceof B?(function(r,i){return i instanceof B&&r.op===i.op&&r.field.isEqual(i.field)&&et(r.value,i.value)})(n,e):n instanceof G?(function(r,i){return i instanceof G&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce(((s,o,a)=>s&&Ef(o,i.filters[a])),!0):!1})(n,e):void R()}function Tf(n,e){const t=n.filters.concat(e);return G.create(t,n.op)}function wf(n){return n instanceof B?(function(t){return`${t.field.canonicalString()} ${t.op} ${Yn(t.value)}`})(n):n instanceof G?(function(t){return t.op.toString()+" {"+t.getFilters().map(wf).join(" ,")+"}"})(n):"Filter"}class XE extends B{constructor(e,t,r){super(e,t,r),this.key=w.fromName(r.referenceValue)}matches(e){const t=w.comparator(e.key,this.key);return this.matchesComparison(t)}}class ZE extends B{constructor(e,t){super(e,"in",t),this.keys=vf("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class eT extends B{constructor(e,t){super(e,"not-in",t),this.keys=vf("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function vf(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map((r=>w.fromName(r.referenceValue)))}class tT extends B{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return di(t)&&hi(t.arrayValue,this.value)}}class Af extends B{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&hi(this.value.arrayValue,t)}}class nT extends B{constructor(e,t){super(e,"not-in",t)}matches(e){if(hi(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!hi(this.value.arrayValue,t)}}class rT extends B{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!di(t)||!t.arrayValue.values)&&t.arrayValue.values.some((r=>hi(this.value.arrayValue,r)))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iT{constructor(e,t=null,r=[],i=[],s=null,o=null,a=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=o,this.endAt=a,this.ce=null}}function ma(n,e=null,t=[],r=[],i=null,s=null,o=null){return new iT(n,e,t,r,i,s,o)}function mn(n){const e=T(n);if(e.ce===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((r=>pa(r))).join(","),t+="|ob:",t+=e.orderBy.map((r=>(function(s){return s.field.canonicalString()+s.dir})(r))).join(","),Di(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((r=>Yn(r))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((r=>Yn(r))).join(",")),e.ce=t}return e.ce}function Vi(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!JE(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Ef(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!ll(n.startAt,e.startAt)&&ll(n.endAt,e.endAt)}function Cs(n){return w.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function Ds(n,e){return n.filters.filter((t=>t instanceof B&&t.field.isEqual(e)))}function hl(n,e,t){let r=ls,i=!0;for(const s of Ds(n,e)){let o=ls,a=!0;switch(s.op){case"<":case"<=":o=QE(s.value);break;case"==":case"in":case">=":o=s.value;break;case">":o=s.value,a=!1;break;case"!=":case"not-in":o=ls}al({value:r,inclusive:i},{value:o,inclusive:a})<0&&(r=o,i=a)}if(t!==null){for(let s=0;s<n.orderBy.length;++s)if(n.orderBy[s].field.isEqual(e)){const o=t.position[s];al({value:r,inclusive:i},{value:o,inclusive:t.inclusive})<0&&(r=o,i=t.inclusive);break}}return{value:r,inclusive:i}}function dl(n,e,t){let r=Rt,i=!0;for(const s of Ds(n,e)){let o=Rt,a=!0;switch(s.op){case">=":case">":o=YE(s.value),a=!1;break;case"==":case"in":case"<=":o=s.value;break;case"<":o=s.value,a=!1;break;case"!=":case"not-in":o=Rt}cl({value:r,inclusive:i},{value:o,inclusive:a})>0&&(r=o,i=a)}if(t!==null){for(let s=0;s<n.orderBy.length;++s)if(n.orderBy[s].field.isEqual(e)){const o=t.position[s];cl({value:r,inclusive:i},{value:o,inclusive:t.inclusive})>0&&(r=o,i=t.inclusive);break}}return{value:r,inclusive:i}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt{constructor(e,t=null,r=[],i=[],s=null,o="F",a=null,c=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=o,this.startAt=a,this.endAt=c,this.le=null,this.he=null,this.Pe=null,this.startAt,this.endAt}}function Rf(n,e,t,r,i,s,o,a){return new lt(n,e,t,r,i,s,o,a)}function fr(n){return new lt(n)}function fl(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function gc(n){return n.collectionGroup!==null}function Gn(n){const e=T(n);if(e.le===null){e.le=[];const t=new Set;for(const s of e.explicitOrderBy)e.le.push(s),t.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let a=new z(Y.comparator);return o.filters.forEach((c=>{c.getFlattenedFilters().forEach((u=>{u.isInequality()&&(a=a.add(u.field))}))})),a})(e).forEach((s=>{t.has(s.canonicalString())||s.isKeyField()||e.le.push(new fi(s,r))})),t.has(Y.keyField().canonicalString())||e.le.push(new fi(Y.keyField(),r))}return e.le}function De(n){const e=T(n);return e.he||(e.he=Pf(e,Gn(n))),e.he}function Pf(n,e){if(n.limitType==="F")return ma(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map((i=>{const s=i.dir==="desc"?"asc":"desc";return new fi(i.field,s)}));const t=n.endAt?new Lt(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new Lt(n.startAt.position,n.startAt.inclusive):null;return ma(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function ga(n,e){const t=n.filters.concat([e]);return new lt(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function Vs(n,e,t){return new lt(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function ki(n,e){return Vi(De(n),De(e))&&n.limitType===e.limitType}function Sf(n){return`${mn(De(n))}|lt:${n.limitType}`}function On(n){return`Query(target=${(function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map((i=>wf(i))).join(", ")}]`),Di(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map((i=>(function(o){return`${o.field.canonicalString()} (${o.dir})`})(i))).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map((i=>Yn(i))).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map((i=>Yn(i))).join(",")),`Target(${r})`})(De(n))}; limitType=${n.limitType})`}function Ni(n,e){return e.isFoundDocument()&&(function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):w.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)})(n,e)&&(function(r,i){for(const s of Gn(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0})(n,e)&&(function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0})(n,e)&&(function(r,i){return!(r.startAt&&!(function(o,a,c){const u=ul(o,a,c);return o.inclusive?u<=0:u<0})(r.startAt,Gn(r),i)||r.endAt&&!(function(o,a,c){const u=ul(o,a,c);return o.inclusive?u>=0:u>0})(r.endAt,Gn(r),i))})(n,e)}function bf(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Cf(n){return(e,t)=>{let r=!1;for(const i of Gn(n)){const s=sT(i,e,t);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function sT(n,e,t){const r=n.field.isKeyField()?w.comparator(e.key,t.key):(function(s,o,a){const c=o.data.field(s),u=a.data.field(s);return c!==null&&u!==null?Ot(c,u):R()})(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return R()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ht{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[t]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){jt(this.inner,((t,r)=>{for(const[i,s]of r)e(i,s)}))}isEmpty(){return pf(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oT=new H(w.comparator);function Ne(){return oT}const Df=new H(w.comparator);function Fr(...n){let e=Df;for(const t of n)e=e.insert(t.key,t);return e}function Vf(n){let e=Df;return n.forEach(((t,r)=>e=e.insert(t,r.overlayedDocument))),e}function Ye(){return zr()}function kf(){return zr()}function zr(){return new ht((n=>n.toString()),((n,e)=>n.isEqual(e)))}const aT=new H(w.comparator),cT=new z(w.comparator);function x(...n){let e=cT;for(const t of n)e=e.add(t);return e}const uT=new z(k);function _c(){return uT}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nf(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:ui(e)?"-0":e}}function xf(n){return{integerValue:""+n}}function Of(n,e){return uf(e)?xf(e):Nf(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class po{constructor(){this._=void 0}}function lT(n,e,t){return n instanceof Xn?(function(i,s){const o={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&ho(s)&&(s=fo(s)),s&&(o.fields.__previous_value__=s),{mapValue:o}})(t,e):n instanceof gn?Mf(n,e):n instanceof _n?Ff(n,e):(function(i,s){const o=Lf(i,s),a=pl(o)+pl(i.Ie);return da(o)&&da(i.Ie)?xf(a):Nf(i.serializer,a)})(n,e)}function hT(n,e,t){return n instanceof gn?Mf(n,e):n instanceof _n?Ff(n,e):t}function Lf(n,e){return n instanceof Zn?(function(r){return da(r)||(function(s){return!!s&&"doubleValue"in s})(r)})(e)?e:{integerValue:0}:null}class Xn extends po{}class gn extends po{constructor(e){super(),this.elements=e}}function Mf(n,e){const t=Uf(e);for(const r of n.elements)t.some((i=>et(i,r)))||t.push(r);return{arrayValue:{values:t}}}class _n extends po{constructor(e){super(),this.elements=e}}function Ff(n,e){let t=Uf(e);for(const r of n.elements)t=t.filter((i=>!et(i,r)));return{arrayValue:{values:t}}}class Zn extends po{constructor(e,t){super(),this.serializer=e,this.Ie=t}}function pl(n){return ee(n.integerValue||n.doubleValue)}function Uf(n){return di(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xi{constructor(e,t){this.field=e,this.transform=t}}function dT(n,e){return n.field.isEqual(e.field)&&(function(r,i){return r instanceof gn&&i instanceof gn||r instanceof _n&&i instanceof _n?Hn(r.elements,i.elements,et):r instanceof Zn&&i instanceof Zn?et(r.Ie,i.Ie):r instanceof Xn&&i instanceof Xn})(n.transform,e.transform)}class fT{constructor(e,t){this.version=e,this.transformResults=t}}class J{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new J}static exists(e){return new J(void 0,e)}static updateTime(e){return new J(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function fs(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class mo{}function Bf(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new mr(n.key,J.none()):new pr(n.key,n.data,J.none());{const t=n.data,r=Ee.empty();let i=new z(Y.comparator);for(let s of e.fields)if(!i.has(s)){let o=t.field(s);o===null&&s.length>1&&(s=s.popLast(),o=t.field(s)),o===null?r.delete(s):r.set(s,o),i=i.add(s)}return new dt(n.key,r,new ke(i.toArray()),J.none())}}function pT(n,e,t){n instanceof pr?(function(i,s,o){const a=i.value.clone(),c=gl(i.fieldTransforms,s,o.transformResults);a.setAll(c),s.convertToFoundDocument(o.version,a).setHasCommittedMutations()})(n,e,t):n instanceof dt?(function(i,s,o){if(!fs(i.precondition,s))return void s.convertToUnknownDocument(o.version);const a=gl(i.fieldTransforms,s,o.transformResults),c=s.data;c.setAll(qf(i)),c.setAll(a),s.convertToFoundDocument(o.version,c).setHasCommittedMutations()})(n,e,t):(function(i,s,o){s.convertToNoDocument(o.version).setHasCommittedMutations()})(0,e,t)}function Kr(n,e,t,r){return n instanceof pr?(function(s,o,a,c){if(!fs(s.precondition,o))return a;const u=s.value.clone(),l=_l(s.fieldTransforms,c,o);return u.setAll(l),o.convertToFoundDocument(o.version,u).setHasLocalMutations(),null})(n,e,t,r):n instanceof dt?(function(s,o,a,c){if(!fs(s.precondition,o))return a;const u=_l(s.fieldTransforms,c,o),l=o.data;return l.setAll(qf(s)),l.setAll(u),o.convertToFoundDocument(o.version,l).setHasLocalMutations(),a===null?null:a.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map((h=>h.field)))})(n,e,t,r):(function(s,o,a){return fs(s.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):a})(n,e,t)}function mT(n,e){let t=null;for(const r of n.fieldTransforms){const i=e.data.field(r.field),s=Lf(r.transform,i||null);s!=null&&(t===null&&(t=Ee.empty()),t.set(r.field,s))}return t||null}function ml(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!(function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&Hn(r,i,((s,o)=>dT(s,o)))})(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class pr extends mo{constructor(e,t,r,i=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class dt extends mo{constructor(e,t,r,i,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function qf(n){const e=new Map;return n.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}})),e}function gl(n,e,t){const r=new Map;S(n.length===t.length);for(let i=0;i<t.length;i++){const s=n[i],o=s.transform,a=e.data.field(s.field);r.set(s.field,hT(o,a,t[i]))}return r}function _l(n,e,t){const r=new Map;for(const i of n){const s=i.transform,o=t.data.field(i.field);r.set(i.field,lT(s,o,e))}return r}class mr extends mo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class yc extends mo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ic{constructor(e,t,r,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&pT(s,e,r[i])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Kr(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Kr(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=kf();return this.mutations.forEach((i=>{const s=e.get(i.key),o=s.overlayedDocument;let a=this.applyToLocalView(o,s.mutatedFields);a=t.has(i.key)?null:a;const c=Bf(o,a);c!==null&&r.set(i.key,c),o.isValidDocument()||o.convertToNoDocument(b.min())})),r}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),x())}isEqual(e){return this.batchId===e.batchId&&Hn(this.mutations,e.mutations,((t,r)=>ml(t,r)))&&Hn(this.baseMutations,e.baseMutations,((t,r)=>ml(t,r)))}}class Ec{constructor(e,t,r,i){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=i}static from(e,t,r){S(e.mutations.length===r.length);let i=(function(){return aT})();const s=e.mutations;for(let o=0;o<s.length;o++)i=i.insert(s[o].key,r[o].version);return new Ec(e,t,r,i)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tc{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gT{constructor(e,t,r){this.alias=e,this.aggregateType=t,this.fieldPath=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _T{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ce,q;function $f(n){switch(n){default:return R();case m.CANCELLED:case m.UNKNOWN:case m.DEADLINE_EXCEEDED:case m.RESOURCE_EXHAUSTED:case m.INTERNAL:case m.UNAVAILABLE:case m.UNAUTHENTICATED:return!1;case m.INVALID_ARGUMENT:case m.NOT_FOUND:case m.ALREADY_EXISTS:case m.PERMISSION_DENIED:case m.FAILED_PRECONDITION:case m.ABORTED:case m.OUT_OF_RANGE:case m.UNIMPLEMENTED:case m.DATA_LOSS:return!0}}function Gf(n){if(n===void 0)return oe("GRPC error has no .code"),m.UNKNOWN;switch(n){case ce.OK:return m.OK;case ce.CANCELLED:return m.CANCELLED;case ce.UNKNOWN:return m.UNKNOWN;case ce.DEADLINE_EXCEEDED:return m.DEADLINE_EXCEEDED;case ce.RESOURCE_EXHAUSTED:return m.RESOURCE_EXHAUSTED;case ce.INTERNAL:return m.INTERNAL;case ce.UNAVAILABLE:return m.UNAVAILABLE;case ce.UNAUTHENTICATED:return m.UNAUTHENTICATED;case ce.INVALID_ARGUMENT:return m.INVALID_ARGUMENT;case ce.NOT_FOUND:return m.NOT_FOUND;case ce.ALREADY_EXISTS:return m.ALREADY_EXISTS;case ce.PERMISSION_DENIED:return m.PERMISSION_DENIED;case ce.FAILED_PRECONDITION:return m.FAILED_PRECONDITION;case ce.ABORTED:return m.ABORTED;case ce.OUT_OF_RANGE:return m.OUT_OF_RANGE;case ce.UNIMPLEMENTED:return m.UNIMPLEMENTED;case ce.DATA_LOSS:return m.DATA_LOSS;default:return R()}}(q=ce||(ce={}))[q.OK=0]="OK",q[q.CANCELLED=1]="CANCELLED",q[q.UNKNOWN=2]="UNKNOWN",q[q.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",q[q.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",q[q.NOT_FOUND=5]="NOT_FOUND",q[q.ALREADY_EXISTS=6]="ALREADY_EXISTS",q[q.PERMISSION_DENIED=7]="PERMISSION_DENIED",q[q.UNAUTHENTICATED=16]="UNAUTHENTICATED",q[q.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",q[q.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",q[q.ABORTED=10]="ABORTED",q[q.OUT_OF_RANGE=11]="OUT_OF_RANGE",q[q.UNIMPLEMENTED=12]="UNIMPLEMENTED",q[q.INTERNAL=13]="INTERNAL",q[q.UNAVAILABLE=14]="UNAVAILABLE",q[q.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ks=null;/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jf(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yT=new $n([4294967295,4294967295],0);function yl(n){const e=jf().encode(n),t=new hE;return t.update(e),new Uint8Array(t.digest())}function Il(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new $n([t,r],0),new $n([i,s],0)]}class wc{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Ur(`Invalid padding: ${t}`);if(r<0)throw new Ur(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Ur(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Ur(`Invalid padding when bitmap length is 0: ${t}`);this.Te=8*e.length-t,this.Ee=$n.fromNumber(this.Te)}de(e,t,r){let i=e.add(t.multiply($n.fromNumber(r)));return i.compare(yT)===1&&(i=new $n([i.getBits(0),i.getBits(1)],0)),i.modulo(this.Ee).toNumber()}Ae(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Te===0)return!1;const t=yl(e),[r,i]=Il(t);for(let s=0;s<this.hashCount;s++){const o=this.de(r,i,s);if(!this.Ae(o))return!1}return!0}static create(e,t,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),o=new wc(s,i,t);return r.forEach((a=>o.insert(a))),o}insert(e){if(this.Te===0)return;const t=yl(e),[r,i]=Il(t);for(let s=0;s<this.hashCount;s++){const o=this.de(r,i,s);this.Re(o)}}Re(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Ur extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oi{constructor(e,t,r,i,s){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const i=new Map;return i.set(e,Li.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Oi(b.min(),i,new H(k),Ne(),x())}}class Li{constructor(e,t,r,i,s){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new Li(r,t,x(),x(),x())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ps{constructor(e,t,r,i){this.Ve=e,this.removedTargetIds=t,this.key=r,this.me=i}}class zf{constructor(e,t){this.targetId=e,this.fe=t}}class Kf{constructor(e,t,r=le.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=i}}class El{constructor(){this.ge=0,this.pe=wl(),this.ye=le.EMPTY_BYTE_STRING,this.we=!1,this.Se=!0}get current(){return this.we}get resumeToken(){return this.ye}get be(){return this.ge!==0}get De(){return this.Se}Ce(e){e.approximateByteSize()>0&&(this.Se=!0,this.ye=e)}ve(){let e=x(),t=x(),r=x();return this.pe.forEach(((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:r=r.add(i);break;default:R()}})),new Li(this.ye,this.we,e,t,r)}Fe(){this.Se=!1,this.pe=wl()}Me(e,t){this.Se=!0,this.pe=this.pe.insert(e,t)}xe(e){this.Se=!0,this.pe=this.pe.remove(e)}Oe(){this.ge+=1}Ne(){this.ge-=1,S(this.ge>=0)}Be(){this.Se=!0,this.we=!0}}class IT{constructor(e){this.Le=e,this.ke=new Map,this.qe=Ne(),this.Qe=Tl(),this.Ke=new H(k)}$e(e){for(const t of e.Ve)e.me&&e.me.isFoundDocument()?this.Ue(t,e.me):this.We(t,e.key,e.me);for(const t of e.removedTargetIds)this.We(t,e.key,e.me)}Ge(e){this.forEachTarget(e,(t=>{const r=this.ze(t);switch(e.state){case 0:this.je(t)&&r.Ce(e.resumeToken);break;case 1:r.Ne(),r.be||r.Fe(),r.Ce(e.resumeToken);break;case 2:r.Ne(),r.be||this.removeTarget(t);break;case 3:this.je(t)&&(r.Be(),r.Ce(e.resumeToken));break;case 4:this.je(t)&&(this.He(t),r.Ce(e.resumeToken));break;default:R()}}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ke.forEach(((r,i)=>{this.je(i)&&t(i)}))}Je(e){const t=e.targetId,r=e.fe.count,i=this.Ye(t);if(i){const s=i.target;if(Cs(s))if(r===0){const o=new w(s.path);this.We(t,o,Q.newNoDocument(o,b.min()))}else S(r===1);else{const o=this.Ze(t);if(o!==r){const a=this.Xe(e),c=a?this.et(a,e,o):1;if(c!==0){this.He(t);const u=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ke=this.Ke.insert(t,u)}ks==null||ks.tt((function(l,h,d,f,I){var E,y,P,C,A,D;const $={localCacheCount:l,existenceFilterCount:h.count,databaseId:d.database,projectId:d.projectId},O=h.unchangedNames;return O&&($.bloomFilter={applied:I===0,hashCount:(E=O==null?void 0:O.hashCount)!==null&&E!==void 0?E:0,bitmapLength:(C=(P=(y=O==null?void 0:O.bits)===null||y===void 0?void 0:y.bitmap)===null||P===void 0?void 0:P.length)!==null&&C!==void 0?C:0,padding:(D=(A=O==null?void 0:O.bits)===null||A===void 0?void 0:A.padding)!==null&&D!==void 0?D:0,mightContain:Z=>{var we;return(we=f==null?void 0:f.mightContain(Z))!==null&&we!==void 0&&we}}),$})(o,e.fe,this.Le.nt(),a,c))}}}}Xe(e){const t=e.fe.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=t;let o,a;try{o=ct(r).toUint8Array()}catch(c){if(c instanceof mf)return xe("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{a=new wc(o,i,s)}catch(c){return xe(c instanceof Ur?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return a.Te===0?null:a}et(e,t,r){return t.fe.count===r-this.rt(e,t.targetId)?0:2}rt(e,t){const r=this.Le.getRemoteKeysForTarget(t);let i=0;return r.forEach((s=>{const o=this.Le.nt(),a=`projects/${o.projectId}/databases/${o.database}/documents/${s.path.canonicalString()}`;e.mightContain(a)||(this.We(t,s,null),i++)})),i}it(e){const t=new Map;this.ke.forEach(((s,o)=>{const a=this.Ye(o);if(a){if(s.current&&Cs(a.target)){const c=new w(a.target.path);this.qe.get(c)!==null||this.st(o,c)||this.We(o,c,Q.newNoDocument(c,e))}s.De&&(t.set(o,s.ve()),s.Fe())}}));let r=x();this.Qe.forEach(((s,o)=>{let a=!0;o.forEachWhile((c=>{const u=this.Ye(c);return!u||u.purpose==="TargetPurposeLimboResolution"||(a=!1,!1)})),a&&(r=r.add(s))})),this.qe.forEach(((s,o)=>o.setReadTime(e)));const i=new Oi(e,t,this.Ke,this.qe,r);return this.qe=Ne(),this.Qe=Tl(),this.Ke=new H(k),i}Ue(e,t){if(!this.je(e))return;const r=this.st(e,t.key)?2:0;this.ze(e).Me(t.key,r),this.qe=this.qe.insert(t.key,t),this.Qe=this.Qe.insert(t.key,this.ot(t.key).add(e))}We(e,t,r){if(!this.je(e))return;const i=this.ze(e);this.st(e,t)?i.Me(t,1):i.xe(t),this.Qe=this.Qe.insert(t,this.ot(t).delete(e)),r&&(this.qe=this.qe.insert(t,r))}removeTarget(e){this.ke.delete(e)}Ze(e){const t=this.ze(e).ve();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}Oe(e){this.ze(e).Oe()}ze(e){let t=this.ke.get(e);return t||(t=new El,this.ke.set(e,t)),t}ot(e){let t=this.Qe.get(e);return t||(t=new z(k),this.Qe=this.Qe.insert(e,t)),t}je(e){const t=this.Ye(e)!==null;return t||_("WatchChangeAggregator","Detected inactive target",e),t}Ye(e){const t=this.ke.get(e);return t&&t.be?null:this.Le._t(e)}He(e){this.ke.set(e,new El),this.Le.getRemoteKeysForTarget(e).forEach((t=>{this.We(e,t,null)}))}st(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}}function Tl(){return new H(w.comparator)}function wl(){return new H(w.comparator)}const ET={asc:"ASCENDING",desc:"DESCENDING"},TT={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},wT={and:"AND",or:"OR"};class vT{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function _a(n,e){return n.useProto3Json||Di(e)?e:{value:e}}function er(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Hf(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function AT(n,e){return er(n,e.toTimestamp())}function ae(n){return S(!!n),b.fromTimestamp((function(t){const r=kt(t);return new X(r.seconds,r.nanos)})(n))}function vc(n,e){return ya(n,e).canonicalString()}function ya(n,e){const t=(function(i){return new U(["projects",i.projectId,"databases",i.database])})(n).child("documents");return e===void 0?t:t.child(e)}function Wf(n){const e=U.fromString(n);return S(rp(e)),e}function pi(n,e){return vc(n.databaseId,e.path)}function Ze(n,e){const t=Wf(e);if(t.get(1)!==n.databaseId.projectId)throw new g(m.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new g(m.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new w(Jf(t))}function Qf(n,e){return vc(n.databaseId,e)}function Yf(n){const e=Wf(n);return e.length===4?U.emptyPath():Jf(e)}function Ia(n){return new U(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function Jf(n){return S(n.length>4&&n.get(4)==="documents"),n.popFirst(5)}function vl(n,e,t){return{name:pi(n,e),fields:t.value.mapValue.fields}}function Xf(n,e,t){const r=Ze(n,e.name),i=ae(e.updateTime),s=e.createTime?ae(e.createTime):b.min(),o=new Ee({mapValue:{fields:e.fields}}),a=Q.newFoundDocument(r,i,s,o);return t&&a.setHasCommittedMutations(),t?a.setHasCommittedMutations():a}function RT(n,e){return"found"in e?(function(r,i){S(!!i.found),i.found.name,i.found.updateTime;const s=Ze(r,i.found.name),o=ae(i.found.updateTime),a=i.found.createTime?ae(i.found.createTime):b.min(),c=new Ee({mapValue:{fields:i.found.fields}});return Q.newFoundDocument(s,o,a,c)})(n,e):"missing"in e?(function(r,i){S(!!i.missing),S(!!i.readTime);const s=Ze(r,i.missing),o=ae(i.readTime);return Q.newNoDocument(s,o)})(n,e):R()}function PT(n,e){let t;if("targetChange"in e){e.targetChange;const r=(function(u){return u==="NO_CHANGE"?0:u==="ADD"?1:u==="REMOVE"?2:u==="CURRENT"?3:u==="RESET"?4:R()})(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=(function(u,l){return u.useProto3Json?(S(l===void 0||typeof l=="string"),le.fromBase64String(l||"")):(S(l===void 0||l instanceof Uint8Array),le.fromUint8Array(l||new Uint8Array))})(n,e.targetChange.resumeToken),o=e.targetChange.cause,a=o&&(function(u){const l=u.code===void 0?m.UNKNOWN:Gf(u.code);return new g(l,u.message||"")})(o);t=new Kf(r,i,s,a||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=Ze(n,r.document.name),s=ae(r.document.updateTime),o=r.document.createTime?ae(r.document.createTime):b.min(),a=new Ee({mapValue:{fields:r.document.fields}}),c=Q.newFoundDocument(i,s,o,a),u=r.targetIds||[],l=r.removedTargetIds||[];t=new ps(u,l,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=Ze(n,r.document),s=r.readTime?ae(r.readTime):b.min(),o=Q.newNoDocument(i,s),a=r.removedTargetIds||[];t=new ps([],a,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=Ze(n,r.document),s=r.removedTargetIds||[];t=new ps([],s,i,null)}else{if(!("filter"in e))return R();{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,o=new _T(i,s),a=r.targetId;t=new zf(a,o)}}return t}function mi(n,e){let t;if(e instanceof pr)t={update:vl(n,e.key,e.value)};else if(e instanceof mr)t={delete:pi(n,e.key)};else if(e instanceof dt)t={update:vl(n,e.key,e.data),updateMask:kT(e.fieldMask)};else{if(!(e instanceof yc))return R();t={verify:pi(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((r=>(function(s,o){const a=o.transform;if(a instanceof Xn)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(a instanceof gn)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:a.elements}};if(a instanceof _n)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:a.elements}};if(a instanceof Zn)return{fieldPath:o.field.canonicalString(),increment:a.Ie};throw R()})(0,r)))),e.precondition.isNone||(t.currentDocument=(function(i,s){return s.updateTime!==void 0?{updateTime:AT(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:R()})(n,e.precondition)),t}function Ea(n,e){const t=e.currentDocument?(function(s){return s.updateTime!==void 0?J.updateTime(ae(s.updateTime)):s.exists!==void 0?J.exists(s.exists):J.none()})(e.currentDocument):J.none(),r=e.updateTransforms?e.updateTransforms.map((i=>(function(o,a){let c=null;if("setToServerValue"in a)S(a.setToServerValue==="REQUEST_TIME"),c=new Xn;else if("appendMissingElements"in a){const l=a.appendMissingElements.values||[];c=new gn(l)}else if("removeAllFromArray"in a){const l=a.removeAllFromArray.values||[];c=new _n(l)}else"increment"in a?c=new Zn(o,a.increment):R();const u=Y.fromServerFormat(a.fieldPath);return new xi(u,c)})(n,i))):[];if(e.update){e.update.name;const i=Ze(n,e.update.name),s=new Ee({mapValue:{fields:e.update.fields}});if(e.updateMask){const o=(function(c){const u=c.fieldPaths||[];return new ke(u.map((l=>Y.fromServerFormat(l))))})(e.updateMask);return new dt(i,s,o,t,r)}return new pr(i,s,t,r)}if(e.delete){const i=Ze(n,e.delete);return new mr(i,t)}if(e.verify){const i=Ze(n,e.verify);return new yc(i,t)}return R()}function ST(n,e){return n&&n.length>0?(S(e!==void 0),n.map((t=>(function(i,s){let o=i.updateTime?ae(i.updateTime):ae(s);return o.isEqual(b.min())&&(o=ae(s)),new fT(o,i.transformResults||[])})(t,e)))):[]}function Zf(n,e){return{documents:[Qf(n,e.path)]}}function Ac(n,e){const t={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=Qf(n,i);const s=(function(u){if(u.length!==0)return np(G.create(u,"and"))})(e.filters);s&&(t.structuredQuery.where=s);const o=(function(u){if(u.length!==0)return u.map((l=>(function(d){return{field:Tt(d.field),direction:CT(d.dir)}})(l)))})(e.orderBy);o&&(t.structuredQuery.orderBy=o);const a=_a(n,e.limit);return a!==null&&(t.structuredQuery.limit=a),e.startAt&&(t.structuredQuery.startAt=(function(u){return{before:u.inclusive,values:u.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(u){return{before:!u.inclusive,values:u.position}})(e.endAt)),{ut:t,parent:i}}function ep(n){let e=Yf(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let i=null;if(r>0){S(r===1);const l=t.from[0];l.allDescendants?i=l.collectionId:e=e.child(l.collectionId)}let s=[];t.where&&(s=(function(h){const d=tp(h);return d instanceof G&&mc(d)?d.getFilters():[d]})(t.where));let o=[];t.orderBy&&(o=(function(h){return h.map((d=>(function(I){return new fi(Ln(I.field),(function(y){switch(y){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(I.direction))})(d)))})(t.orderBy));let a=null;t.limit&&(a=(function(h){let d;return d=typeof h=="object"?h.value:h,Di(d)?null:d})(t.limit));let c=null;t.startAt&&(c=(function(h){const d=!!h.before,f=h.values||[];return new Lt(f,d)})(t.startAt));let u=null;return t.endAt&&(u=(function(h){const d=!h.before,f=h.values||[];return new Lt(f,d)})(t.endAt)),Rf(e,i,o,s,a,"F",c,u)}function bT(n,e){const t=(function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return R()}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function tp(n){return n.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Ln(t.unaryFilter.field);return B.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=Ln(t.unaryFilter.field);return B.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=Ln(t.unaryFilter.field);return B.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Ln(t.unaryFilter.field);return B.create(o,"!=",{nullValue:"NULL_VALUE"});default:return R()}})(n):n.fieldFilter!==void 0?(function(t){return B.create(Ln(t.fieldFilter.field),(function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return R()}})(t.fieldFilter.op),t.fieldFilter.value)})(n):n.compositeFilter!==void 0?(function(t){return G.create(t.compositeFilter.filters.map((r=>tp(r))),(function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return R()}})(t.compositeFilter.op))})(n):R()}function CT(n){return ET[n]}function DT(n){return TT[n]}function VT(n){return wT[n]}function Tt(n){return{fieldPath:n.canonicalString()}}function Ln(n){return Y.fromServerFormat(n.fieldPath)}function np(n){return n instanceof B?(function(t){if(t.op==="=="){if(ol(t.value))return{unaryFilter:{field:Tt(t.field),op:"IS_NAN"}};if(sl(t.value))return{unaryFilter:{field:Tt(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(ol(t.value))return{unaryFilter:{field:Tt(t.field),op:"IS_NOT_NAN"}};if(sl(t.value))return{unaryFilter:{field:Tt(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Tt(t.field),op:DT(t.op),value:t.value}}})(n):n instanceof G?(function(t){const r=t.getFilters().map((i=>np(i)));return r.length===1?r[0]:{compositeFilter:{op:VT(t.op),filters:r}}})(n):R()}function kT(n){const e=[];return n.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function rp(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class it{constructor(e,t,r,i,s=b.min(),o=b.min(),a=le.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=a,this.expectedCount=c}withSequenceNumber(e){return new it(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new it(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new it(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new it(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ip{constructor(e){this.ct=e}}function NT(n,e){let t;if(e.document)t=Xf(n.ct,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const r=w.fromSegments(e.noDocument.path),i=In(e.noDocument.readTime);t=Q.newNoDocument(r,i),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return R();{const r=w.fromSegments(e.unknownDocument.path),i=In(e.unknownDocument.version);t=Q.newUnknownDocument(r,i)}}return e.readTime&&t.setReadTime((function(i){const s=new X(i[0],i[1]);return b.fromTimestamp(s)})(e.readTime)),t}function Al(n,e){const t=e.key,r={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:Ns(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())r.document=(function(s,o){return{name:pi(s,o.key),fields:o.data.value.mapValue.fields,updateTime:er(s,o.version.toTimestamp()),createTime:er(s,o.createTime.toTimestamp())}})(n.ct,e);else if(e.isNoDocument())r.noDocument={path:t.path.toArray(),readTime:yn(e.version)};else{if(!e.isUnknownDocument())return R();r.unknownDocument={path:t.path.toArray(),version:yn(e.version)}}return r}function Ns(n){const e=n.toTimestamp();return[e.seconds,e.nanoseconds]}function yn(n){const e=n.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function In(n){const e=new X(n.seconds,n.nanoseconds);return b.fromTimestamp(e)}function Zt(n,e){const t=(e.baseMutations||[]).map((s=>Ea(n.ct,s)));for(let s=0;s<e.mutations.length-1;++s){const o=e.mutations[s];if(s+1<e.mutations.length&&e.mutations[s+1].transform!==void 0){const a=e.mutations[s+1];o.updateTransforms=a.transform.fieldTransforms,e.mutations.splice(s+1,1),++s}}const r=e.mutations.map((s=>Ea(n.ct,s))),i=X.fromMillis(e.localWriteTimeMs);return new Ic(e.batchId,i,t,r)}function Br(n){const e=In(n.readTime),t=n.lastLimboFreeSnapshotVersion!==void 0?In(n.lastLimboFreeSnapshotVersion):b.min();let r;return r=(function(s){return s.documents!==void 0})(n.query)?(function(s){return S(s.documents.length===1),De(fr(Yf(s.documents[0])))})(n.query):(function(s){return De(ep(s))})(n.query),new it(r,n.targetId,"TargetPurposeListen",n.lastListenSequenceNumber,e,t,le.fromBase64String(n.resumeToken))}function sp(n,e){const t=yn(e.snapshotVersion),r=yn(e.lastLimboFreeSnapshotVersion);let i;i=Cs(e.target)?Zf(n.ct,e.target):Ac(n.ct,e.target).ut;const s=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:mn(e.target),readTime:t,resumeToken:s,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:r,query:i}}function Rc(n){const e=ep({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Vs(e,e.limit,"L"):e}function qo(n,e){return new Tc(e.largestBatchId,Ea(n.ct,e.overlayMutation))}function Rl(n,e){const t=e.path.lastSegment();return[n,Se(e.path.popLast()),t]}function Pl(n,e,t,r){return{indexId:n,uid:e,sequenceNumber:t,readTime:yn(r.readTime),documentKey:Se(r.documentKey.path),largestBatchId:r.largestBatchId}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xT{getBundleMetadata(e,t){return Sl(e).get(t).next((r=>{if(r)return(function(s){return{id:s.bundleId,createTime:In(s.createTime),version:s.version}})(r)}))}saveBundleMetadata(e,t){return Sl(e).put((function(i){return{bundleId:i.id,createTime:yn(ae(i.createTime)),version:i.version}})(t))}getNamedQuery(e,t){return bl(e).get(t).next((r=>{if(r)return(function(s){return{name:s.name,query:Rc(s.bundledQuery),readTime:In(s.readTime)}})(r)}))}saveNamedQuery(e,t){return bl(e).put((function(i){return{name:i.name,readTime:yn(ae(i.readTime)),bundledQuery:i.bundledQuery}})(t))}}function Sl(n){return _e(n,"bundles")}function bl(n){return _e(n,"namedQueries")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class go{constructor(e,t){this.serializer=e,this.userId=t}static lt(e,t){const r=t.uid||"";return new go(e,r)}getOverlay(e,t){return br(e).get(Rl(this.userId,t)).next((r=>r?qo(this.serializer,r):null))}getOverlays(e,t){const r=Ye();return p.forEach(t,(i=>this.getOverlay(e,i).next((s=>{s!==null&&r.set(i,s)})))).next((()=>r))}saveOverlays(e,t,r){const i=[];return r.forEach(((s,o)=>{const a=new Tc(t,o);i.push(this.ht(e,a))})),p.waitFor(i)}removeOverlaysForBatchId(e,t,r){const i=new Set;t.forEach((o=>i.add(Se(o.getCollectionPath()))));const s=[];return i.forEach((o=>{const a=IDBKeyRange.bound([this.userId,o,r],[this.userId,o,r+1],!1,!0);s.push(br(e).H("collectionPathOverlayIndex",a))})),p.waitFor(s)}getOverlaysForCollection(e,t,r){const i=Ye(),s=Se(t),o=IDBKeyRange.bound([this.userId,s,r],[this.userId,s,Number.POSITIVE_INFINITY],!0);return br(e).W("collectionPathOverlayIndex",o).next((a=>{for(const c of a){const u=qo(this.serializer,c);i.set(u.getKey(),u)}return i}))}getOverlaysForCollectionGroup(e,t,r,i){const s=Ye();let o;const a=IDBKeyRange.bound([this.userId,t,r],[this.userId,t,Number.POSITIVE_INFINITY],!0);return br(e).Y({index:"collectionGroupOverlayIndex",range:a},((c,u,l)=>{const h=qo(this.serializer,u);s.size()<i||h.largestBatchId===o?(s.set(h.getKey(),h),o=h.largestBatchId):l.done()})).next((()=>s))}ht(e,t){return br(e).put((function(i,s,o){const[a,c,u]=Rl(s,o.mutation.key);return{userId:s,collectionPath:c,documentId:u,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:mi(i.ct,o.mutation)}})(this.serializer,this.userId,t))}}function br(n){return _e(n,"documentOverlays")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class en{constructor(){}Pt(e,t){this.It(e,t),t.Tt()}It(e,t){if("nullValue"in e)this.Et(t,5);else if("booleanValue"in e)this.Et(t,10),t.dt(e.booleanValue?1:0);else if("integerValue"in e)this.Et(t,15),t.dt(ee(e.integerValue));else if("doubleValue"in e){const r=ee(e.doubleValue);isNaN(r)?this.Et(t,13):(this.Et(t,15),ui(r)?t.dt(0):t.dt(r))}else if("timestampValue"in e){const r=e.timestampValue;this.Et(t,20),typeof r=="string"?t.At(r):(t.At(`${r.seconds||""}`),t.dt(r.nanos||0))}else if("stringValue"in e)this.Rt(e.stringValue,t),this.Vt(t);else if("bytesValue"in e)this.Et(t,30),t.ft(ct(e.bytesValue)),this.Vt(t);else if("referenceValue"in e)this.gt(e.referenceValue,t);else if("geoPointValue"in e){const r=e.geoPointValue;this.Et(t,45),t.dt(r.latitude||0),t.dt(r.longitude||0)}else"mapValue"in e?gf(e)?this.Et(t,Number.MAX_SAFE_INTEGER):(this.yt(e.mapValue,t),this.Vt(t)):"arrayValue"in e?(this.wt(e.arrayValue,t),this.Vt(t)):R()}Rt(e,t){this.Et(t,25),this.St(e,t)}St(e,t){t.At(e)}yt(e,t){const r=e.fields||{};this.Et(t,55);for(const i of Object.keys(r))this.Rt(i,t),this.It(r[i],t)}wt(e,t){const r=e.values||[];this.Et(t,50);for(const i of r)this.It(i,t)}gt(e,t){this.Et(t,37),w.fromName(e).path.forEach((r=>{this.Et(t,60),this.St(r,t)}))}Et(e,t){e.dt(t)}Vt(e){e.dt(2)}}en.bt=new en;function OT(n){if(n===0)return 8;let e=0;return n>>4==0&&(e+=4,n<<=4),n>>6==0&&(e+=2,n<<=2),n>>7==0&&(e+=1),e}function Cl(n){const e=64-(function(r){let i=0;for(let s=0;s<8;++s){const o=OT(255&r[s]);if(i+=o,o!==8)break}return i})(n);return Math.ceil(e/8)}class LT{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Dt(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.Ct(r.value),r=t.next();this.vt()}Ft(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.Mt(r.value),r=t.next();this.xt()}Ot(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.Ct(r);else if(r<2048)this.Ct(960|r>>>6),this.Ct(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Ct(480|r>>>12),this.Ct(128|63&r>>>6),this.Ct(128|63&r);else{const i=t.codePointAt(0);this.Ct(240|i>>>18),this.Ct(128|63&i>>>12),this.Ct(128|63&i>>>6),this.Ct(128|63&i)}}this.vt()}Nt(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.Mt(r);else if(r<2048)this.Mt(960|r>>>6),this.Mt(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Mt(480|r>>>12),this.Mt(128|63&r>>>6),this.Mt(128|63&r);else{const i=t.codePointAt(0);this.Mt(240|i>>>18),this.Mt(128|63&i>>>12),this.Mt(128|63&i>>>6),this.Mt(128|63&i)}}this.xt()}Bt(e){const t=this.Lt(e),r=Cl(t);this.kt(1+r),this.buffer[this.position++]=255&r;for(let i=t.length-r;i<t.length;++i)this.buffer[this.position++]=255&t[i]}qt(e){const t=this.Lt(e),r=Cl(t);this.kt(1+r),this.buffer[this.position++]=~(255&r);for(let i=t.length-r;i<t.length;++i)this.buffer[this.position++]=~(255&t[i])}Qt(){this.Kt(255),this.Kt(255)}$t(){this.Ut(255),this.Ut(255)}reset(){this.position=0}seed(e){this.kt(e.length),this.buffer.set(e,this.position),this.position+=e.length}Wt(){return this.buffer.slice(0,this.position)}Lt(e){const t=(function(s){const o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,s,!1),new Uint8Array(o.buffer)})(e),r=(128&t[0])!=0;t[0]^=r?255:128;for(let i=1;i<t.length;++i)t[i]^=r?255:0;return t}Ct(e){const t=255&e;t===0?(this.Kt(0),this.Kt(255)):t===255?(this.Kt(255),this.Kt(0)):this.Kt(t)}Mt(e){const t=255&e;t===0?(this.Ut(0),this.Ut(255)):t===255?(this.Ut(255),this.Ut(0)):this.Ut(e)}vt(){this.Kt(0),this.Kt(1)}xt(){this.Ut(0),this.Ut(1)}Kt(e){this.kt(1),this.buffer[this.position++]=e}Ut(e){this.kt(1),this.buffer[this.position++]=~e}kt(e){const t=e+this.position;if(t<=this.buffer.length)return;let r=2*this.buffer.length;r<t&&(r=t);const i=new Uint8Array(r);i.set(this.buffer),this.buffer=i}}class MT{constructor(e){this.Gt=e}ft(e){this.Gt.Dt(e)}At(e){this.Gt.Ot(e)}dt(e){this.Gt.Bt(e)}Tt(){this.Gt.Qt()}}class FT{constructor(e){this.Gt=e}ft(e){this.Gt.Ft(e)}At(e){this.Gt.Nt(e)}dt(e){this.Gt.qt(e)}Tt(){this.Gt.$t()}}class Cr{constructor(){this.Gt=new LT,this.zt=new MT(this.Gt),this.jt=new FT(this.Gt)}seed(e){this.Gt.seed(e)}Ht(e){return e===0?this.zt:this.jt}Wt(){return this.Gt.Wt()}reset(){this.Gt.reset()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tn{constructor(e,t,r,i){this.indexId=e,this.documentKey=t,this.arrayValue=r,this.directionalValue=i}Jt(){const e=this.directionalValue.length,t=e===0||this.directionalValue[e-1]===255?e+1:e,r=new Uint8Array(t);return r.set(this.directionalValue,0),t!==e?r.set([0],this.directionalValue.length):++r[r.length-1],new tn(this.indexId,this.documentKey,this.arrayValue,r)}}function mt(n,e){let t=n.indexId-e.indexId;return t!==0?t:(t=Dl(n.arrayValue,e.arrayValue),t!==0?t:(t=Dl(n.directionalValue,e.directionalValue),t!==0?t:w.comparator(n.documentKey,e.documentKey)))}function Dl(n,e){for(let t=0;t<n.length&&t<e.length;++t){const r=n[t]-e[t];if(r!==0)return r}return n.length-e.length}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vl{constructor(e){this.Yt=new z(((t,r)=>Y.comparator(t.field,r.field))),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.Zt=e.orderBy,this.Xt=[];for(const t of e.filters){const r=t;r.isInequality()?this.Yt=this.Yt.add(r):this.Xt.push(r)}}get en(){return this.Yt.size>1}tn(e){if(S(e.collectionGroup===this.collectionId),this.en)return!1;const t=ua(e);if(t!==void 0&&!this.nn(t))return!1;const r=Jt(e);let i=new Set,s=0,o=0;for(;s<r.length&&this.nn(r[s]);++s)i=i.add(r[s].fieldPath.canonicalString());if(s===r.length)return!0;if(this.Yt.size>0){const a=this.Yt.getIterator().getNext();if(!i.has(a.field.canonicalString())){const c=r[s];if(!this.rn(a,c)||!this.sn(this.Zt[o++],c))return!1}++s}for(;s<r.length;++s){const a=r[s];if(o>=this.Zt.length||!this.sn(this.Zt[o++],a))return!1}return!0}on(){if(this.en)return null;let e=new z(Y.comparator);const t=[];for(const r of this.Xt)if(!r.field.isKeyField())if(r.op==="array-contains"||r.op==="array-contains-any")t.push(new cn(r.field,2));else{if(e.has(r.field))continue;e=e.add(r.field),t.push(new cn(r.field,0))}for(const r of this.Zt)r.field.isKeyField()||e.has(r.field)||(e=e.add(r.field),t.push(new cn(r.field,r.dir==="asc"?0:1)));return new Wn(Wn.UNKNOWN_ID,this.collectionId,t,Qn.empty())}nn(e){for(const t of this.Xt)if(this.rn(t,e))return!0;return!1}rn(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const r=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===r}sn(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function op(n){var e,t;if(S(n instanceof B||n instanceof G),n instanceof B){if(n instanceof Af){const i=((t=(e=n.value.arrayValue)===null||e===void 0?void 0:e.values)===null||t===void 0?void 0:t.map((s=>B.create(n.field,"==",s))))||[];return G.create(i,"or")}return n}const r=n.filters.map((i=>op(i)));return G.create(r,n.op)}function UT(n){if(n.getFilters().length===0)return[];const e=va(op(n));return S(ap(e)),Ta(e)||wa(e)?[e]:e.getFilters()}function Ta(n){return n instanceof B}function wa(n){return n instanceof G&&mc(n)}function ap(n){return Ta(n)||wa(n)||(function(t){if(t instanceof G&&fa(t)){for(const r of t.getFilters())if(!Ta(r)&&!wa(r))return!1;return!0}return!1})(n)}function va(n){if(S(n instanceof B||n instanceof G),n instanceof B)return n;if(n.filters.length===1)return va(n.filters[0]);const e=n.filters.map((r=>va(r)));let t=G.create(e,n.op);return t=xs(t),ap(t)?t:(S(t instanceof G),S(Jn(t)),S(t.filters.length>1),t.filters.reduce(((r,i)=>Pc(r,i))))}function Pc(n,e){let t;return S(n instanceof B||n instanceof G),S(e instanceof B||e instanceof G),t=n instanceof B?e instanceof B?(function(i,s){return G.create([i,s],"and")})(n,e):kl(n,e):e instanceof B?kl(e,n):(function(i,s){if(S(i.filters.length>0&&s.filters.length>0),Jn(i)&&Jn(s))return Tf(i,s.getFilters());const o=fa(i)?i:s,a=fa(i)?s:i,c=o.filters.map((u=>Pc(u,a)));return G.create(c,"or")})(n,e),xs(t)}function kl(n,e){if(Jn(e))return Tf(e,n.getFilters());{const t=e.filters.map((r=>Pc(n,r)));return G.create(t,"or")}}function xs(n){if(S(n instanceof B||n instanceof G),n instanceof B)return n;const e=n.getFilters();if(e.length===1)return xs(e[0]);if(If(n))return n;const t=e.map((i=>xs(i))),r=[];return t.forEach((i=>{i instanceof B?r.push(i):i instanceof G&&(i.op===n.op?r.push(...i.filters):r.push(i))})),r.length===1?r[0]:G.create(r,n.op)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BT{constructor(){this._n=new Sc}addToCollectionParentIndex(e,t){return this._n.add(t),p.resolve()}getCollectionParents(e,t){return p.resolve(this._n.getEntries(t))}addFieldIndex(e,t){return p.resolve()}deleteFieldIndex(e,t){return p.resolve()}deleteAllFieldIndexes(e){return p.resolve()}createTargetIndexes(e,t){return p.resolve()}getDocumentsMatchingTarget(e,t){return p.resolve(null)}getIndexType(e,t){return p.resolve(0)}getFieldIndexes(e,t){return p.resolve([])}getNextCollectionGroupToUpdate(e){return p.resolve(null)}getMinOffset(e,t){return p.resolve(Me.min())}getMinOffsetFromCollectionGroup(e,t){return p.resolve(Me.min())}updateCollectionGroup(e,t,r){return p.resolve()}updateIndexEntries(e,t){return p.resolve()}}class Sc{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t]||new z(U.comparator),s=!i.has(r);return this.index[t]=i.add(r),s}has(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t];return i&&i.has(r)}getEntries(e){return(this.index[e]||new z(U.comparator)).toArray()}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xi=new Uint8Array(0);class qT{constructor(e,t){this.databaseId=t,this.an=new Sc,this.un=new ht((r=>mn(r)),((r,i)=>Vi(r,i))),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.an.has(t)){const r=t.lastSegment(),i=t.popLast();e.addOnCommittedListener((()=>{this.an.add(t)}));const s={collectionId:r,parent:Se(i)};return Nl(e).put(s)}return p.resolve()}getCollectionParents(e,t){const r=[],i=IDBKeyRange.bound([t,""],[rf(t),""],!1,!0);return Nl(e).W(i).next((s=>{for(const o of s){if(o.collectionId!==t)break;r.push(Qe(o.parent))}return r}))}addFieldIndex(e,t){const r=Dr(e),i=(function(a){return{indexId:a.indexId,collectionGroup:a.collectionGroup,fields:a.fields.map((c=>[c.fieldPath.canonicalString(),c.kind]))}})(t);delete i.indexId;const s=r.add(i);if(t.indexState){const o=kn(e);return s.next((a=>{o.put(Pl(a,this.uid,t.indexState.sequenceNumber,t.indexState.offset))}))}return s.next()}deleteFieldIndex(e,t){const r=Dr(e),i=kn(e),s=Vn(e);return r.delete(t.indexId).next((()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))).next((()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))))}deleteAllFieldIndexes(e){const t=Dr(e),r=Vn(e),i=kn(e);return t.H().next((()=>r.H())).next((()=>i.H()))}createTargetIndexes(e,t){return p.forEach(this.cn(t),(r=>this.getIndexType(e,r).next((i=>{if(i===0||i===1){const s=new Vl(r).on();if(s!=null)return this.addFieldIndex(e,s)}}))))}getDocumentsMatchingTarget(e,t){const r=Vn(e);let i=!0;const s=new Map;return p.forEach(this.cn(t),(o=>this.ln(e,o).next((a=>{i&&(i=!!a),s.set(o,a)})))).next((()=>{if(i){let o=x();const a=[];return p.forEach(s,((c,u)=>{_("IndexedDbIndexManager",`Using index ${(function(A){return`id=${A.indexId}|cg=${A.collectionGroup}|f=${A.fields.map((D=>`${D.fieldPath}:${D.kind}`)).join(",")}`})(c)} to execute ${mn(t)}`);const l=(function(A,D){const $=ua(D);if($===void 0)return null;for(const O of Ds(A,$.fieldPath))switch(O.op){case"array-contains-any":return O.value.arrayValue.values||[];case"array-contains":return[O.value]}return null})(u,c),h=(function(A,D){const $=new Map;for(const O of Jt(D))for(const Z of Ds(A,O.fieldPath))switch(Z.op){case"==":case"in":$.set(O.fieldPath.canonicalString(),Z.value);break;case"not-in":case"!=":return $.set(O.fieldPath.canonicalString(),Z.value),Array.from($.values())}return null})(u,c),d=(function(A,D){const $=[];let O=!0;for(const Z of Jt(D)){const we=Z.kind===0?hl(A,Z.fieldPath,A.startAt):dl(A,Z.fieldPath,A.startAt);$.push(we.value),O&&(O=we.inclusive)}return new Lt($,O)})(u,c),f=(function(A,D){const $=[];let O=!0;for(const Z of Jt(D)){const we=Z.kind===0?dl(A,Z.fieldPath,A.endAt):hl(A,Z.fieldPath,A.endAt);$.push(we.value),O&&(O=we.inclusive)}return new Lt($,O)})(u,c),I=this.hn(c,u,d),E=this.hn(c,u,f),y=this.Pn(c,u,h),P=this.In(c.indexId,l,I,d.inclusive,E,f.inclusive,y);return p.forEach(P,(C=>r.j(C,t.limit).next((A=>{A.forEach((D=>{const $=w.fromSegments(D.documentKey);o.has($)||(o=o.add($),a.push($))}))}))))})).next((()=>a))}return p.resolve(null)}))}cn(e){let t=this.un.get(e);return t||(e.filters.length===0?t=[e]:t=UT(G.create(e.filters,"and")).map((r=>ma(e.path,e.collectionGroup,e.orderBy,r.getFilters(),e.limit,e.startAt,e.endAt))),this.un.set(e,t),t)}In(e,t,r,i,s,o,a){const c=(t!=null?t.length:1)*Math.max(r.length,s.length),u=c/(t!=null?t.length:1),l=[];for(let h=0;h<c;++h){const d=t?this.Tn(t[h/u]):Xi,f=this.En(e,d,r[h%u],i),I=this.dn(e,d,s[h%u],o),E=a.map((y=>this.En(e,d,y,!0)));l.push(...this.createRange(f,I,E))}return l}En(e,t,r,i){const s=new tn(e,w.empty(),t,r);return i?s:s.Jt()}dn(e,t,r,i){const s=new tn(e,w.empty(),t,r);return i?s.Jt():s}ln(e,t){const r=new Vl(t),i=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,i).next((s=>{let o=null;for(const a of s)r.tn(a)&&(!o||a.fields.length>o.fields.length)&&(o=a);return o}))}getIndexType(e,t){let r=2;const i=this.cn(t);return p.forEach(i,(s=>this.ln(e,s).next((o=>{o?r!==0&&o.fields.length<(function(c){let u=new z(Y.comparator),l=!1;for(const h of c.filters)for(const d of h.getFlattenedFilters())d.field.isKeyField()||(d.op==="array-contains"||d.op==="array-contains-any"?l=!0:u=u.add(d.field));for(const h of c.orderBy)h.field.isKeyField()||(u=u.add(h.field));return u.size+(l?1:0)})(s)&&(r=1):r=0})))).next((()=>(function(o){return o.limit!==null})(t)&&i.length>1&&r===2?1:r))}An(e,t){const r=new Cr;for(const i of Jt(e)){const s=t.data.field(i.fieldPath);if(s==null)return null;const o=r.Ht(i.kind);en.bt.Pt(s,o)}return r.Wt()}Tn(e){const t=new Cr;return en.bt.Pt(e,t.Ht(0)),t.Wt()}Rn(e,t){const r=new Cr;return en.bt.Pt(pn(this.databaseId,t),r.Ht((function(s){const o=Jt(s);return o.length===0?0:o[o.length-1].kind})(e))),r.Wt()}Pn(e,t,r){if(r===null)return[];let i=[];i.push(new Cr);let s=0;for(const o of Jt(e)){const a=r[s++];for(const c of i)if(this.Vn(t,o.fieldPath)&&di(a))i=this.mn(i,o,a);else{const u=c.Ht(o.kind);en.bt.Pt(a,u)}}return this.fn(i)}hn(e,t,r){return this.Pn(e,t,r.position)}fn(e){const t=[];for(let r=0;r<e.length;++r)t[r]=e[r].Wt();return t}mn(e,t,r){const i=[...e],s=[];for(const o of r.arrayValue.values||[])for(const a of i){const c=new Cr;c.seed(a.Wt()),en.bt.Pt(o,c.Ht(t.kind)),s.push(c)}return s}Vn(e,t){return!!e.filters.find((r=>r instanceof B&&r.field.isEqual(t)&&(r.op==="in"||r.op==="not-in")))}getFieldIndexes(e,t){const r=Dr(e),i=kn(e);return(t?r.W("collectionGroupIndex",IDBKeyRange.bound(t,t)):r.W()).next((s=>{const o=[];return p.forEach(s,(a=>i.get([a.indexId,this.uid]).next((c=>{o.push((function(l,h){const d=h?new Qn(h.sequenceNumber,new Me(In(h.readTime),new w(Qe(h.documentKey)),h.largestBatchId)):Qn.empty(),f=l.fields.map((([I,E])=>new cn(Y.fromServerFormat(I),E)));return new Wn(l.indexId,l.collectionGroup,f,d)})(a,c))})))).next((()=>o))}))}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next((t=>t.length===0?null:(t.sort(((r,i)=>{const s=r.indexState.sequenceNumber-i.indexState.sequenceNumber;return s!==0?s:k(r.collectionGroup,i.collectionGroup)})),t[0].collectionGroup)))}updateCollectionGroup(e,t,r){const i=Dr(e),s=kn(e);return this.gn(e).next((o=>i.W("collectionGroupIndex",IDBKeyRange.bound(t,t)).next((a=>p.forEach(a,(c=>s.put(Pl(c.indexId,this.uid,o,r))))))))}updateIndexEntries(e,t){const r=new Map;return p.forEach(t,((i,s)=>{const o=r.get(i.collectionGroup);return(o?p.resolve(o):this.getFieldIndexes(e,i.collectionGroup)).next((a=>(r.set(i.collectionGroup,a),p.forEach(a,(c=>this.pn(e,i,c).next((u=>{const l=this.yn(s,c);return u.isEqual(l)?p.resolve():this.wn(e,s,c,u,l)})))))))}))}Sn(e,t,r,i){return Vn(e).put({indexId:i.indexId,uid:this.uid,arrayValue:i.arrayValue,directionalValue:i.directionalValue,orderedDocumentKey:this.Rn(r,t.key),documentKey:t.key.path.toArray()})}bn(e,t,r,i){return Vn(e).delete([i.indexId,this.uid,i.arrayValue,i.directionalValue,this.Rn(r,t.key),t.key.path.toArray()])}pn(e,t,r){const i=Vn(e);let s=new z(mt);return i.Y({index:"documentKeyIndex",range:IDBKeyRange.only([r.indexId,this.uid,this.Rn(r,t)])},((o,a)=>{s=s.add(new tn(r.indexId,t,a.arrayValue,a.directionalValue))})).next((()=>s))}yn(e,t){let r=new z(mt);const i=this.An(t,e);if(i==null)return r;const s=ua(t);if(s!=null){const o=e.data.field(s.fieldPath);if(di(o))for(const a of o.arrayValue.values||[])r=r.add(new tn(t.indexId,e.key,this.Tn(a),i))}else r=r.add(new tn(t.indexId,e.key,Xi,i));return r}wn(e,t,r,i,s){_("IndexedDbIndexManager","Updating index entries for document '%s'",t.key);const o=[];return(function(c,u,l,h,d){const f=c.getIterator(),I=u.getIterator();let E=Dn(f),y=Dn(I);for(;E||y;){let P=!1,C=!1;if(E&&y){const A=l(E,y);A<0?C=!0:A>0&&(P=!0)}else E!=null?C=!0:P=!0;P?(h(y),y=Dn(I)):C?(d(E),E=Dn(f)):(E=Dn(f),y=Dn(I))}})(i,s,mt,(a=>{o.push(this.Sn(e,t,r,a))}),(a=>{o.push(this.bn(e,t,r,a))})),p.waitFor(o)}gn(e){let t=1;return kn(e).Y({index:"sequenceNumberIndex",reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},((r,i,s)=>{s.done(),t=i.sequenceNumber+1})).next((()=>t))}createRange(e,t,r){r=r.sort(((o,a)=>mt(o,a))).filter(((o,a,c)=>!a||mt(o,c[a-1])!==0));const i=[];i.push(e);for(const o of r){const a=mt(o,e),c=mt(o,t);if(a===0)i[0]=e.Jt();else if(a>0&&c<0)i.push(o),i.push(o.Jt());else if(c>0)break}i.push(t);const s=[];for(let o=0;o<i.length;o+=2){if(this.Dn(i[o],i[o+1]))return[];const a=[i[o].indexId,this.uid,i[o].arrayValue,i[o].directionalValue,Xi,[]],c=[i[o+1].indexId,this.uid,i[o+1].arrayValue,i[o+1].directionalValue,Xi,[]];s.push(IDBKeyRange.bound(a,c))}return s}Dn(e,t){return mt(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(xl)}getMinOffset(e,t){return p.mapArray(this.cn(t),(r=>this.ln(e,r).next((i=>i||R())))).next(xl)}}function Nl(n){return _e(n,"collectionParents")}function Vn(n){return _e(n,"indexEntries")}function Dr(n){return _e(n,"indexConfiguration")}function kn(n){return _e(n,"indexState")}function xl(n){S(n.length!==0);let e=n[0].indexState.offset,t=e.largestBatchId;for(let r=1;r<n.length;r++){const i=n[r].indexState.offset;fc(i,e)<0&&(e=i),t<i.largestBatchId&&(t=i.largestBatchId)}return new Me(e.readTime,e.documentKey,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ol={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0};class Ae{constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}static withCacheSize(e){return new Ae(e,Ae.DEFAULT_COLLECTION_PERCENTILE,Ae.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cp(n,e,t){const r=n.store("mutations"),i=n.store("documentMutations"),s=[],o=IDBKeyRange.only(t.batchId);let a=0;const c=r.Y({range:o},((l,h,d)=>(a++,d.delete())));s.push(c.next((()=>{S(a===1)})));const u=[];for(const l of t.mutations){const h=lf(e,l.key.path,t.batchId);s.push(i.delete(h)),u.push(l.key)}return p.waitFor(s).next((()=>u))}function Os(n){if(!n)return 0;let e;if(n.document)e=n.document;else if(n.unknownDocument)e=n.unknownDocument;else{if(!n.noDocument)throw R();e=n.noDocument}return JSON.stringify(e).length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Ae.DEFAULT_COLLECTION_PERCENTILE=10,Ae.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Ae.DEFAULT=new Ae(41943040,Ae.DEFAULT_COLLECTION_PERCENTILE,Ae.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Ae.DISABLED=new Ae(-1,0,0);class _o{constructor(e,t,r,i){this.userId=e,this.serializer=t,this.indexManager=r,this.referenceDelegate=i,this.Cn={}}static lt(e,t,r,i){S(e.uid!=="");const s=e.isAuthenticated()?e.uid:"";return new _o(s,t,r,i)}checkEmpty(e){let t=!0;const r=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return gt(e).Y({index:"userMutationsIndex",range:r},((i,s,o)=>{t=!1,o.done()})).next((()=>t))}addMutationBatch(e,t,r,i){const s=Mn(e),o=gt(e);return o.add({}).next((a=>{S(typeof a=="number");const c=new Ic(a,t,r,i),u=(function(f,I,E){const y=E.baseMutations.map((C=>mi(f.ct,C))),P=E.mutations.map((C=>mi(f.ct,C)));return{userId:I,batchId:E.batchId,localWriteTimeMs:E.localWriteTime.toMillis(),baseMutations:y,mutations:P}})(this.serializer,this.userId,c),l=[];let h=new z(((d,f)=>k(d.canonicalString(),f.canonicalString())));for(const d of i){const f=lf(this.userId,d.key.path,a);h=h.add(d.key.path.popLast()),l.push(o.put(u)),l.push(s.put(f,CE))}return h.forEach((d=>{l.push(this.indexManager.addToCollectionParentIndex(e,d))})),e.addOnCommittedListener((()=>{this.Cn[a]=c.keys()})),p.waitFor(l).next((()=>c))}))}lookupMutationBatch(e,t){return gt(e).get(t).next((r=>r?(S(r.userId===this.userId),Zt(this.serializer,r)):null))}vn(e,t){return this.Cn[t]?p.resolve(this.Cn[t]):this.lookupMutationBatch(e,t).next((r=>{if(r){const i=r.keys();return this.Cn[t]=i,i}return null}))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=IDBKeyRange.lowerBound([this.userId,r]);let s=null;return gt(e).Y({index:"userMutationsIndex",range:i},((o,a,c)=>{a.userId===this.userId&&(S(a.batchId>=r),s=Zt(this.serializer,a)),c.done()})).next((()=>s))}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let r=-1;return gt(e).Y({index:"userMutationsIndex",range:t,reverse:!0},((i,s,o)=>{r=s.batchId,o.done()})).next((()=>r))}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,-1],[this.userId,Number.POSITIVE_INFINITY]);return gt(e).W("userMutationsIndex",t).next((r=>r.map((i=>Zt(this.serializer,i)))))}getAllMutationBatchesAffectingDocumentKey(e,t){const r=us(this.userId,t.path),i=IDBKeyRange.lowerBound(r),s=[];return Mn(e).Y({range:i},((o,a,c)=>{const[u,l,h]=o,d=Qe(l);if(u===this.userId&&t.path.isEqual(d))return gt(e).get(h).next((f=>{if(!f)throw R();S(f.userId===this.userId),s.push(Zt(this.serializer,f))}));c.done()})).next((()=>s))}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new z(k);const i=[];return t.forEach((s=>{const o=us(this.userId,s.path),a=IDBKeyRange.lowerBound(o),c=Mn(e).Y({range:a},((u,l,h)=>{const[d,f,I]=u,E=Qe(f);d===this.userId&&s.path.isEqual(E)?r=r.add(I):h.done()}));i.push(c)})),p.waitFor(i).next((()=>this.Fn(e,r)))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1,s=us(this.userId,r),o=IDBKeyRange.lowerBound(s);let a=new z(k);return Mn(e).Y({range:o},((c,u,l)=>{const[h,d,f]=c,I=Qe(d);h===this.userId&&r.isPrefixOf(I)?I.length===i&&(a=a.add(f)):l.done()})).next((()=>this.Fn(e,a)))}Fn(e,t){const r=[],i=[];return t.forEach((s=>{i.push(gt(e).get(s).next((o=>{if(o===null)throw R();S(o.userId===this.userId),r.push(Zt(this.serializer,o))})))})),p.waitFor(i).next((()=>r))}removeMutationBatch(e,t){return cp(e.ae,this.userId,t).next((r=>(e.addOnCommittedListener((()=>{this.Mn(t.batchId)})),p.forEach(r,(i=>this.referenceDelegate.markPotentiallyOrphaned(e,i))))))}Mn(e){delete this.Cn[e]}performConsistencyCheck(e){return this.checkEmpty(e).next((t=>{if(!t)return p.resolve();const r=IDBKeyRange.lowerBound((function(o){return[o]})(this.userId)),i=[];return Mn(e).Y({range:r},((s,o,a)=>{if(s[0]===this.userId){const c=Qe(s[1]);i.push(c)}else a.done()})).next((()=>{S(i.length===0)}))}))}containsKey(e,t){return up(e,this.userId,t)}xn(e){return lp(e).get(this.userId).next((t=>t||{userId:this.userId,lastAcknowledgedBatchId:-1,lastStreamToken:""}))}}function up(n,e,t){const r=us(e,t.path),i=r[1],s=IDBKeyRange.lowerBound(r);let o=!1;return Mn(n).Y({range:s,J:!0},((a,c,u)=>{const[l,h,d]=a;l===e&&h===i&&(o=!0),u.done()})).next((()=>o))}function gt(n){return _e(n,"mutations")}function Mn(n){return _e(n,"documentMutations")}function lp(n){return _e(n,"mutationQueues")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class En{constructor(e){this.On=e}next(){return this.On+=2,this.On}static Nn(){return new En(0)}static Bn(){return new En(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $T{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.Ln(e).next((t=>{const r=new En(t.highestTargetId);return t.highestTargetId=r.next(),this.kn(e,t).next((()=>t.highestTargetId))}))}getLastRemoteSnapshotVersion(e){return this.Ln(e).next((t=>b.fromTimestamp(new X(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds))))}getHighestSequenceNumber(e){return this.Ln(e).next((t=>t.highestListenSequenceNumber))}setTargetsMetadata(e,t,r){return this.Ln(e).next((i=>(i.highestListenSequenceNumber=t,r&&(i.lastRemoteSnapshotVersion=r.toTimestamp()),t>i.highestListenSequenceNumber&&(i.highestListenSequenceNumber=t),this.kn(e,i))))}addTargetData(e,t){return this.qn(e,t).next((()=>this.Ln(e).next((r=>(r.targetCount+=1,this.Qn(t,r),this.kn(e,r))))))}updateTargetData(e,t){return this.qn(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next((()=>Nn(e).delete(t.targetId))).next((()=>this.Ln(e))).next((r=>(S(r.targetCount>0),r.targetCount-=1,this.kn(e,r))))}removeTargets(e,t,r){let i=0;const s=[];return Nn(e).Y(((o,a)=>{const c=Br(a);c.sequenceNumber<=t&&r.get(c.targetId)===null&&(i++,s.push(this.removeTargetData(e,c)))})).next((()=>p.waitFor(s))).next((()=>i))}forEachTarget(e,t){return Nn(e).Y(((r,i)=>{const s=Br(i);t(s)}))}Ln(e){return Ll(e).get("targetGlobalKey").next((t=>(S(t!==null),t)))}kn(e,t){return Ll(e).put("targetGlobalKey",t)}qn(e,t){return Nn(e).put(sp(this.serializer,t))}Qn(e,t){let r=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,r=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,r=!0),r}getTargetCount(e){return this.Ln(e).next((t=>t.targetCount))}getTargetData(e,t){const r=mn(t),i=IDBKeyRange.bound([r,Number.NEGATIVE_INFINITY],[r,Number.POSITIVE_INFINITY]);let s=null;return Nn(e).Y({range:i,index:"queryTargetsIndex"},((o,a,c)=>{const u=Br(a);Vi(t,u.target)&&(s=u,c.done())})).next((()=>s))}addMatchingKeys(e,t,r){const i=[],s=wt(e);return t.forEach((o=>{const a=Se(o.path);i.push(s.put({targetId:r,path:a})),i.push(this.referenceDelegate.addReference(e,r,o))})),p.waitFor(i)}removeMatchingKeys(e,t,r){const i=wt(e);return p.forEach(t,(s=>{const o=Se(s.path);return p.waitFor([i.delete([r,o]),this.referenceDelegate.removeReference(e,r,s)])}))}removeMatchingKeysForTargetId(e,t){const r=wt(e),i=IDBKeyRange.bound([t],[t+1],!1,!0);return r.delete(i)}getMatchingKeysForTargetId(e,t){const r=IDBKeyRange.bound([t],[t+1],!1,!0),i=wt(e);let s=x();return i.Y({range:r,J:!0},((o,a,c)=>{const u=Qe(o[1]),l=new w(u);s=s.add(l)})).next((()=>s))}containsKey(e,t){const r=Se(t.path),i=IDBKeyRange.bound([r],[rf(r)],!1,!0);let s=0;return wt(e).Y({index:"documentTargetsIndex",J:!0,range:i},(([o,a],c,u)=>{o!==0&&(s++,u.done())})).next((()=>s>0))}_t(e,t){return Nn(e).get(t).next((r=>r?Br(r):null))}}function Nn(n){return _e(n,"targets")}function Ll(n){return _e(n,"targetGlobal")}function wt(n){return _e(n,"targetDocuments")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ml([n,e],[t,r]){const i=k(n,t);return i===0?k(e,r):i}class GT{constructor(e){this.Kn=e,this.buffer=new z(Ml),this.$n=0}Un(){return++this.$n}Wn(e){const t=[e,this.Un()];if(this.buffer.size<this.Kn)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();Ml(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class hp{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.Gn=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.zn(6e4)}stop(){this.Gn&&(this.Gn.cancel(),this.Gn=null)}get started(){return this.Gn!==null}zn(e){_("LruGarbageCollector",`Garbage collection scheduled in ${e}ms`),this.Gn=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.Gn=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Gt(t)?_("LruGarbageCollector","Ignoring IndexedDB error during garbage collection: ",t):await $t(t)}await this.zn(3e5)}))}}class jT{constructor(e,t){this.jn=e,this.params=t}calculateTargetCount(e,t){return this.jn.Hn(e).next((r=>Math.floor(t/100*r)))}nthSequenceNumber(e,t){if(t===0)return p.resolve(Ve._e);const r=new GT(t);return this.jn.forEachTarget(e,(i=>r.Wn(i.sequenceNumber))).next((()=>this.jn.Jn(e,(i=>r.Wn(i))))).next((()=>r.maxValue))}removeTargets(e,t,r){return this.jn.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.jn.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(_("LruGarbageCollector","Garbage collection skipped; disabled"),p.resolve(Ol)):this.getCacheSize(e).next((r=>r<this.params.cacheSizeCollectionThreshold?(_("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Ol):this.Yn(e,t)))}getCacheSize(e){return this.jn.getCacheSize(e)}Yn(e,t){let r,i,s,o,a,c,u;const l=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((h=>(h>this.params.maximumSequenceNumbersToCollect?(_("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${h}`),i=this.params.maximumSequenceNumbersToCollect):i=h,o=Date.now(),this.nthSequenceNumber(e,i)))).next((h=>(r=h,a=Date.now(),this.removeTargets(e,r,t)))).next((h=>(s=h,c=Date.now(),this.removeOrphanedDocuments(e,r)))).next((h=>(u=Date.now(),xn()<=F.DEBUG&&_("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-l}ms
	Determined least recently used ${i} in `+(a-o)+`ms
	Removed ${s} targets in `+(c-a)+`ms
	Removed ${h} documents in `+(u-c)+`ms
Total Duration: ${u-l}ms`),p.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:s,documentsRemoved:h}))))}}function dp(n,e){return new jT(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zT{constructor(e,t){this.db=e,this.garbageCollector=dp(this,t)}Hn(e){const t=this.Zn(e);return this.db.getTargetCache().getTargetCount(e).next((r=>t.next((i=>r+i))))}Zn(e){let t=0;return this.Jn(e,(r=>{t++})).next((()=>t))}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}Jn(e,t){return this.Xn(e,((r,i)=>t(i)))}addReference(e,t,r){return Zi(e,r)}removeReference(e,t,r){return Zi(e,r)}removeTargets(e,t,r){return this.db.getTargetCache().removeTargets(e,t,r)}markPotentiallyOrphaned(e,t){return Zi(e,t)}er(e,t){return(function(i,s){let o=!1;return lp(i).Z((a=>up(i,a,s).next((c=>(c&&(o=!0),p.resolve(!c)))))).next((()=>o))})(e,t)}removeOrphanedDocuments(e,t){const r=this.db.getRemoteDocumentCache().newChangeBuffer(),i=[];let s=0;return this.Xn(e,((o,a)=>{if(a<=t){const c=this.er(e,o).next((u=>{if(!u)return s++,r.getEntry(e,o).next((()=>(r.removeEntry(o,b.min()),wt(e).delete((function(h){return[0,Se(h.path)]})(o)))))}));i.push(c)}})).next((()=>p.waitFor(i))).next((()=>r.apply(e))).next((()=>s))}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,r)}updateLimboDocument(e,t){return Zi(e,t)}Xn(e,t){const r=wt(e);let i,s=Ve._e;return r.Y({index:"documentTargetsIndex"},(([o,a],{path:c,sequenceNumber:u})=>{o===0?(s!==Ve._e&&t(new w(Qe(i)),s),s=u,i=c):s=Ve._e})).next((()=>{s!==Ve._e&&t(new w(Qe(i)),s)}))}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function Zi(n,e){return wt(n).put((function(r,i){return{targetId:0,path:Se(r.path),sequenceNumber:i}})(e,n.currentSequenceNumber))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fp{constructor(){this.changes=new ht((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Q.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?p.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KT{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,r){return Qt(e).put(r)}removeEntry(e,t,r){return Qt(e).delete((function(s,o){const a=s.path.toArray();return[a.slice(0,a.length-2),a[a.length-2],Ns(o),a[a.length-1]]})(t,r))}updateMetadata(e,t){return this.getMetadata(e).next((r=>(r.byteSize+=t,this.tr(e,r))))}getEntry(e,t){let r=Q.newInvalidDocument(t);return Qt(e).Y({index:"documentKeyIndex",range:IDBKeyRange.only(Vr(t))},((i,s)=>{r=this.nr(t,s)})).next((()=>r))}rr(e,t){let r={size:0,document:Q.newInvalidDocument(t)};return Qt(e).Y({index:"documentKeyIndex",range:IDBKeyRange.only(Vr(t))},((i,s)=>{r={document:this.nr(t,s),size:Os(s)}})).next((()=>r))}getEntries(e,t){let r=Ne();return this.ir(e,t,((i,s)=>{const o=this.nr(i,s);r=r.insert(i,o)})).next((()=>r))}sr(e,t){let r=Ne(),i=new H(w.comparator);return this.ir(e,t,((s,o)=>{const a=this.nr(s,o);r=r.insert(s,a),i=i.insert(s,Os(o))})).next((()=>({documents:r,_r:i})))}ir(e,t,r){if(t.isEmpty())return p.resolve();let i=new z(Bl);t.forEach((c=>i=i.add(c)));const s=IDBKeyRange.bound(Vr(i.first()),Vr(i.last())),o=i.getIterator();let a=o.getNext();return Qt(e).Y({index:"documentKeyIndex",range:s},((c,u,l)=>{const h=w.fromSegments([...u.prefixPath,u.collectionGroup,u.documentId]);for(;a&&Bl(a,h)<0;)r(a,null),a=o.getNext();a&&a.isEqual(h)&&(r(a,u),a=o.hasNext()?o.getNext():null),a?l.U(Vr(a)):l.done()})).next((()=>{for(;a;)r(a,null),a=o.hasNext()?o.getNext():null}))}getDocumentsMatchingQuery(e,t,r,i,s){const o=t.path,a=[o.popLast().toArray(),o.lastSegment(),Ns(r.readTime),r.documentKey.path.isEmpty()?"":r.documentKey.path.lastSegment()],c=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return Qt(e).W(IDBKeyRange.bound(a,c,!0)).next((u=>{s==null||s.incrementDocumentReadCount(u.length);let l=Ne();for(const h of u){const d=this.nr(w.fromSegments(h.prefixPath.concat(h.collectionGroup,h.documentId)),h);d.isFoundDocument()&&(Ni(t,d)||i.has(d.key))&&(l=l.insert(d.key,d))}return l}))}getAllFromCollectionGroup(e,t,r,i){let s=Ne();const o=Ul(t,r),a=Ul(t,Me.max());return Qt(e).Y({index:"collectionGroupIndex",range:IDBKeyRange.bound(o,a,!0)},((c,u,l)=>{const h=this.nr(w.fromSegments(u.prefixPath.concat(u.collectionGroup,u.documentId)),u);s=s.insert(h.key,h),s.size===i&&l.done()})).next((()=>s))}newChangeBuffer(e){return new HT(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next((t=>t.byteSize))}getMetadata(e){return Fl(e).get("remoteDocumentGlobalKey").next((t=>(S(!!t),t)))}tr(e,t){return Fl(e).put("remoteDocumentGlobalKey",t)}nr(e,t){if(t){const r=NT(this.serializer,t);if(!(r.isNoDocument()&&r.version.isEqual(b.min())))return r}return Q.newInvalidDocument(e)}}function pp(n){return new KT(n)}class HT extends fp{constructor(e,t){super(),this.ar=e,this.trackRemovals=t,this.ur=new ht((r=>r.toString()),((r,i)=>r.isEqual(i)))}applyChanges(e){const t=[];let r=0,i=new z(((s,o)=>k(s.canonicalString(),o.canonicalString())));return this.changes.forEach(((s,o)=>{const a=this.ur.get(s);if(t.push(this.ar.removeEntry(e,s,a.readTime)),o.isValidDocument()){const c=Al(this.ar.serializer,o);i=i.add(s.path.popLast());const u=Os(c);r+=u-a.size,t.push(this.ar.addEntry(e,s,c))}else if(r-=a.size,this.trackRemovals){const c=Al(this.ar.serializer,o.convertToNoDocument(b.min()));t.push(this.ar.addEntry(e,s,c))}})),i.forEach((s=>{t.push(this.ar.indexManager.addToCollectionParentIndex(e,s))})),t.push(this.ar.updateMetadata(e,r)),p.waitFor(t)}getFromCache(e,t){return this.ar.rr(e,t).next((r=>(this.ur.set(t,{size:r.size,readTime:r.document.readTime}),r.document)))}getAllFromCache(e,t){return this.ar.sr(e,t).next((({documents:r,_r:i})=>(i.forEach(((s,o)=>{this.ur.set(s,{size:o,readTime:r.get(s).readTime})})),r)))}}function Fl(n){return _e(n,"remoteDocumentGlobal")}function Qt(n){return _e(n,"remoteDocumentsV14")}function Vr(n){const e=n.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function Ul(n,e){const t=e.documentKey.path.toArray();return[n,Ns(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function Bl(n,e){const t=n.path.toArray(),r=e.path.toArray();let i=0;for(let s=0;s<t.length-2&&s<r.length-2;++s)if(i=k(t[s],r[s]),i)return i;return i=k(t.length,r.length),i||(i=k(t[t.length-2],r[r.length-2]),i||k(t[t.length-1],r[r.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WT{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mp{constructor(e,t,r,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next((i=>(r=i,this.remoteDocumentCache.getEntry(e,t)))).next((i=>(r!==null&&Kr(r.mutation,i,ke.empty(),X.now()),i)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.getLocalViewOfDocuments(e,r,x()).next((()=>r))))}getLocalViewOfDocuments(e,t,r=x()){const i=Ye();return this.populateOverlays(e,i,t).next((()=>this.computeViews(e,t,i,r).next((s=>{let o=Fr();return s.forEach(((a,c)=>{o=o.insert(a,c.overlayedDocument)})),o}))))}getOverlayedDocuments(e,t){const r=Ye();return this.populateOverlays(e,r,t).next((()=>this.computeViews(e,t,r,x())))}populateOverlays(e,t,r){const i=[];return r.forEach((s=>{t.has(s)||i.push(s)})),this.documentOverlayCache.getOverlays(e,i).next((s=>{s.forEach(((o,a)=>{t.set(o,a)}))}))}computeViews(e,t,r,i){let s=Ne();const o=zr(),a=(function(){return zr()})();return t.forEach(((c,u)=>{const l=r.get(u.key);i.has(u.key)&&(l===void 0||l.mutation instanceof dt)?s=s.insert(u.key,u):l!==void 0?(o.set(u.key,l.mutation.getFieldMask()),Kr(l.mutation,u,l.mutation.getFieldMask(),X.now())):o.set(u.key,ke.empty())})),this.recalculateAndSaveOverlays(e,s).next((c=>(c.forEach(((u,l)=>o.set(u,l))),t.forEach(((u,l)=>{var h;return a.set(u,new WT(l,(h=o.get(u))!==null&&h!==void 0?h:null))})),a)))}recalculateAndSaveOverlays(e,t){const r=zr();let i=new H(((o,a)=>o-a)),s=x();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((o=>{for(const a of o)a.keys().forEach((c=>{const u=t.get(c);if(u===null)return;let l=r.get(c)||ke.empty();l=a.applyToLocalView(u,l),r.set(c,l);const h=(i.get(a.batchId)||x()).add(c);i=i.insert(a.batchId,h)}))})).next((()=>{const o=[],a=i.getReverseIterator();for(;a.hasNext();){const c=a.getNext(),u=c.key,l=c.value,h=kf();l.forEach((d=>{if(!s.has(d)){const f=Bf(t.get(d),r.get(d));f!==null&&h.set(d,f),s=s.add(d)}})),o.push(this.documentOverlayCache.saveOverlays(e,u,h))}return p.waitFor(o)})).next((()=>r))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.recalculateAndSaveOverlays(e,r)))}getDocumentsMatchingQuery(e,t,r,i){return(function(o){return w.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0})(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):gc(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,i):this.getDocumentsMatchingCollectionQuery(e,t,r,i)}getNextDocuments(e,t,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,i).next((s=>{const o=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,i-s.size):p.resolve(Ye());let a=-1,c=s;return o.next((u=>p.forEach(u,((l,h)=>(a<h.largestBatchId&&(a=h.largestBatchId),s.get(l)?p.resolve():this.remoteDocumentCache.getEntry(e,l).next((d=>{c=c.insert(l,d)}))))).next((()=>this.populateOverlays(e,u,s))).next((()=>this.computeViews(e,c,u,x()))).next((l=>({batchId:a,changes:Vf(l)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new w(t)).next((r=>{let i=Fr();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i}))}getDocumentsMatchingCollectionGroupQuery(e,t,r,i){const s=t.collectionGroup;let o=Fr();return this.indexManager.getCollectionParents(e,s).next((a=>p.forEach(a,(c=>{const u=(function(h,d){return new lt(d,null,h.explicitOrderBy.slice(),h.filters.slice(),h.limit,h.limitType,h.startAt,h.endAt)})(t,c.child(s));return this.getDocumentsMatchingCollectionQuery(e,u,r,i).next((l=>{l.forEach(((h,d)=>{o=o.insert(h,d)}))}))})).next((()=>o))))}getDocumentsMatchingCollectionQuery(e,t,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next((o=>(s=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,i)))).next((o=>{s.forEach(((c,u)=>{const l=u.getKey();o.get(l)===null&&(o=o.insert(l,Q.newInvalidDocument(l)))}));let a=Fr();return o.forEach(((c,u)=>{const l=s.get(c);l!==void 0&&Kr(l.mutation,u,ke.empty(),X.now()),Ni(t,u)&&(a=a.insert(c,u))})),a}))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class QT{constructor(e){this.serializer=e,this.cr=new Map,this.lr=new Map}getBundleMetadata(e,t){return p.resolve(this.cr.get(t))}saveBundleMetadata(e,t){return this.cr.set(t.id,(function(i){return{id:i.id,version:i.version,createTime:ae(i.createTime)}})(t)),p.resolve()}getNamedQuery(e,t){return p.resolve(this.lr.get(t))}saveNamedQuery(e,t){return this.lr.set(t.name,(function(i){return{name:i.name,query:Rc(i.bundledQuery),readTime:ae(i.readTime)}})(t)),p.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class YT{constructor(){this.overlays=new H(w.comparator),this.hr=new Map}getOverlay(e,t){return p.resolve(this.overlays.get(t))}getOverlays(e,t){const r=Ye();return p.forEach(t,(i=>this.getOverlay(e,i).next((s=>{s!==null&&r.set(i,s)})))).next((()=>r))}saveOverlays(e,t,r){return r.forEach(((i,s)=>{this.ht(e,t,s)})),p.resolve()}removeOverlaysForBatchId(e,t,r){const i=this.hr.get(r);return i!==void 0&&(i.forEach((s=>this.overlays=this.overlays.remove(s))),this.hr.delete(r)),p.resolve()}getOverlaysForCollection(e,t,r){const i=Ye(),s=t.length+1,o=new w(t.child("")),a=this.overlays.getIteratorFrom(o);for(;a.hasNext();){const c=a.getNext().value,u=c.getKey();if(!t.isPrefixOf(u.path))break;u.path.length===s&&c.largestBatchId>r&&i.set(c.getKey(),c)}return p.resolve(i)}getOverlaysForCollectionGroup(e,t,r,i){let s=new H(((u,l)=>u-l));const o=this.overlays.getIterator();for(;o.hasNext();){const u=o.getNext().value;if(u.getKey().getCollectionGroup()===t&&u.largestBatchId>r){let l=s.get(u.largestBatchId);l===null&&(l=Ye(),s=s.insert(u.largestBatchId,l)),l.set(u.getKey(),u)}}const a=Ye(),c=s.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach(((u,l)=>a.set(u,l))),!(a.size()>=i)););return p.resolve(a)}ht(e,t,r){const i=this.overlays.get(r.key);if(i!==null){const o=this.hr.get(i.largestBatchId).delete(r.key);this.hr.set(i.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new Tc(t,r));let s=this.hr.get(t);s===void 0&&(s=x(),this.hr.set(t,s)),this.hr.set(t,s.add(r.key))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bc{constructor(){this.Pr=new z(de.Ir),this.Tr=new z(de.Er)}isEmpty(){return this.Pr.isEmpty()}addReference(e,t){const r=new de(e,t);this.Pr=this.Pr.add(r),this.Tr=this.Tr.add(r)}dr(e,t){e.forEach((r=>this.addReference(r,t)))}removeReference(e,t){this.Ar(new de(e,t))}Rr(e,t){e.forEach((r=>this.removeReference(r,t)))}Vr(e){const t=new w(new U([])),r=new de(t,e),i=new de(t,e+1),s=[];return this.Tr.forEachInRange([r,i],(o=>{this.Ar(o),s.push(o.key)})),s}mr(){this.Pr.forEach((e=>this.Ar(e)))}Ar(e){this.Pr=this.Pr.delete(e),this.Tr=this.Tr.delete(e)}gr(e){const t=new w(new U([])),r=new de(t,e),i=new de(t,e+1);let s=x();return this.Tr.forEachInRange([r,i],(o=>{s=s.add(o.key)})),s}containsKey(e){const t=new de(e,0),r=this.Pr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class de{constructor(e,t){this.key=e,this.pr=t}static Ir(e,t){return w.comparator(e.key,t.key)||k(e.pr,t.pr)}static Er(e,t){return k(e.pr,t.pr)||w.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JT{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.yr=1,this.wr=new z(de.Ir)}checkEmpty(e){return p.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,i){const s=this.yr;this.yr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new Ic(s,t,r,i);this.mutationQueue.push(o);for(const a of i)this.wr=this.wr.add(new de(a.key,s)),this.indexManager.addToCollectionParentIndex(e,a.key.path.popLast());return p.resolve(o)}lookupMutationBatch(e,t){return p.resolve(this.Sr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=this.br(r),s=i<0?0:i;return p.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return p.resolve(this.mutationQueue.length===0?-1:this.yr-1)}getAllMutationBatches(e){return p.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new de(t,0),i=new de(t,Number.POSITIVE_INFINITY),s=[];return this.wr.forEachInRange([r,i],(o=>{const a=this.Sr(o.pr);s.push(a)})),p.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new z(k);return t.forEach((i=>{const s=new de(i,0),o=new de(i,Number.POSITIVE_INFINITY);this.wr.forEachInRange([s,o],(a=>{r=r.add(a.pr)}))})),p.resolve(this.Dr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1;let s=r;w.isDocumentKey(s)||(s=s.child(""));const o=new de(new w(s),0);let a=new z(k);return this.wr.forEachWhile((c=>{const u=c.key.path;return!!r.isPrefixOf(u)&&(u.length===i&&(a=a.add(c.pr)),!0)}),o),p.resolve(this.Dr(a))}Dr(e){const t=[];return e.forEach((r=>{const i=this.Sr(r);i!==null&&t.push(i)})),t}removeMutationBatch(e,t){S(this.Cr(t.batchId,"removed")===0),this.mutationQueue.shift();let r=this.wr;return p.forEach(t.mutations,(i=>{const s=new de(i.key,t.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)})).next((()=>{this.wr=r}))}Mn(e){}containsKey(e,t){const r=new de(t,0),i=this.wr.firstAfterOrEqual(r);return p.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,p.resolve()}Cr(e,t){return this.br(e)}br(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Sr(e){const t=this.br(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class XT{constructor(e){this.vr=e,this.docs=(function(){return new H(w.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,i=this.docs.get(r),s=i?i.size:0,o=this.vr(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:o}),this.size+=o-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return p.resolve(r?r.document.mutableCopy():Q.newInvalidDocument(t))}getEntries(e,t){let r=Ne();return t.forEach((i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():Q.newInvalidDocument(i))})),p.resolve(r)}getDocumentsMatchingQuery(e,t,r,i){let s=Ne();const o=t.path,a=new w(o.child("")),c=this.docs.getIteratorFrom(a);for(;c.hasNext();){const{key:u,value:{document:l}}=c.getNext();if(!o.isPrefixOf(u.path))break;u.path.length>o.length+1||fc(of(l),r)<=0||(i.has(l.key)||Ni(t,l))&&(s=s.insert(l.key,l.mutableCopy()))}return p.resolve(s)}getAllFromCollectionGroup(e,t,r,i){R()}Fr(e,t){return p.forEach(this.docs,(r=>t(r)))}newChangeBuffer(e){return new ZT(this)}getSize(e){return p.resolve(this.size)}}class ZT extends fp{constructor(e){super(),this.ar=e}applyChanges(e){const t=[];return this.changes.forEach(((r,i)=>{i.isValidDocument()?t.push(this.ar.addEntry(e,i)):this.ar.removeEntry(r)})),p.waitFor(t)}getFromCache(e,t){return this.ar.getEntry(e,t)}getAllFromCache(e,t){return this.ar.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ew{constructor(e){this.persistence=e,this.Mr=new ht((t=>mn(t)),Vi),this.lastRemoteSnapshotVersion=b.min(),this.highestTargetId=0,this.Or=0,this.Nr=new bc,this.targetCount=0,this.Br=En.Nn()}forEachTarget(e,t){return this.Mr.forEach(((r,i)=>t(i))),p.resolve()}getLastRemoteSnapshotVersion(e){return p.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return p.resolve(this.Or)}allocateTargetId(e){return this.highestTargetId=this.Br.next(),p.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Or&&(this.Or=t),p.resolve()}qn(e){this.Mr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.Br=new En(t),this.highestTargetId=t),e.sequenceNumber>this.Or&&(this.Or=e.sequenceNumber)}addTargetData(e,t){return this.qn(t),this.targetCount+=1,p.resolve()}updateTargetData(e,t){return this.qn(t),p.resolve()}removeTargetData(e,t){return this.Mr.delete(t.target),this.Nr.Vr(t.targetId),this.targetCount-=1,p.resolve()}removeTargets(e,t,r){let i=0;const s=[];return this.Mr.forEach(((o,a)=>{a.sequenceNumber<=t&&r.get(a.targetId)===null&&(this.Mr.delete(o),s.push(this.removeMatchingKeysForTargetId(e,a.targetId)),i++)})),p.waitFor(s).next((()=>i))}getTargetCount(e){return p.resolve(this.targetCount)}getTargetData(e,t){const r=this.Mr.get(t)||null;return p.resolve(r)}addMatchingKeys(e,t,r){return this.Nr.dr(t,r),p.resolve()}removeMatchingKeys(e,t,r){this.Nr.Rr(t,r);const i=this.persistence.referenceDelegate,s=[];return i&&t.forEach((o=>{s.push(i.markPotentiallyOrphaned(e,o))})),p.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.Nr.Vr(t),p.resolve()}getMatchingKeysForTargetId(e,t){const r=this.Nr.gr(t);return p.resolve(r)}containsKey(e,t){return p.resolve(this.Nr.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cc{constructor(e,t){this.Lr={},this.overlays={},this.kr=new Ve(0),this.qr=!1,this.qr=!0,this.referenceDelegate=e(this),this.Qr=new ew(this),this.indexManager=new BT,this.remoteDocumentCache=(function(i){return new XT(i)})((r=>this.referenceDelegate.Kr(r))),this.serializer=new ip(t),this.$r=new QT(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.qr=!1,Promise.resolve()}get started(){return this.qr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new YT,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.Lr[e.toKey()];return r||(r=new JT(t,this.referenceDelegate),this.Lr[e.toKey()]=r),r}getTargetCache(){return this.Qr}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.$r}runTransaction(e,t,r){_("MemoryPersistence","Starting transaction:",e);const i=new tw(this.kr.next());return this.referenceDelegate.Ur(),r(i).next((s=>this.referenceDelegate.Wr(i).next((()=>s)))).toPromise().then((s=>(i.raiseOnCommittedEvent(),s)))}Gr(e,t){return p.or(Object.values(this.Lr).map((r=>()=>r.containsKey(e,t))))}}class tw extends cf{constructor(e){super(),this.currentSequenceNumber=e}}class yo{constructor(e){this.persistence=e,this.zr=new bc,this.jr=null}static Hr(e){return new yo(e)}get Jr(){if(this.jr)return this.jr;throw R()}addReference(e,t,r){return this.zr.addReference(r,t),this.Jr.delete(r.toString()),p.resolve()}removeReference(e,t,r){return this.zr.removeReference(r,t),this.Jr.add(r.toString()),p.resolve()}markPotentiallyOrphaned(e,t){return this.Jr.add(t.toString()),p.resolve()}removeTarget(e,t){this.zr.Vr(t.targetId).forEach((i=>this.Jr.add(i.toString())));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next((i=>{i.forEach((s=>this.Jr.add(s.toString())))})).next((()=>r.removeTargetData(e,t)))}Ur(){this.jr=new Set}Wr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return p.forEach(this.Jr,(r=>{const i=w.fromPath(r);return this.Yr(e,i).next((s=>{s||t.removeEntry(i,b.min())}))})).next((()=>(this.jr=null,t.apply(e))))}updateLimboDocument(e,t){return this.Yr(e,t).next((r=>{r?this.Jr.delete(t.toString()):this.Jr.add(t.toString())}))}Kr(e){return 0}Yr(e,t){return p.or([()=>p.resolve(this.zr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Gr(e,t)])}}class Ls{constructor(e,t){this.persistence=e,this.Zr=new ht((r=>Se(r.path)),((r,i)=>r.isEqual(i))),this.garbageCollector=dp(this,t)}static Hr(e,t){return new Ls(e,t)}Ur(){}Wr(e){return p.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}Hn(e){const t=this.Zn(e);return this.persistence.getTargetCache().getTargetCount(e).next((r=>t.next((i=>r+i))))}Zn(e){let t=0;return this.Jn(e,(r=>{t++})).next((()=>t))}Jn(e,t){return p.forEach(this.Zr,((r,i)=>this.er(e,r,i).next((s=>s?p.resolve():t(i)))))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const i=this.persistence.getRemoteDocumentCache(),s=i.newChangeBuffer();return i.Fr(e,(o=>this.er(e,o,t).next((a=>{a||(r++,s.removeEntry(o,b.min()))})))).next((()=>s.apply(e))).next((()=>r))}markPotentiallyOrphaned(e,t){return this.Zr.set(t,e.currentSequenceNumber),p.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.Zr.set(r,e.currentSequenceNumber),p.resolve()}removeReference(e,t,r){return this.Zr.set(r,e.currentSequenceNumber),p.resolve()}updateLimboDocument(e,t){return this.Zr.set(t,e.currentSequenceNumber),p.resolve()}Kr(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=hs(e.data.value)),t}er(e,t,r){return p.or([()=>this.persistence.Gr(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const i=this.Zr.get(t);return p.resolve(i!==void 0&&i>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nw{constructor(e){this.serializer=e}N(e,t,r,i){const s=new lo("createOrUpgrade",t);r<1&&i>=1&&((function(c){c.createObjectStore("owner")})(e),(function(c){c.createObjectStore("mutationQueues",{keyPath:"userId"}),c.createObjectStore("mutations",{keyPath:"batchId",autoIncrement:!0}).createIndex("userMutationsIndex",tl,{unique:!0}),c.createObjectStore("documentMutations")})(e),ql(e),(function(c){c.createObjectStore("remoteDocuments")})(e));let o=p.resolve();return r<3&&i>=3&&(r!==0&&((function(c){c.deleteObjectStore("targetDocuments"),c.deleteObjectStore("targets"),c.deleteObjectStore("targetGlobal")})(e),ql(e)),o=o.next((()=>(function(c){const u=c.store("targetGlobal"),l={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:b.min().toTimestamp(),targetCount:0};return u.put("targetGlobalKey",l)})(s)))),r<4&&i>=4&&(r!==0&&(o=o.next((()=>(function(c,u){return u.store("mutations").W().next((l=>{c.deleteObjectStore("mutations"),c.createObjectStore("mutations",{keyPath:"batchId",autoIncrement:!0}).createIndex("userMutationsIndex",tl,{unique:!0});const h=u.store("mutations"),d=l.map((f=>h.put(f)));return p.waitFor(d)}))})(e,s)))),o=o.next((()=>{(function(c){c.createObjectStore("clientMetadata",{keyPath:"clientId"})})(e)}))),r<5&&i>=5&&(o=o.next((()=>this.Xr(s)))),r<6&&i>=6&&(o=o.next((()=>((function(c){c.createObjectStore("remoteDocumentGlobal")})(e),this.ei(s))))),r<7&&i>=7&&(o=o.next((()=>this.ti(s)))),r<8&&i>=8&&(o=o.next((()=>this.ni(e,s)))),r<9&&i>=9&&(o=o.next((()=>{(function(c){c.objectStoreNames.contains("remoteDocumentChanges")&&c.deleteObjectStore("remoteDocumentChanges")})(e)}))),r<10&&i>=10&&(o=o.next((()=>this.ri(s)))),r<11&&i>=11&&(o=o.next((()=>{(function(c){c.createObjectStore("bundles",{keyPath:"bundleId"})})(e),(function(c){c.createObjectStore("namedQueries",{keyPath:"name"})})(e)}))),r<12&&i>=12&&(o=o.next((()=>{(function(c){const u=c.createObjectStore("documentOverlays",{keyPath:qE});u.createIndex("collectionPathOverlayIndex",$E,{unique:!1}),u.createIndex("collectionGroupOverlayIndex",GE,{unique:!1})})(e)}))),r<13&&i>=13&&(o=o.next((()=>(function(c){const u=c.createObjectStore("remoteDocumentsV14",{keyPath:DE});u.createIndex("documentKeyIndex",VE),u.createIndex("collectionGroupIndex",kE)})(e))).next((()=>this.ii(e,s))).next((()=>e.deleteObjectStore("remoteDocuments")))),r<14&&i>=14&&(o=o.next((()=>this.si(e,s)))),r<15&&i>=15&&(o=o.next((()=>(function(c){c.createObjectStore("indexConfiguration",{keyPath:"indexId",autoIncrement:!0}).createIndex("collectionGroupIndex","collectionGroup",{unique:!1}),c.createObjectStore("indexState",{keyPath:ME}).createIndex("sequenceNumberIndex",FE,{unique:!1}),c.createObjectStore("indexEntries",{keyPath:UE}).createIndex("documentKeyIndex",BE,{unique:!1})})(e)))),o}ei(e){let t=0;return e.store("remoteDocuments").Y(((r,i)=>{t+=Os(i)})).next((()=>{const r={byteSize:t};return e.store("remoteDocumentGlobal").put("remoteDocumentGlobalKey",r)}))}Xr(e){const t=e.store("mutationQueues"),r=e.store("mutations");return t.W().next((i=>p.forEach(i,(s=>{const o=IDBKeyRange.bound([s.userId,-1],[s.userId,s.lastAcknowledgedBatchId]);return r.W("userMutationsIndex",o).next((a=>p.forEach(a,(c=>{S(c.userId===s.userId);const u=Zt(this.serializer,c);return cp(e,s.userId,u).next((()=>{}))}))))}))))}ti(e){const t=e.store("targetDocuments"),r=e.store("remoteDocuments");return e.store("targetGlobal").get("targetGlobalKey").next((i=>{const s=[];return r.Y(((o,a)=>{const c=new U(o),u=(function(h){return[0,Se(h)]})(c);s.push(t.get(u).next((l=>l?p.resolve():(h=>t.put({targetId:0,path:Se(h),sequenceNumber:i.highestListenSequenceNumber}))(c))))})).next((()=>p.waitFor(s)))}))}ni(e,t){e.createObjectStore("collectionParents",{keyPath:LE});const r=t.store("collectionParents"),i=new Sc,s=o=>{if(i.add(o)){const a=o.lastSegment(),c=o.popLast();return r.put({collectionId:a,parent:Se(c)})}};return t.store("remoteDocuments").Y({J:!0},((o,a)=>{const c=new U(o);return s(c.popLast())})).next((()=>t.store("documentMutations").Y({J:!0},(([o,a,c],u)=>{const l=Qe(a);return s(l.popLast())}))))}ri(e){const t=e.store("targets");return t.Y(((r,i)=>{const s=Br(i),o=sp(this.serializer,s);return t.put(o)}))}ii(e,t){const r=t.store("remoteDocuments"),i=[];return r.Y(((s,o)=>{const a=t.store("remoteDocumentsV14"),c=(function(h){return h.document?new w(U.fromString(h.document.name).popFirst(5)):h.noDocument?w.fromSegments(h.noDocument.path):h.unknownDocument?w.fromSegments(h.unknownDocument.path):R()})(o).path.toArray(),u={prefixPath:c.slice(0,c.length-2),collectionGroup:c[c.length-2],documentId:c[c.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};i.push(a.put(u))})).next((()=>p.waitFor(i)))}si(e,t){const r=t.store("mutations"),i=pp(this.serializer),s=new Cc(yo.Hr,this.serializer.ct);return r.W().next((o=>{const a=new Map;return o.forEach((c=>{var u;let l=(u=a.get(c.userId))!==null&&u!==void 0?u:x();Zt(this.serializer,c).keys().forEach((h=>l=l.add(h))),a.set(c.userId,l)})),p.forEach(a,((c,u)=>{const l=new fe(u),h=go.lt(this.serializer,l),d=s.getIndexManager(l),f=_o.lt(l,this.serializer,d,s.referenceDelegate);return new mp(i,f,h,d).recalculateAndSaveOverlaysForDocumentKeys(new la(t,Ve._e),c).next()}))}))}}function ql(n){n.createObjectStore("targetDocuments",{keyPath:xE}).createIndex("documentTargetsIndex",OE,{unique:!0}),n.createObjectStore("targets",{keyPath:"targetId"}).createIndex("queryTargetsIndex",NE,{unique:!0}),n.createObjectStore("targetGlobal")}const $o="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.";class Dc{constructor(e,t,r,i,s,o,a,c,u,l,h=15){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=r,this.oi=s,this.window=o,this.document=a,this._i=u,this.ai=l,this.ui=h,this.kr=null,this.qr=!1,this.isPrimary=!1,this.networkEnabled=!0,this.ci=null,this.inForeground=!1,this.li=null,this.hi=null,this.Pi=Number.NEGATIVE_INFINITY,this.Ii=d=>Promise.resolve(),!Dc.D())throw new g(m.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new zT(this,i),this.Ti=t+"main",this.serializer=new ip(c),this.Ei=new Ue(this.Ti,this.ui,new nw(this.serializer)),this.Qr=new $T(this.referenceDelegate,this.serializer),this.remoteDocumentCache=pp(this.serializer),this.$r=new xT,this.window&&this.window.localStorage?this.di=this.window.localStorage:(this.di=null,l===!1&&oe("IndexedDbPersistence","LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.Ai().then((()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new g(m.FAILED_PRECONDITION,$o);return this.Ri(),this.Vi(),this.mi(),this.runTransaction("getHighestListenSequenceNumber","readonly",(e=>this.Qr.getHighestSequenceNumber(e)))})).then((e=>{this.kr=new Ve(e,this._i)})).then((()=>{this.qr=!0})).catch((e=>(this.Ei&&this.Ei.close(),Promise.reject(e))))}fi(e){return this.Ii=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.Ei.L((async t=>{t.newVersion===null&&await e()}))}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.oi.enqueueAndForget((async()=>{this.started&&await this.Ai()})))}Ai(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",(e=>es(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next((()=>{if(this.isPrimary)return this.gi(e).next((t=>{t||(this.isPrimary=!1,this.oi.enqueueRetryable((()=>this.Ii(!1))))}))})).next((()=>this.pi(e))).next((t=>this.isPrimary&&!t?this.yi(e).next((()=>!1)):!!t&&this.wi(e).next((()=>!0)))))).catch((e=>{if(Gt(e))return _("IndexedDbPersistence","Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return _("IndexedDbPersistence","Releasing owner lease after error during lease refresh",e),!1})).then((e=>{this.isPrimary!==e&&this.oi.enqueueRetryable((()=>this.Ii(e))),this.isPrimary=e}))}gi(e){return kr(e).get("owner").next((t=>p.resolve(this.Si(t))))}bi(e){return es(e).delete(this.clientId)}async Di(){if(this.isPrimary&&!this.Ci(this.Pi,18e5)){this.Pi=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",(t=>{const r=_e(t,"clientMetadata");return r.W().next((i=>{const s=this.vi(i,18e5),o=i.filter((a=>s.indexOf(a)===-1));return p.forEach(o,(a=>r.delete(a.clientId))).next((()=>o))}))})).catch((()=>[]));if(this.di)for(const t of e)this.di.removeItem(this.Fi(t.clientId))}}mi(){this.hi=this.oi.enqueueAfterDelay("client_metadata_refresh",4e3,(()=>this.Ai().then((()=>this.Di())).then((()=>this.mi()))))}Si(e){return!!e&&e.ownerId===this.clientId}pi(e){return this.ai?p.resolve(!0):kr(e).get("owner").next((t=>{if(t!==null&&this.Ci(t.leaseTimestampMs,5e3)&&!this.Mi(t.ownerId)){if(this.Si(t)&&this.networkEnabled)return!0;if(!this.Si(t)){if(!t.allowTabSynchronization)throw new g(m.FAILED_PRECONDITION,$o);return!1}}return!(!this.networkEnabled||!this.inForeground)||es(e).W().next((r=>this.vi(r,5e3).find((i=>{if(this.clientId!==i.clientId){const s=!this.networkEnabled&&i.networkEnabled,o=!this.inForeground&&i.inForeground,a=this.networkEnabled===i.networkEnabled;if(s||o&&a)return!0}return!1}))===void 0))})).next((t=>(this.isPrimary!==t&&_("IndexedDbPersistence",`Client ${t?"is":"is not"} eligible for a primary lease.`),t)))}async shutdown(){this.qr=!1,this.xi(),this.hi&&(this.hi.cancel(),this.hi=null),this.Oi(),this.Ni(),await this.Ei.runTransaction("shutdown","readwrite",["owner","clientMetadata"],(e=>{const t=new la(e,Ve._e);return this.yi(t).next((()=>this.bi(t)))})),this.Ei.close(),this.Bi()}vi(e,t){return e.filter((r=>this.Ci(r.updateTimeMs,t)&&!this.Mi(r.clientId)))}Li(){return this.runTransaction("getActiveClients","readonly",(e=>es(e).W().next((t=>this.vi(t,18e5).map((r=>r.clientId))))))}get started(){return this.qr}getMutationQueue(e,t){return _o.lt(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.Qr}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new qT(e,this.serializer.ct.databaseId)}getDocumentOverlayCache(e){return go.lt(this.serializer,e)}getBundleCache(){return this.$r}runTransaction(e,t,r){_("IndexedDbPersistence","Starting transaction:",e);const i=t==="readonly"?"readonly":"readwrite",s=(function(c){return c===15?zE:c===14?ff:c===13?df:c===12?jE:c===11?hf:void R()})(this.ui);let o;return this.Ei.runTransaction(e,i,s,(a=>(o=new la(a,this.kr?this.kr.next():Ve._e),t==="readwrite-primary"?this.gi(o).next((c=>!!c||this.pi(o))).next((c=>{if(!c)throw oe(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.oi.enqueueRetryable((()=>this.Ii(!1))),new g(m.FAILED_PRECONDITION,af);return r(o)})).next((c=>this.wi(o).next((()=>c)))):this.ki(o).next((()=>r(o)))))).then((a=>(o.raiseOnCommittedEvent(),a)))}ki(e){return kr(e).get("owner").next((t=>{if(t!==null&&this.Ci(t.leaseTimestampMs,5e3)&&!this.Mi(t.ownerId)&&!this.Si(t)&&!(this.ai||this.allowTabSynchronization&&t.allowTabSynchronization))throw new g(m.FAILED_PRECONDITION,$o)}))}wi(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return kr(e).put("owner",t)}static D(){return Ue.D()}yi(e){const t=kr(e);return t.get("owner").next((r=>this.Si(r)?(_("IndexedDbPersistence","Releasing primary lease."),t.delete("owner")):p.resolve()))}Ci(e,t){const r=Date.now();return!(e<r-t)&&(!(e>r)||(oe(`Detected an update time that is in the future: ${e} > ${r}`),!1))}Ri(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.li=()=>{this.oi.enqueueAndForget((()=>(this.inForeground=this.document.visibilityState==="visible",this.Ai())))},this.document.addEventListener("visibilitychange",this.li),this.inForeground=this.document.visibilityState==="visible")}Oi(){this.li&&(this.document.removeEventListener("visibilitychange",this.li),this.li=null)}Vi(){var e;typeof((e=this.window)===null||e===void 0?void 0:e.addEventListener)=="function"&&(this.ci=()=>{this.xi();const t=/(?:Version|Mobile)\/1[456]/;yh()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.oi.enterRestrictedMode(!0),this.oi.enqueueAndForget((()=>this.shutdown()))},this.window.addEventListener("pagehide",this.ci))}Ni(){this.ci&&(this.window.removeEventListener("pagehide",this.ci),this.ci=null)}Mi(e){var t;try{const r=((t=this.di)===null||t===void 0?void 0:t.getItem(this.Fi(e)))!==null;return _("IndexedDbPersistence",`Client '${e}' ${r?"is":"is not"} zombied in LocalStorage`),r}catch(r){return oe("IndexedDbPersistence","Failed to get zombied client id.",r),!1}}xi(){if(this.di)try{this.di.setItem(this.Fi(this.clientId),String(Date.now()))}catch(e){oe("Failed to set zombie client id.",e)}}Bi(){if(this.di)try{this.di.removeItem(this.Fi(this.clientId))}catch{}}Fi(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function kr(n){return _e(n,"owner")}function es(n){return _e(n,"clientMetadata")}function Vc(n,e){let t=n.projectId;return n.isDefaultDatabase||(t+="."+n.database),"firestore/"+e+"/"+t+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kc{constructor(e,t,r,i){this.targetId=e,this.fromCache=t,this.qi=r,this.Qi=i}static Ki(e,t){let r=x(),i=x();for(const s of t.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new kc(e,t.fromCache,r,i)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rw{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gp{constructor(){this.$i=!1,this.Ui=!1,this.Wi=100,this.Gi=(function(){return yh()?8:Ue.v(ue())>0?6:4})()}initialize(e,t){this.zi=e,this.indexManager=t,this.$i=!0}getDocumentsMatchingQuery(e,t,r,i){const s={result:null};return this.ji(e,t).next((o=>{s.result=o})).next((()=>{if(!s.result)return this.Hi(e,t,i,r).next((o=>{s.result=o}))})).next((()=>{if(s.result)return;const o=new rw;return this.Ji(e,t,o).next((a=>{if(s.result=a,this.Ui)return this.Yi(e,t,o,a.size)}))})).next((()=>s.result))}Yi(e,t,r,i){return r.documentReadCount<this.Wi?(xn()<=F.DEBUG&&_("QueryEngine","SDK will not create cache indexes for query:",On(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Wi,"documents"),p.resolve()):(xn()<=F.DEBUG&&_("QueryEngine","Query:",On(t),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.Gi*i?(xn()<=F.DEBUG&&_("QueryEngine","The SDK decides to create cache indexes for query:",On(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,De(t))):p.resolve())}ji(e,t){if(fl(t))return p.resolve(null);let r=De(t);return this.indexManager.getIndexType(e,r).next((i=>i===0?null:(t.limit!==null&&i===1&&(t=Vs(t,null,"F"),r=De(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next((s=>{const o=x(...s);return this.zi.getDocuments(e,o).next((a=>this.indexManager.getMinOffset(e,r).next((c=>{const u=this.Zi(t,a);return this.Xi(t,u,o,c.readTime)?this.ji(e,Vs(t,null,"F")):this.es(e,u,t,c)}))))})))))}Hi(e,t,r,i){return fl(t)||i.isEqual(b.min())?p.resolve(null):this.zi.getDocuments(e,r).next((s=>{const o=this.Zi(t,s);return this.Xi(t,o,r,i)?p.resolve(null):(xn()<=F.DEBUG&&_("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),On(t)),this.es(e,o,t,sf(i,-1)).next((a=>a)))}))}Zi(e,t){let r=new z(Cf(e));return t.forEach(((i,s)=>{Ni(e,s)&&(r=r.add(s))})),r}Xi(e,t,r,i){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const s=e.limitType==="F"?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}Ji(e,t,r){return xn()<=F.DEBUG&&_("QueryEngine","Using full collection scan to execute query:",On(t)),this.zi.getDocumentsMatchingQuery(e,t,Me.min(),r)}es(e,t,r,i){return this.zi.getDocumentsMatchingQuery(e,r,i).next((s=>(t.forEach((o=>{s=s.insert(o.key,o)})),s)))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iw{constructor(e,t,r,i){this.persistence=e,this.ts=t,this.serializer=i,this.ns=new H(k),this.rs=new ht((s=>mn(s)),Vi),this.ss=new Map,this.os=e.getRemoteDocumentCache(),this.Qr=e.getTargetCache(),this.$r=e.getBundleCache(),this._s(r)}_s(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new mp(this.os,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.os.setIndexManager(this.indexManager),this.ts.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.ns)))}}function _p(n,e,t,r){return new iw(n,e,t,r)}async function yp(n,e){const t=T(n);return await t.persistence.runTransaction("Handle user change","readonly",(r=>{let i;return t.mutationQueue.getAllMutationBatches(r).next((s=>(i=s,t._s(e),t.mutationQueue.getAllMutationBatches(r)))).next((s=>{const o=[],a=[];let c=x();for(const u of i){o.push(u.batchId);for(const l of u.mutations)c=c.add(l.key)}for(const u of s){a.push(u.batchId);for(const l of u.mutations)c=c.add(l.key)}return t.localDocuments.getDocuments(r,c).next((u=>({us:u,removedBatchIds:o,addedBatchIds:a})))}))}))}function sw(n,e){const t=T(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(r=>{const i=e.batch.keys(),s=t.os.newChangeBuffer({trackRemovals:!0});return(function(a,c,u,l){const h=u.batch,d=h.keys();let f=p.resolve();return d.forEach((I=>{f=f.next((()=>l.getEntry(c,I))).next((E=>{const y=u.docVersions.get(I);S(y!==null),E.version.compareTo(y)<0&&(h.applyToRemoteDocument(E,u),E.isValidDocument()&&(E.setReadTime(u.commitVersion),l.addEntry(E)))}))})),f.next((()=>a.mutationQueue.removeMutationBatch(c,h)))})(t,r,e,s).next((()=>s.apply(r))).next((()=>t.mutationQueue.performConsistencyCheck(r))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,(function(a){let c=x();for(let u=0;u<a.mutationResults.length;++u)a.mutationResults[u].transformResults.length>0&&(c=c.add(a.batch.mutations[u].key));return c})(e)))).next((()=>t.localDocuments.getDocuments(r,i)))}))}function Ip(n){const e=T(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.Qr.getLastRemoteSnapshotVersion(t)))}function ow(n,e){const t=T(n),r=e.snapshotVersion;let i=t.ns;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(s=>{const o=t.os.newChangeBuffer({trackRemovals:!0});i=t.ns;const a=[];e.targetChanges.forEach(((l,h)=>{const d=i.get(h);if(!d)return;a.push(t.Qr.removeMatchingKeys(s,l.removedDocuments,h).next((()=>t.Qr.addMatchingKeys(s,l.addedDocuments,h))));let f=d.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(h)!==null?f=f.withResumeToken(le.EMPTY_BYTE_STRING,b.min()).withLastLimboFreeSnapshotVersion(b.min()):l.resumeToken.approximateByteSize()>0&&(f=f.withResumeToken(l.resumeToken,r)),i=i.insert(h,f),(function(E,y,P){return E.resumeToken.approximateByteSize()===0||y.snapshotVersion.toMicroseconds()-E.snapshotVersion.toMicroseconds()>=3e8?!0:P.addedDocuments.size+P.modifiedDocuments.size+P.removedDocuments.size>0})(d,f,l)&&a.push(t.Qr.updateTargetData(s,f))}));let c=Ne(),u=x();if(e.documentUpdates.forEach((l=>{e.resolvedLimboDocuments.has(l)&&a.push(t.persistence.referenceDelegate.updateLimboDocument(s,l))})),a.push(Ep(s,o,e.documentUpdates).next((l=>{c=l.cs,u=l.ls}))),!r.isEqual(b.min())){const l=t.Qr.getLastRemoteSnapshotVersion(s).next((h=>t.Qr.setTargetsMetadata(s,s.currentSequenceNumber,r)));a.push(l)}return p.waitFor(a).next((()=>o.apply(s))).next((()=>t.localDocuments.getLocalViewOfDocuments(s,c,u))).next((()=>c))})).then((s=>(t.ns=i,s)))}function Ep(n,e,t){let r=x(),i=x();return t.forEach((s=>r=r.add(s))),e.getEntries(n,r).next((s=>{let o=Ne();return t.forEach(((a,c)=>{const u=s.get(a);c.isFoundDocument()!==u.isFoundDocument()&&(i=i.add(a)),c.isNoDocument()&&c.version.isEqual(b.min())?(e.removeEntry(a,c.readTime),o=o.insert(a,c)):!u.isValidDocument()||c.version.compareTo(u.version)>0||c.version.compareTo(u.version)===0&&u.hasPendingWrites?(e.addEntry(c),o=o.insert(a,c)):_("LocalStore","Ignoring outdated watch update for ",a,". Current version:",u.version," Watch version:",c.version)})),{cs:o,ls:i}}))}function aw(n,e){const t=T(n);return t.persistence.runTransaction("Get next mutation batch","readonly",(r=>(e===void 0&&(e=-1),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e))))}function tr(n,e){const t=T(n);return t.persistence.runTransaction("Allocate target","readwrite",(r=>{let i;return t.Qr.getTargetData(r,e).next((s=>s?(i=s,p.resolve(i)):t.Qr.allocateTargetId(r).next((o=>(i=new it(e,o,"TargetPurposeListen",r.currentSequenceNumber),t.Qr.addTargetData(r,i).next((()=>i)))))))})).then((r=>{const i=t.ns.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(t.ns=t.ns.insert(r.targetId,r),t.rs.set(e,r.targetId)),r}))}async function nr(n,e,t){const r=T(n),i=r.ns.get(e),s=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",s,(o=>r.persistence.referenceDelegate.removeTarget(o,i)))}catch(o){if(!Gt(o))throw o;_("LocalStore",`Failed to update sequence numbers for target ${e}: ${o}`)}r.ns=r.ns.remove(e),r.rs.delete(i.target)}function Ms(n,e,t){const r=T(n);let i=b.min(),s=x();return r.persistence.runTransaction("Execute query","readwrite",(o=>(function(c,u,l){const h=T(c),d=h.rs.get(l);return d!==void 0?p.resolve(h.ns.get(d)):h.Qr.getTargetData(u,l)})(r,o,De(e)).next((a=>{if(a)return i=a.lastLimboFreeSnapshotVersion,r.Qr.getMatchingKeysForTargetId(o,a.targetId).next((c=>{s=c}))})).next((()=>r.ts.getDocumentsMatchingQuery(o,e,t?i:b.min(),t?s:x()))).next((a=>(vp(r,bf(e),a),{documents:a,hs:s})))))}function Tp(n,e){const t=T(n),r=T(t.Qr),i=t.ns.get(e);return i?Promise.resolve(i.target):t.persistence.runTransaction("Get target data","readonly",(s=>r._t(s,e).next((o=>o?o.target:null))))}function wp(n,e){const t=T(n),r=t.ss.get(e)||b.min();return t.persistence.runTransaction("Get new document changes","readonly",(i=>t.os.getAllFromCollectionGroup(i,e,sf(r,-1),Number.MAX_SAFE_INTEGER))).then((i=>(vp(t,e,i),i)))}function vp(n,e,t){let r=n.ss.get(e)||b.min();t.forEach(((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)})),n.ss.set(e,r)}async function cw(n,e,t,r){const i=T(n);let s=x(),o=Ne();for(const u of t){const l=e.Ps(u.metadata.name);u.document&&(s=s.add(l));const h=e.Is(u);h.setReadTime(e.Ts(u.metadata.readTime)),o=o.insert(l,h)}const a=i.os.newChangeBuffer({trackRemovals:!0}),c=await tr(i,(function(l){return De(fr(U.fromString(`__bundle__/docs/${l}`)))})(r));return i.persistence.runTransaction("Apply bundle documents","readwrite",(u=>Ep(u,a,o).next((l=>(a.apply(u),l))).next((l=>i.Qr.removeMatchingKeysForTargetId(u,c.targetId).next((()=>i.Qr.addMatchingKeys(u,s,c.targetId))).next((()=>i.localDocuments.getLocalViewOfDocuments(u,l.cs,l.ls))).next((()=>l.cs))))))}async function uw(n,e,t=x()){const r=await tr(n,De(Rc(e.bundledQuery))),i=T(n);return i.persistence.runTransaction("Save named query","readwrite",(s=>{const o=ae(e.readTime);if(r.snapshotVersion.compareTo(o)>=0)return i.$r.saveNamedQuery(s,e);const a=r.withResumeToken(le.EMPTY_BYTE_STRING,o);return i.ns=i.ns.insert(a.targetId,a),i.Qr.updateTargetData(s,a).next((()=>i.Qr.removeMatchingKeysForTargetId(s,r.targetId))).next((()=>i.Qr.addMatchingKeys(s,t,r.targetId))).next((()=>i.$r.saveNamedQuery(s,e)))}))}function $l(n,e){return`firestore_clients_${n}_${e}`}function Gl(n,e,t){let r=`firestore_mutations_${n}_${t}`;return e.isAuthenticated()&&(r+=`_${e.uid}`),r}function Go(n,e){return`firestore_targets_${n}_${e}`}class Fs{constructor(e,t,r,i){this.user=e,this.batchId=t,this.state=r,this.error=i}static Es(e,t,r){const i=JSON.parse(r);let s,o=typeof i=="object"&&["pending","acknowledged","rejected"].indexOf(i.state)!==-1&&(i.error===void 0||typeof i.error=="object");return o&&i.error&&(o=typeof i.error.message=="string"&&typeof i.error.code=="string",o&&(s=new g(i.error.code,i.error.message))),o?new Fs(e,t,i.state,s):(oe("SharedClientState",`Failed to parse mutation state for ID '${t}': ${r}`),null)}ds(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class Hr{constructor(e,t,r){this.targetId=e,this.state=t,this.error=r}static Es(e,t){const r=JSON.parse(t);let i,s=typeof r=="object"&&["not-current","current","rejected"].indexOf(r.state)!==-1&&(r.error===void 0||typeof r.error=="object");return s&&r.error&&(s=typeof r.error.message=="string"&&typeof r.error.code=="string",s&&(i=new g(r.error.code,r.error.message))),s?new Hr(e,r.state,i):(oe("SharedClientState",`Failed to parse target state for ID '${e}': ${t}`),null)}ds(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class Us{constructor(e,t){this.clientId=e,this.activeTargetIds=t}static Es(e,t){const r=JSON.parse(t);let i=typeof r=="object"&&r.activeTargetIds instanceof Array,s=_c();for(let o=0;i&&o<r.activeTargetIds.length;++o)i=uf(r.activeTargetIds[o]),s=s.add(r.activeTargetIds[o]);return i?new Us(e,s):(oe("SharedClientState",`Failed to parse client data for instance '${e}': ${t}`),null)}}class Nc{constructor(e,t){this.clientId=e,this.onlineState=t}static Es(e){const t=JSON.parse(e);return typeof t=="object"&&["Unknown","Online","Offline"].indexOf(t.onlineState)!==-1&&typeof t.clientId=="string"?new Nc(t.clientId,t.onlineState):(oe("SharedClientState",`Failed to parse online state: ${e}`),null)}}class Aa{constructor(){this.activeTargetIds=_c()}As(e){this.activeTargetIds=this.activeTargetIds.add(e)}Rs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}ds(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class jo{constructor(e,t,r,i,s){this.window=e,this.oi=t,this.persistenceKey=r,this.Vs=i,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.fs=this.gs.bind(this),this.ps=new H(k),this.started=!1,this.ys=[];const o=r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=s,this.ws=$l(this.persistenceKey,this.Vs),this.Ss=(function(c){return`firestore_sequence_number_${c}`})(this.persistenceKey),this.ps=this.ps.insert(this.Vs,new Aa),this.bs=new RegExp(`^firestore_clients_${o}_([^_]*)$`),this.Ds=new RegExp(`^firestore_mutations_${o}_(\\d+)(?:_(.*))?$`),this.Cs=new RegExp(`^firestore_targets_${o}_(\\d+)$`),this.vs=(function(c){return`firestore_online_state_${c}`})(this.persistenceKey),this.Fs=(function(c){return`firestore_bundle_loaded_v2_${c}`})(this.persistenceKey),this.window.addEventListener("storage",this.fs)}static D(e){return!(!e||!e.localStorage)}async start(){const e=await this.syncEngine.Li();for(const r of e){if(r===this.Vs)continue;const i=this.getItem($l(this.persistenceKey,r));if(i){const s=Us.Es(r,i);s&&(this.ps=this.ps.insert(s.clientId,s))}}this.Ms();const t=this.storage.getItem(this.vs);if(t){const r=this.xs(t);r&&this.Os(r)}for(const r of this.ys)this.gs(r);this.ys=[],this.window.addEventListener("pagehide",(()=>this.shutdown())),this.started=!0}writeSequenceNumber(e){this.setItem(this.Ss,JSON.stringify(e))}getAllActiveQueryTargets(){return this.Ns(this.ps)}isActiveQueryTarget(e){let t=!1;return this.ps.forEach(((r,i)=>{i.activeTargetIds.has(e)&&(t=!0)})),t}addPendingMutation(e){this.Bs(e,"pending")}updateMutationState(e,t,r){this.Bs(e,t,r),this.Ls(e)}addLocalQueryTarget(e){let t="not-current";if(this.isActiveQueryTarget(e)){const r=this.storage.getItem(Go(this.persistenceKey,e));if(r){const i=Hr.Es(e,r);i&&(t=i.state)}}return this.ks.As(e),this.Ms(),t}removeLocalQueryTarget(e){this.ks.Rs(e),this.Ms()}isLocalQueryTarget(e){return this.ks.activeTargetIds.has(e)}clearQueryState(e){this.removeItem(Go(this.persistenceKey,e))}updateQueryState(e,t,r){this.qs(e,t,r)}handleUserChange(e,t,r){t.forEach((i=>{this.Ls(i)})),this.currentUser=e,r.forEach((i=>{this.addPendingMutation(i)}))}setOnlineState(e){this.Qs(e)}notifyBundleLoaded(e){this.Ks(e)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.fs),this.removeItem(this.ws),this.started=!1)}getItem(e){const t=this.storage.getItem(e);return _("SharedClientState","READ",e,t),t}setItem(e,t){_("SharedClientState","SET",e,t),this.storage.setItem(e,t)}removeItem(e){_("SharedClientState","REMOVE",e),this.storage.removeItem(e)}gs(e){const t=e;if(t.storageArea===this.storage){if(_("SharedClientState","EVENT",t.key,t.newValue),t.key===this.ws)return void oe("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.oi.enqueueRetryable((async()=>{if(this.started){if(t.key!==null){if(this.bs.test(t.key)){if(t.newValue==null){const r=this.$s(t.key);return this.Us(r,null)}{const r=this.Ws(t.key,t.newValue);if(r)return this.Us(r.clientId,r)}}else if(this.Ds.test(t.key)){if(t.newValue!==null){const r=this.Gs(t.key,t.newValue);if(r)return this.zs(r)}}else if(this.Cs.test(t.key)){if(t.newValue!==null){const r=this.js(t.key,t.newValue);if(r)return this.Hs(r)}}else if(t.key===this.vs){if(t.newValue!==null){const r=this.xs(t.newValue);if(r)return this.Os(r)}}else if(t.key===this.Ss){const r=(function(s){let o=Ve._e;if(s!=null)try{const a=JSON.parse(s);S(typeof a=="number"),o=a}catch(a){oe("SharedClientState","Failed to read sequence number from WebStorage",a)}return o})(t.newValue);r!==Ve._e&&this.sequenceNumberHandler(r)}else if(t.key===this.Fs){const r=this.Js(t.newValue);await Promise.all(r.map((i=>this.syncEngine.Ys(i))))}}}else this.ys.push(t)}))}}get ks(){return this.ps.get(this.Vs)}Ms(){this.setItem(this.ws,this.ks.ds())}Bs(e,t,r){const i=new Fs(this.currentUser,e,t,r),s=Gl(this.persistenceKey,this.currentUser,e);this.setItem(s,i.ds())}Ls(e){const t=Gl(this.persistenceKey,this.currentUser,e);this.removeItem(t)}Qs(e){const t={clientId:this.Vs,onlineState:e};this.storage.setItem(this.vs,JSON.stringify(t))}qs(e,t,r){const i=Go(this.persistenceKey,e),s=new Hr(e,t,r);this.setItem(i,s.ds())}Ks(e){const t=JSON.stringify(Array.from(e));this.setItem(this.Fs,t)}$s(e){const t=this.bs.exec(e);return t?t[1]:null}Ws(e,t){const r=this.$s(e);return Us.Es(r,t)}Gs(e,t){const r=this.Ds.exec(e),i=Number(r[1]),s=r[2]!==void 0?r[2]:null;return Fs.Es(new fe(s),i,t)}js(e,t){const r=this.Cs.exec(e),i=Number(r[1]);return Hr.Es(i,t)}xs(e){return Nc.Es(e)}Js(e){return JSON.parse(e)}async zs(e){if(e.user.uid===this.currentUser.uid)return this.syncEngine.Zs(e.batchId,e.state,e.error);_("SharedClientState",`Ignoring mutation for non-active user ${e.user.uid}`)}Hs(e){return this.syncEngine.Xs(e.targetId,e.state,e.error)}Us(e,t){const r=t?this.ps.insert(e,t):this.ps.remove(e),i=this.Ns(this.ps),s=this.Ns(r),o=[],a=[];return s.forEach((c=>{i.has(c)||o.push(c)})),i.forEach((c=>{s.has(c)||a.push(c)})),this.syncEngine.eo(o,a).then((()=>{this.ps=r}))}Os(e){this.ps.get(e.clientId)&&this.onlineStateHandler(e.onlineState)}Ns(e){let t=_c();return e.forEach(((r,i)=>{t=t.unionWith(i.activeTargetIds)})),t}}class Ap{constructor(){this.no=new Aa,this.ro={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e){return this.no.As(e),this.ro[e]||"not-current"}updateQueryState(e,t,r){this.ro[e]=t}removeLocalQueryTarget(e){this.no.Rs(e)}isLocalQueryTarget(e){return this.no.activeTargetIds.has(e)}clearQueryState(e){delete this.ro[e]}getAllActiveQueryTargets(){return this.no.activeTargetIds}isActiveQueryTarget(e){return this.no.activeTargetIds.has(e)}start(){return this.no=new Aa,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lw{io(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jl{constructor(){this.so=()=>this.oo(),this._o=()=>this.ao(),this.uo=[],this.co()}io(e){this.uo.push(e)}shutdown(){window.removeEventListener("online",this.so),window.removeEventListener("offline",this._o)}co(){window.addEventListener("online",this.so),window.addEventListener("offline",this._o)}oo(){_("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.uo)e(0)}ao(){_("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.uo)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ts=null;function zo(){return ts===null?ts=(function(){return 268435456+Math.round(2147483648*Math.random())})():ts++,"0x"+ts.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hw={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dw{constructor(e){this.lo=e.lo,this.ho=e.ho}Po(e){this.Io=e}To(e){this.Eo=e}onMessage(e){this.Ao=e}close(){this.ho()}send(e){this.lo(e)}Ro(){this.Io()}Vo(e){this.Eo(e)}mo(e){this.Ao(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ve="WebChannelConnection";class fw extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const r=t.ssl?"https":"http",i=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.fo=r+"://"+t.host,this.po=`projects/${i}/databases/${s}`,this.yo=this.databaseId.database==="(default)"?`project_id=${i}`:`project_id=${i}&database_id=${s}`}get wo(){return!1}So(t,r,i,s,o){const a=zo(),c=this.bo(t,r.toUriEncodedString());_("RestConnection",`Sending RPC '${t}' ${a}:`,c,i);const u={"google-cloud-resource-prefix":this.po,"x-goog-request-params":this.yo};return this.Do(u,s,o),this.Co(t,c,u,i).then((l=>(_("RestConnection",`Received RPC '${t}' ${a}: `,l),l)),(l=>{throw xe("RestConnection",`RPC '${t}' ${a} failed with error: `,l,"url: ",c,"request:",i),l}))}vo(t,r,i,s,o,a){return this.So(t,r,i,s,o)}Do(t,r,i){t["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+dr})(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach(((s,o)=>t[o]=s)),i&&i.headers.forEach(((s,o)=>t[o]=s))}bo(t,r){const i=hw[t];return`${this.fo}/v1/${r}:${i}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}Co(e,t,r,i){const s=zo();return new Promise(((o,a)=>{const c=new lE;c.setWithCredentials(!0),c.listenOnce(cE.COMPLETE,(()=>{try{switch(c.getLastErrorCode()){case Bo.NO_ERROR:const l=c.getResponseJson();_(ve,`XHR for RPC '${e}' ${s} received:`,JSON.stringify(l)),o(l);break;case Bo.TIMEOUT:_(ve,`RPC '${e}' ${s} timed out`),a(new g(m.DEADLINE_EXCEEDED,"Request time out"));break;case Bo.HTTP_ERROR:const h=c.getStatus();if(_(ve,`RPC '${e}' ${s} failed with status:`,h,"response text:",c.getResponseText()),h>0){let d=c.getResponseJson();Array.isArray(d)&&(d=d[0]);const f=d==null?void 0:d.error;if(f&&f.status&&f.message){const I=(function(y){const P=y.toLowerCase().replace(/_/g,"-");return Object.values(m).indexOf(P)>=0?P:m.UNKNOWN})(f.status);a(new g(I,f.message))}else a(new g(m.UNKNOWN,"Server responded with status "+c.getStatus()))}else a(new g(m.UNAVAILABLE,"Connection failed."));break;default:R()}}finally{_(ve,`RPC '${e}' ${s} completed.`)}}));const u=JSON.stringify(i);_(ve,`RPC '${e}' ${s} sending request:`,i),c.send(t,"POST",u,r,15)}))}Fo(e,t,r){const i=zo(),s=[this.fo,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=oE(),a=aE(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(c.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Do(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const l=s.join("");_(ve,`Creating RPC '${e}' stream ${i}: ${l}`,c);const h=o.createWebChannel(l,c);let d=!1,f=!1;const I=new dw({lo:y=>{f?_(ve,`Not sending because RPC '${e}' stream ${i} is closed:`,y):(d||(_(ve,`Opening RPC '${e}' stream ${i} transport.`),h.open(),d=!0),_(ve,`RPC '${e}' stream ${i} sending:`,y),h.send(y))},ho:()=>h.close()}),E=(y,P,C)=>{y.listen(P,(A=>{try{C(A)}catch(D){setTimeout((()=>{throw D}),0)}}))};return E(h,Yi.EventType.OPEN,(()=>{f||_(ve,`RPC '${e}' stream ${i} transport opened.`)})),E(h,Yi.EventType.CLOSE,(()=>{f||(f=!0,_(ve,`RPC '${e}' stream ${i} transport closed`),I.Vo())})),E(h,Yi.EventType.ERROR,(y=>{f||(f=!0,xe(ve,`RPC '${e}' stream ${i} transport errored:`,y),I.Vo(new g(m.UNAVAILABLE,"The operation could not be completed")))})),E(h,Yi.EventType.MESSAGE,(y=>{var P;if(!f){const C=y.data[0];S(!!C);const A=C,D=A.error||((P=A[0])===null||P===void 0?void 0:P.error);if(D){_(ve,`RPC '${e}' stream ${i} received error:`,D);const $=D.status;let O=(function(Rr){const ji=ce[Rr];if(ji!==void 0)return Gf(ji)})($),Z=D.message;O===void 0&&(O=m.INTERNAL,Z="Unknown error status: "+$+" with message "+D.message),f=!0,I.Vo(new g(O,Z)),h.close()}else _(ve,`RPC '${e}' stream ${i} received:`,C),I.mo(C)}})),E(a,uE.STAT_EVENT,(y=>{y.stat===Ju.PROXY?_(ve,`RPC '${e}' stream ${i} detected buffering proxy`):y.stat===Ju.NOPROXY&&_(ve,`RPC '${e}' stream ${i} detected no buffering proxy`)})),setTimeout((()=>{I.Ro()}),0),I}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rp(){return typeof window<"u"?window:null}function ms(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mi(n){return new vT(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xc{constructor(e,t,r=1e3,i=1.5,s=6e4){this.oi=e,this.timerId=t,this.Mo=r,this.xo=i,this.Oo=s,this.No=0,this.Bo=null,this.Lo=Date.now(),this.reset()}reset(){this.No=0}ko(){this.No=this.Oo}qo(e){this.cancel();const t=Math.floor(this.No+this.Qo()),r=Math.max(0,Date.now()-this.Lo),i=Math.max(0,t-r);i>0&&_("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.No} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.Bo=this.oi.enqueueAfterDelay(this.timerId,i,(()=>(this.Lo=Date.now(),e()))),this.No*=this.xo,this.No<this.Mo&&(this.No=this.Mo),this.No>this.Oo&&(this.No=this.Oo)}Ko(){this.Bo!==null&&(this.Bo.skipDelay(),this.Bo=null)}cancel(){this.Bo!==null&&(this.Bo.cancel(),this.Bo=null)}Qo(){return(Math.random()-.5)*this.No}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pp{constructor(e,t,r,i,s,o,a,c){this.oi=e,this.$o=r,this.Uo=i,this.connection=s,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=a,this.listener=c,this.state=0,this.Wo=0,this.Go=null,this.zo=null,this.stream=null,this.jo=new xc(e,t)}Ho(){return this.state===1||this.state===5||this.Jo()}Jo(){return this.state===2||this.state===3}start(){this.state!==4?this.auth():this.Yo()}async stop(){this.Ho()&&await this.close(0)}Zo(){this.state=0,this.jo.reset()}Xo(){this.Jo()&&this.Go===null&&(this.Go=this.oi.enqueueAfterDelay(this.$o,6e4,(()=>this.e_())))}t_(e){this.n_(),this.stream.send(e)}async e_(){if(this.Jo())return this.close(0)}n_(){this.Go&&(this.Go.cancel(),this.Go=null)}r_(){this.zo&&(this.zo.cancel(),this.zo=null)}async close(e,t){this.n_(),this.r_(),this.jo.cancel(),this.Wo++,e!==4?this.jo.reset():t&&t.code===m.RESOURCE_EXHAUSTED?(oe(t.toString()),oe("Using maximum backoff delay to prevent overloading the backend."),this.jo.ko()):t&&t.code===m.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.i_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.To(t)}i_(){}auth(){this.state=1;const e=this.s_(this.Wo),t=this.Wo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([r,i])=>{this.Wo===t&&this.o_(r,i)}),(r=>{e((()=>{const i=new g(m.UNKNOWN,"Fetching auth token failed: "+r.message);return this.__(i)}))}))}o_(e,t){const r=this.s_(this.Wo);this.stream=this.a_(e,t),this.stream.Po((()=>{r((()=>(this.state=2,this.zo=this.oi.enqueueAfterDelay(this.Uo,1e4,(()=>(this.Jo()&&(this.state=3),Promise.resolve()))),this.listener.Po())))})),this.stream.To((i=>{r((()=>this.__(i)))})),this.stream.onMessage((i=>{r((()=>this.onMessage(i)))}))}Yo(){this.state=5,this.jo.qo((async()=>{this.state=0,this.start()}))}__(e){return _("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}s_(e){return t=>{this.oi.enqueueAndForget((()=>this.Wo===e?t():(_("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class pw extends Pp{constructor(e,t,r,i,s,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,i,o),this.serializer=s}a_(e,t){return this.connection.Fo("Listen",e,t)}onMessage(e){this.jo.reset();const t=PT(this.serializer,e),r=(function(s){if(!("targetChange"in s))return b.min();const o=s.targetChange;return o.targetIds&&o.targetIds.length?b.min():o.readTime?ae(o.readTime):b.min()})(e);return this.listener.u_(t,r)}c_(e){const t={};t.database=Ia(this.serializer),t.addTarget=(function(s,o){let a;const c=o.target;if(a=Cs(c)?{documents:Zf(s,c)}:{query:Ac(s,c).ut},a.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){a.resumeToken=Hf(s,o.resumeToken);const u=_a(s,o.expectedCount);u!==null&&(a.expectedCount=u)}else if(o.snapshotVersion.compareTo(b.min())>0){a.readTime=er(s,o.snapshotVersion.toTimestamp());const u=_a(s,o.expectedCount);u!==null&&(a.expectedCount=u)}return a})(this.serializer,e);const r=bT(this.serializer,e);r&&(t.labels=r),this.t_(t)}l_(e){const t={};t.database=Ia(this.serializer),t.removeTarget=e,this.t_(t)}}class mw extends Pp{constructor(e,t,r,i,s,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,i,o),this.serializer=s,this.h_=!1}get P_(){return this.h_}start(){this.h_=!1,this.lastStreamToken=void 0,super.start()}i_(){this.h_&&this.I_([])}a_(e,t){return this.connection.Fo("Write",e,t)}onMessage(e){if(S(!!e.streamToken),this.lastStreamToken=e.streamToken,this.h_){this.jo.reset();const t=ST(e.writeResults,e.commitTime),r=ae(e.commitTime);return this.listener.T_(r,t)}return S(!e.writeResults||e.writeResults.length===0),this.h_=!0,this.listener.E_()}d_(){const e={};e.database=Ia(this.serializer),this.t_(e)}I_(e){const t={streamToken:this.lastStreamToken,writes:e.map((r=>mi(this.serializer,r)))};this.t_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gw extends class{}{constructor(e,t,r,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=i,this.A_=!1}R_(){if(this.A_)throw new g(m.FAILED_PRECONDITION,"The client has already been terminated.")}So(e,t,r,i){return this.R_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([s,o])=>this.connection.So(e,ya(t,r),i,s,o))).catch((s=>{throw s.name==="FirebaseError"?(s.code===m.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new g(m.UNKNOWN,s.toString())}))}vo(e,t,r,i,s){return this.R_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([o,a])=>this.connection.vo(e,ya(t,r),i,o,a,s))).catch((o=>{throw o.name==="FirebaseError"?(o.code===m.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new g(m.UNKNOWN,o.toString())}))}terminate(){this.A_=!0,this.connection.terminate()}}async function _w(n,e,t){var r;const i=T(n),{request:s,V_:o,parent:a}=(function(h,d,f){const{ut:I,parent:E}=Ac(h,d),y={},P=[];let C=0;return f.forEach((A=>{const D="aggregate_"+C++;y[D]=A.alias,A.aggregateType==="count"?P.push({alias:D,count:{}}):A.aggregateType==="avg"?P.push({alias:D,avg:{field:Tt(A.fieldPath)}}):A.aggregateType==="sum"&&P.push({alias:D,sum:{field:Tt(A.fieldPath)}})})),{request:{structuredAggregationQuery:{aggregations:P,structuredQuery:I.structuredQuery},parent:I.parent},V_:y,parent:E}})(i.serializer,(function(h){const d=T(h);return d.Pe||(d.Pe=Pf(d,h.explicitOrderBy)),d.Pe})(e),t);i.connection.wo||delete s.parent;const c=(await i.vo("RunAggregationQuery",i.serializer.databaseId,a,s,1)).filter((l=>!!l.result));S(c.length===1);const u=(r=c[0].result)===null||r===void 0?void 0:r.aggregateFields;return Object.keys(u).reduce(((l,h)=>(l[o[h]]=u[h],l)),{})}class yw{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.m_=0,this.f_=null,this.g_=!0}p_(){this.m_===0&&(this.y_("Unknown"),this.f_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.f_=null,this.w_("Backend didn't respond within 10 seconds."),this.y_("Offline"),Promise.resolve()))))}S_(e){this.state==="Online"?this.y_("Unknown"):(this.m_++,this.m_>=1&&(this.b_(),this.w_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.y_("Offline")))}set(e){this.b_(),this.m_=0,e==="Online"&&(this.g_=!1),this.y_(e)}y_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}w_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.g_?(oe(t),this.g_=!1):_("OnlineStateTracker",t)}b_(){this.f_!==null&&(this.f_.cancel(),this.f_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Iw{constructor(e,t,r,i,s){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.D_=[],this.C_=new Map,this.v_=new Set,this.F_=[],this.M_=s,this.M_.io((o=>{r.enqueueAndForget((async()=>{zt(this)&&(_("RemoteStore","Restarting streams for network reachability change."),await(async function(c){const u=T(c);u.v_.add(4),await gr(u),u.x_.set("Unknown"),u.v_.delete(4),await Fi(u)})(this))}))})),this.x_=new yw(r,i)}}async function Fi(n){if(zt(n))for(const e of n.F_)await e(!0)}async function gr(n){for(const e of n.F_)await e(!1)}function Io(n,e){const t=T(n);t.C_.has(e.targetId)||(t.C_.set(e.targetId,e),Mc(t)?Lc(t):yr(t).Jo()&&Oc(t,e))}function gi(n,e){const t=T(n),r=yr(t);t.C_.delete(e),r.Jo()&&Sp(t,e),t.C_.size===0&&(r.Jo()?r.Xo():zt(t)&&t.x_.set("Unknown"))}function Oc(n,e){if(n.O_.Oe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(b.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}yr(n).c_(e)}function Sp(n,e){n.O_.Oe(e),yr(n).l_(e)}function Lc(n){n.O_=new IT({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),_t:e=>n.C_.get(e)||null,nt:()=>n.datastore.serializer.databaseId}),yr(n).start(),n.x_.p_()}function Mc(n){return zt(n)&&!yr(n).Ho()&&n.C_.size>0}function zt(n){return T(n).v_.size===0}function bp(n){n.O_=void 0}async function Ew(n){n.C_.forEach(((e,t)=>{Oc(n,e)}))}async function Tw(n,e){bp(n),Mc(n)?(n.x_.S_(e),Lc(n)):n.x_.set("Unknown")}async function ww(n,e,t){if(n.x_.set("Online"),e instanceof Kf&&e.state===2&&e.cause)try{await(async function(i,s){const o=s.cause;for(const a of s.targetIds)i.C_.has(a)&&(await i.remoteSyncer.rejectListen(a,o),i.C_.delete(a),i.O_.removeTarget(a))})(n,e)}catch(r){_("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Bs(n,r)}else if(e instanceof ps?n.O_.$e(e):e instanceof zf?n.O_.Je(e):n.O_.Ge(e),!t.isEqual(b.min()))try{const r=await Ip(n.localStore);t.compareTo(r)>=0&&await(function(s,o){const a=s.O_.it(o);return a.targetChanges.forEach(((c,u)=>{if(c.resumeToken.approximateByteSize()>0){const l=s.C_.get(u);l&&s.C_.set(u,l.withResumeToken(c.resumeToken,o))}})),a.targetMismatches.forEach(((c,u)=>{const l=s.C_.get(c);if(!l)return;s.C_.set(c,l.withResumeToken(le.EMPTY_BYTE_STRING,l.snapshotVersion)),Sp(s,c);const h=new it(l.target,c,u,l.sequenceNumber);Oc(s,h)})),s.remoteSyncer.applyRemoteEvent(a)})(n,t)}catch(r){_("RemoteStore","Failed to raise snapshot:",r),await Bs(n,r)}}async function Bs(n,e,t){if(!Gt(e))throw e;n.v_.add(1),await gr(n),n.x_.set("Offline"),t||(t=()=>Ip(n.localStore)),n.asyncQueue.enqueueRetryable((async()=>{_("RemoteStore","Retrying IndexedDB access"),await t(),n.v_.delete(1),await Fi(n)}))}function Cp(n,e){return e().catch((t=>Bs(n,t,e)))}async function _r(n){const e=T(n),t=Mt(e);let r=e.D_.length>0?e.D_[e.D_.length-1].batchId:-1;for(;vw(e);)try{const i=await aw(e.localStore,r);if(i===null){e.D_.length===0&&t.Xo();break}r=i.batchId,Aw(e,i)}catch(i){await Bs(e,i)}Dp(e)&&Vp(e)}function vw(n){return zt(n)&&n.D_.length<10}function Aw(n,e){n.D_.push(e);const t=Mt(n);t.Jo()&&t.P_&&t.I_(e.mutations)}function Dp(n){return zt(n)&&!Mt(n).Ho()&&n.D_.length>0}function Vp(n){Mt(n).start()}async function Rw(n){Mt(n).d_()}async function Pw(n){const e=Mt(n);for(const t of n.D_)e.I_(t.mutations)}async function Sw(n,e,t){const r=n.D_.shift(),i=Ec.from(r,e,t);await Cp(n,(()=>n.remoteSyncer.applySuccessfulWrite(i))),await _r(n)}async function bw(n,e){e&&Mt(n).P_&&await(async function(r,i){if((function(o){return $f(o)&&o!==m.ABORTED})(i.code)){const s=r.D_.shift();Mt(r).Zo(),await Cp(r,(()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i))),await _r(r)}})(n,e),Dp(n)&&Vp(n)}async function zl(n,e){const t=T(n);t.asyncQueue.verifyOperationInProgress(),_("RemoteStore","RemoteStore received new credentials");const r=zt(t);t.v_.add(3),await gr(t),r&&t.x_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.v_.delete(3),await Fi(t)}async function Ra(n,e){const t=T(n);e?(t.v_.delete(2),await Fi(t)):e||(t.v_.add(2),await gr(t),t.x_.set("Unknown"))}function yr(n){return n.N_||(n.N_=(function(t,r,i){const s=T(t);return s.R_(),new pw(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)})(n.datastore,n.asyncQueue,{Po:Ew.bind(null,n),To:Tw.bind(null,n),u_:ww.bind(null,n)}),n.F_.push((async e=>{e?(n.N_.Zo(),Mc(n)?Lc(n):n.x_.set("Unknown")):(await n.N_.stop(),bp(n))}))),n.N_}function Mt(n){return n.B_||(n.B_=(function(t,r,i){const s=T(t);return s.R_(),new mw(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)})(n.datastore,n.asyncQueue,{Po:Rw.bind(null,n),To:bw.bind(null,n),E_:Pw.bind(null,n),T_:Sw.bind(null,n)}),n.F_.push((async e=>{e?(n.B_.Zo(),await _r(n)):(await n.B_.stop(),n.D_.length>0&&(_("RemoteStore",`Stopping write stream with ${n.D_.length} pending writes`),n.D_=[]))}))),n.B_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fc{constructor(e,t,r,i,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new he,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((o=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,i,s){const o=Date.now()+r,a=new Fc(e,t,o,i,s);return a.start(r),a}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new g(m.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Ir(n,e){if(oe("AsyncQueue",`${e}: ${n}`),Gt(n))return new g(m.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jn{constructor(e){this.comparator=e?(t,r)=>e(t,r)||w.comparator(t.key,r.key):(t,r)=>w.comparator(t.key,r.key),this.keyedMap=Fr(),this.sortedSet=new H(this.comparator)}static emptySet(e){return new jn(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,r)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof jn)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new jn;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kl{constructor(){this.L_=new H(w.comparator)}track(e){const t=e.doc.key,r=this.L_.get(t);r?e.type!==0&&r.type===3?this.L_=this.L_.insert(t,e):e.type===3&&r.type!==1?this.L_=this.L_.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.L_=this.L_.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.L_=this.L_.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.L_=this.L_.remove(t):e.type===1&&r.type===2?this.L_=this.L_.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.L_=this.L_.insert(t,{type:2,doc:e.doc}):R():this.L_=this.L_.insert(t,e)}k_(){const e=[];return this.L_.inorderTraversal(((t,r)=>{e.push(r)})),e}}class rr{constructor(e,t,r,i,s,o,a,c,u){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=o,this.syncStateChanged=a,this.excludesMetadataChanges=c,this.hasCachedResults=u}static fromInitialDocuments(e,t,r,i,s){const o=[];return t.forEach((a=>{o.push({type:0,doc:a})})),new rr(e,t,jn.emptySet(t),o,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&ki(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==r[i].type||!t[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cw{constructor(){this.q_=void 0,this.Q_=[]}}class Dw{constructor(){this.queries=new ht((e=>Sf(e)),ki),this.onlineState="Unknown",this.K_=new Set}}async function Uc(n,e){const t=T(n),r=e.query;let i=!1,s=t.queries.get(r);if(s||(i=!0,s=new Cw),i)try{s.q_=await t.onListen(r)}catch(o){const a=Ir(o,`Initialization of query '${On(e.query)}' failed`);return void e.onError(a)}t.queries.set(r,s),s.Q_.push(e),e.U_(t.onlineState),s.q_&&e.W_(s.q_)&&qc(t)}async function Bc(n,e){const t=T(n),r=e.query;let i=!1;const s=t.queries.get(r);if(s){const o=s.Q_.indexOf(e);o>=0&&(s.Q_.splice(o,1),i=s.Q_.length===0)}if(i)return t.queries.delete(r),t.onUnlisten(r)}function Vw(n,e){const t=T(n);let r=!1;for(const i of e){const s=i.query,o=t.queries.get(s);if(o){for(const a of o.Q_)a.W_(i)&&(r=!0);o.q_=i}}r&&qc(t)}function kw(n,e,t){const r=T(n),i=r.queries.get(e);if(i)for(const s of i.Q_)s.onError(t);r.queries.delete(e)}function qc(n){n.K_.forEach((e=>{e.next()}))}class $c{constructor(e,t,r){this.query=e,this.G_=t,this.z_=!1,this.j_=null,this.onlineState="Unknown",this.options=r||{}}W_(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new rr(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.z_?this.H_(e)&&(this.G_.next(e),t=!0):this.J_(e,this.onlineState)&&(this.Y_(e),t=!0),this.j_=e,t}onError(e){this.G_.error(e)}U_(e){this.onlineState=e;let t=!1;return this.j_&&!this.z_&&this.J_(this.j_,e)&&(this.Y_(this.j_),t=!0),t}J_(e,t){if(!e.fromCache)return!0;const r=t!=="Offline";return(!this.options.Z_||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}H_(e){if(e.docChanges.length>0)return!0;const t=this.j_&&this.j_.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Y_(e){e=rr.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.z_=!0,this.G_.next(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nw{constructor(e,t){this.X_=e,this.byteLength=t}ea(){return"metadata"in this.X_}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hl{constructor(e){this.serializer=e}Ps(e){return Ze(this.serializer,e)}Is(e){return e.metadata.exists?Xf(this.serializer,e.document,!1):Q.newNoDocument(this.Ps(e.metadata.name),this.Ts(e.metadata.readTime))}Ts(e){return ae(e)}}class xw{constructor(e,t,r){this.ta=e,this.localStore=t,this.serializer=r,this.queries=[],this.documents=[],this.collectionGroups=new Set,this.progress=kp(e)}na(e){this.progress.bytesLoaded+=e.byteLength;let t=this.progress.documentsLoaded;if(e.X_.namedQuery)this.queries.push(e.X_.namedQuery);else if(e.X_.documentMetadata){this.documents.push({metadata:e.X_.documentMetadata}),e.X_.documentMetadata.exists||++t;const r=U.fromString(e.X_.documentMetadata.name);this.collectionGroups.add(r.get(r.length-2))}else e.X_.document&&(this.documents[this.documents.length-1].document=e.X_.document,++t);return t!==this.progress.documentsLoaded?(this.progress.documentsLoaded=t,Object.assign({},this.progress)):null}ra(e){const t=new Map,r=new Hl(this.serializer);for(const i of e)if(i.metadata.queries){const s=r.Ps(i.metadata.name);for(const o of i.metadata.queries){const a=(t.get(o)||x()).add(s);t.set(o,a)}}return t}async complete(){const e=await cw(this.localStore,new Hl(this.serializer),this.documents,this.ta.id),t=this.ra(this.documents);for(const r of this.queries)await uw(this.localStore,r,t.get(r.name));return this.progress.taskState="Success",{progress:this.progress,ia:this.collectionGroups,sa:e}}}function kp(n){return{taskState:"Running",documentsLoaded:0,bytesLoaded:0,totalDocuments:n.totalDocuments,totalBytes:n.totalBytes}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Np{constructor(e){this.key=e}}class xp{constructor(e){this.key=e}}class Op{constructor(e,t){this.query=e,this.oa=t,this._a=null,this.hasCachedResults=!1,this.current=!1,this.aa=x(),this.mutatedKeys=x(),this.ua=Cf(e),this.ca=new jn(this.ua)}get la(){return this.oa}ha(e,t){const r=t?t.Pa:new Kl,i=t?t.ca:this.ca;let s=t?t.mutatedKeys:this.mutatedKeys,o=i,a=!1;const c=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,u=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal(((l,h)=>{const d=i.get(l),f=Ni(this.query,h)?h:null,I=!!d&&this.mutatedKeys.has(d.key),E=!!f&&(f.hasLocalMutations||this.mutatedKeys.has(f.key)&&f.hasCommittedMutations);let y=!1;d&&f?d.data.isEqual(f.data)?I!==E&&(r.track({type:3,doc:f}),y=!0):this.Ia(d,f)||(r.track({type:2,doc:f}),y=!0,(c&&this.ua(f,c)>0||u&&this.ua(f,u)<0)&&(a=!0)):!d&&f?(r.track({type:0,doc:f}),y=!0):d&&!f&&(r.track({type:1,doc:d}),y=!0,(c||u)&&(a=!0)),y&&(f?(o=o.add(f),s=E?s.add(l):s.delete(l)):(o=o.delete(l),s=s.delete(l)))})),this.query.limit!==null)for(;o.size>this.query.limit;){const l=this.query.limitType==="F"?o.last():o.first();o=o.delete(l.key),s=s.delete(l.key),r.track({type:1,doc:l})}return{ca:o,Pa:r,Xi:a,mutatedKeys:s}}Ia(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,i){const s=this.ca;this.ca=e.ca,this.mutatedKeys=e.mutatedKeys;const o=e.Pa.k_();o.sort(((l,h)=>(function(f,I){const E=y=>{switch(y){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return R()}};return E(f)-E(I)})(l.type,h.type)||this.ua(l.doc,h.doc))),this.Ta(r),i=i!=null&&i;const a=t&&!i?this.Ea():[],c=this.aa.size===0&&this.current&&!i?1:0,u=c!==this._a;return this._a=c,o.length!==0||u?{snapshot:new rr(this.query,e.ca,s,o,e.mutatedKeys,c===0,u,!1,!!r&&r.resumeToken.approximateByteSize()>0),da:a}:{da:a}}U_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({ca:this.ca,Pa:new Kl,mutatedKeys:this.mutatedKeys,Xi:!1},!1)):{da:[]}}Aa(e){return!this.oa.has(e)&&!!this.ca.has(e)&&!this.ca.get(e).hasLocalMutations}Ta(e){e&&(e.addedDocuments.forEach((t=>this.oa=this.oa.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.oa=this.oa.delete(t))),this.current=e.current)}Ea(){if(!this.current)return[];const e=this.aa;this.aa=x(),this.ca.forEach((r=>{this.Aa(r.key)&&(this.aa=this.aa.add(r.key))}));const t=[];return e.forEach((r=>{this.aa.has(r)||t.push(new xp(r))})),this.aa.forEach((r=>{e.has(r)||t.push(new Np(r))})),t}Ra(e){this.oa=e.hs,this.aa=x();const t=this.ha(e.documents);return this.applyChanges(t,!0)}Va(){return rr.fromInitialDocuments(this.query,this.ca,this.mutatedKeys,this._a===0,this.hasCachedResults)}}class Ow{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class Lw{constructor(e){this.key=e,this.ma=!1}}class Mw{constructor(e,t,r,i,s,o){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=o,this.fa={},this.ga=new ht((a=>Sf(a)),ki),this.pa=new Map,this.ya=new Set,this.wa=new H(w.comparator),this.Sa=new Map,this.ba=new bc,this.Da={},this.Ca=new Map,this.va=En.Bn(),this.onlineState="Unknown",this.Fa=void 0}get isPrimaryClient(){return this.Fa===!0}}async function Fw(n,e){const t=Hc(n);let r,i;const s=t.ga.get(e);if(s)r=s.targetId,t.sharedClientState.addLocalQueryTarget(r),i=s.view.Va();else{const o=await tr(t.localStore,De(e)),a=t.sharedClientState.addLocalQueryTarget(o.targetId);r=o.targetId,i=await Gc(t,e,r,a==="current",o.resumeToken),t.isPrimaryClient&&Io(t.remoteStore,o)}return i}async function Gc(n,e,t,r,i){n.Ma=(h,d,f)=>(async function(E,y,P,C){let A=y.view.ha(P);A.Xi&&(A=await Ms(E.localStore,y.query,!1).then((({documents:Z})=>y.view.ha(Z,A))));const D=C&&C.targetChanges.get(y.targetId),$=C&&C.targetMismatches.get(y.targetId)!=null,O=y.view.applyChanges(A,E.isPrimaryClient,D,$);return Pa(E,y.targetId,O.da),O.snapshot})(n,h,d,f);const s=await Ms(n.localStore,e,!0),o=new Op(e,s.hs),a=o.ha(s.documents),c=Li.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",i),u=o.applyChanges(a,n.isPrimaryClient,c);Pa(n,t,u.da);const l=new Ow(e,t,o);return n.ga.set(e,l),n.pa.has(t)?n.pa.get(t).push(e):n.pa.set(t,[e]),u.snapshot}async function Uw(n,e){const t=T(n),r=t.ga.get(e),i=t.pa.get(r.targetId);if(i.length>1)return t.pa.set(r.targetId,i.filter((s=>!ki(s,e)))),void t.ga.delete(e);t.isPrimaryClient?(t.sharedClientState.removeLocalQueryTarget(r.targetId),t.sharedClientState.isActiveQueryTarget(r.targetId)||await nr(t.localStore,r.targetId,!1).then((()=>{t.sharedClientState.clearQueryState(r.targetId),gi(t.remoteStore,r.targetId),ir(t,r.targetId)})).catch($t)):(ir(t,r.targetId),await nr(t.localStore,r.targetId,!0))}async function Bw(n,e,t){const r=Wc(n);try{const i=await(function(o,a){const c=T(o),u=X.now(),l=a.reduce(((f,I)=>f.add(I.key)),x());let h,d;return c.persistence.runTransaction("Locally write mutations","readwrite",(f=>{let I=Ne(),E=x();return c.os.getEntries(f,l).next((y=>{I=y,I.forEach(((P,C)=>{C.isValidDocument()||(E=E.add(P))}))})).next((()=>c.localDocuments.getOverlayedDocuments(f,I))).next((y=>{h=y;const P=[];for(const C of a){const A=mT(C,h.get(C.key).overlayedDocument);A!=null&&P.push(new dt(C.key,A,_f(A.value.mapValue),J.exists(!0)))}return c.mutationQueue.addMutationBatch(f,u,P,a)})).next((y=>{d=y;const P=y.applyToLocalDocumentSet(h,E);return c.documentOverlayCache.saveOverlays(f,y.batchId,P)}))})).then((()=>({batchId:d.batchId,changes:Vf(h)})))})(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),(function(o,a,c){let u=o.Da[o.currentUser.toKey()];u||(u=new H(k)),u=u.insert(a,c),o.Da[o.currentUser.toKey()]=u})(r,i.batchId,t),await ft(r,i.changes),await _r(r.remoteStore)}catch(i){const s=Ir(i,"Failed to persist write");t.reject(s)}}async function Lp(n,e){const t=T(n);try{const r=await ow(t.localStore,e);e.targetChanges.forEach(((i,s)=>{const o=t.Sa.get(s);o&&(S(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1),i.addedDocuments.size>0?o.ma=!0:i.modifiedDocuments.size>0?S(o.ma):i.removedDocuments.size>0&&(S(o.ma),o.ma=!1))})),await ft(t,r,e)}catch(r){await $t(r)}}function Wl(n,e,t){const r=T(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const i=[];r.ga.forEach(((s,o)=>{const a=o.view.U_(e);a.snapshot&&i.push(a.snapshot)})),(function(o,a){const c=T(o);c.onlineState=a;let u=!1;c.queries.forEach(((l,h)=>{for(const d of h.Q_)d.U_(a)&&(u=!0)})),u&&qc(c)})(r.eventManager,e),i.length&&r.fa.u_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function qw(n,e,t){const r=T(n);r.sharedClientState.updateQueryState(e,"rejected",t);const i=r.Sa.get(e),s=i&&i.key;if(s){let o=new H(w.comparator);o=o.insert(s,Q.newNoDocument(s,b.min()));const a=x().add(s),c=new Oi(b.min(),new Map,new H(k),o,a);await Lp(r,c),r.wa=r.wa.remove(s),r.Sa.delete(e),Kc(r)}else await nr(r.localStore,e,!1).then((()=>ir(r,e,t))).catch($t)}async function $w(n,e){const t=T(n),r=e.batch.batchId;try{const i=await sw(t.localStore,e);zc(t,r,null),jc(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await ft(t,i)}catch(i){await $t(i)}}async function Gw(n,e,t){const r=T(n);try{const i=await(function(o,a){const c=T(o);return c.persistence.runTransaction("Reject batch","readwrite-primary",(u=>{let l;return c.mutationQueue.lookupMutationBatch(u,a).next((h=>(S(h!==null),l=h.keys(),c.mutationQueue.removeMutationBatch(u,h)))).next((()=>c.mutationQueue.performConsistencyCheck(u))).next((()=>c.documentOverlayCache.removeOverlaysForBatchId(u,l,a))).next((()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(u,l))).next((()=>c.localDocuments.getDocuments(u,l)))}))})(r.localStore,e);zc(r,e,t),jc(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await ft(r,i)}catch(i){await $t(i)}}async function jw(n,e){const t=T(n);zt(t.remoteStore)||_("SyncEngine","The network is disabled. The task returned by 'awaitPendingWrites()' will not complete until the network is enabled.");try{const r=await(function(o){const a=T(o);return a.persistence.runTransaction("Get highest unacknowledged batch id","readonly",(c=>a.mutationQueue.getHighestUnacknowledgedBatchId(c)))})(t.localStore);if(r===-1)return void e.resolve();const i=t.Ca.get(r)||[];i.push(e),t.Ca.set(r,i)}catch(r){const i=Ir(r,"Initialization of waitForPendingWrites() operation failed");e.reject(i)}}function jc(n,e){(n.Ca.get(e)||[]).forEach((t=>{t.resolve()})),n.Ca.delete(e)}function zc(n,e,t){const r=T(n);let i=r.Da[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(t?s.reject(t):s.resolve(),i=i.remove(e)),r.Da[r.currentUser.toKey()]=i}}function ir(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.pa.get(e))n.ga.delete(r),t&&n.fa.xa(r,t);n.pa.delete(e),n.isPrimaryClient&&n.ba.Vr(e).forEach((r=>{n.ba.containsKey(r)||Mp(n,r)}))}function Mp(n,e){n.ya.delete(e.path.canonicalString());const t=n.wa.get(e);t!==null&&(gi(n.remoteStore,t),n.wa=n.wa.remove(e),n.Sa.delete(t),Kc(n))}function Pa(n,e,t){for(const r of t)r instanceof Np?(n.ba.addReference(r.key,e),zw(n,r)):r instanceof xp?(_("SyncEngine","Document no longer in limbo: "+r.key),n.ba.removeReference(r.key,e),n.ba.containsKey(r.key)||Mp(n,r.key)):R()}function zw(n,e){const t=e.key,r=t.path.canonicalString();n.wa.get(t)||n.ya.has(r)||(_("SyncEngine","New document in limbo: "+t),n.ya.add(r),Kc(n))}function Kc(n){for(;n.ya.size>0&&n.wa.size<n.maxConcurrentLimboResolutions;){const e=n.ya.values().next().value;n.ya.delete(e);const t=new w(U.fromString(e)),r=n.va.next();n.Sa.set(r,new Lw(t)),n.wa=n.wa.insert(t,r),Io(n.remoteStore,new it(De(fr(t.path)),r,"TargetPurposeLimboResolution",Ve._e))}}async function ft(n,e,t){const r=T(n),i=[],s=[],o=[];r.ga.isEmpty()||(r.ga.forEach(((a,c)=>{o.push(r.Ma(c,e,t).then((u=>{if((u||t)&&r.isPrimaryClient&&r.sharedClientState.updateQueryState(c.targetId,u!=null&&u.fromCache?"not-current":"current"),u){i.push(u);const l=kc.Ki(c.targetId,u);s.push(l)}})))})),await Promise.all(o),r.fa.u_(i),await(async function(c,u){const l=T(c);try{await l.persistence.runTransaction("notifyLocalViewChanges","readwrite",(h=>p.forEach(u,(d=>p.forEach(d.qi,(f=>l.persistence.referenceDelegate.addReference(h,d.targetId,f))).next((()=>p.forEach(d.Qi,(f=>l.persistence.referenceDelegate.removeReference(h,d.targetId,f)))))))))}catch(h){if(!Gt(h))throw h;_("LocalStore","Failed to update sequence numbers: "+h)}for(const h of u){const d=h.targetId;if(!h.fromCache){const f=l.ns.get(d),I=f.snapshotVersion,E=f.withLastLimboFreeSnapshotVersion(I);l.ns=l.ns.insert(d,E)}}})(r.localStore,s))}async function Kw(n,e){const t=T(n);if(!t.currentUser.isEqual(e)){_("SyncEngine","User change. New user:",e.toKey());const r=await yp(t.localStore,e);t.currentUser=e,(function(s,o){s.Ca.forEach((a=>{a.forEach((c=>{c.reject(new g(m.CANCELLED,o))}))})),s.Ca.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await ft(t,r.us)}}function Hw(n,e){const t=T(n),r=t.Sa.get(e);if(r&&r.ma)return x().add(r.key);{let i=x();const s=t.pa.get(e);if(!s)return i;for(const o of s){const a=t.ga.get(o);i=i.unionWith(a.view.la)}return i}}async function Ww(n,e){const t=T(n),r=await Ms(t.localStore,e.query,!0),i=e.view.Ra(r);return t.isPrimaryClient&&Pa(t,e.targetId,i.da),i}async function Qw(n,e){const t=T(n);return wp(t.localStore,e).then((r=>ft(t,r)))}async function Yw(n,e,t,r){const i=T(n),s=await(function(a,c){const u=T(a),l=T(u.mutationQueue);return u.persistence.runTransaction("Lookup mutation documents","readonly",(h=>l.vn(h,c).next((d=>d?u.localDocuments.getDocuments(h,d):p.resolve(null)))))})(i.localStore,e);s!==null?(t==="pending"?await _r(i.remoteStore):t==="acknowledged"||t==="rejected"?(zc(i,e,r||null),jc(i,e),(function(a,c){T(T(a).mutationQueue).Mn(c)})(i.localStore,e)):R(),await ft(i,s)):_("SyncEngine","Cannot apply mutation batch with id: "+e)}async function Jw(n,e){const t=T(n);if(Hc(t),Wc(t),e===!0&&t.Fa!==!0){const r=t.sharedClientState.getAllActiveQueryTargets(),i=await Ql(t,r.toArray());t.Fa=!0,await Ra(t.remoteStore,!0);for(const s of i)Io(t.remoteStore,s)}else if(e===!1&&t.Fa!==!1){const r=[];let i=Promise.resolve();t.pa.forEach(((s,o)=>{t.sharedClientState.isLocalQueryTarget(o)?r.push(o):i=i.then((()=>(ir(t,o),nr(t.localStore,o,!0)))),gi(t.remoteStore,o)})),await i,await Ql(t,r),(function(o){const a=T(o);a.Sa.forEach(((c,u)=>{gi(a.remoteStore,u)})),a.ba.mr(),a.Sa=new Map,a.wa=new H(w.comparator)})(t),t.Fa=!1,await Ra(t.remoteStore,!1)}}async function Ql(n,e,t){const r=T(n),i=[],s=[];for(const o of e){let a;const c=r.pa.get(o);if(c&&c.length!==0){a=await tr(r.localStore,De(c[0]));for(const u of c){const l=r.ga.get(u),h=await Ww(r,l);h.snapshot&&s.push(h.snapshot)}}else{const u=await Tp(r.localStore,o);a=await tr(r.localStore,u),await Gc(r,Fp(u),o,!1,a.resumeToken)}i.push(a)}return r.fa.u_(s),i}function Fp(n){return Rf(n.path,n.collectionGroup,n.orderBy,n.filters,n.limit,"F",n.startAt,n.endAt)}function Xw(n){return(function(t){return T(T(t).persistence).Li()})(T(n).localStore)}async function Zw(n,e,t,r){const i=T(n);if(i.Fa)return void _("SyncEngine","Ignoring unexpected query state notification.");const s=i.pa.get(e);if(s&&s.length>0)switch(t){case"current":case"not-current":{const o=await wp(i.localStore,bf(s[0])),a=Oi.createSynthesizedRemoteEventForCurrentChange(e,t==="current",le.EMPTY_BYTE_STRING);await ft(i,o,a);break}case"rejected":await nr(i.localStore,e,!0),ir(i,e,r);break;default:R()}}async function ev(n,e,t){const r=Hc(n);if(r.Fa){for(const i of e){if(r.pa.has(i)){_("SyncEngine","Adding an already active target "+i);continue}const s=await Tp(r.localStore,i),o=await tr(r.localStore,s);await Gc(r,Fp(s),o.targetId,!1,o.resumeToken),Io(r.remoteStore,o)}for(const i of t)r.pa.has(i)&&await nr(r.localStore,i,!1).then((()=>{gi(r.remoteStore,i),ir(r,i)})).catch($t)}}function Hc(n){const e=T(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Lp.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=Hw.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=qw.bind(null,e),e.fa.u_=Vw.bind(null,e.eventManager),e.fa.xa=kw.bind(null,e.eventManager),e}function Wc(n){const e=T(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=$w.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=Gw.bind(null,e),e}function tv(n,e,t){const r=T(n);(async function(s,o,a){try{const c=await o.getMetadata();if(await(function(f,I){const E=T(f),y=ae(I.createTime);return E.persistence.runTransaction("hasNewerBundle","readonly",(P=>E.$r.getBundleMetadata(P,I.id))).then((P=>!!P&&P.createTime.compareTo(y)>=0))})(s.localStore,c))return await o.close(),a._completeWith((function(f){return{taskState:"Success",documentsLoaded:f.totalDocuments,bytesLoaded:f.totalBytes,totalDocuments:f.totalDocuments,totalBytes:f.totalBytes}})(c)),Promise.resolve(new Set);a._updateProgress(kp(c));const u=new xw(c,s.localStore,o.serializer);let l=await o.Oa();for(;l;){const d=await u.na(l);d&&a._updateProgress(d),l=await o.Oa()}const h=await u.complete();return await ft(s,h.sa,void 0),await(function(f,I){const E=T(f);return E.persistence.runTransaction("Save bundle","readwrite",(y=>E.$r.saveBundleMetadata(y,I)))})(s.localStore,c),a._completeWith(h.progress),Promise.resolve(h.ia)}catch(c){return xe("SyncEngine",`Loading bundle failed with ${c}`),a._failWith(c),Promise.resolve(new Set)}})(r,e,t).then((i=>{r.sharedClientState.notifyBundleLoaded(i)}))}class sr{constructor(){this.synchronizeTabs=!1}async initialize(e){this.serializer=Mi(e.databaseInfo.databaseId),this.sharedClientState=this.createSharedClientState(e),this.persistence=this.createPersistence(e),await this.persistence.start(),this.localStore=this.createLocalStore(e),this.gcScheduler=this.createGarbageCollectionScheduler(e,this.localStore),this.indexBackfillerScheduler=this.createIndexBackfillerScheduler(e,this.localStore)}createGarbageCollectionScheduler(e,t){return null}createIndexBackfillerScheduler(e,t){return null}createLocalStore(e){return _p(this.persistence,new gp,e.initialUser,this.serializer)}createPersistence(e){return new Cc(yo.Hr,this.serializer)}createSharedClientState(e){return new Ap}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}class nv extends sr{constructor(e){super(),this.cacheSizeBytes=e}createGarbageCollectionScheduler(e,t){S(this.persistence.referenceDelegate instanceof Ls);const r=this.persistence.referenceDelegate.garbageCollector;return new hp(r,e.asyncQueue,t)}createPersistence(e){const t=this.cacheSizeBytes!==void 0?Ae.withCacheSize(this.cacheSizeBytes):Ae.DEFAULT;return new Cc((r=>Ls.Hr(r,t)),this.serializer)}}class Qc extends sr{constructor(e,t,r){super(),this.Na=e,this.cacheSizeBytes=t,this.forceOwnership=r,this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.Na.initialize(this,e),await Wc(this.Na.syncEngine),await _r(this.Na.remoteStore),await this.persistence.fi((()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve())))}createLocalStore(e){return _p(this.persistence,new gp,e.initialUser,this.serializer)}createGarbageCollectionScheduler(e,t){const r=this.persistence.referenceDelegate.garbageCollector;return new hp(r,e.asyncQueue,t)}createIndexBackfillerScheduler(e,t){const r=new SE(t,this.persistence);return new PE(e.asyncQueue,r)}createPersistence(e){const t=Vc(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),r=this.cacheSizeBytes!==void 0?Ae.withCacheSize(this.cacheSizeBytes):Ae.DEFAULT;return new Dc(this.synchronizeTabs,t,e.clientId,r,e.asyncQueue,Rp(),ms(),this.serializer,this.sharedClientState,!!this.forceOwnership)}createSharedClientState(e){return new Ap}}class Up extends Qc{constructor(e,t){super(e,t,!1),this.Na=e,this.cacheSizeBytes=t,this.synchronizeTabs=!0}async initialize(e){await super.initialize(e);const t=this.Na.syncEngine;this.sharedClientState instanceof jo&&(this.sharedClientState.syncEngine={Zs:Yw.bind(null,t),Xs:Zw.bind(null,t),eo:ev.bind(null,t),Li:Xw.bind(null,t),Ys:Qw.bind(null,t)},await this.sharedClientState.start()),await this.persistence.fi((async r=>{await Jw(this.Na.syncEngine,r),this.gcScheduler&&(r&&!this.gcScheduler.started?this.gcScheduler.start():r||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(r&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():r||this.indexBackfillerScheduler.stop())}))}createSharedClientState(e){const t=Rp();if(!jo.D(t))throw new g(m.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const r=Vc(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey);return new jo(t,e.asyncQueue,r,e.clientId,e.initialUser)}}class Er{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Wl(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=Kw.bind(null,this.syncEngine),await Ra(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new Dw})()}createDatastore(e){const t=Mi(e.databaseInfo.databaseId),r=(function(s){return new fw(s)})(e.databaseInfo);return(function(s,o,a,c){return new gw(s,o,a,c)})(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return(function(r,i,s,o,a){return new Iw(r,i,s,o,a)})(this.localStore,this.datastore,e.asyncQueue,(t=>Wl(this.syncEngine,t,0)),(function(){return jl.D()?new jl:new lw})())}createSyncEngine(e,t){return(function(i,s,o,a,c,u,l){const h=new Mw(i,s,o,a,c,u);return l&&(h.Fa=!0),h})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e;await(async function(r){const i=T(r);_("RemoteStore","RemoteStore shutting down."),i.v_.add(5),await gr(i),i.M_.shutdown(),i.x_.set("Unknown")})(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yl(n,e=10240){let t=0;return{async read(){if(t<n.byteLength){const r={value:n.slice(t,t+e),done:!1};return t+=e,r}return{done:!0}},async cancel(){},releaseLock(){},closed:Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eo{constructor(e){this.observer=e,this.muted=!1}next(e){this.observer.next&&this.Ba(this.observer.next,e)}error(e){this.observer.error?this.Ba(this.observer.error,e):oe("Uncaught Error in snapshot listener:",e.toString())}La(){this.muted=!0}Ba(e,t){this.muted||setTimeout((()=>{this.muted||e(t)}),0)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rv{constructor(e,t){this.ka=e,this.serializer=t,this.metadata=new he,this.buffer=new Uint8Array,this.qa=(function(){return new TextDecoder("utf-8")})(),this.Qa().then((r=>{r&&r.ea()?this.metadata.resolve(r.X_.metadata):this.metadata.reject(new Error(`The first element of the bundle is not a metadata, it is
             ${JSON.stringify(r==null?void 0:r.X_)}`))}),(r=>this.metadata.reject(r)))}close(){return this.ka.cancel()}async getMetadata(){return this.metadata.promise}async Oa(){return await this.getMetadata(),this.Qa()}async Qa(){const e=await this.Ka();if(e===null)return null;const t=this.qa.decode(e),r=Number(t);isNaN(r)&&this.$a(`length string (${t}) is not valid number`);const i=await this.Ua(r);return new Nw(JSON.parse(i),e.length+r)}Wa(){return this.buffer.findIndex((e=>e===123))}async Ka(){for(;this.Wa()<0&&!await this.Ga(););if(this.buffer.length===0)return null;const e=this.Wa();e<0&&this.$a("Reached the end of bundle when a length string is expected.");const t=this.buffer.slice(0,e);return this.buffer=this.buffer.slice(e),t}async Ua(e){for(;this.buffer.length<e;)await this.Ga()&&this.$a("Reached the end of bundle when more is expected.");const t=this.qa.decode(this.buffer.slice(0,e));return this.buffer=this.buffer.slice(e),t}$a(e){throw this.ka.cancel(),new Error(`Invalid bundle format: ${e}`)}async Ga(){const e=await this.ka.read();if(!e.done){const t=new Uint8Array(this.buffer.length+e.value.length);t.set(this.buffer),t.set(e.value,this.buffer.length),this.buffer=t}return e.done}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iv{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new g(m.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await(async function(i,s){const o=T(i),a={documents:s.map((h=>pi(o.serializer,h)))},c=await o.vo("BatchGetDocuments",o.serializer.databaseId,U.emptyPath(),a,s.length),u=new Map;c.forEach((h=>{const d=RT(o.serializer,h);u.set(d.key.toString(),d)}));const l=[];return s.forEach((h=>{const d=u.get(h.toString());S(!!d),l.push(d)})),l})(this.datastore,e);return t.forEach((r=>this.recordVersion(r))),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(r){this.lastTransactionError=r}this.writtenDocs.add(e.toString())}delete(e){this.write(new mr(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach((t=>{e.delete(t.key.toString())})),e.forEach(((t,r)=>{const i=w.fromPath(r);this.mutations.push(new yc(i,this.precondition(i)))})),await(async function(r,i){const s=T(r),o={writes:i.map((a=>mi(s.serializer,a)))};await s.So("Commit",s.serializer.databaseId,U.emptyPath(),o)})(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw R();t=b.min()}const r=this.readVersions.get(e.key.toString());if(r){if(!t.isEqual(r))throw new g(m.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(b.min())?J.exists(!1):J.updateTime(t):J.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(b.min()))throw new g(m.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return J.updateTime(t)}return J.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sv{constructor(e,t,r,i,s){this.asyncQueue=e,this.datastore=t,this.options=r,this.updateFunction=i,this.deferred=s,this.za=r.maxAttempts,this.jo=new xc(this.asyncQueue,"transaction_retry")}ja(){this.za-=1,this.Ha()}Ha(){this.jo.qo((async()=>{const e=new iv(this.datastore),t=this.Ja(e);t&&t.then((r=>{this.asyncQueue.enqueueAndForget((()=>e.commit().then((()=>{this.deferred.resolve(r)})).catch((i=>{this.Ya(i)}))))})).catch((r=>{this.Ya(r)}))}))}Ja(e){try{const t=this.updateFunction(e);return!Di(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}Ya(e){this.za>0&&this.Za(e)?(this.za-=1,this.asyncQueue.enqueueAndForget((()=>(this.Ha(),Promise.resolve())))):this.deferred.reject(e)}Za(e){if(e.name==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!$f(t)}return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ov{constructor(e,t,r,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=i,this.user=fe.UNAUTHENTICATED,this.clientId=dc.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this.authCredentials.start(r,(async s=>{_("FirestoreClient","Received user=",s.uid),await this.authCredentialListener(s),this.user=s})),this.appCheckCredentials.start(r,(s=>(_("FirestoreClient","Received new app check token=",s),this.appCheckCredentialListener(s,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}verifyNotTerminated(){if(this.asyncQueue.isShuttingDown)throw new g(m.FAILED_PRECONDITION,"The client has already been terminated.")}terminate(){this.asyncQueue.enterRestrictedMode();const e=new he;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=Ir(t,"Failed to shutdown persistence");e.reject(r)}})),e.promise}}async function gs(n,e){n.asyncQueue.verifyOperationInProgress(),_("FirestoreClient","Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener((async i=>{r.isEqual(i)||(await yp(e.localStore,i),r=i)})),e.persistence.setDatabaseDeletedListener((()=>n.terminate())),n._offlineComponents=e}async function Sa(n,e){n.asyncQueue.verifyOperationInProgress();const t=await Yc(n);_("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener((r=>zl(e.remoteStore,r))),n.setAppCheckTokenChangeListener(((r,i)=>zl(e.remoteStore,i))),n._onlineComponents=e}function Bp(n){return n.name==="FirebaseError"?n.code===m.FAILED_PRECONDITION||n.code===m.UNIMPLEMENTED:!(typeof DOMException<"u"&&n instanceof DOMException)||n.code===22||n.code===20||n.code===11}async function Yc(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){_("FirestoreClient","Using user provided OfflineComponentProvider");try{await gs(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!Bp(t))throw t;xe("Error using user provided cache. Falling back to memory cache: "+t),await gs(n,new sr)}}else _("FirestoreClient","Using default OfflineComponentProvider"),await gs(n,new sr);return n._offlineComponents}async function To(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(_("FirestoreClient","Using user provided OnlineComponentProvider"),await Sa(n,n._uninitializedComponentsProvider._online)):(_("FirestoreClient","Using default OnlineComponentProvider"),await Sa(n,new Er))),n._onlineComponents}function qp(n){return Yc(n).then((e=>e.persistence))}function Tr(n){return Yc(n).then((e=>e.localStore))}function $p(n){return To(n).then((e=>e.remoteStore))}function Jc(n){return To(n).then((e=>e.syncEngine))}function Gp(n){return To(n).then((e=>e.datastore))}async function or(n){const e=await To(n),t=e.eventManager;return t.onListen=Fw.bind(null,e.syncEngine),t.onUnlisten=Uw.bind(null,e.syncEngine),t}function av(n){return n.asyncQueue.enqueue((async()=>{const e=await qp(n),t=await $p(n);return e.setNetworkEnabled(!0),(function(i){const s=T(i);return s.v_.delete(0),Fi(s)})(t)}))}function cv(n){return n.asyncQueue.enqueue((async()=>{const e=await qp(n),t=await $p(n);return e.setNetworkEnabled(!1),(async function(i){const s=T(i);s.v_.add(0),await gr(s),s.x_.set("Offline")})(t)}))}function uv(n,e){const t=new he;return n.asyncQueue.enqueueAndForget((async()=>(async function(i,s,o){try{const a=await(function(u,l){const h=T(u);return h.persistence.runTransaction("read document","readonly",(d=>h.localDocuments.getDocument(d,l)))})(i,s);a.isFoundDocument()?o.resolve(a):a.isNoDocument()?o.resolve(null):o.reject(new g(m.UNAVAILABLE,"Failed to get document from cache. (However, this document may exist on the server. Run again without setting 'source' in the GetOptions to attempt to retrieve the document from the server.)"))}catch(a){const c=Ir(a,`Failed to get document '${s} from cache`);o.reject(c)}})(await Tr(n),e,t))),t.promise}function jp(n,e,t={}){const r=new he;return n.asyncQueue.enqueueAndForget((async()=>(function(s,o,a,c,u){const l=new Eo({next:d=>{o.enqueueAndForget((()=>Bc(s,h)));const f=d.docs.has(a);!f&&d.fromCache?u.reject(new g(m.UNAVAILABLE,"Failed to get document because the client is offline.")):f&&d.fromCache&&c&&c.source==="server"?u.reject(new g(m.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):u.resolve(d)},error:d=>u.reject(d)}),h=new $c(fr(a.path),l,{includeMetadataChanges:!0,Z_:!0});return Uc(s,h)})(await or(n),n.asyncQueue,e,t,r))),r.promise}function lv(n,e){const t=new he;return n.asyncQueue.enqueueAndForget((async()=>(async function(i,s,o){try{const a=await Ms(i,s,!0),c=new Op(s,a.hs),u=c.ha(a.documents),l=c.applyChanges(u,!1);o.resolve(l.snapshot)}catch(a){const c=Ir(a,`Failed to execute query '${s} against cache`);o.reject(c)}})(await Tr(n),e,t))),t.promise}function zp(n,e,t={}){const r=new he;return n.asyncQueue.enqueueAndForget((async()=>(function(s,o,a,c,u){const l=new Eo({next:d=>{o.enqueueAndForget((()=>Bc(s,h))),d.fromCache&&c.source==="server"?u.reject(new g(m.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):u.resolve(d)},error:d=>u.reject(d)}),h=new $c(a,l,{includeMetadataChanges:!0,Z_:!0});return Uc(s,h)})(await or(n),n.asyncQueue,e,t,r))),r.promise}function hv(n,e){const t=new Eo(e);return n.asyncQueue.enqueueAndForget((async()=>(function(i,s){T(i).K_.add(s),s.next()})(await or(n),t))),()=>{t.La(),n.asyncQueue.enqueueAndForget((async()=>(function(i,s){T(i).K_.delete(s)})(await or(n),t)))}}function dv(n,e,t,r){const i=(function(o,a){let c;return c=typeof o=="string"?jf().encode(o):o,(function(l,h){return new rv(l,h)})((function(l,h){if(l instanceof Uint8Array)return Yl(l,h);if(l instanceof ArrayBuffer)return Yl(new Uint8Array(l),h);if(l instanceof ReadableStream)return l.getReader();throw new Error("Source of `toByteStreamReader` has to be a ArrayBuffer or ReadableStream")})(c),a)})(t,Mi(e));n.asyncQueue.enqueueAndForget((async()=>{tv(await Jc(n),i,r)}))}function fv(n,e){return n.asyncQueue.enqueue((async()=>(function(r,i){const s=T(r);return s.persistence.runTransaction("Get named query","readonly",(o=>s.$r.getNamedQuery(o,i)))})(await Tr(n),e)))}function pv(n,e){return n.asyncQueue.enqueue((async()=>(async function(r,i){const s=T(r),o=s.indexManager,a=[];return s.persistence.runTransaction("Configure indexes","readwrite",(c=>o.getFieldIndexes(c).next((u=>(function(h,d,f,I,E){h=[...h],d=[...d],h.sort(f),d.sort(f);const y=h.length,P=d.length;let C=0,A=0;for(;C<P&&A<y;){const D=f(h[A],d[C]);D<0?E(h[A++]):D>0?I(d[C++]):(C++,A++)}for(;C<P;)I(d[C++]);for(;A<y;)E(h[A++])})(u,i,wE,(l=>{a.push(o.addFieldIndex(c,l))}),(l=>{a.push(o.deleteFieldIndex(c,l))})))).next((()=>p.waitFor(a)))))})(await Tr(n),e)))}function mv(n,e){return n.asyncQueue.enqueue((async()=>(function(r,i){T(r).ts.Ui=i})(await Tr(n),e)))}function gv(n){return n.asyncQueue.enqueue((async()=>(function(t){const r=T(t),i=r.indexManager;return r.persistence.runTransaction("Delete All Indexes","readwrite",(s=>i.deleteAllFieldIndexes(s)))})(await Tr(n))))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kp(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jl=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xc(n,e,t){if(!t)throw new g(m.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function Hp(n,e,t,r){if(e===!0&&r===!0)throw new g(m.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Xl(n){if(!w.isDocumentKey(n))throw new g(m.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Zl(n){if(w.isDocumentKey(n))throw new g(m.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function wo(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(r){return r.constructor?r.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":R()}function L(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new g(m.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=wo(n);throw new g(m.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function Wp(n,e){if(e<=0)throw new g(m.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${e}.`)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eh{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new g(m.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new g(m.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Hp("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Kp((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),(function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new g(m.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new g(m.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new g(m.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(r,i){return r.timeoutSeconds===i.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Ui{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new eh({}),this._settingsFrozen=!1}get app(){if(!this._app)throw new g(m.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!==void 0}_setSettings(e){if(this._settingsFrozen)throw new g(m.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new eh(e),e.credentials!==void 0&&(this._authCredentials=(function(r){if(!r)return new tf;switch(r.type){case"firstParty":return new _E(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new g(m.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask||(this._terminateTask=this._terminate()),this._terminateTask}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const r=Jl.get(t);r&&(_("ComponentProvider","Removing Datastore"),Jl.delete(t),r.terminate())})(this),Promise.resolve()}}function Qp(n,e,t,r={}){var i;const s=(n=L(n,Ui))._getSettings(),o=`${e}:${t}`;if(s.host!=="firestore.googleapis.com"&&s.host!==o&&xe("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),n._setSettings(Object.assign(Object.assign({},s),{host:o,ssl:!1})),r.mockUserToken){let a,c;if(typeof r.mockUserToken=="string")a=r.mockUserToken,c=fe.MOCK_USER;else{a=_h(r.mockUserToken,(i=n._app)===null||i===void 0?void 0:i.options.projectId);const u=r.mockUserToken.sub||r.mockUserToken.user_id;if(!u)throw new g(m.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");c=new fe(u)}n._authCredentials=new pE(new ef(a,c))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class me{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new me(this.firestore,e,this._query)}}class te{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new $e(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new te(this.firestore,e,this._key)}}class $e extends me{constructor(e,t,r){super(e,t,fr(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new te(this.firestore,null,new w(e))}withConverter(e){return new $e(this.firestore,e,this._path)}}function _v(n,e,...t){if(n=M(n),Xc("collection","path",e),n instanceof Ui){const r=U.fromString(e,...t);return Zl(r),new $e(n,null,r)}{if(!(n instanceof te||n instanceof $e))throw new g(m.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(U.fromString(e,...t));return Zl(r),new $e(n.firestore,null,r)}}function yv(n,e){if(n=L(n,Ui),Xc("collectionGroup","collection id",e),e.indexOf("/")>=0)throw new g(m.INVALID_ARGUMENT,`Invalid collection ID '${e}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new me(n,null,(function(r){return new lt(U.emptyPath(),r)})(e))}function Yp(n,e,...t){if(n=M(n),arguments.length===1&&(e=dc.newId()),Xc("doc","path",e),n instanceof Ui){const r=U.fromString(e,...t);return Xl(r),new te(n,null,new w(r))}{if(!(n instanceof te||n instanceof $e))throw new g(m.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(U.fromString(e,...t));return Xl(r),new te(n.firestore,n instanceof $e?n.converter:null,new w(r))}}function Iv(n,e){return n=M(n),e=M(e),(n instanceof te||n instanceof $e)&&(e instanceof te||e instanceof $e)&&n.firestore===e.firestore&&n.path===e.path&&n.converter===e.converter}function Zc(n,e){return n=M(n),e=M(e),n instanceof me&&e instanceof me&&n.firestore===e.firestore&&ki(n._query,e._query)&&n.converter===e.converter}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ev{constructor(){this.Xa=Promise.resolve(),this.eu=[],this.tu=!1,this.nu=[],this.ru=null,this.iu=!1,this.su=!1,this.ou=[],this.jo=new xc(this,"async_queue_retry"),this._u=()=>{const t=ms();t&&_("AsyncQueue","Visibility state changed to "+t.visibilityState),this.jo.Ko()};const e=ms();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this._u)}get isShuttingDown(){return this.tu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.au(),this.uu(e)}enterRestrictedMode(e){if(!this.tu){this.tu=!0,this.su=e||!1;const t=ms();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this._u)}}enqueue(e){if(this.au(),this.tu)return new Promise((()=>{}));const t=new he;return this.uu((()=>this.tu&&this.su?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.eu.push(e),this.cu())))}async cu(){if(this.eu.length!==0){try{await this.eu[0](),this.eu.shift(),this.jo.reset()}catch(e){if(!Gt(e))throw e;_("AsyncQueue","Operation failed with retryable error: "+e)}this.eu.length>0&&this.jo.qo((()=>this.cu()))}}uu(e){const t=this.Xa.then((()=>(this.iu=!0,e().catch((r=>{this.ru=r,this.iu=!1;const i=(function(o){let a=o.message||"";return o.stack&&(a=o.stack.includes(o.message)?o.stack:o.message+`
`+o.stack),a})(r);throw oe("INTERNAL UNHANDLED ERROR: ",i),r})).then((r=>(this.iu=!1,r))))));return this.Xa=t,t}enqueueAfterDelay(e,t,r){this.au(),this.ou.indexOf(e)>-1&&(t=0);const i=Fc.createAndSchedule(this,e,t,r,(s=>this.lu(s)));return this.nu.push(i),i}au(){this.ru&&R()}verifyOperationInProgress(){}async hu(){let e;do e=this.Xa,await e;while(e!==this.Xa)}Pu(e){for(const t of this.nu)if(t.timerId===e)return!0;return!1}Iu(e){return this.hu().then((()=>{this.nu.sort(((t,r)=>t.targetTimeMs-r.targetTimeMs));for(const t of this.nu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.hu()}))}Tu(e){this.ou.push(e)}lu(e){const t=this.nu.indexOf(e);this.nu.splice(t,1)}}function ba(n){return(function(t,r){if(typeof t!="object"||t===null)return!1;const i=t;for(const s of r)if(s in i&&typeof i[s]=="function")return!0;return!1})(n,["next","error","complete"])}class Jp{constructor(){this._progressObserver={},this._taskCompletionResolver=new he,this._lastProgress={taskState:"Running",totalBytes:0,totalDocuments:0,bytesLoaded:0,documentsLoaded:0}}onProgress(e,t,r){this._progressObserver={next:e,error:t,complete:r}}catch(e){return this._taskCompletionResolver.promise.catch(e)}then(e,t){return this._taskCompletionResolver.promise.then(e,t)}_completeWith(e){this._updateProgress(e),this._progressObserver.complete&&this._progressObserver.complete(),this._taskCompletionResolver.resolve(e)}_failWith(e){this._lastProgress.taskState="Error",this._progressObserver.next&&this._progressObserver.next(this._lastProgress),this._progressObserver.error&&this._progressObserver.error(e),this._taskCompletionResolver.reject(e)}_updateProgress(e){this._lastProgress=e,this._progressObserver.next&&this._progressObserver.next(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tv=-1;class K extends Ui{constructor(e,t,r,i){super(e,t,r,i),this.type="firestore",this._queue=(function(){return new Ev})(),this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}_terminate(){return this._firestoreClient||Xp(this),this._firestoreClient.terminate()}}function wv(n,e,t){t||(t="(default)");const r=cr(n,"firestore");if(r.isInitialized(t)){const i=r.getImmediate({identifier:t}),s=r.getOptions(t);if(Ct(s,e))return i;throw new g(m.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new g(m.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new g(m.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return r.initialize({options:e,instanceIdentifier:t})}function vv(n,e){const t=typeof n=="object"?n:Oa(),r=typeof n=="string"?n:e||"(default)",i=cr(t,"firestore").getImmediate({identifier:r});if(!i._initialized){const s=Na("firestore");s&&Qp(i,...s)}return i}function ie(n){return n._firestoreClient||Xp(n),n._firestoreClient.verifyNotTerminated(),n._firestoreClient}function Xp(n){var e,t,r;const i=n._freezeSettings(),s=(function(a,c,u,l){return new WE(a,c,u,l.host,l.ssl,l.experimentalForceLongPolling,l.experimentalAutoDetectLongPolling,Kp(l.experimentalLongPollingOptions),l.useFetchStreams)})(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,i);n._firestoreClient=new ov(n._authCredentials,n._appCheckCredentials,n._queue,s),!((t=i.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=i.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._firestoreClient._uninitializedComponentsProvider={_offlineKind:i.localCache.kind,_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider})}function Av(n,e){em(n=L(n,K));const t=ie(n);if(t._uninitializedComponentsProvider)throw new g(m.FAILED_PRECONDITION,"SDK cache is already specified.");xe("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const r=n._freezeSettings(),i=new Er;return Zp(t,i,new Qc(i,r.cacheSizeBytes,e==null?void 0:e.forceOwnership))}function Rv(n){em(n=L(n,K));const e=ie(n);if(e._uninitializedComponentsProvider)throw new g(m.FAILED_PRECONDITION,"SDK cache is already specified.");xe("enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const t=n._freezeSettings(),r=new Er;return Zp(e,r,new Up(r,t.cacheSizeBytes))}function Zp(n,e,t){const r=new he;return n.asyncQueue.enqueue((async()=>{try{await gs(n,t),await Sa(n,e),r.resolve()}catch(i){const s=i;if(!Bp(s))throw s;xe("Error enabling indexeddb cache. Falling back to memory cache: "+s),r.reject(s)}})).then((()=>r.promise))}function Pv(n){if(n._initialized&&!n._terminated)throw new g(m.FAILED_PRECONDITION,"Persistence can only be cleared before a Firestore instance is initialized or after it is terminated.");const e=new he;return n._queue.enqueueAndForgetEvenWhileRestricted((async()=>{try{await(async function(r){if(!Ue.D())return Promise.resolve();const i=r+"main";await Ue.delete(i)})(Vc(n._databaseId,n._persistenceKey)),e.resolve()}catch(t){e.reject(t)}})),e.promise}function Sv(n){return(function(t){const r=new he;return t.asyncQueue.enqueueAndForget((async()=>jw(await Jc(t),r))),r.promise})(ie(n=L(n,K)))}function bv(n){return av(ie(n=L(n,K)))}function Cv(n){return cv(ie(n=L(n,K)))}function Dv(n){return Hg(n.app,"firestore",n._databaseId.database),n._delete()}function Vv(n,e){const t=ie(n=L(n,K)),r=new Jp;return dv(t,n._databaseId,e,r),r}function kv(n,e){return fv(ie(n=L(n,K)),e).then((t=>t?new me(n,null,t.query):null))}function em(n){if(n._initialized||n._terminated)throw new g(m.FAILED_PRECONDITION,"Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ar{constructor(e="count",t){this._internalFieldPath=t,this.type="AggregateField",this.aggregateType=e}}class tm{constructor(e,t,r){this._userDataWriter=t,this._data=r,this.type="AggregateQuerySnapshot",this.query=e}data(){return this._userDataWriter.convertObjectMap(this._data)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ft{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Ft(le.fromBase64String(e))}catch(t){throw new g(m.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Ft(le.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kt{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new g(m.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Y(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function Nv(){return new Kt("__name__")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ht{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vo{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new g(m.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new g(m.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return k(this._lat,e._lat)||k(this._long,e._long)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xv=/^__.*__$/;class Ov{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new dt(e,this.data,this.fieldMask,t,this.fieldTransforms):new pr(e,this.data,t,this.fieldTransforms)}}class nm{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new dt(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function rm(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw R()}}class Ao{constructor(e,t,r,i,s,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.Eu(),this.fieldTransforms=s||[],this.fieldMask=o||[]}get path(){return this.settings.path}get du(){return this.settings.du}Au(e){return new Ao(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Ru(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.Au({path:r,Vu:!1});return i.mu(e),i}fu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.Au({path:r,Vu:!1});return i.Eu(),i}gu(e){return this.Au({path:void 0,Vu:!0})}pu(e){return qs(e,this.settings.methodName,this.settings.yu||!1,this.path,this.settings.wu)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}Eu(){if(this.path)for(let e=0;e<this.path.length;e++)this.mu(this.path.get(e))}mu(e){if(e.length===0)throw this.pu("Document fields must not be empty");if(rm(this.du)&&xv.test(e))throw this.pu('Document fields cannot begin and end with "__"')}}class Lv{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Mi(e)}Su(e,t,r,i=!1){return new Ao({du:e,methodName:t,wu:r,path:Y.emptyPath(),Vu:!1,yu:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Pn(n){const e=n._freezeSettings(),t=Mi(n._databaseId);return new Lv(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Ro(n,e,t,r,i,s={}){const o=n.Su(s.merge||s.mergeFields?2:0,e,t,i);ou("Data must be an object, but it was:",o,r);const a=om(r,o);let c,u;if(s.merge)c=new ke(o.fieldMask),u=o.fieldTransforms;else if(s.mergeFields){const l=[];for(const h of s.mergeFields){const d=_i(e,h,t);if(!o.contains(d))throw new g(m.INVALID_ARGUMENT,`Field '${d}' is specified in your field mask but missing from your input data.`);cm(l,d)||l.push(d)}c=new ke(l),u=o.fieldTransforms.filter((h=>c.covers(h.field)))}else c=null,u=o.fieldTransforms;return new Ov(new Ee(a),c,u)}class Bi extends Ht{_toFieldTransform(e){if(e.du!==2)throw e.du===1?e.pu(`${this._methodName}() can only appear at the top level of your update data`):e.pu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Bi}}function im(n,e,t){return new Ao({du:3,wu:e.settings.wu,methodName:n._methodName,Vu:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class eu extends Ht{_toFieldTransform(e){return new xi(e.path,new Xn)}isEqual(e){return e instanceof eu}}class tu extends Ht{constructor(e,t){super(e),this.bu=t}_toFieldTransform(e){const t=im(this,e,!0),r=this.bu.map((s=>Sn(s,t))),i=new gn(r);return new xi(e.path,i)}isEqual(e){return e instanceof tu&&Ct(this.bu,e.bu)}}class nu extends Ht{constructor(e,t){super(e),this.bu=t}_toFieldTransform(e){const t=im(this,e,!0),r=this.bu.map((s=>Sn(s,t))),i=new _n(r);return new xi(e.path,i)}isEqual(e){return e instanceof nu&&Ct(this.bu,e.bu)}}class ru extends Ht{constructor(e,t){super(e),this.Du=t}_toFieldTransform(e){const t=new Zn(e.serializer,Of(e.serializer,this.Du));return new xi(e.path,t)}isEqual(e){return e instanceof ru&&this.Du===e.Du}}function iu(n,e,t,r){const i=n.Su(1,e,t);ou("Data must be an object, but it was:",i,r);const s=[],o=Ee.empty();jt(r,((c,u)=>{const l=Po(e,c,t);u=M(u);const h=i.fu(l);if(u instanceof Bi)s.push(l);else{const d=Sn(u,h);d!=null&&(s.push(l),o.set(l,d))}}));const a=new ke(s);return new nm(o,a,i.fieldTransforms)}function su(n,e,t,r,i,s){const o=n.Su(1,e,t),a=[_i(e,r,t)],c=[i];if(s.length%2!=0)throw new g(m.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let d=0;d<s.length;d+=2)a.push(_i(e,s[d])),c.push(s[d+1]);const u=[],l=Ee.empty();for(let d=a.length-1;d>=0;--d)if(!cm(u,a[d])){const f=a[d];let I=c[d];I=M(I);const E=o.fu(f);if(I instanceof Bi)u.push(f);else{const y=Sn(I,E);y!=null&&(u.push(f),l.set(f,y))}}const h=new ke(u);return new nm(l,h,o.fieldTransforms)}function sm(n,e,t,r=!1){return Sn(t,n.Su(r?4:3,e))}function Sn(n,e){if(am(n=M(n)))return ou("Unsupported field value:",e,n),om(n,e);if(n instanceof Ht)return(function(r,i){if(!rm(i.du))throw i.pu(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.pu(`${r._methodName}() is not currently supported inside arrays`);const s=r._toFieldTransform(i);s&&i.fieldTransforms.push(s)})(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.Vu&&e.du!==4)throw e.pu("Nested arrays are not supported");return(function(r,i){const s=[];let o=0;for(const a of r){let c=Sn(a,i.gu(o));c==null&&(c={nullValue:"NULL_VALUE"}),s.push(c),o++}return{arrayValue:{values:s}}})(n,e)}return(function(r,i){if((r=M(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return Of(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const s=X.fromDate(r);return{timestampValue:er(i.serializer,s)}}if(r instanceof X){const s=new X(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:er(i.serializer,s)}}if(r instanceof vo)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Ft)return{bytesValue:Hf(i.serializer,r._byteString)};if(r instanceof te){const s=i.databaseId,o=r.firestore._databaseId;if(!o.isEqual(s))throw i.pu(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:vc(r.firestore._databaseId||i.databaseId,r._key.path)}}throw i.pu(`Unsupported field value: ${wo(r)}`)})(n,e)}function om(n,e){const t={};return pf(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):jt(n,((r,i)=>{const s=Sn(i,e.Ru(r));s!=null&&(t[r]=s)})),{mapValue:{fields:t}}}function am(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof X||n instanceof vo||n instanceof Ft||n instanceof te||n instanceof Ht)}function ou(n,e,t){if(!am(t)||!(function(i){return typeof i=="object"&&i!==null&&(Object.getPrototypeOf(i)===Object.prototype||Object.getPrototypeOf(i)===null)})(t)){const r=wo(t);throw r==="an object"?e.pu(n+" a custom object"):e.pu(n+" "+r)}}function _i(n,e,t){if((e=M(e))instanceof Kt)return e._internalPath;if(typeof e=="string")return Po(n,e);throw qs("Field path arguments must be of type string or ",n,!1,void 0,t)}const Mv=new RegExp("[~\\*/\\[\\]]");function Po(n,e,t){if(e.search(Mv)>=0)throw qs(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Kt(...e.split("."))._internalPath}catch{throw qs(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function qs(n,e,t,r,i){const s=r&&!r.isEmpty(),o=i!==void 0;let a=`Function ${e}() called with invalid data`;t&&(a+=" (via `toFirestore()`)"),a+=". ";let c="";return(s||o)&&(c+=" (found",s&&(c+=` in field ${r}`),o&&(c+=` in document ${i}`),c+=")"),new g(m.INVALID_ARGUMENT,a+n+c)}function cm(n,e){return n.some((t=>t.isEqual(e)))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yi{constructor(e,t,r,i,s){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new te(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Fv(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(So("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Fv extends yi{data(){return super.data()}}function So(n,e){return typeof e=="string"?Po(n,e):e instanceof Kt?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function um(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new g(m.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class au{}class wr extends au{}function Uv(n,e,...t){let r=[];e instanceof au&&r.push(e),r=r.concat(t),(function(s){const o=s.filter((c=>c instanceof bn)).length,a=s.filter((c=>c instanceof vr)).length;if(o>1||o>0&&a>0)throw new g(m.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(r);for(const i of r)n=i._apply(n);return n}class vr extends wr{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new vr(e,t,r)}_apply(e){const t=this._parse(e);return hm(e._query,t),new me(e.firestore,e.converter,ga(e._query,t))}_parse(e){const t=Pn(e.firestore);return(function(s,o,a,c,u,l,h){let d;if(u.isKeyField()){if(l==="array-contains"||l==="array-contains-any")throw new g(m.INVALID_ARGUMENT,`Invalid Query. You can't perform '${l}' queries on documentId().`);if(l==="in"||l==="not-in"){nh(h,l);const f=[];for(const I of h)f.push(th(c,s,I));d={arrayValue:{values:f}}}else d=th(c,s,h)}else l!=="in"&&l!=="not-in"&&l!=="array-contains-any"||nh(h,l),d=sm(a,o,h,l==="in"||l==="not-in");return B.create(u,l,d)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function Bv(n,e,t){const r=e,i=So("where",n);return vr._create(i,r,t)}class bn extends au{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new bn(e,t)}_parse(e){const t=this._queryConstraints.map((r=>r._parse(e))).filter((r=>r.getFilters().length>0));return t.length===1?t[0]:G.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(i,s){let o=i;const a=s.getFlattenedFilters();for(const c of a)hm(o,c),o=ga(o,c)})(e._query,t),new me(e.firestore,e.converter,ga(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function qv(...n){return n.forEach((e=>dm("or",e))),bn._create("or",n)}function $v(...n){return n.forEach((e=>dm("and",e))),bn._create("and",n)}class bo extends wr{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new bo(e,t)}_apply(e){const t=(function(i,s,o){if(i.startAt!==null)throw new g(m.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(i.endAt!==null)throw new g(m.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new fi(s,o)})(e._query,this._field,this._direction);return new me(e.firestore,e.converter,(function(i,s){const o=i.explicitOrderBy.concat([s]);return new lt(i.path,i.collectionGroup,o,i.filters.slice(),i.limit,i.limitType,i.startAt,i.endAt)})(e._query,t))}}function Gv(n,e="asc"){const t=e,r=So("orderBy",n);return bo._create(r,t)}class qi extends wr{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new qi(e,t,r)}_apply(e){return new me(e.firestore,e.converter,Vs(e._query,this._limit,this._limitType))}}function jv(n){return Wp("limit",n),qi._create("limit",n,"F")}function zv(n){return Wp("limitToLast",n),qi._create("limitToLast",n,"L")}class $i extends wr{constructor(e,t,r){super(),this.type=e,this._docOrFields=t,this._inclusive=r}static _create(e,t,r){return new $i(e,t,r)}_apply(e){const t=lm(e,this.type,this._docOrFields,this._inclusive);return new me(e.firestore,e.converter,(function(i,s){return new lt(i.path,i.collectionGroup,i.explicitOrderBy.slice(),i.filters.slice(),i.limit,i.limitType,s,i.endAt)})(e._query,t))}}function Kv(...n){return $i._create("startAt",n,!0)}function Hv(...n){return $i._create("startAfter",n,!1)}class Gi extends wr{constructor(e,t,r){super(),this.type=e,this._docOrFields=t,this._inclusive=r}static _create(e,t,r){return new Gi(e,t,r)}_apply(e){const t=lm(e,this.type,this._docOrFields,this._inclusive);return new me(e.firestore,e.converter,(function(i,s){return new lt(i.path,i.collectionGroup,i.explicitOrderBy.slice(),i.filters.slice(),i.limit,i.limitType,i.startAt,s)})(e._query,t))}}function Wv(...n){return Gi._create("endBefore",n,!1)}function Qv(...n){return Gi._create("endAt",n,!0)}function lm(n,e,t,r){if(t[0]=M(t[0]),t[0]instanceof yi)return(function(s,o,a,c,u){if(!c)throw new g(m.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${a}().`);const l=[];for(const h of Gn(s))if(h.field.isKeyField())l.push(pn(o,c.key));else{const d=c.data.field(h.field);if(ho(d))throw new g(m.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+h.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(d===null){const f=h.field.canonicalString();throw new g(m.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${f}' (used as the orderBy) does not exist.`)}l.push(d)}return new Lt(l,u)})(n._query,n.firestore._databaseId,e,t[0]._document,r);{const i=Pn(n.firestore);return(function(o,a,c,u,l,h){const d=o.explicitOrderBy;if(l.length>d.length)throw new g(m.INVALID_ARGUMENT,`Too many arguments provided to ${u}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const f=[];for(let I=0;I<l.length;I++){const E=l[I];if(d[I].field.isKeyField()){if(typeof E!="string")throw new g(m.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${u}(), but got a ${typeof E}`);if(!gc(o)&&E.indexOf("/")!==-1)throw new g(m.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${u}() must be a plain document ID, but '${E}' contains a slash.`);const y=o.path.child(U.fromString(E));if(!w.isDocumentKey(y))throw new g(m.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${u}() must result in a valid document path, but '${y}' is not because it contains an odd number of segments.`);const P=new w(y);f.push(pn(a,P))}else{const y=sm(c,u,E);f.push(y)}}return new Lt(f,h)})(n._query,n.firestore._databaseId,i,e,t,r)}}function th(n,e,t){if(typeof(t=M(t))=="string"){if(t==="")throw new g(m.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!gc(e)&&t.indexOf("/")!==-1)throw new g(m.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(U.fromString(t));if(!w.isDocumentKey(r))throw new g(m.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return pn(n,new w(r))}if(t instanceof te)return pn(n,t._key);throw new g(m.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${wo(t)}.`)}function nh(n,e){if(!Array.isArray(n)||n.length===0)throw new g(m.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function hm(n,e){const t=(function(i,s){for(const o of i)for(const a of o.getFlattenedFilters())if(s.indexOf(a.op)>=0)return a.op;return null})(n.filters,(function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new g(m.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new g(m.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function dm(n,e){if(!(e instanceof vr||e instanceof bn))throw new g(m.INVALID_ARGUMENT,`Function ${n}() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'.`)}class cu{convertValue(e,t="none"){switch(xt(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ee(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(ct(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 10:return this.convertObject(e.mapValue,t);default:throw R()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return jt(e,((i,s)=>{r[i]=this.convertValue(s,t)})),r}convertGeoPoint(e){return new vo(ee(e.latitude),ee(e.longitude))}convertArray(e,t){return(e.values||[]).map((r=>this.convertValue(r,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const r=fo(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(li(e));default:return null}}convertTimestamp(e){const t=kt(e);return new X(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=U.fromString(e);S(rp(r));const i=new Nt(r.get(1),r.get(3)),s=new w(r.popFirst(5));return i.isEqual(t)||oe(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Co(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class Yv extends cu{constructor(e){super(),this.firestore=e}convertBytes(e){return new Ft(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new te(this.firestore,null,t)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jv(n){return new ar("sum",_i("sum",n))}function Xv(n){return new ar("avg",_i("average",n))}function fm(){return new ar("count")}function Zv(n,e){var t,r;return n instanceof ar&&e instanceof ar&&n.aggregateType===e.aggregateType&&((t=n._internalFieldPath)===null||t===void 0?void 0:t.canonicalString())===((r=e._internalFieldPath)===null||r===void 0?void 0:r.canonicalString())}function eA(n,e){return Zc(n.query,e.query)&&Ct(n.data(),e.data())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pt{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Tn extends yi{constructor(e,t,r,i,s,o){super(e,t,r,i,o),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Wr(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(So("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class Wr extends Tn{data(e={}){return super.data(e)}}class wn{constructor(e,t,r,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new Pt(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((r=>{e.call(t,new Wr(this._firestore,this._userDataWriter,r.key,r,new Pt(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new g(m.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(i,s){if(i._snapshot.oldDocs.isEmpty()){let o=0;return i._snapshot.docChanges.map((a=>{const c=new Wr(i._firestore,i._userDataWriter,a.doc.key,a.doc,new Pt(i._snapshot.mutatedKeys.has(a.doc.key),i._snapshot.fromCache),i.query.converter);return a.doc,{type:"added",doc:c,oldIndex:-1,newIndex:o++}}))}{let o=i._snapshot.oldDocs;return i._snapshot.docChanges.filter((a=>s||a.type!==3)).map((a=>{const c=new Wr(i._firestore,i._userDataWriter,a.doc.key,a.doc,new Pt(i._snapshot.mutatedKeys.has(a.doc.key),i._snapshot.fromCache),i.query.converter);let u=-1,l=-1;return a.type!==0&&(u=o.indexOf(a.doc.key),o=o.delete(a.doc.key)),a.type!==1&&(o=o.add(a.doc),l=o.indexOf(a.doc.key)),{type:tA(a.type),doc:c,oldIndex:u,newIndex:l}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function tA(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return R()}}function nA(n,e){return n instanceof Tn&&e instanceof Tn?n._firestore===e._firestore&&n._key.isEqual(e._key)&&(n._document===null?e._document===null:n._document.isEqual(e._document))&&n._converter===e._converter:n instanceof wn&&e instanceof wn&&n._firestore===e._firestore&&Zc(n.query,e.query)&&n.metadata.isEqual(e.metadata)&&n._snapshot.isEqual(e._snapshot)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rA(n){n=L(n,te);const e=L(n.firestore,K);return jp(ie(e),n._key).then((t=>uu(e,n,t)))}class Wt extends cu{constructor(e){super(),this.firestore=e}convertBytes(e){return new Ft(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new te(this.firestore,null,t)}}function iA(n){n=L(n,te);const e=L(n.firestore,K),t=ie(e),r=new Wt(e);return uv(t,n._key).then((i=>new Tn(e,r,n._key,i,new Pt(i!==null&&i.hasLocalMutations,!0),n.converter)))}function sA(n){n=L(n,te);const e=L(n.firestore,K);return jp(ie(e),n._key,{source:"server"}).then((t=>uu(e,n,t)))}function oA(n){n=L(n,me);const e=L(n.firestore,K),t=ie(e),r=new Wt(e);return um(n._query),zp(t,n._query).then((i=>new wn(e,r,n,i)))}function aA(n){n=L(n,me);const e=L(n.firestore,K),t=ie(e),r=new Wt(e);return lv(t,n._query).then((i=>new wn(e,r,n,i)))}function cA(n){n=L(n,me);const e=L(n.firestore,K),t=ie(e),r=new Wt(e);return zp(t,n._query,{source:"server"}).then((i=>new wn(e,r,n,i)))}function uA(n,e,t){n=L(n,te);const r=L(n.firestore,K),i=Co(n.converter,e,t);return Ar(r,[Ro(Pn(r),"setDoc",n._key,i,n.converter!==null,t).toMutation(n._key,J.none())])}function lA(n,e,t,...r){n=L(n,te);const i=L(n.firestore,K),s=Pn(i);let o;return o=typeof(e=M(e))=="string"||e instanceof Kt?su(s,"updateDoc",n._key,e,t,r):iu(s,"updateDoc",n._key,e),Ar(i,[o.toMutation(n._key,J.exists(!0))])}function hA(n){return Ar(L(n.firestore,K),[new mr(n._key,J.none())])}function dA(n,e){const t=L(n.firestore,K),r=Yp(n),i=Co(n.converter,e);return Ar(t,[Ro(Pn(n.firestore),"addDoc",r._key,i,n.converter!==null,{}).toMutation(r._key,J.exists(!1))]).then((()=>r))}function fA(n,...e){var t,r,i;n=M(n);let s={includeMetadataChanges:!1},o=0;typeof e[o]!="object"||ba(e[o])||(s=e[o],o++);const a={includeMetadataChanges:s.includeMetadataChanges};if(ba(e[o])){const h=e[o];e[o]=(t=h.next)===null||t===void 0?void 0:t.bind(h),e[o+1]=(r=h.error)===null||r===void 0?void 0:r.bind(h),e[o+2]=(i=h.complete)===null||i===void 0?void 0:i.bind(h)}let c,u,l;if(n instanceof te)u=L(n.firestore,K),l=fr(n._key.path),c={next:h=>{e[o]&&e[o](uu(u,n,h))},error:e[o+1],complete:e[o+2]};else{const h=L(n,me);u=L(h.firestore,K),l=h._query;const d=new Wt(u);c={next:f=>{e[o]&&e[o](new wn(u,d,h,f))},error:e[o+1],complete:e[o+2]},um(n._query)}return(function(d,f,I,E){const y=new Eo(E),P=new $c(f,y,I);return d.asyncQueue.enqueueAndForget((async()=>Uc(await or(d),P))),()=>{y.La(),d.asyncQueue.enqueueAndForget((async()=>Bc(await or(d),P)))}})(ie(u),l,a,c)}function pA(n,e){return hv(ie(n=L(n,K)),ba(e)?e:{next:e})}function Ar(n,e){return(function(r,i){const s=new he;return r.asyncQueue.enqueueAndForget((async()=>Bw(await Jc(r),i,s))),s.promise})(ie(n),e)}function uu(n,e,t){const r=t.docs.get(e._key),i=new Wt(n);return new Tn(n,i,e._key,r,new Pt(t.hasPendingWrites,t.fromCache),e.converter)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mA(n){return pm(n,{count:fm()})}function pm(n,e){const t=L(n.firestore,K),r=ie(t),i=(function(o,a){const c=[];for(const u in o)Object.prototype.hasOwnProperty.call(o,u)&&c.push(a(o[u],u,o));return c})(e,((s,o)=>new gT(o,s.aggregateType,s._internalFieldPath)));return(function(o,a,c){const u=new he;return o.asyncQueue.enqueueAndForget((async()=>{try{const l=await Gp(o);u.resolve(_w(l,a,c))}catch(l){u.reject(l)}})),u.promise})(r,n._query,i).then((s=>(function(a,c,u){const l=new Wt(a);return new tm(c,l,u)})(t,n,s)))}class gA{constructor(e){this.kind="memory",this._onlineComponentProvider=new Er,e!=null&&e.garbageCollector?this._offlineComponentProvider=e.garbageCollector._offlineComponentProvider:this._offlineComponentProvider=new sr}toJSON(){return{kind:this.kind}}}class _A{constructor(e){let t;this.kind="persistent",e!=null&&e.tabManager?(e.tabManager._initialize(e),t=e.tabManager):(t=mm(void 0),t._initialize(e)),this._onlineComponentProvider=t._onlineComponentProvider,this._offlineComponentProvider=t._offlineComponentProvider}toJSON(){return{kind:this.kind}}}class yA{constructor(){this.kind="memoryEager",this._offlineComponentProvider=new sr}toJSON(){return{kind:this.kind}}}class IA{constructor(e){this.kind="memoryLru",this._offlineComponentProvider=new nv(e)}toJSON(){return{kind:this.kind}}}function EA(){return new yA}function TA(n){return new IA(n==null?void 0:n.cacheSizeBytes)}function wA(n){return new gA(n)}function vA(n){return new _A(n)}class AA{constructor(e){this.forceOwnership=e,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=new Er,this._offlineComponentProvider=new Qc(this._onlineComponentProvider,e==null?void 0:e.cacheSizeBytes,this.forceOwnership)}}class RA{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=new Er,this._offlineComponentProvider=new Up(this._onlineComponentProvider,e==null?void 0:e.cacheSizeBytes)}}function mm(n){return new AA(n==null?void 0:n.forceOwnership)}function PA(){return new RA}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const SA={maxAttempts:5};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gm{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=Pn(e)}set(e,t,r){this._verifyNotCommitted();const i=vt(e,this._firestore),s=Co(i.converter,t,r),o=Ro(this._dataReader,"WriteBatch.set",i._key,s,i.converter!==null,r);return this._mutations.push(o.toMutation(i._key,J.none())),this}update(e,t,r,...i){this._verifyNotCommitted();const s=vt(e,this._firestore);let o;return o=typeof(t=M(t))=="string"||t instanceof Kt?su(this._dataReader,"WriteBatch.update",s._key,t,r,i):iu(this._dataReader,"WriteBatch.update",s._key,t),this._mutations.push(o.toMutation(s._key,J.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=vt(e,this._firestore);return this._mutations=this._mutations.concat(new mr(t._key,J.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new g(m.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function vt(n,e){if((n=M(n)).firestore!==e)throw new g(m.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _m extends class{constructor(t,r){this._firestore=t,this._transaction=r,this._dataReader=Pn(t)}get(t){const r=vt(t,this._firestore),i=new Yv(this._firestore);return this._transaction.lookup([r._key]).then((s=>{if(!s||s.length!==1)return R();const o=s[0];if(o.isFoundDocument())return new yi(this._firestore,i,o.key,o,r.converter);if(o.isNoDocument())return new yi(this._firestore,i,r._key,null,r.converter);throw R()}))}set(t,r,i){const s=vt(t,this._firestore),o=Co(s.converter,r,i),a=Ro(this._dataReader,"Transaction.set",s._key,o,s.converter!==null,i);return this._transaction.set(s._key,a),this}update(t,r,i,...s){const o=vt(t,this._firestore);let a;return a=typeof(r=M(r))=="string"||r instanceof Kt?su(this._dataReader,"Transaction.update",o._key,r,i,s):iu(this._dataReader,"Transaction.update",o._key,r),this._transaction.update(o._key,a),this}delete(t){const r=vt(t,this._firestore);return this._transaction.delete(r._key),this}}{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=vt(e,this._firestore),r=new Wt(this._firestore);return super.get(e).then((i=>new Tn(this._firestore,r,t._key,i._document,new Pt(!1,!1),t.converter)))}}function bA(n,e,t){n=L(n,K);const r=Object.assign(Object.assign({},SA),t);return(function(s){if(s.maxAttempts<1)throw new g(m.INVALID_ARGUMENT,"Max attempts must be at least 1")})(r),(function(s,o,a){const c=new he;return s.asyncQueue.enqueueAndForget((async()=>{const u=await Gp(s);new sv(s.asyncQueue,u,a,o,c).ja()})),c.promise})(ie(n),(i=>e(new _m(n,i))),r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function CA(){return new Bi("deleteField")}function DA(){return new eu("serverTimestamp")}function VA(...n){return new tu("arrayUnion",n)}function kA(...n){return new nu("arrayRemove",n)}function NA(n){return new ru("increment",n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xA(n){return ie(n=L(n,K)),new gm(n,(e=>Ar(n,e)))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function OA(n,e){var t;const r=ie(n=L(n,K));if(!r._uninitializedComponentsProvider||((t=r._uninitializedComponentsProvider)===null||t===void 0?void 0:t._offlineKind)==="memory")return xe("Cannot enable indexes when persistence is disabled"),Promise.resolve();const i=(function(o){const a=typeof o=="string"?(function(l){try{return JSON.parse(l)}catch(h){throw new g(m.INVALID_ARGUMENT,"Failed to parse JSON: "+(h==null?void 0:h.message))}})(o):o,c=[];if(Array.isArray(a.indexes))for(const u of a.indexes){const l=rh(u,"collectionGroup"),h=[];if(Array.isArray(u.fields))for(const d of u.fields){const f=Po("setIndexConfiguration",rh(d,"fieldPath"));d.arrayConfig==="CONTAINS"?h.push(new cn(f,2)):d.order==="ASCENDING"?h.push(new cn(f,0)):d.order==="DESCENDING"&&h.push(new cn(f,1))}c.push(new Wn(Wn.UNKNOWN_ID,l,h,Qn.empty()))}return c})(e);return pv(r,i)}function rh(n,e){if(typeof n[e]!="string")throw new g(m.INVALID_ARGUMENT,"Missing string value for: "+e);return n[e]}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ym{constructor(e){this._client=e,this.type="PersistentCacheIndexManager"}}function LA(n){var e;n=L(n,K);const t=ih.get(n);if(t)return t;const r=ie(n);if(((e=r._uninitializedComponentsProvider)===null||e===void 0?void 0:e._offlineKind)!=="persistent")return null;const i=new ym(r);return ih.set(n,i),i}function MA(n){Im(n,!0)}function FA(n){Im(n,!1)}function UA(n){n._client.verifyNotTerminated(),gv(n._client).then((e=>_("deleting all persistent cache indexes succeeded"))).catch((e=>xe("deleting all persistent cache indexes failed",e)))}function Im(n,e){n._client.verifyNotTerminated(),mv(n._client,e).then((t=>_(`setting persistent cache index auto creation isEnabled=${e} succeeded`))).catch((t=>xe(`setting persistent cache index auto creation isEnabled=${e} failed`,t)))}const ih=new WeakMap;/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BA{constructor(){throw new Error("instances of this class should not be created")}static onExistenceFilterMismatch(e){return lu.instance.onExistenceFilterMismatch(e)}}class lu{constructor(){this.Cu=new Map}static get instance(){return ns||(ns=new lu,(function(t){if(ks)throw new Error("a TestingHooksSpi instance is already set");ks=t})(ns)),ns}tt(e){this.Cu.forEach((t=>t(e)))}onExistenceFilterMismatch(e){const t=Symbol(),r=this.Cu;return r.set(t,e),()=>r.delete(t)}}let ns=null;(function(e,t=!0){(function(i){dr=i})(An),Dt(new st("firestore",((r,{instanceIdentifier:i,options:s})=>{const o=r.getProvider("app").getImmediate(),a=new K(new mE(r.getProvider("auth-internal")),new yE(r.getProvider("app-check-internal")),(function(u,l){if(!Object.prototype.hasOwnProperty.apply(u.options,["projectId"]))throw new g(m.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Nt(u.options.projectId,l)})(o,i),o);return s=Object.assign({useFetchStreams:t},s),a._setSettings(s),a}),"PUBLIC").setMultipleInstances(!0)),Be(Xu,"4.4.3",e),Be(Xu,"4.4.3","esm2017")})();const xP=Object.freeze(Object.defineProperty({__proto__:null,AbstractUserDataWriter:cu,AggregateField:ar,AggregateQuerySnapshot:tm,Bytes:Ft,CACHE_SIZE_UNLIMITED:Tv,CollectionReference:$e,DocumentReference:te,DocumentSnapshot:Tn,FieldPath:Kt,FieldValue:Ht,Firestore:K,FirestoreError:g,GeoPoint:vo,LoadBundleTask:Jp,PersistentCacheIndexManager:ym,Query:me,QueryCompositeFilterConstraint:bn,QueryConstraint:wr,QueryDocumentSnapshot:Wr,QueryEndAtConstraint:Gi,QueryFieldFilterConstraint:vr,QueryLimitConstraint:qi,QueryOrderByConstraint:bo,QuerySnapshot:wn,QueryStartAtConstraint:$i,SnapshotMetadata:Pt,Timestamp:X,Transaction:_m,WriteBatch:gm,_AutoId:dc,_ByteString:le,_DatabaseId:Nt,_DocumentKey:w,_EmptyAppCheckTokenProvider:IE,_EmptyAuthCredentialsProvider:tf,_FieldPath:Y,_TestingHooks:BA,_cast:L,_debugAssert:fE,_isBase64Available:KE,_logWarn:xe,_validateIsNotUsedTogether:Hp,addDoc:dA,aggregateFieldEqual:Zv,aggregateQuerySnapshotEqual:eA,and:$v,arrayRemove:kA,arrayUnion:VA,average:Xv,clearIndexedDbPersistence:Pv,collection:_v,collectionGroup:yv,connectFirestoreEmulator:Qp,count:fm,deleteAllPersistentCacheIndexes:UA,deleteDoc:hA,deleteField:CA,disableNetwork:Cv,disablePersistentCacheIndexAutoCreation:FA,doc:Yp,documentId:Nv,enableIndexedDbPersistence:Av,enableMultiTabIndexedDbPersistence:Rv,enableNetwork:bv,enablePersistentCacheIndexAutoCreation:MA,endAt:Qv,endBefore:Wv,ensureFirestoreConfigured:ie,executeWrite:Ar,getAggregateFromServer:pm,getCountFromServer:mA,getDoc:rA,getDocFromCache:iA,getDocFromServer:sA,getDocs:oA,getDocsFromCache:aA,getDocsFromServer:cA,getFirestore:vv,getPersistentCacheIndexManager:LA,increment:NA,initializeFirestore:wv,limit:jv,limitToLast:zv,loadBundle:Vv,memoryEagerGarbageCollector:EA,memoryLocalCache:wA,memoryLruGarbageCollector:TA,namedQuery:kv,onSnapshot:fA,onSnapshotsInSync:pA,or:qv,orderBy:Gv,persistentLocalCache:vA,persistentMultipleTabManager:PA,persistentSingleTabManager:mm,query:Uv,queryEqual:Zc,refEqual:Iv,runTransaction:bA,serverTimestamp:DA,setDoc:uA,setIndexConfiguration:OA,setLogLevel:dE,snapshotEqual:nA,startAfter:Hv,startAt:Kv,sum:Jv,terminate:Dv,updateDoc:lA,waitForPendingWrites:Sv,where:Bv,writeBatch:xA},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qA="type.googleapis.com/google.protobuf.Int64Value",$A="type.googleapis.com/google.protobuf.UInt64Value";function Em(n,e){const t={};for(const r in n)n.hasOwnProperty(r)&&(t[r]=e(n[r]));return t}function Ca(n){if(n==null)return null;if(n instanceof Number&&(n=n.valueOf()),typeof n=="number"&&isFinite(n)||n===!0||n===!1||Object.prototype.toString.call(n)==="[object String]")return n;if(n instanceof Date)return n.toISOString();if(Array.isArray(n))return n.map(e=>Ca(e));if(typeof n=="function"||typeof n=="object")return Em(n,e=>Ca(e));throw new Error("Data cannot be encoded in JSON: "+n)}function $s(n){if(n==null)return n;if(n["@type"])switch(n["@type"]){case qA:case $A:{const e=Number(n.value);if(isNaN(e))throw new Error("Data cannot be decoded from JSON: "+n);return e}default:throw new Error("Data cannot be decoded from JSON: "+n)}return Array.isArray(n)?n.map(e=>$s(e)):typeof n=="function"||typeof n=="object"?Em(n,e=>$s(e)):n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hu="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sh={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class zn extends je{constructor(e,t,r){super(`${hu}/${e}`,t||""),this.details=r}}function GA(n){if(n>=200&&n<300)return"ok";switch(n){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function jA(n,e){let t=GA(n),r=t,i;try{const s=e&&e.error;if(s){const o=s.status;if(typeof o=="string"){if(!sh[o])return new zn("internal","internal");t=sh[o],r=o}const a=s.message;typeof a=="string"&&(r=a),i=s.details,i!==void 0&&(i=$s(i))}}catch{}return t==="ok"?null:new zn(t,r,i)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zA{constructor(e,t,r){this.auth=null,this.messaging=null,this.appCheck=null,this.auth=e.getImmediate({optional:!0}),this.messaging=t.getImmediate({optional:!0}),this.auth||e.get().then(i=>this.auth=i,()=>{}),this.messaging||t.get().then(i=>this.messaging=i,()=>{}),this.appCheck||r.get().then(i=>this.appCheck=i,()=>{})}async getAuthToken(){if(this.auth)try{const e=await this.auth.getToken();return e==null?void 0:e.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(e){if(this.appCheck){const t=e?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return t.error?null:t.token}return null}async getContext(e){const t=await this.getAuthToken(),r=await this.getMessagingToken(),i=await this.getAppCheckToken(e);return{authToken:t,messagingToken:r,appCheckToken:i}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Da="us-central1";function KA(n){let e=null;return{promise:new Promise((t,r)=>{e=setTimeout(()=>{r(new zn("deadline-exceeded","deadline-exceeded"))},n)}),cancel:()=>{e&&clearTimeout(e)}}}class HA{constructor(e,t,r,i,s=Da,o){this.app=e,this.fetchImpl=o,this.emulatorOrigin=null,this.contextProvider=new zA(t,r,i),this.cancelAllRequests=new Promise(a=>{this.deleteService=()=>Promise.resolve(a())});try{const a=new URL(s);this.customDomain=a.origin,this.region=Da}catch{this.customDomain=null,this.region=s}}_delete(){return this.deleteService()}_url(e){const t=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${t}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${t}.cloudfunctions.net/${e}`}}function WA(n,e,t){n.emulatorOrigin=`http://${e}:${t}`}function QA(n,e,t){return(r=>XA(n,e,r,t||{}))}function YA(n,e,t){return(r=>Tm(n,e,r,t||{}))}async function JA(n,e,t,r){t["Content-Type"]="application/json";let i;try{i=await r(n,{method:"POST",body:JSON.stringify(e),headers:t})}catch{return{status:0,json:null}}let s=null;try{s=await i.json()}catch{}return{status:i.status,json:s}}function XA(n,e,t,r){const i=n._url(e);return Tm(n,i,t,r)}async function Tm(n,e,t,r){t=Ca(t);const i={data:t},s={},o=await n.contextProvider.getContext(r.limitedUseAppCheckTokens);o.authToken&&(s.Authorization="Bearer "+o.authToken),o.messagingToken&&(s["Firebase-Instance-ID-Token"]=o.messagingToken),o.appCheckToken!==null&&(s["X-Firebase-AppCheck"]=o.appCheckToken);const a=r.timeout||7e4,c=KA(a),u=await Promise.race([JA(e,i,s,n.fetchImpl),c.promise,n.cancelAllRequests]);if(c.cancel(),!u)throw new zn("cancelled","Firebase Functions instance was deleted.");const l=jA(u.status,u.json);if(l)throw l;if(!u.json)throw new zn("internal","Response is not valid JSON object.");let h=u.json.data;if(typeof h>"u"&&(h=u.json.result),typeof h>"u")throw new zn("internal","Response is missing data field.");return{data:$s(h)}}const oh="@firebase/functions",ah="0.11.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ZA="auth-internal",eR="app-check-internal",tR="messaging-internal";function nR(n,e){const t=(r,{instanceIdentifier:i})=>{const s=r.getProvider("app").getImmediate(),o=r.getProvider(ZA),a=r.getProvider(tR),c=r.getProvider(eR);return new HA(s,o,a,c,i,n)};Dt(new st(hu,t,"PUBLIC").setMultipleInstances(!0)),Be(oh,ah,e),Be(oh,ah,"esm2017")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rR(n=Oa(),e=Da){const r=cr(M(n),hu).getImmediate({identifier:e}),i=Na("functions");return i&&wm(r,...i),r}function wm(n,e,t){WA(M(n),e,t)}function iR(n,e,t){return QA(M(n),e,t)}function sR(n,e,t){return YA(M(n),e,t)}nR(fetch.bind(self));const OP=Object.freeze(Object.defineProperty({__proto__:null,connectFunctionsEmulator:wm,getFunctions:rR,httpsCallable:iR,httpsCallableFromURL:sR},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vm="firebasestorage.googleapis.com",Am="storageBucket",oR=120*1e3,aR=600*1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class se extends je{constructor(e,t,r=0){super(Ko(e),`Firebase Storage: ${t} (${Ko(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,se.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return Ko(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var re;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(re||(re={}));function Ko(n){return"storage/"+n}function du(){const n="An unknown error occurred, please check the error payload for server response.";return new se(re.UNKNOWN,n)}function cR(n){return new se(re.OBJECT_NOT_FOUND,"Object '"+n+"' does not exist.")}function uR(n){return new se(re.QUOTA_EXCEEDED,"Quota for bucket '"+n+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function lR(){const n="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new se(re.UNAUTHENTICATED,n)}function hR(){return new se(re.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function dR(n){return new se(re.UNAUTHORIZED,"User does not have permission to access '"+n+"'.")}function fR(){return new se(re.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function pR(){return new se(re.CANCELED,"User canceled the upload/download.")}function mR(n){return new se(re.INVALID_URL,"Invalid URL '"+n+"'.")}function gR(n){return new se(re.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function _R(){return new se(re.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+Am+"' property when initializing the app?")}function yR(){return new se(re.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function IR(){return new se(re.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function ER(n){return new se(re.UNSUPPORTED_ENVIRONMENT,`${n} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function Va(n){return new se(re.INVALID_ARGUMENT,n)}function Rm(){return new se(re.APP_DELETED,"The Firebase app was deleted.")}function TR(n){return new se(re.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function Qr(n,e){return new se(re.INVALID_FORMAT,"String does not match format '"+n+"': "+e)}function Nr(n){throw new se(re.INTERNAL_ERROR,"Internal error: "+n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oe{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let r;try{r=Oe.makeFromUrl(e,t)}catch{return new Oe(e,"")}if(r.path==="")return r;throw gR(e)}static makeFromUrl(e,t){let r=null;const i="([A-Za-z0-9.\\-_]+)";function s(D){D.path.charAt(D.path.length-1)==="/"&&(D.path_=D.path_.slice(0,-1))}const o="(/(.*))?$",a=new RegExp("^gs://"+i+o,"i"),c={bucket:1,path:3};function u(D){D.path_=decodeURIComponent(D.path)}const l="v[A-Za-z0-9_]+",h=t.replace(/[.]/g,"\\."),d="(/([^?#]*).*)?$",f=new RegExp(`^https?://${h}/${l}/b/${i}/o${d}`,"i"),I={bucket:1,path:3},E=t===vm?"(?:storage.googleapis.com|storage.cloud.google.com)":t,y="([^?#]*)",P=new RegExp(`^https?://${E}/${i}/${y}`,"i"),A=[{regex:a,indices:c,postModify:s},{regex:f,indices:I,postModify:u},{regex:P,indices:{bucket:1,path:2},postModify:u}];for(let D=0;D<A.length;D++){const $=A[D],O=$.regex.exec(e);if(O){const Z=O[$.indices.bucket];let we=O[$.indices.path];we||(we=""),r=new Oe(Z,we),$.postModify(r);break}}if(r==null)throw mR(e);return r}}class wR{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vR(n,e,t){let r=1,i=null,s=null,o=!1,a=0;function c(){return a===2}let u=!1;function l(...y){u||(u=!0,e.apply(null,y))}function h(y){i=setTimeout(()=>{i=null,n(f,c())},y)}function d(){s&&clearTimeout(s)}function f(y,...P){if(u){d();return}if(y){d(),l.call(null,y,...P);return}if(c()||o){d(),l.call(null,y,...P);return}r<64&&(r*=2);let A;a===1?(a=2,A=0):A=(r+Math.random())*1e3,h(A)}let I=!1;function E(y){I||(I=!0,d(),!u&&(i!==null?(y||(a=2),clearTimeout(i),h(0)):y||(a=1)))}return h(0),s=setTimeout(()=>{o=!0,E(!0)},t),E}function AR(n){n(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function RR(n){return n!==void 0}function PR(n){return typeof n=="object"&&!Array.isArray(n)}function fu(n){return typeof n=="string"||n instanceof String}function ch(n){return pu()&&n instanceof Blob}function pu(){return typeof Blob<"u"}function uh(n,e,t,r){if(r<e)throw Va(`Invalid value for '${n}'. Expected ${e} or greater.`);if(r>t)throw Va(`Invalid value for '${n}'. Expected ${t} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mu(n,e,t){let r=e;return t==null&&(r=`https://${e}`),`${t}://${r}/v0${n}`}function Pm(n){const e=encodeURIComponent;let t="?";for(const r in n)if(n.hasOwnProperty(r)){const i=e(r)+"="+e(n[r]);t=t+i+"&"}return t=t.slice(0,-1),t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var un;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(un||(un={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function SR(n,e){const t=n>=500&&n<600,i=[408,429].indexOf(n)!==-1,s=e.indexOf(n)!==-1;return t||i||s}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bR{constructor(e,t,r,i,s,o,a,c,u,l,h,d=!0){this.url_=e,this.method_=t,this.headers_=r,this.body_=i,this.successCodes_=s,this.additionalRetryCodes_=o,this.callback_=a,this.errorCallback_=c,this.timeout_=u,this.progressCallback_=l,this.connectionFactory_=h,this.retry=d,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((f,I)=>{this.resolve_=f,this.reject_=I,this.start_()})}start_(){const e=(r,i)=>{if(i){r(!1,new rs(!1,null,!0));return}const s=this.connectionFactory_();this.pendingConnection_=s;const o=a=>{const c=a.loaded,u=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,u)};this.progressCallback_!==null&&s.addUploadProgressListener(o),s.send(this.url_,this.method_,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&s.removeUploadProgressListener(o),this.pendingConnection_=null;const a=s.getErrorCode()===un.NO_ERROR,c=s.getStatus();if(!a||SR(c,this.additionalRetryCodes_)&&this.retry){const l=s.getErrorCode()===un.ABORT;r(!1,new rs(!1,null,l));return}const u=this.successCodes_.indexOf(c)!==-1;r(!0,new rs(u,s))})},t=(r,i)=>{const s=this.resolve_,o=this.reject_,a=i.connection;if(i.wasSuccessCode)try{const c=this.callback_(a,a.getResponse());RR(c)?s(c):s()}catch(c){o(c)}else if(a!==null){const c=du();c.serverResponse=a.getErrorText(),this.errorCallback_?o(this.errorCallback_(a,c)):o(c)}else if(i.canceled){const c=this.appDelete_?Rm():pR();o(c)}else{const c=fR();o(c)}};this.canceled_?t(!1,new rs(!1,null,!0)):this.backoffId_=vR(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&AR(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class rs{constructor(e,t,r){this.wasSuccessCode=e,this.connection=t,this.canceled=!!r}}function CR(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function DR(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function VR(n,e){e&&(n["X-Firebase-GMPID"]=e)}function kR(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function NR(n,e,t,r,i,s,o=!0){const a=Pm(n.urlParams),c=n.url+a,u=Object.assign({},n.headers);return VR(u,e),CR(u,t),DR(u,s),kR(u,r),new bR(c,n.method,u,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,i,o)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xR(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function OR(...n){const e=xR();if(e!==void 0){const t=new e;for(let r=0;r<n.length;r++)t.append(n[r]);return t.getBlob()}else{if(pu())return new Blob(n);throw new se(re.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function LR(n,e,t){return n.webkitSlice?n.webkitSlice(e,t):n.mozSlice?n.mozSlice(e,t):n.slice?n.slice(e,t):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function MR(n){if(typeof atob>"u")throw ER("base-64");return atob(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Je={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class Ho{constructor(e,t){this.data=e,this.contentType=t||null}}function FR(n,e){switch(n){case Je.RAW:return new Ho(Sm(e));case Je.BASE64:case Je.BASE64URL:return new Ho(bm(n,e));case Je.DATA_URL:return new Ho(BR(e),qR(e))}throw du()}function Sm(n){const e=[];for(let t=0;t<n.length;t++){let r=n.charCodeAt(t);if(r<=127)e.push(r);else if(r<=2047)e.push(192|r>>6,128|r&63);else if((r&64512)===55296)if(!(t<n.length-1&&(n.charCodeAt(t+1)&64512)===56320))e.push(239,191,189);else{const s=r,o=n.charCodeAt(++t);r=65536|(s&1023)<<10|o&1023,e.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63)}else(r&64512)===56320?e.push(239,191,189):e.push(224|r>>12,128|r>>6&63,128|r&63)}return new Uint8Array(e)}function UR(n){let e;try{e=decodeURIComponent(n)}catch{throw Qr(Je.DATA_URL,"Malformed data URL.")}return Sm(e)}function bm(n,e){switch(n){case Je.BASE64:{const i=e.indexOf("-")!==-1,s=e.indexOf("_")!==-1;if(i||s)throw Qr(n,"Invalid character '"+(i?"-":"_")+"' found: is it base64url encoded?");break}case Je.BASE64URL:{const i=e.indexOf("+")!==-1,s=e.indexOf("/")!==-1;if(i||s)throw Qr(n,"Invalid character '"+(i?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let t;try{t=MR(e)}catch(i){throw i.message.includes("polyfill")?i:Qr(n,"Invalid character found")}const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}class Cm{constructor(e){this.base64=!1,this.contentType=null;const t=e.match(/^data:([^,]+)?,/);if(t===null)throw Qr(Je.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const r=t[1]||null;r!=null&&(this.base64=$R(r,";base64"),this.contentType=this.base64?r.substring(0,r.length-7):r),this.rest=e.substring(e.indexOf(",")+1)}}function BR(n){const e=new Cm(n);return e.base64?bm(Je.BASE64,e.rest):UR(e.rest)}function qR(n){return new Cm(n).contentType}function $R(n,e){return n.length>=e.length?n.substring(n.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class At{constructor(e,t){let r=0,i="";ch(e)?(this.data_=e,r=e.size,i=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),r=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),r=e.length),this.size_=r,this.type_=i}size(){return this.size_}type(){return this.type_}slice(e,t){if(ch(this.data_)){const r=this.data_,i=LR(r,e,t);return i===null?null:new At(i)}else{const r=new Uint8Array(this.data_.buffer,e,t-e);return new At(r,!0)}}static getBlob(...e){if(pu()){const t=e.map(r=>r instanceof At?r.data_:r);return new At(OR.apply(null,t))}else{const t=e.map(o=>fu(o)?FR(Je.RAW,o).data:o.data_);let r=0;t.forEach(o=>{r+=o.byteLength});const i=new Uint8Array(r);let s=0;return t.forEach(o=>{for(let a=0;a<o.length;a++)i[s++]=o[a]}),new At(i,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dm(n){let e;try{e=JSON.parse(n)}catch{return null}return PR(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GR(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function jR(n,e){const t=e.split("/").filter(r=>r.length>0).join("/");return n.length===0?t:n+"/"+t}function Vm(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zR(n,e){return e}class be{constructor(e,t,r,i){this.server=e,this.local=t||e,this.writable=!!r,this.xform=i||zR}}let is=null;function KR(n){return!fu(n)||n.length<2?n:Vm(n)}function km(){if(is)return is;const n=[];n.push(new be("bucket")),n.push(new be("generation")),n.push(new be("metageneration")),n.push(new be("name","fullPath",!0));function e(s,o){return KR(o)}const t=new be("name");t.xform=e,n.push(t);function r(s,o){return o!==void 0?Number(o):o}const i=new be("size");return i.xform=r,n.push(i),n.push(new be("timeCreated")),n.push(new be("updated")),n.push(new be("md5Hash",null,!0)),n.push(new be("cacheControl",null,!0)),n.push(new be("contentDisposition",null,!0)),n.push(new be("contentEncoding",null,!0)),n.push(new be("contentLanguage",null,!0)),n.push(new be("contentType",null,!0)),n.push(new be("metadata","customMetadata",!0)),is=n,is}function HR(n,e){function t(){const r=n.bucket,i=n.fullPath,s=new Oe(r,i);return e._makeStorageReference(s)}Object.defineProperty(n,"ref",{get:t})}function WR(n,e,t){const r={};r.type="file";const i=t.length;for(let s=0;s<i;s++){const o=t[s];r[o.local]=o.xform(r,e[o.server])}return HR(r,n),r}function Nm(n,e,t){const r=Dm(e);return r===null?null:WR(n,r,t)}function QR(n,e,t,r){const i=Dm(e);if(i===null||!fu(i.downloadTokens))return null;const s=i.downloadTokens;if(s.length===0)return null;const o=encodeURIComponent;return s.split(",").map(u=>{const l=n.bucket,h=n.fullPath,d="/b/"+o(l)+"/o/"+o(h),f=mu(d,t,r),I=Pm({alt:"media",token:u});return f+I})[0]}function YR(n,e){const t={},r=e.length;for(let i=0;i<r;i++){const s=e[i];s.writable&&(t[s.server]=n[s.local])}return JSON.stringify(t)}class xm{constructor(e,t,r,i){this.url=e,this.method=t,this.handler=r,this.timeout=i,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Om(n){if(!n)throw du()}function JR(n,e){function t(r,i){const s=Nm(n,i,e);return Om(s!==null),s}return t}function XR(n,e){function t(r,i){const s=Nm(n,i,e);return Om(s!==null),QR(s,i,n.host,n._protocol)}return t}function Lm(n){function e(t,r){let i;return t.getStatus()===401?t.getErrorText().includes("Firebase App Check token is invalid")?i=hR():i=lR():t.getStatus()===402?i=uR(n.bucket):t.getStatus()===403?i=dR(n.path):i=r,i.status=t.getStatus(),i.serverResponse=r.serverResponse,i}return e}function ZR(n){const e=Lm(n);function t(r,i){let s=e(r,i);return r.getStatus()===404&&(s=cR(n.path)),s.serverResponse=i.serverResponse,s}return t}function eP(n,e,t){const r=e.fullServerUrl(),i=mu(r,n.host,n._protocol),s="GET",o=n.maxOperationRetryTime,a=new xm(i,s,XR(n,t),o);return a.errorHandler=ZR(e),a}function tP(n,e){return n&&n.contentType||e&&e.type()||"application/octet-stream"}function nP(n,e,t){const r=Object.assign({},t);return r.fullPath=n.path,r.size=e.size(),r.contentType||(r.contentType=tP(null,e)),r}function rP(n,e,t,r,i){const s=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function a(){let A="";for(let D=0;D<2;D++)A=A+Math.random().toString().slice(2);return A}const c=a();o["Content-Type"]="multipart/related; boundary="+c;const u=nP(e,r,i),l=YR(u,t),h="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+l+`\r
--`+c+`\r
Content-Type: `+u.contentType+`\r
\r
`,d=`\r
--`+c+"--",f=At.getBlob(h,r,d);if(f===null)throw yR();const I={name:u.fullPath},E=mu(s,n.host,n._protocol),y="POST",P=n.maxUploadRetryTime,C=new xm(E,y,JR(n,t),P);return C.urlParams=I,C.headers=o,C.body=f.uploadData(),C.errorHandler=Lm(e),C}class iP{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=un.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=un.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=un.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,t,r,i){if(this.sent_)throw Nr("cannot .send() more than once");if(this.sent_=!0,this.xhr_.open(t,e,!0),i!==void 0)for(const s in i)i.hasOwnProperty(s)&&this.xhr_.setRequestHeader(s,i[s].toString());return r!==void 0?this.xhr_.send(r):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw Nr("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw Nr("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw Nr("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw Nr("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class sP extends iP{initXhr(){this.xhr_.responseType="text"}}function Mm(){return new sP}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vn{constructor(e,t){this._service=e,t instanceof Oe?this._location=t:this._location=Oe.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new vn(e,t)}get root(){const e=new Oe(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return Vm(this._location.path)}get storage(){return this._service}get parent(){const e=GR(this._location.path);if(e===null)return null;const t=new Oe(this._location.bucket,e);return new vn(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw TR(e)}}function oP(n,e,t){n._throwIfRoot("uploadBytes");const r=rP(n.storage,n._location,km(),new At(e,!0),t);return n.storage.makeRequestWithTokens(r,Mm).then(i=>({metadata:i,ref:n}))}function aP(n){n._throwIfRoot("getDownloadURL");const e=eP(n.storage,n._location,km());return n.storage.makeRequestWithTokens(e,Mm).then(t=>{if(t===null)throw IR();return t})}function cP(n,e){const t=jR(n._location.path,e),r=new Oe(n._location.bucket,t);return new vn(n.storage,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uP(n){return/^[A-Za-z]+:\/\//.test(n)}function lP(n,e){return new vn(n,e)}function Fm(n,e){if(n instanceof gu){const t=n;if(t._bucket==null)throw _R();const r=new vn(t,t._bucket);return e!=null?Fm(r,e):r}else return e!==void 0?cP(n,e):n}function hP(n,e){if(e&&uP(e)){if(n instanceof gu)return lP(n,e);throw Va("To use ref(service, url), the first argument must be a Storage instance.")}else return Fm(n,e)}function lh(n,e){const t=e==null?void 0:e[Am];return t==null?null:Oe.makeFromBucketSpec(t,n)}function dP(n,e,t,r={}){n.host=`${e}:${t}`,n._protocol="http";const{mockUserToken:i}=r;i&&(n._overrideAuthToken=typeof i=="string"?i:_h(i,n.app.options.projectId))}class gu{constructor(e,t,r,i,s){this.app=e,this._authProvider=t,this._appCheckProvider=r,this._url=i,this._firebaseVersion=s,this._bucket=null,this._host=vm,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=oR,this._maxUploadRetryTime=aR,this._requests=new Set,i!=null?this._bucket=Oe.makeFromBucketSpec(i,this._host):this._bucket=lh(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=Oe.makeFromBucketSpec(this._url,e):this._bucket=lh(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){uh("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){uh("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new vn(this,e)}_makeRequest(e,t,r,i,s=!0){if(this._deleted)return new wR(Rm());{const o=NR(e,this._appId,r,i,t,this._firebaseVersion,s);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,t){const[r,i]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,r,i).getPromise()}}const hh="@firebase/storage",dh="0.12.2";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Um="storage";function LP(n,e,t){return n=M(n),oP(n,e,t)}function MP(n){return n=M(n),aP(n)}function FP(n,e){return n=M(n),hP(n,e)}function UP(n=Oa(),e){n=M(n);const r=cr(n,Um).getImmediate({identifier:e}),i=Na("storage");return i&&fP(r,...i),r}function fP(n,e,t,r={}){dP(n,e,t,r)}function pP(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),r=n.getProvider("auth-internal"),i=n.getProvider("app-check-internal");return new gu(t,r,i,e,An)}function mP(){Dt(new st(Um,pP,"PUBLIC").setMultipleInstances(!0)),Be(hh,dh,""),Be(hh,dh,"esm2017")}mP();export{uA as A,rA as B,DA as C,CA as D,ur as E,bA as F,yt as G,NA as H,_v as I,lA as J,hA as K,oA as L,Uv as M,Bv as N,dA as O,iR as P,xA as Q,xP as R,OP as S,IP as a,ay as b,EP as c,TP as d,bP as e,PP as f,MP as g,vP as h,LP as i,dE as j,Yg as k,yP as l,SP as m,CP as n,RP as o,_P as p,wv as q,FP as r,wP as s,vv as t,AP as u,rR as v,UP as w,sA as x,Yp as y,fA as z};
