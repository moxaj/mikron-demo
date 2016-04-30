// Compiled by ClojureScript 1.7.170 {:static-fns true, :optimize-constants true}
goog.provide('seria.common');
goog.require('cljs.core');
goog.require('cljs.reader');
seria.common.cljc_pow = (function seria$common$cljc_pow(base,exp){
return Math.pow(base,exp);
});
seria.common.cljc_floor = (function seria$common$cljc_floor(n){
return Math.floor(n);
});
seria.common.cljc_exception = (function seria$common$cljc_exception(s){
return (new Error(s));
});
seria.common.cljc_read_string = (function seria$common$cljc_read_string(s){
return cljs.reader.read_string(s);
});
seria.common.cljc_abs = (function seria$common$cljc_abs(n){
return Math.abs(n);
});
seria.common.cljc_round = (function seria$common$cljc_round(n){
return Math.round(n);
});
seria.common.symbol_chars = cljs.core.map.cljs$core$IFn$_invoke$arity$2(cljs.core.char$,cljs.core.concat.cljs$core$IFn$_invoke$arity$variadic(new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, ["_","-","?","!"], null),cljs.core.range.cljs$core$IFn$_invoke$arity$2((97),(123)),cljs.core.array_seq([cljs.core.range.cljs$core$IFn$_invoke$arity$2((65),(91)),cljs.core.range.cljs$core$IFn$_invoke$arity$2((48),(58))], 0)));
seria.common.random_integer = (function seria$common$random_integer(bytes,signed_QMARK_){
var max_value = seria.common.cljc_pow((2),(bytes * (8)));
var r = seria.common.cljc_floor((max_value * cljs.core.rand.cljs$core$IFn$_invoke$arity$0()));
return cljs.core.long$(((cljs.core.not(signed_QMARK_))?r:(r - (max_value / (2)))));
});

/**
* @constructor
 * @implements {cljs.core.IRecord}
 * @implements {cljs.core.IEquiv}
 * @implements {cljs.core.IHash}
 * @implements {cljs.core.ICollection}
 * @implements {cljs.core.ICounted}
 * @implements {cljs.core.ISeqable}
 * @implements {cljs.core.IMeta}
 * @implements {cljs.core.ICloneable}
 * @implements {cljs.core.IPrintWithWriter}
 * @implements {cljs.core.IIterable}
 * @implements {cljs.core.IWithMeta}
 * @implements {cljs.core.IAssociative}
 * @implements {cljs.core.IMap}
 * @implements {cljs.core.ILookup}
*/
seria.common.DiffedValue = (function (value,__meta,__extmap,__hash){
this.value = value;
this.__meta = __meta;
this.__extmap = __extmap;
this.__hash = __hash;
this.cljs$lang$protocol_mask$partition0$ = 2229667594;
this.cljs$lang$protocol_mask$partition1$ = 8192;
})
seria.common.DiffedValue.prototype.cljs$core$ILookup$_lookup$arity$2 = (function (this__5296__auto__,k__5297__auto__){
var self__ = this;
var this__5296__auto____$1 = this;
return cljs.core._lookup.cljs$core$IFn$_invoke$arity$3(this__5296__auto____$1,k__5297__auto__,null);
});

seria.common.DiffedValue.prototype.cljs$core$ILookup$_lookup$arity$3 = (function (this__5298__auto__,k9104,else__5299__auto__){
var self__ = this;
var this__5298__auto____$1 = this;
var G__9106 = (((k9104 instanceof cljs.core.Keyword))?k9104.fqn:null);
switch (G__9106) {
case "value":
return self__.value;

break;
default:
return cljs.core.get.cljs$core$IFn$_invoke$arity$3(self__.__extmap,k9104,else__5299__auto__);

}
});

seria.common.DiffedValue.prototype.cljs$core$IPrintWithWriter$_pr_writer$arity$3 = (function (this__5310__auto__,writer__5311__auto__,opts__5312__auto__){
var self__ = this;
var this__5310__auto____$1 = this;
var pr_pair__5313__auto__ = ((function (this__5310__auto____$1){
return (function (keyval__5314__auto__){
return cljs.core.pr_sequential_writer(writer__5311__auto__,cljs.core.pr_writer,""," ","",opts__5312__auto__,keyval__5314__auto__);
});})(this__5310__auto____$1))
;
return cljs.core.pr_sequential_writer(writer__5311__auto__,pr_pair__5313__auto__,"#seria.common.DiffedValue{",", ","}",opts__5312__auto__,cljs.core.concat.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [(new cljs.core.PersistentVector(null,2,(5),cljs.core.PersistentVector.EMPTY_NODE,[cljs.core.cst$kw$value,self__.value],null))], null),self__.__extmap));
});

seria.common.DiffedValue.prototype.cljs$core$IIterable$ = true;

seria.common.DiffedValue.prototype.cljs$core$IIterable$_iterator$arity$1 = (function (G__9103){
var self__ = this;
var G__9103__$1 = this;
return (new cljs.core.RecordIter((0),G__9103__$1,1,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$value], null),cljs.core._iterator(self__.__extmap)));
});

seria.common.DiffedValue.prototype.cljs$core$IMeta$_meta$arity$1 = (function (this__5294__auto__){
var self__ = this;
var this__5294__auto____$1 = this;
return self__.__meta;
});

seria.common.DiffedValue.prototype.cljs$core$ICloneable$_clone$arity$1 = (function (this__5290__auto__){
var self__ = this;
var this__5290__auto____$1 = this;
return (new seria.common.DiffedValue(self__.value,self__.__meta,self__.__extmap,self__.__hash));
});

seria.common.DiffedValue.prototype.cljs$core$ICounted$_count$arity$1 = (function (this__5300__auto__){
var self__ = this;
var this__5300__auto____$1 = this;
return (1 + cljs.core.count(self__.__extmap));
});

seria.common.DiffedValue.prototype.cljs$core$IHash$_hash$arity$1 = (function (this__5291__auto__){
var self__ = this;
var this__5291__auto____$1 = this;
var h__5117__auto__ = self__.__hash;
if(!((h__5117__auto__ == null))){
return h__5117__auto__;
} else {
var h__5117__auto____$1 = cljs.core.hash_imap(this__5291__auto____$1);
self__.__hash = h__5117__auto____$1;

return h__5117__auto____$1;
}
});

seria.common.DiffedValue.prototype.cljs$core$IEquiv$_equiv$arity$2 = (function (this__5292__auto__,other__5293__auto__){
var self__ = this;
var this__5292__auto____$1 = this;
if(cljs.core.truth_((function (){var and__4670__auto__ = other__5293__auto__;
if(cljs.core.truth_(and__4670__auto__)){
var and__4670__auto____$1 = (this__5292__auto____$1.constructor === other__5293__auto__.constructor);
if(and__4670__auto____$1){
return cljs.core.equiv_map(this__5292__auto____$1,other__5293__auto__);
} else {
return and__4670__auto____$1;
}
} else {
return and__4670__auto__;
}
})())){
return true;
} else {
return false;
}
});

seria.common.DiffedValue.prototype.cljs$core$IMap$_dissoc$arity$2 = (function (this__5305__auto__,k__5306__auto__){
var self__ = this;
var this__5305__auto____$1 = this;
if(cljs.core.contains_QMARK_(new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$value,null], null), null),k__5306__auto__)){
return cljs.core.dissoc.cljs$core$IFn$_invoke$arity$2(cljs.core.with_meta(cljs.core.into.cljs$core$IFn$_invoke$arity$2(cljs.core.PersistentArrayMap.EMPTY,this__5305__auto____$1),self__.__meta),k__5306__auto__);
} else {
return (new seria.common.DiffedValue(self__.value,self__.__meta,cljs.core.not_empty(cljs.core.dissoc.cljs$core$IFn$_invoke$arity$2(self__.__extmap,k__5306__auto__)),null));
}
});

seria.common.DiffedValue.prototype.cljs$core$IAssociative$_assoc$arity$3 = (function (this__5303__auto__,k__5304__auto__,G__9103){
var self__ = this;
var this__5303__auto____$1 = this;
var pred__9107 = cljs.core.keyword_identical_QMARK_;
var expr__9108 = k__5304__auto__;
if(cljs.core.truth_((pred__9107.cljs$core$IFn$_invoke$arity$2 ? pred__9107.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$value,expr__9108) : pred__9107.call(null,cljs.core.cst$kw$value,expr__9108)))){
return (new seria.common.DiffedValue(G__9103,self__.__meta,self__.__extmap,null));
} else {
return (new seria.common.DiffedValue(self__.value,self__.__meta,cljs.core.assoc.cljs$core$IFn$_invoke$arity$3(self__.__extmap,k__5304__auto__,G__9103),null));
}
});

seria.common.DiffedValue.prototype.cljs$core$ISeqable$_seq$arity$1 = (function (this__5308__auto__){
var self__ = this;
var this__5308__auto____$1 = this;
return cljs.core.seq(cljs.core.concat.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [(new cljs.core.PersistentVector(null,2,(5),cljs.core.PersistentVector.EMPTY_NODE,[cljs.core.cst$kw$value,self__.value],null))], null),self__.__extmap));
});

seria.common.DiffedValue.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = (function (this__5295__auto__,G__9103){
var self__ = this;
var this__5295__auto____$1 = this;
return (new seria.common.DiffedValue(self__.value,G__9103,self__.__extmap,self__.__hash));
});

seria.common.DiffedValue.prototype.cljs$core$ICollection$_conj$arity$2 = (function (this__5301__auto__,entry__5302__auto__){
var self__ = this;
var this__5301__auto____$1 = this;
if(cljs.core.vector_QMARK_(entry__5302__auto__)){
return cljs.core._assoc(this__5301__auto____$1,cljs.core._nth.cljs$core$IFn$_invoke$arity$2(entry__5302__auto__,(0)),cljs.core._nth.cljs$core$IFn$_invoke$arity$2(entry__5302__auto__,(1)));
} else {
return cljs.core.reduce.cljs$core$IFn$_invoke$arity$3(cljs.core._conj,this__5301__auto____$1,entry__5302__auto__);
}
});

seria.common.DiffedValue.getBasis = (function (){
return new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$sym$value], null);
});

seria.common.DiffedValue.cljs$lang$type = true;

seria.common.DiffedValue.cljs$lang$ctorPrSeq = (function (this__5330__auto__){
return cljs.core._conj(cljs.core.List.EMPTY,"seria.common/DiffedValue");
});

seria.common.DiffedValue.cljs$lang$ctorPrWriter = (function (this__5330__auto__,writer__5331__auto__){
return cljs.core._write(writer__5331__auto__,"seria.common/DiffedValue");
});

seria.common.__GT_DiffedValue = (function seria$common$__GT_DiffedValue(value){
return (new seria.common.DiffedValue(value,null,null,null));
});

seria.common.map__GT_DiffedValue = (function seria$common$map__GT_DiffedValue(G__9105){
return (new seria.common.DiffedValue(cljs.core.cst$kw$value.cljs$core$IFn$_invoke$arity$1(G__9105),null,cljs.core.dissoc.cljs$core$IFn$_invoke$arity$2(G__9105,cljs.core.cst$kw$value),null));
});

seria.common.diffed_QMARK_ = (function seria$common$diffed_QMARK_(value){
return (value instanceof seria.common.DiffedValue);
});
seria.common.wrap_diffed = (function seria$common$wrap_diffed(value){
return seria.common.__GT_DiffedValue(value);
});
seria.common.unwrap_diffed = (function seria$common$unwrap_diffed(value){
if(cljs.core.truth_(seria.common.diffed_QMARK_(value))){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(cljs.core.pr_str.cljs$core$IFn$_invoke$arity$variadic(cljs.core.array_seq([cljs.core.list(cljs.core.cst$sym$diffed_QMARK_,cljs.core.cst$sym$value)], 0)))].join('')));
}

return cljs.core.cst$kw$value.cljs$core$IFn$_invoke$arity$1(value);
});
seria.common.interp_numbers = (function seria$common$interp_numbers(value_1,value_2,time_factor){
return (value_1 + (time_factor * (value_2 - value_1)));
});
