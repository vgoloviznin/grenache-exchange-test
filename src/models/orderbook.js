module.exports = class Orderbook {
  book = {
    buy: [],
    sell: [],
    history: []
  };

  getLatestOrderHash() {
    if (this.book.history.length === 0) {
      return '';
    }

    return this.book.history[this.book.history.length - 1].previousHash;
  }

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
    const newOrderCopy = { ...newOrder };

    for (let i = 0; i < orders.length; i += 1) {
      const order = orders[i];

      if (order.quantity > newOrderCopy.quantity) {
        // found order covers new order with remainder
        order.quantity -= newOrderCopy.quantity;
        newOrderCopy.quantity = 0;

        break;
      } else if (order.quantity === newOrderCopy.quantity) {
        // found order fully covers new order
        toClose.push(order.id);
        newOrderCopy.quantity = 0;

        break;
      } else {
        // found order partially covers new order
        toClose.push(order.id);

        newOrderCopy.quantity -= order.quantity;
      }
    }

    return {
      toClose,
      updatedOrder: newOrderCopy
    };
  }
  
  addOrder(newOrder) {
    this.book.history.push(newOrder);
    
    const { data } = newOrder;

    if (data.direction === 'buy') {
      const sellOrders = this.book.sell.filter((f) => f.price <= data.price);

      const { toClose, updatedOrder } = this.matchOrder(sellOrders, data);

      if (toClose.length > 0) {
        this.book.sell = this.book.sell.filter((f) => !toClose.includes(f.id));
      }

      if (updatedOrder.quantity > 0) {
        this.addBuyOrder(updatedOrder);
      }
    } else {
      const buyOrders = this.book.buy.filter((f) => f.price >= data.price);

      const { toClose, updatedOrder } = this.matchOrder(buyOrders, data);

      if (toClose.length > 0) {
        this.book.buy = this.book.buy.filter((f) => !toClose.includes(f.id));
      }

      if (updatedOrder.quantity > 0) {
        this.addBuyOrder(updatedOrder);
      }
    }
  }

  setBook(newBook) {
    this.book = newBook;
  }
}