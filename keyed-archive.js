const debug = require('debug')('sc2:ka');

function KeyedArchive(file) {
  this.map = {};
  this.read(file);
}

/**
 * Global storage of strings
 *
 * @type {Object}
 */
KeyedArchive.strings = {};

/**
 * Get string from global storage
 *
 * @param {Number} index
 * @return {String}
 */
KeyedArchive.getString = function(index) {
  if (KeyedArchive.strings[index] === undefined) throw new Error(
    'Missing string key', index
  );

  return KeyedArchive.strings[index];
};

/**
 * Get map, that was read from file
 *
 * @return {Object}
 */
KeyedArchive.prototype.get = function() {
  return this.map;
};

/**
 * Read archive from file
 *
 * @private
 */
KeyedArchive.prototype.read = function(file) {
  if (file.readString(2) == 'KA') {
    const version = file.readUInt16();

    if (version == 1) return this.readVersion1(file);
    if ((version & 0xff) == 2) return this.readVersion2(file, version);

    throw new Error('Unsupported version of keyed archive ' + version);
  } else {
    debug('no header');
    this.readRawArchive(file);
  }
};

KeyedArchive.prototype.readVersion1 = function(file) {
  const numberOfItems = file.readUInt32();
  debug(`Version 1, has header, items: ${numberOfItems}`);

  for (let i = 0; i < numberOfItems; i++) {
    const key = file.readVariantType(),
        value = file.readVariantType();

    this.map[key.getValue()] = value.getOnlySimpleValue();
  }
};

KeyedArchive.prototype.readVersion2 = function(file, version) {
  const flags = (version >> 8);
  version = version & 0xff;

  debug(`Version 2, flags ${flags.toString(2)}`);

  if (flags === 0xff) return; // empty archive

  if (flags === 0) { // reading strings data
    const count = file.readUInt32();
    const data = [];
    for (let i = 0; i < count; i++) {
      const length = file.readInt16();
      data.push(file.readString(length));
    }
    for (let i = 0; i < count; i++) {
      KeyedArchive.strings[file.readUInt32()] = data[i];
    }
  }

  const numberOfItems = file.readUInt32();
  for (let i = 0; i < numberOfItems; i++) {
    const key = KeyedArchive.getString(file.readUInt32());
    this.map[key] = file.readVariantType(version).getOnlySimpleValue();
  }
};

KeyedArchive.prototype.readRawArchive = function(file) {
  const offset = file.getOffset();
  try {
    file.resetOffset();
    while (!file.isEof()) {
      const key = file.readVariantType();
      const value = file.readVariantType();

      this.map[key.getValue()] = value.getOnlySimpleValue();
    }
  } catch (err) {
    file.setOffset(offset);
    throw err;
  }
};

module.exports = KeyedArchive;