const Graph = require("./Structure/graph");
const Node = require("./Structure/node");
const Link = require("./Structure/link");
const fs = require("fs");
const express = require("express");
const net = require("net");

const IP_HTTP = "127.0.0.1";
let PORT_HTTP = 8000;

const IP_TCP = "127.0.0.1";
let PORT_TCP = 8080;

switch (process.argv[2]) {
  case "A":
    PORT_HTTP = 7000;
    PORT_TCP = 7080;
    break;
  case "B":
    PORT_HTTP = 8000;
    PORT_TCP = 8080;
    break;
  case "C":
    PORT_HTTP = 9000;
    PORT_TCP = 9080;
    break;
}

const serversAdress = {
  A: { ip: "127.0.0.1", port: 7080 },
  B: { ip: "127.0.0.1", port: 8080 },
  C: { ip: "127.0.0.1", port: 9080 },
};
let coordinator = false;
let graphForSend;

//--------------------------------------------------------------------------------------------
graph = new Graph();
readGraph(process.argv[2], graph);

//Rotas da interface
const app = express();
app.post("/searchRoutes", function (req, res) {
  origin = req.origin;
  destination = req.destination;
});

app.post("/purchaseRoute", function (req, res) {});

app.listen(PORT_HTTP, IP_HTTP, () => {
  console.log("Servidor HTTP =", IP_HTTP + ":" + PORT_HTTP);
});

//Servidor TCP
const server = net.createServer((socket) => {});

server.listen(PORT_TCP, IP_TCP, () => {
  console.log("Servidor TCP =", IP_TCP + ":" + PORT_TCP);
});
/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                         FUNÇÕES
/////////////////////////////////////////////////////////////////////////////////////////////////////
//findPath(graph); //retorna um array de strings com todos os caminhos, para passar para a interface.
console.log("Grafo :" + process.argv[2] + ":", graph);
groupGraph(graph);
//findPath(graph); //retorna um array de strings com todos os caminhos, para passar para a interface.

//ler o grafo do arquivo, agrupar grafo, buscar caminho, reservar vagas, função de eleição.

function readGraph(text, graph) {
  var graphInfo;
  let links = [];
  graphForSend = fs.readFileSync("./files/grafo" + text + ".txt", "utf8");
  graphInfo = graphForSend.replace(/(\r\n|\n|\r)/gm, ",").split(",");

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

function groupGraph(graph) {
  //conexão entre os sockets, compartilhamento e junção dos grafos.
  const socket = new net.Socket();
  /*socket.connect(PORT_TCP, IP_TCP, () => {
    console.log("Conectado ao TCP: " + IP_TCP + ":" + PORT_TCP);
  });*/
}

function findPath(graph, originId, destinationId) {
  let prev = graph.findRoute(originId, destinationId, 10);
  path = graph.reconstruct(originId, destinationId, prev);
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
