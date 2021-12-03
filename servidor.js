const Graph = require("./Structure/graph");
const Node = require("./Structure/node");
const Link = require("./Structure/link");
const fs = require("fs");
const express = require("express");
const net = require("net");
const { randomInt } = require("crypto");
const { Worker, isMainThread, workerData } = require("worker_threads");

let serversAdress = [
  { ip: "26.91.70.227", port: 7080, id: "A" },
  { ip: "26.91.70.227", port: 8080, id: "B" },
  { ip: "26.91.70.227", port: 9080, id: "C" },
];
let isCoordinator = false;
let actualCoordinatorID = "";
let graphForSend;
let disconnectCounter = 0;
let priorityList = [];
let requestList = [];

let electReturnCount = 0;
let listForElection = [];
let requestAmount = randomInt(0, 15);

if (isMainThread) {
  const IP_HTTP = "26.91.70.227";
  let PORT_HTTP = 8000;

  const IP_TCP = "26.91.70.227";
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

  graph = new Graph();
  readGraph(process.argv[2], graph);

  //--------------------------------------------------------------------------------------------

  const worker = new Worker(__filename, {
    workerData: { IP_HTTP: IP_HTTP, PORT_HTTP: PORT_HTTP },
  });

  //Servidor TCP
  stepOne();
  const server = net.createServer((socket) => {
    socket.on("data", (message) => {
      message = JSON.parse(message);

      switch (message.type) {
        case "elect":
          isCoordinator = false;
          const response = new net.Socket();
          serversAdress.forEach((element) => {
            if (element.id == message.id) {
              response.connect(element.port, element.ip);
              response.write(
                JSON.stringify({
                  type: "electReturn",
                  requestAmount: requestAmount,
                  id: process.argv[2],
                })
              );
              response.end();
            }
          });
          break;
        case "electReturn":
          server.getConnections((error, count) => {
            electReturnCount++;
            if (electReturnCount == count / 2) {
              electReturnCount = 0;
              listForElection.push(message);
              verifyRequestAmount(listForElection);
              listForElection = [];
            } else {
              listForElection.push(message);
            }
          });
          break;
        case "electionResult":
          if (message.id == process.argv[2]) {
            isCoordinator = true;
          }
          actualCoordinatorID = message.id;
          priorityList = message.priorityList;
          console.log("O coordenador atual é", actualCoordinatorID);
          break;
        case "syncronize":
          serversAdress.forEach((element) => {
            const response = new net.Socket();
            if (element.id == message.id) {
              response.connect(element.port, element.ip);
              response.on("end", () => {});
              response.on("error", () => {});
            }
          });
          break;
        default:
          console.log(message);
      }
    });
    socket.on("error", () => {
      socket.end();
      server.getConnections((error, count) => {
        if (count == 0) {
          console.log("Sem conexões. Me tornando o Coordenador");
          isCoordinator = true;
        } else {
          if (isCoordinator) {
            elect();
          } else if (priorityList[0].id == process.argv[2]) {
            elect();
          }
        }
      });
    });
    socket.on("close", () => {
      socket.end();
    });
  });
  server.on("connection", (socket) => {});

  setInterval(() => {
    server.getConnections((error, count) => {
      if (isCoordinator && count > 0) {
        console.log("Iniciando uma nova eleição...");
        elect();
      }
    });
  }, 5000);

  server.listen(PORT_TCP, IP_TCP, () => {
    console.log("Servidor TCP =", IP_TCP + ":" + PORT_TCP);
    console.log("-------------------------------------");
  });
} else {
  //Rotas da interface
  const app = express();
  app.post("/searchRoutes", function (req, res) {
    origin = req.origin;
    destination = req.destination;
  });

  app.get("/purchaseRoute", function (req, res) {
    //requestList.push();
    console.log(isCoordinator);
    //while (!isCoordinator) {}
    console.log("Chegou", workerData.PORT_HTTP);
    res.write("teste");
    res.end("Teste");
    res.send();
    //requestList.pop();
    //responde pra interface
  });

  app.listen(workerData.PORT_HTTP, workerData.IP_HTTP, () => {
    console.log(
      "Servidor HTTP =",
      workerData.IP_HTTP + ":" + workerData.PORT_HTTP
    );
    console.log("-------------------------------------");
  });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                         FUNÇÕES
/////////////////////////////////////////////////////////////////////////////////////////////////////
//findPath(graph); //retorna um array de strings com todos os caminhos, para passar para a interface.
//console.log("Grafo :" + process.argv[2] + ":", graph);
//groupGraph(graph);
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
  isCoordinator = false;
  serversAdress.forEach((element) => {
    if (element.id != process.argv[2]) {
      const socket = new net.Socket();
      socket.connect(element.port, element.ip);
      socket.write(
        JSON.stringify({
          type: "elect",
          id: process.argv[2],
        })
      );
      socket.on("error", () => {});
      socket.end();
    }
  });

  //Ao iniciar os servidores começar uma eleição
  //Perguntar se existe algum coordenador, caso não iniciar uma eleição.
  //criar função de timeout por coordenador(trocar após N requisições respondidas)
}

function stepOne() {
  let connectionCounter = 0;
  serversAdress.forEach((element) => {
    if (element.id != process.argv[2]) {
      const socket = new net.Socket();
      socket.connect(element.port, element.ip);
      socket.on("error", () => {
        disconnectCounter++;
        if (disconnectCounter == serversAdress.length - 1) {
          disconnectCounter = 0;
          isCoordinator = true;
          actualCoordinatorID = process.argv[2];
          console.log("Sem conexões");
          console.log("Servidor " + process.argv[2] + " é o coordenador");
        }
      });
      socket.on("connect", () => {
        socket.write(
          JSON.stringify({ type: "syncronize", id: process.argv[2] })
        );
        if (connectionCounter == 0) {
          elect();
          connectionCounter++;
        }
      });
    }
  });
}

function verifyRequestAmount(rcvListForElection) {
  rcvListForElection.push({
    requestAmount: requestAmount,
    id: process.argv[2],
  });
  let priorityListAux = [];

  result = { requestAmount: 0, id: "" };
  rcvListForElection.forEach((element) => {
    priorityListAux.push(element);
    if (element.requestAmount > result.requestAmount) {
      result = element;
    }
  });

  quickSort(priorityListAux, 0, priorityListAux.length - 1);
  priorityListAux.pop();
  priorityListAux = priorityListAux.reverse();
  priorityList = priorityListAux;
  console.log("O coordenador atual é", result.id);
  if (result.id == process.argv[2]) {
    isCoordinator = true;
    actualCoordinatorID = process.argv[2];
  }

  serversAdress.forEach((element) => {
    if (element.id != process.argv[2]) {
      const socket = new net.Socket();
      socket.connect(element.port, element.ip);
      socket.write(
        JSON.stringify({
          type: "electionResult",
          id: result.id,
          priorityList: priorityListAux,
        })
      );
      socket.on("error", () => {});
      socket.end();
    }
  });
}

function quickSort(items, left, right) {
  let index;
  if (items.length > 1) {
    index = partition(items, left, right); //index returned from partition
    if (left < index - 1) {
      //more elements on the left side of the pivot
      quickSort(items, left, index - 1);
    }
    if (index < right) {
      //more elements on the right side of the pivot
      quickSort(items, index, right);
    }
  }
  return items;
}

function swap(items, leftIndex, rightIndex) {
  let temp = items[leftIndex];
  items[leftIndex] = items[rightIndex];
  items[rightIndex] = temp;
}

function partition(items, left, right) {
  let pivot = items[Math.floor((right + left) / 2)], //middle element
    i = left, //left pointer
    j = right; //right pointer
  while (i <= j) {
    while (items[i].requestAmount < pivot.requestAmount) {
      i++;
    }
    while (items[j].requestAmount > pivot.requestAmount) {
      j--;
    }
    if (i <= j) {
      swap(items, i, j); //sawpping two elements
      i++;
      j--;
    }
  }
  return i;
}
