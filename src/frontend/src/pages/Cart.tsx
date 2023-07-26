import React, { useState, useEffect } from "react";
import { Table, Button } from "antd";
import CartItem from "../types/CartItem";

export const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState([] as CartItem[]);

  useEffect(() => {
    // 获取购物车数据
    const cart = localStorage.getItem("cart");
    const cartData = cart ? JSON.parse(cart) : [];
    setCartItems(cartData);
  }, []);

  const handleIncrease = (index: number) => {
    const newCartItems = [...cartItems];
    newCartItems[index].quantity += 1;
    setCartItems(newCartItems);
    localStorage.setItem("cart", JSON.stringify(newCartItems));
  };

  const handleDecrease = (index: number) => {
    const newCartItems = [...cartItems];
    if (newCartItems[index].quantity > 1) {
      newCartItems[index].quantity -= 1;
    } else if (newCartItems[index].quantity === 1) {
      newCartItems.splice(index, 1);
    } else {
      return;
    }
    setCartItems(newCartItems);
    localStorage.setItem("cart", JSON.stringify(newCartItems));
  };

  const columns = [
    { title: "书名", dataIndex: "title", key: "title" },
    {
      title: "价格",
      dataIndex: "price",
      key: "price",
      render: (price: any) => `￥${(price / 100).toFixed(2)}`,
    },
    {
      title: "数量",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: any, _: any, index: number) => {
        return (
          <div>
            <Button
              type="primary"
              size="small"
              onClick={() => handleDecrease(index)}
            >
              -
            </Button>
            <span style={{ margin: "0 10px" }}>{quantity}</span>
            <Button
              type="primary"
              size="small"
              onClick={() => handleIncrease(index)}
            >
              +
            </Button>
          </div>
        );
      },
    },
    {
      title: "金额",
      key: "amount",
      render: (_: any, record: any) => (
        <span>￥{((record.price * record.quantity) / 100).toFixed(2)}</span>
      ),
    },
  ];

  return <Table dataSource={cartItems} columns={columns} rowKey="id" />;
};
