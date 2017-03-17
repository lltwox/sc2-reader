var path = require('path'),
    debug = require('debug')('sc2'),

    File = require('./file'),
    Objects = require('./objects');

/**
 * Read given .sc2 file and return json representation of all it's data
 *
 * @param {String} scenePath
 * @return {Object}
 */
module.exports.read = function(scenePath) {
  let file = new File(scenePath);
  let scene = {};

  scene.name = path.basename(scenePath);
  scene.header = readHeader(file, scene);
  scene.versionTags = readVersionTags(file, scene);
  scene.descriptor = readDescriptor(file, scene);
  scene.nodes = readNodes(file, scene);
  scene.globalMaterial = readGlobalMaterial(file, scene);
  scene.entities = readEntities(file, scene);

  debug('Bytes read:', file.offset, 'Total bytes:', file.buf.length);

  return scene;
};

/**
 * Read header tag
 *
 * @param {File} file
 * @return {Object}
 */
function readHeader(file) {
  if (file.readString(4) != 'SFV2') { // signature
    throw new Error('Invalid header file in ' + file.path);
  }

  return {
    version: file.readInt32(),
    nodeCount: file.readInt32()
  };
}

/**
 * Read file version
 *
 * @param {File} file
 * @return {Object}
 */
function readVersionTags(file) {
  try {
    return file.readKeyedArchive().get();
  } catch (err) {
    err.message = 'Failed to load version tags: ' + err.message;
    throw err;
  }
}

/**
 * Read file descriptor
 *
 * @param {File} file
 * @return {Object}
 */
function readDescriptor(file) {
  let size = file.readUInt32();
  let fileType = file.readUInt32();

  if (size > 4 /* size of uint32 */) file.shiftOffset(size - 4);

  return {
    size: size,
    fileType: fileType,
    fileTypeName: ['SceneFile', 'ModelFile'][fileType]
  };
}

/**
 * Read polygon nodes
 *
 * @param {File} file
 * @return {Array}
 */
function readNodes(file) {
  let nodeCount = file.readInt32();

  let nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push(readNode(file));
  }

  return nodes;
}

/**
 * Read one node from file
 *
 * @param {File} file
 * @return {Node}
 */
function readNode(file) {
  let archive = file.readKeyedArchive().get();
  let Node = Objects.get(archive['##name']);
  return new Node(archive);
}

/**
 * Read global material id, if present
 *
 * @param {File} file
 * @param {Object} scene
 * @return {Number}
 */
function readGlobalMaterial(file, scene) {
  if (scene.header.nodeCount <= 0) return;

  let offset = file.getOffset();

  let archive = file.readKeyedArchive().get();
  if (archive['##name'] != 'GlobalMaterial') {
    file.setOffset(offset);
    return;
  }

  scene.header.nodeCount--;
  return archive.globalMaterialId.getValue().toJSNumber();
}

/**
 * Read entities from file
 *
 * @param {File} file
 * @param {Object} scene
 * @return {Array}
 */
function readEntities(file, scene) {
  var entities = [];

  for (let i = 0; i < scene.header.nodeCount; i++) {
    entities.push(readEntity(file, scene));
  }

  return entities;
}

/**
 * Read one entity and all it's children from file
 *
 * @param {File} file
 * @param {Object} scene
 * @param {Entity} parent
 * @return {Entity}
 */
function readEntity(file, scene, parent) {
  let archive = file.readKeyedArchive().get();
  let name = archive['##name'];

  if (name != 'Entity') throw new Error('Unsupported hierarchy:', name);
  let Entity = Objects.get(archive['##name']);
  let entity = new Entity(archive);

  if (parent) {
    parent.children = parent.children || [];
    parent.children.push(entity);
  }

  let childrenCount = archive['#childrenCount'];
  for (let i = 0; i < childrenCount; i++) {
    readEntity(file, scene, entity);
  }

  return entity;
}
