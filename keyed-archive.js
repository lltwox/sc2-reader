var debug = require('debug')('sc2:ka');

function KeyedArchive(file) {
  this.map = {};
  this.read(file);
}

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
    let version = file.readUInt16();
    if (version != 1) throw new Error('Invalid keyed archive version');

    let numberOfItems = file.readUInt32();
    debug(
      'has header, version', version + ',', 'numberOfItems', numberOfItems
    );

    for (let i = 0; i < numberOfItems; i++) {
      let key = file.readVariantType(),
          value = file.readVariantType();

      this.map[key.getValue()] = value.getOnlySimpleValue();
    }

  } else {
    debug('no header');
    file.resetOffset();

    while (!file.isEof()) {
      let key = file.readVariantType(),
          value = file.readVariantType();

      this.map[key.getValue()] = value.getOnlySimpleValue();
    }
  }
};

module.exports = KeyedArchive;