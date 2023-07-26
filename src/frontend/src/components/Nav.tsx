import { useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import { Layout, Menu, Dropdown, Button } from "antd";
import { useContext } from "react";
import { DownOutlined } from "@ant-design/icons";
import AuthContext from "../context/AuthContext";
import "./Nav.css";

const { Header } = Layout;

const Nav = () => {
  const history = useNavigate();
  const authCtx = useContext(AuthContext);

  const menuItems: MenuProps["items"] = authCtx.isLoggedIn
    ? [
        {
          key: "1",
          label: "首页",
        },
        {
          key: "3",
          label: "购物车",
        },
      ]
    : [
        {
          key: "1",
          label: "首页",
        },
        {
          key: "2",
          label: "登录",
        },
      ];

  const menuClick = (e: any) => {
    if (e.key === "1") {
      history("/");
    } else if (e.key === "2") {
      history("/auth");
    } else if (e.key === "3") {
      history("/cart");
    }
  };

  const dropdownMenus: MenuProps["items"] = [
    {
      label: "注销",
      key: "0",
    },
    // {
    //   label: <a href="https://www.aliyun.com">2nd menu item</a>,
    //   key: "1",
    // },
    // {
    //   type: "divider",
    // },
    // {
    //   label: "3rd menu item",
    //   key: "3",
    // },
  ];

  const dropDownClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "0") {
      authCtx.onLogout();
      history("/auth");
    }
  };

  return (
    <Header style={{ display: "flex", alignItems: "center" }}>
      <div className="demo-logo" />
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={["1"]}
        items={menuItems}
        onClick={menuClick}
      />
      {authCtx.isLoggedIn && (
        <Dropdown
          menu={{ items: dropdownMenus, onClick: dropDownClick }}
          trigger={["click"]}
        >
          <Button type="link">
            欢迎，{authCtx.user.username} <DownOutlined />
          </Button>
        </Dropdown>
      )}
    </Header>
  );
};

export default Nav;
