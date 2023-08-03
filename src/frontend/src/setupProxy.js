const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/otel/v1/*",
    createProxyMiddleware({
      target: "http://otel-collector:4318",
      changeOrigin: true,
      pathRewrite: {
        "^/otel/v1/": "/v1/",
      },
      logLevel: "debug",
    })
  );
  app.use(
    "/api/catalog/*",
    createProxyMiddleware({
      target: "http://catalogservice:8082",
      changeOrigin: true,
      pathRewrite: {
        "^/api/catalog/": "/api/", // 重写路径
      },
      logLevel: "debug",
    })
  );
  // 这里可以添加其他的代理路由
  app.use(
    "/api/user/*",
    createProxyMiddleware({
      target: "http://userservice:8080",
      changeOrigin: true,
      pathRewrite: {
        "^/api/user/": "/api/", // 重写路径
      },
    })
  );
  app.use(
    "/api/order/*",
    createProxyMiddleware({
      target: "http://orderservice:8081",
      changeOrigin: true,
      pathRewrite: {
        "^/api/order/": "/api/", // 重写路径
      },
    })
  );
  app.use(
    "/api/pay/*",
    createProxyMiddleware({
      target: "http://payservice:8083",
      changeOrigin: true,
      pathRewrite: {
        "^/api/pay/": "/api/", // 重写路径
      },
    })
  );
};
