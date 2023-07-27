import { useEffect, useState } from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";
import { ShoppingCartOutlined } from "@ant-design/icons";
import axios from "axios";

import Book from "../types/Book";
import CartItem from "../types/CartItem";
import { useCart } from "../hooks/useCart";
import CheckoutButton from "./CheckoutButton";
import "./BookList.css";

function BookList() {
  // const history = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const { cart, addBookToCart, increaseQuantity, decreaseQuantity } = useCart();

  useEffect(() => {
    // 调用获取书籍列表的接口
    const fetchBooks = async () => {
      const res = await axios.get("http://localhost:8082/api/books");
      setBooks(res.data as Book[]);
    };

    fetchBooks();
  }, []);

  const addToCart = (book: Book) => {
    addBookToCart({
      // 将 book 转换成 cartItem
      id: book.id,
      title: book.title,
      cover_url: book.cover_url,
      price: book.price,
    } as CartItem);
  };

  return (
    <ul className="book-list">
      <CheckoutButton />
      {books.map((book) => {
        const bookInCart = cart.find((item) => item.id === book.id);
        return (
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
                    {bookInCart ? (
                      <>
                        <Button
                          size="small"
                          onClick={() => decreaseQuantity(book.id)}
                        >
                          -
                        </Button>
                        <span className="quantity-tag">
                          {bookInCart.quantity}
                        </span>
                        <Button
                          size="small"
                          onClick={() => increaseQuantity(book.id)}
                        >
                          +
                        </Button>
                      </>
                    ) : (
                      <Button
                        icon={<ShoppingCartOutlined />}
                        onClick={() => addToCart(book)}
                      >
                        加入购物车
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default BookList;