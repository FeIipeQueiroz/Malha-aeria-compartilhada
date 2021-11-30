const net = require("net");
const { argv } = require("process");

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

let coordinator = false;

let seats = 10;

const socket = new net.Socket(); //tem algo errado ;-;
console.log(socket.address());
console.log("conectando em" + PORT_TCP + ", 127.0.0.1");
socket.connect(PORT_TCP, "127.0.0.1");
if (process.argv[2] == "A") {
  socket.write(
    JSON.stringify({
      type: "verify",
    })
  );
}

let server = net.createServer((socket) => {
  socket.on("data", (message) => {
    let data = JSON.parse(message);
    switch (data.type) {
      case "verify":
        verify(socket);
        console.log("Verificando se existe coordenador");
        //recebendo a mensagem a gente tem que verificar se existe algum coordenador, se não existir realizar uma eleição baseado na quantidade de assentos disponíveis
        break;

      case "returnVerify":
        console.log("Verificando se existe coordenador");
        isCoordinator = check(data);
        if (!isCoordinator) {
          elect(socket, data);
        }
        break;

      case "elect":
        console.log("Elegendo um coordenador");
        elect(socket, data);
        break;
      case "decreaseSeats":
        console.log("Decrementando assentos");
        decraseSeats(data.amount, data.serverID, socket);
        break;
    }
  });
});

function verify(socket) {
  let server = new net.Socket();
  server.connect(socket.address().port, socket.address().addreess);
  server.write(
    JSON.stringify({
      type: "returnVerify",
      coordinator: this.coordinator,
      seats: this.seats,
    })
  );
}

function check(data) {
  if (data.coordinator) {
    return true;
  } else {
    return false;
  }
}

function elect(socket, data) {
  if (this.seats > data.seats) {
    this.isCoordinator = true;
  } else {
    let server = new net.Socket();
    server.connect(socket.address().port, socket.address().addreess);
    server.write(
      JSON.stringify({
        type: "elect",
        seats: this.seats,
      })
    );
  }
}

function decraseSeats(amount, serverID, socket) {
  if (process.argv[2] == serverID) {
    this.seats = this.seats - amount;
  } else {
    let server = new net.Socket();
    server.connect(socket.address().port, socket.address().addreess);
    server.write(
      JSON.stringify({
        type: "decreaseSeats",
        amount: "2",
        serverID: "A",
      })
    );
  }
}
