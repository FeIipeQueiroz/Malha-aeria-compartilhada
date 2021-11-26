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

  existNode(id) {
    for (let index = 0; index < this.nodes.length; index++) {
      if (this.nodes[index].id == id) {
        return true;
      }
    }
    return false;
  }

  getNodes() {
    return this.nodes;
  }

  findRoute(originId, destinyId, qntNodes) {
    const visited = new Set();

    let origin = this.getNode(originId);

    let prev = [];

    for (let index = 0; index < qntNodes; index++) {
      prev.push([]);
    }

    prev[originId] = null;

    let queue = [origin];
    visited.add(origin.getId());

    while (queue.length > 0) {
      const currentNode = queue.shift();
      const links = currentNode.getLinks();
      if (links == []) {
        queue.shift();
      } else {
        for (let index = 0; index < links.length; index++) {
          let nextNode = new Node();
          nextNode = links[index].getDestino();
          if (!visited.has(nextNode.getId())) {
            if (nextNode.getId() != destinyId) {
              visited.add(nextNode.getId());
            }
            queue.push(nextNode);
            prev[nextNode.getId()].push(currentNode.getId());
          }
        }
      }
    }
    return prev;
  }

  reconstruct(origin, end, prev) {
    let path = [];
    for (let index = 0; index < prev[end].length; index++) {
      path.push([prev[end][index]]);
    }

    for (let index = 0; index < prev[end].length; index++) {
      for (
        let actualNode = prev[path[index][0]];
        actualNode != null;
        actualNode = prev[actualNode]
      ) {
        if (typeof actualNode == "object") {
          path[index].push(actualNode[0]);
        }
      }
      path[index].reverse();
      path[index].push(end);
    }

    if (path[0][0] == origin) {
      console.log(path.length + " Caminho(s) encontrado(s):");
      path.forEach((element) => {
        console.log(element);
      });
      return path;
    } else {
      console.log("não foi encontrado um caminho");
      return [];
    }
  }
}

module.exports = Graph;
