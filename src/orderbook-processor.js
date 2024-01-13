'use strict';

const Client = require('./utils/create-network-client');
const Server = require('./utils/create-network-server');
const config = require('./config/config');
const Orderbook = require('./models/orderbook');

const port = config.randomPort();
console.log('server port', port);
const server = new Server(config.grape, port);
const client = new Client(config.grape);
const serverBook = new Orderbook();

const queue = [];

setInterval(function () {
  server.link.announce('orderbook:order:create', server.service.port, {});
}, 1000);

server.service.on('request', (rid, key, newOrder, handler) => {
  console.log('server:orderbook:order:create ', rid, key, newOrder);

  queue.push(newOrder);

  handler.reply(null, 'ok');
});

async function processQueue() {
  if (queue.length > 0) {
    const item = queue.shift();

    serverBook.addOrder(item);

    const serialized = serverBook.getSerialized();

    const key = await server.putAsync({ v: serialized });

    await client.mapAsync('client:orderbook:set', key, { timeout: 10000 });
  }

  initQueueProcessing();
}

function initQueueProcessing() {
  setTimeout(() => {
    processQueue().catch((err) => {
      console.error(`Queue error`, err);
    });
  }, 1000)
}

initQueueProcessing();