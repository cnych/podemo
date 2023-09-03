package com.youdianzhishi.orderservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.opentelemetry.instrumentation.annotations.SpanAttribute;
import io.opentelemetry.instrumentation.annotations.WithSpan;


@RestController
@RequestMapping("/")
public class IndexController {
    @GetMapping
    @WithSpan("indexSpan")
    public ResponseEntity<String> home(HttpServletRequest request) {
        return new ResponseEntity<>("Hello OpenTelemetry!", HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @WithSpan("fetchIdSpan")
    public ResponseEntity<String> fetchId(@SpanAttribute("id") @PathVariable String id) {
        return new ResponseEntity<>("Hello OpenTelemetry: " + id, HttpStatus.OK);
    }
}
