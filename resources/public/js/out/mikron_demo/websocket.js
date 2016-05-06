// Compiled by ClojureScript 1.8.51 {:static-fns true, :optimize-constants true}
goog.provide('mikron_demo.websocket');
goog.require('cljs.core');
mikron_demo.websocket.field_map = new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$on_DASH_message,"onmessage",cljs.core.cst$kw$on_DASH_open,"onopen",cljs.core.cst$kw$on_DASH_error,"onerror",cljs.core.cst$kw$on_DASH_close,"onclose",cljs.core.cst$kw$binary_DASH_type,"binaryType"], null);
mikron_demo.websocket.open = (function mikron_demo$websocket$open(url,args){
var websocket = (new WebSocket(url));
cljs.core.run_BANG_(((function (websocket){
return (function (p__13717){
var vec__13718 = p__13717;
var field = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__13718,(0),null);
var value = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__13718,(1),null);
var temp__4657__auto__ = (mikron_demo.websocket.field_map.cljs$core$IFn$_invoke$arity$1 ? mikron_demo.websocket.field_map.cljs$core$IFn$_invoke$arity$1(field) : mikron_demo.websocket.field_map.call(null,field));
if(cljs.core.truth_(temp__4657__auto__)){
var js_field = temp__4657__auto__;
return (websocket[js_field] = value);
} else {
return null;
}
});})(websocket))
,args);

return websocket;
});
mikron_demo.websocket.open_QMARK_ = (function mikron_demo$websocket$open_QMARK_(websocket){
var and__6198__auto__ = websocket;
if(cljs.core.truth_(and__6198__auto__)){
return cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2((1),websocket.readyState);
} else {
return and__6198__auto__;
}
});
mikron_demo.websocket.send_BANG_ = (function mikron_demo$websocket$send_BANG_(websocket,message){
if(cljs.core.truth_(mikron_demo.websocket.open_QMARK_(websocket))){
websocket.send(message);

return true;
} else {
return false;
}
});
