var int64buffer = require('int64-buffer'),
    bigInteger = require('big-integer');

function DataNode(archive) {
  this.className = this.constructor.name;
  this.id = archive['#id'].getValue().readInt64().toJSNumber();
  this.load(archive);
}

DataNode.prototype.load = function(archive) {};

module.exports = DataNode;