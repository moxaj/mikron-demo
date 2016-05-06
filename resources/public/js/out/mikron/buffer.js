// Compiled by ClojureScript 1.8.51 {:static-fns true, :optimize-constants true}
goog.provide('mikron.buffer');
goog.require('cljs.core');
goog.require('mikron.common');

/**
 * @interface
 */
mikron.buffer.Buffer = function(){};

mikron.buffer.read_byte_BANG_ = (function mikron$buffer$read_byte_BANG_(this$){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$read_byte_BANG_$arity$1 == null)))){
return this$.mikron$buffer$Buffer$read_byte_BANG_$arity$1(this$);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.read_byte_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto__.call(null,this$));
} else {
var m__6874__auto____$1 = (mikron.buffer.read_byte_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-byte!",this$);
}
}
}
});

mikron.buffer.read_short_BANG_ = (function mikron$buffer$read_short_BANG_(this$){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$read_short_BANG_$arity$1 == null)))){
return this$.mikron$buffer$Buffer$read_short_BANG_$arity$1(this$);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.read_short_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto__.call(null,this$));
} else {
var m__6874__auto____$1 = (mikron.buffer.read_short_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-short!",this$);
}
}
}
});

mikron.buffer.read_int_BANG_ = (function mikron$buffer$read_int_BANG_(this$){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$read_int_BANG_$arity$1 == null)))){
return this$.mikron$buffer$Buffer$read_int_BANG_$arity$1(this$);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.read_int_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto__.call(null,this$));
} else {
var m__6874__auto____$1 = (mikron.buffer.read_int_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-int!",this$);
}
}
}
});

mikron.buffer.read_long_BANG_ = (function mikron$buffer$read_long_BANG_(this$){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$read_long_BANG_$arity$1 == null)))){
return this$.mikron$buffer$Buffer$read_long_BANG_$arity$1(this$);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.read_long_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto__.call(null,this$));
} else {
var m__6874__auto____$1 = (mikron.buffer.read_long_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-long!",this$);
}
}
}
});

mikron.buffer.read_float_BANG_ = (function mikron$buffer$read_float_BANG_(this$){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$read_float_BANG_$arity$1 == null)))){
return this$.mikron$buffer$Buffer$read_float_BANG_$arity$1(this$);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.read_float_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto__.call(null,this$));
} else {
var m__6874__auto____$1 = (mikron.buffer.read_float_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-float!",this$);
}
}
}
});

mikron.buffer.read_double_BANG_ = (function mikron$buffer$read_double_BANG_(this$){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$read_double_BANG_$arity$1 == null)))){
return this$.mikron$buffer$Buffer$read_double_BANG_$arity$1(this$);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.read_double_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto__.call(null,this$));
} else {
var m__6874__auto____$1 = (mikron.buffer.read_double_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-double!",this$);
}
}
}
});

mikron.buffer.read_char_BANG_ = (function mikron$buffer$read_char_BANG_(this$){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$read_char_BANG_$arity$1 == null)))){
return this$.mikron$buffer$Buffer$read_char_BANG_$arity$1(this$);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.read_char_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto__.call(null,this$));
} else {
var m__6874__auto____$1 = (mikron.buffer.read_char_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-char!",this$);
}
}
}
});

mikron.buffer.read_boolean_BANG_ = (function mikron$buffer$read_boolean_BANG_(this$){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$read_boolean_BANG_$arity$1 == null)))){
return this$.mikron$buffer$Buffer$read_boolean_BANG_$arity$1(this$);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.read_boolean_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto__.call(null,this$));
} else {
var m__6874__auto____$1 = (mikron.buffer.read_boolean_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-boolean!",this$);
}
}
}
});

mikron.buffer.read_ubyte_BANG_ = (function mikron$buffer$read_ubyte_BANG_(this$){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$read_ubyte_BANG_$arity$1 == null)))){
return this$.mikron$buffer$Buffer$read_ubyte_BANG_$arity$1(this$);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.read_ubyte_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto__.call(null,this$));
} else {
var m__6874__auto____$1 = (mikron.buffer.read_ubyte_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-ubyte!",this$);
}
}
}
});

mikron.buffer.read_ushort_BANG_ = (function mikron$buffer$read_ushort_BANG_(this$){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$read_ushort_BANG_$arity$1 == null)))){
return this$.mikron$buffer$Buffer$read_ushort_BANG_$arity$1(this$);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.read_ushort_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto__.call(null,this$));
} else {
var m__6874__auto____$1 = (mikron.buffer.read_ushort_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-ushort!",this$);
}
}
}
});

mikron.buffer.read_uint_BANG_ = (function mikron$buffer$read_uint_BANG_(this$){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$read_uint_BANG_$arity$1 == null)))){
return this$.mikron$buffer$Buffer$read_uint_BANG_$arity$1(this$);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.read_uint_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto__.call(null,this$));
} else {
var m__6874__auto____$1 = (mikron.buffer.read_uint_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-uint!",this$);
}
}
}
});

mikron.buffer.write_byte_BANG_ = (function mikron$buffer$write_byte_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$write_byte_BANG_$arity$2 == null)))){
return this$.mikron$buffer$Buffer$write_byte_BANG_$arity$2(this$,value);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.write_byte_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto__.call(null,this$,value));
} else {
var m__6874__auto____$1 = (mikron.buffer.write_byte_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-byte!",this$);
}
}
}
});

mikron.buffer.write_short_BANG_ = (function mikron$buffer$write_short_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$write_short_BANG_$arity$2 == null)))){
return this$.mikron$buffer$Buffer$write_short_BANG_$arity$2(this$,value);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.write_short_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto__.call(null,this$,value));
} else {
var m__6874__auto____$1 = (mikron.buffer.write_short_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-short!",this$);
}
}
}
});

mikron.buffer.write_int_BANG_ = (function mikron$buffer$write_int_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$write_int_BANG_$arity$2 == null)))){
return this$.mikron$buffer$Buffer$write_int_BANG_$arity$2(this$,value);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.write_int_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto__.call(null,this$,value));
} else {
var m__6874__auto____$1 = (mikron.buffer.write_int_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-int!",this$);
}
}
}
});

mikron.buffer.write_long_BANG_ = (function mikron$buffer$write_long_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$write_long_BANG_$arity$2 == null)))){
return this$.mikron$buffer$Buffer$write_long_BANG_$arity$2(this$,value);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.write_long_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto__.call(null,this$,value));
} else {
var m__6874__auto____$1 = (mikron.buffer.write_long_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-long!",this$);
}
}
}
});

mikron.buffer.write_float_BANG_ = (function mikron$buffer$write_float_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$write_float_BANG_$arity$2 == null)))){
return this$.mikron$buffer$Buffer$write_float_BANG_$arity$2(this$,value);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.write_float_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto__.call(null,this$,value));
} else {
var m__6874__auto____$1 = (mikron.buffer.write_float_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-float!",this$);
}
}
}
});

mikron.buffer.write_double_BANG_ = (function mikron$buffer$write_double_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$write_double_BANG_$arity$2 == null)))){
return this$.mikron$buffer$Buffer$write_double_BANG_$arity$2(this$,value);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.write_double_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto__.call(null,this$,value));
} else {
var m__6874__auto____$1 = (mikron.buffer.write_double_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-double!",this$);
}
}
}
});

mikron.buffer.write_char_BANG_ = (function mikron$buffer$write_char_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$write_char_BANG_$arity$2 == null)))){
return this$.mikron$buffer$Buffer$write_char_BANG_$arity$2(this$,value);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.write_char_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto__.call(null,this$,value));
} else {
var m__6874__auto____$1 = (mikron.buffer.write_char_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-char!",this$);
}
}
}
});

mikron.buffer.write_boolean_BANG_ = (function mikron$buffer$write_boolean_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$write_boolean_BANG_$arity$2 == null)))){
return this$.mikron$buffer$Buffer$write_boolean_BANG_$arity$2(this$,value);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.write_boolean_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto__.call(null,this$,value));
} else {
var m__6874__auto____$1 = (mikron.buffer.write_boolean_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-boolean!",this$);
}
}
}
});

mikron.buffer.write_ubyte_BANG_ = (function mikron$buffer$write_ubyte_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$write_ubyte_BANG_$arity$2 == null)))){
return this$.mikron$buffer$Buffer$write_ubyte_BANG_$arity$2(this$,value);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.write_ubyte_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto__.call(null,this$,value));
} else {
var m__6874__auto____$1 = (mikron.buffer.write_ubyte_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-ubyte!",this$);
}
}
}
});

mikron.buffer.write_ushort_BANG_ = (function mikron$buffer$write_ushort_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$write_ushort_BANG_$arity$2 == null)))){
return this$.mikron$buffer$Buffer$write_ushort_BANG_$arity$2(this$,value);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.write_ushort_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto__.call(null,this$,value));
} else {
var m__6874__auto____$1 = (mikron.buffer.write_ushort_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-ushort!",this$);
}
}
}
});

mikron.buffer.write_uint_BANG_ = (function mikron$buffer$write_uint_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$write_uint_BANG_$arity$2 == null)))){
return this$.mikron$buffer$Buffer$write_uint_BANG_$arity$2(this$,value);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.write_uint_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto__.call(null,this$,value));
} else {
var m__6874__auto____$1 = (mikron.buffer.write_uint_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__6874__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-uint!",this$);
}
}
}
});

mikron.buffer.little_endian_QMARK_ = (function mikron$buffer$little_endian_QMARK_(this$){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$little_endian_QMARK_$arity$1 == null)))){
return this$.mikron$buffer$Buffer$little_endian_QMARK_$arity$1(this$);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.little_endian_QMARK_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto__.call(null,this$));
} else {
var m__6874__auto____$1 = (mikron.buffer.little_endian_QMARK_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.little-endian?",this$);
}
}
}
});

mikron.buffer.little_endian_BANG_ = (function mikron$buffer$little_endian_BANG_(this$,little_endian){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$little_endian_BANG_$arity$2 == null)))){
return this$.mikron$buffer$Buffer$little_endian_BANG_$arity$2(this$,little_endian);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.little_endian_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$2(this$,little_endian) : m__6874__auto__.call(null,this$,little_endian));
} else {
var m__6874__auto____$1 = (mikron.buffer.little_endian_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,little_endian) : m__6874__auto____$1.call(null,this$,little_endian));
} else {
throw cljs.core.missing_protocol("Buffer.little-endian!",this$);
}
}
}
});

mikron.buffer.clear_BANG_ = (function mikron$buffer$clear_BANG_(this$){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$clear_BANG_$arity$1 == null)))){
return this$.mikron$buffer$Buffer$clear_BANG_$arity$1(this$);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.clear_BANG_[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto__.call(null,this$));
} else {
var m__6874__auto____$1 = (mikron.buffer.clear_BANG_["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.clear!",this$);
}
}
}
});

mikron.buffer.compress = (function mikron$buffer$compress(this$){
if((!((this$ == null))) && (!((this$.mikron$buffer$Buffer$compress$arity$1 == null)))){
return this$.mikron$buffer$Buffer$compress$arity$1(this$);
} else {
var x__6873__auto__ = (((this$ == null))?null:this$);
var m__6874__auto__ = (mikron.buffer.compress[goog.typeOf(x__6873__auto__)]);
if(!((m__6874__auto__ == null))){
return (m__6874__auto__.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto__.call(null,this$));
} else {
var m__6874__auto____$1 = (mikron.buffer.compress["_"]);
if(!((m__6874__auto____$1 == null))){
return (m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__6874__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__6874__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.compress",this$);
}
}
}
});

ByteBuffer.prototype.mikron$buffer$Buffer$ = true;

ByteBuffer.prototype.mikron$buffer$Buffer$read_byte_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readInt8();
});

ByteBuffer.prototype.mikron$buffer$Buffer$read_short_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readInt16();
});

ByteBuffer.prototype.mikron$buffer$Buffer$read_int_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readInt32();
});

ByteBuffer.prototype.mikron$buffer$Buffer$read_long_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readInt64().toNumber();
});

ByteBuffer.prototype.mikron$buffer$Buffer$read_float_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readFloat32();
});

ByteBuffer.prototype.mikron$buffer$Buffer$read_double_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readFloat64();
});

ByteBuffer.prototype.mikron$buffer$Buffer$read_char_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readUint16();
});

ByteBuffer.prototype.mikron$buffer$Buffer$read_boolean_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
var bit_index = (this$__$1["bitIndex"]);
if((cljs.core.mod(bit_index,(8)) === (0))){
(this$__$1["bitBuffer"] = this$__$1.readInt8());
} else {
}

(this$__$1["bitIndex"] = (bit_index + (1)));

return !((((this$__$1["bitBuffer"]) & ((1) << cljs.core.mod(bit_index,(8)))) === (0)));
});

ByteBuffer.prototype.mikron$buffer$Buffer$read_ubyte_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readUint8();
});

ByteBuffer.prototype.mikron$buffer$Buffer$read_ushort_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readUint16();
});

ByteBuffer.prototype.mikron$buffer$Buffer$read_uint_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readUint32();
});

ByteBuffer.prototype.mikron$buffer$Buffer$write_byte_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeInt8(value);
});

ByteBuffer.prototype.mikron$buffer$Buffer$write_short_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeInt16(value);
});

ByteBuffer.prototype.mikron$buffer$Buffer$write_int_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeInt32((value | (0)));
});

ByteBuffer.prototype.mikron$buffer$Buffer$write_long_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeInt64(cljs.core.long$(value));
});

ByteBuffer.prototype.mikron$buffer$Buffer$write_float_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeFloat32(value);
});

ByteBuffer.prototype.mikron$buffer$Buffer$write_double_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeFloat64(value);
});

ByteBuffer.prototype.mikron$buffer$Buffer$write_char_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeUint16(cljs.core.char$(value));
});

ByteBuffer.prototype.mikron$buffer$Buffer$write_boolean_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
var bit_index = (this$__$1["bitIndex"]);
if((cljs.core.mod(bit_index,(8)) === (0))){
if((bit_index > (0))){
this$__$1.writeInt8((this$__$1["bitBuffer"]),(this$__$1["bitPosition"]));
} else {
}

(this$__$1["bitBuffer"] = (0));

var offset_14181 = (this$__$1["offset"]);
(this$__$1["bitPosition"] = offset_14181);

(this$__$1["offset"] = (offset_14181 + (1)));
} else {
}

(this$__$1["bitIndex"] = (bit_index + (1)));

(this$__$1["bitBuffer"] = (cljs.core.truth_(value)?((this$__$1["bitBuffer"]) | ((1) << cljs.core.mod(bit_index,(8)))):((this$__$1["bitBuffer"]) & (~ ((1) << cljs.core.mod(bit_index,(8)))))));

return this$__$1;
});

ByteBuffer.prototype.mikron$buffer$Buffer$write_ubyte_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeUint8(value);
});

ByteBuffer.prototype.mikron$buffer$Buffer$write_ushort_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeUint16(value);
});

ByteBuffer.prototype.mikron$buffer$Buffer$write_uint_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeUint32(value);
});

ByteBuffer.prototype.mikron$buffer$Buffer$little_endian_QMARK_$arity$1 = (function (this$){
var this$__$1 = this;
return (this$__$1["littleEndian"]);
});

ByteBuffer.prototype.mikron$buffer$Buffer$little_endian_BANG_$arity$2 = (function (this$,little_endian){
var this$__$1 = this;
return (this$__$1["littleEndian"] = little_endian);
});

ByteBuffer.prototype.mikron$buffer$Buffer$clear_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
var G__14178 = this$__$1;
(G__14178["offset"] = (0));

(G__14178["bitIndex"] = (0));

(G__14178["bitPosition"] = (-1));

(G__14178["bitBuffer"] = (0));

return G__14178;
});

ByteBuffer.prototype.mikron$buffer$Buffer$compress$arity$1 = (function (this$){
var this$__$1 = this;
var bit_position_14184 = (this$__$1["bitPosition"]);
if(cljs.core.not_EQ_.cljs$core$IFn$_invoke$arity$2(bit_position_14184,(-1))){
this$__$1.writeInt8((this$__$1["bitBuffer"]),bit_position_14184);
} else {
}

return this$__$1.slice((0),(this$__$1["offset"])).toArrayBuffer();
});
mikron.buffer.encode_negative = (function mikron$buffer$encode_negative(value){
return (- (value + (1)));
});
mikron.buffer.decode_negative = (function mikron$buffer$decode_negative(value){
return ((- value) - (1));
});
mikron.buffer.write_varint_BANG_ = (function mikron$buffer$write_varint_BANG_(buffer,value){
var neg_value_QMARK_ = (value < (0));
var value__$1 = ((!(neg_value_QMARK_))?value:mikron.buffer.encode_negative(value));
mikron.buffer.write_boolean_BANG_(buffer,neg_value_QMARK_);

var value__$2 = value__$1;
while(true){
if(((value__$2 & (-128)) === (0))){
return mikron.buffer.write_byte_BANG_(buffer,value__$2);
} else {
mikron.buffer.write_byte_BANG_(buffer,((cljs.core.unchecked_int(value__$2) & (127)) | (128)));

var G__14188 = (value__$2 >>> (7));
value__$2 = G__14188;
continue;
}
break;
}
});
mikron.buffer.read_varint_BANG_ = (function mikron$buffer$read_varint_BANG_(buffer){
var neg_value_QMARK_ = mikron.buffer.read_boolean_BANG_(buffer);
var value = (0);
var shift = (0);
while(true){
if(!((shift < (64)))){
throw mikron.common.exception("Malformed varint!");
} else {
var b = mikron.buffer.read_byte_BANG_(buffer);
var value__$1 = (value | ((b & (127)) << shift));
if(((b & (128)) === (0))){
if(cljs.core.not(neg_value_QMARK_)){
return value__$1;
} else {
return mikron.buffer.decode_negative(value__$1);
}
} else {
var G__14190 = value__$1;
var G__14191 = (shift + (7));
value = G__14190;
shift = G__14191;
continue;
}
}
break;
}
});
mikron.buffer.wrap = (function mikron$buffer$wrap(raw){
return mikron.buffer.clear_BANG_(ByteBuffer.wrap(raw));
});
mikron.buffer.allocate = (function mikron$buffer$allocate(size){
return mikron.buffer.clear_BANG_(ByteBuffer.allocate(size));
});
mikron.buffer.write_headers_BANG_ = (function mikron$buffer$write_headers_BANG_(buffer,schema_id,meta_schema_id,diffed_QMARK_){
var G__14193 = mikron.buffer.write_boolean_BANG_(mikron.buffer.write_varint_BANG_(mikron.buffer.write_boolean_BANG_(mikron.buffer.write_boolean_BANG_(mikron.buffer.clear_BANG_(buffer),mikron.buffer.little_endian_QMARK_(buffer)),diffed_QMARK_),schema_id),meta_schema_id);
if(cljs.core.truth_(meta_schema_id)){
return mikron.buffer.write_varint_BANG_(G__14193,meta_schema_id);
} else {
return G__14193;
}
});
mikron.buffer.read_headers_BANG_ = (function mikron$buffer$read_headers_BANG_(buffer){
mikron.buffer.little_endian_BANG_(buffer,mikron.buffer.read_boolean_BANG_(buffer));

return new cljs.core.PersistentArrayMap(null, 3, [cljs.core.cst$kw$diffed_QMARK_,mikron.buffer.read_boolean_BANG_(buffer),cljs.core.cst$kw$schema_DASH_id,mikron.buffer.read_varint_BANG_(buffer),cljs.core.cst$kw$meta_DASH_schema_DASH_id,(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer))?mikron.buffer.read_varint_BANG_(buffer):null)], null);
});
