const Node = require("./node");
class Link {
  constructor(origem, destino, valor, tempo, company) {
    this.Origem = origem;
    this.Destino = destino;
    this.valor = valor;
    this.tempo = tempo;
    this.company = company;
    this.seats = 5;
  }

  getOrigem() {
    return this.Origem;
  }

  getDestino() {
    return this.Destino;
  }
}

module.exports = Link;
