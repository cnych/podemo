import React from "react";
import { useState, useEffect } from "react";
import User from "../types/User";

export const AuthContext = React.createContext({
  isLoggedIn: false,
  user: {} as User,
  onLogout: () => {},
  onLogin: (user: User) => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
    user: user,
    onLogout: logoutHandler,
    onLogin: loginHandler,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
