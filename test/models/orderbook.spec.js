const Orderbook = require('../../src/models/orderbook');

describe('Orderbook test', () => {
  let book;

  beforeEach(() => {
    book = new Orderbook();
  });

  describe('addOrder test', () => {
    it('adds order to empty book', () => {
      const newOrder = {
        id: Date.now().toString(),
        clientId: '1',
        direction: 'buy',
        quantity: 1,
        price: 1
      };

      book.addOrder(newOrder);

      expect(book.book).toStrictEqual({
        sell: [],
        buy: [newOrder],
        history: [newOrder]
      });
    });

    it('partially matches sell order', () => {
      const newOrder = {
        id: Date.now().toString(),
        clientId: '1',
        direction: 'sell',
        quantity: 1,
        price: 1
      };
      const existingOrder = {
        id: '1',
        clientId: '1',
        direction: 'buy',
        quantity: 2,
        price: 2
      };

      book.addOrder(existingOrder);
      book.addOrder(newOrder);

      expect(book.book).toStrictEqual({
        history: [existingOrder, newOrder],
        buy: [{
          id: '1',
          clientId: '1',
          direction: 'buy',
          quantity: 1,
          price: 2
        }],
        sell: []
      })
    })
  });

  describe('addSellOrder test', () => {
    it('adds 2 orders with correct ordering', () => {
      const newOrder1 = {
        id: Date.now().toString(),
        clientId: '1',
        direction: 'sell',
        quantity: 1,
        price: 2
      };
      const newOrder2 = {
        id: Date.now().toString(),
        clientId: '1',
        direction: 'sell',
        quantity: 1,
        price: 1
      };

      book.addSellOrder(newOrder1);
      book.addSellOrder(newOrder2);

      expect(book.book).toStrictEqual({
        buy: [],
        history: [],
        sell: [newOrder2, newOrder1]
      });
    });
  });

  describe('matchOrder test', () => {
    it('correctly does match with partial order', () => {
      const newOrder = {
        id: Date.now().toString(),
        clientId: '1',
        direction: 'sell',
        quantity: 1,
        price: 1
      };
      const orders = [{
        id: '1',
        clientId: '1',
        direction: 'buy',
        quantity: 2,
        price: 2
      }];
      

      const { toClose, updatedOrder } = book.matchOrder(orders, newOrder);

      expect(toClose).toStrictEqual([]);
      expect(updatedOrder).toStrictEqual({ ...newOrder, quantity: 0 });
    });
  });
});