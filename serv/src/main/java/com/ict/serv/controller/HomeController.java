package com.ict.serv.controller;

import com.ict.serv.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    public String test(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return "로그인이 필요합니다.";
        }

        System.out.println(userDetails);
        return "현재 로그인된 유저: " + userDetails.getUsername();
    }
}
