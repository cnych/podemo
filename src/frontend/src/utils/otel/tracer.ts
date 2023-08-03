import {
  WebTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-web";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

// import { DocumentLoad } from "@opentelemetry/plugin-document-load";
// import { UserInteractionPlugin } from "@opentelemetry/plugin-user-interaction";

// 创建一个 Tracer Provider
const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "frontend",
  }),
  // plugins: [new DocumentLoad(), new UserInteractionPlugin()],
});

// 设置 OTel collector
const collector = new OTLPTraceExporter({
  url: "/otel/v1/traces", // 修改为你的 OTLP collector 地址
});

provider.addSpanProcessor(new SimpleSpanProcessor(collector));

// 初始化并注册 tracer
provider.register();

// 创建一个 tracer
const tracer = provider.getTracer("frontend");

export default tracer;
