var fs = require('fs'),
    int64buffer = require('int64-buffer'),
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

ByteArray.prototype.readVariantType = function() {
  return new VariantType(this);
};

ByteArray.prototype.readKeyedArchive = function(byteArray) {
  if (byteArray) {
    return new KeyedArchive(byteArray);
  } else {
    return new KeyedArchive(this);
  }
};

module.exports = ByteArray;