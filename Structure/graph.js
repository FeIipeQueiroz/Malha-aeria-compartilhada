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

  getNodes() {
    return this.nodes;
  }

  findRoute(originId, qntNodes) {
    const visited = new Set();

    let origin = this.getNode(originId);

    let prev = [];

    for (let index = 0; index < originId; index++) {
      prev[index] = null;
    }

    let queue = [origin];
    visited.add(origin.getId());

    while (queue.length > 0) {
      const currentNode = queue.shift();
      const links = currentNode.getLinks();
      if (links == []) {
        queue.shift();
      } else {
        for (let index = 0; index < links.length; index++) {
          let node = new Node();
          if (links[index].getNodeA().getId() != currentNode.getId()) {
            node = links[index].getNodeA();
          } else {
            node = links[index].getNodeB();
          }
          if (!visited.has(node.getId())) {
            visited.add(node.getId());
            queue.push(node);
            prev[node.getId()] = currentNode.getId();
          }
        }
      }
    }
    return prev;
  }

  reconstruct(origin, end, prev) {
    let path = [];
    for (
      let actualNode = end;
      actualNode != null;
      actualNode = prev[actualNode]
    ) {
      path.push(actualNode);
    }
    path.reverse();

    //Fazer isso aq em um while plz
    if (path[0] == origin) {
      console.log("Caminho encontrado:");
      console.log(path);
      return path;
    } else {
      console.log("não foi encontrado um caminho");
      return [];
    }
  }
}

module.exports = Graph;
