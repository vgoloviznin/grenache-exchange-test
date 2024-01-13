'use strict'

const { PeerRPCServer } = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');
const { promisify } = require('util');

module.exports = class Server {
  constructor(grape, port) {
    this.link = new Link({
      grape
    });
    this.link.start();

    this.peer = new PeerRPCServer(this.link, {
      timeout: 300000
    });
    this.peer.init();

    this.service = this.peer.transport('server');
    this.service.listen(port);

    // this.putAsync = promisify(this.link.put);
    // this.putAsync = new Promise((err, res) => {})
    // this.getAsync = promisify(this.link.get);
  }

  putAsync(args) {
    return new Promise((res, rej) => {
      this.link.put(args, (err, data) => {
        if (err) {
          return rej(err);
        }

        return res(data);
      });
    });
  }

  getAsync(args) {
    return new Promise((res, rej) => {
      this.link.get(args, (err, data) => {
        if (err) {
          return rej(err);
        }

        return res(data);
      });
    });
  }
}