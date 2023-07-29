import React, { useState, useEffect } from "react";
import type { TabsProps } from "antd";
import { Tabs, message, Empty, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import StickyBox from "react-sticky-box";
import axios from "axios";
import OrderAction from "../components/OrderAction";
import OrderTable from "../components/OrderTable";
import { useAuth } from "../hooks/useAuth";
import { OrderStatus } from "../types/Enum";
import "./Order.css";

export const Order: React.FC = () => {
  const history = useNavigate();
  const [orderList, setOrderList] = useState([]); // 订单列表
  const [needRefresh, setNeedRefresh] = useState(false); // 是否需要刷新订单列表
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
          setOrderList(res.data);
        } catch (err: any) {
          if (err.response && err.response.status === 401) {
            message.error("请先登录");
            history("/auth");
            return;
          }
          console.log(err);
          message.error("获取订单列表失败");
        }
      } else {
        message.error("请先登录");
        history("/auth");
        return;
      }
    };
    getOrderList();
  }, [user, isLoading, needRefresh, history]);

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

    const triggerRefresh = () => {
      setNeedRefresh(!needRefresh);
    };

    return orders.map((order: any) => {
      return (
        <div className="order-item" key={order.id}>
          <div className="order-item-header">
            <span>
              订单编号：
              <Link to={`/order/${order.id}`}>{order.id}</Link>
            </span>
            <span>下单时间：{order.orderDate}</span>
          </div>
          <div className="order-item-body">
            <OrderTable order={order} />
            <div className="order-item-footer">
              <OrderAction order={order} triggerRefresh={triggerRefresh} />
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
      <DefaultTabBar {...props} style={{ background: "#f5f5f5" }} />
    </StickyBox>
  );

  return (
    <div className="order-body">
      <h2 className="hd">订单列表</h2>
      <Tabs defaultActiveKey="1" renderTabBar={renderTabBar} items={items} />
    </div>
  );
};
