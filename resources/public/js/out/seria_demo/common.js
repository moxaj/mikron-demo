// Compiled by ClojureScript 1.7.170 {:static-fns true, :optimize-constants true}
goog.provide('seria_demo.common');
goog.require('cljs.core');
goog.require('seria.core');
var G__9123_9285 = (function (){var buffer_7257 = seria.buffer.allocate((10000));
var interp_7282 = ((function (buffer_7257){
return (function seria_demo$common$interp_7282(schema_9247,value_1_9248,value_2_9249,time_1_9250,time_2_9251,time_9252){
return (function (){var G__9270 = (((schema_9247 instanceof cljs.core.Keyword))?schema_9247.fqn:null);
switch (G__9270) {
case "body":
return interp_body_7163;

break;
case "fixture":
return interp_fixture_7194;

break;
case "coord":
return interp_coord_7219;

break;
case "snapshot":
return interp_snapshot_7252;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_9247)].join('')));

}
})().call(null,value_1_9248,value_2_9249,time_1_9250,time_2_9251,time_9252);
});})(buffer_7257))
;
var undiff_coord_7211 = ((function (buffer_7257){
return (function seria_demo$common$undiff_coord_7211(value_1_9196,value_2_9197){
var value_2_9197__$1 = seria.common.unwrap_diffed(value_2_9197);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_2_9197__$1)){
return value_1_9196;
} else {
return value_2_9197__$1;
}
});})(buffer_7257))
;
var undiff_body_7152 = ((function (buffer_7257){
return (function seria_demo$common$undiff_body_7152(value_1_9146,value_2_9147){
var value_2_9147__$1 = seria.common.unwrap_diffed(value_2_9147);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_2_9147__$1)){
return value_1_9146;
} else {
return value_2_9147__$1;
}
});})(buffer_7257))
;
var diff_7269 = ((function (buffer_7257){
return (function seria_demo$common$diff_7269(schema_9240,value_1_9241,value_2_9242){
return (function (){var G__9272 = (((schema_9240 instanceof cljs.core.Keyword))?schema_9240.fqn:null);
switch (G__9272) {
case "body":
return diff_body_7149;

break;
case "fixture":
return diff_fixture_7183;

break;
case "coord":
return diff_coord_7208;

break;
case "snapshot":
return diff_snapshot_7240;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_9240)].join('')));

}
})().call(null,value_1_9241,value_2_9242);
});})(buffer_7257))
;
var gen_coord_7154 = ((function (buffer_7257){
return (function seria_demo$common$gen_coord_7154(){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.rand.cljs$core$IFn$_invoke$arity$0(),cljs.core.rand.cljs$core$IFn$_invoke$arity$0()], null);
});})(buffer_7257))
;
var gen_fixture_7155 = ((function (buffer_7257){
return (function seria_demo$common$gen_fixture_7155(){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$color,seria.common.random_integer((4),true)], null),cljs.core.cst$kw$coords,cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(((2) + cljs.core.rand_int((4))),((function (buffer_7257){
return (function (){
return gen_coord_7154();
});})(buffer_7257))
)], null);
});})(buffer_7257))
;
var diff_body_7149 = ((function (buffer_7257){
return (function seria_demo$common$diff_body_7149(value_1_9144,value_2_9145){
return seria.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_9144,value_2_9145))?cljs.core.cst$kw$seria_SLASH_dnil:value_2_9145));
});})(buffer_7257))
;
var interp_fixture_7194 = ((function (buffer_7257){
return (function seria_demo$common$interp_fixture_7194(value_1_9176,value_2_9177,time_1_9178,time_2_9179,time_9180){
var prefer_first_QMARK__9181 = (seria.common.cljc_abs((time_9180 - time_1_9178)) < seria.common.cljc_abs((time_9180 - time_2_9179)));
var time_factor_9182 = ((time_9180 - time_1_9178) / (time_2_9179 - time_1_9178));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_9176,value_2_9177)){
return value_1_9176;
} else {
if(prefer_first_QMARK__9181){
return value_1_9176;
} else {
return value_2_9177;
}
}
});})(buffer_7257))
;
var unpack_diffed_snapshot_7237 = ((function (buffer_7257){
return (function seria_demo$common$unpack_diffed_snapshot_7237(buffer_9218){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9218))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$bodies,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9218))?cljs.core.cst$kw$seria_SLASH_dnil:cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_9218),((function (buffer_7257){
return (function (){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9218))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return unpack_diffed_body_7144(buffer_9218);
}
});})(buffer_7257))
))),cljs.core.cst$kw$time,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9218))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_long_BANG_(buffer_9218))], null);
}
});})(buffer_7257))
;
var interp_body_7163 = ((function (buffer_7257){
return (function seria_demo$common$interp_body_7163(value_1_9148,value_2_9149,time_1_9150,time_2_9151,time_9152){
var prefer_first_QMARK__9153 = (seria.common.cljc_abs((time_9152 - time_1_9150)) < seria.common.cljc_abs((time_9152 - time_2_9151)));
var time_factor_9154 = ((time_9152 - time_1_9150) / (time_2_9151 - time_1_9150));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_9148,value_2_9149)){
return value_1_9148;
} else {
if(prefer_first_QMARK__9153){
return value_1_9148;
} else {
return value_2_9149;
}
}
});})(buffer_7257))
;
var unpack_fixture_7142 = ((function (buffer_7257){
return (function seria_demo$common$unpack_fixture_7142(buffer_9170){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$coords,cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_9170),((function (buffer_7257){
return (function (){
return unpack_coord_7141(buffer_9170);
});})(buffer_7257))
)),cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$color,seria.buffer.read_int_BANG_(buffer_9170)], null)], null);
});})(buffer_7257))
;
var pack_diffed_coord_7135 = ((function (buffer_7257){
return (function seria_demo$common$pack_diffed_coord_7135(buffer_9187,value_9186){
var value_dnil_QMARK__9188_9288 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_9186);
seria.buffer.write_boolean_BANG_(buffer_9187,value_dnil_QMARK__9188_9288);

if(value_dnil_QMARK__9188_9288){
} else {
var inner_value_9189_9289 = (value_9186.cljs$core$IFn$_invoke$arity$1 ? value_9186.cljs$core$IFn$_invoke$arity$1((0)) : value_9186.call(null,(0)));
var value_dnil_QMARK__9190_9290 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9189_9289);
seria.buffer.write_boolean_BANG_(buffer_9187,value_dnil_QMARK__9190_9290);

if(value_dnil_QMARK__9190_9290){
} else {
seria.buffer.write_float_BANG_(buffer_9187,inner_value_9189_9289);
}

var inner_value_9189_9291 = (value_9186.cljs$core$IFn$_invoke$arity$1 ? value_9186.cljs$core$IFn$_invoke$arity$1((1)) : value_9186.call(null,(1)));
var value_dnil_QMARK__9191_9292 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9189_9291);
seria.buffer.write_boolean_BANG_(buffer_9187,value_dnil_QMARK__9191_9292);

if(value_dnil_QMARK__9191_9292){
} else {
seria.buffer.write_float_BANG_(buffer_9187,inner_value_9189_9291);
}
}

return buffer_9187;
});})(buffer_7257))
;
var diff_coord_7208 = ((function (buffer_7257){
return (function seria_demo$common$diff_coord_7208(value_1_9194,value_2_9195){
return seria.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_9194,value_2_9195))?cljs.core.cst$kw$seria_SLASH_dnil:value_2_9195));
});})(buffer_7257))
;
var undiff_7273 = ((function (buffer_7257){
return (function seria_demo$common$undiff_7273(schema_9243,value_1_9244,value_2_9245){
return (function (){var G__9274 = (((schema_9243 instanceof cljs.core.Keyword))?schema_9243.fqn:null);
switch (G__9274) {
case "body":
return undiff_body_7152;

break;
case "fixture":
return undiff_fixture_7186;

break;
case "coord":
return undiff_coord_7211;

break;
case "snapshot":
return undiff_snapshot_7243;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_9243)].join('')));

}
})().call(null,value_1_9244,value_2_9245);
});})(buffer_7257))
;
var unpack_coord_7141 = ((function (buffer_7257){
return (function seria_demo$common$unpack_coord_7141(buffer_9192){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [seria.buffer.read_float_BANG_(buffer_9192),seria.buffer.read_float_BANG_(buffer_9192)], null);
});})(buffer_7257))
;
var diff_snapshot_7240 = ((function (buffer_7257){
return (function seria_demo$common$diff_snapshot_7240(value_1_9219,value_2_9220){
return seria.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_9219,value_2_9220))?cljs.core.cst$kw$seria_SLASH_dnil:value_2_9220));
});})(buffer_7257))
;
var unpack_snapshot_7235 = ((function (buffer_7257){
return (function seria_demo$common$unpack_snapshot_7235(buffer_9217){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$bodies,cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_9217),((function (buffer_7257){
return (function (){
return unpack_body_7140(buffer_9217);
});})(buffer_7257))
)),cljs.core.cst$kw$time,seria.buffer.read_long_BANG_(buffer_9217)], null);
});})(buffer_7257))
;
var undiff_fixture_7186 = ((function (buffer_7257){
return (function seria_demo$common$undiff_fixture_7186(value_1_9174,value_2_9175){
var value_2_9175__$1 = seria.common.unwrap_diffed(value_2_9175);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_2_9175__$1)){
return value_1_9174;
} else {
return value_2_9175__$1;
}
});})(buffer_7257))
;
var unpack_body_7140 = ((function (buffer_7257){
return (function seria_demo$common$unpack_body_7140(buffer_9142){
return new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$angle,seria.buffer.read_float_BANG_(buffer_9142),cljs.core.cst$kw$body_DASH_type,cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$dynamic,cljs.core.cst$kw$static,cljs.core.cst$kw$kinetic], null),seria.buffer.read_varint_BANG_(buffer_9142)),cljs.core.cst$kw$fixtures,cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_9142),((function (buffer_7257){
return (function (){
return unpack_fixture_7142(buffer_9142);
});})(buffer_7257))
)),cljs.core.cst$kw$position,unpack_coord_7141(buffer_9142),cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$id,seria.buffer.read_int_BANG_(buffer_9142)], null)], null);
});})(buffer_7257))
;
var pack_diffed_body_7125 = ((function (buffer_7257){
return (function seria_demo$common$pack_diffed_body_7125(buffer_9130,value_9129){
var value_dnil_QMARK__9131_9294 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_9129);
seria.buffer.write_boolean_BANG_(buffer_9130,value_dnil_QMARK__9131_9294);

if(value_dnil_QMARK__9131_9294){
} else {
var inner_value_9132_9295 = cljs.core.cst$kw$angle.cljs$core$IFn$_invoke$arity$1(value_9129);
var value_dnil_QMARK__9133_9296 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9132_9295);
seria.buffer.write_boolean_BANG_(buffer_9130,value_dnil_QMARK__9133_9296);

if(value_dnil_QMARK__9133_9296){
} else {
seria.buffer.write_float_BANG_(buffer_9130,inner_value_9132_9295);
}

var inner_value_9132_9297 = cljs.core.cst$kw$body_DASH_type.cljs$core$IFn$_invoke$arity$1(value_9129);
var value_dnil_QMARK__9134_9298 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9132_9297);
seria.buffer.write_boolean_BANG_(buffer_9130,value_dnil_QMARK__9134_9298);

if(value_dnil_QMARK__9134_9298){
} else {
seria.buffer.write_varint_BANG_(buffer_9130,(function (){var G__9276 = (((inner_value_9132_9297 instanceof cljs.core.Keyword))?inner_value_9132_9297.fqn:null);
switch (G__9276) {
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
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(inner_value_9132_9297)].join('')));

}
})());
}

var inner_value_9132_9300 = cljs.core.cst$kw$fixtures.cljs$core$IFn$_invoke$arity$1(value_9129);
var value_dnil_QMARK__9135_9301 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9132_9300);
seria.buffer.write_boolean_BANG_(buffer_9130,value_dnil_QMARK__9135_9301);

if(value_dnil_QMARK__9135_9301){
} else {
seria.buffer.write_varint_BANG_(buffer_9130,cljs.core.count(inner_value_9132_9300));

cljs.core.run_BANG_(((function (value_dnil_QMARK__9135_9301,inner_value_9132_9300,value_dnil_QMARK__9131_9294,buffer_7257){
return (function (inner_value_9136){
var value_dnil_QMARK__9137 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9136);
seria.buffer.write_boolean_BANG_(buffer_9130,value_dnil_QMARK__9137);

if(value_dnil_QMARK__9137){
return null;
} else {
return pack_diffed_fixture_7133(buffer_9130,inner_value_9136);
}
});})(value_dnil_QMARK__9135_9301,inner_value_9132_9300,value_dnil_QMARK__9131_9294,buffer_7257))
,inner_value_9132_9300);
}

var inner_value_9132_9302 = cljs.core.cst$kw$position.cljs$core$IFn$_invoke$arity$1(value_9129);
var value_dnil_QMARK__9138_9303 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9132_9302);
seria.buffer.write_boolean_BANG_(buffer_9130,value_dnil_QMARK__9138_9303);

if(value_dnil_QMARK__9138_9303){
} else {
pack_diffed_coord_7135(buffer_9130,inner_value_9132_9302);
}

var inner_value_9132_9304 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_9129);
var value_dnil_QMARK__9139_9305 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9132_9304);
seria.buffer.write_boolean_BANG_(buffer_9130,value_dnil_QMARK__9139_9305);

if(value_dnil_QMARK__9139_9305){
} else {
var inner_value_9140_9306 = cljs.core.cst$kw$id.cljs$core$IFn$_invoke$arity$1(inner_value_9132_9304);
var value_dnil_QMARK__9141_9307 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9140_9306);
seria.buffer.write_boolean_BANG_(buffer_9130,value_dnil_QMARK__9141_9307);

if(value_dnil_QMARK__9141_9307){
} else {
seria.buffer.write_int_BANG_(buffer_9130,inner_value_9140_9306);
}
}
}

return buffer_9130;
});})(buffer_7257))
;
var gen_body_7153 = ((function (buffer_7257){
return (function seria_demo$common$gen_body_7153(){
return new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$id,seria.common.random_integer((4),true)], null),cljs.core.cst$kw$position,gen_coord_7154(),cljs.core.cst$kw$angle,cljs.core.rand.cljs$core$IFn$_invoke$arity$0(),cljs.core.cst$kw$body_DASH_type,cljs.core.rand_nth(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$dynamic,cljs.core.cst$kw$static,cljs.core.cst$kw$kinetic], null)),cljs.core.cst$kw$fixtures,cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(((2) + cljs.core.rand_int((4))),((function (buffer_7257){
return (function (){
return gen_fixture_7155();
});})(buffer_7257))
)], null);
});})(buffer_7257))
;
var unpack_diffed_coord_7145 = ((function (buffer_7257){
return (function seria_demo$common$unpack_diffed_coord_7145(buffer_9193){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9193))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9193))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_float_BANG_(buffer_9193)),(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9193))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_float_BANG_(buffer_9193))], null);
}
});})(buffer_7257))
;
var pack_diffed_snapshot_7227 = ((function (buffer_7257){
return (function seria_demo$common$pack_diffed_snapshot_7227(buffer_9210,value_9209){
var value_dnil_QMARK__9211_9308 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_9209);
seria.buffer.write_boolean_BANG_(buffer_9210,value_dnil_QMARK__9211_9308);

if(value_dnil_QMARK__9211_9308){
} else {
var inner_value_9212_9309 = cljs.core.cst$kw$bodies.cljs$core$IFn$_invoke$arity$1(value_9209);
var value_dnil_QMARK__9213_9310 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9212_9309);
seria.buffer.write_boolean_BANG_(buffer_9210,value_dnil_QMARK__9213_9310);

if(value_dnil_QMARK__9213_9310){
} else {
seria.buffer.write_varint_BANG_(buffer_9210,cljs.core.count(inner_value_9212_9309));

cljs.core.run_BANG_(((function (value_dnil_QMARK__9213_9310,inner_value_9212_9309,value_dnil_QMARK__9211_9308,buffer_7257){
return (function (inner_value_9214){
var value_dnil_QMARK__9215 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9214);
seria.buffer.write_boolean_BANG_(buffer_9210,value_dnil_QMARK__9215);

if(value_dnil_QMARK__9215){
return null;
} else {
return pack_diffed_body_7125(buffer_9210,inner_value_9214);
}
});})(value_dnil_QMARK__9213_9310,inner_value_9212_9309,value_dnil_QMARK__9211_9308,buffer_7257))
,inner_value_9212_9309);
}

var inner_value_9212_9311 = cljs.core.cst$kw$time.cljs$core$IFn$_invoke$arity$1(value_9209);
var value_dnil_QMARK__9216_9312 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9212_9311);
seria.buffer.write_boolean_BANG_(buffer_9210,value_dnil_QMARK__9216_9312);

if(value_dnil_QMARK__9216_9312){
} else {
seria.buffer.write_long_BANG_(buffer_9210,inner_value_9212_9311);
}
}

return buffer_9210;
});})(buffer_7257))
;
var pack_fixture_7120 = ((function (buffer_7257){
return (function seria_demo$common$pack_fixture_7120(buffer_9156,value_9155){
var inner_value_9157_9313 = cljs.core.cst$kw$coords.cljs$core$IFn$_invoke$arity$1(value_9155);
seria.buffer.write_varint_BANG_(buffer_9156,cljs.core.count(inner_value_9157_9313));

cljs.core.run_BANG_(((function (inner_value_9157_9313,buffer_7257){
return (function (inner_value_9158){
return pack_coord_7121(buffer_9156,inner_value_9158);
});})(inner_value_9157_9313,buffer_7257))
,inner_value_9157_9313);

var inner_value_9157_9314 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_9155);
var inner_value_9159_9315 = cljs.core.cst$kw$color.cljs$core$IFn$_invoke$arity$1(inner_value_9157_9314);
seria.buffer.write_int_BANG_(buffer_9156,inner_value_9159_9315);

return buffer_9156;
});})(buffer_7257))
;
var unpack_diffed_fixture_7146 = ((function (buffer_7257){
return (function seria_demo$common$unpack_diffed_fixture_7146(buffer_9171){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9171))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$coords,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9171))?cljs.core.cst$kw$seria_SLASH_dnil:cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_9171),((function (buffer_7257){
return (function (){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9171))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return unpack_diffed_coord_7145(buffer_9171);
}
});})(buffer_7257))
))),cljs.core.cst$kw$user_DASH_data,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9171))?cljs.core.cst$kw$seria_SLASH_dnil:new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$color,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9171))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_int_BANG_(buffer_9171))], null))], null);
}
});})(buffer_7257))
;
var pack_snapshot_7222 = ((function (buffer_7257){
return (function seria_demo$common$pack_snapshot_7222(buffer_9206,value_9205){
var inner_value_9207_9316 = cljs.core.cst$kw$bodies.cljs$core$IFn$_invoke$arity$1(value_9205);
seria.buffer.write_varint_BANG_(buffer_9206,cljs.core.count(inner_value_9207_9316));

cljs.core.run_BANG_(((function (inner_value_9207_9316,buffer_7257){
return (function (inner_value_9208){
return pack_body_7117(buffer_9206,inner_value_9208);
});})(inner_value_9207_9316,buffer_7257))
,inner_value_9207_9316);

var inner_value_9207_9317 = cljs.core.cst$kw$time.cljs$core$IFn$_invoke$arity$1(value_9205);
seria.buffer.write_long_BANG_(buffer_9206,inner_value_9207_9317);

return buffer_9206;
});})(buffer_7257))
;
var interp_coord_7219 = ((function (buffer_7257){
return (function seria_demo$common$interp_coord_7219(value_1_9198,value_2_9199,time_1_9200,time_2_9201,time_9202){
var prefer_first_QMARK__9203 = (seria.common.cljc_abs((time_9202 - time_1_9200)) < seria.common.cljc_abs((time_9202 - time_2_9201)));
var time_factor_9204 = ((time_9202 - time_1_9200) / (time_2_9201 - time_1_9200));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_9198,value_2_9199)){
return value_1_9198;
} else {
if(prefer_first_QMARK__9203){
return value_1_9198;
} else {
return value_2_9199;
}
}
});})(buffer_7257))
;
var undiff_snapshot_7243 = ((function (buffer_7257){
return (function seria_demo$common$undiff_snapshot_7243(value_1_9221,value_2_9222){
var value_2_9222__$1 = seria.common.unwrap_diffed(value_2_9222);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_2_9222__$1)){
return value_1_9221;
} else {
return value_2_9222__$1;
}
});})(buffer_7257))
;
var pack_body_7117 = ((function (buffer_7257){
return (function seria_demo$common$pack_body_7117(buffer_9125,value_9124){
var inner_value_9126_9318 = cljs.core.cst$kw$angle.cljs$core$IFn$_invoke$arity$1(value_9124);
seria.buffer.write_float_BANG_(buffer_9125,inner_value_9126_9318);

var inner_value_9126_9319 = cljs.core.cst$kw$body_DASH_type.cljs$core$IFn$_invoke$arity$1(value_9124);
seria.buffer.write_varint_BANG_(buffer_9125,(function (){var G__9278 = (((inner_value_9126_9319 instanceof cljs.core.Keyword))?inner_value_9126_9319.fqn:null);
switch (G__9278) {
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
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(inner_value_9126_9319)].join('')));

}
})());

var inner_value_9126_9321 = cljs.core.cst$kw$fixtures.cljs$core$IFn$_invoke$arity$1(value_9124);
seria.buffer.write_varint_BANG_(buffer_9125,cljs.core.count(inner_value_9126_9321));

cljs.core.run_BANG_(((function (inner_value_9126_9321,buffer_7257){
return (function (inner_value_9127){
return pack_fixture_7120(buffer_9125,inner_value_9127);
});})(inner_value_9126_9321,buffer_7257))
,inner_value_9126_9321);

var inner_value_9126_9322 = cljs.core.cst$kw$position.cljs$core$IFn$_invoke$arity$1(value_9124);
pack_coord_7121(buffer_9125,inner_value_9126_9322);

var inner_value_9126_9323 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_9124);
var inner_value_9128_9324 = cljs.core.cst$kw$id.cljs$core$IFn$_invoke$arity$1(inner_value_9126_9323);
seria.buffer.write_int_BANG_(buffer_9125,inner_value_9128_9324);

return buffer_9125;
});})(buffer_7257))
;
var pack_7258 = ((function (buffer_7257){
return (function seria_demo$common$pack_7258(schema_9230,value_9231){
var diffed_QMARK__9233 = seria.common.diffed_QMARK_(value_9231);
var value_9231__$1 = ((cljs.core.not(diffed_QMARK__9233))?value_9231:seria.common.unwrap_diffed(value_9231));
var schema_id_9232 = new cljs.core.PersistentArrayMap(null, 4, [cljs.core.cst$kw$body,(0),cljs.core.cst$kw$fixture,(1),cljs.core.cst$kw$coord,(2),cljs.core.cst$kw$snapshot,(3)], null).call(null,schema_9230);
return seria.buffer.compress((function (){var G__9280 = (((schema_9230 instanceof cljs.core.Keyword))?schema_9230.fqn:null);
switch (G__9280) {
case "body":
if(cljs.core.truth_(diffed_QMARK__9233)){
return pack_diffed_body_7125;
} else {
return pack_body_7117;
}

break;
case "fixture":
if(cljs.core.truth_(diffed_QMARK__9233)){
return pack_diffed_fixture_7133;
} else {
return pack_fixture_7120;
}

break;
case "coord":
if(cljs.core.truth_(diffed_QMARK__9233)){
return pack_diffed_coord_7135;
} else {
return pack_coord_7121;
}

break;
case "snapshot":
if(cljs.core.truth_(diffed_QMARK__9233)){
return pack_diffed_snapshot_7227;
} else {
return pack_snapshot_7222;
}

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_9230)].join('')));

}
})().call(null,seria.buffer.write_headers_BANG_(buffer_7257,schema_id_9232,diffed_QMARK__9233),value_9231__$1));
});})(buffer_7257))
;
var pack_coord_7121 = ((function (buffer_7257){
return (function seria_demo$common$pack_coord_7121(buffer_9184,value_9183){
var inner_value_9185_9326 = (value_9183.cljs$core$IFn$_invoke$arity$1 ? value_9183.cljs$core$IFn$_invoke$arity$1((0)) : value_9183.call(null,(0)));
seria.buffer.write_float_BANG_(buffer_9184,inner_value_9185_9326);

var inner_value_9185_9327 = (value_9183.cljs$core$IFn$_invoke$arity$1 ? value_9183.cljs$core$IFn$_invoke$arity$1((1)) : value_9183.call(null,(1)));
seria.buffer.write_float_BANG_(buffer_9184,inner_value_9185_9327);

return buffer_9184;
});})(buffer_7257))
;
var gen_snapshot_7244 = ((function (buffer_7257){
return (function seria_demo$common$gen_snapshot_7244(){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$time,seria.common.random_integer((8),true),cljs.core.cst$kw$bodies,cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(((2) + cljs.core.rand_int((4))),((function (buffer_7257){
return (function (){
return gen_body_7153();
});})(buffer_7257))
)], null);
});})(buffer_7257))
;
var interp_snapshot_7252 = ((function (buffer_7257){
return (function seria_demo$common$interp_snapshot_7252(value_1_9223,value_2_9224,time_1_9225,time_2_9226,time_9227){
var prefer_first_QMARK__9228 = (seria.common.cljc_abs((time_9227 - time_1_9225)) < seria.common.cljc_abs((time_9227 - time_2_9226)));
var time_factor_9229 = ((time_9227 - time_1_9225) / (time_2_9226 - time_1_9225));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_9223,value_2_9224)){
return value_1_9223;
} else {
if(prefer_first_QMARK__9228){
return value_1_9223;
} else {
return value_2_9224;
}
}
});})(buffer_7257))
;
var diff_fixture_7183 = ((function (buffer_7257){
return (function seria_demo$common$diff_fixture_7183(value_1_9172,value_2_9173){
return seria.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_9172,value_2_9173))?cljs.core.cst$kw$seria_SLASH_dnil:value_2_9173));
});})(buffer_7257))
;
var unpack_diffed_body_7144 = ((function (buffer_7257){
return (function seria_demo$common$unpack_diffed_body_7144(buffer_9143){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9143))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$angle,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9143))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_float_BANG_(buffer_9143)),cljs.core.cst$kw$body_DASH_type,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9143))?cljs.core.cst$kw$seria_SLASH_dnil:cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$dynamic,cljs.core.cst$kw$static,cljs.core.cst$kw$kinetic], null),seria.buffer.read_varint_BANG_(buffer_9143))),cljs.core.cst$kw$fixtures,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9143))?cljs.core.cst$kw$seria_SLASH_dnil:cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_9143),((function (buffer_7257){
return (function (){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9143))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return unpack_diffed_fixture_7146(buffer_9143);
}
});})(buffer_7257))
))),cljs.core.cst$kw$position,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9143))?cljs.core.cst$kw$seria_SLASH_dnil:unpack_diffed_coord_7145(buffer_9143)),cljs.core.cst$kw$user_DASH_data,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9143))?cljs.core.cst$kw$seria_SLASH_dnil:new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$id,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_9143))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_int_BANG_(buffer_9143))], null))], null);
}
});})(buffer_7257))
;
var pack_diffed_fixture_7133 = ((function (buffer_7257){
return (function seria_demo$common$pack_diffed_fixture_7133(buffer_9161,value_9160){
var value_dnil_QMARK__9162_9328 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_9160);
seria.buffer.write_boolean_BANG_(buffer_9161,value_dnil_QMARK__9162_9328);

if(value_dnil_QMARK__9162_9328){
} else {
var inner_value_9163_9329 = cljs.core.cst$kw$coords.cljs$core$IFn$_invoke$arity$1(value_9160);
var value_dnil_QMARK__9164_9330 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9163_9329);
seria.buffer.write_boolean_BANG_(buffer_9161,value_dnil_QMARK__9164_9330);

if(value_dnil_QMARK__9164_9330){
} else {
seria.buffer.write_varint_BANG_(buffer_9161,cljs.core.count(inner_value_9163_9329));

cljs.core.run_BANG_(((function (value_dnil_QMARK__9164_9330,inner_value_9163_9329,value_dnil_QMARK__9162_9328,buffer_7257){
return (function (inner_value_9165){
var value_dnil_QMARK__9166 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9165);
seria.buffer.write_boolean_BANG_(buffer_9161,value_dnil_QMARK__9166);

if(value_dnil_QMARK__9166){
return null;
} else {
return pack_diffed_coord_7135(buffer_9161,inner_value_9165);
}
});})(value_dnil_QMARK__9164_9330,inner_value_9163_9329,value_dnil_QMARK__9162_9328,buffer_7257))
,inner_value_9163_9329);
}

var inner_value_9163_9331 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_9160);
var value_dnil_QMARK__9167_9332 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9163_9331);
seria.buffer.write_boolean_BANG_(buffer_9161,value_dnil_QMARK__9167_9332);

if(value_dnil_QMARK__9167_9332){
} else {
var inner_value_9168_9333 = cljs.core.cst$kw$color.cljs$core$IFn$_invoke$arity$1(inner_value_9163_9331);
var value_dnil_QMARK__9169_9334 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_9168_9333);
seria.buffer.write_boolean_BANG_(buffer_9161,value_dnil_QMARK__9169_9334);

if(value_dnil_QMARK__9169_9334){
} else {
seria.buffer.write_int_BANG_(buffer_9161,inner_value_9168_9333);
}
}
}

return buffer_9161;
});})(buffer_7257))
;
var unpack_7265 = ((function (buffer_7257){
return (function seria_demo$common$unpack_7265(raw_9234){
var buffer_9235 = seria.buffer.wrap(raw_9234);
var headers_9236 = seria.buffer.read_headers_BANG_(buffer_9235);
var schema_9238 = cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$body,cljs.core.cst$kw$coord,cljs.core.cst$kw$fixture,cljs.core.cst$kw$snapshot], null),cljs.core.cst$kw$schema_DASH_id.cljs$core$IFn$_invoke$arity$1(headers_9236));
var diffed_QMARK__9237 = cljs.core.cst$kw$diffed_QMARK_.cljs$core$IFn$_invoke$arity$1(headers_9236);
if(cljs.core.not(schema_9238)){
return cljs.core.cst$kw$seria_SLASH_invalid;
} else {
return new cljs.core.PersistentArrayMap(null, 3, [cljs.core.cst$kw$schema,schema_9238,cljs.core.cst$kw$diffed_QMARK_,diffed_QMARK__9237,cljs.core.cst$kw$value,(function (){var value_9239 = (function (){var G__9282 = (((schema_9238 instanceof cljs.core.Keyword))?schema_9238.fqn:null);
switch (G__9282) {
case "body":
if(cljs.core.truth_(diffed_QMARK__9237)){
return unpack_diffed_body_7144;
} else {
return unpack_body_7140;
}

break;
case "fixture":
if(cljs.core.truth_(diffed_QMARK__9237)){
return unpack_diffed_fixture_7146;
} else {
return unpack_fixture_7142;
}

break;
case "coord":
if(cljs.core.truth_(diffed_QMARK__9237)){
return unpack_diffed_coord_7145;
} else {
return unpack_coord_7141;
}

break;
case "snapshot":
if(cljs.core.truth_(diffed_QMARK__9237)){
return unpack_diffed_snapshot_7237;
} else {
return unpack_snapshot_7235;
}

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_9238)].join('')));

}
})().call(null,buffer_9235);
if(cljs.core.truth_(diffed_QMARK__9237)){
return seria.common.wrap_diffed(value_9239);
} else {
return value_9239;
}
})()], null);
}
});})(buffer_7257))
;
var gen_7275 = ((function (buffer_7257){
return (function seria_demo$common$gen_7275(schema_9246){
return (function (){var G__9284 = (((schema_9246 instanceof cljs.core.Keyword))?schema_9246.fqn:null);
switch (G__9284) {
case "body":
return gen_body_7153;

break;
case "fixture":
return gen_fixture_7155;

break;
case "coord":
return gen_coord_7154;

break;
case "snapshot":
return gen_snapshot_7244;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_9246)].join('')));

}
})().call(null);
});})(buffer_7257))
;
return cljs.core.PersistentHashMap.fromArrays([cljs.core.cst$kw$pack,cljs.core.cst$kw$unpack,cljs.core.cst$kw$diff,cljs.core.cst$kw$undiff,cljs.core.cst$kw$gen,cljs.core.cst$kw$interp],[pack_7258,unpack_7265,diff_7269,undiff_7273,gen_7275,interp_7282]);
})();
seria_demo.common.pack = cljs.core.cst$kw$pack.cljs$core$IFn$_invoke$arity$1(G__9123_9285);

seria_demo.common.gen = cljs.core.cst$kw$gen.cljs$core$IFn$_invoke$arity$1(G__9123_9285);

seria_demo.common.unpack = cljs.core.cst$kw$unpack.cljs$core$IFn$_invoke$arity$1(G__9123_9285);
seria_demo.common.make_data = (function seria_demo$common$make_data(){
var G__9339 = cljs.core.cst$kw$snapshot;
var G__9340 = (seria_demo.common.gen.cljs$core$IFn$_invoke$arity$1 ? seria_demo.common.gen.cljs$core$IFn$_invoke$arity$1(cljs.core.cst$kw$snapshot) : seria_demo.common.gen.call(null,cljs.core.cst$kw$snapshot));
return (seria_demo.common.pack.cljs$core$IFn$_invoke$arity$2 ? seria_demo.common.pack.cljs$core$IFn$_invoke$arity$2(G__9339,G__9340) : seria_demo.common.pack.call(null,G__9339,G__9340));
});
