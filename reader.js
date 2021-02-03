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
  file.load();

  try {
    return parseScene(file);
  } catch (err) {
    if (!file.isEof()) file.debug();
    throw err;
  }
};

/**
 * Async version of read()
 *
 * @param {String} scenePath
 * @return {Object}
 */
module.exports.readAsync = async function(scenePath) {
  let file = new File(scenePath);
  await file.loadAsync();

  return parseScene(file);
};

/**
 * Parse scene file
 *
 * @param {File} file
 * @return {Object}
 */
function parseScene(file) {
  let scene = {};
  scene.name = path.basename(file.path);
  scene.header = readHeader(file, scene);

  if (scene.header.signature == 'SCPG') {
    scene.nodes = readNodes(file, scene);
  } else {
    scene.versionTags = readVersionTags(file, scene);
    scene.descriptor = readDescriptor(file, scene);

    if (scene.header.version == 25) {
      scene.nodes = readNodes(file, scene);
      scene.globalMaterial = readGlobalMaterial(file, scene);
      scene.entities = readEntities(file, scene);
    } else if (scene.header.version == 26 || scene.header.version == 27) {
      scene.nodes = readNodes(file, scene);

      scene.unknown = file.readByteArray(8);
      let polygonScene = module.exports.read(
        file.path.replace(/\.sc2$/, '.scg')
      );
      scene.nodes = scene.nodes.concat(polygonScene.nodes);
      scene.nodes.sort((a, b) => a.id - b.id);

      scene.entities = readEntities(file, scene);
    } else if (scene.header.version == 28) {
      scene.nodes = readNodes(file, scene);

      scene.unknown = file.readByteArray(8);
      scene.unknownArchive = file.readKeyedArchive().get();
      let polygonScene = module.exports.read(
        file.path.replace(/\.sc2$/, '.scg')
      );
      scene.nodes = scene.nodes.concat(polygonScene.nodes);
      scene.nodes.sort((a, b) => a.id - b.id);

      scene.entities = readEntities(file, scene);
    } else  if (scene.header.version == 30) {
      const data = file.readKeyedArchive().get();
      scene.nodes = data['#dataNodes'].map(archive => {
        let Node = Objects.get(archive['##name']);
        return new Node(archive);
      });
      scene.entities = parseEntitiesHierarchy(data['#hierarchy']);
      let polygonScene = module.exports.read(
        file.path.replace(/\.sc2$/, '.scg')
      );
      scene.nodes = scene.nodes.concat(polygonScene.nodes);
      scene.nodes.sort((a, b) => a.id - b.id);
    } else {
      throw new Error('Unsupported scene version:', scene.header.version);
    }

    debug('Bytes read:', file.offset, 'Total bytes:', file.buf.length);
  }

  return scene;
}

/**
 * Read header tag
 *
 * @param {File} file
 * @return {Object}
 */
function readHeader(file) {
  let signature = file.readString(4);
  if (signature != 'SFV2' && signature != 'SCPG') { // signature
    throw new Error('Invalid header file in ' + file.path);
  }

  return {
    signature: signature,
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

/**
 * Parse hierarchy of entities of header 30+ file format
 *
 * @param {Object} hierarchy
 * @return {Array}
 */
function parseEntitiesHierarchy(hierarchy) {
  return hierarchy.map(archive => {
    let name = archive['##name'];
    if (name != 'Entity') throw new Error('Unsupported hierarchy:', name);

    let Entity = Objects.get(archive['##name']);
    let entity = new Entity(archive);

    if (archive['#hierarchy']) {
      entity.children = parseEntitiesHierarchy(archive['#hierarchy']);
    }

    return entity;
  });
}