import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await axios.get("http://localhost:3001/books");
      setBooks(res.data);
    };
    fetchBooks();
  }, []);

  return (
    <div>
      <h1>Bookstore</h1>
      <div>
        {books.map((book) => (
          <div key={book.id}>
            <Link to={`/book/${book.id}`}>{book.title}</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
