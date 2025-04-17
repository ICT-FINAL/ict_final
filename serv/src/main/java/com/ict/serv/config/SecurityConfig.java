package com.ict.serv.config;

import com.ict.serv.security.JwtAuthenticationFilter;
import com.ict.serv.util.JwtProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtProvider jwtProvider;

    public SecurityConfig(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors().and() // CORS 설정
                .csrf(csrf -> csrf.disable()) // CSRF 비활성화
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션 사용 안 함
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/signup/**",
                                "/auth/login",
                                "/auth/signup-send-code",
                                "/auth/email-verify",
                                "/auth/send-code",
                                "/auth/find-id/verify",
                                "/auth/reset-password/request",
                                "/auth/reset-password/verify",
                                "/auth/reset-password",
                                "/auth/me",
                                "/auth/socialLogin",
                                "/auction/room/**",
                                "/auction/**",
                                "/review/averageStar"
                        ).permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/signup/**", "/auth/login").permitAll()
                        .requestMatchers("/uploads/**").permitAll() //파일
                        .requestMatchers("/static/**", "/resources/**").permitAll()
                        .requestMatchers("/product/search").permitAll()
                        .requestMatchers("/auction/search").permitAll()
                        .requestMatchers("/product/info").permitAll()
                        .requestMatchers("/product/getOption").permitAll()
                        .requestMatchers("/product/getList/**").permitAll()
                        .requestMatchers("/event/getEventList").permitAll()
                        .requestMatchers("/event/getMelonRank").permitAll()
                        .requestMatchers("/payment/**").permitAll()
                        .requestMatchers("/log/**").permitAll()
                        .requestMatchers("/submenu/getSubMenuList").permitAll()
                        .requestMatchers("/api/roulette/check").authenticated()
                        .requestMatchers("/api/roulette/spin").authenticated()
                        .anyRequest().authenticated() // 나머지는 인증 필요
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class); // JWT 필터 추가

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedOrigin("http://192.168.1.146:3000"); // 배포 시 서버 주소로
        configuration.addAllowedMethod("*"); // 모든 HTTP 메서드 허용
        configuration.addAllowedHeader("*"); // 모든 헤더 허용
        configuration.setAllowCredentials(true); // 인증 정보 포함 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 경로에 적용

        return source;
    }
}