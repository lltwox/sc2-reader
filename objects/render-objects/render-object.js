var Objects = require('../index');

function RenderObject(archive) {
  this.className = this.constructor.name;
  this.load(archive);
}

RenderObject.VISIBLE = 1 << 0;
RenderObject.ALWAYS_CLIPPING_VISIBLE = 1 << 4;
RenderObject.VISIBLE_STATIC_OCCLUSION = 1 << 5;
RenderObject.TREE_NODE_NEED_UPDATE = 1 << 6;
RenderObject.NEED_UPDATE = 1 << 7;
RenderObject.MARKED_FOR_UPDATE = 1 << 8;
RenderObject.CUSTOM_PREPARE_TO_RENDER = 1 << 9;
RenderObject.VISIBLE_REFLECTION = 1 << 10;
RenderObject.VISIBLE_REFRACTION = 1 << 11;
RenderObject.VISIBLE_QUALITY = 1 << 12;
RenderObject.TRANSFORM_UPDATED = 1 << 15;

RenderObject.VISIBILITY_CRITERIA =
  RenderObject.VISIBLE |
  RenderObject.VISIBLE_STATIC_OCCLUSION |
  RenderObject.VISIBLE_QUALITY;
RenderObject.CLIPPING_VISIBILITY_CRITERIA =
  RenderObject.VISIBLE |
  RenderObject.VISIBLE_STATIC_OCCLUSION |
  RenderObject.VISIBLE_QUALITY;
RenderObject.SERIALIZATION_CRITERIA =
  RenderObject.VISIBLE |
  RenderObject.VISIBLE_REFLECTION |
  RenderObject.VISIBLE_REFRACTION |
  RenderObject.ALWAYS_CLIPPING_VISIBLE;

RenderObject.prototype.load = function(archive) {
  this.debugFlags = archive['ro.debugFlags'] || 0;
  this.staticOcclusionIndex = archive['ro.staticOcclusionIndex'] || -1;

  let savedFlags = RenderObject.SERIALIZATION_CRITERIA &
    (archive['ro.flags'] || RenderObject.SERIALIZATION_CRITERIA);
  this.flags = (savedFlags | (this.flags & ~RenderObject.SERIALIZATION_CRITERIA));

  let roBatchCount = archive['ro.batchCount'];
  let batchesArch = archive['ro.batches'];
  this.batches = [];
  for (let i = 0; i < roBatchCount; i++) {
    let batchArch = batchesArch[String(i).padStart(4, '0')];
    if (batchArch) {
      let BatchClassName = Objects.get(batchArch['rb.classname']);
      let batch = new BatchClassName(batchArch);
      if (archive['rb' + i +'.lodIndex'] !== undefined) {
        batch.lodIndex = archive['rb' + i +'.lodIndex'];
      }
      if (archive['rb' + i +'.switchIndex'] !== undefined) {
        batch.switchIndex = archive['rb' + i +'.switchIndex'];
      }
      this.batches.push(batch);
    }
  }
};

module.exports = RenderObject;