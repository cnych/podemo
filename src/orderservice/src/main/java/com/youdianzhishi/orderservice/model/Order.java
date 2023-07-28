package com.youdianzhishi.orderservice.model;

import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import com.fasterxml.jackson.databind.ObjectMapper; // 使用Jackson库

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;


@Entity
@Table(name = "orders")
public class Order {
    final public static int PENDING = 1;  // 订单状态：待付款
    final public static int PAID = 2;  // 订单状态：已付款
    final public static int DELIVERED = 3;  // 订单状态：已发货
    final public static int COMPLETED = 4;  // 订单状态：已完成
    final public static int CANCELLED = 5;  // 订单状态：已取消

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String books;  // 用来保存订单中的书籍json数组：[{"id":1,"quantity":2},{"id":2,"quantity":3}]

    private int userId;

    @CreatedDate
    private Date orderDate;

    private int status;

    public Order() {
    }

    public Order(String books, int userId, int status) {
        this.books = books;
        this.userId = userId;
        this.status = status;
    }

    // getters and setters ...
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBooks() {
        return books;
    }

    public void setBooks(String books) {
        this.books = books;
    }

    public List<BookQuantity> getBookQuantities() throws IOException {
        // books 是一个字符串数组，现在我们要从该数组中解析获得 BookQuantity 列表
        ObjectMapper mapper = new ObjectMapper();
        List<BookQuantity> list = mapper.readValue(this.getBooks(), new TypeReference<>() {
        });
        return list;
    }

    public List<Integer> getBookIds() throws IOException {
        // books 是一个字符串数组，现在我们要从该数组中解析获得 id 列表
        List<BookQuantity> list = this.getBookQuantities();
        List<Integer> bookIds = list.stream().map(BookQuantity::getId).collect(Collectors.toList());
        return bookIds;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", books='" + books + '\'' +
                ", userId=" + userId +
                ", orderDate=" + orderDate +
                ", status=" + status +
                '}';
    }
}
