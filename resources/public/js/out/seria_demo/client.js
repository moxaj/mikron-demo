// Compiled by ClojureScript 1.7.170 {:static-fns true, :optimize-constants true}
goog.provide('seria_demo.client');
goog.require('cljs.core');
goog.require('seria_demo.websocket');
goog.require('seria_demo.common');
goog.require('cljs.pprint');
seria_demo.client.ws_atom = (cljs.core.atom.cljs$core$IFn$_invoke$arity$1 ? cljs.core.atom.cljs$core$IFn$_invoke$arity$1(null) : cljs.core.atom.call(null,null));
seria_demo.client.websocket_callbacks = new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$on_DASH_message,(function (event){
cljs.core.println.cljs$core$IFn$_invoke$arity$variadic(cljs.core.array_seq(["Message received:"], 0));

cljs.pprint.pprint.cljs$core$IFn$_invoke$arity$1(cljs.core.cst$kw$value.cljs$core$IFn$_invoke$arity$1((function (){var G__13772 = event.data;
return (seria_demo.common.unpack.cljs$core$IFn$_invoke$arity$1 ? seria_demo.common.unpack.cljs$core$IFn$_invoke$arity$1(G__13772) : seria_demo.common.unpack.call(null,G__13772));
})()));

cljs.core.println.cljs$core$IFn$_invoke$arity$variadic(cljs.core.array_seq([[cljs.core.str("Size: "),cljs.core.str(event.data.byteLength),cljs.core.str(" bytes")].join('')], 0));

return seria_demo.websocket.send_BANG_((cljs.core.deref.cljs$core$IFn$_invoke$arity$1 ? cljs.core.deref.cljs$core$IFn$_invoke$arity$1(seria_demo.client.ws_atom) : cljs.core.deref.call(null,seria_demo.client.ws_atom)),event.data);
}),cljs.core.cst$kw$on_DASH_open,(function (){
return cljs.core.println.cljs$core$IFn$_invoke$arity$variadic(cljs.core.array_seq(["Channel opened"], 0));
}),cljs.core.cst$kw$on_DASH_error,(function (event){
return cljs.core.println.cljs$core$IFn$_invoke$arity$variadic(cljs.core.array_seq(["Channel error: ",event.data], 0));
}),cljs.core.cst$kw$on_DASH_close,(function (){
return cljs.core.println.cljs$core$IFn$_invoke$arity$variadic(cljs.core.array_seq(["Channel closed"], 0));
}),cljs.core.cst$kw$binary_DASH_type,"arraybuffer"], null);
seria_demo.client.init_ws_BANG_ = (function seria_demo$client$init_ws_BANG_(){
var G__13775 = seria_demo.client.ws_atom;
var G__13776 = seria_demo.websocket.open([cljs.core.str("ws://"),cljs.core.str(location.host)].join(''),seria_demo.client.websocket_callbacks);
return (cljs.core.reset_BANG_.cljs$core$IFn$_invoke$arity$2 ? cljs.core.reset_BANG_.cljs$core$IFn$_invoke$arity$2(G__13775,G__13776) : cljs.core.reset_BANG_.call(null,G__13775,G__13776));
});
seria_demo.client.init_app_BANG_ = (function seria_demo$client$init_app_BANG_(){
cljs.core.enable_console_print_BANG_();

return seria_demo.client.init_ws_BANG_();
});
window.addEventListener("load",seria_demo.client.init_app_BANG_);
