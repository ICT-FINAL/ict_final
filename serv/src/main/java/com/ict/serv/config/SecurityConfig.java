package com.ict.serv.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // CORS 활성화 및 CSRF 비활성화
        http.cors().and()
                .csrf().disable(); // CSRF 비활성화 (필요에 따라 설정)

        // 요청 권한 설정
        http.authorizeHttpRequests()
                .requestMatchers("/login/**", "/signup/**").permitAll() // 로그인, 회원가입은 허용
                .anyRequest().authenticated(); // 나머지 요청은 인증 필요

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:3000"); // 리액트 앱의 출처
        configuration.addAllowedMethod("*"); // 모든 메서드 허용
        configuration.addAllowedHeader("*"); // 모든 헤더 허용
        configuration.setAllowCredentials(true); // 인증된 쿠키 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 요청에 대해 CORS 허용

        return source;
    }
}