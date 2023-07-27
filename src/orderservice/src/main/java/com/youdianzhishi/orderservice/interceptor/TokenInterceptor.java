package com.youdianzhishi.orderservice.interceptor;

import reactor.core.publisher.Mono;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.youdianzhishi.orderservice.model.User;


@Component
public class TokenInterceptor implements HandlerInterceptor {

    @Autowired
    private WebClient webClient;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader("Authorization");
        if (token == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return false;
        }
        try {
            User user = webClient.get()
                    .uri("http://localhost:8080/api/userinfo")
                    .header(HttpHeaders.AUTHORIZATION, token)
                    .retrieve()
                    .onStatus(httpStatus -> httpStatus.equals(HttpStatus.UNAUTHORIZED), clientResponse ->
                            Mono.error(new RuntimeException("Unauthorized")))
                    .onStatus(httpStatus -> httpStatus.is4xxClientError() && !httpStatus.equals(HttpStatus.UNAUTHORIZED), clientResponse ->
                            Mono.error(new RuntimeException("Other Client Error")))
                    .bodyToMono(User.class)
                    .block();
            if (user != null) {
                request.setAttribute("user", user);
                return true;
            } else {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                return false;
            }
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Unauthorized")) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
            } else {
                response.setStatus(HttpStatus.BAD_REQUEST.value());
            }
            return false;
        } catch (Exception e) {
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return false;
        }
    }
}

