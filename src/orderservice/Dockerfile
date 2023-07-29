# 基于官方的 Maven 3.6.1-jdk-11-slim 这个镜像
FROM maven:3.8.7-openjdk-18-slim AS build

# 将本地代码复制到 Docker 容器中的 /usr/src/app 目录下
COPY src /usr/src/app/src
COPY pom.xml /usr/src/app

# 在容器的 /usr/src/app 目录下，运行 mvn clean package 命令，构建项目
RUN mvn -f /usr/src/app/pom.xml clean package

# 使用官方的 openjdk:11-jre-slim 镜像作为基础镜像
# FROM gcr.dockerproxy.com/distroless/java
FROM openjdk:19-jdk-slim

# 将打包生成的 jar 文件复制到容器中
COPY --from=build /usr/src/app/target/*.jar /usr/app/app.jar

# 声明服务运行在 8081 端口
EXPOSE 8081

# 指定 docker 容器的启动命令
ENTRYPOINT ["java", "-jar", "/usr/app/app.jar"]
