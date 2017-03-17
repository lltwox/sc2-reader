function CustomPropertiesComponent(archive) {
  this.className = this.constructor.name;
  this.load(archive);
}

CustomPropertiesComponent.prototype.load = function(archive) {
  this.type = archive['comp.type'];
  this.properties = archive['cpc.properties'].getValue().readKeyedArchive();
};

module.exports = CustomPropertiesComponent;