const net = require("net");

let IP_TCP = "127.0.0.1";
let IP_CON = "127.0.0.2";
let PORT_TCP = 8080;
let PORT_CON = 0;
let serverDecrease = "A";
let seats = 10;
switch (process.argv[2]) {
  case "A":
    IP_TCP = "127.0.0.2";
    IP_CON = "127.0.0.1";
    PORT_HTTP = 8000;
    PORT_TCP = 8080;
    PORT_CON = 8080;
    serverDecrease = "B";
    break;
  case "B":
    PORT_HTTP = 8000;
    PORT_TCP = 8080;
    PORT_CON = 8080;
    seats = 9;
    break;
}

let coordinator = false;

if (process.argv[2] == "A") {
  const socket = new net.Socket();
  socket.connect(PORT_CON, IP_CON);
  socket.write(
    JSON.stringify({
      type: "verify",
    })
  );
  socket.end();
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
        console.log("Retorno pra ver se existe coordenador");
        let isCoordinator = check(data);
        if (!isCoordinator) {
          elect(socket, data);
        }
        break;

      case "elect":
        console.log("Elegendo um coordenador");
        let dataIsCoordinator = check(data);
        if (!dataIsCoordinator) {
          elect(socket, data);
        } else if (coordinator) break;
      case "decreaseSeats":
        if (seats - data.amount < 0) {
          console.log("Não existe assentos suficientes");
        } else {
          decraseSeats(data.amount, data.serverID, data.isCoordinator);
        }

        break;
      case "amount":
        console.log("Checando a quantidade de assentos");
        amountVerify(data.amount, data.serverID);
    }
  });

  socket.on("error", (err) => {
    console.log("Aconteceram coisas", err.message);
  });
});
server.on("error", (e) => {
  console.log("Address in use, retrying...");
  setTimeout(() => {
    server.close();
    server.listen(PORT_TCP, IP_TCP);
  }, 1000);
});

server.listen(PORT_TCP, IP_TCP, () => console.log(PORT_TCP, IP_TCP));

function verify(socket) {
  let server = new net.Socket();
  server.connect(PORT_CON, IP_CON);
  server.write(
    JSON.stringify({
      type: "returnVerify",
      coordinator: coordinator,
      seats: seats,
    })
  );
  server.end();
}

function check(data) {
  if (data.coordinator) {
    return true;
  } else {
    return false;
  }
}

function elect(socket, data) {
  if (seats < data.seats) {
    coordinator = true;
    console.log(process.argv[2], "é o coordenador");
    decraseSeats(2, serverDecrease, coordinator);
  } else {
    let server = new net.Socket();

    server.connect(PORT_CON, IP_CON);
    server.write(
      JSON.stringify({
        type: "elect",
        seats: seats,
      })
    );
    server.end();
  }
}

function decraseSeats(amount, serverID, isCoordinator) {
  if (process.argv[2] == serverID && isCoordinator) {
    console.log("Decrementando assentos");
    seats = seats - amount;
    console.log(seats);
    let socket = new net.Socket();
    socket.connect(PORT_CON, IP_CON);
    socket.write(
      JSON.stringify({
        type: "amount",
        amount: seats,
        serverID: serverID,
      })
    );
    socket.end();
  } else {
    let server = new net.Socket();
    server.connect(PORT_CON, IP_CON);
    server.write(
      JSON.stringify({
        type: "decreaseSeats",
        amount: amount,
        serverID: serverID,
        isCoordinator: coordinator,
      })
    );
    server.end();
  }
}

function amountVerify(amount, serverID) {
  if (amount < seats) {
    console.log(amount, seats);

    coordinator = false;
    const socket = new net.Socket();
    socket.connect(PORT_CON, IP_CON);
    socket.write(
      JSON.stringify({
        type: "verify",
      })
    );
    socket.end();
  } else {
    console.log("não é");
  }
}
