package com.youdianzhishi.orderservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
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
        return WebClient.builder().filter(traceExchangeFilterFunction()).build();
    }

    @Bean
    public ExchangeFilterFunction traceExchangeFilterFunction() {
        return (clientRequest, next) -> {
            // 获取当前上下文的 Span
            Span currentSpan = Span.current();
            Context context = Context.current().with(currentSpan);

            // 创建新的请求头并添加跟踪信息
            HttpHeaders newHeaders = new HttpHeaders();
            newHeaders.putAll(clientRequest.headers());

            TextMapSetter<HttpHeaders> setter = new TextMapSetter<HttpHeaders>() {
                @Override
                public void set(HttpHeaders carrier, String key, String value) {
                    carrier.add(key, value);
                }
            };

            // 将当前上下文的 Span 注入到请求头中
            openTelemetry.getPropagators().getTextMapPropagator().inject(context, newHeaders, setter);

            // 创建一个新的 ClientRequest 对象
            ClientRequest newRequest = ClientRequest.from(clientRequest)
                    .headers(headers -> headers.addAll(newHeaders))
                    .build();

            return next.exchange(newRequest);
        };
    }
}
