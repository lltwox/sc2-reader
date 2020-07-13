var Objects = require('./index.js');

function Entity(archive) {
  this.className = this.constructor.name;
  this.load(archive);
}

Entity.prototype.load = function(archive) {
  this.name = archive.name || '';
  this.tag = archive.tag || 0;
  this.id = archive.id || 0;
  this.flags = archive.flags;

  if (archive.localTransform) {
    let byteArray = archive.localTransform.getValue();
    this.localTransform = [
      [byteArray.readFloat(), byteArray.readFloat(), byteArray.readFloat(), byteArray.readFloat()],
      [byteArray.readFloat(), byteArray.readFloat(), byteArray.readFloat(), byteArray.readFloat()],
      [byteArray.readFloat(), byteArray.readFloat(), byteArray.readFloat(), byteArray.readFloat()],
      [byteArray.readFloat(), byteArray.readFloat(), byteArray.readFloat(), byteArray.readFloat()]
    ];
  }

  if (archive.components && Object.keys(archive.components).length) {
    this.components = [];

    let count = archive.components.count;
    for (let i = 0; i < count; i++) {
      let componentArch = archive.components[String(i).padStart(4, '0')];
      if (componentArch) {
        let type = componentArch['comp.typename'];
        let Component = Objects.get(type);
        this.components.push(new Component(componentArch));
      }
    }
  }
};

module.exports = Entity;