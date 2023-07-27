package com.youdianzhishi.orderservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOriginPatterns("*") // 这里应该改为你的前端服务地址
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "HEAD")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
