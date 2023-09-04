package com.youdianzhishi.orderservice.interceptor;

import com.youdianzhishi.orderservice.model.User;

import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.StatusCode;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.Scope;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.HandlerInterceptor;
import reactor.core.publisher.Mono;

@Component
public class TokenInterceptor implements HandlerInterceptor {

    @Autowired
    private WebClient webClient;

    @Autowired
    private Tracer tracer;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 先获取 Span
        Span currentSpan = (Span) request.getAttribute("currentSpan");
        Context context = Context.current().with(currentSpan);

        // 创建新的 Span，作为子 Span
        Span span = tracer.spanBuilder("GET /api/userinfo")
            .setParent(context).startSpan();

        // 将子 Span 设置为当前上下文，相当于切换上下文到子 Span
        try (Scope scope = span.makeCurrent()) {

            try {
                String token = request.getHeader("Authorization");
                if (token == null) {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    span.addEvent("Token is null").setStatus(StatusCode.ERROR);
                    return false;
                }
                // 从环境变量中获取 userServiceUrl
                String userServiceEnv = System.getenv("USER_SERVICE_URL");
                String userServiceUrl = userServiceEnv != null ? userServiceEnv : "http://localhost:8080";
                User user = webClient.get()
                        .uri(userServiceUrl + "/api/userinfo")
                        .header(HttpHeaders.AUTHORIZATION, token)
                        .retrieve()
                        .onStatus(httpStatus -> httpStatus.equals(HttpStatus.UNAUTHORIZED),
                                clientResponse -> Mono.error(new RuntimeException("Unauthorized")))
                        .onStatus(
                                httpStatus -> httpStatus.is4xxClientError()
                                        && !httpStatus.equals(HttpStatus.UNAUTHORIZED),
                                clientResponse -> Mono.error(new RuntimeException("Other Client Error")))
                        .bodyToMono(User.class)
                        .block();
                if (user != null) {
                    request.setAttribute("user", user);
                    span.setAttribute("user_id", user.getId());
                    return true;
                } else {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    span.addEvent("User is null").setStatus(StatusCode.ERROR);
                    return false;
                }
            } catch (RuntimeException e) {
                span.recordException(e).setStatus(StatusCode.ERROR, e.getMessage());
                if (e.getMessage().equals("Unauthorized")) {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                } else {
                    response.setStatus(HttpStatus.BAD_REQUEST.value());
                }
                return false;
            } catch (Exception e) {
                span.recordException(e).setStatus(StatusCode.ERROR, e.getMessage());
                response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
                return false;
            } finally {
                request.setAttribute("parentSpan", span);
                span.end();
            }
        }

    }
}
