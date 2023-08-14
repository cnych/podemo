package com.youdianzhishi.orderservice.controller;

import com.youdianzhishi.orderservice.model.OrderDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/")
public class IndexController {
    @GetMapping
    public ResponseEntity<String> home(HttpServletRequest request) {
        return new ResponseEntity<>("Hello OpenTelemetry!", HttpStatus.OK);
    }
}
