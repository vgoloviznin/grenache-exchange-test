const { createHash } = require('crypto');
module.exports = class Order {
  constructor(previousHash, data) {
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return createHash('sha256').update(`${this.previousHash}${JSON.stringify(this.data)}`).digest('hex');
  }
}