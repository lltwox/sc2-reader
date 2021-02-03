var int64buffer = require('int64-buffer'),
    bigInteger = require('big-integer'),
    VariantType = require('./variant-type'),
    KeyedArchive = require('./keyed-archive');

/**
 * Wrapper for buffer reading
 *
 * @param {Buffer} file
 */
function ByteArray(buf) {
  this.offset = 0;
  this.buf = buf;
}

/**
 * Check if end of buffer was reached
 *
 * @return {Boolean}
 */
ByteArray.prototype.isEof = function() {
  return this.offset >= this.buf.length;
};

/**
 * Reset internal offset to begining
 *
 */
ByteArray.prototype.resetOffset = function() {
  this.offset = 0;
};

/**
 * Set specific offset
 *
 * @param {Number} offset
 */
ByteArray.prototype.setOffset = function(offset) {
  this.offset = offset;
};

/**
 * Shift offset in the file by a delta
 *
 * @param {Number} delta
 */
ByteArray.prototype.shiftOffset = function(delta) {
  this.offset += delta;
};

/**
 * Get current offset
 *
 * @return {Number}
 */
ByteArray.prototype.getOffset = function() {
  return this.offset;
};

/**
 * Get size of internal buffer
 *
 * @return {Number}
 */
ByteArray.prototype.getLength = function() {
  return this.buf.length;
};

ByteArray.prototype.readInt8 = function() {
  var value = this.buf.readInt8(this.offset);
  this.offset += 1;

  return value;
};

ByteArray.prototype.readUInt8 = function() {
  var value = this.buf.readUInt8(this.offset);
  this.offset += 1;

  return value;
};

ByteArray.prototype.readInt16 = function() {
  var value = this.buf.readInt16LE(this.offset);
  this.offset += 2;

  return value;
};

ByteArray.prototype.readUInt16 = function() {
  var value = this.buf.readUInt16LE(this.offset);
  this.offset += 2;

  return value;
};

ByteArray.prototype.readInt32 = function() {
  var value = this.buf.readInt32LE(this.offset);
  this.offset += 4;

  return value;
};

ByteArray.prototype.readUInt32 = function() {
  var value = this.buf.readUInt32LE(this.offset);
  this.offset += 4;

  return value;
};

ByteArray.prototype.readInt64 = function() {
  var int = new int64buffer.Int64LE(this.buf.slice(this.offset, this.offset + 9));
  this.offset += 8;

  return bigInteger(int.toString());
};

ByteArray.prototype.readUInt64 = function() {
  var int = new int64buffer.Uint64LE(this.buf.slice(this.offset, this.offset + 9));
  this.offset += 8;

  return bigInteger(int.toString());
};

ByteArray.prototype.readFloat = function() {
  var value = this.buf.readFloatLE(this.offset);
  this.offset += 4;

  return value;
};

ByteArray.prototype.readDouble = function() {
  var value = this.buf.readDoubleLE(this.offset);
  this.offset += 8;

  return value;
};

ByteArray.prototype.readChar = function() {
  return String.fromCharCode(this.readInt8());
};

ByteArray.prototype.readString = function(length) {
  if (!length || length < 0) return '';

  var str = [];
  for (var i = 0; i < length; i++) {
    str.push(this.readChar());
  }

  return str.join('');
};

ByteArray.prototype.readUTFString = function(length) {
  if (!length || length < 0) return '';

  length = length * 4;
  var str = this.buf.toString('utf8', this.offset, this.offset + length + 1);
  this.offset += length;

  return str;
};

ByteArray.prototype.readByteArray = function(length) {
  var buf = Buffer.alloc(length);
  this.buf.copy(buf, 0, this.offset, this.offset + length + 1);
  this.offset += length;

  return new ByteArray(buf);
};

ByteArray.prototype.readVariantType = function(version) {
  return new VariantType(this, version);
};

ByteArray.prototype.readKeyedArchive = function(byteArray) {
  if (byteArray) {
    return new KeyedArchive(byteArray);
  } else {
    return new KeyedArchive(this);
  }
};

ByteArray.prototype.debug = function() {
  let currentLine = Math.floor(this.offset / BYTES_IN_LINE);
  for (let i = DEBUG_LINES; i >= 0; i--) {
    this.printLine(currentLine - i);
  }
  this.printCurrentBytePointer();
  for (let i = 1; i <= DEBUG_LINES; i++) {
    this.printLine(currentLine + i);
  }
};

ByteArray.prototype.printLine = function(n) {
  if (n < 0) return;
  let line = '';

  let offset = n * BYTES_IN_LINE;
  if (offset >= this.buf.length) return;

  line += offset.toString(16).padStart(8, 0) + ':  ';

  for (let i = 0; i < BYTES_IN_LINE; i++) {
    if (offset + i < this.buf.length) {
      let value = this.buf.readUInt8(offset + i);
      line += value.toString(16).padStart(2, 0);
    } else {
      line += '  ';
    }

    if (i % 2) line += ' ';
  }

  line += ' :';

  for (let i = 0; i < BYTES_IN_LINE; i++) {
    if (offset + i < this.buf.length) {
      let value = this.buf.readUInt8(offset + i);
      let char = '.';
      if (value >= 33 && value < 127) char = String.fromCharCode(value);
      line += char;
    } else {
      line += ' ';
    }
  }

  console.log(line);
};

ByteArray.prototype.printCurrentBytePointer = function() {
  let byteN = this.offset % BYTES_IN_LINE;
  console.log(''.padStart(8 + 3 + byteN * 2 + Math.floor(byteN / 2)) + '^^');
};

const BYTES_IN_LINE = 24;
const DEBUG_LINES = 3;

module.exports = ByteArray;