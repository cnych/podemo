package com.youdianzhishi.orderservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.propagation.TextMapSetter;

@Configuration
@Order(3)
public class WebClientConfig {
    @Autowired
    private OpenTelemetry openTelemetry;

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .filter(traceExchangeFilterFunction())
                .build();
    }

    @Bean
    public ExchangeFilterFunction traceExchangeFilterFunction() {
        return (clientRequest, next) -> {
            // 获取当前的上下文 Span
            Span currentSpan = Span.current();
            Context currentContext = Context.current().with(currentSpan);

            // 创建新的请求Header并添加trace信息
            HttpHeaders newHeaders = new HttpHeaders();
            newHeaders.putAll(clientRequest.headers());

            TextMapSetter<HttpHeaders> setter = new TextMapSetter<HttpHeaders>() {
                @Override
                public void set(HttpHeaders carrier, String key, String value) {
                    carrier.add(key, value);
                }
            };

            // 将当前上下文的 Span 注入到请求头中去（tracecontext）
            openTelemetry.getPropagators().getTextMapPropagator().inject(currentContext, newHeaders, setter);

            // 创建新的请求，添加新的请求头
            ClientRequest newRequest = ClientRequest.from(clientRequest)
                    .headers(headers -> headers.addAll(newHeaders))
                    .build();

            return next.exchange(newRequest);
        };
    }
}
