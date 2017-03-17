var path = require('path'),
    fs = require('fs'),
    xml2json = require('xml2json'),
    _ = require('lodash'),
    xpath = require('xpath'),
    dom = require('xmldom').DOMParser,

    read = require('./reader').read;

/**
 * Build displayable model from scene file and xml defs
 *
 * @param {String} scenePath
 * @param {String} defsPath
 * @return {Object}
 */
module.exports.build = function(scenePath, defsPath) {
  let scene = read(scenePath),
      defs = loadDefs(defsPath);

  return buildThreeModel(scene, defs);
};

/**
 * Load defintions from xml file
 *
 * @param {String} defsPath
 * @return {Object}
 */
function loadDefs(defsPath) {
  let xml = fs.readFileSync(defsPath, 'utf8');

  let nodes = xpath.select('.//blitz', new dom().parseFromString(xml));
  return _.keyBy(nodes.map(function(node) {
    return xml2json.toJson(node.toString(), {object: true}).blitz;
  }), 'blitzPartName');
}

/**
 * Build model from scene data and defs
 *
 * @param {Object} scene
 * @param {Object} defs
 * @return {Object}
 */
function buildThreeModel(scene, defs) {
  if (!scene.entities) throw new Error('No entities on the scene');

  let model = {};
  let nodes = _.keyBy(scene.nodes, 'id');

  let entitiesList = scene.entities;
  while (entitiesList.length) {
    let entity = entitiesList.shift();
    if (entity.children) {
      entitiesList.push.apply(entitiesList, entity.children);
    }

    var polygonIds = _.flatten(entity.components
    .filter(component => {
      return component.className == 'RenderComponent' &&
        component.renderObject && component.renderObject.batches &&
        component.renderObject.batches.length;
    })
    .map(component => {
      return component.renderObject.batches.map(batch => batch.pgId);
    }));
    if (polygonIds.length != 1) throw new Error('Unsupported scene, no polygon');
    var polygon = nodes[polygonIds[0]];
    if (!polygon) throw new Error('Missing polygon,', polygonIds[0]);

    let key = entity.name;
    if (!defs[key]) throw new Error('Missing defs for entitity:', key);

    model[key] = {
      indexCount: polygon.indexCount,
      indexArray: polygon.indexArray,
      vertexCount: polygon.vertexCount,
      vertexArray: polygon.vertices.map(vertex => {
        return {
          position: [
            vertex.position[1],
            vertex.position[2],
            vertex.position[0],
          ],
          normal: [
            vertex.normal[1],
            vertex.normal[2],
            vertex.normal[0],
          ],
          armorType: vertex.textureCoord[0][0],
          armor: vertex.textureCoord[0][1]
        };
      }),
      position: defs[key].points.normal.split(' ')
    };
  }

  return model;
}

