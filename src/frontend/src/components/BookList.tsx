import { useEffect, useState } from "react";
import { Button } from "antd";
import axios from "axios";
import Book from "../types/Book";
import CartItem from "../types/CartItem";
import "./BookList.css";
import { Link, useNavigate } from "react-router-dom";

function BookList() {
  const history = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    // 调用获取书籍列表的接口
    const fetchBooks = async () => {
      const res = await axios.get("http://localhost:8082/api/books");
      setBooks(res.data as Book[]);
    };

    fetchBooks();
  }, []);

  const addToCart = (book: Book) => {
    // cart 是一个数组，里面存放的是 book 对象
    console.log("addToCart ", book);
    let cartstr = localStorage.getItem("cart");
    let cart = cartstr ? (JSON.parse(cartstr) as CartItem[]) : [];
    // 如果 cart 中已经存在 book，那么就将 book 的数量 +1
    let cartItem = cart.find((item) => item.id === book.id);
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      // cart 中没有 book，那么就将 book 添加到 cart 中
      cartItem = {
        // 将 book 转换成 cartItem
        id: book.id,
        title: book.title,
        price: book.price,
        quantity: 1,
      } as CartItem;
      cart.push(cartItem);
    }
    console.log("cart ", cart);
    localStorage.setItem("cart", JSON.stringify(cart));
    history("/cart");
  };

  return (
    <ul className="book-list">
      {books.map((book) => (
        <li className="book-item" key={book.id}>
          <div className="inner">
            <div className="cover shadow-cover">
              <Link to={`/books/${book.id}`} className="pic" target="_blank">
                <span className="cover-label"></span>
                <img src={book.cover_url} alt={book.title} />
              </Link>
            </div>

            <div className="info">
              <h3 className="title">
                <Link
                  to={`/books/${book.id}`}
                  title={book.title}
                  className="title-container"
                >
                  <span className="title-text">{book.title}</span>
                </Link>
              </h3>
              <div className="author">
                <span className="">{book.author}</span>
              </div>
              <Link to={`/books/${book.id}`} className="intro">
                <span className="intro-text">{book.description}</span>
              </Link>
              <div className="actions">
                <div className="actions-left">
                  <span className="sale">
                    <span className="price-tag">
                      <span className="rmb-tag">￥</span>
                      <span className="discount-price">
                        {(book.price / 100).toFixed(2)}
                      </span>
                    </span>
                  </span>
                </div>
                <div className="actions-right">
                  <Button onClick={() => addToCart(book)}>加入购物车</Button>
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default BookList;
