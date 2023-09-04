package com.youdianzhishi.orderservice.interceptor;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.propagation.TextMapGetter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;


@Component
public class OpenTelemetryInterceptor implements HandlerInterceptor {
    @Autowired
    private OpenTelemetry openTelemetry;

    @Autowired
    private Tracer tracer;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        TextMapGetter<HttpServletRequest> getter = new TextMapGetter<>() {
            @Override
            public Iterable<String> keys(HttpServletRequest carrier) {
                return Collections.list(carrier.getHeaderNames());
            }

            @Override
            public String get(HttpServletRequest carrier, String key) {
                return carrier.getHeader(key);
            }
        };

        // 提取传入的Trace Context
        Context extractedContext = openTelemetry.getPropagators().getTextMapPropagator()
                                       .extract(Context.current(), request, getter);
        
        StringBuilder sb = new StringBuilder();
        sb.append(request.getMethod()).append(" ").append(request.getRequestURI());
        Span span = tracer.spanBuilder(sb.toString()).setParent(extractedContext)
                    .startSpan();
        
        // 将解析出来的SpanContext存储在请求属性中，以便后续使用
        request.setAttribute("currentSpan", span);

        return true;
    }
}

