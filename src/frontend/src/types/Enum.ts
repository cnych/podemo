// 定义订单状态枚举类型
export enum OrderStatus {
  // 待支付
  Pending = 1,
  // 已支付
  Paid = 2,
  // 已发货
  Deliverd = 3,
  // 已完成
  Completed = 4,
  // 已取消
  Canceled = 5,
}
