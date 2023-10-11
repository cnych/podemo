const express = require("express");
const cors = require("cors");
const { tracer } = require("./tracer");
const { meter } = require("./meter");
const {
  getBookListHandler,
  getBookDetailHandler,
  getBookBatchHandler,
} = require("./handlers");

const app = express();
app.use(cors());

const port = 8082;

app.get("/api/books", getBookListHandler);
// 批量查询书籍信息
app.get("/api/books/batch", getBookBatchHandler);
app.get("/api/books/:id", getBookDetailHandler);

app.listen(port, () => {
  console.log(`Book Catalog Service listening at http://localhost:${port}`);
});
