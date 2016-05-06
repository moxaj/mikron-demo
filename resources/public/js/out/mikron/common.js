// Compiled by ClojureScript 1.8.51 {:static-fns true, :optimize-constants true}
goog.provide('mikron.common');
goog.require('cljs.core');
goog.require('cljs.reader');
goog.require('goog.string');
goog.require('goog.string.format');
mikron.common.pow = (function mikron$common$pow(base,exp){
return Math.pow(base,exp);
});
mikron.common.floor = (function mikron$common$floor(n){
return Math.floor(n);
});
mikron.common.exception = (function mikron$common$exception(s){
return (new Error(s));
});
mikron.common.parse_string = (function mikron$common$parse_string(s){
return cljs.reader.read_string(s);
});
mikron.common.abs = (function mikron$common$abs(n){
return Math.abs(n);
});
mikron.common.round = (function mikron$common$round(n){
return Math.round(n);
});
mikron.common.format = (function mikron$common$format(var_args){
var args__7287__auto__ = [];
var len__7280__auto___14039 = arguments.length;
var i__7281__auto___14040 = (0);
while(true){
if((i__7281__auto___14040 < len__7280__auto___14039)){
args__7287__auto__.push((arguments[i__7281__auto___14040]));

var G__14041 = (i__7281__auto___14040 + (1));
i__7281__auto___14040 = G__14041;
continue;
} else {
}
break;
}

var argseq__7288__auto__ = ((((1) < args__7287__auto__.length))?(new cljs.core.IndexedSeq(args__7287__auto__.slice((1)),(0),null)):null);
return mikron.common.format.cljs$core$IFn$_invoke$arity$variadic((arguments[(0)]),argseq__7288__auto__);
});

mikron.common.format.cljs$core$IFn$_invoke$arity$variadic = (function (s,args){
return cljs.core.apply.cljs$core$IFn$_invoke$arity$3(goog.string.format,s,args);
});

mikron.common.format.cljs$lang$maxFixedArity = (1);

mikron.common.format.cljs$lang$applyTo = (function (seq14029){
var G__14030 = cljs.core.first(seq14029);
var seq14029__$1 = cljs.core.next(seq14029);
return mikron.common.format.cljs$core$IFn$_invoke$arity$variadic(G__14030,seq14029__$1);
});
mikron.common.date__GT_long = (function mikron$common$date__GT_long(date){
return date.getTime();
});
mikron.common.long__GT_date = (function mikron$common$long__GT_date(time){
return (new Date(time));
});
mikron.common.symbol_chars = cljs.core.map.cljs$core$IFn$_invoke$arity$2(cljs.core.char$,cljs.core.concat.cljs$core$IFn$_invoke$arity$variadic(new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, ["_","-","?","!"], null),cljs.core.range.cljs$core$IFn$_invoke$arity$2((97),(123)),cljs.core.array_seq([cljs.core.range.cljs$core$IFn$_invoke$arity$2((65),(91)),cljs.core.range.cljs$core$IFn$_invoke$arity$2((48),(58))], 0)));
mikron.common.random_integer = (function mikron$common$random_integer(bytes,signed_QMARK_){
var max_value = mikron.common.pow((2),(bytes * (8)));
var r = mikron.common.floor((max_value * cljs.core.rand.cljs$core$IFn$_invoke$arity$0()));
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
mikron.common.DiffedValue = (function (value,__meta,__extmap,__hash){
this.value = value;
this.__meta = __meta;
this.__extmap = __extmap;
this.__hash = __hash;
this.cljs$lang$protocol_mask$partition0$ = 2229667594;
this.cljs$lang$protocol_mask$partition1$ = 8192;
})
mikron.common.DiffedValue.prototype.cljs$core$ILookup$_lookup$arity$2 = (function (this__6832__auto__,k__6833__auto__){
var self__ = this;
var this__6832__auto____$1 = this;
return cljs.core._lookup.cljs$core$IFn$_invoke$arity$3(this__6832__auto____$1,k__6833__auto__,null);
});

mikron.common.DiffedValue.prototype.cljs$core$ILookup$_lookup$arity$3 = (function (this__6834__auto__,k14065,else__6835__auto__){
var self__ = this;
var this__6834__auto____$1 = this;
var G__14076 = (((k14065 instanceof cljs.core.Keyword))?k14065.fqn:null);
switch (G__14076) {
case "value":
return self__.value;

break;
default:
return cljs.core.get.cljs$core$IFn$_invoke$arity$3(self__.__extmap,k14065,else__6835__auto__);

}
});

mikron.common.DiffedValue.prototype.cljs$core$IPrintWithWriter$_pr_writer$arity$3 = (function (this__6846__auto__,writer__6847__auto__,opts__6848__auto__){
var self__ = this;
var this__6846__auto____$1 = this;
var pr_pair__6849__auto__ = ((function (this__6846__auto____$1){
return (function (keyval__6850__auto__){
return cljs.core.pr_sequential_writer(writer__6847__auto__,cljs.core.pr_writer,""," ","",opts__6848__auto__,keyval__6850__auto__);
});})(this__6846__auto____$1))
;
return cljs.core.pr_sequential_writer(writer__6847__auto__,pr_pair__6849__auto__,"#mikron.common.DiffedValue{",", ","}",opts__6848__auto__,cljs.core.concat.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [(new cljs.core.PersistentVector(null,2,(5),cljs.core.PersistentVector.EMPTY_NODE,[cljs.core.cst$kw$value,self__.value],null))], null),self__.__extmap));
});

mikron.common.DiffedValue.prototype.cljs$core$IIterable$ = true;

mikron.common.DiffedValue.prototype.cljs$core$IIterable$_iterator$arity$1 = (function (G__14064){
var self__ = this;
var G__14064__$1 = this;
return (new cljs.core.RecordIter((0),G__14064__$1,1,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$value], null),cljs.core._iterator(self__.__extmap)));
});

mikron.common.DiffedValue.prototype.cljs$core$IMeta$_meta$arity$1 = (function (this__6830__auto__){
var self__ = this;
var this__6830__auto____$1 = this;
return self__.__meta;
});

mikron.common.DiffedValue.prototype.cljs$core$ICloneable$_clone$arity$1 = (function (this__6826__auto__){
var self__ = this;
var this__6826__auto____$1 = this;
return (new mikron.common.DiffedValue(self__.value,self__.__meta,self__.__extmap,self__.__hash));
});

mikron.common.DiffedValue.prototype.cljs$core$ICounted$_count$arity$1 = (function (this__6836__auto__){
var self__ = this;
var this__6836__auto____$1 = this;
return (1 + cljs.core.count(self__.__extmap));
});

mikron.common.DiffedValue.prototype.cljs$core$IHash$_hash$arity$1 = (function (this__6827__auto__){
var self__ = this;
var this__6827__auto____$1 = this;
var h__6645__auto__ = self__.__hash;
if(!((h__6645__auto__ == null))){
return h__6645__auto__;
} else {
var h__6645__auto____$1 = cljs.core.hash_imap(this__6827__auto____$1);
self__.__hash = h__6645__auto____$1;

return h__6645__auto____$1;
}
});

mikron.common.DiffedValue.prototype.cljs$core$IEquiv$_equiv$arity$2 = (function (this__6828__auto__,other__6829__auto__){
var self__ = this;
var this__6828__auto____$1 = this;
if(cljs.core.truth_((function (){var and__6198__auto__ = other__6829__auto__;
if(cljs.core.truth_(and__6198__auto__)){
var and__6198__auto____$1 = (this__6828__auto____$1.constructor === other__6829__auto__.constructor);
if(and__6198__auto____$1){
return cljs.core.equiv_map(this__6828__auto____$1,other__6829__auto__);
} else {
return and__6198__auto____$1;
}
} else {
return and__6198__auto__;
}
})())){
return true;
} else {
return false;
}
});

mikron.common.DiffedValue.prototype.cljs$core$IMap$_dissoc$arity$2 = (function (this__6841__auto__,k__6842__auto__){
var self__ = this;
var this__6841__auto____$1 = this;
if(cljs.core.contains_QMARK_(new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$value,null], null), null),k__6842__auto__)){
return cljs.core.dissoc.cljs$core$IFn$_invoke$arity$2(cljs.core.with_meta(cljs.core.into.cljs$core$IFn$_invoke$arity$2(cljs.core.PersistentArrayMap.EMPTY,this__6841__auto____$1),self__.__meta),k__6842__auto__);
} else {
return (new mikron.common.DiffedValue(self__.value,self__.__meta,cljs.core.not_empty(cljs.core.dissoc.cljs$core$IFn$_invoke$arity$2(self__.__extmap,k__6842__auto__)),null));
}
});

mikron.common.DiffedValue.prototype.cljs$core$IAssociative$_assoc$arity$3 = (function (this__6839__auto__,k__6840__auto__,G__14064){
var self__ = this;
var this__6839__auto____$1 = this;
var pred__14089 = cljs.core.keyword_identical_QMARK_;
var expr__14090 = k__6840__auto__;
if(cljs.core.truth_((pred__14089.cljs$core$IFn$_invoke$arity$2 ? pred__14089.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$value,expr__14090) : pred__14089.call(null,cljs.core.cst$kw$value,expr__14090)))){
return (new mikron.common.DiffedValue(G__14064,self__.__meta,self__.__extmap,null));
} else {
return (new mikron.common.DiffedValue(self__.value,self__.__meta,cljs.core.assoc.cljs$core$IFn$_invoke$arity$3(self__.__extmap,k__6840__auto__,G__14064),null));
}
});

mikron.common.DiffedValue.prototype.cljs$core$ISeqable$_seq$arity$1 = (function (this__6844__auto__){
var self__ = this;
var this__6844__auto____$1 = this;
return cljs.core.seq(cljs.core.concat.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [(new cljs.core.PersistentVector(null,2,(5),cljs.core.PersistentVector.EMPTY_NODE,[cljs.core.cst$kw$value,self__.value],null))], null),self__.__extmap));
});

mikron.common.DiffedValue.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = (function (this__6831__auto__,G__14064){
var self__ = this;
var this__6831__auto____$1 = this;
return (new mikron.common.DiffedValue(self__.value,G__14064,self__.__extmap,self__.__hash));
});

mikron.common.DiffedValue.prototype.cljs$core$ICollection$_conj$arity$2 = (function (this__6837__auto__,entry__6838__auto__){
var self__ = this;
var this__6837__auto____$1 = this;
if(cljs.core.vector_QMARK_(entry__6838__auto__)){
return cljs.core._assoc(this__6837__auto____$1,cljs.core._nth.cljs$core$IFn$_invoke$arity$2(entry__6838__auto__,(0)),cljs.core._nth.cljs$core$IFn$_invoke$arity$2(entry__6838__auto__,(1)));
} else {
return cljs.core.reduce.cljs$core$IFn$_invoke$arity$3(cljs.core._conj,this__6837__auto____$1,entry__6838__auto__);
}
});

mikron.common.DiffedValue.getBasis = (function (){
return new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$sym$value], null);
});

mikron.common.DiffedValue.cljs$lang$type = true;

mikron.common.DiffedValue.cljs$lang$ctorPrSeq = (function (this__6866__auto__){
return cljs.core._conj(cljs.core.List.EMPTY,"mikron.common/DiffedValue");
});

mikron.common.DiffedValue.cljs$lang$ctorPrWriter = (function (this__6866__auto__,writer__6867__auto__){
return cljs.core._write(writer__6867__auto__,"mikron.common/DiffedValue");
});

mikron.common.__GT_DiffedValue = (function mikron$common$__GT_DiffedValue(value){
return (new mikron.common.DiffedValue(value,null,null,null));
});

mikron.common.map__GT_DiffedValue = (function mikron$common$map__GT_DiffedValue(G__14070){
return (new mikron.common.DiffedValue(cljs.core.cst$kw$value.cljs$core$IFn$_invoke$arity$1(G__14070),null,cljs.core.dissoc.cljs$core$IFn$_invoke$arity$2(G__14070,cljs.core.cst$kw$value),null));
});

mikron.common.diffed_QMARK_ = (function mikron$common$diffed_QMARK_(value){
return (value instanceof mikron.common.DiffedValue);
});
mikron.common.wrap_diffed = (function mikron$common$wrap_diffed(value){
return mikron.common.__GT_DiffedValue(value);
});
mikron.common.unwrap_diffed = (function mikron$common$unwrap_diffed(value){
if(cljs.core.truth_(mikron.common.diffed_QMARK_(value))){
} else {
throw (new Error("Assert failed: (diffed? value)"));
}

return cljs.core.cst$kw$value.cljs$core$IFn$_invoke$arity$1(value);
});
mikron.common.interp_numbers = (function mikron$common$interp_numbers(value_1,value_2,time_factor){
return (value_1 + (time_factor * (value_2 - value_1)));
});
