package handler

import (
	"fmt"
	"time"

	"github.com/cnych/bookstore/src/userservice/helper"
	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

var (
	meter           = otel.Meter("userservice")
	requestTotal    metric.Int64Counter
	requestUVTotal  metric.Int64Counter
	uriRequestTotal metric.Int64Counter
	requestBody     metric.Float64Counter
	responseBody    metric.Float64Counter
	requestDuration metric.Float64Histogram
	slowRequest     metric.Int64Counter

	defaultSlowTime = int32(5)
	defaultDuration = []float64{0.1, 0.3, 0.5, 1.2, 5, 10, 30, 60}

	bloomFilter *helper.BloomFilter
)

func init() {
	bloomFilter = helper.NewBloomFilter()
	requestTotal, _ = meter.Int64Counter("gin_request_total", metric.WithDescription("all the server received request number."))
	requestUVTotal, _ = meter.Int64Counter("gin_request_uv_total", metric.WithDescription("all the server received ip number."))
	uriRequestTotal, _ = meter.Int64Counter("gin_uri_request_total", metric.WithDescription("all the server received request number with every uri."))
	requestBody, _ = meter.Float64Counter("gin_request_body_total", metric.WithDescription("the server received request body size, unit is byte."))
	responseBody, _ = meter.Float64Counter("gin_response_body_total", metric.WithDescription("the server response body size, unit is byte."))
	requestDuration, _ = meter.Float64Histogram(
		"gin_request_duration",
		metric.WithUnit("s"),
		metric.WithDescription("the time server took to handle the request."),
		metric.WithExplicitBucketBoundaries(defaultDuration...),
	)
	slowRequest, _ = meter.Int64Counter("gin_slow_request_total", metric.WithDescription(fmt.Sprintf("the server handled slow requests counter, t=%d.", defaultSlowTime)))
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
	return func(ctx *gin.Context) {
		// before request
		startTime := time.Now()

		// execute normal process.
		ctx.Next()

		// after request
		ginMetricHandle(ctx, startTime)
	}
}

func ginMetricHandle(ctx *gin.Context, start time.Time) {
	r := ctx.Request
	w := ctx.Writer
	c := ctx.Request.Context()

	// set request total
	requestTotal.Add(c, 1)

	// set uv
	if clientIP := ctx.ClientIP(); !bloomFilter.Contains(clientIP) {
		bloomFilter.Add(clientIP)
		requestUVTotal.Add(c, 1)
	}

	// set uri request total
	// []string{"uri", "method", "code"},
	uriRequestTotal.Add(c, 1, metric.WithAttributes(
		attribute.String("uri", ctx.FullPath()),
		attribute.String("method", r.Method),
		attribute.Int("code", w.Status()),
	))

	// set request body size
	// since r.ContentLength can be negative (in some occasions) guard the operation
	if r.ContentLength >= 0 {
		requestBody.Add(c, float64(r.ContentLength))
	}

	// set slow request
	latency := time.Since(start)
	if int32(latency.Seconds()) > defaultSlowTime {
		slowRequest.Add(c, 1, metric.WithAttributes(
			attribute.String("uri", ctx.FullPath()),
			attribute.String("method", r.Method),
			attribute.Int("code", w.Status()),
		))
	}

	// set request duration
	requestDuration.Record(c, latency.Seconds(), metric.WithAttributes(
		attribute.String("uri", ctx.FullPath()),
		attribute.String("method", r.Method),
		attribute.Int("code", w.Status()),
	))

	// set response size
	if w.Size() > 0 {
		responseBody.Add(c, float64(w.Size()))
	}
}
