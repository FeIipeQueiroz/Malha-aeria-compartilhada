const Graph = require("./Structure/graph");
const Node = require("./Structure/node");
const Link = require("./Structure/link");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

const net = require("net");
const { randomInt } = require("crypto");
const { Worker, isMainThread, workerData } = require("worker_threads");

let serversAdress = [
  { ip: "localhost", port: 7080, id: "A" },
  { ip: "localhost", port: 8080, id: "B" },
  { ip: "localhost", port: 9080, id: "C" },
];
let isCoordinator = false;
let actualCoordinatorID = "";
let graphForSend;
let disconnectCounter = 0;
let priorityList = [];
let requestList = [];

let serverGraphs = [
  { id: "A", graph: [], check: false },
  { id: "B", graph: [], check: false },
  { id: "C", graph: [], check: false },
];

let electReturnCount = 0;
let listForElection = [];
let requestAmount = randomInt(0, 15);

const IP_HTTP = "localhost";
let PORT_HTTP = 8000;

const IP_TCP = "localhost";
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

let mainGraph = new Graph();
readGraph(process.argv[2], mainGraph, true, null);
serverGraphs.forEach((element) => {
  if (element.id == process.argv[2]) {
    element.graph = mainGraph;
    element.check = true;
  }
});

//--------------------------------------------------------------------------------------------

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
            response.write(
              JSON.stringify({
                type: "syncronizeReturn",
                graph: graphForSend,
                id: process.argv[2],
              })
            );
            serverGraphs.forEach((element) => {
              if (element.id == message.id && !element.check) {
                auxGraph = new Graph();
                readGraph(message.id, auxGraph, false, message.graph);
                element.graph = auxGraph;
                element.check = true;
              }
            });
            groupGraph(serverGraphs);
            response.on("end", () => {});
            response.on("error", () => {});
          }
        });
        break;
      case "syncronizeReturn":
        serverGraphs.forEach((element) => {
          if (element.id == message.id && !element.check) {
            auxGraph = new Graph();
            readGraph(message.id, auxGraph, false, message.graph);
            element.graph = auxGraph;
            element.check = true;
          }
        });
        groupGraph(serverGraphs);
        break;
      case "decreaseSeats":
        decreaseSeats(message.links);
        break;
      case "updateGraph":
        serversAdress.forEach((element) => {
          if (element.id == message.id) {
            const response = new net.Socket();
            response.connect(element.port, element.ip);
            response.write(
              JSON.stringify({
                type: "updateGraphReturn",
                graph: graphForSend,
                id: process.argv[2],
              })
            );
            response.end();
            response.on("end", () => {});
            response.on("error", () => {});
            serverGraphs.forEach((element) => {
              if (element.id != process.argv[2]) {
                element.check = false;
              }
              if (element.id == message.id) {
                auxGraph = new Graph();
                readGraph(message.id, auxGraph, false, message.graph);
                element.graph = auxGraph;
                element.check = true;
              }
            });
            groupGraph(serverGraphs);
          }
        });
        break;
      case "updateGraphReturn":
        serverGraphs.forEach((element) => {
          if (element.id == message.id && !element.check) {
            auxGraph = new Graph();
            readGraph(message.id, auxGraph, false, message.graph);
            element.graph = auxGraph;
            element.check = true;
          }
        });
        groupGraph(serverGraphs);
        break;
      case "updateSeats":
        console.log("Atualizando assentos...");
        message.route.forEach((link) => {
          serverGraphs.map((element) => {
            if (element.id == link.company) {
              element.graph.getNode(link.Origem).getLink(link.Destino).seats--;
            }
          });
        });
        break;
      default:
        console.log(message);
    }
  });
  socket.on("error", () => {
    socket.end();
    console.log("Um servidor offline é necessário atualizar o grafo");
    if (isCoordinator) {
      updateGraph();
      groupGraph(serverGraphs);
    }
    server.getConnections((error, count) => {
      if (count == 0) {
        console.log("Sem conexões. Me tornando o Coordenador");

        actualCoordinatorID = process.argv[2];
        isCoordinator = true;
      } else {
        if (isCoordinator) {
          elect();
        } else {
          if (priorityList[0].id == process.argv[2]) {
            isCoordinator = true;
            elect();
          }
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

///////////////////////////
//                  ROTAS
///////////////////////////
//Rotas da interface
const app = express();
app.use(express.json());
app.use(cors());
app.post("/searchRoutes", function (req, res) {
  origin = 2;
  destination = 8;
  if (isCoordinator) {
    let links = [];
    findPath(mainGraph, req.body.origem, req.body.destino, links);
    res.json({
      status: "Sou o coordenador",
      routes: links,
    });
  } else {
    res.json({
      status: "Não sou o coordenador",
    });
  }
});

app.post("/purchaseRoute", function (req, res) {
  //requestList.push();

  if (isCoordinator) {
    isPossible = true;
    req.body.route.map((link) => {
      serverGraphs.map((element, index) => {
        if (element.graph.length != 0) {
          if (element.id == link.company) {
            const socket = new net.Socket();
            socket.connect(serversAdress[index].port, serversAdress[index].ip);
            socket.end();
            socket.on("error", () => {
              isPossible = false;
            });
            if (element.check == true) {
              if (
                element.graph.getNode(link.Origem).getLink(link.Destino)
                  .seats <= 0
              ) {
                isPossible = false;
              }
            } else {
              isPossible = false;
            }
          }
        }
      });
    });
    if (isPossible) {
      reserveSeat(req.body.route);
      res.json({
        status: "Reservado com Sucesso",
      });
    } else {
      res.json({
        status: "Não foi possível",
      });
    }
  } else {
    res.json({
      status: "Não sou o coordenador",
    });
  }

  //requestList.pop();
  //responde pra interface
});

app.listen(PORT_HTTP, IP_HTTP, () => {
  console.log("Servidor HTTP =", IP_HTTP + ":" + PORT_HTTP);
  console.log("-------------------------------------");
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                         FUNÇÕES
/////////////////////////////////////////////////////////////////////////////////////////////////////

function readGraph(text, graph, flag, string) {
  var graphInfo;
  let links = [];
  if (flag) {
    graphForSend = fs.readFileSync("./files/grafo" + text + ".txt", "utf8");
    graphInfo = graphForSend.replace(/(\r\n|\n|\r)/gm, ",").split(",");
  } else {
    graphInfo = string.replace(/(\r\n|\n|\r)/gm, ",").split(",");
  }

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
  let graphMerged = new Graph();
  console.log("Agrupando grafos...");
  graph.forEach((element) => {
    if (element.check == true) {
      for (let index = 0; index < element.graph.nodes.length; index++) {
        let aux = graphMerged.getNode(element.graph.nodes[index].id);
        if (!aux.id) {
          graphMerged.addNode(element.graph.nodes[index]);
        } else {
          element.graph.nodes[index].getLinks().forEach((link) => {
            graphMerged.getNode(element.graph.nodes[index].id).addLink(link);
          });
        }
      }
      mainGraph = graphMerged;
    }
  });
}

function findPath(graph, start, end, links) {
  let prev = [];
  graph.findRoute(start, end, prev);
  let path = graph.recursivePath(prev, end, start);
  path.forEach((route) => {
    let aux = [];
    route.forEach((element, index) => {
      if (route[index + 1]) {
        let link = graph.getNode(element).getLink(route[index + 1]);
        aux.push({
          Origem: link.getOrigem().getId(),
          Destino: link.getDestino().getId(),
          valor: link.valor,
          tempo: link.tempo,
          company: link.company,
          seats: link.seats,
        });
      }
    });
    links.push(aux);
  });
}

function reserveSeat(route) {
  let v1 = [];
  let v2 = [];
  let v3 = [];
  route.map((link) => {
    switch (link.company) {
      case "A":
        v1.push(link);
        break;
      case "B":
        v2.push(link);
        break;
      case "C":
        v3.push(link);
        break;
    }
  });

  switch (process.argv[2]) {
    case "A":
      decreaseSeats(v1);
      break;
    case "B":
      decreaseSeats(v2);
      break;
    case "C":
      decreaseSeats(v3);
      break;
  }

  serversAdress.forEach((element) => {
    if (element.id != process.argv[2]) {
      const socket = new net.Socket();
      socket.connect(element.port, element.ip);
      switch (element.id) {
        case "A":
          if (v1.length > 0) {
            socket.write(
              JSON.stringify({
                type: "decreaseSeats",
                links: v1,
              })
            );
          }

          break;
        case "B":
          if (v2.length > 0) {
            socket.write(
              JSON.stringify({
                type: "decreaseSeats",
                links: v2,
              })
            );
          }
          break;
        case "C":
          if (v3.length > 0) {
            socket.write(
              JSON.stringify({
                type: "decreaseSeats",
                links: v3,
              })
            );
          }
          break;
      }
      socket.on("error", () => {});
      socket.end();
    }
  });

  //acessar rota do grafo e reduzir o seat de todos os links utilizados(somente coordenador).
}

function elect() {
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
          JSON.stringify({
            type: "syncronize",
            id: process.argv[2],
            graph: graphForSend,
          })
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
  isCoordinator = false;
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

function decreaseSeats(vector) {
  serverGraphs.map((element) => {
    if (element.id == process.argv[2]) {
      vector.map((link) => {
        element.graph.getNode(link.Origem).getLink(link.Destino).seats--;
      });
    }
  });
  if (isCoordinator) {
    serversAdress.forEach((element, index) => {
      if (element.id != process.argv[2]) {
        const socket = new net.Socket();
        socket.connect(element.port, element.ip);
        socket.write(
          JSON.stringify({
            type: "updateSeats",
            route: vector,
          })
        );
        socket.on("error", () => {});
        socket.end();
      }
    });
  }
}

function updateGraph() {
  serverGraphs.forEach((element) => {
    if (element.id != process.argv[2]) {
      element.check = false;
    }
  });
  serversAdress.forEach((element, index) => {
    const socket = new net.Socket();
    socket.connect(element.port, element.ip);
    socket.write(
      JSON.stringify({
        type: "updateGraph",
        id: process.argv[2],
        graph: graphForSend,
      })
    );
    socket.on("error", () => {});
    socket.end();
  });
}
