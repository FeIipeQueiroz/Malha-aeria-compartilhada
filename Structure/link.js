class Link {
  constructor(nodeA, nodeB, valor, tempo) {
    this.nodeA = nodeA;
    this.nodeB = nodeB;
    this.valor = valor;
    this.tempo = tempo;
  }

  getNodeA() {
    return this.nodeA;
  }

  getNodeB() {
    return this.nodeB;
  }
}

module.exports = Link;
