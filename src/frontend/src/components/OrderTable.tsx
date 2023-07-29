import { Table } from "antd";
import Order from "../types/Order";

const OrderTable: React.FC<{ order: Order }> = ({ order }) => {
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
    <Table
      key={order.id}
      dataSource={order?.books}
      columns={columns}
      pagination={{ hideOnSinglePage: true }}
    />
  );
};

export default OrderTable;
