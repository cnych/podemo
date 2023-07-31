// tracer.js
const { trace } = require("@opentelemetry/api");
const { NodeTracerProvider } = require("@opentelemetry/node");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const {
  BatchSpanProcessor,
  SimpleSpanProcessor,
} = require("@opentelemetry/tracing");
const {
  ExpressInstrumentation,
} = require("@opentelemetry/instrumentation-express");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");

// 初始化 tracer provider
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "catalog-service",
  }),
});

// 启用 express 和 http 的自动检测
new ExpressInstrumentation().setTracerProvider(provider);
new HttpInstrumentation().setTracerProvider(provider);

// 初始化 Jaeger exporter，并添加到 provider 中
const exporter = new JaegerExporter({
  endpoint: "http://otel-collector:14278/api/traces",
});

// 导出 span 到 Jaeger：生产环境下推荐使用 BatchSpanProcessor
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

// 启动 provider
provider.register();

// 初始化全局 tracer 实例
const tracer = trace.getTracer("catalog-service");

module.exports = { tracer };
