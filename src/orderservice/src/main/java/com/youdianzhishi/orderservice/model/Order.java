package com.youdianzhishi.orderservice.model;

import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.persistence.*;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.annotation.CreatedDate;
import com.fasterxml.jackson.databind.ObjectMapper; // 使用Jackson库
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.text.SimpleDateFormat;
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

    public OrderDto toOrderDto(WebClient webClient) throws Exception {
        OrderDto orderDto = new OrderDto();
        orderDto.setId(this.getId());
        orderDto.setStatus(this.getStatus());
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String strDate = formatter.format(this.getOrderDate());
        orderDto.setOrderDate(strDate);

        List<Integer> bookIds = this.getBookIds(); // 假设你有一个可以获取书籍ID的方法
        // 将 bookIds 转换为字符串，以便于传递给 WebClient
        String bookIdsStr = bookIds.stream().map(String::valueOf).collect(Collectors.joining(","));
//            logger.debug("bookIdsStr: {}", bookIdsStr);
        // 用 WebClient 调用批量查询书籍的服务接口
        // 从环境变量中获取 bookServiceUrl
        String catalogServiceEnv = System.getenv("CATALOG_SERVICE_URL");
        String catalogServiceUrl = catalogServiceEnv != null ? catalogServiceEnv : "http://localhost:8082";
        Mono<List<BookDto>> booksMono = webClient.get() // 假设你有一个webClient实例
                .uri(catalogServiceUrl + "/api/books/batch?ids=" + bookIdsStr)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
        List<BookDto> books = booksMono.block();

        // 还需要将书籍数量和总价填充到 OrderDto 对象中
        int totalAmount = 0;
        int totalCount = 0;
        List<BookQuantity> bqs = this.getBookQuantities();
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

        return orderDto;
    }
}
