import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Empty, Popconfirm, Tag, message } from "antd";
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
  const [err, setErr] = useState(""); // 用于标记订单是否存在
  const [payLoading, setPayLoading] = useState(false); // 用于标记是否正在支付
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
        } catch (err: any) {
          console.log(err);
          if (err.response && err.response.status === 404) {
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

  const confirmCancel = async () => {
    if (isLoading) return;
    if (user && user.token) {
      try {
        const res = await axios.put(
          `http://localhost:8081/api/orders/${id}/cancel`,
          {},
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (res.data) {
          message.success("取消订单成功");
          history("/order");
        } else {
          message.error("取消订单失败");
        }
      } catch (err: any) {
        console.log(err);
        message.error("取消订单失败");
      }
    } else {
      message.error("请先登录");
      history("/auth");
      return;
    }
  };

  const confirmDelete = async () => {
    if (isLoading) return;
    if (user && user.token) {
      try {
        const res = await axios.delete(
          `http://localhost:8081/api/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (res.data) {
          message.success("订单删除成功");
          history("/order");
        } else {
          message.error("订单删除失败");
        }
      } catch (err: any) {
        console.log(err);
        message.error("订单删除失败");
      }
    } else {
      message.error("请先登录");
      history("/auth");
      return;
    }
  };

  const handlePay = async () => {
    if (isLoading) return;
    if (user && user.token) {
      setPayLoading(true);
      try {
        const res = await axios.post(
          `http://localhost:8083/api/payments`,
          {
            order_id: order?.id,
            amount: order?.amount,
            user_id: user.id,
          },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (res.data) {
          message.success("支付成功");
          history("/order");
        } else {
          console.log(res);
          message.error("支付失败");
        }
      } catch (err: any) {
        console.log(err);
        message.error("支付失败");
      }
      setPayLoading(false);
    } else {
      message.error("请先登录");
      history("/auth");
      return;
    }
  };

  const renderAction = () => {
    if (order?.status === OrderStatus.Pending) {
      // 待支付
      return (
        <>
          <Tag color="red">待支付</Tag>
          <Popconfirm
            title="取消订单"
            description="订单一旦取消，将无法恢复，是否确认取消？"
            onConfirm={confirmCancel}
            okText="确定"
            cancelText="取消"
          >
            <Button type="dashed" shape="round" style={{ margin: "0 10px" }}>
              取消订单
            </Button>
          </Popconfirm>
          <Button
            danger
            shape="round"
            onClick={(e) => handlePay()}
            loading={payLoading}
            icon={<PayCircleOutlined />}
            type="primary"
          >
            去支付
          </Button>
        </>
      );
    } else if (order?.status === OrderStatus.Canceled) {
      // 已取消
      return (
        <>
          <Tag color="volcano">已取消</Tag>
          <Popconfirm
            title="删除订单"
            description="订单一旦删除，将无法恢复，是否确认删除？"
            onConfirm={confirmDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button
              danger
              type="primary"
              shape="round"
              style={{ margin: "0 10px" }}
            >
              删除订单
            </Button>
          </Popconfirm>
        </>
      );
    } else if (order?.status === OrderStatus.Paid) {
      // 已支付
      return <Tag color="gold">已支付，等待发货</Tag>;
    } else if (order?.status === OrderStatus.Deliverd) {
      // 已发货
      return (
        <>
          <Tag color="lime">已发货</Tag>
          <Button
            danger
            type="primary"
            shape="round"
            style={{ margin: "0 10px" }}
          >
            确认收货
          </Button>
        </>
      );
    } else if (order?.status === OrderStatus.Completed) {
      // 已完成
      return (
        <>
          <Tag color="green">已完成</Tag>
          <Button type="primary" shape="round" style={{ margin: "0 10px" }}>
            评价
          </Button>
        </>
      );
    }
    return null;
  };

  return (
    <div className="deal-body">
      {err ? (
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
                    共计
                    <b className="quantity">{order?.total ? order.total : 0}</b>
                    件商品
                  </em>
                  <em>
                    应付总额: 
                    <b className="amount-real">
                      ¥
                      {order?.amount ? (order.amount / 100).toFixed(2) : "0.00"}
                    </b>
                  </em>
                </span>
                {renderAction()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
