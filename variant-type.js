function VariantType(file) {
  this.value = null;
  this.read(file);
}

VariantType.TYPES = [
  'TYPE_NONE',
  'TYPE_BOOLEAN',
  'TYPE_INT32',
  'TYPE_FLOAT',
  'TYPE_STRING',
  'TYPE_WIDE_STRING',
  'TYPE_BYTE_ARRAY',
  'TYPE_UINT32',
  'TYPE_KEYED_ARCHIVE',
  'TYPE_INT64',
  'TYPE_UINT64',
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
  'TYPES_COUNT' // every new type should be always added to the end for compatibility with old archives
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
  'TYPE_UINT16'
];

VariantType.prototype.read = function(file) {
  let type = file.readInt8();
  let typeName = VariantType.TYPES[type];
  if (!typeName) throw new Error('Unknown variant type: ' + type);

  if (typeName == 'TYPE_BOOLEAN') {
    this.value = Boolean(file.readInt8());
  } else if (typeName == 'TYPE_INT8') {
    this.value = file.readInt8();
  } else if (typeName == 'TYPE_UINT8') {
    this.value = file.readUInt8();
  } else if (typeName == 'TYPE_INT16') {
    this.value = file.readInt16();
  } else if (typeName == 'TYPE_UINT16') {
    this.value = file.readUInt16();
  } else if (typeName == 'TYPE_INT32') {
    this.value = file.readInt32();
  } else if (typeName == 'TYPE_UINT32') {
    this.value = file.readUInt32();
  } else if (typeName == 'TYPE_FLOAT') {
    this.value = file.readFloat();
  } else if (typeName == 'TYPE_FLOAT64') {
    this.value = file.readDouble();
  } else if (typeName == 'TYPE_STRING') {
    let length = file.readInt32();
    this.value = file.readString(length);
  } else if (typeName == 'TYPE_WIDE_STRING') {
    let length = file.readInt32();
    this.value = file.readUTFString(length);
  } else if (typeName == 'TYPE_BYTE_ARRAY') {
    let length = file.readInt32();
    this.value = file.readByteArray(length);
  } else if (typeName == 'TYPE_KEYED_ARCHIVE') {
    let length = file.readInt32();
    this.value = file.readKeyedArchive(file.readByteArray(length)).get();
  } else if (typeName == 'TYPE_INT64') {
    this.value = file.readInt64();
  } else if (typeName == 'TYPE_UINT64') {
    this.value = file.readUInt64();
  } else if (typeName == 'TYPE_VECTOR2') {
    this.value = [file.readFloat(), file.readFloat()];
  } else if (typeName == 'TYPE_VECTOR3') {
    this.value = [file.readFloat(), file.readFloat(), file.readFloat()];
  } else if (typeName == 'TYPE_VECTOR4') {
    this.value = [
      file.readFloat(),
      file.readFloat(),
      file.readFloat(),
      file.readFloat()
    ];
  } else if (typeName == 'TYPE_MATRIX2') {
    this.value = [
      [file.readFloat(), file.readFloat()],
      [file.readFloat(), file.readFloat()]
    ];
  } else if (typeName == 'TYPE_MATRIX3') {
    this.value = [
      [file.readFloat(), file.readFloat(), file.readFloat()],
      [file.readFloat(), file.readFloat(), file.readFloat()],
      [file.readFloat(), file.readFloat(), file.readFloat()]
    ];
  } else if (typeName == 'TYPE_MATRIX4') {
    this.value = [
      [file.readFloat(), file.readFloat(), file.readFloat(), file.readFloat()],
      [file.readFloat(), file.readFloat(), file.readFloat(), file.readFloat()],
      [file.readFloat(), file.readFloat(), file.readFloat(), file.readFloat()],
      [file.readFloat(), file.readFloat(), file.readFloat(), file.readFloat()]
    ];
  } else if (typeName == 'TYPE_COLOR') {
    this.value = [
      file.readFloat(), // r
      file.readFloat(), // g
      file.readFloat(), // b
      file.readFloat()  // a
    ];
  } else if (typeName == 'TYPE_FASTNAME') {
    let length = file.readInt32();
    this.value = file.readString(length);
  } else if (typeName == 'TYPE_AABBOX3') {
    this.value = [
      [file.readFloat(), file.readFloat(), file.readFloat()],
      [file.readFloat(), file.readFloat(), file.readFloat()]
    ];
  } else if (typeName == 'TYPE_FILEPATH') {
    let length = file.readInt32();
    this.value = file.readString(length);
  }

  this.type = typeName;
};

VariantType.prototype.get = function() {
  return [this.type, this.value];
};

VariantType.prototype.getType = function() {
  return this.type;
};

VariantType.prototype.getValue = function() {
  return this.value;
};

VariantType.prototype.getOnlySimpleValue = function() {
  if (VariantType.SIMPLE_TYPES.indexOf(this.type) >= 0) {
    return this.value;
  } else {
    return this;
  }
};

module.exports = VariantType;