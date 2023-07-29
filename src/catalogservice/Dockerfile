FROM gcr.dockerproxy.com/distroless/nodejs

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json 到工作目录
COPY package*.json ./

# 安装依赖
RUN npm install --registry=https://registry.npm.taobao.org  

# 复制其余源代码到工作目录
COPY . .

# 暴露你的服务所需的端口，这里使用的是 8082
EXPOSE 8082

# 设置启动命令为你的应用的启动命令
CMD [ "node", "main.js" ]
