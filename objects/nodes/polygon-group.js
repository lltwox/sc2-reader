var util = require('util'),
    DataNode = require('./data-node');

function PolygonGroup(archive) {
  DataNode.call(this, archive);
}
util.inherits(PolygonGroup, DataNode);

PolygonGroup.EVF = {
  VERTEX: 1,
  NORMAL: 1 << 1,
  COLOR: 1 << 2,
  TEXCOORD0: 1 << 3,
  TEXCOORD1: 1 << 4,
  TEXCOORD2: 1 << 5,
  TEXCOORD3: 1 << 6,
  TANGENT: 1 << 7,
  BINORMAL: 1 << 8,
  // nineth bit skipped cause legacy, for now it unused
  TIME: 1 << 10,
  PIVOT: 1 << 11,
  FLEXIBILITY: 1 << 12,
  ANGLE_SIN_COS: 1 << 13,
  JOINTINDEX: 1 << 14,
  JOINTWEIGHT: 1 << 15,
  CUBETEXCOORD0: 1 << 16,
  CUBETEXCOORD1: 1 << 17,
  CUBETEXCOORD2: 1 << 18,
  CUBETEXCOORD3: 1 << 19,
  FORCE_DWORD: 0x7fffffff,
};
PolygonGroup.EVF.LOWER_BIT = PolygonGroup.EVF.VERTEX;
PolygonGroup.EVF.HIGHER_BIT = PolygonGroup.EVF.JOINTWEIGHT;
PolygonGroup.EVF.NEXT_AFTER_HIGHER_BIT = (PolygonGroup.EVF.HIGHER_BIT << 1);

PolygonGroup.PRIMITIVE_TYPES = {
  1: 'PRIMITIVE_TRIANGLELIST',
  2: 'PRIMITIVE_TRIANGLESTRIP',
  10: 'PRIMITIVE_LINELIST'
};

PolygonGroup.PACKING_TYPES = [
  'PACKING_NONE',
  'PACKING_DEFAULT'
];

PolygonGroup.eIndexFormat = {
  EIF_16: 0x0,
  EIF_32: 0x1
};

PolygonGroup.INDEX_FORMAT_SIZE = [2, 4];

PolygonGroup.prototype.load = function(archive) {
  this.vertexFormat = archive.vertexFormat;
  this.vertexStride = this.getVertexSize(this.vertexFormat);
  this.vertexCount = archive.vertexCount;
  this.indexCount = archive.indexCount;
  this.textureCoordCount = archive.textureCoordCount;

  this.primitiveType = archive.rhi_primitiveType || 'PRIMITIVE_TRIANGLELIST';
  this.cubeTextureCoordCount = archive.cubeTextureCoordCount;

  let formatPacking = archive.packing;
  if (PolygonGroup.PACKING_TYPES[formatPacking] == 'PACKING_NONE') {
    let size = archive.vertices.getValue().getLength();
    if (size != this.vertexCount * this.vertexStride) {
      throw new Error('Counted vertex size incorrect');
    }
    this.meshData = archive.vertices.getValue();
  }

  this.indexFormat = archive.indexFormat;
  if (this.indexFormat == PolygonGroup.eIndexFormat.EIF_16) {
    let size = archive.indices.getValue().getLength();
    if (size != this.indexCount * PolygonGroup.INDEX_FORMAT_SIZE[this.indexFormat]) {
      throw new Error('Counted index size incorrect');
    }
    let archiveData = archive.indices.getValue();
    this.indexArray = new Array(this.indexCount).fill(null).map(() => {
      return archiveData.readInt16();
    });
  }

  this.parseMeshData();

  // BuildBuffers();
};

/**
 * @private
 */
PolygonGroup.prototype.parseMeshData = function() {
  this.vertices = [];

  while (!this.meshData.isEof()) {
    let vertex = {};
    if (this.vertexFormat & PolygonGroup.EVF.VERTEX) {
      vertex.position = [
        this.meshData.readFloat(),
        this.meshData.readFloat(),
        this.meshData.readFloat()
      ];
    }
    if (this.vertexFormat & PolygonGroup.EVF.NORMAL) {
      vertex.normal = [
        this.meshData.readFloat(),
        this.meshData.readFloat(),
        this.meshData.readFloat()
      ];
    }
    if (this.vertexFormat & PolygonGroup.EVF.COLOR) {
      var offset = this.meshData.getOffset();
      vertex.colorBuffer = [
        this.meshData.readUInt16(),
        this.meshData.readUInt16()
      ];
      this.meshData.setOffset(offset);

      vertex.color = [
        this.meshData.readUInt8(),
        this.meshData.readUInt8(),
        this.meshData.readUInt8(),
        this.meshData.readUInt8()
      ];
    }
    if (this.vertexFormat & PolygonGroup.EVF.TEXCOORD0) {
      vertex.textureCoord = vertex.textureCoord || [];
      vertex.textureCoord[0] = [
        this.meshData.readFloat(),
        this.meshData.readFloat()
      ];
    }
    if (this.vertexFormat & PolygonGroup.EVF.TEXCOORD1) {
      vertex.textureCoord = vertex.textureCoord || [];
      vertex.textureCoord[1] = [
        this.meshData.readFloat(),
        this.meshData.readFloat()
      ];
    }
    if (this.vertexFormat & PolygonGroup.EVF.TEXCOORD2) {
      vertex.textureCoord = vertex.textureCoord || [];
      vertex.textureCoord[2] = [
        this.meshData.readFloat(),
        this.meshData.readFloat()
      ];
    }
    if (this.vertexFormat & PolygonGroup.EVF.TEXCOORD3) {
      vertex.textureCoord = vertex.textureCoord || [];
      vertex.textureCoord[3] = [
        this.meshData.readFloat(),
        this.meshData.readFloat()
      ];
    }
    if (this.vertexFormat & PolygonGroup.EVF.TANGENT) {
      vertex.tangent = [
        this.meshData.readFloat(),
        this.meshData.readFloat(),
        this.meshData.readFloat()
      ];
    }
    if (this.vertexFormat & PolygonGroup.EVF.BINORMAL) {
      vertex.binormal = [
        this.meshData.readFloat(),
        this.meshData.readFloat(),
        this.meshData.readFloat()
      ];
    }
    if (this.vertexFormat & PolygonGroup.EVF.JOINTINDEX) {
      vertex.jointIdx = this.meshData.readFloat();
    }
    if (this.vertexFormat & PolygonGroup.EVF.JOINTWEIGHT) {
      vertex.jointWeight = this.meshData.readFloat();
    }
    if (this.vertexFormat & PolygonGroup.EVF.CUBETEXCOORD0) {
      vertex.cubeTextureCoord = vertex.cubeTextureCoord || [];
      vertex.cubeTextureCoord[0] = [
        this.meshData.readFloat(),
        this.meshData.readFloat(),
        this.meshData.readFloat()
      ];
    }
    if (this.vertexFormat & PolygonGroup.EVF.CUBETEXCOORD1) {
      vertex.cubeTextureCoord[1] = [
        this.meshData.readFloat(),
        this.meshData.readFloat(),
        this.meshData.readFloat()
      ];
    }
    if (this.vertexFormat & PolygonGroup.EVF.CUBETEXCOORD2) {
      vertex.cubeTextureCoord[2] = [
        this.meshData.readFloat(),
        this.meshData.readFloat(),
        this.meshData.readFloat()
      ];
    }
    if (this.vertexFormat & PolygonGroup.EVF.CUBETEXCOORD3) {
      vertex.cubeTextureCoord[3] = [
        this.meshData.readFloat(),
        this.meshData.readFloat(),
        this.meshData.readFloat()
      ];
    }
    if (this.vertexFormat & PolygonGroup.EVF.PIVOT) {
      vertex.pivot = [
        this.meshData.readFloat(),
        this.meshData.readFloat(),
        this.meshData.readFloat()
      ];
    }
    if (this.vertexFormat & PolygonGroup.EVF.FLEXIBILITY) {
      vertex.flex = this.meshData.readFloat();
    }
    if (this.vertexFormat & PolygonGroup.EVF.ANGLE_SIN_COS) {
      vertex.angle = [
        this.meshData.readFloat(),
        this.meshData.readFloat()
      ];
    }

    this.vertices.push(vertex);
  }


  delete this.meshData;
};

/**
 * @private
 */
PolygonGroup.prototype.getVertexSize = function(flags) {
  let size = 0;
  if (flags & PolygonGroup.EVF.VERTEX) size += 3 * 4;
  if (flags & PolygonGroup.EVF.NORMAL) size += 3 * 4;
  if (flags & PolygonGroup.EVF.COLOR) size += 4;
  if (flags & PolygonGroup.EVF.TEXCOORD0) size += 2 * 4;
  if (flags & PolygonGroup.EVF.TEXCOORD1) size += 2 * 4;
  if (flags & PolygonGroup.EVF.TEXCOORD2) size += 2 * 4;
  if (flags & PolygonGroup.EVF.TEXCOORD3) size += 2 * 4;
  if (flags & PolygonGroup.EVF.TANGENT) size += 3 * 4;
  if (flags & PolygonGroup.EVF.BINORMAL) size += 3 * 4;

  if (flags & PolygonGroup.EVF.CUBETEXCOORD0) size += 3 * 4;
  if (flags & PolygonGroup.EVF.CUBETEXCOORD1) size += 3 * 4;
  if (flags & PolygonGroup.EVF.CUBETEXCOORD2) size += 3 * 4;
  if (flags & PolygonGroup.EVF.CUBETEXCOORD3) size += 3 * 4;

  if (flags & PolygonGroup.EVF.TIME) size += 4;

  if (flags & PolygonGroup.EVF.PIVOT) size += 3 * 4;
  if (flags & PolygonGroup.EVF.FLEXIBILITY) size += 4;
  if (flags & PolygonGroup.EVF.ANGLE_SIN_COS) size += 2 * 4;

  if (flags & PolygonGroup.EVF.JOINTINDEX) size += 1 * 4;
  if (flags & PolygonGroup.EVF.JOINTWEIGHT) size += 1 * 4;

  return size;
};

module.exports = PolygonGroup;