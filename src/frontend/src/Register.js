import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:3001/register", {
        username,
        password,
      });
      console.log(res.data); // 根据你的业务逻辑处理注册成功的情况
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
};

export default Register;
