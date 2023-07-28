const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "otel",
  password: "otel321",
  database: "bookdb",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

const getBookListHandler = (req, res) => {
  db.query(
    "SELECT id, title, cover_url, author, price,description FROM books",
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
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
