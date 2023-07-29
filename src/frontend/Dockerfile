# 使用官方的 node 镜像作为基础镜像
FROM gcr.dockerproxy.com/distroless/nodejs

# 在容器内部设置工作目录
WORKDIR /app

# 将 package.json 和 package-lock.json (如果可用) 复制到工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm install --production --registry=https://registry.npm.taobao.org  

# 将项目代码复制到工作目录
COPY . .

# 构建项目
RUN npm run build

# 使用 nginx 镜像作为基础，将构建出的 React 静态文件提供出去
FROM nginx:1.19-alpine

# 将从 build 阶段复制生成的静态文件到 nginx 容器的静态文件托管目录
COPY --from=0 /app/build /usr/share/nginx/html

# 使用自定义的 nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf
