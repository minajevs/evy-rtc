(this.webpackJsonpevy=this.webpackJsonpevy||[]).push([[0],{57:function(e,n,t){e.exports=t(70)},70:function(e,n,t){"use strict";t.r(n);var o=t(0),c=t.n(o),a=t(7),r=t.n(a),i=t(23),u=t(11),s=t(46),l=t(101),d=t(102),f=t(22),b=t(12),m=t(20),j=t(47),O=Object(o.createContext)(null),g=function(){return Object(o.useContext)(O)},p=function(e){return{id:e.peer,send:function(n){return e.send(n)}}},v=function(e,n,t){var o={id:n.id,send:function(n){e.emit("host/data",c,n),e.emit("any/data",c,n)}},c={id:n.id,send:function(n){e.emit("peer/data",o,n),e.emit("any/data",o,n)}};e.emit("host/data",c,t),e.emit("any/data",c,t)},h=function(e){var n=Object(o.useState)(new j.EventEmitter),c=Object(u.a)(n,1)[0],a=Object(o.useState)({peer:{id:null,ready:!1},host:{id:null,ready:!1},connections:[],isHost:!1,error:null}),r=Object(u.a)(a,2),i=r[0],s=r[1],l=Object(o.useState)(null),d=Object(u.a)(l,2),m=d[0],O=d[1],g=Object(o.useState)(null),h=Object(u.a)(g,2),E=h[0],y=h[1],C=i.connections,w=Object(o.useCallback)((function(e){console.log("dispatch to host",E),null!==E&&E.send(e),i.isHost&&v(c,m,e)}),[E,i.isHost]),k=Object(o.useCallback)((function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;console.log("dispatch to connections",C),C.forEach((function(t){return(null===n||void 0===n?void 0:n.id)!==t.id?t.send(e):void 0})),i.isHost&&(null===n||void 0===n?void 0:n.id)!==m.id&&v(c,m,e)}),[C,i.isHost]);return Object(o.useEffect)((function(){return Promise.all([t.e(3),t.e(4)]).then(t.t.bind(null,105,7)).then((function(n){var t=n.default,o=new t({host:"peerjs-test-server.herokuapp.com",secure:!0});O(o),console.log("peer created",o);var a=function(e){console.log("creating a host"),c.emit("open"),s((function(n){return Object(b.a)({},n,{isHost:!0,host:Object(b.a)({},n.host,{id:e,ready:!0})})})),o.on("connection",(function(e){console.log("peer connected to host"),s((function(n){return Object(b.a)({},n,{connections:[].concat(Object(f.a)(n.connections),[p(e)])})})),e.on("open",(function(){return c.emit("peer/open",p(e))})),e.on("data",(function(n){console.log("receive data from peer"),c.emit("peer/data",p(e),n),c.emit("any/data",p(e),n)})),e.on("close",(function(){return s((function(n){return Object(b.a)({},n,{connections:n.connections.filter((function(n){return n.id!==p(e).id}))})}))}))}))};o.on("error",(function(e){if(console.log("error happened",e),"unavailable-id"===e.type)return a(i.peer.id);s((function(n){return Object(b.a)({},n,{error:new Error(e.type)})}))})),o.on("open",(function(n){s((function(e){return Object(b.a)({},e,{peer:Object(b.a)({},e.peer,{id:n,ready:!0})})})),null===e?a(n):function(e){console.log("connecting to host");var n=o.connect(e,{serialization:"json"});y(n),n.on("open",(function(){console.log("host is open"),s((function(n){return Object(b.a)({},n,{host:{id:e,ready:!0}})})),c.emit("host/open",p(n))})),n.on("data",(function(e){console.log("receive data from host"),c.emit("host/data",p(n),e),c.emit("any/data",p(n),e)}))}(e)}))})),function(){m&&m.destroy()}}),[]),[i,c,w,k]},E=function(e,n,t,c){!function(e,n,t,c){var a=Object(o.useRef)(t);Object(o.useEffect)((function(){a.current=t}),c),Object(o.useEffect)((function(){console.log(e,t,c);var o=function(){return a.current.apply(a,arguments)};return n.on(e,o),function(){n.removeListener(e,o)}}),[e])}("any/data",e,(function(e,o){Object(m.isActionOf)(n,o)&&t(e,o)}),[n].concat(Object(f.a)(c)))},y=t(48),C=t.n(y),w={login:Object(m.createAction)("login")(),loginResponse:Object(m.createAction)("login/response")(),newUser:Object(m.createAction)("login/new")()},k=C()({currentUser:null,users:[]},(function(e){var n=e.setState;return{addUser:function(e){return n((function(n){return Object(b.a)({},n,{users:[].concat(Object(f.a)(n.users),[e])})}))},initState:function(e){return n(e)}}})),S=Object(u.a)(k,2),U=S[0],x=S[1],M={sendMessage:Object(m.createAction)("message/send")(),receiveMessage:Object(m.createAction)("message/receive")()},A=function(e){Object(s.a)(e);var n=c.a.useState(""),t=Object(u.a)(n,2),a=t[0],r=t[1],i=function(){var e=Object(o.useState)({connecting:!0,messages:[]}),n=Object(u.a)(e,2),t=n[0],c=n[1],a=g(),r=Object(u.a)(a,4),i=(r[0],r[1]),s=r[2],l=r[3],d=Object(o.useContext)(U),m=Object(o.useCallback)((function(e){s(M.sendMessage(e))}),[s]);return Object(o.useEffect)((function(){i.on("host/open",(function(){return c((function(e){return Object(b.a)({},e,{connecting:!1})}))})),i.on("open",(function(){return c((function(e){return Object(b.a)({},e,{connecting:!1})}))}))}),[]),E(i,M.sendMessage,(function(e,n){console.log("on send msg");var t={author:d.users.find((function(n){return n.userId===e.id})),text:n.payload};l(M.receiveMessage(t))}),[d.users,l]),E(i,M.receiveMessage,(function(e,n){console.log("on receive"),c((function(e){return Object(b.a)({},e,{messages:[].concat(Object(f.a)(e.messages),[n.payload])})}))}),[]),[t,m]}(),m=Object(u.a)(i,2),j=m[0],O=m[1],p=function(){var e=Object(o.useContext)(U),n=g(),t=Object(u.a)(n,4),c=(t[0],t[1]),a=t[2],r=t[3],i=Object(o.useCallback)((function(e){a(w.login(e))}),[a]);return Object(o.useEffect)((function(){}),[]),E(c,w.login,(function(n,t){console.log("on login");var o={userId:n.id,username:t.payload},c=Object(b.a)({},e,{users:[].concat(Object(f.a)(e.users),[o])});n.send(w.loginResponse(Object(b.a)({},c,{currentUser:o}))),r(w.newUser(o),n)}),[e,r]),E(c,w.newUser,(function(n,t){console.log("on new user"),e.addUser(t.payload)}),[e.addUser]),E(c,w.loginResponse,(function(n,t){console.log("on login resp"),e.initState(t.payload)}),[e.initState]),[e,i]}(),v=Object(u.a)(p,2),h=v[0],y=v[1],C=Object(o.useCallback)((function(e){y(e),r("")}),[y]),k=Object(o.useCallback)((function(e){O(e),r("")}),[O]);return j.connecting?c.a.createElement(c.a.Fragment,null,"Connecting..."):null===h.currentUser?c.a.createElement(c.a.Fragment,null,c.a.createElement("div",null,"Choose username:"),c.a.createElement(l.a,{value:a,onChange:function(e){return r(e.currentTarget.value)}}),c.a.createElement(d.a,{onClick:function(){return C(a)}},"Send")):c.a.createElement(c.a.Fragment,null,"Current user: ",h.currentUser.username,c.a.createElement("br",null),"Users in the room: ",h.users.map((function(e,n){return c.a.createElement("p",{key:n},e.username," : ",e.userId)})),c.a.createElement("hr",null),j.messages.map((function(e,n){return c.a.createElement("p",{key:n},"[",e.author.username,"]",e.text)})),c.a.createElement(l.a,{value:a,onChange:function(e){return r(e.currentTarget.value)}}),c.a.createElement(d.a,{onClick:function(){return k(a)}},"Send"))},H=function(e){var n,t=e.route,a=void 0===t?"peer":t,r=e.children,s=Object(i.g)("/".concat(a,"/:id")),l=Object(i.f)(),d=h(null!==(n=null===s||void 0===s?void 0:s.params.id)&&void 0!==n?n:null),f=Object(u.a)(d,3),b=f[0];f[1],f[2];return Object(o.useEffect)((function(){void 0===(null===s||void 0===s?void 0:s.params.id)&&null!==b.host.id&&l.push("/".concat(a,"/").concat(b.host.id))}),[s,b.host.id,l]),c.a.createElement(O.Provider,{value:d},r)};var I=function(){return c.a.createElement(i.c,null,c.a.createElement(i.a,{path:"/t/:id"},c.a.createElement(H,null,c.a.createElement(x,null,c.a.createElement(A,null)))),c.a.createElement(i.a,{path:"/"},c.a.createElement(H,null,c.a.createElement(x,null,c.a.createElement(A,null)))))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var R=t(32),F=function(e){var n=e.children;return c.a.createElement(R.a,null,n)};r.a.render(c.a.createElement(c.a.StrictMode,null,c.a.createElement(F,null,c.a.createElement(I,null))),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[57,1,2]]]);
//# sourceMappingURL=main.3b12ae5d.chunk.js.map