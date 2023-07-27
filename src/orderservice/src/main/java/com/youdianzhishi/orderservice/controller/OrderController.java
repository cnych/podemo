package com.youdianzhishi.orderservice.controller;

import com.youdianzhishi.orderservice.model.Order;
import com.youdianzhishi.orderservice.model.User;
import com.youdianzhishi.orderservice.model.OrderDto;
import com.youdianzhishi.orderservice.model.BookDto;
import com.youdianzhishi.orderservice.repository.OrderRepository;

import java.util.Date;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
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
    public ResponseEntity<Order> createOrder(@RequestBody Order order, HttpServletRequest request) {
        // 从拦截器中获取用户信息
        User user = (User) request.getAttribute("user");
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        // 设置订单的用户id
        order.setUserId(user.getId());

        // 设置默认状态为已下单
        order.setStatus(Order.ORDERED);
        order.setOrderDate(new Date());

        // 保存订单
        Order savedOrder = orderRepository.save(order);
        return new ResponseEntity<>(savedOrder, HttpStatus.CREATED);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // todo：根据订单中的书籍id，批量调用图书服务获取书籍信息
        // 需要得到书籍列表、总数、总价
        // 创建 OrderDto 对象并填充数据
        OrderDto orderDto = new OrderDto();

        try {
            List<Long> bookIds = order.getBookIds(); // 假设你有一个可以获取书籍ID的方法

            // 用 WebClient 调用批量查询书籍的服务接口
            Mono<List<BookDto>> booksMono = webClient.post() // 假设你有一个webClient实例
                    .uri("http://localhost:8082/api/books/batch")
                    .bodyValue(bookIds)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<BookDto>>() {
                    });
            List<BookDto> books = booksMono.block();

            orderDto.setBooks(books);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // orderDto.setBooks(); // 假设你的 Order 对象有一个 getBooks 方法

        return new ResponseEntity<>(orderDto, HttpStatus.OK);
    }

    @GetMapping("/users/{userId}/orders")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable int userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }
}
