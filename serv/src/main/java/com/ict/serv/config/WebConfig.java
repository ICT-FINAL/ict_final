package com.ict.serv.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) { // 유저 프로필 이미지
        registry.addResourceHandler("/uploads/user/profile/**")
                .addResourceLocations("file:src/main/webapp/uploads/user/profile/");
    }
}