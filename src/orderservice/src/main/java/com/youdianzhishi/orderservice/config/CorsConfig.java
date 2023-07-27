package com.youdianzhishi.orderservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Order(1)
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*") // 这里应该改为你的前端服务地址
                .allowedMethods("OPTIONS", "GET", "POST", "PUT", "DELETE", "HEAD")
                .allowCredentials(true)
                .exposedHeaders("Authorization") // 允许"Authorization"被读取
                .maxAge(3600);
    }

}
