const mysql = require("mysql");
const { SpanStatusCode, context, propagation } = require("@opentelemetry/api");

const { tracer } = require("./tracer");
const { meter } = require("./meter");

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

const reqCounter = meter.createCounter("request_counter", {
  description: "Count all incoming requests",
});

const getBookListHandler = (req, res) => {
  // 从请求的 headers 中提取 trace context
  const activeContext = propagation.extract(context.active(), req.headers);
  // 将提取的 trace context 设置为当前的 context，并开始一个新的 span
  const span = tracer.startSpan("getBookListHandler", {}, activeContext);
  console.log(req.path, req.method, res.statusCode);
  // 记录请求的 path、method、status code
  reqCounter.add(1, {
    path: req.path,
    method: req.method,
    code: res.statusCode,
  });

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
  // 记录请求的 path、method、status code
  reqCounter.add(1, {
    path: req.path,
    method: req.method,
    code: res.statusCode,
  });

  // 从请求的 headers 中提取 trace context
  const activeContext = propagation.extract(context.active(), req.headers);
  // 将提取的 trace context 设置为当前的 context，并开始一个新的 span
  const span = tracer.startSpan("getBookBatchHandler", {}, activeContext);
  const { ids } = req.query;
  const idsArray = ids.split(",").map((id) => parseInt(id));
  // 记录请求中的 ids
  span.setAttribute("ids", ids);
  db.query(
    "SELECT id, title, cover_url, author, price, description FROM books WHERE id IN (?)",
    [idsArray],
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
      span.addEvent("Got book batch");
      span.setStatus({
        code: SpanStatusCode.OK,
        message: "Success",
      });
      span.end();
      res.json(result);
    }
  );
};

module.exports = {
  getBookListHandler,
  getBookDetailHandler,
  getBookBatchHandler,
};
