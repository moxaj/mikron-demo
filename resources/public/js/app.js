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
var f;
function m(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
b&&"undefined"==typeof a.call)return"object";return b}var ba="closure_uid_"+(1E9*Math.random()>>>0),ca=0;function da(a,b){for(var c in a)b.call(void 0,a[c],c,a)};function ea(a,b){null!=a&&this.append.apply(this,arguments)}f=ea.prototype;f.Na="";f.set=function(a){this.Na=""+a};f.append=function(a,b,c){this.Na+=a;if(null!=b)for(var d=1;d<arguments.length;d++)this.Na+=arguments[d];return this};f.clear=function(){this.Na=""};f.toString=function(){return this.Na};function fa(a,b){return a>b?1:a<b?-1:0};var ga={},ha;if("undefined"===typeof ia)var ia=function(){throw Error("No *print-fn* fn set for evaluation environment");};if("undefined"===typeof ja)var ja=function(){throw Error("No *print-err-fn* fn set for evaluation environment");};var ka=!0,la=null;if("undefined"===typeof ma)var ma=null;function pa(){return new q(null,5,[qa,!0,ra,!0,sa,!1,ua,!1,ya,null],null)}za;
function Aa(){ka=!1;ia=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ba(e,0)}return b.call(this,d)}function b(a){return console.log.apply(console,za.b?za.b(a):za.call(null,a))}a.w=0;a.P=function(a){a=t(a);return b(a)};a.s=b;return a}();ja=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ba(e,0)}return b.call(this,
d)}function b(a){return console.error.apply(console,za.b?za.b(a):za.call(null,a))}a.w=0;a.P=function(a){a=t(a);return b(a)};a.s=b;return a}()}function v(a){return null!=a&&!1!==a}Ca;w;function Da(a){return a instanceof Array}function Fa(a){return null==a?!0:!1===a?!0:!1}function y(a,b){return a[m(null==b?null:b)]?!0:a._?!0:!1}function B(a,b){var c=null==b?null:b.constructor,c=v(v(c)?c.Kb:c)?c.vb:m(b);return Error(["No protocol method ",a," defined for type ",c,": ",b].join(""))}
function Ga(a){var b=a.vb;return v(b)?b:""+C(a)}var Ia="undefined"!==typeof Symbol&&"function"===m(Symbol)?Symbol.iterator:"@@iterator";function Ja(a){for(var b=a.length,c=Array(b),d=0;;)if(d<b)c[d]=a[d],d+=1;else break;return c}Ka;La;var za=function za(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return za.b(arguments[0]);case 2:return za.a(arguments[0],arguments[1]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};
za.b=function(a){return za.a(null,a)};za.a=function(a,b){function c(a,b){a.push(b);return a}var d=[];return La.f?La.f(c,d,b):La.call(null,c,d,b)};za.w=2;function Ma(){}
var Qa=function Qa(b){if(null!=b&&null!=b.U)return b.U(b);var c=Qa[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Qa._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("ICounted.-count",b);},Ra=function Ra(b){if(null!=b&&null!=b.T)return b.T(b);var c=Ra[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Ra._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("IEmptyableCollection.-empty",b);};function Sa(){}
var Ta=function Ta(b,c){if(null!=b&&null!=b.O)return b.O(b,c);var d=Ta[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=Ta._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("ICollection.-conj",b);};function Va(){}
var D=function D(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return D.a(arguments[0],arguments[1]);case 3:return D.f(arguments[0],arguments[1],arguments[2]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};
D.a=function(a,b){if(null!=a&&null!=a.S)return a.S(a,b);var c=D[m(null==a?null:a)];if(null!=c)return c.a?c.a(a,b):c.call(null,a,b);c=D._;if(null!=c)return c.a?c.a(a,b):c.call(null,a,b);throw B("IIndexed.-nth",a);};D.f=function(a,b,c){if(null!=a&&null!=a.ia)return a.ia(a,b,c);var d=D[m(null==a?null:a)];if(null!=d)return d.f?d.f(a,b,c):d.call(null,a,b,c);d=D._;if(null!=d)return d.f?d.f(a,b,c):d.call(null,a,b,c);throw B("IIndexed.-nth",a);};D.w=3;
var Wa=function Wa(b){if(null!=b&&null!=b.V)return b.V(b);var c=Wa[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Wa._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("ISeq.-first",b);},Xa=function Xa(b){if(null!=b&&null!=b.$)return b.$(b);var c=Xa[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Xa._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("ISeq.-rest",b);};function Ya(){}function Za(){}
var $a=function $a(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return $a.a(arguments[0],arguments[1]);case 3:return $a.f(arguments[0],arguments[1],arguments[2]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};
$a.a=function(a,b){if(null!=a&&null!=a.G)return a.G(a,b);var c=$a[m(null==a?null:a)];if(null!=c)return c.a?c.a(a,b):c.call(null,a,b);c=$a._;if(null!=c)return c.a?c.a(a,b):c.call(null,a,b);throw B("ILookup.-lookup",a);};$a.f=function(a,b,c){if(null!=a&&null!=a.D)return a.D(a,b,c);var d=$a[m(null==a?null:a)];if(null!=d)return d.f?d.f(a,b,c):d.call(null,a,b,c);d=$a._;if(null!=d)return d.f?d.f(a,b,c):d.call(null,a,b,c);throw B("ILookup.-lookup",a);};$a.w=3;
var ab=function ab(b,c){if(null!=b&&null!=b.zb)return b.zb(b,c);var d=ab[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=ab._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("IAssociative.-contains-key?",b);},bb=function bb(b,c,d){if(null!=b&&null!=b.Oa)return b.Oa(b,c,d);var e=bb[m(null==b?null:b)];if(null!=e)return e.f?e.f(b,c,d):e.call(null,b,c,d);e=bb._;if(null!=e)return e.f?e.f(b,c,d):e.call(null,b,c,d);throw B("IAssociative.-assoc",b);};function cb(){}
var db=function db(b,c){if(null!=b&&null!=b.tb)return b.tb(b,c);var d=db[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=db._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("IMap.-dissoc",b);};function eb(){}
var fb=function fb(b){if(null!=b&&null!=b.ib)return b.ib(b);var c=fb[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=fb._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("IMapEntry.-key",b);},gb=function gb(b){if(null!=b&&null!=b.jb)return b.jb(b);var c=gb[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=gb._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("IMapEntry.-val",b);};function hb(){}function ib(){}
var jb=function jb(b,c,d){if(null!=b&&null!=b.Ta)return b.Ta(b,c,d);var e=jb[m(null==b?null:b)];if(null!=e)return e.f?e.f(b,c,d):e.call(null,b,c,d);e=jb._;if(null!=e)return e.f?e.f(b,c,d):e.call(null,b,c,d);throw B("IVector.-assoc-n",b);},kb=function kb(b){if(null!=b&&null!=b.rb)return b.rb(b);var c=kb[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=kb._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("IDeref.-deref",b);};function lb(){}
var mb=function mb(b){if(null!=b&&null!=b.K)return b.K(b);var c=mb[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=mb._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("IMeta.-meta",b);};function nb(){}var ob=function ob(b,c){if(null!=b&&null!=b.N)return b.N(b,c);var d=ob[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=ob._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("IWithMeta.-with-meta",b);};function pb(){}
var qb=function qb(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return qb.a(arguments[0],arguments[1]);case 3:return qb.f(arguments[0],arguments[1],arguments[2]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};
qb.a=function(a,b){if(null!=a&&null!=a.X)return a.X(a,b);var c=qb[m(null==a?null:a)];if(null!=c)return c.a?c.a(a,b):c.call(null,a,b);c=qb._;if(null!=c)return c.a?c.a(a,b):c.call(null,a,b);throw B("IReduce.-reduce",a);};qb.f=function(a,b,c){if(null!=a&&null!=a.Y)return a.Y(a,b,c);var d=qb[m(null==a?null:a)];if(null!=d)return d.f?d.f(a,b,c):d.call(null,a,b,c);d=qb._;if(null!=d)return d.f?d.f(a,b,c):d.call(null,a,b,c);throw B("IReduce.-reduce",a);};qb.w=3;
var rb=function rb(b,c){if(null!=b&&null!=b.o)return b.o(b,c);var d=rb[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=rb._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("IEquiv.-equiv",b);},sb=function sb(b){if(null!=b&&null!=b.H)return b.H(b);var c=sb[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=sb._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("IHash.-hash",b);};function tb(){}
var vb=function vb(b){if(null!=b&&null!=b.M)return b.M(b);var c=vb[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=vb._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("ISeqable.-seq",b);};function wb(){}function xb(){}
var G=function G(b,c){if(null!=b&&null!=b.Jb)return b.Jb(0,c);var d=G[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=G._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("IWriter.-write",b);},yb=function yb(b,c,d){if(null!=b&&null!=b.F)return b.F(b,c,d);var e=yb[m(null==b?null:b)];if(null!=e)return e.f?e.f(b,c,d):e.call(null,b,c,d);e=yb._;if(null!=e)return e.f?e.f(b,c,d):e.call(null,b,c,d);throw B("IPrintWithWriter.-pr-writer",b);},zb=function zb(b,c,d){if(null!=b&&null!=
b.Ib)return b.Ib(0,c,d);var e=zb[m(null==b?null:b)];if(null!=e)return e.f?e.f(b,c,d):e.call(null,b,c,d);e=zb._;if(null!=e)return e.f?e.f(b,c,d):e.call(null,b,c,d);throw B("IWatchable.-notify-watches",b);},Ab=function Ab(b){if(null!=b&&null!=b.Za)return b.Za(b);var c=Ab[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Ab._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("IEditableCollection.-as-transient",b);},Bb=function Bb(b,c){if(null!=b&&null!=b.Sa)return b.Sa(b,c);var d=Bb[m(null==
b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=Bb._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("ITransientCollection.-conj!",b);},Cb=function Cb(b){if(null!=b&&null!=b.$a)return b.$a(b);var c=Cb[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Cb._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("ITransientCollection.-persistent!",b);},Db=function Db(b,c,d){if(null!=b&&null!=b.lb)return b.lb(b,c,d);var e=Db[m(null==b?null:b)];if(null!=e)return e.f?e.f(b,
c,d):e.call(null,b,c,d);e=Db._;if(null!=e)return e.f?e.f(b,c,d):e.call(null,b,c,d);throw B("ITransientAssociative.-assoc!",b);},Eb=function Eb(b,c,d){if(null!=b&&null!=b.Hb)return b.Hb(0,c,d);var e=Eb[m(null==b?null:b)];if(null!=e)return e.f?e.f(b,c,d):e.call(null,b,c,d);e=Eb._;if(null!=e)return e.f?e.f(b,c,d):e.call(null,b,c,d);throw B("ITransientVector.-assoc-n!",b);};function Fb(){}
var Gb=function Gb(b,c){if(null!=b&&null!=b.Ra)return b.Ra(b,c);var d=Gb[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=Gb._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("IComparable.-compare",b);},Hb=function Hb(b){if(null!=b&&null!=b.Fb)return b.Fb();var c=Hb[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Hb._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("IChunk.-drop-first",b);},Ib=function Ib(b){if(null!=b&&null!=b.Bb)return b.Bb(b);var c=
Ib[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Ib._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("IChunkedSeq.-chunked-first",b);},Jb=function Jb(b){if(null!=b&&null!=b.Cb)return b.Cb(b);var c=Jb[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Jb._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("IChunkedSeq.-chunked-rest",b);},Kb=function Kb(b){if(null!=b&&null!=b.Ab)return b.Ab(b);var c=Kb[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,
b);c=Kb._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("IChunkedNext.-chunked-next",b);},Lb=function Lb(b,c){if(null!=b&&null!=b.lc)return b.lc(b,c);var d=Lb[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=Lb._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("IReset.-reset!",b);},Mb=function Mb(b){if(null!=b&&null!=b.na)return b.na(b);var c=Mb[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Mb._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("IIterable.-iterator",
b);};function Nb(a){this.vc=a;this.h=1073741824;this.v=0}Nb.prototype.Jb=function(a,b){return this.vc.append(b)};function Ob(a){var b=new ea;a.F(null,new Nb(b),pa());return""+C(b)}var Pb="undefined"!==typeof Math.imul&&0!==Math.imul(4294967295,5)?function(a,b){return Math.imul(a,b)}:function(a,b){var c=a&65535,d=b&65535;return c*d+((a>>>16&65535)*d+c*(b>>>16&65535)<<16>>>0)|0};function Qb(a){a=Pb(a|0,-862048943);return Pb(a<<15|a>>>-15,461845907)}
function Rb(a,b){var c=(a|0)^(b|0);return Pb(c<<13|c>>>-13,5)+-430675100|0}function Sb(a,b){var c=(a|0)^b,c=Pb(c^c>>>16,-2048144789),c=Pb(c^c>>>13,-1028477387);return c^c>>>16}function Tb(a){var b;a:{b=1;for(var c=0;;)if(b<a.length){var d=b+2,c=Rb(c,Qb(a.charCodeAt(b-1)|a.charCodeAt(b)<<16));b=d}else{b=c;break a}}b=1===(a.length&1)?b^Qb(a.charCodeAt(a.length-1)):b;return Sb(b,Pb(2,a.length))}Ub;Vb;I;Wb;var Xb={},Yb=0;
function Zb(a){255<Yb&&(Xb={},Yb=0);var b=Xb[a];if("number"!==typeof b){a:if(null!=a)if(b=a.length,0<b)for(var c=0,d=0;;)if(c<b)var e=c+1,d=Pb(31,d)+a.charCodeAt(c),c=e;else{b=d;break a}else b=0;else b=0;Xb[a]=b;Yb+=1}return a=b}function $b(a){null!=a&&(a.h&4194304||a.Ac)?a=a.H(null):"number"===typeof a?a=Math.floor(a)%2147483647:!0===a?a=1:!1===a?a=0:"string"===typeof a?(a=Zb(a),0!==a&&(a=Qb(a),a=Rb(0,a),a=Sb(a,4))):a=a instanceof Date?a.valueOf():null==a?0:sb(a);return a}
function ac(a,b){return a^b+2654435769+(a<<6)+(a>>2)}function Ca(a,b){return b instanceof a}function bc(a,b){if(a.ta===b.ta)return 0;var c=Fa(a.fa);if(v(c?b.fa:c))return-1;if(v(a.fa)){if(Fa(b.fa))return 1;c=fa(a.fa,b.fa);return 0===c?fa(a.name,b.name):c}return fa(a.name,b.name)}J;function Vb(a,b,c,d,e){this.fa=a;this.name=b;this.ta=c;this.Ya=d;this.ha=e;this.h=2154168321;this.v=4096}f=Vb.prototype;f.toString=function(){return this.ta};f.equiv=function(a){return this.o(null,a)};
f.o=function(a,b){return b instanceof Vb?this.ta===b.ta:!1};f.call=function(){function a(a,b,c){return J.f?J.f(b,this,c):J.call(null,b,this,c)}function b(a,b){return J.a?J.a(b,this):J.call(null,b,this)}var c=null,c=function(c,e,g){switch(arguments.length){case 2:return b.call(this,0,e);case 3:return a.call(this,0,e,g)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.f=a;return c}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ja(b)))};
f.b=function(a){return J.a?J.a(a,this):J.call(null,a,this)};f.a=function(a,b){return J.f?J.f(a,this,b):J.call(null,a,this,b)};f.K=function(){return this.ha};f.N=function(a,b){return new Vb(this.fa,this.name,this.ta,this.Ya,b)};f.H=function(){var a=this.Ya;return null!=a?a:this.Ya=a=ac(Tb(this.name),Zb(this.fa))};f.F=function(a,b){return G(b,this.ta)};
var cc=function cc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return cc.b(arguments[0]);case 2:return cc.a(arguments[0],arguments[1]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};cc.b=function(a){if(a instanceof Vb)return a;var b=a.indexOf("/");return-1===b?cc.a(null,a):cc.a(a.substring(0,b),a.substring(b+1,a.length))};cc.a=function(a,b){var c=null!=a?[C(a),C("/"),C(b)].join(""):b;return new Vb(a,b,c,null,null)};
cc.w=2;K;dc;Ba;function t(a){if(null==a)return null;if(null!=a&&(a.h&8388608||a.mc))return a.M(null);if(Da(a)||"string"===typeof a)return 0===a.length?null:new Ba(a,0);if(y(tb,a))return vb(a);throw Error([C(a),C(" is not ISeqable")].join(""));}function L(a){if(null==a)return null;if(null!=a&&(a.h&64||a.kb))return a.V(null);a=t(a);return null==a?null:Wa(a)}function fc(a){return null!=a?null!=a&&(a.h&64||a.kb)?a.$(null):(a=t(a))?Xa(a):N:N}
function O(a){return null==a?null:null!=a&&(a.h&128||a.ub)?a.ca(null):t(fc(a))}var I=function I(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return I.b(arguments[0]);case 2:return I.a(arguments[0],arguments[1]);default:return c=new Ba(c.slice(2),0),I.s(arguments[0],arguments[1],c)}};I.b=function(){return!0};I.a=function(a,b){return null==a?null==b:a===b||rb(a,b)};
I.s=function(a,b,c){for(;;)if(I.a(a,b))if(O(c))a=b,b=L(c),c=O(c);else return I.a(b,L(c));else return!1};I.P=function(a){var b=L(a),c=O(a);a=L(c);c=O(c);return I.s(b,a,c)};I.w=2;function gc(a){this.A=a}gc.prototype.next=function(){if(null!=this.A){var a=L(this.A);this.A=O(this.A);return{value:a,done:!1}}return{value:null,done:!0}};function P(a){return new gc(t(a))}hc;function ic(a,b,c){this.value=a;this.eb=b;this.wb=c;this.h=8388672;this.v=0}ic.prototype.M=function(){return this};ic.prototype.V=function(){return this.value};
ic.prototype.$=function(){null==this.wb&&(this.wb=hc.b?hc.b(this.eb):hc.call(null,this.eb));return this.wb};function hc(a){var b=a.next();return v(b.done)?N:new ic(b.value,a,null)}function jc(a,b){var c=Qb(a),c=Rb(0,c);return Sb(c,b)}function kc(a){var b=0,c=1;for(a=t(a);;)if(null!=a)b+=1,c=Pb(31,c)+$b(L(a))|0,a=O(a);else return jc(c,b)}var lc=jc(1,0);function mc(a){var b=0,c=0;for(a=t(a);;)if(null!=a)b+=1,c=c+$b(L(a))|0,a=O(a);else return jc(c,b)}var nc=jc(0,0);oc;Ub;pc;Ma["null"]=!0;
Qa["null"]=function(){return 0};Date.prototype.o=function(a,b){return b instanceof Date&&this.valueOf()===b.valueOf()};Date.prototype.hb=!0;Date.prototype.Ra=function(a,b){if(b instanceof Date)return fa(this.valueOf(),b.valueOf());throw Error([C("Cannot compare "),C(this),C(" to "),C(b)].join(""));};rb.number=function(a,b){return a===b};qc;lb["function"]=!0;mb["function"]=function(){return null};sb._=function(a){return a[ba]||(a[ba]=++ca)};rc;function sc(a){this.J=a;this.h=32768;this.v=0}
sc.prototype.rb=function(){return this.J};function uc(a){return a instanceof sc}function rc(a){return kb(a)}function vc(a,b){var c=Qa(a);if(0===c)return b.C?b.C():b.call(null);for(var d=D.a(a,0),e=1;;)if(e<c){var g=D.a(a,e),d=b.a?b.a(d,g):b.call(null,d,g);if(uc(d))return kb(d);e+=1}else return d}function wc(a,b,c){var d=Qa(a),e=c;for(c=0;;)if(c<d){var g=D.a(a,c),e=b.a?b.a(e,g):b.call(null,e,g);if(uc(e))return kb(e);c+=1}else return e}
function xc(a,b){var c=a.length;if(0===a.length)return b.C?b.C():b.call(null);for(var d=a[0],e=1;;)if(e<c){var g=a[e],d=b.a?b.a(d,g):b.call(null,d,g);if(uc(d))return kb(d);e+=1}else return d}function yc(a,b,c){var d=a.length,e=c;for(c=0;;)if(c<d){var g=a[c],e=b.a?b.a(e,g):b.call(null,e,g);if(uc(e))return kb(e);c+=1}else return e}function zc(a,b,c,d){for(var e=a.length;;)if(d<e){var g=a[d];c=b.a?b.a(c,g):b.call(null,c,g);if(uc(c))return kb(c);d+=1}else return c}Ac;Q;Bc;Cc;
function Dc(a){return null!=a?a.h&2||a.bc?!0:a.h?!1:y(Ma,a):y(Ma,a)}function Ec(a){return null!=a?a.h&16||a.Gb?!0:a.h?!1:y(Va,a):y(Va,a)}function Fc(a,b){this.c=a;this.i=b}Fc.prototype.Z=function(){return this.i<this.c.length};Fc.prototype.next=function(){var a=this.c[this.i];this.i+=1;return a};function Ba(a,b){this.c=a;this.i=b;this.h=166199550;this.v=8192}f=Ba.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};
f.S=function(a,b){var c=b+this.i;return c<this.c.length?this.c[c]:null};f.ia=function(a,b,c){a=b+this.i;return a<this.c.length?this.c[a]:c};f.na=function(){return new Fc(this.c,this.i)};f.ca=function(){return this.i+1<this.c.length?new Ba(this.c,this.i+1):null};f.U=function(){var a=this.c.length-this.i;return 0>a?0:a};f.H=function(){return kc(this)};f.o=function(a,b){return pc.a?pc.a(this,b):pc.call(null,this,b)};f.T=function(){return N};
f.X=function(a,b){return zc(this.c,b,this.c[this.i],this.i+1)};f.Y=function(a,b,c){return zc(this.c,b,c,this.i)};f.V=function(){return this.c[this.i]};f.$=function(){return this.i+1<this.c.length?new Ba(this.c,this.i+1):N};f.M=function(){return this.i<this.c.length?this:null};f.O=function(a,b){return Q.a?Q.a(b,this):Q.call(null,b,this)};Ba.prototype[Ia]=function(){return P(this)};
var dc=function dc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return dc.b(arguments[0]);case 2:return dc.a(arguments[0],arguments[1]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};dc.b=function(a){return dc.a(a,0)};dc.a=function(a,b){return b<a.length?new Ba(a,b):null};dc.w=2;
var K=function K(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return K.b(arguments[0]);case 2:return K.a(arguments[0],arguments[1]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};K.b=function(a){return dc.a(a,0)};K.a=function(a,b){return dc.a(a,b)};K.w=2;qc;S;function Bc(a,b,c){this.qb=a;this.i=b;this.l=c;this.h=32374990;this.v=8192}f=Bc.prototype;f.toString=function(){return Ob(this)};
f.equiv=function(a){return this.o(null,a)};f.K=function(){return this.l};f.ca=function(){return 0<this.i?new Bc(this.qb,this.i-1,null):null};f.U=function(){return this.i+1};f.H=function(){return kc(this)};f.o=function(a,b){return pc.a?pc.a(this,b):pc.call(null,this,b)};f.T=function(){var a=N,b=this.l;return qc.a?qc.a(a,b):qc.call(null,a,b)};f.X=function(a,b){return S.a?S.a(b,this):S.call(null,b,this)};f.Y=function(a,b,c){return S.f?S.f(b,c,this):S.call(null,b,c,this)};
f.V=function(){return D.a(this.qb,this.i)};f.$=function(){return 0<this.i?new Bc(this.qb,this.i-1,null):N};f.M=function(){return this};f.N=function(a,b){return new Bc(this.qb,this.i,b)};f.O=function(a,b){return Q.a?Q.a(b,this):Q.call(null,b,this)};Bc.prototype[Ia]=function(){return P(this)};rb._=function(a,b){return a===b};
var Gc=function Gc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return Gc.C();case 1:return Gc.b(arguments[0]);case 2:return Gc.a(arguments[0],arguments[1]);default:return c=new Ba(c.slice(2),0),Gc.s(arguments[0],arguments[1],c)}};Gc.C=function(){return Hc};Gc.b=function(a){return a};Gc.a=function(a,b){return null!=a?Ta(a,b):Ta(N,b)};Gc.s=function(a,b,c){for(;;)if(v(c))a=Gc.a(a,b),b=L(c),c=O(c);else return Gc.a(a,b)};
Gc.P=function(a){var b=L(a),c=O(a);a=L(c);c=O(c);return Gc.s(b,a,c)};Gc.w=2;function T(a){if(null!=a)if(null!=a&&(a.h&2||a.bc))a=a.U(null);else if(Da(a))a=a.length;else if("string"===typeof a)a=a.length;else if(null!=a&&(a.h&8388608||a.mc))a:{a=t(a);for(var b=0;;){if(Dc(a)){a=b+Qa(a);break a}a=O(a);b+=1}}else a=Qa(a);else a=0;return a}function Jc(a,b){for(var c=null;;){if(null==a)return c;if(0===b)return t(a)?L(a):c;if(Ec(a))return D.f(a,b,c);if(t(a)){var d=O(a),e=b-1;a=d;b=e}else return c}}
function Kc(a,b){if("number"!==typeof b)throw Error("index argument to nth must be a number");if(null==a)return a;if(null!=a&&(a.h&16||a.Gb))return a.S(null,b);if(Da(a))return b<a.length?a[b]:null;if("string"===typeof a)return b<a.length?a.charAt(b):null;if(null!=a&&(a.h&64||a.kb)){var c;a:{c=a;for(var d=b;;){if(null==c)throw Error("Index out of bounds");if(0===d){if(t(c)){c=L(c);break a}throw Error("Index out of bounds");}if(Ec(c)){c=D.a(c,d);break a}if(t(c))c=O(c),--d;else throw Error("Index out of bounds");
}}return c}if(y(Va,a))return D.a(a,b);throw Error([C("nth not supported on this type "),C(Ga(null==a?null:a.constructor))].join(""));}
function U(a,b){if("number"!==typeof b)throw Error("index argument to nth must be a number.");if(null==a)return null;if(null!=a&&(a.h&16||a.Gb))return a.ia(null,b,null);if(Da(a))return b<a.length?a[b]:null;if("string"===typeof a)return b<a.length?a.charAt(b):null;if(null!=a&&(a.h&64||a.kb))return Jc(a,b);if(y(Va,a))return D.a(a,b);throw Error([C("nth not supported on this type "),C(Ga(null==a?null:a.constructor))].join(""));}
var J=function J(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return J.a(arguments[0],arguments[1]);case 3:return J.f(arguments[0],arguments[1],arguments[2]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};J.a=function(a,b){return null==a?null:null!=a&&(a.h&256||a.fc)?a.G(null,b):Da(a)?b<a.length?a[b|0]:null:"string"===typeof a?b<a.length?a[b|0]:null:y(Za,a)?$a.a(a,b):null};
J.f=function(a,b,c){return null!=a?null!=a&&(a.h&256||a.fc)?a.D(null,b,c):Da(a)?b<a.length?a[b]:c:"string"===typeof a?b<a.length?a[b]:c:y(Za,a)?$a.f(a,b,c):c:c};J.w=3;Lc;var Mc=function Mc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 3:return Mc.f(arguments[0],arguments[1],arguments[2]);default:return c=new Ba(c.slice(3),0),Mc.s(arguments[0],arguments[1],arguments[2],c)}};Mc.f=function(a,b,c){return null!=a?bb(a,b,c):Nc([b],[c])};
Mc.s=function(a,b,c,d){for(;;)if(a=Mc.f(a,b,c),v(d))b=L(d),c=L(O(d)),d=O(O(d));else return a};Mc.P=function(a){var b=L(a),c=O(a);a=L(c);var d=O(c),c=L(d),d=O(d);return Mc.s(b,a,c,d)};Mc.w=3;var Oc=function Oc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return Oc.b(arguments[0]);case 2:return Oc.a(arguments[0],arguments[1]);default:return c=new Ba(c.slice(2),0),Oc.s(arguments[0],arguments[1],c)}};Oc.b=function(a){return a};
Oc.a=function(a,b){return null==a?null:db(a,b)};Oc.s=function(a,b,c){for(;;){if(null==a)return null;a=Oc.a(a,b);if(v(c))b=L(c),c=O(c);else return a}};Oc.P=function(a){var b=L(a),c=O(a);a=L(c);c=O(c);return Oc.s(b,a,c)};Oc.w=2;function Pc(a,b){this.g=a;this.l=b;this.h=393217;this.v=0}f=Pc.prototype;f.K=function(){return this.l};f.N=function(a,b){return new Pc(this.g,b)};
f.call=function(){function a(a,b,c,d,e,g,h,k,l,n,H,M,na,V,p,r,A,u,x,z,E,R){a=this;return Ka.sb?Ka.sb(a.g,b,c,d,e,g,h,k,l,n,H,M,na,V,p,r,A,u,x,z,E,R):Ka.call(null,a.g,b,c,d,e,g,h,k,l,n,H,M,na,V,p,r,A,u,x,z,E,R)}function b(a,b,c,d,e,g,h,k,l,n,H,M,na,V,p,r,A,u,x,z,E){a=this;return a.g.Ha?a.g.Ha(b,c,d,e,g,h,k,l,n,H,M,na,V,p,r,A,u,x,z,E):a.g.call(null,b,c,d,e,g,h,k,l,n,H,M,na,V,p,r,A,u,x,z,E)}function c(a,b,c,d,e,g,h,k,l,n,H,M,na,V,p,r,A,u,x,z){a=this;return a.g.Ga?a.g.Ga(b,c,d,e,g,h,k,l,n,H,M,na,V,p,
r,A,u,x,z):a.g.call(null,b,c,d,e,g,h,k,l,n,H,M,na,V,p,r,A,u,x,z)}function d(a,b,c,d,e,g,h,k,l,n,H,M,na,V,p,r,A,u,x){a=this;return a.g.Fa?a.g.Fa(b,c,d,e,g,h,k,l,n,H,M,na,V,p,r,A,u,x):a.g.call(null,b,c,d,e,g,h,k,l,n,H,M,na,V,p,r,A,u,x)}function e(a,b,c,d,e,g,h,k,l,n,H,M,na,V,p,r,A,u){a=this;return a.g.Ea?a.g.Ea(b,c,d,e,g,h,k,l,n,H,M,na,V,p,r,A,u):a.g.call(null,b,c,d,e,g,h,k,l,n,H,M,na,V,p,r,A,u)}function g(a,b,c,d,e,g,h,k,l,n,H,M,p,V,r,A,u){a=this;return a.g.Da?a.g.Da(b,c,d,e,g,h,k,l,n,H,M,p,V,r,A,
u):a.g.call(null,b,c,d,e,g,h,k,l,n,H,M,p,V,r,A,u)}function h(a,b,c,d,e,g,h,k,l,n,H,M,p,V,r,A){a=this;return a.g.Ca?a.g.Ca(b,c,d,e,g,h,k,l,n,H,M,p,V,r,A):a.g.call(null,b,c,d,e,g,h,k,l,n,H,M,p,V,r,A)}function k(a,b,c,d,e,g,h,k,l,n,H,M,p,V,r){a=this;return a.g.Ba?a.g.Ba(b,c,d,e,g,h,k,l,n,H,M,p,V,r):a.g.call(null,b,c,d,e,g,h,k,l,n,H,M,p,V,r)}function l(a,b,c,d,e,g,h,k,l,n,H,M,p,V){a=this;return a.g.Aa?a.g.Aa(b,c,d,e,g,h,k,l,n,H,M,p,V):a.g.call(null,b,c,d,e,g,h,k,l,n,H,M,p,V)}function n(a,b,c,d,e,g,h,
k,l,n,H,M,p){a=this;return a.g.za?a.g.za(b,c,d,e,g,h,k,l,n,H,M,p):a.g.call(null,b,c,d,e,g,h,k,l,n,H,M,p)}function p(a,b,c,d,e,g,h,k,l,n,H,M){a=this;return a.g.ya?a.g.ya(b,c,d,e,g,h,k,l,n,H,M):a.g.call(null,b,c,d,e,g,h,k,l,n,H,M)}function r(a,b,c,d,e,g,h,k,l,n,H){a=this;return a.g.xa?a.g.xa(b,c,d,e,g,h,k,l,n,H):a.g.call(null,b,c,d,e,g,h,k,l,n,H)}function u(a,b,c,d,e,g,h,k,l,n){a=this;return a.g.Ja?a.g.Ja(b,c,d,e,g,h,k,l,n):a.g.call(null,b,c,d,e,g,h,k,l,n)}function x(a,b,c,d,e,g,h,k,l){a=this;return a.g.Ia?
a.g.Ia(b,c,d,e,g,h,k,l):a.g.call(null,b,c,d,e,g,h,k,l)}function z(a,b,c,d,e,g,h,k){a=this;return a.g.ma?a.g.ma(b,c,d,e,g,h,k):a.g.call(null,b,c,d,e,g,h,k)}function E(a,b,c,d,e,g,h){a=this;return a.g.la?a.g.la(b,c,d,e,g,h):a.g.call(null,b,c,d,e,g,h)}function A(a,b,c,d,e,g){a=this;return a.g.W?a.g.W(b,c,d,e,g):a.g.call(null,b,c,d,e,g)}function R(a,b,c,d,e){a=this;return a.g.u?a.g.u(b,c,d,e):a.g.call(null,b,c,d,e)}function aa(a,b,c,d){a=this;return a.g.f?a.g.f(b,c,d):a.g.call(null,b,c,d)}function oa(a,
b,c){a=this;return a.g.a?a.g.a(b,c):a.g.call(null,b,c)}function Pa(a,b){a=this;return a.g.b?a.g.b(b):a.g.call(null,b)}function ub(a){a=this;return a.g.C?a.g.C():a.g.call(null)}var F=null,F=function(F,ta,va,wa,xa,Ea,Ha,Na,Oa,Ua,H,M,na,V,ec,tc,Ic,cd,Vd,Te,cg,ah){switch(arguments.length){case 1:return ub.call(this,F);case 2:return Pa.call(this,F,ta);case 3:return oa.call(this,F,ta,va);case 4:return aa.call(this,F,ta,va,wa);case 5:return R.call(this,F,ta,va,wa,xa);case 6:return A.call(this,F,ta,va,wa,
xa,Ea);case 7:return E.call(this,F,ta,va,wa,xa,Ea,Ha);case 8:return z.call(this,F,ta,va,wa,xa,Ea,Ha,Na);case 9:return x.call(this,F,ta,va,wa,xa,Ea,Ha,Na,Oa);case 10:return u.call(this,F,ta,va,wa,xa,Ea,Ha,Na,Oa,Ua);case 11:return r.call(this,F,ta,va,wa,xa,Ea,Ha,Na,Oa,Ua,H);case 12:return p.call(this,F,ta,va,wa,xa,Ea,Ha,Na,Oa,Ua,H,M);case 13:return n.call(this,F,ta,va,wa,xa,Ea,Ha,Na,Oa,Ua,H,M,na);case 14:return l.call(this,F,ta,va,wa,xa,Ea,Ha,Na,Oa,Ua,H,M,na,V);case 15:return k.call(this,F,ta,va,wa,
xa,Ea,Ha,Na,Oa,Ua,H,M,na,V,ec);case 16:return h.call(this,F,ta,va,wa,xa,Ea,Ha,Na,Oa,Ua,H,M,na,V,ec,tc);case 17:return g.call(this,F,ta,va,wa,xa,Ea,Ha,Na,Oa,Ua,H,M,na,V,ec,tc,Ic);case 18:return e.call(this,F,ta,va,wa,xa,Ea,Ha,Na,Oa,Ua,H,M,na,V,ec,tc,Ic,cd);case 19:return d.call(this,F,ta,va,wa,xa,Ea,Ha,Na,Oa,Ua,H,M,na,V,ec,tc,Ic,cd,Vd);case 20:return c.call(this,F,ta,va,wa,xa,Ea,Ha,Na,Oa,Ua,H,M,na,V,ec,tc,Ic,cd,Vd,Te);case 21:return b.call(this,F,ta,va,wa,xa,Ea,Ha,Na,Oa,Ua,H,M,na,V,ec,tc,Ic,cd,Vd,
Te,cg);case 22:return a.call(this,F,ta,va,wa,xa,Ea,Ha,Na,Oa,Ua,H,M,na,V,ec,tc,Ic,cd,Vd,Te,cg,ah)}throw Error("Invalid arity: "+arguments.length);};F.b=ub;F.a=Pa;F.f=oa;F.u=aa;F.W=R;F.la=A;F.ma=E;F.Ia=z;F.Ja=x;F.xa=u;F.ya=r;F.za=p;F.Aa=n;F.Ba=l;F.Ca=k;F.Da=h;F.Ea=g;F.Fa=e;F.Ga=d;F.Ha=c;F.ec=b;F.sb=a;return F}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ja(b)))};f.C=function(){return this.g.C?this.g.C():this.g.call(null)};
f.b=function(a){return this.g.b?this.g.b(a):this.g.call(null,a)};f.a=function(a,b){return this.g.a?this.g.a(a,b):this.g.call(null,a,b)};f.f=function(a,b,c){return this.g.f?this.g.f(a,b,c):this.g.call(null,a,b,c)};f.u=function(a,b,c,d){return this.g.u?this.g.u(a,b,c,d):this.g.call(null,a,b,c,d)};f.W=function(a,b,c,d,e){return this.g.W?this.g.W(a,b,c,d,e):this.g.call(null,a,b,c,d,e)};f.la=function(a,b,c,d,e,g){return this.g.la?this.g.la(a,b,c,d,e,g):this.g.call(null,a,b,c,d,e,g)};
f.ma=function(a,b,c,d,e,g,h){return this.g.ma?this.g.ma(a,b,c,d,e,g,h):this.g.call(null,a,b,c,d,e,g,h)};f.Ia=function(a,b,c,d,e,g,h,k){return this.g.Ia?this.g.Ia(a,b,c,d,e,g,h,k):this.g.call(null,a,b,c,d,e,g,h,k)};f.Ja=function(a,b,c,d,e,g,h,k,l){return this.g.Ja?this.g.Ja(a,b,c,d,e,g,h,k,l):this.g.call(null,a,b,c,d,e,g,h,k,l)};f.xa=function(a,b,c,d,e,g,h,k,l,n){return this.g.xa?this.g.xa(a,b,c,d,e,g,h,k,l,n):this.g.call(null,a,b,c,d,e,g,h,k,l,n)};
f.ya=function(a,b,c,d,e,g,h,k,l,n,p){return this.g.ya?this.g.ya(a,b,c,d,e,g,h,k,l,n,p):this.g.call(null,a,b,c,d,e,g,h,k,l,n,p)};f.za=function(a,b,c,d,e,g,h,k,l,n,p,r){return this.g.za?this.g.za(a,b,c,d,e,g,h,k,l,n,p,r):this.g.call(null,a,b,c,d,e,g,h,k,l,n,p,r)};f.Aa=function(a,b,c,d,e,g,h,k,l,n,p,r,u){return this.g.Aa?this.g.Aa(a,b,c,d,e,g,h,k,l,n,p,r,u):this.g.call(null,a,b,c,d,e,g,h,k,l,n,p,r,u)};
f.Ba=function(a,b,c,d,e,g,h,k,l,n,p,r,u,x){return this.g.Ba?this.g.Ba(a,b,c,d,e,g,h,k,l,n,p,r,u,x):this.g.call(null,a,b,c,d,e,g,h,k,l,n,p,r,u,x)};f.Ca=function(a,b,c,d,e,g,h,k,l,n,p,r,u,x,z){return this.g.Ca?this.g.Ca(a,b,c,d,e,g,h,k,l,n,p,r,u,x,z):this.g.call(null,a,b,c,d,e,g,h,k,l,n,p,r,u,x,z)};f.Da=function(a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E){return this.g.Da?this.g.Da(a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E):this.g.call(null,a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E)};
f.Ea=function(a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A){return this.g.Ea?this.g.Ea(a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A):this.g.call(null,a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A)};f.Fa=function(a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R){return this.g.Fa?this.g.Fa(a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R):this.g.call(null,a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R)};
f.Ga=function(a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa){return this.g.Ga?this.g.Ga(a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa):this.g.call(null,a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa)};f.Ha=function(a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa,oa){return this.g.Ha?this.g.Ha(a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa,oa):this.g.call(null,a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa,oa)};
f.ec=function(a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa,oa,Pa){return Ka.sb?Ka.sb(this.g,a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa,oa,Pa):Ka.call(null,this.g,a,b,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa,oa,Pa)};function qc(a,b){return"function"==m(a)?new Pc(a,b):null==a?null:ob(a,b)}function Qc(a){var b=null!=a;return(b?null!=a?a.h&131072||a.ic||(a.h?0:y(lb,a)):y(lb,a):b)?mb(a):null}function Rc(a){return null==a?!1:null!=a?a.h&4096||a.Dc?!0:a.h?!1:y(hb,a):y(hb,a)}
function Sc(a){return null!=a?a.h&16777216||a.Cc?!0:a.h?!1:y(wb,a):y(wb,a)}function Tc(a){return null==a?!1:null!=a?a.h&1024||a.gc?!0:a.h?!1:y(cb,a):y(cb,a)}function Uc(a){return null!=a?a.h&16384||a.Ec?!0:a.h?!1:y(ib,a):y(ib,a)}Vc;Wc;function Xc(a){return null!=a?a.v&512||a.xc?!0:!1:!1}function Yc(a){var b=[];da(a,function(a,b){return function(a,c){return b.push(c)}}(a,b));return b}function Zc(a,b,c,d,e){for(;0!==e;)c[d]=a[b],d+=1,--e,b+=1}var $c={};
function ad(a){return null==a?!1:!1===a?!1:!0}function bd(a,b){return J.f(a,b,$c)===$c?!1:!0}
function Wb(a,b){if(a===b)return 0;if(null==a)return-1;if(null==b)return 1;if("number"===typeof a){if("number"===typeof b)return fa(a,b);throw Error([C("Cannot compare "),C(a),C(" to "),C(b)].join(""));}if(null!=a?a.v&2048||a.hb||(a.v?0:y(Fb,a)):y(Fb,a))return Gb(a,b);if("string"!==typeof a&&!Da(a)&&!0!==a&&!1!==a||(null==a?null:a.constructor)!==(null==b?null:b.constructor))throw Error([C("Cannot compare "),C(a),C(" to "),C(b)].join(""));return fa(a,b)}
function dd(a,b){var c=T(a),d=T(b);if(c<d)c=-1;else if(c>d)c=1;else if(0===c)c=0;else a:for(d=0;;){var e=Wb(Kc(a,d),Kc(b,d));if(0===e&&d+1<c)d+=1;else{c=e;break a}}return c}ed;var S=function S(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return S.a(arguments[0],arguments[1]);case 3:return S.f(arguments[0],arguments[1],arguments[2]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};
S.a=function(a,b){var c=t(b);if(c){var d=L(c),c=O(c);return La.f?La.f(a,d,c):La.call(null,a,d,c)}return a.C?a.C():a.call(null)};S.f=function(a,b,c){for(c=t(c);;)if(c){var d=L(c);b=a.a?a.a(b,d):a.call(null,b,d);if(uc(b))return kb(b);c=O(c)}else return b};S.w=3;fd;
var La=function La(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return La.a(arguments[0],arguments[1]);case 3:return La.f(arguments[0],arguments[1],arguments[2]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};La.a=function(a,b){return null!=b&&(b.h&524288||b.kc)?b.X(null,a):Da(b)?xc(b,a):"string"===typeof b?xc(b,a):y(pb,b)?qb.a(b,a):S.a(a,b)};
La.f=function(a,b,c){return null!=c&&(c.h&524288||c.kc)?c.Y(null,a,b):Da(c)?yc(c,a,b):"string"===typeof c?yc(c,a,b):y(pb,c)?qb.f(c,a,b):S.f(a,b,c)};La.w=3;function gd(a){return a}ga.divide;hd;function id(a){return 0<=a?Math.floor(a):Math.ceil(a)}function hd(a,b){return(a%b+b)%b}function jd(a){return id((a-a%2)/2)}function kd(a){a-=a>>1&1431655765;a=(a&858993459)+(a>>2&858993459);return 16843009*(a+(a>>4)&252645135)>>24}
var C=function C(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return C.C();case 1:return C.b(arguments[0]);default:return c=new Ba(c.slice(1),0),C.s(arguments[0],c)}};C.C=function(){return""};C.b=function(a){return null==a?"":""+a};C.s=function(a,b){for(var c=new ea(""+C(a)),d=b;;)if(v(d))c=c.append(""+C(L(d))),d=O(d);else return c.toString()};C.P=function(a){var b=L(a);a=O(a);return C.s(b,a)};C.w=1;ld;md;
function pc(a,b){var c;if(Sc(b))if(Dc(a)&&Dc(b)&&T(a)!==T(b))c=!1;else a:{c=t(a);for(var d=t(b);;){if(null==c){c=null==d;break a}if(null!=d&&I.a(L(c),L(d)))c=O(c),d=O(d);else{c=!1;break a}}}else c=null;return ad(c)}function Ac(a){if(t(a)){var b=$b(L(a));for(a=O(a);;){if(null==a)return b;b=ac(b,$b(L(a)));a=O(a)}}else return 0}nd;od;md;pd;qd;function Cc(a,b,c,d,e){this.l=a;this.first=b;this.ga=c;this.count=d;this.m=e;this.h=65937646;this.v=8192}f=Cc.prototype;f.toString=function(){return Ob(this)};
f.equiv=function(a){return this.o(null,a)};f.K=function(){return this.l};f.ca=function(){return 1===this.count?null:this.ga};f.U=function(){return this.count};f.H=function(){var a=this.m;return null!=a?a:this.m=a=kc(this)};f.o=function(a,b){return pc(this,b)};f.T=function(){return ob(N,this.l)};f.X=function(a,b){return S.a(b,this)};f.Y=function(a,b,c){return S.f(b,c,this)};f.V=function(){return this.first};f.$=function(){return 1===this.count?N:this.ga};f.M=function(){return this};
f.N=function(a,b){return new Cc(b,this.first,this.ga,this.count,this.m)};f.O=function(a,b){return new Cc(this.l,b,this,this.count+1,null)};Cc.prototype[Ia]=function(){return P(this)};function rd(a){this.l=a;this.h=65937614;this.v=8192}f=rd.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};f.K=function(){return this.l};f.ca=function(){return null};f.U=function(){return 0};f.H=function(){return lc};
f.o=function(a,b){return(null!=b?b.h&33554432||b.Bc||(b.h?0:y(xb,b)):y(xb,b))||Sc(b)?null==t(b):!1};f.T=function(){return this};f.X=function(a,b){return S.a(b,this)};f.Y=function(a,b,c){return S.f(b,c,this)};f.V=function(){return null};f.$=function(){return N};f.M=function(){return null};f.N=function(a,b){return new rd(b)};f.O=function(a,b){return new Cc(this.l,b,null,1,null)};var N=new rd(null);rd.prototype[Ia]=function(){return P(this)};
var Ub=function Ub(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ba(c.slice(0),0):null;return Ub.s(c)};Ub.s=function(a){var b;if(a instanceof Ba&&0===a.i)b=a.c;else a:for(b=[];;)if(null!=a)b.push(a.V(null)),a=a.ca(null);else break a;a=b.length;for(var c=N;;)if(0<a){var d=a-1,c=c.O(null,b[a-1]);a=d}else return c};Ub.w=0;Ub.P=function(a){return Ub.s(t(a))};
function sd(a,b,c,d){this.l=a;this.first=b;this.ga=c;this.m=d;this.h=65929452;this.v=8192}f=sd.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};f.K=function(){return this.l};f.ca=function(){return null==this.ga?null:t(this.ga)};f.H=function(){var a=this.m;return null!=a?a:this.m=a=kc(this)};f.o=function(a,b){return pc(this,b)};f.T=function(){return qc(N,this.l)};f.X=function(a,b){return S.a(b,this)};f.Y=function(a,b,c){return S.f(b,c,this)};f.V=function(){return this.first};
f.$=function(){return null==this.ga?N:this.ga};f.M=function(){return this};f.N=function(a,b){return new sd(b,this.first,this.ga,this.m)};f.O=function(a,b){return new sd(null,b,this,this.m)};sd.prototype[Ia]=function(){return P(this)};function Q(a,b){var c=null==b;return(c?c:null!=b&&(b.h&64||b.kb))?new sd(null,a,b,null):new sd(null,a,t(b),null)}
function td(a,b){if(a.ba===b.ba)return 0;var c=Fa(a.fa);if(v(c?b.fa:c))return-1;if(v(a.fa)){if(Fa(b.fa))return 1;c=fa(a.fa,b.fa);return 0===c?fa(a.name,b.name):c}return fa(a.name,b.name)}function w(a,b,c,d){this.fa=a;this.name=b;this.ba=c;this.Ya=d;this.h=2153775105;this.v=4096}f=w.prototype;f.toString=function(){return[C(":"),C(this.ba)].join("")};f.equiv=function(a){return this.o(null,a)};f.o=function(a,b){return b instanceof w?this.ba===b.ba:!1};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return J.a(c,this);case 3:return J.f(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return J.a(c,this)};a.f=function(a,c,d){return J.f(c,this,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ja(b)))};f.b=function(a){return J.a(a,this)};f.a=function(a,b){return J.f(a,this,b)};
f.H=function(){var a=this.Ya;return null!=a?a:this.Ya=a=ac(Tb(this.name),Zb(this.fa))+2654435769|0};f.F=function(a,b){return G(b,[C(":"),C(this.ba)].join(""))};function ud(a,b){return a===b?!0:a instanceof w&&b instanceof w?a.ba===b.ba:!1}
var vd=function vd(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return vd.b(arguments[0]);case 2:return vd.a(arguments[0],arguments[1]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};
vd.b=function(a){if(a instanceof w)return a;if(a instanceof Vb){var b;if(null!=a&&(a.v&4096||a.jc))b=a.fa;else throw Error([C("Doesn't support namespace: "),C(a)].join(""));return new w(b,md.b?md.b(a):md.call(null,a),a.ta,null)}return"string"===typeof a?(b=a.split("/"),2===b.length?new w(b[0],b[1],a,null):new w(null,b[0],a,null)):null};vd.a=function(a,b){return new w(a,b,[C(v(a)?[C(a),C("/")].join(""):null),C(b)].join(""),null)};vd.w=2;
function wd(a,b,c,d){this.l=a;this.bb=b;this.A=c;this.m=d;this.h=32374988;this.v=0}f=wd.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};function xd(a){null!=a.bb&&(a.A=a.bb.C?a.bb.C():a.bb.call(null),a.bb=null);return a.A}f.K=function(){return this.l};f.ca=function(){vb(this);return null==this.A?null:O(this.A)};f.H=function(){var a=this.m;return null!=a?a:this.m=a=kc(this)};f.o=function(a,b){return pc(this,b)};f.T=function(){return qc(N,this.l)};
f.X=function(a,b){return S.a(b,this)};f.Y=function(a,b,c){return S.f(b,c,this)};f.V=function(){vb(this);return null==this.A?null:L(this.A)};f.$=function(){vb(this);return null!=this.A?fc(this.A):N};f.M=function(){xd(this);if(null==this.A)return null;for(var a=this.A;;)if(a instanceof wd)a=xd(a);else return this.A=a,t(this.A)};f.N=function(a,b){return new wd(b,this.bb,this.A,this.m)};f.O=function(a,b){return Q(b,this)};wd.prototype[Ia]=function(){return P(this)};yd;
function zd(a,b){this.yb=a;this.end=b;this.h=2;this.v=0}zd.prototype.add=function(a){this.yb[this.end]=a;return this.end+=1};zd.prototype.wa=function(){var a=new yd(this.yb,0,this.end);this.yb=null;return a};zd.prototype.U=function(){return this.end};function yd(a,b,c){this.c=a;this.aa=b;this.end=c;this.h=524306;this.v=0}f=yd.prototype;f.U=function(){return this.end-this.aa};f.S=function(a,b){return this.c[this.aa+b]};f.ia=function(a,b,c){return 0<=b&&b<this.end-this.aa?this.c[this.aa+b]:c};
f.Fb=function(){if(this.aa===this.end)throw Error("-drop-first of empty chunk");return new yd(this.c,this.aa+1,this.end)};f.X=function(a,b){return zc(this.c,b,this.c[this.aa],this.aa+1)};f.Y=function(a,b,c){return zc(this.c,b,c,this.aa)};function Vc(a,b,c,d){this.wa=a;this.sa=b;this.l=c;this.m=d;this.h=31850732;this.v=1536}f=Vc.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};f.K=function(){return this.l};
f.ca=function(){if(1<Qa(this.wa))return new Vc(Hb(this.wa),this.sa,this.l,null);var a=vb(this.sa);return null==a?null:a};f.H=function(){var a=this.m;return null!=a?a:this.m=a=kc(this)};f.o=function(a,b){return pc(this,b)};f.T=function(){return qc(N,this.l)};f.V=function(){return D.a(this.wa,0)};f.$=function(){return 1<Qa(this.wa)?new Vc(Hb(this.wa),this.sa,this.l,null):null==this.sa?N:this.sa};f.M=function(){return this};f.Bb=function(){return this.wa};f.Cb=function(){return null==this.sa?N:this.sa};
f.N=function(a,b){return new Vc(this.wa,this.sa,b,this.m)};f.O=function(a,b){return Q(b,this)};f.Ab=function(){return null==this.sa?null:this.sa};Vc.prototype[Ia]=function(){return P(this)};function Ad(a,b){return 0===Qa(a)?b:new Vc(a,b,null,null)}function Bd(a,b){a.add(b)}function pd(a){return Ib(a)}function qd(a){return Jb(a)}function ed(a){for(var b=[];;)if(t(a))b.push(L(a)),a=O(a);else return b}
function Cd(a,b){if(Dc(a))return T(a);for(var c=a,d=b,e=0;;)if(0<d&&t(c))c=O(c),--d,e+=1;else return e}var Dd=function Dd(b){return null==b?null:null==O(b)?t(L(b)):Q(L(b),Dd(O(b)))},Ed=function Ed(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return Ed.C();case 1:return Ed.b(arguments[0]);case 2:return Ed.a(arguments[0],arguments[1]);default:return c=new Ba(c.slice(2),0),Ed.s(arguments[0],arguments[1],c)}};
Ed.C=function(){return new wd(null,function(){return null},null,null)};Ed.b=function(a){return new wd(null,function(){return a},null,null)};Ed.a=function(a,b){return new wd(null,function(){var c=t(a);return c?Xc(c)?Ad(Ib(c),Ed.a(Jb(c),b)):Q(L(c),Ed.a(fc(c),b)):b},null,null)};Ed.s=function(a,b,c){return function e(a,b){return new wd(null,function(){var c=t(a);return c?Xc(c)?Ad(Ib(c),e(Jb(c),b)):Q(L(c),e(fc(c),b)):v(b)?e(L(b),O(b)):null},null,null)}(Ed.a(a,b),c)};
Ed.P=function(a){var b=L(a),c=O(a);a=L(c);c=O(c);return Ed.s(b,a,c)};Ed.w=2;var Fd=function Fd(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return Fd.C();case 1:return Fd.b(arguments[0]);case 2:return Fd.a(arguments[0],arguments[1]);default:return c=new Ba(c.slice(2),0),Fd.s(arguments[0],arguments[1],c)}};Fd.C=function(){return Ab(Hc)};Fd.b=function(a){return a};Fd.a=function(a,b){return Bb(a,b)};
Fd.s=function(a,b,c){for(;;)if(a=Bb(a,b),v(c))b=L(c),c=O(c);else return a};Fd.P=function(a){var b=L(a),c=O(a);a=L(c);c=O(c);return Fd.s(b,a,c)};Fd.w=2;
function Gd(a,b,c){var d=t(c);if(0===b)return a.C?a.C():a.call(null);c=Wa(d);var e=Xa(d);if(1===b)return a.b?a.b(c):a.b?a.b(c):a.call(null,c);var d=Wa(e),g=Xa(e);if(2===b)return a.a?a.a(c,d):a.a?a.a(c,d):a.call(null,c,d);var e=Wa(g),h=Xa(g);if(3===b)return a.f?a.f(c,d,e):a.f?a.f(c,d,e):a.call(null,c,d,e);var g=Wa(h),k=Xa(h);if(4===b)return a.u?a.u(c,d,e,g):a.u?a.u(c,d,e,g):a.call(null,c,d,e,g);var h=Wa(k),l=Xa(k);if(5===b)return a.W?a.W(c,d,e,g,h):a.W?a.W(c,d,e,g,h):a.call(null,c,d,e,g,h);var k=Wa(l),
n=Xa(l);if(6===b)return a.la?a.la(c,d,e,g,h,k):a.la?a.la(c,d,e,g,h,k):a.call(null,c,d,e,g,h,k);var l=Wa(n),p=Xa(n);if(7===b)return a.ma?a.ma(c,d,e,g,h,k,l):a.ma?a.ma(c,d,e,g,h,k,l):a.call(null,c,d,e,g,h,k,l);var n=Wa(p),r=Xa(p);if(8===b)return a.Ia?a.Ia(c,d,e,g,h,k,l,n):a.Ia?a.Ia(c,d,e,g,h,k,l,n):a.call(null,c,d,e,g,h,k,l,n);var p=Wa(r),u=Xa(r);if(9===b)return a.Ja?a.Ja(c,d,e,g,h,k,l,n,p):a.Ja?a.Ja(c,d,e,g,h,k,l,n,p):a.call(null,c,d,e,g,h,k,l,n,p);var r=Wa(u),x=Xa(u);if(10===b)return a.xa?a.xa(c,
d,e,g,h,k,l,n,p,r):a.xa?a.xa(c,d,e,g,h,k,l,n,p,r):a.call(null,c,d,e,g,h,k,l,n,p,r);var u=Wa(x),z=Xa(x);if(11===b)return a.ya?a.ya(c,d,e,g,h,k,l,n,p,r,u):a.ya?a.ya(c,d,e,g,h,k,l,n,p,r,u):a.call(null,c,d,e,g,h,k,l,n,p,r,u);var x=Wa(z),E=Xa(z);if(12===b)return a.za?a.za(c,d,e,g,h,k,l,n,p,r,u,x):a.za?a.za(c,d,e,g,h,k,l,n,p,r,u,x):a.call(null,c,d,e,g,h,k,l,n,p,r,u,x);var z=Wa(E),A=Xa(E);if(13===b)return a.Aa?a.Aa(c,d,e,g,h,k,l,n,p,r,u,x,z):a.Aa?a.Aa(c,d,e,g,h,k,l,n,p,r,u,x,z):a.call(null,c,d,e,g,h,k,l,
n,p,r,u,x,z);var E=Wa(A),R=Xa(A);if(14===b)return a.Ba?a.Ba(c,d,e,g,h,k,l,n,p,r,u,x,z,E):a.Ba?a.Ba(c,d,e,g,h,k,l,n,p,r,u,x,z,E):a.call(null,c,d,e,g,h,k,l,n,p,r,u,x,z,E);var A=Wa(R),aa=Xa(R);if(15===b)return a.Ca?a.Ca(c,d,e,g,h,k,l,n,p,r,u,x,z,E,A):a.Ca?a.Ca(c,d,e,g,h,k,l,n,p,r,u,x,z,E,A):a.call(null,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A);var R=Wa(aa),oa=Xa(aa);if(16===b)return a.Da?a.Da(c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R):a.Da?a.Da(c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R):a.call(null,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R);
var aa=Wa(oa),Pa=Xa(oa);if(17===b)return a.Ea?a.Ea(c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa):a.Ea?a.Ea(c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa):a.call(null,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa);var oa=Wa(Pa),ub=Xa(Pa);if(18===b)return a.Fa?a.Fa(c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa,oa):a.Fa?a.Fa(c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa,oa):a.call(null,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa,oa);Pa=Wa(ub);ub=Xa(ub);if(19===b)return a.Ga?a.Ga(c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa,oa,Pa):a.Ga?a.Ga(c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,
aa,oa,Pa):a.call(null,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa,oa,Pa);var F=Wa(ub);Xa(ub);if(20===b)return a.Ha?a.Ha(c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa,oa,Pa,F):a.Ha?a.Ha(c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa,oa,Pa,F):a.call(null,c,d,e,g,h,k,l,n,p,r,u,x,z,E,A,R,aa,oa,Pa,F);throw Error("Only up to 20 arguments supported on functions");}
var Ka=function Ka(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return Ka.a(arguments[0],arguments[1]);case 3:return Ka.f(arguments[0],arguments[1],arguments[2]);case 4:return Ka.u(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return Ka.W(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:return c=new Ba(c.slice(5),0),Ka.s(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],c)}};
Ka.a=function(a,b){var c=a.w;if(a.P){var d=Cd(b,c+1);return d<=c?Gd(a,d,b):a.P(b)}return a.apply(a,ed(b))};Ka.f=function(a,b,c){b=Q(b,c);c=a.w;if(a.P){var d=Cd(b,c+1);return d<=c?Gd(a,d,b):a.P(b)}return a.apply(a,ed(b))};Ka.u=function(a,b,c,d){b=Q(b,Q(c,d));c=a.w;return a.P?(d=Cd(b,c+1),d<=c?Gd(a,d,b):a.P(b)):a.apply(a,ed(b))};Ka.W=function(a,b,c,d,e){b=Q(b,Q(c,Q(d,e)));c=a.w;return a.P?(d=Cd(b,c+1),d<=c?Gd(a,d,b):a.P(b)):a.apply(a,ed(b))};
Ka.s=function(a,b,c,d,e,g){b=Q(b,Q(c,Q(d,Q(e,Dd(g)))));c=a.w;return a.P?(d=Cd(b,c+1),d<=c?Gd(a,d,b):a.P(b)):a.apply(a,ed(b))};Ka.P=function(a){var b=L(a),c=O(a);a=L(c);var d=O(c),c=L(d),e=O(d),d=L(e),g=O(e),e=L(g),g=O(g);return Ka.s(b,a,c,d,e,g)};Ka.w=5;
var Hd=function Hd(){"undefined"===typeof ha&&(ha=function(b,c){this.tc=b;this.sc=c;this.h=393216;this.v=0},ha.prototype.N=function(b,c){return new ha(this.tc,c)},ha.prototype.K=function(){return this.sc},ha.prototype.Z=function(){return!1},ha.prototype.next=function(){return Error("No such element")},ha.prototype.remove=function(){return Error("Unsupported operation")},ha.Hc=function(){return new W(null,2,5,X,[qc(Id,new q(null,1,[Jd,Ub(Kd,Ub(Hc))],null)),ga.Gc],null)},ha.Kb=!0,ha.vb="cljs.core/t_cljs$core10017",
ha.nc=function(b){return G(b,"cljs.core/t_cljs$core10017")});return new ha(Hd,Ld)};Md;function Md(a,b,c,d){this.fb=a;this.first=b;this.ga=c;this.l=d;this.h=31719628;this.v=0}f=Md.prototype;f.N=function(a,b){return new Md(this.fb,this.first,this.ga,b)};f.O=function(a,b){return Q(b,vb(this))};f.T=function(){return N};f.o=function(a,b){return null!=vb(this)?pc(this,b):Sc(b)&&null==t(b)};f.H=function(){return kc(this)};f.M=function(){null!=this.fb&&this.fb.step(this);return null==this.ga?null:this};
f.V=function(){null!=this.fb&&vb(this);return null==this.ga?null:this.first};f.$=function(){null!=this.fb&&vb(this);return null==this.ga?N:this.ga};f.ca=function(){null!=this.fb&&vb(this);return null==this.ga?null:vb(this.ga)};Md.prototype[Ia]=function(){return P(this)};function Nd(a,b){for(;;){if(null==t(b))return!0;var c;c=L(b);c=a.b?a.b(c):a.call(null,c);if(v(c)){c=a;var d=O(b);a=c;b=d}else return!1}}
function Od(a){for(var b=gd;;)if(t(a)){var c;c=L(a);c=b.b?b.b(c):b.call(null,c);if(v(c))return c;a=O(a)}else return null}Pd;function Qd(a,b,c,d){this.state=a;this.l=b;this.wc=c;this.ac=d;this.v=16386;this.h=6455296}f=Qd.prototype;f.equiv=function(a){return this.o(null,a)};f.o=function(a,b){return this===b};f.rb=function(){return this.state};f.K=function(){return this.l};
f.Ib=function(a,b,c){a=t(this.ac);for(var d=null,e=0,g=0;;)if(g<e){var h=d.S(null,g),k=U(h,0),h=U(h,1);h.u?h.u(k,this,b,c):h.call(null,k,this,b,c);g+=1}else if(a=t(a))Xc(a)?(d=Ib(a),a=Jb(a),k=d,e=T(d),d=k):(d=L(a),k=U(d,0),h=U(d,1),h.u?h.u(k,this,b,c):h.call(null,k,this,b,c),a=O(a),d=null,e=0),g=0;else return null};f.H=function(){return this[ba]||(this[ba]=++ca)};
var Rd=function Rd(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return Rd.b(arguments[0]);default:return c=new Ba(c.slice(1),0),Rd.s(arguments[0],c)}};Rd.b=function(a){return new Qd(a,null,null,null)};Rd.s=function(a,b){var c=null!=b&&(b.h&64||b.kb)?Ka.a(oc,b):b,d=J.a(c,sa),c=J.a(c,Sd);return new Qd(a,d,c,null)};Rd.P=function(a){var b=L(a);a=O(a);return Rd.s(b,a)};Rd.w=1;Td;
function Ud(a,b){if(a instanceof Qd){var c=a.wc;if(null!=c&&!v(c.b?c.b(b):c.call(null,b)))throw Error([C("Assert failed: "),C("Validator rejected reference state"),C("\n"),C(function(){var a=Ub(Wd,Xd);return Td.b?Td.b(a):Td.call(null,a)}())].join(""));c=a.state;a.state=b;null!=a.ac&&zb(a,c,b);return b}return Lb(a,b)}function Yd(a){this.state=a;this.h=32768;this.v=0}Yd.prototype.rb=function(){return this.state};function Pd(a){return new Yd(a)}
var ld=function ld(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return ld.b(arguments[0]);case 2:return ld.a(arguments[0],arguments[1]);case 3:return ld.f(arguments[0],arguments[1],arguments[2]);case 4:return ld.u(arguments[0],arguments[1],arguments[2],arguments[3]);default:return c=new Ba(c.slice(4),0),ld.s(arguments[0],arguments[1],arguments[2],arguments[3],c)}};
ld.b=function(a){return function(b){return function(){function c(c,d){var e=a.b?a.b(d):a.call(null,d);return b.a?b.a(c,e):b.call(null,c,e)}function d(a){return b.b?b.b(a):b.call(null,a)}function e(){return b.C?b.C():b.call(null)}var g=null,h=function(){function c(a,b,e){var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new Ba(h,0)}return d.call(this,a,b,g)}function d(c,e,g){e=Ka.f(a,e,g);return b.a?b.a(c,e):b.call(null,c,e)}c.w=2;c.P=function(a){var b=
L(a);a=O(a);var c=L(a);a=fc(a);return d(b,c,a)};c.s=d;return c}(),g=function(a,b,g){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b);default:var p=null;if(2<arguments.length){for(var p=0,r=Array(arguments.length-2);p<r.length;)r[p]=arguments[p+2],++p;p=new Ba(r,0)}return h.s(a,b,p)}throw Error("Invalid arity: "+arguments.length);};g.w=2;g.P=h.P;g.C=e;g.b=d;g.a=c;g.s=h.s;return g}()}};
ld.a=function(a,b){return new wd(null,function(){var c=t(b);if(c){if(Xc(c)){for(var d=Ib(c),e=T(d),g=new zd(Array(e),0),h=0;;)if(h<e)Bd(g,function(){var b=D.a(d,h);return a.b?a.b(b):a.call(null,b)}()),h+=1;else break;return Ad(g.wa(),ld.a(a,Jb(c)))}return Q(function(){var b=L(c);return a.b?a.b(b):a.call(null,b)}(),ld.a(a,fc(c)))}return null},null,null)};
ld.f=function(a,b,c){return new wd(null,function(){var d=t(b),e=t(c);if(d&&e){var g=Q,h;h=L(d);var k=L(e);h=a.a?a.a(h,k):a.call(null,h,k);d=g(h,ld.f(a,fc(d),fc(e)))}else d=null;return d},null,null)};ld.u=function(a,b,c,d){return new wd(null,function(){var e=t(b),g=t(c),h=t(d);if(e&&g&&h){var k=Q,l;l=L(e);var n=L(g),p=L(h);l=a.f?a.f(l,n,p):a.call(null,l,n,p);e=k(l,ld.u(a,fc(e),fc(g),fc(h)))}else e=null;return e},null,null)};
ld.s=function(a,b,c,d,e){var g=function k(a){return new wd(null,function(){var b=ld.a(t,a);return Nd(gd,b)?Q(ld.a(L,b),k(ld.a(fc,b))):null},null,null)};return ld.a(function(){return function(b){return Ka.a(a,b)}}(g),g(Gc.s(e,d,K([c,b],0))))};ld.P=function(a){var b=L(a),c=O(a);a=L(c);var d=O(c),c=L(d),e=O(d),d=L(e),e=O(e);return ld.s(b,a,c,d,e)};ld.w=4;
function Zd(a,b){if("number"!==typeof a)throw Error([C("Assert failed: "),C(function(){var a=Ub($d,ae);return Td.b?Td.b(a):Td.call(null,a)}())].join(""));return new wd(null,function(){if(0<a){var c=t(b);return c?Q(L(c),Zd(a-1,fc(c))):null}return null},null,null)}function be(a){return new wd(null,function(){return Q(a.C?a.C():a.call(null),be(a))},null,null)}function ce(a,b){return Zd(a,be(b))}de;
function ee(a,b){var c;null!=a?null!=a&&(a.v&4||a.zc)?(c=La.f(Bb,Ab(a),b),c=Cb(c),c=qc(c,Qc(a))):c=La.f(Ta,a,b):c=La.f(Gc,N,b);return c}function fe(a,b){this.I=a;this.c=b}function ge(a){return new fe(a,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null])}function he(a){a=a.j;return 32>a?0:a-1>>>5<<5}function ie(a,b,c){for(;;){if(0===b)return c;var d=ge(a);d.c[0]=c;c=d;b-=5}}
var je=function je(b,c,d,e){var g=new fe(d.I,Ja(d.c)),h=b.j-1>>>c&31;5===c?g.c[h]=e:(d=d.c[h],b=null!=d?je(b,c-5,d,e):ie(null,c-5,e),g.c[h]=b);return g};function ke(a,b){throw Error([C("No item "),C(a),C(" in vector of length "),C(b)].join(""));}function le(a,b){if(b>=he(a))return a.da;for(var c=a.root,d=a.shift;;)if(0<d)var e=d-5,c=c.c[b>>>d&31],d=e;else return c.c}function me(a,b){return 0<=b&&b<a.j?le(a,b):ke(b,a.j)}
var ne=function ne(b,c,d,e,g){var h=new fe(d.I,Ja(d.c));if(0===c)h.c[e&31]=g;else{var k=e>>>c&31;b=ne(b,c-5,d.c[k],e,g);h.c[k]=b}return h};function oe(a,b,c,d,e,g){this.i=a;this.xb=b;this.c=c;this.ua=d;this.start=e;this.end=g}oe.prototype.Z=function(){return this.i<this.end};oe.prototype.next=function(){32===this.i-this.xb&&(this.c=le(this.ua,this.i),this.xb+=32);var a=this.c[this.i&31];this.i+=1;return a};pe;qe;re;rc;se;Y;te;
function W(a,b,c,d,e,g){this.l=a;this.j=b;this.shift=c;this.root=d;this.da=e;this.m=g;this.h=167668511;this.v=8196}f=W.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};f.G=function(a,b){return $a.f(this,b,null)};f.D=function(a,b,c){return"number"===typeof b?D.f(this,b,c):c};f.S=function(a,b){return me(this,b)[b&31]};f.ia=function(a,b,c){return 0<=b&&b<this.j?le(this,b)[b&31]:c};
f.Ta=function(a,b,c){if(0<=b&&b<this.j)return he(this)<=b?(a=Ja(this.da),a[b&31]=c,new W(this.l,this.j,this.shift,this.root,a,null)):new W(this.l,this.j,this.shift,ne(this,this.shift,this.root,b,c),this.da,null);if(b===this.j)return Ta(this,c);throw Error([C("Index "),C(b),C(" out of bounds  [0,"),C(this.j),C("]")].join(""));};f.na=function(){var a=this.j;return new oe(0,0,0<T(this)?le(this,0):null,this,0,a)};f.K=function(){return this.l};f.U=function(){return this.j};
f.ib=function(){return D.a(this,0)};f.jb=function(){return D.a(this,1)};f.H=function(){var a=this.m;return null!=a?a:this.m=a=kc(this)};f.o=function(a,b){if(b instanceof W)if(this.j===T(b))for(var c=Mb(this),d=Mb(b);;)if(v(c.Z())){var e=c.next(),g=d.next();if(!I.a(e,g))return!1}else return!0;else return!1;else return pc(this,b)};f.Za=function(){return new re(this.j,this.shift,pe.b?pe.b(this.root):pe.call(null,this.root),qe.b?qe.b(this.da):qe.call(null,this.da))};f.T=function(){return qc(Hc,this.l)};
f.X=function(a,b){return vc(this,b)};f.Y=function(a,b,c){a=0;for(var d=c;;)if(a<this.j){var e=le(this,a);c=e.length;a:for(var g=0;;)if(g<c){var h=e[g],d=b.a?b.a(d,h):b.call(null,d,h);if(uc(d)){e=d;break a}g+=1}else{e=d;break a}if(uc(e))return rc.b?rc.b(e):rc.call(null,e);a+=c;d=e}else return d};f.Oa=function(a,b,c){if("number"===typeof b)return jb(this,b,c);throw Error("Vector's key for assoc must be a number.");};
f.M=function(){if(0===this.j)return null;if(32>=this.j)return new Ba(this.da,0);var a;a:{a=this.root;for(var b=this.shift;;)if(0<b)b-=5,a=a.c[0];else{a=a.c;break a}}return te.u?te.u(this,a,0,0):te.call(null,this,a,0,0)};f.N=function(a,b){return new W(b,this.j,this.shift,this.root,this.da,this.m)};
f.O=function(a,b){if(32>this.j-he(this)){for(var c=this.da.length,d=Array(c+1),e=0;;)if(e<c)d[e]=this.da[e],e+=1;else break;d[c]=b;return new W(this.l,this.j+1,this.shift,this.root,d,null)}c=(d=this.j>>>5>1<<this.shift)?this.shift+5:this.shift;d?(d=ge(null),d.c[0]=this.root,e=ie(null,this.shift,new fe(null,this.da)),d.c[1]=e):d=je(this,this.shift,this.root,new fe(null,this.da));return new W(this.l,this.j+1,c,d,[b],null)};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.S(null,c);case 3:return this.ia(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.S(null,c)};a.f=function(a,c,d){return this.ia(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ja(b)))};f.b=function(a){return this.S(null,a)};f.a=function(a,b){return this.ia(null,a,b)};
var X=new fe(null,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]),Hc=new W(null,0,5,X,[],lc);W.prototype[Ia]=function(){return P(this)};function fd(a){if(Da(a))a:{var b=a.length;if(32>b)a=new W(null,b,5,X,a,null);else for(var c=a.slice(0,32),d=32,e=(new W(null,32,5,X,c,null)).Za(null);;)if(d<b)c=d+1,e=Fd.a(e,a[d]),d=c;else{a=Cb(e);break a}}else a=Cb(La.f(Bb,Ab(Hc),a));return a}ue;
function Wc(a,b,c,d,e,g){this.ka=a;this.node=b;this.i=c;this.aa=d;this.l=e;this.m=g;this.h=32375020;this.v=1536}f=Wc.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};f.K=function(){return this.l};f.ca=function(){if(this.aa+1<this.node.length){var a;a=this.ka;var b=this.node,c=this.i,d=this.aa+1;a=te.u?te.u(a,b,c,d):te.call(null,a,b,c,d);return null==a?null:a}return Kb(this)};f.H=function(){var a=this.m;return null!=a?a:this.m=a=kc(this)};
f.o=function(a,b){return pc(this,b)};f.T=function(){return qc(Hc,this.l)};f.X=function(a,b){var c;c=this.ka;var d=this.i+this.aa,e=T(this.ka);c=ue.f?ue.f(c,d,e):ue.call(null,c,d,e);return vc(c,b)};f.Y=function(a,b,c){a=this.ka;var d=this.i+this.aa,e=T(this.ka);a=ue.f?ue.f(a,d,e):ue.call(null,a,d,e);return wc(a,b,c)};f.V=function(){return this.node[this.aa]};
f.$=function(){if(this.aa+1<this.node.length){var a;a=this.ka;var b=this.node,c=this.i,d=this.aa+1;a=te.u?te.u(a,b,c,d):te.call(null,a,b,c,d);return null==a?N:a}return Jb(this)};f.M=function(){return this};f.Bb=function(){var a=this.node;return new yd(a,this.aa,a.length)};f.Cb=function(){var a=this.i+this.node.length;if(a<Qa(this.ka)){var b=this.ka,c=le(this.ka,a);return te.u?te.u(b,c,a,0):te.call(null,b,c,a,0)}return N};
f.N=function(a,b){return te.W?te.W(this.ka,this.node,this.i,this.aa,b):te.call(null,this.ka,this.node,this.i,this.aa,b)};f.O=function(a,b){return Q(b,this)};f.Ab=function(){var a=this.i+this.node.length;if(a<Qa(this.ka)){var b=this.ka,c=le(this.ka,a);return te.u?te.u(b,c,a,0):te.call(null,b,c,a,0)}return null};Wc.prototype[Ia]=function(){return P(this)};
var te=function te(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 3:return te.f(arguments[0],arguments[1],arguments[2]);case 4:return te.u(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return te.W(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};te.f=function(a,b,c){return new Wc(a,me(a,b),b,c,null,null)};
te.u=function(a,b,c,d){return new Wc(a,b,c,d,null,null)};te.W=function(a,b,c,d,e){return new Wc(a,b,c,d,e,null)};te.w=5;ve;function we(a,b,c,d,e){this.l=a;this.ua=b;this.start=c;this.end=d;this.m=e;this.h=167666463;this.v=8192}f=we.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};f.G=function(a,b){return $a.f(this,b,null)};f.D=function(a,b,c){return"number"===typeof b?D.f(this,b,c):c};
f.S=function(a,b){return 0>b||this.end<=this.start+b?ke(b,this.end-this.start):D.a(this.ua,this.start+b)};f.ia=function(a,b,c){return 0>b||this.end<=this.start+b?c:D.f(this.ua,this.start+b,c)};f.Ta=function(a,b,c){var d=this.start+b;a=this.l;c=Mc.f(this.ua,d,c);b=this.start;var e=this.end,d=d+1,d=e>d?e:d;return ve.W?ve.W(a,c,b,d,null):ve.call(null,a,c,b,d,null)};f.K=function(){return this.l};f.U=function(){return this.end-this.start};f.H=function(){var a=this.m;return null!=a?a:this.m=a=kc(this)};
f.o=function(a,b){return pc(this,b)};f.T=function(){return qc(Hc,this.l)};f.X=function(a,b){return vc(this,b)};f.Y=function(a,b,c){return wc(this,b,c)};f.Oa=function(a,b,c){if("number"===typeof b)return jb(this,b,c);throw Error("Subvec's key for assoc must be a number.");};f.M=function(){var a=this;return function(b){return function d(e){return e===a.end?null:Q(D.a(a.ua,e),new wd(null,function(){return function(){return d(e+1)}}(b),null,null))}}(this)(a.start)};
f.N=function(a,b){return ve.W?ve.W(b,this.ua,this.start,this.end,this.m):ve.call(null,b,this.ua,this.start,this.end,this.m)};f.O=function(a,b){var c=this.l,d=jb(this.ua,this.end,b),e=this.start,g=this.end+1;return ve.W?ve.W(c,d,e,g,null):ve.call(null,c,d,e,g,null)};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.S(null,c);case 3:return this.ia(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.S(null,c)};a.f=function(a,c,d){return this.ia(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ja(b)))};f.b=function(a){return this.S(null,a)};f.a=function(a,b){return this.ia(null,a,b)};we.prototype[Ia]=function(){return P(this)};
function ve(a,b,c,d,e){for(;;)if(b instanceof we)c=b.start+c,d=b.start+d,b=b.ua;else{var g=T(b);if(0>c||0>d||c>g||d>g)throw Error("Index out of bounds");return new we(a,b,c,d,e)}}var ue=function ue(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return ue.a(arguments[0],arguments[1]);case 3:return ue.f(arguments[0],arguments[1],arguments[2]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};
ue.a=function(a,b){return ue.f(a,b,T(a))};ue.f=function(a,b,c){return ve(null,a,b,c,null)};ue.w=3;function xe(a,b){return a===b.I?b:new fe(a,Ja(b.c))}function pe(a){return new fe({},Ja(a.c))}function qe(a){var b=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];Zc(a,0,b,0,a.length);return b}
var ye=function ye(b,c,d,e){d=xe(b.root.I,d);var g=b.j-1>>>c&31;if(5===c)b=e;else{var h=d.c[g];b=null!=h?ye(b,c-5,h,e):ie(b.root.I,c-5,e)}d.c[g]=b;return d};function re(a,b,c,d){this.j=a;this.shift=b;this.root=c;this.da=d;this.v=88;this.h=275}f=re.prototype;
f.Sa=function(a,b){if(this.root.I){if(32>this.j-he(this))this.da[this.j&31]=b;else{var c=new fe(this.root.I,this.da),d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];d[0]=b;this.da=d;if(this.j>>>5>1<<this.shift){var d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],e=this.shift+
5;d[0]=this.root;d[1]=ie(this.root.I,this.shift,c);this.root=new fe(this.root.I,d);this.shift=e}else this.root=ye(this,this.shift,this.root,c)}this.j+=1;return this}throw Error("conj! after persistent!");};f.$a=function(){if(this.root.I){this.root.I=null;var a=this.j-he(this),b=Array(a);Zc(this.da,0,b,0,a);return new W(null,this.j,this.shift,this.root,b,null)}throw Error("persistent! called twice");};
f.lb=function(a,b,c){if("number"===typeof b)return Eb(this,b,c);throw Error("TransientVector's key for assoc! must be a number.");};
f.Hb=function(a,b,c){var d=this;if(d.root.I){if(0<=b&&b<d.j)return he(this)<=b?d.da[b&31]=c:(a=function(){return function g(a,k){var l=xe(d.root.I,k);if(0===a)l.c[b&31]=c;else{var n=b>>>a&31,p=g(a-5,l.c[n]);l.c[n]=p}return l}}(this).call(null,d.shift,d.root),d.root=a),this;if(b===d.j)return Bb(this,c);throw Error([C("Index "),C(b),C(" out of bounds for TransientVector of length"),C(d.j)].join(""));}throw Error("assoc! after persistent!");};
f.U=function(){if(this.root.I)return this.j;throw Error("count after persistent!");};f.S=function(a,b){if(this.root.I)return me(this,b)[b&31];throw Error("nth after persistent!");};f.ia=function(a,b,c){return 0<=b&&b<this.j?D.a(this,b):c};f.G=function(a,b){return $a.f(this,b,null)};f.D=function(a,b,c){return"number"===typeof b?D.f(this,b,c):c};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.G(null,c);case 3:return this.D(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.G(null,c)};a.f=function(a,c,d){return this.D(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ja(b)))};f.b=function(a){return this.G(null,a)};f.a=function(a,b){return this.D(null,a,b)};function ze(a,b){this.cb=a;this.pb=b}
ze.prototype.Z=function(){var a=null!=this.cb&&t(this.cb);return a?a:(a=null!=this.pb)?this.pb.Z():a};ze.prototype.next=function(){if(null!=this.cb){var a=L(this.cb);this.cb=O(this.cb);return a}if(null!=this.pb&&this.pb.Z())return this.pb.next();throw Error("No such element");};ze.prototype.remove=function(){return Error("Unsupported operation")};function Ae(a,b,c,d){this.l=a;this.oa=b;this.La=c;this.m=d;this.h=31850572;this.v=0}f=Ae.prototype;f.toString=function(){return Ob(this)};
f.equiv=function(a){return this.o(null,a)};f.K=function(){return this.l};f.H=function(){var a=this.m;return null!=a?a:this.m=a=kc(this)};f.o=function(a,b){return pc(this,b)};f.T=function(){return qc(N,this.l)};f.V=function(){return L(this.oa)};f.$=function(){var a=O(this.oa);return a?new Ae(this.l,a,this.La,null):null==this.La?Ra(this):new Ae(this.l,this.La,null,null)};f.M=function(){return this};f.N=function(a,b){return new Ae(b,this.oa,this.La,this.m)};f.O=function(a,b){return Q(b,this)};
Ae.prototype[Ia]=function(){return P(this)};function Be(a,b,c,d,e){this.l=a;this.count=b;this.oa=c;this.La=d;this.m=e;this.h=31858766;this.v=8192}f=Be.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};f.na=function(){return new ze(this.oa,Mb(this.La))};f.K=function(){return this.l};f.U=function(){return this.count};f.H=function(){var a=this.m;return null!=a?a:this.m=a=kc(this)};f.o=function(a,b){return pc(this,b)};f.T=function(){return qc(Ce,this.l)};
f.V=function(){return L(this.oa)};f.$=function(){return fc(t(this))};f.M=function(){var a=t(this.La),b=this.oa;return v(v(b)?b:a)?new Ae(null,this.oa,t(a),null):null};f.N=function(a,b){return new Be(b,this.count,this.oa,this.La,this.m)};f.O=function(a,b){var c;v(this.oa)?(c=this.La,c=new Be(this.l,this.count+1,this.oa,Gc.a(v(c)?c:Hc,b),null)):c=new Be(this.l,this.count+1,Gc.a(this.oa,b),Hc,null);return c};var Ce=new Be(null,0,null,Hc,lc);Be.prototype[Ia]=function(){return P(this)};
function De(){this.h=2097152;this.v=0}De.prototype.equiv=function(a){return this.o(null,a)};De.prototype.o=function(){return!1};var Ee=new De;function Fe(a,b){return ad(Tc(b)?T(a)===T(b)?Nd(gd,ld.a(function(a){return I.a(J.f(b,L(a),Ee),L(O(a)))},a)):null:null)}function Ge(a,b,c,d,e){this.i=a;this.uc=b;this.Eb=c;this.rc=d;this.Lb=e}Ge.prototype.Z=function(){var a=this.i<this.Eb;return a?a:this.Lb.Z()};
Ge.prototype.next=function(){if(this.i<this.Eb){var a=Kc(this.rc,this.i);this.i+=1;return new W(null,2,5,X,[a,$a.a(this.uc,a)],null)}return this.Lb.next()};Ge.prototype.remove=function(){return Error("Unsupported operation")};function He(a){this.A=a}He.prototype.next=function(){if(null!=this.A){var a=L(this.A),b=U(a,0),a=U(a,1);this.A=O(this.A);return{value:[b,a],done:!1}}return{value:null,done:!0}};function Ie(a){return new He(t(a))}function Je(a){this.A=a}
Je.prototype.next=function(){if(null!=this.A){var a=L(this.A);this.A=O(this.A);return{value:[a,a],done:!1}}return{value:null,done:!0}};
function Ke(a,b){var c;if(b instanceof w)a:{c=a.length;for(var d=b.ba,e=0;;){if(c<=e){c=-1;break a}if(a[e]instanceof w&&d===a[e].ba){c=e;break a}e+=2}}else if("string"==typeof b||"number"===typeof b)a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(b===a[d]){c=d;break a}d+=2}else if(b instanceof Vb)a:for(c=a.length,d=b.ta,e=0;;){if(c<=e){c=-1;break a}if(a[e]instanceof Vb&&d===a[e].ta){c=e;break a}e+=2}else if(null==b)a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(null==a[d]){c=d;break a}d+=2}else a:for(c=
a.length,d=0;;){if(c<=d){c=-1;break a}if(I.a(b,a[d])){c=d;break a}d+=2}return c}Le;function Me(a,b,c){this.c=a;this.i=b;this.ha=c;this.h=32374990;this.v=0}f=Me.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};f.K=function(){return this.ha};f.ca=function(){return this.i<this.c.length-2?new Me(this.c,this.i+2,this.ha):null};f.U=function(){return(this.c.length-this.i)/2};f.H=function(){return kc(this)};f.o=function(a,b){return pc(this,b)};
f.T=function(){return qc(N,this.ha)};f.X=function(a,b){return S.a(b,this)};f.Y=function(a,b,c){return S.f(b,c,this)};f.V=function(){return new W(null,2,5,X,[this.c[this.i],this.c[this.i+1]],null)};f.$=function(){return this.i<this.c.length-2?new Me(this.c,this.i+2,this.ha):N};f.M=function(){return this};f.N=function(a,b){return new Me(this.c,this.i,b)};f.O=function(a,b){return Q(b,this)};Me.prototype[Ia]=function(){return P(this)};Ne;Oe;function Pe(a,b,c){this.c=a;this.i=b;this.j=c}
Pe.prototype.Z=function(){return this.i<this.j};Pe.prototype.next=function(){var a=new W(null,2,5,X,[this.c[this.i],this.c[this.i+1]],null);this.i+=2;return a};function q(a,b,c,d){this.l=a;this.j=b;this.c=c;this.m=d;this.h=16647951;this.v=8196}f=q.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};f.keys=function(){return P(Ne.b?Ne.b(this):Ne.call(null,this))};f.entries=function(){return Ie(t(this))};
f.values=function(){return P(Oe.b?Oe.b(this):Oe.call(null,this))};f.has=function(a){return bd(this,a)};f.get=function(a,b){return this.D(null,a,b)};f.forEach=function(a){for(var b=t(this),c=null,d=0,e=0;;)if(e<d){var g=c.S(null,e),h=U(g,0),g=U(g,1);a.a?a.a(g,h):a.call(null,g,h);e+=1}else if(b=t(b))Xc(b)?(c=Ib(b),b=Jb(b),h=c,d=T(c),c=h):(c=L(b),h=U(c,0),g=U(c,1),a.a?a.a(g,h):a.call(null,g,h),b=O(b),c=null,d=0),e=0;else return null};f.G=function(a,b){return $a.f(this,b,null)};
f.D=function(a,b,c){a=Ke(this.c,b);return-1===a?c:this.c[a+1]};f.na=function(){return new Pe(this.c,0,2*this.j)};f.K=function(){return this.l};f.U=function(){return this.j};f.H=function(){var a=this.m;return null!=a?a:this.m=a=mc(this)};f.o=function(a,b){if(null!=b&&(b.h&1024||b.gc)){var c=this.c.length;if(this.j===b.U(null))for(var d=0;;)if(d<c){var e=b.D(null,this.c[d],$c);if(e!==$c)if(I.a(this.c[d+1],e))d+=2;else return!1;else return!1}else return!0;else return!1}else return Fe(this,b)};
f.Za=function(){return new Le({},this.c.length,Ja(this.c))};f.T=function(){return ob(Ld,this.l)};f.X=function(a,b){return S.a(b,this)};f.Y=function(a,b,c){return S.f(b,c,this)};f.tb=function(a,b){if(0<=Ke(this.c,b)){var c=this.c.length,d=c-2;if(0===d)return Ra(this);for(var d=Array(d),e=0,g=0;;){if(e>=c)return new q(this.l,this.j-1,d,null);I.a(b,this.c[e])||(d[g]=this.c[e],d[g+1]=this.c[e+1],g+=2);e+=2}}else return this};
f.Oa=function(a,b,c){a=Ke(this.c,b);if(-1===a){if(this.j<Qe){a=this.c;for(var d=a.length,e=Array(d+2),g=0;;)if(g<d)e[g]=a[g],g+=1;else break;e[d]=b;e[d+1]=c;return new q(this.l,this.j+1,e,null)}return ob(bb(ee(Re,this),b,c),this.l)}if(c===this.c[a+1])return this;b=Ja(this.c);b[a+1]=c;return new q(this.l,this.j,b,null)};f.zb=function(a,b){return-1!==Ke(this.c,b)};f.M=function(){var a=this.c;return 0<=a.length-2?new Me(a,0,null):null};f.N=function(a,b){return new q(b,this.j,this.c,this.m)};
f.O=function(a,b){if(Uc(b))return bb(this,D.a(b,0),D.a(b,1));for(var c=this,d=t(b);;){if(null==d)return c;var e=L(d);if(Uc(e))c=bb(c,D.a(e,0),D.a(e,1)),d=O(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.G(null,c);case 3:return this.D(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.G(null,c)};a.f=function(a,c,d){return this.D(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ja(b)))};f.b=function(a){return this.G(null,a)};f.a=function(a,b){return this.D(null,a,b)};var Ld=new q(null,0,[],nc),Qe=8;q.prototype[Ia]=function(){return P(this)};
Se;function Le(a,b,c){this.ab=a;this.Wa=b;this.c=c;this.h=258;this.v=56}f=Le.prototype;f.U=function(){if(v(this.ab))return jd(this.Wa);throw Error("count after persistent!");};f.G=function(a,b){return $a.f(this,b,null)};f.D=function(a,b,c){if(v(this.ab))return a=Ke(this.c,b),-1===a?c:this.c[a+1];throw Error("lookup after persistent!");};
f.Sa=function(a,b){if(v(this.ab)){if(null!=b?b.h&2048||b.hc||(b.h?0:y(eb,b)):y(eb,b))return Db(this,nd.b?nd.b(b):nd.call(null,b),od.b?od.b(b):od.call(null,b));for(var c=t(b),d=this;;){var e=L(c);if(v(e))c=O(c),d=Db(d,nd.b?nd.b(e):nd.call(null,e),od.b?od.b(e):od.call(null,e));else return d}}else throw Error("conj! after persistent!");};f.$a=function(){if(v(this.ab))return this.ab=!1,new q(null,jd(this.Wa),this.c,null);throw Error("persistent! called twice");};
f.lb=function(a,b,c){if(v(this.ab)){a=Ke(this.c,b);if(-1===a){if(this.Wa+2<=2*Qe)return this.Wa+=2,this.c.push(b),this.c.push(c),this;a=Se.a?Se.a(this.Wa,this.c):Se.call(null,this.Wa,this.c);return Db(a,b,c)}c!==this.c[a+1]&&(this.c[a+1]=c);return this}throw Error("assoc! after persistent!");};Ue;Lc;function Se(a,b){for(var c=Ab(Re),d=0;;)if(d<a)c=Db(c,b[d],b[d+1]),d+=2;else return c}function Ve(){this.J=!1}We;Xe;Ud;Ye;Rd;rc;function Ze(a,b){return a===b?!0:ud(a,b)?!0:I.a(a,b)}
function $e(a,b,c){a=Ja(a);a[b]=c;return a}function af(a,b){var c=Array(a.length-2);Zc(a,0,c,0,2*b);Zc(a,2*(b+1),c,2*b,c.length-2*b);return c}function bf(a,b,c,d){a=a.Ua(b);a.c[c]=d;return a}cf;function df(a,b,c,d){this.c=a;this.i=b;this.ob=c;this.ra=d}df.prototype.advance=function(){for(var a=this.c.length;;)if(this.i<a){var b=this.c[this.i],c=this.c[this.i+1];null!=b?b=this.ob=new W(null,2,5,X,[b,c],null):null!=c?(b=Mb(c),b=b.Z()?this.ra=b:!1):b=!1;this.i+=2;if(b)return!0}else return!1};
df.prototype.Z=function(){var a=null!=this.ob;return a?a:(a=null!=this.ra)?a:this.advance()};df.prototype.next=function(){if(null!=this.ob){var a=this.ob;this.ob=null;return a}if(null!=this.ra)return a=this.ra.next(),this.ra.Z()||(this.ra=null),a;if(this.advance())return this.next();throw Error("No such element");};df.prototype.remove=function(){return Error("Unsupported operation")};function ef(a,b,c){this.I=a;this.R=b;this.c=c}f=ef.prototype;
f.Ua=function(a){if(a===this.I)return this;var b=kd(this.R),c=Array(0>b?4:2*(b+1));Zc(this.c,0,c,0,2*b);return new ef(a,this.R,c)};f.mb=function(){return We.b?We.b(this.c):We.call(null,this.c)};f.Pa=function(a,b,c,d){var e=1<<(b>>>a&31);if(0===(this.R&e))return d;var g=kd(this.R&e-1),e=this.c[2*g],g=this.c[2*g+1];return null==e?g.Pa(a+5,b,c,d):Ze(c,e)?g:d};
f.qa=function(a,b,c,d,e,g){var h=1<<(c>>>b&31),k=kd(this.R&h-1);if(0===(this.R&h)){var l=kd(this.R);if(2*l<this.c.length){a=this.Ua(a);b=a.c;g.J=!0;a:for(c=2*(l-k),g=2*k+(c-1),l=2*(k+1)+(c-1);;){if(0===c)break a;b[l]=b[g];--l;--c;--g}b[2*k]=d;b[2*k+1]=e;a.R|=h;return a}if(16<=l){k=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];k[c>>>b&31]=ff.qa(a,b+5,c,d,e,g);for(e=d=0;;)if(32>d)0!==
(this.R>>>d&1)&&(k[d]=null!=this.c[e]?ff.qa(a,b+5,$b(this.c[e]),this.c[e],this.c[e+1],g):this.c[e+1],e+=2),d+=1;else break;return new cf(a,l+1,k)}b=Array(2*(l+4));Zc(this.c,0,b,0,2*k);b[2*k]=d;b[2*k+1]=e;Zc(this.c,2*k,b,2*(k+1),2*(l-k));g.J=!0;a=this.Ua(a);a.c=b;a.R|=h;return a}l=this.c[2*k];h=this.c[2*k+1];if(null==l)return l=h.qa(a,b+5,c,d,e,g),l===h?this:bf(this,a,2*k+1,l);if(Ze(d,l))return e===h?this:bf(this,a,2*k+1,e);g.J=!0;g=b+5;d=Ye.ma?Ye.ma(a,g,l,h,c,d,e):Ye.call(null,a,g,l,h,c,d,e);e=2*
k;k=2*k+1;a=this.Ua(a);a.c[e]=null;a.c[k]=d;return a};
f.pa=function(a,b,c,d,e){var g=1<<(b>>>a&31),h=kd(this.R&g-1);if(0===(this.R&g)){var k=kd(this.R);if(16<=k){h=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];h[b>>>a&31]=ff.pa(a+5,b,c,d,e);for(d=c=0;;)if(32>c)0!==(this.R>>>c&1)&&(h[c]=null!=this.c[d]?ff.pa(a+5,$b(this.c[d]),this.c[d],this.c[d+1],e):this.c[d+1],d+=2),c+=1;else break;return new cf(null,k+1,h)}a=Array(2*(k+1));Zc(this.c,
0,a,0,2*h);a[2*h]=c;a[2*h+1]=d;Zc(this.c,2*h,a,2*(h+1),2*(k-h));e.J=!0;return new ef(null,this.R|g,a)}var l=this.c[2*h],g=this.c[2*h+1];if(null==l)return k=g.pa(a+5,b,c,d,e),k===g?this:new ef(null,this.R,$e(this.c,2*h+1,k));if(Ze(c,l))return d===g?this:new ef(null,this.R,$e(this.c,2*h+1,d));e.J=!0;e=this.R;k=this.c;a+=5;a=Ye.la?Ye.la(a,l,g,b,c,d):Ye.call(null,a,l,g,b,c,d);c=2*h;h=2*h+1;d=Ja(k);d[c]=null;d[h]=a;return new ef(null,e,d)};
f.nb=function(a,b,c){var d=1<<(b>>>a&31);if(0===(this.R&d))return this;var e=kd(this.R&d-1),g=this.c[2*e],h=this.c[2*e+1];return null==g?(a=h.nb(a+5,b,c),a===h?this:null!=a?new ef(null,this.R,$e(this.c,2*e+1,a)):this.R===d?null:new ef(null,this.R^d,af(this.c,e))):Ze(c,g)?new ef(null,this.R^d,af(this.c,e)):this};f.na=function(){return new df(this.c,0,null,null)};var ff=new ef(null,0,[]);function gf(a,b,c){this.c=a;this.i=b;this.ra=c}
gf.prototype.Z=function(){for(var a=this.c.length;;){if(null!=this.ra&&this.ra.Z())return!0;if(this.i<a){var b=this.c[this.i];this.i+=1;null!=b&&(this.ra=Mb(b))}else return!1}};gf.prototype.next=function(){if(this.Z())return this.ra.next();throw Error("No such element");};gf.prototype.remove=function(){return Error("Unsupported operation")};function cf(a,b,c){this.I=a;this.j=b;this.c=c}f=cf.prototype;f.Ua=function(a){return a===this.I?this:new cf(a,this.j,Ja(this.c))};
f.mb=function(){return Xe.b?Xe.b(this.c):Xe.call(null,this.c)};f.Pa=function(a,b,c,d){var e=this.c[b>>>a&31];return null!=e?e.Pa(a+5,b,c,d):d};f.qa=function(a,b,c,d,e,g){var h=c>>>b&31,k=this.c[h];if(null==k)return a=bf(this,a,h,ff.qa(a,b+5,c,d,e,g)),a.j+=1,a;b=k.qa(a,b+5,c,d,e,g);return b===k?this:bf(this,a,h,b)};
f.pa=function(a,b,c,d,e){var g=b>>>a&31,h=this.c[g];if(null==h)return new cf(null,this.j+1,$e(this.c,g,ff.pa(a+5,b,c,d,e)));a=h.pa(a+5,b,c,d,e);return a===h?this:new cf(null,this.j,$e(this.c,g,a))};
f.nb=function(a,b,c){var d=b>>>a&31,e=this.c[d];if(null!=e){a=e.nb(a+5,b,c);if(a===e)d=this;else if(null==a)if(8>=this.j)a:{e=this.c;a=e.length;b=Array(2*(this.j-1));c=0;for(var g=1,h=0;;)if(c<a)c!==d&&null!=e[c]&&(b[g]=e[c],g+=2,h|=1<<c),c+=1;else{d=new ef(null,h,b);break a}}else d=new cf(null,this.j-1,$e(this.c,d,a));else d=new cf(null,this.j,$e(this.c,d,a));return d}return this};f.na=function(){return new gf(this.c,0,null)};
function hf(a,b,c){b*=2;for(var d=0;;)if(d<b){if(Ze(c,a[d]))return d;d+=2}else return-1}function jf(a,b,c,d){this.I=a;this.Ka=b;this.j=c;this.c=d}f=jf.prototype;f.Ua=function(a){if(a===this.I)return this;var b=Array(2*(this.j+1));Zc(this.c,0,b,0,2*this.j);return new jf(a,this.Ka,this.j,b)};f.mb=function(){return We.b?We.b(this.c):We.call(null,this.c)};f.Pa=function(a,b,c,d){a=hf(this.c,this.j,c);return 0>a?d:Ze(c,this.c[a])?this.c[a+1]:d};
f.qa=function(a,b,c,d,e,g){if(c===this.Ka){b=hf(this.c,this.j,d);if(-1===b){if(this.c.length>2*this.j)return b=2*this.j,c=2*this.j+1,a=this.Ua(a),a.c[b]=d,a.c[c]=e,g.J=!0,a.j+=1,a;c=this.c.length;b=Array(c+2);Zc(this.c,0,b,0,c);b[c]=d;b[c+1]=e;g.J=!0;d=this.j+1;a===this.I?(this.c=b,this.j=d,a=this):a=new jf(this.I,this.Ka,d,b);return a}return this.c[b+1]===e?this:bf(this,a,b+1,e)}return(new ef(a,1<<(this.Ka>>>b&31),[null,this,null,null])).qa(a,b,c,d,e,g)};
f.pa=function(a,b,c,d,e){return b===this.Ka?(a=hf(this.c,this.j,c),-1===a?(a=2*this.j,b=Array(a+2),Zc(this.c,0,b,0,a),b[a]=c,b[a+1]=d,e.J=!0,new jf(null,this.Ka,this.j+1,b)):I.a(this.c[a],d)?this:new jf(null,this.Ka,this.j,$e(this.c,a+1,d))):(new ef(null,1<<(this.Ka>>>a&31),[null,this])).pa(a,b,c,d,e)};f.nb=function(a,b,c){a=hf(this.c,this.j,c);return-1===a?this:1===this.j?null:new jf(null,this.Ka,this.j-1,af(this.c,jd(a)))};f.na=function(){return new df(this.c,0,null,null)};
var Ye=function Ye(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 6:return Ye.la(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);case 7:return Ye.ma(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};
Ye.la=function(a,b,c,d,e,g){var h=$b(b);if(h===d)return new jf(null,h,2,[b,c,e,g]);var k=new Ve;return ff.pa(a,h,b,c,k).pa(a,d,e,g,k)};Ye.ma=function(a,b,c,d,e,g,h){var k=$b(c);if(k===e)return new jf(null,k,2,[c,d,g,h]);var l=new Ve;return ff.qa(a,b,k,c,d,l).qa(a,b,e,g,h,l)};Ye.w=7;function kf(a,b,c,d,e){this.l=a;this.Qa=b;this.i=c;this.A=d;this.m=e;this.h=32374860;this.v=0}f=kf.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};f.K=function(){return this.l};
f.H=function(){var a=this.m;return null!=a?a:this.m=a=kc(this)};f.o=function(a,b){return pc(this,b)};f.T=function(){return qc(N,this.l)};f.X=function(a,b){return S.a(b,this)};f.Y=function(a,b,c){return S.f(b,c,this)};f.V=function(){return null==this.A?new W(null,2,5,X,[this.Qa[this.i],this.Qa[this.i+1]],null):L(this.A)};
f.$=function(){if(null==this.A){var a=this.Qa,b=this.i+2;return We.f?We.f(a,b,null):We.call(null,a,b,null)}var a=this.Qa,b=this.i,c=O(this.A);return We.f?We.f(a,b,c):We.call(null,a,b,c)};f.M=function(){return this};f.N=function(a,b){return new kf(b,this.Qa,this.i,this.A,this.m)};f.O=function(a,b){return Q(b,this)};kf.prototype[Ia]=function(){return P(this)};
var We=function We(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return We.b(arguments[0]);case 3:return We.f(arguments[0],arguments[1],arguments[2]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};We.b=function(a){return We.f(a,0,null)};
We.f=function(a,b,c){if(null==c)for(c=a.length;;)if(b<c){if(null!=a[b])return new kf(null,a,b,null,null);var d=a[b+1];if(v(d)&&(d=d.mb(),v(d)))return new kf(null,a,b+2,d,null);b+=2}else return null;else return new kf(null,a,b,c,null)};We.w=3;function lf(a,b,c,d,e){this.l=a;this.Qa=b;this.i=c;this.A=d;this.m=e;this.h=32374860;this.v=0}f=lf.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};f.K=function(){return this.l};
f.H=function(){var a=this.m;return null!=a?a:this.m=a=kc(this)};f.o=function(a,b){return pc(this,b)};f.T=function(){return qc(N,this.l)};f.X=function(a,b){return S.a(b,this)};f.Y=function(a,b,c){return S.f(b,c,this)};f.V=function(){return L(this.A)};f.$=function(){var a=this.Qa,b=this.i,c=O(this.A);return Xe.u?Xe.u(null,a,b,c):Xe.call(null,null,a,b,c)};f.M=function(){return this};f.N=function(a,b){return new lf(b,this.Qa,this.i,this.A,this.m)};f.O=function(a,b){return Q(b,this)};
lf.prototype[Ia]=function(){return P(this)};var Xe=function Xe(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return Xe.b(arguments[0]);case 4:return Xe.u(arguments[0],arguments[1],arguments[2],arguments[3]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};Xe.b=function(a){return Xe.u(null,a,0,null)};
Xe.u=function(a,b,c,d){if(null==d)for(d=b.length;;)if(c<d){var e=b[c];if(v(e)&&(e=e.mb(),v(e)))return new lf(a,b,c+1,e,null);c+=1}else return null;else return new lf(a,b,c,d,null)};Xe.w=4;Ue;function mf(a,b,c){this.ja=a;this.Mb=b;this.Db=c}mf.prototype.Z=function(){return this.Db&&this.Mb.Z()};mf.prototype.next=function(){if(this.Db)return this.Mb.next();this.Db=!0;return this.ja};mf.prototype.remove=function(){return Error("Unsupported operation")};
function Lc(a,b,c,d,e,g){this.l=a;this.j=b;this.root=c;this.ea=d;this.ja=e;this.m=g;this.h=16123663;this.v=8196}f=Lc.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};f.keys=function(){return P(Ne.b?Ne.b(this):Ne.call(null,this))};f.entries=function(){return Ie(t(this))};f.values=function(){return P(Oe.b?Oe.b(this):Oe.call(null,this))};f.has=function(a){return bd(this,a)};f.get=function(a,b){return this.D(null,a,b)};
f.forEach=function(a){for(var b=t(this),c=null,d=0,e=0;;)if(e<d){var g=c.S(null,e),h=U(g,0),g=U(g,1);a.a?a.a(g,h):a.call(null,g,h);e+=1}else if(b=t(b))Xc(b)?(c=Ib(b),b=Jb(b),h=c,d=T(c),c=h):(c=L(b),h=U(c,0),g=U(c,1),a.a?a.a(g,h):a.call(null,g,h),b=O(b),c=null,d=0),e=0;else return null};f.G=function(a,b){return $a.f(this,b,null)};f.D=function(a,b,c){return null==b?this.ea?this.ja:c:null==this.root?c:this.root.Pa(0,$b(b),b,c)};
f.na=function(){var a=this.root?Mb(this.root):Hd;return this.ea?new mf(this.ja,a,!1):a};f.K=function(){return this.l};f.U=function(){return this.j};f.H=function(){var a=this.m;return null!=a?a:this.m=a=mc(this)};f.o=function(a,b){return Fe(this,b)};f.Za=function(){return new Ue({},this.root,this.j,this.ea,this.ja)};f.T=function(){return ob(Re,this.l)};
f.tb=function(a,b){if(null==b)return this.ea?new Lc(this.l,this.j-1,this.root,!1,null,null):this;if(null==this.root)return this;var c=this.root.nb(0,$b(b),b);return c===this.root?this:new Lc(this.l,this.j-1,c,this.ea,this.ja,null)};f.Oa=function(a,b,c){if(null==b)return this.ea&&c===this.ja?this:new Lc(this.l,this.ea?this.j:this.j+1,this.root,!0,c,null);a=new Ve;b=(null==this.root?ff:this.root).pa(0,$b(b),b,c,a);return b===this.root?this:new Lc(this.l,a.J?this.j+1:this.j,b,this.ea,this.ja,null)};
f.zb=function(a,b){return null==b?this.ea:null==this.root?!1:this.root.Pa(0,$b(b),b,$c)!==$c};f.M=function(){if(0<this.j){var a=null!=this.root?this.root.mb():null;return this.ea?Q(new W(null,2,5,X,[null,this.ja],null),a):a}return null};f.N=function(a,b){return new Lc(b,this.j,this.root,this.ea,this.ja,this.m)};
f.O=function(a,b){if(Uc(b))return bb(this,D.a(b,0),D.a(b,1));for(var c=this,d=t(b);;){if(null==d)return c;var e=L(d);if(Uc(e))c=bb(c,D.a(e,0),D.a(e,1)),d=O(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.G(null,c);case 3:return this.D(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.G(null,c)};a.f=function(a,c,d){return this.D(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ja(b)))};f.b=function(a){return this.G(null,a)};f.a=function(a,b){return this.D(null,a,b)};var Re=new Lc(null,0,null,!1,null,nc);
function Nc(a,b){for(var c=a.length,d=0,e=Ab(Re);;)if(d<c)var g=d+1,e=e.lb(null,a[d],b[d]),d=g;else return Cb(e)}Lc.prototype[Ia]=function(){return P(this)};function Ue(a,b,c,d,e){this.I=a;this.root=b;this.count=c;this.ea=d;this.ja=e;this.h=258;this.v=56}function nf(a,b,c){if(a.I){if(null==b)a.ja!==c&&(a.ja=c),a.ea||(a.count+=1,a.ea=!0);else{var d=new Ve;b=(null==a.root?ff:a.root).qa(a.I,0,$b(b),b,c,d);b!==a.root&&(a.root=b);d.J&&(a.count+=1)}return a}throw Error("assoc! after persistent!");}f=Ue.prototype;
f.U=function(){if(this.I)return this.count;throw Error("count after persistent!");};f.G=function(a,b){return null==b?this.ea?this.ja:null:null==this.root?null:this.root.Pa(0,$b(b),b)};f.D=function(a,b,c){return null==b?this.ea?this.ja:c:null==this.root?c:this.root.Pa(0,$b(b),b,c)};
f.Sa=function(a,b){var c;a:if(this.I)if(null!=b?b.h&2048||b.hc||(b.h?0:y(eb,b)):y(eb,b))c=nf(this,nd.b?nd.b(b):nd.call(null,b),od.b?od.b(b):od.call(null,b));else{c=t(b);for(var d=this;;){var e=L(c);if(v(e))c=O(c),d=nf(d,nd.b?nd.b(e):nd.call(null,e),od.b?od.b(e):od.call(null,e));else{c=d;break a}}}else throw Error("conj! after persistent");return c};f.$a=function(){var a;if(this.I)this.I=null,a=new Lc(null,this.count,this.root,this.ea,this.ja,null);else throw Error("persistent! called twice");return a};
f.lb=function(a,b,c){return nf(this,b,c)};of;pf;function pf(a,b,c,d,e){this.key=a;this.J=b;this.left=c;this.right=d;this.m=e;this.h=32402207;this.v=0}f=pf.prototype;f.replace=function(a,b,c,d){return new pf(a,b,c,d,null)};f.G=function(a,b){return D.f(this,b,null)};f.D=function(a,b,c){return D.f(this,b,c)};f.S=function(a,b){return 0===b?this.key:1===b?this.J:null};f.ia=function(a,b,c){return 0===b?this.key:1===b?this.J:c};
f.Ta=function(a,b,c){return(new W(null,2,5,X,[this.key,this.J],null)).Ta(null,b,c)};f.K=function(){return null};f.U=function(){return 2};f.ib=function(){return this.key};f.jb=function(){return this.J};f.H=function(){var a=this.m;return null!=a?a:this.m=a=kc(this)};f.o=function(a,b){return pc(this,b)};f.T=function(){return Hc};f.X=function(a,b){return vc(this,b)};f.Y=function(a,b,c){return wc(this,b,c)};f.Oa=function(a,b,c){return Mc.f(new W(null,2,5,X,[this.key,this.J],null),b,c)};
f.M=function(){return Ta(Ta(N,this.J),this.key)};f.N=function(a,b){return qc(new W(null,2,5,X,[this.key,this.J],null),b)};f.O=function(a,b){return new W(null,3,5,X,[this.key,this.J,b],null)};f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.G(null,c);case 3:return this.D(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.G(null,c)};a.f=function(a,c,d){return this.D(null,c,d)};return a}();
f.apply=function(a,b){return this.call.apply(this,[this].concat(Ja(b)))};f.b=function(a){return this.G(null,a)};f.a=function(a,b){return this.D(null,a,b)};pf.prototype[Ia]=function(){return P(this)};function of(a,b,c,d,e){this.key=a;this.J=b;this.left=c;this.right=d;this.m=e;this.h=32402207;this.v=0}f=of.prototype;f.replace=function(a,b,c,d){return new of(a,b,c,d,null)};f.G=function(a,b){return D.f(this,b,null)};f.D=function(a,b,c){return D.f(this,b,c)};
f.S=function(a,b){return 0===b?this.key:1===b?this.J:null};f.ia=function(a,b,c){return 0===b?this.key:1===b?this.J:c};f.Ta=function(a,b,c){return(new W(null,2,5,X,[this.key,this.J],null)).Ta(null,b,c)};f.K=function(){return null};f.U=function(){return 2};f.ib=function(){return this.key};f.jb=function(){return this.J};f.H=function(){var a=this.m;return null!=a?a:this.m=a=kc(this)};f.o=function(a,b){return pc(this,b)};f.T=function(){return Hc};f.X=function(a,b){return vc(this,b)};
f.Y=function(a,b,c){return wc(this,b,c)};f.Oa=function(a,b,c){return Mc.f(new W(null,2,5,X,[this.key,this.J],null),b,c)};f.M=function(){return Ta(Ta(N,this.J),this.key)};f.N=function(a,b){return qc(new W(null,2,5,X,[this.key,this.J],null),b)};f.O=function(a,b){return new W(null,3,5,X,[this.key,this.J,b],null)};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.G(null,c);case 3:return this.D(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.G(null,c)};a.f=function(a,c,d){return this.D(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ja(b)))};f.b=function(a){return this.G(null,a)};f.a=function(a,b){return this.D(null,a,b)};of.prototype[Ia]=function(){return P(this)};nd;
var oc=function oc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ba(c.slice(0),0):null;return oc.s(c)};oc.s=function(a){for(var b=t(a),c=Ab(Re);;)if(b){a=O(O(b));var d=L(b),b=L(O(b)),c=Db(c,d,b),b=a}else return Cb(c)};oc.w=0;oc.P=function(a){return oc.s(t(a))};function qf(a,b){this.B=a;this.ha=b;this.h=32374988;this.v=0}f=qf.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};f.K=function(){return this.ha};
f.ca=function(){var a=(null!=this.B?this.B.h&128||this.B.ub||(this.B.h?0:y(Ya,this.B)):y(Ya,this.B))?this.B.ca(null):O(this.B);return null==a?null:new qf(a,this.ha)};f.H=function(){return kc(this)};f.o=function(a,b){return pc(this,b)};f.T=function(){return qc(N,this.ha)};f.X=function(a,b){return S.a(b,this)};f.Y=function(a,b,c){return S.f(b,c,this)};f.V=function(){return this.B.V(null).ib(null)};
f.$=function(){var a=(null!=this.B?this.B.h&128||this.B.ub||(this.B.h?0:y(Ya,this.B)):y(Ya,this.B))?this.B.ca(null):O(this.B);return null!=a?new qf(a,this.ha):N};f.M=function(){return this};f.N=function(a,b){return new qf(this.B,b)};f.O=function(a,b){return Q(b,this)};qf.prototype[Ia]=function(){return P(this)};function Ne(a){return(a=t(a))?new qf(a,null):null}function nd(a){return fb(a)}function rf(a,b){this.B=a;this.ha=b;this.h=32374988;this.v=0}f=rf.prototype;f.toString=function(){return Ob(this)};
f.equiv=function(a){return this.o(null,a)};f.K=function(){return this.ha};f.ca=function(){var a=(null!=this.B?this.B.h&128||this.B.ub||(this.B.h?0:y(Ya,this.B)):y(Ya,this.B))?this.B.ca(null):O(this.B);return null==a?null:new rf(a,this.ha)};f.H=function(){return kc(this)};f.o=function(a,b){return pc(this,b)};f.T=function(){return qc(N,this.ha)};f.X=function(a,b){return S.a(b,this)};f.Y=function(a,b,c){return S.f(b,c,this)};f.V=function(){return this.B.V(null).jb(null)};
f.$=function(){var a=(null!=this.B?this.B.h&128||this.B.ub||(this.B.h?0:y(Ya,this.B)):y(Ya,this.B))?this.B.ca(null):O(this.B);return null!=a?new rf(a,this.ha):N};f.M=function(){return this};f.N=function(a,b){return new rf(this.B,b)};f.O=function(a,b){return Q(b,this)};rf.prototype[Ia]=function(){return P(this)};function Oe(a){return(a=t(a))?new rf(a,null):null}function od(a){return gb(a)}function sf(a){return v(Od(a))?La.a(function(a,c){return Gc.a(v(a)?a:Ld,c)},a):null}tf;
function uf(a){this.eb=a}uf.prototype.Z=function(){return this.eb.Z()};uf.prototype.next=function(){if(this.eb.Z())return this.eb.next().da[0];throw Error("No such element");};uf.prototype.remove=function(){return Error("Unsupported operation")};function vf(a,b,c){this.l=a;this.Va=b;this.m=c;this.h=15077647;this.v=8196}f=vf.prototype;f.toString=function(){return Ob(this)};f.equiv=function(a){return this.o(null,a)};f.keys=function(){return P(t(this))};f.entries=function(){var a=t(this);return new Je(t(a))};
f.values=function(){return P(t(this))};f.has=function(a){return bd(this,a)};f.forEach=function(a){for(var b=t(this),c=null,d=0,e=0;;)if(e<d){var g=c.S(null,e),h=U(g,0),g=U(g,1);a.a?a.a(g,h):a.call(null,g,h);e+=1}else if(b=t(b))Xc(b)?(c=Ib(b),b=Jb(b),h=c,d=T(c),c=h):(c=L(b),h=U(c,0),g=U(c,1),a.a?a.a(g,h):a.call(null,g,h),b=O(b),c=null,d=0),e=0;else return null};f.G=function(a,b){return $a.f(this,b,null)};f.D=function(a,b,c){return ab(this.Va,b)?b:c};f.na=function(){return new uf(Mb(this.Va))};
f.K=function(){return this.l};f.U=function(){return Qa(this.Va)};f.H=function(){var a=this.m;return null!=a?a:this.m=a=mc(this)};f.o=function(a,b){return Rc(b)&&T(this)===T(b)&&Nd(function(a){return function(b){return bd(a,b)}}(this),b)};f.Za=function(){return new tf(Ab(this.Va))};f.T=function(){return qc(wf,this.l)};f.M=function(){return Ne(this.Va)};f.N=function(a,b){return new vf(b,this.Va,this.m)};f.O=function(a,b){return new vf(this.l,Mc.f(this.Va,b,null),null)};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.G(null,c);case 3:return this.D(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.G(null,c)};a.f=function(a,c,d){return this.D(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ja(b)))};f.b=function(a){return this.G(null,a)};f.a=function(a,b){return this.D(null,a,b)};var wf=new vf(null,Ld,nc);vf.prototype[Ia]=function(){return P(this)};
function tf(a){this.Ma=a;this.v=136;this.h=259}f=tf.prototype;f.Sa=function(a,b){this.Ma=Db(this.Ma,b,null);return this};f.$a=function(){return new vf(null,Cb(this.Ma),null)};f.U=function(){return T(this.Ma)};f.G=function(a,b){return $a.f(this,b,null)};f.D=function(a,b,c){return $a.f(this.Ma,b,$c)===$c?c:b};
f.call=function(){function a(a,b,c){return $a.f(this.Ma,b,$c)===$c?c:b}function b(a,b){return $a.f(this.Ma,b,$c)===$c?null:b}var c=null,c=function(c,e,g){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,g)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.f=a;return c}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ja(b)))};f.b=function(a){return $a.f(this.Ma,a,$c)===$c?null:a};f.a=function(a,b){return $a.f(this.Ma,a,$c)===$c?b:a};
function md(a){if(null!=a&&(a.v&4096||a.jc))return a.name;if("string"===typeof a)return a;throw Error([C("Doesn't support name: "),C(a)].join(""));}function xf(a,b,c){this.i=a;this.end=b;this.step=c}xf.prototype.Z=function(){return 0<this.step?this.i<this.end:this.i>this.end};xf.prototype.next=function(){var a=this.i;this.i+=this.step;return a};function yf(a,b,c,d,e){this.l=a;this.start=b;this.end=c;this.step=d;this.m=e;this.h=32375006;this.v=8192}f=yf.prototype;f.toString=function(){return Ob(this)};
f.equiv=function(a){return this.o(null,a)};f.S=function(a,b){if(b<Qa(this))return this.start+b*this.step;if(this.start>this.end&&0===this.step)return this.start;throw Error("Index out of bounds");};f.ia=function(a,b,c){return b<Qa(this)?this.start+b*this.step:this.start>this.end&&0===this.step?this.start:c};f.na=function(){return new xf(this.start,this.end,this.step)};f.K=function(){return this.l};
f.ca=function(){return 0<this.step?this.start+this.step<this.end?new yf(this.l,this.start+this.step,this.end,this.step,null):null:this.start+this.step>this.end?new yf(this.l,this.start+this.step,this.end,this.step,null):null};f.U=function(){return Fa(vb(this))?0:Math.ceil((this.end-this.start)/this.step)};f.H=function(){var a=this.m;return null!=a?a:this.m=a=kc(this)};f.o=function(a,b){return pc(this,b)};f.T=function(){return qc(N,this.l)};f.X=function(a,b){return vc(this,b)};
f.Y=function(a,b,c){for(a=this.start;;)if(0<this.step?a<this.end:a>this.end){c=b.a?b.a(c,a):b.call(null,c,a);if(uc(c))return rc.b?rc.b(c):rc.call(null,c);a+=this.step}else return c};f.V=function(){return null==vb(this)?null:this.start};f.$=function(){return null!=vb(this)?new yf(this.l,this.start+this.step,this.end,this.step,null):N};f.M=function(){return 0<this.step?this.start<this.end?this:null:0>this.step?this.start>this.end?this:null:this.start===this.end?null:this};
f.N=function(a,b){return new yf(b,this.start,this.end,this.step,this.m)};f.O=function(a,b){return Q(b,this)};yf.prototype[Ia]=function(){return P(this)};function zf(a){a:for(var b=a;;)if(t(b))b=O(b);else break a;return a}function Af(a,b){if("string"===typeof b){var c=a.exec(b);return I.a(L(c),b)?1===T(c)?L(c):fd(c):null}throw new TypeError("re-matches must match against a string.");}
function Bf(a){if(a instanceof RegExp)return a;var b;var c=/^\(\?([idmsux]*)\)/;if("string"===typeof a)c=c.exec(a),b=null==c?null:1===T(c)?L(c):fd(c);else throw new TypeError("re-find must match against a string.");c=U(b,0);b=U(b,1);c=T(c);return new RegExp(a.substring(c),v(b)?b:"")}
function se(a,b,c,d,e,g,h){var k=la;la=null==la?null:la-1;try{if(null!=la&&0>la)return G(a,"#");G(a,c);if(0===ya.b(g))t(h)&&G(a,function(){var a=Cf.b(g);return v(a)?a:"..."}());else{if(t(h)){var l=L(h);b.f?b.f(l,a,g):b.call(null,l,a,g)}for(var n=O(h),p=ya.b(g)-1;;)if(!n||null!=p&&0===p){t(n)&&0===p&&(G(a,d),G(a,function(){var a=Cf.b(g);return v(a)?a:"..."}()));break}else{G(a,d);var r=L(n);c=a;h=g;b.f?b.f(r,c,h):b.call(null,r,c,h);var u=O(n);c=p-1;n=u;p=c}}return G(a,e)}finally{la=k}}
function Df(a,b){for(var c=t(b),d=null,e=0,g=0;;)if(g<e){var h=d.S(null,g);G(a,h);g+=1}else if(c=t(c))d=c,Xc(d)?(c=Ib(d),e=Jb(d),d=c,h=T(c),c=e,e=h):(h=L(d),G(a,h),c=O(d),d=null,e=0),g=0;else return null}var Ef={'"':'\\"',"\\":"\\\\","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t"};function Ff(a){return[C('"'),C(a.replace(RegExp('[\\\\"\b\f\n\r\t]',"g"),function(a){return Ef[a]})),C('"')].join("")}Gf;
function Hf(a,b){var c=ad(J.a(a,sa));return c?(c=null!=b?b.h&131072||b.ic?!0:!1:!1)?null!=Qc(b):c:c}
function If(a,b,c){if(null==a)return G(b,"nil");if(Hf(c,a)){G(b,"^");var d=Qc(a);Y.f?Y.f(d,b,c):Y.call(null,d,b,c);G(b," ")}if(a.Kb)return a.nc(b);if(null!=a&&(a.h&2147483648||a.L))return a.F(null,b,c);if(!0===a||!1===a||"number"===typeof a)return G(b,""+C(a));if(null!=a&&a.constructor===Object)return G(b,"#js "),d=ld.a(function(b){return new W(null,2,5,X,[vd.b(b),a[b]],null)},Yc(a)),Gf.u?Gf.u(d,Y,b,c):Gf.call(null,d,Y,b,c);if(Da(a))return se(b,Y,"#js ["," ","]",c,a);if("string"==typeof a)return v(ra.b(c))?
G(b,Ff(a)):G(b,a);if("function"==m(a)){var e=a.name;c=v(function(){var a=null==e;return a?a:/^[\s\xa0]*$/.test(e)}())?"Function":e;return Df(b,K(["#object[",c,' "',""+C(a),'"]'],0))}if(a instanceof Date)return c=function(a,b){for(var c=""+C(a);;)if(T(c)<b)c=[C("0"),C(c)].join("");else return c},Df(b,K(['#inst "',""+C(a.getUTCFullYear()),"-",c(a.getUTCMonth()+1,2),"-",c(a.getUTCDate(),2),"T",c(a.getUTCHours(),2),":",c(a.getUTCMinutes(),2),":",c(a.getUTCSeconds(),2),".",c(a.getUTCMilliseconds(),3),
"-",'00:00"'],0));if(a instanceof RegExp)return Df(b,K(['#"',a.source,'"'],0));if(null!=a&&(a.h&2147483648||a.L))return yb(a,b,c);if(v(a.constructor.vb))return Df(b,K(["#object[",a.constructor.vb.replace(RegExp("/","g"),"."),"]"],0));e=a.constructor.name;c=v(function(){var a=null==e;return a?a:/^[\s\xa0]*$/.test(e)}())?"Object":e;return Df(b,K(["#object[",c," ",""+C(a),"]"],0))}function Y(a,b,c){var d=Jf.b(c);return v(d)?(c=Mc.f(c,Kf,If),d.f?d.f(a,b,c):d.call(null,a,b,c)):If(a,b,c)}
function Lf(a,b){var c;if(null==a||Fa(t(a)))c="";else{c=C;var d=new ea;a:{var e=new Nb(d);Y(L(a),e,b);for(var g=t(O(a)),h=null,k=0,l=0;;)if(l<k){var n=h.S(null,l);G(e," ");Y(n,e,b);l+=1}else if(g=t(g))h=g,Xc(h)?(g=Ib(h),k=Jb(h),h=g,n=T(g),g=k,k=n):(n=L(h),G(e," "),Y(n,e,b),g=O(h),h=null,k=0),l=0;else break a}c=""+c(d)}return c}var Td=function Td(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ba(c.slice(0),0):null;return Td.s(c)};
Td.s=function(a){return Lf(a,pa())};Td.w=0;Td.P=function(a){return Td.s(t(a))};function Mf(a){var b=Mc.f(pa(),ra,!1);a=Lf(a,b);ia.b?ia.b(a):ia.call(null,a);v(ka)?(a=pa(),ia.b?ia.b("\n"):ia.call(null,"\n"),a=(J.a(a,qa),null)):a=null;return a}function Gf(a,b,c,d){return se(c,function(a,c,d){var k=fb(a);b.f?b.f(k,c,d):b.call(null,k,c,d);G(c," ");a=gb(a);return b.f?b.f(a,c,d):b.call(null,a,c,d)},"{",", ","}",d,t(a))}Yd.prototype.L=!0;
Yd.prototype.F=function(a,b,c){G(b,"#object [cljs.core.Volatile ");Y(new q(null,1,[Nf,this.state],null),b,c);return G(b,"]")};Ba.prototype.L=!0;Ba.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};wd.prototype.L=!0;wd.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};kf.prototype.L=!0;kf.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};pf.prototype.L=!0;pf.prototype.F=function(a,b,c){return se(b,Y,"["," ","]",c,this)};Me.prototype.L=!0;
Me.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};ic.prototype.L=!0;ic.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};Wc.prototype.L=!0;Wc.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};sd.prototype.L=!0;sd.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};Bc.prototype.L=!0;Bc.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};Lc.prototype.L=!0;Lc.prototype.F=function(a,b,c){return Gf(this,Y,b,c)};lf.prototype.L=!0;
lf.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};we.prototype.L=!0;we.prototype.F=function(a,b,c){return se(b,Y,"["," ","]",c,this)};vf.prototype.L=!0;vf.prototype.F=function(a,b,c){return se(b,Y,"#{"," ","}",c,this)};Vc.prototype.L=!0;Vc.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};Qd.prototype.L=!0;Qd.prototype.F=function(a,b,c){G(b,"#object [cljs.core.Atom ");Y(new q(null,1,[Nf,this.state],null),b,c);return G(b,"]")};rf.prototype.L=!0;
rf.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};of.prototype.L=!0;of.prototype.F=function(a,b,c){return se(b,Y,"["," ","]",c,this)};W.prototype.L=!0;W.prototype.F=function(a,b,c){return se(b,Y,"["," ","]",c,this)};Ae.prototype.L=!0;Ae.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};rd.prototype.L=!0;rd.prototype.F=function(a,b){return G(b,"()")};Md.prototype.L=!0;Md.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};Be.prototype.L=!0;
Be.prototype.F=function(a,b,c){return se(b,Y,"#queue ["," ","]",c,t(this))};q.prototype.L=!0;q.prototype.F=function(a,b,c){return Gf(this,Y,b,c)};yf.prototype.L=!0;yf.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};qf.prototype.L=!0;qf.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};Cc.prototype.L=!0;Cc.prototype.F=function(a,b,c){return se(b,Y,"("," ",")",c,this)};Vb.prototype.hb=!0;
Vb.prototype.Ra=function(a,b){if(b instanceof Vb)return bc(this,b);throw Error([C("Cannot compare "),C(this),C(" to "),C(b)].join(""));};w.prototype.hb=!0;w.prototype.Ra=function(a,b){if(b instanceof w)return td(this,b);throw Error([C("Cannot compare "),C(this),C(" to "),C(b)].join(""));};we.prototype.hb=!0;we.prototype.Ra=function(a,b){if(Uc(b))return dd(this,b);throw Error([C("Cannot compare "),C(this),C(" to "),C(b)].join(""));};W.prototype.hb=!0;
W.prototype.Ra=function(a,b){if(Uc(b))return dd(this,b);throw Error([C("Cannot compare "),C(this),C(" to "),C(b)].join(""));};function Of(a){return function(b,c){var d=a.a?a.a(b,c):a.call(null,b,c);return uc(d)?new sc(d):d}}
function de(a){return function(b){return function(){function c(a,c){return La.f(b,a,c)}function d(b){return a.b?a.b(b):a.call(null,b)}function e(){return a.C?a.C():a.call(null)}var g=null,g=function(a,b){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};g.C=e;g.b=d;g.a=c;return g}()}(Of(a))}Pf;function Qf(a,b){La.f(function(b,d){return a.b?a.b(d):a.call(null,d)},null,b)}function Rf(){}
var Sf=function Sf(b){if(null!=b&&null!=b.dc)return b.dc(b);var c=Sf[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Sf._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("IEncodeJS.-clj-\x3ejs",b);};Tf;function Uf(a){return(null!=a?a.cc||(a.oc?0:y(Rf,a)):y(Rf,a))?Sf(a):"string"===typeof a||"number"===typeof a||a instanceof w||a instanceof Vb?Tf.b?Tf.b(a):Tf.call(null,a):Td.s(K([a],0))}
var Tf=function Tf(b){if(null==b)return null;if(null!=b?b.cc||(b.oc?0:y(Rf,b)):y(Rf,b))return Sf(b);if(b instanceof w)return md(b);if(b instanceof Vb)return""+C(b);if(Tc(b)){var c={};b=t(b);for(var d=null,e=0,g=0;;)if(g<e){var h=d.S(null,g),k=U(h,0),h=U(h,1);c[Uf(k)]=Tf(h);g+=1}else if(b=t(b))Xc(b)?(e=Ib(b),b=Jb(b),d=e,e=T(e)):(e=L(b),d=U(e,0),e=U(e,1),c[Uf(d)]=Tf(e),b=O(b),d=null,e=0),g=0;else break;return c}if(null==b?0:null!=b?b.h&8||b.yc||(b.h?0:y(Sa,b)):y(Sa,b)){c=[];b=t(ld.a(Tf,b));d=null;for(g=
e=0;;)if(g<e)k=d.S(null,g),c.push(k),g+=1;else if(b=t(b))d=b,Xc(d)?(b=Ib(d),g=Jb(d),d=b,e=T(b),b=g):(b=L(d),c.push(b),b=O(d),d=null,e=0),g=0;else break;return c}return b},Pf=function Pf(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return Pf.C();case 1:return Pf.b(arguments[0]);default:throw Error([C("Invalid arity: "),C(c.length)].join(""));}};Pf.C=function(){return Pf.b(1)};Pf.b=function(a){return Math.random()*a};Pf.w=1;
function Vf(a){return Math.floor(Math.random()*a)}function Wf(){var a=new W(null,3,5,X,[Xf,Yf,Zf],null);return Kc(a,Vf(T(a)))}function $f(a,b){this.Xa=a;this.m=b;this.h=2153775104;this.v=2048}f=$f.prototype;f.toString=function(){return this.Xa};f.equiv=function(a){return this.o(null,a)};f.o=function(a,b){return b instanceof $f&&this.Xa===b.Xa};f.F=function(a,b){return G(b,[C('#uuid "'),C(this.Xa),C('"')].join(""))};f.H=function(){null==this.m&&(this.m=$b(this.Xa));return this.m};
f.Ra=function(a,b){return fa(this.Xa,b.Xa)};var ag=new w(null,"on-message","on-message",1662987808),bg=new w(null,"binary-type","binary-type",1096940609),dg=new w(null,"schema","schema",-1582001791),eg=new w(null,"coord","coord",-1453656639),fg=new w("seria","invalid","seria/invalid",304067108),sa=new w(null,"meta","meta",1499536964),gg=new w(null,"body-type","body-type",542763588),hg=new w(null,"color","color",1011675173),ua=new w(null,"dup","dup",556298533),ig=new w(null,"diffed?","diffed?",-2094692346),jg=new w(null,"schema-id","schema-id",
342379782),kg=new w(null,"undiff","undiff",1883196934),lg=new w(null,"gen","gen",142575302),mg=new w(null,"on-close","on-close",-761178394),Xd=new Vb(null,"new-value","new-value",-1567397401,null),Sd=new w(null,"validator","validator",-1966190681),ng=new w(null,"coords","coords",-599429112),og=new w(null,"value","value",305978217),pg=new w(null,"time","time",1385887882),qg=new w(null,"unpack","unpack",-2027067542),Yf=new w(null,"static","static",1214358571),Nf=new w(null,"val","val",128701612),Wd=
new Vb(null,"validate","validate",1439230700,null),Kf=new w(null,"fallback-impl","fallback-impl",-1501286995),rg=new Vb(null,"diffed?","diffed?",-454160819,null),qa=new w(null,"flush-on-newline","flush-on-newline",-151457939),sg=new w(null,"angle","angle",1622094254),tg=new Vb(null,"value","value",1946509744,null),ae=new Vb(null,"n","n",-2092305744,null),ug=new w(null,"user-data","user-data",2143823568),ra=new w(null,"readably","readably",1129599760),Cf=new w(null,"more-marker","more-marker",-14717935),
vg=new w(null,"snapshot","snapshot",-1274785710),wg=new w(null,"fixtures","fixtures",1009814994),xg=new w(null,"interp","interp",1576701107),Xf=new w(null,"dynamic","dynamic",704819571),ya=new w(null,"print-length","print-length",1931866356),yg=new w(null,"id","id",-1388402092),zg=new Vb(null,"/","/",-1371932971,null),Ag=new w(null,"position","position",-2011731912),Bg=new w(null,"fixture","fixture",1595630169),Cg=new w(null,"tag","tag",-1290361223),Dg=new w(null,"on-error","on-error",1728533530),
Kd=new Vb(null,"quote","quote",1377916282,null),Jd=new w(null,"arglists","arglists",1661989754),Id=new Vb(null,"nil-iter","nil-iter",1101030523,null),Eg=new w(null,"body","body",-2049205669),Jf=new w(null,"alt-impl","alt-impl",670969595),Fg=new w(null,"bodies","bodies",-1295887172),Z=new w("seria","dnil","seria/dnil",1154007932),Gg=new Vb(null,"deref","deref",1494944732,null),Hg=new w(null,"on-open","on-open",-1391088163),Ig=new w(null,"pack","pack",-1240257891),$d=new Vb(null,"number?","number?",
-1747282210,null),Zf=new w(null,"kinetic","kinetic",-451191810),Jg=new w(null,"diff","diff",2135942783);var Kg=new q(null,5,[ag,"onmessage",Hg,"onopen",Dg,"onerror",mg,"onclose",bg,"binaryType"],null);function Lg(){var a=[C("ws://"),C(location.host)].join(""),b=Mg,a=new WebSocket(a);Qf(function(a){return function(b){var e=U(b,0);b=U(b,1);e=Kg.b?Kg.b(e):Kg.call(null,e);return v(e)?a[e]=b:null}}(a),b);return a}function Ng(a,b){var c;c=v(a)?I.a(1,a.readyState):a;return v(c)?(a.send(b),!0):!1};var Og=function Og(b){if(null!=b&&null!=b.pc)return b.pc(b);var c=Og[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Og._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("PushbackReader.read-char",b);},Pg=function Pg(b,c){if(null!=b&&null!=b.qc)return b.qc(b,c);var d=Pg[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=Pg._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("PushbackReader.unread",b);};
function Qg(a){var b=!/[^\t\n\r ]/.test(a);return v(b)?b:","===a}Rg;Sg;Tg;function Ug(a){throw Error(Ka.a(C,a));}function Vg(a,b){for(var c=new ea(b),d=Og(a);;){var e;if(!(e=null==d||Qg(d))){e=d;var g="#"!==e;e=g?(g="'"!==e)?(g=":"!==e)?Sg.b?Sg.b(e):Sg.call(null,e):g:g:g}if(e)return Pg(a,d),c.toString();c.append(d);d=Og(a)}}function Wg(a){for(;;){var b=Og(a);if("\n"===b||"\r"===b||null==b)return a}}
var Xg=Bf("^([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+))(N)?$"),Yg=Bf("^([-+]?[0-9]+)/([0-9]+)$"),Zg=Bf("^([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?$"),bh=Bf("^[:]?([^0-9/].*/)?([^0-9/][^/]*)$");function ch(a,b){var c=a.exec(b);return null!=c&&c[0]===b?1===c.length?c[0]:c:null}var dh=Bf("^[0-9A-Fa-f]{2}$"),eh=Bf("^[0-9A-Fa-f]{4}$");function fh(a,b,c){return v(Af(a,c))?c:Ug(K(["Unexpected unicode escape \\",b,c],0))}
function gh(a){return String.fromCharCode(parseInt(a,16))}function hh(a){var b=Og(a),c="t"===b?"\t":"r"===b?"\r":"n"===b?"\n":"\\"===b?"\\":'"'===b?'"':"b"===b?"\b":"f"===b?"\f":null;v(c)?b=c:"x"===b?(a=(new ea(Og(a),Og(a))).toString(),b=gh(fh(dh,b,a))):"u"===b?(a=(new ea(Og(a),Og(a),Og(a),Og(a))).toString(),b=gh(fh(eh,b,a))):b=/[^0-9]/.test(b)?Ug(K(["Unexpected unicode escape \\",b],0)):String.fromCharCode(b);return b}
function ih(a,b){for(var c=Ab(Hc);;){var d;a:{d=Qg;for(var e=b,g=Og(e);;)if(v(d.b?d.b(g):d.call(null,g)))g=Og(e);else{d=g;break a}}v(d)||Ug(K(["EOF while reading"],0));if(a===d)return Cb(c);e=Sg.b?Sg.b(d):Sg.call(null,d);v(e)?d=e.a?e.a(b,d):e.call(null,b,d):(Pg(b,d),d=Rg.u?Rg.u(b,!0,null,!0):Rg.call(null,b,!0,null));c=d===b?c:Fd.a(c,d)}}function jh(a,b){return Ug(K(["Reader for ",b," not implemented yet"],0))}kh;
function lh(a,b){var c=Og(a),d=Tg.b?Tg.b(c):Tg.call(null,c);if(v(d))return d.a?d.a(a,b):d.call(null,a,b);d=kh.a?kh.a(a,c):kh.call(null,a,c);return v(d)?d:Ug(K(["No dispatch macro for ",c],0))}function mh(a,b){return Ug(K(["Unmatched delimiter ",b],0))}function nh(a){return Ka.a(Ub,ih(")",a))}function oh(a){return ih("]",a)}
function ph(a){a=ih("}",a);var b=T(a);if("number"!==typeof b||isNaN(b)||Infinity===b||parseFloat(b)!==parseInt(b,10))throw Error([C("Argument must be an integer: "),C(b)].join(""));0!==(b&1)&&Ug(K(["Map literal must contain an even number of forms"],0));return Ka.a(oc,a)}function qh(a){for(var b=new ea,c=Og(a);;){if(null==c)return Ug(K(["EOF while reading"],0));if("\\"===c)b.append(hh(a));else{if('"'===c)return b.toString();b.append(c)}c=Og(a)}}
function rh(a){for(var b=new ea,c=Og(a);;){if(null==c)return Ug(K(["EOF while reading"],0));if("\\"===c){b.append(c);var d=Og(a);if(null==d)return Ug(K(["EOF while reading"],0));var e=function(){var a=b;a.append(d);return a}(),g=Og(a)}else{if('"'===c)return b.toString();e=function(){var a=b;a.append(c);return a}();g=Og(a)}b=e;c=g}}
function sh(a,b){var c=Vg(a,b),d=-1!=c.indexOf("/");v(v(d)?1!==c.length:d)?c=cc.a(c.substring(0,c.indexOf("/")),c.substring(c.indexOf("/")+1,c.length)):(d=cc.b(c),c="nil"===c?null:"true"===c?!0:"false"===c?!1:"/"===c?zg:d);return c}
function th(a,b){var c=Vg(a,b),d=c.substring(1);return 1===d.length?d:"tab"===d?"\t":"return"===d?"\r":"newline"===d?"\n":"space"===d?" ":"backspace"===d?"\b":"formfeed"===d?"\f":"u"===d.charAt(0)?gh(d.substring(1)):"o"===d.charAt(0)?jh(0,c):Ug(K(["Unknown character literal: ",c],0))}
function uh(a){a=Vg(a,Og(a));var b=ch(bh,a);a=b[0];var c=b[1],b=b[2];return void 0!==c&&":/"===c.substring(c.length-2,c.length)||":"===b[b.length-1]||-1!==a.indexOf("::",1)?Ug(K(["Invalid token: ",a],0)):null!=c&&0<c.length?vd.a(c.substring(0,c.indexOf("/")),b):vd.b(a)}function vh(a){return function(b){return Ta(Ta(N,Rg.u?Rg.u(b,!0,null,!0):Rg.call(null,b,!0,null)),a)}}function wh(){return function(){return Ug(K(["Unreadable form"],0))}}
function xh(a){var b;b=Rg.u?Rg.u(a,!0,null,!0):Rg.call(null,a,!0,null);if(b instanceof Vb)b=new q(null,1,[Cg,b],null);else if("string"===typeof b)b=new q(null,1,[Cg,b],null);else if(b instanceof w){b=[b,!0];for(var c=[],d=0;;)if(d<b.length){var e=b[d],g=b[d+1];-1===Ke(c,e)&&(c.push(e),c.push(g));d+=2}else break;b=new q(null,c.length/2,c,null)}Tc(b)||Ug(K(["Metadata must be Symbol,Keyword,String or Map"],0));a=Rg.u?Rg.u(a,!0,null,!0):Rg.call(null,a,!0,null);return(null!=a?a.h&262144||a.Fc||(a.h?0:
y(nb,a)):y(nb,a))?qc(a,sf(K([Qc(a),b],0))):Ug(K(["Metadata can only be applied to IWithMetas"],0))}function yh(a){a:if(a=ih("}",a),a=t(a),null==a)a=wf;else if(a instanceof Ba&&0===a.i){a=a.c;b:for(var b=0,c=Ab(wf);;)if(b<a.length)var d=b+1,c=c.Sa(null,a[b]),b=d;else break b;a=c.$a(null)}else for(d=Ab(wf);;)if(null!=a)b=O(a),d=d.Sa(null,a.V(null)),a=b;else{a=Cb(d);break a}return a}function zh(a){return Bf(rh(a))}function Ah(a){Rg.u?Rg.u(a,!0,null,!0):Rg.call(null,a,!0,null);return a}
function Sg(a){return'"'===a?qh:":"===a?uh:";"===a?Wg:"'"===a?vh(Kd):"@"===a?vh(Gg):"^"===a?xh:"`"===a?jh:"~"===a?jh:"("===a?nh:")"===a?mh:"["===a?oh:"]"===a?mh:"{"===a?ph:"}"===a?mh:"\\"===a?th:"#"===a?lh:null}function Tg(a){return"{"===a?yh:"\x3c"===a?wh():'"'===a?zh:"!"===a?Wg:"_"===a?Ah:null}
function Rg(a,b,c){for(;;){var d=Og(a);if(null==d)return v(b)?Ug(K(["EOF while reading"],0)):c;if(!Qg(d))if(";"===d)a=Wg.a?Wg.a(a,d):Wg.call(null,a);else{var e=Sg(d);if(v(e))e=e.a?e.a(a,d):e.call(null,a,d);else{var e=a,g=void 0;!(g=!/[^0-9]/.test(d))&&(g=void 0,g="+"===d||"-"===d)&&(g=Og(e),Pg(e,g),g=!/[^0-9]/.test(g));if(g)a:for(e=a,d=new ea(d),g=Og(e);;){var h;h=null==g;h||(h=(h=Qg(g))?h:Sg.b?Sg.b(g):Sg.call(null,g));if(v(h)){Pg(e,g);d=e=d.toString();g=void 0;v(ch(Xg,d))?(d=ch(Xg,d),g=d[2],null!=
(I.a(g,"")?null:g)?g=0:(g=v(d[3])?[d[3],10]:v(d[4])?[d[4],16]:v(d[5])?[d[5],8]:v(d[6])?[d[7],parseInt(d[6],10)]:[null,null],h=g[0],null==h?g=null:(g=parseInt(h,g[1]),g="-"===d[1]?-g:g))):(g=void 0,v(ch(Yg,d))?(d=ch(Yg,d),g=parseInt(d[1],10)/parseInt(d[2],10)):g=v(ch(Zg,d))?parseFloat(d):null);d=g;e=v(d)?d:Ug(K(["Invalid number format [",e,"]"],0));break a}d.append(g);g=Og(e)}else e=sh(a,d)}if(e!==a)return e}}}
var Bh=function(a,b){return function(c,d){return J.a(v(d)?b:a,c)}}(new W(null,13,5,X,[null,31,28,31,30,31,30,31,31,30,31,30,31],null),new W(null,13,5,X,[null,31,29,31,30,31,30,31,31,30,31,30,31],null)),Ch=/(\d\d\d\d)(?:-(\d\d)(?:-(\d\d)(?:[T](\d\d)(?::(\d\d)(?::(\d\d)(?:[.](\d+))?)?)?)?)?)?(?:[Z]|([-+])(\d\d):(\d\d))?/;function Dh(a){a=parseInt(a,10);return Fa(isNaN(a))?a:null}
function Eh(a,b,c,d){a<=b&&b<=c||Ug(K([[C(d),C(" Failed:  "),C(a),C("\x3c\x3d"),C(b),C("\x3c\x3d"),C(c)].join("")],0));return b}
function Fh(a){var b=Af(Ch,a);U(b,0);var c=U(b,1),d=U(b,2),e=U(b,3),g=U(b,4),h=U(b,5),k=U(b,6),l=U(b,7),n=U(b,8),p=U(b,9),r=U(b,10);if(Fa(b))return Ug(K([[C("Unrecognized date/time syntax: "),C(a)].join("")],0));var u=Dh(c),x=function(){var a=Dh(d);return v(a)?a:1}();a=function(){var a=Dh(e);return v(a)?a:1}();var b=function(){var a=Dh(g);return v(a)?a:0}(),c=function(){var a=Dh(h);return v(a)?a:0}(),z=function(){var a=Dh(k);return v(a)?a:0}(),E=function(){var a;a:if(I.a(3,T(l)))a=l;else if(3<T(l))a=
l.substring(0,3);else for(a=new ea(l);;)if(3>a.Na.length)a=a.append("0");else{a=a.toString();break a}a=Dh(a);return v(a)?a:0}(),n=(I.a(n,"-")?-1:1)*(60*function(){var a=Dh(p);return v(a)?a:0}()+function(){var a=Dh(r);return v(a)?a:0}());return new W(null,8,5,X,[u,Eh(1,x,12,"timestamp month field must be in range 1..12"),Eh(1,a,function(){var a;a=0===hd(u,4);v(a)&&(a=Fa(0===hd(u,100)),a=v(a)?a:0===hd(u,400));return Bh.a?Bh.a(x,a):Bh.call(null,x,a)}(),"timestamp day field must be in range 1..last day in month"),
Eh(0,b,23,"timestamp hour field must be in range 0..23"),Eh(0,c,59,"timestamp minute field must be in range 0..59"),Eh(0,z,I.a(c,59)?60:59,"timestamp second field must be in range 0..60"),Eh(0,E,999,"timestamp millisecond field must be in range 0..999"),n],null)}
var Gh,Hh=new q(null,4,["inst",function(a){var b;if("string"===typeof a)if(b=Fh(a),v(b)){a=U(b,0);var c=U(b,1),d=U(b,2),e=U(b,3),g=U(b,4),h=U(b,5),k=U(b,6);b=U(b,7);b=new Date(Date.UTC(a,c-1,d,e,g,h,k)-6E4*b)}else b=Ug(K([[C("Unrecognized date/time syntax: "),C(a)].join("")],0));else b=Ug(K(["Instance literal expects a string for its timestamp."],0));return b},"uuid",function(a){return"string"===typeof a?new $f(a,null):Ug(K(["UUID literal expects a string as its representation."],0))},"queue",function(a){return Uc(a)?
ee(Ce,a):Ug(K(["Queue literal expects a vector for its elements."],0))},"js",function(a){if(Uc(a)){var b=[];a=t(a);for(var c=null,d=0,e=0;;)if(e<d){var g=c.S(null,e);b.push(g);e+=1}else if(a=t(a))c=a,Xc(c)?(a=Ib(c),e=Jb(c),c=a,d=T(a),a=e):(a=L(c),b.push(a),a=O(c),c=null,d=0),e=0;else break;return b}if(Tc(a)){b={};a=t(a);c=null;for(e=d=0;;)if(e<d){var h=c.S(null,e),g=U(h,0),h=U(h,1);b[md(g)]=h;e+=1}else if(a=t(a))Xc(a)?(d=Ib(a),a=Jb(a),c=d,d=T(d)):(d=L(a),c=U(d,0),d=U(d,1),b[md(c)]=d,a=O(a),c=null,
d=0),e=0;else break;return b}return Ug(K([[C("JS literal expects a vector or map containing "),C("only string or unqualified keyword keys")].join("")],0))}],null);Gh=Rd.b?Rd.b(Hh):Rd.call(null,Hh);var Ih=Rd.b?Rd.b(null):Rd.call(null,null);
function kh(a,b){var c=sh(a,b),d=J.a(rc.b?rc.b(Gh):rc.call(null,Gh),""+C(c)),e=rc.b?rc.b(Ih):rc.call(null,Ih);return v(d)?(c=Rg(a,!0,null),d.b?d.b(c):d.call(null,c)):v(e)?(d=Rg(a,!0,null),e.a?e.a(c,d):e.call(null,c,d)):Ug(K(["Could not find tag parser for ",""+C(c)," in ",Td.s(K([Ne(rc.b?rc.b(Gh):rc.call(null,Gh))],0))],0))};ld.a(function(a){if("number"===typeof a)return String.fromCharCode(a);if("string"===typeof a&&1===a.length)return a;throw Error("Argument to char must be a character or number");},Ed.s(new W(null,4,5,X,["_","-","?","!"],null),new yf(null,97,123,1,null),K([new yf(null,65,91,1,null),new yf(null,48,58,1,null)],0)));function Jh(a){a=Math.pow(2,8*a);var b;b=a*Pf.C();b=Math.floor(b);return id(Fa(!0)?b:b-a/2)}function Kh(a,b,c,d){this.value=a;this.gb=b;this.va=c;this.m=d;this.h=2229667594;this.v=8192}
f=Kh.prototype;f.G=function(a,b){return $a.f(this,b,null)};f.D=function(a,b,c){switch(b instanceof w?b.ba:null){case "value":return this.value;default:return J.f(this.va,b,c)}};f.F=function(a,b,c){return se(b,function(){return function(a){return se(b,Y,""," ","",c,a)}}(this),"#seria.common.DiffedValue{",", ","}",c,Ed.a(new W(null,1,5,X,[new W(null,2,5,X,[og,this.value],null)],null),this.va))};f.na=function(){return new Ge(0,this,1,new W(null,1,5,X,[og],null),Mb(this.va))};f.K=function(){return this.gb};
f.U=function(){return 1+T(this.va)};f.H=function(){var a=this.m;if(null!=a)return a;a:for(var a=0,b=t(this);;)if(b)var c=L(b),a=(a+($b(nd.b?nd.b(c):nd.call(null,c))^$b(od.b?od.b(c):od.call(null,c))))%4503599627370496,b=O(b);else break a;return this.m=a};f.o=function(a,b){var c;c=v(b)?(c=this.constructor===b.constructor)?Fe(this,b):c:b;return v(c)?!0:!1};
f.tb=function(a,b){var c;if(bd(new vf(null,new q(null,1,[og,null],null),null),b))c=Oc.a(qc(ee(Ld,this),this.gb),b);else{c=this.value;var d=this.gb,e;e=Oc.a(this.va,b);e=t(e)?e:null;c=new Kh(c,d,e,null)}return c};f.Oa=function(a,b,c){return v(ud.a?ud.a(og,b):ud.call(null,og,b))?new Kh(c,this.gb,this.va,null):new Kh(this.value,this.gb,Mc.f(this.va,b,c),null)};f.M=function(){return t(Ed.a(new W(null,1,5,X,[new W(null,2,5,X,[og,this.value],null)],null),this.va))};
f.N=function(a,b){return new Kh(this.value,b,this.va,this.m)};f.O=function(a,b){return Uc(b)?bb(this,D.a(b,0),D.a(b,1)):La.f(Ta,this,b)};function Lh(a){return new Kh(a,null,null,null)}function Mh(a){if(!v(a instanceof Kh))throw Error([C("Assert failed: "),C(Td.s(K([Ub(rg,tg)],0)))].join(""));return og.b(a)};var Nh=function Nh(b){if(null!=b&&null!=b.Sb)return b.Sb();var c=Nh[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Nh._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("Buffer.read-byte!",b);},Oh=function Oh(b){if(null!=b&&null!=b.Ub)return b.Ub();var c=Oh[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Oh._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("Buffer.read-int!",b);},Ph=function Ph(b){if(null!=b&&null!=b.Vb)return b.Vb();var c=Ph[m(null==b?null:
b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Ph._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("Buffer.read-long!",b);},Qh=function Qh(b){if(null!=b&&null!=b.Tb)return b.Tb();var c=Qh[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Qh._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("Buffer.read-float!",b);},Rh=function Rh(b){if(null!=b&&null!=b.Rb)return b.Rb();var c=Rh[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Rh._;if(null!=c)return c.b?c.b(b):
c.call(null,b);throw B("Buffer.read-boolean!",b);},Sh=function Sh(b,c){if(null!=b&&null!=b.Xb)return b.Xb(0,c);var d=Sh[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=Sh._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("Buffer.write-byte!",b);},Th=function Th(b,c){if(null!=b&&null!=b.Zb)return b.Zb(0,c);var d=Th[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=Th._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("Buffer.write-int!",b);},Uh=
function Uh(b,c){if(null!=b&&null!=b.$b)return b.$b(0,c);var d=Uh[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=Uh._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("Buffer.write-long!",b);},Vh=function Vh(b,c){if(null!=b&&null!=b.Yb)return b.Yb(0,c);var d=Vh[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=Vh._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("Buffer.write-float!",b);},Wh=function Wh(b,c){if(null!=b&&null!=b.Wb)return b.Wb(0,
c);var d=Wh[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);d=Wh._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("Buffer.write-boolean!",b);},Xh=function Xh(b){if(null!=b&&null!=b.Qb)return b.Qb();var c=Xh[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Xh._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("Buffer.little-endian?",b);},Yh=function Yh(b,c){if(null!=b&&null!=b.Pb)return b.Pb(0,c);var d=Yh[m(null==b?null:b)];if(null!=d)return d.a?d.a(b,
c):d.call(null,b,c);d=Yh._;if(null!=d)return d.a?d.a(b,c):d.call(null,b,c);throw B("Buffer.little-endian!",b);},Zh=function Zh(b){if(null!=b&&null!=b.Nb)return b.Nb();var c=Zh[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=Zh._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("Buffer.clear!",b);},$h=function $h(b){if(null!=b&&null!=b.Ob)return b.Ob();var c=$h[m(null==b?null:b)];if(null!=c)return c.b?c.b(b):c.call(null,b);c=$h._;if(null!=c)return c.b?c.b(b):c.call(null,b);throw B("Buffer.compress",
b);};f=ByteBuffer.prototype;f.Sb=function(){return this.readInt8()};f.Ub=function(){return this.readInt32()};f.Vb=function(){return this.readInt64()};f.Tb=function(){return this.readFloat32()};f.Rb=function(){var a=this.bitIndex;0===hd(a,8)&&(this.bitBuffer=this.readInt8());this.bitIndex=a+1;return 0!==(this.bitBuffer&1<<hd(a,8))};f.Xb=function(a,b){return this.writeInt8(b)};f.Zb=function(a,b){return this.writeInt32(b|0)};f.$b=function(a,b){return this.writeInt64(id(b))};f.Yb=function(a,b){return this.writeFloat32(b)};
f.Wb=function(a,b){var c=this.bitIndex;if(0===hd(c,8)){0<c&&this.writeInt8(this.bitBuffer,this.bitPosition);this.bitBuffer=0;var d=this.offset;this.bitPosition=d;this.offset=d+1}this.bitIndex=c+1;this.bitBuffer=v(b)?this.bitBuffer|1<<hd(c,8):this.bitBuffer&~(1<<hd(c,8));return this};f.Qb=function(){return this.littleEndian};f.Pb=function(a,b){return this.littleEndian=b};f.Nb=function(){this.bitIndex=this.offset=0;this.bitPosition=-1;this.bitBuffer=0;return this};
f.Ob=function(){var a=this.bitPosition;!I.a(a,-1)&&this.writeInt8(this.bitBuffer,a);return this.slice(0,this.offset).toArrayBuffer()};function ai(a,b){var c=0>b,d=c?-(b+1):b;Wh(a,c);for(c=d;;){if(0===(c&-128))return Sh(a,c);Sh(a,id(c)&127|128);c>>>=7}}function bi(a){for(var b=Rh(a),c=0,d=0;;)if(64>d){var e=Nh(a),c=c|(e&127)<<d;if(0===(e&128))return Fa(b)?c:-c-1;d+=7}else throw Error("Malformed varint!");}function ci(a,b,c){return Wh(ai(Wh(Zh(a),Xh(a)),b),c)}
function di(a){Yh(a,Rh(a));var b=bi(a);a=Rh(a);return new q(null,2,[jg,b,ig,a],null)};var ei=function(){var a=Zh(ByteBuffer.allocate(1E4)),b=function(){return function(a,b){var c=Mh(b);return I.a(Z,c)?a:c}}(a),c=function(){return function(a,b){var c=Mh(b);return I.a(Z,c)?a:c}}(a),d=function(){return function(){return new W(null,2,5,X,[Pf.C(),Pf.C()],null)}}(a),e=function(a){return function(){return new q(null,2,[ug,new q(null,1,[hg,Jh(4)],null),ng,ce(2+Vf(4),function(){return function(){return d()}}(a))],null)}}(a),g=function(){return function(a,b){return Lh(I.a(a,b)?Z:b)}}(a),h=function(){return function(a,
b,c,d,e){c=Math.abs(e-c)<Math.abs(e-d);return I.a(a,b)?a:c?a:b}}(a),k=function(a){return function(b){return v(Rh(b))?Z:new q(null,2,[Fg,v(Rh(b))?Z:zf(ce(bi(b),function(){return function(){return v(Rh(b))?Z:Oa(b)}}(a))),pg,v(Rh(b))?Z:Ph(b)],null)}}(a),l=function(){return function(a,b,c,d,e){c=Math.abs(e-c)<Math.abs(e-d);return I.a(a,b)?a:c?a:b}}(a),n=function(a){return function(b){return new q(null,2,[ng,zf(ce(bi(b),function(){return function(){return u(b)}}(a))),ug,new q(null,1,[hg,Oh(b)],null)],
null)}}(a),p=function(){return function(a,b){var c=I.a(Z,b);Wh(a,c);if(!c){var c=b.b?b.b(0):b.call(null,0),d=I.a(Z,c);Wh(a,d);d||Vh(a,c);c=b.b?b.b(1):b.call(null,1);d=I.a(Z,c);Wh(a,d);d||Vh(a,c)}return a}}(a),r=function(){return function(a,b){return Lh(I.a(a,b)?Z:b)}}(a),u=function(){return function(a){return new W(null,2,5,X,[Qh(a),Qh(a)],null)}}(a),x=function(){return function(a,b){return Lh(I.a(a,b)?Z:b)}}(a),z=function(a){return function(b){return new q(null,2,[Fg,zf(ce(bi(b),function(){return function(){return A(b)}}(a))),
pg,Ph(b)],null)}}(a),E=function(){return function(a,b){var c=Mh(b);return I.a(Z,c)?a:c}}(a),A=function(a){return function(b){return new q(null,5,[sg,Qh(b),gg,J.a(new W(null,3,5,X,[Xf,Yf,Zf],null),bi(b)),wg,zf(ce(bi(b),function(){return function(){return n(b)}}(a))),Ag,u(b),ug,new q(null,1,[yg,Oh(b)],null)],null)}}(a),R=function(a){return function(b,c){var d=I.a(Z,c);Wh(b,d);if(!d){var e=sg.b(c),g=I.a(Z,e);Wh(b,g);g||Vh(b,e);var h=gg.b(c),e=I.a(Z,h);Wh(b,e);e||ai(b,function(){switch(h instanceof w?
h.ba:null){case "dynamic":return 0;case "static":return 1;case "kinetic":return 2;default:throw Error([C("No matching clause: "),C(h)].join(""));}}());e=wg.b(c);g=I.a(Z,e);Wh(b,g);g||(ai(b,T(e)),Qf(function(){return function(a){var c=I.a(Z,a);Wh(b,c);return c?null:Ua(b,a)}}(g,e,d,a),e));d=Ag.b(c);e=I.a(Z,d);Wh(b,e);e||p(b,d);d=ug.b(c);e=I.a(Z,d);Wh(b,e);e||(d=yg.b(d),e=I.a(Z,d),Wh(b,e),e||Th(b,d))}return b}}(a),aa=function(a){return function(){return new q(null,5,[ug,new q(null,1,[yg,Jh(4)],null),
Ag,d(),sg,Pf.C(),gg,Wf(),wg,ce(2+Vf(4),function(){return function(){return e()}}(a))],null)}}(a),oa=function(){return function(a){return v(Rh(a))?Z:new W(null,2,5,X,[v(Rh(a))?Z:Qh(a),v(Rh(a))?Z:Qh(a)],null)}}(a),Pa=function(a){return function(b,c){var d=I.a(Z,c);Wh(b,d);if(!d){var e=Fg.b(c),g=I.a(Z,e);Wh(b,g);g||(ai(b,T(e)),Qf(function(){return function(a){var c=I.a(Z,a);Wh(b,c);return c?null:R(b,a)}}(g,e,d,a),e));d=pg.b(c);e=I.a(Z,d);Wh(b,e);e||Uh(b,d)}return b}}(a),ub=function(a){return function(b,
c){var d=ng.b(c);ai(b,T(d));Qf(function(){return function(a){return xa(b,a)}}(d,a),d);d=ug.b(c);d=hg.b(d);Th(b,d);return b}}(a),F=function(a){return function(b){return v(Rh(b))?Z:new q(null,2,[ng,v(Rh(b))?Z:zf(ce(bi(b),function(){return function(){return v(Rh(b))?Z:oa(b)}}(a))),ug,v(Rh(b))?Z:new q(null,1,[hg,v(Rh(b))?Z:Oh(b)],null)],null)}}(a),$g=function(a){return function(b,c){var d=Fg.b(c);ai(b,T(d));Qf(function(){return function(a){return wa(b,a)}}(d,a),d);d=pg.b(c);Uh(b,d);return b}}(a),ta=function(){return function(a,
b,c,d,e){c=Math.abs(e-c)<Math.abs(e-d);return I.a(a,b)?a:c?a:b}}(a),va=function(){return function(a,b){var c=Mh(b);return I.a(Z,c)?a:c}}(a),wa=function(a){return function(b,c){var d=sg.b(c);Vh(b,d);var e=gg.b(c);ai(b,function(){switch(e instanceof w?e.ba:null){case "dynamic":return 0;case "static":return 1;case "kinetic":return 2;default:throw Error([C("No matching clause: "),C(e)].join(""));}}());d=wg.b(c);ai(b,T(d));Qf(function(){return function(a){return ub(b,a)}}(d,a),d);d=Ag.b(c);xa(b,d);d=ug.b(c);
d=yg.b(d);Th(b,d);return b}}(a),xa=function(){return function(a,b){var c=b.b?b.b(0):b.call(null,0);Vh(a,c);c=b.b?b.b(1):b.call(null,1);Vh(a,c);return a}}(a),Ea=function(a){return function(){return new q(null,2,[pg,Jh(8),Fg,ce(2+Vf(4),function(){return function(){return aa()}}(a))],null)}}(a),Ha=function(){return function(a,b,c,d,e){c=Math.abs(e-c)<Math.abs(e-d);return I.a(a,b)?a:c?a:b}}(a),Na=function(){return function(a,b){return Lh(I.a(a,b)?Z:b)}}(a),Oa=function(a){return function(b){return v(Rh(b))?
Z:new q(null,5,[sg,v(Rh(b))?Z:Qh(b),gg,v(Rh(b))?Z:J.a(new W(null,3,5,X,[Xf,Yf,Zf],null),bi(b)),wg,v(Rh(b))?Z:zf(ce(bi(b),function(){return function(){return v(Rh(b))?Z:F(b)}}(a))),Ag,v(Rh(b))?Z:oa(b),ug,v(Rh(b))?Z:new q(null,1,[yg,v(Rh(b))?Z:Oh(b)],null)],null)}}(a),Ua=function(a){return function(b,c){var d=I.a(Z,c);Wh(b,d);if(!d){var e=ng.b(c),g=I.a(Z,e);Wh(b,g);g||(ai(b,T(e)),Qf(function(){return function(a){var c=I.a(Z,a);Wh(b,c);return c?null:p(b,a)}}(g,e,d,a),e));d=ug.b(c);e=I.a(Z,d);Wh(b,e);
e||(d=hg.b(d),e=I.a(Z,d),Wh(b,e),e||Th(b,d))}return b}}(a);return Nc([Ig,qg,Jg,kg,lg,xg],[function(a){return function(b,c){var d=c instanceof Kh,e=Fa(d)?c:Mh(c),g=(new q(null,4,[Eg,0,Bg,1,eg,2,vg,3],null)).call(null,b);return $h(function(){switch(b instanceof w?b.ba:null){case "body":return v(d)?R:wa;case "fixture":return v(d)?Ua:ub;case "coord":return v(d)?p:xa;case "snapshot":return v(d)?Pa:$g;default:throw Error([C("No matching clause: "),C(b)].join(""));}}().call(null,ci(a,g,d),e))}}(a),function(){return function(a){var b=
Zh(ByteBuffer.wrap(a));a=di(b);var c=J.a(new W(null,4,5,X,[Eg,eg,Bg,vg],null),jg.b(a)),d=ig.b(a);return Fa(c)?fg:new q(null,3,[dg,c,ig,d,og,function(){var a=function(){switch(c instanceof w?c.ba:null){case "body":return v(d)?Oa:A;case "fixture":return v(d)?F:n;case "coord":return v(d)?oa:u;case "snapshot":return v(d)?k:z;default:throw Error([C("No matching clause: "),C(c)].join(""));}}().call(null,b);return v(d)?new Kh(a,null,null,null):a}()],null)}}(a),function(){return function(a,b,c){return function(){switch(a instanceof
w?a.ba:null){case "body":return g;case "fixture":return Na;case "coord":return r;case "snapshot":return x;default:throw Error([C("No matching clause: "),C(a)].join(""));}}().call(null,b,c)}}(a),function(){return function(a,d,e){return function(){switch(a instanceof w?a.ba:null){case "body":return c;case "fixture":return E;case "coord":return b;case "snapshot":return va;default:throw Error([C("No matching clause: "),C(a)].join(""));}}().call(null,d,e)}}(a),function(){return function(a){return function(){switch(a instanceof
w?a.ba:null){case "body":return aa;case "fixture":return e;case "coord":return d;case "snapshot":return Ea;default:throw Error([C("No matching clause: "),C(a)].join(""));}}().call(null)}}(a),function(){return function(a,b,c,d,e,g){return function(){switch(a instanceof w?a.ba:null){case "body":return l;case "fixture":return h;case "coord":return ta;case "snapshot":return Ha;default:throw Error([C("No matching clause: "),C(a)].join(""));}}().call(null,b,c,d,e,g)}}(a)])}();Ig.b(ei);lg.b(ei);var fi=qg.b(ei);var gi=Rd.b?Rd.b(null):Rd.call(null,null),Mg=new q(null,5,[ag,function(a){Mf(K(["Message received: ",og.b(function(){var b=a.data;return fi.b?fi.b(b):fi.call(null,b)}())],0));return Ng(rc.b?rc.b(gi):rc.call(null,gi),a.data)},Hg,function(){return Mf(K(["Channel opened"],0))},Dg,function(a){return Mf(K(["Channel error: ",a.data],0))},mg,function(){return Mf(K(["Channel closed"],0))},bg,"arraybuffer"],null);
window.addEventListener("load",function(){Aa();var a=Lg();return Ud.a?Ud.a(gi,a):Ud.call(null,gi,a)});
})();
