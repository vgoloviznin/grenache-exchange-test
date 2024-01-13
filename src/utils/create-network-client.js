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

  mapAsync(...args) {
    return new Promise((res, rej) => {
      this.peer.map(...args, (err, data) => {
        if (err) {
          return rej(err);
        }

        return res(data);
      });
    });
  }
}