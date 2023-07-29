import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Empty, message } from "antd";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Order from "../types/Order";
import OrderAction from "../components/OrderAction";
import OrderTable from "../components/OrderTable";
import "./OrderDeal.css";

export const OrderDeal: React.FC = () => {
  const { id } = useParams();
  const history = useNavigate();
  const [order, setOrder] = useState<Order>();
  const [err, setErr] = useState(""); // 用于标记订单是否存在
  const { isLoading, user } = useAuth();

  useEffect(() => {
    // 调用获取书籍列表的接口
    const fetchOrder = async () => {
      if (isLoading) return;
      if (user && user.token) {
        try {
          const res = await axios.get(
            `http://localhost:8081/api/orders/${id}`,
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
                "Content-Type": "application/json",
              },
            }
          );
          setOrder(res.data);
        } catch (err: any) {
          console.log(err);
          if (err.response && err.response.status === 401) {
            message.error("请先登录");
            history("/auth");
            return;
          } else if (err.response && err.response.status === 404) {
            message.error("订单不存在");
            setErr("订单不存在");
          } else {
            message.error("获取订单信息失败");
            setErr("获取订单信息失败");
          }
        }
      } else {
        message.error("请先登录");
        history("/auth");
        return;
      }
    };
    fetchOrder();
  }, [id, user, isLoading, history]); // 每当 user 或者 id 值改变时，useEffect 都会执行。

  return (
    <div className="deal-body">
      {err && order == null ? (
        <Empty description={err} style={{ marginTop: "100px" }}>
          <Button onClick={(e) => history("/")} type="primary">
            选购书籍
          </Button>
        </Empty>
      ) : (
        <>
          <h2 className="hd">订单信息</h2>
          <div className="section">
            <div className="title">收货人信息</div>
            <div>收货信息</div>
          </div>
          <div className="section">
            <div className="title">购买书籍</div>
            {order && <OrderTable order={order} />}
          </div>
          <div className="section">
            <div className="coupons">
              <div className="coupon-section">
                <div className="title">平台优惠券</div>
                <div className="subtitle">暂无可用优惠券</div>
              </div>
            </div>
          </div>
          <div className="deal-footer">
            <div className="wrapper">
              <div className="left">
                <span className="footer-label">
                  商品总价
                  <em>
                    ¥{order?.amount ? (order.amount / 100).toFixed(2) : "0.00"}
                  </em>
                </span>
                <span className="footer-label">
                  优惠券<em className="no-offset">无可用</em>
                </span>
                <span className="footer-label">
                  快递费<em className="no-offset">已包邮</em>
                </span>
              </div>
              <div className="right">
                {order && <OrderAction order={order} />}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
