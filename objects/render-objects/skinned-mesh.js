var util = require('util'),
    RenderObject = require('./render-object');

function SkinnedMesh(archive) {
  this.className = this.constructor.name;
  this.load(archive);
}
util.inherits(SkinnedMesh, RenderObject);

module.exports = SkinnedMesh;