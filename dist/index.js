!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["ticalc-usb"]=t():e["ticalc-usb"]=t()}(window,(function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=3)}([function(e,t,n){function r(e,t){const n=e.data&&e.data.length||0,r=i(n,4);r.splice(4,0,...i(e.type,t));const o=new Uint8Array(r.length+n);return o.set(r),o.set(e.data||[],r.length),o}function i(e,t){if(e>Number.MAX_SAFE_INTEGER)throw"Number too big to reliably convert";const n=[];for(;t>0;)t--,n.push(e/Math.pow(256,t)&255);return n}function o(e){if(!function(e){let t=!1;return(e=e.filter(e=>!(0==e&&!t)&&(t=!0,!0))).length<7||7==e.length&&e[0]<=31}(e))throw"Number too big to reliably convert";let t=e.length,n=0,r=0;for(;t>0;)t--,n+=(255&e[r++])*Math.pow(256,t);return n}e.exports={constructRawPacket:function(e){return r(e,1)},destructRawPacket:function(e){return{size:o(e.slice(0,4)),type:e[4],data:e.slice(5)}},constructVirtualPacket:function(e){return r(e,2)},destructVirtualPacket:function(e){return{size:o(e.slice(0,4)),type:o(e.slice(4,6)),data:e.slice(6)}},constructParameters:function(e){return new Uint8Array([i(e.length,2),...e.map(e=>[i(e.type,2),i(e.size,2),i(e.value,e.size)].flat())].flat())},destructParameters:function(e){const t=[],n=o(e.slice(0,2));let r=2;for(let i=0;i<n;i++){const n=o(e.slice(r+3,r+5));t.push({type:o(e.slice(r,r+2)),ok:0==e[r+2],size:n,value:o(e.slice(r+5,r+5+n))}),r+=5+n}return t},intToBytes:i,bytesToInt:o,asciiToBytes:function(e,t){t=t||e.length+1;const r=new("undefined"!=typeof TextEncoder?TextEncoder:n(2).TextEncoder)("utf-8").encode(e),i=new Uint8Array(t);return i.set(r.slice(0,t)),i},bytesToAscii:function(e){const t=e.indexOf(0);t>=0&&(e=e.slice(0,t));return new("undefined"!=typeof TextDecoder?TextDecoder:n(2).TextDecoder)("utf-8").decode(e)}}},function(e,t){e.exports={rawPacketTypes:{DUSB_RPKT_BUF_SIZE_REQ:1,DUSB_RPKT_BUF_SIZE_ALLOC:2,DUSB_RPKT_VIRT_DATA:3,DUSB_RPKT_VIRT_DATA_LAST:4,DUSB_RPKT_VIRT_DATA_ACK:5},virtualPacketTypes:{DUSB_VPKT_PING:1,DUSB_VPKT_OS_BEGIN:2,DUSB_VPKT_OS_ACK:3,DUSB_VPKT_OS_HEADER:4,DUSB_VPKT_OS_DATA:5,DUSB_VPKT_EOT_ACK:6,DUSB_VPKT_PARM_REQ:7,DUSB_VPKT_PARM_DATA:8,DUSB_VPKT_DIR_REQ:9,DUSB_VPKT_VAR_HDR:10,DUSB_VPKT_RTS:11,DUSB_VPKT_VAR_REQ:12,DUSB_VPKT_VAR_CNTS:13,DUSB_VPKT_PARM_SET:14,DUSB_VPKT_MODIF_VAR:16,DUSB_VPKT_EXECUTE:17,DUSB_VPKT_MODE_SET:18,DUSB_VPKT_DATA_ACK:43520,DUSB_VPKT_DELAY_ACK:47872,DUSB_VPKT_EOT:56576,DUSB_VPKT_ERROR:60928,HEADER_SIZE:6},modes:{DUSB_MODE_STARTUP:[0,1,0,1,0,0,0,0,7,208],DUSB_MODE_BASIC:[0,2,0,1,0,0,0,0,7,208],DUSB_MODE_NORMAL:[0,3,0,1,0,0,0,0,7,208]},executeCommands:{DUSB_EID_PRGM:0,DUSB_EID_ASM:1,DUSB_EID_APP:2,DUSB_EID_KEY:3,DUSB_EID_UNKNOWN:4},parameters:{DUSB_PID_FREE_RAM:14,DUSB_PID_FREE_FLASH:17},attributes:{DUSB_AID_VAR_TYPE:2,DUSB_AID_ARCHIVED:3,DUSB_AID_VAR_VERSION:8},transferModes:{SILENT:1,NON_SILENT:2}}},function(e,t,n){(function(e){var r=Object.getOwnPropertyDescriptors||function(e){for(var t=Object.keys(e),n={},r=0;r<t.length;r++)n[t[r]]=Object.getOwnPropertyDescriptor(e,t[r]);return n},i=/%[sdj%]/g;t.format=function(e){if(!h(e)){for(var t=[],n=0;n<arguments.length;n++)t.push(s(arguments[n]));return t.join(" ")}n=1;for(var r=arguments,o=r.length,c=String(e).replace(i,(function(e){if("%%"===e)return"%";if(n>=o)return e;switch(e){case"%s":return String(r[n++]);case"%d":return Number(r[n++]);case"%j":try{return JSON.stringify(r[n++])}catch(e){return"[Circular]"}default:return e}})),a=r[n];n<o;a=r[++n])y(a)||!S(a)?c+=" "+a:c+=" "+s(a);return c},t.deprecate=function(n,r){if(void 0!==e&&!0===e.noDeprecation)return n;if(void 0===e)return function(){return t.deprecate(n,r).apply(this,arguments)};var i=!1;return function(){if(!i){if(e.throwDeprecation)throw new Error(r);e.traceDeprecation?console.trace(r):console.error(r),i=!0}return n.apply(this,arguments)}};var o,c={};function s(e,n){var r={seen:[],stylize:u};return arguments.length>=3&&(r.depth=arguments[2]),arguments.length>=4&&(r.colors=arguments[3]),_(n)?r.showHidden=n:n&&t._extend(r,n),b(r.showHidden)&&(r.showHidden=!1),b(r.depth)&&(r.depth=2),b(r.colors)&&(r.colors=!1),b(r.customInspect)&&(r.customInspect=!0),r.colors&&(r.stylize=a),l(r,e,r.depth)}function a(e,t){var n=s.styles[t];return n?"["+s.colors[n][0]+"m"+e+"["+s.colors[n][1]+"m":e}function u(e,t){return e}function l(e,n,r){if(e.customInspect&&n&&v(n.inspect)&&n.inspect!==t.inspect&&(!n.constructor||n.constructor.prototype!==n)){var i=n.inspect(r,e);return h(i)||(i=l(e,i,r)),i}var o=function(e,t){if(b(t))return e.stylize("undefined","undefined");if(h(t)){var n="'"+JSON.stringify(t).replace(/^"|"$/g,"").replace(/'/g,"\\'").replace(/\\"/g,'"')+"'";return e.stylize(n,"string")}if(T(t))return e.stylize(""+t,"number");if(_(t))return e.stylize(""+t,"boolean");if(y(t))return e.stylize("null","null")}(e,n);if(o)return o;var c=Object.keys(n),s=function(e){var t={};return e.forEach((function(e,n){t[e]=!0})),t}(c);if(e.showHidden&&(c=Object.getOwnPropertyNames(n)),P(n)&&(c.indexOf("message")>=0||c.indexOf("description")>=0))return f(n);if(0===c.length){if(v(n)){var a=n.name?": "+n.name:"";return e.stylize("[Function"+a+"]","special")}if(g(n))return e.stylize(RegExp.prototype.toString.call(n),"regexp");if(D(n))return e.stylize(Date.prototype.toString.call(n),"date");if(P(n))return f(n)}var u,S="",m=!1,w=["{","}"];(d(n)&&(m=!0,w=["[","]"]),v(n))&&(S=" [Function"+(n.name?": "+n.name:"")+"]");return g(n)&&(S=" "+RegExp.prototype.toString.call(n)),D(n)&&(S=" "+Date.prototype.toUTCString.call(n)),P(n)&&(S=" "+f(n)),0!==c.length||m&&0!=n.length?r<0?g(n)?e.stylize(RegExp.prototype.toString.call(n),"regexp"):e.stylize("[Object]","special"):(e.seen.push(n),u=m?function(e,t,n,r,i){for(var o=[],c=0,s=t.length;c<s;++c)I(t,String(c))?o.push(p(e,t,n,r,String(c),!0)):o.push("");return i.forEach((function(i){i.match(/^\d+$/)||o.push(p(e,t,n,r,i,!0))})),o}(e,n,r,s,c):c.map((function(t){return p(e,n,r,s,t,m)})),e.seen.pop(),function(e,t,n){if(e.reduce((function(e,t){return t.indexOf("\n")>=0&&0,e+t.replace(/\u001b\[\d\d?m/g,"").length+1}),0)>60)return n[0]+(""===t?"":t+"\n ")+" "+e.join(",\n  ")+" "+n[1];return n[0]+t+" "+e.join(", ")+" "+n[1]}(u,S,w)):w[0]+S+w[1]}function f(e){return"["+Error.prototype.toString.call(e)+"]"}function p(e,t,n,r,i,o){var c,s,a;if((a=Object.getOwnPropertyDescriptor(t,i)||{value:t[i]}).get?s=a.set?e.stylize("[Getter/Setter]","special"):e.stylize("[Getter]","special"):a.set&&(s=e.stylize("[Setter]","special")),I(r,i)||(c="["+i+"]"),s||(e.seen.indexOf(a.value)<0?(s=y(n)?l(e,a.value,null):l(e,a.value,n-1)).indexOf("\n")>-1&&(s=o?s.split("\n").map((function(e){return"  "+e})).join("\n").substr(2):"\n"+s.split("\n").map((function(e){return"   "+e})).join("\n")):s=e.stylize("[Circular]","special")),b(c)){if(o&&i.match(/^\d+$/))return s;(c=JSON.stringify(""+i)).match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)?(c=c.substr(1,c.length-2),c=e.stylize(c,"name")):(c=c.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'"),c=e.stylize(c,"string"))}return c+": "+s}function d(e){return Array.isArray(e)}function _(e){return"boolean"==typeof e}function y(e){return null===e}function T(e){return"number"==typeof e}function h(e){return"string"==typeof e}function b(e){return void 0===e}function g(e){return S(e)&&"[object RegExp]"===m(e)}function S(e){return"object"==typeof e&&null!==e}function D(e){return S(e)&&"[object Date]"===m(e)}function P(e){return S(e)&&("[object Error]"===m(e)||e instanceof Error)}function v(e){return"function"==typeof e}function m(e){return Object.prototype.toString.call(e)}function w(e){return e<10?"0"+e.toString(10):e.toString(10)}t.debuglog=function(n){if(b(o)&&(o=e.env.NODE_DEBUG||""),n=n.toUpperCase(),!c[n])if(new RegExp("\\b"+n+"\\b","i").test(o)){var r=e.pid;c[n]=function(){var e=t.format.apply(t,arguments);console.error("%s %d: %s",n,r,e)}}else c[n]=function(){};return c[n]},t.inspect=s,s.colors={bold:[1,22],italic:[3,23],underline:[4,24],inverse:[7,27],white:[37,39],grey:[90,39],black:[30,39],blue:[34,39],cyan:[36,39],green:[32,39],magenta:[35,39],red:[31,39],yellow:[33,39]},s.styles={special:"cyan",number:"yellow",boolean:"yellow",undefined:"grey",null:"bold",string:"green",date:"magenta",regexp:"red"},t.isArray=d,t.isBoolean=_,t.isNull=y,t.isNullOrUndefined=function(e){return null==e},t.isNumber=T,t.isString=h,t.isSymbol=function(e){return"symbol"==typeof e},t.isUndefined=b,t.isRegExp=g,t.isObject=S,t.isDate=D,t.isError=P,t.isFunction=v,t.isPrimitive=function(e){return null===e||"boolean"==typeof e||"number"==typeof e||"string"==typeof e||"symbol"==typeof e||void 0===e},t.isBuffer=n(8);var A=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function E(){var e=new Date,t=[w(e.getHours()),w(e.getMinutes()),w(e.getSeconds())].join(":");return[e.getDate(),A[e.getMonth()],t].join(" ")}function I(e,t){return Object.prototype.hasOwnProperty.call(e,t)}t.log=function(){console.log("%s - %s",E(),t.format.apply(t,arguments))},t.inherits=n(9),t._extend=function(e,t){if(!t||!S(t))return e;for(var n=Object.keys(t),r=n.length;r--;)e[n[r]]=t[n[r]];return e};var R="undefined"!=typeof Symbol?Symbol("util.promisify.custom"):void 0;function B(e,t){if(!e){var n=new Error("Promise was rejected with a falsy value");n.reason=e,e=n}return t(e)}t.promisify=function(e){if("function"!=typeof e)throw new TypeError('The "original" argument must be of type Function');if(R&&e[R]){var t;if("function"!=typeof(t=e[R]))throw new TypeError('The "util.promisify.custom" argument must be of type Function');return Object.defineProperty(t,R,{value:t,enumerable:!1,writable:!1,configurable:!0}),t}function t(){for(var t,n,r=new Promise((function(e,r){t=e,n=r})),i=[],o=0;o<arguments.length;o++)i.push(arguments[o]);i.push((function(e,r){e?n(e):t(r)}));try{e.apply(this,i)}catch(e){n(e)}return r}return Object.setPrototypeOf(t,Object.getPrototypeOf(e)),R&&Object.defineProperty(t,R,{value:t,enumerable:!1,writable:!1,configurable:!0}),Object.defineProperties(t,r(e))},t.promisify.custom=R,t.callbackify=function(t){if("function"!=typeof t)throw new TypeError('The "original" argument must be of type Function');function n(){for(var n=[],r=0;r<arguments.length;r++)n.push(arguments[r]);var i=n.pop();if("function"!=typeof i)throw new TypeError("The last argument must be of type Function");var o=this,c=function(){return i.apply(o,arguments)};t.apply(this,n).then((function(t){e.nextTick(c,null,t)}),(function(t){e.nextTick(B,t,c)}))}return Object.setPrototypeOf(n,Object.getPrototypeOf(t)),Object.defineProperties(n,r(t)),n}}).call(this,n(7))},function(e,t,n){e.exports={ticalc:n(4),tifiles:n(10)}},function(e,t,n){const r=[n(5)],i={},o={connect:[],disconnect:[]};e.exports={models:()=>r.map(e=>e.name),choose:async()=>{let e;try{e=await navigator.usb.requestDevice({filters:r.map(e=>e.identifier)})}catch(e){if("No device selected."==e.message)return;throw e}const t=r.find(t=>t.identifier.vendorId==e.vendorId&&t.identifier.productId==e.productId);if(!t)throw"Woops! Could not find device handler. WebUSB's filters are more complicated than I can currently handle.";const n=await t.connect(e);i[e]=n,o.connect.forEach(e=>e(n))},addEventListener:(e,t)=>{if(!Object.keys(o).includes(e))throw"Invalid event name: "+e;o[e].push(t)}},navigator.usb.addEventListener("connect",e=>{const t=i[e.device];console.debug("📱 Calculator connected"),t&&o.connect.forEach(e=>e(t))}),navigator.usb.addEventListener("disconnect",e=>{const t=i[e.device];console.debug("📱 Calculator disconnected"),t&&o.disconnect.forEach(e=>e(t))})},function(e,t,n){e.exports={name:"TI-84 Plus",identifier:{vendorId:1105,productId:57347},connect:e=>new c(e).connect()};const r=n(6),i=n(1),o=n(0);class c{constructor(e){this._d=new r(e),this.name="TI-84 Plus"}async connect(){return await this._d.connect(),this}async isReady(){try{return await this._d.send({type:i.virtualPacketTypes.DUSB_VPKT_PING,data:i.modes.DUSB_MODE_NORMAL}),await this._d.expect(i.virtualPacketTypes.DUSB_VPKT_MODE_SET),!0}catch(e){return console.debug(e),!1}}async pressKey(e){await this._d.send({type:i.virtualPacketTypes.DUSB_VPKT_EXECUTE,data:[0,0,i.executeCommands.DUSB_EID_KEY,0,e]}),await this._d.expect(i.virtualPacketTypes.DUSB_VPKT_DELAY_ACK),await this._d.expect(i.virtualPacketTypes.DUSB_VPKT_DATA_ACK)}async getFreeMem(){await this._d.send({type:i.virtualPacketTypes.DUSB_VPKT_PARM_REQ,data:[0,2,o.intToBytes(i.parameters.DUSB_PID_FREE_RAM,2),o.intToBytes(i.parameters.DUSB_PID_FREE_FLASH,2)].flat()});const e=await this._d.expect(i.virtualPacketTypes.DUSB_VPKT_DELAY_ACK),t=o.bytesToInt(e.data);await this._d.wait(t/1e3);const n=await this._d.expect(i.virtualPacketTypes.DUSB_VPKT_PARM_DATA),r=o.destructParameters(n.data);if(!r.every(e=>e.ok))throw"Could not succesfully get all parameters";return{ram:r.find(e=>e.type==i.parameters.DUSB_PID_FREE_RAM).value,flash:r.find(e=>e.type==i.parameters.DUSB_PID_FREE_FLASH).value}}async sendFile(e){for(let t=0;t<e.entries.length;t++)await this._sendEntry(e.entries[t])}async _sendEntry(e){await this._d.send({type:i.virtualPacketTypes.DUSB_VPKT_RTS,data:[0,e.name.length,...o.asciiToBytes(e.name,e.name.length),0,...o.intToBytes(e.size,4),i.transferModes.SILENT,...o.constructParameters([{type:i.attributes.DUSB_AID_VAR_TYPE,size:4,value:4026990592+e.type},{type:i.attributes.DUSB_AID_ARCHIVED,size:1,value:e.attributes&&e.attributes.archived?1:0},{type:i.attributes.DUSB_AID_VAR_VERSION,size:4,value:e.attributes&&e.attributes.version||0}])]}),await this._d.expect(i.virtualPacketTypes.DUSB_VPKT_DATA_ACK),await this._d.send({type:i.virtualPacketTypes.DUSB_VPKT_VAR_CNTS,data:e.data}),await this._d.expect(i.virtualPacketTypes.DUSB_VPKT_DATA_ACK),await this._d.send({type:i.virtualPacketTypes.DUSB_VPKT_EOT})}}},function(e,t,n){const r=n(1),i=n(0);e.exports=class{constructor(e){this._device=e}async connect(){await this._device.open(),await this._device.selectConfiguration(this._device.configuration.configurationValue);const e=this._device.configuration.interfaces[0];await this._device.claimInterface(e.interfaceNumber),this._inEndpoint=e.alternate.endpoints.find(e=>"in"==e.direction),this._outEndpoint=e.alternate.endpoints.find(e=>"out"==e.direction),this._bufferSize=await this._requestBufferSize(),console.debug(`🖥↔📱 Buffer size ${this._bufferSize} bytes`)}async send(e){if(!e.data||e.data.length<=this._bufferSize-r.virtualPacketTypes.HEADER_SIZE)return await this._send(i.constructRawPacket({type:r.rawPacketTypes.DUSB_RPKT_VIRT_DATA_LAST,data:i.constructVirtualPacket(e)})),void await this._expectAck();let t=this._bufferSize-r.virtualPacketTypes.HEADER_SIZE;await this._send(i.constructRawPacket({type:r.rawPacketTypes.DUSB_RPKT_VIRT_DATA,data:i.constructVirtualPacket({...e,data:e.data.slice(0,t)})})),await this._expectAck();const n=(e.data.length-t)/this._bufferSize,o=(e.data.length-t)%this._bufferSize;for(let c=1;c<=n;c++)await this._send(i.constructRawPacket({type:c!=n||0!=o?r.rawPacketTypes.DUSB_RPKT_VIRT_DATA:r.rawPacketTypes.VIRT_DATA_LAST,data:e.data.slice(t,t+this._bufferSize)})),t+=this._bufferSize,await this._expectAck();0!=o&&(await this._send(i.constructRawPacket({type:r.rawPacketTypes.DUSB_RPKT_VIRT_DATA_LAST,data:e.data.slice(t,t+e.data.length)})),await this._expectAck())}async expect(e){const t=i.destructRawPacket(await this._receive());if(t.type!=r.rawPacketTypes.DUSB_RPKT_VIRT_DATA_LAST)throw`Expected raw packet type VIRT_DATA_LAST, but got ${t.type} instead`;const n=i.destructVirtualPacket(t.data);if(n.type!=e)throw`Expected virtual packet type ${e}, but got ${n.type} instead`;return await this._sendAck(),n}wait(e){return new Promise((t,n)=>{setTimeout(()=>t(),e)})}async _requestBufferSize(){await this._send(i.constructRawPacket({type:r.rawPacketTypes.DUSB_RPKT_BUF_SIZE_REQ,data:[0,0,4,0]}));const e=i.destructRawPacket(await this._receive());if(e.type!=r.rawPacketTypes.DUSB_RPKT_BUF_SIZE_ALLOC)throw`Expected BUF_SIZE_ALLOC, got ${e.type} instead`;return i.bytesToInt(e.data)}_send(e){return console.debug("🖥→📱 Sent:    ",this._prettify(e)),this._device.transferOut(this._outEndpoint.endpointNumber,e)}async _receive(){const e=await this._device.transferIn(this._inEndpoint.endpointNumber,this._inEndpoint.packetSize);if("ok"==!e.status)throw"Error in receiving data from device: "+e.status;const t=new Uint8Array(e.data.buffer);return console.debug("🖥←📱 Received:",this._prettify(t)),t}_sendAck(){return this._send(i.constructRawPacket({type:r.rawPacketTypes.DUSB_RPKT_VIRT_DATA_ACK,data:[224,0]}))}async _expectAck(){const e=i.destructRawPacket(await this._receive());if(e.type!=r.rawPacketTypes.DUSB_RPKT_VIRT_DATA_ACK)throw`Expected ACK, got ${e.type} instead`}_prettify(e){const t=[...e].map(e=>e.toString(16).toUpperCase().padStart(2,"0"));return[t.slice(0,4).join(""),t.slice(4,5).join(""),t.length>10?[t.slice(5,9).join(""),t.slice(9,11).join(""),t.slice(11).join(",")]:t.slice(5).join(",")].flat().join(" ")}}},function(e,t){var n,r,i=e.exports={};function o(){throw new Error("setTimeout has not been defined")}function c(){throw new Error("clearTimeout has not been defined")}function s(e){if(n===setTimeout)return setTimeout(e,0);if((n===o||!n)&&setTimeout)return n=setTimeout,setTimeout(e,0);try{return n(e,0)}catch(t){try{return n.call(null,e,0)}catch(t){return n.call(this,e,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:o}catch(e){n=o}try{r="function"==typeof clearTimeout?clearTimeout:c}catch(e){r=c}}();var a,u=[],l=!1,f=-1;function p(){l&&a&&(l=!1,a.length?u=a.concat(u):f=-1,u.length&&d())}function d(){if(!l){var e=s(p);l=!0;for(var t=u.length;t;){for(a=u,u=[];++f<t;)a&&a[f].run();f=-1,t=u.length}a=null,l=!1,function(e){if(r===clearTimeout)return clearTimeout(e);if((r===c||!r)&&clearTimeout)return r=clearTimeout,clearTimeout(e);try{r(e)}catch(t){try{return r.call(null,e)}catch(t){return r.call(this,e)}}}(e)}}function _(e,t){this.fun=e,this.array=t}function y(){}i.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];u.push(new _(e,t)),1!==u.length||l||s(d)},_.prototype.run=function(){this.fun.apply(null,this.array)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=y,i.addListener=y,i.once=y,i.off=y,i.removeListener=y,i.removeAllListeners=y,i.emit=y,i.prependListener=y,i.prependOnceListener=y,i.listeners=function(e){return[]},i.binding=function(e){throw new Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(e){throw new Error("process.chdir is not supported")},i.umask=function(){return 0}},function(e,t){e.exports=function(e){return e&&"object"==typeof e&&"function"==typeof e.copy&&"function"==typeof e.fill&&"function"==typeof e.readUInt8}},function(e,t){"function"==typeof Object.create?e.exports=function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}})}:e.exports=function(e,t){e.super_=t;var n=function(){};n.prototype=t.prototype,e.prototype=new n,e.prototype.constructor=e}},function(e,t,n){const r=n(0);function i(e,t){const n=[];let r=0;for(;r<t.size;){const i=o(e.slice(r),t);n.push(i),r+=i.entrySize}return n}function o(e,t){const n=function(e,t){const n=r.bytesToInt(e.slice(0,2).reverse()),i=13==n,o=n>12;if("TI-85"==t.calcType)return{size:6+e[5],name:e.slice(5,5+e[5]),attributes:!1};if("TI-86"==t.calcType)return{size:5+o?8:e[5],name:e.slice(5,o?13:5+e[5]),attributes:!1};if(i){const t=r.bytesToInt(e.slice(12,14).reverse());return{size:17,name:e.slice(5,13),attributes:128==t?{archived:!0,version:0}:{archived:!!(32768&t),version:255&t}}}return{size:15,name:e.slice(5,13),attributes:!1}}(e,t),i=r.bytesToInt(e.slice(2,4).reverse());return{name:r.bytesToAscii(n.name),type:e[4],attributes:n.attributes,size:i,data:e.slice(n.size,n.size+i),entrySize:n.size+i,debug:{packetLength:r.bytesToInt(e.slice(0,2).reverse()),ti83p:13==r.bytesToInt(e.slice(0,2).reverse()),padded86:r.bytesToInt(e.slice(0,2).reverse())>12,nameLength:e[4],headerSize:n.size,size2:r.bytesToInt(e.slice(n.size-2,n.size).reverse())}}}function c(e){return 26==e[0]&&12==e[1]&&0==e[2]?"TI-85 style signature present":26==e[0]&&10==e[1]&&0==e[2]?"TI-73/82/83/86 style signature present":"NONE"}e.exports={parseFile:e=>{const t=function(e){switch(r.bytesToAscii(e)){case"**TI73**":return"TI-73";case"**TI82**":return"TI-82";case"**TI83**":return"TI-83";case"**TI83F*":return"TI-84 Plus";case"**TI85**":return"TI-85";case"**TI86**":return"TI-86";case"**TI89**":return"TI-89";case"**TI92**":return"TI-92";case"**TI92P*":return"TI-92 Plus";case"**V200**":return"TI-V200";case"**TICBL*":return"TI-CBL2";default:return"NONE"}}(e.slice(0,8)),n=r.bytesToInt(e.slice(53,55).reverse());return{calcType:t,size:n,comments:r.bytesToAscii(e.slice(11,53)),entries:i(e.slice(55),{size:n,calcType:t}),debug:{signature:c(e.slice(8,11)),sizeCorrect:e.length==n+8+3+42+2+2,checksum:e.slice(e.length-2,e.length)}}},isValid:e=>"NONE"!=e.calcType&&e.size>0&&e.debug.sizeCorrect&&e.entries.length>0,isMatch:(e,t)=>e.calcType==t.name}}])}));