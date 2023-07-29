package com.youdianzhishi.orderservice.repository;

import com.youdianzhishi.orderservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(int userId);

    List<Order> findByUserIdOrderByOrderDateDesc(int userId);
}
