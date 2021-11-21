class Node {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.links = [];
  }

  addLink(link) {
    this.links.push(link);
  }

  getLinks() {
    return this.links;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }
}

module.exports = Node;
