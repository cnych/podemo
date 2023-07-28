package com.youdianzhishi.orderservice.controller;

import com.youdianzhishi.orderservice.OrderserviceApplication;
import com.youdianzhishi.orderservice.model.*;
import com.youdianzhishi.orderservice.repository.OrderRepository;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private static final Logger logger = LoggerFactory.getLogger(OrderserviceApplication.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WebClient webClient;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Map<String, Long>> createOrder(@RequestBody Order order, HttpServletRequest request) {
        // 从拦截器中获取用户信息
        User user = (User) request.getAttribute("user");
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

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
        OrderDto orderDto = new OrderDto();
        orderDto.setId(order.getId());
        orderDto.setStatus(order.getStatus());
        try {
            List<Integer> bookIds = order.getBookIds(); // 假设你有一个可以获取书籍ID的方法
            // 将 bookIds 转换为字符串，以便于传递给 WebClient
            String bookIdsStr = bookIds.stream().map(String::valueOf).collect(Collectors.joining(","));
            logger.debug("bookIdsStr: {}", bookIdsStr);
            // 用 WebClient 调用批量查询书籍的服务接口
            Mono<List<BookDto>> booksMono = webClient.get() // 假设你有一个webClient实例
                    .uri("http://localhost:8082/api/books/batch?ids=" + bookIdsStr)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<>() {
                    });
            List<BookDto> books = booksMono.block();

            // 还需要将书籍数量和总价填充到 OrderDto 对象中
            int totalAmount = 0;
            int totalCount = 0;
            List<BookQuantity> bqs = order.getBookQuantities();
            for (BookDto book : books) {
                // 如果 book.id 在 bqs 中，那么就将对应的数量设置到 book.quantity 中
                int quantity = bqs.stream().filter(bq -> bq.getId() == book.getId()).findFirst().get().getQuantity();
                book.setQuantity(quantity);
                totalCount += quantity;
                totalAmount += book.getPrice() * quantity;
            }

            orderDto.setBooks(books);
            orderDto.setAmount(totalAmount);
            orderDto.setTotal(totalCount);

            return new ResponseEntity<>(orderDto, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Fetch books info error: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @GetMapping("/users/{userId}/orders")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable int userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }
}
