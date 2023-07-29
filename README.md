# OpenTelemetry Demo

该项目为讲解 OpenTelemetry 的 Demo 项目，主要包含以下几个微服务：

- **Frontend (React)**：提供用户界面，用户可以在此浏览和购买书籍。
- **Book Catalog Service (Node.js)**：提供书籍的信息，如标题、作者、价格等。
- **Order Service (Java)**：处理订单创建、状态更新等。
- **Payment Service (Python)**：处理支付事务。
- **Inventory Service (Golang)**：跟踪书籍库存（待定...）。
- **User Service (Golang)**：处理用户信息（如用户登录、注册等）。
- **Database (MySQL)**：存储书籍信息、订单数据、库存数据、用户信息等。

第一个版本没有集成 OpenTelemetry，我们先了解下这些服务的基本功能，然后再来一步一步的将 OpenTelemetry 集成到这些服务中。

## 使用

为了方便，这里我们使用 Docker Compose 来启动这些服务，所以需要先安装 Docker、Docker Compose。

安装完成后，你可以在项目根目录下执行以下命令来启动这些服务：

```bash
$ docker-compose up -d
```

正常可以看到以下运行的几个服务：

```bash
$ docker-compose ps
NAME                        COMMAND                  SERVICE             STATUS              PORTS
book-app-catalogservice-1   "/nodejs/bin/node ma…"   catalogservice      running             8082/tcp
book-app-db-1               "docker-entrypoint.s…"   db                  running             0.0.0.0:3306->3306/tcp, :::3306->3306/tcp
book-app-frontend-1         "/docker-entrypoint.…"   frontend            running             0.0.0.0:80->80/tcp, :::80->80/tcp
book-app-orderservice-1     "java -jar /usr/app/…"   orderservice        running             8081/tcp
book-app-payservice-1       "/usr/bin/python3.9 …"   payservice          running             8083/tcp
book-app-userservice-1      "/app/main"              userservice         running             8080/tcp
```

启动后，你可以在浏览器中访问 [http://localhost](http://localhost) 来查看这个应用。

![首页](https://picdn.youdianzhishi.com/images/1690625619001.png)

第一次使用可以注册一个账号：

![注册](https://picdn.youdianzhishi.com/images/1690625649246.png)

注册登录完成后，就可以在首页的书籍列表中选购书籍了：

![购买](https://picdn.youdianzhishi.com/images/1690625724075.png)

在订单列表中可以查看到自己的订单：

![订单](https://picdn.youdianzhishi.com/images/1690625760930.png)
