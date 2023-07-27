import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";

import { Auth } from "./pages/Auth";
import { Order } from "./pages/Order";
import { OrderDeal } from "./pages/OrderDeal";
import { Cart } from "./components/Cart";
import BookList from "./components/BookList";
import Nav from "./components/Nav";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import "./App.css";

const { Content, Footer } = Layout;

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Nav />

            <Content
              style={{ padding: "50px", minHeight: "85vh", margin: "0 120px" }}
            >
              <Routes>
                <Route path="/" element={<BookList />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order" element={<Order />} />
                <Route path="/order/:id" element={<OrderDeal />} />
              </Routes>
            </Content>

            <Footer style={{ textAlign: "center" }}>
              OpenTelemetry Demo ©2023 Created by @优点知识
            </Footer>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
