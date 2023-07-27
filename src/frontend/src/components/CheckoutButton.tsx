import { useState } from "react";
import { Button, Badge, Drawer } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useCart } from "../hooks/useCart";
import { Cart } from "./Cart";

function CheckoutButton() {
  const [visible, setVisible] = useState(false);
  const { cart, cartCount } = useCart();

  const toggleDrawer = () => {
    setVisible(!visible);
  };

  return (
    <>
      {cart.length > 0 && (
        <div style={{ position: "fixed", right: "50px", bottom: "80px" }}>
          <Badge count={cartCount.toString()}>
            <Button
              shape="circle"
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={toggleDrawer}
            ></Button>
          </Badge>
          <Drawer
            title="购物车"
            placement="right"
            width={600}
            closable={true}
            onClose={toggleDrawer}
            open={visible}
          >
            <Cart />
          </Drawer>
        </div>
      )}
    </>
  );
}

export default CheckoutButton;
