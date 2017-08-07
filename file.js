var fs = require('fs'),
    util = require('util'),

    ByteArray = require('./byte-array');

fs.readFileAsync = util.promisify(fs.readFile);

/**
 * Wrapper for binary file reading
 *
 * @param {String|Buffer} file
 */
function File(path) {
  this.offset = 0;
  this.path = path;
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

/**
 * Async version of load()
 *
 * @private
 */
File.prototype.loadAsync = async function() {
  try {
    this.buf = await fs.readFileAsync(this.path);
  } catch (err) {
    let newErr = new Error('Failed to read the file: ' + err.message);
    if (err.code) newErr.code = err.code;
    throw newErr;
  }
};

module.exports = File;