package com.youdianzhishi.orderservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.youdianzhishi.orderservice.OrderserviceApplication;

import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.baggage.propagation.W3CBaggagePropagator;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.exporter.otlp.trace.OtlpGrpcSpanExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import io.opentelemetry.semconv.resource.attributes.ResourceAttributes;

@Configuration
@Order(2)
public class OpenTelemetryConfig {
        @Bean
        public OpenTelemetry openTelemetry() {
                GlobalOpenTelemetry.resetForTest(); // reset to avoid multiple SDKs

                String exporterEndpointFromEnv = System.getenv("OTLP_EXPORTER_ENDPOINT");
                String exporterEndpoint = exporterEndpointFromEnv != null ? exporterEndpointFromEnv
                                : "http://otel-collector:4317";

                String serviceNameFromEnv = System.getenv("SERVICE_NAME");
                String serviceName = serviceNameFromEnv != null ? serviceNameFromEnv : "order-service";

                // 初始化 OTLP Exporter
                OtlpGrpcSpanExporter exporter = OtlpGrpcSpanExporter.builder()
                                .setEndpoint(exporterEndpoint)
                                .build();

                // 指定 Resource
                Resource resource = Resource.getDefault()
                                .merge(Resource.create(Attributes.of(
                                                ResourceAttributes.SERVICE_NAME, serviceName,
                                                ResourceAttributes.SERVICE_NAMESPACE, "dev",
                                                ResourceAttributes.SERVICE_VERSION, "1.0.0",
                                                ResourceAttributes.TELEMETRY_SDK_LANGUAGE, "java")));

                // 初始化一个 TracerProvider
                SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
                                .addSpanProcessor(SimpleSpanProcessor.create(exporter))
                                .setResource(resource)
                                .build();

                // 初始化 ContextPropagators，包含 W3C Trace Context 和 W3C Baggage
                ContextPropagators propagators = ContextPropagators.create(
                                TextMapPropagator.composite(
                                                W3CTraceContextPropagator.getInstance(),
                                                W3CBaggagePropagator.getInstance()));

                // 初始化并返回 OpenTelemetry SDK 实例
                return OpenTelemetrySdk.builder()
                                .setPropagators(propagators)
                                .setTracerProvider(tracerProvider)
                                .buildAndRegisterGlobal();

        }

        @Bean
        public Tracer tracer() {
                return openTelemetry().getTracer(OrderserviceApplication.class.getName());
        }
}
