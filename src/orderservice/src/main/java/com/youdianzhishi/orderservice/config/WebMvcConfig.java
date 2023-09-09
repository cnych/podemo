package com.youdianzhishi.orderservice.config;

import com.youdianzhishi.orderservice.interceptor.OpenTelemetryInterceptor;
import com.youdianzhishi.orderservice.interceptor.TokenInterceptor;
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
    private OpenTelemetryInterceptor openTelemetryInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(openTelemetryInterceptor).addPathPatterns("/api/orders/**");

        registry.addInterceptor(tokenInterceptor)
                .addPathPatterns("/api/orders/**") // 指定拦截器应该应用的路径模式
                .excludePathPatterns("/api/login", "/api/register"); // 指定应该排除的路径模式
    }

}
