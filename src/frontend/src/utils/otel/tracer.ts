import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  WebTracerProvider,
} from "@opentelemetry/sdk-trace-web";
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from "@opentelemetry/core";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";

// import { UserInteractionPlugin } from "@opentelemetry/plugin-user-interaction";

// 创建一个 Tracer Provider
// let resource = new Resource({
//   [SemanticResourceAttributes.SERVICE_NAME]: "frontend",
// });

// const detectedResources = await detectResources({
//   detectors: [browserDetector],
// });
// resource = resource.merge(detectedResources);
// const provider = new WebTracerProvider({
//   resource,
// });

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

// we will use ConsoleSpanExporter to check the generated spans in dev console
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.addSpanProcessor(new SimpleSpanProcessor(collector));

// 初始化并注册 tracer
const contextManager = new ZoneContextManager();

provider.register({
  contextManager,
  propagator: new CompositePropagator({
    propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
  }),
});

// const instrumentations = getWebAutoInstrumentations({
//   // "@opentelemetry/instrumentation-xml-http-request": {
//   //   ignoreUrls: [/localhost/],
//   //   propagateTraceHeaderCorsUrls: ["http://localhos:3000"],
//   // },
// });

// registerInstrumentations({
//   instrumentations,
//   tracerProvider: provider,
// });

// registerInstrumentations({
//   tracerProvider: provider,
//   instrumentations: [
//     getWebAutoInstrumentations({
//       "@opentelemetry/instrumentation-fetch": {
//         propagateTraceHeaderCorsUrls: /.*/,
//         clearTimingResources: true,
//         applyCustomAttributesOnSpan(span) {
//           span.setAttribute("app.synthetic_request", "false");
//         },
//       },
//     }),
//   ],
// });

// 创建一个 tracer
const tracer = provider.getTracer("frontend");

export default tracer;
