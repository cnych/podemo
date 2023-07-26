import { useState } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";

const Register = (props: { switchLogin: () => void }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    axios
      .post("http://localhost:8080/api/register", values)
      .then((res) => {
        console.log("register res：", res);
        message.success("注册成功");
        setLoading(false);
        props.switchLogin();
      })
      .catch((err) => {
        console.log("register err：", err);
        message.error("注册失败");
        setLoading(false);
      });
  };

  return (
    <div>
      <Typography.Title level={2} style={{ textAlign: "center" }}>
        注册
      </Typography.Title>
      <Form
        layout="vertical"
        name="normal_register"
        className="register-form"
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
            className="register-form-button"
            loading={loading}
          >
            注册
          </Button>
        </Form.Item>
        <Form.Item>
          OR
          <Button type="link" onClick={(e) => props.switchLogin()}>
            前往登录!
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
