import React from "react";
import { useState, useEffect } from "react";
import User from "../types/User";

export const AuthContext = React.createContext({
  isLoggedIn: false,
  isLoading: true, // 表示是否正在加载用户信息，有些时候，我们需要等待用户信息加载完毕，才能渲染页面
  user: {} as User,
  onLogout: () => {},
  onLogin: (user: User) => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User>({} as User);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.token) {
      loginHandler(user);
    }
  }, []);

  const loginHandler = (user: User) => {
    setIsLoggedIn(true);
    setUser(user);
    setIsLoading(false); // 表示没有在加载用户信息了
    // 保存 user 到 localStorage
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logoutHandler = () => {
    setIsLoggedIn(false);
    setUser({} as User);
    localStorage.removeItem("user");
  };

  const value = {
    isLoggedIn: isLoggedIn,
    isLoading: isLoading,
    user: user,
    onLogout: logoutHandler,
    onLogin: loginHandler,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
