package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/cnych/bookstore/src/userservice/handler"
	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
	"google.golang.org/grpc/credentials"
)

var (
	serviceName  = getEnv("SERVICE_NAME", "user-service")
	collectorURL = getEnv("OTEL_COLLECTOR_OTLP_ENDPOINT", "otel-collector:4317")
	insecure     = getEnv("INSECURE", "true")
	timeout      = 5 * time.Second
)

func getEnv(key, defaultVal string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return defaultVal
}

// 初始化 TracerProvider
func initTracerProvider() (*sdktrace.TracerProvider, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	// 定义 grpc 的连接是否采用安全模式
	var secureOption otlptracegrpc.Option
	if insecure == "true" || insecure == "1" { // 非安全模式
		secureOption = otlptracegrpc.WithInsecure()
	} else {
		secureOption = otlptracegrpc.WithTLSCredentials(credentials.NewClientTLSFromCert(nil, ""))
	}

	// 创建 OTLP Trace Exporter
	exporter, err := otlptrace.New(ctx, otlptracegrpc.NewClient(secureOption, otlptracegrpc.WithEndpoint(collectorURL)))
	if err != nil {
		return nil, err
	}

	// 设置 resource
	resource, err := resource.New(ctx, resource.WithAttributes(
		attribute.String("service.name", serviceName),
		attribute.String("service.namespace", "default"),
	))
	if err != nil {
		return nil, err
	}

	// 设置 TraceProvider
	tp := sdktrace.NewTracerProvider(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(resource),
	)
	otel.SetTracerProvider(tp)
	// 设置传播上下文的处理器
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
	return tp, nil
}

// 初始化 MeterProvider
func initMeterProvider() (*sdkmetric.MeterProvider, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	// 定义 grpc 的连接是否采用安全模式
	var secureOption otlpmetricgrpc.Option
	if insecure == "true" || insecure == "1" { // 非安全模式
		secureOption = otlpmetricgrpc.WithInsecure()
	} else {
		secureOption = otlpmetricgrpc.WithTLSCredentials(credentials.NewClientTLSFromCert(nil, ""))
	}

	// 创建 OTLP Metric Exporter
	exporter, err := otlpmetricgrpc.New(ctx, secureOption, otlpmetricgrpc.WithEndpoint(collectorURL))
	if err != nil {
		return nil, err
	}

	// 设置 resource
	resource := resource.NewWithAttributes(semconv.SchemaURL, semconv.ServiceNameKey.String(serviceName))

	// 设置 MeterProvider
	mp := sdkmetric.NewMeterProvider(
		sdkmetric.WithReader(sdkmetric.NewPeriodicReader(exporter, sdkmetric.WithInterval(10*time.Second))),
		sdkmetric.WithResource(resource),
	)
	// 设置全局 MeterProvider
	otel.SetMeterProvider(mp)
	return mp, nil
}

func main() {
	ctx := context.Background()

	{
		// 初始化TracerProvider
		tp, err := initTracerProvider()
		if err != nil {
			log.Printf("Failed to init otel tracer: %v", err)
			return
		}
		defer tp.Shutdown(ctx)

		// 初始化 MeterProvider
		mp, err := initMeterProvider()
		if err != nil {
			log.Printf("Failed to init otel meter: %v", err)
			return
		}
		defer mp.Shutdown(ctx)
	}

	router := gin.Default()

	router.Use(handler.CORSMiddleware())
	router.Use(handler.MetricsMiddleware())
	router.Use(otelgin.Middleware(serviceName))

	router.GET("/ping", handler.PingHandler)
	router.POST("/api/register", handler.RegisterHandler)
	router.POST("/api/login", handler.LoginHandler)
	router.GET("/api/userinfo", handler.UserInfoHandler)

	router.Run(":8080")
}
