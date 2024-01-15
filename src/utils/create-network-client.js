const { PeerRPCClient } = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');
const { promisify } = require('util');

module.exports = class Client {
  constructor(grape) {
    this.link = new Link({
      grape
    })
    this.link.start();

    this.peer = new PeerRPCClient(this.link, {})
    this.peer.init();
  }
}