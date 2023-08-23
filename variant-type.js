const KeyedArchive = require('./keyed-archive'),
  debug = require('debug')('sc2:vt2');

function VariantType(file, version) {
  this.value = null;
  this.version = version;

  this.read(file);
}

VariantType.TYPES = [
  'TYPE_NONE',           // 0x00
  'TYPE_BOOLEAN',        // 0x01
  'TYPE_INT32',          // 0x02
  'TYPE_FLOAT',          // 0x03
  'TYPE_STRING',         // 0x04
  'TYPE_WIDE_STRING',    // 0x05
  'TYPE_BYTE_ARRAY',     // 0x06
  'TYPE_UINT32',         // 0x07
  'TYPE_KEYED_ARCHIVE',  // 0x08
  'TYPE_INT64',          // 0x09
  'TYPE_UINT64',         // 0x0a
  'TYPE_VECTOR2',        // 0x0b
  'TYPE_VECTOR3',        // 0x0c
  'TYPE_VECTOR4',        // 0x0d
  'TYPE_MATRIX2',        // 0x0e
  'TYPE_MATRIX3',        // 0x0f
  'TYPE_MATRIX4',        // 0x10
  'TYPE_COLOR',          // 0x11
  'TYPE_FASTNAME',       // 0x12
  'TYPE_AABBOX3',        // 0x13
  'TYPE_FILEPATH',       // 0x14
  'TYPE_FLOAT64',        // 0x15
  'TYPE_INT8',           // 0x16
  'TYPE_UINT8',          // 0x17
  'TYPE_INT16',          // 0x18
  'TYPE_UINT16',         // 0x19
  'TYPE_??????',         // 0x1a
  'TYPE_ARRAY',          // 0x1b
  'TYPE_??????',         // 0x1c
  'TYPE_XXX'             // 0x1d
];

VariantType.SIMPLE_TYPES = [
  'TYPE_BOOLEAN',
  'TYPE_INT32',
  'TYPE_FLOAT',
  'TYPE_STRING',
  'TYPE_WIDE_STRING',
  'TYPE_UINT32',
  'TYPE_KEYED_ARCHIVE',
  'TYPE_VECTOR2',
  'TYPE_VECTOR3',
  'TYPE_VECTOR4',
  'TYPE_MATRIX2',
  'TYPE_MATRIX3',
  'TYPE_MATRIX4',
  'TYPE_COLOR',
  'TYPE_FASTNAME',
  'TYPE_AABBOX3',
  'TYPE_FILEPATH',
  'TYPE_FLOAT64',
  'TYPE_INT8',
  'TYPE_UINT8',
  'TYPE_INT16',
  'TYPE_UINT16',
  'TYPE_ARRAY',

];

VariantType.prototype.read = function (file) {
  const type = file.readInt8();
  const typeName = VariantType.TYPES[type];
  if (!typeName) throw new Error('Unknown variant type: ' + type);

  debug(
    `${(file.getOffset() - 1).toString(16).padStart(8, 0)}: `
    + `0x${type.toString(16).padStart(2, '0')} ${typeName} at`
  );

  switch (typeName) {
    case 'TYPE_BOOLEAN':
      this.value = Boolean(file.readInt8());
      break;
    case 'TYPE_INT8':
      this.value = file.readInt8();
      break;
    case 'TYPE_UINT8':
      this.value = file.readUInt8();
      break;
    case 'TYPE_INT16':
      this.value = file.readInt16();
      break;
    case 'TYPE_UINT16':
      this.value = file.readUInt16();
      break;
    case 'TYPE_INT32':
      this.value = file.readInt32();
      break;
    case 'TYPE_UINT32':
      this.value = file.readUInt32();
      break;
    case 'TYPE_FLOAT':
      this.value = file.readFloat();
      break;
    case 'TYPE_FLOAT64':
      this.value = file.readDouble();
      break;
    case 'TYPE_STRING':
      if (this.version == 2) {
        this.value = KeyedArchive.getString(file.readUInt32());
      } else {
        let length = file.readInt32();
        this.value = file.readString(length);
      }
      break;
    case 'TYPE_WIDE_STRING': {
      let length = file.readInt32();
      this.value = file.readUTFString(length);
      break;
    }
    case 'TYPE_BYTE_ARRAY': {
      let length = file.readInt32();
      this.value = file.readByteArray(length);
      break;
    }
    case 'TYPE_KEYED_ARCHIVE':
      if (this.version == 2) {
        const prefix = file.readByteArray(4);
        const archive = file.readKeyedArchive();
        archive.prefix = prefix;
        this.value = archive.get();
      } else {
        let length = file.readInt32();
        this.value = file.readKeyedArchive(file.readByteArray(length)).get();
      }
      break;
    case 'TYPE_INT64':
      this.value = file.readInt64();
      break;
    case 'TYPE_UINT64':
      this.value = file.readUInt64();
      break;
    case 'TYPE_VECTOR2':
      this.value = [file.readFloat(), file.readFloat()];
      break;
    case 'TYPE_VECTOR3':
      this.value = [file.readFloat(), file.readFloat(), file.readFloat()];
      break;
    case 'TYPE_VECTOR4':
      this.value = [
        file.readFloat(),
        file.readFloat(),
        file.readFloat(),
        file.readFloat()
      ];
      break;
    case 'TYPE_MATRIX2':
      this.value = [
        [file.readFloat(), file.readFloat()],
        [file.readFloat(), file.readFloat()]
      ];
      break;
    case 'TYPE_MATRIX3':
      this.value = [
        [file.readFloat(), file.readFloat(), file.readFloat()],
        [file.readFloat(), file.readFloat(), file.readFloat()],
        [file.readFloat(), file.readFloat(), file.readFloat()]
      ];
      break;
    case 'TYPE_MATRIX4':
      this.value = [
        [file.readFloat(), file.readFloat(), file.readFloat(), file.readFloat()],
        [file.readFloat(), file.readFloat(), file.readFloat(), file.readFloat()],
        [file.readFloat(), file.readFloat(), file.readFloat(), file.readFloat()],
        [file.readFloat(), file.readFloat(), file.readFloat(), file.readFloat()]
      ];
      break;
    case 'TYPE_COLOR':
      this.value = [
        file.readFloat(), // r
        file.readFloat(), // g
        file.readFloat(), // b
        file.readFloat()  // a
      ];
      break;
    case 'TYPE_FASTNAME':
      if (this.version == 2) {
        this.value = KeyedArchive.getString(file.readUInt32());
      } else {
        const length = file.readInt32();
        this.value = file.readString(length);
      }
      break;
    case 'TYPE_AABBOX3':
      this.value = [
        [file.readFloat(), file.readFloat(), file.readFloat()],
        [file.readFloat(), file.readFloat(), file.readFloat()]
      ];
      break;
    case 'TYPE_FILEPATH': {
      const length = file.readInt32();
      this.value = file.readString(length);
      break;
    }
    case 'TYPE_ARRAY': {
      const length = file.readInt32();
      this.value = [];
      for (let i = 0; i < length; i++) {
        this.value.push(file.readVariantType(this.version).getOnlySimpleValue());
      }
      break;
    }
    case 'TYPE_XXX': {
      this.value = []
      for (let i = 0; i < 10; i++) {
        this.value.push(file.readInt32());
      }
      break;
    }
    default:
      throw new Error('Unsuppored type:' + typeName);
  }

  this.type = typeName;
};

VariantType.prototype.get = function () {
  return [this.type, this.value];
};

VariantType.prototype.getType = function () {
  return this.type;
};

VariantType.prototype.getValue = function () {
  return this.value;
};

VariantType.prototype.toString = function () {
  if (this.type == 'TYPE_KEYED_ARCHIVE') {
    return this.value;
  }

  if (VariantType.SIMPLE_TYPES.includes(this.type)) {
    return this.value.toString();
  }

  if (this.type == 'TYPE_BYTE_ARRAY') {
    return this.value.buf.toString('hex');
  }

  return this;
};

VariantType.prototype.getOnlySimpleValue = function () {
  if (VariantType.SIMPLE_TYPES.indexOf(this.type) >= 0) {
    return this.value;
  } else {
    return this;
  }
};

module.exports = VariantType;
