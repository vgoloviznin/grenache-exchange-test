# Simple distributed order matching

## Running

In order to run this engine you need to: 
1. Install packages with `npm i`
2. Run the grenache nodes
   - If you don't have grenache locally, run `npm i -g grenache-grape`
   - Start two grenache nodes:
     - `grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'`
     - `grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'`
3. Start a client that will generate market orders with `npm run start:client`. You can start several clients at once
4. You can run tests with `npm run test`

## Considerations

- It looks like Grenache framework `map` function executes client requests in the correct order, but I couldn't find documentation to suuport this idea (although may be DHT does it out of the box). I've added a simple blockchain mechanism to ensure the order of orders is correct when multiple clients are creating orders at the same time.
- Orderbook model doesn't contain any currencies for simplicity and doesn't match orders with clients - so ne client can close his own orders. In a real-world scenario, there should be a check for clients (or may be even not allowing to create new orders while current one is not closed for a client). Currencies can be handled in various ways, by storing all currencies altogether or creating separate orderbook per currency.
- I've used orderd arrays for storing buy and sell orders and filtering to find matching orders, which might not provide great performance for real-world scenarios. A tree-like structure might be more suitable for storing orders.
- More unit tests can be added to validate correct order matching and orderbook functionality. e2e tests can be added to validate distributed processing and client orderbook update mechanism.
- Config is hard-coded in the `configs/config.js`, but should be done via env variables and not stored in git. I omitted this for speed of development.
- I didn't implement error handling on node disconnect\shutdown.

## Faced issues

- Looks like there's a limitation for amount of data that can be stored in the network - 1000 bytes (https://www.npmjs.com/package/bittorrent-dht#dhtputopts-callback) and I don't see how to go around it without creating some logic of splitting the stringified orderbook into chunks. Although the `history` is not needed in the orderbook, it can be possible that it will still grow and exceed this limitation.
- If there was an error during `link.put` operation, it's not returned in the error callback, but instead is returned as a value from the function. The messsage that I get is `key v must be less than 1000 bytes in put()`. I've tried increasing the request payload size with `--check_maxPayloadSize` option for grape, but it didn't do anything
- although there's a `stopAnnouncing` function on the Link, but it works for the local link and I couldn't find a way to remove the node from the network, so that when a client is stopped, processor will not send data to it without getting an error, seems like it's only prossible to configure when launching grape node.
