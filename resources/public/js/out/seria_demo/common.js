// Compiled by ClojureScript 1.7.170 {:static-fns true, :optimize-constants true}
goog.provide('seria_demo.common');
goog.require('cljs.core');
goog.require('seria.core');
var processors_13517_13714 = (function (){var buffer_7247 = seria.buffer.allocate((10000));
var gen_body_7141 = ((function (buffer_7247){
return (function seria_demo$common$gen_body_7141(){
return new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$id,seria.common.random_integer((4),true)], null),cljs.core.cst$kw$position,gen_coord_7142(),cljs.core.cst$kw$angle,cljs.core.rand.cljs$core$IFn$_invoke$arity$0(),cljs.core.cst$kw$body_DASH_type,cljs.core.rand_nth(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$dynamic,cljs.core.cst$kw$static,cljs.core.cst$kw$kinetic], null)),cljs.core.cst$kw$fixtures,cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(((2) + cljs.core.rand_int((4))),((function (buffer_7247){
return (function (){
return gen_fixture_7143();
});})(buffer_7247))
)], null);
});})(buffer_7247))
;
var diff_snapshot_7228 = ((function (buffer_7247){
return (function seria_demo$common$diff_snapshot_7228(value_1_13613,value_2_13614){
return seria.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13613,value_2_13614))?cljs.core.cst$kw$seria_SLASH_dnil:value_2_13614));
});})(buffer_7247))
;
var interp_snapshot_7240 = ((function (buffer_7247){
return (function seria_demo$common$interp_snapshot_7240(value_1_13617,value_2_13618,time_1_13619,time_2_13620,time_13621){
var prefer_first_QMARK__13622 = (seria.common.cljc_abs((time_13621 - time_1_13619)) < seria.common.cljc_abs((time_13621 - time_2_13620)));
var time_factor_13623 = ((time_13621 - time_1_13619) / (time_2_13620 - time_1_13619));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13617,value_2_13618)){
return value_1_13617;
} else {
if(prefer_first_QMARK__13622){
return value_1_13617;
} else {
return value_2_13618;
}
}
});})(buffer_7247))
;
var pack_diffed_coord_7123 = ((function (buffer_7247){
return (function seria_demo$common$pack_diffed_coord_7123(buffer_13581,value_13580){
var value_dnil_QMARK__13582_13715 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_13580);
seria.buffer.write_boolean_BANG_(buffer_13581,value_dnil_QMARK__13582_13715);

if(value_dnil_QMARK__13582_13715){
} else {
var inner_value_13583_13716 = (value_13580.cljs$core$IFn$_invoke$arity$1 ? value_13580.cljs$core$IFn$_invoke$arity$1((0)) : value_13580.call(null,(0)));
var value_dnil_QMARK__13584_13717 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13583_13716);
seria.buffer.write_boolean_BANG_(buffer_13581,value_dnil_QMARK__13584_13717);

if(value_dnil_QMARK__13584_13717){
} else {
seria.buffer.write_float_BANG_(buffer_13581,inner_value_13583_13716);
}

var inner_value_13583_13718 = (value_13580.cljs$core$IFn$_invoke$arity$1 ? value_13580.cljs$core$IFn$_invoke$arity$1((1)) : value_13580.call(null,(1)));
var value_dnil_QMARK__13585_13719 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13583_13718);
seria.buffer.write_boolean_BANG_(buffer_13581,value_dnil_QMARK__13585_13719);

if(value_dnil_QMARK__13585_13719){
} else {
seria.buffer.write_float_BANG_(buffer_13581,inner_value_13583_13718);
}
}

return buffer_13581;
});})(buffer_7247))
;
var unpack_snapshot_7223 = ((function (buffer_7247){
return (function seria_demo$common$unpack_snapshot_7223(buffer_13611){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$bodies,cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_13611),((function (buffer_7247){
return (function (){
return unpack_body_7128(buffer_13611);
});})(buffer_7247))
)),cljs.core.cst$kw$time,seria.buffer.read_long_BANG_(buffer_13611)], null);
});})(buffer_7247))
;
var unpack_diffed_coord_7133 = ((function (buffer_7247){
return (function seria_demo$common$unpack_diffed_coord_7133(buffer_13587){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13587))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13587))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_float_BANG_(buffer_13587)),(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13587))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_float_BANG_(buffer_13587))], null);
}
});})(buffer_7247))
;
var undiff_body_7140 = ((function (buffer_7247){
return (function seria_demo$common$undiff_body_7140(value_1_13540,value_2_13541){
var value_2_13541__$1 = seria.common.unwrap_diffed(value_2_13541);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_2_13541__$1)){
return value_1_13540;
} else {
return value_2_13541__$1;
}
});})(buffer_7247))
;
var gen_snapshot_7232 = ((function (buffer_7247){
return (function seria_demo$common$gen_snapshot_7232(){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$time,seria.common.random_integer((8),true),cljs.core.cst$kw$bodies,cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(((2) + cljs.core.rand_int((4))),((function (buffer_7247){
return (function (){
return gen_body_7141();
});})(buffer_7247))
)], null);
});})(buffer_7247))
;
var pack_diffed_body_7113 = ((function (buffer_7247){
return (function seria_demo$common$pack_diffed_body_7113(buffer_13524,value_13523){
var value_dnil_QMARK__13525_13720 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_13523);
seria.buffer.write_boolean_BANG_(buffer_13524,value_dnil_QMARK__13525_13720);

if(value_dnil_QMARK__13525_13720){
} else {
var inner_value_13526_13721 = cljs.core.cst$kw$angle.cljs$core$IFn$_invoke$arity$1(value_13523);
var value_dnil_QMARK__13527_13722 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13526_13721);
seria.buffer.write_boolean_BANG_(buffer_13524,value_dnil_QMARK__13527_13722);

if(value_dnil_QMARK__13527_13722){
} else {
seria.buffer.write_float_BANG_(buffer_13524,inner_value_13526_13721);
}

var inner_value_13526_13723 = cljs.core.cst$kw$body_DASH_type.cljs$core$IFn$_invoke$arity$1(value_13523);
var value_dnil_QMARK__13528_13724 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13526_13723);
seria.buffer.write_boolean_BANG_(buffer_13524,value_dnil_QMARK__13528_13724);

if(value_dnil_QMARK__13528_13724){
} else {
seria.buffer.write_varint_BANG_(buffer_13524,(function (){var G__13683 = (((inner_value_13526_13723 instanceof cljs.core.Keyword))?inner_value_13526_13723.fqn:null);
switch (G__13683) {
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
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(inner_value_13526_13723)].join('')));

}
})());
}

var inner_value_13526_13726 = cljs.core.cst$kw$fixtures.cljs$core$IFn$_invoke$arity$1(value_13523);
var value_dnil_QMARK__13529_13727 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13526_13726);
seria.buffer.write_boolean_BANG_(buffer_13524,value_dnil_QMARK__13529_13727);

if(value_dnil_QMARK__13529_13727){
} else {
seria.buffer.write_varint_BANG_(buffer_13524,cljs.core.count(inner_value_13526_13726));

cljs.core.run_BANG_(((function (value_dnil_QMARK__13529_13727,inner_value_13526_13726,value_dnil_QMARK__13525_13720,buffer_7247){
return (function (inner_value_13530){
var value_dnil_QMARK__13531 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13530);
seria.buffer.write_boolean_BANG_(buffer_13524,value_dnil_QMARK__13531);

if(value_dnil_QMARK__13531){
return null;
} else {
return pack_diffed_fixture_7121(buffer_13524,inner_value_13530);
}
});})(value_dnil_QMARK__13529_13727,inner_value_13526_13726,value_dnil_QMARK__13525_13720,buffer_7247))
,inner_value_13526_13726);
}

var inner_value_13526_13728 = cljs.core.cst$kw$position.cljs$core$IFn$_invoke$arity$1(value_13523);
var value_dnil_QMARK__13532_13729 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13526_13728);
seria.buffer.write_boolean_BANG_(buffer_13524,value_dnil_QMARK__13532_13729);

if(value_dnil_QMARK__13532_13729){
} else {
pack_diffed_coord_7123(buffer_13524,inner_value_13526_13728);
}

var inner_value_13526_13730 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_13523);
var value_dnil_QMARK__13533_13731 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13526_13730);
seria.buffer.write_boolean_BANG_(buffer_13524,value_dnil_QMARK__13533_13731);

if(value_dnil_QMARK__13533_13731){
} else {
var inner_value_13534_13732 = cljs.core.cst$kw$id.cljs$core$IFn$_invoke$arity$1(inner_value_13526_13730);
var value_dnil_QMARK__13535_13733 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13534_13732);
seria.buffer.write_boolean_BANG_(buffer_13524,value_dnil_QMARK__13535_13733);

if(value_dnil_QMARK__13535_13733){
} else {
seria.buffer.write_int_BANG_(buffer_13524,inner_value_13534_13732);
}
}
}

return buffer_13524;
});})(buffer_7247))
;
var pack_body_7105 = ((function (buffer_7247){
return (function seria_demo$common$pack_body_7105(buffer_13519,value_13518){
var inner_value_13520_13734 = cljs.core.cst$kw$angle.cljs$core$IFn$_invoke$arity$1(value_13518);
seria.buffer.write_float_BANG_(buffer_13519,inner_value_13520_13734);

var inner_value_13520_13735 = cljs.core.cst$kw$body_DASH_type.cljs$core$IFn$_invoke$arity$1(value_13518);
seria.buffer.write_varint_BANG_(buffer_13519,(function (){var G__13685 = (((inner_value_13520_13735 instanceof cljs.core.Keyword))?inner_value_13520_13735.fqn:null);
switch (G__13685) {
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
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(inner_value_13520_13735)].join('')));

}
})());

var inner_value_13520_13737 = cljs.core.cst$kw$fixtures.cljs$core$IFn$_invoke$arity$1(value_13518);
seria.buffer.write_varint_BANG_(buffer_13519,cljs.core.count(inner_value_13520_13737));

cljs.core.run_BANG_(((function (inner_value_13520_13737,buffer_7247){
return (function (inner_value_13521){
return pack_fixture_7108(buffer_13519,inner_value_13521);
});})(inner_value_13520_13737,buffer_7247))
,inner_value_13520_13737);

var inner_value_13520_13738 = cljs.core.cst$kw$position.cljs$core$IFn$_invoke$arity$1(value_13518);
pack_coord_7109(buffer_13519,inner_value_13520_13738);

var inner_value_13520_13739 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_13518);
var inner_value_13522_13740 = cljs.core.cst$kw$id.cljs$core$IFn$_invoke$arity$1(inner_value_13520_13739);
seria.buffer.write_int_BANG_(buffer_13519,inner_value_13522_13740);

return buffer_13519;
});})(buffer_7247))
;
var undiff_snapshot_7231 = ((function (buffer_7247){
return (function seria_demo$common$undiff_snapshot_7231(value_1_13615,value_2_13616){
var value_2_13616__$1 = seria.common.unwrap_diffed(value_2_13616);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_2_13616__$1)){
return value_1_13615;
} else {
return value_2_13616__$1;
}
});})(buffer_7247))
;
var interp_coord_7207 = ((function (buffer_7247){
return (function seria_demo$common$interp_coord_7207(value_1_13592,value_2_13593,time_1_13594,time_2_13595,time_13596){
var prefer_first_QMARK__13597 = (seria.common.cljc_abs((time_13596 - time_1_13594)) < seria.common.cljc_abs((time_13596 - time_2_13595)));
var time_factor_13598 = ((time_13596 - time_1_13594) / (time_2_13595 - time_1_13594));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13592,value_2_13593)){
return value_1_13592;
} else {
if(prefer_first_QMARK__13597){
return value_1_13592;
} else {
return value_2_13593;
}
}
});})(buffer_7247))
;
var unpack_coord_7129 = ((function (buffer_7247){
return (function seria_demo$common$unpack_coord_7129(buffer_13586){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [seria.buffer.read_float_BANG_(buffer_13586),seria.buffer.read_float_BANG_(buffer_13586)], null);
});})(buffer_7247))
;
var undiff_fixture_7174 = ((function (buffer_7247){
return (function seria_demo$common$undiff_fixture_7174(value_1_13568,value_2_13569){
var value_2_13569__$1 = seria.common.unwrap_diffed(value_2_13569);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_2_13569__$1)){
return value_1_13568;
} else {
return value_2_13569__$1;
}
});})(buffer_7247))
;
var pack_coord_7109 = ((function (buffer_7247){
return (function seria_demo$common$pack_coord_7109(buffer_13578,value_13577){
var inner_value_13579_13741 = (value_13577.cljs$core$IFn$_invoke$arity$1 ? value_13577.cljs$core$IFn$_invoke$arity$1((0)) : value_13577.call(null,(0)));
seria.buffer.write_float_BANG_(buffer_13578,inner_value_13579_13741);

var inner_value_13579_13742 = (value_13577.cljs$core$IFn$_invoke$arity$1 ? value_13577.cljs$core$IFn$_invoke$arity$1((1)) : value_13577.call(null,(1)));
seria.buffer.write_float_BANG_(buffer_13578,inner_value_13579_13742);

return buffer_13578;
});})(buffer_7247))
;
var gen_7266 = ((function (buffer_7247){
return (function seria_demo$common$gen_7266(schema_13643){
return (function (){var G__13687 = (((schema_13643 instanceof cljs.core.Keyword))?schema_13643.fqn:null);
switch (G__13687) {
case "body":
return gen_body_7141;

break;
case "fixture":
return gen_fixture_7143;

break;
case "coord":
return gen_coord_7142;

break;
case "snapshot":
return gen_snapshot_7232;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13643)].join('')));

}
})().call(null);
});})(buffer_7247))
;
var diff_body_7137 = ((function (buffer_7247){
return (function seria_demo$common$diff_body_7137(value_1_13538,value_2_13539){
return seria.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13538,value_2_13539))?cljs.core.cst$kw$seria_SLASH_dnil:value_2_13539));
});})(buffer_7247))
;
var unpack_body_7128 = ((function (buffer_7247){
return (function seria_demo$common$unpack_body_7128(buffer_13536){
return new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$angle,seria.buffer.read_float_BANG_(buffer_13536),cljs.core.cst$kw$body_DASH_type,cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$dynamic,cljs.core.cst$kw$static,cljs.core.cst$kw$kinetic], null),seria.buffer.read_varint_BANG_(buffer_13536)),cljs.core.cst$kw$fixtures,cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_13536),((function (buffer_7247){
return (function (){
return unpack_fixture_7130(buffer_13536);
});})(buffer_7247))
)),cljs.core.cst$kw$position,unpack_coord_7129(buffer_13536),cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$id,seria.buffer.read_int_BANG_(buffer_13536)], null)], null);
});})(buffer_7247))
;
var unpack_diffed_fixture_7134 = ((function (buffer_7247){
return (function seria_demo$common$unpack_diffed_fixture_7134(buffer_13565){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13565))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$coords,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13565))?cljs.core.cst$kw$seria_SLASH_dnil:cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_13565),((function (buffer_7247){
return (function (){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13565))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return unpack_diffed_coord_7133(buffer_13565);
}
});})(buffer_7247))
))),cljs.core.cst$kw$user_DASH_data,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13565))?cljs.core.cst$kw$seria_SLASH_dnil:new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$color,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13565))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_int_BANG_(buffer_13565))], null))], null);
}
});})(buffer_7247))
;
var gen_fixture_7143 = ((function (buffer_7247){
return (function seria_demo$common$gen_fixture_7143(){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$color,seria.common.random_integer((4),true)], null),cljs.core.cst$kw$coords,cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(((2) + cljs.core.rand_int((4))),((function (buffer_7247){
return (function (){
return gen_coord_7142();
});})(buffer_7247))
)], null);
});})(buffer_7247))
;
var unpack_fixture_7130 = ((function (buffer_7247){
return (function seria_demo$common$unpack_fixture_7130(buffer_13564){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$coords,cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_13564),((function (buffer_7247){
return (function (){
return unpack_coord_7129(buffer_13564);
});})(buffer_7247))
)),cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$color,seria.buffer.read_int_BANG_(buffer_13564)], null)], null);
});})(buffer_7247))
;
var pack_diffed_snapshot_7215 = ((function (buffer_7247){
return (function seria_demo$common$pack_diffed_snapshot_7215(buffer_13604,value_13603){
var value_dnil_QMARK__13605_13744 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_13603);
seria.buffer.write_boolean_BANG_(buffer_13604,value_dnil_QMARK__13605_13744);

if(value_dnil_QMARK__13605_13744){
} else {
var inner_value_13606_13745 = cljs.core.cst$kw$bodies.cljs$core$IFn$_invoke$arity$1(value_13603);
var value_dnil_QMARK__13607_13746 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13606_13745);
seria.buffer.write_boolean_BANG_(buffer_13604,value_dnil_QMARK__13607_13746);

if(value_dnil_QMARK__13607_13746){
} else {
seria.buffer.write_varint_BANG_(buffer_13604,cljs.core.count(inner_value_13606_13745));

cljs.core.run_BANG_(((function (value_dnil_QMARK__13607_13746,inner_value_13606_13745,value_dnil_QMARK__13605_13744,buffer_7247){
return (function (inner_value_13608){
var value_dnil_QMARK__13609 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13608);
seria.buffer.write_boolean_BANG_(buffer_13604,value_dnil_QMARK__13609);

if(value_dnil_QMARK__13609){
return null;
} else {
return pack_diffed_body_7113(buffer_13604,inner_value_13608);
}
});})(value_dnil_QMARK__13607_13746,inner_value_13606_13745,value_dnil_QMARK__13605_13744,buffer_7247))
,inner_value_13606_13745);
}

var inner_value_13606_13747 = cljs.core.cst$kw$time.cljs$core$IFn$_invoke$arity$1(value_13603);
var value_dnil_QMARK__13610_13748 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13606_13747);
seria.buffer.write_boolean_BANG_(buffer_13604,value_dnil_QMARK__13610_13748);

if(value_dnil_QMARK__13610_13748){
} else {
seria.buffer.write_long_BANG_(buffer_13604,inner_value_13606_13747);
}
}

return buffer_13604;
});})(buffer_7247))
;
var pack_fixture_7108 = ((function (buffer_7247){
return (function seria_demo$common$pack_fixture_7108(buffer_13550,value_13549){
var inner_value_13551_13749 = cljs.core.cst$kw$coords.cljs$core$IFn$_invoke$arity$1(value_13549);
seria.buffer.write_varint_BANG_(buffer_13550,cljs.core.count(inner_value_13551_13749));

cljs.core.run_BANG_(((function (inner_value_13551_13749,buffer_7247){
return (function (inner_value_13552){
return pack_coord_7109(buffer_13550,inner_value_13552);
});})(inner_value_13551_13749,buffer_7247))
,inner_value_13551_13749);

var inner_value_13551_13750 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_13549);
var inner_value_13553_13751 = cljs.core.cst$kw$color.cljs$core$IFn$_invoke$arity$1(inner_value_13551_13750);
seria.buffer.write_int_BANG_(buffer_13550,inner_value_13553_13751);

return buffer_13550;
});})(buffer_7247))
;
var undiff_7264 = ((function (buffer_7247){
return (function seria_demo$common$undiff_7264(schema_13640,value_1_13641,value_2_13642){
return (function (){var G__13689 = (((schema_13640 instanceof cljs.core.Keyword))?schema_13640.fqn:null);
switch (G__13689) {
case "body":
return undiff_body_7140;

break;
case "fixture":
return undiff_fixture_7174;

break;
case "coord":
return undiff_coord_7199;

break;
case "snapshot":
return undiff_snapshot_7231;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13640)].join('')));

}
})().call(null,value_1_13641,value_2_13642);
});})(buffer_7247))
;
var diff_fixture_7171 = ((function (buffer_7247){
return (function seria_demo$common$diff_fixture_7171(value_1_13566,value_2_13567){
return seria.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13566,value_2_13567))?cljs.core.cst$kw$seria_SLASH_dnil:value_2_13567));
});})(buffer_7247))
;
var diff_7260 = ((function (buffer_7247){
return (function seria_demo$common$diff_7260(schema_13637,value_1_13638,value_2_13639){
return (function (){var G__13691 = (((schema_13637 instanceof cljs.core.Keyword))?schema_13637.fqn:null);
switch (G__13691) {
case "body":
return diff_body_7137;

break;
case "fixture":
return diff_fixture_7171;

break;
case "coord":
return diff_coord_7196;

break;
case "snapshot":
return diff_snapshot_7228;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13637)].join('')));

}
})().call(null,value_1_13638,value_2_13639);
});})(buffer_7247))
;
var pack_7248 = ((function (buffer_7247){
return (function() {
var seria_demo$common$pack_7248 = null;
var seria_demo$common$pack_7248__2 = (function (schema_13624,value_13625){
return seria_demo$common$pack_7248.cljs$core$IFn$_invoke$arity$4(schema_13624,value_13625,null,null);
});
var seria_demo$common$pack_7248__4 = (function (schema_13624,value_13625,meta_schema_13627,meta_value_13628){
var diffed_QMARK__13626 = seria.common.diffed_QMARK_(value_13625);
var value_13625__$1 = (function (){var G__13697 = value_13625;
if(cljs.core.truth_(diffed_QMARK__13626)){
return seria.common.unwrap_diffed(G__13697);
} else {
return G__13697;
}
})();
return seria.buffer.compress((function (){var G__13698 = (cljs.core.truth_(diffed_QMARK__13626)?(function (){var G__13699 = (((schema_13624 instanceof cljs.core.Keyword))?schema_13624.fqn:null);
switch (G__13699) {
case "body":
return pack_diffed_body_7113;

break;
case "fixture":
return pack_diffed_fixture_7121;

break;
case "coord":
return pack_diffed_coord_7123;

break;
case "snapshot":
return pack_diffed_snapshot_7215;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13624)].join('')));

}
})():(function (){var G__13700 = (((schema_13624 instanceof cljs.core.Keyword))?schema_13624.fqn:null);
switch (G__13700) {
case "body":
return pack_body_7105;

break;
case "fixture":
return pack_fixture_7108;

break;
case "coord":
return pack_coord_7109;

break;
case "snapshot":
return pack_snapshot_7210;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13624)].join('')));

}
})()).call(null,seria.buffer.write_headers_BANG_(buffer_7247,new cljs.core.PersistentArrayMap(null, 4, [cljs.core.cst$kw$body,(0),cljs.core.cst$kw$coord,(1),cljs.core.cst$kw$fixture,(2),cljs.core.cst$kw$snapshot,(3)], null).call(null,schema_13624),new cljs.core.PersistentArrayMap(null, 4, [cljs.core.cst$kw$body,(0),cljs.core.cst$kw$coord,(1),cljs.core.cst$kw$fixture,(2),cljs.core.cst$kw$snapshot,(3)], null).call(null,meta_schema_13627),diffed_QMARK__13626),value_13625__$1);
if(cljs.core.truth_(meta_schema_13627)){
return (function (){var G__13701 = (((meta_schema_13627 instanceof cljs.core.Keyword))?meta_schema_13627.fqn:null);
switch (G__13701) {
case "body":
return pack_body_7105;

break;
case "fixture":
return pack_fixture_7108;

break;
case "coord":
return pack_coord_7109;

break;
case "snapshot":
return pack_snapshot_7210;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(meta_schema_13627)].join('')));

}
})().call(null,G__13698,meta_value_13628);
} else {
return G__13698;
}
})());
});
seria_demo$common$pack_7248 = function(schema_13624,value_13625,meta_schema_13627,meta_value_13628){
switch(arguments.length){
case 2:
return seria_demo$common$pack_7248__2.call(this,schema_13624,value_13625);
case 4:
return seria_demo$common$pack_7248__4.call(this,schema_13624,value_13625,meta_schema_13627,meta_value_13628);
}
throw(new Error('Invalid arity: ' + arguments.length));
};
seria_demo$common$pack_7248.cljs$core$IFn$_invoke$arity$2 = seria_demo$common$pack_7248__2;
seria_demo$common$pack_7248.cljs$core$IFn$_invoke$arity$4 = seria_demo$common$pack_7248__4;
return seria_demo$common$pack_7248;
})()
;})(buffer_7247))
;
var pack_diffed_fixture_7121 = ((function (buffer_7247){
return (function seria_demo$common$pack_diffed_fixture_7121(buffer_13555,value_13554){
var value_dnil_QMARK__13556_13757 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_13554);
seria.buffer.write_boolean_BANG_(buffer_13555,value_dnil_QMARK__13556_13757);

if(value_dnil_QMARK__13556_13757){
} else {
var inner_value_13557_13758 = cljs.core.cst$kw$coords.cljs$core$IFn$_invoke$arity$1(value_13554);
var value_dnil_QMARK__13558_13759 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13557_13758);
seria.buffer.write_boolean_BANG_(buffer_13555,value_dnil_QMARK__13558_13759);

if(value_dnil_QMARK__13558_13759){
} else {
seria.buffer.write_varint_BANG_(buffer_13555,cljs.core.count(inner_value_13557_13758));

cljs.core.run_BANG_(((function (value_dnil_QMARK__13558_13759,inner_value_13557_13758,value_dnil_QMARK__13556_13757,buffer_7247){
return (function (inner_value_13559){
var value_dnil_QMARK__13560 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13559);
seria.buffer.write_boolean_BANG_(buffer_13555,value_dnil_QMARK__13560);

if(value_dnil_QMARK__13560){
return null;
} else {
return pack_diffed_coord_7123(buffer_13555,inner_value_13559);
}
});})(value_dnil_QMARK__13558_13759,inner_value_13557_13758,value_dnil_QMARK__13556_13757,buffer_7247))
,inner_value_13557_13758);
}

var inner_value_13557_13760 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_13554);
var value_dnil_QMARK__13561_13761 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13557_13760);
seria.buffer.write_boolean_BANG_(buffer_13555,value_dnil_QMARK__13561_13761);

if(value_dnil_QMARK__13561_13761){
} else {
var inner_value_13562_13762 = cljs.core.cst$kw$color.cljs$core$IFn$_invoke$arity$1(inner_value_13557_13760);
var value_dnil_QMARK__13563_13763 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13562_13762);
seria.buffer.write_boolean_BANG_(buffer_13555,value_dnil_QMARK__13563_13763);

if(value_dnil_QMARK__13563_13763){
} else {
seria.buffer.write_int_BANG_(buffer_13555,inner_value_13562_13762);
}
}
}

return buffer_13555;
});})(buffer_7247))
;
var unpack_diffed_body_7132 = ((function (buffer_7247){
return (function seria_demo$common$unpack_diffed_body_7132(buffer_13537){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13537))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$angle,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13537))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_float_BANG_(buffer_13537)),cljs.core.cst$kw$body_DASH_type,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13537))?cljs.core.cst$kw$seria_SLASH_dnil:cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$dynamic,cljs.core.cst$kw$static,cljs.core.cst$kw$kinetic], null),seria.buffer.read_varint_BANG_(buffer_13537))),cljs.core.cst$kw$fixtures,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13537))?cljs.core.cst$kw$seria_SLASH_dnil:cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_13537),((function (buffer_7247){
return (function (){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13537))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return unpack_diffed_fixture_7134(buffer_13537);
}
});})(buffer_7247))
))),cljs.core.cst$kw$position,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13537))?cljs.core.cst$kw$seria_SLASH_dnil:unpack_diffed_coord_7133(buffer_13537)),cljs.core.cst$kw$user_DASH_data,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13537))?cljs.core.cst$kw$seria_SLASH_dnil:new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$id,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13537))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_int_BANG_(buffer_13537))], null))], null);
}
});})(buffer_7247))
;
var diff_coord_7196 = ((function (buffer_7247){
return (function seria_demo$common$diff_coord_7196(value_1_13588,value_2_13589){
return seria.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13588,value_2_13589))?cljs.core.cst$kw$seria_SLASH_dnil:value_2_13589));
});})(buffer_7247))
;
var unpack_diffed_snapshot_7225 = ((function (buffer_7247){
return (function seria_demo$common$unpack_diffed_snapshot_7225(buffer_13612){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13612))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$bodies,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13612))?cljs.core.cst$kw$seria_SLASH_dnil:cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_13612),((function (buffer_7247){
return (function (){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13612))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return unpack_diffed_body_7132(buffer_13612);
}
});})(buffer_7247))
))),cljs.core.cst$kw$time,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13612))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_long_BANG_(buffer_13612))], null);
}
});})(buffer_7247))
;
var unpack_7256 = ((function (buffer_7247){
return (function seria_demo$common$unpack_7256(raw_13630){
var buffer_13631 = seria.buffer.wrap(raw_13630);
var headers_13632 = seria.buffer.read_headers_BANG_(buffer_13631);
var schema_13634 = cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$body,cljs.core.cst$kw$coord,cljs.core.cst$kw$fixture,cljs.core.cst$kw$snapshot], null),cljs.core.cst$kw$schema_DASH_id.cljs$core$IFn$_invoke$arity$1(headers_13632));
var meta_schema_id_13636 = cljs.core.cst$kw$meta_DASH_schema_DASH_id.cljs$core$IFn$_invoke$arity$1(headers_13632);
var meta_schema_13635 = cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$body,cljs.core.cst$kw$coord,cljs.core.cst$kw$fixture,cljs.core.cst$kw$snapshot], null),meta_schema_id_13636);
var diffed_QMARK__13633 = cljs.core.cst$kw$diffed_QMARK_.cljs$core$IFn$_invoke$arity$1(headers_13632);
if(cljs.core.truth_((function (){var or__4682__auto__ = cljs.core.not(schema_13634);
if(or__4682__auto__){
return or__4682__auto__;
} else {
var and__4670__auto__ = meta_schema_id_13636;
if(cljs.core.truth_(and__4670__auto__)){
return cljs.core.not(meta_schema_13635);
} else {
return and__4670__auto__;
}
}
})())){
return cljs.core.cst$kw$seria_SLASH_invalid;
} else {
var G__13707 = new cljs.core.PersistentArrayMap(null, 3, [cljs.core.cst$kw$schema,schema_13634,cljs.core.cst$kw$diffed_QMARK_,diffed_QMARK__13633,cljs.core.cst$kw$value,(function (){var G__13708 = (cljs.core.truth_(diffed_QMARK__13633)?(function (){var G__13709 = (((schema_13634 instanceof cljs.core.Keyword))?schema_13634.fqn:null);
switch (G__13709) {
case "body":
return unpack_diffed_body_7132;

break;
case "fixture":
return unpack_diffed_fixture_7134;

break;
case "coord":
return unpack_diffed_coord_7133;

break;
case "snapshot":
return unpack_diffed_snapshot_7225;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13634)].join('')));

}
})():(function (){var G__13710 = (((schema_13634 instanceof cljs.core.Keyword))?schema_13634.fqn:null);
switch (G__13710) {
case "body":
return unpack_body_7128;

break;
case "fixture":
return unpack_fixture_7130;

break;
case "coord":
return unpack_coord_7129;

break;
case "snapshot":
return unpack_snapshot_7223;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13634)].join('')));

}
})()).call(null,buffer_13631);
if(cljs.core.truth_(diffed_QMARK__13633)){
return seria.common.wrap_diffed(G__13708);
} else {
return G__13708;
}
})()], null);
if(cljs.core.truth_(meta_schema_13635)){
return cljs.core.assoc.cljs$core$IFn$_invoke$arity$variadic(G__13707,cljs.core.cst$kw$meta_DASH_schema,meta_schema_13635,cljs.core.array_seq([cljs.core.cst$kw$meta_DASH_value,(function (){var G__13711 = (((meta_schema_13635 instanceof cljs.core.Keyword))?meta_schema_13635.fqn:null);
switch (G__13711) {
case "body":
return unpack_body_7128;

break;
case "fixture":
return unpack_fixture_7130;

break;
case "coord":
return unpack_coord_7129;

break;
case "snapshot":
return unpack_snapshot_7223;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(meta_schema_13635)].join('')));

}
})().call(null,buffer_13631)], 0));
} else {
return G__13707;
}
}
});})(buffer_7247))
;
var interp_body_7151 = ((function (buffer_7247){
return (function seria_demo$common$interp_body_7151(value_1_13542,value_2_13543,time_1_13544,time_2_13545,time_13546){
var prefer_first_QMARK__13547 = (seria.common.cljc_abs((time_13546 - time_1_13544)) < seria.common.cljc_abs((time_13546 - time_2_13545)));
var time_factor_13548 = ((time_13546 - time_1_13544) / (time_2_13545 - time_1_13544));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13542,value_2_13543)){
return value_1_13542;
} else {
if(prefer_first_QMARK__13547){
return value_1_13542;
} else {
return value_2_13543;
}
}
});})(buffer_7247))
;
var gen_coord_7142 = ((function (buffer_7247){
return (function seria_demo$common$gen_coord_7142(){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.rand.cljs$core$IFn$_invoke$arity$0(),cljs.core.rand.cljs$core$IFn$_invoke$arity$0()], null);
});})(buffer_7247))
;
var pack_snapshot_7210 = ((function (buffer_7247){
return (function seria_demo$common$pack_snapshot_7210(buffer_13600,value_13599){
var inner_value_13601_13767 = cljs.core.cst$kw$bodies.cljs$core$IFn$_invoke$arity$1(value_13599);
seria.buffer.write_varint_BANG_(buffer_13600,cljs.core.count(inner_value_13601_13767));

cljs.core.run_BANG_(((function (inner_value_13601_13767,buffer_7247){
return (function (inner_value_13602){
return pack_body_7105(buffer_13600,inner_value_13602);
});})(inner_value_13601_13767,buffer_7247))
,inner_value_13601_13767);

var inner_value_13601_13768 = cljs.core.cst$kw$time.cljs$core$IFn$_invoke$arity$1(value_13599);
seria.buffer.write_long_BANG_(buffer_13600,inner_value_13601_13768);

return buffer_13600;
});})(buffer_7247))
;
var undiff_coord_7199 = ((function (buffer_7247){
return (function seria_demo$common$undiff_coord_7199(value_1_13590,value_2_13591){
var value_2_13591__$1 = seria.common.unwrap_diffed(value_2_13591);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_2_13591__$1)){
return value_1_13590;
} else {
return value_2_13591__$1;
}
});})(buffer_7247))
;
var interp_fixture_7182 = ((function (buffer_7247){
return (function seria_demo$common$interp_fixture_7182(value_1_13570,value_2_13571,time_1_13572,time_2_13573,time_13574){
var prefer_first_QMARK__13575 = (seria.common.cljc_abs((time_13574 - time_1_13572)) < seria.common.cljc_abs((time_13574 - time_2_13573)));
var time_factor_13576 = ((time_13574 - time_1_13572) / (time_2_13573 - time_1_13572));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13570,value_2_13571)){
return value_1_13570;
} else {
if(prefer_first_QMARK__13575){
return value_1_13570;
} else {
return value_2_13571;
}
}
});})(buffer_7247))
;
var interp_7273 = ((function (buffer_7247){
return (function seria_demo$common$interp_7273(schema_13644,value_1_13645,value_2_13646,time_1_13647,time_2_13648,time_13649){
return (function (){var G__13713 = (((schema_13644 instanceof cljs.core.Keyword))?schema_13644.fqn:null);
switch (G__13713) {
case "body":
return interp_body_7151;

break;
case "fixture":
return interp_fixture_7182;

break;
case "coord":
return interp_coord_7207;

break;
case "snapshot":
return interp_snapshot_7240;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13644)].join('')));

}
})().call(null,value_1_13645,value_2_13646,time_1_13647,time_2_13648,time_13649);
});})(buffer_7247))
;
return cljs.core.PersistentHashMap.fromArrays([cljs.core.cst$kw$pack,cljs.core.cst$kw$unpack,cljs.core.cst$kw$diff,cljs.core.cst$kw$undiff,cljs.core.cst$kw$gen,cljs.core.cst$kw$interp],[pack_7248,unpack_7256,diff_7260,undiff_7264,gen_7266,interp_7273]);
})();
seria_demo.common.pack = cljs.core.cst$kw$pack.cljs$core$IFn$_invoke$arity$1(processors_13517_13714);

seria_demo.common.gen = cljs.core.cst$kw$gen.cljs$core$IFn$_invoke$arity$1(processors_13517_13714);

seria_demo.common.unpack = cljs.core.cst$kw$unpack.cljs$core$IFn$_invoke$arity$1(processors_13517_13714);
