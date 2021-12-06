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

  getLink(destino) {
    let auxLink = null;
    this.links.map((link) => {
      if (link.Destino.id == destino) {
        auxLink = link;
      }
    });

    return auxLink;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }
}

module.exports = Node;
