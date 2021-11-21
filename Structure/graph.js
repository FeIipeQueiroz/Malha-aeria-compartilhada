const Node = require("./node");

class Graph {
  constructor() {
    this.nodes = [];
  }

  addNode(node) {
    this.nodes.push(node);
  }

  getNode(id) {
    let foundNode = new Node();
    for (let index = 0; index < this.nodes.length; index++) {
      if (this.nodes[index].id == id) {
        foundNode = this.nodes[index];
      }
    }
    return foundNode;
  }

  findRoute(originId, destinyId) {
    const visited = new Set();

    let origin = this.getNode(originId);
    let destiny = this.getNode(destinyId);

    let queue = [origin];

    while (queue.length > 0) {
      let path = [];
      const currentNode = queue.shift();
      const links = currentNode.getLinks();
      if (links == []) {
        queue.shift();
      } else {
        for (let index = 0; index < links.length; index++) {
          let node = new Node();
          if (links[index].getNodeA().getName() != currentNode.getName()) {
            node = links[index].getNodeA();
          } else {
            node = links[index].getNodeB();
          }
          if (node.getName() == destiny.getName()) {
            console.log(visited);
            console.log("achou");
            path.push(node);
          } else if (!visited.has(node.getName())) {
            console.log("Visitado");
            visited.add(node.getName());
            queue.push(node);
          }
        }
      }
    }
    console.log(path);
  }
}

module.exports = Graph;
