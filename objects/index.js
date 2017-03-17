const LOAD_MAP = {
  // nodes
  'DataNode': 'nodes/data-node',
  'PolygonGroup': 'nodes/polygon-group',
  'NMaterial': 'nodes/n-material',

  // entities
  'Entity': 'entity',

  // components
  'TransformComponent': 'components/transform-component',
  'RenderComponent': 'components/render-component',
  'CustomPropertiesComponent': 'components/custom-properties-component',
  'LodComponent': 'components/lod-component',

  // render objects
  'RenderObject': 'render-objects/render-object',
  'RenderBatch': 'render-objects/render-batch',
  'Mesh': 'render-objects/mesh'
};

let loaded = {};
module.exports.get = function(name) {
  if (!LOAD_MAP[name]) throw new Error('Unknown class: ' + name);
  if (!loaded[name]) {
    loaded[name] = require('./' + LOAD_MAP[name]);
  }

  return loaded[name];
};
