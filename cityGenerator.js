const Graph = require("./Structure/graph");
const Node = require("./Structure/node");
const Link = require("./Structure/link");
const fs = require("fs");

readGraph();

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
  }

  readGraph();
  let prev = graph.findRoute(0);
  graph.reconstruct(0, 3, prev);
}

function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function readGraph() {
  fs.readFile("./files/grafoA.txt", "utf8", function (err, data) {
    let graph = new Graph();
    let links = [];
    graphInfo = data.replace(/(\r\n|\n|\r)/gm, ",").split(",");
    for (let index = 0; index < graphInfo.length; index++) {
      switch (index % 4) {
        case 0:
        case 1:
          if (!graph.existNode(graphInfo[index])) {
            graph.addNode(new Node(graphInfo[index], graphInfo[index]));
          }
          break;
        case 2:
          links.push(
            new Link(
              graph.getNode(graphInfo[index - 2]),
              graph.getNode(graphInfo[index - 1]),
              graphInfo[index],
              graphInfo[index + 1]
            )
          );

          break;
      }
    }
    links.forEach((element) => {
      graph.getNode(element.getOrigem().id).addLink(element);
    });
    console.log(graph);
    let prev = graph.findRoute(0, 3, 5);
    graph.reconstruct(0, 3, prev);
  });
}
