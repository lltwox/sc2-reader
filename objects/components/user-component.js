var Objects = require('../index.js');

function UserComponent(archive) {
  this.className = this.constructor.name;
  this.load(archive);
}

UserComponent.prototype.load = function(archive) {
  this.type = archive['comp.type'];
};

module.exports = UserComponent;