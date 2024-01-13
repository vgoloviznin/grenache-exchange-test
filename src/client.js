'use strict';

const { PeerRPCClient } = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const Orderbook = require('./models/orderbook');
const Client = require('./utils/create-network-client');
const Server = require('./utils/create-network-server');
const config = require('./config/config');

const serverPort = config.randomPort();
console.log('port', serverPort);
const clientOrderbook = new Orderbook();
const client = new Client(config.grape);
const server = new Server(config.grape, serverPort);

setInterval(function () {
  server.link.announce('client:orderbook:set', server.service.port, {});
}, 1000);

server.service.on('request', (rid, key, payload, handler) => {
  server.getAsync(payload).then((data) => {
    // console.log('client:client:orderbook:set orderbook retrieved', data);

    if (data) {
      const updatedBook = JSON.parse(data.v);

      clientOrderbook.setBook(updatedBook);

      handler.reply(null, 'ok');
    }
  }).catch((err) => {
    console.error(`client:client:orderbook:set fetch orderbook error`, err);

    handler.reply(err);
  });
});

setInterval(() => {
  const newOrder = {
    id: Date.now().toString(),
    clientId: `Client_${serverPort}`,
    direction: Math.random() > 0.5 ? 'buy' : 'sell',
    quantity: Math.ceil(Math.random() * 100),
    price: +(Math.random() * 10).toFixed(2)
  };

  clientOrderbook.addOrder(newOrder);

  client.peer.request('orderbook:order:create', newOrder, { timeout: 10000 }, (err, data) => {
    if (err) {
      console.error(`orderbook:order:create client error`, err);

      return;
    }
  });
}, 2000)
