module.exports = {
  grape: 'http://127.0.0.1:30001',
  randomPort: () => 3000 + Math.floor(Math.random() * 1000),
}