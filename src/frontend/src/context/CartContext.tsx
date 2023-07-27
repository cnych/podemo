import { createContext, useState, useEffect } from "react";
import CartItem from "../types/CartItem";

export const CartContext = createContext({
  cart: [] as CartItem[], // 购物车中的书籍
  cartCount: 0, // 购物车中书籍的数量
  addBookToCart: (book: CartItem) => {}, // 添加书籍到购物车
  clearCart: () => {}, // 清空购物车
  increaseQuantity: (bookId: number) => {}, // 增加书籍的数量
  decreaseQuantity: (bookId: number) => {}, // 减少书籍的数量
});

const getCartCount = (cart: CartItem[]) => {
  let count = 0;
  cart.forEach((item) => {
    count += item.quantity;
  });
  return count;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  // 从 localStorage 中获取初始购物车数据
  const cartInStorage = localStorage.getItem("cart");
  const initialCart = cartInStorage
    ? (JSON.parse(cartInStorage) as CartItem[])
    : [];

  // 现在，useState 会用从 localStorage 获取的初始状态初始化 cart
  //   这样第二个 useEffect 在第一次渲染时就不会触发。
  //当 cart 实际变化时，才会触发第二个 useEffect，更新 localStorage 的值，并重新计算购物车的数量。
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [cartCount, setCartCount] = useState(getCartCount(initialCart));

  // 将购物车状态保存到localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount(getCartCount(cart));
  }, [cart]);

  const addBookToCart = (book: CartItem) => {
    setCart((prevCart) => {
      // 如果购物车已经有这本书，那么增加它的数量
      const existingBook = prevCart.find((item) => item.id === book.id);
      if (existingBook) {
        return prevCart.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // 否则，添加这本新书到购物车
      return [...prevCart, { ...book, quantity: 1 }];
    });
  };

  // 清空购物车
  const clearCart = () => {
    setCart([]);
  };

  const increaseQuantity = (bookId: number) => {
    let cartItem = cart.find((item) => item.id === bookId);
    if (cartItem) {
      cartItem.quantity += 1;
      setCart([...cart]); // 更新状态以触发重新渲染
    }
  };

  const decreaseQuantity = (bookId: number) => {
    let cartItemIndex = cart.findIndex((item) => item.id === bookId);
    if (cartItemIndex !== -1) {
      cart[cartItemIndex].quantity -= 1;
      if (cart[cartItemIndex].quantity === 0) {
        // 当数量为 0 时，从购物车中移除这本书
        cart.splice(cartItemIndex, 1);
      }
      // 更新状态以触发重新渲染
      setCart([...cart]);
    }
  };

  const value = {
    cart,
    cartCount,
    addBookToCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
