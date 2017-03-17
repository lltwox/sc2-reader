function LodComponent(archive) {
  this.className = this.constructor.name;
  this.load(archive);
}

LodComponent.prototype.load = function(archive) {
  this.type = archive['comp.type'];
  let lodDistArch = archive['lc.loddist'];
  if (lodDistArch) {
    this.distances = [];
    for (let i = 0; i < 4 /* MAX_LOD_LAYERS */; i++) {
      this.distances[i] = lodDistArch['distance' + i];
    }
  }
};

module.exports = LodComponent;