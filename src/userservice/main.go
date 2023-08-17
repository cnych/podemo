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
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
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

func initTracer() (func(context.Context) error, error) {
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
	otel.SetTracerProvider(sdktrace.NewTracerProvider(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(resource),
	))
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
	// 初始化Tracer
	cleanup, err := initTracer()
	if err != nil {
		log.Printf("Failed to init otel tracer: %v", err)
		return
	}

	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), timeout)
		defer cancel()
		if err := cleanup(ctx); err != nil {
			log.Printf("Failed to cleanup otel tracer: %v", err)
		}
	}()

	router := gin.Default()

	router.Use(CORSMiddleware())
	router.Use(otelgin.Middleware(serviceName))

	router.GET("/ping", handler.PingHandler)
	router.POST("/api/register", handler.RegisterHandler)
	router.POST("/api/login", handler.LoginHandler)
	router.GET("/api/userinfo", handler.UserInfoHandler)

	router.Run(":8080")
}
