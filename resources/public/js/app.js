if(typeof Math.imul == "undefined" || (Math.imul(0xffffffff,5) == 0)) {
    Math.imul = function (a, b) {
        var ah  = (a >>> 16) & 0xffff;
        var al = a & 0xffff;
        var bh  = (b >>> 16) & 0xffff;
        var bl = b & 0xffff;
        // the shift by 0 fixes the sign on the high part
        // the final |0 converts the unsigned value into a signed value
        return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
    }
}

/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>
 Copyright 2009 The Closure Library Authors. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS-IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license long.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/long.js for details
 */
(function(global, factory) { Long = factory(); })(this, function() {
    "use strict";

    /**
     * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
     *  See the from* functions below for more convenient ways of constructing Longs.
     * @exports Long
     * @class A Long class for representing a 64 bit two's-complement integer value.
     * @param {number} low The low (signed) 32 bits of the long
     * @param {number} high The high (signed) 32 bits of the long
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @constructor
     */
    function Long(low, high, unsigned) {

        /**
         * The low 32 bits as a signed value.
         * @type {number}
         * @expose
         */
        this.low = low | 0;

        /**
         * The high 32 bits as a signed value.
         * @type {number}
         * @expose
         */
        this.high = high | 0;

        /**
         * Whether unsigned or not.
         * @type {boolean}
         * @expose
         */
        this.unsigned = !!unsigned;
    }

    // The internal representation of a long is the two given signed, 32-bit values.
    // We use 32-bit pieces because these are the size of integers on which
    // Javascript performs bit-operations.  For operations like addition and
    // multiplication, we split each number into 16 bit pieces, which can easily be
    // multiplied within Javascript's floating-point representation without overflow
    // or change in sign.
    //
    // In the algorithms below, we frequently reduce the negative case to the
    // positive case by negating the input(s) and then post-processing the result.
    // Note that we must ALWAYS check specially whether those values are MIN_VALUE
    // (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
    // a positive number, it overflows back into a negative).  Not handling this
    // case would often result in infinite recursion.
    //
    // Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
    // methods on which they depend.

    /**
     * An indicator used to reliably determine if an object is a Long or not.
     * @type {boolean}
     * @const
     * @expose
     * @private
     */
    Long.__isLong__;

    Object.defineProperty(Long.prototype, "__isLong__", {
        value: true,
        enumerable: false,
        configurable: false
    });

    /**
     * @function
     * @param {*} obj Object
     * @returns {boolean}
     * @inner
     */
    function isLong(obj) {
        return (obj && obj["__isLong__"]) === true;
    }

    /**
     * Tests if the specified object is a Long.
     * @function
     * @param {*} obj Object
     * @returns {boolean}
     * @expose
     */
    Long.isLong = isLong;

    /**
     * A cache of the Long representations of small integer values.
     * @type {!Object}
     * @inner
     */
    var INT_CACHE = {};

    /**
     * A cache of the Long representations of small unsigned integer values.
     * @type {!Object}
     * @inner
     */
    var UINT_CACHE = {};

    /**
     * @param {number} value
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromInt(value, unsigned) {
        var obj, cachedObj, cache;
        if (unsigned) {
            value >>>= 0;
            if (cache = (0 <= value && value < 256)) {
                cachedObj = UINT_CACHE[value];
                if (cachedObj)
                    return cachedObj;
            }
            obj = fromBits(value, (value | 0) < 0 ? -1 : 0, true);
            if (cache)
                UINT_CACHE[value] = obj;
            return obj;
        } else {
            value |= 0;
            if (cache = (-128 <= value && value < 128)) {
                cachedObj = INT_CACHE[value];
                if (cachedObj)
                    return cachedObj;
            }
            obj = fromBits(value, value < 0 ? -1 : 0, false);
            if (cache)
                INT_CACHE[value] = obj;
            return obj;
        }
    }

    /**
     * Returns a Long representing the given 32 bit integer value.
     * @function
     * @param {number} value The 32 bit integer in question
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     * @expose
     */
    Long.fromInt = fromInt;

    /**
     * @param {number} value
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromNumber(value, unsigned) {
        if (isNaN(value) || !isFinite(value))
            return unsigned ? UZERO : ZERO;
        if (unsigned) {
            if (value < 0)
                return UZERO;
            if (value >= TWO_PWR_64_DBL)
                return MAX_UNSIGNED_VALUE;
        } else {
            if (value <= -TWO_PWR_63_DBL)
                return MIN_VALUE;
            if (value + 1 >= TWO_PWR_63_DBL)
                return MAX_VALUE;
        }
        if (value < 0)
            return fromNumber(-value, unsigned).neg();
        return fromBits((value % TWO_PWR_32_DBL) | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
    }

    /**
     * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
     * @function
     * @param {number} value The number in question
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     * @expose
     */
    Long.fromNumber = fromNumber;

    /**
     * @param {number} lowBits
     * @param {number} highBits
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromBits(lowBits, highBits, unsigned) {
        return new Long(lowBits, highBits, unsigned);
    }

    /**
     * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
     *  assumed to use 32 bits.
     * @function
     * @param {number} lowBits The low 32 bits
     * @param {number} highBits The high 32 bits
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     * @expose
     */
    Long.fromBits = fromBits;

    /**
     * @function
     * @param {number} base
     * @param {number} exponent
     * @returns {number}
     * @inner
     */
    var pow_dbl = Math.pow; // Used 4 times (4*8 to 15+4)

    /**
     * @param {string} str
     * @param {(boolean|number)=} unsigned
     * @param {number=} radix
     * @returns {!Long}
     * @inner
     */
    function fromString(str, unsigned, radix) {
        if (str.length === 0)
            throw Error('empty string');
        if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
            return ZERO;
        if (typeof unsigned === 'number') // For goog.math.long compatibility
            radix = unsigned,
            unsigned = false;
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw RangeError('radix');

        var p;
        if ((p = str.indexOf('-')) > 0)
            throw Error('interior hyphen');
        else if (p === 0) {
            return fromString(str.substring(1), unsigned, radix).neg();
        }

        // Do several (8) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        var radixToPower = fromNumber(pow_dbl(radix, 8));

        var result = ZERO;
        for (var i = 0; i < str.length; i += 8) {
            var size = Math.min(8, str.length - i),
                value = parseInt(str.substring(i, i + size), radix);
            if (size < 8) {
                var power = fromNumber(pow_dbl(radix, size));
                result = result.mul(power).add(fromNumber(value));
            } else {
                result = result.mul(radixToPower);
                result = result.add(fromNumber(value));
            }
        }
        result.unsigned = unsigned;
        return result;
    }

    /**
     * Returns a Long representation of the given string, written using the specified radix.
     * @function
     * @param {string} str The textual representation of the Long
     * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
     * @returns {!Long} The corresponding Long value
     * @expose
     */
    Long.fromString = fromString;

    /**
     * @function
     * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val
     * @returns {!Long}
     * @inner
     */
    function fromValue(val) {
        if (val /* is compatible */ instanceof Long)
            return val;
        if (typeof val === 'number')
            return fromNumber(val);
        if (typeof val === 'string')
            return fromString(val);
        // Throws for non-objects, converts non-instanceof Long:
        return fromBits(val.low, val.high, val.unsigned);
    }

    /**
     * Converts the specified value to a Long.
     * @function
     * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
     * @returns {!Long}
     * @expose
     */
    Long.fromValue = fromValue;

    // NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
    // no runtime penalty for these.

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_16_DBL = 1 << 16;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_24_DBL = 1 << 24;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;

    /**
     * @type {!Long}
     * @const
     * @inner
     */
    var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);

    /**
     * @type {!Long}
     * @inner
     */
    var ZERO = fromInt(0);

    /**
     * Signed zero.
     * @type {!Long}
     * @expose
     */
    Long.ZERO = ZERO;

    /**
     * @type {!Long}
     * @inner
     */
    var UZERO = fromInt(0, true);

    /**
     * Unsigned zero.
     * @type {!Long}
     * @expose
     */
    Long.UZERO = UZERO;

    /**
     * @type {!Long}
     * @inner
     */
    var ONE = fromInt(1);

    /**
     * Signed one.
     * @type {!Long}
     * @expose
     */
    Long.ONE = ONE;

    /**
     * @type {!Long}
     * @inner
     */
    var UONE = fromInt(1, true);

    /**
     * Unsigned one.
     * @type {!Long}
     * @expose
     */
    Long.UONE = UONE;

    /**
     * @type {!Long}
     * @inner
     */
    var NEG_ONE = fromInt(-1);

    /**
     * Signed negative one.
     * @type {!Long}
     * @expose
     */
    Long.NEG_ONE = NEG_ONE;

    /**
     * @type {!Long}
     * @inner
     */
    var MAX_VALUE = fromBits(0xFFFFFFFF|0, 0x7FFFFFFF|0, false);

    /**
     * Maximum signed value.
     * @type {!Long}
     * @expose
     */
    Long.MAX_VALUE = MAX_VALUE;

    /**
     * @type {!Long}
     * @inner
     */
    var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF|0, 0xFFFFFFFF|0, true);

    /**
     * Maximum unsigned value.
     * @type {!Long}
     * @expose
     */
    Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;

    /**
     * @type {!Long}
     * @inner
     */
    var MIN_VALUE = fromBits(0, 0x80000000|0, false);

    /**
     * Minimum signed value.
     * @type {!Long}
     * @expose
     */
    Long.MIN_VALUE = MIN_VALUE;

    /**
     * @alias Long.prototype
     * @inner
     */
    var LongPrototype = Long.prototype;

    /**
     * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
     * @returns {number}
     * @expose
     */
    LongPrototype.toInt = function toInt() {
        return this.unsigned ? this.low >>> 0 : this.low;
    };

    /**
     * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
     * @returns {number}
     * @expose
     */
    LongPrototype.toNumber = function toNumber() {
        if (this.unsigned)
            return ((this.high >>> 0) * TWO_PWR_32_DBL) + (this.low >>> 0);
        return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    };

    /**
     * Converts the Long to a string written in the specified radix.
     * @param {number=} radix Radix (2-36), defaults to 10
     * @returns {string}
     * @override
     * @throws {RangeError} If `radix` is out of range
     * @expose
     */
    LongPrototype.toString = function toString(radix) {
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw RangeError('radix');
        if (this.isZero())
            return '0';
        if (this.isNegative()) { // Unsigned Longs are never negative
            if (this.eq(MIN_VALUE)) {
                // We need to change the Long value before it can be negated, so we remove
                // the bottom-most digit in this base and then recurse to do the rest.
                var radixLong = fromNumber(radix),
                    div = this.div(radixLong),
                    rem1 = div.mul(radixLong).sub(this);
                return div.toString(radix) + rem1.toInt().toString(radix);
            } else
                return '-' + this.neg().toString(radix);
        }

        // Do several (6) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned),
            rem = this;
        var result = '';
        while (true) {
            var remDiv = rem.div(radixToPower),
                intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
                digits = intval.toString(radix);
            rem = remDiv;
            if (rem.isZero())
                return digits + result;
            else {
                while (digits.length < 6)
                    digits = '0' + digits;
                result = '' + digits + result;
            }
        }
    };

    /**
     * Gets the high 32 bits as a signed integer.
     * @returns {number} Signed high bits
     * @expose
     */
    LongPrototype.getHighBits = function getHighBits() {
        return this.high;
    };

    /**
     * Gets the high 32 bits as an unsigned integer.
     * @returns {number} Unsigned high bits
     * @expose
     */
    LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
        return this.high >>> 0;
    };

    /**
     * Gets the low 32 bits as a signed integer.
     * @returns {number} Signed low bits
     * @expose
     */
    LongPrototype.getLowBits = function getLowBits() {
        return this.low;
    };

    /**
     * Gets the low 32 bits as an unsigned integer.
     * @returns {number} Unsigned low bits
     * @expose
     */
    LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
        return this.low >>> 0;
    };

    /**
     * Gets the number of bits needed to represent the absolute value of this Long.
     * @returns {number}
     * @expose
     */
    LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
        if (this.isNegative()) // Unsigned Longs are never negative
            return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
        var val = this.high != 0 ? this.high : this.low;
        for (var bit = 31; bit > 0; bit--)
            if ((val & (1 << bit)) != 0)
                break;
        return this.high != 0 ? bit + 33 : bit + 1;
    };

    /**
     * Tests if this Long's value equals zero.
     * @returns {boolean}
     * @expose
     */
    LongPrototype.isZero = function isZero() {
        return this.high === 0 && this.low === 0;
    };

    /**
     * Tests if this Long's value is negative.
     * @returns {boolean}
     * @expose
     */
    LongPrototype.isNegative = function isNegative() {
        return !this.unsigned && this.high < 0;
    };

    /**
     * Tests if this Long's value is positive.
     * @returns {boolean}
     * @expose
     */
    LongPrototype.isPositive = function isPositive() {
        return this.unsigned || this.high >= 0;
    };

    /**
     * Tests if this Long's value is odd.
     * @returns {boolean}
     * @expose
     */
    LongPrototype.isOdd = function isOdd() {
        return (this.low & 1) === 1;
    };

    /**
     * Tests if this Long's value is even.
     * @returns {boolean}
     * @expose
     */
    LongPrototype.isEven = function isEven() {
        return (this.low & 1) === 0;
    };

    /**
     * Tests if this Long's value equals the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    LongPrototype.equals = function equals(other) {
        if (!isLong(other))
            other = fromValue(other);
        if (this.unsigned !== other.unsigned && (this.high >>> 31) === 1 && (other.high >>> 31) === 1)
            return false;
        return this.high === other.high && this.low === other.low;
    };

    /**
     * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    LongPrototype.eq = LongPrototype.equals;

    /**
     * Tests if this Long's value differs from the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    LongPrototype.notEquals = function notEquals(other) {
        return !this.eq(/* validates */ other);
    };

    /**
     * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    LongPrototype.neq = LongPrototype.notEquals;

    /**
     * Tests if this Long's value is less than the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    LongPrototype.lessThan = function lessThan(other) {
        return this.comp(/* validates */ other) < 0;
    };

    /**
     * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    LongPrototype.lt = LongPrototype.lessThan;

    /**
     * Tests if this Long's value is less than or equal the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
        return this.comp(/* validates */ other) <= 0;
    };

    /**
     * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    LongPrototype.lte = LongPrototype.lessThanOrEqual;

    /**
     * Tests if this Long's value is greater than the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    LongPrototype.greaterThan = function greaterThan(other) {
        return this.comp(/* validates */ other) > 0;
    };

    /**
     * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    LongPrototype.gt = LongPrototype.greaterThan;

    /**
     * Tests if this Long's value is greater than or equal the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
        return this.comp(/* validates */ other) >= 0;
    };

    /**
     * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    LongPrototype.gte = LongPrototype.greaterThanOrEqual;

    /**
     * Compares this Long's value with the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {number} 0 if they are the same, 1 if the this is greater and -1
     *  if the given one is greater
     * @expose
     */
    LongPrototype.compare = function compare(other) {
        if (!isLong(other))
            other = fromValue(other);
        if (this.eq(other))
            return 0;
        var thisNeg = this.isNegative(),
            otherNeg = other.isNegative();
        if (thisNeg && !otherNeg)
            return -1;
        if (!thisNeg && otherNeg)
            return 1;
        // At this point the sign bits are the same
        if (!this.unsigned)
            return this.sub(other).isNegative() ? -1 : 1;
        // Both are positive if at least one is unsigned
        return (other.high >>> 0) > (this.high >>> 0) || (other.high === this.high && (other.low >>> 0) > (this.low >>> 0)) ? -1 : 1;
    };

    /**
     * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {number} 0 if they are the same, 1 if the this is greater and -1
     *  if the given one is greater
     * @expose
     */
    LongPrototype.comp = LongPrototype.compare;

    /**
     * Negates this Long's value.
     * @returns {!Long} Negated Long
     * @expose
     */
    LongPrototype.negate = function negate() {
        if (!this.unsigned && this.eq(MIN_VALUE))
            return MIN_VALUE;
        return this.not().add(ONE);
    };

    /**
     * Negates this Long's value. This is an alias of {@link Long#negate}.
     * @function
     * @returns {!Long} Negated Long
     * @expose
     */
    LongPrototype.neg = LongPrototype.negate;

    /**
     * Returns the sum of this and the specified Long.
     * @param {!Long|number|string} addend Addend
     * @returns {!Long} Sum
     * @expose
     */
    LongPrototype.add = function add(addend) {
        if (!isLong(addend))
            addend = fromValue(addend);

        // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

        var a48 = this.high >>> 16;
        var a32 = this.high & 0xFFFF;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xFFFF;

        var b48 = addend.high >>> 16;
        var b32 = addend.high & 0xFFFF;
        var b16 = addend.low >>> 16;
        var b00 = addend.low & 0xFFFF;

        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16;
        c00 &= 0xFFFF;
        c16 += a16 + b16;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c32 += a32 + b32;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c48 += a48 + b48;
        c48 &= 0xFFFF;
        return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };

    /**
     * Returns the difference of this and the specified Long.
     * @param {!Long|number|string} subtrahend Subtrahend
     * @returns {!Long} Difference
     * @expose
     */
    LongPrototype.subtract = function subtract(subtrahend) {
        if (!isLong(subtrahend))
            subtrahend = fromValue(subtrahend);
        return this.add(subtrahend.neg());
    };

    /**
     * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
     * @function
     * @param {!Long|number|string} subtrahend Subtrahend
     * @returns {!Long} Difference
     * @expose
     */
    LongPrototype.sub = LongPrototype.subtract;

    /**
     * Returns the product of this and the specified Long.
     * @param {!Long|number|string} multiplier Multiplier
     * @returns {!Long} Product
     * @expose
     */
    LongPrototype.multiply = function multiply(multiplier) {
        if (this.isZero())
            return ZERO;
        if (!isLong(multiplier))
            multiplier = fromValue(multiplier);
        if (multiplier.isZero())
            return ZERO;
        if (this.eq(MIN_VALUE))
            return multiplier.isOdd() ? MIN_VALUE : ZERO;
        if (multiplier.eq(MIN_VALUE))
            return this.isOdd() ? MIN_VALUE : ZERO;

        if (this.isNegative()) {
            if (multiplier.isNegative())
                return this.neg().mul(multiplier.neg());
            else
                return this.neg().mul(multiplier).neg();
        } else if (multiplier.isNegative())
            return this.mul(multiplier.neg()).neg();

        // If both longs are small, use float multiplication
        if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
            return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);

        // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
        // We can skip products that would overflow.

        var a48 = this.high >>> 16;
        var a32 = this.high & 0xFFFF;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xFFFF;

        var b48 = multiplier.high >>> 16;
        var b32 = multiplier.high & 0xFFFF;
        var b16 = multiplier.low >>> 16;
        var b00 = multiplier.low & 0xFFFF;

        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 * b00;
        c16 += c00 >>> 16;
        c00 &= 0xFFFF;
        c16 += a16 * b00;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c16 += a00 * b16;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c32 += a32 * b00;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a16 * b16;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a00 * b32;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
        c48 &= 0xFFFF;
        return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };

    /**
     * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
     * @function
     * @param {!Long|number|string} multiplier Multiplier
     * @returns {!Long} Product
     * @expose
     */
    LongPrototype.mul = LongPrototype.multiply;

    /**
     * Returns this Long divided by the specified.
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Quotient
     * @expose
     */
    LongPrototype.divide = function divide(divisor) {
        if (!isLong(divisor))
            divisor = fromValue(divisor);
        if (divisor.isZero())
            throw Error('division by zero');
        if (this.isZero())
            return this.unsigned ? UZERO : ZERO;
        var approx, rem, res;
        if (this.eq(MIN_VALUE)) {
            if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
                return MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
            else if (divisor.eq(MIN_VALUE))
                return ONE;
            else {
                // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
                var halfThis = this.shr(1);
                approx = halfThis.div(divisor).shl(1);
                if (approx.eq(ZERO)) {
                    return divisor.isNegative() ? ONE : NEG_ONE;
                } else {
                    rem = this.sub(divisor.mul(approx));
                    res = approx.add(rem.div(divisor));
                    return res;
                }
            }
        } else if (divisor.eq(MIN_VALUE))
            return this.unsigned ? UZERO : ZERO;
        if (this.isNegative()) {
            if (divisor.isNegative())
                return this.neg().div(divisor.neg());
            return this.neg().div(divisor).neg();
        } else if (divisor.isNegative())
            return this.div(divisor.neg()).neg();

        // Repeat the following until the remainder is less than other:  find a
        // floating-point that approximates remainder / other *from below*, add this
        // into the result, and subtract it from the remainder.  It is critical that
        // the approximate value is less than or equal to the real value so that the
        // remainder never becomes negative.
        res = ZERO;
        rem = this;
        while (rem.gte(divisor)) {
            // Approximate the result of division. This may be a little greater or
            // smaller than the actual value.
            approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));

            // We will tweak the approximate result by changing it in the 48-th digit or
            // the smallest non-fractional digit, whichever is larger.
            var log2 = Math.ceil(Math.log(approx) / Math.LN2),
                delta = (log2 <= 48) ? 1 : pow_dbl(2, log2 - 48),

            // Decrease the approximation until it is smaller than the remainder.  Note
            // that if it is too large, the product overflows and is negative.
                approxRes = fromNumber(approx),
                approxRem = approxRes.mul(divisor);
            while (approxRem.isNegative() || approxRem.gt(rem)) {
                approx -= delta;
                approxRes = fromNumber(approx, this.unsigned);
                approxRem = approxRes.mul(divisor);
            }

            // We know the answer can't be zero... and actually, zero would cause
            // infinite recursion since we would make no progress.
            if (approxRes.isZero())
                approxRes = ONE;

            res = res.add(approxRes);
            rem = rem.sub(approxRem);
        }
        return res;
    };

    /**
     * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
     * @function
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Quotient
     * @expose
     */
    LongPrototype.div = LongPrototype.divide;

    /**
     * Returns this Long modulo the specified.
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Remainder
     * @expose
     */
    LongPrototype.modulo = function modulo(divisor) {
        if (!isLong(divisor))
            divisor = fromValue(divisor);
        return this.sub(this.div(divisor).mul(divisor));
    };

    /**
     * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
     * @function
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Remainder
     * @expose
     */
    LongPrototype.mod = LongPrototype.modulo;

    /**
     * Returns the bitwise NOT of this Long.
     * @returns {!Long}
     * @expose
     */
    LongPrototype.not = function not() {
        return fromBits(~this.low, ~this.high, this.unsigned);
    };

    /**
     * Returns the bitwise AND of this Long and the specified.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     * @expose
     */
    LongPrototype.and = function and(other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
    };

    /**
     * Returns the bitwise OR of this Long and the specified.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     * @expose
     */
    LongPrototype.or = function or(other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
    };

    /**
     * Returns the bitwise XOR of this Long and the given one.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     * @expose
     */
    LongPrototype.xor = function xor(other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    };

    /**
     * Returns this Long with bits shifted to the left by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     * @expose
     */
    LongPrototype.shiftLeft = function shiftLeft(numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return fromBits(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
        else
            return fromBits(0, this.low << (numBits - 32), this.unsigned);
    };

    /**
     * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     * @expose
     */
    LongPrototype.shl = LongPrototype.shiftLeft;

    /**
     * Returns this Long with bits arithmetically shifted to the right by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     * @expose
     */
    LongPrototype.shiftRight = function shiftRight(numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return fromBits((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
        else
            return fromBits(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
    };

    /**
     * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     * @expose
     */
    LongPrototype.shr = LongPrototype.shiftRight;

    /**
     * Returns this Long with bits logically shifted to the right by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     * @expose
     */
    LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        numBits &= 63;
        if (numBits === 0)
            return this;
        else {
            var high = this.high;
            if (numBits < 32) {
                var low = this.low;
                return fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, this.unsigned);
            } else if (numBits === 32)
                return fromBits(high, 0, this.unsigned);
            else
                return fromBits(high >>> (numBits - 32), 0, this.unsigned);
        }
    };

    /**
     * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     * @expose
     */
    LongPrototype.shru = LongPrototype.shiftRightUnsigned;

    /**
     * Converts this Long to signed.
     * @returns {!Long} Signed long
     * @expose
     */
    LongPrototype.toSigned = function toSigned() {
        if (!this.unsigned)
            return this;
        return fromBits(this.low, this.high, false);
    };

    /**
     * Converts this Long to unsigned.
     * @returns {!Long} Unsigned long
     * @expose
     */
    LongPrototype.toUnsigned = function toUnsigned() {
        if (this.unsigned)
            return this;
        return fromBits(this.low, this.high, true);
    };

    return Long;
});

/*
 Copyright 2013-2014 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license bytebuffer.js (c) 2015 Daniel Wirtz <dcode@dcode.io>
 * Backing buffer: ArrayBuffer, Accessor: Uint8Array
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/bytebuffer.js for details
 */
(function(global, factory) { ByteBuffer = factory(Long); })(this, function(Long) {
    "use strict";

    /**
     * Constructs a new ByteBuffer.
     * @class The swiss army knife for binary data in JavaScript.
     * @exports ByteBuffer
     * @constructor
     * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @expose
     */
    var ByteBuffer = function(capacity, littleEndian, noAssert) {
        if (typeof capacity === 'undefined')
            capacity = ByteBuffer.DEFAULT_CAPACITY;
        if (typeof littleEndian === 'undefined')
            littleEndian = ByteBuffer.DEFAULT_ENDIAN;
        if (typeof noAssert === 'undefined')
            noAssert = ByteBuffer.DEFAULT_NOASSERT;
        if (!noAssert) {
            capacity = capacity | 0;
            if (capacity < 0)
                throw RangeError("Illegal capacity");
            littleEndian = !!littleEndian;
            noAssert = !!noAssert;
        }

        /**
         * Backing ArrayBuffer.
         * @type {!ArrayBuffer}
         * @expose
         */
        this.buffer = capacity === 0 ? EMPTY_BUFFER : new ArrayBuffer(capacity);

        /**
         * Uint8Array utilized to manipulate the backing buffer. Becomes `null` if the backing buffer has a capacity of `0`.
         * @type {?Uint8Array}
         * @expose
         */
        this.view = capacity === 0 ? null : new Uint8Array(this.buffer);

        /**
         * Absolute read/write offset.
         * @type {number}
         * @expose
         * @see ByteBuffer#flip
         * @see ByteBuffer#clear
         */
        this.offset = 0;

        /**
         * Marked offset.
         * @type {number}
         * @expose
         * @see ByteBuffer#mark
         * @see ByteBuffer#reset
         */
        this.markedOffset = -1;

        /**
         * Absolute limit of the contained data. Set to the backing buffer's capacity upon allocation.
         * @type {number}
         * @expose
         * @see ByteBuffer#flip
         * @see ByteBuffer#clear
         */
        this.limit = capacity;

        /**
         * Whether to use little endian byte order, defaults to `false` for big endian.
         * @type {boolean}
         * @expose
         */
        this.littleEndian = littleEndian;

        /**
         * Whether to skip assertions of offsets and values, defaults to `false`.
         * @type {boolean}
         * @expose
         */
        this.noAssert = noAssert;
    };

    /**
     * ByteBuffer version.
     * @type {string}
     * @const
     * @expose
     */
    ByteBuffer.VERSION = "5.0.1";

    /**
     * Little endian constant that can be used instead of its boolean value. Evaluates to `true`.
     * @type {boolean}
     * @const
     * @expose
     */
    ByteBuffer.LITTLE_ENDIAN = true;

    /**
     * Big endian constant that can be used instead of its boolean value. Evaluates to `false`.
     * @type {boolean}
     * @const
     * @expose
     */
    ByteBuffer.BIG_ENDIAN = false;

    /**
     * Default initial capacity of `16`.
     * @type {number}
     * @expose
     */
    ByteBuffer.DEFAULT_CAPACITY = 16;

    /**
     * Default endianess of `false` for big endian.
     * @type {boolean}
     * @expose
     */
    ByteBuffer.DEFAULT_ENDIAN = ByteBuffer.BIG_ENDIAN;

    /**
     * Default no assertions flag of `false`.
     * @type {boolean}
     * @expose
     */
    ByteBuffer.DEFAULT_NOASSERT = false;

    /**
     * A `Long` class for representing a 64-bit two's-complement integer value. May be `null` if Long.js has not been loaded
     *  and int64 support is not available.
     * @type {?Long}
     * @const
     * @see https://github.com/dcodeIO/long.js
     * @expose
     */
    ByteBuffer.Long = Long || null;

    /**
     * @alias ByteBuffer.prototype
     * @inner
     */
    var ByteBufferPrototype = ByteBuffer.prototype;

    /**
     * An indicator used to reliably determine if an object is a ByteBuffer or not.
     * @type {boolean}
     * @const
     * @expose
     * @private
     */
    ByteBufferPrototype.__isByteBuffer__;

    Object.defineProperty(ByteBufferPrototype, "__isByteBuffer__", {
        value: true,
        enumerable: false,
        configurable: false
    });

    // helpers

    /**
     * @type {!ArrayBuffer}
     * @inner
     */
    var EMPTY_BUFFER = new ArrayBuffer(0);

    /**
     * String.fromCharCode reference for compile-time renaming.
     * @type {function(...number):string}
     * @inner
     */
    var stringFromCharCode = String.fromCharCode;

    /**
     * Creates a source function for a string.
     * @param {string} s String to read from
     * @returns {function():number|null} Source function returning the next char code respectively `null` if there are
     *  no more characters left.
     * @throws {TypeError} If the argument is invalid
     * @inner
     */
    function stringSource(s) {
        var i=0; return function() {
            return i < s.length ? s.charCodeAt(i++) : null;
        };
    }

    /**
     * Creates a destination function for a string.
     * @returns {function(number=):undefined|string} Destination function successively called with the next char code.
     *  Returns the final string when called without arguments.
     * @inner
     */
    function stringDestination() {
        var cs = [], ps = []; return function() {
            if (arguments.length === 0)
                return ps.join('')+stringFromCharCode.apply(String, cs);
            if (cs.length + arguments.length > 1024)
                ps.push(stringFromCharCode.apply(String, cs)),
                    cs.length = 0;
            Array.prototype.push.apply(cs, arguments);
        };
    }

    /**
     * Gets the accessor type.
     * @returns {Function} `Buffer` under node.js, `Uint8Array` respectively `DataView` in the browser (classes)
     * @expose
     */
    ByteBuffer.accessor = function() {
        return Uint8Array;
    };
    /**
     * Allocates a new ByteBuffer backed by a buffer of the specified capacity.
     * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer}
     * @expose
     */
    ByteBuffer.allocate = function(capacity, littleEndian, noAssert) {
        return new ByteBuffer(capacity, littleEndian, noAssert);
    };

    /**
     * Concatenates multiple ByteBuffers into one.
     * @param {!Array.<!ByteBuffer|!ArrayBuffer|!Uint8Array|string>} buffers Buffers to concatenate
     * @param {(string|boolean)=} encoding String encoding if `buffers` contains a string ("base64", "hex", "binary",
     *  defaults to "utf8")
     * @param {boolean=} littleEndian Whether to use little or big endian byte order for the resulting ByteBuffer. Defaults
     *  to {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values for the resulting ByteBuffer. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} Concatenated ByteBuffer
     * @expose
     */
    ByteBuffer.concat = function(buffers, encoding, littleEndian, noAssert) {
        if (typeof encoding === 'boolean' || typeof encoding !== 'string') {
            noAssert = littleEndian;
            littleEndian = encoding;
            encoding = undefined;
        }
        var capacity = 0;
        for (var i=0, k=buffers.length, length; i<k; ++i) {
            if (!ByteBuffer.isByteBuffer(buffers[i]))
                buffers[i] = ByteBuffer.wrap(buffers[i], encoding);
            length = buffers[i].limit - buffers[i].offset;
            if (length > 0) capacity += length;
        }
        if (capacity === 0)
            return new ByteBuffer(0, littleEndian, noAssert);
        var bb = new ByteBuffer(capacity, littleEndian, noAssert),
            bi;
        i=0; while (i<k) {
            bi = buffers[i++];
            length = bi.limit - bi.offset;
            if (length <= 0) continue;
            bb.view.set(bi.view.subarray(bi.offset, bi.limit), bb.offset);
            bb.offset += length;
        }
        bb.limit = bb.offset;
        bb.offset = 0;
        return bb;
    };

    /**
     * Tests if the specified type is a ByteBuffer.
     * @param {*} bb ByteBuffer to test
     * @returns {boolean} `true` if it is a ByteBuffer, otherwise `false`
     * @expose
     */
    ByteBuffer.isByteBuffer = function(bb) {
        return (bb && bb["__isByteBuffer__"]) === true;
    };
    /**
     * Gets the backing buffer type.
     * @returns {Function} `Buffer` under node.js, `ArrayBuffer` in the browser (classes)
     * @expose
     */
    ByteBuffer.type = function() {
        return ArrayBuffer;
    };
    /**
     * Wraps a buffer or a string. Sets the allocated ByteBuffer's {@link ByteBuffer#offset} to `0` and its
     *  {@link ByteBuffer#limit} to the length of the wrapped data.
     * @param {!ByteBuffer|!ArrayBuffer|!Uint8Array|string|!Array.<number>} buffer Anything that can be wrapped
     * @param {(string|boolean)=} encoding String encoding if `buffer` is a string ("base64", "hex", "binary", defaults to
     *  "utf8")
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} A ByteBuffer wrapping `buffer`
     * @expose
     */
    ByteBuffer.wrap = function(buffer, encoding, littleEndian, noAssert) {
        if (typeof encoding !== 'string') {
            noAssert = littleEndian;
            littleEndian = encoding;
            encoding = undefined;
        }
        if (typeof buffer === 'string') {
            if (typeof encoding === 'undefined')
                encoding = "utf8";
            switch (encoding) {
                case "base64":
                    return ByteBuffer.fromBase64(buffer, littleEndian);
                case "hex":
                    return ByteBuffer.fromHex(buffer, littleEndian);
                case "binary":
                    return ByteBuffer.fromBinary(buffer, littleEndian);
                case "utf8":
                    return ByteBuffer.fromUTF8(buffer, littleEndian);
                case "debug":
                    return ByteBuffer.fromDebug(buffer, littleEndian);
                default:
                    throw Error("Unsupported encoding: "+encoding);
            }
        }
        if (buffer === null || typeof buffer !== 'object')
            throw TypeError("Illegal buffer");
        var bb;
        if (ByteBuffer.isByteBuffer(buffer)) {
            bb = ByteBufferPrototype.clone.call(buffer);
            bb.markedOffset = -1;
            return bb;
        }
        if (buffer instanceof Uint8Array) { // Extract ArrayBuffer from Uint8Array
            bb = new ByteBuffer(0, littleEndian, noAssert);
            if (buffer.length > 0) { // Avoid references to more than one EMPTY_BUFFER
                bb.buffer = buffer.buffer;
                bb.offset = buffer.byteOffset;
                bb.limit = buffer.byteOffset + buffer.byteLength;
                bb.view = new Uint8Array(buffer.buffer);
            }
        } else if (buffer instanceof ArrayBuffer) { // Reuse ArrayBuffer
            bb = new ByteBuffer(0, littleEndian, noAssert);
            if (buffer.byteLength > 0) {
                bb.buffer = buffer;
                bb.offset = 0;
                bb.limit = buffer.byteLength;
                bb.view = buffer.byteLength > 0 ? new Uint8Array(buffer) : null;
            }
        } else if (Object.prototype.toString.call(buffer) === "[object Array]") { // Create from octets
            bb = new ByteBuffer(buffer.length, littleEndian, noAssert);
            bb.limit = buffer.length;
            for (var i=0; i<buffer.length; ++i)
                bb.view[i] = buffer[i];
        } else
            throw TypeError("Illegal buffer"); // Otherwise fail
        return bb;
    };

    /**
     * Writes the array as a bitset.
     * @param {Array<boolean>} value Array of booleans to write
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
     * @returns {!ByteBuffer}
     * @expose
     */
    ByteBufferPrototype.writeBitSet = function(value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;
      if (!this.noAssert) {
        if (!(value instanceof Array))
          throw TypeError("Illegal BitSet: Not an array");
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: "+offset+" (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
      }

      var start = offset,
          bits = value.length,
          bytes = (bits >> 3),
          bit = 0,
          k;

      offset += this.writeVarint32(bits,offset);

      while(bytes--) {
        k = (!!value[bit++] & 1) |
            ((!!value[bit++] & 1) << 1) |
            ((!!value[bit++] & 1) << 2) |
            ((!!value[bit++] & 1) << 3) |
            ((!!value[bit++] & 1) << 4) |
            ((!!value[bit++] & 1) << 5) |
            ((!!value[bit++] & 1) << 6) |
            ((!!value[bit++] & 1) << 7);
        this.writeByte(k,offset++);
      }

      if(bit < bits) {
        var m = 0; k = 0;
        while(bit < bits) k = k | ((!!value[bit++] & 1) << (m++));
        this.writeByte(k,offset++);
      }

      if (relative) {
        this.offset = offset;
        return this;
      }
      return offset - start;
    }

    /**
     * Reads a BitSet as an array of booleans.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
     * @returns {Array<boolean>
     * @expose
     */
    ByteBufferPrototype.readBitSet = function(offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      var ret = this.readVarint32(offset),
          bits = ret.value,
          bytes = (bits >> 3),
          bit = 0,
          value = [],
          k;

      offset += ret.length;

      while(bytes--) {
        k = this.readByte(offset++);
        value[bit++] = !!(k & 0x01);
        value[bit++] = !!(k & 0x02);
        value[bit++] = !!(k & 0x04);
        value[bit++] = !!(k & 0x08);
        value[bit++] = !!(k & 0x10);
        value[bit++] = !!(k & 0x20);
        value[bit++] = !!(k & 0x40);
        value[bit++] = !!(k & 0x80);
      }

      if(bit < bits) {
        var m = 0;
        k = this.readByte(offset++);
        while(bit < bits) value[bit++] = !!((k >> (m++)) & 1);
      }

      if (relative) {
        this.offset = offset;
      }
      return value;
    }
    /**
     * Reads the specified number of bytes.
     * @param {number} length Number of bytes to read
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
     * @returns {!ByteBuffer}
     * @expose
     */
    ByteBufferPrototype.readBytes = function(length, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + length > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+length+") <= "+this.buffer.byteLength);
        }
        var slice = this.slice(offset, offset + length);
        if (relative) this.offset += length;
        return slice;
    };

    /**
     * Writes a payload of bytes. This is an alias of {@link ByteBuffer#append}.
     * @function
     * @param {!ByteBuffer|!ArrayBuffer|!Uint8Array|string} source Data to write. If `source` is a ByteBuffer, its offsets
     *  will be modified according to the performed read operation.
     * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeBytes = ByteBufferPrototype.append;

    // types/ints/int8

    /**
     * Writes an 8bit signed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeInt8 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value |= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        offset += 1;
        var capacity0 = this.buffer.byteLength;
        if (offset > capacity0)
            this.resize((capacity0 *= 2) > offset ? capacity0 : offset);
        offset -= 1;
        this.view[offset] = value;
        if (relative) this.offset += 1;
        return this;
    };

    /**
     * Writes an 8bit signed integer. This is an alias of {@link ByteBuffer#writeInt8}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeByte = ByteBufferPrototype.writeInt8;

    /**
     * Reads an 8bit signed integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readInt8 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 1 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+1+") <= "+this.buffer.byteLength);
        }
        var value = this.view[offset];
        if ((value & 0x80) === 0x80) value = -(0xFF - value + 1); // Cast to signed
        if (relative) this.offset += 1;
        return value;
    };

    /**
     * Reads an 8bit signed integer. This is an alias of {@link ByteBuffer#readInt8}.
     * @function
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readByte = ByteBufferPrototype.readInt8;

    /**
     * Writes an 8bit unsigned integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeUint8 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value >>>= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        offset += 1;
        var capacity1 = this.buffer.byteLength;
        if (offset > capacity1)
            this.resize((capacity1 *= 2) > offset ? capacity1 : offset);
        offset -= 1;
        this.view[offset] = value;
        if (relative) this.offset += 1;
        return this;
    };

    /**
     * Writes an 8bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint8}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeUInt8 = ByteBufferPrototype.writeUint8;

    /**
     * Reads an 8bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readUint8 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 1 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+1+") <= "+this.buffer.byteLength);
        }
        var value = this.view[offset];
        if (relative) this.offset += 1;
        return value;
    };

    /**
     * Reads an 8bit unsigned integer. This is an alias of {@link ByteBuffer#readUint8}.
     * @function
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readUInt8 = ByteBufferPrototype.readUint8;

    // types/ints/int16

    /**
     * Writes a 16bit signed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @throws {TypeError} If `offset` or `value` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.writeInt16 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value |= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        offset += 2;
        var capacity2 = this.buffer.byteLength;
        if (offset > capacity2)
            this.resize((capacity2 *= 2) > offset ? capacity2 : offset);
        offset -= 2;
        if (this.littleEndian) {
            this.view[offset+1] = (value & 0xFF00) >>> 8;
            this.view[offset  ] =  value & 0x00FF;
        } else {
            this.view[offset]   = (value & 0xFF00) >>> 8;
            this.view[offset+1] =  value & 0x00FF;
        }
        if (relative) this.offset += 2;
        return this;
    };

    /**
     * Writes a 16bit signed integer. This is an alias of {@link ByteBuffer#writeInt16}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @throws {TypeError} If `offset` or `value` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.writeShort = ByteBufferPrototype.writeInt16;

    /**
     * Reads a 16bit signed integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @returns {number} Value read
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.readInt16 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 2 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+2+") <= "+this.buffer.byteLength);
        }
        var value = 0;
        if (this.littleEndian) {
            value  = this.view[offset  ];
            value |= this.view[offset+1] << 8;
        } else {
            value  = this.view[offset  ] << 8;
            value |= this.view[offset+1];
        }
        if ((value & 0x8000) === 0x8000) value = -(0xFFFF - value + 1); // Cast to signed
        if (relative) this.offset += 2;
        return value;
    };

    /**
     * Reads a 16bit signed integer. This is an alias of {@link ByteBuffer#readInt16}.
     * @function
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @returns {number} Value read
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.readShort = ByteBufferPrototype.readInt16;

    /**
     * Writes a 16bit unsigned integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @throws {TypeError} If `offset` or `value` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.writeUint16 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value >>>= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        offset += 2;
        var capacity3 = this.buffer.byteLength;
        if (offset > capacity3)
            this.resize((capacity3 *= 2) > offset ? capacity3 : offset);
        offset -= 2;
        if (this.littleEndian) {
            this.view[offset+1] = (value & 0xFF00) >>> 8;
            this.view[offset  ] =  value & 0x00FF;
        } else {
            this.view[offset]   = (value & 0xFF00) >>> 8;
            this.view[offset+1] =  value & 0x00FF;
        }
        if (relative) this.offset += 2;
        return this;
    };

    /**
     * Writes a 16bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint16}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @throws {TypeError} If `offset` or `value` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.writeUInt16 = ByteBufferPrototype.writeUint16;

    /**
     * Reads a 16bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @returns {number} Value read
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.readUint16 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 2 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+2+") <= "+this.buffer.byteLength);
        }
        var value = 0;
        if (this.littleEndian) {
            value  = this.view[offset  ];
            value |= this.view[offset+1] << 8;
        } else {
            value  = this.view[offset  ] << 8;
            value |= this.view[offset+1];
        }
        if (relative) this.offset += 2;
        return value;
    };

    /**
     * Reads a 16bit unsigned integer. This is an alias of {@link ByteBuffer#readUint16}.
     * @function
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @returns {number} Value read
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.readUInt16 = ByteBufferPrototype.readUint16;

    // types/ints/int32

    /**
     * Writes a 32bit signed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @expose
     */
    ByteBufferPrototype.writeInt32 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value |= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        offset += 4;
        var capacity4 = this.buffer.byteLength;
        if (offset > capacity4)
            this.resize((capacity4 *= 2) > offset ? capacity4 : offset);
        offset -= 4;
        if (this.littleEndian) {
            this.view[offset+3] = (value >>> 24) & 0xFF;
            this.view[offset+2] = (value >>> 16) & 0xFF;
            this.view[offset+1] = (value >>>  8) & 0xFF;
            this.view[offset  ] =  value         & 0xFF;
        } else {
            this.view[offset  ] = (value >>> 24) & 0xFF;
            this.view[offset+1] = (value >>> 16) & 0xFF;
            this.view[offset+2] = (value >>>  8) & 0xFF;
            this.view[offset+3] =  value         & 0xFF;
        }
        if (relative) this.offset += 4;
        return this;
    };

    /**
     * Writes a 32bit signed integer. This is an alias of {@link ByteBuffer#writeInt32}.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @expose
     */
    ByteBufferPrototype.writeInt = ByteBufferPrototype.writeInt32;

    /**
     * Reads a 32bit signed integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readInt32 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 4 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+4+") <= "+this.buffer.byteLength);
        }
        var value = 0;
        if (this.littleEndian) {
            value  = this.view[offset+2] << 16;
            value |= this.view[offset+1] <<  8;
            value |= this.view[offset  ];
            value += this.view[offset+3] << 24 >>> 0;
        } else {
            value  = this.view[offset+1] << 16;
            value |= this.view[offset+2] <<  8;
            value |= this.view[offset+3];
            value += this.view[offset  ] << 24 >>> 0;
        }
        value |= 0; // Cast to signed
        if (relative) this.offset += 4;
        return value;
    };

    /**
     * Reads a 32bit signed integer. This is an alias of {@link ByteBuffer#readInt32}.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readInt = ByteBufferPrototype.readInt32;

    /**
     * Writes a 32bit unsigned integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @expose
     */
    ByteBufferPrototype.writeUint32 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value >>>= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        offset += 4;
        var capacity5 = this.buffer.byteLength;
        if (offset > capacity5)
            this.resize((capacity5 *= 2) > offset ? capacity5 : offset);
        offset -= 4;
        if (this.littleEndian) {
            this.view[offset+3] = (value >>> 24) & 0xFF;
            this.view[offset+2] = (value >>> 16) & 0xFF;
            this.view[offset+1] = (value >>>  8) & 0xFF;
            this.view[offset  ] =  value         & 0xFF;
        } else {
            this.view[offset  ] = (value >>> 24) & 0xFF;
            this.view[offset+1] = (value >>> 16) & 0xFF;
            this.view[offset+2] = (value >>>  8) & 0xFF;
            this.view[offset+3] =  value         & 0xFF;
        }
        if (relative) this.offset += 4;
        return this;
    };

    /**
     * Writes a 32bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint32}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @expose
     */
    ByteBufferPrototype.writeUInt32 = ByteBufferPrototype.writeUint32;

    /**
     * Reads a 32bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readUint32 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 4 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+4+") <= "+this.buffer.byteLength);
        }
        var value = 0;
        if (this.littleEndian) {
            value  = this.view[offset+2] << 16;
            value |= this.view[offset+1] <<  8;
            value |= this.view[offset  ];
            value += this.view[offset+3] << 24 >>> 0;
        } else {
            value  = this.view[offset+1] << 16;
            value |= this.view[offset+2] <<  8;
            value |= this.view[offset+3];
            value += this.view[offset  ] << 24 >>> 0;
        }
        if (relative) this.offset += 4;
        return value;
    };

    /**
     * Reads a 32bit unsigned integer. This is an alias of {@link ByteBuffer#readUint32}.
     * @function
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readUInt32 = ByteBufferPrototype.readUint32;

    // types/ints/int64

    if (Long) {

        /**
         * Writes a 64bit signed integer.
         * @param {number|!Long} value Value to write
         * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!ByteBuffer} this
         * @expose
         */
        ByteBufferPrototype.writeInt64 = function(value, offset) {
            var relative = typeof offset === 'undefined';
            if (relative) offset = this.offset;
            if (!this.noAssert) {
                if (typeof value === 'number')
                    value = Long.fromNumber(value);
                else if (typeof value === 'string')
                    value = Long.fromString(value);
                else if (!(value && value instanceof Long))
                    throw TypeError("Illegal value: "+value+" (not an integer or Long)");
                if (typeof offset !== 'number' || offset % 1 !== 0)
                    throw TypeError("Illegal offset: "+offset+" (not an integer)");
                offset >>>= 0;
                if (offset < 0 || offset + 0 > this.buffer.byteLength)
                    throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
            }
            if (typeof value === 'number')
                value = Long.fromNumber(value);
            else if (typeof value === 'string')
                value = Long.fromString(value);
            offset += 8;
            var capacity6 = this.buffer.byteLength;
            if (offset > capacity6)
                this.resize((capacity6 *= 2) > offset ? capacity6 : offset);
            offset -= 8;
            var lo = value.low,
                hi = value.high;
            if (this.littleEndian) {
                this.view[offset+3] = (lo >>> 24) & 0xFF;
                this.view[offset+2] = (lo >>> 16) & 0xFF;
                this.view[offset+1] = (lo >>>  8) & 0xFF;
                this.view[offset  ] =  lo         & 0xFF;
                offset += 4;
                this.view[offset+3] = (hi >>> 24) & 0xFF;
                this.view[offset+2] = (hi >>> 16) & 0xFF;
                this.view[offset+1] = (hi >>>  8) & 0xFF;
                this.view[offset  ] =  hi         & 0xFF;
            } else {
                this.view[offset  ] = (hi >>> 24) & 0xFF;
                this.view[offset+1] = (hi >>> 16) & 0xFF;
                this.view[offset+2] = (hi >>>  8) & 0xFF;
                this.view[offset+3] =  hi         & 0xFF;
                offset += 4;
                this.view[offset  ] = (lo >>> 24) & 0xFF;
                this.view[offset+1] = (lo >>> 16) & 0xFF;
                this.view[offset+2] = (lo >>>  8) & 0xFF;
                this.view[offset+3] =  lo         & 0xFF;
            }
            if (relative) this.offset += 8;
            return this;
        };

        /**
         * Writes a 64bit signed integer. This is an alias of {@link ByteBuffer#writeInt64}.
         * @param {number|!Long} value Value to write
         * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!ByteBuffer} this
         * @expose
         */
        ByteBufferPrototype.writeLong = ByteBufferPrototype.writeInt64;

        /**
         * Reads a 64bit signed integer.
         * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!Long}
         * @expose
         */
        ByteBufferPrototype.readInt64 = function(offset) {
            var relative = typeof offset === 'undefined';
            if (relative) offset = this.offset;
            if (!this.noAssert) {
                if (typeof offset !== 'number' || offset % 1 !== 0)
                    throw TypeError("Illegal offset: "+offset+" (not an integer)");
                offset >>>= 0;
                if (offset < 0 || offset + 8 > this.buffer.byteLength)
                    throw RangeError("Illegal offset: 0 <= "+offset+" (+"+8+") <= "+this.buffer.byteLength);
            }
            var lo = 0,
                hi = 0;
            if (this.littleEndian) {
                lo  = this.view[offset+2] << 16;
                lo |= this.view[offset+1] <<  8;
                lo |= this.view[offset  ];
                lo += this.view[offset+3] << 24 >>> 0;
                offset += 4;
                hi  = this.view[offset+2] << 16;
                hi |= this.view[offset+1] <<  8;
                hi |= this.view[offset  ];
                hi += this.view[offset+3] << 24 >>> 0;
            } else {
                hi  = this.view[offset+1] << 16;
                hi |= this.view[offset+2] <<  8;
                hi |= this.view[offset+3];
                hi += this.view[offset  ] << 24 >>> 0;
                offset += 4;
                lo  = this.view[offset+1] << 16;
                lo |= this.view[offset+2] <<  8;
                lo |= this.view[offset+3];
                lo += this.view[offset  ] << 24 >>> 0;
            }
            var value = new Long(lo, hi, false);
            if (relative) this.offset += 8;
            return value;
        };

        /**
         * Reads a 64bit signed integer. This is an alias of {@link ByteBuffer#readInt64}.
         * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!Long}
         * @expose
         */
        ByteBufferPrototype.readLong = ByteBufferPrototype.readInt64;

        /**
         * Writes a 64bit unsigned integer.
         * @param {number|!Long} value Value to write
         * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!ByteBuffer} this
         * @expose
         */
        ByteBufferPrototype.writeUint64 = function(value, offset) {
            var relative = typeof offset === 'undefined';
            if (relative) offset = this.offset;
            if (!this.noAssert) {
                if (typeof value === 'number')
                    value = Long.fromNumber(value);
                else if (typeof value === 'string')
                    value = Long.fromString(value);
                else if (!(value && value instanceof Long))
                    throw TypeError("Illegal value: "+value+" (not an integer or Long)");
                if (typeof offset !== 'number' || offset % 1 !== 0)
                    throw TypeError("Illegal offset: "+offset+" (not an integer)");
                offset >>>= 0;
                if (offset < 0 || offset + 0 > this.buffer.byteLength)
                    throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
            }
            if (typeof value === 'number')
                value = Long.fromNumber(value);
            else if (typeof value === 'string')
                value = Long.fromString(value);
            offset += 8;
            var capacity7 = this.buffer.byteLength;
            if (offset > capacity7)
                this.resize((capacity7 *= 2) > offset ? capacity7 : offset);
            offset -= 8;
            var lo = value.low,
                hi = value.high;
            if (this.littleEndian) {
                this.view[offset+3] = (lo >>> 24) & 0xFF;
                this.view[offset+2] = (lo >>> 16) & 0xFF;
                this.view[offset+1] = (lo >>>  8) & 0xFF;
                this.view[offset  ] =  lo         & 0xFF;
                offset += 4;
                this.view[offset+3] = (hi >>> 24) & 0xFF;
                this.view[offset+2] = (hi >>> 16) & 0xFF;
                this.view[offset+1] = (hi >>>  8) & 0xFF;
                this.view[offset  ] =  hi         & 0xFF;
            } else {
                this.view[offset  ] = (hi >>> 24) & 0xFF;
                this.view[offset+1] = (hi >>> 16) & 0xFF;
                this.view[offset+2] = (hi >>>  8) & 0xFF;
                this.view[offset+3] =  hi         & 0xFF;
                offset += 4;
                this.view[offset  ] = (lo >>> 24) & 0xFF;
                this.view[offset+1] = (lo >>> 16) & 0xFF;
                this.view[offset+2] = (lo >>>  8) & 0xFF;
                this.view[offset+3] =  lo         & 0xFF;
            }
            if (relative) this.offset += 8;
            return this;
        };

        /**
         * Writes a 64bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint64}.
         * @function
         * @param {number|!Long} value Value to write
         * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!ByteBuffer} this
         * @expose
         */
        ByteBufferPrototype.writeUInt64 = ByteBufferPrototype.writeUint64;

        /**
         * Reads a 64bit unsigned integer.
         * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!Long}
         * @expose
         */
        ByteBufferPrototype.readUint64 = function(offset) {
            var relative = typeof offset === 'undefined';
            if (relative) offset = this.offset;
            if (!this.noAssert) {
                if (typeof offset !== 'number' || offset % 1 !== 0)
                    throw TypeError("Illegal offset: "+offset+" (not an integer)");
                offset >>>= 0;
                if (offset < 0 || offset + 8 > this.buffer.byteLength)
                    throw RangeError("Illegal offset: 0 <= "+offset+" (+"+8+") <= "+this.buffer.byteLength);
            }
            var lo = 0,
                hi = 0;
            if (this.littleEndian) {
                lo  = this.view[offset+2] << 16;
                lo |= this.view[offset+1] <<  8;
                lo |= this.view[offset  ];
                lo += this.view[offset+3] << 24 >>> 0;
                offset += 4;
                hi  = this.view[offset+2] << 16;
                hi |= this.view[offset+1] <<  8;
                hi |= this.view[offset  ];
                hi += this.view[offset+3] << 24 >>> 0;
            } else {
                hi  = this.view[offset+1] << 16;
                hi |= this.view[offset+2] <<  8;
                hi |= this.view[offset+3];
                hi += this.view[offset  ] << 24 >>> 0;
                offset += 4;
                lo  = this.view[offset+1] << 16;
                lo |= this.view[offset+2] <<  8;
                lo |= this.view[offset+3];
                lo += this.view[offset  ] << 24 >>> 0;
            }
            var value = new Long(lo, hi, true);
            if (relative) this.offset += 8;
            return value;
        };

        /**
         * Reads a 64bit unsigned integer. This is an alias of {@link ByteBuffer#readUint64}.
         * @function
         * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!Long}
         * @expose
         */
        ByteBufferPrototype.readUInt64 = ByteBufferPrototype.readUint64;

    } // Long


    // types/floats/float32

    /*
     ieee754 - https://github.com/feross/ieee754

     The MIT License (MIT)

     Copyright (c) Feross Aboukhadijeh

     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"), to deal
     in the Software without restriction, including without limitation the rights
     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the Software is
     furnished to do so, subject to the following conditions:

     The above copyright notice and this permission notice shall be included in
     all copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     THE SOFTWARE.
    */

    /**
     * Reads an IEEE754 float from a byte array.
     * @param {!Array} buffer
     * @param {number} offset
     * @param {boolean} isLE
     * @param {number} mLen
     * @param {number} nBytes
     * @returns {number}
     * @inner
     */
    function ieee754_read(buffer, offset, isLE, mLen, nBytes) {
        var e, m,
            eLen = nBytes * 8 - mLen - 1,
            eMax = (1 << eLen) - 1,
            eBias = eMax >> 1,
            nBits = -7,
            i = isLE ? (nBytes - 1) : 0,
            d = isLE ? -1 : 1,
            s = buffer[offset + i];

        i += d;

        e = s & ((1 << (-nBits)) - 1);
        s >>= (-nBits);
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

        m = e & ((1 << (-nBits)) - 1);
        e >>= (-nBits);
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

        if (e === 0) {
            e = 1 - eBias;
        } else if (e === eMax) {
            return m ? NaN : ((s ? -1 : 1) * Infinity);
        } else {
            m = m + Math.pow(2, mLen);
            e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    }

    /**
     * Writes an IEEE754 float to a byte array.
     * @param {!Array} buffer
     * @param {number} value
     * @param {number} offset
     * @param {boolean} isLE
     * @param {number} mLen
     * @param {number} nBytes
     * @inner
     */
    function ieee754_write(buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c,
            eLen = nBytes * 8 - mLen - 1,
            eMax = (1 << eLen) - 1,
            eBias = eMax >> 1,
            rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
            i = isLE ? 0 : (nBytes - 1),
            d = isLE ? 1 : -1,
            s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

        value = Math.abs(value);

        if (isNaN(value) || value === Infinity) {
            m = isNaN(value) ? 1 : 0;
            e = eMax;
        } else {
            e = Math.floor(Math.log(value) / Math.LN2);
            if (value * (c = Math.pow(2, -e)) < 1) {
                e--;
                c *= 2;
            }
            if (e + eBias >= 1) {
                value += rt / c;
            } else {
                value += rt * Math.pow(2, 1 - eBias);
            }
            if (value * c >= 2) {
                e++;
                c /= 2;
            }

            if (e + eBias >= eMax) {
                m = 0;
                e = eMax;
            } else if (e + eBias >= 1) {
                m = (value * c - 1) * Math.pow(2, mLen);
                e = e + eBias;
            } else {
                m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                e = 0;
            }
        }

        for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

        e = (e << mLen) | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

        buffer[offset + i - d] |= s * 128;
    }

    /**
     * Writes a 32bit float.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeFloat32 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number')
                throw TypeError("Illegal value: "+value+" (not a number)");
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        offset += 4;
        var capacity8 = this.buffer.byteLength;
        if (offset > capacity8)
            this.resize((capacity8 *= 2) > offset ? capacity8 : offset);
        offset -= 4;
        ieee754_write(this.view, value, offset, this.littleEndian, 23, 4);
        if (relative) this.offset += 4;
        return this;
    };

    /**
     * Writes a 32bit float. This is an alias of {@link ByteBuffer#writeFloat32}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeFloat = ByteBufferPrototype.writeFloat32;

    /**
     * Reads a 32bit float.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number}
     * @expose
     */
    ByteBufferPrototype.readFloat32 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 4 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+4+") <= "+this.buffer.byteLength);
        }
        var value = ieee754_read(this.view, offset, this.littleEndian, 23, 4);
        if (relative) this.offset += 4;
        return value;
    };

    /**
     * Reads a 32bit float. This is an alias of {@link ByteBuffer#readFloat32}.
     * @function
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number}
     * @expose
     */
    ByteBufferPrototype.readFloat = ByteBufferPrototype.readFloat32;

    // types/floats/float64

    /**
     * Writes a 64bit float.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeFloat64 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number')
                throw TypeError("Illegal value: "+value+" (not a number)");
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        offset += 8;
        var capacity9 = this.buffer.byteLength;
        if (offset > capacity9)
            this.resize((capacity9 *= 2) > offset ? capacity9 : offset);
        offset -= 8;
        ieee754_write(this.view, value, offset, this.littleEndian, 52, 8);
        if (relative) this.offset += 8;
        return this;
    };

    /**
     * Writes a 64bit float. This is an alias of {@link ByteBuffer#writeFloat64}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeDouble = ByteBufferPrototype.writeFloat64;

    /**
     * Reads a 64bit float.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {number}
     * @expose
     */
    ByteBufferPrototype.readFloat64 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 8 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+8+") <= "+this.buffer.byteLength);
        }
        var value = ieee754_read(this.view, offset, this.littleEndian, 52, 8);
        if (relative) this.offset += 8;
        return value;
    };

    /**
     * Reads a 64bit float. This is an alias of {@link ByteBuffer#readFloat64}.
     * @function
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {number}
     * @expose
     */
    ByteBufferPrototype.readDouble = ByteBufferPrototype.readFloat64;


    // types/varints/varint32

    /**
     * Maximum number of bytes required to store a 32bit base 128 variable-length integer.
     * @type {number}
     * @const
     * @expose
     */
    ByteBuffer.MAX_VARINT32_BYTES = 5;

    /**
     * Calculates the actual number of bytes required to store a 32bit base 128 variable-length integer.
     * @param {number} value Value to encode
     * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT32_BYTES}
     * @expose
     */
    ByteBuffer.calculateVarint32 = function(value) {
        // ref: src/google/protobuf/io/coded_stream.cc
        value = value >>> 0;
             if (value < 1 << 7 ) return 1;
        else if (value < 1 << 14) return 2;
        else if (value < 1 << 21) return 3;
        else if (value < 1 << 28) return 4;
        else                      return 5;
    };

    /**
     * Zigzag encodes a signed 32bit integer so that it can be effectively used with varint encoding.
     * @param {number} n Signed 32bit integer
     * @returns {number} Unsigned zigzag encoded 32bit integer
     * @expose
     */
    ByteBuffer.zigZagEncode32 = function(n) {
        return (((n |= 0) << 1) ^ (n >> 31)) >>> 0; // ref: src/google/protobuf/wire_format_lite.h
    };

    /**
     * Decodes a zigzag encoded signed 32bit integer.
     * @param {number} n Unsigned zigzag encoded 32bit integer
     * @returns {number} Signed 32bit integer
     * @expose
     */
    ByteBuffer.zigZagDecode32 = function(n) {
        return ((n >>> 1) ^ -(n & 1)) | 0; // // ref: src/google/protobuf/wire_format_lite.h
    };

    /**
     * Writes a 32bit base 128 variable-length integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
     * @expose
     */
    ByteBufferPrototype.writeVarint32 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value |= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        var size = ByteBuffer.calculateVarint32(value),
            b;
        offset += size;
        var capacity10 = this.buffer.byteLength;
        if (offset > capacity10)
            this.resize((capacity10 *= 2) > offset ? capacity10 : offset);
        offset -= size;
        value >>>= 0;
        while (value >= 0x80) {
            b = (value & 0x7f) | 0x80;
            this.view[offset++] = b;
            value >>>= 7;
        }
        this.view[offset++] = value;
        if (relative) {
            this.offset = offset;
            return this;
        }
        return size;
    };

    /**
     * Writes a zig-zag encoded (signed) 32bit base 128 variable-length integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
     * @expose
     */
    ByteBufferPrototype.writeVarint32ZigZag = function(value, offset) {
        return this.writeVarint32(ByteBuffer.zigZagEncode32(value), offset);
    };

    /**
     * Reads a 32bit base 128 variable-length integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
     *  and the actual number of bytes read.
     * @throws {Error} If it's not a valid varint. Has a property `truncated = true` if there is not enough data available
     *  to fully decode the varint.
     * @expose
     */
    ByteBufferPrototype.readVarint32 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 1 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+1+") <= "+this.buffer.byteLength);
        }
        var c = 0,
            value = 0 >>> 0,
            b;
        do {
            if (!this.noAssert && offset > this.limit) {
                var err = Error("Truncated");
                err['truncated'] = true;
                throw err;
            }
            b = this.view[offset++];
            if (c < 5)
                value |= (b & 0x7f) << (7*c);
            ++c;
        } while ((b & 0x80) !== 0);
        value |= 0;
        if (relative) {
            this.offset = offset;
            return value;
        }
        return {
            "value": value,
            "length": c
        };
    };

    /**
     * Reads a zig-zag encoded (signed) 32bit base 128 variable-length integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
     *  and the actual number of bytes read.
     * @throws {Error} If it's not a valid varint
     * @expose
     */
    ByteBufferPrototype.readVarint32ZigZag = function(offset) {
        var val = this.readVarint32(offset);
        if (typeof val === 'object')
            val["value"] = ByteBuffer.zigZagDecode32(val["value"]);
        else
            val = ByteBuffer.zigZagDecode32(val);
        return val;
    };

    // types/varints/varint64

    if (Long) {

        /**
         * Maximum number of bytes required to store a 64bit base 128 variable-length integer.
         * @type {number}
         * @const
         * @expose
         */
        ByteBuffer.MAX_VARINT64_BYTES = 10;

        /**
         * Calculates the actual number of bytes required to store a 64bit base 128 variable-length integer.
         * @param {number|!Long} value Value to encode
         * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT64_BYTES}
         * @expose
         */
        ByteBuffer.calculateVarint64 = function(value) {
            if (typeof value === 'number')
                value = Long.fromNumber(value);
            else if (typeof value === 'string')
                value = Long.fromString(value);
            // ref: src/google/protobuf/io/coded_stream.cc
            var part0 = value.toInt() >>> 0,
                part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
                part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
            if (part2 == 0) {
                if (part1 == 0) {
                    if (part0 < 1 << 14)
                        return part0 < 1 << 7 ? 1 : 2;
                    else
                        return part0 < 1 << 21 ? 3 : 4;
                } else {
                    if (part1 < 1 << 14)
                        return part1 < 1 << 7 ? 5 : 6;
                    else
                        return part1 < 1 << 21 ? 7 : 8;
                }
            } else
                return part2 < 1 << 7 ? 9 : 10;
        };

        /**
         * Zigzag encodes a signed 64bit integer so that it can be effectively used with varint encoding.
         * @param {number|!Long} value Signed long
         * @returns {!Long} Unsigned zigzag encoded long
         * @expose
         */
        ByteBuffer.zigZagEncode64 = function(value) {
            if (typeof value === 'number')
                value = Long.fromNumber(value, false);
            else if (typeof value === 'string')
                value = Long.fromString(value, false);
            else if (value.unsigned !== false) value = value.toSigned();
            // ref: src/google/protobuf/wire_format_lite.h
            return value.shiftLeft(1).xor(value.shiftRight(63)).toUnsigned();
        };

        /**
         * Decodes a zigzag encoded signed 64bit integer.
         * @param {!Long|number} value Unsigned zigzag encoded long or JavaScript number
         * @returns {!Long} Signed long
         * @expose
         */
        ByteBuffer.zigZagDecode64 = function(value) {
            if (typeof value === 'number')
                value = Long.fromNumber(value, false);
            else if (typeof value === 'string')
                value = Long.fromString(value, false);
            else if (value.unsigned !== false) value = value.toSigned();
            // ref: src/google/protobuf/wire_format_lite.h
            return value.shiftRightUnsigned(1).xor(value.and(Long.ONE).toSigned().negate()).toSigned();
        };

        /**
         * Writes a 64bit base 128 variable-length integer.
         * @param {number|Long} value Value to write
         * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
         *  written if omitted.
         * @returns {!ByteBuffer|number} `this` if offset is omitted, else the actual number of bytes written.
         * @expose
         */
        ByteBufferPrototype.writeVarint64 = function(value, offset) {
            var relative = typeof offset === 'undefined';
            if (relative) offset = this.offset;
            if (!this.noAssert) {
                if (typeof value === 'number')
                    value = Long.fromNumber(value);
                else if (typeof value === 'string')
                    value = Long.fromString(value);
                else if (!(value && value instanceof Long))
                    throw TypeError("Illegal value: "+value+" (not an integer or Long)");
                if (typeof offset !== 'number' || offset % 1 !== 0)
                    throw TypeError("Illegal offset: "+offset+" (not an integer)");
                offset >>>= 0;
                if (offset < 0 || offset + 0 > this.buffer.byteLength)
                    throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
            }
            if (typeof value === 'number')
                value = Long.fromNumber(value, false);
            else if (typeof value === 'string')
                value = Long.fromString(value, false);
            else if (value.unsigned !== false) value = value.toSigned();
            var size = ByteBuffer.calculateVarint64(value),
                part0 = value.toInt() >>> 0,
                part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
                part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
            offset += size;
            var capacity11 = this.buffer.byteLength;
            if (offset > capacity11)
                this.resize((capacity11 *= 2) > offset ? capacity11 : offset);
            offset -= size;
            switch (size) {
                case 10: this.view[offset+9] = (part2 >>>  7) & 0x01;
                case 9 : this.view[offset+8] = size !== 9 ? (part2       ) | 0x80 : (part2       ) & 0x7F;
                case 8 : this.view[offset+7] = size !== 8 ? (part1 >>> 21) | 0x80 : (part1 >>> 21) & 0x7F;
                case 7 : this.view[offset+6] = size !== 7 ? (part1 >>> 14) | 0x80 : (part1 >>> 14) & 0x7F;
                case 6 : this.view[offset+5] = size !== 6 ? (part1 >>>  7) | 0x80 : (part1 >>>  7) & 0x7F;
                case 5 : this.view[offset+4] = size !== 5 ? (part1       ) | 0x80 : (part1       ) & 0x7F;
                case 4 : this.view[offset+3] = size !== 4 ? (part0 >>> 21) | 0x80 : (part0 >>> 21) & 0x7F;
                case 3 : this.view[offset+2] = size !== 3 ? (part0 >>> 14) | 0x80 : (part0 >>> 14) & 0x7F;
                case 2 : this.view[offset+1] = size !== 2 ? (part0 >>>  7) | 0x80 : (part0 >>>  7) & 0x7F;
                case 1 : this.view[offset  ] = size !== 1 ? (part0       ) | 0x80 : (part0       ) & 0x7F;
            }
            if (relative) {
                this.offset += size;
                return this;
            } else {
                return size;
            }
        };

        /**
         * Writes a zig-zag encoded 64bit base 128 variable-length integer.
         * @param {number|Long} value Value to write
         * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
         *  written if omitted.
         * @returns {!ByteBuffer|number} `this` if offset is omitted, else the actual number of bytes written.
         * @expose
         */
        ByteBufferPrototype.writeVarint64ZigZag = function(value, offset) {
            return this.writeVarint64(ByteBuffer.zigZagEncode64(value), offset);
        };

        /**
         * Reads a 64bit base 128 variable-length integer. Requires Long.js.
         * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
         *  read if omitted.
         * @returns {!Long|!{value: Long, length: number}} The value read if offset is omitted, else the value read and
         *  the actual number of bytes read.
         * @throws {Error} If it's not a valid varint
         * @expose
         */
        ByteBufferPrototype.readVarint64 = function(offset) {
            var relative = typeof offset === 'undefined';
            if (relative) offset = this.offset;
            if (!this.noAssert) {
                if (typeof offset !== 'number' || offset % 1 !== 0)
                    throw TypeError("Illegal offset: "+offset+" (not an integer)");
                offset >>>= 0;
                if (offset < 0 || offset + 1 > this.buffer.byteLength)
                    throw RangeError("Illegal offset: 0 <= "+offset+" (+"+1+") <= "+this.buffer.byteLength);
            }
            // ref: src/google/protobuf/io/coded_stream.cc
            var start = offset,
                part0 = 0,
                part1 = 0,
                part2 = 0,
                b  = 0;
            b = this.view[offset++]; part0  = (b & 0x7F)      ; if ( b & 0x80                                                   ) {
            b = this.view[offset++]; part0 |= (b & 0x7F) <<  7; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.view[offset++]; part0 |= (b & 0x7F) << 14; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.view[offset++]; part0 |= (b & 0x7F) << 21; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.view[offset++]; part1  = (b & 0x7F)      ; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.view[offset++]; part1 |= (b & 0x7F) <<  7; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.view[offset++]; part1 |= (b & 0x7F) << 14; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.view[offset++]; part1 |= (b & 0x7F) << 21; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.view[offset++]; part2  = (b & 0x7F)      ; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.view[offset++]; part2 |= (b & 0x7F) <<  7; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            throw Error("Buffer overrun"); }}}}}}}}}}
            var value = Long.fromBits(part0 | (part1 << 28), (part1 >>> 4) | (part2) << 24, false);
            if (relative) {
                this.offset = offset;
                return value;
            } else {
                return {
                    'value': value,
                    'length': offset-start
                };
            }
        };

        /**
         * Reads a zig-zag encoded 64bit base 128 variable-length integer. Requires Long.js.
         * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
         *  read if omitted.
         * @returns {!Long|!{value: Long, length: number}} The value read if offset is omitted, else the value read and
         *  the actual number of bytes read.
         * @throws {Error} If it's not a valid varint
         * @expose
         */
        ByteBufferPrototype.readVarint64ZigZag = function(offset) {
            var val = this.readVarint64(offset);
            if (val && val['value'] instanceof Long)
                val["value"] = ByteBuffer.zigZagDecode64(val["value"]);
            else
                val = ByteBuffer.zigZagDecode64(val);
            return val;
        };

    } // Long


    // types/strings/cstring

    /**
     * Writes a NULL-terminated UTF8 encoded string. For this to work the specified string must not contain any NULL
     *  characters itself.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  contained in `str` + 1 if omitted.
     * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written
     * @expose
     */
    ByteBufferPrototype.writeCString = function(str, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        var i,
            k = str.length;
        if (!this.noAssert) {
            if (typeof str !== 'string')
                throw TypeError("Illegal str: Not a string");
            for (i=0; i<k; ++i) {
                if (str.charCodeAt(i) === 0)
                    throw RangeError("Illegal str: Contains NULL-characters");
            }
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        // UTF8 strings do not contain zero bytes in between except for the zero character, so:
        k = utfx.calculateUTF16asUTF8(stringSource(str))[1];
        offset += k+1;
        var capacity12 = this.buffer.byteLength;
        if (offset > capacity12)
            this.resize((capacity12 *= 2) > offset ? capacity12 : offset);
        offset -= k+1;
        utfx.encodeUTF16toUTF8(stringSource(str), function(b) {
            this.view[offset++] = b;
        }.bind(this));
        this.view[offset++] = 0;
        if (relative) {
            this.offset = offset;
            return this;
        }
        return k;
    };

    /**
     * Reads a NULL-terminated UTF8 encoded string. For this to work the string read must not contain any NULL characters
     *  itself.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     */
    ByteBufferPrototype.readCString = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 1 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+1+") <= "+this.buffer.byteLength);
        }
        var start = offset,
            temp;
        // UTF8 strings do not contain zero bytes in between except for the zero character itself, so:
        var sd, b = -1;
        utfx.decodeUTF8toUTF16(function() {
            if (b === 0) return null;
            if (offset >= this.limit)
                throw RangeError("Illegal range: Truncated data, "+offset+" < "+this.limit);
            b = this.view[offset++];
            return b === 0 ? null : b;
        }.bind(this), sd = stringDestination(), true);
        if (relative) {
            this.offset = offset;
            return sd();
        } else {
            return {
                "string": sd(),
                "length": offset - start
            };
        }
    };

    // types/strings/istring

    /**
     * Writes a length as uint32 prefixed UTF8 encoded string.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
     * @expose
     * @see ByteBuffer#writeVarint32
     */
    ByteBufferPrototype.writeIString = function(str, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof str !== 'string')
                throw TypeError("Illegal str: Not a string");
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        var start = offset,
            k;
        k = utfx.calculateUTF16asUTF8(stringSource(str), this.noAssert)[1];
        offset += 4+k;
        var capacity13 = this.buffer.byteLength;
        if (offset > capacity13)
            this.resize((capacity13 *= 2) > offset ? capacity13 : offset);
        offset -= 4+k;
        if (this.littleEndian) {
            this.view[offset+3] = (k >>> 24) & 0xFF;
            this.view[offset+2] = (k >>> 16) & 0xFF;
            this.view[offset+1] = (k >>>  8) & 0xFF;
            this.view[offset  ] =  k         & 0xFF;
        } else {
            this.view[offset  ] = (k >>> 24) & 0xFF;
            this.view[offset+1] = (k >>> 16) & 0xFF;
            this.view[offset+2] = (k >>>  8) & 0xFF;
            this.view[offset+3] =  k         & 0xFF;
        }
        offset += 4;
        utfx.encodeUTF16toUTF8(stringSource(str), function(b) {
            this.view[offset++] = b;
        }.bind(this));
        if (offset !== start + 4 + k)
            throw RangeError("Illegal range: Truncated data, "+offset+" == "+(offset+4+k));
        if (relative) {
            this.offset = offset;
            return this;
        }
        return offset - start;
    };

    /**
     * Reads a length as uint32 prefixed UTF8 encoded string.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     * @see ByteBuffer#readVarint32
     */
    ByteBufferPrototype.readIString = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 4 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+4+") <= "+this.buffer.byteLength);
        }
        var start = offset;
        var len = this.readUint32(offset);
        var str = this.readUTF8String(len, ByteBuffer.METRICS_BYTES, offset += 4);
        offset += str['length'];
        if (relative) {
            this.offset = offset;
            return str['string'];
        } else {
            return {
                'string': str['string'],
                'length': offset - start
            };
        }
    };

    // types/strings/utf8string

    /**
     * Metrics representing number of UTF8 characters. Evaluates to `c`.
     * @type {string}
     * @const
     * @expose
     */
    ByteBuffer.METRICS_CHARS = 'c';

    /**
     * Metrics representing number of bytes. Evaluates to `b`.
     * @type {string}
     * @const
     * @expose
     */
    ByteBuffer.METRICS_BYTES = 'b';

    /**
     * Writes an UTF8 encoded string.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
     * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
     * @expose
     */
    ByteBufferPrototype.writeUTF8String = function(str, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        var k;
        var start = offset;
        k = utfx.calculateUTF16asUTF8(stringSource(str))[1];
        offset += k;
        var capacity14 = this.buffer.byteLength;
        if (offset > capacity14)
            this.resize((capacity14 *= 2) > offset ? capacity14 : offset);
        offset -= k;
        utfx.encodeUTF16toUTF8(stringSource(str), function(b) {
            this.view[offset++] = b;
        }.bind(this));
        if (relative) {
            this.offset = offset;
            return this;
        }
        return offset - start;
    };

    /**
     * Writes an UTF8 encoded string. This is an alias of {@link ByteBuffer#writeUTF8String}.
     * @function
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
     * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
     * @expose
     */
    ByteBufferPrototype.writeString = ByteBufferPrototype.writeUTF8String;

    /**
     * Calculates the number of UTF8 characters of a string. JavaScript itself uses UTF-16, so that a string's
     *  `length` property does not reflect its actual UTF8 size if it contains code points larger than 0xFFFF.
     * @param {string} str String to calculate
     * @returns {number} Number of UTF8 characters
     * @expose
     */
    ByteBuffer.calculateUTF8Chars = function(str) {
        return utfx.calculateUTF16asUTF8(stringSource(str))[0];
    };

    /**
     * Calculates the number of UTF8 bytes of a string.
     * @param {string} str String to calculate
     * @returns {number} Number of UTF8 bytes
     * @expose
     */
    ByteBuffer.calculateUTF8Bytes = function(str) {
        return utfx.calculateUTF16asUTF8(stringSource(str))[1];
    };

    /**
     * Calculates the number of UTF8 bytes of a string. This is an alias of {@link ByteBuffer.calculateUTF8Bytes}.
     * @function
     * @param {string} str String to calculate
     * @returns {number} Number of UTF8 bytes
     * @expose
     */
    ByteBuffer.calculateString = ByteBuffer.calculateUTF8Bytes;

    /**
     * Reads an UTF8 encoded string.
     * @param {number} length Number of characters or bytes to read.
     * @param {string=} metrics Metrics specifying what `length` is meant to count. Defaults to
     *  {@link ByteBuffer.METRICS_CHARS}.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     */
    ByteBufferPrototype.readUTF8String = function(length, metrics, offset) {
        if (typeof metrics === 'number') {
            offset = metrics;
            metrics = undefined;
        }
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (typeof metrics === 'undefined') metrics = ByteBuffer.METRICS_CHARS;
        if (!this.noAssert) {
            if (typeof length !== 'number' || length % 1 !== 0)
                throw TypeError("Illegal length: "+length+" (not an integer)");
            length |= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        var i = 0,
            start = offset,
            sd;
        if (metrics === ByteBuffer.METRICS_CHARS) { // The same for node and the browser
            sd = stringDestination();
            utfx.decodeUTF8(function() {
                return i < length && offset < this.limit ? this.view[offset++] : null;
            }.bind(this), function(cp) {
                ++i; utfx.UTF8toUTF16(cp, sd);
            });
            if (i !== length)
                throw RangeError("Illegal range: Truncated data, "+i+" == "+length);
            if (relative) {
                this.offset = offset;
                return sd();
            } else {
                return {
                    "string": sd(),
                    "length": offset - start
                };
            }
        } else if (metrics === ByteBuffer.METRICS_BYTES) {
            if (!this.noAssert) {
                if (typeof offset !== 'number' || offset % 1 !== 0)
                    throw TypeError("Illegal offset: "+offset+" (not an integer)");
                offset >>>= 0;
                if (offset < 0 || offset + length > this.buffer.byteLength)
                    throw RangeError("Illegal offset: 0 <= "+offset+" (+"+length+") <= "+this.buffer.byteLength);
            }
            var k = offset + length;
            utfx.decodeUTF8toUTF16(function() {
                return offset < k ? this.view[offset++] : null;
            }.bind(this), sd = stringDestination(), this.noAssert);
            if (offset !== k)
                throw RangeError("Illegal range: Truncated data, "+offset+" == "+k);
            if (relative) {
                this.offset = offset;
                return sd();
            } else {
                return {
                    'string': sd(),
                    'length': offset - start
                };
            }
        } else
            throw TypeError("Unsupported metrics: "+metrics);
    };

    /**
     * Reads an UTF8 encoded string. This is an alias of {@link ByteBuffer#readUTF8String}.
     * @function
     * @param {number} length Number of characters or bytes to read
     * @param {number=} metrics Metrics specifying what `n` is meant to count. Defaults to
     *  {@link ByteBuffer.METRICS_CHARS}.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     */
    ByteBufferPrototype.readString = ByteBufferPrototype.readUTF8String;

    // types/strings/vstring

    /**
     * Writes a length as varint32 prefixed UTF8 encoded string.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
     * @expose
     * @see ByteBuffer#writeVarint32
     */
    ByteBufferPrototype.writeVString = function(str, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof str !== 'string')
                throw TypeError("Illegal str: Not a string");
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        var start = offset,
            k, l;
        k = utfx.calculateUTF16asUTF8(stringSource(str), this.noAssert)[1];
        l = ByteBuffer.calculateVarint32(k);
        offset += l+k;
        var capacity15 = this.buffer.byteLength;
        if (offset > capacity15)
            this.resize((capacity15 *= 2) > offset ? capacity15 : offset);
        offset -= l+k;
        offset += this.writeVarint32(k, offset);
        utfx.encodeUTF16toUTF8(stringSource(str), function(b) {
            this.view[offset++] = b;
        }.bind(this));
        if (offset !== start+k+l)
            throw RangeError("Illegal range: Truncated data, "+offset+" == "+(offset+k+l));
        if (relative) {
            this.offset = offset;
            return this;
        }
        return offset - start;
    };

    /**
     * Reads a length as varint32 prefixed UTF8 encoded string.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     * @see ByteBuffer#readVarint32
     */
    ByteBufferPrototype.readVString = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 1 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+1+") <= "+this.buffer.byteLength);
        }
        var start = offset;
        var len = this.readVarint32(offset);
        var str = this.readUTF8String(len['value'], ByteBuffer.METRICS_BYTES, offset += len['length']);
        offset += str['length'];
        if (relative) {
            this.offset = offset;
            return str['string'];
        } else {
            return {
                'string': str['string'],
                'length': offset - start
            };
        }
    };


    /**
     * Appends some data to this ByteBuffer. This will overwrite any contents behind the specified offset up to the appended
     *  data's length.
     * @param {!ByteBuffer|!ArrayBuffer|!Uint8Array|string} source Data to append. If `source` is a ByteBuffer, its offsets
     *  will be modified according to the performed read operation.
     * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
     * @param {number=} offset Offset to append at. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @example A relative `<01 02>03.append(<04 05>)` will result in `<01 02 04 05>, 04 05|`
     * @example An absolute `<01 02>03.append(04 05>, 1)` will result in `<01 04>05, 04 05|`
     */
    ByteBufferPrototype.append = function(source, encoding, offset) {
        if (typeof encoding === 'number' || typeof encoding !== 'string') {
            offset = encoding;
            encoding = undefined;
        }
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        if (!(source instanceof ByteBuffer))
            source = ByteBuffer.wrap(source, encoding);
        var length = source.limit - source.offset;
        if (length <= 0) return this; // Nothing to append
        offset += length;
        var capacity16 = this.buffer.byteLength;
        if (offset > capacity16)
            this.resize((capacity16 *= 2) > offset ? capacity16 : offset);
        offset -= length;
        this.view.set(source.view.subarray(source.offset, source.limit), offset);
        source.offset += length;
        if (relative) this.offset += length;
        return this;
    };

    /**
     * Appends this ByteBuffer's contents to another ByteBuffer. This will overwrite any contents at and after the
        specified offset up to the length of this ByteBuffer's data.
     * @param {!ByteBuffer} target Target ByteBuffer
     * @param {number=} offset Offset to append to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @see ByteBuffer#append
     */
    ByteBufferPrototype.appendTo = function(target, offset) {
        target.append(this, offset);
        return this;
    };

    /**
     * Enables or disables assertions of argument types and offsets. Assertions are enabled by default but you can opt to
     *  disable them if your code already makes sure that everything is valid.
     * @param {boolean} assert `true` to enable assertions, otherwise `false`
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.assert = function(assert) {
        this.noAssert = !assert;
        return this;
    };

    /**
     * Gets the capacity of this ByteBuffer's backing buffer.
     * @returns {number} Capacity of the backing buffer
     * @expose
     */
    ByteBufferPrototype.capacity = function() {
        return this.buffer.byteLength;
    };
    /**
     * Clears this ByteBuffer's offsets by setting {@link ByteBuffer#offset} to `0` and {@link ByteBuffer#limit} to the
     *  backing buffer's capacity. Discards {@link ByteBuffer#markedOffset}.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.clear = function() {
        this.offset = 0;
        this.limit = this.buffer.byteLength;
        this.markedOffset = -1;
        return this;
    };

    /**
     * Creates a cloned instance of this ByteBuffer, preset with this ByteBuffer's values for {@link ByteBuffer#offset},
     *  {@link ByteBuffer#markedOffset} and {@link ByteBuffer#limit}.
     * @param {boolean=} copy Whether to copy the backing buffer or to return another view on the same, defaults to `false`
     * @returns {!ByteBuffer} Cloned instance
     * @expose
     */
    ByteBufferPrototype.clone = function(copy) {
        var bb = new ByteBuffer(0, this.littleEndian, this.noAssert);
        if (copy) {
            bb.buffer = new ArrayBuffer(this.buffer.byteLength);
            bb.view = new Uint8Array(bb.buffer);
        } else {
            bb.buffer = this.buffer;
            bb.view = this.view;
        }
        bb.offset = this.offset;
        bb.markedOffset = this.markedOffset;
        bb.limit = this.limit;
        return bb;
    };

    /**
     * Compacts this ByteBuffer to be backed by a {@link ByteBuffer#buffer} of its contents' length. Contents are the bytes
     *  between {@link ByteBuffer#offset} and {@link ByteBuffer#limit}. Will set `offset = 0` and `limit = capacity` and
     *  adapt {@link ByteBuffer#markedOffset} to the same relative position if set.
     * @param {number=} begin Offset to start at, defaults to {@link ByteBuffer#offset}
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.compact = function(begin, end) {
        if (typeof begin === 'undefined') begin = this.offset;
        if (typeof end === 'undefined') end = this.limit;
        if (!this.noAssert) {
            if (typeof begin !== 'number' || begin % 1 !== 0)
                throw TypeError("Illegal begin: Not an integer");
            begin >>>= 0;
            if (typeof end !== 'number' || end % 1 !== 0)
                throw TypeError("Illegal end: Not an integer");
            end >>>= 0;
            if (begin < 0 || begin > end || end > this.buffer.byteLength)
                throw RangeError("Illegal range: 0 <= "+begin+" <= "+end+" <= "+this.buffer.byteLength);
        }
        if (begin === 0 && end === this.buffer.byteLength)
            return this; // Already compacted
        var len = end - begin;
        if (len === 0) {
            this.buffer = EMPTY_BUFFER;
            this.view = null;
            if (this.markedOffset >= 0) this.markedOffset -= begin;
            this.offset = 0;
            this.limit = 0;
            return this;
        }
        var buffer = new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        view.set(this.view.subarray(begin, end));
        this.buffer = buffer;
        this.view = view;
        if (this.markedOffset >= 0) this.markedOffset -= begin;
        this.offset = 0;
        this.limit = len;
        return this;
    };

    /**
     * Creates a copy of this ByteBuffer's contents. Contents are the bytes between {@link ByteBuffer#offset} and
     *  {@link ByteBuffer#limit}.
     * @param {number=} begin Begin offset, defaults to {@link ByteBuffer#offset}.
     * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
     * @returns {!ByteBuffer} Copy
     * @expose
     */
    ByteBufferPrototype.copy = function(begin, end) {
        if (typeof begin === 'undefined') begin = this.offset;
        if (typeof end === 'undefined') end = this.limit;
        if (!this.noAssert) {
            if (typeof begin !== 'number' || begin % 1 !== 0)
                throw TypeError("Illegal begin: Not an integer");
            begin >>>= 0;
            if (typeof end !== 'number' || end % 1 !== 0)
                throw TypeError("Illegal end: Not an integer");
            end >>>= 0;
            if (begin < 0 || begin > end || end > this.buffer.byteLength)
                throw RangeError("Illegal range: 0 <= "+begin+" <= "+end+" <= "+this.buffer.byteLength);
        }
        if (begin === end)
            return new ByteBuffer(0, this.littleEndian, this.noAssert);
        var capacity = end - begin,
            bb = new ByteBuffer(capacity, this.littleEndian, this.noAssert);
        bb.offset = 0;
        bb.limit = capacity;
        if (bb.markedOffset >= 0) bb.markedOffset -= begin;
        this.copyTo(bb, 0, begin, end);
        return bb;
    };

    /**
     * Copies this ByteBuffer's contents to another ByteBuffer. Contents are the bytes between {@link ByteBuffer#offset} and
     *  {@link ByteBuffer#limit}.
     * @param {!ByteBuffer} target Target ByteBuffer
     * @param {number=} targetOffset Offset to copy to. Will use and increase the target's {@link ByteBuffer#offset}
     *  by the number of bytes copied if omitted.
     * @param {number=} sourceOffset Offset to start copying from. Will use and increase {@link ByteBuffer#offset} by the
     *  number of bytes copied if omitted.
     * @param {number=} sourceLimit Offset to end copying from, defaults to {@link ByteBuffer#limit}
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.copyTo = function(target, targetOffset, sourceOffset, sourceLimit) {
        var relative,
            targetRelative;
        if (!this.noAssert) {
            if (!ByteBuffer.isByteBuffer(target))
                throw TypeError("Illegal target: Not a ByteBuffer");
        }
        targetOffset = (targetRelative = typeof targetOffset === 'undefined') ? target.offset : targetOffset | 0;
        sourceOffset = (relative = typeof sourceOffset === 'undefined') ? this.offset : sourceOffset | 0;
        sourceLimit = typeof sourceLimit === 'undefined' ? this.limit : sourceLimit | 0;

        if (targetOffset < 0 || targetOffset > target.buffer.byteLength)
            throw RangeError("Illegal target range: 0 <= "+targetOffset+" <= "+target.buffer.byteLength);
        if (sourceOffset < 0 || sourceLimit > this.buffer.byteLength)
            throw RangeError("Illegal source range: 0 <= "+sourceOffset+" <= "+this.buffer.byteLength);

        var len = sourceLimit - sourceOffset;
        if (len === 0)
            return target; // Nothing to copy

        target.ensureCapacity(targetOffset + len);

        target.view.set(this.view.subarray(sourceOffset, sourceLimit), targetOffset);

        if (relative) this.offset += len;
        if (targetRelative) target.offset += len;

        return this;
    };

    /**
     * Makes sure that this ByteBuffer is backed by a {@link ByteBuffer#buffer} of at least the specified capacity. If the
     *  current capacity is exceeded, it will be doubled. If double the current capacity is less than the required capacity,
     *  the required capacity will be used instead.
     * @param {number} capacity Required capacity
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.ensureCapacity = function(capacity) {
        var current = this.buffer.byteLength;
        if (current < capacity)
            return this.resize((current *= 2) > capacity ? current : capacity);
        return this;
    };

    /**
     * Overwrites this ByteBuffer's contents with the specified value. Contents are the bytes between
     *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
     * @param {number|string} value Byte value to fill with. If given as a string, the first character is used.
     * @param {number=} begin Begin offset. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted. defaults to {@link ByteBuffer#offset}.
     * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
     * @returns {!ByteBuffer} this
     * @expose
     * @example `someByteBuffer.clear().fill(0)` fills the entire backing buffer with zeroes
     */
    ByteBufferPrototype.fill = function(value, begin, end) {
        var relative = typeof begin === 'undefined';
        if (relative) begin = this.offset;
        if (typeof value === 'string' && value.length > 0)
            value = value.charCodeAt(0);
        if (typeof begin === 'undefined') begin = this.offset;
        if (typeof end === 'undefined') end = this.limit;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value |= 0;
            if (typeof begin !== 'number' || begin % 1 !== 0)
                throw TypeError("Illegal begin: Not an integer");
            begin >>>= 0;
            if (typeof end !== 'number' || end % 1 !== 0)
                throw TypeError("Illegal end: Not an integer");
            end >>>= 0;
            if (begin < 0 || begin > end || end > this.buffer.byteLength)
                throw RangeError("Illegal range: 0 <= "+begin+" <= "+end+" <= "+this.buffer.byteLength);
        }
        if (begin >= end)
            return this; // Nothing to fill
        while (begin < end) this.view[begin++] = value;
        if (relative) this.offset = begin;
        return this;
    };

    /**
     * Makes this ByteBuffer ready for a new sequence of write or relative read operations. Sets `limit = offset` and
     *  `offset = 0`. Make sure always to flip a ByteBuffer when all relative read or write operations are complete.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.flip = function() {
        this.limit = this.offset;
        this.offset = 0;
        return this;
    };
    /**
     * Marks an offset on this ByteBuffer to be used later.
     * @param {number=} offset Offset to mark. Defaults to {@link ByteBuffer#offset}.
     * @returns {!ByteBuffer} this
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @see ByteBuffer#reset
     * @expose
     */
    ByteBufferPrototype.mark = function(offset) {
        offset = typeof offset === 'undefined' ? this.offset : offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        this.markedOffset = offset;
        return this;
    };
    /**
     * Sets the byte order.
     * @param {boolean} littleEndian `true` for little endian byte order, `false` for big endian
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.order = function(littleEndian) {
        if (!this.noAssert) {
            if (typeof littleEndian !== 'boolean')
                throw TypeError("Illegal littleEndian: Not a boolean");
        }
        this.littleEndian = !!littleEndian;
        return this;
    };

    /**
     * Switches (to) little endian byte order.
     * @param {boolean=} littleEndian Defaults to `true`, otherwise uses big endian
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.LE = function(littleEndian) {
        this.littleEndian = typeof littleEndian !== 'undefined' ? !!littleEndian : true;
        return this;
    };

    /**
     * Switches (to) big endian byte order.
     * @param {boolean=} bigEndian Defaults to `true`, otherwise uses little endian
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.BE = function(bigEndian) {
        this.littleEndian = typeof bigEndian !== 'undefined' ? !bigEndian : false;
        return this;
    };
    /**
     * Prepends some data to this ByteBuffer. This will overwrite any contents before the specified offset up to the
     *  prepended data's length. If there is not enough space available before the specified `offset`, the backing buffer
     *  will be resized and its contents moved accordingly.
     * @param {!ByteBuffer|string|!ArrayBuffer} source Data to prepend. If `source` is a ByteBuffer, its offset will be
     *  modified according to the performed read operation.
     * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
     * @param {number=} offset Offset to prepend at. Will use and decrease {@link ByteBuffer#offset} by the number of bytes
     *  prepended if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @example A relative `00<01 02 03>.prepend(<04 05>)` results in `<04 05 01 02 03>, 04 05|`
     * @example An absolute `00<01 02 03>.prepend(<04 05>, 2)` results in `04<05 02 03>, 04 05|`
     */
    ByteBufferPrototype.prepend = function(source, encoding, offset) {
        if (typeof encoding === 'number' || typeof encoding !== 'string') {
            offset = encoding;
            encoding = undefined;
        }
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.byteLength);
        }
        if (!(source instanceof ByteBuffer))
            source = ByteBuffer.wrap(source, encoding);
        var len = source.limit - source.offset;
        if (len <= 0) return this; // Nothing to prepend
        var diff = len - offset;
        if (diff > 0) { // Not enough space before offset, so resize + move
            var buffer = new ArrayBuffer(this.buffer.byteLength + diff);
            var view = new Uint8Array(buffer);
            view.set(this.view.subarray(offset, this.buffer.byteLength), len);
            this.buffer = buffer;
            this.view = view;
            this.offset += diff;
            if (this.markedOffset >= 0) this.markedOffset += diff;
            this.limit += diff;
            offset += diff;
        } else {
            var arrayView = new Uint8Array(this.buffer);
        }
        this.view.set(source.view.subarray(source.offset, source.limit), offset - len);

        source.offset = source.limit;
        if (relative)
            this.offset -= len;
        return this;
    };

    /**
     * Prepends this ByteBuffer to another ByteBuffer. This will overwrite any contents before the specified offset up to the
     *  prepended data's length. If there is not enough space available before the specified `offset`, the backing buffer
     *  will be resized and its contents moved accordingly.
     * @param {!ByteBuffer} target Target ByteBuffer
     * @param {number=} offset Offset to prepend at. Will use and decrease {@link ByteBuffer#offset} by the number of bytes
     *  prepended if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @see ByteBuffer#prepend
     */
    ByteBufferPrototype.prependTo = function(target, offset) {
        target.prepend(this, offset);
        return this;
    };
    /**
     * Prints debug information about this ByteBuffer's contents.
     * @param {function(string)=} out Output function to call, defaults to console.log
     * @expose
     */
    ByteBufferPrototype.printDebug = function(out) {
        if (typeof out !== 'function') out = console.log.bind(console);
        out(
            this.toString()+"\n"+
            "-------------------------------------------------------------------\n"+
            this.toDebug(/* columns */ true)
        );
    };

    /**
     * Gets the number of remaining readable bytes. Contents are the bytes between {@link ByteBuffer#offset} and
     *  {@link ByteBuffer#limit}, so this returns `limit - offset`.
     * @returns {number} Remaining readable bytes. May be negative if `offset > limit`.
     * @expose
     */
    ByteBufferPrototype.remaining = function() {
        return this.limit - this.offset;
    };
    /**
     * Resets this ByteBuffer's {@link ByteBuffer#offset}. If an offset has been marked through {@link ByteBuffer#mark}
     *  before, `offset` will be set to {@link ByteBuffer#markedOffset}, which will then be discarded. If no offset has been
     *  marked, sets `offset = 0`.
     * @returns {!ByteBuffer} this
     * @see ByteBuffer#mark
     * @expose
     */
    ByteBufferPrototype.reset = function() {
        if (this.markedOffset >= 0) {
            this.offset = this.markedOffset;
            this.markedOffset = -1;
        } else {
            this.offset = 0;
        }
        return this;
    };
    /**
     * Resizes this ByteBuffer to be backed by a buffer of at least the given capacity. Will do nothing if already that
     *  large or larger.
     * @param {number} capacity Capacity required
     * @returns {!ByteBuffer} this
     * @throws {TypeError} If `capacity` is not a number
     * @throws {RangeError} If `capacity < 0`
     * @expose
     */
    ByteBufferPrototype.resize = function(capacity) {
        if (!this.noAssert) {
            if (typeof capacity !== 'number' || capacity % 1 !== 0)
                throw TypeError("Illegal capacity: "+capacity+" (not an integer)");
            capacity |= 0;
            if (capacity < 0)
                throw RangeError("Illegal capacity: 0 <= "+capacity);
        }
        if (this.buffer.byteLength < capacity) {
            var buffer = new ArrayBuffer(capacity);
            var view = new Uint8Array(buffer);
            view.set(this.view);
            this.buffer = buffer;
            this.view = view;
        }
        return this;
    };
    /**
     * Reverses this ByteBuffer's contents.
     * @param {number=} begin Offset to start at, defaults to {@link ByteBuffer#offset}
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.reverse = function(begin, end) {
        if (typeof begin === 'undefined') begin = this.offset;
        if (typeof end === 'undefined') end = this.limit;
        if (!this.noAssert) {
            if (typeof begin !== 'number' || begin % 1 !== 0)
                throw TypeError("Illegal begin: Not an integer");
            begin >>>= 0;
            if (typeof end !== 'number' || end % 1 !== 0)
                throw TypeError("Illegal end: Not an integer");
            end >>>= 0;
            if (begin < 0 || begin > end || end > this.buffer.byteLength)
                throw RangeError("Illegal range: 0 <= "+begin+" <= "+end+" <= "+this.buffer.byteLength);
        }
        if (begin === end)
            return this; // Nothing to reverse
        Array.prototype.reverse.call(this.view.subarray(begin, end));
        return this;
    };
    /**
     * Skips the next `length` bytes. This will just advance
     * @param {number} length Number of bytes to skip. May also be negative to move the offset back.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.skip = function(length) {
        if (!this.noAssert) {
            if (typeof length !== 'number' || length % 1 !== 0)
                throw TypeError("Illegal length: "+length+" (not an integer)");
            length |= 0;
        }
        var offset = this.offset + length;
        if (!this.noAssert) {
            if (offset < 0 || offset > this.buffer.byteLength)
                throw RangeError("Illegal length: 0 <= "+this.offset+" + "+length+" <= "+this.buffer.byteLength);
        }
        this.offset = offset;
        return this;
    };

    /**
     * Slices this ByteBuffer by creating a cloned instance with `offset = begin` and `limit = end`.
     * @param {number=} begin Begin offset, defaults to {@link ByteBuffer#offset}.
     * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
     * @returns {!ByteBuffer} Clone of this ByteBuffer with slicing applied, backed by the same {@link ByteBuffer#buffer}
     * @expose
     */
    ByteBufferPrototype.slice = function(begin, end) {
        if (typeof begin === 'undefined') begin = this.offset;
        if (typeof end === 'undefined') end = this.limit;
        if (!this.noAssert) {
            if (typeof begin !== 'number' || begin % 1 !== 0)
                throw TypeError("Illegal begin: Not an integer");
            begin >>>= 0;
            if (typeof end !== 'number' || end % 1 !== 0)
                throw TypeError("Illegal end: Not an integer");
            end >>>= 0;
            if (begin < 0 || begin > end || end > this.buffer.byteLength)
                throw RangeError("Illegal range: 0 <= "+begin+" <= "+end+" <= "+this.buffer.byteLength);
        }
        var bb = this.clone();
        bb.offset = begin;
        bb.limit = end;
        return bb;
    };
    /**
     * Returns a copy of the backing buffer that contains this ByteBuffer's contents. Contents are the bytes between
     *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
     * @param {boolean=} forceCopy If `true` returns a copy, otherwise returns a view referencing the same memory if
     *  possible. Defaults to `false`
     * @returns {!ArrayBuffer} Contents as an ArrayBuffer
     * @expose
     */
    ByteBufferPrototype.toBuffer = function(forceCopy) {
        var offset = this.offset,
            limit = this.limit;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: Not an integer");
            offset >>>= 0;
            if (typeof limit !== 'number' || limit % 1 !== 0)
                throw TypeError("Illegal limit: Not an integer");
            limit >>>= 0;
            if (offset < 0 || offset > limit || limit > this.buffer.byteLength)
                throw RangeError("Illegal range: 0 <= "+offset+" <= "+limit+" <= "+this.buffer.byteLength);
        }
        // NOTE: It's not possible to have another ArrayBuffer reference the same memory as the backing buffer. This is
        // possible with Uint8Array#subarray only, but we have to return an ArrayBuffer by contract. So:
        if (!forceCopy && offset === 0 && limit === this.buffer.byteLength)
            return this.buffer;
        if (offset === limit)
            return EMPTY_BUFFER;
        var buffer = new ArrayBuffer(limit - offset);
        new Uint8Array(buffer).set(new Uint8Array(this.buffer).subarray(offset, limit), 0);
        return buffer;
    };

    /**
     * Returns a raw buffer compacted to contain this ByteBuffer's contents. Contents are the bytes between
     *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}. This is an alias of {@link ByteBuffer#toBuffer}.
     * @function
     * @param {boolean=} forceCopy If `true` returns a copy, otherwise returns a view referencing the same memory.
     *  Defaults to `false`
     * @returns {!ArrayBuffer} Contents as an ArrayBuffer
     * @expose
     */
    ByteBufferPrototype.toArrayBuffer = ByteBufferPrototype.toBuffer;

    /**
     * Converts the ByteBuffer's contents to a string.
     * @param {string=} encoding Output encoding. Returns an informative string representation if omitted but also allows
     *  direct conversion to "utf8", "hex", "base64" and "binary" encoding. "debug" returns a hex representation with
     *  highlighted offsets.
     * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
     * @returns {string} String representation
     * @throws {Error} If `encoding` is invalid
     * @expose
     */
    ByteBufferPrototype.toString = function(encoding, begin, end) {
        if (typeof encoding === 'undefined')
            return "ByteBufferAB(offset="+this.offset+",markedOffset="+this.markedOffset+",limit="+this.limit+",capacity="+this.capacity()+")";
        if (typeof encoding === 'number')
            encoding = "utf8",
            begin = encoding,
            end = begin;
        switch (encoding) {
            case "utf8":
                return this.toUTF8(begin, end);
            case "base64":
                return this.toBase64(begin, end);
            case "hex":
                return this.toHex(begin, end);
            case "binary":
                return this.toBinary(begin, end);
            case "debug":
                return this.toDebug();
            case "columns":
                return this.toColumns();
            default:
                throw Error("Unsupported encoding: "+encoding);
        }
    };

    // lxiv-embeddable

    /**
     * lxiv-embeddable (c) 2014 Daniel Wirtz <dcode@dcode.io>
     * Released under the Apache License, Version 2.0
     * see: https://github.com/dcodeIO/lxiv for details
     */
    var lxiv = function() {
        "use strict";

        /**
         * lxiv namespace.
         * @type {!Object.<string,*>}
         * @exports lxiv
         */
        var lxiv = {};

        /**
         * Character codes for output.
         * @type {!Array.<number>}
         * @inner
         */
        var aout = [
            65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
            81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102,
            103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118,
            119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47
        ];

        /**
         * Character codes for input.
         * @type {!Array.<number>}
         * @inner
         */
        var ain = [];
        for (var i=0, k=aout.length; i<k; ++i)
            ain[aout[i]] = i;

        /**
         * Encodes bytes to base64 char codes.
         * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if
         *  there are no more bytes left.
         * @param {!function(number)} dst Characters destination as a function successively called with each encoded char
         *  code.
         */
        lxiv.encode = function(src, dst) {
            var b, t;
            while ((b = src()) !== null) {
                dst(aout[(b>>2)&0x3f]);
                t = (b&0x3)<<4;
                if ((b = src()) !== null) {
                    t |= (b>>4)&0xf;
                    dst(aout[(t|((b>>4)&0xf))&0x3f]);
                    t = (b&0xf)<<2;
                    if ((b = src()) !== null)
                        dst(aout[(t|((b>>6)&0x3))&0x3f]),
                        dst(aout[b&0x3f]);
                    else
                        dst(aout[t&0x3f]),
                        dst(61);
                } else
                    dst(aout[t&0x3f]),
                    dst(61),
                    dst(61);
            }
        };

        /**
         * Decodes base64 char codes to bytes.
         * @param {!function():number|null} src Characters source as a function returning the next char code respectively
         *  `null` if there are no more characters left.
         * @param {!function(number)} dst Bytes destination as a function successively called with the next byte.
         * @throws {Error} If a character code is invalid
         */
        lxiv.decode = function(src, dst) {
            var c, t1, t2;
            function fail(c) {
                throw Error("Illegal character code: "+c);
            }
            while ((c = src()) !== null) {
                t1 = ain[c];
                if (typeof t1 === 'undefined') fail(c);
                if ((c = src()) !== null) {
                    t2 = ain[c];
                    if (typeof t2 === 'undefined') fail(c);
                    dst((t1<<2)>>>0|(t2&0x30)>>4);
                    if ((c = src()) !== null) {
                        t1 = ain[c];
                        if (typeof t1 === 'undefined')
                            if (c === 61) break; else fail(c);
                        dst(((t2&0xf)<<4)>>>0|(t1&0x3c)>>2);
                        if ((c = src()) !== null) {
                            t2 = ain[c];
                            if (typeof t2 === 'undefined')
                                if (c === 61) break; else fail(c);
                            dst(((t1&0x3)<<6)>>>0|t2);
                        }
                    }
                }
            }
        };

        /**
         * Tests if a string is valid base64.
         * @param {string} str String to test
         * @returns {boolean} `true` if valid, otherwise `false`
         */
        lxiv.test = function(str) {
            return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(str);
        };

        return lxiv;
    }();

    // encodings/base64

    /**
     * Encodes this ByteBuffer's contents to a base64 encoded string.
     * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}.
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}.
     * @returns {string} Base64 encoded string
     * @throws {RangeError} If `begin` or `end` is out of bounds
     * @expose
     */
    ByteBufferPrototype.toBase64 = function(begin, end) {
        if (typeof begin === 'undefined')
            begin = this.offset;
        if (typeof end === 'undefined')
            end = this.limit;
        begin = begin | 0; end = end | 0;
        if (begin < 0 || end > this.capacity || begin > end)
            throw RangeError("begin, end");
        var sd; lxiv.encode(function() {
            return begin < end ? this.view[begin++] : null;
        }.bind(this), sd = stringDestination());
        return sd();
    };

    /**
     * Decodes a base64 encoded string to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */
    ByteBuffer.fromBase64 = function(str, littleEndian) {
        if (typeof str !== 'string')
            throw TypeError("str");
        var bb = new ByteBuffer(str.length/4*3, littleEndian),
            i = 0;
        lxiv.decode(stringSource(str), function(b) {
            bb.view[i++] = b;
        });
        bb.limit = i;
        return bb;
    };

    /**
     * Encodes a binary string to base64 like `window.btoa` does.
     * @param {string} str Binary string
     * @returns {string} Base64 encoded string
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.btoa
     * @expose
     */
    ByteBuffer.btoa = function(str) {
        return ByteBuffer.fromBinary(str).toBase64();
    };

    /**
     * Decodes a base64 encoded string to binary like `window.atob` does.
     * @param {string} b64 Base64 encoded string
     * @returns {string} Binary string
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
     * @expose
     */
    ByteBuffer.atob = function(b64) {
        return ByteBuffer.fromBase64(b64).toBinary();
    };

    // encodings/binary

    /**
     * Encodes this ByteBuffer to a binary encoded string, that is using only characters 0x00-0xFF as bytes.
     * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
     * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
     * @returns {string} Binary encoded string
     * @throws {RangeError} If `offset > limit`
     * @expose
     */
    ByteBufferPrototype.toBinary = function(begin, end) {
        if (typeof begin === 'undefined')
            begin = this.offset;
        if (typeof end === 'undefined')
            end = this.limit;
        begin |= 0; end |= 0;
        if (begin < 0 || end > this.capacity() || begin > end)
            throw RangeError("begin, end");
        if (begin === end)
            return "";
        var chars = [],
            parts = [];
        while (begin < end) {
            chars.push(this.view[begin++]);
            if (chars.length >= 1024)
                parts.push(String.fromCharCode.apply(String, chars)),
                chars = [];
        }
        return parts.join('') + String.fromCharCode.apply(String, chars);
    };

    /**
     * Decodes a binary encoded string, that is using only characters 0x00-0xFF as bytes, to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */
    ByteBuffer.fromBinary = function(str, littleEndian) {
        if (typeof str !== 'string')
            throw TypeError("str");
        var i = 0,
            k = str.length,
            charCode,
            bb = new ByteBuffer(k, littleEndian);
        while (i<k) {
            charCode = str.charCodeAt(i);
            if (charCode > 0xff)
                throw RangeError("illegal char code: "+charCode);
            bb.view[i++] = charCode;
        }
        bb.limit = k;
        return bb;
    };

    // encodings/debug

    /**
     * Encodes this ByteBuffer to a hex encoded string with marked offsets. Offset symbols are:
     * * `<` : offset,
     * * `'` : markedOffset,
     * * `>` : limit,
     * * `|` : offset and limit,
     * * `[` : offset and markedOffset,
     * * `]` : markedOffset and limit,
     * * `!` : offset, markedOffset and limit
     * @param {boolean=} columns If `true` returns two columns hex + ascii, defaults to `false`
     * @returns {string|!Array.<string>} Debug string or array of lines if `asArray = true`
     * @expose
     * @example `>00'01 02<03` contains four bytes with `limit=0, markedOffset=1, offset=3`
     * @example `00[01 02 03>` contains four bytes with `offset=markedOffset=1, limit=4`
     * @example `00|01 02 03` contains four bytes with `offset=limit=1, markedOffset=-1`
     * @example `|` contains zero bytes with `offset=limit=0, markedOffset=-1`
     */
    ByteBufferPrototype.toDebug = function(columns) {
        var i = -1,
            k = this.buffer.byteLength,
            b,
            hex = "",
            asc = "",
            out = "";
        while (i<k) {
            if (i !== -1) {
                b = this.view[i];
                if (b < 0x10) hex += "0"+b.toString(16).toUpperCase();
                else hex += b.toString(16).toUpperCase();
                if (columns)
                    asc += b > 32 && b < 127 ? String.fromCharCode(b) : '.';
            }
            ++i;
            if (columns) {
                if (i > 0 && i % 16 === 0 && i !== k) {
                    while (hex.length < 3*16+3) hex += " ";
                    out += hex+asc+"\n";
                    hex = asc = "";
                }
            }
            if (i === this.offset && i === this.limit)
                hex += i === this.markedOffset ? "!" : "|";
            else if (i === this.offset)
                hex += i === this.markedOffset ? "[" : "<";
            else if (i === this.limit)
                hex += i === this.markedOffset ? "]" : ">";
            else
                hex += i === this.markedOffset ? "'" : (columns || (i !== 0 && i !== k) ? " " : "");
        }
        if (columns && hex !== " ") {
            while (hex.length < 3*16+3)
                hex += " ";
            out += hex + asc + "\n";
        }
        return columns ? out : hex;
    };

    /**
     * Decodes a hex encoded string with marked offsets to a ByteBuffer.
     * @param {string} str Debug string to decode (not be generated with `columns = true`)
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     * @see ByteBuffer#toDebug
     */
    ByteBuffer.fromDebug = function(str, littleEndian, noAssert) {
        var k = str.length,
            bb = new ByteBuffer(((k+1)/3)|0, littleEndian, noAssert);
        var i = 0, j = 0, ch, b,
            rs = false, // Require symbol next
            ho = false, hm = false, hl = false, // Already has offset (ho), markedOffset (hm), limit (hl)?
            fail = false;
        while (i<k) {
            switch (ch = str.charAt(i++)) {
                case '!':
                    if (!noAssert) {
                        if (ho || hm || hl) {
                            fail = true;
                            break;
                        }
                        ho = hm = hl = true;
                    }
                    bb.offset = bb.markedOffset = bb.limit = j;
                    rs = false;
                    break;
                case '|':
                    if (!noAssert) {
                        if (ho || hl) {
                            fail = true;
                            break;
                        }
                        ho = hl = true;
                    }
                    bb.offset = bb.limit = j;
                    rs = false;
                    break;
                case '[':
                    if (!noAssert) {
                        if (ho || hm) {
                            fail = true;
                            break;
                        }
                        ho = hm = true;
                    }
                    bb.offset = bb.markedOffset = j;
                    rs = false;
                    break;
                case '<':
                    if (!noAssert) {
                        if (ho) {
                            fail = true;
                            break;
                        }
                        ho = true;
                    }
                    bb.offset = j;
                    rs = false;
                    break;
                case ']':
                    if (!noAssert) {
                        if (hl || hm) {
                            fail = true;
                            break;
                        }
                        hl = hm = true;
                    }
                    bb.limit = bb.markedOffset = j;
                    rs = false;
                    break;
                case '>':
                    if (!noAssert) {
                        if (hl) {
                            fail = true;
                            break;
                        }
                        hl = true;
                    }
                    bb.limit = j;
                    rs = false;
                    break;
                case "'":
                    if (!noAssert) {
                        if (hm) {
                            fail = true;
                            break;
                        }
                        hm = true;
                    }
                    bb.markedOffset = j;
                    rs = false;
                    break;
                case ' ':
                    rs = false;
                    break;
                default:
                    if (!noAssert) {
                        if (rs) {
                            fail = true;
                            break;
                        }
                    }
                    b = parseInt(ch+str.charAt(i++), 16);
                    if (!noAssert) {
                        if (isNaN(b) || b < 0 || b > 255)
                            throw TypeError("Illegal str: Not a debug encoded string");
                    }
                    bb.view[j++] = b;
                    rs = true;
            }
            if (fail)
                throw TypeError("Illegal str: Invalid symbol at "+i);
        }
        if (!noAssert) {
            if (!ho || !hl)
                throw TypeError("Illegal str: Missing offset or limit");
            if (j<bb.buffer.byteLength)
                throw TypeError("Illegal str: Not a debug encoded string (is it hex?) "+j+" < "+k);
        }
        return bb;
    };

    // encodings/hex

    /**
     * Encodes this ByteBuffer's contents to a hex encoded string.
     * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
     * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
     * @returns {string} Hex encoded string
     * @expose
     */
    ByteBufferPrototype.toHex = function(begin, end) {
        begin = typeof begin === 'undefined' ? this.offset : begin;
        end = typeof end === 'undefined' ? this.limit : end;
        if (!this.noAssert) {
            if (typeof begin !== 'number' || begin % 1 !== 0)
                throw TypeError("Illegal begin: Not an integer");
            begin >>>= 0;
            if (typeof end !== 'number' || end % 1 !== 0)
                throw TypeError("Illegal end: Not an integer");
            end >>>= 0;
            if (begin < 0 || begin > end || end > this.buffer.byteLength)
                throw RangeError("Illegal range: 0 <= "+begin+" <= "+end+" <= "+this.buffer.byteLength);
        }
        var out = new Array(end - begin),
            b;
        while (begin < end) {
            b = this.view[begin++];
            if (b < 0x10)
                out.push("0", b.toString(16));
            else out.push(b.toString(16));
        }
        return out.join('');
    };

    /**
     * Decodes a hex encoded string to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */
    ByteBuffer.fromHex = function(str, littleEndian, noAssert) {
        if (!noAssert) {
            if (typeof str !== 'string')
                throw TypeError("Illegal str: Not a string");
            if (str.length % 2 !== 0)
                throw TypeError("Illegal str: Length not a multiple of 2");
        }
        var k = str.length,
            bb = new ByteBuffer((k / 2) | 0, littleEndian),
            b;
        for (var i=0, j=0; i<k; i+=2) {
            b = parseInt(str.substring(i, i+2), 16);
            if (!noAssert)
                if (!isFinite(b) || b < 0 || b > 255)
                    throw TypeError("Illegal str: Contains non-hex characters");
            bb.view[j++] = b;
        }
        bb.limit = j;
        return bb;
    };

    // utfx-embeddable

    /**
     * utfx-embeddable (c) 2014 Daniel Wirtz <dcode@dcode.io>
     * Released under the Apache License, Version 2.0
     * see: https://github.com/dcodeIO/utfx for details
     */
    var utfx = function() {
        "use strict";

        /**
         * utfx namespace.
         * @inner
         * @type {!Object.<string,*>}
         */
        var utfx = {};

        /**
         * Maximum valid code point.
         * @type {number}
         * @const
         */
        utfx.MAX_CODEPOINT = 0x10FFFF;

        /**
         * Encodes UTF8 code points to UTF8 bytes.
         * @param {(!function():number|null) | number} src Code points source, either as a function returning the next code point
         *  respectively `null` if there are no more code points left or a single numeric code point.
         * @param {!function(number)} dst Bytes destination as a function successively called with the next byte
         */
        utfx.encodeUTF8 = function(src, dst) {
            var cp = null;
            if (typeof src === 'number')
                cp = src,
                src = function() { return null; };
            while (cp !== null || (cp = src()) !== null) {
                if (cp < 0x80)
                    dst(cp&0x7F);
                else if (cp < 0x800)
                    dst(((cp>>6)&0x1F)|0xC0),
                    dst((cp&0x3F)|0x80);
                else if (cp < 0x10000)
                    dst(((cp>>12)&0x0F)|0xE0),
                    dst(((cp>>6)&0x3F)|0x80),
                    dst((cp&0x3F)|0x80);
                else
                    dst(((cp>>18)&0x07)|0xF0),
                    dst(((cp>>12)&0x3F)|0x80),
                    dst(((cp>>6)&0x3F)|0x80),
                    dst((cp&0x3F)|0x80);
                cp = null;
            }
        };

        /**
         * Decodes UTF8 bytes to UTF8 code points.
         * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if there
         *  are no more bytes left.
         * @param {!function(number)} dst Code points destination as a function successively called with each decoded code point.
         * @throws {RangeError} If a starting byte is invalid in UTF8
         * @throws {Error} If the last sequence is truncated. Has an array property `bytes` holding the
         *  remaining bytes.
         */
        utfx.decodeUTF8 = function(src, dst) {
            var a, b, c, d, fail = function(b) {
                b = b.slice(0, b.indexOf(null));
                var err = Error(b.toString());
                err.name = "TruncatedError";
                err['bytes'] = b;
                throw err;
            };
            while ((a = src()) !== null) {
                if ((a&0x80) === 0)
                    dst(a);
                else if ((a&0xE0) === 0xC0)
                    ((b = src()) === null) && fail([a, b]),
                    dst(((a&0x1F)<<6) | (b&0x3F));
                else if ((a&0xF0) === 0xE0)
                    ((b=src()) === null || (c=src()) === null) && fail([a, b, c]),
                    dst(((a&0x0F)<<12) | ((b&0x3F)<<6) | (c&0x3F));
                else if ((a&0xF8) === 0xF0)
                    ((b=src()) === null || (c=src()) === null || (d=src()) === null) && fail([a, b, c ,d]),
                    dst(((a&0x07)<<18) | ((b&0x3F)<<12) | ((c&0x3F)<<6) | (d&0x3F));
                else throw RangeError("Illegal starting byte: "+a);
            }
        };

        /**
         * Converts UTF16 characters to UTF8 code points.
         * @param {!function():number|null} src Characters source as a function returning the next char code respectively
         *  `null` if there are no more characters left.
         * @param {!function(number)} dst Code points destination as a function successively called with each converted code
         *  point.
         */
        utfx.UTF16toUTF8 = function(src, dst) {
            var c1, c2 = null;
            while (true) {
                if ((c1 = c2 !== null ? c2 : src()) === null)
                    break;
                if (c1 >= 0xD800 && c1 <= 0xDFFF) {
                    if ((c2 = src()) !== null) {
                        if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
                            dst((c1-0xD800)*0x400+c2-0xDC00+0x10000);
                            c2 = null; continue;
                        }
                    }
                }
                dst(c1);
            }
            if (c2 !== null) dst(c2);
        };

        /**
         * Converts UTF8 code points to UTF16 characters.
         * @param {(!function():number|null) | number} src Code points source, either as a function returning the next code point
         *  respectively `null` if there are no more code points left or a single numeric code point.
         * @param {!function(number)} dst Characters destination as a function successively called with each converted char code.
         * @throws {RangeError} If a code point is out of range
         */
        utfx.UTF8toUTF16 = function(src, dst) {
            var cp = null;
            if (typeof src === 'number')
                cp = src, src = function() { return null; };
            while (cp !== null || (cp = src()) !== null) {
                if (cp <= 0xFFFF)
                    dst(cp);
                else
                    cp -= 0x10000,
                    dst((cp>>10)+0xD800),
                    dst((cp%0x400)+0xDC00);
                cp = null;
            }
        };

        /**
         * Converts and encodes UTF16 characters to UTF8 bytes.
         * @param {!function():number|null} src Characters source as a function returning the next char code respectively `null`
         *  if there are no more characters left.
         * @param {!function(number)} dst Bytes destination as a function successively called with the next byte.
         */
        utfx.encodeUTF16toUTF8 = function(src, dst) {
            utfx.UTF16toUTF8(src, function(cp) {
                utfx.encodeUTF8(cp, dst);
            });
        };

        /**
         * Decodes and converts UTF8 bytes to UTF16 characters.
         * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if there
         *  are no more bytes left.
         * @param {!function(number)} dst Characters destination as a function successively called with each converted char code.
         * @throws {RangeError} If a starting byte is invalid in UTF8
         * @throws {Error} If the last sequence is truncated. Has an array property `bytes` holding the remaining bytes.
         */
        utfx.decodeUTF8toUTF16 = function(src, dst) {
            utfx.decodeUTF8(src, function(cp) {
                utfx.UTF8toUTF16(cp, dst);
            });
        };

        /**
         * Calculates the byte length of an UTF8 code point.
         * @param {number} cp UTF8 code point
         * @returns {number} Byte length
         */
        utfx.calculateCodePoint = function(cp) {
            return (cp < 0x80) ? 1 : (cp < 0x800) ? 2 : (cp < 0x10000) ? 3 : 4;
        };

        /**
         * Calculates the number of UTF8 bytes required to store UTF8 code points.
         * @param {(!function():number|null)} src Code points source as a function returning the next code point respectively
         *  `null` if there are no more code points left.
         * @returns {number} The number of UTF8 bytes required
         */
        utfx.calculateUTF8 = function(src) {
            var cp, l=0;
            while ((cp = src()) !== null)
                l += (cp < 0x80) ? 1 : (cp < 0x800) ? 2 : (cp < 0x10000) ? 3 : 4;
            return l;
        };

        /**
         * Calculates the number of UTF8 code points respectively UTF8 bytes required to store UTF16 char codes.
         * @param {(!function():number|null)} src Characters source as a function returning the next char code respectively
         *  `null` if there are no more characters left.
         * @returns {!Array.<number>} The number of UTF8 code points at index 0 and the number of UTF8 bytes required at index 1.
         */
        utfx.calculateUTF16asUTF8 = function(src) {
            var n=0, l=0;
            utfx.UTF16toUTF8(src, function(cp) {
                ++n; l += (cp < 0x80) ? 1 : (cp < 0x800) ? 2 : (cp < 0x10000) ? 3 : 4;
            });
            return [n,l];
        };

        return utfx;
    }();

    // encodings/utf8

    /**
     * Encodes this ByteBuffer's contents between {@link ByteBuffer#offset} and {@link ByteBuffer#limit} to an UTF8 encoded
     *  string.
     * @returns {string} Hex encoded string
     * @throws {RangeError} If `offset > limit`
     * @expose
     */
    ByteBufferPrototype.toUTF8 = function(begin, end) {
        if (typeof begin === 'undefined') begin = this.offset;
        if (typeof end === 'undefined') end = this.limit;
        if (!this.noAssert) {
            if (typeof begin !== 'number' || begin % 1 !== 0)
                throw TypeError("Illegal begin: Not an integer");
            begin >>>= 0;
            if (typeof end !== 'number' || end % 1 !== 0)
                throw TypeError("Illegal end: Not an integer");
            end >>>= 0;
            if (begin < 0 || begin > end || end > this.buffer.byteLength)
                throw RangeError("Illegal range: 0 <= "+begin+" <= "+end+" <= "+this.buffer.byteLength);
        }
        var sd; try {
            utfx.decodeUTF8toUTF16(function() {
                return begin < end ? this.view[begin++] : null;
            }.bind(this), sd = stringDestination());
        } catch (e) {
            if (begin !== end)
                throw RangeError("Illegal range: Truncated data, "+begin+" != "+end);
        }
        return sd();
    };

    /**
     * Decodes an UTF8 encoded string to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */
    ByteBuffer.fromUTF8 = function(str, littleEndian, noAssert) {
        if (!noAssert)
            if (typeof str !== 'string')
                throw TypeError("Illegal str: Not a string");
        var bb = new ByteBuffer(utfx.calculateUTF16asUTF8(stringSource(str), true)[1], littleEndian, noAssert),
            i = 0;
        utfx.encodeUTF16toUTF8(stringSource(str), function(b) {
            bb.view[i++] = b;
        });
        bb.limit = i;
        return bb;
    };

    return ByteBuffer;
});

;(function(){
var h;
function l(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
b&&"undefined"==typeof a.call)return"object";return b}function aa(a){return a[ca]||(a[ca]=++ea)}var ca="closure_uid_"+(1E9*Math.random()>>>0),ea=0;function fa(a){return/^[\s\xa0]*$/.test(a)}function ga(a){return 1==a.length&&" "<=a&&"~">=a||""<=a&&"�">=a}var ia=String.prototype.repeat?function(a,b){return a.repeat(b)}:function(a,b){return Array(b+1).join(a)};function ja(a,b){for(var c in a)b.call(void 0,a[c],c,a)};function ka(a,b){null!=a&&this.append.apply(this,arguments)}h=ka.prototype;h.sb="";h.set=function(a){this.sb=""+a};h.append=function(a,b,c){this.sb+=a;if(null!=b)for(var d=1;d<arguments.length;d++)this.sb+=arguments[d];return this};h.clear=function(){this.sb=""};h.toString=function(){return this.sb};var la,n=null;if("undefined"===typeof na)var na=function(){throw Error("No *print-fn* fn set for evaluation environment");};if("undefined"===typeof oa)var oa=function(){throw Error("No *print-err-fn* fn set for evaluation environment");};var qa=!0,ra=!0,ta=null,va=null;if("undefined"===typeof xa)var xa=null;function ya(){return new q(null,5,[Aa,!0,Ca,ra,Da,!1,Ea,!1,Fa,ta],null)}
function Ga(){qa=!1;na=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return b.call(this,d)}function b(a){return console.log.apply(console,Ja?Ka(a):La.call(null,a))}a.I=0;a.J=function(a){a=r(a);return b(a)};a.v=b;return a}();oa=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return b.call(this,d)}
function b(a){return console.error.apply(console,Ja?Ka(a):La.call(null,a))}a.I=0;a.J=function(a){a=r(a);return b(a)};a.v=b;return a}()}function u(a){return null!=a&&!1!==a}function Na(a){return a instanceof Array}function Oa(a){return null==a?!0:!1===a?!0:!1}function Pa(a,b){return a[l(null==b?null:b)]?!0:a._?!0:!1}function Qa(a){return null==a?null:a.constructor}
function Ra(a,b){var c=Qa(b),c=u(u(c)?c.ub:c)?c.gb:l(b);return Error(["No protocol method ",a," defined for type ",c,": ",b].join(""))}function Sa(a){var b=a.gb;return u(b)?b:""+y(a)}var Ta="undefined"!==typeof Symbol&&"function"===l(Symbol)?Symbol.iterator:"@@iterator";function Ua(a){for(var b=a.length,c=Array(b),d=0;;)if(d<b)c[d]=a[d],d+=1;else break;return c}
function La(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;switch(b.length){case 1:return Ka(arguments[0]);case 2:return Ka(arguments[1]);default:throw Error([y("Invalid arity: "),y(b.length)].join(""));}}function Ja(a){return Ka(a)}function Ka(a){function b(a,b){a.push(b);return a}var c=[];return Va?Va(b,c,a):Wa.call(null,b,c,a)}function Xa(){}
var Za=function Za(b){if(null!=b&&null!=b.aa)return b.aa(b);var c=Za[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Za._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("ICounted.-count",b);},$a=function $a(b){if(null!=b&&null!=b.ha)return b.ha(b);var c=$a[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=$a._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IEmptyableCollection.-empty",b);};function bb(){}
var cb=function cb(b,c){if(null!=b&&null!=b.Y)return b.Y(b,c);var d=cb[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=cb._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Ra("ICollection.-conj",b);};function db(){}
var eb=function eb(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return eb.b(arguments[0],arguments[1]);case 3:return eb.c(arguments[0],arguments[1],arguments[2]);default:throw Error([y("Invalid arity: "),y(c.length)].join(""));}};
eb.b=function(a,b){if(null!=a&&null!=a.fa)return a.fa(a,b);var c=eb[l(null==a?null:a)];if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);c=eb._;if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);throw Ra("IIndexed.-nth",a);};eb.c=function(a,b,c){if(null!=a&&null!=a.Ua)return a.Ua(a,b,c);var d=eb[l(null==a?null:a)];if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);d=eb._;if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);throw Ra("IIndexed.-nth",a);};eb.I=3;function gb(){}
var hb=function hb(b){if(null!=b&&null!=b.ia)return b.ia(b);var c=hb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=hb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("ISeq.-first",b);},jb=function jb(b){if(null!=b&&null!=b.Fa)return b.Fa(b);var c=jb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=jb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("ISeq.-rest",b);};function kb(){}function lb(){}
var mb=function mb(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return mb.b(arguments[0],arguments[1]);case 3:return mb.c(arguments[0],arguments[1],arguments[2]);default:throw Error([y("Invalid arity: "),y(c.length)].join(""));}};
mb.b=function(a,b){if(null!=a&&null!=a.Z)return a.Z(a,b);var c=mb[l(null==a?null:a)];if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);c=mb._;if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);throw Ra("ILookup.-lookup",a);};mb.c=function(a,b,c){if(null!=a&&null!=a.W)return a.W(a,b,c);var d=mb[l(null==a?null:a)];if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);d=mb._;if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);throw Ra("ILookup.-lookup",a);};mb.I=3;
var nb=function nb(b,c){if(null!=b&&null!=b.jc)return b.jc(b,c);var d=nb[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=nb._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Ra("IAssociative.-contains-key?",b);},ob=function ob(b,c,d){if(null!=b&&null!=b.Ta)return b.Ta(b,c,d);var e=ob[l(null==b?null:b)];if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);e=ob._;if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);throw Ra("IAssociative.-assoc",b);};function pb(){}
var qb=function qb(b,c){if(null!=b&&null!=b.Wa)return b.Wa(b,c);var d=qb[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=qb._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Ra("IMap.-dissoc",b);};function rb(){}
var sb=function sb(b){if(null!=b&&null!=b.nc)return b.nc();var c=sb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=sb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IMapEntry.-key",b);},tb=function tb(b){if(null!=b&&null!=b.oc)return b.oc();var c=tb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=tb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IMapEntry.-val",b);};function ub(){}function vb(){}
var wb=function wb(b,c,d){if(null!=b&&null!=b.pc)return b.pc(b,c,d);var e=wb[l(null==b?null:b)];if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);e=wb._;if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);throw Ra("IVector.-assoc-n",b);};function xb(){}var yb=function yb(b){if(null!=b&&null!=b.Sb)return b.Sb(b);var c=yb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=yb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IDeref.-deref",b);};function zb(){}
var Ab=function Ab(b){if(null!=b&&null!=b.O)return b.O(b);var c=Ab[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Ab._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IMeta.-meta",b);},Bb=function Bb(b,c){if(null!=b&&null!=b.R)return b.R(b,c);var d=Bb[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=Bb._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Ra("IWithMeta.-with-meta",b);};function Cb(){}
var Db=function Db(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return Db.b(arguments[0],arguments[1]);case 3:return Db.c(arguments[0],arguments[1],arguments[2]);default:throw Error([y("Invalid arity: "),y(c.length)].join(""));}};
Db.b=function(a,b){if(null!=a&&null!=a.Ca)return a.Ca(a,b);var c=Db[l(null==a?null:a)];if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);c=Db._;if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);throw Ra("IReduce.-reduce",a);};Db.c=function(a,b,c){if(null!=a&&null!=a.Da)return a.Da(a,b,c);var d=Db[l(null==a?null:a)];if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);d=Db._;if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);throw Ra("IReduce.-reduce",a);};Db.I=3;
var Eb=function Eb(b,c){if(null!=b&&null!=b.H)return b.H(b,c);var d=Eb[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=Eb._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Ra("IEquiv.-equiv",b);},Fb=function Fb(b){if(null!=b&&null!=b.T)return b.T(b);var c=Fb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Fb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IHash.-hash",b);};function Gb(){}
var Hb=function Hb(b){if(null!=b&&null!=b.$)return b.$(b);var c=Hb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Hb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("ISeqable.-seq",b);};function Ib(){}function Jb(){}function Kb(){}
var Lb=function Lb(b){if(null!=b&&null!=b.fc)return b.fc(b);var c=Lb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Lb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IReversible.-rseq",b);},z=function z(b,c){if(null!=b&&null!=b.tb)return b.tb(b,c);var d=z[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=z._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Ra("IWriter.-write",b);},Mb=function Mb(b){if(null!=b&&null!=b.fb)return b.fb(b);var c=Mb[l(null==
b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Mb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IWriter.-flush",b);};function Nb(){}
var Ob=function Ob(b){if(null!=b&&null!=b.xc)return b.xc();var c=Ob[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Ob._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IPending.-realized?",b);},Pb=function Pb(b,c,d){if(null!=b&&null!=b.zc)return b.zc(0,c,d);var e=Pb[l(null==b?null:b)];if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);e=Pb._;if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);throw Ra("IWatchable.-notify-watches",b);},Qb=function Qb(b){if(null!=b&&null!=b.Jb)return b.Jb(b);
var c=Qb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Qb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IEditableCollection.-as-transient",b);},Rb=function Rb(b,c){if(null!=b&&null!=b.Ab)return b.Ab(b,c);var d=Rb[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=Rb._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Ra("ITransientCollection.-conj!",b);},Sb=function Sb(b){if(null!=b&&null!=b.Lb)return b.Lb(b);var c=Sb[l(null==b?null:b)];if(null!=
c)return c.a?c.a(b):c.call(null,b);c=Sb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("ITransientCollection.-persistent!",b);},Tb=function Tb(b,c,d){if(null!=b&&null!=b.Wb)return b.Wb(b,c,d);var e=Tb[l(null==b?null:b)];if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);e=Tb._;if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);throw Ra("ITransientAssociative.-assoc!",b);},Ub=function Ub(b,c,d){if(null!=b&&null!=b.yc)return b.yc(0,c,d);var e=Ub[l(null==b?null:b)];if(null!=e)return e.c?e.c(b,
c,d):e.call(null,b,c,d);e=Ub._;if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);throw Ra("ITransientVector.-assoc-n!",b);},Vb=function Vb(b){if(null!=b&&null!=b.uc)return b.uc();var c=Vb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Vb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IChunk.-drop-first",b);},Wb=function Wb(b){if(null!=b&&null!=b.lc)return b.lc(b);var c=Wb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Wb._;if(null!=c)return c.a?c.a(b):
c.call(null,b);throw Ra("IChunkedSeq.-chunked-first",b);},Xb=function Xb(b){if(null!=b&&null!=b.mc)return b.mc(b);var c=Xb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Xb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IChunkedSeq.-chunked-rest",b);},Yb=function Yb(b){if(null!=b&&null!=b.kc)return b.kc(b);var c=Yb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Yb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IChunkedNext.-chunked-next",b);},
$b=function $b(b){if(null!=b&&null!=b.Ub)return b.Ub(b);var c=$b[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=$b._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("INamed.-name",b);},ac=function ac(b){if(null!=b&&null!=b.Vb)return b.Vb(b);var c=ac[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=ac._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("INamed.-namespace",b);},bc=function bc(b,c){if(null!=b&&null!=b.$c)return b.$c(b,c);var d=bc[l(null==b?null:
b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=bc._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Ra("IReset.-reset!",b);},cc=function cc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return cc.b(arguments[0],arguments[1]);case 3:return cc.c(arguments[0],arguments[1],arguments[2]);case 4:return cc.G(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return cc.X(arguments[0],arguments[1],arguments[2],arguments[3],
arguments[4]);default:throw Error([y("Invalid arity: "),y(c.length)].join(""));}};cc.b=function(a,b){if(null!=a&&null!=a.bd)return a.bd(a,b);var c=cc[l(null==a?null:a)];if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);c=cc._;if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);throw Ra("ISwap.-swap!",a);};
cc.c=function(a,b,c){if(null!=a&&null!=a.cd)return a.cd(a,b,c);var d=cc[l(null==a?null:a)];if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);d=cc._;if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);throw Ra("ISwap.-swap!",a);};cc.G=function(a,b,c,d){if(null!=a&&null!=a.dd)return a.dd(a,b,c,d);var e=cc[l(null==a?null:a)];if(null!=e)return e.G?e.G(a,b,c,d):e.call(null,a,b,c,d);e=cc._;if(null!=e)return e.G?e.G(a,b,c,d):e.call(null,a,b,c,d);throw Ra("ISwap.-swap!",a);};
cc.X=function(a,b,c,d,e){if(null!=a&&null!=a.ed)return a.ed(a,b,c,d,e);var f=cc[l(null==a?null:a)];if(null!=f)return f.X?f.X(a,b,c,d,e):f.call(null,a,b,c,d,e);f=cc._;if(null!=f)return f.X?f.X(a,b,c,d,e):f.call(null,a,b,c,d,e);throw Ra("ISwap.-swap!",a);};cc.I=5;var dc=function dc(b){if(null!=b&&null!=b.Aa)return b.Aa(b);var c=dc[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=dc._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IIterable.-iterator",b);};
function ec(a){this.wd=a;this.w=1073741824;this.K=0}ec.prototype.tb=function(a,b){return this.wd.append(b)};ec.prototype.fb=function(){return null};function fc(a){var b=new ka,c=new ec(b);a.V(null,c,ya());c.fb(null);return""+y(b)}var gc="undefined"!==typeof Math.imul&&0!==Math.imul(4294967295,5)?function(a,b){return Math.imul(a,b)}:function(a,b){var c=a&65535,d=b&65535;return c*d+((a>>>16&65535)*d+c*(b>>>16&65535)<<16>>>0)|0};
function hc(a){a=gc(a|0,-862048943);return gc(a<<15|a>>>-15,461845907)}function ic(a,b){var c=(a|0)^(b|0);return gc(c<<13|c>>>-13,5)+-430675100|0}function jc(a,b){var c=(a|0)^b,c=gc(c^c>>>16,-2048144789),c=gc(c^c>>>13,-1028477387);return c^c>>>16}function kc(a){var b;a:{b=1;for(var c=0;;)if(b<a.length){var d=b+2,c=ic(c,hc(a.charCodeAt(b-1)|a.charCodeAt(b)<<16));b=d}else{b=c;break a}}b=1===(a.length&1)?b^hc(a.charCodeAt(a.length-1)):b;return jc(b,gc(2,a.length))}var lc={},mc=0;
function nc(a){255<mc&&(lc={},mc=0);var b=lc[a];if("number"!==typeof b){a:if(null!=a)if(b=a.length,0<b)for(var c=0,d=0;;)if(c<b)var e=c+1,d=gc(31,d)+a.charCodeAt(c),c=e;else{b=d;break a}else b=0;else b=0;lc[a]=b;mc+=1}return a=b}
function oc(a){if(null!=a&&(a.w&4194304||a.Cd))return a.T(null);if("number"===typeof a){if(u(isFinite(a)))return Math.floor(a)%2147483647;switch(a){case Infinity:return 2146435072;case -Infinity:return-1048576;default:return 2146959360}}else return!0===a?a=1:!1===a?a=0:"string"===typeof a?(a=nc(a),0!==a&&(a=hc(a),a=ic(0,a),a=jc(a,4))):a=a instanceof Date?a.valueOf():null==a?0:Fb(a),a}function pc(a,b){return a^b+2654435769+(a<<6)+(a>>2)}
function A(a,b,c,d,e){this.Qb=a;this.name=b;this.zb=c;this.Ib=d;this.Ea=e;this.w=2154168321;this.K=4096}h=A.prototype;h.toString=function(){return this.zb};h.equiv=function(a){return this.H(null,a)};h.H=function(a,b){return b instanceof A?this.zb===b.zb:!1};
h.call=function(){function a(a,b,c){return qc.c?qc.c(b,this,c):qc.call(null,b,this,c)}function b(a,b){return qc.b?qc.b(b,this):qc.call(null,b,this)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,0,e);case 3:return a.call(this,0,e,f)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.c=a;return c}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Ua(b)))};h.a=function(a){return qc.b?qc.b(a,this):qc.call(null,a,this)};
h.b=function(a,b){return qc.c?qc.c(a,this,b):qc.call(null,a,this,b)};h.O=function(){return this.Ea};h.R=function(a,b){return new A(this.Qb,this.name,this.zb,this.Ib,b)};h.T=function(){var a=this.Ib;return null!=a?a:this.Ib=a=pc(kc(this.name),nc(this.Qb))};h.Ub=function(){return this.name};h.Vb=function(){return this.Qb};h.V=function(a,b){return z(b,this.zb)};
var rc=function rc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return rc.a(arguments[0]);case 2:return rc.b(arguments[0],arguments[1]);default:throw Error([y("Invalid arity: "),y(c.length)].join(""));}};rc.a=function(a){if(a instanceof A)return a;var b=a.indexOf("/");return 1>b?rc.b(null,a):rc.b(a.substring(0,b),a.substring(b+1,a.length))};rc.b=function(a,b){var c=null!=a?[y(a),y("/"),y(b)].join(""):b;return new A(a,b,c,null,null)};
rc.I=2;function sc(a,b,c){this.h=a;this.gc=b;this.Ea=c;this.w=2523137;this.K=0}h=sc.prototype;h.Sb=function(){return this.h.l?this.h.l():this.h.call(null)};h.O=function(){return this.Ea};h.R=function(a,b){return new sc(this.h,this.gc,b)};h.H=function(a,b){if(b instanceof sc){var c=this.gc,d=b.gc;return B.b?B.b(c,d):B.call(null,c,d)}return!1};
h.call=function(){function a(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J,G,U){a=this;a=a.h.l?a.h.l():a.h.call(null);return tc.eb?tc.eb(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J,G,U):tc.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J,G,U)}function b(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J,G){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J,G)}function c(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,
e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J)}function d(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C)}function e(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D)}function f(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa)}function g(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q){a=this;
return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q)}function k(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P)}function m(a,b,c,d,e,f,g,k,m,p,t,v,w,x){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,e,f,g,k,m,p,t,v,w,x)}function p(a,b,c,d,e,f,g,k,m,p,t,v,w){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,e,f,g,k,m,p,t,v,w)}function t(a,b,c,d,e,f,g,k,m,p,t,v){a=this;return(a.h.l?a.h.l():
a.h.call(null)).call(null,b,c,d,e,f,g,k,m,p,t,v)}function v(a,b,c,d,e,f,g,k,m,p,t){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,e,f,g,k,m,p,t)}function w(a,b,c,d,e,f,g,k,m,p){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,e,f,g,k,m,p)}function x(a,b,c,d,e,f,g,k,m){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,e,f,g,k,m)}function C(a,b,c,d,e,f,g,k){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,e,f,g,k)}function G(a,b,c,d,e,f,g){a=this;return(a.h.l?
a.h.l():a.h.call(null)).call(null,b,c,d,e,f,g)}function D(a,b,c,d,e,f){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,e,f)}function J(a,b,c,d,e){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d,e)}function S(a,b,c,d){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c,d)}function U(a,b,c){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b,c)}function Ma(a,b){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null,b)}function fb(a){a=this;return(a.h.l?a.h.l():a.h.call(null)).call(null)}
var K=null,K=function(wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q,pa,Zb,uc,K,Be,yg){switch(arguments.length){case 1:return fb.call(this,wa);case 2:return Ma.call(this,wa,Y);case 3:return U.call(this,wa,Y,ba);case 4:return S.call(this,wa,Y,ba,da);case 5:return J.call(this,wa,Y,ba,da,ha);case 6:return D.call(this,wa,Y,ba,da,ha,ma);case 7:return G.call(this,wa,Y,ba,da,ha,ma,sa);case 8:return C.call(this,wa,Y,ba,da,ha,ma,sa,ua);case 9:return x.call(this,wa,Y,ba,da,ha,ma,sa,ua,za);case 10:return w.call(this,
wa,Y,ba,da,ha,ma,sa,ua,za,Ba);case 11:return v.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia);case 12:return t.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib);case 13:return p.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya);case 14:return m.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab);case 15:return k.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P);case 16:return g.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q);case 17:return f.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,
Q,pa);case 18:return e.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q,pa,Zb);case 19:return d.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q,pa,Zb,uc);case 20:return c.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q,pa,Zb,uc,K);case 21:return b.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q,pa,Zb,uc,K,Be);case 22:return a.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q,pa,Zb,uc,K,Be,yg)}throw Error("Invalid arity: "+arguments.length);};K.a=fb;K.b=Ma;K.c=U;K.G=
S;K.X=J;K.ua=D;K.va=G;K.wa=C;K.xa=x;K.ja=w;K.ka=v;K.la=t;K.ma=p;K.na=m;K.oa=k;K.pa=g;K.qa=f;K.ra=e;K.sa=d;K.ta=c;K.Tb=b;K.eb=a;return K}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Ua(b)))};h.l=function(){return(this.h.l?this.h.l():this.h.call(null)).call(null)};h.a=function(a){return(this.h.l?this.h.l():this.h.call(null)).call(null,a)};h.b=function(a,b){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b)};
h.c=function(a,b,c){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c)};h.G=function(a,b,c,d){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d)};h.X=function(a,b,c,d,e){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e)};h.ua=function(a,b,c,d,e,f){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f)};h.va=function(a,b,c,d,e,f,g){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f,g)};
h.wa=function(a,b,c,d,e,f,g,k){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f,g,k)};h.xa=function(a,b,c,d,e,f,g,k,m){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f,g,k,m)};h.ja=function(a,b,c,d,e,f,g,k,m,p){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f,g,k,m,p)};h.ka=function(a,b,c,d,e,f,g,k,m,p,t){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,t)};
h.la=function(a,b,c,d,e,f,g,k,m,p,t,v){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,t,v)};h.ma=function(a,b,c,d,e,f,g,k,m,p,t,v,w){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,t,v,w)};h.na=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x)};
h.oa=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C)};h.pa=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G)};h.qa=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D)};
h.ra=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J)};h.sa=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S)};h.ta=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U){return(this.h.l?this.h.l():this.h.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U)};
h.Tb=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma){var fb=this.h.l?this.h.l():this.h.call(null);return tc.eb?tc.eb(fb,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma):tc.call(null,fb,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma)};function r(a){if(null==a)return null;if(null!=a&&(a.w&8388608||a.ad))return a.$(null);if(Na(a)||"string"===typeof a)return 0===a.length?null:new Ha(a,0,null);if(Pa(Gb,a))return Hb(a);throw Error([y(a),y(" is not ISeqable")].join(""));}
function E(a){if(null==a)return null;if(null!=a&&(a.w&64||a.Kb))return a.ia(null);a=r(a);return null==a?null:hb(a)}function vc(a){return null!=a?null!=a&&(a.w&64||a.Kb)?a.Fa(null):(a=r(a))?jb(a):wc:wc}function F(a){return null==a?null:null!=a&&(a.w&128||a.ec)?a.Ia(null):r(vc(a))}
var B=function B(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return B.a(arguments[0]);case 2:return B.b(arguments[0],arguments[1]);default:return c=new Ha(c.slice(2),0,null),B.v(arguments[0],arguments[1],c)}};B.a=function(){return!0};B.b=function(a,b){return null==a?null==b:a===b||Eb(a,b)};B.v=function(a,b,c){for(;;)if(B.b(a,b))if(F(c))a=b,b=E(c),c=F(c);else return B.b(b,E(c));else return!1};
B.J=function(a){var b=E(a),c=F(a);a=E(c);c=F(c);return B.v(b,a,c)};B.I=2;function xc(a){this.S=a}xc.prototype.next=function(){if(null!=this.S){var a=E(this.S);this.S=F(this.S);return{value:a,done:!1}}return{value:null,done:!0}};function yc(a){return new xc(r(a))}function zc(a,b){var c=hc(a),c=ic(0,c);return jc(c,b)}function Ac(a){var b=0,c=1;for(a=r(a);;)if(null!=a)b+=1,c=gc(31,c)+oc(E(a))|0,a=F(a);else return zc(c,b)}var Bc=zc(1,0);
function Cc(a){var b=0,c=0;for(a=r(a);;)if(null!=a)b+=1,c=c+oc(E(a))|0,a=F(a);else return zc(c,b)}var Dc=zc(0,0);Xa["null"]=!0;Za["null"]=function(){return 0};Date.prototype.H=function(a,b){return b instanceof Date&&this.valueOf()===b.valueOf()};Eb.number=function(a,b){return a===b};zb["function"]=!0;Ab["function"]=function(){return null};Fb._=function(a){return aa(a)};function H(a){return yb(a)}
function Ec(a,b){var c=Za(a);if(0===c)return b.l?b.l():b.call(null);for(var d=eb.b(a,0),e=1;;)if(e<c)var f=eb.b(a,e),d=b.b?b.b(d,f):b.call(null,d,f),e=e+1;else return d}function Fc(a,b,c){var d=Za(a),e=c;for(c=0;;)if(c<d){var f=eb.b(a,c),e=b.b?b.b(e,f):b.call(null,e,f);c+=1}else return e}function Gc(a,b){var c=a.length;if(0===a.length)return b.l?b.l():b.call(null);for(var d=a[0],e=1;;)if(e<c)var f=a[e],d=b.b?b.b(d,f):b.call(null,d,f),e=e+1;else return d}
function Hc(a,b,c){var d=a.length,e=c;for(c=0;;)if(c<d){var f=a[c],e=b.b?b.b(e,f):b.call(null,e,f);c+=1}else return e}function Ic(a,b,c,d){for(var e=a.length;;)if(d<e){var f=a[d];c=b.b?b.b(c,f):b.call(null,c,f);d+=1}else return c}function Jc(a){return null!=a?a.w&2||a.Tc?!0:a.w?!1:Pa(Xa,a):Pa(Xa,a)}function Kc(a){return null!=a?a.w&16||a.wc?!0:a.w?!1:Pa(db,a):Pa(db,a)}
function I(a,b,c){var d=L.a?L.a(a):L.call(null,a);if(c>=d)return-1;!(0<c)&&0>c&&(c+=d,c=0>c?0:c);for(;;)if(c<d){if(B.b(Lc?Lc(a,c):Mc.call(null,a,c),b))return c;c+=1}else return-1}function Nc(a,b,c){var d=L.a?L.a(a):L.call(null,a);if(0===d)return-1;0<c?(--d,c=d<c?d:c):c=0>c?d+c:c;for(;;)if(0<=c){if(B.b(Lc?Lc(a,c):Mc.call(null,a,c),b))return c;--c}else return-1}function Oc(a,b){this.g=a;this.B=b}Oc.prototype.ya=function(){return this.B<this.g.length};
Oc.prototype.next=function(){var a=this.g[this.B];this.B+=1;return a};function Ha(a,b,c){this.g=a;this.B=b;this.F=c;this.w=166592766;this.K=8192}h=Ha.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L.a?L.a(this):L.call(null,this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.fa=function(a,b){var c=b+this.B;return c<this.g.length?this.g[c]:null};h.Ua=function(a,b,c){a=b+this.B;return a<this.g.length?this.g[a]:c};h.Aa=function(){return new Oc(this.g,this.B)};h.O=function(){return this.F};
h.Ia=function(){return this.B+1<this.g.length?new Ha(this.g,this.B+1,null):null};h.aa=function(){var a=this.g.length-this.B;return 0>a?0:a};h.fc=function(){var a=Za(this);return 0<a?new Pc(this,a-1,null):null};h.T=function(){return Ac(this)};h.H=function(a,b){return Qc.b?Qc.b(this,b):Qc.call(null,this,b)};h.ha=function(){return wc};h.Ca=function(a,b){return Ic(this.g,b,this.g[this.B],this.B+1)};h.Da=function(a,b,c){return Ic(this.g,b,c,this.B)};h.ia=function(){return this.g[this.B]};
h.Fa=function(){return this.B+1<this.g.length?new Ha(this.g,this.B+1,null):wc};h.$=function(){return this.B<this.g.length?this:null};h.R=function(a,b){return new Ha(this.g,this.B,b)};h.Y=function(a,b){return Rc.b?Rc.b(b,this):Rc.call(null,b,this)};Ha.prototype[Ta]=function(){return yc(this)};function Sc(a,b){return b<a.length?new Ha(a,b,null):null}
function M(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;switch(b.length){case 1:return Sc(arguments[0],0);case 2:return Sc(arguments[0],arguments[1]);default:throw Error([y("Invalid arity: "),y(b.length)].join(""));}}function Pc(a,b,c){this.dc=a;this.B=b;this.F=c;this.w=32374990;this.K=8192}h=Pc.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};
h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L.a?L.a(this):L.call(null,this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.O=function(){return this.F};h.Ia=function(){return 0<this.B?new Pc(this.dc,this.B-1,null):null};h.aa=function(){return this.B+1};h.T=function(){return Ac(this)};
h.H=function(a,b){return Qc.b?Qc.b(this,b):Qc.call(null,this,b)};h.ha=function(){var a=this.F;return Tc.b?Tc.b(wc,a):Tc.call(null,wc,a)};h.Ca=function(a,b){return Uc?Uc(b,this):Vc.call(null,b,this)};h.Da=function(a,b,c){return Wc?Wc(b,c,this):Vc.call(null,b,c,this)};h.ia=function(){return eb.b(this.dc,this.B)};h.Fa=function(){return 0<this.B?new Pc(this.dc,this.B-1,null):wc};h.$=function(){return this};h.R=function(a,b){return new Pc(this.dc,this.B,b)};
h.Y=function(a,b){return Rc.b?Rc.b(b,this):Rc.call(null,b,this)};Pc.prototype[Ta]=function(){return yc(this)};function Xc(a){return E(F(a))}function Yc(a){for(;;){var b=F(a);if(null!=b)a=b;else return E(a)}}Eb._=function(a,b){return a===b};
var Zc=function Zc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return Zc.l();case 1:return Zc.a(arguments[0]);case 2:return Zc.b(arguments[0],arguments[1]);default:return c=new Ha(c.slice(2),0,null),Zc.v(arguments[0],arguments[1],c)}};Zc.l=function(){return $c};Zc.a=function(a){return a};Zc.b=function(a,b){return null!=a?cb(a,b):cb(wc,b)};Zc.v=function(a,b,c){for(;;)if(u(c))a=Zc.b(a,b),b=E(c),c=F(c);else return Zc.b(a,b)};
Zc.J=function(a){var b=E(a),c=F(a);a=E(c);c=F(c);return Zc.v(b,a,c)};Zc.I=2;function L(a){if(null!=a)if(null!=a&&(a.w&2||a.Tc))a=a.aa(null);else if(Na(a))a=a.length;else if("string"===typeof a)a=a.length;else if(null!=a&&(a.w&8388608||a.ad))a:{a=r(a);for(var b=0;;){if(Jc(a)){a=b+Za(a);break a}a=F(a);b+=1}}else a=Za(a);else a=0;return a}function ad(a,b,c){for(;;){if(null==a)return c;if(0===b)return r(a)?E(a):c;if(Kc(a))return eb.c(a,b,c);if(r(a))a=F(a),--b;else return c}}
function Mc(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;switch(b.length){case 2:return Lc(arguments[0],arguments[1]);case 3:return N(arguments[0],arguments[1],arguments[2]);default:throw Error([y("Invalid arity: "),y(b.length)].join(""));}}
function Lc(a,b){if("number"!==typeof b)throw Error("index argument to nth must be a number");if(null==a)return a;if(null!=a&&(a.w&16||a.wc))return a.fa(null,b);if(Na(a))return b<a.length?a[b]:null;if("string"===typeof a)return b<a.length?a.charAt(b):null;if(null!=a&&(a.w&64||a.Kb)){var c;a:{c=a;for(var d=b;;){if(null==c)throw Error("Index out of bounds");if(0===d){if(r(c)){c=E(c);break a}throw Error("Index out of bounds");}if(Kc(c)){c=eb.b(c,d);break a}if(r(c))c=F(c),--d;else throw Error("Index out of bounds");
}}return c}if(Pa(db,a))return eb.b(a,b);throw Error([y("nth not supported on this type "),y(Sa(Qa(a)))].join(""));}
function N(a,b,c){if("number"!==typeof b)throw Error("index argument to nth must be a number.");if(null==a)return c;if(null!=a&&(a.w&16||a.wc))return a.Ua(null,b,c);if(Na(a))return b<a.length?a[b]:c;if("string"===typeof a)return b<a.length?a.charAt(b):c;if(null!=a&&(a.w&64||a.Kb))return ad(a,b,c);if(Pa(db,a))return eb.b(a,b);throw Error([y("nth not supported on this type "),y(Sa(Qa(a)))].join(""));}
var qc=function qc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return qc.b(arguments[0],arguments[1]);case 3:return qc.c(arguments[0],arguments[1],arguments[2]);default:throw Error([y("Invalid arity: "),y(c.length)].join(""));}};qc.b=function(a,b){return null==a?null:null!=a&&(a.w&256||a.Uc)?a.Z(null,b):Na(a)?b<a.length?a[b|0]:null:"string"===typeof a?b<a.length?a[b|0]:null:Pa(lb,a)?mb.b(a,b):null};
qc.c=function(a,b,c){return null!=a?null!=a&&(a.w&256||a.Uc)?a.W(null,b,c):Na(a)?b<a.length?a[b]:c:"string"===typeof a?b<a.length?a[b]:c:Pa(lb,a)?mb.c(a,b,c):c:c};qc.I=3;var bd=function bd(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 3:return bd.c(arguments[0],arguments[1],arguments[2]);default:return c=new Ha(c.slice(3),0,null),bd.v(arguments[0],arguments[1],arguments[2],c)}};bd.c=function(a,b,c){return null!=a?ob(a,b,c):cd([b],[c])};
bd.v=function(a,b,c,d){for(;;)if(a=bd.c(a,b,c),u(d))b=E(d),c=Xc(d),d=F(F(d));else return a};bd.J=function(a){var b=E(a),c=F(a);a=E(c);var d=F(c),c=E(d),d=F(d);return bd.v(b,a,c,d)};bd.I=3;var dd=function dd(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return dd.a(arguments[0]);case 2:return dd.b(arguments[0],arguments[1]);default:return c=new Ha(c.slice(2),0,null),dd.v(arguments[0],arguments[1],c)}};dd.a=function(a){return a};
dd.b=function(a,b){return null==a?null:qb(a,b)};dd.v=function(a,b,c){for(;;){if(null==a)return null;a=dd.b(a,b);if(u(c))b=E(c),c=F(c);else return a}};dd.J=function(a){var b=E(a),c=F(a);a=E(c);c=F(c);return dd.v(b,a,c)};dd.I=2;function ed(a,b){this.j=a;this.F=b;this.w=393217;this.K=0}h=ed.prototype;h.O=function(){return this.F};h.R=function(a,b){return new ed(this.j,b)};
h.call=function(){function a(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J,G,U){a=this;return tc.eb?tc.eb(a.j,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J,G,U):tc.call(null,a.j,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J,G,U)}function b(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J,G){a=this;return a.j.ta?a.j.ta(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J,G):a.j.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J,G)}function c(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J){a=this;return a.j.sa?a.j.sa(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,
pa,D,C,J):a.j.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J)}function d(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C){a=this;return a.j.ra?a.j.ra(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C):a.j.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C)}function e(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D){a=this;return a.j.qa?a.j.qa(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D):a.j.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D)}function f(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa){a=this;return a.j.pa?a.j.pa(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,
pa):a.j.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa)}function g(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q){a=this;return a.j.oa?a.j.oa(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q):a.j.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q)}function k(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P){a=this;return a.j.na?a.j.na(b,c,d,e,f,g,k,m,p,t,v,w,x,P):a.j.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P)}function m(a,b,c,d,e,f,g,k,m,p,t,v,w,x){a=this;return a.j.ma?a.j.ma(b,c,d,e,f,g,k,m,p,t,v,w,x):a.j.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x)}function p(a,b,c,d,e,f,
g,k,m,p,t,v,w){a=this;return a.j.la?a.j.la(b,c,d,e,f,g,k,m,p,t,v,w):a.j.call(null,b,c,d,e,f,g,k,m,p,t,v,w)}function t(a,b,c,d,e,f,g,k,m,p,t,v){a=this;return a.j.ka?a.j.ka(b,c,d,e,f,g,k,m,p,t,v):a.j.call(null,b,c,d,e,f,g,k,m,p,t,v)}function v(a,b,c,d,e,f,g,k,m,p,t){a=this;return a.j.ja?a.j.ja(b,c,d,e,f,g,k,m,p,t):a.j.call(null,b,c,d,e,f,g,k,m,p,t)}function w(a,b,c,d,e,f,g,k,m,p){a=this;return a.j.xa?a.j.xa(b,c,d,e,f,g,k,m,p):a.j.call(null,b,c,d,e,f,g,k,m,p)}function x(a,b,c,d,e,f,g,k,m){a=this;return a.j.wa?
a.j.wa(b,c,d,e,f,g,k,m):a.j.call(null,b,c,d,e,f,g,k,m)}function C(a,b,c,d,e,f,g,k){a=this;return a.j.va?a.j.va(b,c,d,e,f,g,k):a.j.call(null,b,c,d,e,f,g,k)}function G(a,b,c,d,e,f,g){a=this;return a.j.ua?a.j.ua(b,c,d,e,f,g):a.j.call(null,b,c,d,e,f,g)}function D(a,b,c,d,e,f){a=this;return a.j.X?a.j.X(b,c,d,e,f):a.j.call(null,b,c,d,e,f)}function J(a,b,c,d,e){a=this;return a.j.G?a.j.G(b,c,d,e):a.j.call(null,b,c,d,e)}function S(a,b,c,d){a=this;return a.j.c?a.j.c(b,c,d):a.j.call(null,b,c,d)}function U(a,
b,c){a=this;return a.j.b?a.j.b(b,c):a.j.call(null,b,c)}function Ma(a,b){a=this;return a.j.a?a.j.a(b):a.j.call(null,b)}function fb(a){a=this;return a.j.l?a.j.l():a.j.call(null)}var K=null,K=function(wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,K,Ya,ab,P,Q,pa,Zb,uc,bf,Be,yg){switch(arguments.length){case 1:return fb.call(this,wa);case 2:return Ma.call(this,wa,Y);case 3:return U.call(this,wa,Y,ba);case 4:return S.call(this,wa,Y,ba,da);case 5:return J.call(this,wa,Y,ba,da,ha);case 6:return D.call(this,wa,Y,ba,da,
ha,ma);case 7:return G.call(this,wa,Y,ba,da,ha,ma,sa);case 8:return C.call(this,wa,Y,ba,da,ha,ma,sa,ua);case 9:return x.call(this,wa,Y,ba,da,ha,ma,sa,ua,za);case 10:return w.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba);case 11:return v.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia);case 12:return t.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,K);case 13:return p.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,K,Ya);case 14:return m.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,K,Ya,ab);case 15:return k.call(this,wa,Y,
ba,da,ha,ma,sa,ua,za,Ba,Ia,K,Ya,ab,P);case 16:return g.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,K,Ya,ab,P,Q);case 17:return f.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,K,Ya,ab,P,Q,pa);case 18:return e.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,K,Ya,ab,P,Q,pa,Zb);case 19:return d.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,K,Ya,ab,P,Q,pa,Zb,uc);case 20:return c.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,K,Ya,ab,P,Q,pa,Zb,uc,bf);case 21:return b.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,K,Ya,ab,P,Q,pa,
Zb,uc,bf,Be);case 22:return a.call(this,wa,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,K,Ya,ab,P,Q,pa,Zb,uc,bf,Be,yg)}throw Error("Invalid arity: "+arguments.length);};K.a=fb;K.b=Ma;K.c=U;K.G=S;K.X=J;K.ua=D;K.va=G;K.wa=C;K.xa=x;K.ja=w;K.ka=v;K.la=t;K.ma=p;K.na=m;K.oa=k;K.pa=g;K.qa=f;K.ra=e;K.sa=d;K.ta=c;K.Tb=b;K.eb=a;return K}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Ua(b)))};h.l=function(){return this.j.l?this.j.l():this.j.call(null)};
h.a=function(a){return this.j.a?this.j.a(a):this.j.call(null,a)};h.b=function(a,b){return this.j.b?this.j.b(a,b):this.j.call(null,a,b)};h.c=function(a,b,c){return this.j.c?this.j.c(a,b,c):this.j.call(null,a,b,c)};h.G=function(a,b,c,d){return this.j.G?this.j.G(a,b,c,d):this.j.call(null,a,b,c,d)};h.X=function(a,b,c,d,e){return this.j.X?this.j.X(a,b,c,d,e):this.j.call(null,a,b,c,d,e)};h.ua=function(a,b,c,d,e,f){return this.j.ua?this.j.ua(a,b,c,d,e,f):this.j.call(null,a,b,c,d,e,f)};
h.va=function(a,b,c,d,e,f,g){return this.j.va?this.j.va(a,b,c,d,e,f,g):this.j.call(null,a,b,c,d,e,f,g)};h.wa=function(a,b,c,d,e,f,g,k){return this.j.wa?this.j.wa(a,b,c,d,e,f,g,k):this.j.call(null,a,b,c,d,e,f,g,k)};h.xa=function(a,b,c,d,e,f,g,k,m){return this.j.xa?this.j.xa(a,b,c,d,e,f,g,k,m):this.j.call(null,a,b,c,d,e,f,g,k,m)};h.ja=function(a,b,c,d,e,f,g,k,m,p){return this.j.ja?this.j.ja(a,b,c,d,e,f,g,k,m,p):this.j.call(null,a,b,c,d,e,f,g,k,m,p)};
h.ka=function(a,b,c,d,e,f,g,k,m,p,t){return this.j.ka?this.j.ka(a,b,c,d,e,f,g,k,m,p,t):this.j.call(null,a,b,c,d,e,f,g,k,m,p,t)};h.la=function(a,b,c,d,e,f,g,k,m,p,t,v){return this.j.la?this.j.la(a,b,c,d,e,f,g,k,m,p,t,v):this.j.call(null,a,b,c,d,e,f,g,k,m,p,t,v)};h.ma=function(a,b,c,d,e,f,g,k,m,p,t,v,w){return this.j.ma?this.j.ma(a,b,c,d,e,f,g,k,m,p,t,v,w):this.j.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w)};
h.na=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x){return this.j.na?this.j.na(a,b,c,d,e,f,g,k,m,p,t,v,w,x):this.j.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x)};h.oa=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C){return this.j.oa?this.j.oa(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C):this.j.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C)};h.pa=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G){return this.j.pa?this.j.pa(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G):this.j.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G)};
h.qa=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D){return this.j.qa?this.j.qa(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D):this.j.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D)};h.ra=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J){return this.j.ra?this.j.ra(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J):this.j.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J)};
h.sa=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S){return this.j.sa?this.j.sa(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S):this.j.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S)};h.ta=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U){return this.j.ta?this.j.ta(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U):this.j.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U)};
h.Tb=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma){return tc.eb?tc.eb(this.j,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma):tc.call(null,this.j,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma)};function Tc(a,b){return"function"==l(a)?new ed(a,b):null==a?null:Bb(a,b)}function fd(a){var b=null!=a;return(b?null!=a?a.w&131072||a.Xc||(a.w?0:Pa(zb,a)):Pa(zb,a):b)?Ab(a):null}function gd(a){return null==a||Oa(r(a))}function hd(a){return null==a?!1:null!=a?a.w&4096||a.Hd?!0:a.w?!1:Pa(ub,a):Pa(ub,a)}
function id(a){return null!=a?a.w&16777216||a.Gd?!0:a.w?!1:Pa(Ib,a):Pa(Ib,a)}function jd(a){return null==a?!1:null!=a?a.w&1024||a.Vc?!0:a.w?!1:Pa(pb,a):Pa(pb,a)}function kd(a){return null!=a?a.w&16384||a.Id?!0:a.w?!1:Pa(vb,a):Pa(vb,a)}function ld(a){return null!=a?a.K&512||a.zd?!0:!1:!1}function md(a){var b=[];ja(a,function(a,b){return function(a,c){return b.push(c)}}(a,b));return b}function nd(a,b,c,d,e){for(;0!==e;)c[d]=a[b],d+=1,--e,b+=1}var od={};
function pd(a){return null==a?!1:!1===a?!1:!0}function qd(a){return"number"===typeof a&&!isNaN(a)&&Infinity!==a&&parseFloat(a)===parseInt(a,10)}function rd(a,b){return qc.c(a,b,od)===od?!1:!0}function Vc(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;switch(b.length){case 2:return Uc(arguments[0],arguments[1]);case 3:return Wc(arguments[0],arguments[1],arguments[2]);default:throw Error([y("Invalid arity: "),y(b.length)].join(""));}}
function Uc(a,b){var c=r(b);if(c){var d=E(c),c=F(c);return Va?Va(a,d,c):Wa.call(null,a,d,c)}return a.l?a.l():a.call(null)}function Wc(a,b,c){for(c=r(c);;)if(c){var d=E(c);b=a.b?a.b(b,d):a.call(null,b,d);c=F(c)}else return b}
function Wa(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;switch(b.length){case 2:return sd(arguments[0],arguments[1]);case 3:return Va(arguments[0],arguments[1],arguments[2]);default:throw Error([y("Invalid arity: "),y(b.length)].join(""));}}function sd(a,b){return null!=b&&(b.w&524288||b.Zc)?b.Ca(null,a):Na(b)?Gc(b,a):"string"===typeof b?Gc(b,a):Pa(Cb,b)?Db.b(b,a):Uc(a,b)}
function Va(a,b,c){return null!=c&&(c.w&524288||c.Zc)?c.Da(null,a,b):Na(c)?Hc(c,a,b):"string"===typeof c?Hc(c,a,b):Pa(Cb,c)?Db.c(c,a,b):Wc(a,b,c)}function td(a){return a}var ud=function ud(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return ud.l();case 1:return ud.a(arguments[0]);case 2:return ud.b(arguments[0],arguments[1]);default:return c=new Ha(c.slice(2),0,null),ud.v(arguments[0],arguments[1],c)}};ud.l=function(){return 0};
ud.a=function(a){return a};ud.b=function(a,b){return a+b};ud.v=function(a,b,c){return Va(ud,a+b,c)};ud.J=function(a){var b=E(a),c=F(a);a=E(c);c=F(c);return ud.v(b,a,c)};ud.I=2;function vd(a){if("number"===typeof a)return String.fromCharCode(a);if("string"===typeof a&&1===a.length)return a;throw Error("Argument to char must be a character or number");}function wd(a){return 0<=a?Math.floor(a):Math.ceil(a)}function xd(a,b){return wd((a-a%b)/b)}function yd(a,b){return a-b*xd(a,b)}
function zd(a){a-=a>>1&1431655765;a=(a&858993459)+(a>>2&858993459);return 16843009*(a+(a>>4)&252645135)>>24}function Ad(a,b){for(var c=b,d=r(a);;)if(d&&0<c)--c,d=F(d);else return d}var y=function y(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return y.l();case 1:return y.a(arguments[0]);default:return c=new Ha(c.slice(1),0,null),y.v(arguments[0],c)}};y.l=function(){return""};y.a=function(a){return null==a?"":""+a};
y.v=function(a,b){for(var c=new ka(""+y(a)),d=b;;)if(u(d))c=c.append(""+y(E(d))),d=F(d);else return c.toString()};y.J=function(a){var b=E(a);a=F(a);return y.v(b,a)};y.I=1;function Bd(a,b){return a.substring(b)}function Qc(a,b){var c;if(id(b))if(Jc(a)&&Jc(b)&&L(a)!==L(b))c=!1;else a:{c=r(a);for(var d=r(b);;){if(null==c){c=null==d;break a}if(null!=d&&B.b(E(c),E(d)))c=F(c),d=F(d);else{c=!1;break a}}}else c=null;return pd(c)}
function Cd(a){var b=0;for(a=r(a);;)if(a){var c=E(a),b=(b+(oc(Dd.a?Dd.a(c):Dd.call(null,c))^oc(Ed.a?Ed.a(c):Ed.call(null,c))))%4503599627370496;a=F(a)}else return b}function Fd(a,b,c,d,e){this.F=a;this.first=b;this.Ga=c;this.count=d;this.A=e;this.w=65937646;this.K=8192}h=Fd.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};
h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,this.count)}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.O=function(){return this.F};h.Ia=function(){return 1===this.count?null:this.Ga};h.aa=function(){return this.count};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Ac(this)};h.H=function(a,b){return Qc(this,b)};
h.ha=function(){return Bb(wc,this.F)};h.Ca=function(a,b){return Uc(b,this)};h.Da=function(a,b,c){return Wc(b,c,this)};h.ia=function(){return this.first};h.Fa=function(){return 1===this.count?wc:this.Ga};h.$=function(){return this};h.R=function(a,b){return new Fd(b,this.first,this.Ga,this.count,this.A)};h.Y=function(a,b){return new Fd(this.F,b,this,this.count+1,null)};Fd.prototype[Ta]=function(){return yc(this)};function Gd(a){this.F=a;this.w=65937614;this.K=8192}h=Gd.prototype;h.toString=function(){return fc(this)};
h.equiv=function(a){return this.H(null,a)};h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L(this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.O=function(){return this.F};h.Ia=function(){return null};h.aa=function(){return 0};h.T=function(){return Bc};h.H=function(a,b){return(null!=b?b.w&33554432||b.Dd||(b.w?0:Pa(Jb,b)):Pa(Jb,b))||id(b)?null==r(b):!1};h.ha=function(){return this};
h.Ca=function(a,b){return Uc(b,this)};h.Da=function(a,b,c){return Wc(b,c,this)};h.ia=function(){return null};h.Fa=function(){return wc};h.$=function(){return null};h.R=function(a,b){return new Gd(b)};h.Y=function(a,b){return new Fd(this.F,b,null,1,null)};var wc=new Gd(null);Gd.prototype[Ta]=function(){return yc(this)};function Hd(a){return(null!=a?a.w&134217728||a.Fd||(a.w?0:Pa(Kb,a)):Pa(Kb,a))?Lb(a):Va(Zc,wc,a)}
var Id=function Id(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ha(c.slice(0),0,null):null;return Id.v(c)};Id.v=function(a){var b;if(a instanceof Ha&&0===a.B)b=a.g;else a:for(b=[];;)if(null!=a)b.push(a.ia(null)),a=a.Ia(null);else break a;a=b.length;for(var c=wc;;)if(0<a){var d=a-1,c=c.Y(null,b[a-1]);a=d}else return c};Id.I=0;Id.J=function(a){return Id.v(r(a))};
function Jd(a,b,c,d){this.F=a;this.first=b;this.Ga=c;this.A=d;this.w=65929452;this.K=8192}h=Jd.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L(this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.O=function(){return this.F};h.Ia=function(){return null==this.Ga?null:r(this.Ga)};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Ac(this)};h.H=function(a,b){return Qc(this,b)};h.ha=function(){return Tc(wc,this.F)};
h.Ca=function(a,b){return Uc(b,this)};h.Da=function(a,b,c){return Wc(b,c,this)};h.ia=function(){return this.first};h.Fa=function(){return null==this.Ga?wc:this.Ga};h.$=function(){return this};h.R=function(a,b){return new Jd(b,this.first,this.Ga,this.A)};h.Y=function(a,b){return new Jd(null,b,this,null)};Jd.prototype[Ta]=function(){return yc(this)};function Rc(a,b){var c=null==b;return(c?c:null!=b&&(b.w&64||b.Kb))?new Jd(null,a,b,null):new Jd(null,a,r(b),null)}
function O(a,b,c,d){this.Qb=a;this.name=b;this.ca=c;this.Ib=d;this.w=2153775105;this.K=4096}h=O.prototype;h.toString=function(){return[y(":"),y(this.ca)].join("")};h.equiv=function(a){return this.H(null,a)};h.H=function(a,b){return b instanceof O?this.ca===b.ca:!1};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return qc.b(c,this);case 3:return qc.c(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return qc.b(c,this)};a.c=function(a,c,d){return qc.c(c,this,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Ua(b)))};h.a=function(a){return qc.b(a,this)};h.b=function(a,b){return qc.c(a,this,b)};
h.T=function(){var a=this.Ib;return null!=a?a:this.Ib=a=pc(kc(this.name),nc(this.Qb))+2654435769|0};h.Ub=function(){return this.name};h.Vb=function(){return this.Qb};h.V=function(a,b){return z(b,[y(":"),y(this.ca)].join(""))};function R(a,b){return a===b?!0:a instanceof O&&b instanceof O?a.ca===b.ca:!1}function Kd(a){if(null!=a&&(a.K&4096||a.Yc))return a.Vb(null);throw Error([y("Doesn't support namespace: "),y(a)].join(""));}
var Ld=function Ld(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return Ld.a(arguments[0]);case 2:return Ld.b(arguments[0],arguments[1]);default:throw Error([y("Invalid arity: "),y(c.length)].join(""));}};Ld.a=function(a){if(a instanceof O)return a;if(a instanceof A)return new O(Kd(a),Md.a?Md.a(a):Md.call(null,a),a.zb,null);if("string"===typeof a){var b=a.split("/");return 2===b.length?new O(b[0],b[1],a,null):new O(null,b[0],a,null)}return null};
Ld.b=function(a,b){return new O(a,b,[y(u(a)?[y(a),y("/")].join(""):null),y(b)].join(""),null)};Ld.I=2;function Nd(a,b,c,d){this.F=a;this.Eb=b;this.S=c;this.A=d;this.w=32374988;this.K=1}h=Nd.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};function Od(a){null!=a.Eb&&(a.S=a.Eb.l?a.Eb.l():a.Eb.call(null),a.Eb=null);return a.S}
h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L(this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.O=function(){return this.F};h.Ia=function(){Hb(this);return null==this.S?null:F(this.S)};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Ac(this)};h.H=function(a,b){return Qc(this,b)};
h.ha=function(){return Tc(wc,this.F)};h.xc=function(){return Oa(this.Eb)};h.Ca=function(a,b){return Uc(b,this)};h.Da=function(a,b,c){return Wc(b,c,this)};h.ia=function(){Hb(this);return null==this.S?null:E(this.S)};h.Fa=function(){Hb(this);return null!=this.S?vc(this.S):wc};h.$=function(){Od(this);if(null==this.S)return null;for(var a=this.S;;)if(a instanceof Nd)a=Od(a);else return this.S=a,r(this.S)};h.R=function(a,b){return new Nd(b,this.Eb,this.S,this.A)};h.Y=function(a,b){return Rc(b,this)};
Nd.prototype[Ta]=function(){return yc(this)};function Pd(a,b){this.ic=a;this.end=b;this.w=2;this.K=0}Pd.prototype.add=function(a){this.ic[this.end]=a;return this.end+=1};Pd.prototype.za=function(){var a=new Qd(this.ic,0,this.end);this.ic=null;return a};Pd.prototype.aa=function(){return this.end};function Rd(a){return new Pd(Array(a),0)}function Qd(a,b,c){this.g=a;this.Ba=b;this.end=c;this.w=524306;this.K=0}h=Qd.prototype;h.aa=function(){return this.end-this.Ba};
h.fa=function(a,b){return this.g[this.Ba+b]};h.Ua=function(a,b,c){return 0<=b&&b<this.end-this.Ba?this.g[this.Ba+b]:c};h.uc=function(){if(this.Ba===this.end)throw Error("-drop-first of empty chunk");return new Qd(this.g,this.Ba+1,this.end)};h.Ca=function(a,b){return Ic(this.g,b,this.g[this.Ba],this.Ba+1)};h.Da=function(a,b,c){return Ic(this.g,b,c,this.Ba)};function Sd(a,b,c,d){this.za=a;this.hb=b;this.F=c;this.A=d;this.w=31850732;this.K=1536}h=Sd.prototype;h.toString=function(){return fc(this)};
h.equiv=function(a){return this.H(null,a)};h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L(this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.O=function(){return this.F};h.Ia=function(){if(1<Za(this.za))return new Sd(Vb(this.za),this.hb,this.F,null);var a=Hb(this.hb);return null==a?null:a};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Ac(this)};
h.H=function(a,b){return Qc(this,b)};h.ha=function(){return Tc(wc,this.F)};h.ia=function(){return eb.b(this.za,0)};h.Fa=function(){return 1<Za(this.za)?new Sd(Vb(this.za),this.hb,this.F,null):null==this.hb?wc:this.hb};h.$=function(){return this};h.lc=function(){return this.za};h.mc=function(){return null==this.hb?wc:this.hb};h.R=function(a,b){return new Sd(this.za,this.hb,b,this.A)};h.Y=function(a,b){return Rc(b,this)};h.kc=function(){return null==this.hb?null:this.hb};Sd.prototype[Ta]=function(){return yc(this)};
function Td(a,b){return 0===Za(a)?b:new Sd(a,b,null,null)}function Ud(a,b){a.add(b)}function Vd(a){for(var b=[];;)if(r(a))b.push(E(a)),a=F(a);else return b}function Wd(a,b){if(Jc(a))return L(a);for(var c=a,d=b,e=0;;)if(0<d&&r(c))c=F(c),--d,e+=1;else return e}
var Xd=function Xd(b){return null==b?null:null==F(b)?r(E(b)):Rc(E(b),Xd(F(b)))},Yd=function Yd(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return Yd.l();case 1:return Yd.a(arguments[0]);case 2:return Yd.b(arguments[0],arguments[1]);default:return c=new Ha(c.slice(2),0,null),Yd.v(arguments[0],arguments[1],c)}};Yd.l=function(){return new Nd(null,function(){return null},null,null)};
Yd.a=function(a){return new Nd(null,function(){return a},null,null)};Yd.b=function(a,b){return new Nd(null,function(){var c=r(a);return c?ld(c)?Td(Wb(c),Yd.b(Xb(c),b)):Rc(E(c),Yd.b(vc(c),b)):b},null,null)};Yd.v=function(a,b,c){return function e(a,b){return new Nd(null,function(){var c=r(a);return c?ld(c)?Td(Wb(c),e(Xb(c),b)):Rc(E(c),e(vc(c),b)):u(b)?e(E(b),F(b)):null},null,null)}(Yd.b(a,b),c)};Yd.J=function(a){var b=E(a),c=F(a);a=E(c);c=F(c);return Yd.v(b,a,c)};Yd.I=2;
var Zd=function Zd(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return Zd.l();case 1:return Zd.a(arguments[0]);case 2:return Zd.b(arguments[0],arguments[1]);default:return c=new Ha(c.slice(2),0,null),Zd.v(arguments[0],arguments[1],c)}};Zd.l=function(){return Qb($c)};Zd.a=function(a){return a};Zd.b=function(a,b){return Rb(a,b)};Zd.v=function(a,b,c){for(;;)if(a=Rb(a,b),u(c))b=E(c),c=F(c);else return a};
Zd.J=function(a){var b=E(a),c=F(a);a=E(c);c=F(c);return Zd.v(b,a,c)};Zd.I=2;
function $d(a,b,c){var d=r(c);if(0===b)return a.l?a.l():a.call(null);c=hb(d);var e=jb(d);if(1===b)return a.a?a.a(c):a.a?a.a(c):a.call(null,c);var d=hb(e),f=jb(e);if(2===b)return a.b?a.b(c,d):a.b?a.b(c,d):a.call(null,c,d);var e=hb(f),g=jb(f);if(3===b)return a.c?a.c(c,d,e):a.c?a.c(c,d,e):a.call(null,c,d,e);var f=hb(g),k=jb(g);if(4===b)return a.G?a.G(c,d,e,f):a.G?a.G(c,d,e,f):a.call(null,c,d,e,f);var g=hb(k),m=jb(k);if(5===b)return a.X?a.X(c,d,e,f,g):a.X?a.X(c,d,e,f,g):a.call(null,c,d,e,f,g);var k=hb(m),
p=jb(m);if(6===b)return a.ua?a.ua(c,d,e,f,g,k):a.ua?a.ua(c,d,e,f,g,k):a.call(null,c,d,e,f,g,k);var m=hb(p),t=jb(p);if(7===b)return a.va?a.va(c,d,e,f,g,k,m):a.va?a.va(c,d,e,f,g,k,m):a.call(null,c,d,e,f,g,k,m);var p=hb(t),v=jb(t);if(8===b)return a.wa?a.wa(c,d,e,f,g,k,m,p):a.wa?a.wa(c,d,e,f,g,k,m,p):a.call(null,c,d,e,f,g,k,m,p);var t=hb(v),w=jb(v);if(9===b)return a.xa?a.xa(c,d,e,f,g,k,m,p,t):a.xa?a.xa(c,d,e,f,g,k,m,p,t):a.call(null,c,d,e,f,g,k,m,p,t);var v=hb(w),x=jb(w);if(10===b)return a.ja?a.ja(c,
d,e,f,g,k,m,p,t,v):a.ja?a.ja(c,d,e,f,g,k,m,p,t,v):a.call(null,c,d,e,f,g,k,m,p,t,v);var w=hb(x),C=jb(x);if(11===b)return a.ka?a.ka(c,d,e,f,g,k,m,p,t,v,w):a.ka?a.ka(c,d,e,f,g,k,m,p,t,v,w):a.call(null,c,d,e,f,g,k,m,p,t,v,w);var x=hb(C),G=jb(C);if(12===b)return a.la?a.la(c,d,e,f,g,k,m,p,t,v,w,x):a.la?a.la(c,d,e,f,g,k,m,p,t,v,w,x):a.call(null,c,d,e,f,g,k,m,p,t,v,w,x);var C=hb(G),D=jb(G);if(13===b)return a.ma?a.ma(c,d,e,f,g,k,m,p,t,v,w,x,C):a.ma?a.ma(c,d,e,f,g,k,m,p,t,v,w,x,C):a.call(null,c,d,e,f,g,k,m,
p,t,v,w,x,C);var G=hb(D),J=jb(D);if(14===b)return a.na?a.na(c,d,e,f,g,k,m,p,t,v,w,x,C,G):a.na?a.na(c,d,e,f,g,k,m,p,t,v,w,x,C,G):a.call(null,c,d,e,f,g,k,m,p,t,v,w,x,C,G);var D=hb(J),S=jb(J);if(15===b)return a.oa?a.oa(c,d,e,f,g,k,m,p,t,v,w,x,C,G,D):a.oa?a.oa(c,d,e,f,g,k,m,p,t,v,w,x,C,G,D):a.call(null,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D);var J=hb(S),U=jb(S);if(16===b)return a.pa?a.pa(c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J):a.pa?a.pa(c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J):a.call(null,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J);var S=
hb(U),Ma=jb(U);if(17===b)return a.qa?a.qa(c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S):a.qa?a.qa(c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S):a.call(null,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S);var U=hb(Ma),fb=jb(Ma);if(18===b)return a.ra?a.ra(c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U):a.ra?a.ra(c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U):a.call(null,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U);Ma=hb(fb);fb=jb(fb);if(19===b)return a.sa?a.sa(c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma):a.sa?a.sa(c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma):a.call(null,
c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma);var K=hb(fb);jb(fb);if(20===b)return a.ta?a.ta(c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma,K):a.ta?a.ta(c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma,K):a.call(null,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma,K);throw Error("Only up to 20 arguments supported on functions");}
function tc(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;switch(b.length){case 2:return ae(arguments[0],arguments[1]);case 3:return be(arguments[0],arguments[1],arguments[2]);case 4:return ce(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return de(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:return b=new Ha(b.slice(5),0,null),ee(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],b)}}
function ae(a,b){var c=a.I;if(a.J){var d=Wd(b,c+1);return d<=c?$d(a,d,b):a.J(b)}return a.apply(a,Vd(b))}function be(a,b,c){b=Rc(b,c);c=a.I;if(a.J){var d=Wd(b,c+1);return d<=c?$d(a,d,b):a.J(b)}return a.apply(a,Vd(b))}function ce(a,b,c,d){b=Rc(b,Rc(c,d));c=a.I;return a.J?(d=Wd(b,c+1),d<=c?$d(a,d,b):a.J(b)):a.apply(a,Vd(b))}function de(a,b,c,d,e){b=Rc(b,Rc(c,Rc(d,e)));c=a.I;return a.J?(d=Wd(b,c+1),d<=c?$d(a,d,b):a.J(b)):a.apply(a,Vd(b))}
function ee(a,b,c,d,e,f){b=Rc(b,Rc(c,Rc(d,Rc(e,Xd(f)))));c=a.I;return a.J?(d=Wd(b,c+1),d<=c?$d(a,d,b):a.J(b)):a.apply(a,Vd(b))}function fe(a){return r(a)?a:null}
var ge=function ge(){"undefined"===typeof la&&(la=function(b,c){this.sd=b;this.kd=c;this.w=393216;this.K=0},la.prototype.R=function(b,c){return new la(this.sd,c)},la.prototype.O=function(){return this.kd},la.prototype.ya=function(){return!1},la.prototype.next=function(){return Error("No such element")},la.prototype.remove=function(){return Error("Unsupported operation")},la.Ob=function(){return new T(null,2,5,V,[Tc(he,new q(null,1,[ie,Id(je,Id($c))],null)),ke],null)},la.ub=!0,la.gb="cljs.core/t_cljs$core11833",
la.Bb=function(b,c){return z(c,"cljs.core/t_cljs$core11833")});return new la(ge,W)};function le(a,b){for(;;){if(null==r(b))return!0;var c;c=E(b);c=a.a?a.a(c):a.call(null,c);if(u(c)){c=a;var d=F(b);a=c;b=d}else return!1}}function me(a,b){for(;;)if(r(b)){var c;c=E(b);c=a.a?a.a(c):a.call(null,c);if(u(c))return c;c=a;var d=F(b);a=c;b=d}else return null}function ne(a,b,c,d){this.state=a;this.F=b;this.yd=c;this.Rc=d;this.K=16386;this.w=6455296}h=ne.prototype;h.equiv=function(a){return this.H(null,a)};
h.H=function(a,b){return this===b};h.Sb=function(){return this.state};h.O=function(){return this.F};h.zc=function(a,b,c){a=r(this.Rc);for(var d=null,e=0,f=0;;)if(f<e){var g=d.fa(null,f),k=N(g,0,null),g=N(g,1,null);g.G?g.G(k,this,b,c):g.call(null,k,this,b,c);f+=1}else if(a=r(a))ld(a)?(d=Wb(a),a=Xb(a),k=d,e=L(d),d=k):(d=E(a),k=N(d,0,null),g=N(d,1,null),g.G?g.G(k,this,b,c):g.call(null,k,this,b,c),a=F(a),d=null,e=0),f=0;else return null};h.T=function(){return aa(this)};
function oe(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;switch(b.length){case 1:return pe(arguments[0]);default:return c=new Ha(b.slice(1),0,null),b=arguments[0],d=null!=c&&(c.w&64||c.Kb)?ae(qe,c):c,c=qc.b(d,Da),d=qc.b(d,re),new ne(b,c,d,null)}}function pe(a){return new ne(a,null,null,null)}
function se(a,b){if(a instanceof ne){var c=a.yd;if(null!=c&&!u(c.a?c.a(b):c.call(null,b)))throw Error([y("Assert failed: "),y("Validator rejected reference state"),y("\n"),y("(validate new-value)")].join(""));c=a.state;a.state=b;null!=a.Rc&&Pb(a,c,b);return b}return bc(a,b)}
var te=function te(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return te.b(arguments[0],arguments[1]);case 3:return te.c(arguments[0],arguments[1],arguments[2]);case 4:return te.G(arguments[0],arguments[1],arguments[2],arguments[3]);default:return c=new Ha(c.slice(4),0,null),te.v(arguments[0],arguments[1],arguments[2],arguments[3],c)}};
te.b=function(a,b){var c;a instanceof ne?(c=a.state,c=b.a?b.a(c):b.call(null,c),c=se(a,c)):c=cc.b(a,b);return c};te.c=function(a,b,c){if(a instanceof ne){var d=a.state;b=b.b?b.b(d,c):b.call(null,d,c);a=se(a,b)}else a=cc.c(a,b,c);return a};te.G=function(a,b,c,d){if(a instanceof ne){var e=a.state;b=b.c?b.c(e,c,d):b.call(null,e,c,d);a=se(a,b)}else a=cc.G(a,b,c,d);return a};te.v=function(a,b,c,d,e){return a instanceof ne?se(a,de(b,a.state,c,d,e)):cc.X(a,b,c,d,e)};
te.J=function(a){var b=E(a),c=F(a);a=E(c);var d=F(c),c=E(d),e=F(d),d=E(e),e=F(e);return te.v(b,a,c,d,e)};te.I=4;
var ue=function ue(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return ue.a(arguments[0]);case 2:return ue.b(arguments[0],arguments[1]);case 3:return ue.c(arguments[0],arguments[1],arguments[2]);case 4:return ue.G(arguments[0],arguments[1],arguments[2],arguments[3]);default:return c=new Ha(c.slice(4),0,null),ue.v(arguments[0],arguments[1],arguments[2],arguments[3],c)}};
ue.a=function(a){return function(b){return function(){function c(c,d){var e=a.a?a.a(d):a.call(null,d);return b.b?b.b(c,e):b.call(null,c,e)}function d(a){return b.a?b.a(a):b.call(null,a)}function e(){return b.l?b.l():b.call(null)}var f=null,g=function(){function c(a,b,e){var f=null;if(2<arguments.length){for(var f=0,g=Array(arguments.length-2);f<g.length;)g[f]=arguments[f+2],++f;f=new Ha(g,0)}return d.call(this,a,b,f)}function d(c,e,f){e=be(a,e,f);return b.b?b.b(c,e):b.call(null,c,e)}c.I=2;c.J=function(a){var b=
E(a);a=F(a);var c=E(a);a=vc(a);return d(b,c,a)};c.v=d;return c}(),f=function(a,b,f){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b);default:var t=null;if(2<arguments.length){for(var t=0,v=Array(arguments.length-2);t<v.length;)v[t]=arguments[t+2],++t;t=new Ha(v,0)}return g.v(a,b,t)}throw Error("Invalid arity: "+arguments.length);};f.I=2;f.J=g.J;f.l=e;f.a=d;f.b=c;f.v=g.v;return f}()}};
ue.b=function(a,b){return new Nd(null,function(){var c=r(b);if(c){if(ld(c)){for(var d=Wb(c),e=L(d),f=Rd(e),g=0;;)if(g<e)Ud(f,function(){var b=eb.b(d,g);return a.a?a.a(b):a.call(null,b)}()),g+=1;else break;return Td(f.za(),ue.b(a,Xb(c)))}return Rc(function(){var b=E(c);return a.a?a.a(b):a.call(null,b)}(),ue.b(a,vc(c)))}return null},null,null)};
ue.c=function(a,b,c){return new Nd(null,function(){var d=r(b),e=r(c);if(d&&e){var f=Rc,g;g=E(d);var k=E(e);g=a.b?a.b(g,k):a.call(null,g,k);d=f(g,ue.c(a,vc(d),vc(e)))}else d=null;return d},null,null)};ue.G=function(a,b,c,d){return new Nd(null,function(){var e=r(b),f=r(c),g=r(d);if(e&&f&&g){var k=Rc,m;m=E(e);var p=E(f),t=E(g);m=a.c?a.c(m,p,t):a.call(null,m,p,t);e=k(m,ue.G(a,vc(e),vc(f),vc(g)))}else e=null;return e},null,null)};
ue.v=function(a,b,c,d,e){var f=function k(a){return new Nd(null,function(){var b=ue.b(r,a);return le(td,b)?Rc(ue.b(E,b),k(ue.b(vc,b))):null},null,null)};return ue.b(function(){return function(b){return ae(a,b)}}(f),f(Zc.v(e,d,M([c,b],0))))};ue.J=function(a){var b=E(a),c=F(a);a=E(c);var d=F(c),c=E(d),e=F(d),d=E(e),e=F(e);return ue.v(b,a,c,d,e)};ue.I=4;
function ve(a,b){if("number"!==typeof a)throw Error("Assert failed: (number? n)");return new Nd(null,function(){if(0<a){var c=r(b);return c?Rc(E(c),ve(a-1,vc(c))):null}return null},null,null)}function we(a,b){if("number"!==typeof a)throw Error("Assert failed: (number? n)");return new Nd(null,function(c){return function(){return c(a,b)}}(function(a,b){for(;;){var e=r(b);if(0<a&&e){var f=a-1,e=vc(e);a=f;b=e}else return e}}),null,null)}function xe(a){return ue.c(function(a){return a},a,we(1,a))}
function ye(a){return new Nd(null,function(){return Rc(a,ye(a))},null,null)}function ze(a,b){return ve(a,ye(b))}function Ae(a){return new Nd(null,function(){return Rc(a.l?a.l():a.call(null),Ae(a))},null,null)}function Ce(a,b){return ve(a,Ae(b))}var De=function De(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return De.b(arguments[0],arguments[1]);default:return c=new Ha(c.slice(2),0,null),De.v(arguments[0],arguments[1],c)}};
De.b=function(a,b){return new Nd(null,function(){var c=r(a),d=r(b);return c&&d?Rc(E(c),Rc(E(d),De.b(vc(c),vc(d)))):null},null,null)};De.v=function(a,b,c){return new Nd(null,function(){var d=ue.b(r,Zc.v(c,b,M([a],0)));return le(td,d)?Yd.b(ue.b(E,d),ae(De,ue.b(vc,d))):null},null,null)};De.J=function(a){var b=E(a),c=F(a);a=E(c);c=F(c);return De.v(b,a,c)};De.I=2;function Ee(a,b){return ae(Yd,be(ue,a,b))}
function Fe(a,b){return new Nd(null,function(){var c=r(b);if(c){if(ld(c)){for(var d=Wb(c),e=L(d),f=Rd(e),g=0;;)if(g<e){var k;k=eb.b(d,g);k=a.a?a.a(k):a.call(null,k);u(k)&&(k=eb.b(d,g),f.add(k));g+=1}else break;return Td(f.za(),Fe(a,Xb(c)))}d=E(c);c=vc(c);return u(a.a?a.a(d):a.call(null,d))?Rc(d,Fe(a,c)):Fe(a,c)}return null},null,null)}function Ge(a,b){return null!=a?null!=a&&(a.K&4||a.Bd)?Tc(Sb(Va(Rb,Qb(a),b)),fd(a)):Va(cb,a,b):Va(Zc,wc,b)}function He(a,b){this.ba=a;this.g=b}
function Ie(a){return new He(a,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null])}function Je(a){a=a.C;return 32>a?0:a-1>>>5<<5}function Ke(a,b,c){for(;;){if(0===b)return c;var d=Ie(a);d.g[0]=c;c=d;b-=5}}var Le=function Le(b,c,d,e){var f=new He(d.ba,Ua(d.g)),g=b.C-1>>>c&31;5===c?f.g[g]=e:(d=d.g[g],b=null!=d?Le(b,c-5,d,e):Ke(null,c-5,e),f.g[g]=b);return f};
function Me(a,b){throw Error([y("No item "),y(a),y(" in vector of length "),y(b)].join(""));}function Ne(a,b){if(b>=Je(a))return a.Ha;for(var c=a.root,d=a.shift;;)if(0<d)var e=d-5,c=c.g[b>>>d&31],d=e;else return c.g}function Oe(a,b){return 0<=b&&b<a.C?Ne(a,b):Me(b,a.C)}var Pe=function Pe(b,c,d,e,f){var g=new He(d.ba,Ua(d.g));if(0===c)g.g[e&31]=f;else{var k=e>>>c&31;b=Pe(b,c-5,d.g[k],e,f);g.g[k]=b}return g};function Qe(a,b,c,d,e,f){this.B=a;this.hc=b;this.g=c;this.jb=d;this.start=e;this.end=f}
Qe.prototype.ya=function(){return this.B<this.end};Qe.prototype.next=function(){32===this.B-this.hc&&(this.g=Ne(this.jb,this.B),this.hc+=32);var a=this.g[this.B&31];this.B+=1;return a};function T(a,b,c,d,e,f){this.F=a;this.C=b;this.shift=c;this.root=d;this.Ha=e;this.A=f;this.w=167668511;this.K=8196}h=T.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};
h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L(this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.Z=function(a,b){return mb.c(this,b,null)};h.W=function(a,b,c){return"number"===typeof b?eb.c(this,b,c):c};h.fa=function(a,b){return Oe(this,b)[b&31]};h.Ua=function(a,b,c){return 0<=b&&b<this.C?Ne(this,b)[b&31]:c};
h.pc=function(a,b,c){if(0<=b&&b<this.C)return Je(this)<=b?(a=Ua(this.Ha),a[b&31]=c,new T(this.F,this.C,this.shift,this.root,a,null)):new T(this.F,this.C,this.shift,Pe(this,this.shift,this.root,b,c),this.Ha,null);if(b===this.C)return cb(this,c);throw Error([y("Index "),y(b),y(" out of bounds  [0,"),y(this.C),y("]")].join(""));};h.Aa=function(){var a=this.C;return new Qe(0,0,0<L(this)?Ne(this,0):null,this,0,a)};h.O=function(){return this.F};h.aa=function(){return this.C};
h.nc=function(){return eb.b(this,0)};h.oc=function(){return eb.b(this,1)};h.fc=function(){return 0<this.C?new Pc(this,this.C-1,null):null};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Ac(this)};h.H=function(a,b){if(b instanceof T)if(this.C===L(b))for(var c=dc(this),d=dc(b);;)if(u(c.ya())){var e=c.next(),f=d.next();if(!B.b(e,f))return!1}else return!0;else return!1;else return Qc(this,b)};
h.Jb=function(){return new Re(this.C,this.shift,Se.a?Se.a(this.root):Se.call(null,this.root),Te.a?Te.a(this.Ha):Te.call(null,this.Ha))};h.ha=function(){return Tc($c,this.F)};h.Ca=function(a,b){return Ec(this,b)};h.Da=function(a,b,c){a=0;for(var d=c;;)if(a<this.C){var e=Ne(this,a);c=e.length;a:for(var f=0;;)if(f<c)var g=e[f],d=b.b?b.b(d,g):b.call(null,d,g),f=f+1;else{e=d;break a}a+=c;d=e}else return d};
h.Ta=function(a,b,c){if("number"===typeof b)return wb(this,b,c);throw Error("Vector's key for assoc must be a number.");};h.$=function(){if(0===this.C)return null;if(32>=this.C)return new Ha(this.Ha,0,null);var a;a:{a=this.root;for(var b=this.shift;;)if(0<b)b-=5,a=a.g[0];else{a=a.g;break a}}return Ue?Ue(this,a,0,0):Ve.call(null,this,a,0,0)};h.R=function(a,b){return new T(b,this.C,this.shift,this.root,this.Ha,this.A)};
h.Y=function(a,b){if(32>this.C-Je(this)){for(var c=this.Ha.length,d=Array(c+1),e=0;;)if(e<c)d[e]=this.Ha[e],e+=1;else break;d[c]=b;return new T(this.F,this.C+1,this.shift,this.root,d,null)}c=(d=this.C>>>5>1<<this.shift)?this.shift+5:this.shift;d?(d=Ie(null),d.g[0]=this.root,e=Ke(null,this.shift,new He(null,this.Ha)),d.g[1]=e):d=Le(this,this.shift,this.root,new He(null,this.Ha));return new T(this.F,this.C+1,c,d,[b],null)};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.fa(null,c);case 3:return this.Ua(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return this.fa(null,c)};a.c=function(a,c,d){return this.Ua(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Ua(b)))};h.a=function(a){return this.fa(null,a)};h.b=function(a,b){return this.Ua(null,a,b)};
var V=new He(null,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]),$c=new T(null,0,5,V,[],Bc);T.prototype[Ta]=function(){return yc(this)};function We(a){if(Na(a))a:{var b=a.length;if(32>b)a=new T(null,b,5,V,a,null);else for(var c=a.slice(0,32),d=32,e=(new T(null,32,5,V,c,null)).Jb(null);;)if(d<b)c=d+1,e=Zd.b(e,a[d]),d=c;else{a=Sb(e);break a}}else a=Sb(Va(Rb,Qb($c),a));return a}
function Xe(a,b,c,d,e,f){this.Va=a;this.node=b;this.B=c;this.Ba=d;this.F=e;this.A=f;this.w=32375020;this.K=1536}h=Xe.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L(this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.O=function(){return this.F};h.Ia=function(){if(this.Ba+1<this.node.length){var a;a=this.Va;var b=this.node,c=this.B,d=this.Ba+1;a=Ue?Ue(a,b,c,d):Ve.call(null,a,b,c,d);return null==a?null:a}return Yb(this)};
h.T=function(){var a=this.A;return null!=a?a:this.A=a=Ac(this)};h.H=function(a,b){return Qc(this,b)};h.ha=function(){return Tc($c,this.F)};h.Ca=function(a,b){var c;c=this.Va;var d=this.B+this.Ba,e=L(this.Va);c=Ye?Ye(c,d,e):Ze.call(null,c,d,e);return Ec(c,b)};h.Da=function(a,b,c){a=this.Va;var d=this.B+this.Ba,e=L(this.Va);a=Ye?Ye(a,d,e):Ze.call(null,a,d,e);return Fc(a,b,c)};h.ia=function(){return this.node[this.Ba]};
h.Fa=function(){if(this.Ba+1<this.node.length){var a;a=this.Va;var b=this.node,c=this.B,d=this.Ba+1;a=Ue?Ue(a,b,c,d):Ve.call(null,a,b,c,d);return null==a?wc:a}return Xb(this)};h.$=function(){return this};h.lc=function(){var a=this.node;return new Qd(a,this.Ba,a.length)};h.mc=function(){var a=this.B+this.node.length;if(a<Za(this.Va)){var b=this.Va,c=Ne(this.Va,a);return Ue?Ue(b,c,a,0):Ve.call(null,b,c,a,0)}return wc};
h.R=function(a,b){return $e?$e(this.Va,this.node,this.B,this.Ba,b):Ve.call(null,this.Va,this.node,this.B,this.Ba,b)};h.Y=function(a,b){return Rc(b,this)};h.kc=function(){var a=this.B+this.node.length;if(a<Za(this.Va)){var b=this.Va,c=Ne(this.Va,a);return Ue?Ue(b,c,a,0):Ve.call(null,b,c,a,0)}return null};Xe.prototype[Ta]=function(){return yc(this)};
function Ve(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;switch(b.length){case 3:return b=arguments[0],c=arguments[1],d=arguments[2],new Xe(b,Oe(b,c),c,d,null,null);case 4:return Ue(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return $e(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:throw Error([y("Invalid arity: "),y(b.length)].join(""));}}function Ue(a,b,c,d){return new Xe(a,b,c,d,null,null)}
function $e(a,b,c,d,e){return new Xe(a,b,c,d,e,null)}function af(a,b,c,d,e){this.F=a;this.jb=b;this.start=c;this.end=d;this.A=e;this.w=167666463;this.K=8192}h=af.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};
h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L(this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.Z=function(a,b){return mb.c(this,b,null)};h.W=function(a,b,c){return"number"===typeof b?eb.c(this,b,c):c};h.fa=function(a,b){return 0>b||this.end<=this.start+b?Me(b,this.end-this.start):eb.b(this.jb,this.start+b)};
h.Ua=function(a,b,c){return 0>b||this.end<=this.start+b?c:eb.c(this.jb,this.start+b,c)};h.pc=function(a,b,c){var d=this.start+b;a=this.F;c=bd.c(this.jb,d,c);b=this.start;var e=this.end,d=d+1,d=e>d?e:d;return cf.X?cf.X(a,c,b,d,null):cf.call(null,a,c,b,d,null)};h.O=function(){return this.F};h.aa=function(){return this.end-this.start};h.fc=function(){return this.start!==this.end?new Pc(this,this.end-this.start-1,null):null};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Ac(this)};
h.H=function(a,b){return Qc(this,b)};h.ha=function(){return Tc($c,this.F)};h.Ca=function(a,b){return Ec(this,b)};h.Da=function(a,b,c){return Fc(this,b,c)};h.Ta=function(a,b,c){if("number"===typeof b)return wb(this,b,c);throw Error("Subvec's key for assoc must be a number.");};h.$=function(){var a=this;return function(b){return function d(e){return e===a.end?null:Rc(eb.b(a.jb,e),new Nd(null,function(){return function(){return d(e+1)}}(b),null,null))}}(this)(a.start)};
h.R=function(a,b){return cf.X?cf.X(b,this.jb,this.start,this.end,this.A):cf.call(null,b,this.jb,this.start,this.end,this.A)};h.Y=function(a,b){var c=this.F,d=wb(this.jb,this.end,b),e=this.start,f=this.end+1;return cf.X?cf.X(c,d,e,f,null):cf.call(null,c,d,e,f,null)};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.fa(null,c);case 3:return this.Ua(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return this.fa(null,c)};a.c=function(a,c,d){return this.Ua(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Ua(b)))};h.a=function(a){return this.fa(null,a)};h.b=function(a,b){return this.Ua(null,a,b)};af.prototype[Ta]=function(){return yc(this)};
function cf(a,b,c,d,e){for(;;)if(b instanceof af)c=b.start+c,d=b.start+d,b=b.jb;else{var f=L(b);if(0>c||0>d||c>f||d>f)throw Error("Index out of bounds");return new af(a,b,c,d,e)}}function Ze(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;switch(b.length){case 2:return b=arguments[0],Ye(b,arguments[1],L(b));case 3:return Ye(arguments[0],arguments[1],arguments[2]);default:throw Error([y("Invalid arity: "),y(b.length)].join(""));}}
function Ye(a,b,c){return cf(null,a,b,c,null)}function df(a,b){return a===b.ba?b:new He(a,Ua(b.g))}function Se(a){return new He({},Ua(a.g))}function Te(a){var b=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];nd(a,0,b,0,a.length);return b}
var ef=function ef(b,c,d,e){d=df(b.root.ba,d);var f=b.C-1>>>c&31;if(5===c)b=e;else{var g=d.g[f];b=null!=g?ef(b,c-5,g,e):Ke(b.root.ba,c-5,e)}d.g[f]=b;return d};function Re(a,b,c,d){this.C=a;this.shift=b;this.root=c;this.Ha=d;this.K=88;this.w=275}h=Re.prototype;
h.Ab=function(a,b){if(this.root.ba){if(32>this.C-Je(this))this.Ha[this.C&31]=b;else{var c=new He(this.root.ba,this.Ha),d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];d[0]=b;this.Ha=d;if(this.C>>>5>1<<this.shift){var d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],e=this.shift+
5;d[0]=this.root;d[1]=Ke(this.root.ba,this.shift,c);this.root=new He(this.root.ba,d);this.shift=e}else this.root=ef(this,this.shift,this.root,c)}this.C+=1;return this}throw Error("conj! after persistent!");};h.Lb=function(){if(this.root.ba){this.root.ba=null;var a=this.C-Je(this),b=Array(a);nd(this.Ha,0,b,0,a);return new T(null,this.C,this.shift,this.root,b,null)}throw Error("persistent! called twice");};
h.Wb=function(a,b,c){if("number"===typeof b)return Ub(this,b,c);throw Error("TransientVector's key for assoc! must be a number.");};
h.yc=function(a,b,c){var d=this;if(d.root.ba){if(0<=b&&b<d.C)return Je(this)<=b?d.Ha[b&31]=c:(a=function(){return function f(a,k){var m=df(d.root.ba,k);if(0===a)m.g[b&31]=c;else{var p=b>>>a&31,t=f(a-5,m.g[p]);m.g[p]=t}return m}}(this).call(null,d.shift,d.root),d.root=a),this;if(b===d.C)return Rb(this,c);throw Error([y("Index "),y(b),y(" out of bounds for TransientVector of length"),y(d.C)].join(""));}throw Error("assoc! after persistent!");};
h.aa=function(){if(this.root.ba)return this.C;throw Error("count after persistent!");};h.fa=function(a,b){if(this.root.ba)return Oe(this,b)[b&31];throw Error("nth after persistent!");};h.Ua=function(a,b,c){return 0<=b&&b<this.C?eb.b(this,b):c};h.Z=function(a,b){return mb.c(this,b,null)};h.W=function(a,b,c){return"number"===typeof b?eb.c(this,b,c):c};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.Z(null,c);case 3:return this.W(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return this.Z(null,c)};a.c=function(a,c,d){return this.W(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Ua(b)))};h.a=function(a){return this.Z(null,a)};h.b=function(a,b){return this.W(null,a,b)};function ff(a,b){this.Nb=a;this.bc=b}
ff.prototype.ya=function(){var a=null!=this.Nb&&r(this.Nb);return a?a:(a=null!=this.bc)?this.bc.ya():a};ff.prototype.next=function(){if(null!=this.Nb){var a=E(this.Nb);this.Nb=F(this.Nb);return a}if(null!=this.bc&&this.bc.ya())return this.bc.next();throw Error("No such element");};ff.prototype.remove=function(){return Error("Unsupported operation")};function gf(a,b,c,d){this.F=a;this.Xa=b;this.qb=c;this.A=d;this.w=31850572;this.K=0}h=gf.prototype;h.toString=function(){return fc(this)};
h.equiv=function(a){return this.H(null,a)};h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L(this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.O=function(){return this.F};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Ac(this)};h.H=function(a,b){return Qc(this,b)};h.ha=function(){return Tc(wc,this.F)};h.ia=function(){return E(this.Xa)};
h.Fa=function(){var a=F(this.Xa);return a?new gf(this.F,a,this.qb,null):null==this.qb?$a(this):new gf(this.F,this.qb,null,null)};h.$=function(){return this};h.R=function(a,b){return new gf(b,this.Xa,this.qb,this.A)};h.Y=function(a,b){return Rc(b,this)};gf.prototype[Ta]=function(){return yc(this)};function hf(a,b,c,d,e){this.F=a;this.count=b;this.Xa=c;this.qb=d;this.A=e;this.w=31858766;this.K=8192}h=hf.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};
h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,this.count.a?this.count.a(this):this.count.call(null,this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.Aa=function(){return new ff(this.Xa,dc(this.qb))};h.O=function(){return this.F};h.aa=function(){return this.count};
h.T=function(){var a=this.A;return null!=a?a:this.A=a=Ac(this)};h.H=function(a,b){return Qc(this,b)};h.ha=function(){return Tc(jf,this.F)};h.ia=function(){return E(this.Xa)};h.Fa=function(){return vc(r(this))};h.$=function(){var a=r(this.qb),b=this.Xa;return u(u(b)?b:a)?new gf(null,this.Xa,r(a),null):null};h.R=function(a,b){return new hf(b,this.count,this.Xa,this.qb,this.A)};
h.Y=function(a,b){var c;u(this.Xa)?(c=this.qb,c=new hf(this.F,this.count+1,this.Xa,Zc.b(u(c)?c:$c,b),null)):c=new hf(this.F,this.count+1,Zc.b(this.Xa,b),$c,null);return c};var jf=new hf(null,0,null,$c,Bc);hf.prototype[Ta]=function(){return yc(this)};function kf(){this.w=2097152;this.K=0}kf.prototype.equiv=function(a){return this.H(null,a)};kf.prototype.H=function(){return!1};var lf=new kf;
function mf(a,b){return pd(jd(b)?L(a)===L(b)?le(td,ue.b(function(a){return B.b(qc.c(b,E(a),lf),Xc(a))},a)):null:null)}function nf(a,b,c,d,e){this.B=a;this.vd=b;this.tc=c;this.Db=d;this.Bc=e}nf.prototype.ya=function(){var a=this.B<this.tc;return a?a:this.Bc.ya()};nf.prototype.next=function(){if(this.B<this.tc){var a=Lc(this.Db,this.B);this.B+=1;return new T(null,2,5,V,[a,mb.b(this.vd,a)],null)}return this.Bc.next()};nf.prototype.remove=function(){return Error("Unsupported operation")};
function of(a){this.S=a}of.prototype.next=function(){if(null!=this.S){var a=E(this.S),b=N(a,0,null),a=N(a,1,null);this.S=F(this.S);return{value:[b,a],done:!1}}return{value:null,done:!0}};function pf(a){this.S=a}pf.prototype.next=function(){if(null!=this.S){var a=E(this.S);this.S=F(this.S);return{value:[a,a],done:!1}}return{value:null,done:!0}};
function qf(a,b){var c;if(b instanceof O)a:{c=a.length;for(var d=b.ca,e=0;;){if(c<=e){c=-1;break a}if(a[e]instanceof O&&d===a[e].ca){c=e;break a}e+=2}}else if("string"==typeof b||"number"===typeof b)a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(b===a[d]){c=d;break a}d+=2}else if(b instanceof A)a:for(c=a.length,d=b.zb,e=0;;){if(c<=e){c=-1;break a}if(a[e]instanceof A&&d===a[e].zb){c=e;break a}e+=2}else if(null==b)a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(null==a[d]){c=d;break a}d+=2}else a:for(c=
a.length,d=0;;){if(c<=d){c=-1;break a}if(B.b(b,a[d])){c=d;break a}d+=2}return c}function rf(a,b,c){this.g=a;this.B=b;this.Ea=c;this.w=32374990;this.K=0}h=rf.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L(this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.O=function(){return this.Ea};h.Ia=function(){return this.B<this.g.length-2?new rf(this.g,this.B+2,this.Ea):null};h.aa=function(){return(this.g.length-this.B)/2};h.T=function(){return Ac(this)};
h.H=function(a,b){return Qc(this,b)};h.ha=function(){return Tc(wc,this.Ea)};h.Ca=function(a,b){return Uc(b,this)};h.Da=function(a,b,c){return Wc(b,c,this)};h.ia=function(){return new T(null,2,5,V,[this.g[this.B],this.g[this.B+1]],null)};h.Fa=function(){return this.B<this.g.length-2?new rf(this.g,this.B+2,this.Ea):wc};h.$=function(){return this};h.R=function(a,b){return new rf(this.g,this.B,b)};h.Y=function(a,b){return Rc(b,this)};rf.prototype[Ta]=function(){return yc(this)};
function sf(a,b,c){this.g=a;this.B=b;this.C=c}sf.prototype.ya=function(){return this.B<this.C};sf.prototype.next=function(){var a=new T(null,2,5,V,[this.g[this.B],this.g[this.B+1]],null);this.B+=2;return a};function q(a,b,c,d){this.F=a;this.C=b;this.g=c;this.A=d;this.w=16647951;this.K=8196}h=q.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};h.keys=function(){return yc(tf.a?tf.a(this):tf.call(null,this))};h.entries=function(){return new of(r(r(this)))};
h.values=function(){return yc(uf.a?uf.a(this):uf.call(null,this))};h.has=function(a){return rd(this,a)};h.get=function(a,b){return this.W(null,a,b)};h.forEach=function(a){for(var b=r(this),c=null,d=0,e=0;;)if(e<d){var f=c.fa(null,e),g=N(f,0,null),f=N(f,1,null);a.b?a.b(f,g):a.call(null,f,g);e+=1}else if(b=r(b))ld(b)?(c=Wb(b),b=Xb(b),g=c,d=L(c),c=g):(c=E(b),g=N(c,0,null),f=N(c,1,null),a.b?a.b(f,g):a.call(null,f,g),b=F(b),c=null,d=0),e=0;else return null};h.Z=function(a,b){return mb.c(this,b,null)};
h.W=function(a,b,c){a=qf(this.g,b);return-1===a?c:this.g[a+1]};h.Aa=function(){return new sf(this.g,0,2*this.C)};h.O=function(){return this.F};h.aa=function(){return this.C};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Cc(this)};h.H=function(a,b){if(null!=b&&(b.w&1024||b.Vc)){var c=this.g.length;if(this.C===b.aa(null))for(var d=0;;)if(d<c){var e=b.W(null,this.g[d],od);if(e!==od)if(B.b(this.g[d+1],e))d+=2;else return!1;else return!1}else return!0;else return!1}else return mf(this,b)};
h.Jb=function(){return new vf({},this.g.length,Ua(this.g))};h.ha=function(){return Bb(W,this.F)};h.Ca=function(a,b){return Uc(b,this)};h.Da=function(a,b,c){return Wc(b,c,this)};h.Wa=function(a,b){if(0<=qf(this.g,b)){var c=this.g.length,d=c-2;if(0===d)return $a(this);for(var d=Array(d),e=0,f=0;;){if(e>=c)return new q(this.F,this.C-1,d,null);B.b(b,this.g[e])||(d[f]=this.g[e],d[f+1]=this.g[e+1],f+=2);e+=2}}else return this};
h.Ta=function(a,b,c){a=qf(this.g,b);if(-1===a){if(this.C<wf){a=this.g;for(var d=a.length,e=Array(d+2),f=0;;)if(f<d)e[f]=a[f],f+=1;else break;e[d]=b;e[d+1]=c;return new q(this.F,this.C+1,e,null)}return Bb(ob(Ge(xf,this),b,c),this.F)}if(c===this.g[a+1])return this;b=Ua(this.g);b[a+1]=c;return new q(this.F,this.C,b,null)};h.jc=function(a,b){return-1!==qf(this.g,b)};h.$=function(){var a=this.g;return 0<=a.length-2?new rf(a,0,null):null};h.R=function(a,b){return new q(b,this.C,this.g,this.A)};
h.Y=function(a,b){if(kd(b))return ob(this,eb.b(b,0),eb.b(b,1));for(var c=this,d=r(b);;){if(null==d)return c;var e=E(d);if(kd(e))c=ob(c,eb.b(e,0),eb.b(e,1)),d=F(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.Z(null,c);case 3:return this.W(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return this.Z(null,c)};a.c=function(a,c,d){return this.W(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Ua(b)))};h.a=function(a){return this.Z(null,a)};h.b=function(a,b){return this.W(null,a,b)};var W=new q(null,0,[],Dc),wf=8;
function yf(a){for(var b=[],c=0;;)if(c<a.length){var d=a[c],e=a[c+1];-1===qf(b,d)&&(b.push(d),b.push(e));c+=2}else break;return new q(null,b.length/2,b,null)}q.prototype[Ta]=function(){return yc(this)};function vf(a,b,c){this.Mb=a;this.Hb=b;this.g=c;this.w=258;this.K=56}h=vf.prototype;h.aa=function(){if(u(this.Mb))return xd(this.Hb,2);throw Error("count after persistent!");};h.Z=function(a,b){return mb.c(this,b,null)};
h.W=function(a,b,c){if(u(this.Mb))return a=qf(this.g,b),-1===a?c:this.g[a+1];throw Error("lookup after persistent!");};h.Ab=function(a,b){if(u(this.Mb)){if(null!=b?b.w&2048||b.Wc||(b.w?0:Pa(rb,b)):Pa(rb,b))return Tb(this,Dd.a?Dd.a(b):Dd.call(null,b),Ed.a?Ed.a(b):Ed.call(null,b));for(var c=r(b),d=this;;){var e=E(c);if(u(e))c=F(c),d=Tb(d,Dd.a?Dd.a(e):Dd.call(null,e),Ed.a?Ed.a(e):Ed.call(null,e));else return d}}else throw Error("conj! after persistent!");};
h.Lb=function(){if(u(this.Mb))return this.Mb=!1,new q(null,xd(this.Hb,2),this.g,null);throw Error("persistent! called twice");};h.Wb=function(a,b,c){if(u(this.Mb)){a=qf(this.g,b);if(-1===a){if(this.Hb+2<=2*wf)return this.Hb+=2,this.g.push(b),this.g.push(c),this;a=zf.b?zf.b(this.Hb,this.g):zf.call(null,this.Hb,this.g);return Tb(a,b,c)}c!==this.g[a+1]&&(this.g[a+1]=c);return this}throw Error("assoc! after persistent!");};
function zf(a,b){for(var c=Qb(xf),d=0;;)if(d<a)c=Tb(c,b[d],b[d+1]),d+=2;else return c}function Af(){this.h=!1}function Bf(a,b){return a===b?!0:R(a,b)?!0:B.b(a,b)}function Cf(a,b,c){a=Ua(a);a[b]=c;return a}function Df(a,b){var c=Array(a.length-2);nd(a,0,c,0,2*b);nd(a,2*(b+1),c,2*b,c.length-2*b);return c}function Ef(a,b,c,d){a=a.Cb(b);a.g[c]=d;return a}function Ff(a,b,c,d){this.g=a;this.B=b;this.ac=c;this.bb=d}
Ff.prototype.advance=function(){for(var a=this.g.length;;)if(this.B<a){var b=this.g[this.B],c=this.g[this.B+1];null!=b?b=this.ac=new T(null,2,5,V,[b,c],null):null!=c?(b=dc(c),b=b.ya()?this.bb=b:!1):b=!1;this.B+=2;if(b)return!0}else return!1};Ff.prototype.ya=function(){var a=null!=this.ac;return a?a:(a=null!=this.bb)?a:this.advance()};
Ff.prototype.next=function(){if(null!=this.ac){var a=this.ac;this.ac=null;return a}if(null!=this.bb)return a=this.bb.next(),this.bb.ya()||(this.bb=null),a;if(this.advance())return this.next();throw Error("No such element");};Ff.prototype.remove=function(){return Error("Unsupported operation")};function Gf(a,b,c){this.ba=a;this.ea=b;this.g=c}h=Gf.prototype;h.Cb=function(a){if(a===this.ba)return this;var b=zd(this.ea),c=Array(0>b?4:2*(b+1));nd(this.g,0,c,0,2*b);return new Gf(a,this.ea,c)};
h.Yb=function(){return Hf?Hf(this.g):If.call(null,this.g)};h.vb=function(a,b,c,d){var e=1<<(b>>>a&31);if(0===(this.ea&e))return d;var f=zd(this.ea&e-1),e=this.g[2*f],f=this.g[2*f+1];return null==e?f.vb(a+5,b,c,d):Bf(c,e)?f:d};
h.ab=function(a,b,c,d,e,f){var g=1<<(c>>>b&31),k=zd(this.ea&g-1);if(0===(this.ea&g)){var m=zd(this.ea);if(2*m<this.g.length){a=this.Cb(a);b=a.g;f.h=!0;a:for(c=2*(m-k),f=2*k+(c-1),m=2*(k+1)+(c-1);;){if(0===c)break a;b[m]=b[f];--m;--c;--f}b[2*k]=d;b[2*k+1]=e;a.ea|=g;return a}if(16<=m){k=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];k[c>>>b&31]=Jf.ab(a,b+5,c,d,e,f);for(e=d=0;;)if(32>d)0!==
(this.ea>>>d&1)&&(k[d]=null!=this.g[e]?Jf.ab(a,b+5,oc(this.g[e]),this.g[e],this.g[e+1],f):this.g[e+1],e+=2),d+=1;else break;return new Kf(a,m+1,k)}b=Array(2*(m+4));nd(this.g,0,b,0,2*k);b[2*k]=d;b[2*k+1]=e;nd(this.g,2*k,b,2*(k+1),2*(m-k));f.h=!0;a=this.Cb(a);a.g=b;a.ea|=g;return a}m=this.g[2*k];g=this.g[2*k+1];if(null==m)return m=g.ab(a,b+5,c,d,e,f),m===g?this:Ef(this,a,2*k+1,m);if(Bf(d,m))return e===g?this:Ef(this,a,2*k+1,e);f.h=!0;f=b+5;d=Lf?Lf(a,f,m,g,c,d,e):Mf.call(null,a,f,m,g,c,d,e);e=2*k;k=
2*k+1;a=this.Cb(a);a.g[e]=null;a.g[k]=d;return a};
h.$a=function(a,b,c,d,e){var f=1<<(b>>>a&31),g=zd(this.ea&f-1);if(0===(this.ea&f)){var k=zd(this.ea);if(16<=k){g=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];g[b>>>a&31]=Jf.$a(a+5,b,c,d,e);for(d=c=0;;)if(32>c)0!==(this.ea>>>c&1)&&(g[c]=null!=this.g[d]?Jf.$a(a+5,oc(this.g[d]),this.g[d],this.g[d+1],e):this.g[d+1],d+=2),c+=1;else break;return new Kf(null,k+1,g)}a=Array(2*(k+1));nd(this.g,
0,a,0,2*g);a[2*g]=c;a[2*g+1]=d;nd(this.g,2*g,a,2*(g+1),2*(k-g));e.h=!0;return new Gf(null,this.ea|f,a)}var m=this.g[2*g],f=this.g[2*g+1];if(null==m)return k=f.$a(a+5,b,c,d,e),k===f?this:new Gf(null,this.ea,Cf(this.g,2*g+1,k));if(Bf(c,m))return d===f?this:new Gf(null,this.ea,Cf(this.g,2*g+1,d));e.h=!0;e=this.ea;k=this.g;a+=5;a=Nf?Nf(a,m,f,b,c,d):Mf.call(null,a,m,f,b,c,d);c=2*g;g=2*g+1;d=Ua(k);d[c]=null;d[g]=a;return new Gf(null,e,d)};
h.Zb=function(a,b,c){var d=1<<(b>>>a&31);if(0===(this.ea&d))return this;var e=zd(this.ea&d-1),f=this.g[2*e],g=this.g[2*e+1];return null==f?(a=g.Zb(a+5,b,c),a===g?this:null!=a?new Gf(null,this.ea,Cf(this.g,2*e+1,a)):this.ea===d?null:new Gf(null,this.ea^d,Df(this.g,e))):Bf(c,f)?new Gf(null,this.ea^d,Df(this.g,e)):this};h.Aa=function(){return new Ff(this.g,0,null,null)};var Jf=new Gf(null,0,[]);function Of(a,b,c){this.g=a;this.B=b;this.bb=c}
Of.prototype.ya=function(){for(var a=this.g.length;;){if(null!=this.bb&&this.bb.ya())return!0;if(this.B<a){var b=this.g[this.B];this.B+=1;null!=b&&(this.bb=dc(b))}else return!1}};Of.prototype.next=function(){if(this.ya())return this.bb.next();throw Error("No such element");};Of.prototype.remove=function(){return Error("Unsupported operation")};function Kf(a,b,c){this.ba=a;this.C=b;this.g=c}h=Kf.prototype;h.Cb=function(a){return a===this.ba?this:new Kf(a,this.C,Ua(this.g))};
h.Yb=function(){return Pf?Pf(this.g):Qf.call(null,this.g)};h.vb=function(a,b,c,d){var e=this.g[b>>>a&31];return null!=e?e.vb(a+5,b,c,d):d};h.ab=function(a,b,c,d,e,f){var g=c>>>b&31,k=this.g[g];if(null==k)return a=Ef(this,a,g,Jf.ab(a,b+5,c,d,e,f)),a.C+=1,a;b=k.ab(a,b+5,c,d,e,f);return b===k?this:Ef(this,a,g,b)};
h.$a=function(a,b,c,d,e){var f=b>>>a&31,g=this.g[f];if(null==g)return new Kf(null,this.C+1,Cf(this.g,f,Jf.$a(a+5,b,c,d,e)));a=g.$a(a+5,b,c,d,e);return a===g?this:new Kf(null,this.C,Cf(this.g,f,a))};
h.Zb=function(a,b,c){var d=b>>>a&31,e=this.g[d];if(null!=e){a=e.Zb(a+5,b,c);if(a===e)d=this;else if(null==a)if(8>=this.C)a:{e=this.g;a=e.length;b=Array(2*(this.C-1));c=0;for(var f=1,g=0;;)if(c<a)c!==d&&null!=e[c]&&(b[f]=e[c],f+=2,g|=1<<c),c+=1;else{d=new Gf(null,g,b);break a}}else d=new Kf(null,this.C-1,Cf(this.g,d,a));else d=new Kf(null,this.C,Cf(this.g,d,a));return d}return this};h.Aa=function(){return new Of(this.g,0,null)};
function Rf(a,b,c){b*=2;for(var d=0;;)if(d<b){if(Bf(c,a[d]))return d;d+=2}else return-1}function Sf(a,b,c,d){this.ba=a;this.lb=b;this.C=c;this.g=d}h=Sf.prototype;h.Cb=function(a){if(a===this.ba)return this;var b=Array(2*(this.C+1));nd(this.g,0,b,0,2*this.C);return new Sf(a,this.lb,this.C,b)};h.Yb=function(){return Hf?Hf(this.g):If.call(null,this.g)};h.vb=function(a,b,c,d){a=Rf(this.g,this.C,c);return 0>a?d:Bf(c,this.g[a])?this.g[a+1]:d};
h.ab=function(a,b,c,d,e,f){if(c===this.lb){b=Rf(this.g,this.C,d);if(-1===b){if(this.g.length>2*this.C)return b=2*this.C,c=2*this.C+1,a=this.Cb(a),a.g[b]=d,a.g[c]=e,f.h=!0,a.C+=1,a;c=this.g.length;b=Array(c+2);nd(this.g,0,b,0,c);b[c]=d;b[c+1]=e;f.h=!0;d=this.C+1;a===this.ba?(this.g=b,this.C=d,a=this):a=new Sf(this.ba,this.lb,d,b);return a}return this.g[b+1]===e?this:Ef(this,a,b+1,e)}return(new Gf(a,1<<(this.lb>>>b&31),[null,this,null,null])).ab(a,b,c,d,e,f)};
h.$a=function(a,b,c,d,e){return b===this.lb?(a=Rf(this.g,this.C,c),-1===a?(a=2*this.C,b=Array(a+2),nd(this.g,0,b,0,a),b[a]=c,b[a+1]=d,e.h=!0,new Sf(null,this.lb,this.C+1,b)):B.b(this.g[a],d)?this:new Sf(null,this.lb,this.C,Cf(this.g,a+1,d))):(new Gf(null,1<<(this.lb>>>a&31),[null,this])).$a(a,b,c,d,e)};h.Zb=function(a,b,c){a=Rf(this.g,this.C,c);return-1===a?this:1===this.C?null:new Sf(null,this.lb,this.C-1,Df(this.g,xd(a,2)))};h.Aa=function(){return new Ff(this.g,0,null,null)};
function Mf(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;switch(b.length){case 6:return Nf(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);case 7:return Lf(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]);default:throw Error([y("Invalid arity: "),y(b.length)].join(""));}}
function Nf(a,b,c,d,e,f){var g=oc(b);if(g===d)return new Sf(null,g,2,[b,c,e,f]);var k=new Af;return Jf.$a(a,g,b,c,k).$a(a,d,e,f,k)}function Lf(a,b,c,d,e,f,g){var k=oc(c);if(k===e)return new Sf(null,k,2,[c,d,f,g]);var m=new Af;return Jf.ab(a,b,k,c,d,m).ab(a,b,e,f,g,m)}function Tf(a,b,c,d,e){this.F=a;this.wb=b;this.B=c;this.S=d;this.A=e;this.w=32374860;this.K=0}h=Tf.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};
h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L(this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.O=function(){return this.F};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Ac(this)};h.H=function(a,b){return Qc(this,b)};h.ha=function(){return Tc(wc,this.F)};h.Ca=function(a,b){return Uc(b,this)};
h.Da=function(a,b,c){return Wc(b,c,this)};h.ia=function(){return null==this.S?new T(null,2,5,V,[this.wb[this.B],this.wb[this.B+1]],null):E(this.S)};h.Fa=function(){if(null==this.S){var a=this.wb,b=this.B+2;return Uf?Uf(a,b,null):If.call(null,a,b,null)}var a=this.wb,b=this.B,c=F(this.S);return Uf?Uf(a,b,c):If.call(null,a,b,c)};h.$=function(){return this};h.R=function(a,b){return new Tf(b,this.wb,this.B,this.S,this.A)};h.Y=function(a,b){return Rc(b,this)};Tf.prototype[Ta]=function(){return yc(this)};
function If(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;switch(b.length){case 1:return Hf(arguments[0]);case 3:return Uf(arguments[0],arguments[1],arguments[2]);default:throw Error([y("Invalid arity: "),y(b.length)].join(""));}}function Hf(a){return Uf(a,0,null)}
function Uf(a,b,c){if(null==c)for(c=a.length;;)if(b<c){if(null!=a[b])return new Tf(null,a,b,null,null);var d=a[b+1];if(u(d)&&(d=d.Yb(),u(d)))return new Tf(null,a,b+2,d,null);b+=2}else return null;else return new Tf(null,a,b,c,null)}function Vf(a,b,c,d,e){this.F=a;this.wb=b;this.B=c;this.S=d;this.A=e;this.w=32374860;this.K=0}h=Vf.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};
h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L(this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.O=function(){return this.F};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Ac(this)};h.H=function(a,b){return Qc(this,b)};h.ha=function(){return Tc(wc,this.F)};h.Ca=function(a,b){return Uc(b,this)};
h.Da=function(a,b,c){return Wc(b,c,this)};h.ia=function(){return E(this.S)};h.Fa=function(){var a=this.wb,b=this.B,c=F(this.S);return Wf?Wf(null,a,b,c):Qf.call(null,null,a,b,c)};h.$=function(){return this};h.R=function(a,b){return new Vf(b,this.wb,this.B,this.S,this.A)};h.Y=function(a,b){return Rc(b,this)};Vf.prototype[Ta]=function(){return yc(this)};
function Qf(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;switch(b.length){case 1:return Pf(arguments[0]);case 4:return Wf(arguments[0],arguments[1],arguments[2],arguments[3]);default:throw Error([y("Invalid arity: "),y(b.length)].join(""));}}function Pf(a){return Wf(null,a,0,null)}function Wf(a,b,c,d){if(null==d)for(d=b.length;;)if(c<d){var e=b[c];if(u(e)&&(e=e.Yb(),u(e)))return new Vf(a,b,c+1,e,null);c+=1}else return null;else return new Vf(a,b,c,d,null)}
function Xf(a,b,c){this.Ka=a;this.Qc=b;this.sc=c}Xf.prototype.ya=function(){return this.sc&&this.Qc.ya()};Xf.prototype.next=function(){if(this.sc)return this.Qc.next();this.sc=!0;return this.Ka};Xf.prototype.remove=function(){return Error("Unsupported operation")};function Yf(a,b,c,d,e,f){this.F=a;this.C=b;this.root=c;this.Ja=d;this.Ka=e;this.A=f;this.w=16123663;this.K=8196}h=Yf.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};
h.keys=function(){return yc(tf.a?tf.a(this):tf.call(null,this))};h.entries=function(){return new of(r(r(this)))};h.values=function(){return yc(uf.a?uf.a(this):uf.call(null,this))};h.has=function(a){return rd(this,a)};h.get=function(a,b){return this.W(null,a,b)};
h.forEach=function(a){for(var b=r(this),c=null,d=0,e=0;;)if(e<d){var f=c.fa(null,e),g=N(f,0,null),f=N(f,1,null);a.b?a.b(f,g):a.call(null,f,g);e+=1}else if(b=r(b))ld(b)?(c=Wb(b),b=Xb(b),g=c,d=L(c),c=g):(c=E(b),g=N(c,0,null),f=N(c,1,null),a.b?a.b(f,g):a.call(null,f,g),b=F(b),c=null,d=0),e=0;else return null};h.Z=function(a,b){return mb.c(this,b,null)};h.W=function(a,b,c){return null==b?this.Ja?this.Ka:c:null==this.root?c:this.root.vb(0,oc(b),b,c)};
h.Aa=function(){var a=this.root?dc(this.root):ge;return this.Ja?new Xf(this.Ka,a,!1):a};h.O=function(){return this.F};h.aa=function(){return this.C};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Cc(this)};h.H=function(a,b){return mf(this,b)};h.Jb=function(){return new Zf({},this.root,this.C,this.Ja,this.Ka)};h.ha=function(){return Bb(xf,this.F)};
h.Wa=function(a,b){if(null==b)return this.Ja?new Yf(this.F,this.C-1,this.root,!1,null,null):this;if(null==this.root)return this;var c=this.root.Zb(0,oc(b),b);return c===this.root?this:new Yf(this.F,this.C-1,c,this.Ja,this.Ka,null)};h.Ta=function(a,b,c){if(null==b)return this.Ja&&c===this.Ka?this:new Yf(this.F,this.Ja?this.C:this.C+1,this.root,!0,c,null);a=new Af;b=(null==this.root?Jf:this.root).$a(0,oc(b),b,c,a);return b===this.root?this:new Yf(this.F,a.h?this.C+1:this.C,b,this.Ja,this.Ka,null)};
h.jc=function(a,b){return null==b?this.Ja:null==this.root?!1:this.root.vb(0,oc(b),b,od)!==od};h.$=function(){if(0<this.C){var a=null!=this.root?this.root.Yb():null;return this.Ja?Rc(new T(null,2,5,V,[null,this.Ka],null),a):a}return null};h.R=function(a,b){return new Yf(b,this.C,this.root,this.Ja,this.Ka,this.A)};
h.Y=function(a,b){if(kd(b))return ob(this,eb.b(b,0),eb.b(b,1));for(var c=this,d=r(b);;){if(null==d)return c;var e=E(d);if(kd(e))c=ob(c,eb.b(e,0),eb.b(e,1)),d=F(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.Z(null,c);case 3:return this.W(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return this.Z(null,c)};a.c=function(a,c,d){return this.W(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Ua(b)))};h.a=function(a){return this.Z(null,a)};h.b=function(a,b){return this.W(null,a,b)};var xf=new Yf(null,0,null,!1,null,Dc);
function cd(a,b){for(var c=a.length,d=0,e=Qb(xf);;)if(d<c)var f=d+1,e=e.Wb(null,a[d],b[d]),d=f;else return Sb(e)}Yf.prototype[Ta]=function(){return yc(this)};function Zf(a,b,c,d,e){this.ba=a;this.root=b;this.count=c;this.Ja=d;this.Ka=e;this.w=258;this.K=56}
function $f(a,b,c){if(a.ba){if(null==b)a.Ka!==c&&(a.Ka=c),a.Ja||(a.count+=1,a.Ja=!0);else{var d=new Af;b=(null==a.root?Jf:a.root).ab(a.ba,0,oc(b),b,c,d);b!==a.root&&(a.root=b);d.h&&(a.count+=1)}return a}throw Error("assoc! after persistent!");}h=Zf.prototype;h.aa=function(){if(this.ba)return this.count;throw Error("count after persistent!");};h.Z=function(a,b){return null==b?this.Ja?this.Ka:null:null==this.root?null:this.root.vb(0,oc(b),b)};
h.W=function(a,b,c){return null==b?this.Ja?this.Ka:c:null==this.root?c:this.root.vb(0,oc(b),b,c)};h.Ab=function(a,b){var c;a:if(this.ba)if(null!=b?b.w&2048||b.Wc||(b.w?0:Pa(rb,b)):Pa(rb,b))c=$f(this,Dd.a?Dd.a(b):Dd.call(null,b),Ed.a?Ed.a(b):Ed.call(null,b));else{c=r(b);for(var d=this;;){var e=E(c);if(u(e))c=F(c),d=$f(d,Dd.a?Dd.a(e):Dd.call(null,e),Ed.a?Ed.a(e):Ed.call(null,e));else{c=d;break a}}}else throw Error("conj! after persistent");return c};
h.Lb=function(){var a;if(this.ba)this.ba=null,a=new Yf(null,this.count,this.root,this.Ja,this.Ka,null);else throw Error("persistent! called twice");return a};h.Wb=function(a,b,c){return $f(this,b,c)};var qe=function qe(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ha(c.slice(0),0,null):null;return qe.v(c)};qe.v=function(a){for(var b=r(a),c=Qb(xf);;)if(b){a=F(F(b));var d=E(b),b=Xc(b),c=Tb(c,d,b),b=a}else return Sb(c)};qe.I=0;qe.J=function(a){return qe.v(r(a))};
function ag(a,b){this.U=a;this.Ea=b;this.w=32374988;this.K=0}h=ag.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L(this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.O=function(){return this.Ea};h.Ia=function(){var a=(null!=this.U?this.U.w&128||this.U.ec||(this.U.w?0:Pa(kb,this.U)):Pa(kb,this.U))?this.U.Ia(null):F(this.U);return null==a?null:new ag(a,this.Ea)};h.T=function(){return Ac(this)};
h.H=function(a,b){return Qc(this,b)};h.ha=function(){return Tc(wc,this.Ea)};h.Ca=function(a,b){return Uc(b,this)};h.Da=function(a,b,c){return Wc(b,c,this)};h.ia=function(){return this.U.ia(null).nc()};h.Fa=function(){var a=(null!=this.U?this.U.w&128||this.U.ec||(this.U.w?0:Pa(kb,this.U)):Pa(kb,this.U))?this.U.Ia(null):F(this.U);return null!=a?new ag(a,this.Ea):wc};h.$=function(){return this};h.R=function(a,b){return new ag(this.U,b)};h.Y=function(a,b){return Rc(b,this)};ag.prototype[Ta]=function(){return yc(this)};
function tf(a){return(a=r(a))?new ag(a,null):null}function Dd(a){return sb(a)}function bg(a,b){this.U=a;this.Ea=b;this.w=32374988;this.K=0}h=bg.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L(this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.O=function(){return this.Ea};h.Ia=function(){var a=(null!=this.U?this.U.w&128||this.U.ec||(this.U.w?0:Pa(kb,this.U)):Pa(kb,this.U))?this.U.Ia(null):F(this.U);return null==a?null:new bg(a,this.Ea)};h.T=function(){return Ac(this)};
h.H=function(a,b){return Qc(this,b)};h.ha=function(){return Tc(wc,this.Ea)};h.Ca=function(a,b){return Uc(b,this)};h.Da=function(a,b,c){return Wc(b,c,this)};h.ia=function(){return this.U.ia(null).oc()};h.Fa=function(){var a=(null!=this.U?this.U.w&128||this.U.ec||(this.U.w?0:Pa(kb,this.U)):Pa(kb,this.U))?this.U.Ia(null):F(this.U);return null!=a?new bg(a,this.Ea):wc};h.$=function(){return this};h.R=function(a,b){return new bg(this.U,b)};h.Y=function(a,b){return Rc(b,this)};bg.prototype[Ta]=function(){return yc(this)};
function uf(a){return(a=r(a))?new bg(a,null):null}function Ed(a){return tb(a)}function cg(a){return u(me(td,a))?sd(function(a,c){return Zc.b(u(a)?a:W,c)},a):null}function dg(a,b){return u(me(td,b))?sd(function(a){return function(b,e){return Va(a,u(b)?b:W,r(e))}}(function(b,d){var e=E(d),f=Xc(d);return rd(b,e)?bd.c(b,e,function(){var d=qc.b(b,e);return a.b?a.b(d,f):a.call(null,d,f)}()):bd.c(b,e,f)}),b):null}function eg(a){this.qc=a}eg.prototype.ya=function(){return this.qc.ya()};
eg.prototype.next=function(){if(this.qc.ya())return this.qc.next().Ha[0];throw Error("No such element");};eg.prototype.remove=function(){return Error("Unsupported operation")};function fg(a,b,c){this.F=a;this.Fb=b;this.A=c;this.w=15077647;this.K=8196}h=fg.prototype;h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};h.keys=function(){return yc(r(this))};h.entries=function(){return new pf(r(r(this)))};h.values=function(){return yc(r(this))};
h.has=function(a){return rd(this,a)};h.forEach=function(a){for(var b=r(this),c=null,d=0,e=0;;)if(e<d){var f=c.fa(null,e),g=N(f,0,null),f=N(f,1,null);a.b?a.b(f,g):a.call(null,f,g);e+=1}else if(b=r(b))ld(b)?(c=Wb(b),b=Xb(b),g=c,d=L(c),c=g):(c=E(b),g=N(c,0,null),f=N(c,1,null),a.b?a.b(f,g):a.call(null,f,g),b=F(b),c=null,d=0),e=0;else return null};h.Z=function(a,b){return mb.c(this,b,null)};h.W=function(a,b,c){return nb(this.Fb,b)?b:c};h.Aa=function(){return new eg(dc(this.Fb))};h.O=function(){return this.F};
h.aa=function(){return Za(this.Fb)};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Cc(this)};h.H=function(a,b){return hd(b)&&L(this)===L(b)&&le(function(a){return function(b){return rd(a,b)}}(this),b)};h.Jb=function(){return new gg(Qb(this.Fb))};h.ha=function(){return Tc(hg,this.F)};h.$=function(){return tf(this.Fb)};h.R=function(a,b){return new fg(b,this.Fb,this.A)};h.Y=function(a,b){return new fg(this.F,bd.c(this.Fb,b,null),null)};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.Z(null,c);case 3:return this.W(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return this.Z(null,c)};a.c=function(a,c,d){return this.W(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Ua(b)))};h.a=function(a){return this.Z(null,a)};h.b=function(a,b){return this.W(null,a,b)};var hg=new fg(null,W,Dc);fg.prototype[Ta]=function(){return yc(this)};
function gg(a){this.rb=a;this.K=136;this.w=259}h=gg.prototype;h.Ab=function(a,b){this.rb=Tb(this.rb,b,null);return this};h.Lb=function(){return new fg(null,Sb(this.rb),null)};h.aa=function(){return L(this.rb)};h.Z=function(a,b){return mb.c(this,b,null)};h.W=function(a,b,c){return mb.c(this.rb,b,od)===od?c:b};
h.call=function(){function a(a,b,c){return mb.c(this.rb,b,od)===od?c:b}function b(a,b){return mb.c(this.rb,b,od)===od?null:b}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,0,e);case 3:return a.call(this,0,e,f)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.c=a;return c}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Ua(b)))};h.a=function(a){return mb.c(this.rb,a,od)===od?null:a};h.b=function(a,b){return mb.c(this.rb,a,od)===od?b:a};
function ig(a){for(var b=$c;;)if(F(a))b=Zc.b(b,E(a)),a=F(a);else return r(b)}function Md(a){if(null!=a&&(a.K&4096||a.Yc))return a.Ub(null);if("string"===typeof a)return a;throw Error([y("Doesn't support name: "),y(a)].join(""));}function jg(a,b){for(var c=Qb(W),d=r(a),e=r(b);;)if(d&&e)var f=E(d),g=E(e),c=Tb(c,f,g),d=F(d),e=F(e);else return Sb(c)}
function kg(a,b){return new Nd(null,function(){var c=r(b);if(c){var d;d=E(c);d=a.a?a.a(d):a.call(null,d);c=u(d)?Rc(E(c),kg(a,vc(c))):null}else c=null;return c},null,null)}function lg(a,b,c){this.B=a;this.end=b;this.step=c}lg.prototype.ya=function(){return 0<this.step?this.B<this.end:this.B>this.end};lg.prototype.next=function(){var a=this.B;this.B+=this.step;return a};function mg(a,b,c,d,e){this.F=a;this.start=b;this.end=c;this.step=d;this.A=e;this.w=32375006;this.K=8192}h=mg.prototype;
h.toString=function(){return fc(this)};h.equiv=function(a){return this.H(null,a)};h.indexOf=function(){var a=null,a=function(a,c){switch(arguments.length){case 1:return I(this,a,0);case 2:return I(this,a,c)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a){return I(this,a,0)};a.b=function(a,c){return I(this,a,c)};return a}();
h.lastIndexOf=function(){function a(a){return Nc(this,a,L(this))}var b=null,b=function(b,d){switch(arguments.length){case 1:return a.call(this,b);case 2:return Nc(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.a=a;b.b=function(a,b){return Nc(this,a,b)};return b}();h.fa=function(a,b){if(b<Za(this))return this.start+b*this.step;if(this.start>this.end&&0===this.step)return this.start;throw Error("Index out of bounds");};
h.Ua=function(a,b,c){return b<Za(this)?this.start+b*this.step:this.start>this.end&&0===this.step?this.start:c};h.Aa=function(){return new lg(this.start,this.end,this.step)};h.O=function(){return this.F};h.Ia=function(){return 0<this.step?this.start+this.step<this.end?new mg(this.F,this.start+this.step,this.end,this.step,null):null:this.start+this.step>this.end?new mg(this.F,this.start+this.step,this.end,this.step,null):null};h.aa=function(){return Oa(Hb(this))?0:Math.ceil((this.end-this.start)/this.step)};
h.T=function(){var a=this.A;return null!=a?a:this.A=a=Ac(this)};h.H=function(a,b){return Qc(this,b)};h.ha=function(){return Tc(wc,this.F)};h.Ca=function(a,b){return Ec(this,b)};h.Da=function(a,b,c){for(a=this.start;;)if(0<this.step?a<this.end:a>this.end)c=b.b?b.b(c,a):b.call(null,c,a),a+=this.step;else return c};h.ia=function(){return null==Hb(this)?null:this.start};h.Fa=function(){return null!=Hb(this)?new mg(this.F,this.start+this.step,this.end,this.step,null):wc};
h.$=function(){return 0<this.step?this.start<this.end?this:null:0>this.step?this.start>this.end?this:null:this.start===this.end?null:this};h.R=function(a,b){return new mg(b,this.start,this.end,this.step,this.A)};h.Y=function(a,b){return Rc(b,this)};mg.prototype[Ta]=function(){return yc(this)};function ng(a){a:for(var b=a;;)if(r(b))b=F(b);else break a;return a}
function og(a){var b=pg;if("string"===typeof a)return b=b.exec(a),B.b(E(b),a)?1===L(b)?E(b):We(b):null;throw new TypeError("re-matches must match against a string.");}function qg(a,b){if("string"===typeof b){var c=a.exec(b);return null==c?null:1===L(c)?E(c):We(c)}throw new TypeError("re-find must match against a string.");}function rg(a){if(!(a instanceof RegExp)){a=qg(/^\(\?([idmsux]*)\)/,a);var b=N(a,0,null);N(a,1,null);L(b)}}
function sg(a,b,c,d,e,f,g){var k=va;va=null==va?null:va-1;try{if(null!=va&&0>va)return z(a,"#");z(a,c);if(0===Fa.a(f))r(g)&&z(a,function(){var a=tg.a(f);return u(a)?a:"..."}());else{if(r(g)){var m=E(g);b.c?b.c(m,a,f):b.call(null,m,a,f)}for(var p=F(g),t=Fa.a(f)-1;;)if(!p||null!=t&&0===t){r(p)&&0===t&&(z(a,d),z(a,function(){var a=tg.a(f);return u(a)?a:"..."}()));break}else{z(a,d);var v=E(p);c=a;g=f;b.c?b.c(v,c,g):b.call(null,v,c,g);var w=F(p);c=t-1;p=w;t=c}}return z(a,e)}finally{va=k}}
function ug(a,b){for(var c=r(b),d=null,e=0,f=0;;)if(f<e){var g=d.fa(null,f);z(a,g);f+=1}else if(c=r(c))d=c,ld(d)?(c=Wb(d),e=Xb(d),d=c,g=L(c),c=e,e=g):(g=E(d),z(a,g),c=F(d),d=null,e=0),f=0;else return null}var vg={'"':'\\"',"\\":"\\\\","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t"};function wg(a){return[y('"'),y(a.replace(RegExp('[\\\\"\b\f\n\r\t]',"g"),function(a){return vg[a]})),y('"')].join("")}
function xg(a,b){var c=pd(qc.b(a,Da));return c?(c=null!=b?b.w&131072||b.Xc?!0:!1:!1)?null!=fd(b):c:c}
function zg(a,b,c){if(null==a)return z(b,"nil");if(xg(c,a)){z(b,"^");var d=fd(a);Ag.c?Ag.c(d,b,c):Ag.call(null,d,b,c);z(b," ")}if(a.ub)return a.Bb(a,b,c);if(null!=a&&(a.w&2147483648||a.ga))return a.V(null,b,c);if(!0===a||!1===a||"number"===typeof a)return z(b,""+y(a));if(null!=a&&a.constructor===Object)return z(b,"#js "),d=ue.b(function(b){return new T(null,2,5,V,[Ld.a(b),a[b]],null)},md(a)),Bg.G?Bg.G(d,Ag,b,c):Bg.call(null,d,Ag,b,c);if(Na(a))return sg(b,Ag,"#js ["," ","]",c,a);if("string"==typeof a)return u(Ca.a(c))?
z(b,wg(a)):z(b,a);if("function"==l(a)){var e=a.name;c=u(function(){var a=null==e;return a?a:fa(e)}())?"Function":e;return ug(b,M(["#object[",c,' "',""+y(a),'"]'],0))}if(a instanceof Date)return c=function(a,b){for(var c=""+y(a);;)if(L(c)<b)c=[y("0"),y(c)].join("");else return c},ug(b,M(['#inst "',""+y(a.getUTCFullYear()),"-",c(a.getUTCMonth()+1,2),"-",c(a.getUTCDate(),2),"T",c(a.getUTCHours(),2),":",c(a.getUTCMinutes(),2),":",c(a.getUTCSeconds(),2),".",c(a.getUTCMilliseconds(),3),"-",'00:00"'],0));
if(a instanceof RegExp)return ug(b,M(['#"',a.source,'"'],0));if(u(a.constructor.gb))return ug(b,M(["#object[",a.constructor.gb.replace(RegExp("/","g"),"."),"]"],0));e=a.constructor.name;c=u(function(){var a=null==e;return a?a:fa(e)}())?"Object":e;return ug(b,M(["#object[",c," ",""+y(a),"]"],0))}function Ag(a,b,c){var d=Cg.a(c);return u(d)?(c=bd.c(c,Dg,zg),d.c?d.c(a,b,c):d.call(null,a,b,c)):zg(a,b,c)}
function Eg(a,b){var c;if(gd(a))c="";else{c=y;var d=new ka,e=new ec(d);a:{Ag(E(a),e,b);for(var f=r(F(a)),g=null,k=0,m=0;;)if(m<k){var p=g.fa(null,m);z(e," ");Ag(p,e,b);m+=1}else if(f=r(f))g=f,ld(g)?(f=Wb(g),k=Xb(g),g=f,p=L(f),f=k,k=p):(p=E(g),z(e," "),Ag(p,e,b),f=F(g),g=null,k=0),m=0;else break a}e.fb(null);c=""+c(d)}return c}var Fg=function Fg(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ha(c.slice(0),0,null):null;return Fg.v(c)};
Fg.v=function(a){return Eg(a,ya())};Fg.I=0;Fg.J=function(a){return Fg.v(r(a))};var Gg=function Gg(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ha(c.slice(0),0,null):null;return Gg.v(c)};Gg.v=function(a){return Eg(a,bd.c(ya(),Ca,!1))};Gg.I=0;Gg.J=function(a){return Gg.v(r(a))};function Hg(a){var b=bd.c(ya(),Ca,!1);a=Eg(a,b);na.a?na.a(a):na.call(null,a);u(qa)?(a=ya(),na.a?na.a("\n"):na.call(null,"\n"),a=(qc.b(a,Aa),null)):a=null;return a}
function Bg(a,b,c,d){return sg(c,function(a,c,d){var k=sb(a);b.c?b.c(k,c,d):b.call(null,k,c,d);z(c," ");a=tb(a);return b.c?b.c(a,c,d):b.call(null,a,c,d)},"{",", ","}",d,r(a))}sc.prototype.ga=!0;sc.prototype.V=function(a,b,c){z(b,"#'");return Ag(this.gc,b,c)};Ha.prototype.ga=!0;Ha.prototype.V=function(a,b,c){return sg(b,Ag,"("," ",")",c,this)};Nd.prototype.ga=!0;Nd.prototype.V=function(a,b,c){return sg(b,Ag,"("," ",")",c,this)};Tf.prototype.ga=!0;
Tf.prototype.V=function(a,b,c){return sg(b,Ag,"("," ",")",c,this)};rf.prototype.ga=!0;rf.prototype.V=function(a,b,c){return sg(b,Ag,"("," ",")",c,this)};Xe.prototype.ga=!0;Xe.prototype.V=function(a,b,c){return sg(b,Ag,"("," ",")",c,this)};Jd.prototype.ga=!0;Jd.prototype.V=function(a,b,c){return sg(b,Ag,"("," ",")",c,this)};Pc.prototype.ga=!0;Pc.prototype.V=function(a,b,c){return sg(b,Ag,"("," ",")",c,this)};Yf.prototype.ga=!0;Yf.prototype.V=function(a,b,c){return Bg(this,Ag,b,c)};
Vf.prototype.ga=!0;Vf.prototype.V=function(a,b,c){return sg(b,Ag,"("," ",")",c,this)};af.prototype.ga=!0;af.prototype.V=function(a,b,c){return sg(b,Ag,"["," ","]",c,this)};fg.prototype.ga=!0;fg.prototype.V=function(a,b,c){return sg(b,Ag,"#{"," ","}",c,this)};Sd.prototype.ga=!0;Sd.prototype.V=function(a,b,c){return sg(b,Ag,"("," ",")",c,this)};ne.prototype.ga=!0;ne.prototype.V=function(a,b,c){z(b,"#object [cljs.core.Atom ");Ag(new q(null,1,[Ig,this.state],null),b,c);return z(b,"]")};
bg.prototype.ga=!0;bg.prototype.V=function(a,b,c){return sg(b,Ag,"("," ",")",c,this)};T.prototype.ga=!0;T.prototype.V=function(a,b,c){return sg(b,Ag,"["," ","]",c,this)};gf.prototype.ga=!0;gf.prototype.V=function(a,b,c){return sg(b,Ag,"("," ",")",c,this)};Gd.prototype.ga=!0;Gd.prototype.V=function(a,b){return z(b,"()")};hf.prototype.ga=!0;hf.prototype.V=function(a,b,c){return sg(b,Ag,"#queue ["," ","]",c,r(this))};q.prototype.ga=!0;q.prototype.V=function(a,b,c){return Bg(this,Ag,b,c)};
mg.prototype.ga=!0;mg.prototype.V=function(a,b,c){return sg(b,Ag,"("," ",")",c,this)};ag.prototype.ga=!0;ag.prototype.V=function(a,b,c){return sg(b,Ag,"("," ",")",c,this)};Fd.prototype.ga=!0;Fd.prototype.V=function(a,b,c){return sg(b,Ag,"("," ",")",c,this)};function Jg(a,b){Va(function(b,d){return a.a?a.a(d):a.call(null,d)},null,b)}function Kg(a){return Math.floor(Math.random()*a)}function Lg(){var a=new T(null,3,5,V,[Mg,Ng,Og],null);return Lc(a,Kg(L(a)))}var Pg=null;
function Qg(){if(null==Pg){var a=new q(null,3,[Rg,W,Sg,W,Tg,W],null);Pg=pe?pe(a):oe.call(null,a)}return Pg}function Ug(a,b,c){var d=B.b(b,c);if(!d&&!(d=rd(Tg.a(a).call(null,b),c))&&(d=kd(c))&&(d=kd(b)))if(d=L(c)===L(b))for(var d=!0,e=0;;)if(d&&e!==L(c))d=Ug(a,b.a?b.a(e):b.call(null,e),c.a?c.a(e):c.call(null,e)),e+=1;else return d;else return d;else return d}function Vg(a){var b;b=Qg();b=H.a?H.a(b):H.call(null,b);return fe(qc.b(Rg.a(b),a))}
function Wg(a,b,c,d){te.b(a,function(){return H.a?H.a(b):H.call(null,b)});te.b(c,function(){return H.a?H.a(d):H.call(null,d)})}var Xg=function Xg(b,c,d){var e=(H.a?H.a(d):H.call(null,d)).call(null,b),e=u(u(e)?e.a?e.a(c):e.call(null,c):e)?!0:null;if(u(e))return e;e=function(){for(var e=Vg(c);;)if(0<L(e))Xg(b,E(e),d),e=vc(e);else return null}();if(u(e))return e;e=function(){for(var e=Vg(b);;)if(0<L(e))Xg(E(e),c,d),e=vc(e);else return null}();return u(e)?e:!1};
function Yg(a,b,c){c=Xg(a,b,c);if(u(c))a=c;else{c=Ug;var d;d=Qg();d=H.a?H.a(d):H.call(null,d);a=c(d,a,b)}return a}
var Zg=function Zg(b,c,d,e,f,g,k){var m=Va(function(e,g){var k=N(g,0,null);N(g,1,null);if(Ug(H.a?H.a(d):H.call(null,d),c,k)){var m;m=(m=null==e)?m:Yg(k,E(e),f);m=u(m)?g:e;if(!u(Yg(E(m),k,f)))throw Error([y("Multiple methods in multimethod '"),y(b),y("' match dispatch value: "),y(c),y(" -\x3e "),y(k),y(" and "),y(E(m)),y(", and neither is preferred")].join(""));return m}return e},null,H.a?H.a(e):H.call(null,e));if(u(m)){if(B.b(H.a?H.a(k):H.call(null,k),H.a?H.a(d):H.call(null,d)))return te.G(g,bd,c,
Xc(m)),Xc(m);Wg(g,e,k,d);return Zg(b,c,d,e,f,g,k)}return null},$g=function $g(b,c,d){if(null!=b&&null!=b.Ya)return b.Ya(0,c,d);var e=$g[l(null==b?null:b)];if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);e=$g._;if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);throw Ra("IMultiFn.-add-method",b);};function ah(a,b){throw Error([y("No method in multimethod '"),y(a),y("' for dispatch value: "),y(b)].join(""));}
function bh(a,b,c,d,e,f,g,k){this.name=a;this.m=b;this.fd=c;this.Xb=d;this.Pb=e;this.td=f;this.$b=g;this.Rb=k;this.w=4194305;this.K=4352}h=bh.prototype;
h.call=function(){function a(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J,G,U){a=this;var K=ee(a.m,b,c,d,e,M([f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J,G,U],0)),S=ch(this,K);u(S)||ah(a.name,K);return ee(S,b,c,d,e,M([f,g,k,m,p,t,v,w,x,P,Q,pa,D,C,J,G,U],0))}function b(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,J,G,U){a=this;var K=a.m.ta?a.m.ta(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,J,G,U):a.m.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,J,G,U),S=ch(this,K);u(S)||ah(a.name,K);return S.ta?S.ta(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,
J,G,U):S.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,J,G,U)}function c(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,J,G){a=this;var U=a.m.sa?a.m.sa(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,J,G):a.m.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,J,G),K=ch(this,U);u(K)||ah(a.name,U);return K.sa?K.sa(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,J,G):K.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,J,G)}function d(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,J){a=this;var G=a.m.ra?a.m.ra(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,J):a.m.call(null,b,c,
d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,J),U=ch(this,G);u(U)||ah(a.name,G);return U.ra?U.ra(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,J):U.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C,J)}function e(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C){a=this;var J=a.m.qa?a.m.qa(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C):a.m.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C),G=ch(this,J);u(G)||ah(a.name,J);return G.qa?G.qa(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C):G.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D,C)}function f(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,
D){a=this;var C=a.m.pa?a.m.pa(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D):a.m.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D),J=ch(this,C);u(J)||ah(a.name,C);return J.pa?J.pa(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D):J.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q,D)}function g(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q){a=this;var D=a.m.oa?a.m.oa(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q):a.m.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q),C=ch(this,D);u(C)||ah(a.name,D);return C.oa?C.oa(b,c,d,e,f,g,k,m,p,t,v,w,x,P,Q):C.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,
P,Q)}function k(a,b,c,d,e,f,g,k,m,p,t,v,w,x,P){a=this;var Q=a.m.na?a.m.na(b,c,d,e,f,g,k,m,p,t,v,w,x,P):a.m.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P),D=ch(this,Q);u(D)||ah(a.name,Q);return D.na?D.na(b,c,d,e,f,g,k,m,p,t,v,w,x,P):D.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x,P)}function m(a,b,c,d,e,f,g,k,m,p,t,v,w,x){a=this;var D=a.m.ma?a.m.ma(b,c,d,e,f,g,k,m,p,t,v,w,x):a.m.call(null,b,c,d,e,f,g,k,m,p,t,v,w,x),Q=ch(this,D);u(Q)||ah(a.name,D);return Q.ma?Q.ma(b,c,d,e,f,g,k,m,p,t,v,w,x):Q.call(null,b,c,d,e,f,g,k,
m,p,t,v,w,x)}function p(a,b,c,d,e,f,g,k,m,p,t,v,w){a=this;var x=a.m.la?a.m.la(b,c,d,e,f,g,k,m,p,t,v,w):a.m.call(null,b,c,d,e,f,g,k,m,p,t,v,w),D=ch(this,x);u(D)||ah(a.name,x);return D.la?D.la(b,c,d,e,f,g,k,m,p,t,v,w):D.call(null,b,c,d,e,f,g,k,m,p,t,v,w)}function t(a,b,c,d,e,f,g,k,m,p,t,v){a=this;var w=a.m.ka?a.m.ka(b,c,d,e,f,g,k,m,p,t,v):a.m.call(null,b,c,d,e,f,g,k,m,p,t,v),x=ch(this,w);u(x)||ah(a.name,w);return x.ka?x.ka(b,c,d,e,f,g,k,m,p,t,v):x.call(null,b,c,d,e,f,g,k,m,p,t,v)}function v(a,b,c,d,
e,f,g,k,m,p,t){a=this;var v=a.m.ja?a.m.ja(b,c,d,e,f,g,k,m,p,t):a.m.call(null,b,c,d,e,f,g,k,m,p,t),w=ch(this,v);u(w)||ah(a.name,v);return w.ja?w.ja(b,c,d,e,f,g,k,m,p,t):w.call(null,b,c,d,e,f,g,k,m,p,t)}function w(a,b,c,d,e,f,g,k,m,p){a=this;var t=a.m.xa?a.m.xa(b,c,d,e,f,g,k,m,p):a.m.call(null,b,c,d,e,f,g,k,m,p),v=ch(this,t);u(v)||ah(a.name,t);return v.xa?v.xa(b,c,d,e,f,g,k,m,p):v.call(null,b,c,d,e,f,g,k,m,p)}function x(a,b,c,d,e,f,g,k,m){a=this;var p=a.m.wa?a.m.wa(b,c,d,e,f,g,k,m):a.m.call(null,b,
c,d,e,f,g,k,m),t=ch(this,p);u(t)||ah(a.name,p);return t.wa?t.wa(b,c,d,e,f,g,k,m):t.call(null,b,c,d,e,f,g,k,m)}function C(a,b,c,d,e,f,g,k){a=this;var m=a.m.va?a.m.va(b,c,d,e,f,g,k):a.m.call(null,b,c,d,e,f,g,k),p=ch(this,m);u(p)||ah(a.name,m);return p.va?p.va(b,c,d,e,f,g,k):p.call(null,b,c,d,e,f,g,k)}function G(a,b,c,d,e,f,g){a=this;var k=a.m.ua?a.m.ua(b,c,d,e,f,g):a.m.call(null,b,c,d,e,f,g),m=ch(this,k);u(m)||ah(a.name,k);return m.ua?m.ua(b,c,d,e,f,g):m.call(null,b,c,d,e,f,g)}function D(a,b,c,d,e,
f){a=this;var g=a.m.X?a.m.X(b,c,d,e,f):a.m.call(null,b,c,d,e,f),k=ch(this,g);u(k)||ah(a.name,g);return k.X?k.X(b,c,d,e,f):k.call(null,b,c,d,e,f)}function J(a,b,c,d,e){a=this;var f=a.m.G?a.m.G(b,c,d,e):a.m.call(null,b,c,d,e),g=ch(this,f);u(g)||ah(a.name,f);return g.G?g.G(b,c,d,e):g.call(null,b,c,d,e)}function S(a,b,c,d){a=this;var e=a.m.c?a.m.c(b,c,d):a.m.call(null,b,c,d),f=ch(this,e);u(f)||ah(a.name,e);return f.c?f.c(b,c,d):f.call(null,b,c,d)}function U(a,b,c){a=this;var d=a.m.b?a.m.b(b,c):a.m.call(null,
b,c),e=ch(this,d);u(e)||ah(a.name,d);return e.b?e.b(b,c):e.call(null,b,c)}function Ma(a,b){a=this;var c=a.m.a?a.m.a(b):a.m.call(null,b),d=ch(this,c);u(d)||ah(a.name,c);return d.a?d.a(b):d.call(null,b)}function fb(a){a=this;var b=a.m.l?a.m.l():a.m.call(null),c=ch(this,b);u(c)||ah(a.name,b);return c.l?c.l():c.call(null)}var K=null,K=function(K,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q,pa,Zb,uc,bf,Be,yg){switch(arguments.length){case 1:return fb.call(this,K);case 2:return Ma.call(this,K,Y);case 3:return U.call(this,
K,Y,ba);case 4:return S.call(this,K,Y,ba,da);case 5:return J.call(this,K,Y,ba,da,ha);case 6:return D.call(this,K,Y,ba,da,ha,ma);case 7:return G.call(this,K,Y,ba,da,ha,ma,sa);case 8:return C.call(this,K,Y,ba,da,ha,ma,sa,ua);case 9:return x.call(this,K,Y,ba,da,ha,ma,sa,ua,za);case 10:return w.call(this,K,Y,ba,da,ha,ma,sa,ua,za,Ba);case 11:return v.call(this,K,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia);case 12:return t.call(this,K,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib);case 13:return p.call(this,K,Y,ba,da,ha,ma,sa,ua,
za,Ba,Ia,ib,Ya);case 14:return m.call(this,K,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab);case 15:return k.call(this,K,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P);case 16:return g.call(this,K,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q);case 17:return f.call(this,K,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q,pa);case 18:return e.call(this,K,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q,pa,Zb);case 19:return d.call(this,K,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q,pa,Zb,uc);case 20:return c.call(this,K,Y,ba,da,ha,ma,
sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q,pa,Zb,uc,bf);case 21:return b.call(this,K,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q,pa,Zb,uc,bf,Be);case 22:return a.call(this,K,Y,ba,da,ha,ma,sa,ua,za,Ba,Ia,ib,Ya,ab,P,Q,pa,Zb,uc,bf,Be,yg)}throw Error("Invalid arity: "+arguments.length);};K.a=fb;K.b=Ma;K.c=U;K.G=S;K.X=J;K.ua=D;K.va=G;K.wa=C;K.xa=x;K.ja=w;K.ka=v;K.la=t;K.ma=p;K.na=m;K.oa=k;K.pa=g;K.qa=f;K.ra=e;K.sa=d;K.ta=c;K.Tb=b;K.eb=a;return K}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Ua(b)))};
h.l=function(){var a=this.m.l?this.m.l():this.m.call(null),b=ch(this,a);u(b)||ah(this.name,a);return b.l?b.l():b.call(null)};h.a=function(a){var b=this.m.a?this.m.a(a):this.m.call(null,a),c=ch(this,b);u(c)||ah(this.name,b);return c.a?c.a(a):c.call(null,a)};h.b=function(a,b){var c=this.m.b?this.m.b(a,b):this.m.call(null,a,b),d=ch(this,c);u(d)||ah(this.name,c);return d.b?d.b(a,b):d.call(null,a,b)};
h.c=function(a,b,c){var d=this.m.c?this.m.c(a,b,c):this.m.call(null,a,b,c),e=ch(this,d);u(e)||ah(this.name,d);return e.c?e.c(a,b,c):e.call(null,a,b,c)};h.G=function(a,b,c,d){var e=this.m.G?this.m.G(a,b,c,d):this.m.call(null,a,b,c,d),f=ch(this,e);u(f)||ah(this.name,e);return f.G?f.G(a,b,c,d):f.call(null,a,b,c,d)};h.X=function(a,b,c,d,e){var f=this.m.X?this.m.X(a,b,c,d,e):this.m.call(null,a,b,c,d,e),g=ch(this,f);u(g)||ah(this.name,f);return g.X?g.X(a,b,c,d,e):g.call(null,a,b,c,d,e)};
h.ua=function(a,b,c,d,e,f){var g=this.m.ua?this.m.ua(a,b,c,d,e,f):this.m.call(null,a,b,c,d,e,f),k=ch(this,g);u(k)||ah(this.name,g);return k.ua?k.ua(a,b,c,d,e,f):k.call(null,a,b,c,d,e,f)};h.va=function(a,b,c,d,e,f,g){var k=this.m.va?this.m.va(a,b,c,d,e,f,g):this.m.call(null,a,b,c,d,e,f,g),m=ch(this,k);u(m)||ah(this.name,k);return m.va?m.va(a,b,c,d,e,f,g):m.call(null,a,b,c,d,e,f,g)};
h.wa=function(a,b,c,d,e,f,g,k){var m=this.m.wa?this.m.wa(a,b,c,d,e,f,g,k):this.m.call(null,a,b,c,d,e,f,g,k),p=ch(this,m);u(p)||ah(this.name,m);return p.wa?p.wa(a,b,c,d,e,f,g,k):p.call(null,a,b,c,d,e,f,g,k)};h.xa=function(a,b,c,d,e,f,g,k,m){var p=this.m.xa?this.m.xa(a,b,c,d,e,f,g,k,m):this.m.call(null,a,b,c,d,e,f,g,k,m),t=ch(this,p);u(t)||ah(this.name,p);return t.xa?t.xa(a,b,c,d,e,f,g,k,m):t.call(null,a,b,c,d,e,f,g,k,m)};
h.ja=function(a,b,c,d,e,f,g,k,m,p){var t=this.m.ja?this.m.ja(a,b,c,d,e,f,g,k,m,p):this.m.call(null,a,b,c,d,e,f,g,k,m,p),v=ch(this,t);u(v)||ah(this.name,t);return v.ja?v.ja(a,b,c,d,e,f,g,k,m,p):v.call(null,a,b,c,d,e,f,g,k,m,p)};h.ka=function(a,b,c,d,e,f,g,k,m,p,t){var v=this.m.ka?this.m.ka(a,b,c,d,e,f,g,k,m,p,t):this.m.call(null,a,b,c,d,e,f,g,k,m,p,t),w=ch(this,v);u(w)||ah(this.name,v);return w.ka?w.ka(a,b,c,d,e,f,g,k,m,p,t):w.call(null,a,b,c,d,e,f,g,k,m,p,t)};
h.la=function(a,b,c,d,e,f,g,k,m,p,t,v){var w=this.m.la?this.m.la(a,b,c,d,e,f,g,k,m,p,t,v):this.m.call(null,a,b,c,d,e,f,g,k,m,p,t,v),x=ch(this,w);u(x)||ah(this.name,w);return x.la?x.la(a,b,c,d,e,f,g,k,m,p,t,v):x.call(null,a,b,c,d,e,f,g,k,m,p,t,v)};h.ma=function(a,b,c,d,e,f,g,k,m,p,t,v,w){var x=this.m.ma?this.m.ma(a,b,c,d,e,f,g,k,m,p,t,v,w):this.m.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w),C=ch(this,x);u(C)||ah(this.name,x);return C.ma?C.ma(a,b,c,d,e,f,g,k,m,p,t,v,w):C.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w)};
h.na=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x){var C=this.m.na?this.m.na(a,b,c,d,e,f,g,k,m,p,t,v,w,x):this.m.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x),G=ch(this,C);u(G)||ah(this.name,C);return G.na?G.na(a,b,c,d,e,f,g,k,m,p,t,v,w,x):G.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x)};
h.oa=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C){var G=this.m.oa?this.m.oa(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C):this.m.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C),D=ch(this,G);u(D)||ah(this.name,G);return D.oa?D.oa(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C):D.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C)};
h.pa=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G){var D=this.m.pa?this.m.pa(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G):this.m.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G),J=ch(this,D);u(J)||ah(this.name,D);return J.pa?J.pa(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G):J.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G)};
h.qa=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D){var J=this.m.qa?this.m.qa(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D):this.m.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D),S=ch(this,J);u(S)||ah(this.name,J);return S.qa?S.qa(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D):S.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D)};
h.ra=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J){var S=this.m.ra?this.m.ra(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J):this.m.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J),U=ch(this,S);u(U)||ah(this.name,S);return U.ra?U.ra(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J):U.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J)};
h.sa=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S){var U=this.m.sa?this.m.sa(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S):this.m.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S),Ma=ch(this,U);u(Ma)||ah(this.name,U);return Ma.sa?Ma.sa(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S):Ma.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S)};
h.ta=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U){var Ma=this.m.ta?this.m.ta(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U):this.m.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U),fb=ch(this,Ma);u(fb)||ah(this.name,Ma);return fb.ta?fb.ta(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U):fb.call(null,a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U)};
h.Tb=function(a,b,c,d,e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma){var fb=ee(this.m,a,b,c,d,M([e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma],0)),K=ch(this,fb);u(K)||ah(this.name,fb);return ee(K,a,b,c,d,M([e,f,g,k,m,p,t,v,w,x,C,G,D,J,S,U,Ma],0))};h.Ya=function(a,b,c){te.G(this.Pb,bd,b,c);Wg(this.$b,this.Pb,this.Rb,this.Xb);return this};
function ch(a,b){B.b(H.a?H.a(a.Rb):H.call(null,a.Rb),H.a?H.a(a.Xb):H.call(null,a.Xb))||Wg(a.$b,a.Pb,a.Rb,a.Xb);var c=(H.a?H.a(a.$b):H.call(null,a.$b)).call(null,b);if(u(c))return c;c=Zg(a.name,b,a.Xb,a.Pb,a.td,a.$b,a.Rb);return u(c)?c:(H.a?H.a(a.Pb):H.call(null,a.Pb)).call(null,a.fd)}h.Ub=function(){return $b(this.name)};h.Vb=function(){return ac(this.name)};h.T=function(){return aa(this)};function dh(a,b){this.cc=a;this.A=b;this.w=2153775104;this.K=2048}h=dh.prototype;h.toString=function(){return this.cc};
h.equiv=function(a){return this.H(null,a)};h.H=function(a,b){return b instanceof dh&&this.cc===b.cc};h.V=function(a,b){return z(b,[y('#uuid "'),y(this.cc),y('"')].join(""))};h.T=function(){null==this.A&&(this.A=oc(this.cc));return this.A};var eh=new O(null,"mandatory","mandatory",542802336),fh=new A(null,"\x26","\x26",-2144855648,null),gh=new A(null,"init-cap-writer","init-cap-writer",-861558336,null),hh=new O(null,"on-message","on-message",1662987808),ih=new O(null,"logical-blocks","logical-blocks",-1466339776),jh=new A("cljs.core","unquote","cljs.core/unquote",1013085760,null),kh=new A(null,"when-first","when-first",821699168,null),lh=new O(null,"arg3","arg3",-1486822496),mh=new O(null,"binary-type","binary-type",1096940609),nh=
new O(null,"schema","schema",-1582001791),oh=new A(null,"defrecord*","defrecord*",-1936366207,null),ph=new O(null,"coord","coord",-1453656639),qh=new A(null,"meta15105","meta15105",-1100250495,null),rh=new O(null,"suffix","suffix",367373057),sh=new A(null,"try","try",-1273693247,null),th=new O(null,"selector","selector",762528866),uh=new A("cljs.core","*print-level*","cljs.core/*print-level*",65848482,null),vh=new A(null,"*print-circle*","*print-circle*",1148404994,null),wh=new O(null,"else-params",
"else-params",-832171646),xh=new O(null,"block","block",664686210),yh=new O(null,"allows-separator","allows-separator",-818967742),zh=new A(null,"last-was-whitespace?","last-was-whitespace?",-1073928093,null),Ah=new O(null,"indent","indent",-148200125),Bh=new A("cljs.pprint","*print-pretty*","cljs.pprint/*print-pretty*",-762636861,null),Ch=new A("cljs.pprint","*print-pprint-dispatch*","cljs.pprint/*print-pprint-dispatch*",-1820734013,null),Dh=new A(null,"*print-suppress-namespaces*","*print-suppress-namespaces*",
1795828355,null),Eh=new O(null,"miser-width","miser-width",-1310049437),Fh=new A(null,"struct","struct",325972931,null),Da=new O(null,"meta","meta",1499536964),Gh=new O(null,"body-type","body-type",542763588),Hh=new A(null,"..","..",-300507420,null),Ih=new A(null,"*print-pretty*","*print-pretty*",726795140,null),Jh=new A(null,"*print-pprint-dispatch*","*print-pprint-dispatch*",-1709114492,null),Kh=new O(null,"buffer-block","buffer-block",-10937307),Lh=new O(null,"color","color",1011675173),Mh=new A(null,
"max-columns","max-columns",-912112507,null),Nh=new O(null,"validate","validate",-201300827),Oh=new A(null,"upcase-writer","upcase-writer",51077317,null),Ea=new O(null,"dup","dup",556298533),Ph=new O(null,"arg2","arg2",1729550917),Qh=new O(null,"commainterval","commainterval",-1980061083),Rh=new O(null,"pretty-writer","pretty-writer",-1222834267),Sh=new O(null,"parent","parent",-878878779),Th=new O(null,"diffed?","diffed?",-2094692346),Uh=new O(null,"sections","sections",-886710106),Vh=new O(null,
"schema-id","schema-id",342379782),Wh=new O(null,"private","private",-558947994),Xh=new A(null,"meta15093","meta15093",135089606,null),Yh=new O(null,"else","else",-1508377146),Zh=new O(null,"miser","miser",-556060186),$h=new O(null,"undiff","undiff",1883196934),ai=new O(null,"gen","gen",142575302),bi=new O(null,"on-close","on-close",-761178394),ci=new O(null,"right-margin","right-margin",-810413306),di=new A("cljs.pprint","*print-base*","cljs.pprint/*print-base*",1887526790,null),ei=new A(null,"if-not",
"if-not",-265415609,null),fi=new A("cljs.core","deref","cljs.core/deref",1901963335,null),gi=new O(null,"offset","offset",296498311),hi=new O(null,"meta-value","meta-value",1750038663),ii=new A(null,"*print-level*","*print-level*",-634488505,null),ji=new A(null,"doseq","doseq",221164135,null),ki=new O(null,"cur","cur",1153190599),li=new O(null,"queue","queue",1455835879),re=new O(null,"validator","validator",-1966190681),mi=new A(null,"finally","finally",-1065347064,null),ni=new O(null,"coords","coords",
-599429112),oi=new O(null,"default","default",-1987822328),pi=new O(null,"added","added",2057651688),qi=new A(null,"when-let","when-let",-1383043480,null),ri=new O(null,"func","func",-238706040),si=new A(null,"loop*","loop*",615029416,null),ti=new O(null,"ns","ns",441598760),ui=new O(null,"symbol","symbol",-1038572696),vi=new O(null,"generator-fn","generator-fn",811851656),wi=new O(null,"name","name",1843675177),xi=new A("cljs.pprint","*print-radix*","cljs.pprint/*print-radix*",1558253641,null),yi=
new O(null,"n","n",562130025),zi=new O(null,"w","w",354169001),Ai=new O(null,"not-delivered","not-delivered",1599158697),Bi=new O(null,"remaining-arg-count","remaining-arg-count",-1216589335),Ci=new O(null,"fill","fill",883462889),Di=new O(null,"value","value",305978217),Ei=new O(null,"section","section",-300141526),Fi=new O(null,"time","time",1385887882),Gi=new A(null,"*print-length*","*print-length*",-687693654,null),Hi=new A("cljs.pprint","*print-miser-width*","cljs.pprint/*print-miser-width*",
1588913450,null),Ii=new A(null,"cljs.core","cljs.core",770546058,null),Ji=new A(null,"miser-width","miser-width",330482090,null),Ki=new A(null,"let","let",358118826,null),Li=new O(null,"file","file",-1269645878),Mi=new A(null,"-\x3e","-\x3e",-2139605430,null),Ni=new O(null,"end-pos","end-pos",-1643883926),Oi=new O(null,"circle","circle",1903212362),Pi=new O(null,"unpack","unpack",-2027067542),Qi=new O(null,"end-column","end-column",1425389514),Ng=new O(null,"static","static",1214358571),Ri=new O(null,
"mode","mode",654403691),Si=new O(null,"start","start",-355208981),Ti=new O(null,"lines","lines",-700165781),Ui=new O(null,"params","params",710516235),Vi=new A(null,"fn","fn",465265323,null),Wi=new O(null,"max-iterations","max-iterations",2021275563),Xi=new O(null,"pos","pos",-864607220),Ig=new O(null,"val","val",128701612),Yi=new O(null,"writing","writing",-1486865108),Zi=new A("cljs.pprint","*print-suppress-namespaces*","cljs.pprint/*print-suppress-namespaces*",1649488204,null),$i=new O(null,"type",
"type",1174270348),aj=new A(null,"pretty-writer","pretty-writer",417697260,null),bj=new O(null,"parameter-from-args","parameter-from-args",-758446196),cj=new A(null,"do","do",1686842252,null),dj=new O(null,"done-nl","done-nl",-381024340),ej=new A(null,"when-not","when-not",-1223136340,null),fj=new O(null,"suppress-namespaces","suppress-namespaces",2130686956),gj=new A(null,"when","when",1064114221,null),Dg=new O(null,"fallback-impl","fallback-impl",-1501286995),Aa=new O(null,"flush-on-newline","flush-on-newline",
-151457939),hj=new O(null,"relative-to","relative-to",-470100051),ij=new O(null,"string","string",-1989541586),jj=new O(null,"vector","vector",1902966158),kj=new O(null,"angle","angle",1622094254),lj=new A(null,"defn","defn",-126010802,null),mj=new A(null,"letfn*","letfn*",-110097810,null),nj=new A(null,"capped","capped",-1650988402,null),oj=new O(null,"e","e",1381269198),pj=new A(null,"if","if",1181717262,null),qj=new O(null,"char-format","char-format",-1016499218),rj=new O(null,"start-col","start-col",
668080143),ke=new A(null,"meta11834","meta11834",61315183,null),sj=new O(null,"radix","radix",857016463),tj=new A(null,"new","new",-444906321,null),Sg=new O(null,"descendants","descendants",1824886031),uj=new O(null,"colon-up-arrow","colon-up-arrow",244853007),vj=new A(null,"ns","ns",2082130287,null),wj=new O(null,"k","k",-2146297393),xj=new O(null,"prefix","prefix",-265908465),yj=new O(null,"column","column",2078222095),zj=new O(null,"colon","colon",-965200945),Tg=new O(null,"ancestors","ancestors",
-776045424),Aj=new O(null,"stream","stream",1534941648),Bj=new O(null,"level","level",1290497552),Cj=new A(null,"*print-radix*","*print-radix*",1168517744,null),Dj=new O(null,"meta-schema","meta-schema",-1703199056),Ej=new O(null,"user-data","user-data",2143823568),Ca=new O(null,"readably","readably",1129599760),Fj=new O(null,"right-bracket","right-bracket",951856080),tg=new O(null,"more-marker","more-marker",-14717935),Gj=new O(null,"dispatch","dispatch",1319337009),Hj=new A(null,"fields","fields",
-291534703,null),Ij=new O(null,"meta-schema-id","meta-schema-id",-448920367),Jj=new A("cljs.pprint","*print-right-margin*","cljs.pprint/*print-right-margin*",-56183119,null),Kj=new A("cljs.core","*print-length*","cljs.core/*print-length*",-20766927,null),Lj=new A(null,"cljs.pprint","cljs.pprint",-966900911,null),Mj=new O(null,"snapshot","snapshot",-1274785710),Nj=new O(null,"fixtures","fixtures",1009814994),Oj=new O("mikron","dnil","mikron/dnil",-1119699470),Pj=new A(null,"deftype*","deftype*",962659890,
null),Qj=new A(null,"let*","let*",1920721458,null),Rj=new A(null,"struct-map","struct-map",-1387540878,null),Sj=new O(null,"padchar","padchar",2018584530),Tj=new A(null,"js*","js*",-1134233646,null),Uj=new A(null,"dotimes","dotimes",-818708397,null),Vj=new O(null,"buffer-blob","buffer-blob",-1830112173),Wj=new O(null,"interp","interp",1576701107),Xj=new A(null,"*print-lines*","*print-lines*",75920659,null),Mg=new O(null,"dynamic","dynamic",704819571),Yj=new O(null,"buffering","buffering",-876713613),
Zj=new O(null,"line","line",212345235),ak=new A(null,"with-open","with-open",172119667,null),bk=new O(null,"list","list",765357683),ck=new A(null,"fn*","fn*",-752876845,null),dk=new O(null,"right-params","right-params",-1790676237),ek=new A(null,"defonce","defonce",-1681484013,null),fk=new A(null,"recur","recur",1202958259,null),gk=new A(null,"*print-miser-width*","*print-miser-width*",1206624211,null),hk=new A(null,"defn-","defn-",1097765044,null),Fa=new O(null,"print-length","print-length",1931866356),
ik=new O(null,"max","max",61366548),jk=new O(null,"trailing-white-space","trailing-white-space",1496006996),kk=new O(null,"id","id",-1388402092),lk=new O(null,"mincol","mincol",1230695445),mk=new A("clojure.core","deref","clojure.core/deref",188719157,null),nk=new O(null,"minpad","minpad",323570901),ok=new O(null,"current","current",-1088038603),pk=new O(null,"at","at",1476951349),qk=new O(null,"deref","deref",-145586795),Rg=new O(null,"parents","parents",-2027538891),rk=new O(null,"count","count",
2139924085),sk=new O(null,"per-line-prefix","per-line-prefix",846941813),tk=new O(null,"colnum","colnum",2023796854),uk=new A("cljs.core","*print-readably*","cljs.core/*print-readably*",-354670250,null),vk=new O(null,"length","length",588987862),wk=new O("mikron","invalid","mikron/invalid",1490396662),xk=new A(null,"loop","loop",1244978678,null),yk=new A("clojure.core","unquote","clojure.core/unquote",843087510,null),zk=new O(null,"overflowchar","overflowchar",-1620088106),Ak=new O(null,"end-line",
"end-line",1837326455),Bk=new A(null,"condp","condp",1054325175,null),Ck=new O(null,"right","right",-452581833),Dk=new O(null,"colinc","colinc",-584873385),Ek=new A(null,"cond","cond",1606708055,null),Fk=new O(null,"position","position",-2011731912),Gk=new O(null,"both","both",-393648840),Hk=new O(null,"d","d",1972142424),Ik=new A(null,"binding","binding",-2114503176,null),Jk=new A(null,"with-local-vars","with-local-vars",837642072,null),Kk=new O(null,"def","def",-1043430536),Lk=new A(null,"defmacro",
"defmacro",2054157304,null),Mk=new A(null,"meta14687","meta14687",-868086471,null),Nk=new A(null,"set!","set!",250714521,null),Ok=new O(null,"clauses","clauses",1454841241),Pk=new O(null,"indent-t","indent-t",528318969),Qk=new O(null,"fixture","fixture",1595630169),Rk=new A("cljs.pprint","*print-circle*","cljs.pprint/*print-circle*",1606185849,null),Sk=new O(null,"linear","linear",872268697),Tk=new O(null,"seq","seq",-1817803783),Uk=new A(null,"locking","locking",1542862874,null),Vk=new O(null,"on-error",
"on-error",1728533530),Wk=new A(null,".",".",1975675962,null),Xk=new A(null,"*print-right-margin*","*print-right-margin*",-437272454,null),Yk=new O(null,"first","first",-644103046),Zk=new A(null,"var","var",870848730,null),$k=new A(null,"meta15141","meta15141",911676762,null),je=new A(null,"quote","quote",1377916282,null),al=new O(null,"bracket-info","bracket-info",-1600092774),bl=new O(null,"set","set",304602554),cl=new O(null,"base-args","base-args",-1268706822),dl=new O(null,"pretty","pretty",
-1916372486),el=new A(null,"meta14144","meta14144",-2047508998,null),fl=new A(null,"lb","lb",950310490,null),gl=new O(null,"end","end",-268185958),hl=new O(null,"logical-block-callback","logical-block-callback",1612691194),il=new O(null,"base","base",185279322),ie=new O(null,"arglists","arglists",1661989754),jl=new A(null,"if-let","if-let",1803593690,null),he=new A(null,"nil-iter","nil-iter",1101030523,null),kl=new A(null,"*print-readably*","*print-readably*",-761361221,null),ll=new A(null,"capitalize-word-writer",
"capitalize-word-writer",196688059,null),ml=new O(null,"hierarchy","hierarchy",-1053470341),nl=new A(null,"catch","catch",-1616370245,null),ol=new O(null,"buffer-level","buffer-level",928864731),pl=new O(null,"intra-block-nl","intra-block-nl",1808826875),ql=new O(null,"body","body",-2049205669),rl=new O(null,"separator","separator",-1628749125),sl=new O(null,"flags","flags",1775418075),Cg=new O(null,"alt-impl","alt-impl",670969595),tl=new A(null,"writer","writer",1362963291,null),ul=new O(null,"doc",
"doc",1913296891),vl=new O(null,"directive","directive",793559132),wl=new O(null,"logical-block","logical-block",-581022564),xl=new O(null,"bodies","bodies",-1295887172),yl=new O(null,"last","last",1105735132),zl=new O(null,"jsdoc","jsdoc",1745183516),Al=new A("cljs.pprint","*print-lines*","cljs.pprint/*print-lines*",534683484,null),Bl=new O(null,"up-arrow","up-arrow",1705310333),Cl=new O(null,"type-tag","type-tag",-1873863267),Dl=new O(null,"on-open","on-open",-1391088163),El=new O(null,"map","map",
1371690461),Fl=new O(null,"pack","pack",-1240257891),Gl=new O(null,"min-remaining","min-remaining",962687677),Hl=new O(null,"test","test",577538877),Il=new O(null,"rest","rest",-1241696419),Jl=new A(null,"throw","throw",595905694,null),Kl=new O(null,"arg1","arg1",951899358),Ll=new O(null,"nl-t","nl-t",-1608382114),Ml=new O(null,"buffer","buffer",617295198),Nl=new O(null,"start-pos","start-pos",668789086),Ol=new A(null,"meta15123","meta15123",-42053122,null),Pl=new O(null,"max-columns","max-columns",
1742323262),Ql=new O(null,"start-block-t","start-block-t",-373430594),Rl=new O(null,"exponentchar","exponentchar",1986664222),Og=new O(null,"kinetic","kinetic",-451191810),Sl=new O(null,"end-block-t","end-block-t",1544648735),Tl=new A(null,"def","def",597100991,null),Ul=new O(null,"diff","diff",2135942783),Vl=new A(null,"*print-base*","*print-base*",2037937791,null),Wl=new O(null,"data","data",-232669377),Xl=new O(null,"commachar","commachar",652859327),Yl=new A(null,"downcase-writer","downcase-writer",
37286911,null);var Zl=new q(null,5,[hh,"onmessage",Dl,"onopen",Vk,"onerror",bi,"onclose",mh,"binaryType"],null);function $l(){var a=[y("ws://"),y(location.host)].join(""),b=am,a=new WebSocket(a);Jg(function(a){return function(b){var e=N(b,0,null);b=N(b,1,null);e=Zl.a?Zl.a(e):Zl.call(null,e);return u(e)?a[e]=b:null}}(a),b);return a}function bm(a,b){var c;c=u(a)?B.b(1,a.readyState):a;return u(c)?(a.send(b),!0):!1};function cm(a,b){var c=Array.prototype.slice.call(arguments),d=c.shift();if("undefined"==typeof d)throw Error("[goog.string.format] Template required");return d.replace(/%([0\-\ \+]*)(\d+)?(\.(\d+))?([%sfdiu])/g,function(a,b,d,k,m,p,t,v){if("%"==p)return"%";var w=c.shift();if("undefined"==typeof w)throw Error("[goog.string.format] Not enough arguments");arguments[0]=w;return cm.nb[p].apply(null,arguments)})}cm.nb={};
cm.nb.s=function(a,b,c){return isNaN(c)||""==c||a.length>=c?a:a=-1<b.indexOf("-",0)?a+ia(" ",c-a.length):ia(" ",c-a.length)+a};cm.nb.f=function(a,b,c,d,e){d=a.toString();isNaN(e)||""==e||(d=parseFloat(a).toFixed(e));var f;f=0>a?"-":0<=b.indexOf("+")?"+":0<=b.indexOf(" ")?" ":"";0<=a&&(d=f+d);if(isNaN(c)||d.length>=c)return d;d=isNaN(e)?Math.abs(a).toString():Math.abs(a).toFixed(e);a=c-d.length-f.length;0<=b.indexOf("-",0)?d=f+d+ia(" ",a):(b=0<=b.indexOf("0",0)?"0":" ",d=f+ia(b,a)+d);return d};
cm.nb.d=function(a,b,c,d,e,f,g,k){return cm.nb.f(parseInt(a,10),b,c,d,0,f,g,k)};cm.nb.i=cm.nb.d;cm.nb.u=cm.nb.d;function dm(a){throw Error(ae(y,a));}rg("^([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+))(N)?$");rg("^([-+]?[0-9]+)/([0-9]+)$");rg("^([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?$");rg("^[:]?([^0-9/].*/)?([^0-9/][^/]*)$");rg("^[0-9A-Fa-f]{2}$");rg("^[0-9A-Fa-f]{4}$");
var em=function(a,b){return function(c,d){return qc.b(u(d)?b:a,c)}}(new T(null,13,5,V,[null,31,28,31,30,31,30,31,31,30,31,30,31],null),new T(null,13,5,V,[null,31,29,31,30,31,30,31,31,30,31,30,31],null)),pg=/(\d\d\d\d)(?:-(\d\d)(?:-(\d\d)(?:[T](\d\d)(?::(\d\d)(?::(\d\d)(?:[.](\d+))?)?)?)?)?)?(?:[Z]|([-+])(\d\d):(\d\d))?/;function fm(a){a=parseInt(a,10);return Oa(isNaN(a))?a:null}
function gm(a,b,c,d){a<=b&&b<=c||dm(M([[y(d),y(" Failed:  "),y(a),y("\x3c\x3d"),y(b),y("\x3c\x3d"),y(c)].join("")],0));return b}
function hm(a){var b=og(a);N(b,0,null);var c=N(b,1,null),d=N(b,2,null),e=N(b,3,null),f=N(b,4,null),g=N(b,5,null),k=N(b,6,null),m=N(b,7,null),p=N(b,8,null),t=N(b,9,null),v=N(b,10,null);if(Oa(b))return dm(M([[y("Unrecognized date/time syntax: "),y(a)].join("")],0));var w=fm(c),x=function(){var a=fm(d);return u(a)?a:1}();a=function(){var a=fm(e);return u(a)?a:1}();var b=function(){var a=fm(f);return u(a)?a:0}(),c=function(){var a=fm(g);return u(a)?a:0}(),C=function(){var a=fm(k);return u(a)?a:0}(),G=
function(){var a;a:if(B.b(3,L(m)))a=m;else if(3<L(m))a=m.substring(0,3);else for(a=new ka(m);;)if(3>a.sb.length)a=a.append("0");else{a=a.toString();break a}a=fm(a);return u(a)?a:0}(),p=(B.b(p,"-")?-1:1)*(60*function(){var a=fm(t);return u(a)?a:0}()+function(){var a=fm(v);return u(a)?a:0}());return new T(null,8,5,V,[w,gm(1,x,12,"timestamp month field must be in range 1..12"),gm(1,a,function(){var a;a=0===(w%4+4)%4;u(a)&&(a=Oa(0===(w%100+100)%100),a=u(a)?a:0===(w%400+400)%400);return em.b?em.b(x,a):
em.call(null,x,a)}(),"timestamp day field must be in range 1..last day in month"),gm(0,b,23,"timestamp hour field must be in range 0..23"),gm(0,c,59,"timestamp minute field must be in range 0..59"),gm(0,C,B.b(c,59)?60:59,"timestamp second field must be in range 0..60"),gm(0,G,999,"timestamp millisecond field must be in range 0..999"),p],null)}
var im=new q(null,4,["inst",function(a){var b;if("string"===typeof a)if(b=hm(a),u(b)){a=N(b,0,null);var c=N(b,1,null),d=N(b,2,null),e=N(b,3,null),f=N(b,4,null),g=N(b,5,null),k=N(b,6,null);b=N(b,7,null);b=new Date(Date.UTC(a,c-1,d,e,f,g,k)-6E4*b)}else b=dm(M([[y("Unrecognized date/time syntax: "),y(a)].join("")],0));else b=dm(M(["Instance literal expects a string for its timestamp."],0));return b},"uuid",function(a){return"string"===typeof a?new dh(a,null):dm(M(["UUID literal expects a string as its representation."],
0))},"queue",function(a){return kd(a)?Ge(jf,a):dm(M(["Queue literal expects a vector for its elements."],0))},"js",function(a){if(kd(a)){var b=[];a=r(a);for(var c=null,d=0,e=0;;)if(e<d){var f=c.fa(null,e);b.push(f);e+=1}else if(a=r(a))c=a,ld(c)?(a=Wb(c),e=Xb(c),c=a,d=L(a),a=e):(a=E(c),b.push(a),a=F(c),c=null,d=0),e=0;else break;return b}if(jd(a)){b={};a=r(a);c=null;for(e=d=0;;)if(e<d){var g=c.fa(null,e),f=N(g,0,null),g=N(g,1,null);b[Md(f)]=g;e+=1}else if(a=r(a))ld(a)?(d=Wb(a),a=Xb(a),c=d,d=L(d)):
(d=E(a),c=N(d,0,null),d=N(d,1,null),b[Md(c)]=d,a=F(a),c=null,d=0),e=0;else break;return b}return dm(M([[y("JS literal expects a vector or map containing "),y("only string or unqualified keyword keys")].join("")],0))}],null);pe||oe.call(null,im);pe||oe.call(null,null);function jm(a,b){return be(cm,a,b)}ue.b(vd,Yd.v(new T(null,4,5,V,["_","-","?","!"],null),new mg(null,97,123,1,null),M([new mg(null,65,91,1,null),new mg(null,48,58,1,null)],0)));function km(a){a=Math.pow(2,8*a);var b=Math.floor(1*a*Math.random());return wd(Oa(!0)?b:b-a/2)}function lm(a,b,c,d){this.value=a;this.D=b;this.o=c;this.A=d;this.w=2229667594;this.K=8192}h=lm.prototype;h.Z=function(a,b){return mb.c(this,b,null)};
h.W=function(a,b,c){switch(b instanceof O?b.ca:null){case "value":return this.value;default:return qc.c(this.o,b,c)}};h.V=function(a,b,c){return sg(b,function(){return function(a){return sg(b,Ag,""," ","",c,a)}}(this),"#mikron.common.DiffedValue{",", ","}",c,Yd.b(new T(null,1,5,V,[new T(null,2,5,V,[Di,this.value],null)],null),this.o))};h.Aa=function(){return new nf(0,this,1,new T(null,1,5,V,[Di],null),dc(this.o))};h.O=function(){return this.D};h.aa=function(){return 1+L(this.o)};
h.T=function(){var a=this.A;return null!=a?a:this.A=a=Cd(this)};h.H=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?mf(this,b):c:b;return u(c)?!0:!1};h.Wa=function(a,b){return rd(new fg(null,new q(null,1,[Di,null],null),null),b)?dd.b(Tc(Ge(W,this),this.D),b):new lm(this.value,this.D,fe(dd.b(this.o,b)),null)};h.Ta=function(a,b,c){return u(R.b?R.b(Di,b):R.call(null,Di,b))?new lm(c,this.D,this.o,null):new lm(this.value,this.D,bd.c(this.o,b,c),null)};
h.$=function(){return r(Yd.b(new T(null,1,5,V,[new T(null,2,5,V,[Di,this.value],null)],null),this.o))};h.R=function(a,b){return new lm(this.value,b,this.o,this.A)};h.Y=function(a,b){return kd(b)?ob(this,eb.b(b,0),eb.b(b,1)):Va(cb,this,b)};function mm(a){return new lm(a,null,null,null)}function nm(a){if(!u(a instanceof lm))throw Error("Assert failed: (diffed? value)");return Di.a(a)};var om=function om(b){if(null!=b&&null!=b.Hc)return b.Hc();var c=om[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=om._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("Buffer.read-byte!",b);},pm=function pm(b){if(null!=b&&null!=b.Jc)return b.Jc();var c=pm[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=pm._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("Buffer.read-int!",b);},qm=function qm(b){if(null!=b&&null!=b.Kc)return b.Kc();var c=qm[l(null==b?
null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=qm._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("Buffer.read-long!",b);},rm=function rm(b){if(null!=b&&null!=b.Ic)return b.Ic();var c=rm[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=rm._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("Buffer.read-float!",b);},sm=function sm(b){if(null!=b&&null!=b.Gc)return b.Gc();var c=sm[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=sm._;if(null!=c)return c.a?
c.a(b):c.call(null,b);throw Ra("Buffer.read-boolean!",b);},tm=function tm(b,c){if(null!=b&&null!=b.Mc)return b.Mc(0,c);var d=tm[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=tm._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Ra("Buffer.write-byte!",b);},um=function um(b,c){if(null!=b&&null!=b.Oc)return b.Oc(0,c);var d=um[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=um._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Ra("Buffer.write-int!",
b);},vm=function vm(b,c){if(null!=b&&null!=b.Pc)return b.Pc(0,c);var d=vm[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=vm._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Ra("Buffer.write-long!",b);},wm=function wm(b,c){if(null!=b&&null!=b.Nc)return b.Nc(0,c);var d=wm[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=wm._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Ra("Buffer.write-float!",b);},xm=function xm(b,c){if(null!=b&&null!=b.Lc)return b.Lc(0,
c);var d=xm[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=xm._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Ra("Buffer.write-boolean!",b);},ym=function ym(b){if(null!=b&&null!=b.Fc)return b.Fc();var c=ym[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=ym._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("Buffer.little-endian?",b);},zm=function zm(b,c){if(null!=b&&null!=b.Ec)return b.Ec(0,c);var d=zm[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,
c):d.call(null,b,c);d=zm._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Ra("Buffer.little-endian!",b);},Am=function Am(b){if(null!=b&&null!=b.Cc)return b.Cc();var c=Am[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Am._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("Buffer.clear!",b);},Bm=function Bm(b){if(null!=b&&null!=b.Dc)return b.Dc();var c=Bm[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Bm._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("Buffer.compress",
b);};h=ByteBuffer.prototype;h.Hc=function(){return this.readInt8()};h.Jc=function(){return this.readInt32()};h.Kc=function(){return this.readInt64().toNumber()};h.Ic=function(){return this.readFloat32()};h.Gc=function(){var a=this.bitIndex;0===(a%8+8)%8&&(this.bitBuffer=this.readInt8());this.bitIndex=a+1;return 0!==(this.bitBuffer&1<<(a%8+8)%8)};h.Mc=function(a,b){return this.writeInt8(b)};h.Oc=function(a,b){return this.writeInt32(b|0)};h.Pc=function(a,b){return this.writeInt64(wd(b))};
h.Nc=function(a,b){return this.writeFloat32(b)};h.Lc=function(a,b){var c=this.bitIndex;if(0===(c%8+8)%8){0<c&&this.writeInt8(this.bitBuffer,this.bitPosition);this.bitBuffer=0;var d=this.offset;this.bitPosition=d;this.offset=d+1}this.bitIndex=c+1;this.bitBuffer=u(b)?this.bitBuffer|1<<(c%8+8)%8:this.bitBuffer&~(1<<(c%8+8)%8);return this};h.Fc=function(){return this.littleEndian};h.Ec=function(a,b){return this.littleEndian=b};
h.Cc=function(){this.bitIndex=this.offset=0;this.bitPosition=-1;this.bitBuffer=0;return this};h.Dc=function(){var a=this.bitPosition;!B.b(a,-1)&&this.writeInt8(this.bitBuffer,a);return this.slice(0,this.offset).toArrayBuffer()};function Cm(a,b){var c=0>b,d=c?-(b+1):b;xm(a,c);for(c=d;;){if(0===(c&-128))return tm(a,c);tm(a,wd(c)&127|128);c>>>=7}}
function Dm(a){for(var b=sm(a),c=0,d=0;;)if(64>d){var e=om(a),c=c|(e&127)<<d;if(0===(e&128))return Oa(b)?c:-c-1;d+=7}else throw Error("Malformed varint!");}function Em(a,b,c,d){a=xm(Cm(xm(xm(Am(a),ym(a)),d),b),c);return u(c)?Cm(a,c):a}function Fm(a){zm(a,sm(a));return new q(null,3,[Th,sm(a),Vh,Dm(a),Ij,u(sm(a))?Dm(a):null],null)};var Gm=function(){var a=Am(ByteBuffer.allocate(1E4)),b=function(){return function(a,b,c,d,e){c=Math.abs(e-c)<Math.abs(e-d);return B.b(a,b)?a:c?a:b}}(a),c=function(){return function(a){return new T(null,2,5,V,[rm(a),rm(a)],null)}}(a),d=function(){return function(a,b){return mm(B.b(a,b)?Oj:b)}}(a),e=function(a){return function(){return new q(null,2,[Fi,km(8),xl,Ce(2+Kg(4),function(){return function(){return t()}}(a))],null)}}(a),f=function(a){return function(b){return u(sm(b))?Oj:new q(null,2,[xl,u(sm(b))?
Oj:ng(Ce(Dm(b),function(){return function(){return u(sm(b))?Oj:fb(b)}}(a))),Fi,u(sm(b))?Oj:qm(b)],null)}}(a),g=function(a){return function(b,c){var d=kj.a(c);wm(b,d);var e=Gh.a(c);Cm(b,function(){switch(e instanceof O?e.ca:null){case "dynamic":return 0;case "static":return 1;case "kinetic":return 2;default:throw Error([y("No matching clause: "),y(e)].join(""));}}());d=Nj.a(c);Cm(b,L(d));Jg(function(){return function(a){return S(b,a)}}(d,a),d);d=Fk.a(c);ha(b,d);d=Ej.a(c);d=kk.a(d);um(b,d);return b}}(a),
k=function(a){return function(b,c){var d=xl.a(c);Cm(b,L(d));Jg(function(){return function(a){return g(b,a)}}(d,a),d);d=Fi.a(c);vm(b,d);return b}}(a),m=function(){return function(a,b,c,d,e){c=Math.abs(e-c)<Math.abs(e-d);return B.b(a,b)?a:c?a:b}}(a),p=function(a){return function(b){if(!jd(b))throw Error([y("Assert failed: "),y(jm("'%s' is not a map.",M([b],0))),y("\n"),y("(clojure.core/map? value_14276)")].join(""));var c=Ej.a(b);if(!jd(c))throw Error([y("Assert failed: "),y(jm("'%s' is not a map.",
M([c],0))),y("\n"),y("(clojure.core/map? inner-value_14277)")].join(""));c=Lh.a(c);if(!qd(c))throw Error([y("Assert failed: "),y(jm("'%s' is not an integer.",M([c],0))),y("\n"),y("(clojure.core/integer? inner-value_14278)")].join(""));c=ni.a(b);if(!id(c))throw Error([y("Assert failed: "),y(jm("'%s' is not sequential.",M([c],0))),y("\n"),y("(clojure.core/sequential? inner-value_14277)")].join(""));Jg(function(){return function(a){return v(a)}}(c,a),c);return b}}(a),t=function(a){return function(){return new q(null,
5,[Ej,new q(null,1,[kk,km(4)],null),Fk,ib(),kj,1*Math.random(),Gh,Lg(),Nj,Ce(2+Kg(4),function(){return function(){return Ia()}}(a))],null)}}(a),v=function(){return function(a){if(!kd(a))throw Error([y("Assert failed: "),y(jm("'%s' is not a vector.",M([a],0))),y("\n"),y("(clojure.core/vector? value_14302)")].join(""));var b=a.a?a.a(0):a.call(null,0);if("number"!==typeof b)throw Error([y("Assert failed: "),y(jm("'%s' is not a number.",M([b],0))),y("\n"),y("(clojure.core/number? inner-value_14303)")].join(""));
b=a.a?a.a(1):a.call(null,1);if("number"!==typeof b)throw Error([y("Assert failed: "),y(jm("'%s' is not a number.",M([b],0))),y("\n"),y("(clojure.core/number? inner-value_14303)")].join(""));return a}}(a),w=function(){return function(a,b){var c=nm(b);return B.b(Oj,c)?a:c}}(a),x=function(){return function(a,b,c,d,e){c=Math.abs(e-c)<Math.abs(e-d);return B.b(a,b)?a:c?a:b}}(a),C=function(a){return function(b){if(!jd(b))throw Error([y("Assert failed: "),y(jm("'%s' is not a map.",M([b],0))),y("\n"),y("(clojure.core/map? value_14244)")].join(""));
var c=Ej.a(b);if(!jd(c))throw Error([y("Assert failed: "),y(jm("'%s' is not a map.",M([c],0))),y("\n"),y("(clojure.core/map? inner-value_14245)")].join(""));c=kk.a(c);if(!qd(c))throw Error([y("Assert failed: "),y(jm("'%s' is not an integer.",M([c],0))),y("\n"),y("(clojure.core/integer? inner-value_14246)")].join(""));c=Fk.a(b);v(c);c=kj.a(b);if("number"!==typeof c)throw Error([y("Assert failed: "),y(jm("'%s' is not a number.",M([c],0))),y("\n"),y("(clojure.core/number? inner-value_14245)")].join(""));
c=Gh.a(b);if(!u((new fg(null,new q(null,3,[Ng,null,Mg,null,Og,null],null),null)).call(null,c)))throw Error([y("Assert failed: "),y(jm("'%s' is not a valid enum value.",M([c],0))),y("\n"),y("(#{:static :dynamic :kinetic} inner-value_14245)")].join(""));c=Nj.a(b);if(!id(c))throw Error([y("Assert failed: "),y(jm("'%s' is not sequential.",M([c],0))),y("\n"),y("(clojure.core/sequential? inner-value_14245)")].join(""));Jg(function(){return function(a){return p(a)}}(c,a),c);return b}}(a),G=function(a){return function(b,
c){var d=B.b(Oj,c);xm(b,d);if(!d){var e=xl.a(c),f=B.b(Oj,e);xm(b,f);f||(Cm(b,L(e)),Jg(function(){return function(a){var c=B.b(Oj,a);xm(b,c);return c?null:sa(b,a)}}(f,e,d,a),e));d=Fi.a(c);e=B.b(Oj,d);xm(b,e);e||vm(b,d)}return b}}(a),D=function(a){return function(b){return new q(null,2,[ni,ng(Ce(Dm(b),function(){return function(){return c(b)}}(a))),Ej,new q(null,1,[Lh,pm(b)],null)],null)}}(a),J=function(){return function(a,b,c,d,e){c=Math.abs(e-c)<Math.abs(e-d);return B.b(a,b)?a:c?a:b}}(a),S=function(a){return function(b,
c){var d=ni.a(c);Cm(b,L(d));Jg(function(){return function(a){return ha(b,a)}}(d,a),d);d=Ej.a(c);d=Lh.a(d);um(b,d);return b}}(a),U=function(a){return function(b,c){var d=B.b(Oj,c);xm(b,d);if(!d){var e=ni.a(c),f=B.b(Oj,e);xm(b,f);f||(Cm(b,L(e)),Jg(function(){return function(a){var c=B.b(Oj,a);xm(b,c);return c?null:da(b,a)}}(f,e,d,a),e));d=Ej.a(c);e=B.b(Oj,d);xm(b,e);e||(d=Lh.a(d),e=B.b(Oj,d),xm(b,e),e||um(b,d))}return b}}(a),Ma=function(){return function(a,b){return mm(B.b(a,b)?Oj:b)}}(a),fb=function(a){return function(b){return u(sm(b))?
Oj:new q(null,5,[kj,u(sm(b))?Oj:rm(b),Gh,u(sm(b))?Oj:qc.b(new T(null,3,5,V,[Mg,Ng,Og],null),Dm(b)),Nj,u(sm(b))?Oj:ng(Ce(Dm(b),function(){return function(){return u(sm(b))?Oj:wa(b)}}(a))),Fk,u(sm(b))?Oj:K(b),Ej,u(sm(b))?Oj:new q(null,1,[kk,u(sm(b))?Oj:pm(b)],null)],null)}}(a),K=function(){return function(a){return u(sm(a))?Oj:new T(null,2,5,V,[u(sm(a))?Oj:rm(a),u(sm(a))?Oj:rm(a)],null)}}(a),wa=function(a){return function(b){return u(sm(b))?Oj:new q(null,2,[ni,u(sm(b))?Oj:ng(Ce(Dm(b),function(){return function(){return u(sm(b))?
Oj:K(b)}}(a))),Ej,u(sm(b))?Oj:new q(null,1,[Lh,u(sm(b))?Oj:pm(b)],null)],null)}}(a),Y=function(a){return function(b){if(!jd(b))throw Error([y("Assert failed: "),y(jm("'%s' is not a map.",M([b],0))),y("\n"),y("(clojure.core/map? value_14329)")].join(""));var c=Fi.a(b);if(!qd(c))throw Error([y("Assert failed: "),y(jm("'%s' is not an integer.",M([c],0))),y("\n"),y("(clojure.core/integer? inner-value_14330)")].join(""));c=xl.a(b);if(!id(c))throw Error([y("Assert failed: "),y(jm("'%s' is not sequential.",
M([c],0))),y("\n"),y("(clojure.core/sequential? inner-value_14330)")].join(""));Jg(function(){return function(a){return C(a)}}(c,a),c);return b}}(a),ba=function(){return function(a,b){return mm(B.b(a,b)?Oj:b)}}(a),da=function(){return function(a,b){var c=B.b(Oj,b);xm(a,c);if(!c){var c=b.a?b.a(0):b.call(null,0),d=B.b(Oj,c);xm(a,d);d||wm(a,c);c=b.a?b.a(1):b.call(null,1);d=B.b(Oj,c);xm(a,d);d||wm(a,c)}return a}}(a),ha=function(){return function(a,b){var c=b.a?b.a(0):b.call(null,0);wm(a,c);c=b.a?b.a(1):
b.call(null,1);wm(a,c);return a}}(a),ma=function(){return function(a,b){var c=nm(b);return B.b(Oj,c)?a:c}}(a),sa=function(a){return function(b,c){var d=B.b(Oj,c);xm(b,d);if(!d){var e=kj.a(c),f=B.b(Oj,e);xm(b,f);f||wm(b,e);var g=Gh.a(c),e=B.b(Oj,g);xm(b,e);e||Cm(b,function(){switch(g instanceof O?g.ca:null){case "dynamic":return 0;case "static":return 1;case "kinetic":return 2;default:throw Error([y("No matching clause: "),y(g)].join(""));}}());e=Nj.a(c);f=B.b(Oj,e);xm(b,f);f||(Cm(b,L(e)),Jg(function(){return function(a){var c=
B.b(Oj,a);xm(b,c);return c?null:U(b,a)}}(f,e,d,a),e));d=Fk.a(c);e=B.b(Oj,d);xm(b,e);e||da(b,d);d=Ej.a(c);e=B.b(Oj,d);xm(b,e);e||(d=kk.a(d),e=B.b(Oj,d),xm(b,e),e||um(b,d))}return b}}(a),ua=function(){return function(a,b){return mm(B.b(a,b)?Oj:b)}}(a),za=function(a){return function(b){return new q(null,2,[xl,ng(Ce(Dm(b),function(){return function(){return Ba(b)}}(a))),Fi,qm(b)],null)}}(a),Ba=function(a){return function(b){return new q(null,5,[kj,rm(b),Gh,qc.b(new T(null,3,5,V,[Mg,Ng,Og],null),Dm(b)),
Nj,ng(Ce(Dm(b),function(){return function(){return D(b)}}(a))),Fk,c(b),Ej,new q(null,1,[kk,pm(b)],null)],null)}}(a),Ia=function(a){return function(){return new q(null,2,[Ej,new q(null,1,[Lh,km(4)],null),ni,Ce(2+Kg(4),function(){return function(){return ib()}}(a))],null)}}(a),ib=function(){return function(){return new T(null,2,5,V,[1*Math.random(),1*Math.random()],null)}}(a),Ya=function(){return function(a,b){var c=nm(b);return B.b(Oj,c)?a:c}}(a),ab=function(){return function(a,b){var c=nm(b);return B.b(Oj,
c)?a:c}}(a);return cd([Fl,Pi,Ul,$h,ai,Wj,Nh],[function(a){return function(){function b(c,d,e,f){var m=d instanceof lm,p=u(m)?nm(d):d;return Bm(function(){var b=(u(m)?function(){switch(c instanceof O?c.ca:null){case "body":return sa;case "fixture":return U;case "coord":return da;case "snapshot":return G;default:throw Error([y("No matching clause: "),y(c)].join(""));}}():function(){switch(c instanceof O?c.ca:null){case "body":return g;case "fixture":return S;case "coord":return ha;case "snapshot":return k;
default:throw Error([y("No matching clause: "),y(c)].join(""));}}()).call(null,Em(a,(new q(null,4,[ql,0,ph,1,Qk,2,Mj,3],null)).call(null,c),(new q(null,4,[ql,0,ph,1,Qk,2,Mj,3],null)).call(null,e),m),p);return u(e)?function(){switch(e instanceof O?e.ca:null){case "body":return g;case "fixture":return S;case "coord":return ha;case "snapshot":return k;default:throw Error([y("No matching clause: "),y(e)].join(""));}}().call(null,b,f):b}())}function c(a,b){return d.G(a,b,null,null)}var d=null,d=function(a,
d,e,f){switch(arguments.length){case 2:return c.call(this,a,d);case 4:return b.call(this,a,d,e,f)}throw Error("Invalid arity: "+arguments.length);};d.b=c;d.G=b;return d}()}(a),function(){return function(a){var b=Am(ByteBuffer.wrap(a));a=Fm(b);var d=qc.b(new T(null,4,5,V,[ql,ph,Qk,Mj],null),Vh.a(a)),e=Ij.a(a),g=qc.b(new T(null,4,5,V,[ql,ph,Qk,Mj],null),e),k=Th.a(a);if(u(function(){var a=Oa(d);return a?a:u(e)?Oa(g):e}()))return wk;a=new q(null,3,[nh,d,Th,k,Di,function(){var a=(u(k)?function(){switch(d instanceof
O?d.ca:null){case "body":return fb;case "fixture":return wa;case "coord":return K;case "snapshot":return f;default:throw Error([y("No matching clause: "),y(d)].join(""));}}():function(){switch(d instanceof O?d.ca:null){case "body":return Ba;case "fixture":return D;case "coord":return c;case "snapshot":return za;default:throw Error([y("No matching clause: "),y(d)].join(""));}}()).call(null,b);return u(k)?mm(a):a}()],null);return u(g)?bd.v(a,Dj,g,M([hi,function(){switch(g instanceof O?g.ca:null){case "body":return Ba;
case "fixture":return D;case "coord":return c;case "snapshot":return za;default:throw Error([y("No matching clause: "),y(g)].join(""));}}().call(null,b)],0)):a}}(a),function(){return function(a,b,c){return function(){switch(a instanceof O?a.ca:null){case "body":return ba;case "fixture":return d;case "coord":return Ma;case "snapshot":return ua;default:throw Error([y("No matching clause: "),y(a)].join(""));}}().call(null,b,c)}}(a),function(){return function(a,b,c){return function(){switch(a instanceof
O?a.ca:null){case "body":return w;case "fixture":return Ya;case "coord":return ab;case "snapshot":return ma;default:throw Error([y("No matching clause: "),y(a)].join(""));}}().call(null,b,c)}}(a),function(){return function(a){return function(){switch(a instanceof O?a.ca:null){case "body":return t;case "fixture":return Ia;case "coord":return ib;case "snapshot":return e;default:throw Error([y("No matching clause: "),y(a)].join(""));}}().call(null)}}(a),function(){return function(a,c,d,e,f,g){return function(){switch(a instanceof
O?a.ca:null){case "body":return b;case "fixture":return m;case "coord":return x;case "snapshot":return J;default:throw Error([y("No matching clause: "),y(a)].join(""));}}().call(null,c,d,e,f,g)}}(a),function(){return function(a,b){return function(){switch(a instanceof O?a.ca:null){case "body":return C;case "fixture":return p;case "coord":return v;case "snapshot":return Y;default:throw Error([y("No matching clause: "),y(a)].join(""));}}().call(null,b)}}(a)])}();Fl.a(Gm);ai.a(Gm);var Hm=Pi.a(Gm);function Im(a){return"/(?:)/"===""+y("\n")?Zc.b(We(Rc("",ue.b(y,r(a)))),""):We((""+y(a)).split("\n"))};var Jm,Km,Lm,Mm,Nm,Om,Pm=function Pm(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ha(c.slice(0),0,null):null;return Pm.v(c)};Pm.v=function(a){return z(n,ae(Gg,a))};Pm.I=0;Pm.J=function(a){return Pm.v(r(a))};var Qm=function Qm(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ha(c.slice(0),0,null):null;return Qm.v(c)};Qm.v=function(a){return z(n,ae(Fg,a))};Qm.I=0;Qm.J=function(a){return Qm.v(r(a))};
function Rm(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;b=0<b.length?new Ha(b.slice(0),0,null):null;ae(Qm,b);z(n,"\n")}function Sm(a){if("number"===typeof a)return a;if("string"===typeof a&&1===a.length)return a.charCodeAt(0);throw Error("Argument to char must be a character or number");}
function Tm(a,b,c){var d=c;for(c=$c;;){if(gd(d))return new T(null,2,5,V,[c,b],null);var e=E(d),d=F(d),e=ae(a,new T(null,2,5,V,[e,b],null));b=N(e,0,null);e=N(e,1,null);c=Zc.b(c,b);b=e}}function Um(a,b){for(var c=b,d=$c;;){var e=ae(a,new T(null,1,5,V,[c],null)),c=N(e,0,null),e=N(e,1,null);if(Oa(c))return new T(null,2,5,V,[d,e],null);d=Zc.b(d,c);c=e}}
function Vm(a){return new T(null,2,5,V,[Ge(W,function(){return function c(a){return new Nd(null,function(){for(;;){var e=r(a);if(e){if(ld(e)){var f=Wb(e),g=L(f),k=Rd(g);a:for(var m=0;;)if(m<g){var p=eb.b(f,m),t=N(p,0,null),p=N(p,1,null),v=N(p,0,null);N(p,1,null);k.add(new T(null,2,5,V,[t,v],null));m+=1}else{f=!0;break a}return f?Td(k.za(),c(Xb(e))):Td(k.za(),null)}f=E(e);k=N(f,0,null);f=N(f,1,null);g=N(f,0,null);N(f,1,null);return Rc(new T(null,2,5,V,[k,g],null),c(vc(e)))}return null}},null,null)}(a)}()),
Ge(W,function(){return function c(a){return new Nd(null,function(){for(;;){var e=r(a);if(e){if(ld(e)){var f=Wb(e),g=L(f),k=Rd(g);a:for(var m=0;;)if(m<g){var p=eb.b(f,m),t=N(p,0,null),p=N(p,1,null);N(p,0,null);p=N(p,1,null);k.add(new T(null,2,5,V,[t,p],null));m+=1}else{f=!0;break a}return f?Td(k.za(),c(Xb(e))):Td(k.za(),null)}f=E(e);k=N(f,0,null);f=N(f,1,null);N(f,0,null);f=N(f,1,null);return Rc(new T(null,2,5,V,[k,f],null),c(vc(e)))}return null}},null,null)}(a)}())],null)}
function Wm(a,b){return Ge(W,function(){return function d(a){return new Nd(null,function(){for(;;){var f=r(a);if(f){if(ld(f)){var g=Wb(f),k=L(g),m=Rd(k);a:for(var p=0;;)if(p<k){var t=eb.b(g,p),v=N(t,0,null),t=N(t,1,null);m.add(new T(null,2,5,V,[v,new T(null,2,5,V,[t,b],null)],null));p+=1}else{g=!0;break a}return g?Td(m.za(),d(Xb(f))):Td(m.za(),null)}g=E(f);m=N(g,0,null);g=N(g,1,null);return Rc(new T(null,2,5,V,[m,new T(null,2,5,V,[g,b],null)],null),d(vc(f)))}return null}},null,null)}(a)}())}
var Xm=function Xm(b){if(null!=b&&null!=b.Ac)return b.Ac(b);var c=Xm[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Xm._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Ra("IPrettyFlush.-ppflush",b);};function Ym(a,b){var c;c=H.a?H.a(a):H.call(null,a);c=H.a?H.a(c):H.call(null,c);return b.a?b.a(c):b.call(null,c)}function Zm(a,b,c){te.G(H.a?H.a(a):H.call(null,a),bd,b,c)}function $m(a,b){B.b(b,"\n")?(Zm(a,ki,0),Zm(a,Zj,Ym(a,Zj)+1)):Zm(a,ki,Ym(a,ki)+1);return z(Ym(a,il),b)}
function an(a,b){var c=function(){var c=new q(null,4,[ik,b,ki,0,Zj,0,il,a],null);return pe?pe(c):oe.call(null,c)}();"undefined"===typeof Jm&&(Jm=function(a,b,c,g){this.da=a;this.rc=b;this.Db=c;this.ld=g;this.w=1074167808;this.K=0},Jm.prototype.R=function(){return function(a,b){return new Jm(this.da,this.rc,this.Db,b)}}(c),Jm.prototype.O=function(){return function(){return this.ld}}(c),Jm.prototype.Sb=function(){return function(){return this.Db}}(c),Jm.prototype.fb=function(){return function(){return Mb(this.da)}}(c),
Jm.prototype.tb=function(a){return function(b,c){var g=Qa(c);if(u(B.b?B.b(String,g):B.call(null,String,g))){var k=c.lastIndexOf("\n");0>k?Zm(this,ki,Ym(this,ki)+L(c)):(Zm(this,ki,L(c)-k-1),Zm(this,Zj,Ym(this,Zj)+L(Fe(function(){return function(a){return B.b(a,"\n")}}(c,k,B,g,this,a),c))));return z(Ym(this,il),c)}if(u(B.b?B.b(Number,g):B.call(null,Number,g)))return $m(this,c);throw Error([y("No matching clause: "),y(g)].join(""));}}(c),Jm.Ob=function(){return function(){return new T(null,4,5,V,[tl,
Mh,Hj,el],null)}}(c),Jm.ub=!0,Jm.gb="cljs.pprint/t_cljs$pprint14143",Jm.Bb=function(){return function(a,b){return z(b,"cljs.pprint/t_cljs$pprint14143")}}(c));return new Jm(a,b,c,W)}function bn(a,b,c,d,e,f,g,k,m,p,t,v,w){this.parent=a;this.Qa=b;this.Ra=c;this.Ma=d;this.La=e;this.Na=f;this.prefix=g;this.Pa=k;this.Sa=m;this.Oa=p;this.D=t;this.o=v;this.A=w;this.w=2229667594;this.K=8192}h=bn.prototype;h.Z=function(a,b){return mb.c(this,b,null)};
h.W=function(a,b,c){switch(b instanceof O?b.ca:null){case "suffix":return this.Sa;case "indent":return this.Ma;case "parent":return this.parent;case "section":return this.Qa;case "done-nl":return this.La;case "start-col":return this.Ra;case "prefix":return this.prefix;case "per-line-prefix":return this.Pa;case "logical-block-callback":return this.Oa;case "intra-block-nl":return this.Na;default:return qc.c(this.o,b,c)}};
h.V=function(a,b,c){return sg(b,function(){return function(a){return sg(b,Ag,""," ","",c,a)}}(this),"#cljs.pprint.logical-block{",", ","}",c,Yd.b(new T(null,10,5,V,[new T(null,2,5,V,[Sh,this.parent],null),new T(null,2,5,V,[Ei,this.Qa],null),new T(null,2,5,V,[rj,this.Ra],null),new T(null,2,5,V,[Ah,this.Ma],null),new T(null,2,5,V,[dj,this.La],null),new T(null,2,5,V,[pl,this.Na],null),new T(null,2,5,V,[xj,this.prefix],null),new T(null,2,5,V,[sk,this.Pa],null),new T(null,2,5,V,[rh,this.Sa],null),new T(null,
2,5,V,[hl,this.Oa],null)],null),this.o))};h.Aa=function(){return new nf(0,this,10,new T(null,10,5,V,[Sh,Ei,rj,Ah,dj,pl,xj,sk,rh,hl],null),dc(this.o))};h.O=function(){return this.D};h.aa=function(){return 10+L(this.o)};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Cd(this)};h.H=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?mf(this,b):c:b;return u(c)?!0:!1};
h.Wa=function(a,b){return rd(new fg(null,new q(null,10,[rh,null,Ah,null,Sh,null,Ei,null,dj,null,rj,null,xj,null,sk,null,hl,null,pl,null],null),null),b)?dd.b(Tc(Ge(W,this),this.D),b):new bn(this.parent,this.Qa,this.Ra,this.Ma,this.La,this.Na,this.prefix,this.Pa,this.Sa,this.Oa,this.D,fe(dd.b(this.o,b)),null)};
h.Ta=function(a,b,c){return u(R.b?R.b(Sh,b):R.call(null,Sh,b))?new bn(c,this.Qa,this.Ra,this.Ma,this.La,this.Na,this.prefix,this.Pa,this.Sa,this.Oa,this.D,this.o,null):u(R.b?R.b(Ei,b):R.call(null,Ei,b))?new bn(this.parent,c,this.Ra,this.Ma,this.La,this.Na,this.prefix,this.Pa,this.Sa,this.Oa,this.D,this.o,null):u(R.b?R.b(rj,b):R.call(null,rj,b))?new bn(this.parent,this.Qa,c,this.Ma,this.La,this.Na,this.prefix,this.Pa,this.Sa,this.Oa,this.D,this.o,null):u(R.b?R.b(Ah,b):R.call(null,Ah,b))?new bn(this.parent,
this.Qa,this.Ra,c,this.La,this.Na,this.prefix,this.Pa,this.Sa,this.Oa,this.D,this.o,null):u(R.b?R.b(dj,b):R.call(null,dj,b))?new bn(this.parent,this.Qa,this.Ra,this.Ma,c,this.Na,this.prefix,this.Pa,this.Sa,this.Oa,this.D,this.o,null):u(R.b?R.b(pl,b):R.call(null,pl,b))?new bn(this.parent,this.Qa,this.Ra,this.Ma,this.La,c,this.prefix,this.Pa,this.Sa,this.Oa,this.D,this.o,null):u(R.b?R.b(xj,b):R.call(null,xj,b))?new bn(this.parent,this.Qa,this.Ra,this.Ma,this.La,this.Na,c,this.Pa,this.Sa,this.Oa,this.D,
this.o,null):u(R.b?R.b(sk,b):R.call(null,sk,b))?new bn(this.parent,this.Qa,this.Ra,this.Ma,this.La,this.Na,this.prefix,c,this.Sa,this.Oa,this.D,this.o,null):u(R.b?R.b(rh,b):R.call(null,rh,b))?new bn(this.parent,this.Qa,this.Ra,this.Ma,this.La,this.Na,this.prefix,this.Pa,c,this.Oa,this.D,this.o,null):u(R.b?R.b(hl,b):R.call(null,hl,b))?new bn(this.parent,this.Qa,this.Ra,this.Ma,this.La,this.Na,this.prefix,this.Pa,this.Sa,c,this.D,this.o,null):new bn(this.parent,this.Qa,this.Ra,this.Ma,this.La,this.Na,
this.prefix,this.Pa,this.Sa,this.Oa,this.D,bd.c(this.o,b,c),null)};h.$=function(){return r(Yd.b(new T(null,10,5,V,[new T(null,2,5,V,[Sh,this.parent],null),new T(null,2,5,V,[Ei,this.Qa],null),new T(null,2,5,V,[rj,this.Ra],null),new T(null,2,5,V,[Ah,this.Ma],null),new T(null,2,5,V,[dj,this.La],null),new T(null,2,5,V,[pl,this.Na],null),new T(null,2,5,V,[xj,this.prefix],null),new T(null,2,5,V,[sk,this.Pa],null),new T(null,2,5,V,[rh,this.Sa],null),new T(null,2,5,V,[hl,this.Oa],null)],null),this.o))};
h.R=function(a,b){return new bn(this.parent,this.Qa,this.Ra,this.Ma,this.La,this.Na,this.prefix,this.Pa,this.Sa,this.Oa,b,this.o,this.A)};h.Y=function(a,b){return kd(b)?ob(this,eb.b(b,0),eb.b(b,1)):Va(cb,this,b)};function cn(a,b){for(var c=Sh.a(b);;){if(null==c)return!1;if(a===c)return!0;c=Sh.a(c)}}function dn(a){return(a=r(a))?Ni.a(Yc(a))-Nl.a(E(a)):0}function en(a,b,c,d,e,f,g,k){this.N=a;this.data=b;this.ib=c;this.M=d;this.L=e;this.D=f;this.o=g;this.A=k;this.w=2229667594;this.K=8192}h=en.prototype;
h.Z=function(a,b){return mb.c(this,b,null)};h.W=function(a,b,c){switch(b instanceof O?b.ca:null){case "type-tag":return this.N;case "data":return this.data;case "trailing-white-space":return this.ib;case "start-pos":return this.M;case "end-pos":return this.L;default:return qc.c(this.o,b,c)}};
h.V=function(a,b,c){return sg(b,function(){return function(a){return sg(b,Ag,""," ","",c,a)}}(this),"#cljs.pprint.buffer-blob{",", ","}",c,Yd.b(new T(null,5,5,V,[new T(null,2,5,V,[Cl,this.N],null),new T(null,2,5,V,[Wl,this.data],null),new T(null,2,5,V,[jk,this.ib],null),new T(null,2,5,V,[Nl,this.M],null),new T(null,2,5,V,[Ni,this.L],null)],null),this.o))};h.Aa=function(){return new nf(0,this,5,new T(null,5,5,V,[Cl,Wl,jk,Nl,Ni],null),dc(this.o))};h.O=function(){return this.D};
h.aa=function(){return 5+L(this.o)};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Cd(this)};h.H=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?mf(this,b):c:b;return u(c)?!0:!1};h.Wa=function(a,b){return rd(new fg(null,new q(null,5,[Ni,null,jk,null,Cl,null,Nl,null,Wl,null],null),null),b)?dd.b(Tc(Ge(W,this),this.D),b):new en(this.N,this.data,this.ib,this.M,this.L,this.D,fe(dd.b(this.o,b)),null)};
h.Ta=function(a,b,c){return u(R.b?R.b(Cl,b):R.call(null,Cl,b))?new en(c,this.data,this.ib,this.M,this.L,this.D,this.o,null):u(R.b?R.b(Wl,b):R.call(null,Wl,b))?new en(this.N,c,this.ib,this.M,this.L,this.D,this.o,null):u(R.b?R.b(jk,b):R.call(null,jk,b))?new en(this.N,this.data,c,this.M,this.L,this.D,this.o,null):u(R.b?R.b(Nl,b):R.call(null,Nl,b))?new en(this.N,this.data,this.ib,c,this.L,this.D,this.o,null):u(R.b?R.b(Ni,b):R.call(null,Ni,b))?new en(this.N,this.data,this.ib,this.M,c,this.D,this.o,null):
new en(this.N,this.data,this.ib,this.M,this.L,this.D,bd.c(this.o,b,c),null)};h.$=function(){return r(Yd.b(new T(null,5,5,V,[new T(null,2,5,V,[Cl,this.N],null),new T(null,2,5,V,[Wl,this.data],null),new T(null,2,5,V,[jk,this.ib],null),new T(null,2,5,V,[Nl,this.M],null),new T(null,2,5,V,[Ni,this.L],null)],null),this.o))};h.R=function(a,b){return new en(this.N,this.data,this.ib,this.M,this.L,b,this.o,this.A)};h.Y=function(a,b){return kd(b)?ob(this,eb.b(b,0),eb.b(b,1)):Va(cb,this,b)};
function fn(a,b,c,d){return new en(Vj,a,b,c,d,null,null,null)}function gn(a,b,c,d,e,f,g,k){this.N=a;this.type=b;this.P=c;this.M=d;this.L=e;this.D=f;this.o=g;this.A=k;this.w=2229667594;this.K=8192}h=gn.prototype;h.Z=function(a,b){return mb.c(this,b,null)};h.W=function(a,b,c){switch(b instanceof O?b.ca:null){case "type-tag":return this.N;case "type":return this.type;case "logical-block":return this.P;case "start-pos":return this.M;case "end-pos":return this.L;default:return qc.c(this.o,b,c)}};
h.V=function(a,b,c){return sg(b,function(){return function(a){return sg(b,Ag,""," ","",c,a)}}(this),"#cljs.pprint.nl-t{",", ","}",c,Yd.b(new T(null,5,5,V,[new T(null,2,5,V,[Cl,this.N],null),new T(null,2,5,V,[$i,this.type],null),new T(null,2,5,V,[wl,this.P],null),new T(null,2,5,V,[Nl,this.M],null),new T(null,2,5,V,[Ni,this.L],null)],null),this.o))};h.Aa=function(){return new nf(0,this,5,new T(null,5,5,V,[Cl,$i,wl,Nl,Ni],null),dc(this.o))};h.O=function(){return this.D};h.aa=function(){return 5+L(this.o)};
h.T=function(){var a=this.A;return null!=a?a:this.A=a=Cd(this)};h.H=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?mf(this,b):c:b;return u(c)?!0:!1};h.Wa=function(a,b){return rd(new fg(null,new q(null,5,[Ni,null,$i,null,wl,null,Cl,null,Nl,null],null),null),b)?dd.b(Tc(Ge(W,this),this.D),b):new gn(this.N,this.type,this.P,this.M,this.L,this.D,fe(dd.b(this.o,b)),null)};
h.Ta=function(a,b,c){return u(R.b?R.b(Cl,b):R.call(null,Cl,b))?new gn(c,this.type,this.P,this.M,this.L,this.D,this.o,null):u(R.b?R.b($i,b):R.call(null,$i,b))?new gn(this.N,c,this.P,this.M,this.L,this.D,this.o,null):u(R.b?R.b(wl,b):R.call(null,wl,b))?new gn(this.N,this.type,c,this.M,this.L,this.D,this.o,null):u(R.b?R.b(Nl,b):R.call(null,Nl,b))?new gn(this.N,this.type,this.P,c,this.L,this.D,this.o,null):u(R.b?R.b(Ni,b):R.call(null,Ni,b))?new gn(this.N,this.type,this.P,this.M,c,this.D,this.o,null):new gn(this.N,
this.type,this.P,this.M,this.L,this.D,bd.c(this.o,b,c),null)};h.$=function(){return r(Yd.b(new T(null,5,5,V,[new T(null,2,5,V,[Cl,this.N],null),new T(null,2,5,V,[$i,this.type],null),new T(null,2,5,V,[wl,this.P],null),new T(null,2,5,V,[Nl,this.M],null),new T(null,2,5,V,[Ni,this.L],null)],null),this.o))};h.R=function(a,b){return new gn(this.N,this.type,this.P,this.M,this.L,b,this.o,this.A)};h.Y=function(a,b){return kd(b)?ob(this,eb.b(b,0),eb.b(b,1)):Va(cb,this,b)};
function hn(a,b,c,d){return new gn(Ll,a,b,c,d,null,null,null)}function jn(a,b,c,d,e,f,g){this.N=a;this.P=b;this.M=c;this.L=d;this.D=e;this.o=f;this.A=g;this.w=2229667594;this.K=8192}h=jn.prototype;h.Z=function(a,b){return mb.c(this,b,null)};h.W=function(a,b,c){switch(b instanceof O?b.ca:null){case "type-tag":return this.N;case "logical-block":return this.P;case "start-pos":return this.M;case "end-pos":return this.L;default:return qc.c(this.o,b,c)}};
h.V=function(a,b,c){return sg(b,function(){return function(a){return sg(b,Ag,""," ","",c,a)}}(this),"#cljs.pprint.start-block-t{",", ","}",c,Yd.b(new T(null,4,5,V,[new T(null,2,5,V,[Cl,this.N],null),new T(null,2,5,V,[wl,this.P],null),new T(null,2,5,V,[Nl,this.M],null),new T(null,2,5,V,[Ni,this.L],null)],null),this.o))};h.Aa=function(){return new nf(0,this,4,new T(null,4,5,V,[Cl,wl,Nl,Ni],null),dc(this.o))};h.O=function(){return this.D};h.aa=function(){return 4+L(this.o)};
h.T=function(){var a=this.A;return null!=a?a:this.A=a=Cd(this)};h.H=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?mf(this,b):c:b;return u(c)?!0:!1};h.Wa=function(a,b){return rd(new fg(null,new q(null,4,[Ni,null,wl,null,Cl,null,Nl,null],null),null),b)?dd.b(Tc(Ge(W,this),this.D),b):new jn(this.N,this.P,this.M,this.L,this.D,fe(dd.b(this.o,b)),null)};
h.Ta=function(a,b,c){return u(R.b?R.b(Cl,b):R.call(null,Cl,b))?new jn(c,this.P,this.M,this.L,this.D,this.o,null):u(R.b?R.b(wl,b):R.call(null,wl,b))?new jn(this.N,c,this.M,this.L,this.D,this.o,null):u(R.b?R.b(Nl,b):R.call(null,Nl,b))?new jn(this.N,this.P,c,this.L,this.D,this.o,null):u(R.b?R.b(Ni,b):R.call(null,Ni,b))?new jn(this.N,this.P,this.M,c,this.D,this.o,null):new jn(this.N,this.P,this.M,this.L,this.D,bd.c(this.o,b,c),null)};
h.$=function(){return r(Yd.b(new T(null,4,5,V,[new T(null,2,5,V,[Cl,this.N],null),new T(null,2,5,V,[wl,this.P],null),new T(null,2,5,V,[Nl,this.M],null),new T(null,2,5,V,[Ni,this.L],null)],null),this.o))};h.R=function(a,b){return new jn(this.N,this.P,this.M,this.L,b,this.o,this.A)};h.Y=function(a,b){return kd(b)?ob(this,eb.b(b,0),eb.b(b,1)):Va(cb,this,b)};function kn(a,b,c,d,e,f,g){this.N=a;this.P=b;this.M=c;this.L=d;this.D=e;this.o=f;this.A=g;this.w=2229667594;this.K=8192}h=kn.prototype;
h.Z=function(a,b){return mb.c(this,b,null)};h.W=function(a,b,c){switch(b instanceof O?b.ca:null){case "type-tag":return this.N;case "logical-block":return this.P;case "start-pos":return this.M;case "end-pos":return this.L;default:return qc.c(this.o,b,c)}};
h.V=function(a,b,c){return sg(b,function(){return function(a){return sg(b,Ag,""," ","",c,a)}}(this),"#cljs.pprint.end-block-t{",", ","}",c,Yd.b(new T(null,4,5,V,[new T(null,2,5,V,[Cl,this.N],null),new T(null,2,5,V,[wl,this.P],null),new T(null,2,5,V,[Nl,this.M],null),new T(null,2,5,V,[Ni,this.L],null)],null),this.o))};h.Aa=function(){return new nf(0,this,4,new T(null,4,5,V,[Cl,wl,Nl,Ni],null),dc(this.o))};h.O=function(){return this.D};h.aa=function(){return 4+L(this.o)};
h.T=function(){var a=this.A;return null!=a?a:this.A=a=Cd(this)};h.H=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?mf(this,b):c:b;return u(c)?!0:!1};h.Wa=function(a,b){return rd(new fg(null,new q(null,4,[Ni,null,wl,null,Cl,null,Nl,null],null),null),b)?dd.b(Tc(Ge(W,this),this.D),b):new kn(this.N,this.P,this.M,this.L,this.D,fe(dd.b(this.o,b)),null)};
h.Ta=function(a,b,c){return u(R.b?R.b(Cl,b):R.call(null,Cl,b))?new kn(c,this.P,this.M,this.L,this.D,this.o,null):u(R.b?R.b(wl,b):R.call(null,wl,b))?new kn(this.N,c,this.M,this.L,this.D,this.o,null):u(R.b?R.b(Nl,b):R.call(null,Nl,b))?new kn(this.N,this.P,c,this.L,this.D,this.o,null):u(R.b?R.b(Ni,b):R.call(null,Ni,b))?new kn(this.N,this.P,this.M,c,this.D,this.o,null):new kn(this.N,this.P,this.M,this.L,this.D,bd.c(this.o,b,c),null)};
h.$=function(){return r(Yd.b(new T(null,4,5,V,[new T(null,2,5,V,[Cl,this.N],null),new T(null,2,5,V,[wl,this.P],null),new T(null,2,5,V,[Nl,this.M],null),new T(null,2,5,V,[Ni,this.L],null)],null),this.o))};h.R=function(a,b){return new kn(this.N,this.P,this.M,this.L,b,this.o,this.A)};h.Y=function(a,b){return kd(b)?ob(this,eb.b(b,0),eb.b(b,1)):Va(cb,this,b)};
function ln(a,b,c,d,e,f,g,k,m){this.N=a;this.P=b;this.cb=c;this.offset=d;this.M=e;this.L=f;this.D=g;this.o=k;this.A=m;this.w=2229667594;this.K=8192}h=ln.prototype;h.Z=function(a,b){return mb.c(this,b,null)};h.W=function(a,b,c){switch(b instanceof O?b.ca:null){case "type-tag":return this.N;case "logical-block":return this.P;case "relative-to":return this.cb;case "offset":return this.offset;case "start-pos":return this.M;case "end-pos":return this.L;default:return qc.c(this.o,b,c)}};
h.V=function(a,b,c){return sg(b,function(){return function(a){return sg(b,Ag,""," ","",c,a)}}(this),"#cljs.pprint.indent-t{",", ","}",c,Yd.b(new T(null,6,5,V,[new T(null,2,5,V,[Cl,this.N],null),new T(null,2,5,V,[wl,this.P],null),new T(null,2,5,V,[hj,this.cb],null),new T(null,2,5,V,[gi,this.offset],null),new T(null,2,5,V,[Nl,this.M],null),new T(null,2,5,V,[Ni,this.L],null)],null),this.o))};h.Aa=function(){return new nf(0,this,6,new T(null,6,5,V,[Cl,wl,hj,gi,Nl,Ni],null),dc(this.o))};h.O=function(){return this.D};
h.aa=function(){return 6+L(this.o)};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Cd(this)};h.H=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?mf(this,b):c:b;return u(c)?!0:!1};h.Wa=function(a,b){return rd(new fg(null,new q(null,6,[gi,null,Ni,null,hj,null,wl,null,Cl,null,Nl,null],null),null),b)?dd.b(Tc(Ge(W,this),this.D),b):new ln(this.N,this.P,this.cb,this.offset,this.M,this.L,this.D,fe(dd.b(this.o,b)),null)};
h.Ta=function(a,b,c){return u(R.b?R.b(Cl,b):R.call(null,Cl,b))?new ln(c,this.P,this.cb,this.offset,this.M,this.L,this.D,this.o,null):u(R.b?R.b(wl,b):R.call(null,wl,b))?new ln(this.N,c,this.cb,this.offset,this.M,this.L,this.D,this.o,null):u(R.b?R.b(hj,b):R.call(null,hj,b))?new ln(this.N,this.P,c,this.offset,this.M,this.L,this.D,this.o,null):u(R.b?R.b(gi,b):R.call(null,gi,b))?new ln(this.N,this.P,this.cb,c,this.M,this.L,this.D,this.o,null):u(R.b?R.b(Nl,b):R.call(null,Nl,b))?new ln(this.N,this.P,this.cb,
this.offset,c,this.L,this.D,this.o,null):u(R.b?R.b(Ni,b):R.call(null,Ni,b))?new ln(this.N,this.P,this.cb,this.offset,this.M,c,this.D,this.o,null):new ln(this.N,this.P,this.cb,this.offset,this.M,this.L,this.D,bd.c(this.o,b,c),null)};
h.$=function(){return r(Yd.b(new T(null,6,5,V,[new T(null,2,5,V,[Cl,this.N],null),new T(null,2,5,V,[wl,this.P],null),new T(null,2,5,V,[hj,this.cb],null),new T(null,2,5,V,[gi,this.offset],null),new T(null,2,5,V,[Nl,this.M],null),new T(null,2,5,V,[Ni,this.L],null)],null),this.o))};h.R=function(a,b){return new ln(this.N,this.P,this.cb,this.offset,this.M,this.L,b,this.o,this.A)};h.Y=function(a,b){return kd(b)?ob(this,eb.b(b,0),eb.b(b,1)):Va(cb,this,b)};
if("undefined"===typeof mn)var mn=function(){var a=pe?pe(W):oe.call(null,W),b=pe?pe(W):oe.call(null,W),c=pe?pe(W):oe.call(null,W),d=pe?pe(W):oe.call(null,W),e=qc.c(W,ml,Qg());return new bh(rc.b("cljs.pprint","write-token"),function(){return function(a,b){return Cl.a(b)}}(a,b,c,d,e),oi,e,a,b,c,d)}();
mn.Ya(0,Ql,function(a,b){var c=hl.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}());u(c)&&(c.a?c.a(Si):c.call(null,Si));var c=wl.a(b),d=xj.a(c);u(d)&&z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),d);var d=Ym(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),ki),e=rj.a(c);se.b?se.b(e,d):se.call(null,e,d);c=Ah.a(c);return se.b?se.b(c,d):se.call(null,c,d)});
mn.Ya(0,Sl,function(a,b){var c=hl.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}());u(c)&&(c.a?c.a(gl):c.call(null,gl));c=rh.a(wl.a(b));return u(c)?z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),c):null});
mn.Ya(0,Pk,function(a,b){var c=wl.a(b),d=Ah.a(c),e=gi.a(b)+function(){var d=hj.a(b);if(u(B.b?B.b(xh,d):B.call(null,xh,d)))return d=rj.a(c),H.a?H.a(d):H.call(null,d);if(u(B.b?B.b(ok,d):B.call(null,ok,d)))return Ym(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),ki);throw Error([y("No matching clause: "),y(d)].join(""));}();return se.b?se.b(d,e):se.call(null,d,e)});
mn.Ya(0,Vj,function(a,b){return z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),Wl.a(b))});
mn.Ya(0,Ll,function(a,b){if(u(function(){var a=B.b($i.a(b),eh);return a?a:(a=!B.b($i.a(b),Ci))?(a=dj.a(wl.a(b)),H.a?H.a(a):H.call(null,a)):a}()))nn.b?nn.b(a,b):nn.call(null,a,b);else{var c=jk.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}());u(c)&&z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),c)}return te.G(H.a?H.a(a):H.call(null,a),bd,jk,null)});
function on(a,b,c){b=r(b);for(var d=null,e=0,f=0;;)if(f<e){var g=d.fa(null,f);if(!B.b(Cl.a(g),Ll)){var k=jk.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}());u(k)&&z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),k)}mn.b?mn.b(a,g):mn.call(null,a,g);te.G(H.a?H.a(a):H.call(null,a),bd,jk,jk.a(g));g=jk.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}());u(u(c)?g:c)&&(z(il.a(function(){var b=H.a?H.a(a):
H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),g),te.G(H.a?H.a(a):H.call(null,a),bd,jk,null));f+=1}else if(b=r(b))ld(b)?(d=Wb(b),b=Xb(b),g=d,e=L(d),d=g):(g=E(b),B.b(Cl.a(g),Ll)||(d=jk.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),u(d)&&z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),d)),mn.b?mn.b(a,g):mn.call(null,a,g),te.G(H.a?H.a(a):H.call(null,a),bd,jk,jk.a(g)),g=jk.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?
H.a(b):H.call(null,b)}()),u(u(c)?g:c)&&(z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),g),te.G(H.a?H.a(a):H.call(null,a),bd,jk,null)),b=F(b),d=null,e=0),f=0;else break}function pn(a,b){var c=Ym(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),ik);return null==c||Ym(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),ki)+dn(b)<c}
function qn(a,b,c){b=dj.a(b);b=H.a?H.a(b):H.call(null,b);return u(b)?b:Oa(pn(a,c))}function rn(a,b,c){var d=sn.a?sn.a(a):sn.call(null,a),e=Ym(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),ik);return u(d)?u(e)?(d=function(){var a=rj.a(b);return H.a?H.a(a):H.call(null,a)}()>=e-d)?qn(a,b,c):d:e:d}
if("undefined"===typeof tn)var tn=function(){var a=pe?pe(W):oe.call(null,W),b=pe?pe(W):oe.call(null,W),c=pe?pe(W):oe.call(null,W),d=pe?pe(W):oe.call(null,W),e=qc.c(W,ml,Qg());return new bh(rc.b("cljs.pprint","emit-nl?"),function(){return function(a){return $i.a(a)}}(a,b,c,d,e),oi,e,a,b,c,d)}();tn.Ya(0,Sk,function(a,b,c){a=wl.a(a);return qn(b,a,c)});tn.Ya(0,Zh,function(a,b,c){a=wl.a(a);return rn(b,a,c)});
tn.Ya(0,Ci,function(a,b,c,d){a=wl.a(a);var e;e=pl.a(a);e=H.a?H.a(e):H.call(null,e);return u(e)?e:(d=Oa(pn(b,d)))?d:rn(b,a,c)});tn.Ya(0,eh,function(){return!0});function un(a){var b=E(a),c=wl.a(b),b=r(kg(function(a,b){return function(a){var c=B.b(Cl.a(a),Ll);a=u(c)?cn(wl.a(a),b):c;return Oa(a)}}(b,c),F(a)));return new T(null,2,5,V,[b,r(we(L(b)+1,a))],null)}
function vn(a){var b=E(a),c=wl.a(b);return r(kg(function(a,b){return function(a){var c=wl.a(a);a=B.b(Cl.a(a),Ll);c=u(a)?(a=B.b(c,b))?a:cn(c,b):a;return Oa(c)}}(b,c),F(a)))}function wn(a){var b=pl.a(a);se.b?se.b(b,!0):se.call(null,b,!0);b=dj.a(a);se.b?se.b(b,!0):se.call(null,b,!0);for(a=Sh.a(a);;)if(u(a))b=dj.a(a),se.b?se.b(b,!0):se.call(null,b,!0),b=pl.a(a),se.b?se.b(b,!0):se.call(null,b,!0),a=Sh.a(a);else return null}
function nn(a,b){z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),"\n");te.G(H.a?H.a(a):H.call(null,a),bd,jk,null);var c=wl.a(b),d=sk.a(c);u(d)&&z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),d);d=ae(y,ze(function(){var a=Ah.a(c);return H.a?H.a(a):H.call(null,a)}()-L(d)," "));z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),d);return wn(c)}
function xn(a){var b=r(kg(function(a){return Oa(B.b(Cl.a(a),Ll))},a));return new T(null,2,5,V,[b,r(we(L(b),a))],null)}var yn=function yn(b,c){var d=xn(c),e=N(d,0,null),f=N(d,1,null);u(e)&&on(b,e,!1);if(u(f)){var d=un(f),g=N(d,0,null),k=N(d,1,null),m=E(f),d=function(){var c=vn(f);return tn.G?tn.G(m,b,g,c):tn.call(null,m,b,g,c)}();u(d)?(nn(b,m),d=F(f)):d=f;return Oa(pn(b,d))?function(){var c=yn(b,g);return B.b(c,g)?(on(b,g,!1),k):Ge($c,Yd.b(c,k))}():d}return null};
function zn(a){for(var b=Ml.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}());;)if(te.G(H.a?H.a(a):H.call(null,a),bd,Ml,Ge($c,b)),Oa(pn(a,b))){var c=yn(a,b);if(b!==c)b=c;else return null}else return null}function An(a,b){te.G(H.a?H.a(a):H.call(null,a),bd,Ml,Zc.b(Ml.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),b));return Oa(pn(a,Ml.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}())))?zn(a):null}
function Bn(a){zn(a);var b=Ml.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}());u(b)&&(on(a,b,!0),te.G(H.a?H.a(a):H.call(null,a),bd,Ml,$c))}function Cn(a){var b=jk.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}());return u(b)?(z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),b),te.G(H.a?H.a(a):H.call(null,a),bd,jk,null)):null}
function Dn(a,b){var c=Im(b);if(B.b(L(c),1))return b;var d=sk.a(E(ih.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()))),e=E(c);if(B.b(Yj,Ri.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()))){var f=Xi.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),g=f+L(e);te.G(H.a?H.a(a):H.call(null,a),bd,Xi,g);An(a,fn(e,null,f,g));Bn(a)}else Cn(a),z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):
H.call(null,b)}()),e);z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),"\n");for(var e=r(F(ig(c))),f=null,k=g=0;;)if(k<g){var m=f.fa(null,k);z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),m);z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),"\n");u(d)&&z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),d);k+=1}else if(e=r(e))f=e,ld(f)?(e=Wb(f),k=Xb(f),
f=e,g=L(e),e=k):(e=E(f),z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),e),z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),"\n"),u(d)&&z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),d),e=F(f),f=null,g=0),k=0;else break;te.G(H.a?H.a(a):H.call(null,a),bd,Yj,Yi);return Yc(c)}
function En(a,b){if(B.b(Ri.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),Yi))return Cn(a),z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),b);if(B.b(b,"\n"))return Dn(a,"\n");var c=Xi.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),d=c+1;te.G(H.a?H.a(a):H.call(null,a),bd,Xi,d);return An(a,fn(vd(b),null,c,d))}
var Fn=function Fn(b,c,d){var e=new bn(null,null,pe?pe(0):oe.call(null,0),pe?pe(0):oe.call(null,0),pe?pe(!1):oe.call(null,!1),pe?pe(!1):oe.call(null,!1),null,null,null,null,null,null,null),f=function(){var f=cd([ih,Eh,Kh,Rh,Uh,Ri,Xi,jk,il,ol,Ml],[e,d,e,!0,null,Yi,0,null,an(b,c),1,$c]);return pe?pe(f):oe.call(null,f)}();"undefined"===typeof Km&&(Km=function(b,c,d,e,f,v,w){this.ud=b;this.da=c;this.rc=d;this.rd=e;this.jd=f;this.Db=v;this.md=w;this.w=1074167808;this.K=0},Km.prototype.R=function(){return function(b,
c){return new Km(this.ud,this.da,this.rc,this.rd,this.jd,this.Db,c)}}(e,f),Km.prototype.O=function(){return function(){return this.md}}(e,f),Km.prototype.Sb=function(){return function(){return this.Db}}(e,f),Km.prototype.tb=function(){return function(b,c){var d=this,e=Qa(c);if(u(B.b?B.b(String,e):B.call(null,String,e))){var f=Dn(d,c),e=f.replace(/\s+$/,""),v=Bd(f,L(e)),w=Ri.a(function(){var b=H.a?H.a(d):H.call(null,d);return H.a?H.a(b):H.call(null,b)}());if(B.b(w,Yi))return Cn(d),z(il.a(function(){var b=
H.a?H.a(d):H.call(null,d);return H.a?H.a(b):H.call(null,b)}()),e),te.G(H.a?H.a(d):H.call(null,d),bd,jk,v);w=Xi.a(function(){var b=H.a?H.a(d):H.call(null,d);return H.a?H.a(b):H.call(null,b)}());f=w+L(f);te.G(H.a?H.a(d):H.call(null,d),bd,Xi,f);return An(d,fn(e,v,w,f))}if(u(B.b?B.b(Number,e):B.call(null,Number,e)))return En(d,c);throw Error([y("No matching clause: "),y(e)].join(""));}}(e,f),Km.prototype.fb=function(){return function(){var b=this;Xm(b);return Mb(il.a(function(){var c=H.a?H.a(b):H.call(null,
b);return H.a?H.a(c):H.call(null,c)}()))}}(e,f),Km.prototype.Ac=function(){return function(){var b=this;return B.b(Ri.a(function(){var c=H.a?H.a(b):H.call(null,b);return H.a?H.a(c):H.call(null,c)}()),Yj)?(on(b,Ml.a(function(){var c=H.a?H.a(b):H.call(null,b);return H.a?H.a(c):H.call(null,c)}()),!0),te.G(H.a?H.a(b):H.call(null,b),bd,Ml,$c)):Cn(b)}}(e,f),Km.Ob=function(){return function(){return new T(null,7,5,V,[Tc(aj,new q(null,2,[Wh,!0,ie,Id(je,Id(new T(null,3,5,V,[tl,Mh,Ji],null)))],null)),tl,Mh,
Ji,fl,Hj,Mk],null)}}(e,f),Km.ub=!0,Km.gb="cljs.pprint/t_cljs$pprint14686",Km.Bb=function(){return function(b,c){return z(c,"cljs.pprint/t_cljs$pprint14686")}}(e,f));return new Km(Fn,b,c,d,e,f,W)};
function Gn(a,b){var c=n,d=new bn(ih.a(function(){var a=H.a?H.a(c):H.call(null,c);return H.a?H.a(a):H.call(null,a)}()),null,pe?pe(0):oe.call(null,0),pe?pe(0):oe.call(null,0),pe?pe(!1):oe.call(null,!1),pe?pe(!1):oe.call(null,!1),a,null,b,null,null,null,null);te.G(H.a?H.a(c):H.call(null,c),bd,ih,d);if(B.b(Ri.a(function(){var a=H.a?H.a(c):H.call(null,c);return H.a?H.a(a):H.call(null,a)}()),Yi)){Cn(c);var e=hl.a(function(){var a=H.a?H.a(c):H.call(null,c);return H.a?H.a(a):H.call(null,a)}());u(e)&&(e.a?
e.a(Si):e.call(null,Si));u(a)&&z(il.a(function(){var a=H.a?H.a(c):H.call(null,c);return H.a?H.a(a):H.call(null,a)}()),a);var e=Ym(il.a(function(){var a=H.a?H.a(c):H.call(null,c);return H.a?H.a(a):H.call(null,a)}()),ki),f=rj.a(d);se.b?se.b(f,e):se.call(null,f,e);d=Ah.a(d);se.b?se.b(d,e):se.call(null,d,e)}else e=Xi.a(function(){var a=H.a?H.a(c):H.call(null,c);return H.a?H.a(a):H.call(null,a)}()),f=e+(u(a)?L(a):0),te.G(H.a?H.a(c):H.call(null,c),bd,Xi,f),An(c,new jn(Ql,d,e,f,null,null,null))}
function Hn(){var a=n,b=ih.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),c=rh.a(b);if(B.b(Ri.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),Yi)){Cn(a);u(c)&&z(il.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()),c);var d=hl.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}());u(d)&&(d.a?d.a(gl):d.call(null,gl))}else d=Xi.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?
H.a(b):H.call(null,b)}()),c=d+(u(c)?L(c):0),te.G(H.a?H.a(a):H.call(null,a),bd,Xi,c),An(a,new kn(Sl,b,d,c,null,null,null));te.G(H.a?H.a(a):H.call(null,a),bd,ih,Sh.a(b))}function In(a){var b=n;te.G(H.a?H.a(b):H.call(null,b),bd,Ri,Yj);var c=Xi.a(function(){var a=H.a?H.a(b):H.call(null,b);return H.a?H.a(a):H.call(null,a)}());An(b,hn(a,ih.a(function(){var a=H.a?H.a(b):H.call(null,b);return H.a?H.a(a):H.call(null,a)}()),c,c))}
function Jn(a,b){var c=n,d=ih.a(function(){var a=H.a?H.a(c):H.call(null,c);return H.a?H.a(a):H.call(null,a)}());if(B.b(Ri.a(function(){var a=H.a?H.a(c):H.call(null,c);return H.a?H.a(a):H.call(null,a)}()),Yi)){Cn(c);var e=Ah.a(d),f=b+function(){if(u(B.b?B.b(xh,a):B.call(null,xh,a))){var b=rj.a(d);return H.a?H.a(b):H.call(null,b)}if(u(B.b?B.b(ok,a):B.call(null,ok,a)))return Ym(il.a(function(){var a=H.a?H.a(c):H.call(null,c);return H.a?H.a(a):H.call(null,a)}()),ki);throw Error([y("No matching clause: "),
y(a)].join(""));}();se.b?se.b(e,f):se.call(null,e,f)}else e=Xi.a(function(){var a=H.a?H.a(c):H.call(null,c);return H.a?H.a(a):H.call(null,a)}()),An(c,new ln(Pk,d,a,b,e,e,null,null,null))}function sn(a){return Eh.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}())}var Kn=!0;if("undefined"===typeof Ln)var Ln=null;var Mn=72,Nn=40,On=null,Pn=null,Qn=null,Rn=null,Sn=10,X=0,Tn=null;
cd([Eh,ci,Oi,Ti,fj,sj,Bj,Ca,Gj,vk,dl,il],[new sc(function(){return Nn},Hi,cd([pi,ti,wi,Li,Qi,yj,Mg,Zj,Ak,ie,ul,Hl],["1.2",Lj,gk,"resources\\public\\js\\out\\cljs\\pprint.cljs",21,1,!0,632,637,wc,"The column at which to enter miser style. Depending on the dispatch table,\nmiser style add newlines in more places to try to keep lines short allowing for further\nlevels of nesting.",u(Nn)?Nn.Za:null])),new sc(function(){return Mn},Jj,cd([pi,ti,wi,Li,Qi,yj,Mg,Zj,Ak,ie,ul,Hl],["1.2",Lj,Xk,"resources\\public\\js\\out\\cljs\\pprint.cljs",
22,1,!0,625,630,wc,"Pretty printing will try to avoid anything going beyond this column.\nSet it to nil to have pprint let the line be arbitrarily long. This will ignore all\nnon-mandatory newlines.",u(Mn)?Mn.Za:null])),new sc(function(){return Pn},Rk,cd([Wh,ti,wi,Li,Qi,yj,Mg,Zj,Ak,ie,ul,Hl],[!0,Lj,vh,"resources\\public\\js\\out\\cljs\\pprint.cljs",15,1,!0,646,649,wc,"Mark circular structures (N.B. This is not yet used)",u(Pn)?Pn.Za:null])),new sc(function(){return On},Al,cd([Wh,ti,wi,Li,Qi,yj,Mg,
Zj,Ak,ie,ul,Hl],[!0,Lj,Xj,"resources\\public\\js\\out\\cljs\\pprint.cljs",14,1,!0,640,643,wc,"Maximum number of lines to print in a pretty print instance (N.B. This is not yet used)",u(On)?On.Za:null])),new sc(function(){return Qn},Zi,cd([pi,ti,wi,Li,Qi,yj,Mg,Zj,Ak,ie,ul,Hl],["1.2",Lj,Dh,"resources\\public\\js\\out\\cljs\\pprint.cljs",28,1,!0,657,661,wc,"Don't print namespaces with symbols. This is particularly useful when\npretty printing the results of macro expansions",u(Qn)?Qn.Za:null])),new sc(function(){return Rn},
xi,cd([pi,ti,wi,Li,Qi,yj,Mg,Zj,Ak,ie,ul,Hl],["1.2",Lj,Cj,"resources\\public\\js\\out\\cljs\\pprint.cljs",14,1,!0,665,670,wc,"Print a radix specifier in front of integers and rationals. If *print-base* is 2, 8,\nor 16, then the radix specifier used is #b, #o, or #x, respectively. Otherwise the\nradix specifier is in the form #XXr where XX is the decimal value of *print-base* ",u(Rn)?Rn.Za:null])),new sc(function(){return va},uh,cd([ti,wi,Li,Qi,yj,Mg,Zj,Ak,ie,ul,zl,Hl],[Ii,ii,"cljs/core.cljs",16,1,
!0,117,128,wc,"*print-level* controls how many levels deep the printer will\n  print nested objects. If it is bound to logical false, there is no\n  limit. Otherwise, it must be bound to an integer indicating the maximum\n  level to print. Each argument to print is at level 0; if an argument is a\n  collection, its items are at level 1; and so on. If an object is a\n  collection and is at a level greater than or equal to the value bound to\n  *print-level*, the printer prints '#' to represent it. The root binding\n  is nil indicating no limit.",
new T(null,1,5,V,["@type {null|number}"],null),u(va)?va.Za:null])),new sc(function(){return ra},uk,cd([ti,wi,Li,Qi,yj,Mg,Zj,Ak,ie,ul,Hl],[Ii,kl,"cljs/core.cljs",19,1,!0,81,87,wc,"When set to logical false, strings and characters will be printed with\n  non-alphanumeric characters converted to the appropriate escape sequences.\n\n  Defaults to true",u(ra)?ra.Za:null])),new sc(function(){return Ln},Ch,cd([pi,ti,wi,Li,Qi,yj,Mg,Zj,Ak,ie,ul,Hl],["1.2",Lj,Jh,"resources\\public\\js\\out\\cljs\\pprint.cljs",
25,1,!0,619,623,wc,"The pretty print dispatch function. Use with-pprint-dispatch or\nset-pprint-dispatch to modify.",u(Ln)?Ln.Za:null])),new sc(function(){return ta},Kj,cd([ti,wi,Li,Qi,yj,Mg,Zj,Ak,ie,ul,zl,Hl],[Ii,Gi,"cljs/core.cljs",17,1,!0,105,115,wc,"*print-length* controls how many items of each collection the\n  printer will print. If it is bound to logical false, there is no\n  limit. Otherwise, it must be bound to an integer indicating the maximum\n  number of items of each collection to print. If a collection contains\n  more items, the printer will print items up to the limit followed by\n  '...' to represent the remaining items. The root binding is nil\n  indicating no limit.",
new T(null,1,5,V,["@type {null|number}"],null),u(ta)?ta.Za:null])),new sc(function(){return Kn},Bh,cd([ti,wi,Li,Qi,yj,Mg,Zj,Ak,ie,ul,Hl],[Lj,Ih,"resources\\public\\js\\out\\cljs\\pprint.cljs",16,1,!0,615,617,wc,"Bind to true if you want write to use pretty printing",u(Kn)?Kn.Za:null])),new sc(function(){return Sn},di,cd([pi,ti,wi,Li,Qi,yj,Mg,Zj,Ak,ie,ul,Hl],["1.2",Lj,Vl,"resources\\public\\js\\out\\cljs\\pprint.cljs",13,1,!0,672,675,wc,"The base to use for printing integers and rationals.",u(Sn)?
Sn.Za:null]))]);function Un(a){var b=null!=a?a.w&32768||a.vc?!0:a.w?!1:Pa(xb,a):Pa(xb,a);return b?Rh.a(function(){var b=H.a?H.a(a):H.call(null,a);return H.a?H.a(b):H.call(null,b)}()):b}function Vn(a){var b;b=Tn;u(b)&&(b=ta,b=u(b)?Tn>=ta:b);Oa(Kn)?Qm.a?Qm.a(a):Qm.call(null,a):u(b)?z(n,"..."):(u(Tn)&&(Tn+=1),Ln.a?Ln.a(a):Ln.call(null,a));return b}
var Wn=function Wn(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=1<c.length?new Ha(c.slice(1),0,null):null;return Wn.v(arguments[0],c)};
Wn.v=function(a,b){var c=cg(M([new q(null,1,[Aj,!0],null),ae(qe,b)],0)),d=Sn,e=Pn,f=ta,g=va,k=On,m=Nn,p=Ln,t=Kn,v=Rn,w=ra,x=Mn,C=Qn;Sn=il.b(c,Sn);Pn=Oi.b(c,Pn);ta=vk.b(c,ta);va=Bj.b(c,va);On=Ti.b(c,On);Nn=Eh.b(c,Nn);Ln=Gj.b(c,Ln);Kn=dl.b(c,Kn);Rn=sj.b(c,Rn);ra=Ca.b(c,ra);Mn=ci.b(c,Mn);Qn=fj.b(c,Qn);try{var G=new ka,D=rd(c,Aj)?Aj.a(c):!0,J=!0===D||null==D?new ec(G):D;if(u(Kn)){var S=Oa(Un(J)),c=n;n=S?Fn(J,Mn,Nn):J;try{Vn(a),Xm(n)}finally{n=c}}else{S=n;n=J;try{Qm.a?Qm.a(a):Qm.call(null,a)}finally{n=
S}}!0===D&&(na.a?na.a(""+y(G)):na.call(null,""+y(G)));return null==D?""+y(G):null}finally{Qn=C,Mn=x,ra=w,Rn=v,Kn=t,Ln=p,Nn=m,On=k,va=g,ta=f,Pn=e,Sn=d}};Wn.I=1;Wn.J=function(a){var b=E(a);a=F(a);return Wn.v(b,a)};function Xn(a){var b=new ka,c=n;n=new ec(b);try{var d=n,e=Oa(Un(d)),f=n;n=e?Fn(d,Mn,Nn):d;try{d=Kn;Kn=!0;try{Vn(a)}finally{Kn=d}B.b(0,Ym(n,ki))||z(n,"\n");Xm(n)}finally{n=f}na.a?na.a(""+y(b)):na.call(null,""+y(b))}finally{n=c}}
function Yn(a,b){if(Oa(b.a?b.a(a):b.call(null,a)))throw Error([y("Bad argument: "),y(a),y(". It must be one of "),y(b)].join(""));}function Zn(){var a=va;return u(a)?X>=va:a}function $n(a){Yn(a,new fg(null,new q(null,4,[eh,null,Zh,null,Ci,null,Sk,null],null),null));In(a)}function ao(a,b){Yn(a,new fg(null,new q(null,2,[xh,null,ok,null],null),null));Jn(a,b)}
function bo(a,b,c){b="string"===typeof b?co.a?co.a(b):co.call(null,b):b;c=eo.a?eo.a(c):eo.call(null,c);return fo?fo(a,b,c):go.call(null,a,b,c)}var ho=null;function io(a,b){var c=[y(a),y("\n"),y(ho),y("\n"),y(ae(y,ze(b," "))),y("^"),y("\n")].join("");throw Error(c);}function jo(a,b,c,d,e,f){this.yb=a;this.Ga=b;this.xb=c;this.D=d;this.o=e;this.A=f;this.w=2229667594;this.K=8192}h=jo.prototype;h.Z=function(a,b){return mb.c(this,b,null)};
h.W=function(a,b,c){switch(b instanceof O?b.ca:null){case "seq":return this.yb;case "rest":return this.Ga;case "pos":return this.xb;default:return qc.c(this.o,b,c)}};h.V=function(a,b,c){return sg(b,function(){return function(a){return sg(b,Ag,""," ","",c,a)}}(this),"#cljs.pprint.arg-navigator{",", ","}",c,Yd.b(new T(null,3,5,V,[new T(null,2,5,V,[Tk,this.yb],null),new T(null,2,5,V,[Il,this.Ga],null),new T(null,2,5,V,[Xi,this.xb],null)],null),this.o))};
h.Aa=function(){return new nf(0,this,3,new T(null,3,5,V,[Tk,Il,Xi],null),dc(this.o))};h.O=function(){return this.D};h.aa=function(){return 3+L(this.o)};h.T=function(){var a=this.A;return null!=a?a:this.A=a=Cd(this)};h.H=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?mf(this,b):c:b;return u(c)?!0:!1};h.Wa=function(a,b){return rd(new fg(null,new q(null,3,[Xi,null,Tk,null,Il,null],null),null),b)?dd.b(Tc(Ge(W,this),this.D),b):new jo(this.yb,this.Ga,this.xb,this.D,fe(dd.b(this.o,b)),null)};
h.Ta=function(a,b,c){return u(R.b?R.b(Tk,b):R.call(null,Tk,b))?new jo(c,this.Ga,this.xb,this.D,this.o,null):u(R.b?R.b(Il,b):R.call(null,Il,b))?new jo(this.yb,c,this.xb,this.D,this.o,null):u(R.b?R.b(Xi,b):R.call(null,Xi,b))?new jo(this.yb,this.Ga,c,this.D,this.o,null):new jo(this.yb,this.Ga,this.xb,this.D,bd.c(this.o,b,c),null)};h.$=function(){return r(Yd.b(new T(null,3,5,V,[new T(null,2,5,V,[Tk,this.yb],null),new T(null,2,5,V,[Il,this.Ga],null),new T(null,2,5,V,[Xi,this.xb],null)],null),this.o))};
h.R=function(a,b){return new jo(this.yb,this.Ga,this.xb,b,this.o,this.A)};h.Y=function(a,b){return kd(b)?ob(this,eb.b(b,0),eb.b(b,1)):Va(cb,this,b)};function eo(a){a=r(a);return new jo(a,a,0,null,null,null)}function ko(a){var b=Il.a(a);if(u(b))return new T(null,2,5,V,[E(b),new jo(Tk.a(a),F(b),Xi.a(a)+1,null,null,null)],null);throw Error("Not enough arguments for format definition");}
function lo(a){var b=ko(a);a=N(b,0,null);b=N(b,1,null);a="string"===typeof a?co.a?co.a(a):co.call(null,a):a;return new T(null,2,5,V,[a,b],null)}function mo(a,b){if(b>=Xi.a(a)){var c=Xi.a(a)-b;return no.b?no.b(a,c):no.call(null,a,c)}return new jo(Tk.a(a),we(b,Tk.a(a)),b,null,null,null)}function no(a,b){var c=Xi.a(a)+b;return 0>b?mo(a,c):new jo(Tk.a(a),we(b,Il.a(a)),c,null,null,null)}
function oo(a,b,c,d,e,f,g){this.ob=a;this.mb=b;this.pb=c;this.offset=d;this.D=e;this.o=f;this.A=g;this.w=2229667594;this.K=8192}h=oo.prototype;h.Z=function(a,b){return mb.c(this,b,null)};h.W=function(a,b,c){switch(b instanceof O?b.ca:null){case "func":return this.ob;case "def":return this.mb;case "params":return this.pb;case "offset":return this.offset;default:return qc.c(this.o,b,c)}};
h.V=function(a,b,c){return sg(b,function(){return function(a){return sg(b,Ag,""," ","",c,a)}}(this),"#cljs.pprint.compiled-directive{",", ","}",c,Yd.b(new T(null,4,5,V,[new T(null,2,5,V,[ri,this.ob],null),new T(null,2,5,V,[Kk,this.mb],null),new T(null,2,5,V,[Ui,this.pb],null),new T(null,2,5,V,[gi,this.offset],null)],null),this.o))};h.Aa=function(){return new nf(0,this,4,new T(null,4,5,V,[ri,Kk,Ui,gi],null),dc(this.o))};h.O=function(){return this.D};h.aa=function(){return 4+L(this.o)};
h.T=function(){var a=this.A;return null!=a?a:this.A=a=Cd(this)};h.H=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?mf(this,b):c:b;return u(c)?!0:!1};h.Wa=function(a,b){return rd(new fg(null,new q(null,4,[gi,null,ri,null,Ui,null,Kk,null],null),null),b)?dd.b(Tc(Ge(W,this),this.D),b):new oo(this.ob,this.mb,this.pb,this.offset,this.D,fe(dd.b(this.o,b)),null)};
h.Ta=function(a,b,c){return u(R.b?R.b(ri,b):R.call(null,ri,b))?new oo(c,this.mb,this.pb,this.offset,this.D,this.o,null):u(R.b?R.b(Kk,b):R.call(null,Kk,b))?new oo(this.ob,c,this.pb,this.offset,this.D,this.o,null):u(R.b?R.b(Ui,b):R.call(null,Ui,b))?new oo(this.ob,this.mb,c,this.offset,this.D,this.o,null):u(R.b?R.b(gi,b):R.call(null,gi,b))?new oo(this.ob,this.mb,this.pb,c,this.D,this.o,null):new oo(this.ob,this.mb,this.pb,this.offset,this.D,bd.c(this.o,b,c),null)};
h.$=function(){return r(Yd.b(new T(null,4,5,V,[new T(null,2,5,V,[ri,this.ob],null),new T(null,2,5,V,[Kk,this.mb],null),new T(null,2,5,V,[Ui,this.pb],null),new T(null,2,5,V,[gi,this.offset],null)],null),this.o))};h.R=function(a,b){return new oo(this.ob,this.mb,this.pb,this.offset,b,this.o,this.A)};h.Y=function(a,b){return kd(b)?ob(this,eb.b(b,0),eb.b(b,1)):Va(cb,this,b)};
function po(a,b){var c=N(a,0,null),d=N(a,1,null),e=N(d,0,null),d=N(d,1,null),f=rd(new fg(null,new q(null,2,[zj,null,pk,null],null),null),c)?new T(null,2,5,V,[e,b],null):B.b(e,bj)?ko(b):B.b(e,Bi)?new T(null,2,5,V,[L(Il.a(b)),b],null):new T(null,2,5,V,[e,b],null),e=N(f,0,null),f=N(f,1,null);return new T(null,2,5,V,[new T(null,2,5,V,[c,new T(null,2,5,V,[e,d],null)],null),f],null)}function qo(a,b){var c=Tm(po,b,a),d=N(c,0,null),c=N(c,1,null);return new T(null,2,5,V,[Ge(W,d),c],null)}
var ro=new q(null,3,[2,"#b",8,"#o",16,"#x"],null);function so(a){return qd(a)?B.b(Sn,10)?[y(a),y(u(Rn)?".":null)].join(""):[y(u(Rn)?function(){var a=qc.b(ro,Sn);return u(a)?a:[y("#"),y(Sn),y("r")].join("")}():null),y(to.b?to.b(Sn,a):to.call(null,Sn,a))].join(""):null}
function uo(a,b,c){c=ko(c);var d=N(c,0,null);c=N(c,1,null);var e=so(d);a=u(e)?e:a.a?a.a(d):a.call(null,d);d=a.length;e=d+nk.a(b);e=e>=lk.a(b)?e:e+(xd(lk.a(b)-e-1,Dk.a(b))+1)*Dk.a(b);d=ae(y,ze(e-d,Sj.a(b)));u(pk.a(b))?Pm.v(M([[y(d),y(a)].join("")],0)):Pm.v(M([[y(a),y(d)].join("")],0));return c}function vo(a,b){return Hd(E(Um(function(b){return 0<b?new T(null,2,5,V,[yd(b,a),xd(b,a)],null):new T(null,2,5,V,[null,null],null)},b)))}
function wo(a,b){return 0===b?"0":ae(y,ue.b(function(){return function(a){return 10>a?vd(Sm("0")+a):vd(Sm("a")+(a-10))}}(b),vo(a,b)))}function to(a,b){return wo(a,b)}function xo(a,b){return Hd(E(Um(function(b){return new T(null,2,5,V,[r(Hd(ve(a,b))),r(we(a,b))],null)},Hd(b))))}
function yo(a,b,c){var d=ko(c),e=N(d,0,null),f=N(d,1,null);if(u(qd(e)?!0:"number"!==typeof e||isNaN(e)||Infinity===e||parseFloat(e)===parseInt(e,10)?!1:B.b(e,Math.floor(e)))){var g=0>e,k=g?-e:e,m=wo(a,k);a=u(zj.a(b))?function(){var a=ue.b(function(){return function(a){return ae(y,a)}}(g,k,m,d,e,f),xo(Qh.a(b),m)),c=ze(L(a),Xl.a(b));return ae(y,F(De.b(c,a)))}():m;a=g?[y("-"),y(a)].join(""):u(pk.a(b))?[y("+"),y(a)].join(""):a;a=a.length<lk.a(b)?[y(ae(y,ze(lk.a(b)-a.length,Sj.a(b)))),y(a)].join(""):a;
Pm.v(M([a],0))}else uo(Gg,new q(null,5,[lk,lk.a(b),Dk,1,nk,0,Sj,Sj.a(b),pk,!0],null),eo(new T(null,1,5,V,[e],null)));return f}
var zo=new T(null,20,5,V,"zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" "),null),Ao=new T(null,20,5,V,"zeroth first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth thirteenth fourteenth fifteenth sixteenth seventeenth eighteenth nineteenth".split(" "),null),Bo=new T(null,10,5,V,"  twenty thirty forty fifty sixty seventy eighty ninety".split(" "),null),Co=new T(null,10,5,V,"  twentieth thirtieth fortieth fiftieth sixtieth seventieth eightieth ninetieth".split(" "),
null),Do=new T(null,22,5,V," thousand million billion trillion quadrillion quintillion sextillion septillion octillion nonillion decillion undecillion duodecillion tredecillion quattuordecillion quindecillion sexdecillion septendecillion octodecillion novemdecillion vigintillion".split(" "),null);
function Eo(a){var b=xd(a,100),c=yd(a,100);return[y(0<b?[y(Lc(zo,b)),y(" hundred")].join(""):null),y(0<b&&0<c?" ":null),y(0<c?20>c?Lc(zo,c):function(){var a=xd(c,10),b=yd(c,10);return[y(0<a?Lc(Bo,a):null),y(0<a&&0<b?"-":null),y(0<b?Lc(zo,b):null)].join("")}():null)].join("")}
function Fo(a,b){for(var c=L(a),d=$c,c=c-1,e=E(a),f=F(a);;){if(null==f)return[y(ae(y,we(1,De.b(ye(", "),d)))),y(gd(e)||gd(d)?null:", "),y(e),y(!gd(e)&&0<c+b?[y(" "),y(Lc(Do,c+b))].join(""):null)].join("");d=gd(e)?d:Zc.b(d,[y(e),y(" "),y(Lc(Do,c+b))].join(""));--c;e=E(f);f=F(f)}}
function Go(a){var b=xd(a,100),c=yd(a,100);return[y(0<b?[y(Lc(zo,b)),y(" hundred")].join(""):null),y(0<b&&0<c?" ":null),y(0<c?20>c?Lc(Ao,c):function(){var a=xd(c,10),b=yd(c,10);return 0<a&&!(0<b)?Lc(Co,a):[y(0<a?Lc(Bo,a):null),y(0<a&&0<b?"-":null),y(0<b?Lc(Ao,b):null)].join("")}():0<b?"th":null)].join("")}
var Ho=new T(null,4,5,V,[new T(null,9,5,V,"I II III IIII V VI VII VIII VIIII".split(" "),null),new T(null,9,5,V,"X XX XXX XXXX L LX LXX LXXX LXXXX".split(" "),null),new T(null,9,5,V,"C CC CCC CCCC D DC DCC DCCC DCCCC".split(" "),null),new T(null,3,5,V,["M","MM","MMM"],null)],null),Io=new T(null,4,5,V,[new T(null,9,5,V,"I II III IV V VI VII VIII IX".split(" "),null),new T(null,9,5,V,"X XX XXX XL L LX LXX LXXX XC".split(" "),null),new T(null,9,5,V,"C CC CCC CD D DC DCC DCCC CM".split(" "),null),new T(null,
3,5,V,["M","MM","MMM"],null)],null);function Jo(a,b){var c=ko(b),d=N(c,0,null),c=N(c,1,null);if("number"===typeof d&&0<d&&4E3>d)for(var e=vo(10,d),d=$c,f=L(e)-1;;)if(gd(e)){Pm.v(M([ae(y,d)],0));break}else var g=E(e),d=B.b(0,g)?d:Zc.b(d,Lc(Lc(a,f),g-1)),f=f-1,e=F(e);else yo(10,new q(null,5,[lk,0,Sj," ",Xl,",",Qh,3,zj,!0],null),eo(new T(null,1,5,V,[d],null)));return c}var Ko=new q(null,5,[8,"Backspace",9,"Tab",10,"Newline",13,"Return",32,"Space"],null);
function Lo(a,b){var c=ko(b),d=N(c,0,null),c=N(c,1,null),e=Sm(d),d=e&127,e=e&128,f=qc.b(Ko,d);0<e&&Pm.v(M(["Meta-"],0));Pm.v(M([u(f)?f:32>d?[y("Control-"),y(vd(d+64))].join(""):B.b(d,127)?"Control-?":vd(d)],0));return c}
function Mo(a,b){var c=ko(b),d=N(c,0,null),c=N(c,1,null),e=qj.a(a);if(u(B.b?B.b("o",e):B.call(null,"o",e)))bo(!0,"\\o~3, '0o",M([Sm(d)],0));else if(u(B.b?B.b("u",e):B.call(null,"u",e)))bo(!0,"\\u~4, '0x",M([Sm(d)],0));else if(u(B.b?B.b(null,e):B.call(null,null,e)))z(n,u(B.b?B.b("\b",d):B.call(null,"\b",d))?"\\backspace":u(B.b?B.b("\t",d):B.call(null,"\t",d))?"\\tab":u(B.b?B.b("\n",d):B.call(null,"\n",d))?"\\newline":u(B.b?B.b("\f",d):B.call(null,"\f",d))?"\\formfeed":u(B.b?B.b("\r",d):B.call(null,
"\r",d))?"\\return":u(B.b?B.b('"',d):B.call(null,'"',d))?'\\"':u(B.b?B.b("\\",d):B.call(null,"\\",d))?"\\\\":[y("\\"),y(d)].join(""));else throw Error([y("No matching clause: "),y(e)].join(""));return c}function No(a,b){var c=ko(b),d=N(c,0,null),c=N(c,1,null);Pm.v(M([d],0));return c}function Oo(a){a=E(a);return B.b(Bl,a)||B.b(uj,a)}
function Po(a,b,c){return Xc(Tm(function(a,b){if(u(Oo(b)))return new T(null,2,5,V,[null,b],null);var f=qo(Ui.a(a),b),g=N(f,0,null),f=N(f,1,null),k=Vm(g),g=N(k,0,null),k=N(k,1,null),g=bd.c(g,cl,c);return new T(null,2,5,V,[null,ae(ri.a(a),new T(null,3,5,V,[g,f,k],null))],null)},b,a))}
function Qo(a){a=(""+y(a)).toLowerCase();var b=a.indexOf("e"),c=a.indexOf(".");a=0>b?0>c?new T(null,2,5,V,[a,""+y(L(a)-1)],null):new T(null,2,5,V,[[y(a.substring(0,c)),y(a.substring(c+1))].join(""),""+y(c-1)],null):0>c?new T(null,2,5,V,[a.substring(0,b),a.substring(b+1)],null):new T(null,2,5,V,[[y(a.substring(0,1)),y(a.substring(2,b))].join(""),a.substring(b+1)],null);b=N(a,0,null);a=N(a,1,null);a:if(c=L(b),0<c&&B.b(Lc(b,L(b)-1),"0"))for(--c;;){if(0>c){b="";break a}if(B.b(Lc(b,c),"0"))--c;else{b=
b.substring(0,c+1);break a}}a:{var c=b,d=L(c);if(0<d&&B.b(Lc(c,0),"0"))for(var e=0;;){if(B.b(e,d)||!B.b(Lc(c,e),"0")){c=c.substring(e);break a}e+=1}}b=L(b)-L(c);a=0<L(a)&&B.b(Lc(a,0),"+")?a.substring(1):a;return gd(c)?new T(null,2,5,V,["0",0],null):new T(null,2,5,V,[c,parseInt(a,10)-b],null)}
function Ro(a,b,c,d){if(u(u(c)?c:d)){var e=L(a);d=u(d)?2>d?2:d:0;u(c)?c=b+c+1:0<=b?(c=b+1,--d,c=c>d?c:d):c=d+b;var f=B.b(c,0)?new T(null,4,5,V,[[y("0"),y(a)].join(""),b+1,1,e+1],null):new T(null,4,5,V,[a,b,c,e],null);c=N(f,0,null);e=N(f,1,null);d=N(f,2,null);f=N(f,3,null);if(u(d)){if(0>d)return new T(null,3,5,V,["0",0,!1],null);if(f>d){b=Lc(c,d);a=c.substring(0,d);if(Sm(b)>=Sm("5")){a:for(b=L(a)-1,c=b|0;;){if(0>c){b=be(y,"1",ze(b+1,"0"));break a}if(B.b("9",a.charAt(c)))--c;else{b=ce(y,a.substring(0,
c),vd(Sm(a.charAt(c))+1),ze(b-c,"0"));break a}}a=L(b)>L(a);c=V;a&&(d=L(b)-1,b=b.substring(0,d));return new T(null,3,5,c,[b,e,a],null)}return new T(null,3,5,V,[a,e,!1],null)}}}return new T(null,3,5,V,[a,b,!1],null)}
function So(a,b,c){var d=0>b?new T(null,2,5,V,[[y(ae(y,ze(-b-1,"0"))),y(a)].join(""),-1],null):new T(null,2,5,V,[a,b],null);a=N(d,0,null);var e=N(d,1,null),d=L(a);c=u(c)?e+c+1:e+1;c=d<c?[y(a),y(ae(y,ze(c-d,"0")))].join(""):a;0>b?b=[y("."),y(c)].join(""):(b+=1,b=[y(c.substring(0,b)),y("."),y(c.substring(b))].join(""));return b}function To(a,b){return 0>b?[y("."),y(a)].join(""):[y(a.substring(0,b)),y("."),y(a.substring(b))].join("")}
function Uo(a,b){var c=zi.a(a),d=Hk.a(a),e=ko(b),f=N(e,0,null),e=N(e,1,null),g=0>f?new T(null,2,5,V,["-",-f],null):new T(null,2,5,V,["+",f],null),k=N(g,0,null),g=N(g,1,null),g=Qo(g),m=N(g,0,null),p=N(g,1,null)+wj.a(a),g=function(){var b=pk.a(a);return u(b)?b:0>f}(),t=Oa(d)&&L(m)-1<=p,v=Ro(m,p,d,u(c)?c-(u(g)?1:0):null),m=N(v,0,null),p=N(v,1,null),v=N(v,2,null),m=So(m,u(v)?p+1:p,d),d=u(u(c)?u(d)?1<=d&&B.b(m.charAt(0),"0")&&B.b(m.charAt(1),".")&&L(m)>c-(u(g)?1:0):d:c)?m.substring(1):m,p=B.b(E(d),".");
if(u(c)){var m=L(d),m=u(g)?m+1:m,p=p&&!(m>=c),t=t&&!(m>=c),w=p||t?m+1:m;u(function(){var b=w>c;return b?zk.a(a):b}())?Pm.v(M([ae(y,ze(c,zk.a(a)))],0)):Pm.v(M([[y(ae(y,ze(c-w,Sj.a(a)))),y(u(g)?k:null),y(p?"0":null),y(d),y(t?"0":null)].join("")],0))}else Pm.v(M([[y(u(g)?k:null),y(p?"0":null),y(d),y(t?"0":null)].join("")],0));return e}
function Vo(a,b){var c=ko(b),d=N(c,0,null),c=N(c,1,null),e=Qo(0>d?-d:d);N(e,0,null);for(N(e,1,null);;){var f=N(e,0,null),g=N(e,1,null),k=zi.a(a),m=Hk.a(a),p=oj.a(a),t=wj.a(a),v=function(){var b=Rl.a(a);return u(b)?b:"E"}(),e=function(){var b=pk.a(a);return u(b)?b:0>d}(),w=0>=t,x=g-(t-1),C=""+y(Math.abs(x)),v=[y(v),y(0>x?"-":"+"),y(u(p)?ae(y,ze(p-L(C),"0")):null),y(C)].join(""),G=L(v),x=L(f),f=[y(ae(y,ze(-t,"0"))),y(f),y(u(m)?ae(y,ze(m-(x-1)-(0>t?-t:0),"0")):null)].join(""),x=u(k)?k-G:null,f=Ro(f,
0,B.b(t,0)?m-1:0<t?m:0>t?m-1:null,u(x)?x-(u(e)?1:0):null),x=N(f,0,null);N(f,1,null);C=N(f,2,null);f=To(x,t);m=B.b(t,L(x))&&null==m;if(Oa(C)){if(u(k)){var g=L(f)+G,g=u(e)?g+1:g,D=(w=w&&!B.b(g,k))?g+1:g,g=m&&D<k;u(function(){var b;b=D>k;b||(b=p,b=u(b)?G-2>p:b);return u(b)?zk.a(a):b}())?Pm.v(M([ae(y,ze(k,zk.a(a)))],0)):Pm.v(M([[y(ae(y,ze(k-D-(g?1:0),Sj.a(a)))),y(u(e)?0>d?"-":"+":null),y(w?"0":null),y(f),y(g?"0":null),y(v)].join("")],0))}else Pm.v(M([[y(u(e)?0>d?"-":"+":null),y(w?"0":null),y(f),y(m?"0":
null),y(v)].join("")],0));break}else e=new T(null,2,5,V,[x,g+1],null)}return c}function Wo(a,b){var c=ko(b),d=N(c,0,null);N(c,1,null);var c=Qo(0>d?-d:d),e=N(c,0,null),c=N(c,1,null),f=zi.a(a),g=Hk.a(a),k=oj.a(a),c=B.b(d,0)?0:c+1,d=u(k)?k+2:4,f=u(f)?f-d:null;u(g)?e=g:(e=L(e),g=7>c?c:7,e=e>g?e:g);c=e-c;return 0<=c&&c<=e?(c=Uo(new q(null,6,[zi,f,Hk,c,wj,0,zk,zk.a(a),Sj,Sj.a(a),pk,pk.a(a)],null),b),Pm.v(M([ae(y,ze(d," "))],0)),c):Vo(a,b)}
function Xo(a,b){var c=ko(b),d=N(c,0,null),c=N(c,1,null),e=Qo(Math.abs(d)),f=N(e,0,null),g=N(e,1,null),k=Hk.a(a),m=yi.a(a),e=zi.a(a),p=function(){var b=pk.a(a);return u(b)?b:0>d}(),t=Ro(f,g,k,null),f=N(t,0,null),g=N(t,1,null),t=N(t,2,null),k=So(f,u(t)?g+1:g,k),m=[y(ae(y,ze(m-k.indexOf("."),"0"))),y(k)].join(""),k=L(m)+(u(p)?1:0);Pm.v(M([[y(u(function(){var b=zj.a(a);return u(b)?p:b}())?0>d?"-":"+":null),y(ae(y,ze(e-k,Sj.a(a)))),y(u(function(){var b=Oa(zj.a(a));return b?p:b}())?0>d?"-":"+":null),y(m)].join("")],
0));return c}function Yo(a,b){var c=th.a(a),d=u(c)?new T(null,2,5,V,[c,b],null):ko(b),c=N(d,0,null),d=N(d,1,null),e=Ok.a(a),c=0>c||c>=L(e)?E(Yh.a(a)):Lc(e,c);return u(c)?Po(c,d,cl.a(a)):d}function Zo(a,b){var c=ko(b),d=N(c,0,null),c=N(c,1,null),e=Ok.a(a),d=u(d)?Xc(e):E(e);return u(d)?Po(d,c,cl.a(a)):c}function $o(a,b){var c=ko(b),d=N(c,0,null),c=N(c,1,null),e=Ok.a(a),e=u(d)?E(e):null;return u(d)?u(e)?Po(e,b,cl.a(a)):b:c}
function ap(a,b){for(var c=Wi.a(a),d=E(Ok.a(a)),e=gd(d)?lo(b):new T(null,2,5,V,[d,b],null),d=N(e,0,null),e=N(e,1,null),e=ko(e),f=N(e,0,null),e=N(e,1,null),g=0,f=eo(f),k=-1;;){if(Oa(c)&&B.b(Xi.a(f),k)&&1<g)throw Error("%{ construct not consuming any arguments: Infinite loop!");k=gd(Il.a(f))&&(Oa(zj.a(dk.a(a)))||0<g);if(u(k?k:u(c)?g>=c:c))return e;k=Po(d,f,cl.a(a));if(B.b(Bl,E(k)))return e;var g=g+1,m=Xi.a(f),f=k,k=m}}
function bp(a,b){for(var c=Wi.a(a),d=E(Ok.a(a)),e=gd(d)?lo(b):new T(null,2,5,V,[d,b],null),d=N(e,0,null),e=N(e,1,null),e=ko(e),f=N(e,0,null),e=N(e,1,null),g=0;;){var k=gd(f)&&(Oa(zj.a(dk.a(a)))||0<g);if(u(k?k:u(c)?g>=c:c))return e;k=Po(d,eo(E(f)),eo(F(f)));if(B.b(uj,E(k)))return e;g+=1;f=F(f)}}
function cp(a,b){for(var c=Wi.a(a),d=E(Ok.a(a)),e=gd(d)?lo(b):new T(null,2,5,V,[d,b],null),d=N(e,0,null),f=0,e=N(e,1,null),g=-1;;){if(Oa(c)&&B.b(Xi.a(e),g)&&1<f)throw Error("%@{ construct not consuming any arguments: Infinite loop!");g=gd(Il.a(e))&&(Oa(zj.a(dk.a(a)))||0<f);if(u(g?g:u(c)?f>=c:c))return e;g=Po(d,e,cl.a(a));if(B.b(Bl,E(g)))return Xc(g);var f=f+1,k=Xi.a(e),e=g,g=k}}
function dp(a,b){for(var c=Wi.a(a),d=E(Ok.a(a)),e=gd(d)?lo(b):new T(null,2,5,V,[d,b],null),d=N(e,0,null),f=0,e=N(e,1,null);;){var g=gd(Il.a(e))&&(Oa(zj.a(dk.a(a)))||0<f);if(u(g?g:u(c)?f>=c:c))return e;g=Il.a(e);g=u(g)?new T(null,2,5,V,[E(g),new jo(Tk.a(e),F(g),Xi.a(e)+1,null,null,null)],null):new T(null,2,5,V,[null,e],null);e=N(g,0,null);g=N(g,1,null);e=Po(d,eo(e),g);if(B.b(uj,E(e)))return g;e=g;f+=1}}
function ep(a,b,c){return u(zj.a(dk.a(a)))?fp.c?fp.c(a,b,c):fp.call(null,a,b):gp.c?gp.c(a,b,c):gp.call(null,a,b)}function hp(a,b,c){for(var d=$c;;){if(gd(a))return new T(null,2,5,V,[d,b],null);var e=E(a),f;a:{var g=new ka,k=n;n=new ec(g);try{f=new T(null,2,5,V,[Po(e,b,c),""+y(g)],null);break a}finally{n=k}f=void 0}b=N(f,0,null);e=N(f,1,null);if(B.b(Bl,E(b)))return new T(null,2,5,V,[d,Xc(b)],null);a=F(a);d=Zc.b(d,e)}}
function gp(a,b){var c=function(){var c=Yh.a(a);return u(c)?hp(c,b,cl.a(a)):null}(),d=N(c,0,null),e=N(d,0,null),c=N(c,1,null),f=u(c)?c:b,c=function(){var b=wh.a(a);return u(b)?qo(b,f):null}(),g=N(c,0,null),c=N(c,1,null),c=u(c)?c:f,k=function(){var a=E(Gl.a(g));return u(a)?a:0}(),m=function(){var a=E(Pl.a(g));return u(a)?a:Ym(n,ik)}(),d=Ok.a(a),c=hp(d,c,cl.a(a)),p=N(c,0,null),c=N(c,1,null),t=function(){var b=L(p)-1+(u(zj.a(a))?1:0)+(u(pk.a(a))?1:0);return 1>b?1:b}(),d=sd(ud,ue.b(L,p)),v=lk.a(a),w=
nk.a(a),x=Dk.a(a),C=d+t*w,G=C<=v?v:v+x*(1+xd(C-v-1,x)),D=G-d,d=function(){var a=xd(D,t);return w>a?w:a}(),v=D-d*t,d=ae(y,ze(d,Sj.a(a)));u(function(){return u(e)?Ym(il.a(function(){var a=H.a?H.a(n):H.call(null,n);return H.a?H.a(a):H.call(null,a)}()),ki)+k+G>m:e}())&&Pm.v(M([e],0));for(var x=v,J=p,S=function(){var b=zj.a(a);return u(b)?b:B.b(L(J),1)&&Oa(pk.a(a))}();;)if(r(J))Pm.v(M([[y(Oa(S)?E(J):null),y(u(function(){var b=S;return u(b)?b:(b=F(J))?b:pk.a(a)}())?d:null),y(0<x?Sj.a(a):null)].join("")],
0)),--x,J=v=u(S)?J:F(J),S=!1;else break;return c}
var ip=function ip(b){"undefined"===typeof Lm&&(Lm=function(b,d,e){this.gd=b;this.da=d;this.nd=e;this.w=1074135040;this.K=0},Lm.prototype.R=function(b,d){return new Lm(this.gd,this.da,d)},Lm.prototype.O=function(){return this.nd},Lm.prototype.fb=function(){return Mb(this.da)},Lm.prototype.tb=function(b,d){var e=Qa(d);if(u(B.b?B.b(String,e):B.call(null,String,e)))return z(this.da,d.toLowerCase());if(u(B.b?B.b(Number,e):B.call(null,Number,e)))return z(this.da,vd(d).toLowerCase());throw Error([y("No matching clause: "),
y(e)].join(""));},Lm.Ob=function(){return new T(null,3,5,V,[Tc(Yl,new q(null,3,[Wh,!0,ie,Id(je,Id(new T(null,1,5,V,[tl],null))),ul,"Returns a proxy that wraps writer, converting all characters to lower case"],null)),tl,Xh],null)},Lm.ub=!0,Lm.gb="cljs.pprint/t_cljs$pprint15092",Lm.Bb=function(b,d){return z(d,"cljs.pprint/t_cljs$pprint15092")});return new Lm(ip,b,W)},jp=function jp(b){"undefined"===typeof Mm&&(Mm=function(b,d,e){this.xd=b;this.da=d;this.od=e;this.w=1074135040;this.K=0},Mm.prototype.R=
function(b,d){return new Mm(this.xd,this.da,d)},Mm.prototype.O=function(){return this.od},Mm.prototype.fb=function(){return Mb(this.da)},Mm.prototype.tb=function(b,d){var e=Qa(d);if(u(B.b?B.b(String,e):B.call(null,String,e)))return z(this.da,d.toUpperCase());if(u(B.b?B.b(Number,e):B.call(null,Number,e)))return z(this.da,vd(d).toUpperCase());throw Error([y("No matching clause: "),y(e)].join(""));},Mm.Ob=function(){return new T(null,3,5,V,[Tc(Oh,new q(null,3,[Wh,!0,ie,Id(je,Id(new T(null,1,5,V,[tl],
null))),ul,"Returns a proxy that wraps writer, converting all characters to upper case"],null)),tl,qh],null)},Mm.ub=!0,Mm.gb="cljs.pprint/t_cljs$pprint15104",Mm.Bb=function(b,d){return z(d,"cljs.pprint/t_cljs$pprint15104")});return new Mm(jp,b,W)};
function kp(a,b){var c=E(a),d=u(u(b)?u(c)?ga(c):c:b)?[y(c.toUpperCase()),y(a.substring(1))].join(""):a;return ae(y,E(Um(function(){return function(a){if(gd(a))return new T(null,2,5,V,[null,null],null);var b=RegExp("\\W\\w","g").exec(a),b=u(b)?b.index+1:b;return u(b)?new T(null,2,5,V,[[y(a.substring(0,b)),y(Lc(a,b).toUpperCase())].join(""),a.substring(b+1)],null):new T(null,2,5,V,[a,null],null)}}(c,d),d)))}
var lp=function lp(b){var c=pe?pe(!0):oe.call(null,!0);"undefined"===typeof Nm&&(Nm=function(b,c,f,g){this.Sc=b;this.da=c;this.Gb=f;this.pd=g;this.w=1074135040;this.K=0},Nm.prototype.R=function(){return function(b,c){return new Nm(this.Sc,this.da,this.Gb,c)}}(c),Nm.prototype.O=function(){return function(){return this.pd}}(c),Nm.prototype.fb=function(){return function(){return Mb(this.da)}}(c),Nm.prototype.tb=function(){return function(b,c){var f=Qa(c);if(u(B.b?B.b(String,f):B.call(null,String,f))){z(this.da,
kp(c.toLowerCase(),H.a?H.a(this.Gb):H.call(null,this.Gb)));if(0<c.length){var f=this.Gb,g;g=Lc(c,L(c)-1);g=fa(g);return se.b?se.b(f,g):se.call(null,f,g)}return null}if(u(B.b?B.b(Number,f):B.call(null,Number,f)))return f=vd(c),g=u(H.a?H.a(this.Gb):H.call(null,this.Gb))?f.toUpperCase():f,z(this.da,g),g=this.Gb,f=fa(f),se.b?se.b(g,f):se.call(null,g,f);throw Error([y("No matching clause: "),y(f)].join(""));}}(c),Nm.Ob=function(){return function(){return new T(null,4,5,V,[Tc(ll,new q(null,3,[Wh,!0,ie,
Id(je,Id(new T(null,1,5,V,[tl],null))),ul,"Returns a proxy that wraps writer, capitalizing all words"],null)),tl,zh,Ol],null)}}(c),Nm.ub=!0,Nm.gb="cljs.pprint/t_cljs$pprint15122",Nm.Bb=function(){return function(b,c){return z(c,"cljs.pprint/t_cljs$pprint15122")}}(c));return new Nm(lp,b,c,W)},mp=function mp(b){var c=pe?pe(!1):oe.call(null,!1);"undefined"===typeof Om&&(Om=function(b,c,f,g){this.hd=b;this.da=c;this.kb=f;this.qd=g;this.w=1074135040;this.K=0},Om.prototype.R=function(){return function(b,
c){return new Om(this.hd,this.da,this.kb,c)}}(c),Om.prototype.O=function(){return function(){return this.qd}}(c),Om.prototype.fb=function(){return function(){return Mb(this.da)}}(c),Om.prototype.tb=function(){return function(b,c){var f=Qa(c);if(u(B.b?B.b(String,f):B.call(null,String,f))){f=c.toLowerCase();if(Oa(H.a?H.a(this.kb):H.call(null,this.kb))){var g=RegExp("\\S","g").exec(f),g=u(g)?g.index:g;return u(g)?(z(this.da,[y(f.substring(0,g)),y(Lc(f,g).toUpperCase()),y(f.substring(g+1).toLowerCase())].join("")),
se.b?se.b(this.kb,!0):se.call(null,this.kb,!0)):z(this.da,f)}return z(this.da,f.toLowerCase())}if(u(B.b?B.b(Number,f):B.call(null,Number,f)))return f=vd(c),g=Oa(H.a?H.a(this.kb):H.call(null,this.kb)),u(g?ga(f):g)?(se.b?se.b(this.kb,!0):se.call(null,this.kb,!0),z(this.da,f.toUpperCase())):z(this.da,f.toLowerCase());throw Error([y("No matching clause: "),y(f)].join(""));}}(c),Om.Ob=function(){return function(){return new T(null,4,5,V,[Tc(gh,new q(null,3,[Wh,!0,ie,Id(je,Id(new T(null,1,5,V,[tl],null))),
ul,"Returns a proxy that wraps writer, capitalizing the first word"],null)),tl,nj,$k],null)}}(c),Om.ub=!0,Om.gb="cljs.pprint/t_cljs$pprint15140",Om.Bb=function(){return function(b,c){return z(c,"cljs.pprint/t_cljs$pprint15140")}}(c));return new Om(mp,b,c,W)};function np(){(null!=n?n.w&32768||n.vc||(n.w?0:Pa(xb,n)):Pa(xb,n))?B.b(0,Ym(il.a(function(){var a=H.a?H.a(n):H.call(null,n);return H.a?H.a(a):H.call(null,a)}()),ki))||Rm():Rm()}
function op(a,b){var c=tk.a(a),d=Dk.a(a),e=Ym(il.a(function(){var a=H.a?H.a(n):H.call(null,n);return H.a?H.a(a):H.call(null,a)}()),ki),c=e<c?c-e:B.b(d,0)?0:d-yd(e-c,d);Pm.v(M([ae(y,ze(c," "))],0));return b}function pp(a,b){var c=tk.a(a),d=Dk.a(a),e=c+Ym(il.a(function(){var a=H.a?H.a(n):H.call(null,n);return H.a?H.a(a):H.call(null,a)}()),ki),e=0<d?yd(e,d):0,c=c+(B.b(0,e)?0:d-e);Pm.v(M([ae(y,ze(c," "))],0));return b}
function fp(a,b){var c=Ok.a(a),d=L(c),e=1<d?ij.a(Ui.a(E(E(c)))):u(zj.a(a))?"(":null,f=Lc(c,1<d?1:0),c=2<d?ij.a(Ui.a(E(Lc(c,2)))):u(zj.a(a))?")":null,g=ko(b),d=N(g,0,null),g=N(g,1,null);if(u(Zn()))z(n,"#");else{var k=X,m=Tn;X+=1;Tn=0;try{Gn(e,c),Po(f,eo(d),cl.a(a)),Hn()}finally{Tn=m,X=k}}return g}function qp(a,b){var c=u(zj.a(a))?ok:xh;ao(c,yi.a(a));return b}function rp(a,b){var c=u(zj.a(a))?u(pk.a(a))?eh:Ci:u(pk.a(a))?Zh:Sk;$n(c);return b}
var sp=cd("ASDBOXRPCFEG$%\x26|~\nT*?()[;]{}\x3c\x3e^W_I".split(""),[new q(null,5,[vl,"A",Ui,new q(null,4,[lk,new T(null,2,5,V,[0,Number],null),Dk,new T(null,2,5,V,[1,Number],null),nk,new T(null,2,5,V,[0,Number],null),Sj,new T(null,2,5,V,[" ",String],null)],null),sl,new fg(null,new q(null,3,[zj,null,pk,null,Gk,null],null),null),al,W,vi,function(){return function(a,b){return uo(Gg,a,b)}}],null),new q(null,5,[vl,"S",Ui,new q(null,4,[lk,new T(null,2,5,V,[0,Number],null),Dk,new T(null,2,5,V,[1,Number],
null),nk,new T(null,2,5,V,[0,Number],null),Sj,new T(null,2,5,V,[" ",String],null)],null),sl,new fg(null,new q(null,3,[zj,null,pk,null,Gk,null],null),null),al,W,vi,function(){return function(a,b){return uo(Fg,a,b)}}],null),new q(null,5,[vl,"D",Ui,new q(null,4,[lk,new T(null,2,5,V,[0,Number],null),Sj,new T(null,2,5,V,[" ",String],null),Xl,new T(null,2,5,V,[",",String],null),Qh,new T(null,2,5,V,[3,Number],null)],null),sl,new fg(null,new q(null,3,[zj,null,pk,null,Gk,null],null),null),al,W,vi,function(){return function(a,
b){return yo(10,a,b)}}],null),new q(null,5,[vl,"B",Ui,new q(null,4,[lk,new T(null,2,5,V,[0,Number],null),Sj,new T(null,2,5,V,[" ",String],null),Xl,new T(null,2,5,V,[",",String],null),Qh,new T(null,2,5,V,[3,Number],null)],null),sl,new fg(null,new q(null,3,[zj,null,pk,null,Gk,null],null),null),al,W,vi,function(){return function(a,b){return yo(2,a,b)}}],null),new q(null,5,[vl,"O",Ui,new q(null,4,[lk,new T(null,2,5,V,[0,Number],null),Sj,new T(null,2,5,V,[" ",String],null),Xl,new T(null,2,5,V,[",",String],
null),Qh,new T(null,2,5,V,[3,Number],null)],null),sl,new fg(null,new q(null,3,[zj,null,pk,null,Gk,null],null),null),al,W,vi,function(){return function(a,b){return yo(8,a,b)}}],null),new q(null,5,[vl,"X",Ui,new q(null,4,[lk,new T(null,2,5,V,[0,Number],null),Sj,new T(null,2,5,V,[" ",String],null),Xl,new T(null,2,5,V,[",",String],null),Qh,new T(null,2,5,V,[3,Number],null)],null),sl,new fg(null,new q(null,3,[zj,null,pk,null,Gk,null],null),null),al,W,vi,function(){return function(a,b){return yo(16,a,b)}}],
null),new q(null,5,[vl,"R",Ui,new q(null,5,[il,new T(null,2,5,V,[null,Number],null),lk,new T(null,2,5,V,[0,Number],null),Sj,new T(null,2,5,V,[" ",String],null),Xl,new T(null,2,5,V,[",",String],null),Qh,new T(null,2,5,V,[3,Number],null)],null),sl,new fg(null,new q(null,3,[zj,null,pk,null,Gk,null],null),null),al,W,vi,function(a){return u(E(il.a(a)))?function(a,c){return yo(il.a(a),a,c)}:u(function(){var b=pk.a(a);return u(b)?zj.a(a):b}())?function(a,c){return Jo(Ho,c)}:u(pk.a(a))?function(a,c){return Jo(Io,
c)}:u(zj.a(a))?function(a,c){var d=ko(c),e=N(d,0,null),d=N(d,1,null);if(B.b(0,e))Pm.v(M(["zeroth"],0));else{var f=vo(1E3,0>e?-e:e);if(L(f)<=L(Do)){var g=ue.b(Eo,xe(f)),g=Fo(g,1),f=Go(Yc(f));Pm.v(M([[y(0>e?"minus ":null),y(gd(g)||gd(f)?gd(g)?f:[y(g),y("th")].join(""):[y(g),y(", "),y(f)].join(""))].join("")],0))}else yo(10,new q(null,5,[lk,0,Sj," ",Xl,",",Qh,3,zj,!0],null),eo(new T(null,1,5,V,[e],null))),f=yd(e,100),e=11<f||19>f,f=yd(f,10),Pm.v(M([1===f&&e?"st":2===f&&e?"nd":3===f&&e?"rd":"th"],0))}return d}:
function(a,c){var d=ko(c),e=N(d,0,null),d=N(d,1,null);if(B.b(0,e))Pm.v(M(["zero"],0));else{var f=vo(1E3,0>e?-e:e);L(f)<=L(Do)?(f=ue.b(Eo,f),f=Fo(f,0),Pm.v(M([[y(0>e?"minus ":null),y(f)].join("")],0))):yo(10,new q(null,5,[lk,0,Sj," ",Xl,",",Qh,3,zj,!0],null),eo(new T(null,1,5,V,[e],null)))}return d}}],null),new q(null,5,[vl,"P",Ui,W,sl,new fg(null,new q(null,3,[zj,null,pk,null,Gk,null],null),null),al,W,vi,function(){return function(a,b){var c=u(zj.a(a))?no(b,-1):b,d=u(pk.a(a))?new T(null,2,5,V,["y",
"ies"],null):new T(null,2,5,V,["","s"],null),e=ko(c),c=N(e,0,null),e=N(e,1,null);Pm.v(M([B.b(c,1)?E(d):Xc(d)],0));return e}}],null),new q(null,5,[vl,"C",Ui,new q(null,1,[qj,new T(null,2,5,V,[null,String],null)],null),sl,new fg(null,new q(null,3,[zj,null,pk,null,Gk,null],null),null),al,W,vi,function(a){return u(zj.a(a))?Lo:u(pk.a(a))?Mo:No}],null),new q(null,5,[vl,"F",Ui,new q(null,5,[zi,new T(null,2,5,V,[null,Number],null),Hk,new T(null,2,5,V,[null,Number],null),wj,new T(null,2,5,V,[0,Number],null),
zk,new T(null,2,5,V,[null,String],null),Sj,new T(null,2,5,V,[" ",String],null)],null),sl,new fg(null,new q(null,1,[pk,null],null),null),al,W,vi,function(){return Uo}],null),new q(null,5,[vl,"E",Ui,new q(null,7,[zi,new T(null,2,5,V,[null,Number],null),Hk,new T(null,2,5,V,[null,Number],null),oj,new T(null,2,5,V,[null,Number],null),wj,new T(null,2,5,V,[1,Number],null),zk,new T(null,2,5,V,[null,String],null),Sj,new T(null,2,5,V,[" ",String],null),Rl,new T(null,2,5,V,[null,String],null)],null),sl,new fg(null,
new q(null,1,[pk,null],null),null),al,W,vi,function(){return Vo}],null),new q(null,5,[vl,"G",Ui,new q(null,7,[zi,new T(null,2,5,V,[null,Number],null),Hk,new T(null,2,5,V,[null,Number],null),oj,new T(null,2,5,V,[null,Number],null),wj,new T(null,2,5,V,[1,Number],null),zk,new T(null,2,5,V,[null,String],null),Sj,new T(null,2,5,V,[" ",String],null),Rl,new T(null,2,5,V,[null,String],null)],null),sl,new fg(null,new q(null,1,[pk,null],null),null),al,W,vi,function(){return Wo}],null),new q(null,5,[vl,"$",
Ui,new q(null,4,[Hk,new T(null,2,5,V,[2,Number],null),yi,new T(null,2,5,V,[1,Number],null),zi,new T(null,2,5,V,[0,Number],null),Sj,new T(null,2,5,V,[" ",String],null)],null),sl,new fg(null,new q(null,3,[zj,null,pk,null,Gk,null],null),null),al,W,vi,function(){return Xo}],null),new q(null,5,[vl,"%",Ui,new q(null,1,[rk,new T(null,2,5,V,[1,Number],null)],null),sl,hg,al,W,vi,function(){return function(a,b){for(var c=rk.a(a),d=0;;)if(d<c)Rm(),d+=1;else break;return b}}],null),new q(null,5,[vl,"\x26",Ui,
new q(null,1,[rk,new T(null,2,5,V,[1,Number],null)],null),sl,new fg(null,new q(null,1,[dl,null],null),null),al,W,vi,function(){return function(a,b){var c=rk.a(a);0<c&&np();for(var c=c-1,d=0;;)if(d<c)Rm(),d+=1;else break;return b}}],null),new q(null,5,[vl,"|",Ui,new q(null,1,[rk,new T(null,2,5,V,[1,Number],null)],null),sl,hg,al,W,vi,function(){return function(a,b){for(var c=rk.a(a),d=0;;)if(d<c)Pm.v(M(["\f"],0)),d+=1;else break;return b}}],null),new q(null,5,[vl,"~",Ui,new q(null,1,[yi,new T(null,
2,5,V,[1,Number],null)],null),sl,hg,al,W,vi,function(){return function(a,b){var c=yi.a(a);Pm.v(M([ae(y,ze(c,"~"))],0));return b}}],null),new q(null,5,[vl,"\n",Ui,W,sl,new fg(null,new q(null,2,[zj,null,pk,null],null),null),al,W,vi,function(){return function(a,b){u(pk.a(a))&&Rm();return b}}],null),new q(null,5,[vl,"T",Ui,new q(null,2,[tk,new T(null,2,5,V,[1,Number],null),Dk,new T(null,2,5,V,[1,Number],null)],null),sl,new fg(null,new q(null,2,[pk,null,dl,null],null),null),al,W,vi,function(a){return u(pk.a(a))?
function(a,c){return pp(a,c)}:function(a,c){return op(a,c)}}],null),new q(null,5,[vl,"*",Ui,new q(null,1,[yi,new T(null,2,5,V,[1,Number],null)],null),sl,new fg(null,new q(null,2,[zj,null,pk,null],null),null),al,W,vi,function(){return function(a,b){var c=yi.a(a);return u(pk.a(a))?mo(b,c):no(b,u(zj.a(a))?-c:c)}}],null),new q(null,5,[vl,"?",Ui,W,sl,new fg(null,new q(null,1,[pk,null],null),null),al,W,vi,function(a){return u(pk.a(a))?function(a,c){var d=lo(c),e=N(d,0,null),d=N(d,1,null);return Po(e,d,
cl.a(a))}:function(a,c){var d=lo(c),e=N(d,0,null),d=N(d,1,null),f=ko(d),d=N(f,0,null),f=N(f,1,null),d=eo(d);Po(e,d,cl.a(a));return f}}],null),new q(null,5,[vl,"(",Ui,W,sl,new fg(null,new q(null,3,[zj,null,pk,null,Gk,null],null),null),al,new q(null,3,[Ck,")",yh,null,Yh,null],null),vi,function(a){return function(a){return function(c,d){var e;a:{var f=E(Ok.a(c)),g=n;n=a.a?a.a(n):a.call(null,n);try{e=Po(f,d,cl.a(c));break a}finally{n=g}e=void 0}return e}}(u(function(){var b=pk.a(a);return u(b)?zj.a(a):
b}())?jp:u(zj.a(a))?lp:u(pk.a(a))?mp:ip)}],null),new q(null,5,[vl,")",Ui,W,sl,hg,al,W,vi,function(){return null}],null),new q(null,5,[vl,"[",Ui,new q(null,1,[th,new T(null,2,5,V,[null,Number],null)],null),sl,new fg(null,new q(null,2,[zj,null,pk,null],null),null),al,new q(null,3,[Ck,"]",yh,!0,Yh,yl],null),vi,function(a){return u(zj.a(a))?Zo:u(pk.a(a))?$o:Yo}],null),new q(null,5,[vl,";",Ui,new q(null,2,[Gl,new T(null,2,5,V,[null,Number],null),Pl,new T(null,2,5,V,[null,Number],null)],null),sl,new fg(null,
new q(null,1,[zj,null],null),null),al,new q(null,1,[rl,!0],null),vi,function(){return null}],null),new q(null,5,[vl,"]",Ui,W,sl,hg,al,W,vi,function(){return null}],null),new q(null,5,[vl,"{",Ui,new q(null,1,[Wi,new T(null,2,5,V,[null,Number],null)],null),sl,new fg(null,new q(null,3,[zj,null,pk,null,Gk,null],null),null),al,new q(null,2,[Ck,"}",yh,!1],null),vi,function(a){var b;b=pk.a(a);b=u(b)?zj.a(a):b;return u(b)?dp:u(zj.a(a))?bp:u(pk.a(a))?cp:ap}],null),new q(null,5,[vl,"}",Ui,W,sl,new fg(null,
new q(null,1,[zj,null],null),null),al,W,vi,function(){return null}],null),new q(null,5,[vl,"\x3c",Ui,new q(null,4,[lk,new T(null,2,5,V,[0,Number],null),Dk,new T(null,2,5,V,[1,Number],null),nk,new T(null,2,5,V,[0,Number],null),Sj,new T(null,2,5,V,[" ",String],null)],null),sl,new fg(null,new q(null,4,[zj,null,pk,null,Gk,null,dl,null],null),null),al,new q(null,3,[Ck,"\x3e",yh,!0,Yh,Yk],null),vi,function(){return ep}],null),new q(null,5,[vl,"\x3e",Ui,W,sl,new fg(null,new q(null,1,[zj,null],null),null),
al,W,vi,function(){return null}],null),new q(null,5,[vl,"^",Ui,new q(null,3,[Kl,new T(null,2,5,V,[null,Number],null),Ph,new T(null,2,5,V,[null,Number],null),lh,new T(null,2,5,V,[null,Number],null)],null),sl,new fg(null,new q(null,1,[zj,null],null),null),al,W,vi,function(){return function(a,b){var c=Kl.a(a),d=Ph.a(a),e=lh.a(a),f=u(zj.a(a))?uj:Bl;return u(u(c)?u(d)?e:d:c)?c<=d&&d<=e?new T(null,2,5,V,[f,b],null):b:u(u(c)?d:c)?B.b(c,d)?new T(null,2,5,V,[f,b],null):b:u(c)?B.b(c,0)?new T(null,2,5,V,[f,
b],null):b:(u(zj.a(a))?gd(Il.a(cl.a(a))):gd(Il.a(b)))?new T(null,2,5,V,[f,b],null):b}}],null),new q(null,5,[vl,"W",Ui,W,sl,new fg(null,new q(null,4,[zj,null,pk,null,Gk,null,dl,null],null),null),al,W,vi,function(a){return u(function(){var b=pk.a(a);return u(b)?b:zj.a(a)}())?function(a){return function(c,d){var e=ko(d),f=N(e,0,null),e=N(e,1,null);return u(be(Wn,f,a))?new T(null,2,5,V,[Bl,e],null):e}}(Yd.b(u(pk.a(a))?new T(null,4,5,V,[Bj,null,vk,null],null):$c,u(zj.a(a))?new T(null,2,5,V,[dl,!0],null):
$c)):function(a,c){var d=ko(c),e=N(d,0,null),d=N(d,1,null);return u(Vn(e))?new T(null,2,5,V,[Bl,d],null):d}}],null),new q(null,5,[vl,"_",Ui,W,sl,new fg(null,new q(null,3,[zj,null,pk,null,Gk,null],null),null),al,W,vi,function(){return rp}],null),new q(null,5,[vl,"I",Ui,new q(null,1,[yi,new T(null,2,5,V,[0,Number],null)],null),sl,new fg(null,new q(null,1,[zj,null],null),null),al,W,vi,function(){return qp}],null)]),tp=/^([vV]|#|('.)|([+-]?\d+)|(?=,))/,up=new fg(null,new q(null,2,[Bi,null,bj,null],null),
null);function vp(a){var b=N(a,0,null),c=N(a,1,null),d=N(a,2,null);a=new RegExp(tp.source,"g");var e=a.exec(b);return u(e)?(d=E(e),b=b.substring(a.lastIndex),a=c+a.lastIndex,B.b(",",Lc(b,0))?new T(null,2,5,V,[new T(null,2,5,V,[d,c],null),new T(null,3,5,V,[b.substring(1),a+1,!0],null)],null):new T(null,2,5,V,[new T(null,2,5,V,[d,c],null),new T(null,3,5,V,[b,a,!1],null)],null)):u(d)?io("Badly formed parameters in format directive",c):new T(null,2,5,V,[null,new T(null,2,5,V,[b,c],null)],null)}
function wp(a){var b=N(a,0,null);a=N(a,1,null);return new T(null,2,5,V,[B.b(b.length,0)?null:B.b(b.length,1)&&rd(new fg(null,new q(null,2,["V",null,"v",null],null),null),Lc(b,0))?bj:B.b(b.length,1)&&B.b("#",Lc(b,0))?Bi:B.b(b.length,2)&&B.b("'",Lc(b,0))?Lc(b,1):parseInt(b,10),a],null)}var xp=new q(null,2,[":",zj,"@",pk],null);
function yp(a,b){return Um(function(a){var b=N(a,0,null),e=N(a,1,null);a=N(a,2,null);if(gd(b))return new T(null,2,5,V,[null,new T(null,3,5,V,[b,e,a],null)],null);var f=qc.b(xp,E(b));return u(f)?rd(a,f)?io([y('Flag "'),y(E(b)),y('" appears more than once in a directive')].join(""),e):new T(null,2,5,V,[!0,new T(null,3,5,V,[b.substring(1),e+1,bd.c(a,f,new T(null,2,5,V,[!0,e],null))],null)],null):new T(null,2,5,V,[null,new T(null,3,5,V,[b,e,a],null)],null)},new T(null,3,5,V,[a,b,W],null))}
function zp(a,b){var c=sl.a(a);u(function(){var a=Oa(pk.a(c));return a?pk.a(b):a}())&&io([y('"@" is an illegal flag for format directive "'),y(vl.a(a)),y('"')].join(""),Lc(pk.a(b),1));u(function(){var a=Oa(zj.a(c));return a?zj.a(b):a}())&&io([y('":" is an illegal flag for format directive "'),y(vl.a(a)),y('"')].join(""),Lc(zj.a(b),1));u(function(){var a=Oa(Gk.a(c));return a?(a=pk.a(b),u(a)?zj.a(b):a):a}())&&io([y('Cannot combine "@" and ":" flags for format directive "'),y(vl.a(a)),y('"')].join(""),
function(){var a=Lc(zj.a(b),1),c=Lc(pk.a(b),1);return a<c?a:c}())}
function Ap(a,b,c,d){zp(a,c);L(b)>L(Ui.a(a))&&io(bo(null,'Too many parameters for directive "~C": ~D~:* ~[were~;was~:;were~] specified but only ~D~:* ~[are~;is~:;are~] allowed',M([vl.a(a),L(b),L(Ui.a(a))],0)),Xc(E(b)));ng(ue.c(function(b,c){var d=E(b);return null==d||rd(up,d)||B.b(Xc(Xc(c)),Qa(d))?null:io([y("Parameter "),y(Md(E(c))),y(' has bad type in directive "'),y(vl.a(a)),y('": '),y(Qa(d))].join(""),Xc(b))},b,Ui.a(a)));return cg(M([Ge(W,Hd(function(){return function f(a){return new Nd(null,
function(){for(;;){var b=r(a);if(b){if(ld(b)){var c=Wb(b),p=L(c),t=Rd(p);a:for(var v=0;;)if(v<p){var w=eb.b(c,v),x=N(w,0,null),w=N(w,1,null),w=N(w,0,null);t.add(new T(null,2,5,V,[x,new T(null,2,5,V,[w,d],null)],null));v+=1}else{c=!0;break a}return c?Td(t.za(),f(Xb(b))):Td(t.za(),null)}c=E(b);t=N(c,0,null);c=N(c,1,null);c=N(c,0,null);return Rc(new T(null,2,5,V,[t,new T(null,2,5,V,[c,d],null)],null),f(vc(b)))}return null}},null,null)}(Ui.a(a))}())),Va(function(a,b){return be(bd,a,b)},W,Fe(function(a){return E(Lc(a,
1))},jg(tf(Ui.a(a)),b))),c],0))}function Bp(a,b){return new oo(function(b,d){Pm.v(M([a],0));return d},null,new q(null,1,[ij,a],null),b,null,null,null)}function Cp(a,b){var c,d=al.a(Kk.a(a));c=gi.a(a);c=Dp.c?Dp.c(d,c,b):Dp.call(null,d,c,b);d=N(c,0,null);c=N(c,1,null);return new T(null,2,5,V,[new oo(ri.a(a),Kk.a(a),cg(M([Ui.a(a),Wm(d,gi.a(a))],0)),gi.a(a),null,null,null),c],null)}
function Ep(a,b,c){return Um(function(c){if(gd(c))return io("No closing bracket found.",b);var e=E(c);c=F(c);if(u(Ck.a(al.a(Kk.a(e)))))e=Cp(e,c);else if(B.b(Ck.a(a),vl.a(Kk.a(e))))e=new T(null,2,5,V,[null,new T(null,4,5,V,[Fj,Ui.a(e),null,c],null)],null);else{var f;f=rl.a(al.a(Kk.a(e)));f=u(f)?zj.a(Ui.a(e)):f;e=u(f)?new T(null,2,5,V,[null,new T(null,4,5,V,[Yh,null,Ui.a(e),c],null)],null):u(rl.a(al.a(Kk.a(e))))?new T(null,2,5,V,[null,new T(null,4,5,V,[rl,null,null,c],null)],null):new T(null,2,5,V,
[e,c],null)}return e},c)}
function Dp(a,b,c){return Xc(Um(function(c){var e=N(c,0,null),f=N(c,1,null);c=N(c,2,null);var g=Ep(a,b,c);c=N(g,0,null);var k=N(g,1,null),g=N(k,0,null),m=N(k,1,null),p=N(k,2,null),k=N(k,3,null);return B.b(g,Fj)?new T(null,2,5,V,[null,new T(null,2,5,V,[dg(Yd,M([e,yf([u(f)?Yh:Ok,new T(null,1,5,V,[c],null),dk,m])],0)),k],null)],null):B.b(g,Yh)?u(Yh.a(e))?io('Two else clauses ("~:;") inside bracket construction.',b):Oa(Yh.a(a))?io('An else clause ("~:;") is in a bracket type that doesn\'t support it.',b):
B.b(Yk,Yh.a(a))&&r(Ok.a(e))?io('The else clause ("~:;") is only allowed in the first position for this directive.',b):B.b(Yk,Yh.a(a))?new T(null,2,5,V,[!0,new T(null,3,5,V,[dg(Yd,M([e,new q(null,2,[Yh,new T(null,1,5,V,[c],null),wh,p],null)],0)),!1,k],null)],null):new T(null,2,5,V,[!0,new T(null,3,5,V,[dg(Yd,M([e,new q(null,1,[Ok,new T(null,1,5,V,[c],null)],null)],0)),!0,k],null)],null):B.b(g,rl)?u(f)?io('A plain clause (with "~;") follows an else clause ("~:;") inside bracket construction.',b):Oa(yh.a(a))?
io('A separator ("~;") is in a bracket type that doesn\'t support it.',b):new T(null,2,5,V,[!0,new T(null,3,5,V,[dg(Yd,M([e,new q(null,1,[Ok,new T(null,1,5,V,[c],null)],null)],0)),!1,k],null)],null):null},new T(null,3,5,V,[new q(null,1,[Ok,$c],null),!1,c],null)))}function Fp(a){return E(Um(function(a){var c=E(a);a=F(a);var d=al.a(Kk.a(c));return u(Ck.a(d))?Cp(c,a):new T(null,2,5,V,[c,a],null)},a))}
function co(a){var b=ho;ho=a;try{return Fp(E(Um(function(){return function(a){var b=N(a,0,null);a=N(a,1,null);if(gd(b))return new T(null,2,5,V,[null,b],null);var e=b.indexOf("~");if(0>e)b=new T(null,2,5,V,[Bp(b,a),new T(null,2,5,V,["",a+b.length],null)],null);else if(0===e){a=Um(vp,new T(null,3,5,V,[b.substring(1),a+1,!1],null));b=N(a,0,null);e=N(a,1,null);a=N(e,0,null);e=N(e,1,null);a=yp(a,e);N(a,0,null);a=N(a,1,null);var e=N(a,0,null),f=N(a,1,null),g=N(a,2,null);a=E(e);var k=qc.b(sp,a.toUpperCase()),
g=u(k)?Ap(k,ue.b(wp,b),g,f):null;Oa(a)&&io("Format string ended in the middle of a directive",f);Oa(k)&&io([y('Directive "'),y(a),y('" is undefined')].join(""),f);b=V;a=new oo(vi.a(k).call(null,g,f),k,g,f,null,null,null);e=e.substring(1);f+=1;if(B.b("\n",vl.a(k))&&Oa(zj.a(g)))a:{k=new T(null,2,5,V,[" ","\t"],null);if(null==k?0:null!=k?k.w&8||k.Ad||(k.w?0:Pa(bb,k)):Pa(bb,k))b:if(k=r(k),null==k)k=hg;else if(k instanceof Ha&&0===k.B){k=k.g;c:for(var g=0,m=Qb(hg);;)if(g<k.length)var p=g+1,m=m.Ab(null,
k[g]),g=p;else break c;k=m.Lb(null)}else for(p=Qb(hg);;)if(null!=k)g=F(k),p=p.Ab(null,k.ia(null)),k=g;else{k=Sb(p);break b}else b:if(k=[k],g=k.length,g<=wf)for(p=0,m=Qb(W);;)if(p<g)var t=p+1,m=Tb(m,k[p],null),p=t;else{k=new fg(null,Sb(m),null);break b}else for(p=0,m=Qb(hg);;)if(p<g)t=p+1,m=Rb(m,k[p]),p=t;else{k=Sb(m);break b}for(g=0;;){(p=B.b(g,L(e)))||(p=Lc(e,g),p=k.a?k.a(p):k.call(null,p),p=Oa(p));if(p){k=g;break a}g+=1}}else k=0;b=new T(null,2,5,b,[a,new T(null,2,5,V,[e.substring(k),f+k],null)],
null)}else b=new T(null,2,5,V,[Bp(b.substring(0,e),a),new T(null,2,5,V,[b.substring(e),e+a],null)],null);return b}}(b),new T(null,2,5,V,[a,0],null))))}finally{ho=b}}var Gp=function Gp(b){for(;;){if(gd(b))return!1;var c;c=dl.a(sl.a(Kk.a(E(b))));u(c)||(c=me(Gp,E(Ok.a(Ui.a(E(b))))),c=u(c)?c:me(Gp,E(Yh.a(Ui.a(E(b))))));if(u(c))return!0;b=F(b)}};
function go(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;switch(b.length){case 3:return fo(arguments[0],arguments[1],arguments[2]);case 2:return Hp(arguments[0],arguments[1]);default:throw Error([y("Invalid arity: "),y(b.length)].join(""));}}
function fo(a,b,c){var d=new ka,e=Oa(a)||!0===a?new ec(d):a,f;f=Gp(b);f=u(f)?Oa(Un(e)):f;f=u(f)?u(Un(e))?e:Fn(e,Mn,Nn):e;var g=n;n=f;try{try{Hp(b,c)}finally{e!==f&&Mb(f)}return Oa(a)?""+y(d):!0===a?na.a?na.a(""+y(d)):na.call(null,""+y(d)):null}finally{n=g}}
function Hp(a,b){Tm(function(a,b){if(u(Oo(b)))return new T(null,2,5,V,[null,b],null);var e=qo(Ui.a(a),b),f=N(e,0,null),e=N(e,1,null),g=Vm(f),f=N(g,0,null),g=N(g,1,null),f=bd.c(f,cl,e);return new T(null,2,5,V,[null,ae(ri.a(a),new T(null,3,5,V,[f,e,g],null))],null)},b,a);return null}
var Z=function(a){return function(b){return function(){function c(a){var b=null;if(0<arguments.length){for(var b=0,c=Array(arguments.length-0);b<c.length;)c[b]=arguments[b+0],++b;b=new Ha(c,0)}return d.call(this,b)}function d(c){var d=qc.c(H.a?H.a(b):H.call(null,b),c,od);d===od&&(d=ae(a,c),te.G(b,bd,c,d));return d}c.I=0;c.J=function(a){a=r(a);return d(a)};c.v=d;return c}()}(pe?pe(W):oe.call(null,W))}(co),Ip=new q(null,6,[je,"'",Zk,"#'",mk,"@",yk,"~",fi,"@",jh,"~"],null);
function Jp(a){var b;b=E(a);b=Ip.a?Ip.a(b):Ip.call(null,b);return u(u(b)?B.b(2,L(a)):b)?(z(n,b),Vn(Xc(a)),!0):null}function Kp(a){if(u(Zn()))z(n,"#");else{var b=X,c=Tn;X+=1;Tn=0;try{Gn("[","]");for(var d=0,e=r(a);;){if(Oa(ta)||d<ta){if(e&&(Vn(E(e)),F(e))){z(n," ");$n(Sk);a=d+1;var f=F(e),d=a,e=f;continue}}else z(n,"...");break}Hn()}finally{Tn=c,X=b}}return null}Z.a?Z.a("~\x3c[~;~@{~w~^, ~:_~}~;]~:\x3e"):Z.call(null,"~\x3c[~;~@{~w~^, ~:_~}~;]~:\x3e");
function Lp(a){if(u(Zn()))z(n,"#");else{var b=X,c=Tn;X+=1;Tn=0;try{Gn("{","}");for(var d=0,e=r(a);;){if(Oa(ta)||d<ta){if(e){if(u(Zn()))z(n,"#");else{a=X;var f=Tn;X+=1;Tn=0;try{Gn(null,null),Vn(E(E(e))),z(n," "),$n(Sk),Tn=0,Vn(E(F(E(e)))),Hn()}finally{Tn=f,X=a}}if(F(e)){z(n,", ");$n(Sk);a=d+1;var g=F(e),d=a,e=g;continue}}}else z(n,"...");break}Hn()}finally{Tn=c,X=b}}return null}function Mp(a){return z(n,Fg.v(M([a],0)))}
var Np=function(a,b){return function(){function a(b){var c=null;if(0<arguments.length){for(var c=0,g=Array(arguments.length-0);c<g.length;)g[c]=arguments[c+0],++c;c=new Ha(g,0)}return d.call(this,c)}function d(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return d(a)};a.v=d;return a}()}("~\x3c#{~;~@{~w~^ ~:_~}~;}~:\x3e",Z.a?Z.a("~\x3c#{~;~@{~w~^ ~:_~}~;}~:\x3e"):Z.call(null,"~\x3c#{~;~@{~w~^ ~:_~}~;}~:\x3e")),Op=new q(null,2,["core$future_call","Future","core$promise","Promise"],null);
function Pp(a){var b;b=qg(/^[^$]+\$[^$]+/,a);b=u(b)?Op.a?Op.a(b):Op.call(null,b):null;return u(b)?b:a}
var Qp=function(a,b){return function(){function a(b){var c=null;if(0<arguments.length){for(var c=0,g=Array(arguments.length-0);c<g.length;)g[c]=arguments[c+0],++c;c=new Ha(g,0)}return d.call(this,c)}function d(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return d(a)};a.v=d;return a}()}("~\x3c\x3c-(~;~@{~w~^ ~_~}~;)-\x3c~:\x3e",Z.a?Z.a("~\x3c\x3c-(~;~@{~w~^ ~_~}~;)-\x3c~:\x3e"):Z.call(null,"~\x3c\x3c-(~;~@{~w~^ ~_~}~;)-\x3c~:\x3e"));
function Rp(a){return a instanceof hf?li:(null!=a?a.w&32768||a.vc||(a.w?0:Pa(xb,a)):Pa(xb,a))?qk:a instanceof A?ui:(null==a?0:null!=a?a.w&64||a.Kb||(a.w?0:Pa(gb,a)):Pa(gb,a))?bk:jd(a)?El:kd(a)?jj:hd(a)?bl:null==a?null:oi}if("undefined"===typeof Sp){var Sp,Tp=pe?pe(W):oe.call(null,W),Up=pe?pe(W):oe.call(null,W),Vp=pe?pe(W):oe.call(null,W),Wp=pe?pe(W):oe.call(null,W),Xp=qc.c(W,ml,Qg());Sp=new bh(rc.b("cljs.pprint","simple-dispatch"),Rp,oi,Xp,Tp,Up,Vp,Wp)}
$g(Sp,bk,function(a){if(Oa(Jp(a)))if(u(Zn()))z(n,"#");else{var b=X,c=Tn;X+=1;Tn=0;try{Gn("(",")");for(var d=0,e=r(a);;){if(Oa(ta)||d<ta){if(e&&(Vn(E(e)),F(e))){z(n," ");$n(Sk);a=d+1;var f=F(e),d=a,e=f;continue}}else z(n,"...");break}Hn()}finally{Tn=c,X=b}}return null});$g(Sp,jj,Kp);$g(Sp,El,Lp);$g(Sp,bl,Np);$g(Sp,null,function(){return z(n,Fg.v(M([null],0)))});$g(Sp,oi,Mp);Ln=Sp;function Yp(a){return kd(a)?new T(null,2,5,V,["[","]"],null):new T(null,2,5,V,["(",")"],null)}
function Zp(a){if(id(a)){var b=Yp(a),c=N(b,0,null),d=N(b,1,null),e=N(a,0,null),f=Ad(a,1);if(u(Zn()))z(n,"#");else{var g=X,k=Tn;X+=1;Tn=0;try{Gn(c,d);(function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return c.call(this,d)}function c(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return c(a)};a.v=c;return a}()}("~w~:i",Z.a?Z.a("~w~:i"):Z.call(null,"~w~:i"),
g,k,b,c,d,a,e,f)})().call(null,e);for(var m=f;;)if(r(m)){(function(){var p=Z.a?Z.a(" "):Z.call(null," ");return function(a,b,c){return function(){function a(c){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return b.call(this,d)}function b(a){a=eo(a);return Hp(c,a)}a.I=0;a.J=function(a){a=r(a);return b(a)};a.v=b;return a}()}(m," ",p,g,k,b,c,d,a,e,f)})().call(null);var p=E(m);if(id(p)){var t=Yp(p),v=N(t,0,null),w=N(t,1,null);
if(u(Zn()))z(n,"#");else{var x=X,C=Tn;X+=1;Tn=0;try{Gn(v,w);if(B.b(L(p),3)&&Xc(p)instanceof O){var G=p,D=N(G,0,null),J=N(G,1,null),S=N(G,2,null);(function(){var U=Z.a?Z.a("~w ~w "):Z.call(null,"~w ~w ");return function(a,b,c){return function(){function a(c){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return b.call(this,d)}function b(a){a=eo(a);return Hp(c,a)}a.I=0;a.J=function(a){a=r(a);return b(a)};a.v=b;return a}()}(m,
"~w ~w ",U,G,D,J,S,x,C,t,v,w,p,g,k,b,c,d,a,e,f)})().call(null,D,J);id(S)?function(){var U=kd(S)?"~\x3c[~;~@{~w~^ ~:_~}~;]~:\x3e":"~\x3c(~;~@{~w~^ ~:_~}~;)~:\x3e",Ma="string"===typeof U?Z.a?Z.a(U):Z.call(null,U):U;return function(a,b,c){return function(){function a(c){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return b.call(this,d)}function b(a){a=eo(a);return Hp(c,a)}a.I=0;a.J=function(a){a=r(a);return b(a)};a.v=b;return a}()}(m,
U,Ma,G,D,J,S,x,C,t,v,w,p,g,k,b,c,d,a,e,f)}().call(null,S):Vn(S)}else ae(function(){var D=Z.a?Z.a("~w ~:i~@{~w~^ ~:_~}"):Z.call(null,"~w ~:i~@{~w~^ ~:_~}");return function(a,b,c){return function(){function a(c){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return b.call(this,d)}function b(a){a=eo(a);return Hp(c,a)}a.I=0;a.J=function(a){a=r(a);return b(a)};a.v=b;return a}()}(m,"~w ~:i~@{~w~^ ~:_~}",D,x,C,t,v,w,p,g,k,b,c,d,
a,e,f)}(),p);Hn()}finally{Tn=C,X=x}}F(m)&&function(){var x=Z.a?Z.a("~_"):Z.call(null,"~_");return function(a,b,c){return function(){function a(c){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return b.call(this,d)}function b(a){a=eo(a);return Hp(c,a)}a.I=0;a.J=function(a){a=r(a);return b(a)};a.v=b;return a}()}(m,"~_",x,t,v,w,p,g,k,b,c,d,a,e,f)}().call(null)}else Vn(p),F(m)&&function(){var t=Z.a?Z.a("~:_"):Z.call(null,"~:_");
return function(a,b,c){return function(){function a(c){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return b.call(this,d)}function b(a){a=eo(a);return Hp(c,a)}a.I=0;a.J=function(a){a=r(a);return b(a)};a.v=b;return a}()}(m,"~:_",t,p,g,k,b,c,d,a,e,f)}().call(null);m=F(m)}else break;Hn()}finally{Tn=k,X=g}}}else Vn(a)}
var $p=function(a,b){return function(){function a(b){var c=null;if(0<arguments.length){for(var c=0,g=Array(arguments.length-0);c<g.length;)g[c]=arguments[c+0],++c;c=new Ha(g,0)}return d.call(this,c)}function d(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return d(a)};a.v=d;return a}()}("~:\x3c~w~^ ~@_~w~^ ~_~@{~w~^ ~_~}~:\x3e",Z.a?Z.a("~:\x3c~w~^ ~@_~w~^ ~_~@{~w~^ ~_~}~:\x3e"):Z.call(null,"~:\x3c~w~^ ~@_~w~^ ~_~@{~w~^ ~_~}~:\x3e"));
function aq(a,b){r(a)&&(u(b)?function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return c.call(this,d)}function c(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return c(a)};a.v=c;return a}()}(" ~_",Z.a?Z.a(" ~_"):Z.call(null," ~_"))}().call(null):function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,
e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return c.call(this,d)}function c(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return c(a)};a.v=c;return a}()}(" ~@_",Z.a?Z.a(" ~@_"):Z.call(null," ~@_"))}().call(null),function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return c.call(this,d)}function c(a){a=eo(a);return Hp(b,a)}
a.I=0;a.J=function(a){a=r(a);return c(a)};a.v=c;return a}()}("~{~w~^ ~_~}",Z.a?Z.a("~{~w~^ ~_~}"):Z.call(null,"~{~w~^ ~_~}"))}().call(null,a))}
function bq(a){r(a)&&function(){return function(a,c){return function(){function a(c){var d=null;if(0<arguments.length){for(var d=0,k=Array(arguments.length-0);d<k.length;)k[d]=arguments[d+0],++d;d=new Ha(k,0)}return b.call(this,d)}function b(a){a=eo(a);return Hp(c,a)}a.I=0;a.J=function(a){a=r(a);return b(a)};a.v=b;return a}()}(" ~_~{~w~^ ~_~}",Z.a?Z.a(" ~_~{~w~^ ~_~}"):Z.call(null," ~_~{~w~^ ~_~}"))}().call(null,a)}
function cq(a){if(F(a)){var b=N(a,0,null),c=N(a,1,null),d=Ad(a,2),e="string"===typeof E(d)?new T(null,2,5,V,[E(d),F(d)],null):new T(null,2,5,V,[null,d],null),f=N(e,0,null),g=N(e,1,null),k=jd(E(g))?new T(null,2,5,V,[E(g),F(g)],null):new T(null,2,5,V,[null,g],null),m=N(k,0,null),p=N(k,1,null);if(u(Zn()))z(n,"#");else{var t=X,v=Tn;X+=1;Tn=0;try{Gn("(",")"),function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=
arguments[d+0],++d;d=new Ha(e,0)}return c.call(this,d)}function c(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return c(a)};a.v=c;return a}()}("~w ~1I~@_~w",Z.a?Z.a("~w ~1I~@_~w"):Z.call(null,"~w ~1I~@_~w"),t,v,a,b,c,d,e,f,g,k,m,p)}().call(null,b,c),u(f)&&function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return c.call(this,d)}function c(a){a=eo(a);return Hp(b,
a)}a.I=0;a.J=function(a){a=r(a);return c(a)};a.v=c;return a}()}(" ~_~w",Z.a?Z.a(" ~_~w"):Z.call(null," ~_~w"),t,v,a,b,c,d,e,f,g,k,m,p)}().call(null,f),u(m)&&function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return c.call(this,d)}function c(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return c(a)};a.v=c;return a}()}(" ~_~w",Z.a?Z.a(" ~_~w"):Z.call(null,
" ~_~w"),t,v,a,b,c,d,e,f,g,k,m,p)}().call(null,m),kd(E(p))?aq(p,u(f)?f:m):bq(p),Hn()}finally{Tn=v,X=t}}return null}return dq.a?dq.a(a):dq.call(null,a)}
function eq(a){if(u(Zn()))z(n,"#");else{var b=X,c=Tn;X+=1;Tn=0;try{Gn("[","]");for(var d=0;;){if(Oa(ta)||d<ta){if(r(a)){if(u(Zn()))z(n,"#");else{var e=X,f=Tn;X+=1;Tn=0;try{Gn(null,null),Vn(E(a)),F(a)&&(z(n," "),$n(Zh),Vn(Xc(a))),Hn()}finally{Tn=f,X=e}}if(F(vc(a))){z(n," ");$n(Sk);var e=d+1,g=F(vc(a)),d=e;a=g;continue}}}else z(n,"...");break}Hn()}finally{Tn=c,X=b}}}
function fq(a){var b=E(a);if(u(Zn()))z(n,"#");else{var c=X,d=Tn;X+=1;Tn=0;try{Gn("(",")"),F(a)&&kd(Xc(a))?(function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return c.call(this,d)}function c(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return c(a)};a.v=c;return a}()}("~w ~1I~@_",Z.a?Z.a("~w ~1I~@_"):Z.call(null,"~w ~1I~@_"),c,d,b)}().call(null,b),eq(Xc(a)),
function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return c.call(this,d)}function c(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return c(a)};a.v=c;return a}()}(" ~_~{~w~^ ~_~}",Z.a?Z.a(" ~_~{~w~^ ~_~}"):Z.call(null," ~_~{~w~^ ~_~}"),c,d,b)}().call(null,F(vc(a)))):dq.a?dq.a(a):dq.call(null,a),Hn()}finally{Tn=d,X=c}}return null}
var gq=function(a,b){return function(){function a(b){var c=null;if(0<arguments.length){for(var c=0,g=Array(arguments.length-0);c<g.length;)g[c]=arguments[c+0],++c;c=new Ha(g,0)}return d.call(this,c)}function d(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return d(a)};a.v=d;return a}()}("~:\x3c~1I~w~^ ~@_~w~@{ ~_~w~}~:\x3e",Z.a?Z.a("~:\x3c~1I~w~^ ~@_~w~@{ ~_~w~}~:\x3e"):Z.call(null,"~:\x3c~1I~w~^ ~@_~w~@{ ~_~w~}~:\x3e")),hq=W;
function dq(a){if(u(Zn()))z(n,"#");else{var b=X,c=Tn;X+=1;Tn=0;try{Gn("(",")");ao(xh,1);for(var d=0,e=r(a);;){if(Oa(ta)||d<ta){if(e&&(Vn(E(e)),F(e))){z(n," ");$n(Sk);a=d+1;var f=F(e),d=a,e=f;continue}}else z(n,"...");break}Hn()}finally{Tn=c,X=b}}return null}
var iq=function(a){return Ge(W,Ee(td,M([function(){return function c(a){return new Nd(null,function(){for(;;){var e=r(a);if(e){if(ld(e)){var f=Wb(e),g=L(f),k=Rd(g);a:for(var m=0;;)if(m<g){var p=eb.b(f,m),p=new T(null,2,5,V,[p,new T(null,2,5,V,[rc.a(Md(E(p))),Xc(p)],null)],null);k.add(p);m+=1}else{f=!0;break a}return f?Td(k.za(),c(Xb(e))):Td(k.za(),null)}k=E(e);return Rc(new T(null,2,5,V,[k,new T(null,2,5,V,[rc.a(Md(E(k))),Xc(k)],null)],null),c(vc(e)))}return null}},null,null)}(a)}()],0)))}(function(a){return Ge(W,
ue.b(function(a){return function(c){var d=N(c,0,null),e=N(c,1,null),f;f=Kd(d);f=u(f)?f:rd(new fg(null,new q(null,22,[fh,null,oh,null,sh,null,mi,null,si,null,cj,null,mj,null,pj,null,tj,null,vj,null,Pj,null,Qj,null,Tj,null,ck,null,fk,null,Nk,null,Wk,null,Zk,null,je,null,nl,null,Jl,null,Tl,null],null),null),d);return Oa(f)?new T(null,2,5,V,[rc.b(a,Md(d)),e],null):c}}("clojure.core"),a))}(cd([Wk,ck,kh,pj,Bk,Hh,Lk,lj,xk,Fh,ji,ei,ej,Tl,gj,ak,Jk,ek,qi,vj,Uj,Ek,Ki,Vi,hk,Uk,Mi,jl,Ik,Rj],[$p,function(a){var b=
Xc(a),c=E(vc(vc(a)));if(kd(b)){var d=hq;hq=B.b(1,L(b))?yf([E(b),"%"]):Ge(W,ue.c(function(){return function(a,b){return new T(null,2,5,V,[a,[y("%"),y(b)].join("")],null)}}(d,b,c),b,new mg(null,1,L(b)+1,1,null)));try{return function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return c.call(this,d)}function c(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return c(a)};
a.v=c;return a}()}("~\x3c#(~;~@{~w~^ ~_~}~;)~:\x3e",Z.a?Z.a("~\x3c#(~;~@{~w~^ ~_~}~;)~:\x3e"):Z.call(null,"~\x3c#(~;~@{~w~^ ~_~}~;)~:\x3e"),d,b,c)}().call(null,c)}finally{hq=d}}else return dq.a?dq.a(a):dq.call(null,a)},fq,gq,function(a){if(3<L(a)){if(u(Zn()))z(n,"#");else{var b=X,c=Tn;X+=1;Tn=0;try{Gn("(",")");ao(xh,1);ae(function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,
0)}return c.call(this,d)}function c(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return c(a)};a.v=c;return a}()}("~w ~@_~w ~@_~w ~_",Z.a?Z.a("~w ~@_~w ~@_~w ~_"):Z.call(null,"~w ~@_~w ~@_~w ~_"),b,c)}(),a);for(var d=0,e=r(we(3,a));;){if(Oa(ta)||d<ta){if(e){if(u(Zn()))z(n,"#");else{a=X;var f=Tn;X+=1;Tn=0;try{Gn(null,null),Vn(E(e)),F(e)&&(z(n," "),$n(Zh),Vn(Xc(e))),Hn()}finally{Tn=f,X=a}}if(F(vc(e))){z(n," ");$n(Sk);a=d+1;var g=F(vc(e)),d=a,e=g;continue}}}else z(n,"...");break}Hn()}finally{Tn=
c,X=b}}return null}return dq.a?dq.a(a):dq.call(null,a)},$p,cq,cq,fq,$p,fq,gq,gq,$p,gq,fq,fq,$p,fq,function(a){if(F(a)){var b=N(a,0,null),c=N(a,1,null),d=Ad(a,2),e="string"===typeof E(d)?new T(null,2,5,V,[E(d),F(d)],null):new T(null,2,5,V,[null,d],null),f=N(e,0,null),g=N(e,1,null),k=jd(E(g))?new T(null,2,5,V,[E(g),F(g)],null):new T(null,2,5,V,[null,g],null),m=N(k,0,null),p=N(k,1,null);if(u(Zn()))z(n,"#");else{var t=X,v=Tn;X+=1;Tn=0;try{Gn("(",")");(function(){return function(a,b){return function(){function a(b){var d=
null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return c.call(this,d)}function c(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return c(a)};a.v=c;return a}()}("~w ~1I~@_~w",Z.a?Z.a("~w ~1I~@_~w"):Z.call(null,"~w ~1I~@_~w"),t,v,a,b,c,d,e,f,g,k,m,p)})().call(null,b,c);u(u(f)?f:u(m)?m:r(p))&&function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-
0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return c.call(this,d)}function c(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return c(a)};a.v=c;return a}()}("~@:_",Z.a?Z.a("~@:_"):Z.call(null,"~@:_"),t,v,a,b,c,d,e,f,g,k,m,p)}().call(null);u(f)&&bo(!0,'"~a"~:[~;~:@_~]',M([f,u(m)?m:r(p)],0));u(m)&&function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ha(e,0)}return c.call(this,
d)}function c(a){a=eo(a);return Hp(b,a)}a.I=0;a.J=function(a){a=r(a);return c(a)};a.v=c;return a}()}("~w~:[~;~:@_~]",Z.a?Z.a("~w~:[~;~:@_~]"):Z.call(null,"~w~:[~;~:@_~]"),t,v,a,b,c,d,e,f,g,k,m,p)}().call(null,m,r(p));for(var w=p;;){Zp(E(w));var x=F(w);if(x){var C=x;$n(Sk);w=C}else break}Hn()}finally{Tn=v,X=t}}return null}return Vn(a)},fq,function(a){if(u(Zn()))z(n,"#");else{var b=X,c=Tn;X+=1;Tn=0;try{Gn("(",")");ao(xh,1);Vn(E(a));if(F(a)){z(n," ");$n(Sk);for(var d=0,e=F(a);;){if(Oa(ta)||d<ta){if(e){if(u(Zn()))z(n,
"#");else{a=X;var f=Tn;X+=1;Tn=0;try{Gn(null,null),Vn(E(e)),F(e)&&(z(n," "),$n(Zh),Vn(Xc(e))),Hn()}finally{Tn=f,X=a}}if(F(vc(e))){z(n," ");$n(Sk);a=d+1;var g=F(vc(e)),d=a,e=g;continue}}}else z(n,"...");break}}Hn()}finally{Tn=c,X=b}}return null},fq,cq,cq,$p,$p,fq,fq,$p])));
if("undefined"===typeof jq){var jq,kq=pe?pe(W):oe.call(null,W),lq=pe?pe(W):oe.call(null,W),mq=pe?pe(W):oe.call(null,W),nq=pe?pe(W):oe.call(null,W),oq=qc.c(W,ml,Qg());jq=new bh(rc.b("cljs.pprint","code-dispatch"),Rp,oi,oq,kq,lq,mq,nq)}$g(jq,bk,function(a){if(Oa(Jp(a))){var b;b=E(a);b=iq.a?iq.a(b):iq.call(null,b);return u(b)?b.a?b.a(a):b.call(null,a):dq(a)}return null});
$g(jq,ui,function(a){var b=a.a?a.a(hq):a.call(null,hq);return u(b)?Pm.v(M([b],0)):u(Qn)?Pm.v(M([Md(a)],0)):Qm.a?Qm.a(a):Qm.call(null,a)});$g(jq,jj,Kp);$g(jq,El,Lp);$g(jq,bl,Np);$g(jq,li,Qp);$g(jq,qk,function(a){var b=[y("#\x3c"),y(Pp(Qa(a).name)),y("@"),y(aa(a)),y(": ")].join("");if(u(Zn()))z(n,"#");else{var c=X,d=Tn;X+=1;Tn=0;try{Gn(b,"\x3e");ao(xh,-(L(b)-2));$n(Sk);var e,f=null!=a?a.K&1||a.Ed?!0:a.K?!1:Pa(Nb,a):Pa(Nb,a);e=f?!Ob(a):f;Vn(e?Ai:H.a?H.a(a):H.call(null,a));Hn()}finally{Tn=d,X=c}}return null});
$g(jq,null,Qm);$g(jq,oi,Mp);Ln=Sp;var pq=pe?pe(null):oe.call(null,null),am=new q(null,5,[hh,function(a){Hg(M(["Message received:"],0));Xn(Di.a(function(){var b=a.data;return Hm.a?Hm.a(b):Hm.call(null,b)}()));Hg(M([[y("Size: "),y(a.data.byteLength),y(" bytes")].join("")],0));return bm(H.a?H.a(pq):H.call(null,pq),a.data)},Dl,function(){return Hg(M(["Channel opened"],0))},Vk,function(a){return Hg(M(["Channel error: ",a.data],0))},bi,function(){return Hg(M(["Channel closed"],0))},mh,"arraybuffer"],null);
window.addEventListener("load",function(){Ga();var a=$l();return se.b?se.b(pq,a):se.call(null,pq,a)});
})();
