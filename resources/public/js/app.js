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
b&&"undefined"==typeof a.call)return"object";return b}function aa(a){return a[ba]||(a[ba]=++da)}var ba="closure_uid_"+(1E9*Math.random()>>>0),da=0;function ea(a){return/^[\s\xa0]*$/.test(a)}function fa(a){return 1==a.length&&" "<=a&&"~">=a||"\u0080"<=a&&"\ufffd">=a};function ia(a,b){for(var c in a)b.call(void 0,a[c],c,a)};function ka(a,b){null!=a&&this.append.apply(this,arguments)}h=ka.prototype;h.pb="";h.set=function(a){this.pb=""+a};h.append=function(a,b,c){this.pb+=a;if(null!=b)for(var d=1;d<arguments.length;d++)this.pb+=arguments[d];return this};h.clear=function(){this.pb=""};h.toString=function(){return this.pb};function la(a,b){return a>b?1:a<b?-1:0};var ma,n=null;if("undefined"===typeof na)var na=function(){throw Error("No *print-fn* fn set for evaluation environment");};if("undefined"===typeof oa)var oa=function(){throw Error("No *print-err-fn* fn set for evaluation environment");};var pa=!0,ra=!0,ta=null,ua=null;if("undefined"===typeof wa)var wa=null;function za(){return new q(null,5,[Aa,!0,Ba,ra,Ca,!1,Ea,!1,Fa,ta],null)}Ga;
function Ha(){pa=!1;na=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return b.call(this,d)}function b(a){return console.log.apply(console,Ga.a?Ga.a(a):Ga.call(null,a))}a.C=0;a.G=function(a){a=r(a);return b(a)};a.i=b;return a}();oa=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return b.call(this,
d)}function b(a){return console.error.apply(console,Ga.a?Ga.a(a):Ga.call(null,a))}a.C=0;a.G=function(a){a=r(a);return b(a)};a.i=b;return a}()}function t(a){return null!=a&&!1!==a}Ja;y;function Ka(a){return a instanceof Array}function La(a){return null==a?!0:!1===a?!0:!1}function Ma(a,b){return a[l(null==b?null:b)]?!0:a._?!0:!1}function Oa(a){return null==a?null:a.constructor}
function Pa(a,b){var c=Oa(b),c=t(t(c)?c.rb:c)?c.cb:l(b);return Error(["No protocol method ",a," defined for type ",c,": ",b].join(""))}function Qa(a){var b=a.cb;return t(b)?b:""+z(a)}var Ra="undefined"!==typeof Symbol&&"function"===l(Symbol)?Symbol.iterator:"@@iterator";function Sa(a){for(var b=a.length,c=Array(b),d=0;;)if(d<b)c[d]=a[d],d+=1;else break;return c}A;Ta;
var Ga=function Ga(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return Ga.a(arguments[0]);case 2:return Ga.b(arguments[0],arguments[1]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};Ga.a=function(a){return Ga.b(null,a)};Ga.b=function(a,b){function c(a,b){a.push(b);return a}var d=[];return Ta.c?Ta.c(c,d,b):Ta.call(null,c,d,b)};Ga.C=2;function Ua(){}
var Va=function Va(b){if(null!=b&&null!=b.X)return b.X(b);var c=Va[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Va._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("ICounted.-count",b);},Wa=function Wa(b){if(null!=b&&null!=b.ea)return b.ea(b);var c=Wa[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Wa._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IEmptyableCollection.-empty",b);};function Xa(){}
var Za=function Za(b,c){if(null!=b&&null!=b.W)return b.W(b,c);var d=Za[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=Za._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("ICollection.-conj",b);};function $a(){}
var bb=function bb(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return bb.b(arguments[0],arguments[1]);case 3:return bb.c(arguments[0],arguments[1],arguments[2]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};
bb.b=function(a,b){if(null!=a&&null!=a.aa)return a.aa(a,b);var c=bb[l(null==a?null:a)];if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);c=bb._;if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);throw Pa("IIndexed.-nth",a);};bb.c=function(a,b,c){if(null!=a&&null!=a.Ia)return a.Ia(a,b,c);var d=bb[l(null==a?null:a)];if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);d=bb._;if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);throw Pa("IIndexed.-nth",a);};bb.C=3;function db(){}
var eb=function eb(b){if(null!=b&&null!=b.ha)return b.ha(b);var c=eb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=eb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("ISeq.-first",b);},fb=function fb(b){if(null!=b&&null!=b.Aa)return b.Aa(b);var c=fb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=fb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("ISeq.-rest",b);};function gb(){}function hb(){}
var ib=function ib(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return ib.b(arguments[0],arguments[1]);case 3:return ib.c(arguments[0],arguments[1],arguments[2]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};
ib.b=function(a,b){if(null!=a&&null!=a.S)return a.S(a,b);var c=ib[l(null==a?null:a)];if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);c=ib._;if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);throw Pa("ILookup.-lookup",a);};ib.c=function(a,b,c){if(null!=a&&null!=a.K)return a.K(a,b,c);var d=ib[l(null==a?null:a)];if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);d=ib._;if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);throw Pa("ILookup.-lookup",a);};ib.C=3;
var jb=function jb(b,c){if(null!=b&&null!=b.mc)return b.mc(b,c);var d=jb[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=jb._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("IAssociative.-contains-key?",b);},kb=function kb(b,c,d){if(null!=b&&null!=b.Ha)return b.Ha(b,c,d);var e=kb[l(null==b?null:b)];if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);e=kb._;if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);throw Pa("IAssociative.-assoc",b);};function lb(){}
var mb=function mb(b,c){if(null!=b&&null!=b.Ta)return b.Ta(b,c);var d=mb[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=mb._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("IMap.-dissoc",b);};function nb(){}
var pb=function pb(b){if(null!=b&&null!=b.Vb)return b.Vb(b);var c=pb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=pb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IMapEntry.-key",b);},qb=function qb(b){if(null!=b&&null!=b.Wb)return b.Wb(b);var c=qb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=qb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IMapEntry.-val",b);};function rb(){}function sb(){}
var tb=function tb(b,c,d){if(null!=b&&null!=b.zb)return b.zb(b,c,d);var e=tb[l(null==b?null:b)];if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);e=tb._;if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);throw Pa("IVector.-assoc-n",b);};function ub(){}var vb=function vb(b){if(null!=b&&null!=b.xb)return b.xb(b);var c=vb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=vb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IDeref.-deref",b);};function wb(){}
var xb=function xb(b){if(null!=b&&null!=b.L)return b.L(b);var c=xb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=xb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IMeta.-meta",b);};function yb(){}var zb=function zb(b,c){if(null!=b&&null!=b.N)return b.N(b,c);var d=zb[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=zb._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("IWithMeta.-with-meta",b);};function Ab(){}
var Bb=function Bb(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return Bb.b(arguments[0],arguments[1]);case 3:return Bb.c(arguments[0],arguments[1],arguments[2]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};
Bb.b=function(a,b){if(null!=a&&null!=a.va)return a.va(a,b);var c=Bb[l(null==a?null:a)];if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);c=Bb._;if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);throw Pa("IReduce.-reduce",a);};Bb.c=function(a,b,c){if(null!=a&&null!=a.wa)return a.wa(a,b,c);var d=Bb[l(null==a?null:a)];if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);d=Bb._;if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);throw Pa("IReduce.-reduce",a);};Bb.C=3;
var Cb=function Cb(b,c){if(null!=b&&null!=b.D)return b.D(b,c);var d=Cb[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=Cb._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("IEquiv.-equiv",b);},Db=function Db(b){if(null!=b&&null!=b.R)return b.R(b);var c=Db[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Db._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IHash.-hash",b);};function Eb(){}
var Fb=function Fb(b){if(null!=b&&null!=b.V)return b.V(b);var c=Fb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Fb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("ISeqable.-seq",b);};function Gb(){}function Hb(){}function Ib(){}
var Jb=function Jb(b){if(null!=b&&null!=b.hc)return b.hc(b);var c=Jb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Jb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IReversible.-rseq",b);},B=function B(b,c){if(null!=b&&null!=b.qb)return b.qb(b,c);var d=B[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=B._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("IWriter.-write",b);},Kb=function Kb(b){if(null!=b&&null!=b.bb)return b.bb(b);var c=Kb[l(null==
b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Kb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IWriter.-flush",b);},Lb=function Lb(b,c,d){if(null!=b&&null!=b.M)return b.M(b,c,d);var e=Lb[l(null==b?null:b)];if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);e=Lb._;if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);throw Pa("IPrintWithWriter.-pr-writer",b);};function Mb(){}
var Nb=function Nb(b){if(null!=b&&null!=b.Zc)return b.Zc(b);var c=Nb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Nb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IPending.-realized?",b);},Ob=function Ob(b,c,d){if(null!=b&&null!=b.xc)return b.xc(0,c,d);var e=Ob[l(null==b?null:b)];if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);e=Ob._;if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);throw Pa("IWatchable.-notify-watches",b);},Pb=function Pb(b){if(null!=b&&null!=
b.Ib)return b.Ib(b);var c=Pb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Pb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IEditableCollection.-as-transient",b);},Qb=function Qb(b,c){if(null!=b&&null!=b.yb)return b.yb(b,c);var d=Qb[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=Qb._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("ITransientCollection.-conj!",b);},Rb=function Rb(b){if(null!=b&&null!=b.Kb)return b.Kb(b);var c=Rb[l(null==
b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Rb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("ITransientCollection.-persistent!",b);},Sb=function Sb(b,c,d){if(null!=b&&null!=b.Zb)return b.Zb(b,c,d);var e=Sb[l(null==b?null:b)];if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);e=Sb._;if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);throw Pa("ITransientAssociative.-assoc!",b);},Tb=function Tb(b,c,d){if(null!=b&&null!=b.wc)return b.wc(0,c,d);var e=Tb[l(null==b?null:b)];if(null!=
e)return e.c?e.c(b,c,d):e.call(null,b,c,d);e=Tb._;if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);throw Pa("ITransientVector.-assoc-n!",b);};function Ub(){}
var Vb=function Vb(b,c){if(null!=b&&null!=b.wb)return b.wb(b,c);var d=Vb[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=Vb._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("IComparable.-compare",b);},Wb=function Wb(b){if(null!=b&&null!=b.tc)return b.tc();var c=Wb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Wb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IChunk.-drop-first",b);},Xb=function Xb(b){if(null!=b&&null!=b.oc)return b.oc(b);
var c=Xb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Xb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IChunkedSeq.-chunked-first",b);},Yb=function Yb(b){if(null!=b&&null!=b.pc)return b.pc(b);var c=Yb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Yb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IChunkedSeq.-chunked-rest",b);},Zb=function Zb(b){if(null!=b&&null!=b.nc)return b.nc(b);var c=Zb[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,
b);c=Zb._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IChunkedNext.-chunked-next",b);},$b=function $b(b){if(null!=b&&null!=b.Xb)return b.Xb(b);var c=$b[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=$b._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("INamed.-name",b);},ac=function ac(b){if(null!=b&&null!=b.Yb)return b.Yb(b);var c=ac[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=ac._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("INamed.-namespace",
b);},bc=function bc(b,c){if(null!=b&&null!=b.ad)return b.ad(b,c);var d=bc[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=bc._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("IReset.-reset!",b);},cc=function cc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return cc.b(arguments[0],arguments[1]);case 3:return cc.c(arguments[0],arguments[1],arguments[2]);case 4:return cc.u(arguments[0],arguments[1],arguments[2],
arguments[3]);case 5:return cc.P(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};cc.b=function(a,b){if(null!=a&&null!=a.cd)return a.cd(a,b);var c=cc[l(null==a?null:a)];if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);c=cc._;if(null!=c)return c.b?c.b(a,b):c.call(null,a,b);throw Pa("ISwap.-swap!",a);};
cc.c=function(a,b,c){if(null!=a&&null!=a.dd)return a.dd(a,b,c);var d=cc[l(null==a?null:a)];if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);d=cc._;if(null!=d)return d.c?d.c(a,b,c):d.call(null,a,b,c);throw Pa("ISwap.-swap!",a);};cc.u=function(a,b,c,d){if(null!=a&&null!=a.ed)return a.ed(a,b,c,d);var e=cc[l(null==a?null:a)];if(null!=e)return e.u?e.u(a,b,c,d):e.call(null,a,b,c,d);e=cc._;if(null!=e)return e.u?e.u(a,b,c,d):e.call(null,a,b,c,d);throw Pa("ISwap.-swap!",a);};
cc.P=function(a,b,c,d,e){if(null!=a&&null!=a.fd)return a.fd(a,b,c,d,e);var f=cc[l(null==a?null:a)];if(null!=f)return f.P?f.P(a,b,c,d,e):f.call(null,a,b,c,d,e);f=cc._;if(null!=f)return f.P?f.P(a,b,c,d,e):f.call(null,a,b,c,d,e);throw Pa("ISwap.-swap!",a);};cc.C=5;var dc=function dc(b){if(null!=b&&null!=b.za)return b.za(b);var c=dc[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=dc._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IIterable.-iterator",b);};
function fc(a){this.Ad=a;this.o=1073741824;this.F=0}fc.prototype.qb=function(a,b){return this.Ad.append(b)};fc.prototype.bb=function(){return null};function gc(a){var b=new ka,c=new fc(b);a.M(null,c,za());c.bb(null);return""+z(b)}var hc="undefined"!==typeof Math.imul&&0!==Math.imul(4294967295,5)?function(a,b){return Math.imul(a,b)}:function(a,b){var c=a&65535,d=b&65535;return c*d+((a>>>16&65535)*d+c*(b>>>16&65535)<<16>>>0)|0};
function ic(a){a=hc(a|0,-862048943);return hc(a<<15|a>>>-15,461845907)}function jc(a,b){var c=(a|0)^(b|0);return hc(c<<13|c>>>-13,5)+-430675100|0}function kc(a,b){var c=(a|0)^b,c=hc(c^c>>>16,-2048144789),c=hc(c^c>>>13,-1028477387);return c^c>>>16}function lc(a){var b;a:{b=1;for(var c=0;;)if(b<a.length){var d=b+2,c=jc(c,ic(a.charCodeAt(b-1)|a.charCodeAt(b)<<16));b=d}else{b=c;break a}}b=1===(a.length&1)?b^ic(a.charCodeAt(a.length-1)):b;return kc(b,hc(2,a.length))}mc;F;G;nc;var oc={},pc=0;
function qc(a){255<pc&&(oc={},pc=0);var b=oc[a];if("number"!==typeof b){a:if(null!=a)if(b=a.length,0<b)for(var c=0,d=0;;)if(c<b)var e=c+1,d=hc(31,d)+a.charCodeAt(c),c=e;else{b=d;break a}else b=0;else b=0;oc[a]=b;pc+=1}return a=b}function sc(a){null!=a&&(a.o&4194304||a.Gd)?a=a.R(null):"number"===typeof a?a=Math.floor(a)%2147483647:!0===a?a=1:!1===a?a=0:"string"===typeof a?(a=qc(a),0!==a&&(a=ic(a),a=jc(0,a),a=kc(a,4))):a=a instanceof Date?a.valueOf():null==a?0:Db(a);return a}
function tc(a,b){return a^b+2654435769+(a<<6)+(a>>2)}function Ja(a,b){return b instanceof a}function uc(a,b){if(a.fb===b.fb)return 0;var c=La(a.Ea);if(t(c?b.Ea:c))return-1;if(t(a.Ea)){if(La(b.Ea))return 1;c=la(a.Ea,b.Ea);return 0===c?la(a.name,b.name):c}return la(a.name,b.name)}vc;function F(a,b,c,d,e){this.Ea=a;this.name=b;this.fb=c;this.Hb=d;this.Ca=e;this.o=2154168321;this.F=4096}h=F.prototype;h.toString=function(){return this.fb};h.equiv=function(a){return this.D(null,a)};
h.D=function(a,b){return b instanceof F?this.fb===b.fb:!1};h.call=function(){function a(a,b,c){return vc.c?vc.c(b,this,c):vc.call(null,b,this,c)}function b(a,b){return vc.b?vc.b(b,this):vc.call(null,b,this)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,0,e);case 3:return a.call(this,0,e,f)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.c=a;return c}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Sa(b)))};
h.a=function(a){return vc.b?vc.b(a,this):vc.call(null,a,this)};h.b=function(a,b){return vc.c?vc.c(a,this,b):vc.call(null,a,this,b)};h.L=function(){return this.Ca};h.N=function(a,b){return new F(this.Ea,this.name,this.fb,this.Hb,b)};h.R=function(){var a=this.Hb;return null!=a?a:this.Hb=a=tc(lc(this.name),qc(this.Ea))};h.Xb=function(){return this.name};h.Yb=function(){return this.Ea};h.M=function(a,b){return B(b,this.fb)};
var wc=function wc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return wc.a(arguments[0]);case 2:return wc.b(arguments[0],arguments[1]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};wc.a=function(a){if(a instanceof F)return a;var b=a.indexOf("/");return-1===b?wc.b(null,a):wc.b(a.substring(0,b),a.substring(b+1,a.length))};wc.b=function(a,b){var c=null!=a?[z(a),z("/"),z(b)].join(""):b;return new F(a,b,c,null,null)};
wc.C=2;function xc(a,b,c){this.g=a;this.ic=b;this.Ca=c;this.o=2523137;this.F=0}h=xc.prototype;h.xb=function(){return this.g.h?this.g.h():this.g.call(null)};h.L=function(){return this.Ca};h.N=function(a,b){return new xc(this.g,this.ic,b)};h.D=function(a,b){if(b instanceof xc){var c=this.ic,d=b.ic;return G.b?G.b(c,d):G.call(null,c,d)}return!1};
h.call=function(){function a(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,R,J){a=this;a=a.g.h?a.g.h():a.g.call(null);return A.ab?A.ab(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,R,J):A.call(null,a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,R,J)}function b(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,R){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,R)}function c(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d,e,f,g,k,m,
p,u,O,v,w,x,D,C,H,E,S)}function d(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E)}function e(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H)}function f(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C)}function g(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D){a=this;return(a.g.h?a.g.h():
a.g.call(null)).call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D)}function k(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x)}function m(a,b,c,d,e,f,g,k,m,p,u,O,v,w){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d,e,f,g,k,m,p,u,O,v,w)}function p(a,b,c,d,e,f,g,k,m,p,u,O,v){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d,e,f,g,k,m,p,u,O,v)}function u(a,b,c,d,e,f,g,k,m,p,u,O){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,
b,c,d,e,f,g,k,m,p,u,O)}function v(a,b,c,d,e,f,g,k,m,p,u){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d,e,f,g,k,m,p,u)}function w(a,b,c,d,e,f,g,k,m,p){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d,e,f,g,k,m,p)}function x(a,b,c,d,e,f,g,k,m){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d,e,f,g,k,m)}function C(a,b,c,d,e,f,g,k){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d,e,f,g,k)}function E(a,b,c,d,e,f,g){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,
b,c,d,e,f,g)}function D(a,b,c,d,e,f){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d,e,f)}function H(a,b,c,d,e){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d,e)}function R(a,b,c,d){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c,d)}function S(a,b,c){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b,c)}function ya(a,b){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null,b)}function ab(a){a=this;return(a.g.h?a.g.h():a.g.call(null)).call(null)}var J=null,J=
function(va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc,J,ec,zc,rd,Oe,Fg){switch(arguments.length){case 1:return ab.call(this,va);case 2:return ya.call(this,va,Z);case 3:return S.call(this,va,Z,ca);case 4:return R.call(this,va,Z,ca,ga);case 5:return H.call(this,va,Z,ca,ga,ha);case 6:return D.call(this,va,Z,ca,ga,ha,ja);case 7:return E.call(this,va,Z,ca,ga,ha,ja,qa);case 8:return C.call(this,va,Z,ca,ga,ha,ja,qa,sa);case 9:return x.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa);case 10:return w.call(this,va,Z,
ca,ga,ha,ja,qa,sa,xa,Da);case 11:return v.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na);case 12:return u.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O);case 13:return p.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya);case 14:return m.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb);case 15:return k.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob);case 16:return g.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc);case 17:return f.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc,J);
case 18:return e.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc,J,ec);case 19:return d.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc,J,ec,zc);case 20:return c.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc,J,ec,zc,rd);case 21:return b.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc,J,ec,zc,rd,Oe);case 22:return a.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc,J,ec,zc,rd,Oe,Fg)}throw Error("Invalid arity: "+arguments.length);};J.a=ab;J.b=ya;J.c=S;J.u=R;
J.P=H;J.fa=D;J.ga=E;J.ta=C;J.ua=x;J.ia=w;J.ja=v;J.ka=u;J.la=p;J.ma=m;J.na=k;J.oa=g;J.pa=f;J.qa=e;J.ra=d;J.sa=c;J.Ub=b;J.ab=a;return J}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Sa(b)))};h.h=function(){return(this.g.h?this.g.h():this.g.call(null)).call(null)};h.a=function(a){return(this.g.h?this.g.h():this.g.call(null)).call(null,a)};h.b=function(a,b){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b)};
h.c=function(a,b,c){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c)};h.u=function(a,b,c,d){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d)};h.P=function(a,b,c,d,e){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e)};h.fa=function(a,b,c,d,e,f){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f)};h.ga=function(a,b,c,d,e,f,g){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f,g)};
h.ta=function(a,b,c,d,e,f,g,k){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f,g,k)};h.ua=function(a,b,c,d,e,f,g,k,m){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f,g,k,m)};h.ia=function(a,b,c,d,e,f,g,k,m,p){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f,g,k,m,p)};h.ja=function(a,b,c,d,e,f,g,k,m,p,u){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,u)};
h.ka=function(a,b,c,d,e,f,g,k,m,p,u,v){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,u,v)};h.la=function(a,b,c,d,e,f,g,k,m,p,u,v,w){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,u,v,w)};h.ma=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x)};
h.na=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C)};h.oa=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E)};h.pa=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D)};
h.qa=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H)};h.ra=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R)};h.sa=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S){return(this.g.h?this.g.h():this.g.call(null)).call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S)};
h.Ub=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya){var ab=this.g.h?this.g.h():this.g.call(null);return A.ab?A.ab(ab,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya):A.call(null,ab,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya)};I;yc;Ia;function r(a){if(null==a)return null;if(null!=a&&(a.o&8388608||a.bd))return a.V(null);if(Ka(a)||"string"===typeof a)return 0===a.length?null:new Ia(a,0);if(Ma(Eb,a))return Fb(a);throw Error([z(a),z(" is not ISeqable")].join(""));}
function K(a){if(null==a)return null;if(null!=a&&(a.o&64||a.Jb))return a.ha(null);a=r(a);return null==a?null:eb(a)}function Ac(a){return null!=a?null!=a&&(a.o&64||a.Jb)?a.Aa(null):(a=r(a))?fb(a):Bc:Bc}function L(a){return null==a?null:null!=a&&(a.o&128||a.gc)?a.Da(null):r(Ac(a))}
var G=function G(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return G.a(arguments[0]);case 2:return G.b(arguments[0],arguments[1]);default:return c=new Ia(c.slice(2),0),G.i(arguments[0],arguments[1],c)}};G.a=function(){return!0};G.b=function(a,b){return null==a?null==b:a===b||Cb(a,b)};G.i=function(a,b,c){for(;;)if(G.b(a,b))if(L(c))a=b,b=K(c),c=L(c);else return G.b(b,K(c));else return!1};
G.G=function(a){var b=K(a),c=L(a);a=K(c);c=L(c);return G.i(b,a,c)};G.C=2;function Cc(a){this.T=a}Cc.prototype.next=function(){if(null!=this.T){var a=K(this.T);this.T=L(this.T);return{value:a,done:!1}}return{value:null,done:!0}};function Dc(a){return new Cc(r(a))}Ec;function Fc(a,b,c){this.value=a;this.Pb=b;this.jc=c;this.o=8388672;this.F=0}Fc.prototype.V=function(){return this};Fc.prototype.ha=function(){return this.value};
Fc.prototype.Aa=function(){null==this.jc&&(this.jc=Ec.a?Ec.a(this.Pb):Ec.call(null,this.Pb));return this.jc};function Ec(a){var b=a.next();return t(b.done)?Bc:new Fc(b.value,a,null)}function Gc(a,b){var c=ic(a),c=jc(0,c);return kc(c,b)}function Hc(a){var b=0,c=1;for(a=r(a);;)if(null!=a)b+=1,c=hc(31,c)+sc(K(a))|0,a=L(a);else return Gc(c,b)}var Ic=Gc(1,0);function Jc(a){var b=0,c=0;for(a=r(a);;)if(null!=a)b+=1,c=c+sc(K(a))|0,a=L(a);else return Gc(c,b)}var Kc=Gc(0,0);Lc;mc;Nc;Ua["null"]=!0;
Va["null"]=function(){return 0};Date.prototype.D=function(a,b){return b instanceof Date&&this.valueOf()===b.valueOf()};Date.prototype.Tb=!0;Date.prototype.wb=function(a,b){if(b instanceof Date)return la(this.valueOf(),b.valueOf());throw Error([z("Cannot compare "),z(this),z(" to "),z(b)].join(""));};Cb.number=function(a,b){return a===b};Oc;wb["function"]=!0;xb["function"]=function(){return null};Db._=function(a){return aa(a)};M;function Pc(a){this.g=a;this.o=32768;this.F=0}Pc.prototype.xb=function(){return this.g};
function Qc(a){return a instanceof Pc}function M(a){return vb(a)}function Rc(a,b){var c=Va(a);if(0===c)return b.h?b.h():b.call(null);for(var d=bb.b(a,0),e=1;;)if(e<c){var f=bb.b(a,e),d=b.b?b.b(d,f):b.call(null,d,f);if(Qc(d))return vb(d);e+=1}else return d}function Sc(a,b,c){var d=Va(a),e=c;for(c=0;;)if(c<d){var f=bb.b(a,c),e=b.b?b.b(e,f):b.call(null,e,f);if(Qc(e))return vb(e);c+=1}else return e}
function Tc(a,b){var c=a.length;if(0===a.length)return b.h?b.h():b.call(null);for(var d=a[0],e=1;;)if(e<c){var f=a[e],d=b.b?b.b(d,f):b.call(null,d,f);if(Qc(d))return vb(d);e+=1}else return d}function Uc(a,b,c){var d=a.length,e=c;for(c=0;;)if(c<d){var f=a[c],e=b.b?b.b(e,f):b.call(null,e,f);if(Qc(e))return vb(e);c+=1}else return e}function Vc(a,b,c,d){for(var e=a.length;;)if(d<e){var f=a[d];c=b.b?b.b(c,f):b.call(null,c,f);if(Qc(c))return vb(c);d+=1}else return c}Wc;Xc;Yc;Zc;
function $c(a){return null!=a?a.o&2||a.Rc?!0:a.o?!1:Ma(Ua,a):Ma(Ua,a)}function ad(a){return null!=a?a.o&16||a.vc?!0:a.o?!1:Ma($a,a):Ma($a,a)}function bd(a,b){this.f=a;this.v=b}bd.prototype.xa=function(){return this.v<this.f.length};bd.prototype.next=function(){var a=this.f[this.v];this.v+=1;return a};function Ia(a,b){this.f=a;this.v=b;this.o=166199550;this.F=8192}h=Ia.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};
h.aa=function(a,b){var c=b+this.v;return c<this.f.length?this.f[c]:null};h.Ia=function(a,b,c){a=b+this.v;return a<this.f.length?this.f[a]:c};h.za=function(){return new bd(this.f,this.v)};h.Da=function(){return this.v+1<this.f.length?new Ia(this.f,this.v+1):null};h.X=function(){var a=this.f.length-this.v;return 0>a?0:a};h.hc=function(){var a=Va(this);return 0<a?new Yc(this,a-1,null):null};h.R=function(){return Hc(this)};h.D=function(a,b){return Nc.b?Nc.b(this,b):Nc.call(null,this,b)};h.ea=function(){return Bc};
h.va=function(a,b){return Vc(this.f,b,this.f[this.v],this.v+1)};h.wa=function(a,b,c){return Vc(this.f,b,c,this.v)};h.ha=function(){return this.f[this.v]};h.Aa=function(){return this.v+1<this.f.length?new Ia(this.f,this.v+1):Bc};h.V=function(){return this.v<this.f.length?this:null};h.W=function(a,b){return Xc.b?Xc.b(b,this):Xc.call(null,b,this)};Ia.prototype[Ra]=function(){return Dc(this)};
var yc=function yc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return yc.a(arguments[0]);case 2:return yc.b(arguments[0],arguments[1]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};yc.a=function(a){return yc.b(a,0)};yc.b=function(a,b){return b<a.length?new Ia(a,b):null};yc.C=2;
var I=function I(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return I.a(arguments[0]);case 2:return I.b(arguments[0],arguments[1]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};I.a=function(a){return yc.b(a,0)};I.b=function(a,b){return yc.b(a,b)};I.C=2;Oc;cd;function Yc(a,b,c){this.fc=a;this.v=b;this.B=c;this.o=32374990;this.F=8192}h=Yc.prototype;h.toString=function(){return gc(this)};
h.equiv=function(a){return this.D(null,a)};h.L=function(){return this.B};h.Da=function(){return 0<this.v?new Yc(this.fc,this.v-1,null):null};h.X=function(){return this.v+1};h.R=function(){return Hc(this)};h.D=function(a,b){return Nc.b?Nc.b(this,b):Nc.call(null,this,b)};h.ea=function(){var a=Bc,b=this.B;return Oc.b?Oc.b(a,b):Oc.call(null,a,b)};h.va=function(a,b){return cd.b?cd.b(b,this):cd.call(null,b,this)};h.wa=function(a,b,c){return cd.c?cd.c(b,c,this):cd.call(null,b,c,this)};
h.ha=function(){return bb.b(this.fc,this.v)};h.Aa=function(){return 0<this.v?new Yc(this.fc,this.v-1,null):Bc};h.V=function(){return this};h.N=function(a,b){return new Yc(this.fc,this.v,b)};h.W=function(a,b){return Xc.b?Xc.b(b,this):Xc.call(null,b,this)};Yc.prototype[Ra]=function(){return Dc(this)};function dd(a){return K(L(a))}function ed(a){for(;;){var b=L(a);if(null!=b)a=b;else return K(a)}}Cb._=function(a,b){return a===b};
var fd=function fd(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return fd.h();case 1:return fd.a(arguments[0]);case 2:return fd.b(arguments[0],arguments[1]);default:return c=new Ia(c.slice(2),0),fd.i(arguments[0],arguments[1],c)}};fd.h=function(){return gd};fd.a=function(a){return a};fd.b=function(a,b){return null!=a?Za(a,b):Za(Bc,b)};fd.i=function(a,b,c){for(;;)if(t(c))a=fd.b(a,b),b=K(c),c=L(c);else return fd.b(a,b)};
fd.G=function(a){var b=K(a),c=L(a);a=K(c);c=L(c);return fd.i(b,a,c)};fd.C=2;function N(a){if(null!=a)if(null!=a&&(a.o&2||a.Rc))a=a.X(null);else if(Ka(a))a=a.length;else if("string"===typeof a)a=a.length;else if(null!=a&&(a.o&8388608||a.bd))a:{a=r(a);for(var b=0;;){if($c(a)){a=b+Va(a);break a}a=L(a);b+=1}}else a=Va(a);else a=0;return a}function hd(a,b){for(var c=null;;){if(null==a)return c;if(0===b)return r(a)?K(a):c;if(ad(a))return bb.c(a,b,c);if(r(a)){var d=L(a),e=b-1;a=d;b=e}else return c}}
function id(a,b){if("number"!==typeof b)throw Error("index argument to nth must be a number");if(null==a)return a;if(null!=a&&(a.o&16||a.vc))return a.aa(null,b);if(Ka(a))return b<a.length?a[b]:null;if("string"===typeof a)return b<a.length?a.charAt(b):null;if(null!=a&&(a.o&64||a.Jb)){var c;a:{c=a;for(var d=b;;){if(null==c)throw Error("Index out of bounds");if(0===d){if(r(c)){c=K(c);break a}throw Error("Index out of bounds");}if(ad(c)){c=bb.b(c,d);break a}if(r(c))c=L(c),--d;else throw Error("Index out of bounds");
}}return c}if(Ma($a,a))return bb.b(a,b);throw Error([z("nth not supported on this type "),z(Qa(Oa(a)))].join(""));}
function P(a,b){if("number"!==typeof b)throw Error("index argument to nth must be a number.");if(null==a)return null;if(null!=a&&(a.o&16||a.vc))return a.Ia(null,b,null);if(Ka(a))return b<a.length?a[b]:null;if("string"===typeof a)return b<a.length?a.charAt(b):null;if(null!=a&&(a.o&64||a.Jb))return hd(a,b);if(Ma($a,a))return bb.b(a,b);throw Error([z("nth not supported on this type "),z(Qa(Oa(a)))].join(""));}
var vc=function vc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return vc.b(arguments[0],arguments[1]);case 3:return vc.c(arguments[0],arguments[1],arguments[2]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};vc.b=function(a,b){return null==a?null:null!=a&&(a.o&256||a.Uc)?a.S(null,b):Ka(a)?b<a.length?a[b|0]:null:"string"===typeof a?b<a.length?a[b|0]:null:Ma(hb,a)?ib.b(a,b):null};
vc.c=function(a,b,c){return null!=a?null!=a&&(a.o&256||a.Uc)?a.K(null,b,c):Ka(a)?b<a.length?a[b]:c:"string"===typeof a?b<a.length?a[b]:c:Ma(hb,a)?ib.c(a,b,c):c:c};vc.C=3;jd;var kd=function kd(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 3:return kd.c(arguments[0],arguments[1],arguments[2]);default:return c=new Ia(c.slice(3),0),kd.i(arguments[0],arguments[1],arguments[2],c)}};kd.c=function(a,b,c){return null!=a?kb(a,b,c):ld([b],[c])};
kd.i=function(a,b,c,d){for(;;)if(a=kd.c(a,b,c),t(d))b=K(d),c=dd(d),d=L(L(d));else return a};kd.G=function(a){var b=K(a),c=L(a);a=K(c);var d=L(c),c=K(d),d=L(d);return kd.i(b,a,c,d)};kd.C=3;var md=function md(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return md.a(arguments[0]);case 2:return md.b(arguments[0],arguments[1]);default:return c=new Ia(c.slice(2),0),md.i(arguments[0],arguments[1],c)}};md.a=function(a){return a};
md.b=function(a,b){return null==a?null:mb(a,b)};md.i=function(a,b,c){for(;;){if(null==a)return null;a=md.b(a,b);if(t(c))b=K(c),c=L(c);else return a}};md.G=function(a){var b=K(a),c=L(a);a=K(c);c=L(c);return md.i(b,a,c)};md.C=2;function nd(a,b){this.j=a;this.B=b;this.o=393217;this.F=0}h=nd.prototype;h.L=function(){return this.B};h.N=function(a,b){return new nd(this.j,b)};
h.call=function(){function a(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,R,J){a=this;return A.ab?A.ab(a.j,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,R,J):A.call(null,a.j,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,R,J)}function b(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,R){a=this;return a.j.sa?a.j.sa(b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,R):a.j.call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,R)}function c(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S){a=this;return a.j.ra?a.j.ra(b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S):
a.j.call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S)}function d(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E){a=this;return a.j.qa?a.j.qa(b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E):a.j.call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E)}function e(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H){a=this;return a.j.pa?a.j.pa(b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H):a.j.call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H)}function f(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C){a=this;return a.j.oa?a.j.oa(b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C):a.j.call(null,b,
c,d,e,f,g,k,m,p,u,O,v,w,x,D,C)}function g(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D){a=this;return a.j.na?a.j.na(b,c,d,e,f,g,k,m,p,u,O,v,w,x,D):a.j.call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D)}function k(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x){a=this;return a.j.ma?a.j.ma(b,c,d,e,f,g,k,m,p,u,O,v,w,x):a.j.call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x)}function m(a,b,c,d,e,f,g,k,m,p,u,O,v,w){a=this;return a.j.la?a.j.la(b,c,d,e,f,g,k,m,p,u,O,v,w):a.j.call(null,b,c,d,e,f,g,k,m,p,u,O,v,w)}function p(a,b,c,d,e,f,g,k,m,p,u,O,v){a=this;
return a.j.ka?a.j.ka(b,c,d,e,f,g,k,m,p,u,O,v):a.j.call(null,b,c,d,e,f,g,k,m,p,u,O,v)}function u(a,b,c,d,e,f,g,k,m,p,u,O){a=this;return a.j.ja?a.j.ja(b,c,d,e,f,g,k,m,p,u,O):a.j.call(null,b,c,d,e,f,g,k,m,p,u,O)}function v(a,b,c,d,e,f,g,k,m,p,u){a=this;return a.j.ia?a.j.ia(b,c,d,e,f,g,k,m,p,u):a.j.call(null,b,c,d,e,f,g,k,m,p,u)}function w(a,b,c,d,e,f,g,k,m,p){a=this;return a.j.ua?a.j.ua(b,c,d,e,f,g,k,m,p):a.j.call(null,b,c,d,e,f,g,k,m,p)}function x(a,b,c,d,e,f,g,k,m){a=this;return a.j.ta?a.j.ta(b,c,
d,e,f,g,k,m):a.j.call(null,b,c,d,e,f,g,k,m)}function C(a,b,c,d,e,f,g,k){a=this;return a.j.ga?a.j.ga(b,c,d,e,f,g,k):a.j.call(null,b,c,d,e,f,g,k)}function E(a,b,c,d,e,f,g){a=this;return a.j.fa?a.j.fa(b,c,d,e,f,g):a.j.call(null,b,c,d,e,f,g)}function D(a,b,c,d,e,f){a=this;return a.j.P?a.j.P(b,c,d,e,f):a.j.call(null,b,c,d,e,f)}function H(a,b,c,d,e){a=this;return a.j.u?a.j.u(b,c,d,e):a.j.call(null,b,c,d,e)}function R(a,b,c,d){a=this;return a.j.c?a.j.c(b,c,d):a.j.call(null,b,c,d)}function S(a,b,c){a=this;
return a.j.b?a.j.b(b,c):a.j.call(null,b,c)}function ya(a,b){a=this;return a.j.a?a.j.a(b):a.j.call(null,b)}function ab(a){a=this;return a.j.h?a.j.h():a.j.call(null)}var J=null,J=function(va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,J,Mc,ec,zc,rd,Oe,Fg){switch(arguments.length){case 1:return ab.call(this,va);case 2:return ya.call(this,va,Z);case 3:return S.call(this,va,Z,ca);case 4:return R.call(this,va,Z,ca,ga);case 5:return H.call(this,va,Z,ca,ga,ha);case 6:return D.call(this,va,Z,ca,ga,ha,ja);case 7:return E.call(this,
va,Z,ca,ga,ha,ja,qa);case 8:return C.call(this,va,Z,ca,ga,ha,ja,qa,sa);case 9:return x.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa);case 10:return w.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da);case 11:return v.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na);case 12:return u.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O);case 13:return p.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya);case 14:return m.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb);case 15:return k.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,
ob);case 16:return g.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,J);case 17:return f.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,J,Mc);case 18:return e.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,J,Mc,ec);case 19:return d.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,J,Mc,ec,zc);case 20:return c.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,J,Mc,ec,zc,rd);case 21:return b.call(this,va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,J,Mc,ec,zc,rd,Oe);case 22:return a.call(this,
va,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,J,Mc,ec,zc,rd,Oe,Fg)}throw Error("Invalid arity: "+arguments.length);};J.a=ab;J.b=ya;J.c=S;J.u=R;J.P=H;J.fa=D;J.ga=E;J.ta=C;J.ua=x;J.ia=w;J.ja=v;J.ka=u;J.la=p;J.ma=m;J.na=k;J.oa=g;J.pa=f;J.qa=e;J.ra=d;J.sa=c;J.Ub=b;J.ab=a;return J}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Sa(b)))};h.h=function(){return this.j.h?this.j.h():this.j.call(null)};h.a=function(a){return this.j.a?this.j.a(a):this.j.call(null,a)};
h.b=function(a,b){return this.j.b?this.j.b(a,b):this.j.call(null,a,b)};h.c=function(a,b,c){return this.j.c?this.j.c(a,b,c):this.j.call(null,a,b,c)};h.u=function(a,b,c,d){return this.j.u?this.j.u(a,b,c,d):this.j.call(null,a,b,c,d)};h.P=function(a,b,c,d,e){return this.j.P?this.j.P(a,b,c,d,e):this.j.call(null,a,b,c,d,e)};h.fa=function(a,b,c,d,e,f){return this.j.fa?this.j.fa(a,b,c,d,e,f):this.j.call(null,a,b,c,d,e,f)};
h.ga=function(a,b,c,d,e,f,g){return this.j.ga?this.j.ga(a,b,c,d,e,f,g):this.j.call(null,a,b,c,d,e,f,g)};h.ta=function(a,b,c,d,e,f,g,k){return this.j.ta?this.j.ta(a,b,c,d,e,f,g,k):this.j.call(null,a,b,c,d,e,f,g,k)};h.ua=function(a,b,c,d,e,f,g,k,m){return this.j.ua?this.j.ua(a,b,c,d,e,f,g,k,m):this.j.call(null,a,b,c,d,e,f,g,k,m)};h.ia=function(a,b,c,d,e,f,g,k,m,p){return this.j.ia?this.j.ia(a,b,c,d,e,f,g,k,m,p):this.j.call(null,a,b,c,d,e,f,g,k,m,p)};
h.ja=function(a,b,c,d,e,f,g,k,m,p,u){return this.j.ja?this.j.ja(a,b,c,d,e,f,g,k,m,p,u):this.j.call(null,a,b,c,d,e,f,g,k,m,p,u)};h.ka=function(a,b,c,d,e,f,g,k,m,p,u,v){return this.j.ka?this.j.ka(a,b,c,d,e,f,g,k,m,p,u,v):this.j.call(null,a,b,c,d,e,f,g,k,m,p,u,v)};h.la=function(a,b,c,d,e,f,g,k,m,p,u,v,w){return this.j.la?this.j.la(a,b,c,d,e,f,g,k,m,p,u,v,w):this.j.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w)};
h.ma=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x){return this.j.ma?this.j.ma(a,b,c,d,e,f,g,k,m,p,u,v,w,x):this.j.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x)};h.na=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C){return this.j.na?this.j.na(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C):this.j.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C)};h.oa=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E){return this.j.oa?this.j.oa(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E):this.j.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E)};
h.pa=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D){return this.j.pa?this.j.pa(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D):this.j.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D)};h.qa=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H){return this.j.qa?this.j.qa(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H):this.j.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H)};
h.ra=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R){return this.j.ra?this.j.ra(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R):this.j.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R)};h.sa=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S){return this.j.sa?this.j.sa(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S):this.j.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S)};
h.Ub=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya){return A.ab?A.ab(this.j,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya):A.call(null,this.j,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya)};function Oc(a,b){return"function"==l(a)?new nd(a,b):null==a?null:zb(a,b)}function od(a){var b=null!=a;return(b?null!=a?a.o&131072||a.Xc||(a.o?0:Ma(wb,a)):Ma(wb,a):b)?xb(a):null}function pd(a){return null==a||La(r(a))}function qd(a){return null==a?!1:null!=a?a.o&8||a.Ed?!0:a.o?!1:Ma(Xa,a):Ma(Xa,a)}
function sd(a){return null==a?!1:null!=a?a.o&4096||a.Ld?!0:a.o?!1:Ma(rb,a):Ma(rb,a)}function td(a){return null!=a?a.o&16777216||a.Kd?!0:a.o?!1:Ma(Gb,a):Ma(Gb,a)}function ud(a){return null==a?!1:null!=a?a.o&1024||a.Vc?!0:a.o?!1:Ma(lb,a):Ma(lb,a)}function vd(a){return null!=a?a.o&16384||a.Md?!0:a.o?!1:Ma(sb,a):Ma(sb,a)}wd;xd;function yd(a){return null!=a?a.F&512||a.Dd?!0:!1:!1}function zd(a){var b=[];ia(a,function(a,b){return function(a,c){return b.push(c)}}(a,b));return b}
function Ad(a,b,c,d,e){for(;0!==e;)c[d]=a[b],d+=1,--e,b+=1}var Bd={};function Cd(a){return null==a?!1:!1===a?!1:!0}function Dd(a){return"number"===typeof a&&!isNaN(a)&&Infinity!==a&&parseFloat(a)===parseInt(a,10)}function Ed(a,b){return vc.c(a,b,Bd)===Bd?!1:!0}
function nc(a,b){if(a===b)return 0;if(null==a)return-1;if(null==b)return 1;if("number"===typeof a){if("number"===typeof b)return la(a,b);throw Error([z("Cannot compare "),z(a),z(" to "),z(b)].join(""));}if(null!=a?a.F&2048||a.Tb||(a.F?0:Ma(Ub,a)):Ma(Ub,a))return Vb(a,b);if("string"!==typeof a&&!Ka(a)&&!0!==a&&!1!==a||Oa(a)!==Oa(b))throw Error([z("Cannot compare "),z(a),z(" to "),z(b)].join(""));return la(a,b)}
function Fd(a,b){var c=N(a),d=N(b);if(c<d)c=-1;else if(c>d)c=1;else if(0===c)c=0;else a:for(d=0;;){var e=nc(id(a,d),id(b,d));if(0===e&&d+1<c)d+=1;else{c=e;break a}}return c}Gd;var cd=function cd(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return cd.b(arguments[0],arguments[1]);case 3:return cd.c(arguments[0],arguments[1],arguments[2]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};
cd.b=function(a,b){var c=r(b);if(c){var d=K(c),c=L(c);return Ta.c?Ta.c(a,d,c):Ta.call(null,a,d,c)}return a.h?a.h():a.call(null)};cd.c=function(a,b,c){for(c=r(c);;)if(c){var d=K(c);b=a.b?a.b(b,d):a.call(null,b,d);if(Qc(b))return vb(b);c=L(c)}else return b};cd.C=3;Hd;
var Ta=function Ta(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return Ta.b(arguments[0],arguments[1]);case 3:return Ta.c(arguments[0],arguments[1],arguments[2]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};Ta.b=function(a,b){return null!=b&&(b.o&524288||b.$c)?b.va(null,a):Ka(b)?Tc(b,a):"string"===typeof b?Tc(b,a):Ma(Ab,b)?Bb.b(b,a):cd.b(a,b)};
Ta.c=function(a,b,c){return null!=c&&(c.o&524288||c.$c)?c.wa(null,a,b):Ka(c)?Uc(c,a,b):"string"===typeof c?Uc(c,a,b):Ma(Ab,c)?Bb.c(c,a,b):cd.c(a,b,c)};Ta.C=3;function Id(a){return a}var Jd=function Jd(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return Jd.h();case 1:return Jd.a(arguments[0]);case 2:return Jd.b(arguments[0],arguments[1]);default:return c=new Ia(c.slice(2),0),Jd.i(arguments[0],arguments[1],c)}};Jd.h=function(){return 0};
Jd.a=function(a){return a};Jd.b=function(a,b){return a+b};Jd.i=function(a,b,c){return Ta.c(Jd,a+b,c)};Jd.G=function(a){var b=K(a),c=L(a);a=K(c);c=L(c);return Jd.i(b,a,c)};Jd.C=2;({}).divide;function Kd(a){if("number"===typeof a)return String.fromCharCode(a);if("string"===typeof a&&1===a.length)return a;throw Error("Argument to char must be a character or number");}Ld;function Md(a){return 0<=a?Math.floor(a):Math.ceil(a)}function Ld(a,b){return(a%b+b)%b}function Nd(a,b){return Md((a-a%b)/b)}
function Od(a,b){return a-b*Nd(a,b)}function Pd(a){a-=a>>1&1431655765;a=(a&858993459)+(a>>2&858993459);return 16843009*(a+(a>>4)&252645135)>>24}function Qd(a,b){for(var c=b,d=r(a);;)if(d&&0<c)--c,d=L(d);else return d}var z=function z(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return z.h();case 1:return z.a(arguments[0]);default:return c=new Ia(c.slice(1),0),z.i(arguments[0],c)}};z.h=function(){return""};
z.a=function(a){return null==a?"":""+a};z.i=function(a,b){for(var c=new ka(""+z(a)),d=b;;)if(t(d))c=c.append(""+z(K(d))),d=L(d);else return c.toString()};z.G=function(a){var b=K(a);a=L(a);return z.i(b,a)};z.C=1;function Rd(a,b){return a.substring(b)}Sd;Td;function Nc(a,b){var c;if(td(b))if($c(a)&&$c(b)&&N(a)!==N(b))c=!1;else a:{c=r(a);for(var d=r(b);;){if(null==c){c=null==d;break a}if(null!=d&&G.b(K(c),K(d)))c=L(c),d=L(d);else{c=!1;break a}}}else c=null;return Cd(c)}
function Wc(a){if(r(a)){var b=sc(K(a));for(a=L(a);;){if(null==a)return b;b=tc(b,sc(K(a)));a=L(a)}}else return 0}Ud;Vd;function Wd(a){var b=0;for(a=r(a);;)if(a){var c=K(a),b=(b+(sc(Ud.a?Ud.a(c):Ud.call(null,c))^sc(Vd.a?Vd.a(c):Vd.call(null,c))))%4503599627370496;a=L(a)}else return b}Td;Xd;Yd;function Zc(a,b,c,d,e){this.B=a;this.first=b;this.da=c;this.count=d;this.s=e;this.o=65937646;this.F=8192}h=Zc.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.L=function(){return this.B};
h.Da=function(){return 1===this.count?null:this.da};h.X=function(){return this.count};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Hc(this)};h.D=function(a,b){return Nc(this,b)};h.ea=function(){return zb(Bc,this.B)};h.va=function(a,b){return cd.b(b,this)};h.wa=function(a,b,c){return cd.c(b,c,this)};h.ha=function(){return this.first};h.Aa=function(){return 1===this.count?Bc:this.da};h.V=function(){return this};h.N=function(a,b){return new Zc(b,this.first,this.da,this.count,this.s)};
h.W=function(a,b){return new Zc(this.B,b,this,this.count+1,null)};Zc.prototype[Ra]=function(){return Dc(this)};function Zd(a){this.B=a;this.o=65937614;this.F=8192}h=Zd.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.L=function(){return this.B};h.Da=function(){return null};h.X=function(){return 0};h.R=function(){return Ic};h.D=function(a,b){return(null!=b?b.o&33554432||b.Hd||(b.o?0:Ma(Hb,b)):Ma(Hb,b))||td(b)?null==r(b):!1};h.ea=function(){return this};
h.va=function(a,b){return cd.b(b,this)};h.wa=function(a,b,c){return cd.c(b,c,this)};h.ha=function(){return null};h.Aa=function(){return Bc};h.V=function(){return null};h.N=function(a,b){return new Zd(b)};h.W=function(a,b){return new Zc(this.B,b,null,1,null)};var Bc=new Zd(null);Zd.prototype[Ra]=function(){return Dc(this)};function $d(a){return(null!=a?a.o&134217728||a.Jd||(a.o?0:Ma(Ib,a)):Ma(Ib,a))?Jb(a):Ta.c(fd,Bc,a)}
var mc=function mc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ia(c.slice(0),0):null;return mc.i(c)};mc.i=function(a){var b;if(a instanceof Ia&&0===a.v)b=a.f;else a:for(b=[];;)if(null!=a)b.push(a.ha(null)),a=a.Da(null);else break a;a=b.length;for(var c=Bc;;)if(0<a){var d=a-1,c=c.W(null,b[a-1]);a=d}else return c};mc.C=0;mc.G=function(a){return mc.i(r(a))};
function ae(a,b,c,d){this.B=a;this.first=b;this.da=c;this.s=d;this.o=65929452;this.F=8192}h=ae.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.L=function(){return this.B};h.Da=function(){return null==this.da?null:r(this.da)};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Hc(this)};h.D=function(a,b){return Nc(this,b)};h.ea=function(){return Oc(Bc,this.B)};h.va=function(a,b){return cd.b(b,this)};h.wa=function(a,b,c){return cd.c(b,c,this)};h.ha=function(){return this.first};
h.Aa=function(){return null==this.da?Bc:this.da};h.V=function(){return this};h.N=function(a,b){return new ae(b,this.first,this.da,this.s)};h.W=function(a,b){return new ae(null,b,this,this.s)};ae.prototype[Ra]=function(){return Dc(this)};function Xc(a,b){var c=null==b;return(c?c:null!=b&&(b.o&64||b.Jb))?new ae(null,a,b,null):new ae(null,a,r(b),null)}
function be(a,b){if(a.Y===b.Y)return 0;var c=La(a.Ea);if(t(c?b.Ea:c))return-1;if(t(a.Ea)){if(La(b.Ea))return 1;c=la(a.Ea,b.Ea);return 0===c?la(a.name,b.name):c}return la(a.name,b.name)}function y(a,b,c,d){this.Ea=a;this.name=b;this.Y=c;this.Hb=d;this.o=2153775105;this.F=4096}h=y.prototype;h.toString=function(){return[z(":"),z(this.Y)].join("")};h.equiv=function(a){return this.D(null,a)};h.D=function(a,b){return b instanceof y?this.Y===b.Y:!1};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return vc.b(c,this);case 3:return vc.c(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return vc.b(c,this)};a.c=function(a,c,d){return vc.c(c,this,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Sa(b)))};h.a=function(a){return vc.b(a,this)};h.b=function(a,b){return vc.c(a,this,b)};
h.R=function(){var a=this.Hb;return null!=a?a:this.Hb=a=tc(lc(this.name),qc(this.Ea))+2654435769|0};h.Xb=function(){return this.name};h.Yb=function(){return this.Ea};h.M=function(a,b){return B(b,[z(":"),z(this.Y)].join(""))};function Q(a,b){return a===b?!0:a instanceof y&&b instanceof y?a.Y===b.Y:!1}function ce(a){if(null!=a&&(a.F&4096||a.Yc))return a.Yb(null);throw Error([z("Doesn't support namespace: "),z(a)].join(""));}
var de=function de(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return de.a(arguments[0]);case 2:return de.b(arguments[0],arguments[1]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};de.a=function(a){if(a instanceof y)return a;if(a instanceof F)return new y(ce(a),Td.a?Td.a(a):Td.call(null,a),a.fb,null);if("string"===typeof a){var b=a.split("/");return 2===b.length?new y(b[0],b[1],a,null):new y(null,b[0],a,null)}return null};
de.b=function(a,b){return new y(a,b,[z(t(a)?[z(a),z("/")].join(""):null),z(b)].join(""),null)};de.C=2;function ee(a,b,c,d){this.B=a;this.Mb=b;this.T=c;this.s=d;this.o=32374988;this.F=0}h=ee.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};function fe(a){null!=a.Mb&&(a.T=a.Mb.h?a.Mb.h():a.Mb.call(null),a.Mb=null);return a.T}h.L=function(){return this.B};h.Da=function(){Fb(this);return null==this.T?null:L(this.T)};
h.R=function(){var a=this.s;return null!=a?a:this.s=a=Hc(this)};h.D=function(a,b){return Nc(this,b)};h.ea=function(){return Oc(Bc,this.B)};h.va=function(a,b){return cd.b(b,this)};h.wa=function(a,b,c){return cd.c(b,c,this)};h.ha=function(){Fb(this);return null==this.T?null:K(this.T)};h.Aa=function(){Fb(this);return null!=this.T?Ac(this.T):Bc};h.V=function(){fe(this);if(null==this.T)return null;for(var a=this.T;;)if(a instanceof ee)a=fe(a);else return this.T=a,r(this.T)};
h.N=function(a,b){return new ee(b,this.Mb,this.T,this.s)};h.W=function(a,b){return Xc(b,this)};ee.prototype[Ra]=function(){return Dc(this)};ge;function he(a,b){this.lc=a;this.end=b;this.o=2;this.F=0}he.prototype.add=function(a){this.lc[this.end]=a;return this.end+=1};he.prototype.ya=function(){var a=new ge(this.lc,0,this.end);this.lc=null;return a};he.prototype.X=function(){return this.end};function ie(a){return new he(Array(a),0)}
function ge(a,b,c){this.f=a;this.Ba=b;this.end=c;this.o=524306;this.F=0}h=ge.prototype;h.X=function(){return this.end-this.Ba};h.aa=function(a,b){return this.f[this.Ba+b]};h.Ia=function(a,b,c){return 0<=b&&b<this.end-this.Ba?this.f[this.Ba+b]:c};h.tc=function(){if(this.Ba===this.end)throw Error("-drop-first of empty chunk");return new ge(this.f,this.Ba+1,this.end)};h.va=function(a,b){return Vc(this.f,b,this.f[this.Ba],this.Ba+1)};h.wa=function(a,b,c){return Vc(this.f,b,c,this.Ba)};
function wd(a,b,c,d){this.ya=a;this.eb=b;this.B=c;this.s=d;this.o=31850732;this.F=1536}h=wd.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.L=function(){return this.B};h.Da=function(){if(1<Va(this.ya))return new wd(Wb(this.ya),this.eb,this.B,null);var a=Fb(this.eb);return null==a?null:a};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Hc(this)};h.D=function(a,b){return Nc(this,b)};h.ea=function(){return Oc(Bc,this.B)};
h.ha=function(){return bb.b(this.ya,0)};h.Aa=function(){return 1<Va(this.ya)?new wd(Wb(this.ya),this.eb,this.B,null):null==this.eb?Bc:this.eb};h.V=function(){return this};h.oc=function(){return this.ya};h.pc=function(){return null==this.eb?Bc:this.eb};h.N=function(a,b){return new wd(this.ya,this.eb,b,this.s)};h.W=function(a,b){return Xc(b,this)};h.nc=function(){return null==this.eb?null:this.eb};wd.prototype[Ra]=function(){return Dc(this)};
function je(a,b){return 0===Va(a)?b:new wd(a,b,null,null)}function ke(a,b){a.add(b)}function Xd(a){return Xb(a)}function Yd(a){return Yb(a)}function Gd(a){for(var b=[];;)if(r(a))b.push(K(a)),a=L(a);else return b}function le(a,b){if($c(a))return N(a);for(var c=a,d=b,e=0;;)if(0<d&&r(c))c=L(c),--d,e+=1;else return e}
var me=function me(b){return null==b?null:null==L(b)?r(K(b)):Xc(K(b),me(L(b)))},ne=function ne(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return ne.h();case 1:return ne.a(arguments[0]);case 2:return ne.b(arguments[0],arguments[1]);default:return c=new Ia(c.slice(2),0),ne.i(arguments[0],arguments[1],c)}};ne.h=function(){return new ee(null,function(){return null},null,null)};
ne.a=function(a){return new ee(null,function(){return a},null,null)};ne.b=function(a,b){return new ee(null,function(){var c=r(a);return c?yd(c)?je(Xb(c),ne.b(Yb(c),b)):Xc(K(c),ne.b(Ac(c),b)):b},null,null)};ne.i=function(a,b,c){return function e(a,b){return new ee(null,function(){var c=r(a);return c?yd(c)?je(Xb(c),e(Yb(c),b)):Xc(K(c),e(Ac(c),b)):t(b)?e(K(b),L(b)):null},null,null)}(ne.b(a,b),c)};ne.G=function(a){var b=K(a),c=L(a);a=K(c);c=L(c);return ne.i(b,a,c)};ne.C=2;
var oe=function oe(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return oe.h();case 1:return oe.a(arguments[0]);case 2:return oe.b(arguments[0],arguments[1]);default:return c=new Ia(c.slice(2),0),oe.i(arguments[0],arguments[1],c)}};oe.h=function(){return Pb(gd)};oe.a=function(a){return a};oe.b=function(a,b){return Qb(a,b)};oe.i=function(a,b,c){for(;;)if(a=Qb(a,b),t(c))b=K(c),c=L(c);else return a};
oe.G=function(a){var b=K(a),c=L(a);a=K(c);c=L(c);return oe.i(b,a,c)};oe.C=2;
function pe(a,b,c){var d=r(c);if(0===b)return a.h?a.h():a.call(null);c=eb(d);var e=fb(d);if(1===b)return a.a?a.a(c):a.a?a.a(c):a.call(null,c);var d=eb(e),f=fb(e);if(2===b)return a.b?a.b(c,d):a.b?a.b(c,d):a.call(null,c,d);var e=eb(f),g=fb(f);if(3===b)return a.c?a.c(c,d,e):a.c?a.c(c,d,e):a.call(null,c,d,e);var f=eb(g),k=fb(g);if(4===b)return a.u?a.u(c,d,e,f):a.u?a.u(c,d,e,f):a.call(null,c,d,e,f);var g=eb(k),m=fb(k);if(5===b)return a.P?a.P(c,d,e,f,g):a.P?a.P(c,d,e,f,g):a.call(null,c,d,e,f,g);var k=eb(m),
p=fb(m);if(6===b)return a.fa?a.fa(c,d,e,f,g,k):a.fa?a.fa(c,d,e,f,g,k):a.call(null,c,d,e,f,g,k);var m=eb(p),u=fb(p);if(7===b)return a.ga?a.ga(c,d,e,f,g,k,m):a.ga?a.ga(c,d,e,f,g,k,m):a.call(null,c,d,e,f,g,k,m);var p=eb(u),v=fb(u);if(8===b)return a.ta?a.ta(c,d,e,f,g,k,m,p):a.ta?a.ta(c,d,e,f,g,k,m,p):a.call(null,c,d,e,f,g,k,m,p);var u=eb(v),w=fb(v);if(9===b)return a.ua?a.ua(c,d,e,f,g,k,m,p,u):a.ua?a.ua(c,d,e,f,g,k,m,p,u):a.call(null,c,d,e,f,g,k,m,p,u);var v=eb(w),x=fb(w);if(10===b)return a.ia?a.ia(c,
d,e,f,g,k,m,p,u,v):a.ia?a.ia(c,d,e,f,g,k,m,p,u,v):a.call(null,c,d,e,f,g,k,m,p,u,v);var w=eb(x),C=fb(x);if(11===b)return a.ja?a.ja(c,d,e,f,g,k,m,p,u,v,w):a.ja?a.ja(c,d,e,f,g,k,m,p,u,v,w):a.call(null,c,d,e,f,g,k,m,p,u,v,w);var x=eb(C),E=fb(C);if(12===b)return a.ka?a.ka(c,d,e,f,g,k,m,p,u,v,w,x):a.ka?a.ka(c,d,e,f,g,k,m,p,u,v,w,x):a.call(null,c,d,e,f,g,k,m,p,u,v,w,x);var C=eb(E),D=fb(E);if(13===b)return a.la?a.la(c,d,e,f,g,k,m,p,u,v,w,x,C):a.la?a.la(c,d,e,f,g,k,m,p,u,v,w,x,C):a.call(null,c,d,e,f,g,k,m,
p,u,v,w,x,C);var E=eb(D),H=fb(D);if(14===b)return a.ma?a.ma(c,d,e,f,g,k,m,p,u,v,w,x,C,E):a.ma?a.ma(c,d,e,f,g,k,m,p,u,v,w,x,C,E):a.call(null,c,d,e,f,g,k,m,p,u,v,w,x,C,E);var D=eb(H),R=fb(H);if(15===b)return a.na?a.na(c,d,e,f,g,k,m,p,u,v,w,x,C,E,D):a.na?a.na(c,d,e,f,g,k,m,p,u,v,w,x,C,E,D):a.call(null,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D);var H=eb(R),S=fb(R);if(16===b)return a.oa?a.oa(c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H):a.oa?a.oa(c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H):a.call(null,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H);var R=
eb(S),ya=fb(S);if(17===b)return a.pa?a.pa(c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R):a.pa?a.pa(c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R):a.call(null,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R);var S=eb(ya),ab=fb(ya);if(18===b)return a.qa?a.qa(c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S):a.qa?a.qa(c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S):a.call(null,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S);ya=eb(ab);ab=fb(ab);if(19===b)return a.ra?a.ra(c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya):a.ra?a.ra(c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya):a.call(null,
c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya);var J=eb(ab);fb(ab);if(20===b)return a.sa?a.sa(c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya,J):a.sa?a.sa(c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya,J):a.call(null,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya,J);throw Error("Only up to 20 arguments supported on functions");}
var A=function A(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return A.b(arguments[0],arguments[1]);case 3:return A.c(arguments[0],arguments[1],arguments[2]);case 4:return A.u(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return A.P(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:return c=new Ia(c.slice(5),0),A.i(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],c)}};
A.b=function(a,b){var c=a.C;if(a.G){var d=le(b,c+1);return d<=c?pe(a,d,b):a.G(b)}return a.apply(a,Gd(b))};A.c=function(a,b,c){b=Xc(b,c);c=a.C;if(a.G){var d=le(b,c+1);return d<=c?pe(a,d,b):a.G(b)}return a.apply(a,Gd(b))};A.u=function(a,b,c,d){b=Xc(b,Xc(c,d));c=a.C;return a.G?(d=le(b,c+1),d<=c?pe(a,d,b):a.G(b)):a.apply(a,Gd(b))};A.P=function(a,b,c,d,e){b=Xc(b,Xc(c,Xc(d,e)));c=a.C;return a.G?(d=le(b,c+1),d<=c?pe(a,d,b):a.G(b)):a.apply(a,Gd(b))};
A.i=function(a,b,c,d,e,f){b=Xc(b,Xc(c,Xc(d,Xc(e,me(f)))));c=a.C;return a.G?(d=le(b,c+1),d<=c?pe(a,d,b):a.G(b)):a.apply(a,Gd(b))};A.G=function(a){var b=K(a),c=L(a);a=K(c);var d=L(c),c=K(d),e=L(d),d=K(e),f=L(e),e=K(f),f=L(f);return A.i(b,a,c,d,e,f)};A.C=5;function qe(a){return r(a)?a:null}
var re=function re(){"undefined"===typeof ma&&(ma=function(b,c){this.wd=b;this.od=c;this.o=393216;this.F=0},ma.prototype.N=function(b,c){return new ma(this.wd,c)},ma.prototype.L=function(){return this.od},ma.prototype.xa=function(){return!1},ma.prototype.next=function(){return Error("No such element")},ma.prototype.remove=function(){return Error("Unsupported operation")},ma.Ob=function(){return new T(null,2,5,U,[Oc(se,new q(null,1,[te,mc(ue,mc(gd))],null)),ve],null)},ma.rb=!0,ma.cb="cljs.core/t_cljs$core10024",
ma.Ab=function(b,c){return B(c,"cljs.core/t_cljs$core10024")});return new ma(re,V)};we;function we(a,b,c,d){this.Rb=a;this.first=b;this.da=c;this.B=d;this.o=31719628;this.F=0}h=we.prototype;h.N=function(a,b){return new we(this.Rb,this.first,this.da,b)};h.W=function(a,b){return Xc(b,Fb(this))};h.ea=function(){return Bc};h.D=function(a,b){return null!=Fb(this)?Nc(this,b):td(b)&&null==r(b)};h.R=function(){return Hc(this)};h.V=function(){null!=this.Rb&&this.Rb.step(this);return null==this.da?null:this};
h.ha=function(){null!=this.Rb&&Fb(this);return null==this.da?null:this.first};h.Aa=function(){null!=this.Rb&&Fb(this);return null==this.da?Bc:this.da};h.Da=function(){null!=this.Rb&&Fb(this);return null==this.da?null:Fb(this.da)};we.prototype[Ra]=function(){return Dc(this)};function xe(a,b){for(;;){if(null==r(b))return!0;var c;c=K(b);c=a.a?a.a(c):a.call(null,c);if(t(c)){c=a;var d=L(b);a=c;b=d}else return!1}}
function ye(a,b){for(;;)if(r(b)){var c;c=K(b);c=a.a?a.a(c):a.call(null,c);if(t(c))return c;c=a;var d=L(b);a=c;b=d}else return null}ze;function Ae(a,b,c,d){this.state=a;this.B=b;this.Cd=c;this.Pc=d;this.F=16386;this.o=6455296}h=Ae.prototype;h.equiv=function(a){return this.D(null,a)};h.D=function(a,b){return this===b};h.xb=function(){return this.state};h.L=function(){return this.B};
h.xc=function(a,b,c){a=r(this.Pc);for(var d=null,e=0,f=0;;)if(f<e){var g=d.aa(null,f),k=P(g,0),g=P(g,1);g.u?g.u(k,this,b,c):g.call(null,k,this,b,c);f+=1}else if(a=r(a))yd(a)?(d=Xb(a),a=Yb(a),k=d,e=N(d),d=k):(d=K(a),k=P(d,0),g=P(d,1),g.u?g.u(k,this,b,c):g.call(null,k,this,b,c),a=L(a),d=null,e=0),f=0;else return null};h.R=function(){return aa(this)};
var W=function W(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return W.a(arguments[0]);default:return c=new Ia(c.slice(1),0),W.i(arguments[0],c)}};W.a=function(a){return new Ae(a,null,null,null)};W.i=function(a,b){var c=null!=b&&(b.o&64||b.Jb)?A.b(Lc,b):b,d=vc.b(c,Ca),c=vc.b(c,Be);return new Ae(a,d,c,null)};W.G=function(a){var b=K(a);a=L(a);return W.i(b,a)};W.C=1;Ce;
function De(a,b){if(a instanceof Ae){var c=a.Cd;if(null!=c&&!t(c.a?c.a(b):c.call(null,b)))throw Error([z("Assert failed: "),z("Validator rejected reference state"),z("\n"),z(function(){var a=mc(Ee,Fe);return Ce.a?Ce.a(a):Ce.call(null,a)}())].join(""));c=a.state;a.state=b;null!=a.Pc&&Ob(a,c,b);return b}return bc(a,b)}
var Ge=function Ge(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return Ge.b(arguments[0],arguments[1]);case 3:return Ge.c(arguments[0],arguments[1],arguments[2]);case 4:return Ge.u(arguments[0],arguments[1],arguments[2],arguments[3]);default:return c=new Ia(c.slice(4),0),Ge.i(arguments[0],arguments[1],arguments[2],arguments[3],c)}};
Ge.b=function(a,b){var c;a instanceof Ae?(c=a.state,c=b.a?b.a(c):b.call(null,c),c=De(a,c)):c=cc.b(a,b);return c};Ge.c=function(a,b,c){if(a instanceof Ae){var d=a.state;b=b.b?b.b(d,c):b.call(null,d,c);a=De(a,b)}else a=cc.c(a,b,c);return a};Ge.u=function(a,b,c,d){if(a instanceof Ae){var e=a.state;b=b.c?b.c(e,c,d):b.call(null,e,c,d);a=De(a,b)}else a=cc.u(a,b,c,d);return a};Ge.i=function(a,b,c,d,e){return a instanceof Ae?De(a,A.P(b,a.state,c,d,e)):cc.P(a,b,c,d,e)};
Ge.G=function(a){var b=K(a),c=L(a);a=K(c);var d=L(c),c=K(d),e=L(d),d=K(e),e=L(e);return Ge.i(b,a,c,d,e)};Ge.C=4;function He(a){this.state=a;this.o=32768;this.F=0}He.prototype.xb=function(){return this.state};function ze(a){return new He(a)}
var Sd=function Sd(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return Sd.a(arguments[0]);case 2:return Sd.b(arguments[0],arguments[1]);case 3:return Sd.c(arguments[0],arguments[1],arguments[2]);case 4:return Sd.u(arguments[0],arguments[1],arguments[2],arguments[3]);default:return c=new Ia(c.slice(4),0),Sd.i(arguments[0],arguments[1],arguments[2],arguments[3],c)}};
Sd.a=function(a){return function(b){return function(){function c(c,d){var e=a.a?a.a(d):a.call(null,d);return b.b?b.b(c,e):b.call(null,c,e)}function d(a){return b.a?b.a(a):b.call(null,a)}function e(){return b.h?b.h():b.call(null)}var f=null,g=function(){function c(a,b,e){var f=null;if(2<arguments.length){for(var f=0,g=Array(arguments.length-2);f<g.length;)g[f]=arguments[f+2],++f;f=new Ia(g,0)}return d.call(this,a,b,f)}function d(c,e,f){e=A.c(a,e,f);return b.b?b.b(c,e):b.call(null,c,e)}c.C=2;c.G=function(a){var b=
K(a);a=L(a);var c=K(a);a=Ac(a);return d(b,c,a)};c.i=d;return c}(),f=function(a,b,f){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b);default:var u=null;if(2<arguments.length){for(var u=0,v=Array(arguments.length-2);u<v.length;)v[u]=arguments[u+2],++u;u=new Ia(v,0)}return g.i(a,b,u)}throw Error("Invalid arity: "+arguments.length);};f.C=2;f.G=g.G;f.h=e;f.a=d;f.b=c;f.i=g.i;return f}()}};
Sd.b=function(a,b){return new ee(null,function(){var c=r(b);if(c){if(yd(c)){for(var d=Xb(c),e=N(d),f=ie(e),g=0;;)if(g<e)ke(f,function(){var b=bb.b(d,g);return a.a?a.a(b):a.call(null,b)}()),g+=1;else break;return je(f.ya(),Sd.b(a,Yb(c)))}return Xc(function(){var b=K(c);return a.a?a.a(b):a.call(null,b)}(),Sd.b(a,Ac(c)))}return null},null,null)};
Sd.c=function(a,b,c){return new ee(null,function(){var d=r(b),e=r(c);if(d&&e){var f=Xc,g;g=K(d);var k=K(e);g=a.b?a.b(g,k):a.call(null,g,k);d=f(g,Sd.c(a,Ac(d),Ac(e)))}else d=null;return d},null,null)};Sd.u=function(a,b,c,d){return new ee(null,function(){var e=r(b),f=r(c),g=r(d);if(e&&f&&g){var k=Xc,m;m=K(e);var p=K(f),u=K(g);m=a.c?a.c(m,p,u):a.call(null,m,p,u);e=k(m,Sd.u(a,Ac(e),Ac(f),Ac(g)))}else e=null;return e},null,null)};
Sd.i=function(a,b,c,d,e){var f=function k(a){return new ee(null,function(){var b=Sd.b(r,a);return xe(Id,b)?Xc(Sd.b(K,b),k(Sd.b(Ac,b))):null},null,null)};return Sd.b(function(){return function(b){return A.b(a,b)}}(f),f(fd.i(e,d,I([c,b],0))))};Sd.G=function(a){var b=K(a),c=L(a);a=K(c);var d=L(c),c=K(d),e=L(d),d=K(e),e=L(e);return Sd.i(b,a,c,d,e)};Sd.C=4;
function Ie(a,b){if("number"!==typeof a)throw Error([z("Assert failed: "),z(function(){var a=mc(Je,Ke);return Ce.a?Ce.a(a):Ce.call(null,a)}())].join(""));return new ee(null,function(){if(0<a){var c=r(b);return c?Xc(K(c),Ie(a-1,Ac(c))):null}return null},null,null)}
function Le(a,b){if("number"!==typeof a)throw Error([z("Assert failed: "),z(function(){var a=mc(Je,Ke);return Ce.a?Ce.a(a):Ce.call(null,a)}())].join(""));return new ee(null,function(c){return function(){return c(a,b)}}(function(a,b){for(;;){var e=r(b);if(0<a&&e){var f=a-1,e=Ac(e);a=f;b=e}else return e}}),null,null)}function Me(a){return Sd.c(function(a){return a},a,Le(1,a))}function Ne(a){return new ee(null,function(){return Xc(a,Ne(a))},null,null)}function Pe(a,b){return Ie(a,Ne(b))}
function Qe(a){return new ee(null,function(){return Xc(a.h?a.h():a.call(null),Qe(a))},null,null)}function Re(a,b){return Ie(a,Qe(b))}var Se=function Se(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return Se.b(arguments[0],arguments[1]);default:return c=new Ia(c.slice(2),0),Se.i(arguments[0],arguments[1],c)}};Se.b=function(a,b){return new ee(null,function(){var c=r(a),d=r(b);return c&&d?Xc(K(c),Xc(K(d),Se.b(Ac(c),Ac(d)))):null},null,null)};
Se.i=function(a,b,c){return new ee(null,function(){var d=Sd.b(r,fd.i(c,b,I([a],0)));return xe(Id,d)?ne.b(Sd.b(K,d),A.b(Se,Sd.b(Ac,d))):null},null,null)};Se.G=function(a){var b=K(a),c=L(a);a=K(c);c=L(c);return Se.i(b,a,c)};Se.C=2;Te;function Ue(a,b){return A.b(ne,A.c(Sd,a,b))}
function Ve(a,b){return new ee(null,function(){var c=r(b);if(c){if(yd(c)){for(var d=Xb(c),e=N(d),f=ie(e),g=0;;)if(g<e){var k;k=bb.b(d,g);k=a.a?a.a(k):a.call(null,k);t(k)&&(k=bb.b(d,g),f.add(k));g+=1}else break;return je(f.ya(),Ve(a,Yb(c)))}d=K(c);c=Ac(c);return t(a.a?a.a(d):a.call(null,d))?Xc(d,Ve(a,c)):Ve(a,c)}return null},null,null)}function We(a,b){var c;null!=a?null!=a&&(a.F&4||a.Fd)?(c=Ta.c(Qb,Pb(a),b),c=Rb(c),c=Oc(c,od(a))):c=Ta.c(Za,a,b):c=Ta.c(fd,Bc,b);return c}
function Xe(a,b){this.Z=a;this.f=b}function Ye(a){return new Xe(a,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null])}function Ze(a){a=a.w;return 32>a?0:a-1>>>5<<5}function $e(a,b,c){for(;;){if(0===b)return c;var d=Ye(a);d.f[0]=c;c=d;b-=5}}var af=function af(b,c,d,e){var f=new Xe(d.Z,Sa(d.f)),g=b.w-1>>>c&31;5===c?f.f[g]=e:(d=d.f[g],b=null!=d?af(b,c-5,d,e):$e(null,c-5,e),f.f[g]=b);return f};
function bf(a,b){throw Error([z("No item "),z(a),z(" in vector of length "),z(b)].join(""));}function cf(a,b){if(b>=Ze(a))return a.Fa;for(var c=a.root,d=a.shift;;)if(0<d)var e=d-5,c=c.f[b>>>d&31],d=e;else return c.f}function df(a,b){return 0<=b&&b<a.w?cf(a,b):bf(b,a.w)}var ef=function ef(b,c,d,e,f){var g=new Xe(d.Z,Sa(d.f));if(0===c)g.f[e&31]=f;else{var k=e>>>c&31;b=ef(b,c-5,d.f[k],e,f);g.f[k]=b}return g};function ff(a,b,c,d,e,f){this.v=a;this.kc=b;this.f=c;this.hb=d;this.start=e;this.end=f}
ff.prototype.xa=function(){return this.v<this.end};ff.prototype.next=function(){32===this.v-this.kc&&(this.f=cf(this.hb,this.v),this.kc+=32);var a=this.f[this.v&31];this.v+=1;return a};gf;hf;jf;M;kf;lf;mf;function T(a,b,c,d,e,f){this.B=a;this.w=b;this.shift=c;this.root=d;this.Fa=e;this.s=f;this.o=167668511;this.F=8196}h=T.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.S=function(a,b){return ib.c(this,b,null)};
h.K=function(a,b,c){return"number"===typeof b?bb.c(this,b,c):c};h.aa=function(a,b){return df(this,b)[b&31]};h.Ia=function(a,b,c){return 0<=b&&b<this.w?cf(this,b)[b&31]:c};h.zb=function(a,b,c){if(0<=b&&b<this.w)return Ze(this)<=b?(a=Sa(this.Fa),a[b&31]=c,new T(this.B,this.w,this.shift,this.root,a,null)):new T(this.B,this.w,this.shift,ef(this,this.shift,this.root,b,c),this.Fa,null);if(b===this.w)return Za(this,c);throw Error([z("Index "),z(b),z(" out of bounds  [0,"),z(this.w),z("]")].join(""));};
h.za=function(){var a=this.w;return new ff(0,0,0<N(this)?cf(this,0):null,this,0,a)};h.L=function(){return this.B};h.X=function(){return this.w};h.Vb=function(){return bb.b(this,0)};h.Wb=function(){return bb.b(this,1)};h.hc=function(){return 0<this.w?new Yc(this,this.w-1,null):null};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Hc(this)};
h.D=function(a,b){if(b instanceof T)if(this.w===N(b))for(var c=dc(this),d=dc(b);;)if(t(c.xa())){var e=c.next(),f=d.next();if(!G.b(e,f))return!1}else return!0;else return!1;else return Nc(this,b)};h.Ib=function(){return new jf(this.w,this.shift,gf.a?gf.a(this.root):gf.call(null,this.root),hf.a?hf.a(this.Fa):hf.call(null,this.Fa))};h.ea=function(){return Oc(gd,this.B)};h.va=function(a,b){return Rc(this,b)};
h.wa=function(a,b,c){a=0;for(var d=c;;)if(a<this.w){var e=cf(this,a);c=e.length;a:for(var f=0;;)if(f<c){var g=e[f],d=b.b?b.b(d,g):b.call(null,d,g);if(Qc(d)){e=d;break a}f+=1}else{e=d;break a}if(Qc(e))return M.a?M.a(e):M.call(null,e);a+=c;d=e}else return d};h.Ha=function(a,b,c){if("number"===typeof b)return tb(this,b,c);throw Error("Vector's key for assoc must be a number.");};
h.V=function(){if(0===this.w)return null;if(32>=this.w)return new Ia(this.Fa,0);var a;a:{a=this.root;for(var b=this.shift;;)if(0<b)b-=5,a=a.f[0];else{a=a.f;break a}}return mf.u?mf.u(this,a,0,0):mf.call(null,this,a,0,0)};h.N=function(a,b){return new T(b,this.w,this.shift,this.root,this.Fa,this.s)};
h.W=function(a,b){if(32>this.w-Ze(this)){for(var c=this.Fa.length,d=Array(c+1),e=0;;)if(e<c)d[e]=this.Fa[e],e+=1;else break;d[c]=b;return new T(this.B,this.w+1,this.shift,this.root,d,null)}c=(d=this.w>>>5>1<<this.shift)?this.shift+5:this.shift;d?(d=Ye(null),d.f[0]=this.root,e=$e(null,this.shift,new Xe(null,this.Fa)),d.f[1]=e):d=af(this,this.shift,this.root,new Xe(null,this.Fa));return new T(this.B,this.w+1,c,d,[b],null)};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.aa(null,c);case 3:return this.Ia(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return this.aa(null,c)};a.c=function(a,c,d){return this.Ia(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Sa(b)))};h.a=function(a){return this.aa(null,a)};h.b=function(a,b){return this.Ia(null,a,b)};
var U=new Xe(null,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]),gd=new T(null,0,5,U,[],Ic);T.prototype[Ra]=function(){return Dc(this)};function Hd(a){if(Ka(a))a:{var b=a.length;if(32>b)a=new T(null,b,5,U,a,null);else for(var c=a.slice(0,32),d=32,e=(new T(null,32,5,U,c,null)).Ib(null);;)if(d<b)c=d+1,e=oe.b(e,a[d]),d=c;else{a=Rb(e);break a}}else a=Rb(Ta.c(Qb,Pb(gd),a));return a}nf;
function xd(a,b,c,d,e,f){this.Sa=a;this.node=b;this.v=c;this.Ba=d;this.B=e;this.s=f;this.o=32375020;this.F=1536}h=xd.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.L=function(){return this.B};h.Da=function(){if(this.Ba+1<this.node.length){var a;a=this.Sa;var b=this.node,c=this.v,d=this.Ba+1;a=mf.u?mf.u(a,b,c,d):mf.call(null,a,b,c,d);return null==a?null:a}return Zb(this)};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Hc(this)};
h.D=function(a,b){return Nc(this,b)};h.ea=function(){return Oc(gd,this.B)};h.va=function(a,b){var c;c=this.Sa;var d=this.v+this.Ba,e=N(this.Sa);c=nf.c?nf.c(c,d,e):nf.call(null,c,d,e);return Rc(c,b)};h.wa=function(a,b,c){a=this.Sa;var d=this.v+this.Ba,e=N(this.Sa);a=nf.c?nf.c(a,d,e):nf.call(null,a,d,e);return Sc(a,b,c)};h.ha=function(){return this.node[this.Ba]};
h.Aa=function(){if(this.Ba+1<this.node.length){var a;a=this.Sa;var b=this.node,c=this.v,d=this.Ba+1;a=mf.u?mf.u(a,b,c,d):mf.call(null,a,b,c,d);return null==a?Bc:a}return Yb(this)};h.V=function(){return this};h.oc=function(){var a=this.node;return new ge(a,this.Ba,a.length)};h.pc=function(){var a=this.v+this.node.length;if(a<Va(this.Sa)){var b=this.Sa,c=cf(this.Sa,a);return mf.u?mf.u(b,c,a,0):mf.call(null,b,c,a,0)}return Bc};
h.N=function(a,b){return mf.P?mf.P(this.Sa,this.node,this.v,this.Ba,b):mf.call(null,this.Sa,this.node,this.v,this.Ba,b)};h.W=function(a,b){return Xc(b,this)};h.nc=function(){var a=this.v+this.node.length;if(a<Va(this.Sa)){var b=this.Sa,c=cf(this.Sa,a);return mf.u?mf.u(b,c,a,0):mf.call(null,b,c,a,0)}return null};xd.prototype[Ra]=function(){return Dc(this)};
var mf=function mf(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 3:return mf.c(arguments[0],arguments[1],arguments[2]);case 4:return mf.u(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return mf.P(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};mf.c=function(a,b,c){return new xd(a,df(a,b),b,c,null,null)};
mf.u=function(a,b,c,d){return new xd(a,b,c,d,null,null)};mf.P=function(a,b,c,d,e){return new xd(a,b,c,d,e,null)};mf.C=5;of;function pf(a,b,c,d,e){this.B=a;this.hb=b;this.start=c;this.end=d;this.s=e;this.o=167666463;this.F=8192}h=pf.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.S=function(a,b){return ib.c(this,b,null)};h.K=function(a,b,c){return"number"===typeof b?bb.c(this,b,c):c};
h.aa=function(a,b){return 0>b||this.end<=this.start+b?bf(b,this.end-this.start):bb.b(this.hb,this.start+b)};h.Ia=function(a,b,c){return 0>b||this.end<=this.start+b?c:bb.c(this.hb,this.start+b,c)};h.zb=function(a,b,c){var d=this.start+b;a=this.B;c=kd.c(this.hb,d,c);b=this.start;var e=this.end,d=d+1,d=e>d?e:d;return of.P?of.P(a,c,b,d,null):of.call(null,a,c,b,d,null)};h.L=function(){return this.B};h.X=function(){return this.end-this.start};
h.hc=function(){return this.start!==this.end?new Yc(this,this.end-this.start-1,null):null};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Hc(this)};h.D=function(a,b){return Nc(this,b)};h.ea=function(){return Oc(gd,this.B)};h.va=function(a,b){return Rc(this,b)};h.wa=function(a,b,c){return Sc(this,b,c)};h.Ha=function(a,b,c){if("number"===typeof b)return tb(this,b,c);throw Error("Subvec's key for assoc must be a number.");};
h.V=function(){var a=this;return function(b){return function d(e){return e===a.end?null:Xc(bb.b(a.hb,e),new ee(null,function(){return function(){return d(e+1)}}(b),null,null))}}(this)(a.start)};h.N=function(a,b){return of.P?of.P(b,this.hb,this.start,this.end,this.s):of.call(null,b,this.hb,this.start,this.end,this.s)};h.W=function(a,b){var c=this.B,d=tb(this.hb,this.end,b),e=this.start,f=this.end+1;return of.P?of.P(c,d,e,f,null):of.call(null,c,d,e,f,null)};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.aa(null,c);case 3:return this.Ia(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return this.aa(null,c)};a.c=function(a,c,d){return this.Ia(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Sa(b)))};h.a=function(a){return this.aa(null,a)};h.b=function(a,b){return this.Ia(null,a,b)};pf.prototype[Ra]=function(){return Dc(this)};
function of(a,b,c,d,e){for(;;)if(b instanceof pf)c=b.start+c,d=b.start+d,b=b.hb;else{var f=N(b);if(0>c||0>d||c>f||d>f)throw Error("Index out of bounds");return new pf(a,b,c,d,e)}}var nf=function nf(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 2:return nf.b(arguments[0],arguments[1]);case 3:return nf.c(arguments[0],arguments[1],arguments[2]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};
nf.b=function(a,b){return nf.c(a,b,N(a))};nf.c=function(a,b,c){return of(null,a,b,c,null)};nf.C=3;function qf(a,b){return a===b.Z?b:new Xe(a,Sa(b.f))}function gf(a){return new Xe({},Sa(a.f))}function hf(a){var b=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];Ad(a,0,b,0,a.length);return b}
var rf=function rf(b,c,d,e){d=qf(b.root.Z,d);var f=b.w-1>>>c&31;if(5===c)b=e;else{var g=d.f[f];b=null!=g?rf(b,c-5,g,e):$e(b.root.Z,c-5,e)}d.f[f]=b;return d};function jf(a,b,c,d){this.w=a;this.shift=b;this.root=c;this.Fa=d;this.F=88;this.o=275}h=jf.prototype;
h.yb=function(a,b){if(this.root.Z){if(32>this.w-Ze(this))this.Fa[this.w&31]=b;else{var c=new Xe(this.root.Z,this.Fa),d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];d[0]=b;this.Fa=d;if(this.w>>>5>1<<this.shift){var d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],e=this.shift+
5;d[0]=this.root;d[1]=$e(this.root.Z,this.shift,c);this.root=new Xe(this.root.Z,d);this.shift=e}else this.root=rf(this,this.shift,this.root,c)}this.w+=1;return this}throw Error("conj! after persistent!");};h.Kb=function(){if(this.root.Z){this.root.Z=null;var a=this.w-Ze(this),b=Array(a);Ad(this.Fa,0,b,0,a);return new T(null,this.w,this.shift,this.root,b,null)}throw Error("persistent! called twice");};
h.Zb=function(a,b,c){if("number"===typeof b)return Tb(this,b,c);throw Error("TransientVector's key for assoc! must be a number.");};
h.wc=function(a,b,c){var d=this;if(d.root.Z){if(0<=b&&b<d.w)return Ze(this)<=b?d.Fa[b&31]=c:(a=function(){return function f(a,k){var m=qf(d.root.Z,k);if(0===a)m.f[b&31]=c;else{var p=b>>>a&31,u=f(a-5,m.f[p]);m.f[p]=u}return m}}(this).call(null,d.shift,d.root),d.root=a),this;if(b===d.w)return Qb(this,c);throw Error([z("Index "),z(b),z(" out of bounds for TransientVector of length"),z(d.w)].join(""));}throw Error("assoc! after persistent!");};
h.X=function(){if(this.root.Z)return this.w;throw Error("count after persistent!");};h.aa=function(a,b){if(this.root.Z)return df(this,b)[b&31];throw Error("nth after persistent!");};h.Ia=function(a,b,c){return 0<=b&&b<this.w?bb.b(this,b):c};h.S=function(a,b){return ib.c(this,b,null)};h.K=function(a,b,c){return"number"===typeof b?bb.c(this,b,c):c};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.S(null,c);case 3:return this.K(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return this.S(null,c)};a.c=function(a,c,d){return this.K(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Sa(b)))};h.a=function(a){return this.S(null,a)};h.b=function(a,b){return this.K(null,a,b)};function sf(a,b){this.Nb=a;this.ec=b}
sf.prototype.xa=function(){var a=null!=this.Nb&&r(this.Nb);return a?a:(a=null!=this.ec)?this.ec.xa():a};sf.prototype.next=function(){if(null!=this.Nb){var a=K(this.Nb);this.Nb=L(this.Nb);return a}if(null!=this.ec&&this.ec.xa())return this.ec.next();throw Error("No such element");};sf.prototype.remove=function(){return Error("Unsupported operation")};function tf(a,b,c,d){this.B=a;this.Ua=b;this.nb=c;this.s=d;this.o=31850572;this.F=0}h=tf.prototype;h.toString=function(){return gc(this)};
h.equiv=function(a){return this.D(null,a)};h.L=function(){return this.B};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Hc(this)};h.D=function(a,b){return Nc(this,b)};h.ea=function(){return Oc(Bc,this.B)};h.ha=function(){return K(this.Ua)};h.Aa=function(){var a=L(this.Ua);return a?new tf(this.B,a,this.nb,null):null==this.nb?Wa(this):new tf(this.B,this.nb,null,null)};h.V=function(){return this};h.N=function(a,b){return new tf(b,this.Ua,this.nb,this.s)};h.W=function(a,b){return Xc(b,this)};
tf.prototype[Ra]=function(){return Dc(this)};function uf(a,b,c,d,e){this.B=a;this.count=b;this.Ua=c;this.nb=d;this.s=e;this.o=31858766;this.F=8192}h=uf.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.za=function(){return new sf(this.Ua,dc(this.nb))};h.L=function(){return this.B};h.X=function(){return this.count};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Hc(this)};h.D=function(a,b){return Nc(this,b)};h.ea=function(){return Oc(vf,this.B)};
h.ha=function(){return K(this.Ua)};h.Aa=function(){return Ac(r(this))};h.V=function(){var a=r(this.nb),b=this.Ua;return t(t(b)?b:a)?new tf(null,this.Ua,r(a),null):null};h.N=function(a,b){return new uf(b,this.count,this.Ua,this.nb,this.s)};h.W=function(a,b){var c;t(this.Ua)?(c=this.nb,c=new uf(this.B,this.count+1,this.Ua,fd.b(t(c)?c:gd,b),null)):c=new uf(this.B,this.count+1,fd.b(this.Ua,b),gd,null);return c};var vf=new uf(null,0,null,gd,Ic);uf.prototype[Ra]=function(){return Dc(this)};
function wf(){this.o=2097152;this.F=0}wf.prototype.equiv=function(a){return this.D(null,a)};wf.prototype.D=function(){return!1};var xf=new wf;function yf(a,b){return Cd(ud(b)?N(a)===N(b)?xe(Id,Sd.b(function(a){return G.b(vc.c(b,K(a),xf),dd(a))},a)):null:null)}function zf(a,b,c,d,e){this.v=a;this.zd=b;this.sc=c;this.Cb=d;this.zc=e}zf.prototype.xa=function(){var a=this.v<this.sc;return a?a:this.zc.xa()};
zf.prototype.next=function(){if(this.v<this.sc){var a=id(this.Cb,this.v);this.v+=1;return new T(null,2,5,U,[a,ib.b(this.zd,a)],null)}return this.zc.next()};zf.prototype.remove=function(){return Error("Unsupported operation")};function Af(a){this.T=a}Af.prototype.next=function(){if(null!=this.T){var a=K(this.T),b=P(a,0),a=P(a,1);this.T=L(this.T);return{value:[b,a],done:!1}}return{value:null,done:!0}};function Bf(a){return new Af(r(a))}function Cf(a){this.T=a}
Cf.prototype.next=function(){if(null!=this.T){var a=K(this.T);this.T=L(this.T);return{value:[a,a],done:!1}}return{value:null,done:!0}};
function Df(a,b){var c;if(b instanceof y)a:{c=a.length;for(var d=b.Y,e=0;;){if(c<=e){c=-1;break a}if(a[e]instanceof y&&d===a[e].Y){c=e;break a}e+=2}}else if("string"==typeof b||"number"===typeof b)a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(b===a[d]){c=d;break a}d+=2}else if(b instanceof F)a:for(c=a.length,d=b.fb,e=0;;){if(c<=e){c=-1;break a}if(a[e]instanceof F&&d===a[e].fb){c=e;break a}e+=2}else if(null==b)a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(null==a[d]){c=d;break a}d+=2}else a:for(c=
a.length,d=0;;){if(c<=d){c=-1;break a}if(G.b(b,a[d])){c=d;break a}d+=2}return c}Ef;function Ff(a,b,c){this.f=a;this.v=b;this.Ca=c;this.o=32374990;this.F=0}h=Ff.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.L=function(){return this.Ca};h.Da=function(){return this.v<this.f.length-2?new Ff(this.f,this.v+2,this.Ca):null};h.X=function(){return(this.f.length-this.v)/2};h.R=function(){return Hc(this)};h.D=function(a,b){return Nc(this,b)};
h.ea=function(){return Oc(Bc,this.Ca)};h.va=function(a,b){return cd.b(b,this)};h.wa=function(a,b,c){return cd.c(b,c,this)};h.ha=function(){return new T(null,2,5,U,[this.f[this.v],this.f[this.v+1]],null)};h.Aa=function(){return this.v<this.f.length-2?new Ff(this.f,this.v+2,this.Ca):Bc};h.V=function(){return this};h.N=function(a,b){return new Ff(this.f,this.v,b)};h.W=function(a,b){return Xc(b,this)};Ff.prototype[Ra]=function(){return Dc(this)};Gf;Hf;function If(a,b,c){this.f=a;this.v=b;this.w=c}
If.prototype.xa=function(){return this.v<this.w};If.prototype.next=function(){var a=new T(null,2,5,U,[this.f[this.v],this.f[this.v+1]],null);this.v+=2;return a};function q(a,b,c,d){this.B=a;this.w=b;this.f=c;this.s=d;this.o=16647951;this.F=8196}h=q.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.keys=function(){return Dc(Gf.a?Gf.a(this):Gf.call(null,this))};h.entries=function(){return Bf(r(this))};
h.values=function(){return Dc(Hf.a?Hf.a(this):Hf.call(null,this))};h.has=function(a){return Ed(this,a)};h.get=function(a,b){return this.K(null,a,b)};h.forEach=function(a){for(var b=r(this),c=null,d=0,e=0;;)if(e<d){var f=c.aa(null,e),g=P(f,0),f=P(f,1);a.b?a.b(f,g):a.call(null,f,g);e+=1}else if(b=r(b))yd(b)?(c=Xb(b),b=Yb(b),g=c,d=N(c),c=g):(c=K(b),g=P(c,0),f=P(c,1),a.b?a.b(f,g):a.call(null,f,g),b=L(b),c=null,d=0),e=0;else return null};h.S=function(a,b){return ib.c(this,b,null)};
h.K=function(a,b,c){a=Df(this.f,b);return-1===a?c:this.f[a+1]};h.za=function(){return new If(this.f,0,2*this.w)};h.L=function(){return this.B};h.X=function(){return this.w};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Jc(this)};h.D=function(a,b){if(null!=b&&(b.o&1024||b.Vc)){var c=this.f.length;if(this.w===b.X(null))for(var d=0;;)if(d<c){var e=b.K(null,this.f[d],Bd);if(e!==Bd)if(G.b(this.f[d+1],e))d+=2;else return!1;else return!1}else return!0;else return!1}else return yf(this,b)};
h.Ib=function(){return new Ef({},this.f.length,Sa(this.f))};h.ea=function(){return zb(V,this.B)};h.va=function(a,b){return cd.b(b,this)};h.wa=function(a,b,c){return cd.c(b,c,this)};h.Ta=function(a,b){if(0<=Df(this.f,b)){var c=this.f.length,d=c-2;if(0===d)return Wa(this);for(var d=Array(d),e=0,f=0;;){if(e>=c)return new q(this.B,this.w-1,d,null);G.b(b,this.f[e])||(d[f]=this.f[e],d[f+1]=this.f[e+1],f+=2);e+=2}}else return this};
h.Ha=function(a,b,c){a=Df(this.f,b);if(-1===a){if(this.w<Jf){a=this.f;for(var d=a.length,e=Array(d+2),f=0;;)if(f<d)e[f]=a[f],f+=1;else break;e[d]=b;e[d+1]=c;return new q(this.B,this.w+1,e,null)}return zb(kb(We(Kf,this),b,c),this.B)}if(c===this.f[a+1])return this;b=Sa(this.f);b[a+1]=c;return new q(this.B,this.w,b,null)};h.mc=function(a,b){return-1!==Df(this.f,b)};h.V=function(){var a=this.f;return 0<=a.length-2?new Ff(a,0,null):null};h.N=function(a,b){return new q(b,this.w,this.f,this.s)};
h.W=function(a,b){if(vd(b))return kb(this,bb.b(b,0),bb.b(b,1));for(var c=this,d=r(b);;){if(null==d)return c;var e=K(d);if(vd(e))c=kb(c,bb.b(e,0),bb.b(e,1)),d=L(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.S(null,c);case 3:return this.K(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return this.S(null,c)};a.c=function(a,c,d){return this.K(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Sa(b)))};h.a=function(a){return this.S(null,a)};h.b=function(a,b){return this.K(null,a,b)};var V=new q(null,0,[],Kc),Jf=8;
function Lf(a){for(var b=[],c=0;;)if(c<a.length){var d=a[c],e=a[c+1];-1===Df(b,d)&&(b.push(d),b.push(e));c+=2}else break;return new q(null,b.length/2,b,null)}q.prototype[Ra]=function(){return Dc(this)};Mf;function Ef(a,b,c){this.Lb=a;this.Fb=b;this.f=c;this.o=258;this.F=56}h=Ef.prototype;h.X=function(){if(t(this.Lb))return Nd(this.Fb,2);throw Error("count after persistent!");};h.S=function(a,b){return ib.c(this,b,null)};
h.K=function(a,b,c){if(t(this.Lb))return a=Df(this.f,b),-1===a?c:this.f[a+1];throw Error("lookup after persistent!");};h.yb=function(a,b){if(t(this.Lb)){if(null!=b?b.o&2048||b.Wc||(b.o?0:Ma(nb,b)):Ma(nb,b))return Sb(this,Ud.a?Ud.a(b):Ud.call(null,b),Vd.a?Vd.a(b):Vd.call(null,b));for(var c=r(b),d=this;;){var e=K(c);if(t(e))c=L(c),d=Sb(d,Ud.a?Ud.a(e):Ud.call(null,e),Vd.a?Vd.a(e):Vd.call(null,e));else return d}}else throw Error("conj! after persistent!");};
h.Kb=function(){if(t(this.Lb))return this.Lb=!1,new q(null,Nd(this.Fb,2),this.f,null);throw Error("persistent! called twice");};h.Zb=function(a,b,c){if(t(this.Lb)){a=Df(this.f,b);if(-1===a){if(this.Fb+2<=2*Jf)return this.Fb+=2,this.f.push(b),this.f.push(c),this;a=Mf.b?Mf.b(this.Fb,this.f):Mf.call(null,this.Fb,this.f);return Sb(a,b,c)}c!==this.f[a+1]&&(this.f[a+1]=c);return this}throw Error("assoc! after persistent!");};Nf;jd;
function Mf(a,b){for(var c=Pb(Kf),d=0;;)if(d<a)c=Sb(c,b[d],b[d+1]),d+=2;else return c}function Of(){this.g=!1}Pf;Qf;De;Rf;W;M;function Sf(a,b){return a===b?!0:Q(a,b)?!0:G.b(a,b)}function Tf(a,b,c){a=Sa(a);a[b]=c;return a}function Uf(a,b){var c=Array(a.length-2);Ad(a,0,c,0,2*b);Ad(a,2*(b+1),c,2*b,c.length-2*b);return c}function Vf(a,b,c,d){a=a.Bb(b);a.f[c]=d;return a}Wf;function Xf(a,b,c,d){this.f=a;this.v=b;this.dc=c;this.Za=d}
Xf.prototype.advance=function(){for(var a=this.f.length;;)if(this.v<a){var b=this.f[this.v],c=this.f[this.v+1];null!=b?b=this.dc=new T(null,2,5,U,[b,c],null):null!=c?(b=dc(c),b=b.xa()?this.Za=b:!1):b=!1;this.v+=2;if(b)return!0}else return!1};Xf.prototype.xa=function(){var a=null!=this.dc;return a?a:(a=null!=this.Za)?a:this.advance()};
Xf.prototype.next=function(){if(null!=this.dc){var a=this.dc;this.dc=null;return a}if(null!=this.Za)return a=this.Za.next(),this.Za.xa()||(this.Za=null),a;if(this.advance())return this.next();throw Error("No such element");};Xf.prototype.remove=function(){return Error("Unsupported operation")};function Yf(a,b,c){this.Z=a;this.ca=b;this.f=c}h=Yf.prototype;h.Bb=function(a){if(a===this.Z)return this;var b=Pd(this.ca),c=Array(0>b?4:2*(b+1));Ad(this.f,0,c,0,2*b);return new Yf(a,this.ca,c)};
h.ac=function(){return Pf.a?Pf.a(this.f):Pf.call(null,this.f)};h.sb=function(a,b,c,d){var e=1<<(b>>>a&31);if(0===(this.ca&e))return d;var f=Pd(this.ca&e-1),e=this.f[2*f],f=this.f[2*f+1];return null==e?f.sb(a+5,b,c,d):Sf(c,e)?f:d};
h.Ya=function(a,b,c,d,e,f){var g=1<<(c>>>b&31),k=Pd(this.ca&g-1);if(0===(this.ca&g)){var m=Pd(this.ca);if(2*m<this.f.length){a=this.Bb(a);b=a.f;f.g=!0;a:for(c=2*(m-k),f=2*k+(c-1),m=2*(k+1)+(c-1);;){if(0===c)break a;b[m]=b[f];--m;--c;--f}b[2*k]=d;b[2*k+1]=e;a.ca|=g;return a}if(16<=m){k=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];k[c>>>b&31]=Zf.Ya(a,b+5,c,d,e,f);for(e=d=0;;)if(32>d)0!==
(this.ca>>>d&1)&&(k[d]=null!=this.f[e]?Zf.Ya(a,b+5,sc(this.f[e]),this.f[e],this.f[e+1],f):this.f[e+1],e+=2),d+=1;else break;return new Wf(a,m+1,k)}b=Array(2*(m+4));Ad(this.f,0,b,0,2*k);b[2*k]=d;b[2*k+1]=e;Ad(this.f,2*k,b,2*(k+1),2*(m-k));f.g=!0;a=this.Bb(a);a.f=b;a.ca|=g;return a}m=this.f[2*k];g=this.f[2*k+1];if(null==m)return m=g.Ya(a,b+5,c,d,e,f),m===g?this:Vf(this,a,2*k+1,m);if(Sf(d,m))return e===g?this:Vf(this,a,2*k+1,e);f.g=!0;f=b+5;d=Rf.ga?Rf.ga(a,f,m,g,c,d,e):Rf.call(null,a,f,m,g,c,d,e);e=
2*k;k=2*k+1;a=this.Bb(a);a.f[e]=null;a.f[k]=d;return a};
h.Xa=function(a,b,c,d,e){var f=1<<(b>>>a&31),g=Pd(this.ca&f-1);if(0===(this.ca&f)){var k=Pd(this.ca);if(16<=k){g=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];g[b>>>a&31]=Zf.Xa(a+5,b,c,d,e);for(d=c=0;;)if(32>c)0!==(this.ca>>>c&1)&&(g[c]=null!=this.f[d]?Zf.Xa(a+5,sc(this.f[d]),this.f[d],this.f[d+1],e):this.f[d+1],d+=2),c+=1;else break;return new Wf(null,k+1,g)}a=Array(2*(k+1));Ad(this.f,
0,a,0,2*g);a[2*g]=c;a[2*g+1]=d;Ad(this.f,2*g,a,2*(g+1),2*(k-g));e.g=!0;return new Yf(null,this.ca|f,a)}var m=this.f[2*g],f=this.f[2*g+1];if(null==m)return k=f.Xa(a+5,b,c,d,e),k===f?this:new Yf(null,this.ca,Tf(this.f,2*g+1,k));if(Sf(c,m))return d===f?this:new Yf(null,this.ca,Tf(this.f,2*g+1,d));e.g=!0;e=this.ca;k=this.f;a+=5;a=Rf.fa?Rf.fa(a,m,f,b,c,d):Rf.call(null,a,m,f,b,c,d);c=2*g;g=2*g+1;d=Sa(k);d[c]=null;d[g]=a;return new Yf(null,e,d)};
h.bc=function(a,b,c){var d=1<<(b>>>a&31);if(0===(this.ca&d))return this;var e=Pd(this.ca&d-1),f=this.f[2*e],g=this.f[2*e+1];return null==f?(a=g.bc(a+5,b,c),a===g?this:null!=a?new Yf(null,this.ca,Tf(this.f,2*e+1,a)):this.ca===d?null:new Yf(null,this.ca^d,Uf(this.f,e))):Sf(c,f)?new Yf(null,this.ca^d,Uf(this.f,e)):this};h.za=function(){return new Xf(this.f,0,null,null)};var Zf=new Yf(null,0,[]);function $f(a,b,c){this.f=a;this.v=b;this.Za=c}
$f.prototype.xa=function(){for(var a=this.f.length;;){if(null!=this.Za&&this.Za.xa())return!0;if(this.v<a){var b=this.f[this.v];this.v+=1;null!=b&&(this.Za=dc(b))}else return!1}};$f.prototype.next=function(){if(this.xa())return this.Za.next();throw Error("No such element");};$f.prototype.remove=function(){return Error("Unsupported operation")};function Wf(a,b,c){this.Z=a;this.w=b;this.f=c}h=Wf.prototype;h.Bb=function(a){return a===this.Z?this:new Wf(a,this.w,Sa(this.f))};
h.ac=function(){return Qf.a?Qf.a(this.f):Qf.call(null,this.f)};h.sb=function(a,b,c,d){var e=this.f[b>>>a&31];return null!=e?e.sb(a+5,b,c,d):d};h.Ya=function(a,b,c,d,e,f){var g=c>>>b&31,k=this.f[g];if(null==k)return a=Vf(this,a,g,Zf.Ya(a,b+5,c,d,e,f)),a.w+=1,a;b=k.Ya(a,b+5,c,d,e,f);return b===k?this:Vf(this,a,g,b)};
h.Xa=function(a,b,c,d,e){var f=b>>>a&31,g=this.f[f];if(null==g)return new Wf(null,this.w+1,Tf(this.f,f,Zf.Xa(a+5,b,c,d,e)));a=g.Xa(a+5,b,c,d,e);return a===g?this:new Wf(null,this.w,Tf(this.f,f,a))};
h.bc=function(a,b,c){var d=b>>>a&31,e=this.f[d];if(null!=e){a=e.bc(a+5,b,c);if(a===e)d=this;else if(null==a)if(8>=this.w)a:{e=this.f;a=e.length;b=Array(2*(this.w-1));c=0;for(var f=1,g=0;;)if(c<a)c!==d&&null!=e[c]&&(b[f]=e[c],f+=2,g|=1<<c),c+=1;else{d=new Yf(null,g,b);break a}}else d=new Wf(null,this.w-1,Tf(this.f,d,a));else d=new Wf(null,this.w,Tf(this.f,d,a));return d}return this};h.za=function(){return new $f(this.f,0,null)};
function ag(a,b,c){b*=2;for(var d=0;;)if(d<b){if(Sf(c,a[d]))return d;d+=2}else return-1}function bg(a,b,c,d){this.Z=a;this.jb=b;this.w=c;this.f=d}h=bg.prototype;h.Bb=function(a){if(a===this.Z)return this;var b=Array(2*(this.w+1));Ad(this.f,0,b,0,2*this.w);return new bg(a,this.jb,this.w,b)};h.ac=function(){return Pf.a?Pf.a(this.f):Pf.call(null,this.f)};h.sb=function(a,b,c,d){a=ag(this.f,this.w,c);return 0>a?d:Sf(c,this.f[a])?this.f[a+1]:d};
h.Ya=function(a,b,c,d,e,f){if(c===this.jb){b=ag(this.f,this.w,d);if(-1===b){if(this.f.length>2*this.w)return b=2*this.w,c=2*this.w+1,a=this.Bb(a),a.f[b]=d,a.f[c]=e,f.g=!0,a.w+=1,a;c=this.f.length;b=Array(c+2);Ad(this.f,0,b,0,c);b[c]=d;b[c+1]=e;f.g=!0;d=this.w+1;a===this.Z?(this.f=b,this.w=d,a=this):a=new bg(this.Z,this.jb,d,b);return a}return this.f[b+1]===e?this:Vf(this,a,b+1,e)}return(new Yf(a,1<<(this.jb>>>b&31),[null,this,null,null])).Ya(a,b,c,d,e,f)};
h.Xa=function(a,b,c,d,e){return b===this.jb?(a=ag(this.f,this.w,c),-1===a?(a=2*this.w,b=Array(a+2),Ad(this.f,0,b,0,a),b[a]=c,b[a+1]=d,e.g=!0,new bg(null,this.jb,this.w+1,b)):G.b(this.f[a],d)?this:new bg(null,this.jb,this.w,Tf(this.f,a+1,d))):(new Yf(null,1<<(this.jb>>>a&31),[null,this])).Xa(a,b,c,d,e)};h.bc=function(a,b,c){a=ag(this.f,this.w,c);return-1===a?this:1===this.w?null:new bg(null,this.jb,this.w-1,Uf(this.f,Nd(a,2)))};h.za=function(){return new Xf(this.f,0,null,null)};
var Rf=function Rf(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 6:return Rf.fa(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);case 7:return Rf.ga(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};
Rf.fa=function(a,b,c,d,e,f){var g=sc(b);if(g===d)return new bg(null,g,2,[b,c,e,f]);var k=new Of;return Zf.Xa(a,g,b,c,k).Xa(a,d,e,f,k)};Rf.ga=function(a,b,c,d,e,f,g){var k=sc(c);if(k===e)return new bg(null,k,2,[c,d,f,g]);var m=new Of;return Zf.Ya(a,b,k,c,d,m).Ya(a,b,e,f,g,m)};Rf.C=7;function cg(a,b,c,d,e){this.B=a;this.tb=b;this.v=c;this.T=d;this.s=e;this.o=32374860;this.F=0}h=cg.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.L=function(){return this.B};
h.R=function(){var a=this.s;return null!=a?a:this.s=a=Hc(this)};h.D=function(a,b){return Nc(this,b)};h.ea=function(){return Oc(Bc,this.B)};h.va=function(a,b){return cd.b(b,this)};h.wa=function(a,b,c){return cd.c(b,c,this)};h.ha=function(){return null==this.T?new T(null,2,5,U,[this.tb[this.v],this.tb[this.v+1]],null):K(this.T)};
h.Aa=function(){if(null==this.T){var a=this.tb,b=this.v+2;return Pf.c?Pf.c(a,b,null):Pf.call(null,a,b,null)}var a=this.tb,b=this.v,c=L(this.T);return Pf.c?Pf.c(a,b,c):Pf.call(null,a,b,c)};h.V=function(){return this};h.N=function(a,b){return new cg(b,this.tb,this.v,this.T,this.s)};h.W=function(a,b){return Xc(b,this)};cg.prototype[Ra]=function(){return Dc(this)};
var Pf=function Pf(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return Pf.a(arguments[0]);case 3:return Pf.c(arguments[0],arguments[1],arguments[2]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};Pf.a=function(a){return Pf.c(a,0,null)};
Pf.c=function(a,b,c){if(null==c)for(c=a.length;;)if(b<c){if(null!=a[b])return new cg(null,a,b,null,null);var d=a[b+1];if(t(d)&&(d=d.ac(),t(d)))return new cg(null,a,b+2,d,null);b+=2}else return null;else return new cg(null,a,b,c,null)};Pf.C=3;function dg(a,b,c,d,e){this.B=a;this.tb=b;this.v=c;this.T=d;this.s=e;this.o=32374860;this.F=0}h=dg.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.L=function(){return this.B};
h.R=function(){var a=this.s;return null!=a?a:this.s=a=Hc(this)};h.D=function(a,b){return Nc(this,b)};h.ea=function(){return Oc(Bc,this.B)};h.va=function(a,b){return cd.b(b,this)};h.wa=function(a,b,c){return cd.c(b,c,this)};h.ha=function(){return K(this.T)};h.Aa=function(){var a=this.tb,b=this.v,c=L(this.T);return Qf.u?Qf.u(null,a,b,c):Qf.call(null,null,a,b,c)};h.V=function(){return this};h.N=function(a,b){return new dg(b,this.tb,this.v,this.T,this.s)};h.W=function(a,b){return Xc(b,this)};
dg.prototype[Ra]=function(){return Dc(this)};var Qf=function Qf(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 1:return Qf.a(arguments[0]);case 4:return Qf.u(arguments[0],arguments[1],arguments[2],arguments[3]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};Qf.a=function(a){return Qf.u(null,a,0,null)};
Qf.u=function(a,b,c,d){if(null==d)for(d=b.length;;)if(c<d){var e=b[c];if(t(e)&&(e=e.ac(),t(e)))return new dg(a,b,c+1,e,null);c+=1}else return null;else return new dg(a,b,c,d,null)};Qf.C=4;Nf;function eg(a,b,c){this.Ja=a;this.Ac=b;this.rc=c}eg.prototype.xa=function(){return this.rc&&this.Ac.xa()};eg.prototype.next=function(){if(this.rc)return this.Ac.next();this.rc=!0;return this.Ja};eg.prototype.remove=function(){return Error("Unsupported operation")};
function jd(a,b,c,d,e,f){this.B=a;this.w=b;this.root=c;this.Ga=d;this.Ja=e;this.s=f;this.o=16123663;this.F=8196}h=jd.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.keys=function(){return Dc(Gf.a?Gf.a(this):Gf.call(null,this))};h.entries=function(){return Bf(r(this))};h.values=function(){return Dc(Hf.a?Hf.a(this):Hf.call(null,this))};h.has=function(a){return Ed(this,a)};h.get=function(a,b){return this.K(null,a,b)};
h.forEach=function(a){for(var b=r(this),c=null,d=0,e=0;;)if(e<d){var f=c.aa(null,e),g=P(f,0),f=P(f,1);a.b?a.b(f,g):a.call(null,f,g);e+=1}else if(b=r(b))yd(b)?(c=Xb(b),b=Yb(b),g=c,d=N(c),c=g):(c=K(b),g=P(c,0),f=P(c,1),a.b?a.b(f,g):a.call(null,f,g),b=L(b),c=null,d=0),e=0;else return null};h.S=function(a,b){return ib.c(this,b,null)};h.K=function(a,b,c){return null==b?this.Ga?this.Ja:c:null==this.root?c:this.root.sb(0,sc(b),b,c)};
h.za=function(){var a=this.root?dc(this.root):re;return this.Ga?new eg(this.Ja,a,!1):a};h.L=function(){return this.B};h.X=function(){return this.w};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Jc(this)};h.D=function(a,b){return yf(this,b)};h.Ib=function(){return new Nf({},this.root,this.w,this.Ga,this.Ja)};h.ea=function(){return zb(Kf,this.B)};
h.Ta=function(a,b){if(null==b)return this.Ga?new jd(this.B,this.w-1,this.root,!1,null,null):this;if(null==this.root)return this;var c=this.root.bc(0,sc(b),b);return c===this.root?this:new jd(this.B,this.w-1,c,this.Ga,this.Ja,null)};h.Ha=function(a,b,c){if(null==b)return this.Ga&&c===this.Ja?this:new jd(this.B,this.Ga?this.w:this.w+1,this.root,!0,c,null);a=new Of;b=(null==this.root?Zf:this.root).Xa(0,sc(b),b,c,a);return b===this.root?this:new jd(this.B,a.g?this.w+1:this.w,b,this.Ga,this.Ja,null)};
h.mc=function(a,b){return null==b?this.Ga:null==this.root?!1:this.root.sb(0,sc(b),b,Bd)!==Bd};h.V=function(){if(0<this.w){var a=null!=this.root?this.root.ac():null;return this.Ga?Xc(new T(null,2,5,U,[null,this.Ja],null),a):a}return null};h.N=function(a,b){return new jd(b,this.w,this.root,this.Ga,this.Ja,this.s)};
h.W=function(a,b){if(vd(b))return kb(this,bb.b(b,0),bb.b(b,1));for(var c=this,d=r(b);;){if(null==d)return c;var e=K(d);if(vd(e))c=kb(c,bb.b(e,0),bb.b(e,1)),d=L(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.S(null,c);case 3:return this.K(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return this.S(null,c)};a.c=function(a,c,d){return this.K(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Sa(b)))};h.a=function(a){return this.S(null,a)};h.b=function(a,b){return this.K(null,a,b)};var Kf=new jd(null,0,null,!1,null,Kc);
function ld(a,b){for(var c=a.length,d=0,e=Pb(Kf);;)if(d<c)var f=d+1,e=e.Zb(null,a[d],b[d]),d=f;else return Rb(e)}jd.prototype[Ra]=function(){return Dc(this)};function Nf(a,b,c,d,e){this.Z=a;this.root=b;this.count=c;this.Ga=d;this.Ja=e;this.o=258;this.F=56}function fg(a,b,c){if(a.Z){if(null==b)a.Ja!==c&&(a.Ja=c),a.Ga||(a.count+=1,a.Ga=!0);else{var d=new Of;b=(null==a.root?Zf:a.root).Ya(a.Z,0,sc(b),b,c,d);b!==a.root&&(a.root=b);d.g&&(a.count+=1)}return a}throw Error("assoc! after persistent!");}h=Nf.prototype;
h.X=function(){if(this.Z)return this.count;throw Error("count after persistent!");};h.S=function(a,b){return null==b?this.Ga?this.Ja:null:null==this.root?null:this.root.sb(0,sc(b),b)};h.K=function(a,b,c){return null==b?this.Ga?this.Ja:c:null==this.root?c:this.root.sb(0,sc(b),b,c)};
h.yb=function(a,b){var c;a:if(this.Z)if(null!=b?b.o&2048||b.Wc||(b.o?0:Ma(nb,b)):Ma(nb,b))c=fg(this,Ud.a?Ud.a(b):Ud.call(null,b),Vd.a?Vd.a(b):Vd.call(null,b));else{c=r(b);for(var d=this;;){var e=K(c);if(t(e))c=L(c),d=fg(d,Ud.a?Ud.a(e):Ud.call(null,e),Vd.a?Vd.a(e):Vd.call(null,e));else{c=d;break a}}}else throw Error("conj! after persistent");return c};h.Kb=function(){var a;if(this.Z)this.Z=null,a=new jd(null,this.count,this.root,this.Ga,this.Ja,null);else throw Error("persistent! called twice");return a};
h.Zb=function(a,b,c){return fg(this,b,c)};gg;hg;function hg(a,b,c,d,e){this.key=a;this.g=b;this.left=c;this.right=d;this.s=e;this.o=32402207;this.F=0}h=hg.prototype;h.replace=function(a,b,c,d){return new hg(a,b,c,d,null)};h.S=function(a,b){return bb.c(this,b,null)};h.K=function(a,b,c){return bb.c(this,b,c)};h.aa=function(a,b){return 0===b?this.key:1===b?this.g:null};h.Ia=function(a,b,c){return 0===b?this.key:1===b?this.g:c};
h.zb=function(a,b,c){return(new T(null,2,5,U,[this.key,this.g],null)).zb(null,b,c)};h.L=function(){return null};h.X=function(){return 2};h.Vb=function(){return this.key};h.Wb=function(){return this.g};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Hc(this)};h.D=function(a,b){return Nc(this,b)};h.ea=function(){return gd};h.va=function(a,b){return Rc(this,b)};h.wa=function(a,b,c){return Sc(this,b,c)};h.Ha=function(a,b,c){return kd.c(new T(null,2,5,U,[this.key,this.g],null),b,c)};
h.V=function(){return Za(Za(Bc,this.g),this.key)};h.N=function(a,b){return Oc(new T(null,2,5,U,[this.key,this.g],null),b)};h.W=function(a,b){return new T(null,3,5,U,[this.key,this.g,b],null)};h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.S(null,c);case 3:return this.K(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return this.S(null,c)};a.c=function(a,c,d){return this.K(null,c,d)};return a}();
h.apply=function(a,b){return this.call.apply(this,[this].concat(Sa(b)))};h.a=function(a){return this.S(null,a)};h.b=function(a,b){return this.K(null,a,b)};hg.prototype[Ra]=function(){return Dc(this)};function gg(a,b,c,d,e){this.key=a;this.g=b;this.left=c;this.right=d;this.s=e;this.o=32402207;this.F=0}h=gg.prototype;h.replace=function(a,b,c,d){return new gg(a,b,c,d,null)};h.S=function(a,b){return bb.c(this,b,null)};h.K=function(a,b,c){return bb.c(this,b,c)};
h.aa=function(a,b){return 0===b?this.key:1===b?this.g:null};h.Ia=function(a,b,c){return 0===b?this.key:1===b?this.g:c};h.zb=function(a,b,c){return(new T(null,2,5,U,[this.key,this.g],null)).zb(null,b,c)};h.L=function(){return null};h.X=function(){return 2};h.Vb=function(){return this.key};h.Wb=function(){return this.g};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Hc(this)};h.D=function(a,b){return Nc(this,b)};h.ea=function(){return gd};h.va=function(a,b){return Rc(this,b)};
h.wa=function(a,b,c){return Sc(this,b,c)};h.Ha=function(a,b,c){return kd.c(new T(null,2,5,U,[this.key,this.g],null),b,c)};h.V=function(){return Za(Za(Bc,this.g),this.key)};h.N=function(a,b){return Oc(new T(null,2,5,U,[this.key,this.g],null),b)};h.W=function(a,b){return new T(null,3,5,U,[this.key,this.g,b],null)};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.S(null,c);case 3:return this.K(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return this.S(null,c)};a.c=function(a,c,d){return this.K(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Sa(b)))};h.a=function(a){return this.S(null,a)};h.b=function(a,b){return this.K(null,a,b)};gg.prototype[Ra]=function(){return Dc(this)};Ud;
var Lc=function Lc(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ia(c.slice(0),0):null;return Lc.i(c)};Lc.i=function(a){for(var b=r(a),c=Pb(Kf);;)if(b){a=L(L(b));var d=K(b),b=dd(b),c=Sb(c,d,b),b=a}else return Rb(c)};Lc.C=0;Lc.G=function(a){return Lc.i(r(a))};function ig(a,b){this.U=a;this.Ca=b;this.o=32374988;this.F=0}h=ig.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.L=function(){return this.Ca};
h.Da=function(){var a=(null!=this.U?this.U.o&128||this.U.gc||(this.U.o?0:Ma(gb,this.U)):Ma(gb,this.U))?this.U.Da(null):L(this.U);return null==a?null:new ig(a,this.Ca)};h.R=function(){return Hc(this)};h.D=function(a,b){return Nc(this,b)};h.ea=function(){return Oc(Bc,this.Ca)};h.va=function(a,b){return cd.b(b,this)};h.wa=function(a,b,c){return cd.c(b,c,this)};h.ha=function(){return this.U.ha(null).Vb(null)};
h.Aa=function(){var a=(null!=this.U?this.U.o&128||this.U.gc||(this.U.o?0:Ma(gb,this.U)):Ma(gb,this.U))?this.U.Da(null):L(this.U);return null!=a?new ig(a,this.Ca):Bc};h.V=function(){return this};h.N=function(a,b){return new ig(this.U,b)};h.W=function(a,b){return Xc(b,this)};ig.prototype[Ra]=function(){return Dc(this)};function Gf(a){return(a=r(a))?new ig(a,null):null}function Ud(a){return pb(a)}function jg(a,b){this.U=a;this.Ca=b;this.o=32374988;this.F=0}h=jg.prototype;h.toString=function(){return gc(this)};
h.equiv=function(a){return this.D(null,a)};h.L=function(){return this.Ca};h.Da=function(){var a=(null!=this.U?this.U.o&128||this.U.gc||(this.U.o?0:Ma(gb,this.U)):Ma(gb,this.U))?this.U.Da(null):L(this.U);return null==a?null:new jg(a,this.Ca)};h.R=function(){return Hc(this)};h.D=function(a,b){return Nc(this,b)};h.ea=function(){return Oc(Bc,this.Ca)};h.va=function(a,b){return cd.b(b,this)};h.wa=function(a,b,c){return cd.c(b,c,this)};h.ha=function(){return this.U.ha(null).Wb(null)};
h.Aa=function(){var a=(null!=this.U?this.U.o&128||this.U.gc||(this.U.o?0:Ma(gb,this.U)):Ma(gb,this.U))?this.U.Da(null):L(this.U);return null!=a?new jg(a,this.Ca):Bc};h.V=function(){return this};h.N=function(a,b){return new jg(this.U,b)};h.W=function(a,b){return Xc(b,this)};jg.prototype[Ra]=function(){return Dc(this)};function Hf(a){return(a=r(a))?new jg(a,null):null}function Vd(a){return qb(a)}function kg(a){return t(ye(Id,a))?Ta.b(function(a,c){return fd.b(t(a)?a:V,c)},a):null}
function lg(a,b){return t(ye(Id,b))?Ta.b(function(a){return function(b,e){return Ta.c(a,t(b)?b:V,r(e))}}(function(b,d){var e=K(d),f=dd(d);return Ed(b,e)?kd.c(b,e,function(){var d=vc.b(b,e);return a.b?a.b(d,f):a.call(null,d,f)}()):kd.c(b,e,f)}),b):null}mg;function ng(a){this.Pb=a}ng.prototype.xa=function(){return this.Pb.xa()};ng.prototype.next=function(){if(this.Pb.xa())return this.Pb.next().Fa[0];throw Error("No such element");};ng.prototype.remove=function(){return Error("Unsupported operation")};
function og(a,b,c){this.B=a;this.Db=b;this.s=c;this.o=15077647;this.F=8196}h=og.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.keys=function(){return Dc(r(this))};h.entries=function(){var a=r(this);return new Cf(r(a))};h.values=function(){return Dc(r(this))};h.has=function(a){return Ed(this,a)};
h.forEach=function(a){for(var b=r(this),c=null,d=0,e=0;;)if(e<d){var f=c.aa(null,e),g=P(f,0),f=P(f,1);a.b?a.b(f,g):a.call(null,f,g);e+=1}else if(b=r(b))yd(b)?(c=Xb(b),b=Yb(b),g=c,d=N(c),c=g):(c=K(b),g=P(c,0),f=P(c,1),a.b?a.b(f,g):a.call(null,f,g),b=L(b),c=null,d=0),e=0;else return null};h.S=function(a,b){return ib.c(this,b,null)};h.K=function(a,b,c){return jb(this.Db,b)?b:c};h.za=function(){return new ng(dc(this.Db))};h.L=function(){return this.B};h.X=function(){return Va(this.Db)};
h.R=function(){var a=this.s;return null!=a?a:this.s=a=Jc(this)};h.D=function(a,b){return sd(b)&&N(this)===N(b)&&xe(function(a){return function(b){return Ed(a,b)}}(this),b)};h.Ib=function(){return new mg(Pb(this.Db))};h.ea=function(){return Oc(pg,this.B)};h.V=function(){return Gf(this.Db)};h.N=function(a,b){return new og(b,this.Db,this.s)};h.W=function(a,b){return new og(this.B,kd.c(this.Db,b,null),null)};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.S(null,c);case 3:return this.K(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.b=function(a,c){return this.S(null,c)};a.c=function(a,c,d){return this.K(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Sa(b)))};h.a=function(a){return this.S(null,a)};h.b=function(a,b){return this.K(null,a,b)};var pg=new og(null,V,Kc);og.prototype[Ra]=function(){return Dc(this)};
function mg(a){this.ob=a;this.F=136;this.o=259}h=mg.prototype;h.yb=function(a,b){this.ob=Sb(this.ob,b,null);return this};h.Kb=function(){return new og(null,Rb(this.ob),null)};h.X=function(){return N(this.ob)};h.S=function(a,b){return ib.c(this,b,null)};h.K=function(a,b,c){return ib.c(this.ob,b,Bd)===Bd?c:b};
h.call=function(){function a(a,b,c){return ib.c(this.ob,b,Bd)===Bd?c:b}function b(a,b){return ib.c(this.ob,b,Bd)===Bd?null:b}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.c=a;return c}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Sa(b)))};h.a=function(a){return ib.c(this.ob,a,Bd)===Bd?null:a};h.b=function(a,b){return ib.c(this.ob,a,Bd)===Bd?b:a};
function qg(a){a=r(a);if(null==a)return pg;if(a instanceof Ia&&0===a.v){a=a.f;a:for(var b=0,c=Pb(pg);;)if(b<a.length)var d=b+1,c=c.yb(null,a[b]),b=d;else break a;return c.Kb(null)}for(d=Pb(pg);;)if(null!=a)b=L(a),d=d.yb(null,a.ha(null)),a=b;else return Rb(d)}function rg(a){for(var b=gd;;)if(L(a))b=fd.b(b,K(a)),a=L(a);else return r(b)}function Td(a){if(null!=a&&(a.F&4096||a.Yc))return a.Xb(null);if("string"===typeof a)return a;throw Error([z("Doesn't support name: "),z(a)].join(""));}
function sg(a,b){for(var c=Pb(V),d=r(a),e=r(b);;)if(d&&e)var f=K(d),g=K(e),c=Sb(c,f,g),d=L(d),e=L(e);else return Rb(c)}function tg(a,b){return new ee(null,function(){var c=r(b);if(c){var d;d=K(c);d=a.a?a.a(d):a.call(null,d);c=t(d)?Xc(K(c),tg(a,Ac(c))):null}else c=null;return c},null,null)}function ug(a,b,c){this.v=a;this.end=b;this.step=c}ug.prototype.xa=function(){return 0<this.step?this.v<this.end:this.v>this.end};ug.prototype.next=function(){var a=this.v;this.v+=this.step;return a};
function vg(a,b,c,d,e){this.B=a;this.start=b;this.end=c;this.step=d;this.s=e;this.o=32375006;this.F=8192}h=vg.prototype;h.toString=function(){return gc(this)};h.equiv=function(a){return this.D(null,a)};h.aa=function(a,b){if(b<Va(this))return this.start+b*this.step;if(this.start>this.end&&0===this.step)return this.start;throw Error("Index out of bounds");};h.Ia=function(a,b,c){return b<Va(this)?this.start+b*this.step:this.start>this.end&&0===this.step?this.start:c};
h.za=function(){return new ug(this.start,this.end,this.step)};h.L=function(){return this.B};h.Da=function(){return 0<this.step?this.start+this.step<this.end?new vg(this.B,this.start+this.step,this.end,this.step,null):null:this.start+this.step>this.end?new vg(this.B,this.start+this.step,this.end,this.step,null):null};h.X=function(){return La(Fb(this))?0:Math.ceil((this.end-this.start)/this.step)};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Hc(this)};h.D=function(a,b){return Nc(this,b)};
h.ea=function(){return Oc(Bc,this.B)};h.va=function(a,b){return Rc(this,b)};h.wa=function(a,b,c){for(a=this.start;;)if(0<this.step?a<this.end:a>this.end){c=b.b?b.b(c,a):b.call(null,c,a);if(Qc(c))return M.a?M.a(c):M.call(null,c);a+=this.step}else return c};h.ha=function(){return null==Fb(this)?null:this.start};h.Aa=function(){return null!=Fb(this)?new vg(this.B,this.start+this.step,this.end,this.step,null):Bc};
h.V=function(){return 0<this.step?this.start<this.end?this:null:0>this.step?this.start>this.end?this:null:this.start===this.end?null:this};h.N=function(a,b){return new vg(b,this.start,this.end,this.step,this.s)};h.W=function(a,b){return Xc(b,this)};vg.prototype[Ra]=function(){return Dc(this)};function wg(a){return new vg(null,1,a,1,null)}function xg(a){a:for(var b=a;;)if(r(b))b=L(b);else break a;return a}
function yg(a,b){if("string"===typeof b){var c=a.exec(b);return G.b(K(c),b)?1===N(c)?K(c):Hd(c):null}throw new TypeError("re-matches must match against a string.");}function zg(a,b){if("string"===typeof b){var c=a.exec(b);return null==c?null:1===N(c)?K(c):Hd(c)}throw new TypeError("re-find must match against a string.");}function Ag(a){if(a instanceof RegExp)return a;var b=zg(/^\(\?([idmsux]*)\)/,a),c=P(b,0),b=P(b,1);a=Rd(a,N(c));return new RegExp(a,t(b)?b:"")}
function kf(a,b,c,d,e,f,g){var k=ua;ua=null==ua?null:ua-1;try{if(null!=ua&&0>ua)return B(a,"#");B(a,c);if(0===Fa.a(f))r(g)&&B(a,function(){var a=Bg.a(f);return t(a)?a:"..."}());else{if(r(g)){var m=K(g);b.c?b.c(m,a,f):b.call(null,m,a,f)}for(var p=L(g),u=Fa.a(f)-1;;)if(!p||null!=u&&0===u){r(p)&&0===u&&(B(a,d),B(a,function(){var a=Bg.a(f);return t(a)?a:"..."}()));break}else{B(a,d);var v=K(p);c=a;g=f;b.c?b.c(v,c,g):b.call(null,v,c,g);var w=L(p);c=u-1;p=w;u=c}}return B(a,e)}finally{ua=k}}
function Cg(a,b){for(var c=r(b),d=null,e=0,f=0;;)if(f<e){var g=d.aa(null,f);B(a,g);f+=1}else if(c=r(c))d=c,yd(d)?(c=Xb(d),e=Yb(d),d=c,g=N(c),c=e,e=g):(g=K(d),B(a,g),c=L(d),d=null,e=0),f=0;else return null}var Dg={'"':'\\"',"\\":"\\\\","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t"};function Eg(a){return[z('"'),z(a.replace(RegExp('[\\\\"\b\f\n\r\t]',"g"),function(a){return Dg[a]})),z('"')].join("")}Gg;
function Hg(a,b){var c=Cd(vc.b(a,Ca));return c?(c=null!=b?b.o&131072||b.Xc?!0:!1:!1)?null!=od(b):c:c}
function Ig(a,b,c){if(null==a)return B(b,"nil");if(Hg(c,a)){B(b,"^");var d=od(a);lf.c?lf.c(d,b,c):lf.call(null,d,b,c);B(b," ")}if(a.rb)return a.Ab(a,b,c);if(null!=a&&(a.o&2147483648||a.$))return a.M(null,b,c);if(!0===a||!1===a||"number"===typeof a)return B(b,""+z(a));if(null!=a&&a.constructor===Object)return B(b,"#js "),d=Sd.b(function(b){return new T(null,2,5,U,[de.a(b),a[b]],null)},zd(a)),Gg.u?Gg.u(d,lf,b,c):Gg.call(null,d,lf,b,c);if(Ka(a))return kf(b,lf,"#js ["," ","]",c,a);if("string"==typeof a)return t(Ba.a(c))?
B(b,Eg(a)):B(b,a);if("function"==l(a)){var e=a.name;c=t(function(){var a=null==e;return a?a:ea(e)}())?"Function":e;return Cg(b,I(["#object[",c,' "',""+z(a),'"]'],0))}if(a instanceof Date)return c=function(a,b){for(var c=""+z(a);;)if(N(c)<b)c=[z("0"),z(c)].join("");else return c},Cg(b,I(['#inst "',""+z(a.getUTCFullYear()),"-",c(a.getUTCMonth()+1,2),"-",c(a.getUTCDate(),2),"T",c(a.getUTCHours(),2),":",c(a.getUTCMinutes(),2),":",c(a.getUTCSeconds(),2),".",c(a.getUTCMilliseconds(),3),"-",'00:00"'],0));
if(a instanceof RegExp)return Cg(b,I(['#"',a.source,'"'],0));if(null!=a&&(a.o&2147483648||a.$))return Lb(a,b,c);if(t(a.constructor.cb))return Cg(b,I(["#object[",a.constructor.cb.replace(RegExp("/","g"),"."),"]"],0));e=a.constructor.name;c=t(function(){var a=null==e;return a?a:ea(e)}())?"Object":e;return Cg(b,I(["#object[",c," ",""+z(a),"]"],0))}function lf(a,b,c){var d=Jg.a(c);return t(d)?(c=kd.c(c,Kg,Ig),d.c?d.c(a,b,c):d.call(null,a,b,c)):Ig(a,b,c)}
function Lg(a,b){var c;if(pd(a))c="";else{c=z;var d=new ka,e=new fc(d);a:{lf(K(a),e,b);for(var f=r(L(a)),g=null,k=0,m=0;;)if(m<k){var p=g.aa(null,m);B(e," ");lf(p,e,b);m+=1}else if(f=r(f))g=f,yd(g)?(f=Xb(g),k=Yb(g),g=f,p=N(f),f=k,k=p):(p=K(g),B(e," "),lf(p,e,b),f=L(g),g=null,k=0),m=0;else break a}e.bb(null);c=""+c(d)}return c}var Ce=function Ce(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ia(c.slice(0),0):null;return Ce.i(c)};
Ce.i=function(a){return Lg(a,za())};Ce.C=0;Ce.G=function(a){return Ce.i(r(a))};var Mg=function Mg(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ia(c.slice(0),0):null;return Mg.i(c)};Mg.i=function(a){return Lg(a,kd.c(za(),Ba,!1))};Mg.C=0;Mg.G=function(a){return Mg.i(r(a))};function Ng(a){var b=kd.c(za(),Ba,!1);a=Lg(a,b);na.a?na.a(a):na.call(null,a);t(pa)?(a=za(),na.a?na.a("\n"):na.call(null,"\n"),a=(vc.b(a,Aa),null)):a=null;return a}
function Gg(a,b,c,d){return kf(c,function(a,c,d){var k=pb(a);b.c?b.c(k,c,d):b.call(null,k,c,d);B(c," ");a=qb(a);return b.c?b.c(a,c,d):b.call(null,a,c,d)},"{",", ","}",d,r(a))}He.prototype.$=!0;He.prototype.M=function(a,b,c){B(b,"#object [cljs.core.Volatile ");lf(new q(null,1,[Og,this.state],null),b,c);return B(b,"]")};xc.prototype.$=!0;xc.prototype.M=function(a,b,c){B(b,"#'");return lf(this.ic,b,c)};Ia.prototype.$=!0;Ia.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};
ee.prototype.$=!0;ee.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};cg.prototype.$=!0;cg.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};hg.prototype.$=!0;hg.prototype.M=function(a,b,c){return kf(b,lf,"["," ","]",c,this)};Ff.prototype.$=!0;Ff.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};Fc.prototype.$=!0;Fc.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};xd.prototype.$=!0;
xd.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};ae.prototype.$=!0;ae.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};Yc.prototype.$=!0;Yc.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};jd.prototype.$=!0;jd.prototype.M=function(a,b,c){return Gg(this,lf,b,c)};dg.prototype.$=!0;dg.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};pf.prototype.$=!0;pf.prototype.M=function(a,b,c){return kf(b,lf,"["," ","]",c,this)};og.prototype.$=!0;
og.prototype.M=function(a,b,c){return kf(b,lf,"#{"," ","}",c,this)};wd.prototype.$=!0;wd.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};Ae.prototype.$=!0;Ae.prototype.M=function(a,b,c){B(b,"#object [cljs.core.Atom ");lf(new q(null,1,[Og,this.state],null),b,c);return B(b,"]")};jg.prototype.$=!0;jg.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};gg.prototype.$=!0;gg.prototype.M=function(a,b,c){return kf(b,lf,"["," ","]",c,this)};T.prototype.$=!0;
T.prototype.M=function(a,b,c){return kf(b,lf,"["," ","]",c,this)};tf.prototype.$=!0;tf.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};Zd.prototype.$=!0;Zd.prototype.M=function(a,b){return B(b,"()")};we.prototype.$=!0;we.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};uf.prototype.$=!0;uf.prototype.M=function(a,b,c){return kf(b,lf,"#queue ["," ","]",c,r(this))};q.prototype.$=!0;q.prototype.M=function(a,b,c){return Gg(this,lf,b,c)};vg.prototype.$=!0;
vg.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};ig.prototype.$=!0;ig.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};Zc.prototype.$=!0;Zc.prototype.M=function(a,b,c){return kf(b,lf,"("," ",")",c,this)};F.prototype.Tb=!0;F.prototype.wb=function(a,b){if(b instanceof F)return uc(this,b);throw Error([z("Cannot compare "),z(this),z(" to "),z(b)].join(""));};y.prototype.Tb=!0;
y.prototype.wb=function(a,b){if(b instanceof y)return be(this,b);throw Error([z("Cannot compare "),z(this),z(" to "),z(b)].join(""));};pf.prototype.Tb=!0;pf.prototype.wb=function(a,b){if(vd(b))return Fd(this,b);throw Error([z("Cannot compare "),z(this),z(" to "),z(b)].join(""));};T.prototype.Tb=!0;T.prototype.wb=function(a,b){if(vd(b))return Fd(this,b);throw Error([z("Cannot compare "),z(this),z(" to "),z(b)].join(""));};
function Pg(a){return function(b,c){var d=a.b?a.b(b,c):a.call(null,b,c);return Qc(d)?new Pc(d):d}}
function Te(a){return function(b){return function(){function c(a,c){return Ta.c(b,a,c)}function d(b){return a.a?a.a(b):a.call(null,b)}function e(){return a.h?a.h():a.call(null)}var f=null,f=function(a,b){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};f.h=e;f.a=d;f.b=c;return f}()}(Pg(a))}Qg;function Rg(a,b){Ta.c(function(b,d){return a.a?a.a(d):a.call(null,d)},null,b)}function Sg(){}
var Tg=function Tg(b){if(null!=b&&null!=b.Tc)return b.Tc(b);var c=Tg[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Tg._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IEncodeJS.-clj-\x3ejs",b);};Ug;function Vg(a){return(null!=a?a.Sc||(a.gd?0:Ma(Sg,a)):Ma(Sg,a))?Tg(a):"string"===typeof a||"number"===typeof a||a instanceof y||a instanceof F?Ug.a?Ug.a(a):Ug.call(null,a):Ce.i(I([a],0))}
var Ug=function Ug(b){if(null==b)return null;if(null!=b?b.Sc||(b.gd?0:Ma(Sg,b)):Ma(Sg,b))return Tg(b);if(b instanceof y)return Td(b);if(b instanceof F)return""+z(b);if(ud(b)){var c={};b=r(b);for(var d=null,e=0,f=0;;)if(f<e){var g=d.aa(null,f),k=P(g,0),g=P(g,1);c[Vg(k)]=Ug(g);f+=1}else if(b=r(b))yd(b)?(e=Xb(b),b=Yb(b),d=e,e=N(e)):(e=K(b),d=P(e,0),e=P(e,1),c[Vg(d)]=Ug(e),b=L(b),d=null,e=0),f=0;else break;return c}if(qd(b)){c=[];b=r(Sd.b(Ug,b));d=null;for(f=e=0;;)if(f<e)k=d.aa(null,f),c.push(k),f+=1;
else if(b=r(b))d=b,yd(d)?(b=Xb(d),f=Yb(d),d=b,e=N(b),b=f):(b=K(d),c.push(b),b=L(d),d=null,e=0),f=0;else break;return c}return b},Qg=function Qg(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 0:return Qg.h();case 1:return Qg.a(arguments[0]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};Qg.h=function(){return Qg.a(1)};Qg.a=function(a){return Math.random()*a};Qg.C=1;function Wg(a){return Math.floor(Math.random()*a)}
function Xg(){var a=new T(null,3,5,U,[Yg,Zg,$g],null);return id(a,Wg(N(a)))}var ah=null;function bh(){if(null==ah){var a=new q(null,3,[ch,V,dh,V,eh,V],null);ah=W.a?W.a(a):W.call(null,a)}return ah}function fh(a,b,c){var d=G.b(b,c);if(!d&&!(d=Ed(eh.a(a).call(null,b),c))&&(d=vd(c))&&(d=vd(b)))if(d=N(c)===N(b))for(var d=!0,e=0;;)if(d&&e!==N(c))d=fh(a,b.a?b.a(e):b.call(null,e),c.a?c.a(e):c.call(null,e)),e+=1;else return d;else return d;else return d}
function gh(a){var b;b=bh();b=M.a?M.a(b):M.call(null,b);return qe(vc.b(ch.a(b),a))}function hh(a,b,c,d){Ge.b(a,function(){return M.a?M.a(b):M.call(null,b)});Ge.b(c,function(){return M.a?M.a(d):M.call(null,d)})}
var ih=function ih(b,c,d){var e=(M.a?M.a(d):M.call(null,d)).call(null,b),e=t(t(e)?e.a?e.a(c):e.call(null,c):e)?!0:null;if(t(e))return e;e=function(){for(var e=gh(c);;)if(0<N(e))ih(b,K(e),d),e=Ac(e);else return null}();if(t(e))return e;e=function(){for(var e=gh(b);;)if(0<N(e))ih(K(e),c,d),e=Ac(e);else return null}();return t(e)?e:!1};function jh(a,b,c){c=ih(a,b,c);if(t(c))a=c;else{c=fh;var d;d=bh();d=M.a?M.a(d):M.call(null,d);a=c(d,a,b)}return a}
var kh=function kh(b,c,d,e,f,g,k){var m=Ta.c(function(e,g){var k=P(g,0);P(g,1);if(fh(M.a?M.a(d):M.call(null,d),c,k)){var m;m=(m=null==e)?m:jh(k,K(e),f);m=t(m)?g:e;if(!t(jh(K(m),k,f)))throw Error([z("Multiple methods in multimethod '"),z(b),z("' match dispatch value: "),z(c),z(" -\x3e "),z(k),z(" and "),z(K(m)),z(", and neither is preferred")].join(""));return m}return e},null,M.a?M.a(e):M.call(null,e));if(t(m)){if(G.b(M.a?M.a(k):M.call(null,k),M.a?M.a(d):M.call(null,d)))return Ge.u(g,kd,c,dd(m)),
dd(m);hh(g,e,k,d);return kh(b,c,d,e,f,g,k)}return null},lh=function lh(b,c,d){if(null!=b&&null!=b.Va)return b.Va(0,c,d);var e=lh[l(null==b?null:b)];if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);e=lh._;if(null!=e)return e.c?e.c(b,c,d):e.call(null,b,c,d);throw Pa("IMultiFn.-add-method",b);};function mh(a,b){throw Error([z("No method in multimethod '"),z(a),z("' for dispatch value: "),z(b)].join(""));}
function nh(a,b,c,d,e,f,g,k){this.name=a;this.l=b;this.kd=c;this.$b=d;this.Qb=e;this.xd=f;this.cc=g;this.Sb=k;this.o=4194305;this.F=4352}h=nh.prototype;
h.call=function(){function a(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,J,R){a=this;var ya=A.i(a.l,b,c,d,e,I([f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,J,R],0)),ab=oh(this,ya);t(ab)||mh(a.name,ya);return A.i(ab,b,c,d,e,I([f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,J,R],0))}function b(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,J){a=this;var R=a.l.sa?a.l.sa(b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,J):a.l.call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,J),ya=oh(this,R);t(ya)||mh(a.name,R);return ya.sa?ya.sa(b,c,d,e,f,g,k,m,p,u,O,v,w,
x,D,C,H,E,S,J):ya.call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S,J)}function c(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S){a=this;var J=a.l.ra?a.l.ra(b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S):a.l.call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S),R=oh(this,J);t(R)||mh(a.name,J);return R.ra?R.ra(b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S):R.call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E,S)}function d(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E){a=this;var S=a.l.qa?a.l.qa(b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E):a.l.call(null,
b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E),J=oh(this,S);t(J)||mh(a.name,S);return J.qa?J.qa(b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E):J.call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H,E)}function e(a,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H){a=this;var E=a.l.pa?a.l.pa(b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H):a.l.call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H),S=oh(this,E);t(S)||mh(a.name,E);return S.pa?S.pa(b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H):S.call(null,b,c,d,e,f,g,k,m,p,u,O,v,w,x,D,C,H)}function f(a,b,c,d,e,f,g,k,m,p,u,v,w,x,
D,C,H){a=this;var E=a.l.oa?a.l.oa(b,c,d,e,f,g,k,m,p,u,v,w,x,D,C,H):a.l.call(null,b,c,d,e,f,g,k,m,p,u,v,w,x,D,C,H),S=oh(this,E);t(S)||mh(a.name,E);return S.oa?S.oa(b,c,d,e,f,g,k,m,p,u,v,w,x,D,C,H):S.call(null,b,c,d,e,f,g,k,m,p,u,v,w,x,D,C,H)}function g(a,b,c,d,e,f,g,k,m,p,u,v,w,x,D,C){a=this;var H=a.l.na?a.l.na(b,c,d,e,f,g,k,m,p,u,v,w,x,D,C):a.l.call(null,b,c,d,e,f,g,k,m,p,u,v,w,x,D,C),E=oh(this,H);t(E)||mh(a.name,H);return E.na?E.na(b,c,d,e,f,g,k,m,p,u,v,w,x,D,C):E.call(null,b,c,d,e,f,g,k,m,p,u,v,
w,x,D,C)}function k(a,b,c,d,e,f,g,k,m,p,u,v,w,x,D){a=this;var C=a.l.ma?a.l.ma(b,c,d,e,f,g,k,m,p,u,v,w,x,D):a.l.call(null,b,c,d,e,f,g,k,m,p,u,v,w,x,D),H=oh(this,C);t(H)||mh(a.name,C);return H.ma?H.ma(b,c,d,e,f,g,k,m,p,u,v,w,x,D):H.call(null,b,c,d,e,f,g,k,m,p,u,v,w,x,D)}function m(a,b,c,d,e,f,g,k,m,p,u,v,w,x){a=this;var D=a.l.la?a.l.la(b,c,d,e,f,g,k,m,p,u,v,w,x):a.l.call(null,b,c,d,e,f,g,k,m,p,u,v,w,x),C=oh(this,D);t(C)||mh(a.name,D);return C.la?C.la(b,c,d,e,f,g,k,m,p,u,v,w,x):C.call(null,b,c,d,e,f,
g,k,m,p,u,v,w,x)}function p(a,b,c,d,e,f,g,k,m,p,u,v,w){a=this;var x=a.l.ka?a.l.ka(b,c,d,e,f,g,k,m,p,u,v,w):a.l.call(null,b,c,d,e,f,g,k,m,p,u,v,w),D=oh(this,x);t(D)||mh(a.name,x);return D.ka?D.ka(b,c,d,e,f,g,k,m,p,u,v,w):D.call(null,b,c,d,e,f,g,k,m,p,u,v,w)}function u(a,b,c,d,e,f,g,k,m,p,u,v){a=this;var w=a.l.ja?a.l.ja(b,c,d,e,f,g,k,m,p,u,v):a.l.call(null,b,c,d,e,f,g,k,m,p,u,v),x=oh(this,w);t(x)||mh(a.name,w);return x.ja?x.ja(b,c,d,e,f,g,k,m,p,u,v):x.call(null,b,c,d,e,f,g,k,m,p,u,v)}function v(a,b,
c,d,e,f,g,k,m,p,u){a=this;var v=a.l.ia?a.l.ia(b,c,d,e,f,g,k,m,p,u):a.l.call(null,b,c,d,e,f,g,k,m,p,u),w=oh(this,v);t(w)||mh(a.name,v);return w.ia?w.ia(b,c,d,e,f,g,k,m,p,u):w.call(null,b,c,d,e,f,g,k,m,p,u)}function w(a,b,c,d,e,f,g,k,m,p){a=this;var u=a.l.ua?a.l.ua(b,c,d,e,f,g,k,m,p):a.l.call(null,b,c,d,e,f,g,k,m,p),v=oh(this,u);t(v)||mh(a.name,u);return v.ua?v.ua(b,c,d,e,f,g,k,m,p):v.call(null,b,c,d,e,f,g,k,m,p)}function x(a,b,c,d,e,f,g,k,m){a=this;var p=a.l.ta?a.l.ta(b,c,d,e,f,g,k,m):a.l.call(null,
b,c,d,e,f,g,k,m),u=oh(this,p);t(u)||mh(a.name,p);return u.ta?u.ta(b,c,d,e,f,g,k,m):u.call(null,b,c,d,e,f,g,k,m)}function C(a,b,c,d,e,f,g,k){a=this;var m=a.l.ga?a.l.ga(b,c,d,e,f,g,k):a.l.call(null,b,c,d,e,f,g,k),p=oh(this,m);t(p)||mh(a.name,m);return p.ga?p.ga(b,c,d,e,f,g,k):p.call(null,b,c,d,e,f,g,k)}function E(a,b,c,d,e,f,g){a=this;var k=a.l.fa?a.l.fa(b,c,d,e,f,g):a.l.call(null,b,c,d,e,f,g),m=oh(this,k);t(m)||mh(a.name,k);return m.fa?m.fa(b,c,d,e,f,g):m.call(null,b,c,d,e,f,g)}function D(a,b,c,d,
e,f){a=this;var g=a.l.P?a.l.P(b,c,d,e,f):a.l.call(null,b,c,d,e,f),k=oh(this,g);t(k)||mh(a.name,g);return k.P?k.P(b,c,d,e,f):k.call(null,b,c,d,e,f)}function H(a,b,c,d,e){a=this;var f=a.l.u?a.l.u(b,c,d,e):a.l.call(null,b,c,d,e),g=oh(this,f);t(g)||mh(a.name,f);return g.u?g.u(b,c,d,e):g.call(null,b,c,d,e)}function R(a,b,c,d){a=this;var e=a.l.c?a.l.c(b,c,d):a.l.call(null,b,c,d),f=oh(this,e);t(f)||mh(a.name,e);return f.c?f.c(b,c,d):f.call(null,b,c,d)}function S(a,b,c){a=this;var d=a.l.b?a.l.b(b,c):a.l.call(null,
b,c),e=oh(this,d);t(e)||mh(a.name,d);return e.b?e.b(b,c):e.call(null,b,c)}function ya(a,b){a=this;var c=a.l.a?a.l.a(b):a.l.call(null,b),d=oh(this,c);t(d)||mh(a.name,c);return d.a?d.a(b):d.call(null,b)}function ab(a){a=this;var b=a.l.h?a.l.h():a.l.call(null),c=oh(this,b);t(c)||mh(a.name,b);return c.h?c.h():c.call(null)}var J=null,J=function(J,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc,Mc,ec,zc,rd,Oe,Fg){switch(arguments.length){case 1:return ab.call(this,J);case 2:return ya.call(this,J,Z);case 3:return S.call(this,
J,Z,ca);case 4:return R.call(this,J,Z,ca,ga);case 5:return H.call(this,J,Z,ca,ga,ha);case 6:return D.call(this,J,Z,ca,ga,ha,ja);case 7:return E.call(this,J,Z,ca,ga,ha,ja,qa);case 8:return C.call(this,J,Z,ca,ga,ha,ja,qa,sa);case 9:return x.call(this,J,Z,ca,ga,ha,ja,qa,sa,xa);case 10:return w.call(this,J,Z,ca,ga,ha,ja,qa,sa,xa,Da);case 11:return v.call(this,J,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na);case 12:return u.call(this,J,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O);case 13:return p.call(this,J,Z,ca,ga,ha,ja,qa,sa,xa,
Da,Na,O,Ya);case 14:return m.call(this,J,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb);case 15:return k.call(this,J,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob);case 16:return g.call(this,J,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc);case 17:return f.call(this,J,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc,Mc);case 18:return e.call(this,J,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc,Mc,ec);case 19:return d.call(this,J,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc,Mc,ec,zc);case 20:return c.call(this,J,Z,ca,ga,ha,ja,
qa,sa,xa,Da,Na,O,Ya,cb,ob,rc,Mc,ec,zc,rd);case 21:return b.call(this,J,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc,Mc,ec,zc,rd,Oe);case 22:return a.call(this,J,Z,ca,ga,ha,ja,qa,sa,xa,Da,Na,O,Ya,cb,ob,rc,Mc,ec,zc,rd,Oe,Fg)}throw Error("Invalid arity: "+arguments.length);};J.a=ab;J.b=ya;J.c=S;J.u=R;J.P=H;J.fa=D;J.ga=E;J.ta=C;J.ua=x;J.ia=w;J.ja=v;J.ka=u;J.la=p;J.ma=m;J.na=k;J.oa=g;J.pa=f;J.qa=e;J.ra=d;J.sa=c;J.Ub=b;J.ab=a;return J}();h.apply=function(a,b){return this.call.apply(this,[this].concat(Sa(b)))};
h.h=function(){var a=this.l.h?this.l.h():this.l.call(null),b=oh(this,a);t(b)||mh(this.name,a);return b.h?b.h():b.call(null)};h.a=function(a){var b=this.l.a?this.l.a(a):this.l.call(null,a),c=oh(this,b);t(c)||mh(this.name,b);return c.a?c.a(a):c.call(null,a)};h.b=function(a,b){var c=this.l.b?this.l.b(a,b):this.l.call(null,a,b),d=oh(this,c);t(d)||mh(this.name,c);return d.b?d.b(a,b):d.call(null,a,b)};
h.c=function(a,b,c){var d=this.l.c?this.l.c(a,b,c):this.l.call(null,a,b,c),e=oh(this,d);t(e)||mh(this.name,d);return e.c?e.c(a,b,c):e.call(null,a,b,c)};h.u=function(a,b,c,d){var e=this.l.u?this.l.u(a,b,c,d):this.l.call(null,a,b,c,d),f=oh(this,e);t(f)||mh(this.name,e);return f.u?f.u(a,b,c,d):f.call(null,a,b,c,d)};h.P=function(a,b,c,d,e){var f=this.l.P?this.l.P(a,b,c,d,e):this.l.call(null,a,b,c,d,e),g=oh(this,f);t(g)||mh(this.name,f);return g.P?g.P(a,b,c,d,e):g.call(null,a,b,c,d,e)};
h.fa=function(a,b,c,d,e,f){var g=this.l.fa?this.l.fa(a,b,c,d,e,f):this.l.call(null,a,b,c,d,e,f),k=oh(this,g);t(k)||mh(this.name,g);return k.fa?k.fa(a,b,c,d,e,f):k.call(null,a,b,c,d,e,f)};h.ga=function(a,b,c,d,e,f,g){var k=this.l.ga?this.l.ga(a,b,c,d,e,f,g):this.l.call(null,a,b,c,d,e,f,g),m=oh(this,k);t(m)||mh(this.name,k);return m.ga?m.ga(a,b,c,d,e,f,g):m.call(null,a,b,c,d,e,f,g)};
h.ta=function(a,b,c,d,e,f,g,k){var m=this.l.ta?this.l.ta(a,b,c,d,e,f,g,k):this.l.call(null,a,b,c,d,e,f,g,k),p=oh(this,m);t(p)||mh(this.name,m);return p.ta?p.ta(a,b,c,d,e,f,g,k):p.call(null,a,b,c,d,e,f,g,k)};h.ua=function(a,b,c,d,e,f,g,k,m){var p=this.l.ua?this.l.ua(a,b,c,d,e,f,g,k,m):this.l.call(null,a,b,c,d,e,f,g,k,m),u=oh(this,p);t(u)||mh(this.name,p);return u.ua?u.ua(a,b,c,d,e,f,g,k,m):u.call(null,a,b,c,d,e,f,g,k,m)};
h.ia=function(a,b,c,d,e,f,g,k,m,p){var u=this.l.ia?this.l.ia(a,b,c,d,e,f,g,k,m,p):this.l.call(null,a,b,c,d,e,f,g,k,m,p),v=oh(this,u);t(v)||mh(this.name,u);return v.ia?v.ia(a,b,c,d,e,f,g,k,m,p):v.call(null,a,b,c,d,e,f,g,k,m,p)};h.ja=function(a,b,c,d,e,f,g,k,m,p,u){var v=this.l.ja?this.l.ja(a,b,c,d,e,f,g,k,m,p,u):this.l.call(null,a,b,c,d,e,f,g,k,m,p,u),w=oh(this,v);t(w)||mh(this.name,v);return w.ja?w.ja(a,b,c,d,e,f,g,k,m,p,u):w.call(null,a,b,c,d,e,f,g,k,m,p,u)};
h.ka=function(a,b,c,d,e,f,g,k,m,p,u,v){var w=this.l.ka?this.l.ka(a,b,c,d,e,f,g,k,m,p,u,v):this.l.call(null,a,b,c,d,e,f,g,k,m,p,u,v),x=oh(this,w);t(x)||mh(this.name,w);return x.ka?x.ka(a,b,c,d,e,f,g,k,m,p,u,v):x.call(null,a,b,c,d,e,f,g,k,m,p,u,v)};h.la=function(a,b,c,d,e,f,g,k,m,p,u,v,w){var x=this.l.la?this.l.la(a,b,c,d,e,f,g,k,m,p,u,v,w):this.l.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w),C=oh(this,x);t(C)||mh(this.name,x);return C.la?C.la(a,b,c,d,e,f,g,k,m,p,u,v,w):C.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w)};
h.ma=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x){var C=this.l.ma?this.l.ma(a,b,c,d,e,f,g,k,m,p,u,v,w,x):this.l.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x),E=oh(this,C);t(E)||mh(this.name,C);return E.ma?E.ma(a,b,c,d,e,f,g,k,m,p,u,v,w,x):E.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x)};
h.na=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C){var E=this.l.na?this.l.na(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C):this.l.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C),D=oh(this,E);t(D)||mh(this.name,E);return D.na?D.na(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C):D.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C)};
h.oa=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E){var D=this.l.oa?this.l.oa(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E):this.l.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E),H=oh(this,D);t(H)||mh(this.name,D);return H.oa?H.oa(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E):H.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E)};
h.pa=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D){var H=this.l.pa?this.l.pa(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D):this.l.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D),R=oh(this,H);t(R)||mh(this.name,H);return R.pa?R.pa(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D):R.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D)};
h.qa=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H){var R=this.l.qa?this.l.qa(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H):this.l.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H),S=oh(this,R);t(S)||mh(this.name,R);return S.qa?S.qa(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H):S.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H)};
h.ra=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R){var S=this.l.ra?this.l.ra(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R):this.l.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R),ya=oh(this,S);t(ya)||mh(this.name,S);return ya.ra?ya.ra(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R):ya.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R)};
h.sa=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S){var ya=this.l.sa?this.l.sa(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S):this.l.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S),ab=oh(this,ya);t(ab)||mh(this.name,ya);return ab.sa?ab.sa(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S):ab.call(null,a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S)};
h.Ub=function(a,b,c,d,e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya){var ab=A.i(this.l,a,b,c,d,I([e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya],0)),J=oh(this,ab);t(J)||mh(this.name,ab);return A.i(J,a,b,c,d,I([e,f,g,k,m,p,u,v,w,x,C,E,D,H,R,S,ya],0))};h.Va=function(a,b,c){Ge.u(this.Qb,kd,b,c);hh(this.cc,this.Qb,this.Sb,this.$b);return this};
function oh(a,b){G.b(M.a?M.a(a.Sb):M.call(null,a.Sb),M.a?M.a(a.$b):M.call(null,a.$b))||hh(a.cc,a.Qb,a.Sb,a.$b);var c=(M.a?M.a(a.cc):M.call(null,a.cc)).call(null,b);if(t(c))return c;c=kh(a.name,b,a.$b,a.Qb,a.xd,a.cc,a.Sb);return t(c)?c:(M.a?M.a(a.Qb):M.call(null,a.Qb)).call(null,a.kd)}h.Xb=function(){return $b(this.name)};h.Yb=function(){return ac(this.name)};h.R=function(){return aa(this)};function ph(a,b){this.Gb=a;this.s=b;this.o=2153775104;this.F=2048}h=ph.prototype;h.toString=function(){return this.Gb};
h.equiv=function(a){return this.D(null,a)};h.D=function(a,b){return b instanceof ph&&this.Gb===b.Gb};h.M=function(a,b){return B(b,[z('#uuid "'),z(this.Gb),z('"')].join(""))};h.R=function(){null==this.s&&(this.s=sc(this.Gb));return this.s};h.wb=function(a,b){return la(this.Gb,b.Gb)};var qh=new y(null,"mandatory","mandatory",542802336),rh=new F(null,"\x26","\x26",-2144855648,null),sh=new F(null,"init-cap-writer","init-cap-writer",-861558336,null),th=new y(null,"on-message","on-message",1662987808),uh=new y(null,"logical-blocks","logical-blocks",-1466339776),vh=new F("cljs.core","unquote","cljs.core/unquote",1013085760,null),wh=new F(null,"when-first","when-first",821699168,null),xh=new y(null,"arg3","arg3",-1486822496),yh=new y(null,"binary-type","binary-type",1096940609),zh=
new y(null,"schema","schema",-1582001791),Ah=new F(null,"defrecord*","defrecord*",-1936366207,null),Bh=new y(null,"coord","coord",-1453656639),Ch=new y(null,"suffix","suffix",367373057),Dh=new F(null,"try","try",-1273693247,null),Eh=new y(null,"selector","selector",762528866),Fh=new F("cljs.core","*print-level*","cljs.core/*print-level*",65848482,null),Gh=new F(null,"*print-circle*","*print-circle*",1148404994,null),Hh=new y(null,"else-params","else-params",-832171646),Ih=new y(null,"block","block",
664686210),Jh=new y(null,"allows-separator","allows-separator",-818967742),Kh=new F(null,"last-was-whitespace?","last-was-whitespace?",-1073928093,null),Lh=new y(null,"indent","indent",-148200125),Mh=new F("cljs.pprint","*print-pretty*","cljs.pprint/*print-pretty*",-762636861,null),Nh=new F("cljs.pprint","*print-pprint-dispatch*","cljs.pprint/*print-pprint-dispatch*",-1820734013,null),Oh=new F(null,"*print-suppress-namespaces*","*print-suppress-namespaces*",1795828355,null),Ph=new y(null,"miser-width",
"miser-width",-1310049437),Qh=new F(null,"struct","struct",325972931,null),Rh=new y("seria","invalid","seria/invalid",304067108),Ca=new y(null,"meta","meta",1499536964),Sh=new y(null,"body-type","body-type",542763588),Th=new F(null,"..","..",-300507420,null),Uh=new F(null,"*print-pretty*","*print-pretty*",726795140,null),Vh=new F(null,"meta12863","meta12863",1828607876,null),Wh=new F(null,"*print-pprint-dispatch*","*print-pprint-dispatch*",-1709114492,null),Xh=new y(null,"buffer-block","buffer-block",
-10937307),Yh=new y(null,"color","color",1011675173),Zh=new F(null,"max-columns","max-columns",-912112507,null),$h=new F(null,"upcase-writer","upcase-writer",51077317,null),Ea=new y(null,"dup","dup",556298533),ai=new y(null,"arg2","arg2",1729550917),bi=new y(null,"commainterval","commainterval",-1980061083),ci=new y(null,"pretty-writer","pretty-writer",-1222834267),di=new y(null,"parent","parent",-878878779),ei=new y(null,"diffed?","diffed?",-2094692346),fi=new y(null,"sections","sections",-886710106),
gi=new y(null,"schema-id","schema-id",342379782),hi=new y(null,"private","private",-558947994),ii=new y(null,"else","else",-1508377146),ji=new y(null,"miser","miser",-556060186),ki=new y(null,"undiff","undiff",1883196934),li=new y(null,"gen","gen",142575302),mi=new y(null,"on-close","on-close",-761178394),ni=new y(null,"right-margin","right-margin",-810413306),oi=new F("cljs.pprint","*print-base*","cljs.pprint/*print-base*",1887526790,null),pi=new F(null,"if-not","if-not",-265415609,null),qi=new F("cljs.core",
"deref","cljs.core/deref",1901963335,null),ri=new y(null,"offset","offset",296498311),si=new y(null,"meta-value","meta-value",1750038663),ti=new F(null,"*print-level*","*print-level*",-634488505,null),Fe=new F(null,"new-value","new-value",-1567397401,null),ui=new F(null,"doseq","doseq",221164135,null),vi=new y(null,"cur","cur",1153190599),wi=new y(null,"queue","queue",1455835879),Be=new y(null,"validator","validator",-1966190681),xi=new y(null,"coords","coords",-599429112),yi=new y(null,"default",
"default",-1987822328),zi=new y(null,"added","added",2057651688),Ai=new F(null,"when-let","when-let",-1383043480,null),Bi=new y(null,"func","func",-238706040),Ci=new F(null,"loop*","loop*",615029416,null),Di=new y(null,"ns","ns",441598760),Ei=new y(null,"symbol","symbol",-1038572696),Fi=new y(null,"generator-fn","generator-fn",811851656),Gi=new y(null,"name","name",1843675177),Hi=new F("cljs.pprint","*print-radix*","cljs.pprint/*print-radix*",1558253641,null),Ii=new y(null,"n","n",562130025),Ji=new y(null,
"w","w",354169001),Ki=new y(null,"not-delivered","not-delivered",1599158697),Li=new y(null,"remaining-arg-count","remaining-arg-count",-1216589335),Mi=new y(null,"fill","fill",883462889),Ni=new y(null,"value","value",305978217),Oi=new y(null,"section","section",-300141526),Pi=new y(null,"time","time",1385887882),Qi=new F(null,"*print-length*","*print-length*",-687693654,null),Ri=new F("cljs.pprint","*print-miser-width*","cljs.pprint/*print-miser-width*",1588913450,null),Si=new F(null,"cljs.core",
"cljs.core",770546058,null),Ti=new F(null,"miser-width","miser-width",330482090,null),Ui=new F(null,"let","let",358118826,null),Vi=new y(null,"file","file",-1269645878),Wi=new F(null,"-\x3e","-\x3e",-2139605430,null),Xi=new y(null,"end-pos","end-pos",-1643883926),Yi=new y(null,"circle","circle",1903212362),Zi=new y(null,"unpack","unpack",-2027067542),$i=new y(null,"end-column","end-column",1425389514),Zg=new y(null,"static","static",1214358571),aj=new F(null,"meta12463","meta12463",-960316341,null),
bj=new y(null,"mode","mode",654403691),cj=new y(null,"start","start",-355208981),dj=new y(null,"lines","lines",-700165781),ej=new y(null,"params","params",710516235),fj=new F(null,"fn","fn",465265323,null),gj=new y(null,"max-iterations","max-iterations",2021275563),hj=new y(null,"pos","pos",-864607220),Og=new y(null,"val","val",128701612),ij=new y(null,"writing","writing",-1486865108),jj=new F("cljs.pprint","*print-suppress-namespaces*","cljs.pprint/*print-suppress-namespaces*",1649488204,null),kj=
new y(null,"type","type",1174270348),lj=new F(null,"pretty-writer","pretty-writer",417697260,null),Ee=new F(null,"validate","validate",1439230700,null),mj=new y(null,"parameter-from-args","parameter-from-args",-758446196),nj=new F(null,"do","do",1686842252,null),oj=new y(null,"done-nl","done-nl",-381024340),pj=new F(null,"when-not","when-not",-1223136340,null),qj=new y(null,"suppress-namespaces","suppress-namespaces",2130686956),rj=new F(null,"when","when",1064114221,null),Kg=new y(null,"fallback-impl",
"fallback-impl",-1501286995),sj=new F(null,"diffed?","diffed?",-454160819,null),Aa=new y(null,"flush-on-newline","flush-on-newline",-151457939),tj=new y(null,"relative-to","relative-to",-470100051),uj=new y(null,"string","string",-1989541586),vj=new y(null,"vector","vector",1902966158),wj=new y(null,"angle","angle",1622094254),xj=new F(null,"defn","defn",-126010802,null),yj=new F(null,"letfn*","letfn*",-110097810,null),zj=new F(null,"capped","capped",-1650988402,null),Aj=new y(null,"e","e",1381269198),
Bj=new F(null,"if","if",1181717262,null),Cj=new y(null,"char-format","char-format",-1016499218),Dj=new y(null,"start-col","start-col",668080143),Ej=new y(null,"radix","radix",857016463),Fj=new F(null,"meta12166","meta12166",1218317455,null),Gj=new F(null,"new","new",-444906321,null),dh=new y(null,"descendants","descendants",1824886031),Hj=new y(null,"colon-up-arrow","colon-up-arrow",244853007),Ij=new F(null,"ns","ns",2082130287,null),Jj=new y(null,"k","k",-2146297393),Kj=new y(null,"prefix","prefix",
-265908465),Lj=new y(null,"column","column",2078222095),Mj=new y(null,"colon","colon",-965200945),eh=new y(null,"ancestors","ancestors",-776045424),Nj=new F(null,"value","value",1946509744,null),Oj=new y(null,"stream","stream",1534941648),Pj=new y(null,"level","level",1290497552),Qj=new F(null,"*print-radix*","*print-radix*",1168517744,null),Rj=new y(null,"meta-schema","meta-schema",-1703199056),Ke=new F(null,"n","n",-2092305744,null),Sj=new y(null,"user-data","user-data",2143823568),Ba=new y(null,
"readably","readably",1129599760),Tj=new y(null,"right-bracket","right-bracket",951856080),Bg=new y(null,"more-marker","more-marker",-14717935),Uj=new y(null,"dispatch","dispatch",1319337009),Vj=new F(null,"fields","fields",-291534703,null),Wj=new y(null,"meta-schema-id","meta-schema-id",-448920367),Xj=new F("cljs.pprint","*print-right-margin*","cljs.pprint/*print-right-margin*",-56183119,null),Yj=new F("cljs.core","*print-length*","cljs.core/*print-length*",-20766927,null),Zj=new F(null,"cljs.pprint",
"cljs.pprint",-966900911,null),ak=new y(null,"snapshot","snapshot",-1274785710),bk=new y(null,"fixtures","fixtures",1009814994),ck=new F(null,"deftype*","deftype*",962659890,null),dk=new F(null,"let*","let*",1920721458,null),ek=new F(null,"struct-map","struct-map",-1387540878,null),fk=new y(null,"padchar","padchar",2018584530),gk=new F(null,"js*","js*",-1134233646,null),hk=new F(null,"dotimes","dotimes",-818708397,null),ik=new y(null,"buffer-blob","buffer-blob",-1830112173),jk=new y(null,"interp",
"interp",1576701107),kk=new F(null,"*print-lines*","*print-lines*",75920659,null),Yg=new y(null,"dynamic","dynamic",704819571),lk=new y(null,"buffering","buffering",-876713613),mk=new y(null,"line","line",212345235),nk=new F(null,"with-open","with-open",172119667,null),ok=new y(null,"list","list",765357683),pk=new F(null,"fn*","fn*",-752876845,null),qk=new y(null,"right-params","right-params",-1790676237),rk=new F(null,"defonce","defonce",-1681484013,null),sk=new F(null,"recur","recur",1202958259,
null),tk=new F(null,"*print-miser-width*","*print-miser-width*",1206624211,null),uk=new F(null,"defn-","defn-",1097765044,null),Fa=new y(null,"print-length","print-length",1931866356),vk=new y(null,"max","max",61366548),wk=new y(null,"trailing-white-space","trailing-white-space",1496006996),xk=new F(null,"meta12815","meta12815",97497460,null),yk=new y(null,"id","id",-1388402092),zk=new y(null,"mincol","mincol",1230695445),Ak=new F("clojure.core","deref","clojure.core/deref",188719157,null),Bk=new y(null,
"minpad","minpad",323570901),Ck=new y(null,"current","current",-1088038603),Dk=new y(null,"at","at",1476951349),Ek=new y(null,"deref","deref",-145586795),ch=new y(null,"parents","parents",-2027538891),Fk=new y(null,"count","count",2139924085),Gk=new y(null,"per-line-prefix","per-line-prefix",846941813),ve=new F(null,"meta10025","meta10025",-199742827,null),Hk=new F(null,"/","/",-1371932971,null),Ik=new y(null,"colnum","colnum",2023796854),Jk=new F(null,"meta12845","meta12845",389787798,null),Kk=new F("cljs.core",
"*print-readably*","cljs.core/*print-readably*",-354670250,null),Lk=new y(null,"length","length",588987862),Mk=new F(null,"loop","loop",1244978678,null),Nk=new F("clojure.core","unquote","clojure.core/unquote",843087510,null),Ok=new y(null,"overflowchar","overflowchar",-1620088106),Pk=new y(null,"end-line","end-line",1837326455),Qk=new F(null,"condp","condp",1054325175,null),Rk=new y(null,"right","right",-452581833),Sk=new y(null,"colinc","colinc",-584873385),Tk=new F(null,"cond","cond",1606708055,
null),Uk=new y(null,"position","position",-2011731912),Vk=new y(null,"both","both",-393648840),Wk=new y(null,"d","d",1972142424),Xk=new F(null,"binding","binding",-2114503176,null),Yk=new F(null,"with-local-vars","with-local-vars",837642072,null),Zk=new y(null,"def","def",-1043430536),$k=new F(null,"defmacro","defmacro",2054157304,null),al=new F(null,"set!","set!",250714521,null),bl=new y(null,"clauses","clauses",1454841241),cl=new y(null,"indent-t","indent-t",528318969),dl=new y(null,"fixture","fixture",
1595630169),el=new y(null,"tag","tag",-1290361223),fl=new F("cljs.pprint","*print-circle*","cljs.pprint/*print-circle*",1606185849,null),gl=new y(null,"linear","linear",872268697),hl=new y(null,"seq","seq",-1817803783),il=new F(null,"locking","locking",1542862874,null),jl=new y(null,"on-error","on-error",1728533530),kl=new F(null,".",".",1975675962,null),ll=new F(null,"*print-right-margin*","*print-right-margin*",-437272454,null),ml=new y(null,"first","first",-644103046),nl=new F(null,"var","var",
870848730,null),ue=new F(null,"quote","quote",1377916282,null),ol=new y(null,"bracket-info","bracket-info",-1600092774),pl=new y(null,"set","set",304602554),ql=new y(null,"base-args","base-args",-1268706822),rl=new y(null,"pretty","pretty",-1916372486),sl=new F(null,"lb","lb",950310490,null),tl=new y(null,"end","end",-268185958),ul=new y(null,"logical-block-callback","logical-block-callback",1612691194),vl=new y(null,"base","base",185279322),te=new y(null,"arglists","arglists",1661989754),wl=new F(null,
"if-let","if-let",1803593690,null),se=new F(null,"nil-iter","nil-iter",1101030523,null),xl=new F(null,"*print-readably*","*print-readably*",-761361221,null),yl=new F(null,"capitalize-word-writer","capitalize-word-writer",196688059,null),zl=new y(null,"hierarchy","hierarchy",-1053470341),Al=new y(null,"buffer-level","buffer-level",928864731),Bl=new y(null,"intra-block-nl","intra-block-nl",1808826875),Cl=new y(null,"body","body",-2049205669),Dl=new y(null,"separator","separator",-1628749125),El=new y(null,
"flags","flags",1775418075),Jg=new y(null,"alt-impl","alt-impl",670969595),Fl=new F(null,"writer","writer",1362963291,null),Gl=new y(null,"doc","doc",1913296891),Hl=new y(null,"directive","directive",793559132),Il=new y(null,"logical-block","logical-block",-581022564),Jl=new y(null,"bodies","bodies",-1295887172),Kl=new y(null,"last","last",1105735132),Ll=new y(null,"jsdoc","jsdoc",1745183516),Ml=new F("cljs.pprint","*print-lines*","cljs.pprint/*print-lines*",534683484,null),Nl=new y("seria","dnil",
"seria/dnil",1154007932),Ol=new F(null,"deref","deref",1494944732,null),Pl=new y(null,"up-arrow","up-arrow",1705310333),Ql=new y(null,"type-tag","type-tag",-1873863267),Rl=new y(null,"on-open","on-open",-1391088163),Sl=new y(null,"map","map",1371690461),Tl=new y(null,"pack","pack",-1240257891),Ul=new y(null,"min-remaining","min-remaining",962687677),Vl=new y(null,"test","test",577538877),Wl=new y(null,"rest","rest",-1241696419),Xl=new F(null,"throw","throw",595905694,null),Yl=new y(null,"arg1","arg1",
951899358),Zl=new y(null,"nl-t","nl-t",-1608382114),$l=new y(null,"buffer","buffer",617295198),am=new y(null,"start-pos","start-pos",668789086),bm=new y(null,"max-columns","max-columns",1742323262),cm=new y(null,"start-block-t","start-block-t",-373430594),Je=new F(null,"number?","number?",-1747282210,null),dm=new y(null,"exponentchar","exponentchar",1986664222),$g=new y(null,"kinetic","kinetic",-451191810),em=new y(null,"end-block-t","end-block-t",1544648735),fm=new F(null,"def","def",597100991,null),
gm=new y(null,"diff","diff",2135942783),hm=new F(null,"*print-base*","*print-base*",2037937791,null),im=new F(null,"meta12827","meta12827",-1997467905,null),jm=new y(null,"data","data",-232669377),km=new y(null,"commachar","commachar",652859327),lm=new F(null,"downcase-writer","downcase-writer",37286911,null);var mm=new q(null,5,[th,"onmessage",Rl,"onopen",jl,"onerror",mi,"onclose",yh,"binaryType"],null);function nm(){var a=[z("ws://"),z(location.host)].join(""),b=om,a=new WebSocket(a);Rg(function(a){return function(b){var e=P(b,0);b=P(b,1);e=mm.a?mm.a(e):mm.call(null,e);return t(e)?a[e]=b:null}}(a),b);return a}function pm(a,b){var c;c=t(a)?G.b(1,a.readyState):a;return t(c)?(a.send(b),!0):!1};function qm(a){return a.toUpperCase()}function rm(a){return a.toLowerCase()}function sm(a){return"/(?:)/"===""+z("\n")?fd.b(Hd(Xc("",Sd.b(z,r(a)))),""):Hd((""+z(a)).split("\n"))};var tm,um,vm,wm,xm,ym,zm=function zm(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ia(c.slice(0),0):null;return zm.i(c)};zm.i=function(a){return B(n,A.b(Mg,a))};zm.C=0;zm.G=function(a){return zm.i(r(a))};var Am=function Am(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=0<c.length?new Ia(c.slice(0),0):null;return Am.i(c)};Am.i=function(a){return B(n,A.b(Ce,a))};Am.C=0;Am.G=function(a){return Am.i(r(a))};
function Bm(a){for(var b=[],c=arguments.length,d=0;;)if(d<c)b.push(arguments[d]),d+=1;else break;b=0<b.length?new Ia(b.slice(0),0):null;A.b(Am,b);B(n,"\n")}function Cm(a){if("number"===typeof a)return a;if("string"===typeof a&&1===a.length)return a.charCodeAt(0);throw Error("Argument to char must be a character or number");}
function Dm(a,b,c){var d=c;for(c=gd;;){if(pd(d))return new T(null,2,5,U,[c,b],null);var e=K(d),d=L(d),e=A.b(a,new T(null,2,5,U,[e,b],null));b=P(e,0);e=P(e,1);c=fd.b(c,b);b=e}}function Em(a,b){for(var c=b,d=gd;;){var e=A.b(a,new T(null,1,5,U,[c],null)),c=P(e,0),e=P(e,1);if(La(c))return new T(null,2,5,U,[d,e],null);d=fd.b(d,c);c=e}}
function Fm(a){return new T(null,2,5,U,[We(V,function(){return function c(a){return new ee(null,function(){for(;;){var e=r(a);if(e){if(yd(e)){var f=Xb(e),g=N(f),k=ie(g);a:for(var m=0;;)if(m<g){var p=bb.b(f,m),u=P(p,0),p=P(p,1),v=P(p,0);P(p,1);k.add(new T(null,2,5,U,[u,v],null));m+=1}else{f=!0;break a}return f?je(k.ya(),c(Yb(e))):je(k.ya(),null)}f=K(e);k=P(f,0);f=P(f,1);g=P(f,0);P(f,1);return Xc(new T(null,2,5,U,[k,g],null),c(Ac(e)))}return null}},null,null)}(a)}()),We(V,function(){return function c(a){return new ee(null,
function(){for(;;){var e=r(a);if(e){if(yd(e)){var f=Xb(e),g=N(f),k=ie(g);a:for(var m=0;;)if(m<g){var p=bb.b(f,m),u=P(p,0),p=P(p,1);P(p,0);p=P(p,1);k.add(new T(null,2,5,U,[u,p],null));m+=1}else{f=!0;break a}return f?je(k.ya(),c(Yb(e))):je(k.ya(),null)}f=K(e);k=P(f,0);f=P(f,1);P(f,0);f=P(f,1);return Xc(new T(null,2,5,U,[k,f],null),c(Ac(e)))}return null}},null,null)}(a)}())],null)}
function Gm(a,b){return We(V,function(){return function d(a){return new ee(null,function(){for(;;){var f=r(a);if(f){if(yd(f)){var g=Xb(f),k=N(g),m=ie(k);a:for(var p=0;;)if(p<k){var u=bb.b(g,p),v=P(u,0),u=P(u,1);m.add(new T(null,2,5,U,[v,new T(null,2,5,U,[u,b],null)],null));p+=1}else{g=!0;break a}return g?je(m.ya(),d(Yb(f))):je(m.ya(),null)}g=K(f);m=P(g,0);g=P(g,1);return Xc(new T(null,2,5,U,[m,new T(null,2,5,U,[g,b],null)],null),d(Ac(f)))}return null}},null,null)}(a)}())}
var Hm=function Hm(b){if(null!=b&&null!=b.yc)return b.yc(b);var c=Hm[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Hm._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("IPrettyFlush.-ppflush",b);};function Im(a,b){var c;c=M.a?M.a(a):M.call(null,a);c=M.a?M.a(c):M.call(null,c);return b.a?b.a(c):b.call(null,c)}function Jm(a,b,c){Ge.u(M.a?M.a(a):M.call(null,a),kd,b,c)}function Km(a){return Im(a,vi)}function Lm(a){return Im(a,vk)}
function Mm(a,b){G.b(b,"\n")?(Jm(a,vi,0),Jm(a,mk,Im(a,mk)+1)):Jm(a,vi,Im(a,vi)+1);return B(Im(a,vl),b)}
function Nm(a,b){var c=function(){var c=new q(null,4,[vk,b,vi,0,mk,0,vl,a],null);return W.a?W.a(c):W.call(null,c)}();"undefined"===typeof tm&&(tm=function(a,b,c,g){this.ba=a;this.qc=b;this.Cb=c;this.pd=g;this.o=1074167808;this.F=0},tm.prototype.N=function(){return function(a,b){return new tm(this.ba,this.qc,this.Cb,b)}}(c),tm.prototype.L=function(){return function(){return this.pd}}(c),tm.prototype.xb=function(){return function(){return this.Cb}}(c),tm.prototype.bb=function(){return function(){return Kb(this.ba)}}(c),
tm.prototype.qb=function(a){return function(b,c){var g=Oa(c);if(t(G.b?G.b(String,g):G.call(null,String,g))){var k=c.lastIndexOf("\n");0>k?Jm(this,vi,Im(this,vi)+N(c)):(Jm(this,vi,N(c)-k-1),Jm(this,mk,Im(this,mk)+N(Ve(function(){return function(a){return G.b(a,"\n")}}(c,k,G,g,this,a),c))));return B(Im(this,vl),c)}if(t(G.b?G.b(Number,g):G.call(null,Number,g)))return Mm(this,c);throw Error([z("No matching clause: "),z(g)].join(""));}}(c),tm.Ob=function(){return function(){return new T(null,4,5,U,[Fl,
Zh,Vj,Fj],null)}}(c),tm.rb=!0,tm.cb="cljs.pprint/t_cljs$pprint12165",tm.Ab=function(){return function(a,b){return B(b,"cljs.pprint/t_cljs$pprint12165")}}(c));return new tm(a,b,c,V)}Om;function Pm(a,b,c,d,e,f,g,k,m,p,u,v,w){this.parent=a;this.Pa=b;this.Qa=c;this.La=d;this.Ka=e;this.Ma=f;this.prefix=g;this.Oa=k;this.Ra=m;this.Na=p;this.A=u;this.m=v;this.s=w;this.o=2229667594;this.F=8192}h=Pm.prototype;h.S=function(a,b){return ib.c(this,b,null)};
h.K=function(a,b,c){switch(b instanceof y?b.Y:null){case "suffix":return this.Ra;case "indent":return this.La;case "parent":return this.parent;case "section":return this.Pa;case "done-nl":return this.Ka;case "start-col":return this.Qa;case "prefix":return this.prefix;case "per-line-prefix":return this.Oa;case "logical-block-callback":return this.Na;case "intra-block-nl":return this.Ma;default:return vc.c(this.m,b,c)}};
h.M=function(a,b,c){return kf(b,function(){return function(a){return kf(b,lf,""," ","",c,a)}}(this),"#cljs.pprint.logical-block{",", ","}",c,ne.b(new T(null,10,5,U,[new T(null,2,5,U,[di,this.parent],null),new T(null,2,5,U,[Oi,this.Pa],null),new T(null,2,5,U,[Dj,this.Qa],null),new T(null,2,5,U,[Lh,this.La],null),new T(null,2,5,U,[oj,this.Ka],null),new T(null,2,5,U,[Bl,this.Ma],null),new T(null,2,5,U,[Kj,this.prefix],null),new T(null,2,5,U,[Gk,this.Oa],null),new T(null,2,5,U,[Ch,this.Ra],null),new T(null,
2,5,U,[ul,this.Na],null)],null),this.m))};h.za=function(){return new zf(0,this,10,new T(null,10,5,U,[di,Oi,Dj,Lh,oj,Bl,Kj,Gk,Ch,ul],null),dc(this.m))};h.L=function(){return this.A};h.X=function(){return 10+N(this.m)};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Wd(this)};h.D=function(a,b){var c;c=t(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return t(c)?!0:!1};
h.Ta=function(a,b){return Ed(new og(null,new q(null,10,[Ch,null,Lh,null,di,null,Oi,null,oj,null,Dj,null,Kj,null,Gk,null,ul,null,Bl,null],null),null),b)?md.b(Oc(We(V,this),this.A),b):new Pm(this.parent,this.Pa,this.Qa,this.La,this.Ka,this.Ma,this.prefix,this.Oa,this.Ra,this.Na,this.A,qe(md.b(this.m,b)),null)};
h.Ha=function(a,b,c){return t(Q.b?Q.b(di,b):Q.call(null,di,b))?new Pm(c,this.Pa,this.Qa,this.La,this.Ka,this.Ma,this.prefix,this.Oa,this.Ra,this.Na,this.A,this.m,null):t(Q.b?Q.b(Oi,b):Q.call(null,Oi,b))?new Pm(this.parent,c,this.Qa,this.La,this.Ka,this.Ma,this.prefix,this.Oa,this.Ra,this.Na,this.A,this.m,null):t(Q.b?Q.b(Dj,b):Q.call(null,Dj,b))?new Pm(this.parent,this.Pa,c,this.La,this.Ka,this.Ma,this.prefix,this.Oa,this.Ra,this.Na,this.A,this.m,null):t(Q.b?Q.b(Lh,b):Q.call(null,Lh,b))?new Pm(this.parent,
this.Pa,this.Qa,c,this.Ka,this.Ma,this.prefix,this.Oa,this.Ra,this.Na,this.A,this.m,null):t(Q.b?Q.b(oj,b):Q.call(null,oj,b))?new Pm(this.parent,this.Pa,this.Qa,this.La,c,this.Ma,this.prefix,this.Oa,this.Ra,this.Na,this.A,this.m,null):t(Q.b?Q.b(Bl,b):Q.call(null,Bl,b))?new Pm(this.parent,this.Pa,this.Qa,this.La,this.Ka,c,this.prefix,this.Oa,this.Ra,this.Na,this.A,this.m,null):t(Q.b?Q.b(Kj,b):Q.call(null,Kj,b))?new Pm(this.parent,this.Pa,this.Qa,this.La,this.Ka,this.Ma,c,this.Oa,this.Ra,this.Na,this.A,
this.m,null):t(Q.b?Q.b(Gk,b):Q.call(null,Gk,b))?new Pm(this.parent,this.Pa,this.Qa,this.La,this.Ka,this.Ma,this.prefix,c,this.Ra,this.Na,this.A,this.m,null):t(Q.b?Q.b(Ch,b):Q.call(null,Ch,b))?new Pm(this.parent,this.Pa,this.Qa,this.La,this.Ka,this.Ma,this.prefix,this.Oa,c,this.Na,this.A,this.m,null):t(Q.b?Q.b(ul,b):Q.call(null,ul,b))?new Pm(this.parent,this.Pa,this.Qa,this.La,this.Ka,this.Ma,this.prefix,this.Oa,this.Ra,c,this.A,this.m,null):new Pm(this.parent,this.Pa,this.Qa,this.La,this.Ka,this.Ma,
this.prefix,this.Oa,this.Ra,this.Na,this.A,kd.c(this.m,b,c),null)};h.V=function(){return r(ne.b(new T(null,10,5,U,[new T(null,2,5,U,[di,this.parent],null),new T(null,2,5,U,[Oi,this.Pa],null),new T(null,2,5,U,[Dj,this.Qa],null),new T(null,2,5,U,[Lh,this.La],null),new T(null,2,5,U,[oj,this.Ka],null),new T(null,2,5,U,[Bl,this.Ma],null),new T(null,2,5,U,[Kj,this.prefix],null),new T(null,2,5,U,[Gk,this.Oa],null),new T(null,2,5,U,[Ch,this.Ra],null),new T(null,2,5,U,[ul,this.Na],null)],null),this.m))};
h.N=function(a,b){return new Pm(this.parent,this.Pa,this.Qa,this.La,this.Ka,this.Ma,this.prefix,this.Oa,this.Ra,this.Na,b,this.m,this.s)};h.W=function(a,b){return vd(b)?kb(this,bb.b(b,0),bb.b(b,1)):Ta.c(Za,this,b)};function Qm(a,b){for(var c=di.a(b);;){if(null==c)return!1;if(a===c)return!0;c=di.a(c)}}function Rm(a){return(a=r(a))?Xi.a(ed(a))-am.a(K(a)):0}function Sm(a,b,c,d,e,f,g,k){this.J=a;this.data=b;this.gb=c;this.I=d;this.H=e;this.A=f;this.m=g;this.s=k;this.o=2229667594;this.F=8192}h=Sm.prototype;
h.S=function(a,b){return ib.c(this,b,null)};h.K=function(a,b,c){switch(b instanceof y?b.Y:null){case "type-tag":return this.J;case "data":return this.data;case "trailing-white-space":return this.gb;case "start-pos":return this.I;case "end-pos":return this.H;default:return vc.c(this.m,b,c)}};
h.M=function(a,b,c){return kf(b,function(){return function(a){return kf(b,lf,""," ","",c,a)}}(this),"#cljs.pprint.buffer-blob{",", ","}",c,ne.b(new T(null,5,5,U,[new T(null,2,5,U,[Ql,this.J],null),new T(null,2,5,U,[jm,this.data],null),new T(null,2,5,U,[wk,this.gb],null),new T(null,2,5,U,[am,this.I],null),new T(null,2,5,U,[Xi,this.H],null)],null),this.m))};h.za=function(){return new zf(0,this,5,new T(null,5,5,U,[Ql,jm,wk,am,Xi],null),dc(this.m))};h.L=function(){return this.A};
h.X=function(){return 5+N(this.m)};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Wd(this)};h.D=function(a,b){var c;c=t(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return t(c)?!0:!1};h.Ta=function(a,b){return Ed(new og(null,new q(null,5,[Xi,null,wk,null,Ql,null,am,null,jm,null],null),null),b)?md.b(Oc(We(V,this),this.A),b):new Sm(this.J,this.data,this.gb,this.I,this.H,this.A,qe(md.b(this.m,b)),null)};
h.Ha=function(a,b,c){return t(Q.b?Q.b(Ql,b):Q.call(null,Ql,b))?new Sm(c,this.data,this.gb,this.I,this.H,this.A,this.m,null):t(Q.b?Q.b(jm,b):Q.call(null,jm,b))?new Sm(this.J,c,this.gb,this.I,this.H,this.A,this.m,null):t(Q.b?Q.b(wk,b):Q.call(null,wk,b))?new Sm(this.J,this.data,c,this.I,this.H,this.A,this.m,null):t(Q.b?Q.b(am,b):Q.call(null,am,b))?new Sm(this.J,this.data,this.gb,c,this.H,this.A,this.m,null):t(Q.b?Q.b(Xi,b):Q.call(null,Xi,b))?new Sm(this.J,this.data,this.gb,this.I,c,this.A,this.m,null):
new Sm(this.J,this.data,this.gb,this.I,this.H,this.A,kd.c(this.m,b,c),null)};h.V=function(){return r(ne.b(new T(null,5,5,U,[new T(null,2,5,U,[Ql,this.J],null),new T(null,2,5,U,[jm,this.data],null),new T(null,2,5,U,[wk,this.gb],null),new T(null,2,5,U,[am,this.I],null),new T(null,2,5,U,[Xi,this.H],null)],null),this.m))};h.N=function(a,b){return new Sm(this.J,this.data,this.gb,this.I,this.H,b,this.m,this.s)};h.W=function(a,b){return vd(b)?kb(this,bb.b(b,0),bb.b(b,1)):Ta.c(Za,this,b)};
function Tm(a,b,c,d){return new Sm(ik,a,b,c,d,null,null,null)}function Um(a,b,c,d,e,f,g,k){this.J=a;this.type=b;this.O=c;this.I=d;this.H=e;this.A=f;this.m=g;this.s=k;this.o=2229667594;this.F=8192}h=Um.prototype;h.S=function(a,b){return ib.c(this,b,null)};h.K=function(a,b,c){switch(b instanceof y?b.Y:null){case "type-tag":return this.J;case "type":return this.type;case "logical-block":return this.O;case "start-pos":return this.I;case "end-pos":return this.H;default:return vc.c(this.m,b,c)}};
h.M=function(a,b,c){return kf(b,function(){return function(a){return kf(b,lf,""," ","",c,a)}}(this),"#cljs.pprint.nl-t{",", ","}",c,ne.b(new T(null,5,5,U,[new T(null,2,5,U,[Ql,this.J],null),new T(null,2,5,U,[kj,this.type],null),new T(null,2,5,U,[Il,this.O],null),new T(null,2,5,U,[am,this.I],null),new T(null,2,5,U,[Xi,this.H],null)],null),this.m))};h.za=function(){return new zf(0,this,5,new T(null,5,5,U,[Ql,kj,Il,am,Xi],null),dc(this.m))};h.L=function(){return this.A};h.X=function(){return 5+N(this.m)};
h.R=function(){var a=this.s;return null!=a?a:this.s=a=Wd(this)};h.D=function(a,b){var c;c=t(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return t(c)?!0:!1};h.Ta=function(a,b){return Ed(new og(null,new q(null,5,[Xi,null,kj,null,Il,null,Ql,null,am,null],null),null),b)?md.b(Oc(We(V,this),this.A),b):new Um(this.J,this.type,this.O,this.I,this.H,this.A,qe(md.b(this.m,b)),null)};
h.Ha=function(a,b,c){return t(Q.b?Q.b(Ql,b):Q.call(null,Ql,b))?new Um(c,this.type,this.O,this.I,this.H,this.A,this.m,null):t(Q.b?Q.b(kj,b):Q.call(null,kj,b))?new Um(this.J,c,this.O,this.I,this.H,this.A,this.m,null):t(Q.b?Q.b(Il,b):Q.call(null,Il,b))?new Um(this.J,this.type,c,this.I,this.H,this.A,this.m,null):t(Q.b?Q.b(am,b):Q.call(null,am,b))?new Um(this.J,this.type,this.O,c,this.H,this.A,this.m,null):t(Q.b?Q.b(Xi,b):Q.call(null,Xi,b))?new Um(this.J,this.type,this.O,this.I,c,this.A,this.m,null):new Um(this.J,
this.type,this.O,this.I,this.H,this.A,kd.c(this.m,b,c),null)};h.V=function(){return r(ne.b(new T(null,5,5,U,[new T(null,2,5,U,[Ql,this.J],null),new T(null,2,5,U,[kj,this.type],null),new T(null,2,5,U,[Il,this.O],null),new T(null,2,5,U,[am,this.I],null),new T(null,2,5,U,[Xi,this.H],null)],null),this.m))};h.N=function(a,b){return new Um(this.J,this.type,this.O,this.I,this.H,b,this.m,this.s)};h.W=function(a,b){return vd(b)?kb(this,bb.b(b,0),bb.b(b,1)):Ta.c(Za,this,b)};
function Vm(a,b,c,d){return new Um(Zl,a,b,c,d,null,null,null)}function Wm(a,b,c,d,e,f,g){this.J=a;this.O=b;this.I=c;this.H=d;this.A=e;this.m=f;this.s=g;this.o=2229667594;this.F=8192}h=Wm.prototype;h.S=function(a,b){return ib.c(this,b,null)};h.K=function(a,b,c){switch(b instanceof y?b.Y:null){case "type-tag":return this.J;case "logical-block":return this.O;case "start-pos":return this.I;case "end-pos":return this.H;default:return vc.c(this.m,b,c)}};
h.M=function(a,b,c){return kf(b,function(){return function(a){return kf(b,lf,""," ","",c,a)}}(this),"#cljs.pprint.start-block-t{",", ","}",c,ne.b(new T(null,4,5,U,[new T(null,2,5,U,[Ql,this.J],null),new T(null,2,5,U,[Il,this.O],null),new T(null,2,5,U,[am,this.I],null),new T(null,2,5,U,[Xi,this.H],null)],null),this.m))};h.za=function(){return new zf(0,this,4,new T(null,4,5,U,[Ql,Il,am,Xi],null),dc(this.m))};h.L=function(){return this.A};h.X=function(){return 4+N(this.m)};
h.R=function(){var a=this.s;return null!=a?a:this.s=a=Wd(this)};h.D=function(a,b){var c;c=t(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return t(c)?!0:!1};h.Ta=function(a,b){return Ed(new og(null,new q(null,4,[Xi,null,Il,null,Ql,null,am,null],null),null),b)?md.b(Oc(We(V,this),this.A),b):new Wm(this.J,this.O,this.I,this.H,this.A,qe(md.b(this.m,b)),null)};
h.Ha=function(a,b,c){return t(Q.b?Q.b(Ql,b):Q.call(null,Ql,b))?new Wm(c,this.O,this.I,this.H,this.A,this.m,null):t(Q.b?Q.b(Il,b):Q.call(null,Il,b))?new Wm(this.J,c,this.I,this.H,this.A,this.m,null):t(Q.b?Q.b(am,b):Q.call(null,am,b))?new Wm(this.J,this.O,c,this.H,this.A,this.m,null):t(Q.b?Q.b(Xi,b):Q.call(null,Xi,b))?new Wm(this.J,this.O,this.I,c,this.A,this.m,null):new Wm(this.J,this.O,this.I,this.H,this.A,kd.c(this.m,b,c),null)};
h.V=function(){return r(ne.b(new T(null,4,5,U,[new T(null,2,5,U,[Ql,this.J],null),new T(null,2,5,U,[Il,this.O],null),new T(null,2,5,U,[am,this.I],null),new T(null,2,5,U,[Xi,this.H],null)],null),this.m))};h.N=function(a,b){return new Wm(this.J,this.O,this.I,this.H,b,this.m,this.s)};h.W=function(a,b){return vd(b)?kb(this,bb.b(b,0),bb.b(b,1)):Ta.c(Za,this,b)};function Xm(a,b,c,d,e,f,g){this.J=a;this.O=b;this.I=c;this.H=d;this.A=e;this.m=f;this.s=g;this.o=2229667594;this.F=8192}h=Xm.prototype;
h.S=function(a,b){return ib.c(this,b,null)};h.K=function(a,b,c){switch(b instanceof y?b.Y:null){case "type-tag":return this.J;case "logical-block":return this.O;case "start-pos":return this.I;case "end-pos":return this.H;default:return vc.c(this.m,b,c)}};
h.M=function(a,b,c){return kf(b,function(){return function(a){return kf(b,lf,""," ","",c,a)}}(this),"#cljs.pprint.end-block-t{",", ","}",c,ne.b(new T(null,4,5,U,[new T(null,2,5,U,[Ql,this.J],null),new T(null,2,5,U,[Il,this.O],null),new T(null,2,5,U,[am,this.I],null),new T(null,2,5,U,[Xi,this.H],null)],null),this.m))};h.za=function(){return new zf(0,this,4,new T(null,4,5,U,[Ql,Il,am,Xi],null),dc(this.m))};h.L=function(){return this.A};h.X=function(){return 4+N(this.m)};
h.R=function(){var a=this.s;return null!=a?a:this.s=a=Wd(this)};h.D=function(a,b){var c;c=t(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return t(c)?!0:!1};h.Ta=function(a,b){return Ed(new og(null,new q(null,4,[Xi,null,Il,null,Ql,null,am,null],null),null),b)?md.b(Oc(We(V,this),this.A),b):new Xm(this.J,this.O,this.I,this.H,this.A,qe(md.b(this.m,b)),null)};
h.Ha=function(a,b,c){return t(Q.b?Q.b(Ql,b):Q.call(null,Ql,b))?new Xm(c,this.O,this.I,this.H,this.A,this.m,null):t(Q.b?Q.b(Il,b):Q.call(null,Il,b))?new Xm(this.J,c,this.I,this.H,this.A,this.m,null):t(Q.b?Q.b(am,b):Q.call(null,am,b))?new Xm(this.J,this.O,c,this.H,this.A,this.m,null):t(Q.b?Q.b(Xi,b):Q.call(null,Xi,b))?new Xm(this.J,this.O,this.I,c,this.A,this.m,null):new Xm(this.J,this.O,this.I,this.H,this.A,kd.c(this.m,b,c),null)};
h.V=function(){return r(ne.b(new T(null,4,5,U,[new T(null,2,5,U,[Ql,this.J],null),new T(null,2,5,U,[Il,this.O],null),new T(null,2,5,U,[am,this.I],null),new T(null,2,5,U,[Xi,this.H],null)],null),this.m))};h.N=function(a,b){return new Xm(this.J,this.O,this.I,this.H,b,this.m,this.s)};h.W=function(a,b){return vd(b)?kb(this,bb.b(b,0),bb.b(b,1)):Ta.c(Za,this,b)};
function Ym(a,b,c,d,e,f,g,k,m){this.J=a;this.O=b;this.$a=c;this.offset=d;this.I=e;this.H=f;this.A=g;this.m=k;this.s=m;this.o=2229667594;this.F=8192}h=Ym.prototype;h.S=function(a,b){return ib.c(this,b,null)};h.K=function(a,b,c){switch(b instanceof y?b.Y:null){case "type-tag":return this.J;case "logical-block":return this.O;case "relative-to":return this.$a;case "offset":return this.offset;case "start-pos":return this.I;case "end-pos":return this.H;default:return vc.c(this.m,b,c)}};
h.M=function(a,b,c){return kf(b,function(){return function(a){return kf(b,lf,""," ","",c,a)}}(this),"#cljs.pprint.indent-t{",", ","}",c,ne.b(new T(null,6,5,U,[new T(null,2,5,U,[Ql,this.J],null),new T(null,2,5,U,[Il,this.O],null),new T(null,2,5,U,[tj,this.$a],null),new T(null,2,5,U,[ri,this.offset],null),new T(null,2,5,U,[am,this.I],null),new T(null,2,5,U,[Xi,this.H],null)],null),this.m))};h.za=function(){return new zf(0,this,6,new T(null,6,5,U,[Ql,Il,tj,ri,am,Xi],null),dc(this.m))};h.L=function(){return this.A};
h.X=function(){return 6+N(this.m)};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Wd(this)};h.D=function(a,b){var c;c=t(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return t(c)?!0:!1};h.Ta=function(a,b){return Ed(new og(null,new q(null,6,[ri,null,Xi,null,tj,null,Il,null,Ql,null,am,null],null),null),b)?md.b(Oc(We(V,this),this.A),b):new Ym(this.J,this.O,this.$a,this.offset,this.I,this.H,this.A,qe(md.b(this.m,b)),null)};
h.Ha=function(a,b,c){return t(Q.b?Q.b(Ql,b):Q.call(null,Ql,b))?new Ym(c,this.O,this.$a,this.offset,this.I,this.H,this.A,this.m,null):t(Q.b?Q.b(Il,b):Q.call(null,Il,b))?new Ym(this.J,c,this.$a,this.offset,this.I,this.H,this.A,this.m,null):t(Q.b?Q.b(tj,b):Q.call(null,tj,b))?new Ym(this.J,this.O,c,this.offset,this.I,this.H,this.A,this.m,null):t(Q.b?Q.b(ri,b):Q.call(null,ri,b))?new Ym(this.J,this.O,this.$a,c,this.I,this.H,this.A,this.m,null):t(Q.b?Q.b(am,b):Q.call(null,am,b))?new Ym(this.J,this.O,this.$a,
this.offset,c,this.H,this.A,this.m,null):t(Q.b?Q.b(Xi,b):Q.call(null,Xi,b))?new Ym(this.J,this.O,this.$a,this.offset,this.I,c,this.A,this.m,null):new Ym(this.J,this.O,this.$a,this.offset,this.I,this.H,this.A,kd.c(this.m,b,c),null)};
h.V=function(){return r(ne.b(new T(null,6,5,U,[new T(null,2,5,U,[Ql,this.J],null),new T(null,2,5,U,[Il,this.O],null),new T(null,2,5,U,[tj,this.$a],null),new T(null,2,5,U,[ri,this.offset],null),new T(null,2,5,U,[am,this.I],null),new T(null,2,5,U,[Xi,this.H],null)],null),this.m))};h.N=function(a,b){return new Ym(this.J,this.O,this.$a,this.offset,this.I,this.H,b,this.m,this.s)};h.W=function(a,b){return vd(b)?kb(this,bb.b(b,0),bb.b(b,1)):Ta.c(Za,this,b)};Zm;
if("undefined"===typeof $m)var $m=function(){var a=W.a?W.a(V):W.call(null,V),b=W.a?W.a(V):W.call(null,V),c=W.a?W.a(V):W.call(null,V),d=W.a?W.a(V):W.call(null,V),e=vc.c(V,zl,bh());return new nh(wc.b("cljs.pprint","write-token"),function(){return function(a,b){return Ql.a(b)}}(a,b,c,d,e),yi,e,a,b,c,d)}();
$m.Va(0,cm,function(a,b){var c=ul.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}());t(c)&&(c.a?c.a(cj):c.call(null,cj));var c=Il.a(b),d=Kj.a(c);t(d)&&B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),d);var d=Km(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}())),e=Dj.a(c);De.b?De.b(e,d):De.call(null,e,d);c=Lh.a(c);return De.b?De.b(c,d):De.call(null,c,d)});
$m.Va(0,em,function(a,b){var c=ul.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}());t(c)&&(c.a?c.a(tl):c.call(null,tl));c=Ch.a(Il.a(b));return t(c)?B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),c):null});
$m.Va(0,cl,function(a,b){var c=Il.a(b),d=Lh.a(c),e=ri.a(b)+function(){var d=tj.a(b);if(t(G.b?G.b(Ih,d):G.call(null,Ih,d)))return d=Dj.a(c),M.a?M.a(d):M.call(null,d);if(t(G.b?G.b(Ck,d):G.call(null,Ck,d)))return Km(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()));throw Error([z("No matching clause: "),z(d)].join(""));}();return De.b?De.b(d,e):De.call(null,d,e)});
$m.Va(0,ik,function(a,b){return B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),jm.a(b))});
$m.Va(0,Zl,function(a,b){if(t(function(){var a=G.b(kj.a(b),qh);return a?a:(a=!G.b(kj.a(b),Mi))?(a=oj.a(Il.a(b)),M.a?M.a(a):M.call(null,a)):a}()))Zm.b?Zm.b(a,b):Zm.call(null,a,b);else{var c=wk.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}());t(c)&&B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),c)}return Ge.u(M.a?M.a(a):M.call(null,a),kd,wk,null)});
function an(a,b,c){b=r(b);for(var d=null,e=0,f=0;;)if(f<e){var g=d.aa(null,f);if(!G.b(Ql.a(g),Zl)){var k=wk.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}());t(k)&&B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),k)}$m.b?$m.b(a,g):$m.call(null,a,g);Ge.u(M.a?M.a(a):M.call(null,a),kd,wk,wk.a(g));g=wk.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}());t(t(c)?g:c)&&(B(vl.a(function(){var b=M.a?M.a(a):
M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),g),Ge.u(M.a?M.a(a):M.call(null,a),kd,wk,null));f+=1}else if(b=r(b))yd(b)?(d=Xb(b),b=Yb(b),g=d,e=N(d),d=g):(g=K(b),G.b(Ql.a(g),Zl)||(d=wk.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),t(d)&&B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),d)),$m.b?$m.b(a,g):$m.call(null,a,g),Ge.u(M.a?M.a(a):M.call(null,a),kd,wk,wk.a(g)),g=wk.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?
M.a(b):M.call(null,b)}()),t(t(c)?g:c)&&(B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),g),Ge.u(M.a?M.a(a):M.call(null,a),kd,wk,null)),b=L(b),d=null,e=0),f=0;else break}function bn(a,b){var c=Lm(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()));return null==c||Km(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()))+Rm(b)<c}
function cn(a,b,c){b=oj.a(b);b=M.a?M.a(b):M.call(null,b);return t(b)?b:La(bn(a,c))}function dn(a,b,c){var d=Om.a?Om.a(a):Om.call(null,a),e=Lm(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()));return t(d)?t(e)?(d=function(){var a=Dj.a(b);return M.a?M.a(a):M.call(null,a)}()>=e-d)?cn(a,b,c):d:e:d}
if("undefined"===typeof en)var en=function(){var a=W.a?W.a(V):W.call(null,V),b=W.a?W.a(V):W.call(null,V),c=W.a?W.a(V):W.call(null,V),d=W.a?W.a(V):W.call(null,V),e=vc.c(V,zl,bh());return new nh(wc.b("cljs.pprint","emit-nl?"),function(){return function(a){return kj.a(a)}}(a,b,c,d,e),yi,e,a,b,c,d)}();en.Va(0,gl,function(a,b,c){a=Il.a(a);return cn(b,a,c)});en.Va(0,ji,function(a,b,c){a=Il.a(a);return dn(b,a,c)});
en.Va(0,Mi,function(a,b,c,d){a=Il.a(a);var e;e=Bl.a(a);e=M.a?M.a(e):M.call(null,e);return t(e)?e:(d=La(bn(b,d)))?d:dn(b,a,c)});en.Va(0,qh,function(){return!0});function fn(a){var b=K(a),c=Il.a(b),b=r(tg(function(a,b){return function(a){var c=G.b(Ql.a(a),Zl);a=t(c)?Qm(Il.a(a),b):c;return La(a)}}(b,c),L(a)));return new T(null,2,5,U,[b,r(Le(N(b)+1,a))],null)}
function gn(a){var b=K(a),c=Il.a(b);return r(tg(function(a,b){return function(a){var c=Il.a(a);a=G.b(Ql.a(a),Zl);c=t(a)?(a=G.b(c,b))?a:Qm(c,b):a;return La(c)}}(b,c),L(a)))}function hn(a){var b=Bl.a(a);De.b?De.b(b,!0):De.call(null,b,!0);b=oj.a(a);De.b?De.b(b,!0):De.call(null,b,!0);for(a=di.a(a);;)if(t(a))b=oj.a(a),De.b?De.b(b,!0):De.call(null,b,!0),b=Bl.a(a),De.b?De.b(b,!0):De.call(null,b,!0),a=di.a(a);else return null}
function Zm(a,b){B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),"\n");Ge.u(M.a?M.a(a):M.call(null,a),kd,wk,null);var c=Il.a(b),d=Gk.a(c);t(d)&&B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),d);d=A.b(z,Pe(function(){var a=Lh.a(c);return M.a?M.a(a):M.call(null,a)}()-N(d)," "));B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),d);return hn(c)}
function jn(a){var b=r(tg(function(a){return La(G.b(Ql.a(a),Zl))},a));return new T(null,2,5,U,[b,r(Le(N(b),a))],null)}var kn=function kn(b,c){var d=jn(c),e=P(d,0),f=P(d,1);t(e)&&an(b,e,!1);if(t(f)){var d=fn(f),g=P(d,0),k=P(d,1),m=K(f),d=function(){var c=gn(f);return en.u?en.u(m,b,g,c):en.call(null,m,b,g,c)}();t(d)?(Zm(b,m),d=L(f)):d=f;return La(bn(b,d))?function(){var c=kn(b,g);return G.b(c,g)?(an(b,g,!1),k):We(gd,ne.b(c,k))}():d}return null};
function ln(a){for(var b=$l.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}());;)if(Ge.u(M.a?M.a(a):M.call(null,a),kd,$l,We(gd,b)),La(bn(a,b))){var c=kn(a,b);if(b!==c)b=c;else return null}else return null}function mn(a,b){Ge.u(M.a?M.a(a):M.call(null,a),kd,$l,fd.b($l.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),b));return La(bn(a,$l.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}())))?ln(a):null}
function nn(a){ln(a);var b=$l.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}());t(b)&&(an(a,b,!0),Ge.u(M.a?M.a(a):M.call(null,a),kd,$l,gd))}function on(a){var b=wk.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}());return t(b)?(B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),b),Ge.u(M.a?M.a(a):M.call(null,a),kd,wk,null)):null}
function pn(a,b){var c=sm(b);if(G.b(N(c),1))return b;var d=Gk.a(K(uh.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()))),e=K(c);if(G.b(lk,bj.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()))){var f=hj.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),g=f+N(e);Ge.u(M.a?M.a(a):M.call(null,a),kd,hj,g);mn(a,Tm(e,null,f,g));nn(a)}else on(a),B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):
M.call(null,b)}()),e);B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),"\n");for(var e=r(L(rg(c))),f=null,k=g=0;;)if(k<g){var m=f.aa(null,k);B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),m);B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),"\n");t(d)&&B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),d);k+=1}else if(e=r(e))f=e,yd(f)?(e=Xb(f),k=Yb(f),
f=e,g=N(e),e=k):(e=K(f),B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),e),B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),"\n"),t(d)&&B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),d),e=L(f),f=null,g=0),k=0;else break;Ge.u(M.a?M.a(a):M.call(null,a),kd,lk,ij);return ed(c)}
function qn(a,b){if(G.b(bj.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),ij))return on(a),B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),b);if(G.b(b,"\n"))return pn(a,"\n");var c=hj.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),d=c+1;Ge.u(M.a?M.a(a):M.call(null,a),kd,hj,d);return mn(a,Tm(Kd(b),null,c,d))}
var rn=function rn(b,c,d){var e=new Pm(null,null,W.a?W.a(0):W.call(null,0),W.a?W.a(0):W.call(null,0),W.a?W.a(!1):W.call(null,!1),W.a?W.a(!1):W.call(null,!1),null,null,null,null,null,null,null),f=function(){var f=ld([uh,Ph,Xh,ci,fi,bj,hj,wk,vl,Al,$l],[e,d,e,!0,null,ij,0,null,Nm(b,c),1,gd]);return W.a?W.a(f):W.call(null,f)}();"undefined"===typeof um&&(um=function(b,c,d,e,f,v,w){this.yd=b;this.ba=c;this.qc=d;this.vd=e;this.nd=f;this.Cb=v;this.qd=w;this.o=1074167808;this.F=0},um.prototype.N=function(){return function(b,
c){return new um(this.yd,this.ba,this.qc,this.vd,this.nd,this.Cb,c)}}(e,f),um.prototype.L=function(){return function(){return this.qd}}(e,f),um.prototype.xb=function(){return function(){return this.Cb}}(e,f),um.prototype.qb=function(){return function(b,c){var d=this,e=Oa(c);if(t(G.b?G.b(String,e):G.call(null,String,e))){var f=pn(d,c),e=f.replace(/\s+$/,""),v=Rd(f,N(e)),w=bj.a(function(){var b=M.a?M.a(d):M.call(null,d);return M.a?M.a(b):M.call(null,b)}());if(G.b(w,ij))return on(d),B(vl.a(function(){var b=
M.a?M.a(d):M.call(null,d);return M.a?M.a(b):M.call(null,b)}()),e),Ge.u(M.a?M.a(d):M.call(null,d),kd,wk,v);w=hj.a(function(){var b=M.a?M.a(d):M.call(null,d);return M.a?M.a(b):M.call(null,b)}());f=w+N(f);Ge.u(M.a?M.a(d):M.call(null,d),kd,hj,f);return mn(d,Tm(e,v,w,f))}if(t(G.b?G.b(Number,e):G.call(null,Number,e)))return qn(d,c);throw Error([z("No matching clause: "),z(e)].join(""));}}(e,f),um.prototype.bb=function(){return function(){var b=this;Hm(b);return Kb(vl.a(function(){var c=M.a?M.a(b):M.call(null,
b);return M.a?M.a(c):M.call(null,c)}()))}}(e,f),um.prototype.yc=function(){return function(){var b=this;return G.b(bj.a(function(){var c=M.a?M.a(b):M.call(null,b);return M.a?M.a(c):M.call(null,c)}()),lk)?(an(b,$l.a(function(){var c=M.a?M.a(b):M.call(null,b);return M.a?M.a(c):M.call(null,c)}()),!0),Ge.u(M.a?M.a(b):M.call(null,b),kd,$l,gd)):on(b)}}(e,f),um.Ob=function(){return function(){return new T(null,7,5,U,[Oc(lj,new q(null,2,[hi,!0,te,mc(ue,mc(new T(null,3,5,U,[Fl,Zh,Ti],null)))],null)),Fl,Zh,
Ti,sl,Vj,aj],null)}}(e,f),um.rb=!0,um.cb="cljs.pprint/t_cljs$pprint12462",um.Ab=function(){return function(b,c){return B(c,"cljs.pprint/t_cljs$pprint12462")}}(e,f));return new um(rn,b,c,d,e,f,V)};
function sn(a,b){var c=n,d=new Pm(uh.a(function(){var a=M.a?M.a(c):M.call(null,c);return M.a?M.a(a):M.call(null,a)}()),null,W.a?W.a(0):W.call(null,0),W.a?W.a(0):W.call(null,0),W.a?W.a(!1):W.call(null,!1),W.a?W.a(!1):W.call(null,!1),a,null,b,null,null,null,null);Ge.u(M.a?M.a(c):M.call(null,c),kd,uh,d);if(G.b(bj.a(function(){var a=M.a?M.a(c):M.call(null,c);return M.a?M.a(a):M.call(null,a)}()),ij)){on(c);var e=ul.a(function(){var a=M.a?M.a(c):M.call(null,c);return M.a?M.a(a):M.call(null,a)}());t(e)&&
(e.a?e.a(cj):e.call(null,cj));t(a)&&B(vl.a(function(){var a=M.a?M.a(c):M.call(null,c);return M.a?M.a(a):M.call(null,a)}()),a);var e=Km(vl.a(function(){var a=M.a?M.a(c):M.call(null,c);return M.a?M.a(a):M.call(null,a)}())),f=Dj.a(d);De.b?De.b(f,e):De.call(null,f,e);d=Lh.a(d);De.b?De.b(d,e):De.call(null,d,e)}else e=hj.a(function(){var a=M.a?M.a(c):M.call(null,c);return M.a?M.a(a):M.call(null,a)}()),f=e+(t(a)?N(a):0),Ge.u(M.a?M.a(c):M.call(null,c),kd,hj,f),mn(c,new Wm(cm,d,e,f,null,null,null))}
function tn(){var a=n,b=uh.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),c=Ch.a(b);if(G.b(bj.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),ij)){on(a);t(c)&&B(vl.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()),c);var d=ul.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}());t(d)&&(d.a?d.a(tl):d.call(null,tl))}else d=hj.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?
M.a(b):M.call(null,b)}()),c=d+(t(c)?N(c):0),Ge.u(M.a?M.a(a):M.call(null,a),kd,hj,c),mn(a,new Xm(em,b,d,c,null,null,null));Ge.u(M.a?M.a(a):M.call(null,a),kd,uh,di.a(b))}function un(a){var b=n;Ge.u(M.a?M.a(b):M.call(null,b),kd,bj,lk);var c=hj.a(function(){var a=M.a?M.a(b):M.call(null,b);return M.a?M.a(a):M.call(null,a)}());mn(b,Vm(a,uh.a(function(){var a=M.a?M.a(b):M.call(null,b);return M.a?M.a(a):M.call(null,a)}()),c,c))}
function vn(a,b){var c=n,d=uh.a(function(){var a=M.a?M.a(c):M.call(null,c);return M.a?M.a(a):M.call(null,a)}());if(G.b(bj.a(function(){var a=M.a?M.a(c):M.call(null,c);return M.a?M.a(a):M.call(null,a)}()),ij)){on(c);var e=Lh.a(d),f=b+function(){if(t(G.b?G.b(Ih,a):G.call(null,Ih,a))){var b=Dj.a(d);return M.a?M.a(b):M.call(null,b)}if(t(G.b?G.b(Ck,a):G.call(null,Ck,a)))return Km(vl.a(function(){var a=M.a?M.a(c):M.call(null,c);return M.a?M.a(a):M.call(null,a)}()));throw Error([z("No matching clause: "),
z(a)].join(""));}();De.b?De.b(e,f):De.call(null,e,f)}else e=hj.a(function(){var a=M.a?M.a(c):M.call(null,c);return M.a?M.a(a):M.call(null,a)}()),mn(c,new Ym(cl,d,a,b,e,e,null,null,null))}function Om(a){return Ph.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}())}var wn=!0;if("undefined"===typeof xn)var xn=null;var yn=72,zn=40,An=null,Bn=null,Cn=null,Dn=null,En=10,X=0,Fn=null;Gn;
ld([Ph,ni,Yi,dj,qj,Ej,Pj,Ba,Uj,Lk,rl,vl],[new xc(function(){return zn},Ri,ld([zi,Di,Gi,Vi,$i,Lj,Yg,mk,Pk,te,Gl,Vl],["1.2",Zj,tk,"resources\\public\\js\\out\\cljs\\pprint.cljs",21,1,!0,632,637,Bc,"The column at which to enter miser style. Depending on the dispatch table,\nmiser style add newlines in more places to try to keep lines short allowing for further\nlevels of nesting.",t(zn)?zn.Wa:null])),new xc(function(){return yn},Xj,ld([zi,Di,Gi,Vi,$i,Lj,Yg,mk,Pk,te,Gl,Vl],["1.2",Zj,ll,"resources\\public\\js\\out\\cljs\\pprint.cljs",
22,1,!0,625,630,Bc,"Pretty printing will try to avoid anything going beyond this column.\nSet it to nil to have pprint let the line be arbitrarily long. This will ignore all\nnon-mandatory newlines.",t(yn)?yn.Wa:null])),new xc(function(){return Bn},fl,ld([hi,Di,Gi,Vi,$i,Lj,Yg,mk,Pk,te,Gl,Vl],[!0,Zj,Gh,"resources\\public\\js\\out\\cljs\\pprint.cljs",15,1,!0,646,649,Bc,"Mark circular structures (N.B. This is not yet used)",t(Bn)?Bn.Wa:null])),new xc(function(){return An},Ml,ld([hi,Di,Gi,Vi,$i,Lj,Yg,
mk,Pk,te,Gl,Vl],[!0,Zj,kk,"resources\\public\\js\\out\\cljs\\pprint.cljs",14,1,!0,640,643,Bc,"Maximum number of lines to print in a pretty print instance (N.B. This is not yet used)",t(An)?An.Wa:null])),new xc(function(){return Cn},jj,ld([zi,Di,Gi,Vi,$i,Lj,Yg,mk,Pk,te,Gl,Vl],["1.2",Zj,Oh,"resources\\public\\js\\out\\cljs\\pprint.cljs",28,1,!0,657,661,Bc,"Don't print namespaces with symbols. This is particularly useful when\npretty printing the results of macro expansions",t(Cn)?Cn.Wa:null])),new xc(function(){return Dn},
Hi,ld([zi,Di,Gi,Vi,$i,Lj,Yg,mk,Pk,te,Gl,Vl],["1.2",Zj,Qj,"resources\\public\\js\\out\\cljs\\pprint.cljs",14,1,!0,665,670,Bc,"Print a radix specifier in front of integers and rationals. If *print-base* is 2, 8,\nor 16, then the radix specifier used is #b, #o, or #x, respectively. Otherwise the\nradix specifier is in the form #XXr where XX is the decimal value of *print-base* ",t(Dn)?Dn.Wa:null])),new xc(function(){return ua},Fh,ld([Di,Gi,Vi,$i,Lj,Yg,mk,Pk,te,Gl,Ll,Vl],[Si,ti,"cljs/core.cljs",16,1,
!0,114,125,Bc,"*print-level* controls how many levels deep the printer will\n  print nested objects. If it is bound to logical false, there is no\n  limit. Otherwise, it must be bound to an integer indicating the maximum\n  level to print. Each argument to print is at level 0; if an argument is a\n  collection, its items are at level 1; and so on. If an object is a\n  collection and is at a level greater than or equal to the value bound to\n  *print-level*, the printer prints '#' to represent it. The root binding\n  is nil indicating no limit.",
new T(null,1,5,U,["@type {null|number}"],null),t(ua)?ua.Wa:null])),new xc(function(){return ra},Kk,ld([Di,Gi,Vi,$i,Lj,Yg,mk,Pk,te,Gl,Vl],[Si,xl,"cljs/core.cljs",19,1,!0,81,87,Bc,"When set to logical false, strings and characters will be printed with\n  non-alphanumeric characters converted to the appropriate escape sequences.\n\n  Defaults to true",t(ra)?ra.Wa:null])),new xc(function(){return xn},Nh,ld([zi,Di,Gi,Vi,$i,Lj,Yg,mk,Pk,te,Gl,Vl],["1.2",Zj,Wh,"resources\\public\\js\\out\\cljs\\pprint.cljs",
25,1,!0,619,623,Bc,"The pretty print dispatch function. Use with-pprint-dispatch or\nset-pprint-dispatch to modify.",t(xn)?xn.Wa:null])),new xc(function(){return ta},Yj,ld([Di,Gi,Vi,$i,Lj,Yg,mk,Pk,te,Gl,Ll,Vl],[Si,Qi,"cljs/core.cljs",17,1,!0,105,112,Bc,"When set to logical true, objects will be printed in a way that preserves\n  their type when read in later.\n\n  Defaults to false.",new T(null,1,5,U,["@type {null|number}"],null),t(ta)?ta.Wa:null])),new xc(function(){return wn},Mh,ld([Di,Gi,Vi,$i,
Lj,Yg,mk,Pk,te,Gl,Vl],[Zj,Uh,"resources\\public\\js\\out\\cljs\\pprint.cljs",16,1,!0,615,617,Bc,"Bind to true if you want write to use pretty printing",t(wn)?wn.Wa:null])),new xc(function(){return En},oi,ld([zi,Di,Gi,Vi,$i,Lj,Yg,mk,Pk,te,Gl,Vl],["1.2",Zj,hm,"resources\\public\\js\\out\\cljs\\pprint.cljs",13,1,!0,672,675,Bc,"The base to use for printing integers and rationals.",t(En)?En.Wa:null]))]);
function Hn(a){var b=null!=a?a.o&32768||a.uc?!0:a.o?!1:Ma(ub,a):Ma(ub,a);return b?ci.a(function(){var b=M.a?M.a(a):M.call(null,a);return M.a?M.a(b):M.call(null,b)}()):b}function In(a){var b;b=Fn;t(b)&&(b=ta,b=t(b)?Fn>=ta:b);La(wn)?Am.a?Am.a(a):Am.call(null,a):t(b)?B(n,"..."):(t(Fn)&&(Fn+=1),xn.a?xn.a(a):xn.call(null,a));return b}var Jn=function Jn(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;c=1<c.length?new Ia(c.slice(1),0):null;return Jn.i(arguments[0],c)};
Jn.i=function(a,b){var c=kg(I([new q(null,1,[Oj,!0],null),A.b(Lc,b)],0)),d=En,e=Bn,f=ta,g=ua,k=An,m=zn,p=xn,u=wn,v=Dn,w=ra,x=yn,C=Cn;En=vl.b(c,En);Bn=Yi.b(c,Bn);ta=Lk.b(c,ta);ua=Pj.b(c,ua);An=dj.b(c,An);zn=Ph.b(c,zn);xn=Uj.b(c,xn);wn=rl.b(c,wn);Dn=Ej.b(c,Dn);ra=Ba.b(c,ra);yn=ni.b(c,yn);Cn=qj.b(c,Cn);try{var E=new ka,D=Ed(c,Oj)?Oj.a(c):!0,H=!0===D||null==D?new fc(E):D;if(t(wn)){var R=La(Hn(H)),c=n;n=R?rn(H,yn,zn):H;try{In(a),Hm(n)}finally{n=c}}else{R=n;n=H;try{Am.a?Am.a(a):Am.call(null,a)}finally{n=
R}}!0===D&&(na.a?na.a(""+z(E)):na.call(null,""+z(E)));return null==D?""+z(E):null}finally{Cn=C,yn=x,ra=w,Dn=v,wn=u,xn=p,zn=m,An=k,ua=g,ta=f,Bn=e,En=d}};Jn.C=1;Jn.G=function(a){var b=K(a);a=L(a);return Jn.i(b,a)};function Kn(a){var b=new ka,c=n;n=new fc(b);try{var d=n,e=La(Hn(d)),f=n;n=e?rn(d,yn,zn):d;try{d=wn;wn=!0;try{In(a)}finally{wn=d}G.b(0,Km(n))||B(n,"\n");Hm(n)}finally{n=f}na.a?na.a(""+z(b)):na.call(null,""+z(b))}finally{n=c}}
function Ln(a,b){if(La(b.a?b.a(a):b.call(null,a)))throw Error([z("Bad argument: "),z(a),z(". It must be one of "),z(b)].join(""));}function Mn(){var a=ua;return t(a)?X>=ua:a}function Nn(a){Ln(a,new og(null,new q(null,4,[qh,null,ji,null,Mi,null,gl,null],null),null));un(a)}function On(a,b){Ln(a,new og(null,new q(null,2,[Ih,null,Ck,null],null),null));vn(a,b)}Pn;Qn;Rn;
function Sn(a,b,c){b="string"===typeof b?Pn.a?Pn.a(b):Pn.call(null,b):b;c=Rn.a?Rn.a(c):Rn.call(null,c);return Qn.c?Qn.c(a,b,c):Qn.call(null,a,b,c)}var Tn=null;function Un(a,b){var c=[z(a),z("\n"),z(Tn),z("\n"),z(A.b(z,Pe(b," "))),z("^"),z("\n")].join("");throw Error(c);}function Vn(a,b,c,d,e,f){this.vb=a;this.da=b;this.ub=c;this.A=d;this.m=e;this.s=f;this.o=2229667594;this.F=8192}h=Vn.prototype;h.S=function(a,b){return ib.c(this,b,null)};
h.K=function(a,b,c){switch(b instanceof y?b.Y:null){case "seq":return this.vb;case "rest":return this.da;case "pos":return this.ub;default:return vc.c(this.m,b,c)}};h.M=function(a,b,c){return kf(b,function(){return function(a){return kf(b,lf,""," ","",c,a)}}(this),"#cljs.pprint.arg-navigator{",", ","}",c,ne.b(new T(null,3,5,U,[new T(null,2,5,U,[hl,this.vb],null),new T(null,2,5,U,[Wl,this.da],null),new T(null,2,5,U,[hj,this.ub],null)],null),this.m))};
h.za=function(){return new zf(0,this,3,new T(null,3,5,U,[hl,Wl,hj],null),dc(this.m))};h.L=function(){return this.A};h.X=function(){return 3+N(this.m)};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Wd(this)};h.D=function(a,b){var c;c=t(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return t(c)?!0:!1};h.Ta=function(a,b){return Ed(new og(null,new q(null,3,[hj,null,hl,null,Wl,null],null),null),b)?md.b(Oc(We(V,this),this.A),b):new Vn(this.vb,this.da,this.ub,this.A,qe(md.b(this.m,b)),null)};
h.Ha=function(a,b,c){return t(Q.b?Q.b(hl,b):Q.call(null,hl,b))?new Vn(c,this.da,this.ub,this.A,this.m,null):t(Q.b?Q.b(Wl,b):Q.call(null,Wl,b))?new Vn(this.vb,c,this.ub,this.A,this.m,null):t(Q.b?Q.b(hj,b):Q.call(null,hj,b))?new Vn(this.vb,this.da,c,this.A,this.m,null):new Vn(this.vb,this.da,this.ub,this.A,kd.c(this.m,b,c),null)};h.V=function(){return r(ne.b(new T(null,3,5,U,[new T(null,2,5,U,[hl,this.vb],null),new T(null,2,5,U,[Wl,this.da],null),new T(null,2,5,U,[hj,this.ub],null)],null),this.m))};
h.N=function(a,b){return new Vn(this.vb,this.da,this.ub,b,this.m,this.s)};h.W=function(a,b){return vd(b)?kb(this,bb.b(b,0),bb.b(b,1)):Ta.c(Za,this,b)};function Rn(a){a=r(a);return new Vn(a,a,0,null,null,null)}function Wn(a){var b=Wl.a(a);if(t(b))return new T(null,2,5,U,[K(b),new Vn(hl.a(a),L(b),hj.a(a)+1,null,null,null)],null);throw Error("Not enough arguments for format definition");}
function Xn(a){var b=Wn(a);a=P(b,0);b=P(b,1);a="string"===typeof a?Pn.a?Pn.a(a):Pn.call(null,a):a;return new T(null,2,5,U,[a,b],null)}Yn;function Zn(a,b){if(b>=hj.a(a)){var c=hj.a(a)-b;return Yn.b?Yn.b(a,c):Yn.call(null,a,c)}return new Vn(hl.a(a),Le(b,hl.a(a)),b,null,null,null)}function Yn(a,b){var c=hj.a(a)+b;return 0>b?Zn(a,c):new Vn(hl.a(a),Le(b,Wl.a(a)),c,null,null,null)}
function $n(a,b,c,d,e,f,g){this.lb=a;this.kb=b;this.mb=c;this.offset=d;this.A=e;this.m=f;this.s=g;this.o=2229667594;this.F=8192}h=$n.prototype;h.S=function(a,b){return ib.c(this,b,null)};h.K=function(a,b,c){switch(b instanceof y?b.Y:null){case "func":return this.lb;case "def":return this.kb;case "params":return this.mb;case "offset":return this.offset;default:return vc.c(this.m,b,c)}};
h.M=function(a,b,c){return kf(b,function(){return function(a){return kf(b,lf,""," ","",c,a)}}(this),"#cljs.pprint.compiled-directive{",", ","}",c,ne.b(new T(null,4,5,U,[new T(null,2,5,U,[Bi,this.lb],null),new T(null,2,5,U,[Zk,this.kb],null),new T(null,2,5,U,[ej,this.mb],null),new T(null,2,5,U,[ri,this.offset],null)],null),this.m))};h.za=function(){return new zf(0,this,4,new T(null,4,5,U,[Bi,Zk,ej,ri],null),dc(this.m))};h.L=function(){return this.A};h.X=function(){return 4+N(this.m)};
h.R=function(){var a=this.s;return null!=a?a:this.s=a=Wd(this)};h.D=function(a,b){var c;c=t(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return t(c)?!0:!1};h.Ta=function(a,b){return Ed(new og(null,new q(null,4,[ri,null,Bi,null,ej,null,Zk,null],null),null),b)?md.b(Oc(We(V,this),this.A),b):new $n(this.lb,this.kb,this.mb,this.offset,this.A,qe(md.b(this.m,b)),null)};
h.Ha=function(a,b,c){return t(Q.b?Q.b(Bi,b):Q.call(null,Bi,b))?new $n(c,this.kb,this.mb,this.offset,this.A,this.m,null):t(Q.b?Q.b(Zk,b):Q.call(null,Zk,b))?new $n(this.lb,c,this.mb,this.offset,this.A,this.m,null):t(Q.b?Q.b(ej,b):Q.call(null,ej,b))?new $n(this.lb,this.kb,c,this.offset,this.A,this.m,null):t(Q.b?Q.b(ri,b):Q.call(null,ri,b))?new $n(this.lb,this.kb,this.mb,c,this.A,this.m,null):new $n(this.lb,this.kb,this.mb,this.offset,this.A,kd.c(this.m,b,c),null)};
h.V=function(){return r(ne.b(new T(null,4,5,U,[new T(null,2,5,U,[Bi,this.lb],null),new T(null,2,5,U,[Zk,this.kb],null),new T(null,2,5,U,[ej,this.mb],null),new T(null,2,5,U,[ri,this.offset],null)],null),this.m))};h.N=function(a,b){return new $n(this.lb,this.kb,this.mb,this.offset,b,this.m,this.s)};h.W=function(a,b){return vd(b)?kb(this,bb.b(b,0),bb.b(b,1)):Ta.c(Za,this,b)};
function ao(a,b){var c=P(a,0),d=P(a,1),e=P(d,0),d=P(d,1),f=Ed(new og(null,new q(null,2,[Mj,null,Dk,null],null),null),c)?new T(null,2,5,U,[e,b],null):G.b(e,mj)?Wn(b):G.b(e,Li)?new T(null,2,5,U,[N(Wl.a(b)),b],null):new T(null,2,5,U,[e,b],null),e=P(f,0),f=P(f,1);return new T(null,2,5,U,[new T(null,2,5,U,[c,new T(null,2,5,U,[e,d],null)],null),f],null)}function bo(a,b){var c=Dm(ao,b,a),d=P(c,0),c=P(c,1);return new T(null,2,5,U,[We(V,d),c],null)}co;var eo=new q(null,3,[2,"#b",8,"#o",16,"#x"],null);
function Gn(a){return Dd(a)?G.b(En,10)?[z(a),z(t(Dn)?".":null)].join(""):[z(t(Dn)?function(){var a=vc.b(eo,En);return t(a)?a:[z("#"),z(En),z("r")].join("")}():null),z(co.b?co.b(En,a):co.call(null,En,a))].join(""):null}
function fo(a,b,c){c=Wn(c);var d=P(c,0);c=P(c,1);var e=Gn(d);a=t(e)?e:a.a?a.a(d):a.call(null,d);d=a.length;e=d+Bk.a(b);e=e>=zk.a(b)?e:e+(Nd(zk.a(b)-e-1,Sk.a(b))+1)*Sk.a(b);d=A.b(z,Pe(e-d,fk.a(b)));t(Dk.a(b))?zm.i(I([[z(d),z(a)].join("")],0)):zm.i(I([[z(a),z(d)].join("")],0));return c}function go(a,b){return $d(K(Em(function(b){return 0<b?new T(null,2,5,U,[Od(b,a),Nd(b,a)],null):new T(null,2,5,U,[null,null],null)},b)))}
function ho(a,b){return 0===b?"0":A.b(z,Sd.b(function(){return function(a){return 10>a?Kd(Cm("0")+a):Kd(Cm("a")+(a-10))}}(b),go(a,b)))}function co(a,b){return ho(a,b)}function io(a,b){return $d(K(Em(function(b){return new T(null,2,5,U,[r($d(Ie(a,b))),r(Le(a,b))],null)},$d(b))))}
function jo(a,b,c){var d=Wn(c),e=P(d,0),f=P(d,1);if(t(Dd(e)?!0:"number"!==typeof e||isNaN(e)||Infinity===e||parseFloat(e)===parseInt(e,10)?!1:G.b(e,Math.floor(e)))){var g=0>e,k=g?-e:e,m=ho(a,k);a=t(Mj.a(b))?function(){var a=Sd.b(function(){return function(a){return A.b(z,a)}}(g,k,m,d,e,f),io(bi.a(b),m)),c=Pe(N(a),km.a(b));return A.b(z,L(Se.b(c,a)))}():m;a=g?[z("-"),z(a)].join(""):t(Dk.a(b))?[z("+"),z(a)].join(""):a;a=a.length<zk.a(b)?[z(A.b(z,Pe(zk.a(b)-a.length,fk.a(b)))),z(a)].join(""):a;zm.i(I([a],
0))}else fo(Mg,new q(null,5,[zk,zk.a(b),Sk,1,Bk,0,fk,fk.a(b),Dk,!0],null),Rn(new T(null,1,5,U,[e],null)));return f}
var ko=new T(null,20,5,U,"zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" "),null),lo=new T(null,20,5,U,"zeroth first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth thirteenth fourteenth fifteenth sixteenth seventeenth eighteenth nineteenth".split(" "),null),mo=new T(null,10,5,U,"  twenty thirty forty fifty sixty seventy eighty ninety".split(" "),null),no=new T(null,10,5,U,"  twentieth thirtieth fortieth fiftieth sixtieth seventieth eightieth ninetieth".split(" "),
null),oo=new T(null,22,5,U," thousand million billion trillion quadrillion quintillion sextillion septillion octillion nonillion decillion undecillion duodecillion tredecillion quattuordecillion quindecillion sexdecillion septendecillion octodecillion novemdecillion vigintillion".split(" "),null);
function po(a){var b=Nd(a,100),c=Od(a,100);return[z(0<b?[z(id(ko,b)),z(" hundred")].join(""):null),z(0<b&&0<c?" ":null),z(0<c?20>c?id(ko,c):function(){var a=Nd(c,10),b=Od(c,10);return[z(0<a?id(mo,a):null),z(0<a&&0<b?"-":null),z(0<b?id(ko,b):null)].join("")}():null)].join("")}
function qo(a,b){for(var c=N(a),d=gd,c=c-1,e=K(a),f=L(a);;){if(null==f)return[z(A.b(z,Le(1,Se.b(Ne(", "),d)))),z(pd(e)||pd(d)?null:", "),z(e),z(!pd(e)&&0<c+b?[z(" "),z(id(oo,c+b))].join(""):null)].join("");d=pd(e)?d:fd.b(d,[z(e),z(" "),z(id(oo,c+b))].join(""));--c;e=K(f);f=L(f)}}
function ro(a){var b=Nd(a,100),c=Od(a,100);return[z(0<b?[z(id(ko,b)),z(" hundred")].join(""):null),z(0<b&&0<c?" ":null),z(0<c?20>c?id(lo,c):function(){var a=Nd(c,10),b=Od(c,10);return 0<a&&!(0<b)?id(no,a):[z(0<a?id(mo,a):null),z(0<a&&0<b?"-":null),z(0<b?id(lo,b):null)].join("")}():0<b?"th":null)].join("")}
var so=new T(null,4,5,U,[new T(null,9,5,U,"I II III IIII V VI VII VIII VIIII".split(" "),null),new T(null,9,5,U,"X XX XXX XXXX L LX LXX LXXX LXXXX".split(" "),null),new T(null,9,5,U,"C CC CCC CCCC D DC DCC DCCC DCCCC".split(" "),null),new T(null,3,5,U,["M","MM","MMM"],null)],null),to=new T(null,4,5,U,[new T(null,9,5,U,"I II III IV V VI VII VIII IX".split(" "),null),new T(null,9,5,U,"X XX XXX XL L LX LXX LXXX XC".split(" "),null),new T(null,9,5,U,"C CC CCC CD D DC DCC DCCC CM".split(" "),null),new T(null,
3,5,U,["M","MM","MMM"],null)],null);function uo(a,b){var c=Wn(b),d=P(c,0),c=P(c,1);if("number"===typeof d&&0<d&&4E3>d)for(var e=go(10,d),d=gd,f=N(e)-1;;)if(pd(e)){zm.i(I([A.b(z,d)],0));break}else var g=K(e),d=G.b(0,g)?d:fd.b(d,id(id(a,f),g-1)),f=f-1,e=L(e);else jo(10,new q(null,5,[zk,0,fk," ",km,",",bi,3,Mj,!0],null),Rn(new T(null,1,5,U,[d],null)));return c}var vo=new q(null,5,[8,"Backspace",9,"Tab",10,"Newline",13,"Return",32,"Space"],null);
function wo(a,b){var c=Wn(b),d=P(c,0),c=P(c,1),e=Cm(d),d=e&127,e=e&128,f=vc.b(vo,d);0<e&&zm.i(I(["Meta-"],0));zm.i(I([t(f)?f:32>d?[z("Control-"),z(Kd(d+64))].join(""):G.b(d,127)?"Control-?":Kd(d)],0));return c}
function xo(a,b){var c=Wn(b),d=P(c,0),c=P(c,1),e=Cj.a(a);if(t(G.b?G.b("o",e):G.call(null,"o",e)))Sn(!0,"\\o~3, '0o",I([Cm(d)],0));else if(t(G.b?G.b("u",e):G.call(null,"u",e)))Sn(!0,"\\u~4, '0x",I([Cm(d)],0));else if(t(G.b?G.b(null,e):G.call(null,null,e)))B(n,t(G.b?G.b("\b",d):G.call(null,"\b",d))?"\\backspace":t(G.b?G.b("\t",d):G.call(null,"\t",d))?"\\tab":t(G.b?G.b("\n",d):G.call(null,"\n",d))?"\\newline":t(G.b?G.b("\f",d):G.call(null,"\f",d))?"\\formfeed":t(G.b?G.b("\r",d):G.call(null,"\r",d))?
"\\return":t(G.b?G.b('"',d):G.call(null,'"',d))?'\\"':t(G.b?G.b("\\",d):G.call(null,"\\",d))?"\\\\":[z("\\"),z(d)].join(""));else throw Error([z("No matching clause: "),z(e)].join(""));return c}function yo(a,b){var c=Wn(b),d=P(c,0),c=P(c,1);zm.i(I([d],0));return c}function zo(a){a=K(a);return G.b(Pl,a)||G.b(Hj,a)}
function Ao(a,b,c){return dd(Dm(function(a,b){if(t(zo(b)))return new T(null,2,5,U,[null,b],null);var f=bo(ej.a(a),b),g=P(f,0),f=P(f,1),k=Fm(g),g=P(k,0),k=P(k,1),g=kd.c(g,ql,c);return new T(null,2,5,U,[null,A.b(Bi.a(a),new T(null,3,5,U,[g,f,k],null))],null)},b,a))}
function Bo(a){a=rm(""+z(a));var b=a.indexOf("e"),c=a.indexOf(".");a=0>b?0>c?new T(null,2,5,U,[a,""+z(N(a)-1)],null):new T(null,2,5,U,[[z(a.substring(0,c)),z(a.substring(c+1))].join(""),""+z(c-1)],null):0>c?new T(null,2,5,U,[a.substring(0,b),a.substring(b+1)],null):new T(null,2,5,U,[[z(a.substring(0,1)),z(a.substring(2,b))].join(""),a.substring(b+1)],null);b=P(a,0);a=P(a,1);a:if(c=N(b),0<c&&G.b(id(b,N(b)-1),"0"))for(--c;;){if(0>c){b="";break a}if(G.b(id(b,c),"0"))--c;else{b=b.substring(0,c+1);break a}}a:{var c=
b,d=N(c);if(0<d&&G.b(id(c,0),"0"))for(var e=0;;){if(G.b(e,d)||!G.b(id(c,e),"0")){c=c.substring(e);break a}e+=1}}b=N(b)-N(c);a=0<N(a)&&G.b(id(a,0),"+")?a.substring(1):a;return pd(c)?new T(null,2,5,U,["0",0],null):new T(null,2,5,U,[c,parseInt(a,10)-b],null)}
function Co(a,b,c,d){if(t(t(c)?c:d)){var e=N(a);d=t(d)?2>d?2:d:0;t(c)?c=b+c+1:0<=b?(c=b+1,--d,c=c>d?c:d):c=d+b;var f=G.b(c,0)?new T(null,4,5,U,[[z("0"),z(a)].join(""),b+1,1,e+1],null):new T(null,4,5,U,[a,b,c,e],null);c=P(f,0);e=P(f,1);d=P(f,2);f=P(f,3);if(t(d)){if(0>d)return new T(null,3,5,U,["0",0,!1],null);if(f>d){b=id(c,d);a=c.substring(0,d);if(Cm(b)>=Cm("5")){a:for(b=N(a)-1,c=b|0;;){if(0>c){b=A.c(z,"1",Pe(b+1,"0"));break a}if(G.b("9",a.charAt(c)))--c;else{b=A.u(z,a.substring(0,c),Kd(Cm(a.charAt(c))+
1),Pe(b-c,"0"));break a}}a=N(b)>N(a);c=U;a&&(d=N(b)-1,b=b.substring(0,d));return new T(null,3,5,c,[b,e,a],null)}return new T(null,3,5,U,[a,e,!1],null)}}}return new T(null,3,5,U,[a,b,!1],null)}
function Do(a,b,c){var d=0>b?new T(null,2,5,U,[[z(A.b(z,Pe(-b-1,"0"))),z(a)].join(""),-1],null):new T(null,2,5,U,[a,b],null);a=P(d,0);var e=P(d,1),d=N(a);c=t(c)?e+c+1:e+1;c=d<c?[z(a),z(A.b(z,Pe(c-d,"0")))].join(""):a;0>b?b=[z("."),z(c)].join(""):(b+=1,b=[z(c.substring(0,b)),z("."),z(c.substring(b))].join(""));return b}function Eo(a,b){return 0>b?[z("."),z(a)].join(""):[z(a.substring(0,b)),z("."),z(a.substring(b))].join("")}
function Fo(a,b){var c=Ji.a(a),d=Wk.a(a),e=Wn(b),f=P(e,0),e=P(e,1),g=0>f?new T(null,2,5,U,["-",-f],null):new T(null,2,5,U,["+",f],null),k=P(g,0),g=P(g,1),g=Bo(g),m=P(g,0),p=P(g,1)+Jj.a(a),g=function(){var b=Dk.a(a);return t(b)?b:0>f}(),u=La(d)&&N(m)-1<=p,v=Co(m,p,d,t(c)?c-(t(g)?1:0):null),m=P(v,0),p=P(v,1),v=P(v,2),m=Do(m,t(v)?p+1:p,d),d=t(t(c)?t(d)?1<=d&&G.b(m.charAt(0),"0")&&G.b(m.charAt(1),".")&&N(m)>c-(t(g)?1:0):d:c)?m.substring(1):m,p=G.b(K(d),".");if(t(c)){var m=N(d),m=t(g)?m+1:m,p=p&&!(m>=
c),u=u&&!(m>=c),w=p||u?m+1:m;t(function(){var b=w>c;return b?Ok.a(a):b}())?zm.i(I([A.b(z,Pe(c,Ok.a(a)))],0)):zm.i(I([[z(A.b(z,Pe(c-w,fk.a(a)))),z(t(g)?k:null),z(p?"0":null),z(d),z(u?"0":null)].join("")],0))}else zm.i(I([[z(t(g)?k:null),z(p?"0":null),z(d),z(u?"0":null)].join("")],0));return e}
function Go(a,b){var c=Wn(b),d=P(c,0),c=P(c,1),e=Bo(0>d?-d:d);P(e,0);for(P(e,1);;){var f=P(e,0),g=P(e,1),k=Ji.a(a),m=Wk.a(a),p=Aj.a(a),u=Jj.a(a),v=function(){var b=dm.a(a);return t(b)?b:"E"}(),e=function(){var b=Dk.a(a);return t(b)?b:0>d}(),w=0>=u,x=g-(u-1),C=""+z(Math.abs(x)),v=[z(v),z(0>x?"-":"+"),z(t(p)?A.b(z,Pe(p-N(C),"0")):null),z(C)].join(""),E=N(v),x=N(f),f=[z(A.b(z,Pe(-u,"0"))),z(f),z(t(m)?A.b(z,Pe(m-(x-1)-(0>u?-u:0),"0")):null)].join(""),x=t(k)?k-E:null,f=Co(f,0,G.b(u,0)?m-1:0<u?m:0>u?m-
1:null,t(x)?x-(t(e)?1:0):null),x=P(f,0);P(f,1);C=P(f,2);f=Eo(x,u);m=G.b(u,N(x))&&null==m;if(La(C)){if(t(k)){var g=N(f)+E,g=t(e)?g+1:g,D=(w=w&&!G.b(g,k))?g+1:g,g=m&&D<k;t(function(){var b;b=D>k;b||(b=p,b=t(b)?E-2>p:b);return t(b)?Ok.a(a):b}())?zm.i(I([A.b(z,Pe(k,Ok.a(a)))],0)):zm.i(I([[z(A.b(z,Pe(k-D-(g?1:0),fk.a(a)))),z(t(e)?0>d?"-":"+":null),z(w?"0":null),z(f),z(g?"0":null),z(v)].join("")],0))}else zm.i(I([[z(t(e)?0>d?"-":"+":null),z(w?"0":null),z(f),z(m?"0":null),z(v)].join("")],0));break}else e=
new T(null,2,5,U,[x,g+1],null)}return c}function Ho(a,b){var c=Wn(b),d=P(c,0);P(c,1);var c=Bo(0>d?-d:d),e=P(c,0),c=P(c,1),f=Ji.a(a),g=Wk.a(a),k=Aj.a(a),c=G.b(d,0)?0:c+1,d=t(k)?k+2:4,f=t(f)?f-d:null;t(g)?e=g:(e=N(e),g=7>c?c:7,e=e>g?e:g);c=e-c;return 0<=c&&c<=e?(c=Fo(new q(null,6,[Ji,f,Wk,c,Jj,0,Ok,Ok.a(a),fk,fk.a(a),Dk,Dk.a(a)],null),b),zm.i(I([A.b(z,Pe(d," "))],0)),c):Go(a,b)}
function Io(a,b){var c=Wn(b),d=P(c,0),c=P(c,1),e=Bo(Math.abs(d)),f=P(e,0),g=P(e,1),k=Wk.a(a),m=Ii.a(a),e=Ji.a(a),p=function(){var b=Dk.a(a);return t(b)?b:0>d}(),u=Co(f,g,k,null),f=P(u,0),g=P(u,1),u=P(u,2),k=Do(f,t(u)?g+1:g,k),m=[z(A.b(z,Pe(m-k.indexOf("."),"0"))),z(k)].join(""),k=N(m)+(t(p)?1:0);zm.i(I([[z(t(function(){var b=Mj.a(a);return t(b)?p:b}())?0>d?"-":"+":null),z(A.b(z,Pe(e-k,fk.a(a)))),z(t(function(){var b=La(Mj.a(a));return b?p:b}())?0>d?"-":"+":null),z(m)].join("")],0));return c}
function Jo(a,b){var c=Eh.a(a),d=t(c)?new T(null,2,5,U,[c,b],null):Wn(b),c=P(d,0),d=P(d,1),e=bl.a(a),c=0>c||c>=N(e)?K(ii.a(a)):id(e,c);return t(c)?Ao(c,d,ql.a(a)):d}function Ko(a,b){var c=Wn(b),d=P(c,0),c=P(c,1),e=bl.a(a),d=t(d)?dd(e):K(e);return t(d)?Ao(d,c,ql.a(a)):c}function Lo(a,b){var c=Wn(b),d=P(c,0),c=P(c,1),e=bl.a(a),e=t(d)?K(e):null;return t(d)?t(e)?Ao(e,b,ql.a(a)):b:c}
function Mo(a,b){for(var c=gj.a(a),d=K(bl.a(a)),e=pd(d)?Xn(b):new T(null,2,5,U,[d,b],null),d=P(e,0),e=P(e,1),e=Wn(e),f=P(e,0),e=P(e,1),g=0,f=Rn(f),k=-1;;){if(La(c)&&G.b(hj.a(f),k)&&1<g)throw Error("%{ construct not consuming any arguments: Infinite loop!");k=pd(Wl.a(f))&&(La(Mj.a(qk.a(a)))||0<g);if(t(k?k:t(c)?g>=c:c))return e;k=Ao(d,f,ql.a(a));if(G.b(Pl,K(k)))return e;var g=g+1,m=hj.a(f),f=k,k=m}}
function No(a,b){for(var c=gj.a(a),d=K(bl.a(a)),e=pd(d)?Xn(b):new T(null,2,5,U,[d,b],null),d=P(e,0),e=P(e,1),e=Wn(e),f=P(e,0),e=P(e,1),g=0;;){var k=pd(f)&&(La(Mj.a(qk.a(a)))||0<g);if(t(k?k:t(c)?g>=c:c))return e;k=Ao(d,Rn(K(f)),Rn(L(f)));if(G.b(Hj,K(k)))return e;g+=1;f=L(f)}}
function Oo(a,b){for(var c=gj.a(a),d=K(bl.a(a)),e=pd(d)?Xn(b):new T(null,2,5,U,[d,b],null),d=P(e,0),f=0,e=P(e,1),g=-1;;){if(La(c)&&G.b(hj.a(e),g)&&1<f)throw Error("%@{ construct not consuming any arguments: Infinite loop!");g=pd(Wl.a(e))&&(La(Mj.a(qk.a(a)))||0<f);if(t(g?g:t(c)?f>=c:c))return e;g=Ao(d,e,ql.a(a));if(G.b(Pl,K(g)))return dd(g);var f=f+1,k=hj.a(e),e=g,g=k}}
function Po(a,b){for(var c=gj.a(a),d=K(bl.a(a)),e=pd(d)?Xn(b):new T(null,2,5,U,[d,b],null),d=P(e,0),f=0,e=P(e,1);;){var g=pd(Wl.a(e))&&(La(Mj.a(qk.a(a)))||0<f);if(t(g?g:t(c)?f>=c:c))return e;g=Wl.a(e);g=t(g)?new T(null,2,5,U,[K(g),new Vn(hl.a(e),L(g),hj.a(e)+1,null,null,null)],null):new T(null,2,5,U,[null,e],null);e=P(g,0);g=P(g,1);e=Ao(d,Rn(e),g);if(G.b(Hj,K(e)))return g;e=g;f+=1}}Qo;Ro;
function So(a,b,c){return t(Mj.a(qk.a(a)))?Qo.c?Qo.c(a,b,c):Qo.call(null,a,b):Ro.c?Ro.c(a,b,c):Ro.call(null,a,b)}function To(a,b,c){for(var d=gd;;){if(pd(a))return new T(null,2,5,U,[d,b],null);var e=K(a),f;a:{var g=new ka,k=n;n=new fc(g);try{f=new T(null,2,5,U,[Ao(e,b,c),""+z(g)],null);break a}finally{n=k}f=void 0}b=P(f,0);e=P(f,1);if(G.b(Pl,K(b)))return new T(null,2,5,U,[d,dd(b)],null);a=L(a);d=fd.b(d,e)}}
function Ro(a,b){var c=function(){var c=ii.a(a);return t(c)?To(c,b,ql.a(a)):null}(),d=P(c,0),e=P(d,0),c=P(c,1),f=t(c)?c:b,c=function(){var b=Hh.a(a);return t(b)?bo(b,f):null}(),g=P(c,0),c=P(c,1),c=t(c)?c:f,k=function(){var a=K(Ul.a(g));return t(a)?a:0}(),m=function(){var a=K(bm.a(g));return t(a)?a:Lm(n)}(),d=bl.a(a),c=To(d,c,ql.a(a)),p=P(c,0),c=P(c,1),u=function(){var b=N(p)-1+(t(Mj.a(a))?1:0)+(t(Dk.a(a))?1:0);return 1>b?1:b}(),d=Ta.b(Jd,Sd.b(N,p)),v=zk.a(a),w=Bk.a(a),x=Sk.a(a),C=d+u*w,E=C<=v?v:v+
x*(1+Nd(C-v-1,x)),D=E-d,d=function(){var a=Nd(D,u);return w>a?w:a}(),v=D-d*u,d=A.b(z,Pe(d,fk.a(a)));t(function(){return t(e)?Km(vl.a(function(){var a=M.a?M.a(n):M.call(null,n);return M.a?M.a(a):M.call(null,a)}()))+k+E>m:e}())&&zm.i(I([e],0));for(var x=v,H=p,R=function(){var b=Mj.a(a);return t(b)?b:G.b(N(H),1)&&La(Dk.a(a))}();;)if(r(H))zm.i(I([[z(La(R)?K(H):null),z(t(function(){var b=R;return t(b)?b:(b=L(H))?b:Dk.a(a)}())?d:null),z(0<x?fk.a(a):null)].join("")],0)),--x,H=v=t(R)?H:L(H),R=!1;else break;
return c}
var Uo=function Uo(b){"undefined"===typeof vm&&(vm=function(b,d,e){this.ld=b;this.ba=d;this.rd=e;this.o=1074135040;this.F=0},vm.prototype.N=function(b,d){return new vm(this.ld,this.ba,d)},vm.prototype.L=function(){return this.rd},vm.prototype.bb=function(){return Kb(this.ba)},vm.prototype.qb=function(b,d){var e=Oa(d);if(t(G.b?G.b(String,e):G.call(null,String,e)))return B(this.ba,rm(d));if(t(G.b?G.b(Number,e):G.call(null,Number,e)))return B(this.ba,rm(Kd(d)));throw Error([z("No matching clause: "),z(e)].join(""));
},vm.Ob=function(){return new T(null,3,5,U,[Oc(lm,new q(null,3,[hi,!0,te,mc(ue,mc(new T(null,1,5,U,[Fl],null))),Gl,"Returns a proxy that wraps writer, converting all characters to lower case"],null)),Fl,xk],null)},vm.rb=!0,vm.cb="cljs.pprint/t_cljs$pprint12814",vm.Ab=function(b,d){return B(d,"cljs.pprint/t_cljs$pprint12814")});return new vm(Uo,b,V)},Vo=function Vo(b){"undefined"===typeof wm&&(wm=function(b,d,e){this.Bd=b;this.ba=d;this.sd=e;this.o=1074135040;this.F=0},wm.prototype.N=function(b,d){return new wm(this.Bd,
this.ba,d)},wm.prototype.L=function(){return this.sd},wm.prototype.bb=function(){return Kb(this.ba)},wm.prototype.qb=function(b,d){var e=Oa(d);if(t(G.b?G.b(String,e):G.call(null,String,e)))return B(this.ba,qm(d));if(t(G.b?G.b(Number,e):G.call(null,Number,e)))return B(this.ba,qm(Kd(d)));throw Error([z("No matching clause: "),z(e)].join(""));},wm.Ob=function(){return new T(null,3,5,U,[Oc($h,new q(null,3,[hi,!0,te,mc(ue,mc(new T(null,1,5,U,[Fl],null))),Gl,"Returns a proxy that wraps writer, converting all characters to upper case"],
null)),Fl,im],null)},wm.rb=!0,wm.cb="cljs.pprint/t_cljs$pprint12826",wm.Ab=function(b,d){return B(d,"cljs.pprint/t_cljs$pprint12826")});return new wm(Vo,b,V)};
function Wo(a,b){var c=K(a),d=t(t(b)?t(c)?fa(c):c:b)?[z(qm(c)),z(a.substring(1))].join(""):a;return A.b(z,K(Em(function(){return function(a){if(pd(a))return new T(null,2,5,U,[null,null],null);var b=RegExp("\\W\\w","g").exec(a),b=t(b)?b.index+1:b;return t(b)?new T(null,2,5,U,[[z(a.substring(0,b)),z(qm(id(a,b)))].join(""),a.substring(b+1)],null):new T(null,2,5,U,[a,null],null)}}(c,d),d)))}
var Xo=function Xo(b){var c=W.a?W.a(!0):W.call(null,!0);"undefined"===typeof xm&&(xm=function(b,c,f,g){this.Qc=b;this.ba=c;this.Eb=f;this.td=g;this.o=1074135040;this.F=0},xm.prototype.N=function(){return function(b,c){return new xm(this.Qc,this.ba,this.Eb,c)}}(c),xm.prototype.L=function(){return function(){return this.td}}(c),xm.prototype.bb=function(){return function(){return Kb(this.ba)}}(c),xm.prototype.qb=function(){return function(b,c){var f=Oa(c);if(t(G.b?G.b(String,f):G.call(null,String,f))){B(this.ba,
Wo(c.toLowerCase(),M.a?M.a(this.Eb):M.call(null,this.Eb)));if(0<c.length){var f=this.Eb,g;g=id(c,N(c)-1);g=ea(g);return De.b?De.b(f,g):De.call(null,f,g)}return null}if(t(G.b?G.b(Number,f):G.call(null,Number,f)))return f=Kd(c),g=t(M.a?M.a(this.Eb):M.call(null,this.Eb))?qm(f):f,B(this.ba,g),g=this.Eb,f=ea(f),De.b?De.b(g,f):De.call(null,g,f);throw Error([z("No matching clause: "),z(f)].join(""));}}(c),xm.Ob=function(){return function(){return new T(null,4,5,U,[Oc(yl,new q(null,3,[hi,!0,te,mc(ue,mc(new T(null,
1,5,U,[Fl],null))),Gl,"Returns a proxy that wraps writer, capitalizing all words"],null)),Fl,Kh,Jk],null)}}(c),xm.rb=!0,xm.cb="cljs.pprint/t_cljs$pprint12844",xm.Ab=function(){return function(b,c){return B(c,"cljs.pprint/t_cljs$pprint12844")}}(c));return new xm(Xo,b,c,V)},Yo=function Yo(b){var c=W.a?W.a(!1):W.call(null,!1);"undefined"===typeof ym&&(ym=function(b,c,f,g){this.md=b;this.ba=c;this.ib=f;this.ud=g;this.o=1074135040;this.F=0},ym.prototype.N=function(){return function(b,c){return new ym(this.md,
this.ba,this.ib,c)}}(c),ym.prototype.L=function(){return function(){return this.ud}}(c),ym.prototype.bb=function(){return function(){return Kb(this.ba)}}(c),ym.prototype.qb=function(){return function(b,c){var f=Oa(c);if(t(G.b?G.b(String,f):G.call(null,String,f))){f=rm(c);if(La(M.a?M.a(this.ib):M.call(null,this.ib))){var g=RegExp("\\S","g").exec(f),g=t(g)?g.index:g;return t(g)?(B(this.ba,[z(f.substring(0,g)),z(qm(id(f,g))),z(rm(f.substring(g+1)))].join("")),De.b?De.b(this.ib,!0):De.call(null,this.ib,
!0)):B(this.ba,f)}return B(this.ba,rm(f))}if(t(G.b?G.b(Number,f):G.call(null,Number,f)))return f=Kd(c),g=La(M.a?M.a(this.ib):M.call(null,this.ib)),t(g?fa(f):g)?(De.b?De.b(this.ib,!0):De.call(null,this.ib,!0),B(this.ba,qm(f))):B(this.ba,rm(f));throw Error([z("No matching clause: "),z(f)].join(""));}}(c),ym.Ob=function(){return function(){return new T(null,4,5,U,[Oc(sh,new q(null,3,[hi,!0,te,mc(ue,mc(new T(null,1,5,U,[Fl],null))),Gl,"Returns a proxy that wraps writer, capitalizing the first word"],
null)),Fl,zj,Vh],null)}}(c),ym.rb=!0,ym.cb="cljs.pprint/t_cljs$pprint12862",ym.Ab=function(){return function(b,c){return B(c,"cljs.pprint/t_cljs$pprint12862")}}(c));return new ym(Yo,b,c,V)};function Zo(){(null!=n?n.o&32768||n.uc||(n.o?0:Ma(ub,n)):Ma(ub,n))?G.b(0,Km(vl.a(function(){var a=M.a?M.a(n):M.call(null,n);return M.a?M.a(a):M.call(null,a)}())))||Bm():Bm()}
function $o(a,b){var c=Ik.a(a),d=Sk.a(a),e=Km(vl.a(function(){var a=M.a?M.a(n):M.call(null,n);return M.a?M.a(a):M.call(null,a)}())),c=e<c?c-e:G.b(d,0)?0:d-Od(e-c,d);zm.i(I([A.b(z,Pe(c," "))],0));return b}function ap(a,b){var c=Ik.a(a),d=Sk.a(a),e=c+Km(vl.a(function(){var a=M.a?M.a(n):M.call(null,n);return M.a?M.a(a):M.call(null,a)}())),e=0<d?Od(e,d):0,c=c+(G.b(0,e)?0:d-e);zm.i(I([A.b(z,Pe(c," "))],0));return b}
function Qo(a,b){var c=bl.a(a),d=N(c),e=1<d?uj.a(ej.a(K(K(c)))):t(Mj.a(a))?"(":null,f=id(c,1<d?1:0),c=2<d?uj.a(ej.a(K(id(c,2)))):t(Mj.a(a))?")":null,g=Wn(b),d=P(g,0),g=P(g,1);if(t(Mn()))B(n,"#");else{var k=X,m=Fn;X+=1;Fn=0;try{sn(e,c),Ao(f,Rn(d),ql.a(a)),tn()}finally{Fn=m,X=k}}return g}function bp(a,b){var c=t(Mj.a(a))?Ck:Ih;On(c,Ii.a(a));return b}function cp(a,b){var c=t(Mj.a(a))?t(Dk.a(a))?qh:Mi:t(Dk.a(a))?ji:gl;Nn(c);return b}
var dp=ld("ASDBOXRPCFEG$%\x26|~\nT*?()[;]{}\x3c\x3e^W_I".split(""),[new q(null,5,[Hl,"A",ej,new q(null,4,[zk,new T(null,2,5,U,[0,Number],null),Sk,new T(null,2,5,U,[1,Number],null),Bk,new T(null,2,5,U,[0,Number],null),fk,new T(null,2,5,U,[" ",String],null)],null),El,new og(null,new q(null,3,[Mj,null,Dk,null,Vk,null],null),null),ol,V,Fi,function(){return function(a,b){return fo(Mg,a,b)}}],null),new q(null,5,[Hl,"S",ej,new q(null,4,[zk,new T(null,2,5,U,[0,Number],null),Sk,new T(null,2,5,U,[1,Number],
null),Bk,new T(null,2,5,U,[0,Number],null),fk,new T(null,2,5,U,[" ",String],null)],null),El,new og(null,new q(null,3,[Mj,null,Dk,null,Vk,null],null),null),ol,V,Fi,function(){return function(a,b){return fo(Ce,a,b)}}],null),new q(null,5,[Hl,"D",ej,new q(null,4,[zk,new T(null,2,5,U,[0,Number],null),fk,new T(null,2,5,U,[" ",String],null),km,new T(null,2,5,U,[",",String],null),bi,new T(null,2,5,U,[3,Number],null)],null),El,new og(null,new q(null,3,[Mj,null,Dk,null,Vk,null],null),null),ol,V,Fi,function(){return function(a,
b){return jo(10,a,b)}}],null),new q(null,5,[Hl,"B",ej,new q(null,4,[zk,new T(null,2,5,U,[0,Number],null),fk,new T(null,2,5,U,[" ",String],null),km,new T(null,2,5,U,[",",String],null),bi,new T(null,2,5,U,[3,Number],null)],null),El,new og(null,new q(null,3,[Mj,null,Dk,null,Vk,null],null),null),ol,V,Fi,function(){return function(a,b){return jo(2,a,b)}}],null),new q(null,5,[Hl,"O",ej,new q(null,4,[zk,new T(null,2,5,U,[0,Number],null),fk,new T(null,2,5,U,[" ",String],null),km,new T(null,2,5,U,[",",String],
null),bi,new T(null,2,5,U,[3,Number],null)],null),El,new og(null,new q(null,3,[Mj,null,Dk,null,Vk,null],null),null),ol,V,Fi,function(){return function(a,b){return jo(8,a,b)}}],null),new q(null,5,[Hl,"X",ej,new q(null,4,[zk,new T(null,2,5,U,[0,Number],null),fk,new T(null,2,5,U,[" ",String],null),km,new T(null,2,5,U,[",",String],null),bi,new T(null,2,5,U,[3,Number],null)],null),El,new og(null,new q(null,3,[Mj,null,Dk,null,Vk,null],null),null),ol,V,Fi,function(){return function(a,b){return jo(16,a,b)}}],
null),new q(null,5,[Hl,"R",ej,new q(null,5,[vl,new T(null,2,5,U,[null,Number],null),zk,new T(null,2,5,U,[0,Number],null),fk,new T(null,2,5,U,[" ",String],null),km,new T(null,2,5,U,[",",String],null),bi,new T(null,2,5,U,[3,Number],null)],null),El,new og(null,new q(null,3,[Mj,null,Dk,null,Vk,null],null),null),ol,V,Fi,function(a){return t(K(vl.a(a)))?function(a,c){return jo(vl.a(a),a,c)}:t(function(){var b=Dk.a(a);return t(b)?Mj.a(a):b}())?function(a,c){return uo(so,c)}:t(Dk.a(a))?function(a,c){return uo(to,
c)}:t(Mj.a(a))?function(a,c){var d=Wn(c),e=P(d,0),d=P(d,1);if(G.b(0,e))zm.i(I(["zeroth"],0));else{var f=go(1E3,0>e?-e:e);if(N(f)<=N(oo)){var g=Sd.b(po,Me(f)),g=qo(g,1),f=ro(ed(f));zm.i(I([[z(0>e?"minus ":null),z(pd(g)||pd(f)?pd(g)?f:[z(g),z("th")].join(""):[z(g),z(", "),z(f)].join(""))].join("")],0))}else jo(10,new q(null,5,[zk,0,fk," ",km,",",bi,3,Mj,!0],null),Rn(new T(null,1,5,U,[e],null))),f=Od(e,100),e=11<f||19>f,f=Od(f,10),zm.i(I([1===f&&e?"st":2===f&&e?"nd":3===f&&e?"rd":"th"],0))}return d}:
function(a,c){var d=Wn(c),e=P(d,0),d=P(d,1);if(G.b(0,e))zm.i(I(["zero"],0));else{var f=go(1E3,0>e?-e:e);N(f)<=N(oo)?(f=Sd.b(po,f),f=qo(f,0),zm.i(I([[z(0>e?"minus ":null),z(f)].join("")],0))):jo(10,new q(null,5,[zk,0,fk," ",km,",",bi,3,Mj,!0],null),Rn(new T(null,1,5,U,[e],null)))}return d}}],null),new q(null,5,[Hl,"P",ej,V,El,new og(null,new q(null,3,[Mj,null,Dk,null,Vk,null],null),null),ol,V,Fi,function(){return function(a,b){var c=t(Mj.a(a))?Yn(b,-1):b,d=t(Dk.a(a))?new T(null,2,5,U,["y","ies"],null):
new T(null,2,5,U,["","s"],null),e=Wn(c),c=P(e,0),e=P(e,1);zm.i(I([G.b(c,1)?K(d):dd(d)],0));return e}}],null),new q(null,5,[Hl,"C",ej,new q(null,1,[Cj,new T(null,2,5,U,[null,String],null)],null),El,new og(null,new q(null,3,[Mj,null,Dk,null,Vk,null],null),null),ol,V,Fi,function(a){return t(Mj.a(a))?wo:t(Dk.a(a))?xo:yo}],null),new q(null,5,[Hl,"F",ej,new q(null,5,[Ji,new T(null,2,5,U,[null,Number],null),Wk,new T(null,2,5,U,[null,Number],null),Jj,new T(null,2,5,U,[0,Number],null),Ok,new T(null,2,5,U,
[null,String],null),fk,new T(null,2,5,U,[" ",String],null)],null),El,new og(null,new q(null,1,[Dk,null],null),null),ol,V,Fi,function(){return Fo}],null),new q(null,5,[Hl,"E",ej,new q(null,7,[Ji,new T(null,2,5,U,[null,Number],null),Wk,new T(null,2,5,U,[null,Number],null),Aj,new T(null,2,5,U,[null,Number],null),Jj,new T(null,2,5,U,[1,Number],null),Ok,new T(null,2,5,U,[null,String],null),fk,new T(null,2,5,U,[" ",String],null),dm,new T(null,2,5,U,[null,String],null)],null),El,new og(null,new q(null,1,
[Dk,null],null),null),ol,V,Fi,function(){return Go}],null),new q(null,5,[Hl,"G",ej,new q(null,7,[Ji,new T(null,2,5,U,[null,Number],null),Wk,new T(null,2,5,U,[null,Number],null),Aj,new T(null,2,5,U,[null,Number],null),Jj,new T(null,2,5,U,[1,Number],null),Ok,new T(null,2,5,U,[null,String],null),fk,new T(null,2,5,U,[" ",String],null),dm,new T(null,2,5,U,[null,String],null)],null),El,new og(null,new q(null,1,[Dk,null],null),null),ol,V,Fi,function(){return Ho}],null),new q(null,5,[Hl,"$",ej,new q(null,
4,[Wk,new T(null,2,5,U,[2,Number],null),Ii,new T(null,2,5,U,[1,Number],null),Ji,new T(null,2,5,U,[0,Number],null),fk,new T(null,2,5,U,[" ",String],null)],null),El,new og(null,new q(null,3,[Mj,null,Dk,null,Vk,null],null),null),ol,V,Fi,function(){return Io}],null),new q(null,5,[Hl,"%",ej,new q(null,1,[Fk,new T(null,2,5,U,[1,Number],null)],null),El,pg,ol,V,Fi,function(){return function(a,b){for(var c=Fk.a(a),d=0;;)if(d<c)Bm(),d+=1;else break;return b}}],null),new q(null,5,[Hl,"\x26",ej,new q(null,1,
[Fk,new T(null,2,5,U,[1,Number],null)],null),El,new og(null,new q(null,1,[rl,null],null),null),ol,V,Fi,function(){return function(a,b){var c=Fk.a(a);0<c&&Zo();for(var c=c-1,d=0;;)if(d<c)Bm(),d+=1;else break;return b}}],null),new q(null,5,[Hl,"|",ej,new q(null,1,[Fk,new T(null,2,5,U,[1,Number],null)],null),El,pg,ol,V,Fi,function(){return function(a,b){for(var c=Fk.a(a),d=0;;)if(d<c)zm.i(I(["\f"],0)),d+=1;else break;return b}}],null),new q(null,5,[Hl,"~",ej,new q(null,1,[Ii,new T(null,2,5,U,[1,Number],
null)],null),El,pg,ol,V,Fi,function(){return function(a,b){var c=Ii.a(a);zm.i(I([A.b(z,Pe(c,"~"))],0));return b}}],null),new q(null,5,[Hl,"\n",ej,V,El,new og(null,new q(null,2,[Mj,null,Dk,null],null),null),ol,V,Fi,function(){return function(a,b){t(Dk.a(a))&&Bm();return b}}],null),new q(null,5,[Hl,"T",ej,new q(null,2,[Ik,new T(null,2,5,U,[1,Number],null),Sk,new T(null,2,5,U,[1,Number],null)],null),El,new og(null,new q(null,2,[Dk,null,rl,null],null),null),ol,V,Fi,function(a){return t(Dk.a(a))?function(a,
c){return ap(a,c)}:function(a,c){return $o(a,c)}}],null),new q(null,5,[Hl,"*",ej,new q(null,1,[Ii,new T(null,2,5,U,[1,Number],null)],null),El,new og(null,new q(null,2,[Mj,null,Dk,null],null),null),ol,V,Fi,function(){return function(a,b){var c=Ii.a(a);return t(Dk.a(a))?Zn(b,c):Yn(b,t(Mj.a(a))?-c:c)}}],null),new q(null,5,[Hl,"?",ej,V,El,new og(null,new q(null,1,[Dk,null],null),null),ol,V,Fi,function(a){return t(Dk.a(a))?function(a,c){var d=Xn(c),e=P(d,0),d=P(d,1);return Ao(e,d,ql.a(a))}:function(a,
c){var d=Xn(c),e=P(d,0),d=P(d,1),f=Wn(d),d=P(f,0),f=P(f,1),d=Rn(d);Ao(e,d,ql.a(a));return f}}],null),new q(null,5,[Hl,"(",ej,V,El,new og(null,new q(null,3,[Mj,null,Dk,null,Vk,null],null),null),ol,new q(null,3,[Rk,")",Jh,null,ii,null],null),Fi,function(a){return function(a){return function(c,d){var e;a:{var f=K(bl.a(c)),g=n;n=a.a?a.a(n):a.call(null,n);try{e=Ao(f,d,ql.a(c));break a}finally{n=g}e=void 0}return e}}(t(function(){var b=Dk.a(a);return t(b)?Mj.a(a):b}())?Vo:t(Mj.a(a))?Xo:t(Dk.a(a))?Yo:Uo)}],
null),new q(null,5,[Hl,")",ej,V,El,pg,ol,V,Fi,function(){return null}],null),new q(null,5,[Hl,"[",ej,new q(null,1,[Eh,new T(null,2,5,U,[null,Number],null)],null),El,new og(null,new q(null,2,[Mj,null,Dk,null],null),null),ol,new q(null,3,[Rk,"]",Jh,!0,ii,Kl],null),Fi,function(a){return t(Mj.a(a))?Ko:t(Dk.a(a))?Lo:Jo}],null),new q(null,5,[Hl,";",ej,new q(null,2,[Ul,new T(null,2,5,U,[null,Number],null),bm,new T(null,2,5,U,[null,Number],null)],null),El,new og(null,new q(null,1,[Mj,null],null),null),ol,
new q(null,1,[Dl,!0],null),Fi,function(){return null}],null),new q(null,5,[Hl,"]",ej,V,El,pg,ol,V,Fi,function(){return null}],null),new q(null,5,[Hl,"{",ej,new q(null,1,[gj,new T(null,2,5,U,[null,Number],null)],null),El,new og(null,new q(null,3,[Mj,null,Dk,null,Vk,null],null),null),ol,new q(null,2,[Rk,"}",Jh,!1],null),Fi,function(a){var b;b=Dk.a(a);b=t(b)?Mj.a(a):b;return t(b)?Po:t(Mj.a(a))?No:t(Dk.a(a))?Oo:Mo}],null),new q(null,5,[Hl,"}",ej,V,El,new og(null,new q(null,1,[Mj,null],null),null),ol,
V,Fi,function(){return null}],null),new q(null,5,[Hl,"\x3c",ej,new q(null,4,[zk,new T(null,2,5,U,[0,Number],null),Sk,new T(null,2,5,U,[1,Number],null),Bk,new T(null,2,5,U,[0,Number],null),fk,new T(null,2,5,U,[" ",String],null)],null),El,new og(null,new q(null,4,[Mj,null,Dk,null,Vk,null,rl,null],null),null),ol,new q(null,3,[Rk,"\x3e",Jh,!0,ii,ml],null),Fi,function(){return So}],null),new q(null,5,[Hl,"\x3e",ej,V,El,new og(null,new q(null,1,[Mj,null],null),null),ol,V,Fi,function(){return null}],null),
new q(null,5,[Hl,"^",ej,new q(null,3,[Yl,new T(null,2,5,U,[null,Number],null),ai,new T(null,2,5,U,[null,Number],null),xh,new T(null,2,5,U,[null,Number],null)],null),El,new og(null,new q(null,1,[Mj,null],null),null),ol,V,Fi,function(){return function(a,b){var c=Yl.a(a),d=ai.a(a),e=xh.a(a),f=t(Mj.a(a))?Hj:Pl;return t(t(c)?t(d)?e:d:c)?c<=d&&d<=e?new T(null,2,5,U,[f,b],null):b:t(t(c)?d:c)?G.b(c,d)?new T(null,2,5,U,[f,b],null):b:t(c)?G.b(c,0)?new T(null,2,5,U,[f,b],null):b:(t(Mj.a(a))?pd(Wl.a(ql.a(a))):
pd(Wl.a(b)))?new T(null,2,5,U,[f,b],null):b}}],null),new q(null,5,[Hl,"W",ej,V,El,new og(null,new q(null,4,[Mj,null,Dk,null,Vk,null,rl,null],null),null),ol,V,Fi,function(a){return t(function(){var b=Dk.a(a);return t(b)?b:Mj.a(a)}())?function(a){return function(c,d){var e=Wn(d),f=P(e,0),e=P(e,1);return t(A.c(Jn,f,a))?new T(null,2,5,U,[Pl,e],null):e}}(ne.b(t(Dk.a(a))?new T(null,4,5,U,[Pj,null,Lk,null],null):gd,t(Mj.a(a))?new T(null,2,5,U,[rl,!0],null):gd)):function(a,c){var d=Wn(c),e=P(d,0),d=P(d,1);
return t(In(e))?new T(null,2,5,U,[Pl,d],null):d}}],null),new q(null,5,[Hl,"_",ej,V,El,new og(null,new q(null,3,[Mj,null,Dk,null,Vk,null],null),null),ol,V,Fi,function(){return cp}],null),new q(null,5,[Hl,"I",ej,new q(null,1,[Ii,new T(null,2,5,U,[0,Number],null)],null),El,new og(null,new q(null,1,[Mj,null],null),null),ol,V,Fi,function(){return bp}],null)]),ep=/^([vV]|#|('.)|([+-]?\d+)|(?=,))/,fp=new og(null,new q(null,2,[Li,null,mj,null],null),null);
function gp(a){var b=P(a,0),c=P(a,1),d=P(a,2);a=new RegExp(ep.source,"g");var e=a.exec(b);return t(e)?(d=K(e),b=b.substring(a.lastIndex),a=c+a.lastIndex,G.b(",",id(b,0))?new T(null,2,5,U,[new T(null,2,5,U,[d,c],null),new T(null,3,5,U,[b.substring(1),a+1,!0],null)],null):new T(null,2,5,U,[new T(null,2,5,U,[d,c],null),new T(null,3,5,U,[b,a,!1],null)],null)):t(d)?Un("Badly formed parameters in format directive",c):new T(null,2,5,U,[null,new T(null,2,5,U,[b,c],null)],null)}
function hp(a){var b=P(a,0);a=P(a,1);return new T(null,2,5,U,[G.b(b.length,0)?null:G.b(b.length,1)&&Ed(new og(null,new q(null,2,["V",null,"v",null],null),null),id(b,0))?mj:G.b(b.length,1)&&G.b("#",id(b,0))?Li:G.b(b.length,2)&&G.b("'",id(b,0))?id(b,1):parseInt(b,10),a],null)}var ip=new q(null,2,[":",Mj,"@",Dk],null);
function jp(a,b){return Em(function(a){var b=P(a,0),e=P(a,1);a=P(a,2);if(pd(b))return new T(null,2,5,U,[null,new T(null,3,5,U,[b,e,a],null)],null);var f=vc.b(ip,K(b));return t(f)?Ed(a,f)?Un([z('Flag "'),z(K(b)),z('" appears more than once in a directive')].join(""),e):new T(null,2,5,U,[!0,new T(null,3,5,U,[b.substring(1),e+1,kd.c(a,f,new T(null,2,5,U,[!0,e],null))],null)],null):new T(null,2,5,U,[null,new T(null,3,5,U,[b,e,a],null)],null)},new T(null,3,5,U,[a,b,V],null))}
function kp(a,b){var c=El.a(a);t(function(){var a=La(Dk.a(c));return a?Dk.a(b):a}())&&Un([z('"@" is an illegal flag for format directive "'),z(Hl.a(a)),z('"')].join(""),id(Dk.a(b),1));t(function(){var a=La(Mj.a(c));return a?Mj.a(b):a}())&&Un([z('":" is an illegal flag for format directive "'),z(Hl.a(a)),z('"')].join(""),id(Mj.a(b),1));t(function(){var a=La(Vk.a(c));return a?(a=Dk.a(b),t(a)?Mj.a(b):a):a}())&&Un([z('Cannot combine "@" and ":" flags for format directive "'),z(Hl.a(a)),z('"')].join(""),
function(){var a=id(Mj.a(b),1),c=id(Dk.a(b),1);return a<c?a:c}())}
function lp(a,b,c,d){kp(a,c);N(b)>N(ej.a(a))&&Un(Sn(null,'Too many parameters for directive "~C": ~D~:* ~[were~;was~:;were~] specified but only ~D~:* ~[are~;is~:;are~] allowed',I([Hl.a(a),N(b),N(ej.a(a))],0)),dd(K(b)));xg(Sd.c(function(b,c){var d=K(b);return null==d||Ed(fp,d)||G.b(dd(dd(c)),Oa(d))?null:Un([z("Parameter "),z(Td(K(c))),z(' has bad type in directive "'),z(Hl.a(a)),z('": '),z(Oa(d))].join(""),dd(b))},b,ej.a(a)));return kg(I([We(V,$d(function(){return function f(a){return new ee(null,
function(){for(;;){var b=r(a);if(b){if(yd(b)){var c=Xb(b),p=N(c),u=ie(p);a:for(var v=0;;)if(v<p){var w=bb.b(c,v),x=P(w,0),w=P(w,1),w=P(w,0);u.add(new T(null,2,5,U,[x,new T(null,2,5,U,[w,d],null)],null));v+=1}else{c=!0;break a}return c?je(u.ya(),f(Yb(b))):je(u.ya(),null)}c=K(b);u=P(c,0);c=P(c,1);c=P(c,0);return Xc(new T(null,2,5,U,[u,new T(null,2,5,U,[c,d],null)],null),f(Ac(b)))}return null}},null,null)}(ej.a(a))}())),Ta.c(function(a,b){return A.c(kd,a,b)},V,Ve(function(a){return K(id(a,1))},sg(Gf(ej.a(a)),
b))),c],0))}function mp(a,b){return new $n(function(b,d){zm.i(I([a],0));return d},null,new q(null,1,[uj,a],null),b,null,null,null)}np;function op(a,b){var c,d=ol.a(Zk.a(a));c=ri.a(a);c=np.c?np.c(d,c,b):np.call(null,d,c,b);d=P(c,0);c=P(c,1);return new T(null,2,5,U,[new $n(Bi.a(a),Zk.a(a),kg(I([ej.a(a),Gm(d,ri.a(a))],0)),ri.a(a),null,null,null),c],null)}
function pp(a,b,c){return Em(function(c){if(pd(c))return Un("No closing bracket found.",b);var e=K(c);c=L(c);if(t(Rk.a(ol.a(Zk.a(e)))))e=op(e,c);else if(G.b(Rk.a(a),Hl.a(Zk.a(e))))e=new T(null,2,5,U,[null,new T(null,4,5,U,[Tj,ej.a(e),null,c],null)],null);else{var f;f=Dl.a(ol.a(Zk.a(e)));f=t(f)?Mj.a(ej.a(e)):f;e=t(f)?new T(null,2,5,U,[null,new T(null,4,5,U,[ii,null,ej.a(e),c],null)],null):t(Dl.a(ol.a(Zk.a(e))))?new T(null,2,5,U,[null,new T(null,4,5,U,[Dl,null,null,c],null)],null):new T(null,2,5,U,
[e,c],null)}return e},c)}
function np(a,b,c){return dd(Em(function(c){var e=P(c,0),f=P(c,1);c=P(c,2);var g=pp(a,b,c);c=P(g,0);var k=P(g,1),g=P(k,0),m=P(k,1),p=P(k,2),k=P(k,3);return G.b(g,Tj)?new T(null,2,5,U,[null,new T(null,2,5,U,[lg(ne,I([e,Lf([t(f)?ii:bl,new T(null,1,5,U,[c],null),qk,m])],0)),k],null)],null):G.b(g,ii)?t(ii.a(e))?Un('Two else clauses ("~:;") inside bracket construction.',b):La(ii.a(a))?Un('An else clause ("~:;") is in a bracket type that doesn\'t support it.',b):G.b(ml,ii.a(a))&&r(bl.a(e))?Un('The else clause ("~:;") is only allowed in the first position for this directive.',
b):G.b(ml,ii.a(a))?new T(null,2,5,U,[!0,new T(null,3,5,U,[lg(ne,I([e,new q(null,2,[ii,new T(null,1,5,U,[c],null),Hh,p],null)],0)),!1,k],null)],null):new T(null,2,5,U,[!0,new T(null,3,5,U,[lg(ne,I([e,new q(null,1,[bl,new T(null,1,5,U,[c],null)],null)],0)),!0,k],null)],null):G.b(g,Dl)?t(f)?Un('A plain clause (with "~;") follows an else clause ("~:;") inside bracket construction.',b):La(Jh.a(a))?Un('A separator ("~;") is in a bracket type that doesn\'t support it.',b):new T(null,2,5,U,[!0,new T(null,
3,5,U,[lg(ne,I([e,new q(null,1,[bl,new T(null,1,5,U,[c],null)],null)],0)),!1,k],null)],null):null},new T(null,3,5,U,[new q(null,1,[bl,gd],null),!1,c],null)))}function qp(a){return K(Em(function(a){var c=K(a);a=L(a);var d=ol.a(Zk.a(c));return t(Rk.a(d))?op(c,a):new T(null,2,5,U,[c,a],null)},a))}
function Pn(a){var b=Tn;Tn=a;try{return qp(K(Em(function(){return function(a){var b=P(a,0);a=P(a,1);if(pd(b))return new T(null,2,5,U,[null,b],null);var e=b.indexOf("~");if(0>e)b=new T(null,2,5,U,[mp(b,a),new T(null,2,5,U,["",a+b.length],null)],null);else if(0===e){a=Em(gp,new T(null,3,5,U,[b.substring(1),a+1,!1],null));b=P(a,0);e=P(a,1);a=P(e,0);e=P(e,1);a=jp(a,e);P(a,0);a=P(a,1);var e=P(a,0),f=P(a,1),g=P(a,2);a=K(e);var k=vc.b(dp,qm(a)),g=t(k)?lp(k,Sd.b(hp,b),g,f):null;La(a)&&Un("Format string ended in the middle of a directive",
f);La(k)&&Un([z('Directive "'),z(a),z('" is undefined')].join(""),f);b=U;a=new $n(Fi.a(k).call(null,g,f),k,g,f,null,null,null);e=e.substring(1);f+=1;if(G.b("\n",Hl.a(k))&&La(Mj.a(g)))a:{k=new T(null,2,5,U,[" ","\t"],null);if(qd(k))k=qg(k);else b:if(k=[k],g=k.length,g<=Jf)for(var m=0,p=Pb(V);;)if(m<g)var u=m+1,p=Sb(p,k[m],null),m=u;else{k=new og(null,Rb(p),null);break b}else for(m=0,p=Pb(pg);;)if(m<g)u=m+1,p=Qb(p,k[m]),m=u;else{k=Rb(p);break b}for(g=0;;){(m=G.b(g,N(e)))||(m=id(e,g),m=k.a?k.a(m):k.call(null,
m),m=La(m));if(m){k=g;break a}g+=1}}else k=0;b=new T(null,2,5,b,[a,new T(null,2,5,U,[e.substring(k),f+k],null)],null)}else b=new T(null,2,5,U,[mp(b.substring(0,e),a),new T(null,2,5,U,[b.substring(e),e+a],null)],null);return b}}(b),new T(null,2,5,U,[a,0],null))))}finally{Tn=b}}
var rp=function rp(b){for(;;){if(pd(b))return!1;var c;c=rl.a(El.a(Zk.a(K(b))));t(c)||(c=ye(rp,K(bl.a(ej.a(K(b))))),c=t(c)?c:ye(rp,K(ii.a(ej.a(K(b))))));if(t(c))return!0;b=L(b)}},Qn=function Qn(b){for(var c=[],d=arguments.length,e=0;;)if(e<d)c.push(arguments[e]),e+=1;else break;switch(c.length){case 3:return Qn.c(arguments[0],arguments[1],arguments[2]);case 2:return Qn.b(arguments[0],arguments[1]);default:throw Error([z("Invalid arity: "),z(c.length)].join(""));}};
Qn.c=function(a,b,c){var d=new ka,e=La(a)||!0===a?new fc(d):a,f;f=rp(b);f=t(f)?La(Hn(e)):f;f=t(f)?t(Hn(e))?e:rn(e,yn,zn):e;var g=n;n=f;try{try{Qn.b(b,c)}finally{e!==f&&Kb(f)}return La(a)?""+z(d):!0===a?na.a?na.a(""+z(d)):na.call(null,""+z(d)):null}finally{n=g}};
Qn.b=function(a,b){Dm(function(a,b){if(t(zo(b)))return new T(null,2,5,U,[null,b],null);var e=bo(ej.a(a),b),f=P(e,0),e=P(e,1),g=Fm(f),f=P(g,0),g=P(g,1),f=kd.c(f,ql,e);return new T(null,2,5,U,[null,A.b(Bi.a(a),new T(null,3,5,U,[f,e,g],null))],null)},b,a);return null};Qn.C=3;
var Y=function(a){return function(b){return function(){function c(a){var b=null;if(0<arguments.length){for(var b=0,c=Array(arguments.length-0);b<c.length;)c[b]=arguments[b+0],++b;b=new Ia(c,0)}return d.call(this,b)}function d(c){var d=vc.c(M.a?M.a(b):M.call(null,b),c,Bd);d===Bd&&(d=A.b(a,c),Ge.u(b,kd,c,d));return d}c.C=0;c.G=function(a){a=r(a);return d(a)};c.i=d;return c}()}(W.a?W.a(V):W.call(null,V))}(Pn),sp=new q(null,6,[ue,"'",nl,"#'",Ak,"@",Nk,"~",qi,"@",vh,"~"],null);
function tp(a){var b;b=K(a);b=sp.a?sp.a(b):sp.call(null,b);return t(t(b)?G.b(2,N(a)):b)?(B(n,b),In(dd(a)),!0):null}function up(a){if(t(Mn()))B(n,"#");else{var b=X,c=Fn;X+=1;Fn=0;try{sn("[","]");for(var d=0,e=r(a);;){if(La(ta)||d<ta){if(e&&(In(K(e)),L(e))){B(n," ");Nn(gl);a=d+1;var f=L(e),d=a,e=f;continue}}else B(n,"...");break}tn()}finally{Fn=c,X=b}}return null}Y.a?Y.a("~\x3c[~;~@{~w~^, ~:_~}~;]~:\x3e"):Y.call(null,"~\x3c[~;~@{~w~^, ~:_~}~;]~:\x3e");
function vp(a){if(t(Mn()))B(n,"#");else{var b=X,c=Fn;X+=1;Fn=0;try{sn("{","}");for(var d=0,e=r(a);;){if(La(ta)||d<ta){if(e){if(t(Mn()))B(n,"#");else{a=X;var f=Fn;X+=1;Fn=0;try{sn(null,null);In(K(K(e)));B(n," ");Nn(gl);Fn=0;var g,k=K(e);g=K(L(k));In(g);tn()}finally{Fn=f,X=a}}if(L(e)){B(n,", ");Nn(gl);a=d+1;var m=L(e),d=a,e=m;continue}}}else B(n,"...");break}tn()}finally{Fn=c,X=b}}return null}function wp(a){return B(n,Ce.i(I([a],0)))}
var xp=function(a,b){return function(){function a(b){var c=null;if(0<arguments.length){for(var c=0,g=Array(arguments.length-0);c<g.length;)g[c]=arguments[c+0],++c;c=new Ia(g,0)}return d.call(this,c)}function d(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return d(a)};a.i=d;return a}()}("~\x3c#{~;~@{~w~^ ~:_~}~;}~:\x3e",Y.a?Y.a("~\x3c#{~;~@{~w~^ ~:_~}~;}~:\x3e"):Y.call(null,"~\x3c#{~;~@{~w~^ ~:_~}~;}~:\x3e")),yp=new q(null,2,["core$future_call","Future","core$promise","Promise"],null);
function zp(a){var b;b=zg(/^[^$]+\$[^$]+/,a);b=t(b)?yp.a?yp.a(b):yp.call(null,b):null;return t(b)?b:a}
var Ap=function(a,b){return function(){function a(b){var c=null;if(0<arguments.length){for(var c=0,g=Array(arguments.length-0);c<g.length;)g[c]=arguments[c+0],++c;c=new Ia(g,0)}return d.call(this,c)}function d(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return d(a)};a.i=d;return a}()}("~\x3c\x3c-(~;~@{~w~^ ~_~}~;)-\x3c~:\x3e",Y.a?Y.a("~\x3c\x3c-(~;~@{~w~^ ~_~}~;)-\x3c~:\x3e"):Y.call(null,"~\x3c\x3c-(~;~@{~w~^ ~_~}~;)-\x3c~:\x3e"));
function Bp(a){return a instanceof uf?wi:(null!=a?a.o&32768||a.uc||(a.o?0:Ma(ub,a)):Ma(ub,a))?Ek:a instanceof F?Ei:(null==a?0:null!=a?a.o&64||a.Jb||(a.o?0:Ma(db,a)):Ma(db,a))?ok:ud(a)?Sl:vd(a)?vj:sd(a)?pl:null==a?null:yi}if("undefined"===typeof Cp){var Cp,Dp=W.a?W.a(V):W.call(null,V),Ep=W.a?W.a(V):W.call(null,V),Fp=W.a?W.a(V):W.call(null,V),Gp=W.a?W.a(V):W.call(null,V),Hp=vc.c(V,zl,bh());Cp=new nh(wc.b("cljs.pprint","simple-dispatch"),Bp,yi,Hp,Dp,Ep,Fp,Gp)}
lh(Cp,ok,function(a){if(La(tp(a)))if(t(Mn()))B(n,"#");else{var b=X,c=Fn;X+=1;Fn=0;try{sn("(",")");for(var d=0,e=r(a);;){if(La(ta)||d<ta){if(e&&(In(K(e)),L(e))){B(n," ");Nn(gl);a=d+1;var f=L(e),d=a,e=f;continue}}else B(n,"...");break}tn()}finally{Fn=c,X=b}}return null});lh(Cp,vj,up);lh(Cp,Sl,vp);lh(Cp,pl,xp);lh(Cp,null,function(){return B(n,Ce.i(I([null],0)))});lh(Cp,yi,wp);xn=Cp;Ip;function Jp(a){return vd(a)?new T(null,2,5,U,["[","]"],null):new T(null,2,5,U,["(",")"],null)}
function Kp(a){if(td(a)){var b=Jp(a),c=P(b,0),d=P(b,1),e=P(a,0),f=Qd(a,1);if(t(Mn()))B(n,"#");else{var g=X,k=Fn;X+=1;Fn=0;try{sn(c,d);(function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return c.call(this,d)}function c(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return c(a)};a.i=c;return a}()}("~w~:i",Y.a?Y.a("~w~:i"):Y.call(null,"~w~:i"),g,k,b,c,d,
a,e,f)})().call(null,e);for(var m=f;;)if(r(m)){(function(){var p=Y.a?Y.a(" "):Y.call(null," ");return function(a,b,c){return function(){function a(c){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return b.call(this,d)}function b(a){a=Rn(a);return Qn.b(c,a)}a.C=0;a.G=function(a){a=r(a);return b(a)};a.i=b;return a}()}(m," ",p,g,k,b,c,d,a,e,f)})().call(null);var p=K(m);if(td(p)){var u=Jp(p),v=P(u,0),w=P(u,1);if(t(Mn()))B(n,
"#");else{var x=X,C=Fn;X+=1;Fn=0;try{sn(v,w);if(G.b(N(p),3)&&dd(p)instanceof y){var E=p,D=P(E,0),H=P(E,1),R=P(E,2);(function(){var S=Y.a?Y.a("~w ~w "):Y.call(null,"~w ~w ");return function(a,b,c){return function(){function a(c){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return b.call(this,d)}function b(a){a=Rn(a);return Qn.b(c,a)}a.C=0;a.G=function(a){a=r(a);return b(a)};a.i=b;return a}()}(m,"~w ~w ",S,E,D,H,R,x,C,u,
v,w,p,g,k,b,c,d,a,e,f)})().call(null,D,H);td(R)?function(){var S=vd(R)?"~\x3c[~;~@{~w~^ ~:_~}~;]~:\x3e":"~\x3c(~;~@{~w~^ ~:_~}~;)~:\x3e",ya="string"===typeof S?Y.a?Y.a(S):Y.call(null,S):S;return function(a,b,c){return function(){function a(c){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return b.call(this,d)}function b(a){a=Rn(a);return Qn.b(c,a)}a.C=0;a.G=function(a){a=r(a);return b(a)};a.i=b;return a}()}(m,S,ya,E,D,H,
R,x,C,u,v,w,p,g,k,b,c,d,a,e,f)}().call(null,R):In(R)}else A.b(function(){var D=Y.a?Y.a("~w ~:i~@{~w~^ ~:_~}"):Y.call(null,"~w ~:i~@{~w~^ ~:_~}");return function(a,b,c){return function(){function a(c){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return b.call(this,d)}function b(a){a=Rn(a);return Qn.b(c,a)}a.C=0;a.G=function(a){a=r(a);return b(a)};a.i=b;return a}()}(m,"~w ~:i~@{~w~^ ~:_~}",D,x,C,u,v,w,p,g,k,b,c,d,a,e,f)}(),
p);tn()}finally{Fn=C,X=x}}L(m)&&function(){var D=Y.a?Y.a("~_"):Y.call(null,"~_");return function(a,b,c){return function(){function a(c){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return b.call(this,d)}function b(a){a=Rn(a);return Qn.b(c,a)}a.C=0;a.G=function(a){a=r(a);return b(a)};a.i=b;return a}()}(m,"~_",D,u,v,w,p,g,k,b,c,d,a,e,f)}().call(null)}else In(p),L(m)&&function(){var u=Y.a?Y.a("~:_"):Y.call(null,"~:_");return function(a,
b,c){return function(){function a(c){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return b.call(this,d)}function b(a){a=Rn(a);return Qn.b(c,a)}a.C=0;a.G=function(a){a=r(a);return b(a)};a.i=b;return a}()}(m,"~:_",u,p,g,k,b,c,d,a,e,f)}().call(null);m=L(m)}else break;tn()}finally{Fn=k,X=g}}}else In(a)}
var Lp=function(a,b){return function(){function a(b){var c=null;if(0<arguments.length){for(var c=0,g=Array(arguments.length-0);c<g.length;)g[c]=arguments[c+0],++c;c=new Ia(g,0)}return d.call(this,c)}function d(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return d(a)};a.i=d;return a}()}("~:\x3c~w~^ ~@_~w~^ ~_~@{~w~^ ~_~}~:\x3e",Y.a?Y.a("~:\x3c~w~^ ~@_~w~^ ~_~@{~w~^ ~_~}~:\x3e"):Y.call(null,"~:\x3c~w~^ ~@_~w~^ ~_~@{~w~^ ~_~}~:\x3e"));
function Mp(a,b){r(a)&&(t(b)?function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return c.call(this,d)}function c(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return c(a)};a.i=c;return a}()}(" ~_",Y.a?Y.a(" ~_"):Y.call(null," ~_"))}().call(null):function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=
0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return c.call(this,d)}function c(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return c(a)};a.i=c;return a}()}(" ~@_",Y.a?Y.a(" ~@_"):Y.call(null," ~@_"))}().call(null),function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return c.call(this,d)}function c(a){a=Rn(a);return Qn.b(b,
a)}a.C=0;a.G=function(a){a=r(a);return c(a)};a.i=c;return a}()}("~{~w~^ ~_~}",Y.a?Y.a("~{~w~^ ~_~}"):Y.call(null,"~{~w~^ ~_~}"))}().call(null,a))}
function Np(a){r(a)&&function(){return function(a,c){return function(){function a(c){var d=null;if(0<arguments.length){for(var d=0,k=Array(arguments.length-0);d<k.length;)k[d]=arguments[d+0],++d;d=new Ia(k,0)}return b.call(this,d)}function b(a){a=Rn(a);return Qn.b(c,a)}a.C=0;a.G=function(a){a=r(a);return b(a)};a.i=b;return a}()}(" ~_~{~w~^ ~_~}",Y.a?Y.a(" ~_~{~w~^ ~_~}"):Y.call(null," ~_~{~w~^ ~_~}"))}().call(null,a)}
function Op(a){if(L(a)){var b=P(a,0),c=P(a,1),d=Qd(a,2),e="string"===typeof K(d)?new T(null,2,5,U,[K(d),L(d)],null):new T(null,2,5,U,[null,d],null),f=P(e,0),g=P(e,1),k=ud(K(g))?new T(null,2,5,U,[K(g),L(g)],null):new T(null,2,5,U,[null,g],null),m=P(k,0),p=P(k,1);if(t(Mn()))B(n,"#");else{var u=X,v=Fn;X+=1;Fn=0;try{sn("(",")"),function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=
new Ia(e,0)}return c.call(this,d)}function c(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return c(a)};a.i=c;return a}()}("~w ~1I~@_~w",Y.a?Y.a("~w ~1I~@_~w"):Y.call(null,"~w ~1I~@_~w"),u,v,a,b,c,d,e,f,g,k,m,p)}().call(null,b,c),t(f)&&function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return c.call(this,d)}function c(a){a=Rn(a);return Qn.b(b,a)}a.C=0;
a.G=function(a){a=r(a);return c(a)};a.i=c;return a}()}(" ~_~w",Y.a?Y.a(" ~_~w"):Y.call(null," ~_~w"),u,v,a,b,c,d,e,f,g,k,m,p)}().call(null,f),t(m)&&function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return c.call(this,d)}function c(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return c(a)};a.i=c;return a}()}(" ~_~w",Y.a?Y.a(" ~_~w"):Y.call(null," ~_~w"),
u,v,a,b,c,d,e,f,g,k,m,p)}().call(null,m),vd(K(p))?Mp(p,t(f)?f:m):Np(p),tn()}finally{Fn=v,X=u}}return null}return Ip.a?Ip.a(a):Ip.call(null,a)}
function Pp(a){if(t(Mn()))B(n,"#");else{var b=X,c=Fn;X+=1;Fn=0;try{sn("[","]");for(var d=0;;){if(La(ta)||d<ta){if(r(a)){if(t(Mn()))B(n,"#");else{var e=X,f=Fn;X+=1;Fn=0;try{sn(null,null),In(K(a)),L(a)&&(B(n," "),Nn(ji),In(dd(a))),tn()}finally{Fn=f,X=e}}if(L(Ac(a))){B(n," ");Nn(gl);var e=d+1,g=L(Ac(a)),d=e;a=g;continue}}}else B(n,"...");break}tn()}finally{Fn=c,X=b}}}
function Qp(a){var b=K(a);if(t(Mn()))B(n,"#");else{var c=X,d=Fn;X+=1;Fn=0;try{sn("(",")"),L(a)&&vd(dd(a))?(function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return c.call(this,d)}function c(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return c(a)};a.i=c;return a}()}("~w ~1I~@_",Y.a?Y.a("~w ~1I~@_"):Y.call(null,"~w ~1I~@_"),c,d,b)}().call(null,b),Pp(dd(a)),
function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return c.call(this,d)}function c(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return c(a)};a.i=c;return a}()}(" ~_~{~w~^ ~_~}",Y.a?Y.a(" ~_~{~w~^ ~_~}"):Y.call(null," ~_~{~w~^ ~_~}"),c,d,b)}().call(null,L(Ac(a)))):Ip.a?Ip.a(a):Ip.call(null,a),tn()}finally{Fn=d,X=c}}return null}
var Rp=function(a,b){return function(){function a(b){var c=null;if(0<arguments.length){for(var c=0,g=Array(arguments.length-0);c<g.length;)g[c]=arguments[c+0],++c;c=new Ia(g,0)}return d.call(this,c)}function d(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return d(a)};a.i=d;return a}()}("~:\x3c~1I~w~^ ~@_~w~@{ ~_~w~}~:\x3e",Y.a?Y.a("~:\x3c~1I~w~^ ~@_~w~@{ ~_~w~}~:\x3e"):Y.call(null,"~:\x3c~1I~w~^ ~@_~w~@{ ~_~w~}~:\x3e")),Sp=V;
function Ip(a){if(t(Mn()))B(n,"#");else{var b=X,c=Fn;X+=1;Fn=0;try{sn("(",")");On(Ih,1);for(var d=0,e=r(a);;){if(La(ta)||d<ta){if(e&&(In(K(e)),L(e))){B(n," ");Nn(gl);a=d+1;var f=L(e),d=a,e=f;continue}}else B(n,"...");break}tn()}finally{Fn=c,X=b}}return null}
var Tp=function(a){return We(V,Ue(Id,I([function(){return function c(a){return new ee(null,function(){for(;;){var e=r(a);if(e){if(yd(e)){var f=Xb(e),g=N(f),k=ie(g);a:for(var m=0;;)if(m<g){var p=bb.b(f,m),p=new T(null,2,5,U,[p,new T(null,2,5,U,[wc.a(Td(K(p))),dd(p)],null)],null);k.add(p);m+=1}else{f=!0;break a}return f?je(k.ya(),c(Yb(e))):je(k.ya(),null)}k=K(e);return Xc(new T(null,2,5,U,[k,new T(null,2,5,U,[wc.a(Td(K(k))),dd(k)],null)],null),c(Ac(e)))}return null}},null,null)}(a)}()],0)))}(function(a){return We(V,
Sd.b(function(a){return function(c){var d=P(c,0),e=P(c,1),f;f=ce(d);f=t(f)?f:Ed(new og(null,new q(null,19,[rh,null,Ah,null,Dh,null,Ci,null,nj,null,yj,null,Bj,null,Gj,null,Ij,null,ck,null,dk,null,gk,null,pk,null,sk,null,al,null,kl,null,ue,null,Xl,null,fm,null],null),null),d);return La(f)?new T(null,2,5,U,[wc.b(a,Td(d)),e],null):c}}("clojure.core"),a))}(ld([kl,pk,wh,Bj,Qk,Th,$k,xj,Mk,Qh,ui,pi,pj,fm,rj,nk,Yk,rk,Ai,Ij,hk,Tk,Ui,fj,uk,il,Wi,wl,Xk,ek],[Lp,function(a){var b=dd(a),c=K(Ac(Ac(a)));if(vd(b)){var d=
Sp;Sp=G.b(1,N(b))?Lf([K(b),"%"]):We(V,Sd.c(function(){return function(a,b){return new T(null,2,5,U,[a,[z("%"),z(b)].join("")],null)}}(d,b,c),b,wg(N(b)+1)));try{return function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return c.call(this,d)}function c(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return c(a)};a.i=c;return a}()}("~\x3c#(~;~@{~w~^ ~_~}~;)~:\x3e",
Y.a?Y.a("~\x3c#(~;~@{~w~^ ~_~}~;)~:\x3e"):Y.call(null,"~\x3c#(~;~@{~w~^ ~_~}~;)~:\x3e"),d,b,c)}().call(null,c)}finally{Sp=d}}else return Ip.a?Ip.a(a):Ip.call(null,a)},Qp,Rp,function(a){if(3<N(a)){if(t(Mn()))B(n,"#");else{var b=X,c=Fn;X+=1;Fn=0;try{sn("(",")");On(Ih,1);A.b(function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return c.call(this,d)}function c(a){a=Rn(a);
return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return c(a)};a.i=c;return a}()}("~w ~@_~w ~@_~w ~_",Y.a?Y.a("~w ~@_~w ~@_~w ~_"):Y.call(null,"~w ~@_~w ~@_~w ~_"),b,c)}(),a);for(var d=0,e=r(Le(3,a));;){if(La(ta)||d<ta){if(e){if(t(Mn()))B(n,"#");else{a=X;var f=Fn;X+=1;Fn=0;try{sn(null,null),In(K(e)),L(e)&&(B(n," "),Nn(ji),In(dd(e))),tn()}finally{Fn=f,X=a}}if(L(Ac(e))){B(n," ");Nn(gl);a=d+1;var g=L(Ac(e)),d=a,e=g;continue}}}else B(n,"...");break}tn()}finally{Fn=c,X=b}}return null}return Ip.a?Ip.a(a):Ip.call(null,
a)},Lp,Op,Op,Qp,Lp,Qp,Rp,Rp,Lp,Rp,Qp,Qp,Lp,Qp,function(a){if(L(a)){var b=P(a,0),c=P(a,1),d=Qd(a,2),e="string"===typeof K(d)?new T(null,2,5,U,[K(d),L(d)],null):new T(null,2,5,U,[null,d],null),f=P(e,0),g=P(e,1),k=ud(K(g))?new T(null,2,5,U,[K(g),L(g)],null):new T(null,2,5,U,[null,g],null),m=P(k,0),p=P(k,1);if(t(Mn()))B(n,"#");else{var u=X,v=Fn;X+=1;Fn=0;try{sn("(",")");(function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-
0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return c.call(this,d)}function c(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return c(a)};a.i=c;return a}()}("~w ~1I~@_~w",Y.a?Y.a("~w ~1I~@_~w"):Y.call(null,"~w ~1I~@_~w"),u,v,a,b,c,d,e,f,g,k,m,p)})().call(null,b,c);t(t(f)?f:t(m)?m:r(p))&&function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return c.call(this,
d)}function c(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=function(a){a=r(a);return c(a)};a.i=c;return a}()}("~@:_",Y.a?Y.a("~@:_"):Y.call(null,"~@:_"),u,v,a,b,c,d,e,f,g,k,m,p)}().call(null);t(f)&&Sn(!0,'"~a"~:[~;~:@_~]',I([f,t(m)?m:r(p)],0));t(m)&&function(){return function(a,b){return function(){function a(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new Ia(e,0)}return c.call(this,d)}function c(a){a=Rn(a);return Qn.b(b,a)}a.C=0;a.G=
function(a){a=r(a);return c(a)};a.i=c;return a}()}("~w~:[~;~:@_~]",Y.a?Y.a("~w~:[~;~:@_~]"):Y.call(null,"~w~:[~;~:@_~]"),u,v,a,b,c,d,e,f,g,k,m,p)}().call(null,m,r(p));for(var w=p;;){Kp(K(w));var x=L(w);if(x){var C=x;Nn(gl);w=C}else break}tn()}finally{Fn=v,X=u}}return null}return In(a)},Qp,function(a){if(t(Mn()))B(n,"#");else{var b=X,c=Fn;X+=1;Fn=0;try{sn("(",")");On(Ih,1);In(K(a));if(L(a)){B(n," ");Nn(gl);for(var d=0,e=L(a);;){if(La(ta)||d<ta){if(e){if(t(Mn()))B(n,"#");else{a=X;var f=Fn;X+=1;Fn=0;
try{sn(null,null),In(K(e)),L(e)&&(B(n," "),Nn(ji),In(dd(e))),tn()}finally{Fn=f,X=a}}if(L(Ac(e))){B(n," ");Nn(gl);a=d+1;var g=L(Ac(e)),d=a,e=g;continue}}}else B(n,"...");break}}tn()}finally{Fn=c,X=b}}return null},Qp,Op,Op,Lp,Lp,Qp,Qp,Lp])));if("undefined"===typeof Up){var Up,Vp=W.a?W.a(V):W.call(null,V),Wp=W.a?W.a(V):W.call(null,V),Xp=W.a?W.a(V):W.call(null,V),Yp=W.a?W.a(V):W.call(null,V),Zp=vc.c(V,zl,bh());Up=new nh(wc.b("cljs.pprint","code-dispatch"),Bp,yi,Zp,Vp,Wp,Xp,Yp)}
lh(Up,ok,function(a){if(La(tp(a))){var b;b=K(a);b=Tp.a?Tp.a(b):Tp.call(null,b);return t(b)?b.a?b.a(a):b.call(null,a):Ip(a)}return null});lh(Up,Ei,function(a){var b=a.a?a.a(Sp):a.call(null,Sp);return t(b)?zm.i(I([b],0)):t(Cn)?zm.i(I([Td(a)],0)):Am.a?Am.a(a):Am.call(null,a)});lh(Up,vj,up);lh(Up,Sl,vp);lh(Up,pl,xp);lh(Up,wi,Ap);
lh(Up,Ek,function(a){var b=[z("#\x3c"),z(zp(Oa(a).name)),z("@"),z(aa(a)),z(": ")].join("");if(t(Mn()))B(n,"#");else{var c=X,d=Fn;X+=1;Fn=0;try{sn(b,"\x3e");On(Ih,-(N(b)-2));Nn(gl);var e,f=null!=a?a.F&1||a.Id?!0:a.F?!1:Ma(Mb,a):Ma(Mb,a);e=f?!Nb(a):f;In(e?Ki:M.a?M.a(a):M.call(null,a));tn()}finally{Fn=d,X=c}}return null});lh(Up,null,Am);lh(Up,yi,wp);xn=Cp;var $p=function $p(b){if(null!=b&&null!=b.hd)return b.hd(b);var c=$p[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=$p._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("PushbackReader.read-char",b);},aq=function aq(b,c){if(null!=b&&null!=b.jd)return b.jd(b,c);var d=aq[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=aq._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("PushbackReader.unread",b);};
function bq(a){var b=!/[^\t\n\r ]/.test(a);return t(b)?b:","===a}cq;dq;eq;function fq(a){throw Error(A.b(z,a));}function gq(a,b){for(var c=new ka(b),d=$p(a);;){var e;if(!(e=null==d||bq(d))){e=d;var f="#"!==e;e=f?(f="'"!==e)?(f=":"!==e)?dq.a?dq.a(e):dq.call(null,e):f:f:f}if(e)return aq(a,d),c.toString();c.append(d);d=$p(a)}}function hq(a){for(;;){var b=$p(a);if("\n"===b||"\r"===b||null==b)return a}}
var iq=Ag("^([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+))(N)?$"),jq=Ag("^([-+]?[0-9]+)/([0-9]+)$"),kq=Ag("^([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?$"),lq=Ag("^[:]?([^0-9/].*/)?([^0-9/][^/]*)$");function mq(a,b){var c=a.exec(b);return null!=c&&c[0]===b?1===c.length?c[0]:c:null}var nq=Ag("^[0-9A-Fa-f]{2}$"),oq=Ag("^[0-9A-Fa-f]{4}$");function pq(a,b,c){return t(yg(a,c))?c:fq(I(["Unexpected unicode escape \\",b,c],0))}
function qq(a){return String.fromCharCode(parseInt(a,16))}function rq(a){var b=$p(a),c="t"===b?"\t":"r"===b?"\r":"n"===b?"\n":"\\"===b?"\\":'"'===b?'"':"b"===b?"\b":"f"===b?"\f":null;t(c)?b=c:"x"===b?(a=(new ka($p(a),$p(a))).toString(),b=qq(pq(nq,b,a))):"u"===b?(a=(new ka($p(a),$p(a),$p(a),$p(a))).toString(),b=qq(pq(oq,b,a))):b=/[^0-9]/.test(b)?fq(I(["Unexpected unicode escape \\",b],0)):String.fromCharCode(b);return b}
function sq(a,b){for(var c=Pb(gd);;){var d;a:{d=bq;for(var e=b,f=$p(e);;)if(t(d.a?d.a(f):d.call(null,f)))f=$p(e);else{d=f;break a}}t(d)||fq(I(["EOF while reading"],0));if(a===d)return Rb(c);e=dq.a?dq.a(d):dq.call(null,d);t(e)?d=e.b?e.b(b,d):e.call(null,b,d):(aq(b,d),d=cq.u?cq.u(b,!0,null,!0):cq.call(null,b,!0,null));c=d===b?c:oe.b(c,d)}}function tq(a,b){return fq(I(["Reader for ",b," not implemented yet"],0))}uq;
function vq(a,b){var c=$p(a),d=eq.a?eq.a(c):eq.call(null,c);if(t(d))return d.b?d.b(a,b):d.call(null,a,b);d=uq.b?uq.b(a,c):uq.call(null,a,c);return t(d)?d:fq(I(["No dispatch macro for ",c],0))}function wq(a,b){return fq(I(["Unmatched delimiter ",b],0))}function xq(a){return A.b(mc,sq(")",a))}function yq(a){return sq("]",a)}
function zq(a){a=sq("}",a);var b=N(a);if(!Dd(b))throw Error([z("Argument must be an integer: "),z(b)].join(""));0!==(b&1)&&fq(I(["Map literal must contain an even number of forms"],0));return A.b(Lc,a)}function Aq(a){for(var b=new ka,c=$p(a);;){if(null==c)return fq(I(["EOF while reading"],0));if("\\"===c)b.append(rq(a));else{if('"'===c)return b.toString();b.append(c)}c=$p(a)}}
function Bq(a){for(var b=new ka,c=$p(a);;){if(null==c)return fq(I(["EOF while reading"],0));if("\\"===c){b.append(c);var d=$p(a);if(null==d)return fq(I(["EOF while reading"],0));var e=function(){var a=b;a.append(d);return a}(),f=$p(a)}else{if('"'===c)return b.toString();e=function(){var a=b;a.append(c);return a}();f=$p(a)}b=e;c=f}}
function Cq(a,b){var c=gq(a,b),d=-1!=c.indexOf("/");t(t(d)?1!==c.length:d)?c=wc.b(c.substring(0,c.indexOf("/")),c.substring(c.indexOf("/")+1,c.length)):(d=wc.a(c),c="nil"===c?null:"true"===c?!0:"false"===c?!1:"/"===c?Hk:d);return c}
function Dq(a,b){var c=gq(a,b),d=c.substring(1);return 1===d.length?d:"tab"===d?"\t":"return"===d?"\r":"newline"===d?"\n":"space"===d?" ":"backspace"===d?"\b":"formfeed"===d?"\f":"u"===d.charAt(0)?qq(d.substring(1)):"o"===d.charAt(0)?tq(0,c):fq(I(["Unknown character literal: ",c],0))}
function Eq(a){a=gq(a,$p(a));var b=mq(lq,a);a=b[0];var c=b[1],b=b[2];return void 0!==c&&":/"===c.substring(c.length-2,c.length)||":"===b[b.length-1]||-1!==a.indexOf("::",1)?fq(I(["Invalid token: ",a],0)):null!=c&&0<c.length?de.b(c.substring(0,c.indexOf("/")),b):de.a(a)}function Fq(a){return function(b){return Za(Za(Bc,cq.u?cq.u(b,!0,null,!0):cq.call(null,b,!0,null)),a)}}function Gq(){return function(){return fq(I(["Unreadable form"],0))}}
function Hq(a){var b;b=cq.u?cq.u(a,!0,null,!0):cq.call(null,a,!0,null);b=b instanceof F?new q(null,1,[el,b],null):"string"===typeof b?new q(null,1,[el,b],null):b instanceof y?Lf([b,!0]):b;ud(b)||fq(I(["Metadata must be Symbol,Keyword,String or Map"],0));a=cq.u?cq.u(a,!0,null,!0):cq.call(null,a,!0,null);return(null!=a?a.o&262144||a.Nd||(a.o?0:Ma(yb,a)):Ma(yb,a))?Oc(a,kg(I([od(a),b],0))):fq(I(["Metadata can only be applied to IWithMetas"],0))}function Iq(a){return qg(sq("}",a))}
function Jq(a){return Ag(Bq(a))}function Kq(a){cq.u?cq.u(a,!0,null,!0):cq.call(null,a,!0,null);return a}function dq(a){return'"'===a?Aq:":"===a?Eq:";"===a?hq:"'"===a?Fq(ue):"@"===a?Fq(Ol):"^"===a?Hq:"`"===a?tq:"~"===a?tq:"("===a?xq:")"===a?wq:"["===a?yq:"]"===a?wq:"{"===a?zq:"}"===a?wq:"\\"===a?Dq:"#"===a?vq:null}function eq(a){return"{"===a?Iq:"\x3c"===a?Gq():'"'===a?Jq:"!"===a?hq:"_"===a?Kq:null}
function cq(a,b,c){for(;;){var d=$p(a);if(null==d)return t(b)?fq(I(["EOF while reading"],0)):c;if(!bq(d))if(";"===d)a=hq.b?hq.b(a,d):hq.call(null,a);else{var e=dq(d);if(t(e))e=e.b?e.b(a,d):e.call(null,a,d);else{var e=a,f=void 0;!(f=!/[^0-9]/.test(d))&&(f=void 0,f="+"===d||"-"===d)&&(f=$p(e),aq(e,f),f=!/[^0-9]/.test(f));if(f)a:for(e=a,d=new ka(d),f=$p(e);;){var g;g=null==f;g||(g=(g=bq(f))?g:dq.a?dq.a(f):dq.call(null,f));if(t(g)){aq(e,f);d=e=d.toString();f=void 0;t(mq(iq,d))?(d=mq(iq,d),f=d[2],null!=
(G.b(f,"")?null:f)?f=0:(f=t(d[3])?[d[3],10]:t(d[4])?[d[4],16]:t(d[5])?[d[5],8]:t(d[6])?[d[7],parseInt(d[6],10)]:[null,null],g=f[0],null==g?f=null:(f=parseInt(g,f[1]),f="-"===d[1]?-f:f))):(f=void 0,t(mq(jq,d))?(d=mq(jq,d),f=parseInt(d[1],10)/parseInt(d[2],10)):f=t(mq(kq,d))?parseFloat(d):null);d=f;e=t(d)?d:fq(I(["Invalid number format [",e,"]"],0));break a}d.append(f);f=$p(e)}else e=Cq(a,d)}if(e!==a)return e}}}
var Lq=function(a,b){return function(c,d){return vc.b(t(d)?b:a,c)}}(new T(null,13,5,U,[null,31,28,31,30,31,30,31,31,30,31,30,31],null),new T(null,13,5,U,[null,31,29,31,30,31,30,31,31,30,31,30,31],null)),Mq=/(\d\d\d\d)(?:-(\d\d)(?:-(\d\d)(?:[T](\d\d)(?::(\d\d)(?::(\d\d)(?:[.](\d+))?)?)?)?)?)?(?:[Z]|([-+])(\d\d):(\d\d))?/;function Nq(a){a=parseInt(a,10);return La(isNaN(a))?a:null}
function Oq(a,b,c,d){a<=b&&b<=c||fq(I([[z(d),z(" Failed:  "),z(a),z("\x3c\x3d"),z(b),z("\x3c\x3d"),z(c)].join("")],0));return b}
function Pq(a){var b=yg(Mq,a);P(b,0);var c=P(b,1),d=P(b,2),e=P(b,3),f=P(b,4),g=P(b,5),k=P(b,6),m=P(b,7),p=P(b,8),u=P(b,9),v=P(b,10);if(La(b))return fq(I([[z("Unrecognized date/time syntax: "),z(a)].join("")],0));var w=Nq(c),x=function(){var a=Nq(d);return t(a)?a:1}();a=function(){var a=Nq(e);return t(a)?a:1}();var b=function(){var a=Nq(f);return t(a)?a:0}(),c=function(){var a=Nq(g);return t(a)?a:0}(),C=function(){var a=Nq(k);return t(a)?a:0}(),E=function(){var a;a:if(G.b(3,N(m)))a=m;else if(3<N(m))a=
m.substring(0,3);else for(a=new ka(m);;)if(3>a.pb.length)a=a.append("0");else{a=a.toString();break a}a=Nq(a);return t(a)?a:0}(),p=(G.b(p,"-")?-1:1)*(60*function(){var a=Nq(u);return t(a)?a:0}()+function(){var a=Nq(v);return t(a)?a:0}());return new T(null,8,5,U,[w,Oq(1,x,12,"timestamp month field must be in range 1..12"),Oq(1,a,function(){var a;a=0===Ld(w,4);t(a)&&(a=La(0===Ld(w,100)),a=t(a)?a:0===Ld(w,400));return Lq.b?Lq.b(x,a):Lq.call(null,x,a)}(),"timestamp day field must be in range 1..last day in month"),
Oq(0,b,23,"timestamp hour field must be in range 0..23"),Oq(0,c,59,"timestamp minute field must be in range 0..59"),Oq(0,C,G.b(c,59)?60:59,"timestamp second field must be in range 0..60"),Oq(0,E,999,"timestamp millisecond field must be in range 0..999"),p],null)}
var Qq,Rq=new q(null,4,["inst",function(a){var b;if("string"===typeof a)if(b=Pq(a),t(b)){a=P(b,0);var c=P(b,1),d=P(b,2),e=P(b,3),f=P(b,4),g=P(b,5),k=P(b,6);b=P(b,7);b=new Date(Date.UTC(a,c-1,d,e,f,g,k)-6E4*b)}else b=fq(I([[z("Unrecognized date/time syntax: "),z(a)].join("")],0));else b=fq(I(["Instance literal expects a string for its timestamp."],0));return b},"uuid",function(a){return"string"===typeof a?new ph(a,null):fq(I(["UUID literal expects a string as its representation."],0))},"queue",function(a){return vd(a)?
We(vf,a):fq(I(["Queue literal expects a vector for its elements."],0))},"js",function(a){if(vd(a)){var b=[];a=r(a);for(var c=null,d=0,e=0;;)if(e<d){var f=c.aa(null,e);b.push(f);e+=1}else if(a=r(a))c=a,yd(c)?(a=Xb(c),e=Yb(c),c=a,d=N(a),a=e):(a=K(c),b.push(a),a=L(c),c=null,d=0),e=0;else break;return b}if(ud(a)){b={};a=r(a);c=null;for(e=d=0;;)if(e<d){var g=c.aa(null,e),f=P(g,0),g=P(g,1);b[Td(f)]=g;e+=1}else if(a=r(a))yd(a)?(d=Xb(a),a=Yb(a),c=d,d=N(d)):(d=K(a),c=P(d,0),d=P(d,1),b[Td(c)]=d,a=L(a),c=null,
d=0),e=0;else break;return b}return fq(I([[z("JS literal expects a vector or map containing "),z("only string or unqualified keyword keys")].join("")],0))}],null);Qq=W.a?W.a(Rq):W.call(null,Rq);var Sq=W.a?W.a(null):W.call(null,null);
function uq(a,b){var c=Cq(a,b),d=vc.b(M.a?M.a(Qq):M.call(null,Qq),""+z(c)),e=M.a?M.a(Sq):M.call(null,Sq);return t(d)?(c=cq(a,!0,null),d.a?d.a(c):d.call(null,c)):t(e)?(d=cq(a,!0,null),e.b?e.b(c,d):e.call(null,c,d)):fq(I(["Could not find tag parser for ",""+z(c)," in ",Ce.i(I([Gf(M.a?M.a(Qq):M.call(null,Qq))],0))],0))};Sd.b(Kd,ne.i(new T(null,4,5,U,["_","-","?","!"],null),new vg(null,97,123,1,null),I([new vg(null,65,91,1,null),new vg(null,48,58,1,null)],0)));function Tq(a){a=Math.pow(2,8*a);var b;b=a*Qg.h();b=Math.floor(b);return Md(La(!0)?b:b-a/2)}function Uq(a,b,c,d){this.value=a;this.A=b;this.m=c;this.s=d;this.o=2229667594;this.F=8192}h=Uq.prototype;h.S=function(a,b){return ib.c(this,b,null)};h.K=function(a,b,c){switch(b instanceof y?b.Y:null){case "value":return this.value;default:return vc.c(this.m,b,c)}};
h.M=function(a,b,c){return kf(b,function(){return function(a){return kf(b,lf,""," ","",c,a)}}(this),"#seria.common.DiffedValue{",", ","}",c,ne.b(new T(null,1,5,U,[new T(null,2,5,U,[Ni,this.value],null)],null),this.m))};h.za=function(){return new zf(0,this,1,new T(null,1,5,U,[Ni],null),dc(this.m))};h.L=function(){return this.A};h.X=function(){return 1+N(this.m)};h.R=function(){var a=this.s;return null!=a?a:this.s=a=Wd(this)};
h.D=function(a,b){var c;c=t(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return t(c)?!0:!1};h.Ta=function(a,b){return Ed(new og(null,new q(null,1,[Ni,null],null),null),b)?md.b(Oc(We(V,this),this.A),b):new Uq(this.value,this.A,qe(md.b(this.m,b)),null)};h.Ha=function(a,b,c){return t(Q.b?Q.b(Ni,b):Q.call(null,Ni,b))?new Uq(c,this.A,this.m,null):new Uq(this.value,this.A,kd.c(this.m,b,c),null)};h.V=function(){return r(ne.b(new T(null,1,5,U,[new T(null,2,5,U,[Ni,this.value],null)],null),this.m))};
h.N=function(a,b){return new Uq(this.value,b,this.m,this.s)};h.W=function(a,b){return vd(b)?kb(this,bb.b(b,0),bb.b(b,1)):Ta.c(Za,this,b)};function Vq(a){return new Uq(a,null,null,null)}function Wq(a){if(!t(a instanceof Uq))throw Error([z("Assert failed: "),z(Ce.i(I([mc(sj,Nj)],0)))].join(""));return Ni.a(a)};var Xq=function Xq(b){if(null!=b&&null!=b.Gc)return b.Gc();var c=Xq[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Xq._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("Buffer.read-byte!",b);},Yq=function Yq(b){if(null!=b&&null!=b.Ic)return b.Ic();var c=Yq[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Yq._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("Buffer.read-int!",b);},Zq=function Zq(b){if(null!=b&&null!=b.Jc)return b.Jc();var c=Zq[l(null==b?
null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=Zq._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("Buffer.read-long!",b);},$q=function $q(b){if(null!=b&&null!=b.Hc)return b.Hc();var c=$q[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=$q._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("Buffer.read-float!",b);},ar=function ar(b){if(null!=b&&null!=b.Fc)return b.Fc();var c=ar[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=ar._;if(null!=c)return c.a?
c.a(b):c.call(null,b);throw Pa("Buffer.read-boolean!",b);},br=function br(b,c){if(null!=b&&null!=b.Lc)return b.Lc(0,c);var d=br[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=br._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("Buffer.write-byte!",b);},cr=function cr(b,c){if(null!=b&&null!=b.Nc)return b.Nc(0,c);var d=cr[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=cr._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("Buffer.write-int!",
b);},dr=function dr(b,c){if(null!=b&&null!=b.Oc)return b.Oc(0,c);var d=dr[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=dr._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("Buffer.write-long!",b);},er=function er(b,c){if(null!=b&&null!=b.Mc)return b.Mc(0,c);var d=er[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=er._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("Buffer.write-float!",b);},fr=function fr(b,c){if(null!=b&&null!=b.Kc)return b.Kc(0,
c);var d=fr[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);d=fr._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("Buffer.write-boolean!",b);},gr=function gr(b){if(null!=b&&null!=b.Ec)return b.Ec();var c=gr[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=gr._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("Buffer.little-endian?",b);},hr=function hr(b,c){if(null!=b&&null!=b.Dc)return b.Dc(0,c);var d=hr[l(null==b?null:b)];if(null!=d)return d.b?d.b(b,
c):d.call(null,b,c);d=hr._;if(null!=d)return d.b?d.b(b,c):d.call(null,b,c);throw Pa("Buffer.little-endian!",b);},ir=function ir(b){if(null!=b&&null!=b.Bc)return b.Bc();var c=ir[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=ir._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("Buffer.clear!",b);},jr=function jr(b){if(null!=b&&null!=b.Cc)return b.Cc();var c=jr[l(null==b?null:b)];if(null!=c)return c.a?c.a(b):c.call(null,b);c=jr._;if(null!=c)return c.a?c.a(b):c.call(null,b);throw Pa("Buffer.compress",
b);};h=ByteBuffer.prototype;h.Gc=function(){return this.readInt8()};h.Ic=function(){return this.readInt32()};h.Jc=function(){return this.readInt64().toNumber()};h.Hc=function(){return this.readFloat32()};h.Fc=function(){var a=this.bitIndex;0===Ld(a,8)&&(this.bitBuffer=this.readInt8());this.bitIndex=a+1;return 0!==(this.bitBuffer&1<<Ld(a,8))};h.Lc=function(a,b){return this.writeInt8(b)};h.Nc=function(a,b){return this.writeInt32(b|0)};h.Oc=function(a,b){return this.writeInt64(Md(b))};
h.Mc=function(a,b){return this.writeFloat32(b)};h.Kc=function(a,b){var c=this.bitIndex;if(0===Ld(c,8)){0<c&&this.writeInt8(this.bitBuffer,this.bitPosition);this.bitBuffer=0;var d=this.offset;this.bitPosition=d;this.offset=d+1}this.bitIndex=c+1;this.bitBuffer=t(b)?this.bitBuffer|1<<Ld(c,8):this.bitBuffer&~(1<<Ld(c,8));return this};h.Ec=function(){return this.littleEndian};h.Dc=function(a,b){return this.littleEndian=b};
h.Bc=function(){this.bitIndex=this.offset=0;this.bitPosition=-1;this.bitBuffer=0;return this};h.Cc=function(){var a=this.bitPosition;!G.b(a,-1)&&this.writeInt8(this.bitBuffer,a);return this.slice(0,this.offset).toArrayBuffer()};function kr(a,b){var c=0>b,d=c?-(b+1):b;fr(a,c);for(c=d;;){if(0===(c&-128))return br(a,c);br(a,Md(c)&127|128);c>>>=7}}
function lr(a){for(var b=ar(a),c=0,d=0;;)if(64>d){var e=Xq(a),c=c|(e&127)<<d;if(0===(e&128))return La(b)?c:-c-1;d+=7}else throw Error("Malformed varint!");}function mr(a,b,c,d){a=fr(kr(fr(fr(ir(a),gr(a)),d),b),c);return t(c)?kr(a,c):a}function nr(a){hr(a,ar(a));return new q(null,3,[ei,ar(a),gi,lr(a),Wj,t(ar(a))?lr(a):null],null)};var or=function(){var a=ir(ByteBuffer.allocate(1E4)),b=function(a){return function(b,c){var d=xi.a(c);kr(b,N(d));Rg(function(){return function(a){return E(b,a)}}(d,a),d);d=Sj.a(c);d=Yh.a(d);cr(b,d);return b}}(a),c=function(){return function(a){return t(ar(a))?Nl:new T(null,2,5,U,[t(ar(a))?Nl:$q(a),t(ar(a))?Nl:$q(a)],null)}}(a),d=function(){return function(a,b){return Vq(G.b(a,b)?Nl:b)}}(a),e=function(){return function(a,b){return Vq(G.b(a,b)?Nl:b)}}(a),f=function(){return function(a,b){var c=Wq(b);
return G.b(Nl,c)?a:c}}(a),g=function(a){return function(){return new q(null,2,[Pi,Tq(8),Jl,Re(2+Wg(4),function(){return function(){return va()}}(a))],null)}}(a),k=function(a){return function(b,c){var d=G.b(Nl,c);fr(b,d);if(!d){var e=xi.a(c),f=G.b(Nl,e);fr(b,f);f||(kr(b,N(e)),Rg(function(){return function(a){var c=G.b(Nl,a);fr(b,c);return c?null:D(b,a)}}(f,e,d,a),e));d=Sj.a(c);e=G.b(Nl,d);fr(b,e);e||(d=Yh.a(d),e=G.b(Nl,d),fr(b,e),e||cr(b,d))}return b}}(a),m=function(a){return function(b){return t(ar(b))?
Nl:new q(null,2,[xi,t(ar(b))?Nl:xg(Re(lr(b),function(){return function(){return t(ar(b))?Nl:c(b)}}(a))),Sj,t(ar(b))?Nl:new q(null,1,[Yh,t(ar(b))?Nl:Yq(b)],null)],null)}}(a),p=function(a){return function(b,c){var d=G.b(Nl,c);fr(b,d);if(!d){var e=Jl.a(c),f=G.b(Nl,e);fr(b,f);f||(kr(b,N(e)),Rg(function(){return function(a){var c=G.b(Nl,a);fr(b,c);return c?null:w(b,a)}}(f,e,d,a),e));d=Pi.a(c);e=G.b(Nl,d);fr(b,e);e||dr(b,d)}return b}}(a),u=function(){return function(a,b,c,d,e){c=Math.abs(e-c)<Math.abs(e-
d);return G.b(a,b)?a:c?a:b}}(a),v=function(a){return function(b){return new q(null,2,[Jl,xg(Re(lr(b),function(){return function(){return S(b)}}(a))),Pi,Zq(b)],null)}}(a),w=function(a){return function(b,c){var d=G.b(Nl,c);fr(b,d);if(!d){var e=wj.a(c),f=G.b(Nl,e);fr(b,f);f||er(b,e);var g=Sh.a(c),e=G.b(Nl,g);fr(b,e);e||kr(b,function(){switch(g instanceof y?g.Y:null){case "dynamic":return 0;case "static":return 1;case "kinetic":return 2;default:throw Error([z("No matching clause: "),z(g)].join(""));}}());
e=bk.a(c);f=G.b(Nl,e);fr(b,f);f||(kr(b,N(e)),Rg(function(){return function(a){var c=G.b(Nl,a);fr(b,c);return c?null:k(b,a)}}(f,e,d,a),e));d=Uk.a(c);e=G.b(Nl,d);fr(b,e);e||D(b,d);d=Sj.a(c);e=G.b(Nl,d);fr(b,e);e||(d=yk.a(d),e=G.b(Nl,d),fr(b,e),e||cr(b,d))}return b}}(a),x=function(){return function(a,b,c,d,e){c=Math.abs(e-c)<Math.abs(e-d);return G.b(a,b)?a:c?a:b}}(a),C=function(a){return function(b,c){var d=Jl.a(c);kr(b,N(d));Rg(function(){return function(a){return ha(b,a)}}(d,a),d);d=Pi.a(c);dr(b,d);
return b}}(a),E=function(){return function(a,b){var c=b.a?b.a(0):b.call(null,0);er(a,c);c=b.a?b.a(1):b.call(null,1);er(a,c);return a}}(a),D=function(){return function(a,b){var c=G.b(Nl,b);fr(a,c);if(!c){var c=b.a?b.a(0):b.call(null,0),d=G.b(Nl,c);fr(a,d);d||er(a,c);c=b.a?b.a(1):b.call(null,1);d=G.b(Nl,c);fr(a,d);d||er(a,c)}return a}}(a),H=function(){return function(a,b){return Vq(G.b(a,b)?Nl:b)}}(a),R=function(a){return function(b){return new q(null,2,[xi,xg(Re(lr(b),function(){return function(){return ja(b)}}(a))),
Sj,new q(null,1,[Yh,Yq(b)],null)],null)}}(a),S=function(a){return function(b){return new q(null,5,[wj,$q(b),Sh,vc.b(new T(null,3,5,U,[Yg,Zg,$g],null),lr(b)),bk,xg(Re(lr(b),function(){return function(){return R(b)}}(a))),Uk,ja(b),Sj,new q(null,1,[yk,Yq(b)],null)],null)}}(a),ya=function(a){return function(b){return t(ar(b))?Nl:new q(null,2,[Jl,t(ar(b))?Nl:xg(Re(lr(b),function(){return function(){return t(ar(b))?Nl:sa(b)}}(a))),Pi,t(ar(b))?Nl:Zq(b)],null)}}(a),ab=function(){return function(a,b){var c=
Wq(b);return G.b(Nl,c)?a:c}}(a),J=function(){return function(){return new T(null,2,5,U,[Qg.h(),Qg.h()],null)}}(a),va=function(a){return function(){return new q(null,5,[Sj,new q(null,1,[yk,Tq(4)],null),Uk,J(),wj,Qg.h(),Sh,Xg(),bk,Re(2+Wg(4),function(){return function(){return xa()}}(a))],null)}}(a),Z=function(){return function(a,b,c,d,e){c=Math.abs(e-c)<Math.abs(e-d);return G.b(a,b)?a:c?a:b}}(a),ca=function(){return function(a,b){var c=Wq(b);return G.b(Nl,c)?a:c}}(a),ga=function(){return function(a,
b){return Vq(G.b(a,b)?Nl:b)}}(a),ha=function(a){return function(c,d){var e=wj.a(d);er(c,e);var f=Sh.a(d);kr(c,function(){switch(f instanceof y?f.Y:null){case "dynamic":return 0;case "static":return 1;case "kinetic":return 2;default:throw Error([z("No matching clause: "),z(f)].join(""));}}());e=bk.a(d);kr(c,N(e));Rg(function(){return function(a){return b(c,a)}}(e,a),e);e=Uk.a(d);E(c,e);e=Sj.a(d);e=yk.a(e);cr(c,e);return c}}(a),ja=function(){return function(a){return new T(null,2,5,U,[$q(a),$q(a)],
null)}}(a),qa=function(){return function(a,b,c,d,e){c=Math.abs(e-c)<Math.abs(e-d);return G.b(a,b)?a:c?a:b}}(a),sa=function(a){return function(b){return t(ar(b))?Nl:new q(null,5,[wj,t(ar(b))?Nl:$q(b),Sh,t(ar(b))?Nl:vc.b(new T(null,3,5,U,[Yg,Zg,$g],null),lr(b)),bk,t(ar(b))?Nl:xg(Re(lr(b),function(){return function(){return t(ar(b))?Nl:m(b)}}(a))),Uk,t(ar(b))?Nl:c(b),Sj,t(ar(b))?Nl:new q(null,1,[yk,t(ar(b))?Nl:Yq(b)],null)],null)}}(a),xa=function(a){return function(){return new q(null,2,[Sj,new q(null,
1,[Yh,Tq(4)],null),xi,Re(2+Wg(4),function(){return function(){return J()}}(a))],null)}}(a),Da=function(){return function(a,b){var c=Wq(b);return G.b(Nl,c)?a:c}}(a);return ld([Tl,Zi,gm,ki,li,jk],[function(a){return function(){function c(d,e,f,g){var m=e instanceof Uq,u=t(m)?Wq(e):e;return jr(function(){var c=(t(m)?function(){switch(d instanceof y?d.Y:null){case "body":return w;case "fixture":return k;case "coord":return D;case "snapshot":return p;default:throw Error([z("No matching clause: "),z(d)].join(""));
}}():function(){switch(d instanceof y?d.Y:null){case "body":return ha;case "fixture":return b;case "coord":return E;case "snapshot":return C;default:throw Error([z("No matching clause: "),z(d)].join(""));}}()).call(null,mr(a,(new q(null,4,[Cl,0,Bh,1,dl,2,ak,3],null)).call(null,d),(new q(null,4,[Cl,0,Bh,1,dl,2,ak,3],null)).call(null,f),m),u);return t(f)?function(){switch(f instanceof y?f.Y:null){case "body":return ha;case "fixture":return b;case "coord":return E;case "snapshot":return C;default:throw Error([z("No matching clause: "),
z(f)].join(""));}}().call(null,c,g):c}())}function d(a,b){return e.u(a,b,null,null)}var e=null,e=function(a,b,e,f){switch(arguments.length){case 2:return d.call(this,a,b);case 4:return c.call(this,a,b,e,f)}throw Error("Invalid arity: "+arguments.length);};e.b=d;e.u=c;return e}()}(a),function(){return function(a){var b=ir(ByteBuffer.wrap(a));a=nr(b);var d=vc.b(new T(null,4,5,U,[Cl,Bh,dl,ak],null),gi.a(a)),e=Wj.a(a),f=vc.b(new T(null,4,5,U,[Cl,Bh,dl,ak],null),e),g=ei.a(a);if(t(function(){var a=La(d);
return a?a:t(e)?La(f):e}()))return Rh;a=new q(null,3,[zh,d,ei,g,Ni,function(){var a=(t(g)?function(){switch(d instanceof y?d.Y:null){case "body":return sa;case "fixture":return m;case "coord":return c;case "snapshot":return ya;default:throw Error([z("No matching clause: "),z(d)].join(""));}}():function(){switch(d instanceof y?d.Y:null){case "body":return S;case "fixture":return R;case "coord":return ja;case "snapshot":return v;default:throw Error([z("No matching clause: "),z(d)].join(""));}}()).call(null,
b);return t(g)?new Uq(a,null,null,null):a}()],null);return t(f)?kd.i(a,Rj,f,I([si,function(){switch(f instanceof y?f.Y:null){case "body":return S;case "fixture":return R;case "coord":return ja;case "snapshot":return v;default:throw Error([z("No matching clause: "),z(f)].join(""));}}().call(null,b)],0)):a}}(a),function(){return function(a,b,c){return function(){switch(a instanceof y?a.Y:null){case "body":return H;case "fixture":return ga;case "coord":return d;case "snapshot":return e;default:throw Error([z("No matching clause: "),
z(a)].join(""));}}().call(null,b,c)}}(a),function(){return function(a,b,c){return function(){switch(a instanceof y?a.Y:null){case "body":return ca;case "fixture":return f;case "coord":return Da;case "snapshot":return ab;default:throw Error([z("No matching clause: "),z(a)].join(""));}}().call(null,b,c)}}(a),function(){return function(a){return function(){switch(a instanceof y?a.Y:null){case "body":return va;case "fixture":return xa;case "coord":return J;case "snapshot":return g;default:throw Error([z("No matching clause: "),
z(a)].join(""));}}().call(null)}}(a),function(){return function(a,b,c,d,e,f){return function(){switch(a instanceof y?a.Y:null){case "body":return u;case "fixture":return x;case "coord":return Z;case "snapshot":return qa;default:throw Error([z("No matching clause: "),z(a)].join(""));}}().call(null,b,c,d,e,f)}}(a)])}();Tl.a(or);li.a(or);var pr=Zi.a(or);var qr=W.a?W.a(null):W.call(null,null),om=new q(null,5,[th,function(a){Ng(I(["Message received:"],0));Kn(Ni.a(function(){var b=a.data;return pr.a?pr.a(b):pr.call(null,b)}()));Ng(I([[z("Size: "),z(a.data.byteLength),z(" bytes")].join("")],0));return pm(M.a?M.a(qr):M.call(null,qr),a.data)},Rl,function(){return Ng(I(["Channel opened"],0))},jl,function(a){return Ng(I(["Channel error: ",a.data],0))},mi,function(){return Ng(I(["Channel closed"],0))},yh,"arraybuffer"],null);
window.addEventListener("load",function(){Ha();var a=nm();return De.b?De.b(qr,a):De.call(null,qr,a)});
})();
