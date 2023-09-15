import os

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.semconv.resource import ResourceAttributes
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator


OTLP_ENDPOINT = os.getenv("OTLP_EXPORTER_ENDPOINT", "otel-collector:4317")
# 从环境变量中获取服务名
SERVICE_NAME = os.getenv("SERVICE_NAME", "payment-service")


resource = Resource(attributes={
    ResourceAttributes.SERVICE_NAME: SERVICE_NAME,
    ResourceAttributes.SERVICE_VERSION: "1.0.0",
    ResourceAttributes.TELEMETRY_SDK_LANGUAGE: "python",
})
provider = TracerProvider(resource=resource)


# 配置 OTLP Span Exporter
otlp_exporter = OTLPSpanExporter(endpoint=OTLP_ENDPOINT, insecure=True)
processor = BatchSpanProcessor(otlp_exporter)
provider.add_span_processor(processor)

# 配置全局 TracerProvider
trace.set_tracer_provider(provider)

# 从全局 TracerProvider 获取 Tracer 对象
tracer = trace.get_tracer(__name__)
