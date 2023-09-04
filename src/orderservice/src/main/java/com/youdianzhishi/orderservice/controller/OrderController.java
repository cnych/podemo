package com.youdianzhishi.orderservice.controller;

import com.youdianzhishi.orderservice.OrderserviceApplication;
import com.youdianzhishi.orderservice.model.Order;
import com.youdianzhishi.orderservice.model.OrderDto;
import com.youdianzhishi.orderservice.model.User;
import com.youdianzhishi.orderservice.repository.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.StatusCode;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.Scope;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private static final Logger logger = LoggerFactory.getLogger(OrderserviceApplication.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WebClient webClient;

    @Autowired
    private Tracer tracer;

    @GetMapping
    public ResponseEntity<List<OrderDto>> getAllOrders(HttpServletRequest request) {
        // 从请求属性中获取 Span
        Span span = (Span) request.getAttribute("currentSpan");
        Context context = Context.current().with(span);

        try {
            // 从拦截器中获取用户信息
            User user = (User) request.getAttribute("user");
            span.setAttribute("user_id", user.getId()); 

            // 新建一个 DB 查询的 span
            Span dbSpan = tracer.spanBuilder("DB findByUserIdOrderByOrderDateDesc").setParent(context).startSpan();
            // 要根据 orderDate 倒序排列
            List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(user.getId());
            dbSpan.addEvent("OrderRepository findByUserIdOrderByOrderDateDesc From DB");
            dbSpan.setAttribute("order_count", orders.size());
            dbSpan.end();

            // 将Order转换为OrderDto
            List<OrderDto> orderDtos = orders.stream().map(order -> {
                try {
                    return order.toOrderDto(webClient, tracer, context); 
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }).collect(Collectors.toList());

            return new ResponseEntity<>(orderDtos, HttpStatus.OK);
        } catch (Exception e) {
            // 记录 Span 错误
            span.recordException(e).setStatus(StatusCode.ERROR, e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            // 记录 Span 结束时间
            span.end();
        }

    }

    @PostMapping
    public ResponseEntity<Map<String, Long>> createOrder(@RequestBody Order order, HttpServletRequest request) {
        // 从拦截器中获取用户信息
        User user = (User) request.getAttribute("user");

        // 设置订单的用户id
        order.setUserId(user.getId());

        // 设置默认状态为已下单
        order.setStatus(Order.PENDING);
        order.setOrderDate(new Date());

        // 保存订单
        Order savedOrder = orderRepository.save(order);
        // 只需要返回订单ID即可
        Map<String, Long> response = new HashMap<>();
        response.put("id", savedOrder.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        logger.debug("Order: {}", order);

        // 根据订单中的书籍id，批量调用图书服务获取书籍信息
        // 需要得到书籍列表、总数、总价
        // 创建 OrderDto 对象并填充数据
        try {
            OrderDto orderDto = order.toOrderDto(webClient);
            return new ResponseEntity<>(orderDto, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Fetch books info error: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity cancelOrder(@PathVariable Long orderId, HttpServletRequest request) {
        // 从拦截器中获取用户信息
        User user = (User) request.getAttribute("user");

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        if (order.getUserId() != user.getId()) {
            return new ResponseEntity<>("该订单不属于当前用户", HttpStatus.FORBIDDEN);
        }

        if (order.getStatus() != Order.PENDING) {
            return new ResponseEntity<>("只有未发货的订单才能取消", HttpStatus.BAD_REQUEST);
        }

        // 设置订单状态为已取消
        order.setStatus(Order.CANCELLED);
        orderRepository.save(order);
        return new ResponseEntity<>("Ok", HttpStatus.OK);
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity deleteOrder(@PathVariable Long orderId, HttpServletRequest request) {
        // 从拦截器中获取用户信息
        User user = (User) request.getAttribute("user");

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        if (order.getUserId() != user.getId()) {
            return new ResponseEntity<>("该订单不属于当前用户", HttpStatus.FORBIDDEN);
        }

        if (order.getStatus() != Order.CANCELLED) {
            return new ResponseEntity<>("只有已取消的订单才能删除", HttpStatus.BAD_REQUEST);
        }

        orderRepository.deleteById(orderId);
        return new ResponseEntity<>("Ok", HttpStatus.OK);
    }

    @PostMapping("/{orderId}/status/{status}")
    public ResponseEntity updateStatus(@PathVariable Long orderId, @PathVariable int status,
            HttpServletRequest request) {
        // 从拦截器中获取用户信息
        User user = (User) request.getAttribute("user");

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        if (order.getUserId() != user.getId()) {
            return new ResponseEntity<>("该订单不属于当前用户", HttpStatus.FORBIDDEN);
        }

        order.setStatus(status);
        orderRepository.save(order);
        return new ResponseEntity<>("Ok", HttpStatus.OK);
    }
}
