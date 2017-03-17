var fs = require('fs'),
    util = require('util'),

    ByteArray = require('./byte-array');

/**
 * Wrapper for binary file reading
 *
 * @param {String|Buffer} file
 */
function File(path) {
  this.offset = 0;
  this.path = path;
  this.load();
}
util.inherits(File, ByteArray);

/**
 * Read file from disk
 *
 * @private
 */
File.prototype.load = function() {
  try {
    this.buf = fs.readFileSync(this.path);
  } catch (err) {
   throw new Error('Failed to read the file: ' + err.message);
  }
};

module.exports = File;