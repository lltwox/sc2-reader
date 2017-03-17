function TransformComponent(archive) {
  this.className = this.constructor.name;
  this.load(archive);
}

TransformComponent.prototype.load = function(archive) {
  this.type = archive['comp.type'];
  this.localMatrix = archive['tc.localMatrix'];
  this.worldMatrix = archive['tc.worldMatrix'];
};

module.exports = TransformComponent;