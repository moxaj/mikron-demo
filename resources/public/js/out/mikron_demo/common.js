// Compiled by ClojureScript 1.8.51 {:static-fns true, :optimize-constants true}
goog.provide('mikron_demo.common');
goog.require('cljs.core');
goog.require('mikron.core');
var processors_14210_14634 = (function (){var buffer_9003 = mikron.buffer.allocate((10000));
var interp_body_8890 = ((function (buffer_9003){
return (function mikron_demo$common$interp_body_8890(value_1_14237,value_2_14238,time_1_14239,time_2_14240,time_14241){
var prefer_first_QMARK__14242 = (mikron.common.abs((time_14241 - time_1_14239)) < mikron.common.abs((time_14241 - time_2_14240)));
var time_factor_14243 = ((time_14241 - time_1_14239) / (time_2_14240 - time_1_14239));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_14237,value_2_14238)){
return value_1_14237;
} else {
if(prefer_first_QMARK__14242){
return value_1_14237;
} else {
return value_2_14238;
}
}
});})(buffer_9003))
;
var unpack_coord_8868 = ((function (buffer_9003){
return (function mikron_demo$common$unpack_coord_8868(buffer_14289){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [mikron.buffer.read_float_BANG_(buffer_14289),mikron.buffer.read_float_BANG_(buffer_14289)], null);
});})(buffer_9003))
;
var interp_9029 = ((function (buffer_9003){
return (function mikron_demo$common$interp_9029(schema_14352,value_1_14353,value_2_14354,time_1_14355,time_2_14356,time_14357){
return (function (){var G__14486 = (((schema_14352 instanceof cljs.core.Keyword))?schema_14352.fqn:null);
switch (G__14486) {
case "body":
return interp_body_8890;

break;
case "fixture":
return interp_fixture_8928;

break;
case "coord":
return interp_coord_8957;

break;
case "snapshot":
return interp_snapshot_8992;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_14352)].join('')));

}
})().call(null,value_1_14353,value_2_14354,time_1_14355,time_2_14356,time_14357);
});})(buffer_9003))
;
var diff_fixture_8917 = ((function (buffer_9003){
return (function mikron_demo$common$diff_fixture_8917(value_1_14265,value_2_14266){
return mikron.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_14265,value_2_14266))?cljs.core.cst$kw$mikron_SLASH_dnil:value_2_14266));
});})(buffer_9003))
;
var gen_snapshot_8984 = ((function (buffer_9003){
return (function mikron_demo$common$gen_snapshot_8984(){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$time,mikron.common.random_integer((8),true),cljs.core.cst$kw$bodies,cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(((2) + cljs.core.rand_int((4))),((function (buffer_9003){
return (function (){
return gen_body_8880();
});})(buffer_9003))
)], null);
});})(buffer_9003))
;
var unpack_diffed_snapshot_8977 = ((function (buffer_9003){
return (function mikron_demo$common$unpack_diffed_snapshot_8977(buffer_14317){
if(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14317))){
return cljs.core.cst$kw$mikron_SLASH_dnil;
} else {
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$bodies,(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14317))?cljs.core.cst$kw$mikron_SLASH_dnil:cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(mikron.buffer.read_varint_BANG_(buffer_14317),((function (buffer_9003){
return (function (){
if(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14317))){
return cljs.core.cst$kw$mikron_SLASH_dnil;
} else {
return unpack_diffed_body_8871(buffer_14317);
}
});})(buffer_9003))
))),cljs.core.cst$kw$time,(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14317))?cljs.core.cst$kw$mikron_SLASH_dnil:mikron.buffer.read_long_BANG_(buffer_14317))], null);
}
});})(buffer_9003))
;
var pack_body_8844 = ((function (buffer_9003){
return (function mikron_demo$common$pack_body_8844(buffer_14214,value_14213){
var inner_value_14215_14658 = cljs.core.cst$kw$angle.cljs$core$IFn$_invoke$arity$1(value_14213);
mikron.buffer.write_float_BANG_(buffer_14214,inner_value_14215_14658);

var inner_value_14215_14659 = cljs.core.cst$kw$body_DASH_type.cljs$core$IFn$_invoke$arity$1(value_14213);
mikron.buffer.write_varint_BANG_(buffer_14214,(function (){var G__14498 = (((inner_value_14215_14659 instanceof cljs.core.Keyword))?inner_value_14215_14659.fqn:null);
switch (G__14498) {
case "dynamic":
return (0);

break;
case "static":
return (1);

break;
case "kinetic":
return (2);

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(inner_value_14215_14659)].join('')));

}
})());

var inner_value_14215_14661 = cljs.core.cst$kw$fixtures.cljs$core$IFn$_invoke$arity$1(value_14213);
mikron.buffer.write_varint_BANG_(buffer_14214,cljs.core.count(inner_value_14215_14661));

cljs.core.run_BANG_(((function (inner_value_14215_14661,buffer_9003){
return (function (inner_value_14216){
return pack_fixture_8847(buffer_14214,inner_value_14216);
});})(inner_value_14215_14661,buffer_9003))
,inner_value_14215_14661);

var inner_value_14215_14662 = cljs.core.cst$kw$position.cljs$core$IFn$_invoke$arity$1(value_14213);
pack_coord_8848(buffer_14214,inner_value_14215_14662);

var inner_value_14215_14663 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_14213);
var inner_value_14217_14665 = cljs.core.cst$kw$id.cljs$core$IFn$_invoke$arity$1(inner_value_14215_14663);
mikron.buffer.write_int_BANG_(buffer_14214,inner_value_14217_14665);

return buffer_14214;
});})(buffer_9003))
;
var pack_snapshot_8962 = ((function (buffer_9003){
return (function mikron_demo$common$pack_snapshot_8962(buffer_14305,value_14304){
var inner_value_14306_14669 = cljs.core.cst$kw$bodies.cljs$core$IFn$_invoke$arity$1(value_14304);
mikron.buffer.write_varint_BANG_(buffer_14305,cljs.core.count(inner_value_14306_14669));

cljs.core.run_BANG_(((function (inner_value_14306_14669,buffer_9003){
return (function (inner_value_14307){
return pack_body_8844(buffer_14305,inner_value_14307);
});})(inner_value_14306_14669,buffer_9003))
,inner_value_14306_14669);

var inner_value_14306_14670 = cljs.core.cst$kw$time.cljs$core$IFn$_invoke$arity$1(value_14304);
mikron.buffer.write_long_BANG_(buffer_14305,inner_value_14306_14670);

return buffer_14305;
});})(buffer_9003))
;
var interp_fixture_8928 = ((function (buffer_9003){
return (function mikron_demo$common$interp_fixture_8928(value_1_14269,value_2_14270,time_1_14271,time_2_14272,time_14273){
var prefer_first_QMARK__14274 = (mikron.common.abs((time_14273 - time_1_14271)) < mikron.common.abs((time_14273 - time_2_14272)));
var time_factor_14275 = ((time_14273 - time_1_14271) / (time_2_14272 - time_1_14271));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_14269,value_2_14270)){
return value_1_14269;
} else {
if(prefer_first_QMARK__14274){
return value_1_14269;
} else {
return value_2_14270;
}
}
});})(buffer_9003))
;
var validate_fixture_8897 = ((function (buffer_9003){
return (function mikron_demo$common$validate_fixture_8897(value_14276){
if(cljs.core.map_QMARK_(value_14276)){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not a map.",cljs.core.array_seq([value_14276], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/map? value_14276)")].join('')));
}

var inner_value_14277_14674 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_14276);
if(cljs.core.map_QMARK_(inner_value_14277_14674)){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not a map.",cljs.core.array_seq([inner_value_14277_14674], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/map? inner-value_14277)")].join('')));
}

var inner_value_14278_14676 = cljs.core.cst$kw$color.cljs$core$IFn$_invoke$arity$1(inner_value_14277_14674);
if(cljs.core.integer_QMARK_(inner_value_14278_14676)){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not an integer.",cljs.core.array_seq([inner_value_14278_14676], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/integer? inner-value_14278)")].join('')));
}

var inner_value_14277_14678 = cljs.core.cst$kw$coords.cljs$core$IFn$_invoke$arity$1(value_14276);
if(cljs.core.sequential_QMARK_(inner_value_14277_14678)){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not sequential.",cljs.core.array_seq([inner_value_14277_14678], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/sequential? inner-value_14277)")].join('')));
}

cljs.core.run_BANG_(((function (inner_value_14277_14678,buffer_9003){
return (function (inner_value_14279){
return validate_coord_8895(inner_value_14279);
});})(inner_value_14277_14678,buffer_9003))
,inner_value_14277_14678);

return value_14276;
});})(buffer_9003))
;
var validate_9032 = ((function (buffer_9003){
return (function mikron_demo$common$validate_9032(schema_14358,value_14359){
return (function (){var G__14505 = (((schema_14358 instanceof cljs.core.Keyword))?schema_14358.fqn:null);
switch (G__14505) {
case "body":
return validate_body_8892;

break;
case "fixture":
return validate_fixture_8897;

break;
case "coord":
return validate_coord_8895;

break;
case "snapshot":
return validate_snapshot_8994;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_14358)].join('')));

}
})().call(null,value_14359);
});})(buffer_9003))
;
var gen_body_8880 = ((function (buffer_9003){
return (function mikron_demo$common$gen_body_8880(){
return new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$id,mikron.common.random_integer((4),true)], null),cljs.core.cst$kw$position,gen_coord_8881(),cljs.core.cst$kw$angle,cljs.core.rand.cljs$core$IFn$_invoke$arity$0(),cljs.core.cst$kw$body_DASH_type,cljs.core.rand_nth(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$dynamic,cljs.core.cst$kw$static,cljs.core.cst$kw$kinetic], null)),cljs.core.cst$kw$fixtures,cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(((2) + cljs.core.rand_int((4))),((function (buffer_9003){
return (function (){
return gen_fixture_8882();
});})(buffer_9003))
)], null);
});})(buffer_9003))
;
var validate_coord_8895 = ((function (buffer_9003){
return (function mikron_demo$common$validate_coord_8895(value_14302){
if(cljs.core.vector_QMARK_(value_14302)){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not a vector.",cljs.core.array_seq([value_14302], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/vector? value_14302)")].join('')));
}

var inner_value_14303_14685 = (value_14302.cljs$core$IFn$_invoke$arity$1 ? value_14302.cljs$core$IFn$_invoke$arity$1((0)) : value_14302.call(null,(0)));
if(typeof inner_value_14303_14685 === 'number'){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not a number.",cljs.core.array_seq([inner_value_14303_14685], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/number? inner-value_14303)")].join('')));
}

var inner_value_14303_14689 = (value_14302.cljs$core$IFn$_invoke$arity$1 ? value_14302.cljs$core$IFn$_invoke$arity$1((1)) : value_14302.call(null,(1)));
if(typeof inner_value_14303_14689 === 'number'){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not a number.",cljs.core.array_seq([inner_value_14303_14689], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/number? inner-value_14303)")].join('')));
}

return value_14302;
});})(buffer_9003))
;
var undiff_body_8879 = ((function (buffer_9003){
return (function mikron_demo$common$undiff_body_8879(value_1_14235,value_2_14236){
var value_2_14236__$1 = mikron.common.unwrap_diffed(value_2_14236);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,value_2_14236__$1)){
return value_1_14235;
} else {
return value_2_14236__$1;
}
});})(buffer_9003))
;
var interp_coord_8957 = ((function (buffer_9003){
return (function mikron_demo$common$interp_coord_8957(value_1_14295,value_2_14296,time_1_14297,time_2_14298,time_14299){
var prefer_first_QMARK__14300 = (mikron.common.abs((time_14299 - time_1_14297)) < mikron.common.abs((time_14299 - time_2_14298)));
var time_factor_14301 = ((time_14299 - time_1_14297) / (time_2_14298 - time_1_14297));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_14295,value_2_14296)){
return value_1_14295;
} else {
if(prefer_first_QMARK__14300){
return value_1_14295;
} else {
return value_2_14296;
}
}
});})(buffer_9003))
;
var validate_body_8892 = ((function (buffer_9003){
return (function mikron_demo$common$validate_body_8892(value_14244){
if(cljs.core.map_QMARK_(value_14244)){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not a map.",cljs.core.array_seq([value_14244], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/map? value_14244)")].join('')));
}

var inner_value_14245_14690 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_14244);
if(cljs.core.map_QMARK_(inner_value_14245_14690)){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not a map.",cljs.core.array_seq([inner_value_14245_14690], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/map? inner-value_14245)")].join('')));
}

var inner_value_14246_14694 = cljs.core.cst$kw$id.cljs$core$IFn$_invoke$arity$1(inner_value_14245_14690);
if(cljs.core.integer_QMARK_(inner_value_14246_14694)){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not an integer.",cljs.core.array_seq([inner_value_14246_14694], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/integer? inner-value_14246)")].join('')));
}

var inner_value_14245_14695 = cljs.core.cst$kw$position.cljs$core$IFn$_invoke$arity$1(value_14244);
validate_coord_8895(inner_value_14245_14695);

var inner_value_14245_14697 = cljs.core.cst$kw$angle.cljs$core$IFn$_invoke$arity$1(value_14244);
if(typeof inner_value_14245_14697 === 'number'){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not a number.",cljs.core.array_seq([inner_value_14245_14697], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/number? inner-value_14245)")].join('')));
}

var inner_value_14245_14699 = cljs.core.cst$kw$body_DASH_type.cljs$core$IFn$_invoke$arity$1(value_14244);
if(cljs.core.truth_(new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 3, [cljs.core.cst$kw$static,null,cljs.core.cst$kw$dynamic,null,cljs.core.cst$kw$kinetic,null], null), null).call(null,inner_value_14245_14699))){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not a valid enum value.",cljs.core.array_seq([inner_value_14245_14699], 0))),cljs.core.str("\n"),cljs.core.str("(#{:static :dynamic :kinetic} inner-value_14245)")].join('')));
}

var inner_value_14245_14701 = cljs.core.cst$kw$fixtures.cljs$core$IFn$_invoke$arity$1(value_14244);
if(cljs.core.sequential_QMARK_(inner_value_14245_14701)){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not sequential.",cljs.core.array_seq([inner_value_14245_14701], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/sequential? inner-value_14245)")].join('')));
}

cljs.core.run_BANG_(((function (inner_value_14245_14701,buffer_9003){
return (function (inner_value_14247){
return validate_fixture_8897(inner_value_14247);
});})(inner_value_14245_14701,buffer_9003))
,inner_value_14245_14701);

return value_14244;
});})(buffer_9003))
;
var pack_diffed_snapshot_8967 = ((function (buffer_9003){
return (function mikron_demo$common$pack_diffed_snapshot_8967(buffer_14309,value_14308){
var value_dnil_QMARK__14310_14702 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,value_14308);
mikron.buffer.write_boolean_BANG_(buffer_14309,value_dnil_QMARK__14310_14702);

if(value_dnil_QMARK__14310_14702){
} else {
var inner_value_14311_14703 = cljs.core.cst$kw$bodies.cljs$core$IFn$_invoke$arity$1(value_14308);
var value_dnil_QMARK__14312_14704 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14311_14703);
mikron.buffer.write_boolean_BANG_(buffer_14309,value_dnil_QMARK__14312_14704);

if(value_dnil_QMARK__14312_14704){
} else {
mikron.buffer.write_varint_BANG_(buffer_14309,cljs.core.count(inner_value_14311_14703));

cljs.core.run_BANG_(((function (value_dnil_QMARK__14312_14704,inner_value_14311_14703,value_dnil_QMARK__14310_14702,buffer_9003){
return (function (inner_value_14313){
var value_dnil_QMARK__14314 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14313);
mikron.buffer.write_boolean_BANG_(buffer_14309,value_dnil_QMARK__14314);

if(value_dnil_QMARK__14314){
return null;
} else {
return pack_diffed_body_8852(buffer_14309,inner_value_14313);
}
});})(value_dnil_QMARK__14312_14704,inner_value_14311_14703,value_dnil_QMARK__14310_14702,buffer_9003))
,inner_value_14311_14703);
}

var inner_value_14311_14708 = cljs.core.cst$kw$time.cljs$core$IFn$_invoke$arity$1(value_14308);
var value_dnil_QMARK__14315_14709 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14311_14708);
mikron.buffer.write_boolean_BANG_(buffer_14309,value_dnil_QMARK__14315_14709);

if(value_dnil_QMARK__14315_14709){
} else {
mikron.buffer.write_long_BANG_(buffer_14309,inner_value_14311_14708);
}
}

return buffer_14309;
});})(buffer_9003))
;
var unpack_fixture_8869 = ((function (buffer_9003){
return (function mikron_demo$common$unpack_fixture_8869(buffer_14263){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$coords,cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(mikron.buffer.read_varint_BANG_(buffer_14263),((function (buffer_9003){
return (function (){
return unpack_coord_8868(buffer_14263);
});})(buffer_9003))
)),cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$color,mikron.buffer.read_int_BANG_(buffer_14263)], null)], null);
});})(buffer_9003))
;
var interp_snapshot_8992 = ((function (buffer_9003){
return (function mikron_demo$common$interp_snapshot_8992(value_1_14322,value_2_14323,time_1_14324,time_2_14325,time_14326){
var prefer_first_QMARK__14327 = (mikron.common.abs((time_14326 - time_1_14324)) < mikron.common.abs((time_14326 - time_2_14325)));
var time_factor_14328 = ((time_14326 - time_1_14324) / (time_2_14325 - time_1_14324));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_14322,value_2_14323)){
return value_1_14322;
} else {
if(prefer_first_QMARK__14327){
return value_1_14322;
} else {
return value_2_14323;
}
}
});})(buffer_9003))
;
var pack_fixture_8847 = ((function (buffer_9003){
return (function mikron_demo$common$pack_fixture_8847(buffer_14249,value_14248){
var inner_value_14250_14710 = cljs.core.cst$kw$coords.cljs$core$IFn$_invoke$arity$1(value_14248);
mikron.buffer.write_varint_BANG_(buffer_14249,cljs.core.count(inner_value_14250_14710));

cljs.core.run_BANG_(((function (inner_value_14250_14710,buffer_9003){
return (function (inner_value_14251){
return pack_coord_8848(buffer_14249,inner_value_14251);
});})(inner_value_14250_14710,buffer_9003))
,inner_value_14250_14710);

var inner_value_14250_14711 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_14248);
var inner_value_14252_14712 = cljs.core.cst$kw$color.cljs$core$IFn$_invoke$arity$1(inner_value_14250_14711);
mikron.buffer.write_int_BANG_(buffer_14249,inner_value_14252_14712);

return buffer_14249;
});})(buffer_9003))
;
var pack_diffed_fixture_8860 = ((function (buffer_9003){
return (function mikron_demo$common$pack_diffed_fixture_8860(buffer_14254,value_14253){
var value_dnil_QMARK__14255_14713 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,value_14253);
mikron.buffer.write_boolean_BANG_(buffer_14254,value_dnil_QMARK__14255_14713);

if(value_dnil_QMARK__14255_14713){
} else {
var inner_value_14256_14714 = cljs.core.cst$kw$coords.cljs$core$IFn$_invoke$arity$1(value_14253);
var value_dnil_QMARK__14257_14715 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14256_14714);
mikron.buffer.write_boolean_BANG_(buffer_14254,value_dnil_QMARK__14257_14715);

if(value_dnil_QMARK__14257_14715){
} else {
mikron.buffer.write_varint_BANG_(buffer_14254,cljs.core.count(inner_value_14256_14714));

cljs.core.run_BANG_(((function (value_dnil_QMARK__14257_14715,inner_value_14256_14714,value_dnil_QMARK__14255_14713,buffer_9003){
return (function (inner_value_14258){
var value_dnil_QMARK__14259 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14258);
mikron.buffer.write_boolean_BANG_(buffer_14254,value_dnil_QMARK__14259);

if(value_dnil_QMARK__14259){
return null;
} else {
return pack_diffed_coord_8862(buffer_14254,inner_value_14258);
}
});})(value_dnil_QMARK__14257_14715,inner_value_14256_14714,value_dnil_QMARK__14255_14713,buffer_9003))
,inner_value_14256_14714);
}

var inner_value_14256_14716 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_14253);
var value_dnil_QMARK__14260_14717 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14256_14716);
mikron.buffer.write_boolean_BANG_(buffer_14254,value_dnil_QMARK__14260_14717);

if(value_dnil_QMARK__14260_14717){
} else {
var inner_value_14261_14718 = cljs.core.cst$kw$color.cljs$core$IFn$_invoke$arity$1(inner_value_14256_14716);
var value_dnil_QMARK__14262_14719 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14261_14718);
mikron.buffer.write_boolean_BANG_(buffer_14254,value_dnil_QMARK__14262_14719);

if(value_dnil_QMARK__14262_14719){
} else {
mikron.buffer.write_int_BANG_(buffer_14254,inner_value_14261_14718);
}
}
}

return buffer_14254;
});})(buffer_9003))
;
var diff_coord_8946 = ((function (buffer_9003){
return (function mikron_demo$common$diff_coord_8946(value_1_14291,value_2_14292){
return mikron.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_14291,value_2_14292))?cljs.core.cst$kw$mikron_SLASH_dnil:value_2_14292));
});})(buffer_9003))
;
var undiff_9020 = ((function (buffer_9003){
return (function mikron_demo$common$undiff_9020(schema_14348,value_1_14349,value_2_14350){
return (function (){var G__14545 = (((schema_14348 instanceof cljs.core.Keyword))?schema_14348.fqn:null);
switch (G__14545) {
case "body":
return undiff_body_8879;

break;
case "fixture":
return undiff_fixture_8920;

break;
case "coord":
return undiff_coord_8949;

break;
case "snapshot":
return undiff_snapshot_8983;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_14348)].join('')));

}
})().call(null,value_1_14349,value_2_14350);
});})(buffer_9003))
;
var unpack_diffed_body_8871 = ((function (buffer_9003){
return (function mikron_demo$common$unpack_diffed_body_8871(buffer_14232){
if(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14232))){
return cljs.core.cst$kw$mikron_SLASH_dnil;
} else {
return new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$angle,(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14232))?cljs.core.cst$kw$mikron_SLASH_dnil:mikron.buffer.read_float_BANG_(buffer_14232)),cljs.core.cst$kw$body_DASH_type,(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14232))?cljs.core.cst$kw$mikron_SLASH_dnil:cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$dynamic,cljs.core.cst$kw$static,cljs.core.cst$kw$kinetic], null),mikron.buffer.read_varint_BANG_(buffer_14232))),cljs.core.cst$kw$fixtures,(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14232))?cljs.core.cst$kw$mikron_SLASH_dnil:cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(mikron.buffer.read_varint_BANG_(buffer_14232),((function (buffer_9003){
return (function (){
if(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14232))){
return cljs.core.cst$kw$mikron_SLASH_dnil;
} else {
return unpack_diffed_fixture_8873(buffer_14232);
}
});})(buffer_9003))
))),cljs.core.cst$kw$position,(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14232))?cljs.core.cst$kw$mikron_SLASH_dnil:unpack_diffed_coord_8872(buffer_14232)),cljs.core.cst$kw$user_DASH_data,(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14232))?cljs.core.cst$kw$mikron_SLASH_dnil:new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$id,(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14232))?cljs.core.cst$kw$mikron_SLASH_dnil:mikron.buffer.read_int_BANG_(buffer_14232))], null))], null);
}
});})(buffer_9003))
;
var unpack_diffed_coord_8872 = ((function (buffer_9003){
return (function mikron_demo$common$unpack_diffed_coord_8872(buffer_14290){
if(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14290))){
return cljs.core.cst$kw$mikron_SLASH_dnil;
} else {
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14290))?cljs.core.cst$kw$mikron_SLASH_dnil:mikron.buffer.read_float_BANG_(buffer_14290)),(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14290))?cljs.core.cst$kw$mikron_SLASH_dnil:mikron.buffer.read_float_BANG_(buffer_14290))], null);
}
});})(buffer_9003))
;
var unpack_9012 = ((function (buffer_9003){
return (function mikron_demo$common$unpack_9012(raw_14338){
var buffer_14339 = mikron.buffer.wrap(raw_14338);
var headers_14340 = mikron.buffer.read_headers_BANG_(buffer_14339);
var schema_14342 = cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$body,cljs.core.cst$kw$coord,cljs.core.cst$kw$fixture,cljs.core.cst$kw$snapshot], null),cljs.core.cst$kw$schema_DASH_id.cljs$core$IFn$_invoke$arity$1(headers_14340));
var meta_schema_id_14344 = cljs.core.cst$kw$meta_DASH_schema_DASH_id.cljs$core$IFn$_invoke$arity$1(headers_14340);
var meta_schema_14343 = cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$body,cljs.core.cst$kw$coord,cljs.core.cst$kw$fixture,cljs.core.cst$kw$snapshot], null),meta_schema_id_14344);
var diffed_QMARK__14341 = cljs.core.cst$kw$diffed_QMARK_.cljs$core$IFn$_invoke$arity$1(headers_14340);
if(cljs.core.truth_((function (){var or__6210__auto__ = cljs.core.not(schema_14342);
if(or__6210__auto__){
return or__6210__auto__;
} else {
var and__6198__auto__ = meta_schema_id_14344;
if(cljs.core.truth_(and__6198__auto__)){
return cljs.core.not(meta_schema_14343);
} else {
return and__6198__auto__;
}
}
})())){
return cljs.core.cst$kw$mikron_SLASH_invalid;
} else {
var G__14563 = new cljs.core.PersistentArrayMap(null, 3, [cljs.core.cst$kw$schema,schema_14342,cljs.core.cst$kw$diffed_QMARK_,diffed_QMARK__14341,cljs.core.cst$kw$value,(function (){var G__14564 = (cljs.core.truth_(diffed_QMARK__14341)?(function (){var G__14565 = (((schema_14342 instanceof cljs.core.Keyword))?schema_14342.fqn:null);
switch (G__14565) {
case "body":
return unpack_diffed_body_8871;

break;
case "fixture":
return unpack_diffed_fixture_8873;

break;
case "coord":
return unpack_diffed_coord_8872;

break;
case "snapshot":
return unpack_diffed_snapshot_8977;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_14342)].join('')));

}
})():(function (){var G__14566 = (((schema_14342 instanceof cljs.core.Keyword))?schema_14342.fqn:null);
switch (G__14566) {
case "body":
return unpack_body_8867;

break;
case "fixture":
return unpack_fixture_8869;

break;
case "coord":
return unpack_coord_8868;

break;
case "snapshot":
return unpack_snapshot_8975;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_14342)].join('')));

}
})()).call(null,buffer_14339);
if(cljs.core.truth_(diffed_QMARK__14341)){
return mikron.common.wrap_diffed(G__14564);
} else {
return G__14564;
}
})()], null);
if(cljs.core.truth_(meta_schema_14343)){
return cljs.core.assoc.cljs$core$IFn$_invoke$arity$variadic(G__14563,cljs.core.cst$kw$meta_DASH_schema,meta_schema_14343,cljs.core.array_seq([cljs.core.cst$kw$meta_DASH_value,(function (){var G__14568 = (((meta_schema_14343 instanceof cljs.core.Keyword))?meta_schema_14343.fqn:null);
switch (G__14568) {
case "body":
return unpack_body_8867;

break;
case "fixture":
return unpack_fixture_8869;

break;
case "coord":
return unpack_coord_8868;

break;
case "snapshot":
return unpack_snapshot_8975;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(meta_schema_14343)].join('')));

}
})().call(null,buffer_14339)], 0));
} else {
return G__14563;
}
}
});})(buffer_9003))
;
var unpack_diffed_fixture_8873 = ((function (buffer_9003){
return (function mikron_demo$common$unpack_diffed_fixture_8873(buffer_14264){
if(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14264))){
return cljs.core.cst$kw$mikron_SLASH_dnil;
} else {
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$coords,(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14264))?cljs.core.cst$kw$mikron_SLASH_dnil:cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(mikron.buffer.read_varint_BANG_(buffer_14264),((function (buffer_9003){
return (function (){
if(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14264))){
return cljs.core.cst$kw$mikron_SLASH_dnil;
} else {
return unpack_diffed_coord_8872(buffer_14264);
}
});})(buffer_9003))
))),cljs.core.cst$kw$user_DASH_data,(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14264))?cljs.core.cst$kw$mikron_SLASH_dnil:new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$color,(cljs.core.truth_(mikron.buffer.read_boolean_BANG_(buffer_14264))?cljs.core.cst$kw$mikron_SLASH_dnil:mikron.buffer.read_int_BANG_(buffer_14264))], null))], null);
}
});})(buffer_9003))
;
var validate_snapshot_8994 = ((function (buffer_9003){
return (function mikron_demo$common$validate_snapshot_8994(value_14329){
if(cljs.core.map_QMARK_(value_14329)){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not a map.",cljs.core.array_seq([value_14329], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/map? value_14329)")].join('')));
}

var inner_value_14330_14734 = cljs.core.cst$kw$time.cljs$core$IFn$_invoke$arity$1(value_14329);
if(cljs.core.integer_QMARK_(inner_value_14330_14734)){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not an integer.",cljs.core.array_seq([inner_value_14330_14734], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/integer? inner-value_14330)")].join('')));
}

var inner_value_14330_14735 = cljs.core.cst$kw$bodies.cljs$core$IFn$_invoke$arity$1(value_14329);
if(cljs.core.sequential_QMARK_(inner_value_14330_14735)){
} else {
throw (new Error([cljs.core.str("Assert failed: "),cljs.core.str(mikron.common.format.cljs$core$IFn$_invoke$arity$variadic("'%s' is not sequential.",cljs.core.array_seq([inner_value_14330_14735], 0))),cljs.core.str("\n"),cljs.core.str("(clojure.core/sequential? inner-value_14330)")].join('')));
}

cljs.core.run_BANG_(((function (inner_value_14330_14735,buffer_9003){
return (function (inner_value_14331){
return validate_body_8892(inner_value_14331);
});})(inner_value_14330_14735,buffer_9003))
,inner_value_14330_14735);

return value_14329;
});})(buffer_9003))
;
var diff_body_8876 = ((function (buffer_9003){
return (function mikron_demo$common$diff_body_8876(value_1_14233,value_2_14234){
return mikron.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_14233,value_2_14234))?cljs.core.cst$kw$mikron_SLASH_dnil:value_2_14234));
});})(buffer_9003))
;
var pack_diffed_coord_8862 = ((function (buffer_9003){
return (function mikron_demo$common$pack_diffed_coord_8862(buffer_14284,value_14283){
var value_dnil_QMARK__14285_14737 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,value_14283);
mikron.buffer.write_boolean_BANG_(buffer_14284,value_dnil_QMARK__14285_14737);

if(value_dnil_QMARK__14285_14737){
} else {
var inner_value_14286_14739 = (value_14283.cljs$core$IFn$_invoke$arity$1 ? value_14283.cljs$core$IFn$_invoke$arity$1((0)) : value_14283.call(null,(0)));
var value_dnil_QMARK__14287_14741 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14286_14739);
mikron.buffer.write_boolean_BANG_(buffer_14284,value_dnil_QMARK__14287_14741);

if(value_dnil_QMARK__14287_14741){
} else {
mikron.buffer.write_float_BANG_(buffer_14284,inner_value_14286_14739);
}

var inner_value_14286_14743 = (value_14283.cljs$core$IFn$_invoke$arity$1 ? value_14283.cljs$core$IFn$_invoke$arity$1((1)) : value_14283.call(null,(1)));
var value_dnil_QMARK__14288_14744 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14286_14743);
mikron.buffer.write_boolean_BANG_(buffer_14284,value_dnil_QMARK__14288_14744);

if(value_dnil_QMARK__14288_14744){
} else {
mikron.buffer.write_float_BANG_(buffer_14284,inner_value_14286_14743);
}
}

return buffer_14284;
});})(buffer_9003))
;
var diff_9016 = ((function (buffer_9003){
return (function mikron_demo$common$diff_9016(schema_14345,value_1_14346,value_2_14347){
return (function (){var G__14576 = (((schema_14345 instanceof cljs.core.Keyword))?schema_14345.fqn:null);
switch (G__14576) {
case "body":
return diff_body_8876;

break;
case "fixture":
return diff_fixture_8917;

break;
case "coord":
return diff_coord_8946;

break;
case "snapshot":
return diff_snapshot_8980;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_14345)].join('')));

}
})().call(null,value_1_14346,value_2_14347);
});})(buffer_9003))
;
var pack_coord_8848 = ((function (buffer_9003){
return (function mikron_demo$common$pack_coord_8848(buffer_14281,value_14280){
var inner_value_14282_14752 = (value_14280.cljs$core$IFn$_invoke$arity$1 ? value_14280.cljs$core$IFn$_invoke$arity$1((0)) : value_14280.call(null,(0)));
mikron.buffer.write_float_BANG_(buffer_14281,inner_value_14282_14752);

var inner_value_14282_14753 = (value_14280.cljs$core$IFn$_invoke$arity$1 ? value_14280.cljs$core$IFn$_invoke$arity$1((1)) : value_14280.call(null,(1)));
mikron.buffer.write_float_BANG_(buffer_14281,inner_value_14282_14753);

return buffer_14281;
});})(buffer_9003))
;
var undiff_snapshot_8983 = ((function (buffer_9003){
return (function mikron_demo$common$undiff_snapshot_8983(value_1_14320,value_2_14321){
var value_2_14321__$1 = mikron.common.unwrap_diffed(value_2_14321);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,value_2_14321__$1)){
return value_1_14320;
} else {
return value_2_14321__$1;
}
});})(buffer_9003))
;
var pack_diffed_body_8852 = ((function (buffer_9003){
return (function mikron_demo$common$pack_diffed_body_8852(buffer_14219,value_14218){
var value_dnil_QMARK__14220_14754 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,value_14218);
mikron.buffer.write_boolean_BANG_(buffer_14219,value_dnil_QMARK__14220_14754);

if(value_dnil_QMARK__14220_14754){
} else {
var inner_value_14221_14755 = cljs.core.cst$kw$angle.cljs$core$IFn$_invoke$arity$1(value_14218);
var value_dnil_QMARK__14222_14756 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14221_14755);
mikron.buffer.write_boolean_BANG_(buffer_14219,value_dnil_QMARK__14222_14756);

if(value_dnil_QMARK__14222_14756){
} else {
mikron.buffer.write_float_BANG_(buffer_14219,inner_value_14221_14755);
}

var inner_value_14221_14758 = cljs.core.cst$kw$body_DASH_type.cljs$core$IFn$_invoke$arity$1(value_14218);
var value_dnil_QMARK__14223_14759 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14221_14758);
mikron.buffer.write_boolean_BANG_(buffer_14219,value_dnil_QMARK__14223_14759);

if(value_dnil_QMARK__14223_14759){
} else {
mikron.buffer.write_varint_BANG_(buffer_14219,(function (){var G__14584 = (((inner_value_14221_14758 instanceof cljs.core.Keyword))?inner_value_14221_14758.fqn:null);
switch (G__14584) {
case "dynamic":
return (0);

break;
case "static":
return (1);

break;
case "kinetic":
return (2);

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(inner_value_14221_14758)].join('')));

}
})());
}

var inner_value_14221_14764 = cljs.core.cst$kw$fixtures.cljs$core$IFn$_invoke$arity$1(value_14218);
var value_dnil_QMARK__14224_14765 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14221_14764);
mikron.buffer.write_boolean_BANG_(buffer_14219,value_dnil_QMARK__14224_14765);

if(value_dnil_QMARK__14224_14765){
} else {
mikron.buffer.write_varint_BANG_(buffer_14219,cljs.core.count(inner_value_14221_14764));

cljs.core.run_BANG_(((function (value_dnil_QMARK__14224_14765,inner_value_14221_14764,value_dnil_QMARK__14220_14754,buffer_9003){
return (function (inner_value_14225){
var value_dnil_QMARK__14226 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14225);
mikron.buffer.write_boolean_BANG_(buffer_14219,value_dnil_QMARK__14226);

if(value_dnil_QMARK__14226){
return null;
} else {
return pack_diffed_fixture_8860(buffer_14219,inner_value_14225);
}
});})(value_dnil_QMARK__14224_14765,inner_value_14221_14764,value_dnil_QMARK__14220_14754,buffer_9003))
,inner_value_14221_14764);
}

var inner_value_14221_14766 = cljs.core.cst$kw$position.cljs$core$IFn$_invoke$arity$1(value_14218);
var value_dnil_QMARK__14227_14767 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14221_14766);
mikron.buffer.write_boolean_BANG_(buffer_14219,value_dnil_QMARK__14227_14767);

if(value_dnil_QMARK__14227_14767){
} else {
pack_diffed_coord_8862(buffer_14219,inner_value_14221_14766);
}

var inner_value_14221_14768 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_14218);
var value_dnil_QMARK__14228_14769 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14221_14768);
mikron.buffer.write_boolean_BANG_(buffer_14219,value_dnil_QMARK__14228_14769);

if(value_dnil_QMARK__14228_14769){
} else {
var inner_value_14229_14770 = cljs.core.cst$kw$id.cljs$core$IFn$_invoke$arity$1(inner_value_14221_14768);
var value_dnil_QMARK__14230_14772 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,inner_value_14229_14770);
mikron.buffer.write_boolean_BANG_(buffer_14219,value_dnil_QMARK__14230_14772);

if(value_dnil_QMARK__14230_14772){
} else {
mikron.buffer.write_int_BANG_(buffer_14219,inner_value_14229_14770);
}
}
}

return buffer_14219;
});})(buffer_9003))
;
var diff_snapshot_8980 = ((function (buffer_9003){
return (function mikron_demo$common$diff_snapshot_8980(value_1_14318,value_2_14319){
return mikron.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_14318,value_2_14319))?cljs.core.cst$kw$mikron_SLASH_dnil:value_2_14319));
});})(buffer_9003))
;
var unpack_snapshot_8975 = ((function (buffer_9003){
return (function mikron_demo$common$unpack_snapshot_8975(buffer_14316){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$bodies,cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(mikron.buffer.read_varint_BANG_(buffer_14316),((function (buffer_9003){
return (function (){
return unpack_body_8867(buffer_14316);
});})(buffer_9003))
)),cljs.core.cst$kw$time,mikron.buffer.read_long_BANG_(buffer_14316)], null);
});})(buffer_9003))
;
var unpack_body_8867 = ((function (buffer_9003){
return (function mikron_demo$common$unpack_body_8867(buffer_14231){
return new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$angle,mikron.buffer.read_float_BANG_(buffer_14231),cljs.core.cst$kw$body_DASH_type,cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$dynamic,cljs.core.cst$kw$static,cljs.core.cst$kw$kinetic], null),mikron.buffer.read_varint_BANG_(buffer_14231)),cljs.core.cst$kw$fixtures,cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(mikron.buffer.read_varint_BANG_(buffer_14231),((function (buffer_9003){
return (function (){
return unpack_fixture_8869(buffer_14231);
});})(buffer_9003))
)),cljs.core.cst$kw$position,unpack_coord_8868(buffer_14231),cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$id,mikron.buffer.read_int_BANG_(buffer_14231)], null)], null);
});})(buffer_9003))
;
var gen_fixture_8882 = ((function (buffer_9003){
return (function mikron_demo$common$gen_fixture_8882(){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$color,mikron.common.random_integer((4),true)], null),cljs.core.cst$kw$coords,cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(((2) + cljs.core.rand_int((4))),((function (buffer_9003){
return (function (){
return gen_coord_8881();
});})(buffer_9003))
)], null);
});})(buffer_9003))
;
var gen_coord_8881 = ((function (buffer_9003){
return (function mikron_demo$common$gen_coord_8881(){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.rand.cljs$core$IFn$_invoke$arity$0(),cljs.core.rand.cljs$core$IFn$_invoke$arity$0()], null);
});})(buffer_9003))
;
var pack_9004 = ((function (buffer_9003){
return (function() {
var mikron_demo$common$pack_9004 = null;
var mikron_demo$common$pack_9004__2 = (function (schema_14332,value_14333){
return mikron_demo$common$pack_9004.cljs$core$IFn$_invoke$arity$4(schema_14332,value_14333,null,null);
});
var mikron_demo$common$pack_9004__4 = (function (schema_14332,value_14333,meta_schema_14335,meta_value_14336){
var diffed_QMARK__14334 = mikron.common.diffed_QMARK_(value_14333);
var value_14333__$1 = (function (){var G__14620 = value_14333;
if(cljs.core.truth_(diffed_QMARK__14334)){
return mikron.common.unwrap_diffed(G__14620);
} else {
return G__14620;
}
})();
return mikron.buffer.compress((function (){var G__14623 = (cljs.core.truth_(diffed_QMARK__14334)?(function (){var G__14624 = (((schema_14332 instanceof cljs.core.Keyword))?schema_14332.fqn:null);
switch (G__14624) {
case "body":
return pack_diffed_body_8852;

break;
case "fixture":
return pack_diffed_fixture_8860;

break;
case "coord":
return pack_diffed_coord_8862;

break;
case "snapshot":
return pack_diffed_snapshot_8967;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_14332)].join('')));

}
})():(function (){var G__14625 = (((schema_14332 instanceof cljs.core.Keyword))?schema_14332.fqn:null);
switch (G__14625) {
case "body":
return pack_body_8844;

break;
case "fixture":
return pack_fixture_8847;

break;
case "coord":
return pack_coord_8848;

break;
case "snapshot":
return pack_snapshot_8962;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_14332)].join('')));

}
})()).call(null,mikron.buffer.write_headers_BANG_(buffer_9003,new cljs.core.PersistentArrayMap(null, 4, [cljs.core.cst$kw$body,(0),cljs.core.cst$kw$coord,(1),cljs.core.cst$kw$fixture,(2),cljs.core.cst$kw$snapshot,(3)], null).call(null,schema_14332),new cljs.core.PersistentArrayMap(null, 4, [cljs.core.cst$kw$body,(0),cljs.core.cst$kw$coord,(1),cljs.core.cst$kw$fixture,(2),cljs.core.cst$kw$snapshot,(3)], null).call(null,meta_schema_14335),diffed_QMARK__14334),value_14333__$1);
if(cljs.core.truth_(meta_schema_14335)){
return (function (){var G__14626 = (((meta_schema_14335 instanceof cljs.core.Keyword))?meta_schema_14335.fqn:null);
switch (G__14626) {
case "body":
return pack_body_8844;

break;
case "fixture":
return pack_fixture_8847;

break;
case "coord":
return pack_coord_8848;

break;
case "snapshot":
return pack_snapshot_8962;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(meta_schema_14335)].join('')));

}
})().call(null,G__14623,meta_value_14336);
} else {
return G__14623;
}
})());
});
mikron_demo$common$pack_9004 = function(schema_14332,value_14333,meta_schema_14335,meta_value_14336){
switch(arguments.length){
case 2:
return mikron_demo$common$pack_9004__2.call(this,schema_14332,value_14333);
case 4:
return mikron_demo$common$pack_9004__4.call(this,schema_14332,value_14333,meta_schema_14335,meta_value_14336);
}
throw(new Error('Invalid arity: ' + arguments.length));
};
mikron_demo$common$pack_9004.cljs$core$IFn$_invoke$arity$2 = mikron_demo$common$pack_9004__2;
mikron_demo$common$pack_9004.cljs$core$IFn$_invoke$arity$4 = mikron_demo$common$pack_9004__4;
return mikron_demo$common$pack_9004;
})()
;})(buffer_9003))
;
var undiff_fixture_8920 = ((function (buffer_9003){
return (function mikron_demo$common$undiff_fixture_8920(value_1_14267,value_2_14268){
var value_2_14268__$1 = mikron.common.unwrap_diffed(value_2_14268);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,value_2_14268__$1)){
return value_1_14267;
} else {
return value_2_14268__$1;
}
});})(buffer_9003))
;
var undiff_coord_8949 = ((function (buffer_9003){
return (function mikron_demo$common$undiff_coord_8949(value_1_14293,value_2_14294){
var value_2_14294__$1 = mikron.common.unwrap_diffed(value_2_14294);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$mikron_SLASH_dnil,value_2_14294__$1)){
return value_1_14293;
} else {
return value_2_14294__$1;
}
});})(buffer_9003))
;
var gen_9022 = ((function (buffer_9003){
return (function mikron_demo$common$gen_9022(schema_14351){
return (function (){var G__14633 = (((schema_14351 instanceof cljs.core.Keyword))?schema_14351.fqn:null);
switch (G__14633) {
case "body":
return gen_body_8880;

break;
case "fixture":
return gen_fixture_8882;

break;
case "coord":
return gen_coord_8881;

break;
case "snapshot":
return gen_snapshot_8984;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_14351)].join('')));

}
})().call(null);
});})(buffer_9003))
;
return cljs.core.PersistentHashMap.fromArrays([cljs.core.cst$kw$pack,cljs.core.cst$kw$unpack,cljs.core.cst$kw$diff,cljs.core.cst$kw$undiff,cljs.core.cst$kw$gen,cljs.core.cst$kw$interp,cljs.core.cst$kw$validate],[pack_9004,unpack_9012,diff_9016,undiff_9020,gen_9022,interp_9029,validate_9032]);
})();
mikron_demo.common.pack = cljs.core.cst$kw$pack.cljs$core$IFn$_invoke$arity$1(processors_14210_14634);

mikron_demo.common.gen = cljs.core.cst$kw$gen.cljs$core$IFn$_invoke$arity$1(processors_14210_14634);

mikron_demo.common.unpack = cljs.core.cst$kw$unpack.cljs$core$IFn$_invoke$arity$1(processors_14210_14634);
