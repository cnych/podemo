const express = require("express");
const { getBooksHandler, getBookHandler } = require("./handlers");

const app = express();
const port = 8082;

app.get("/books", getBooksHandler);
app.get("/books/:id", getBookHandler);

app.listen(port, () => {
  console.log(`Book Catalog Service listening at http://localhost:${port}`);
});
