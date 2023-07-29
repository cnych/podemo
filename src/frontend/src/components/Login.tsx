import React, { useState } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import User from "../types/User";

const Login = (props: { switchLogin: () => void }) => {
  const { onLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const history = useNavigate();

  const onFinish = (values: any) => {
    setLoading(true);
    axios
      .post("/api/user/login", values)
      .then((res) => {
        console.log("login res：", res);
        const userInfo = res.data; // {id: 1, token: "M", username: "admin"}
        // 将 res.data 转变成 User 类型的数据
        const user: User = {
          id: userInfo.id,
          username: userInfo.username,
          token: userInfo.token,
        };
        onLogin(user);
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
            size="large"
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
            size="large"
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="密码"
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            block
            size="large"
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
