import React, { useEffect, useState } from "react";
import axios from "axios";

const Order = () => {
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      const id = localStorage.getItem("book_to_buy");
      const res = await axios.get(`http://localhost:3001/books/${id}`);
      setBook(res.data);
    };

    fetchBook();
  }, []);

  const handleOrder = async () => {
    try {
      // 我们假设用户在登录后会保存token到localStorage
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("book_to_buy");
      const res = await axios.post(
        "http://localhost:3001/order",
        { bookId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(res.data); // 根据你的业务逻辑处理下单成功的情况
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {book && (
        <div>
          <h1>Order</h1>
          <p>You are buying: {book.title}</p>
          <button onClick={handleOrder}>Place Order</button>
        </div>
      )}
    </div>
  );
};

export default Order;
