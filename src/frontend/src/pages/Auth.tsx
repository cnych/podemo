import React, { useState } from "react";
import { Row, Col } from "antd";
import Login from "../components/Login";
import Register from "../components/Register";

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const switchLogin = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Row>
      <Col span={12} style={{ padding: "5%" }}>
        <img
          src="/OpenTelemetry.jpg"
          alt="OpenTelemetry Demo APP"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Col>
      <Col span={12} style={{ padding: "5%" }}>
        {isLogin ? (
          <Login switchLogin={switchLogin} />
        ) : (
          <Register switchLogin={switchLogin} />
        )}
      </Col>
    </Row>
  );
};
