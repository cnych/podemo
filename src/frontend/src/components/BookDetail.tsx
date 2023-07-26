import React, { useEffect, useState } from "react";
import { Card } from "antd";
import axios from "axios";
import { useParams } from "react-router-dom";
import Book from "../types/Book";

function BookDetail() {
  const [book, setBook] = useState<Book>({} as Book);
  const { id } = useParams<any>();

  useEffect(() => {
    // 调用获取书籍详情的接口
    const fetchBook = async () => {
      const res = await axios.get(`/api/books/${id}`);
      setBook(res.data);
    };

    fetchBook();
  }, [id]);

  return (
    <div>
      {book && (
        <Card title={book.title}>
          <p>{book.author}</p>
          <p>{book.description}</p>
        </Card>
      )}
    </div>
  );
}

export default BookDetail;
