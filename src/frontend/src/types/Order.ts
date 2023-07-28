import CartItem from "./CartItem";

interface Order {
  id: number;
  amount: number;
  total: number;
  status: number;
  books: CartItem[];
}

export default Order;
