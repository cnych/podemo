FROM node:16 AS builder

WORKDIR /app

# 复制其余源代码到工作目录
COPY . .

# 安装依赖
RUN npm install --registry=https://registry.npm.taobao.org  


FROM gcr.dockerproxy.com/distroless/nodejs

# 设置工作目录
WORKDIR /usr/src/app
COPY --from=builder /app /usr/src/app

# 暴露你的服务所需的端口，这里使用的是 8082
EXPOSE 8082

# 设置启动命令为你的应用的启动命令
CMD [ "main.js" ]

