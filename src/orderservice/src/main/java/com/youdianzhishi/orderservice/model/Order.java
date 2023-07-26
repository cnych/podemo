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

    private int bookId;

    private int userId;

    @Column(nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @CreatedDate
    private Date orderDate;

    private int status;

    public Order() {
    }

    public Order(int bookId, int userId, int status) {
        this.bookId = bookId;
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

    public int getBookId() {
        return bookId;
    }

    public void setBookId(int bookId) {
        this.bookId = bookId;
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
