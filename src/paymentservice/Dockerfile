# 使用 Python 3.8 作为基础镜像
FROM python:3.8  AS build-env

# 设置工作目录
WORKDIR /usr/src/app

# 复制 requirements.txt 到工作目录
COPY requirements.txt ./

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com

# 复制其余源代码到工作目录
COPY . .

FROM gcr.dockerproxy.com/distroless/python3
WORKDIR /usr/src/app
ENV PYTHONPATH=/usr/local/lib/python3.8/site-packages
COPY --from=build-env /usr/src/app /usr/src/app
COPY --from=build-env /usr/local/lib/python3.8/site-packages /usr/local/lib/python3.8/site-packages

# 暴露你的服务所需的端口，这里使用的是 8083
EXPOSE 8083

# 设置启动命令为你的应用的启动命令
CMD [ "app.py"]
