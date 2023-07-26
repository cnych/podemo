import React, { useState, useContext } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import User from "../types/User";

const Login = (props: { switchLogin: () => void }) => {
  const [loading, setLoading] = useState(false);
  const authCtx = useContext(AuthContext);
  const history = useNavigate();

  const onFinish = (values: any) => {
    setLoading(true);
    axios
      .post("http://localhost:8080/api/login", values)
      .then((res) => {
        console.log("login res：", res);
        const userInfo = res.data; // {id: 1, token: "M", username: "admin"}
        // 将 res.data 转变成 User 类型的数据
        const user: User = {
          id: userInfo.id,
          username: userInfo.username,
          token: userInfo.token,
        };
        authCtx.onLogin(user);
        message.success("登录成功");
        setLoading(false);
        history("/");
      })
      .catch((err) => {
        console.log("login err：", err);
        message.error("登录失败");
        setLoading(false);
      });
  };

  return (
    <div>
      <Typography.Title level={2} style={{ textAlign: "center" }}>
        登录
      </Typography.Title>
      <Form
        layout="vertical"
        name="normal_login"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: "请输入用户名!" }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="用户名"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: "请输入密码!" }]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="密码"
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            block
            htmlType="submit"
            className="login-form-button"
            loading={loading}
          >
            登录
          </Button>
        </Form.Item>
        <Form.Item>
          OR
          <Button type="link" onClick={(e) => props.switchLogin()}>
            前往注册!
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
