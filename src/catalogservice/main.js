const express = require("express");
const cors = require("cors");

const {
  getBookListHandler,
  getBookDetailHandler,
  getBookBatchHandler,
} = require("./handlers");

const app = express();
app.use(cors());

const port = 8082;

app.get("/api/books", getBookListHandler);
app.get("/api/books/:id", getBookDetailHandler);
// 批量查询书籍信息
app.get("/api/books/batch", getBookBatchHandler);

app.listen(port, () => {
  console.log(`Book Catalog Service listening at http://localhost:${port}`);
});
