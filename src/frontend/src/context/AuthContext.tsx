import React from "react";
import User from "../types/User";

const AuthContext = React.createContext({
  isLoggedIn: false,
  user: {} as User,
  onLogout: () => {},
  onLogin: (user: User) => {},
});

export default AuthContext;
