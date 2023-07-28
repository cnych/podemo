package com.youdianzhishi.orderservice.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BookQuantity {
    private int id;
    private int quantity;

    // getters and setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
