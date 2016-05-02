// Compiled by ClojureScript 1.7.170 {:static-fns true, :optimize-constants true}
goog.provide('seria_demo.common');
goog.require('cljs.core');
goog.require('seria.core');
var processors_13524_13721 = (function (){var buffer_7253 = seria.buffer.allocate((10000));
var pack_fixture_7114 = ((function (buffer_7253){
return (function seria_demo$common$pack_fixture_7114(buffer_13557,value_13556){
var inner_value_13558_13722 = cljs.core.cst$kw$coords.cljs$core$IFn$_invoke$arity$1(value_13556);
seria.buffer.write_varint_BANG_(buffer_13557,cljs.core.count(inner_value_13558_13722));

cljs.core.run_BANG_(((function (inner_value_13558_13722,buffer_7253){
return (function (inner_value_13559){
return pack_coord_7115(buffer_13557,inner_value_13559);
});})(inner_value_13558_13722,buffer_7253))
,inner_value_13558_13722);

var inner_value_13558_13723 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_13556);
var inner_value_13560_13724 = cljs.core.cst$kw$color.cljs$core$IFn$_invoke$arity$1(inner_value_13558_13723);
seria.buffer.write_int_BANG_(buffer_13557,inner_value_13560_13724);

return buffer_13557;
});})(buffer_7253))
;
var unpack_diffed_coord_7139 = ((function (buffer_7253){
return (function seria_demo$common$unpack_diffed_coord_7139(buffer_13594){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13594))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13594))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_float_BANG_(buffer_13594)),(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13594))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_float_BANG_(buffer_13594))], null);
}
});})(buffer_7253))
;
var interp_7279 = ((function (buffer_7253){
return (function seria_demo$common$interp_7279(schema_13651,value_1_13652,value_2_13653,time_1_13654,time_2_13655,time_13656){
return (function (){var G__13690 = (((schema_13651 instanceof cljs.core.Keyword))?schema_13651.fqn:null);
switch (G__13690) {
case "body":
return interp_body_7157;

break;
case "fixture":
return interp_fixture_7188;

break;
case "coord":
return interp_coord_7213;

break;
case "snapshot":
return interp_snapshot_7246;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13651)].join('')));

}
})().call(null,value_1_13652,value_2_13653,time_1_13654,time_2_13655,time_13656);
});})(buffer_7253))
;
var diff_coord_7202 = ((function (buffer_7253){
return (function seria_demo$common$diff_coord_7202(value_1_13595,value_2_13596){
return seria.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13595,value_2_13596))?cljs.core.cst$kw$seria_SLASH_dnil:value_2_13596));
});})(buffer_7253))
;
var diff_snapshot_7234 = ((function (buffer_7253){
return (function seria_demo$common$diff_snapshot_7234(value_1_13620,value_2_13621){
return seria.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13620,value_2_13621))?cljs.core.cst$kw$seria_SLASH_dnil:value_2_13621));
});})(buffer_7253))
;
var undiff_fixture_7180 = ((function (buffer_7253){
return (function seria_demo$common$undiff_fixture_7180(value_1_13575,value_2_13576){
var value_2_13576__$1 = seria.common.unwrap_diffed(value_2_13576);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_2_13576__$1)){
return value_1_13575;
} else {
return value_2_13576__$1;
}
});})(buffer_7253))
;
var gen_snapshot_7238 = ((function (buffer_7253){
return (function seria_demo$common$gen_snapshot_7238(){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$time,seria.common.random_integer((8),true),cljs.core.cst$kw$bodies,cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(((2) + cljs.core.rand_int((4))),((function (buffer_7253){
return (function (){
return gen_body_7147();
});})(buffer_7253))
)], null);
});})(buffer_7253))
;
var pack_diffed_fixture_7127 = ((function (buffer_7253){
return (function seria_demo$common$pack_diffed_fixture_7127(buffer_13562,value_13561){
var value_dnil_QMARK__13563_13726 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_13561);
seria.buffer.write_boolean_BANG_(buffer_13562,value_dnil_QMARK__13563_13726);

if(value_dnil_QMARK__13563_13726){
} else {
var inner_value_13564_13727 = cljs.core.cst$kw$coords.cljs$core$IFn$_invoke$arity$1(value_13561);
var value_dnil_QMARK__13565_13728 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13564_13727);
seria.buffer.write_boolean_BANG_(buffer_13562,value_dnil_QMARK__13565_13728);

if(value_dnil_QMARK__13565_13728){
} else {
seria.buffer.write_varint_BANG_(buffer_13562,cljs.core.count(inner_value_13564_13727));

cljs.core.run_BANG_(((function (value_dnil_QMARK__13565_13728,inner_value_13564_13727,value_dnil_QMARK__13563_13726,buffer_7253){
return (function (inner_value_13566){
var value_dnil_QMARK__13567 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13566);
seria.buffer.write_boolean_BANG_(buffer_13562,value_dnil_QMARK__13567);

if(value_dnil_QMARK__13567){
return null;
} else {
return pack_diffed_coord_7129(buffer_13562,inner_value_13566);
}
});})(value_dnil_QMARK__13565_13728,inner_value_13564_13727,value_dnil_QMARK__13563_13726,buffer_7253))
,inner_value_13564_13727);
}

var inner_value_13564_13729 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_13561);
var value_dnil_QMARK__13568_13730 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13564_13729);
seria.buffer.write_boolean_BANG_(buffer_13562,value_dnil_QMARK__13568_13730);

if(value_dnil_QMARK__13568_13730){
} else {
var inner_value_13569_13731 = cljs.core.cst$kw$color.cljs$core$IFn$_invoke$arity$1(inner_value_13564_13729);
var value_dnil_QMARK__13570_13732 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13569_13731);
seria.buffer.write_boolean_BANG_(buffer_13562,value_dnil_QMARK__13570_13732);

if(value_dnil_QMARK__13570_13732){
} else {
seria.buffer.write_int_BANG_(buffer_13562,inner_value_13569_13731);
}
}
}

return buffer_13562;
});})(buffer_7253))
;
var pack_7254 = ((function (buffer_7253){
return (function() {
var seria_demo$common$pack_7254 = null;
var seria_demo$common$pack_7254__2 = (function (schema_13631,value_13632){
return seria_demo$common$pack_7254.cljs$core$IFn$_invoke$arity$4(schema_13631,value_13632,null,null);
});
var seria_demo$common$pack_7254__4 = (function (schema_13631,value_13632,meta_schema_13634,meta_value_13635){
var diffed_QMARK__13633 = seria.common.diffed_QMARK_(value_13632);
var value_13632__$1 = (function (){var G__13696 = value_13632;
if(cljs.core.truth_(diffed_QMARK__13633)){
return seria.common.unwrap_diffed(G__13696);
} else {
return G__13696;
}
})();
return seria.buffer.compress((function (){var G__13697 = (cljs.core.truth_(diffed_QMARK__13633)?(function (){var G__13698 = (((schema_13631 instanceof cljs.core.Keyword))?schema_13631.fqn:null);
switch (G__13698) {
case "body":
return pack_diffed_body_7119;

break;
case "fixture":
return pack_diffed_fixture_7127;

break;
case "coord":
return pack_diffed_coord_7129;

break;
case "snapshot":
return pack_diffed_snapshot_7221;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13631)].join('')));

}
})():(function (){var G__13699 = (((schema_13631 instanceof cljs.core.Keyword))?schema_13631.fqn:null);
switch (G__13699) {
case "body":
return pack_body_7111;

break;
case "fixture":
return pack_fixture_7114;

break;
case "coord":
return pack_coord_7115;

break;
case "snapshot":
return pack_snapshot_7216;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13631)].join('')));

}
})()).call(null,seria.buffer.write_headers_BANG_(buffer_7253,new cljs.core.PersistentArrayMap(null, 4, [cljs.core.cst$kw$body,(0),cljs.core.cst$kw$coord,(1),cljs.core.cst$kw$fixture,(2),cljs.core.cst$kw$snapshot,(3)], null).call(null,schema_13631),new cljs.core.PersistentArrayMap(null, 4, [cljs.core.cst$kw$body,(0),cljs.core.cst$kw$coord,(1),cljs.core.cst$kw$fixture,(2),cljs.core.cst$kw$snapshot,(3)], null).call(null,meta_schema_13634),diffed_QMARK__13633),value_13632__$1);
if(cljs.core.truth_(meta_schema_13634)){
return (function (){var G__13700 = (((meta_schema_13634 instanceof cljs.core.Keyword))?meta_schema_13634.fqn:null);
switch (G__13700) {
case "body":
return pack_body_7111;

break;
case "fixture":
return pack_fixture_7114;

break;
case "coord":
return pack_coord_7115;

break;
case "snapshot":
return pack_snapshot_7216;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(meta_schema_13634)].join('')));

}
})().call(null,G__13697,meta_value_13635);
} else {
return G__13697;
}
})());
});
seria_demo$common$pack_7254 = function(schema_13631,value_13632,meta_schema_13634,meta_value_13635){
switch(arguments.length){
case 2:
return seria_demo$common$pack_7254__2.call(this,schema_13631,value_13632);
case 4:
return seria_demo$common$pack_7254__4.call(this,schema_13631,value_13632,meta_schema_13634,meta_value_13635);
}
throw(new Error('Invalid arity: ' + arguments.length));
};
seria_demo$common$pack_7254.cljs$core$IFn$_invoke$arity$2 = seria_demo$common$pack_7254__2;
seria_demo$common$pack_7254.cljs$core$IFn$_invoke$arity$4 = seria_demo$common$pack_7254__4;
return seria_demo$common$pack_7254;
})()
;})(buffer_7253))
;
var unpack_diffed_fixture_7140 = ((function (buffer_7253){
return (function seria_demo$common$unpack_diffed_fixture_7140(buffer_13572){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13572))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$coords,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13572))?cljs.core.cst$kw$seria_SLASH_dnil:cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_13572),((function (buffer_7253){
return (function (){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13572))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return unpack_diffed_coord_7139(buffer_13572);
}
});})(buffer_7253))
))),cljs.core.cst$kw$user_DASH_data,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13572))?cljs.core.cst$kw$seria_SLASH_dnil:new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$color,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13572))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_int_BANG_(buffer_13572))], null))], null);
}
});})(buffer_7253))
;
var pack_diffed_snapshot_7221 = ((function (buffer_7253){
return (function seria_demo$common$pack_diffed_snapshot_7221(buffer_13611,value_13610){
var value_dnil_QMARK__13612_13736 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_13610);
seria.buffer.write_boolean_BANG_(buffer_13611,value_dnil_QMARK__13612_13736);

if(value_dnil_QMARK__13612_13736){
} else {
var inner_value_13613_13737 = cljs.core.cst$kw$bodies.cljs$core$IFn$_invoke$arity$1(value_13610);
var value_dnil_QMARK__13614_13738 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13613_13737);
seria.buffer.write_boolean_BANG_(buffer_13611,value_dnil_QMARK__13614_13738);

if(value_dnil_QMARK__13614_13738){
} else {
seria.buffer.write_varint_BANG_(buffer_13611,cljs.core.count(inner_value_13613_13737));

cljs.core.run_BANG_(((function (value_dnil_QMARK__13614_13738,inner_value_13613_13737,value_dnil_QMARK__13612_13736,buffer_7253){
return (function (inner_value_13615){
var value_dnil_QMARK__13616 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13615);
seria.buffer.write_boolean_BANG_(buffer_13611,value_dnil_QMARK__13616);

if(value_dnil_QMARK__13616){
return null;
} else {
return pack_diffed_body_7119(buffer_13611,inner_value_13615);
}
});})(value_dnil_QMARK__13614_13738,inner_value_13613_13737,value_dnil_QMARK__13612_13736,buffer_7253))
,inner_value_13613_13737);
}

var inner_value_13613_13739 = cljs.core.cst$kw$time.cljs$core$IFn$_invoke$arity$1(value_13610);
var value_dnil_QMARK__13617_13740 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13613_13739);
seria.buffer.write_boolean_BANG_(buffer_13611,value_dnil_QMARK__13617_13740);

if(value_dnil_QMARK__13617_13740){
} else {
seria.buffer.write_long_BANG_(buffer_13611,inner_value_13613_13739);
}
}

return buffer_13611;
});})(buffer_7253))
;
var interp_body_7157 = ((function (buffer_7253){
return (function seria_demo$common$interp_body_7157(value_1_13549,value_2_13550,time_1_13551,time_2_13552,time_13553){
var prefer_first_QMARK__13554 = (seria.common.cljc_abs((time_13553 - time_1_13551)) < seria.common.cljc_abs((time_13553 - time_2_13552)));
var time_factor_13555 = ((time_13553 - time_1_13551) / (time_2_13552 - time_1_13551));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13549,value_2_13550)){
return value_1_13549;
} else {
if(prefer_first_QMARK__13554){
return value_1_13549;
} else {
return value_2_13550;
}
}
});})(buffer_7253))
;
var unpack_snapshot_7229 = ((function (buffer_7253){
return (function seria_demo$common$unpack_snapshot_7229(buffer_13618){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$bodies,cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_13618),((function (buffer_7253){
return (function (){
return unpack_body_7134(buffer_13618);
});})(buffer_7253))
)),cljs.core.cst$kw$time,seria.buffer.read_long_BANG_(buffer_13618)], null);
});})(buffer_7253))
;
var pack_diffed_body_7119 = ((function (buffer_7253){
return (function seria_demo$common$pack_diffed_body_7119(buffer_13531,value_13530){
var value_dnil_QMARK__13532_13741 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_13530);
seria.buffer.write_boolean_BANG_(buffer_13531,value_dnil_QMARK__13532_13741);

if(value_dnil_QMARK__13532_13741){
} else {
var inner_value_13533_13742 = cljs.core.cst$kw$angle.cljs$core$IFn$_invoke$arity$1(value_13530);
var value_dnil_QMARK__13534_13743 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13533_13742);
seria.buffer.write_boolean_BANG_(buffer_13531,value_dnil_QMARK__13534_13743);

if(value_dnil_QMARK__13534_13743){
} else {
seria.buffer.write_float_BANG_(buffer_13531,inner_value_13533_13742);
}

var inner_value_13533_13744 = cljs.core.cst$kw$body_DASH_type.cljs$core$IFn$_invoke$arity$1(value_13530);
var value_dnil_QMARK__13535_13745 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13533_13744);
seria.buffer.write_boolean_BANG_(buffer_13531,value_dnil_QMARK__13535_13745);

if(value_dnil_QMARK__13535_13745){
} else {
seria.buffer.write_varint_BANG_(buffer_13531,(function (){var G__13702 = (((inner_value_13533_13744 instanceof cljs.core.Keyword))?inner_value_13533_13744.fqn:null);
switch (G__13702) {
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
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(inner_value_13533_13744)].join('')));

}
})());
}

var inner_value_13533_13747 = cljs.core.cst$kw$fixtures.cljs$core$IFn$_invoke$arity$1(value_13530);
var value_dnil_QMARK__13536_13748 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13533_13747);
seria.buffer.write_boolean_BANG_(buffer_13531,value_dnil_QMARK__13536_13748);

if(value_dnil_QMARK__13536_13748){
} else {
seria.buffer.write_varint_BANG_(buffer_13531,cljs.core.count(inner_value_13533_13747));

cljs.core.run_BANG_(((function (value_dnil_QMARK__13536_13748,inner_value_13533_13747,value_dnil_QMARK__13532_13741,buffer_7253){
return (function (inner_value_13537){
var value_dnil_QMARK__13538 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13537);
seria.buffer.write_boolean_BANG_(buffer_13531,value_dnil_QMARK__13538);

if(value_dnil_QMARK__13538){
return null;
} else {
return pack_diffed_fixture_7127(buffer_13531,inner_value_13537);
}
});})(value_dnil_QMARK__13536_13748,inner_value_13533_13747,value_dnil_QMARK__13532_13741,buffer_7253))
,inner_value_13533_13747);
}

var inner_value_13533_13749 = cljs.core.cst$kw$position.cljs$core$IFn$_invoke$arity$1(value_13530);
var value_dnil_QMARK__13539_13750 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13533_13749);
seria.buffer.write_boolean_BANG_(buffer_13531,value_dnil_QMARK__13539_13750);

if(value_dnil_QMARK__13539_13750){
} else {
pack_diffed_coord_7129(buffer_13531,inner_value_13533_13749);
}

var inner_value_13533_13751 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_13530);
var value_dnil_QMARK__13540_13752 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13533_13751);
seria.buffer.write_boolean_BANG_(buffer_13531,value_dnil_QMARK__13540_13752);

if(value_dnil_QMARK__13540_13752){
} else {
var inner_value_13541_13753 = cljs.core.cst$kw$id.cljs$core$IFn$_invoke$arity$1(inner_value_13533_13751);
var value_dnil_QMARK__13542_13754 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13541_13753);
seria.buffer.write_boolean_BANG_(buffer_13531,value_dnil_QMARK__13542_13754);

if(value_dnil_QMARK__13542_13754){
} else {
seria.buffer.write_int_BANG_(buffer_13531,inner_value_13541_13753);
}
}
}

return buffer_13531;
});})(buffer_7253))
;
var interp_fixture_7188 = ((function (buffer_7253){
return (function seria_demo$common$interp_fixture_7188(value_1_13577,value_2_13578,time_1_13579,time_2_13580,time_13581){
var prefer_first_QMARK__13582 = (seria.common.cljc_abs((time_13581 - time_1_13579)) < seria.common.cljc_abs((time_13581 - time_2_13580)));
var time_factor_13583 = ((time_13581 - time_1_13579) / (time_2_13580 - time_1_13579));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13577,value_2_13578)){
return value_1_13577;
} else {
if(prefer_first_QMARK__13582){
return value_1_13577;
} else {
return value_2_13578;
}
}
});})(buffer_7253))
;
var pack_snapshot_7216 = ((function (buffer_7253){
return (function seria_demo$common$pack_snapshot_7216(buffer_13607,value_13606){
var inner_value_13608_13755 = cljs.core.cst$kw$bodies.cljs$core$IFn$_invoke$arity$1(value_13606);
seria.buffer.write_varint_BANG_(buffer_13607,cljs.core.count(inner_value_13608_13755));

cljs.core.run_BANG_(((function (inner_value_13608_13755,buffer_7253){
return (function (inner_value_13609){
return pack_body_7111(buffer_13607,inner_value_13609);
});})(inner_value_13608_13755,buffer_7253))
,inner_value_13608_13755);

var inner_value_13608_13756 = cljs.core.cst$kw$time.cljs$core$IFn$_invoke$arity$1(value_13606);
seria.buffer.write_long_BANG_(buffer_13607,inner_value_13608_13756);

return buffer_13607;
});})(buffer_7253))
;
var undiff_7270 = ((function (buffer_7253){
return (function seria_demo$common$undiff_7270(schema_13647,value_1_13648,value_2_13649){
return (function (){var G__13704 = (((schema_13647 instanceof cljs.core.Keyword))?schema_13647.fqn:null);
switch (G__13704) {
case "body":
return undiff_body_7146;

break;
case "fixture":
return undiff_fixture_7180;

break;
case "coord":
return undiff_coord_7205;

break;
case "snapshot":
return undiff_snapshot_7237;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13647)].join('')));

}
})().call(null,value_1_13648,value_2_13649);
});})(buffer_7253))
;
var gen_7272 = ((function (buffer_7253){
return (function seria_demo$common$gen_7272(schema_13650){
return (function (){var G__13706 = (((schema_13650 instanceof cljs.core.Keyword))?schema_13650.fqn:null);
switch (G__13706) {
case "body":
return gen_body_7147;

break;
case "fixture":
return gen_fixture_7149;

break;
case "coord":
return gen_coord_7148;

break;
case "snapshot":
return gen_snapshot_7238;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13650)].join('')));

}
})().call(null);
});})(buffer_7253))
;
var pack_coord_7115 = ((function (buffer_7253){
return (function seria_demo$common$pack_coord_7115(buffer_13585,value_13584){
var inner_value_13586_13759 = (value_13584.cljs$core$IFn$_invoke$arity$1 ? value_13584.cljs$core$IFn$_invoke$arity$1((0)) : value_13584.call(null,(0)));
seria.buffer.write_float_BANG_(buffer_13585,inner_value_13586_13759);

var inner_value_13586_13760 = (value_13584.cljs$core$IFn$_invoke$arity$1 ? value_13584.cljs$core$IFn$_invoke$arity$1((1)) : value_13584.call(null,(1)));
seria.buffer.write_float_BANG_(buffer_13585,inner_value_13586_13760);

return buffer_13585;
});})(buffer_7253))
;
var diff_7266 = ((function (buffer_7253){
return (function seria_demo$common$diff_7266(schema_13644,value_1_13645,value_2_13646){
return (function (){var G__13708 = (((schema_13644 instanceof cljs.core.Keyword))?schema_13644.fqn:null);
switch (G__13708) {
case "body":
return diff_body_7143;

break;
case "fixture":
return diff_fixture_7177;

break;
case "coord":
return diff_coord_7202;

break;
case "snapshot":
return diff_snapshot_7234;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13644)].join('')));

}
})().call(null,value_1_13645,value_2_13646);
});})(buffer_7253))
;
var pack_diffed_coord_7129 = ((function (buffer_7253){
return (function seria_demo$common$pack_diffed_coord_7129(buffer_13588,value_13587){
var value_dnil_QMARK__13589_13762 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_13587);
seria.buffer.write_boolean_BANG_(buffer_13588,value_dnil_QMARK__13589_13762);

if(value_dnil_QMARK__13589_13762){
} else {
var inner_value_13590_13763 = (value_13587.cljs$core$IFn$_invoke$arity$1 ? value_13587.cljs$core$IFn$_invoke$arity$1((0)) : value_13587.call(null,(0)));
var value_dnil_QMARK__13591_13764 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13590_13763);
seria.buffer.write_boolean_BANG_(buffer_13588,value_dnil_QMARK__13591_13764);

if(value_dnil_QMARK__13591_13764){
} else {
seria.buffer.write_float_BANG_(buffer_13588,inner_value_13590_13763);
}

var inner_value_13590_13765 = (value_13587.cljs$core$IFn$_invoke$arity$1 ? value_13587.cljs$core$IFn$_invoke$arity$1((1)) : value_13587.call(null,(1)));
var value_dnil_QMARK__13592_13766 = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,inner_value_13590_13765);
seria.buffer.write_boolean_BANG_(buffer_13588,value_dnil_QMARK__13592_13766);

if(value_dnil_QMARK__13592_13766){
} else {
seria.buffer.write_float_BANG_(buffer_13588,inner_value_13590_13765);
}
}

return buffer_13588;
});})(buffer_7253))
;
var diff_body_7143 = ((function (buffer_7253){
return (function seria_demo$common$diff_body_7143(value_1_13545,value_2_13546){
return seria.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13545,value_2_13546))?cljs.core.cst$kw$seria_SLASH_dnil:value_2_13546));
});})(buffer_7253))
;
var unpack_fixture_7136 = ((function (buffer_7253){
return (function seria_demo$common$unpack_fixture_7136(buffer_13571){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$coords,cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_13571),((function (buffer_7253){
return (function (){
return unpack_coord_7135(buffer_13571);
});})(buffer_7253))
)),cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$color,seria.buffer.read_int_BANG_(buffer_13571)], null)], null);
});})(buffer_7253))
;
var unpack_body_7134 = ((function (buffer_7253){
return (function seria_demo$common$unpack_body_7134(buffer_13543){
return new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$angle,seria.buffer.read_float_BANG_(buffer_13543),cljs.core.cst$kw$body_DASH_type,cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$dynamic,cljs.core.cst$kw$static,cljs.core.cst$kw$kinetic], null),seria.buffer.read_varint_BANG_(buffer_13543)),cljs.core.cst$kw$fixtures,cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_13543),((function (buffer_7253){
return (function (){
return unpack_fixture_7136(buffer_13543);
});})(buffer_7253))
)),cljs.core.cst$kw$position,unpack_coord_7135(buffer_13543),cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$id,seria.buffer.read_int_BANG_(buffer_13543)], null)], null);
});})(buffer_7253))
;
var unpack_diffed_snapshot_7231 = ((function (buffer_7253){
return (function seria_demo$common$unpack_diffed_snapshot_7231(buffer_13619){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13619))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$bodies,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13619))?cljs.core.cst$kw$seria_SLASH_dnil:cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_13619),((function (buffer_7253){
return (function (){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13619))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return unpack_diffed_body_7138(buffer_13619);
}
});})(buffer_7253))
))),cljs.core.cst$kw$time,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13619))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_long_BANG_(buffer_13619))], null);
}
});})(buffer_7253))
;
var undiff_snapshot_7237 = ((function (buffer_7253){
return (function seria_demo$common$undiff_snapshot_7237(value_1_13622,value_2_13623){
var value_2_13623__$1 = seria.common.unwrap_diffed(value_2_13623);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_2_13623__$1)){
return value_1_13622;
} else {
return value_2_13623__$1;
}
});})(buffer_7253))
;
var gen_coord_7148 = ((function (buffer_7253){
return (function seria_demo$common$gen_coord_7148(){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.rand.cljs$core$IFn$_invoke$arity$0(),cljs.core.rand.cljs$core$IFn$_invoke$arity$0()], null);
});})(buffer_7253))
;
var gen_body_7147 = ((function (buffer_7253){
return (function seria_demo$common$gen_body_7147(){
return new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$id,seria.common.random_integer((4),true)], null),cljs.core.cst$kw$position,gen_coord_7148(),cljs.core.cst$kw$angle,cljs.core.rand.cljs$core$IFn$_invoke$arity$0(),cljs.core.cst$kw$body_DASH_type,cljs.core.rand_nth(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$dynamic,cljs.core.cst$kw$static,cljs.core.cst$kw$kinetic], null)),cljs.core.cst$kw$fixtures,cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(((2) + cljs.core.rand_int((4))),((function (buffer_7253){
return (function (){
return gen_fixture_7149();
});})(buffer_7253))
)], null);
});})(buffer_7253))
;
var interp_coord_7213 = ((function (buffer_7253){
return (function seria_demo$common$interp_coord_7213(value_1_13599,value_2_13600,time_1_13601,time_2_13602,time_13603){
var prefer_first_QMARK__13604 = (seria.common.cljc_abs((time_13603 - time_1_13601)) < seria.common.cljc_abs((time_13603 - time_2_13602)));
var time_factor_13605 = ((time_13603 - time_1_13601) / (time_2_13602 - time_1_13601));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13599,value_2_13600)){
return value_1_13599;
} else {
if(prefer_first_QMARK__13604){
return value_1_13599;
} else {
return value_2_13600;
}
}
});})(buffer_7253))
;
var undiff_body_7146 = ((function (buffer_7253){
return (function seria_demo$common$undiff_body_7146(value_1_13547,value_2_13548){
var value_2_13548__$1 = seria.common.unwrap_diffed(value_2_13548);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_2_13548__$1)){
return value_1_13547;
} else {
return value_2_13548__$1;
}
});})(buffer_7253))
;
var diff_fixture_7177 = ((function (buffer_7253){
return (function seria_demo$common$diff_fixture_7177(value_1_13573,value_2_13574){
return seria.common.wrap_diffed(((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13573,value_2_13574))?cljs.core.cst$kw$seria_SLASH_dnil:value_2_13574));
});})(buffer_7253))
;
var pack_body_7111 = ((function (buffer_7253){
return (function seria_demo$common$pack_body_7111(buffer_13526,value_13525){
var inner_value_13527_13767 = cljs.core.cst$kw$angle.cljs$core$IFn$_invoke$arity$1(value_13525);
seria.buffer.write_float_BANG_(buffer_13526,inner_value_13527_13767);

var inner_value_13527_13768 = cljs.core.cst$kw$body_DASH_type.cljs$core$IFn$_invoke$arity$1(value_13525);
seria.buffer.write_varint_BANG_(buffer_13526,(function (){var G__13710 = (((inner_value_13527_13768 instanceof cljs.core.Keyword))?inner_value_13527_13768.fqn:null);
switch (G__13710) {
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
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(inner_value_13527_13768)].join('')));

}
})());

var inner_value_13527_13770 = cljs.core.cst$kw$fixtures.cljs$core$IFn$_invoke$arity$1(value_13525);
seria.buffer.write_varint_BANG_(buffer_13526,cljs.core.count(inner_value_13527_13770));

cljs.core.run_BANG_(((function (inner_value_13527_13770,buffer_7253){
return (function (inner_value_13528){
return pack_fixture_7114(buffer_13526,inner_value_13528);
});})(inner_value_13527_13770,buffer_7253))
,inner_value_13527_13770);

var inner_value_13527_13771 = cljs.core.cst$kw$position.cljs$core$IFn$_invoke$arity$1(value_13525);
pack_coord_7115(buffer_13526,inner_value_13527_13771);

var inner_value_13527_13772 = cljs.core.cst$kw$user_DASH_data.cljs$core$IFn$_invoke$arity$1(value_13525);
var inner_value_13529_13773 = cljs.core.cst$kw$id.cljs$core$IFn$_invoke$arity$1(inner_value_13527_13772);
seria.buffer.write_int_BANG_(buffer_13526,inner_value_13529_13773);

return buffer_13526;
});})(buffer_7253))
;
var unpack_7262 = ((function (buffer_7253){
return (function seria_demo$common$unpack_7262(raw_13637){
var buffer_13638 = seria.buffer.wrap(raw_13637);
var headers_13639 = seria.buffer.read_headers_BANG_(buffer_13638);
var schema_13641 = cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$body,cljs.core.cst$kw$coord,cljs.core.cst$kw$fixture,cljs.core.cst$kw$snapshot], null),cljs.core.cst$kw$schema_DASH_id.cljs$core$IFn$_invoke$arity$1(headers_13639));
var meta_schema_id_13643 = cljs.core.cst$kw$meta_DASH_schema_DASH_id.cljs$core$IFn$_invoke$arity$1(headers_13639);
var meta_schema_13642 = cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$body,cljs.core.cst$kw$coord,cljs.core.cst$kw$fixture,cljs.core.cst$kw$snapshot], null),meta_schema_id_13643);
var diffed_QMARK__13640 = cljs.core.cst$kw$diffed_QMARK_.cljs$core$IFn$_invoke$arity$1(headers_13639);
if(cljs.core.truth_((function (){var or__4682__auto__ = cljs.core.not(schema_13641);
if(or__4682__auto__){
return or__4682__auto__;
} else {
var and__4670__auto__ = meta_schema_id_13643;
if(cljs.core.truth_(and__4670__auto__)){
return cljs.core.not(meta_schema_13642);
} else {
return and__4670__auto__;
}
}
})())){
return cljs.core.cst$kw$seria_SLASH_invalid;
} else {
var G__13716 = new cljs.core.PersistentArrayMap(null, 3, [cljs.core.cst$kw$schema,schema_13641,cljs.core.cst$kw$diffed_QMARK_,diffed_QMARK__13640,cljs.core.cst$kw$value,(function (){var G__13717 = (cljs.core.truth_(diffed_QMARK__13640)?(function (){var G__13718 = (((schema_13641 instanceof cljs.core.Keyword))?schema_13641.fqn:null);
switch (G__13718) {
case "body":
return unpack_diffed_body_7138;

break;
case "fixture":
return unpack_diffed_fixture_7140;

break;
case "coord":
return unpack_diffed_coord_7139;

break;
case "snapshot":
return unpack_diffed_snapshot_7231;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13641)].join('')));

}
})():(function (){var G__13719 = (((schema_13641 instanceof cljs.core.Keyword))?schema_13641.fqn:null);
switch (G__13719) {
case "body":
return unpack_body_7134;

break;
case "fixture":
return unpack_fixture_7136;

break;
case "coord":
return unpack_coord_7135;

break;
case "snapshot":
return unpack_snapshot_7229;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(schema_13641)].join('')));

}
})()).call(null,buffer_13638);
if(cljs.core.truth_(diffed_QMARK__13640)){
return seria.common.wrap_diffed(G__13717);
} else {
return G__13717;
}
})()], null);
if(cljs.core.truth_(meta_schema_13642)){
return cljs.core.assoc.cljs$core$IFn$_invoke$arity$variadic(G__13716,cljs.core.cst$kw$meta_DASH_schema,meta_schema_13642,cljs.core.array_seq([cljs.core.cst$kw$meta_DASH_value,(function (){var G__13720 = (((meta_schema_13642 instanceof cljs.core.Keyword))?meta_schema_13642.fqn:null);
switch (G__13720) {
case "body":
return unpack_body_7134;

break;
case "fixture":
return unpack_fixture_7136;

break;
case "coord":
return unpack_coord_7135;

break;
case "snapshot":
return unpack_snapshot_7229;

break;
default:
throw (new Error([cljs.core.str("No matching clause: "),cljs.core.str(meta_schema_13642)].join('')));

}
})().call(null,buffer_13638)], 0));
} else {
return G__13716;
}
}
});})(buffer_7253))
;
var unpack_coord_7135 = ((function (buffer_7253){
return (function seria_demo$common$unpack_coord_7135(buffer_13593){
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [seria.buffer.read_float_BANG_(buffer_13593),seria.buffer.read_float_BANG_(buffer_13593)], null);
});})(buffer_7253))
;
var interp_snapshot_7246 = ((function (buffer_7253){
return (function seria_demo$common$interp_snapshot_7246(value_1_13624,value_2_13625,time_1_13626,time_2_13627,time_13628){
var prefer_first_QMARK__13629 = (seria.common.cljc_abs((time_13628 - time_1_13626)) < seria.common.cljc_abs((time_13628 - time_2_13627)));
var time_factor_13630 = ((time_13628 - time_1_13626) / (time_2_13627 - time_1_13626));
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(value_1_13624,value_2_13625)){
return value_1_13624;
} else {
if(prefer_first_QMARK__13629){
return value_1_13624;
} else {
return value_2_13625;
}
}
});})(buffer_7253))
;
var unpack_diffed_body_7138 = ((function (buffer_7253){
return (function seria_demo$common$unpack_diffed_body_7138(buffer_13544){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13544))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return new cljs.core.PersistentArrayMap(null, 5, [cljs.core.cst$kw$angle,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13544))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_float_BANG_(buffer_13544)),cljs.core.cst$kw$body_DASH_type,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13544))?cljs.core.cst$kw$seria_SLASH_dnil:cljs.core.get.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [cljs.core.cst$kw$dynamic,cljs.core.cst$kw$static,cljs.core.cst$kw$kinetic], null),seria.buffer.read_varint_BANG_(buffer_13544))),cljs.core.cst$kw$fixtures,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13544))?cljs.core.cst$kw$seria_SLASH_dnil:cljs.core.doall.cljs$core$IFn$_invoke$arity$1(cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(seria.buffer.read_varint_BANG_(buffer_13544),((function (buffer_7253){
return (function (){
if(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13544))){
return cljs.core.cst$kw$seria_SLASH_dnil;
} else {
return unpack_diffed_fixture_7140(buffer_13544);
}
});})(buffer_7253))
))),cljs.core.cst$kw$position,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13544))?cljs.core.cst$kw$seria_SLASH_dnil:unpack_diffed_coord_7139(buffer_13544)),cljs.core.cst$kw$user_DASH_data,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13544))?cljs.core.cst$kw$seria_SLASH_dnil:new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$id,(cljs.core.truth_(seria.buffer.read_boolean_BANG_(buffer_13544))?cljs.core.cst$kw$seria_SLASH_dnil:seria.buffer.read_int_BANG_(buffer_13544))], null))], null);
}
});})(buffer_7253))
;
var gen_fixture_7149 = ((function (buffer_7253){
return (function seria_demo$common$gen_fixture_7149(){
return new cljs.core.PersistentArrayMap(null, 2, [cljs.core.cst$kw$user_DASH_data,new cljs.core.PersistentArrayMap(null, 1, [cljs.core.cst$kw$color,seria.common.random_integer((4),true)], null),cljs.core.cst$kw$coords,cljs.core.repeatedly.cljs$core$IFn$_invoke$arity$2(((2) + cljs.core.rand_int((4))),((function (buffer_7253){
return (function (){
return gen_coord_7148();
});})(buffer_7253))
)], null);
});})(buffer_7253))
;
var undiff_coord_7205 = ((function (buffer_7253){
return (function seria_demo$common$undiff_coord_7205(value_1_13597,value_2_13598){
var value_2_13598__$1 = seria.common.unwrap_diffed(value_2_13598);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(cljs.core.cst$kw$seria_SLASH_dnil,value_2_13598__$1)){
return value_1_13597;
} else {
return value_2_13598__$1;
}
});})(buffer_7253))
;
return cljs.core.PersistentHashMap.fromArrays([cljs.core.cst$kw$pack,cljs.core.cst$kw$unpack,cljs.core.cst$kw$diff,cljs.core.cst$kw$undiff,cljs.core.cst$kw$gen,cljs.core.cst$kw$interp],[pack_7254,unpack_7262,diff_7266,undiff_7270,gen_7272,interp_7279]);
})();
seria_demo.common.pack = cljs.core.cst$kw$pack.cljs$core$IFn$_invoke$arity$1(processors_13524_13721);

seria_demo.common.gen = cljs.core.cst$kw$gen.cljs$core$IFn$_invoke$arity$1(processors_13524_13721);

seria_demo.common.unpack = cljs.core.cst$kw$unpack.cljs$core$IFn$_invoke$arity$1(processors_13524_13721);
seria_demo.common.make_data = (function seria_demo$common$make_data(){
var G__13779 = cljs.core.cst$kw$snapshot;
var G__13780 = (seria_demo.common.gen.cljs$core$IFn$_invoke$arity$1 ? seria_demo.common.gen.cljs$core$IFn$_invoke$arity$1(cljs.core.cst$kw$snapshot) : seria_demo.common.gen.call(null,cljs.core.cst$kw$snapshot));
return (seria_demo.common.pack.cljs$core$IFn$_invoke$arity$2 ? seria_demo.common.pack.cljs$core$IFn$_invoke$arity$2(G__13779,G__13780) : seria_demo.common.pack.call(null,G__13779,G__13780));
});
