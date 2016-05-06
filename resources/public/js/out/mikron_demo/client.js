// Compiled by ClojureScript 1.8.51 {:static-fns true, :optimize-constants true}
goog.provide('mikron_demo.client');
goog.require('cljs.core');
goog.require('mikron_demo.websocket');
goog.require('mikron_demo.common');
goog.require('cljs.pprint');
mikron_demo.client.ws_atom = (cljs.core.atom.cljs$core$IFn$_invoke$arity$1 ? cljs.core.atom.cljs$core$IFn$_invoke$arity$1(null) : cljs.core.atom.call(null,null));
mikron_demo.client.websocket_callbacks = new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$on_DASH_message,(function (event){
cljs.core.println.cljs$core$IFn$_invoke$arity$variadic(cljs.core.array_seq(["Message received:"], 0));

cljs.pprint.pprint.cljs$core$IFn$_invoke$arity$1(cljs.core.cst$kw$value.cljs$core$IFn$_invoke$arity$1((function (){var G__15650 = event.data;
return (mikron_demo.common.unpack.cljs$core$IFn$_invoke$arity$1 ? mikron_demo.common.unpack.cljs$core$IFn$_invoke$arity$1(G__15650) : mikron_demo.common.unpack.call(null,G__15650));
})()));

cljs.core.println.cljs$core$IFn$_invoke$arity$variadic(cljs.core.array_seq([[cljs.core.str("Size: "),cljs.core.str(event.data.byteLength),cljs.core.str(" bytes")].join('')], 0));

return mikron_demo.websocket.send_BANG_((cljs.core.deref.cljs$core$IFn$_invoke$arity$1 ? cljs.core.deref.cljs$core$IFn$_invoke$arity$1(mikron_demo.client.ws_atom) : cljs.core.deref.call(null,mikron_demo.client.ws_atom)),event.data);
}),cljs.core.cst$kw$on_DASH_open,(function (){
return cljs.core.println.cljs$core$IFn$_invoke$arity$variadic(cljs.core.array_seq(["Channel opened"], 0));
}),cljs.core.cst$kw$on_DASH_error,(function (event){
return cljs.core.println.cljs$core$IFn$_invoke$arity$variadic(cljs.core.array_seq(["Channel error: ",event.data], 0));
}),cljs.core.cst$kw$on_DASH_close,(function (){
return cljs.core.println.cljs$core$IFn$_invoke$arity$variadic(cljs.core.array_seq(["Channel closed"], 0));
}),cljs.core.cst$kw$binary_DASH_type,"arraybuffer"], null);
mikron_demo.client.init_ws_BANG_ = (function mikron_demo$client$init_ws_BANG_(){
var G__15653 = mikron_demo.client.ws_atom;
var G__15654 = mikron_demo.websocket.open([cljs.core.str("ws://"),cljs.core.str(location.host)].join(''),mikron_demo.client.websocket_callbacks);
return (cljs.core.reset_BANG_.cljs$core$IFn$_invoke$arity$2 ? cljs.core.reset_BANG_.cljs$core$IFn$_invoke$arity$2(G__15653,G__15654) : cljs.core.reset_BANG_.call(null,G__15653,G__15654));
});
mikron_demo.client.init_app_BANG_ = (function mikron_demo$client$init_app_BANG_(){
cljs.core.enable_console_print_BANG_();

return mikron_demo.client.init_ws_BANG_();
});
window.addEventListener("load",mikron_demo.client.init_app_BANG_);
