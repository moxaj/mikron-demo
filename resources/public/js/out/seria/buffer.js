// Compiled by ClojureScript 1.7.170 {:static-fns true, :optimize-constants true}
goog.provide('seria.buffer');
goog.require('cljs.core');
goog.require('seria.common');

/**
 * @interface
 */
seria.buffer.Buffer = function(){};

seria.buffer.read_byte_BANG_ = (function seria$buffer$read_byte_BANG_(this$){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$read_byte_BANG_$arity$1 == null)))){
return this$.seria$buffer$Buffer$read_byte_BANG_$arity$1(this$);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.read_byte_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto__.call(null,this$));
} else {
var m__5338__auto____$1 = (seria.buffer.read_byte_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-byte!",this$);
}
}
}
});

seria.buffer.read_short_BANG_ = (function seria$buffer$read_short_BANG_(this$){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$read_short_BANG_$arity$1 == null)))){
return this$.seria$buffer$Buffer$read_short_BANG_$arity$1(this$);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.read_short_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto__.call(null,this$));
} else {
var m__5338__auto____$1 = (seria.buffer.read_short_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-short!",this$);
}
}
}
});

seria.buffer.read_int_BANG_ = (function seria$buffer$read_int_BANG_(this$){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$read_int_BANG_$arity$1 == null)))){
return this$.seria$buffer$Buffer$read_int_BANG_$arity$1(this$);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.read_int_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto__.call(null,this$));
} else {
var m__5338__auto____$1 = (seria.buffer.read_int_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-int!",this$);
}
}
}
});

seria.buffer.read_long_BANG_ = (function seria$buffer$read_long_BANG_(this$){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$read_long_BANG_$arity$1 == null)))){
return this$.seria$buffer$Buffer$read_long_BANG_$arity$1(this$);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.read_long_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto__.call(null,this$));
} else {
var m__5338__auto____$1 = (seria.buffer.read_long_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-long!",this$);
}
}
}
});

seria.buffer.read_float_BANG_ = (function seria$buffer$read_float_BANG_(this$){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$read_float_BANG_$arity$1 == null)))){
return this$.seria$buffer$Buffer$read_float_BANG_$arity$1(this$);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.read_float_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto__.call(null,this$));
} else {
var m__5338__auto____$1 = (seria.buffer.read_float_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-float!",this$);
}
}
}
});

seria.buffer.read_double_BANG_ = (function seria$buffer$read_double_BANG_(this$){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$read_double_BANG_$arity$1 == null)))){
return this$.seria$buffer$Buffer$read_double_BANG_$arity$1(this$);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.read_double_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto__.call(null,this$));
} else {
var m__5338__auto____$1 = (seria.buffer.read_double_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-double!",this$);
}
}
}
});

seria.buffer.read_char_BANG_ = (function seria$buffer$read_char_BANG_(this$){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$read_char_BANG_$arity$1 == null)))){
return this$.seria$buffer$Buffer$read_char_BANG_$arity$1(this$);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.read_char_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto__.call(null,this$));
} else {
var m__5338__auto____$1 = (seria.buffer.read_char_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-char!",this$);
}
}
}
});

seria.buffer.read_boolean_BANG_ = (function seria$buffer$read_boolean_BANG_(this$){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$read_boolean_BANG_$arity$1 == null)))){
return this$.seria$buffer$Buffer$read_boolean_BANG_$arity$1(this$);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.read_boolean_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto__.call(null,this$));
} else {
var m__5338__auto____$1 = (seria.buffer.read_boolean_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-boolean!",this$);
}
}
}
});

seria.buffer.read_ubyte_BANG_ = (function seria$buffer$read_ubyte_BANG_(this$){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$read_ubyte_BANG_$arity$1 == null)))){
return this$.seria$buffer$Buffer$read_ubyte_BANG_$arity$1(this$);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.read_ubyte_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto__.call(null,this$));
} else {
var m__5338__auto____$1 = (seria.buffer.read_ubyte_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-ubyte!",this$);
}
}
}
});

seria.buffer.read_ushort_BANG_ = (function seria$buffer$read_ushort_BANG_(this$){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$read_ushort_BANG_$arity$1 == null)))){
return this$.seria$buffer$Buffer$read_ushort_BANG_$arity$1(this$);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.read_ushort_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto__.call(null,this$));
} else {
var m__5338__auto____$1 = (seria.buffer.read_ushort_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-ushort!",this$);
}
}
}
});

seria.buffer.read_uint_BANG_ = (function seria$buffer$read_uint_BANG_(this$){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$read_uint_BANG_$arity$1 == null)))){
return this$.seria$buffer$Buffer$read_uint_BANG_$arity$1(this$);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.read_uint_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto__.call(null,this$));
} else {
var m__5338__auto____$1 = (seria.buffer.read_uint_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.read-uint!",this$);
}
}
}
});

seria.buffer.write_byte_BANG_ = (function seria$buffer$write_byte_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$write_byte_BANG_$arity$2 == null)))){
return this$.seria$buffer$Buffer$write_byte_BANG_$arity$2(this$,value);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.write_byte_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto__.call(null,this$,value));
} else {
var m__5338__auto____$1 = (seria.buffer.write_byte_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-byte!",this$);
}
}
}
});

seria.buffer.write_short_BANG_ = (function seria$buffer$write_short_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$write_short_BANG_$arity$2 == null)))){
return this$.seria$buffer$Buffer$write_short_BANG_$arity$2(this$,value);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.write_short_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto__.call(null,this$,value));
} else {
var m__5338__auto____$1 = (seria.buffer.write_short_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-short!",this$);
}
}
}
});

seria.buffer.write_int_BANG_ = (function seria$buffer$write_int_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$write_int_BANG_$arity$2 == null)))){
return this$.seria$buffer$Buffer$write_int_BANG_$arity$2(this$,value);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.write_int_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto__.call(null,this$,value));
} else {
var m__5338__auto____$1 = (seria.buffer.write_int_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-int!",this$);
}
}
}
});

seria.buffer.write_long_BANG_ = (function seria$buffer$write_long_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$write_long_BANG_$arity$2 == null)))){
return this$.seria$buffer$Buffer$write_long_BANG_$arity$2(this$,value);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.write_long_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto__.call(null,this$,value));
} else {
var m__5338__auto____$1 = (seria.buffer.write_long_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-long!",this$);
}
}
}
});

seria.buffer.write_float_BANG_ = (function seria$buffer$write_float_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$write_float_BANG_$arity$2 == null)))){
return this$.seria$buffer$Buffer$write_float_BANG_$arity$2(this$,value);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.write_float_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto__.call(null,this$,value));
} else {
var m__5338__auto____$1 = (seria.buffer.write_float_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-float!",this$);
}
}
}
});

seria.buffer.write_double_BANG_ = (function seria$buffer$write_double_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$write_double_BANG_$arity$2 == null)))){
return this$.seria$buffer$Buffer$write_double_BANG_$arity$2(this$,value);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.write_double_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto__.call(null,this$,value));
} else {
var m__5338__auto____$1 = (seria.buffer.write_double_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-double!",this$);
}
}
}
});

seria.buffer.write_char_BANG_ = (function seria$buffer$write_char_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$write_char_BANG_$arity$2 == null)))){
return this$.seria$buffer$Buffer$write_char_BANG_$arity$2(this$,value);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.write_char_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto__.call(null,this$,value));
} else {
var m__5338__auto____$1 = (seria.buffer.write_char_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-char!",this$);
}
}
}
});

seria.buffer.write_boolean_BANG_ = (function seria$buffer$write_boolean_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$write_boolean_BANG_$arity$2 == null)))){
return this$.seria$buffer$Buffer$write_boolean_BANG_$arity$2(this$,value);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.write_boolean_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto__.call(null,this$,value));
} else {
var m__5338__auto____$1 = (seria.buffer.write_boolean_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-boolean!",this$);
}
}
}
});

seria.buffer.write_ubyte_BANG_ = (function seria$buffer$write_ubyte_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$write_ubyte_BANG_$arity$2 == null)))){
return this$.seria$buffer$Buffer$write_ubyte_BANG_$arity$2(this$,value);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.write_ubyte_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto__.call(null,this$,value));
} else {
var m__5338__auto____$1 = (seria.buffer.write_ubyte_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-ubyte!",this$);
}
}
}
});

seria.buffer.write_ushort_BANG_ = (function seria$buffer$write_ushort_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$write_ushort_BANG_$arity$2 == null)))){
return this$.seria$buffer$Buffer$write_ushort_BANG_$arity$2(this$,value);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.write_ushort_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto__.call(null,this$,value));
} else {
var m__5338__auto____$1 = (seria.buffer.write_ushort_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-ushort!",this$);
}
}
}
});

seria.buffer.write_uint_BANG_ = (function seria$buffer$write_uint_BANG_(this$,value){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$write_uint_BANG_$arity$2 == null)))){
return this$.seria$buffer$Buffer$write_uint_BANG_$arity$2(this$,value);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.write_uint_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto__.call(null,this$,value));
} else {
var m__5338__auto____$1 = (seria.buffer.write_uint_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,value) : m__5338__auto____$1.call(null,this$,value));
} else {
throw cljs.core.missing_protocol("Buffer.write-uint!",this$);
}
}
}
});

seria.buffer.little_endian_QMARK_ = (function seria$buffer$little_endian_QMARK_(this$){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$little_endian_QMARK_$arity$1 == null)))){
return this$.seria$buffer$Buffer$little_endian_QMARK_$arity$1(this$);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.little_endian_QMARK_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto__.call(null,this$));
} else {
var m__5338__auto____$1 = (seria.buffer.little_endian_QMARK_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.little-endian?",this$);
}
}
}
});

seria.buffer.little_endian_BANG_ = (function seria$buffer$little_endian_BANG_(this$,little_endian){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$little_endian_BANG_$arity$2 == null)))){
return this$.seria$buffer$Buffer$little_endian_BANG_$arity$2(this$,little_endian);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.little_endian_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$2(this$,little_endian) : m__5338__auto__.call(null,this$,little_endian));
} else {
var m__5338__auto____$1 = (seria.buffer.little_endian_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$2(this$,little_endian) : m__5338__auto____$1.call(null,this$,little_endian));
} else {
throw cljs.core.missing_protocol("Buffer.little-endian!",this$);
}
}
}
});

seria.buffer.clear_BANG_ = (function seria$buffer$clear_BANG_(this$){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$clear_BANG_$arity$1 == null)))){
return this$.seria$buffer$Buffer$clear_BANG_$arity$1(this$);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.clear_BANG_[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto__.call(null,this$));
} else {
var m__5338__auto____$1 = (seria.buffer.clear_BANG_["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.clear!",this$);
}
}
}
});

seria.buffer.compress = (function seria$buffer$compress(this$){
if((!((this$ == null))) && (!((this$.seria$buffer$Buffer$compress$arity$1 == null)))){
return this$.seria$buffer$Buffer$compress$arity$1(this$);
} else {
var x__5337__auto__ = (((this$ == null))?null:this$);
var m__5338__auto__ = (seria.buffer.compress[goog.typeOf(x__5337__auto__)]);
if(!((m__5338__auto__ == null))){
return (m__5338__auto__.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto__.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto__.call(null,this$));
} else {
var m__5338__auto____$1 = (seria.buffer.compress["_"]);
if(!((m__5338__auto____$1 == null))){
return (m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1 ? m__5338__auto____$1.cljs$core$IFn$_invoke$arity$1(this$) : m__5338__auto____$1.call(null,this$));
} else {
throw cljs.core.missing_protocol("Buffer.compress",this$);
}
}
}
});

ByteBuffer.prototype.seria$buffer$Buffer$ = true;

ByteBuffer.prototype.seria$buffer$Buffer$read_byte_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readInt8();
});

ByteBuffer.prototype.seria$buffer$Buffer$read_short_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readInt16();
});

ByteBuffer.prototype.seria$buffer$Buffer$read_int_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readInt32();
});

ByteBuffer.prototype.seria$buffer$Buffer$read_long_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readInt64();
});

ByteBuffer.prototype.seria$buffer$Buffer$read_float_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readFloat32();
});

ByteBuffer.prototype.seria$buffer$Buffer$read_double_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readFloat64();
});

ByteBuffer.prototype.seria$buffer$Buffer$read_char_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readUint16();
});

ByteBuffer.prototype.seria$buffer$Buffer$read_boolean_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
var bit_index = (this$__$1["bitIndex"]);
if((cljs.core.mod(bit_index,(8)) === (0))){
(this$__$1["bitBuffer"] = this$__$1.readInt8());
} else {
}

(this$__$1["bitIndex"] = (bit_index + (1)));

return !((((this$__$1["bitBuffer"]) & ((1) << cljs.core.mod(bit_index,(8)))) === (0)));
});

ByteBuffer.prototype.seria$buffer$Buffer$read_ubyte_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readUint8();
});

ByteBuffer.prototype.seria$buffer$Buffer$read_ushort_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readUint16();
});

ByteBuffer.prototype.seria$buffer$Buffer$read_uint_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
return this$__$1.readUint32();
});

ByteBuffer.prototype.seria$buffer$Buffer$write_byte_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeInt8(value);
});

ByteBuffer.prototype.seria$buffer$Buffer$write_short_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeInt16(value);
});

ByteBuffer.prototype.seria$buffer$Buffer$write_int_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeInt32((value | (0)));
});

ByteBuffer.prototype.seria$buffer$Buffer$write_long_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeInt64(cljs.core.long$(value));
});

ByteBuffer.prototype.seria$buffer$Buffer$write_float_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeFloat32(value);
});

ByteBuffer.prototype.seria$buffer$Buffer$write_double_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeFloat64(value);
});

ByteBuffer.prototype.seria$buffer$Buffer$write_char_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeUint16(cljs.core.char$(value));
});

ByteBuffer.prototype.seria$buffer$Buffer$write_boolean_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
var bit_index = (this$__$1["bitIndex"]);
if((cljs.core.mod(bit_index,(8)) === (0))){
if((bit_index > (0))){
this$__$1.writeInt8((this$__$1["bitBuffer"]),(this$__$1["bitPosition"]));
} else {
}

(this$__$1["bitBuffer"] = (0));

var offset_9114 = (this$__$1["offset"]);
(this$__$1["bitPosition"] = offset_9114);

(this$__$1["offset"] = (offset_9114 + (1)));
} else {
}

(this$__$1["bitIndex"] = (bit_index + (1)));

(this$__$1["bitBuffer"] = (cljs.core.truth_(value)?((this$__$1["bitBuffer"]) | ((1) << cljs.core.mod(bit_index,(8)))):((this$__$1["bitBuffer"]) & (~ ((1) << cljs.core.mod(bit_index,(8)))))));

return this$__$1;
});

ByteBuffer.prototype.seria$buffer$Buffer$write_ubyte_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeUint8(value);
});

ByteBuffer.prototype.seria$buffer$Buffer$write_ushort_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeUint16(value);
});

ByteBuffer.prototype.seria$buffer$Buffer$write_uint_BANG_$arity$2 = (function (this$,value){
var this$__$1 = this;
return this$__$1.writeUint32(value);
});

ByteBuffer.prototype.seria$buffer$Buffer$little_endian_QMARK_$arity$1 = (function (this$){
var this$__$1 = this;
return (this$__$1["littleEndian"]);
});

ByteBuffer.prototype.seria$buffer$Buffer$little_endian_BANG_$arity$2 = (function (this$,little_endian){
var this$__$1 = this;
return (this$__$1["littleEndian"] = little_endian);
});

ByteBuffer.prototype.seria$buffer$Buffer$clear_BANG_$arity$1 = (function (this$){
var this$__$1 = this;
var G__9113 = this$__$1;
(G__9113["offset"] = (0));

(G__9113["bitIndex"] = (0));

(G__9113["bitPosition"] = (-1));

(G__9113["bitBuffer"] = (0));

return G__9113;
});

ByteBuffer.prototype.seria$buffer$Buffer$compress$arity$1 = (function (this$){
var this$__$1 = this;
var bit_position_9115 = (this$__$1["bitPosition"]);
if(cljs.core.not_EQ_.cljs$core$IFn$_invoke$arity$2(bit_position_9115,(-1))){
this$__$1.writeInt8((this$__$1["bitBuffer"]),bit_position_9115);
} else {
}

return this$__$1.slice((0),(this$__$1["offset"])).toArrayBuffer();
});
seria.buffer.encode_negative = (function seria$buffer$encode_negative(value){
return (- (value + (1)));
});
seria.buffer.decode_negative = (function seria$buffer$decode_negative(value){
return ((- value) - (1));
});
seria.buffer.write_varint_BANG_ = (function seria$buffer$write_varint_BANG_(buffer,value){
var neg_value_QMARK_ = (value < (0));
var value__$1 = ((!(neg_value_QMARK_))?value:seria.buffer.encode_negative(value));
seria.buffer.write_boolean_BANG_(buffer,neg_value_QMARK_);

var value__$2 = value__$1;
while(true){
if(((value__$2 & (-128)) === (0))){
return seria.buffer.write_byte_BANG_(buffer,value__$2);
} else {
seria.buffer.write_byte_BANG_(buffer,((cljs.core.unchecked_int(value__$2) & (127)) | (128)));

var G__9116 = (value__$2 >>> (7));
value__$2 = G__9116;
continue;
}
break;
}
});
seria.buffer.read_varint_BANG_ = (function seria$buffer$read_varint_BANG_(buffer){
var neg_value_QMARK_ = seria.buffer.read_boolean_BANG_(buffer);
var value = (0);
var shift = (0);
while(true){
if(!((shift < (64)))){
throw seria.common.cljc_exception("Malformed varint!");
} else {
var b = seria.buffer.read_byte_BANG_(buffer);
var value__$1 = (value | ((b & (127)) << shift));
if(((b & (128)) === (0))){
if(cljs.core.not(neg_value_QMARK_)){
return value__$1;
} else {
return seria.buffer.decode_negative(value__$1);
}
} else {
var G__9117 = value__$1;
var G__9118 = (shift + (7));
value = G__9117;
shift = G__9118;
continue;
}
}
break;
}
});
seria.buffer.wrap = (function seria$buffer$wrap(raw){
return seria.buffer.clear_BANG_(ByteBuffer.wrap(raw));
});
seria.buffer.allocate = (function seria$buffer$allocate(size){
return seria.buffer.clear_BANG_(ByteBuffer.allocate(size));
});
seria.buffer.write_headers_BANG_ = (function seria$buffer$write_headers_BANG_(buffer,schema_id,diffed_QMARK_){
return seria.buffer.write_boolean_BANG_(seria.buffer.write_varint_BANG_(seria.buffer.write_boolean_BANG_(seria.buffer.clear_BANG_(buffer),seria.buffer.little_endian_QMARK_(buffer)),schema_id),diffed_QMARK_);
});
seria.buffer.read_headers_BANG_ = (function seria$buffer$read_headers_BANG_(buffer){
seria.buffer.little_endian_BANG_(buffer,seria.buffer.read_boolean_BANG_(buffer));

var schema_id = seria.buffer.read_varint_BANG_(buffer);
var diffed_QMARK_ = seria.buffer.read_boolean_BANG_(buffer);
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$schema_DASH_id,schema_id,cljs.core.cst$kw$diffed_QMARK_,diffed_QMARK_], null);
});
