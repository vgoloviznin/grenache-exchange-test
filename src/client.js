'use strict';

const { PeerRPCClient } = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const Orderbook = require('./models/orderbook');
const Client = require('./utils/create-network-client');
const Server = require('./utils/create-network-server');
const config = require('./config/config');
const Order = require('./models/order');
const { MESSAGE_TYPES } = require('./utils/constants');

const serverPort = config.randomPort();
console.log('port', serverPort);
const clientOrderbook = new Orderbook();
const client = new Client(config.grape);
const server = new Server(config.grape, serverPort);

server.link.startAnnouncing('client', server.service.port, {});

server.service.on('request', (rid, key, payload, handler) => {
  const { type } = payload;

  if (type === MESSAGE_TYPES.INIT) {
    return handler.reply(null, { book: clientOrderbook.book });
  } else if (type === MESSAGE_TYPES.NEW_ORDER) {
    const { order } = payload;
    
    if (order.previousHash !== clientOrderbook.getLatestOrderHash()) {
      return handler.reply(null, 'error');
    }

    clientOrderbook.addOrder(order);

    return handler.reply(null, 'ok');
  }

  return handler.reply(new Error('invalid type'))
});

function createOrder() {
  const latestHash = clientOrderbook.getLatestOrderHash();

  const newOrder = new Order(latestHash, {
    id: Date.now().toString(),
    clientId: `Client_${serverPort}`,
    direction: Math.random() > 0.5 ? 'buy' : 'sell',
    quantity: Math.ceil(Math.random() * 100),
    price: +(Math.random() * 10).toFixed(2)
  });

  client.peer.map('client', { type: MESSAGE_TYPES.NEW_ORDER, order: newOrder }, { timeout: 10000 }, (err, data) => {
    if (err && err.message !== 'ERR_GRAPE_LOOKUP_EMPTY') {
      console.error('new block error', err);

      return;
    }

    console.log(`${serverPort}:`, data);

    const hasError = data && data.some((d) => d === 'error');

    if (!hasError) {
      clientOrderbook.addOrder(newOrder);
    }

    setTimeout(createOrder, 2000);
  });
}

client.peer.request('client', { type: MESSAGE_TYPES.INIT }, { timeout: 1000 }, (err, data) => {
  if (err && err.message !== 'ERR_GRAPE_LOOKUP_EMPTY') {
    console.error('startup error', err);
    process.exit(1);
  }

  if (data && data.book) {
    clientOrderbook.setBook(data.book);
  }

  createOrder();
});
