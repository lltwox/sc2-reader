var util = require('util'),
    RenderObject = require('./render-object');

function Mesh(archive) {
  this.className = this.constructor.name;
  this.load(archive);
}
util.inherits(Mesh, RenderObject);

module.exports = Mesh;