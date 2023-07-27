package com.youdianzhishi.orderservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;

import com.youdianzhishi.orderservice.interceptor.TokenInterceptor;

@Configuration
@Order(3)
public class WebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private TokenInterceptor tokenInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(tokenInterceptor)
                .addPathPatterns("/api/orders/**") // 指定拦截器应该应用的路径模式
                .excludePathPatterns("/api/login", "/api/register"); // 指定应该排除的路径模式
    }
}
