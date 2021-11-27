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
    let i = prev[end].length;
    for (let index = 0; index < prev[end].length; index++) {
      path.push([prev[end][index]]);
    }

    for (let indexA = 0; indexA < i; indexA++) {
      for (
        let actualNode = prev[path[indexA][0]];
        actualNode != null;
        actualNode = prev[actualNode]
      ) {
        //Verificar tamanho do array de anteriores e criar um caminho para cada instância
        //Por algum motivo ele ta copiando a referencia ao espaço e n os indices
        if (typeof prev[actualNode] == "object") {
          console.log(prev[actualNode].length);
          if (prev[actualNode].length > 1) {
            for (let indexB = 1; indexB < prev[actualNode].length; indexB++) {
              console.log(path[indexB]);
              path.push(path[indexB]);
              i++;
            }
          }
        }

        if (typeof actualNode == "object") {
          path[indexA].push(actualNode[0]);
        }
      }
      //to adicoinando incondicionalmente então mesmo que o caminho não exita ele força a existir
      path[indexA].push(origin);
      path[indexA].reverse();
      path[indexA].push(end);
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
