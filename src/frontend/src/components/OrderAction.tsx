import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popconfirm, Tag, Button, message } from "antd";
import { PayCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Order from "../types/Order";
import { OrderStatus } from "../types/Enum";
import "./OrderAction.css";

const OrderAction: React.FC<{ order: Order; triggerRefresh?: () => void }> = ({
  order,
  triggerRefresh,
}) => {
  const history = useNavigate();
  const { user, isLoading } = useAuth();
  const [payLoading, setPayLoading] = useState(false); // 用于标记是否正在支付
  // const authCtx = useContext(AuthContext);

  const confirmCancel = async () => {
    if (isLoading) return;
    if (user && user.token) {
      try {
        const res = await axios.put(
          `http://localhost:8081/api/orders/${order.id}/cancel`,
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
          triggerRefresh && triggerRefresh();
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
          `http://localhost:8081/api/orders/${order.id}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (res.data) {
          message.success("订单删除成功");
          triggerRefresh && triggerRefresh();
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
          triggerRefresh && triggerRefresh();
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
      return (
        <>
          <Tag color="gold">已支付，等待发货</Tag>
          <Button type="primary" shape="round" style={{ margin: "0 10px" }}>
            催单
          </Button>
        </>
      );
    } else if (order?.status === OrderStatus.Deliverd) {
      // 已发货
      return (
        <>
          <Tag color="lime">已发货</Tag>
          <Button type="primary" shape="round" style={{ margin: "0 10px" }}>
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
    <div className="order-action">
      <span className="result">
        <em>
          共计
          <b className="quantity">{order.total}</b>
          件商品
        </em>
        <em>
          总金额: 
          <b className="amount-real">¥{(order.amount / 100).toFixed(2)}</b>
        </em>
      </span>
      {renderAction()}
    </div>
  );
};

export default OrderAction;
