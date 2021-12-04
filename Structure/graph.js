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
          }
          if (nextNode.getId() != originId) {
            let repeat = false;
            for (
              let index = 0;
              index < prev[nextNode.getId()].length;
              index++
            ) {
              console.log(prev[nextNode.getId()][index]);
              if (prev[nextNode.getId()][index] == currentNode.getId()) {
                repeat = true;
              }
            }
            if (!repeat) {
              prev[nextNode.getId()].push(currentNode.getId());
            }
          }
        }
      }
    }
    console.log(prev);
    return prev;
  }

  reconstruct(origin, end, prev) {
    let path = [];
    let visited = []; //em um caminho só pode passar no nó uma vez
    path.push([end]);

    for (let currentNode = end; currentNode != null; prev[currentNode]) {
      if (prev[currentNode].length == 1) {
        path.push(prev[currentNode]);
      } else {
        let pathClone = [];
        for (let index = 0; index < prev[currentNode].length; index++) {
          pathClone[index] = [...path];
          pathClone[index].push(prev[currentNode][index]);
        }
        for (let index = 0; index < pathClone.length; index++) {
          path = path.concat(pathClone[index]);
        }
      }
      console.log(path);
    }
  }
}

module.exports = Graph;
