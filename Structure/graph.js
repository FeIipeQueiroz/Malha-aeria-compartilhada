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
          let node = new Node();
          node = links[index].getDestino();
          if (!visited.has(node.getId())) {
            if (node.getId() != destinyId) {
              visited.add(node.getId());
            }
            queue.push(node);
            prev[node.getId()].push(currentNode.getId());
          }
        }
      }
    }
    console.log("lista de anteriores");
    console.log(prev);
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
        //console.log(typeof actualNode);
        if (typeof actualNode == "object") {
          path[index].push(actualNode[0]);
        }
      }
      path[index].reverse();
      path[index].push(end);
    }

    if (path[0][0] == origin) {
      let size = path[0].length;
      let path2;
      console.log(path);
      path2 = path.splice(0, 1);
      //for (let index = 0; index < prev[end].length - 1; index++) {}

      console.log("Caminhos encontrados:");
      console.log(path);
      console.log(path2);
      return path;
    } else {
      console.log("não foi encontrado um caminho");
      return [];
    }
  }
}

module.exports = Graph;
