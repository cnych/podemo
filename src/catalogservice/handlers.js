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

const getBooksHandler = (req, res) => {
  db.query(
    "SELECT id, title, cover_url, author, price FROM books",
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(result);
    }
  );
};

const getBookHandler = (req, res) => {
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

module.exports = {
  getBooksHandler,
  getBookHandler,
};
