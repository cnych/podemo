import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export const OrderDeal: React.FC = () => {
  let { id } = useParams();
  const [order, setOrder] = useState(null);
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    // 调用获取书籍列表的接口
    const fetchOrder = async () => {
      if (user && user.token) {
        console.log("user=", user);
        const res = await axios.get(`http://localhost:8081/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });
        console.log(res.data);
      }
    };
    fetchOrder();
  }, [id, user]); // 每当 user 或者 id 值改变时，useEffect 都会执行。

  return (
    <>
      <h2>确认订单信息</h2>
      <div>
        <p>收货人信息</p>
        <div>收货信息</div>
      </div>
      <div>
        <p>购买书籍</p>
      </div>
    </>
  );
};
