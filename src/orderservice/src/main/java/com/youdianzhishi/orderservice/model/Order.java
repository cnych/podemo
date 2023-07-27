package com.youdianzhishi.orderservice.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import java.util.Date;


@Entity
@Table(name = "orders")
public class Order { 

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String books;  // 用来保存订单中的书籍json数组：[{"id":1,"quantity":2},{"id":2,"quantity":3}]

    private int userId;

    @Column(nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
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

}
