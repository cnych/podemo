package handler

import (
	"time"

	"github.com/cnych/bookstore/src/userservice/helper"
	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

var (
	meter            = otel.Meter("userservice")
	requestTotal     metric.Int64Counter
	requestUVTotal   metric.Int64Counter
	uriRequestTotal  metric.Int64Counter
	requestBodySize  metric.Float64Counter
	responseBodySize metric.Float64Counter
	requestDuration  metric.Float64Histogram
	slowRequest      metric.Int64Counter

	defaultSlowTime = int32(5)

	bloomFilter *helper.BloomFilter // 布隆过滤器
)

func init() {
	bloomFilter = helper.NewBloomFilter()
	requestTotal, _ = meter.Int64Counter("gin_request_total", metric.WithDescription("all the server received request total"))
	requestUVTotal, _ = meter.Int64Counter("gin_request_uv_total", metric.WithDescription("all the server received request uv(ip) total"))
	uriRequestTotal, _ = meter.Int64Counter("gin_uri_request_total", metric.WithDescription("all the server received request uri total"))
	requestBodySize, _ = meter.Float64Counter("gin_request_body_size", metric.WithDescription("all the server received request body size"))
	responseBodySize, _ = meter.Float64Counter("gin_response_body_size", metric.WithDescription("all the server response body size"))
	requestDuration, _ = meter.Float64Histogram(
		"gin_request_duration",
		metric.WithUnit("s"),
		metric.WithDescription("all the server request duration"),
		metric.WithExplicitBucketBoundaries([]float64{0.1, 0.3, 0.5, 1, 2, 5, 10, 30, 60}...), // 指定bucket边界
	)
	slowRequest, _ = meter.Int64Counter("gin_slow_request", metric.WithDescription("all the server request slow"))
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

func MetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 请求前
		startTime := time.Now()

		// 请求处理
		c.Next()

		// 请求后
		ginMetricHandle(c, startTime)
	}
}

func ginMetricHandle(ctx *gin.Context, start time.Time) {
	c := ctx.Request.Context()
	r := ctx.Request
	w := ctx.Writer
	attributes := metric.WithAttributes(
		attribute.String("uri", ctx.FullPath()),
		attribute.String("method", r.Method),
		attribute.Int("code", w.Status()),
	)

	// 请求总数
	requestTotal.Add(c, 1)

	// 请求 IP 数
	if ip := ctx.ClientIP(); !bloomFilter.Contains(ip) {
		bloomFilter.Add(ip)
		requestUVTotal.Add(c, 1)
	}

	// 请求 URI 数
	uriRequestTotal.Add(c, 1, attributes)

	// request body size
	if r.ContentLength > 0 {
		requestBodySize.Add(c, float64(r.ContentLength))
	}

	// response body size
	if w.Size() > 0 {
		responseBodySize.Add(c, float64(w.Size()))
	}

	latency := time.Since(start)

	// request duration
	requestDuration.Record(c, latency.Seconds(), attributes)

	// slow request
	if int32(latency.Seconds()) > defaultSlowTime {
		slowRequest.Add(c, 1, attributes)
	}

}
