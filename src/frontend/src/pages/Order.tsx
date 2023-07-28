import React, { useState, useEffect } from "react";
import type { TabsProps } from "antd";
import { Tabs, Table, message, Tag, Empty, Button } from "antd";
import { useNavigate } from "react-router-dom";
import StickyBox from "react-sticky-box";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { OrderStatus } from "../types/Enum";
import "./Order.css";

export const Order: React.FC = () => {
  const history = useNavigate();
  const [orderList, setOrderList] = useState([]); // 订单列表
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // 获取订单列表
    const getOrderList = async () => {
      if (isLoading) return;
      if (user && user.token) {
        try {
          const res = await axios.get(`http://localhost:8081/api/orders`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          });
          console.log(res);
          if (res.data) {
            setOrderList(res.data);
          }
        } catch (err: any) {
          console.log(err);
          message.error("获取订单列表失败");
        }
      }
    };
    getOrderList();
  }, [user, isLoading]);

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

  const renderOrderList = (orders: any[]) => {
    if (orders.length === 0) {
      return (
        <Empty description="暂无相关订单信息" style={{ marginTop: "100px" }}>
          <Button onClick={(e) => history("/")} type="primary">
            选购书籍
          </Button>
        </Empty>
      );
    }
    const renderStatus = (status: number) => {
      switch (status) {
        case OrderStatus.Pending:
          return <Tag color="red">待支付</Tag>;
        case OrderStatus.Paid:
          return <Tag color="gold">待发货</Tag>;
        case OrderStatus.Deliverd:
          return <Tag color="lime">已发货</Tag>;
        case OrderStatus.Completed:
          return <Tag color="green">已完成</Tag>;
        case OrderStatus.Canceled:
          return <Tag color="volcano">已取消</Tag>;
        default:
          return <Tag>未知状态</Tag>;
      }
    };

    return orders.map((order: any) => {
      return (
        <div className="order-item" key={order.id}>
          <div className="order-item-header">
            <span>订单编号：{order.id}</span>
            <span>下单时间：{order.orderDate}</span>
          </div>
          <div className="order-item-body">
            <Table
              key={order.id}
              columns={columns}
              dataSource={order.books}
              pagination={false}
            />
            <div className="order-item-footer">
              <span>
                总金额：<em>￥{(order.amount / 100).toFixed(2)}</em>
              </span>
              <span>订单状态：{renderStatus(order.status)}</span>
            </div>
          </div>
        </div>
      );
    });
  };

  const filterOrderList = (status: number) => {
    return orderList.filter((order: any) => order.status === status);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `全部`,
      children: renderOrderList(orderList),
    },
    {
      key: "2",
      label: `待付款`,
      children: renderOrderList(filterOrderList(OrderStatus.Pending)),
    },
    {
      key: "3",
      label: `待发货`,
      children: renderOrderList(filterOrderList(OrderStatus.Paid)),
    },
    {
      key: "4",
      label: `已发货`,
      children: renderOrderList(filterOrderList(OrderStatus.Deliverd)),
    },
    {
      key: "5",
      label: `已完成`,
      children: renderOrderList(filterOrderList(OrderStatus.Completed)),
    },
    {
      key: "6",
      label: `已取消`,
      children: renderOrderList(filterOrderList(OrderStatus.Canceled)),
    },
  ];

  const renderTabBar: TabsProps["renderTabBar"] = (props, DefaultTabBar) => (
    <StickyBox offsetTop={0} offsetBottom={20} style={{ zIndex: 1 }}>
      <DefaultTabBar {...props} />
    </StickyBox>
  );

  return (
    <div className="order-body">
      <h2 className="hd">订单列表</h2>
      <Tabs defaultActiveKey="1" renderTabBar={renderTabBar} items={items} />
    </div>
  );
};
