package com.youdianzhishi.orderservice.model;

public class BookDto {
    private int id;
    private String title;
    private int price;
    private String cover_url;
    private int quantity;

    // getters and setters ...
    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getTitle(){
        return title;
    }
    public void setTitle(String title){
        this.title = title;
    }
    public int getPrice(){
        return price;
    }
    public void setPrice(int price){
        this.price = price;
    }
    public String getCover_url(){
        return cover_url;
    }
    public void setCover_url(String cover_url){
        this.cover_url = cover_url;
    }
    public int getQuantity(){
        return quantity;
    }
    public void setQuantity(int quantity){
        this.quantity = quantity;
    }
    

}
