import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const BookDetail = ({ match }) => {
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      const res = await axios.get(
        `http://localhost:3001/books/${match.params.id}`
      );
      setBook(res.data);
    };

    fetchBook();
  }, [match.params.id]);

  const handleBuy = () => {
    // 我们可以将书籍id保存到localStorage，然后在下单页面获取
    localStorage.setItem("book_to_buy", match.params.id);
  };

  return (
    <div>
      {book && (
        <div>
          <h1>{book.title}</h1>
          <p>{book.description}</p>
          <button onClick={handleBuy}>
            <Link to="/order">Buy Now</Link>
          </button>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
