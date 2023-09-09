import os
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.semconv.resource import ResourceAttributes

# 从环境变量中获取 OTLP Exporter 的地址
OTLP_EXPORTER_ENDPOINT = os.getenv("OTLP_EXPORTER_ENDPOINT", "otel-collector:4317")
SERVICE_NAME = os.getenv("SERVICE_NAME", "payment-service")

resource = Resource(attributes={
    ResourceAttributes.SERVICE_NAME: SERVICE_NAME,
    ResourceAttributes.SERVICE_VERSION: "1.0.0",
    ResourceAttributes.TELEMETRY_SDK_LANGUAGE: "python",
})
provider = TracerProvider(resource=resource)

# 配置 OTLP Span Exporter
otlp_exporter = OTLPSpanExporter(endpoint=OTLP_EXPORTER_ENDPOINT, insecure=True)
processor = BatchSpanProcessor(otlp_exporter)
provider.add_span_processor(processor)

# 设置全局默认的 tracer provider
trace.set_tracer_provider(provider)

# 从全局 tracer provider 创建一个 tracer
tracer = trace.get_tracer(__name__)