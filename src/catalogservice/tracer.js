// tracer.js
const { trace } = require("@opentelemetry/api");
const { NodeTracerProvider } = require("@opentelemetry/node");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const {
  BatchSpanProcessor,
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} = require("@opentelemetry/tracing");
const {
  ExpressInstrumentation,
} = require("@opentelemetry/instrumentation-express");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");

// 初始化 tracer provider
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "catalog-service",
  }),
});

// registerInstrumentations({
//   tracerProvider: provider,
//   instrumentations: [
//     // 启用 Express 和 HTTP 两个 instrumentations
//     HttpInstrumentation,
//     ExpressInstrumentation,
//     // RouterInstrumentation,
//   ],
// });

// 初始化 Jaeger exporter，并添加到 provider 中
// const exporter = new JaegerExporter({
//   endpoint: "http://otel-collector:14278/api/traces",
// });
const exporter = new OTLPTraceExporter({
  url: "http://otel-collector:4318/v1/traces", // OTLP HTTP endpoint，可以省略，默认为 http://localhost:4318/v1/traces
});

// 导出 span 到 Jaeger：生产环境下推荐使用 BatchSpanProcessor
// provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

// 启动 provider
provider.register();

// 初始化全局 tracer 实例
const tracer = trace.getTracer("catalog-service");

module.exports = { tracer };
