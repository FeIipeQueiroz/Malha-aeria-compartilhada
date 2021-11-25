const Node = require("./node");
class Link {
  constructor(origem, destino, valor, tempo) {
    this.Origem = origem;
    this.Destino = destino;
    this.valor = valor;
    this.tempo = tempo;
  }

  getOrigem() {
    return this.Origem;
  }

  getDestino() {
    return this.Destino;
  }
}

module.exports = Link;
