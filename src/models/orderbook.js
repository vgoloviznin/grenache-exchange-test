module.exports = class Orderbook {
  book = {
    buy: [],
    sell: []
  };
  
  addOrder(newOrder) {
    if (newOrder.direction === 'buy') {
      this.book.buy.push(newOrder);
    } else {
      this.book.sell.push(newOrder);
    }
  }

  setBook(newBook) {
    this.book = newBook;
  }

  getSerialized() {
    return JSON.stringify(this.book);
  }
}