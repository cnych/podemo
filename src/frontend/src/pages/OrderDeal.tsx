import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, message } from "antd";
import { PayCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Order from "../types/Order";
import { OrderStatus } from "../types/Enum";
import "./OrderDeal.css";

export const OrderDeal: React.FC = () => {
  const { id } = useParams();
  const history = useNavigate();
  const [order, setOrder] = useState<Order>();
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
          if (res.data) {
            setOrder(res.data);
          } else {
            message.error("获取订单信息失败");
          }
        } catch (err) {
          console.log(err);
          message.error("获取订单信息失败");
        }
      } else {
        message.error("请先登录");
        history("/auth");
        return;
      }
    };
    fetchOrder();
  }, [id, user]); // 每当 user 或者 id 值改变时，useEffect 都会执行。

  const columns = [
    {
      title: "书名",
      dataIndex: "title",
      key: "title",
      render: (_: any, record: any) => {
        return (
          <div className="cart-item">
            <img src={record.cover_url} alt={record.title} />
            <span>{record.title}</span>
          </div>
        );
      },
    },
    {
      title: "单价（元）",
      dataIndex: "price",
      key: "price",
      render: (price: any) => `￥${(price / 100).toFixed(2)}`,
    },
    {
      title: "数量",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "小计（元）",
      key: "amount",
      render: (_: any, record: any) => (
        <span className="price-tag">
          ￥{((record.price * record.quantity) / 100).toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div className="deal-body">
      <h2 className="hd">确认订单信息</h2>
      <div className="section">
        <div className="title">收货人信息</div>
        <div>收货信息</div>
      </div>
      <div className="section">
        <div className="title">购买书籍</div>
        <Table
          dataSource={order?.books}
          columns={columns}
          rowKey="id"
          pagination={{ hideOnSinglePage: true }}
        />
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
            <span className="result">
              <em>
                共计<b className="quantity">{order?.total ? order.total : 0}</b>
                件商品
              </em>
              <em>
                应付总额: 
                <b className="amount-real">
                  ¥{order?.amount ? (order.amount / 100).toFixed(2) : "0.00"}
                </b>
              </em>
            </span>
            {order?.status === OrderStatus.Pending && (
              <>
                <Button
                  danger
                  type="dashed"
                  shape="round"
                  style={{ margin: "0 10px" }}
                >
                  取消订单
                </Button>
                <Button
                  danger
                  shape="round"
                  // onClick={(e) => handleCheckout()}
                  // loading={checkoutLoading}
                  icon={<PayCircleOutlined />}
                  type="primary"
                >
                  去支付
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
