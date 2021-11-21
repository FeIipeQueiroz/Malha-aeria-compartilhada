const Graph = require("./Structure/graph");
const Node = require("./Structure/node");
const Link = require("./Structure/link");

generateCity(5, 4);

function generateCity(qntNodes, qntLinks) {
  let graph = new Graph();
  let links = [];
  for (let index = 0; index < qntNodes; index++) {
    graph.addNode(new Node(index, index));
  }
  for (let index = 0; index < qntLinks; index++) {
    indexA = randInt(0, qntNodes - 1);
    indexB = randInt(0, qntNodes - 1);
    while (indexA == indexB) {
      indexB = randInt(0, qntNodes - 1);
    }
    links.push(
      new Link(
        graph.getNode(indexA),
        graph.getNode(indexB),
        randInt(20, 50),
        randInt(10, 60)
      )
    );
    graph.getNode(indexA).addLink(links[index]);
    graph.getNode(indexB).addLink(links[index]);
  }

  graph.findRoute(0, 3);

  console.log(graph);
  console.log(links);
}

function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
