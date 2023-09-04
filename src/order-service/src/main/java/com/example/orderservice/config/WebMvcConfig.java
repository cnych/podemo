package com.youdianzhishi.orderservice.config;

import com.example.orderservice.interceptor.TokenInterceptor;
import com.example.orderservice.interceptor.OpenTelemetryContextInterceptor;
import io.opentelemetry.api.OpenTelemetry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Order(4)
public class WebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private TokenInterceptor tokenInterceptor;

    @Autowired
    private OpenTelemetryContextInterceptor openTelemetryContextInterceptor;

    @Autowired
    private OpenTelemetry openTelemetry;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(openTelemetryContextInterceptor)
            .addPathPatterns("/api/orders/**");

        registry.addInterceptor(tokenInterceptor)
            .addPathPatterns("/api/orders/**") // 指定拦截器应该应用的路径模式
            .excludePathPatterns("/api/login", "/api/register"); // 指定应该排除的路径模式
    }

    @Bean
    public OpenTelemetry openTelemetry() {
        return OpenTelemetrySdk.builder().buildAndRegisterGlobal();
    }
}