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
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	"google.golang.org/grpc/credentials"

	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

var (
	serviceName  = getEnv("SERVICE_NAME", "user-service")
	collectorURL = getEnv("OTEL_EXPORTER_OTLP_ENDPOINT", "otel-collector:4317") // Assuming localhost as default
	insecure     = getEnv("INSECURE", "true")
)

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func initTracer() (func(context.Context) error, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 定义 grpc 连接是否采用安全模式
	secureOption := otlptracegrpc.WithTLSCredentials(credentials.NewClientTLSFromCert(nil, ""))
	if insecure == "true" || insecure == "1" {
		secureOption = otlptracegrpc.WithInsecure()
	}
	// 创建 otlp exporter
	exporter, err := otlptrace.New(
		ctx,
		otlptracegrpc.NewClient(
			secureOption,
			otlptracegrpc.WithEndpoint(collectorURL), // 如果不配置，默认使用 localhost:4317
		),
	)
	if err != nil {
		return nil, err
	}
	// 设置 resource
	resources, err := resource.New(
		ctx,
		resource.WithAttributes(
			attribute.String("service.name", serviceName),
			attribute.String("library.language", "go"),
		),
	)
	if err != nil {
		return nil, err
	}

	// 设置 TracerProvider
	otel.SetTracerProvider(
		sdktrace.NewTracerProvider(
			sdktrace.WithSampler(sdktrace.AlwaysSample()),
			sdktrace.WithBatcher(exporter),
			sdktrace.WithResource(resources),
		),
	)
	// 设置传播上下文的处理器
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))

	return exporter.Shutdown, nil
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	// 初始化 tracer
	cleanup, err := initTracer()
	if err != nil {
		log.Printf("Failed to initialize tracer: %v", err)
		return
	}

	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		// 清理 OTLP exporter
		if err := cleanup(ctx); err != nil {
			log.Printf("Failed to shut down OTLP exporter: %v", err)
		}
	}()

	router := gin.Default()

	router.Use(CORSMiddleware())
	// 使用 otelgin 中间件
	router.Use(otelgin.Middleware(serviceName))

	router.GET("/ping", handler.PingHandler)
	router.POST("/api/register", handler.RegisterHandler)
	router.POST("/api/login", handler.LoginHandler)
	router.GET("/api/userinfo", handler.UserInfoHandler)

	router.Run(":8080")
}
