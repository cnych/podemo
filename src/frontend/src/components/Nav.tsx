import { useNavigate, useLocation } from "react-router-dom";
import type { MenuProps } from "antd";
import type { ItemType } from "antd/es/menu/hooks/useItems";
import { Layout, Menu, Dropdown, Button, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/useAuth";
import "./Nav.css";

const { Header } = Layout;
type MenuItemWithPath = ItemType & { path: string };

const Nav = () => {
  const history = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, onLogout } = useAuth();

  const menuItems: MenuItemWithPath[] = isLoggedIn
    ? [
        {
          key: "1",
          label: "首页",
          path: "/",
        },
        {
          key: "3",
          label: "订单",
          path: "/order",
        },
      ]
    : [
        {
          key: "1",
          label: "首页",
          path: "/",
        },
        {
          key: "2",
          label: "登录",
          path: "/auth",
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

  // const pathParts = location.pathname.split("/").filter(Boolean);
  const selectedKey = menuItems
    .find((item) => item.path === location.pathname)
    ?.key?.toString();
  const selectedKeys = selectedKey ? [selectedKey] : [];

  return (
    <Header style={{ display: "flex", alignItems: "center" }}>
      <div className="demo-logo" onClick={(e) => history("/")} />
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={selectedKeys}
        items={menuItems.map(({ path, ...item }) => item)}
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
