import { useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";

import { Auth } from "./pages/Auth";
import { Cart } from "./pages/Cart";
import BookList from "./components/BookList";
import Nav from "./components/Nav";
import AuthContext from "./context/AuthContext";
import User from "./types/User";
import "./App.css";

const { Content, Footer } = Layout;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User>({} as User);
  const authCtx = useContext(AuthContext);

  const loginHandler = (user: User) => {
    setIsLoggedIn(true);
    setUser(user);
    // 保存 user 到 localStorage
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logoutHandler = () => {
    setIsLoggedIn(false);
    setUser({} as User);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.token) {
      loginHandler(user);
    }
  }, [authCtx]);

  return (
    <Router>
      <AuthContext.Provider
        value={{
          isLoggedIn: isLoggedIn,
          user: user,
          onLogout: logoutHandler,
          onLogin: loginHandler,
        }}
      >
        <Layout>
          <Nav />

          <Content style={{ padding: "50px", minHeight: "85vh" }}>
            <Routes>
              <Route path="/" element={<BookList />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </Content>

          <Footer style={{ textAlign: "center" }}>
            OpenTelemetry Demo ©2023 Created by @优点知识
          </Footer>
        </Layout>
      </AuthContext.Provider>
    </Router>
  );
}

export default App;
