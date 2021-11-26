const Graph = require("./Structure/graph");
const Node = require("./Structure/node");
const Link = require("./Structure/link");
const fs = require("fs");
const path = require("path/posix");

//var coordinator = false;

graph = new Graph();
readGraph(process.argv[2], graph);
console.log("Grafo :" + process.argv[2] + ":", graph);
findPath(graph); //retorna um array de strings com todos os caminhos, para passar para a interface.

//ler o grafo do arquivo, agrupar grafo, buscar caminho, reservar vagas, função de eleição.
function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function readGraph(text, graph) {
  var graphInfo;
  let links = [];
  data = fs.readFileSync("./files/grafo" + text + ".txt", "utf8");
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
            graphInfo[index + 1],
            text
          )
        );
        break;
    }
  }
  links.forEach((element) => {
    graph.getNode(element.getOrigem().id).addLink(element);
  });
}

function groupGraph() {
  //conexão entre os sockets, compartilhamento e junção dos grafos.
}

function findPath(graph) {
  let prev = graph.findRoute(5, 7, 10);
  path = graph.reconstruct(5, 7, prev);
  return path;
}

function reserveSeat() {
  /**if (coordinator) {
  }*/
  //acessar rota do grafo e reduzir o seat de todos os links utilizados(somente coordenador).
}

function elect() {
  //Ao iniciar os servidores começar uma eleição
  //Perguntar se existe algum coordenador, caso não iniciar uma eleição.
  //criar função de timeout por coordenador(trocar após N requisições respondidas)
}

//Rotas da interface
