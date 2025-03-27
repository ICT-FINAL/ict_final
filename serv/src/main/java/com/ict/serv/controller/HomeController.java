package com.ict.serv.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HomeController {
    @GetMapping("/")
    public String home(){
        return "index";
    }
    @GetMapping("/test")
    public String test(){
        return "hi";
    }
}
