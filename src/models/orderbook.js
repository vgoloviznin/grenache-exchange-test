module.exports = class Orderbook {
  book = {
    buy: [],
    sell: [],
    history: []
  };

  addSellOrder(order) {
    this.book.sell.push(order);

    this.book.sell.sort((a, b) => {
      return a.price - b.price;
    })
  }

  addBuyOrder(order) {
    this.book.buy.push(order);

    this.book.buy.sort((a, b) => {
      return b.price - a.price;
    })
  }

  matchOrder(orders, newOrder) {
    const toClose = [];

    for (let i = 0; i < orders.length; i += 1) {
      const order = orders[i];

      if (order.quantity > newOrder.quantity) {
        // found order covers new order with remainder
        order.quantity -= newOrder.quantity;
        newOrder.quantity = 0;

        break;
      } else if (order.quantity === newOrder.quantity) {
        // found order fully covers new order
        toClose.push(order.id);
        newOrder.quantity = 0;

        break;
      } else {
        // found order partially covers new order
        toClose.push(order.id);

        newOrder.quantity -= order.quantity;
      }
    }

    return {
      toClose,
      updatedOrder: newOrder
    };
  }
  
  addOrder(newOrder) {
    this.book.history.push(newOrder);

    if (newOrder.direction === 'buy') {
      const sellOrders = this.book.sell.filter((f) => f.price <= newOrder.price);

      console.log('sell orders', sellOrders);

      const { toClose, updatedOrder } = this.matchOrder(sellOrders, newOrder);

      if (toClose.length > 0) {
        this.book.sell = this.book.sell.filter((f) => !toClose.includes(f.id));
      }

      console.log('toClose', toClose, updatedOrder);

      if (updatedOrder.quantity > 0) {
        this.addBuyOrder(updatedOrder);
      }
    } else {
      const buyOrders = this.book.buy.filter((f) => f.price >= newOrder.price);

      console.log('buy orders', buyOrders);

      const { toClose, updatedOrder } = this.matchOrder(buyOrders, newOrder);

      if (toClose.length > 0) {
        this.book.buy = this.book.buy.filter((f) => !toClose.includes(f.id));
      }

      console.log('toClose', toClose, updatedOrder);

      if (updatedOrder.quantity > 0) {
        this.addBuyOrder(updatedOrder);
      }
    }
  }

  setBook(newBook) {
    this.book = newBook;

    console.log('updated orderbook', newBook);
  }

  getSerialized() {
    return JSON.stringify(this.book);
  }
}