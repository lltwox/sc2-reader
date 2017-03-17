function RenderBatch(archive) {
  this.className = this.constructor.name;
  this.load(archive);
}

RenderBatch.prototype.load = function(archive) {
  this.sortingKey = archive['rb.sortingKey'] || 0xf8;
  this.aabbox = archive['rb.aabbox'];

  this.pgId = archive['rb.datasource'].getValue().toJSNumber();
  this.matKey = archive['rb.nmatname'].getValue().toJSNumber();
};

module.exports = RenderBatch;