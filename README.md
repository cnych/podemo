# OpenTelemetry Demo

该项目为讲解 OpenTelemetry 的 Demo 项目，主要包含以下几个微服务：

- **Frontend (React)**：提供用户界面，用户可以在此浏览和购买书籍。
- **Book Catalog Service (Node.js)**：提供书籍的信息，如标题、作者、价格等。
- **Order Service (Java)**：处理订单创建、状态更新等。
- **Payment Service (Python)**：处理支付事务。
- **Inventory Service (Golang)**：跟踪书籍库存（待定...）。
- **User Service (Golang)**：处理用户信息（如用户登录、注册等）。
- **Database (MySQL)**：存储书籍信息、订单数据、库存数据、用户信息等。

![书籍列表](https://picdn.youdianzhishi.com/images/1690603599787.png)

![订单列表](https://picdn.youdianzhishi.com/images/1690603658651.png)

第一个版本没有集成 OpenTelemetry，我们先了解下这些服务的基本功能，然后再来一步一步的将 OpenTelemetry 集成到这些服务中。
