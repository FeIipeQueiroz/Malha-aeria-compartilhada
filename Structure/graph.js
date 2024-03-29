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

  findRoute(originId, destinyId, prev) {
    const visited = new Set();

    let origin = this.getNode(originId);

    for (let index = 0; index < 10; index++) {
      prev.push([]);
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
  }

  makePath(prev, actualNode, currentPath, end, result, visited) {
    prev[actualNode].forEach((node) => {
      if (!visited.includes(node)) {
        currentPath.push(node);
        if (node == end) {
          let aux = [...currentPath];
          result.push(aux.reverse());
        }

        visited.push(node);
        this.makePath(prev, node, currentPath, end, result, visited);
        currentPath.pop();
        visited.pop();
      }
    });
  }

  recursivePath(prev, actualNode, end) {
    var result = [];
    this.makePath(prev, actualNode, [actualNode.toString()], end, result, [
      actualNode.toString(),
    ]);
    console.log("Result:");
    console.log(result);
    return result;
  }

  reconstruct(origin, end, prev) {
    let aux = 0;
    let boolean = true;
    let nextNode;
    let path = [];
    let auxNode = end;
    let visited = []; //em um caminho só pode passar no nó uma vez
    for (let index = 0; index < 10; index++) {
      visited.push([]);
    }
    console.log(visited);
    path.push([end]);
    while (boolean) {
      for (
        let currentNode = end;
        prev[currentNode] != null;
        currentNode = nextNode
      ) {
        if (prev[currentNode][aux] != end) {
          nextNode = prev[currentNode][aux];
        } else {
          nextNode = prev[currentNode][aux + 1];
        }

        aux = 0;
        for (let indexB = 0; indexB < visited[currentNode].length; indexB++) {
          if (
            currentNode == visited[currentNode][indexB] /*&&
            prev[currentNode].length > 1*/
          ) {
            aux = indexB + 1;
          }
        }
        if (aux == 0) {
          visited[currentNode].push(currentNode);
        }
        if (prev[currentNode] == origin) {
          console.log(prev[currentNode]);
          console.log("acho :D");
        }
        auxNode = currentNode;
        console.log(currentNode);
      }
      console.log(origin);
      console.log("cabo");
    }
  }
}

module.exports = Graph;
