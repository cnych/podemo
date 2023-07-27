package com.youdianzhishi.orderservice.model;

import java.util.List;

public class OrderDto {
    private List<BookDto> books;
    private int amount;
    private int total;

    public List<BookDto> getBooks() {
        return books;
    }
    public void setBooks(List<BookDto> books) {
        this.books = books;
    }
    public int getAmount(){
        return amount;
    }
    public void setAmount(int amount){
        this.amount = amount;
    }
    public int getTotal(){
        return total;
    }
    public void setTotal(int total){
        this.total = total;
    }
}
