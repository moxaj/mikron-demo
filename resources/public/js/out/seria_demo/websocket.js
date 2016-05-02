// Compiled by ClojureScript 1.7.170 {:static-fns true, :optimize-constants true}
goog.provide('seria_demo.websocket');
goog.require('cljs.core');
seria_demo.websocket.field_map = new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$on_DASH_message,"onmessage",cljs.core.cst$kw$on_DASH_open,"onopen",cljs.core.cst$kw$on_DASH_error,"onerror",cljs.core.cst$kw$on_DASH_close,"onclose",cljs.core.cst$kw$binary_DASH_type,"binaryType"], null);
seria_demo.websocket.open = (function seria_demo$websocket$open(url,args){
var websocket = (new WebSocket(url));
cljs.core.run_BANG_(((function (websocket){
return (function (p__11886){
var vec__11887 = p__11886;
var field = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__11887,(0),null);
var value = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__11887,(1),null);
var temp__4657__auto__ = (seria_demo.websocket.field_map.cljs$core$IFn$_invoke$arity$1 ? seria_demo.websocket.field_map.cljs$core$IFn$_invoke$arity$1(field) : seria_demo.websocket.field_map.call(null,field));
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
seria_demo.websocket.open_QMARK_ = (function seria_demo$websocket$open_QMARK_(websocket){
var and__4670__auto__ = websocket;
if(cljs.core.truth_(and__4670__auto__)){
return cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2((1),websocket.readyState);
} else {
return and__4670__auto__;
}
});
seria_demo.websocket.send_BANG_ = (function seria_demo$websocket$send_BANG_(websocket,message){
if(cljs.core.truth_(seria_demo.websocket.open_QMARK_(websocket))){
websocket.send(message);

return true;
} else {
return false;
}
});
