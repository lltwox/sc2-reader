function CustomPropertiesComponent(archive) {
  this.className = this.constructor.name;
  this.load(archive);
}

CustomPropertiesComponent.prototype.load = function(archive) {
  this.type = archive['comp.type'];
  if (archive['cpc.properties']) {
    this.properties = archive['cpc.properties'].getValue().readKeyedArchive();
  }
  if (archive['cpc.properties.archive']) {
    this.propertiesArchive = archive['cpc.properties.archive'];
  }
};

module.exports = CustomPropertiesComponent;