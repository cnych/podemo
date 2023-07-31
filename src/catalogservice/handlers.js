const mysql = require("mysql");
const { SpanStatusCode } = require("@opentelemetry/api");
const { tracer } = require("./tracer");

const db = mysql.createConnection({
  // 从环境变量中读取数据库连接信息
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "otel",
  password: process.env.DB_PASSWORD || "otel321",
  database: process.env.DB_NAME || "bookdb",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

const getBookListHandler = (req, res) => {
  const span = tracer.startSpan("getBookList");
  db.query(
    "SELECT id, title, cover_url, author, price,description FROM books",
    (err, result) => {
      if (err) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: err.message,
        });
        span.end();
        res.status(500).json({ error: err.message });
        return;
      }
      span.setAttribute("book.count", result.length);
      span.addEvent("Got book list");
      span.setStatus({
        code: SpanStatusCode.OK,
        message: "Success",
      });
      span.end();
      res.json(result);
    }
  );
};

const getBookDetailHandler = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT id, title, cover_url, author, price, description FROM books WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (result.length === 0) {
        res.status(404).json({ error: "Book not found" });
        return;
      }
      const book = result[0];
      res.json(book);
    }
  );
};

const getBookBatchHandler = (req, res) => {
  const { ids } = req.query;
  const idsArray = ids.split(",").map((id) => parseInt(id));
  db.query(
    "SELECT id, title, cover_url, author, price, description FROM books WHERE id IN (?)",
    [idsArray],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(result);
    }
  );
};

module.exports = {
  getBookListHandler,
  getBookDetailHandler,
  getBookBatchHandler,
};
