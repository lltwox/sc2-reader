var Objects = require('../index.js');

function ParticleEffectComponent(archive) {
  this.className = this.constructor.name;
  this.load(archive);
}

ParticleEffectComponent.prototype.load = function(archive) {
  this.type = archive['comp.type'];
};

module.exports = ParticleEffectComponent;