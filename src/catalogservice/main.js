const express = require("express");
const cors = require("cors");

const { getBooksHandler, getBookHandler } = require("./handlers");

const app = express();
app.use(cors());

const port = 8082;

app.get("/api/books", getBooksHandler);
app.get("/api/books/:id", getBookHandler);

app.listen(port, () => {
  console.log(`Book Catalog Service listening at http://localhost:${port}`);
});
