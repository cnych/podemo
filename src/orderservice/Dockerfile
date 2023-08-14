# 基于官方的 Maven 3.6.1-jdk-11-slim 这个镜像
FROM maven:3.8.5-openjdk-17-slim AS build

# 将本地代码复制到 Docker 容器中的 /usr/src/app 目录下
COPY src /usr/src/app/src
COPY pom.xml /usr/src/app
COPY opentelemetry-javaagent.jar /usr/src/app

# 在容器的 /usr/src/app 目录下，运行 mvn clean package 命令，构建项目
RUN mvn -f /usr/src/app/pom.xml clean package

# 使用官方的 openjdk:11-jre-slim 镜像作为基础镜像
# FROM gcr.dockerproxy.com/distroless/java
FROM openjdk:17-jdk-slim

WORKDIR /usr/app

# 将打包生成的 jar 文件复制到容器中
COPY --from=build /usr/src/app/target/*.jar /usr/app/app.jar
COPY --from=build /usr/src/app/opentelemetry-javaagent.jar /usr/app/opentelemetry-javaagent.jar

# 声明服务运行在 8081 端口
EXPOSE 8081

ENV JAVA_TOOL_OPTIONS="-javaagent:/usr/app/opentelemetry-javaagent.jar"
ENV OTEL_SERVICE_NAME="order-service"
ENV OTEL_TRACES_EXPORTER="otlp"
ENV OTEL_METRICS_EXPORTER="none"
ENV OTEL_LOGS_EXPORTER="none"
ENV OTEL_EXPORTER_OTLP_ENDPOINT="http://otel-collector:4317"

# 指定 docker 容器的启动命令
ENTRYPOINT ["java", "-jar", "/usr/app/app.jar"]
