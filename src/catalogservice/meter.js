// meter.js

const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const {
  MeterProvider,
  PeriodicExportingMetricReader,
} = require("@opentelemetry/sdk-metrics");
const {
  OTLPMetricExporter,
} = require("@opentelemetry/exporter-metrics-otlp-grpc");
const { metrics } = require("@opentelemetry/api");

const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "catalog-service",
  }),
});

const metricExporter = new OTLPMetricExporter({
  url: "http://otel-collector:4317", // gRPC
});

// 每隔exportIntervalMillis时间主动将metrics指标数据推送到OTLP
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 10000,
});

meterProvider.addMetricReader(metricReader);

// 将meterProvider设置为全局的meterProvider，可以在应用程序的任何地方直接访问指标了，不用显示的传递
metrics.setGlobalMeterProvider(meterProvider);

const meter = metrics.getMeter("catalog-service");

module.exports = { meter };
