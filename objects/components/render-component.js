var Objects = require('../index.js');

function RenderComponent(archive) {
  this.className = this.constructor.name;
  this.load(archive);
}

RenderComponent.prototype.load = function(archive) {
  this.type = archive['comp.type'];
  let renderObjectArch = archive['rc.renderObj'];
  if (renderObjectArch) {
    let RenderObject = Objects.get(renderObjectArch['##name']);
    this.renderObject = new RenderObject(renderObjectArch);
  }
};

module.exports = RenderComponent;