import { useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import { Layout, Menu, Dropdown, Button, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/useAuth";
import "./Nav.css";

const { Header } = Layout;

const Nav = () => {
  const history = useNavigate();
  const { isLoggedIn, user, onLogout } = useAuth();
  // const authCtx = useContext(AuthContext);

  const menuItems: MenuProps["items"] = isLoggedIn
    ? [
        // {
        //   key: "1",
        //   label: "首页",
        // },
        {
          key: "3",
          label: "订单",
        },
      ]
    : [
        // {
        //   key: "1",
        //   label: "首页",
        // },
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
      history("/order");
    }
  };

  const dropdownMenus: MenuProps["items"] = [
    {
      label: "个人中心",
      key: "1",
    },
    {
      label: "我的优惠券",
      key: "2",
    },
    {
      label: "收货地址管理",
      key: "3",
    },
    {
      type: "divider",
    },
    {
      label: "注销",
      key: "0",
    },
  ];

  const dropDownClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "0") {
      onLogout();
      history("/auth");
    } else {
      message.info("该功能暂未开放");
    }
  };

  return (
    <Header style={{ display: "flex", alignItems: "center" }}>
      <div className="demo-logo" onClick={(e) => history("/")} />
      <Menu
        theme="dark"
        mode="horizontal"
        // defaultSelectedKeys={["1"]}
        items={menuItems}
        onClick={menuClick}
      />
      {isLoggedIn && (
        <Dropdown
          menu={{ items: dropdownMenus, onClick: dropDownClick }}
          trigger={["click"]}
        >
          <Button type="link">
            欢迎，{user.username} <DownOutlined />
          </Button>
        </Dropdown>
      )}
    </Header>
  );
};

export default Nav;
