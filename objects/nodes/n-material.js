var util = require('util'),
    DataNode = require('./data-node');

function NMaterial(archive) {
  DataNode.call(this, archive);
}
util.inherits(NMaterial, DataNode);

NMaterial.prototype.load = function(archive) {
  this.materialConfigs = [];
  if (archive.materialName) {
    this.materialName = archive.materialName;
  }
  if (archive.materialKey) {
    this.id = archive.materialKey.getValue().toJSNumber();
  }
  if (archive.parentMaterialKey) {
    this.parentKey = archive.parentMaterialKey.getValue().toJSNumber();
  }
  if (archive.qualityGroup) {
    this.qualityGroup = archive.qualityGroup;
  }

  var configCount = archive.configCount || 1;
  if (configCount == 1) {
    let config = this.loadConfigFromArchive(archive);
    if (config) this.materialConfigs.push(config);
  } else {
    for (let i = 0; i < configCount; i++) {
      let config = this.loadConfigFromArchive(archive['configArchive_' + i]);
      if (config) this.materialConfigs.push(config);
    }
  }

  if (this.materialConfigs.length == 1 && !this.materialConfigs[0].name) {
      this.materialConfigs[0].name = 'Default';
  }
};

NMaterial.prototype.loadConfigFromArchive = function(archive) {
  let config = {};

  if (archive.fxName) {
    config.fxName = archive.fxName;
  }
  if (archive.configName) {
    config.name = archive.configName;
  }
  if (archive.properties && Object.keys(archive.properties).length) {
    config.localProperties = {};

    Object.keys(archive.properties).forEach(key => {
      let byteArray = archive.properties[key].getValue();

      let type = byteArray.readUInt8(),
          size = byteArray.readUInt32();

      config.localProperties[key] = {
        name: key,
        type: type,
        arraySize: size,
        data: new Array(this.getPropDataSize(type, size)).fill(null)
        .map(function() {
          return byteArray.readFloat();
        })
      };
    });
  }

  if (archive.textures && Object.keys(archive.textures).length) {
    config.localTextures = archive.textures;
  }

  if (archive.flags && Object.keys(archive.flags).length) {
    config.localFlags = archive.flags;
  }

  if (!Object.keys(config).length) return;
  return config;
};

NMaterial.prototype.getPropDataSize = function(type, size) {
  if (type === 0) return 1;
  if (type == 1) return 2;
  if (type == 2) return 3;
  if (type == 3) return 4 * size;
  if (type == 4) return 16 * size;

  throw new Error('Unknow property type: ' + type);
};

module.exports = NMaterial;