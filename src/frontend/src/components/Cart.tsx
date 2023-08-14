import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Popconfirm, message } from "antd";
import { PayCircleOutlined, ClearOutlined } from "@ant-design/icons";
import axios from "axios";
import {
  SpanStatusCode,
  context,
  propagation,
  trace,
} from "@opentelemetry/api";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import "./Cart.css";
import tracer from "../utils/otel/tracer";

export const Cart: React.FC = () => {
  const history = useNavigate();
  const [amount, setAmount] = React.useState(""); // 总金额
  const [checkoutLoading, setCheckoutLoading] = React.useState(false); // 结算按钮的 loading 状态
  const { isLoggedIn, user } = useAuth();
  const { cart, cartCount, clearCart, increaseQuantity, decreaseQuantity } =
    useCart();

  useEffect(() => {
    let total = 0;
    cart.forEach((item) => {
      total += item.price * item.quantity;
    });
    setAmount((total / 100).toFixed(2));
  }, [cart]);

  const clearConfirm = () => {
    clearCart();
    message.success("清空成功");
  };

  const clearCancel = () => {};

  const handleCheckout = () => {
    if (!isLoggedIn) {
      message.error("请先登录");
      history("/auth");
      return;
    }
    setCheckoutLoading(true);

    const bookData = cart.map((item) => {
      return {
        id: item.id,
        quantity: item.quantity,
      };
    });

    const span = tracer.startSpan("checkoutBooks");
    // 为 span 设置属性
    span.setAttribute("user_id", user.id);
    // TODO：添加其他属性

    const headers = { Authorization: `Bearer ${user.token}` };

    context.with(trace.setSpan(context.active(), span), () => {
      // 将 span context 注入到 headers 中
      propagation.inject(context.active(), headers);

      axios
        .post(
          "/api/order/orders",
          {
            books: JSON.stringify(bookData),
          },
          {
            headers: headers,
          }
        )
        .then((res) => {
          console.log(res);
          if (res && res.data && res.data.id) {
            clearCart();
            message.success("提交成功");
            // 结束 span
            span.setStatus({ code: SpanStatusCode.OK });
            span.end();
            history(`/order/${res.data.id}`);
          } else {
            message.error("提交失败");
            // 结束 span
            span.setStatus({ code: SpanStatusCode.ERROR });
            span.end();
          }
          setCheckoutLoading(false);
        })
        .catch((err) => {
          console.log(err);
          // 在span中记录异常
          span.recordException(err);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: err.message,
          });
          span.end();
          setCheckoutLoading(false);
          if (err.response.status === 401) {
            message.error("请先登录");
            history("/auth");
            return;
          }
          message.error("结算失败");
        });
    });
  };

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
      title: "价格",
      dataIndex: "price",
      key: "price",
      render: (price: any) => `￥${(price / 100).toFixed(2)}`,
    },
    {
      title: "数量",
      dataIndex: "quantity",
      key: "quantity",
      render: (_: any, record: any) => {
        return (
          <div>
            <Button size="small" onClick={() => decreaseQuantity(record.id)}>
              -
            </Button>
            <span style={{ margin: "0 10px" }}>{record.quantity}</span>
            <Button size="small" onClick={() => increaseQuantity(record.id)}>
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

  return (
    <>
      {cart.length > 0 && (
        <div className="cart-header">
          <span>已选书籍</span>
          <Popconfirm
            title="清空"
            description="您确定要清空购物车吗?"
            placement="leftTop"
            onConfirm={(e) => clearConfirm()}
            onCancel={(e) => clearCancel()}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              type="text"
              icon={<ClearOutlined />}
              style={{ fontSize: "12px", color: "#777" }}
            >
              清空购物车
            </Button>
          </Popconfirm>
        </div>
      )}
      <Table
        dataSource={cart}
        columns={columns}
        rowKey="id"
        pagination={{ hideOnSinglePage: true }}
      />
      {cart.length > 0 && (
        <div className="cart-actions">
          <div>
            共 <span className="price-tag">{cartCount}</span> 本书籍📚， 合计：
            <span className="price-tag">¥ {amount}</span>
          </div>
          <Button
            danger
            onClick={(e) => handleCheckout()}
            loading={checkoutLoading}
            icon={<PayCircleOutlined />}
            type="primary"
          >
            去结算
          </Button>
        </div>
      )}
    </>
  );
};
