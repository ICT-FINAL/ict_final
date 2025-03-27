package com.ict.serv.controller;

import com.ict.serv.dto.*;
import com.ict.serv.entity.Account;
import com.ict.serv.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @GetMapping("/signup/kakao")
    public Account kakaoSignup(HttpServletRequest request) {
        String code = request.getParameter("code");
        System.out.println(code);
        KakaoTokenDto kakaoTokenDto = authService.getKakaoAccessToken(code);
        System.out.println("kakaoTokenDto: " + kakaoTokenDto);
        String kakaoAccessToken = kakaoTokenDto.getAccess_token();
        System.out.println("kakaoAccessToken: " + kakaoAccessToken);

        Account account = authService.kakaoSignup(kakaoAccessToken);

        return account;
    }

    /*
    @PostMapping("/signup")
    public ResponseEntity<SignupResponseDto> kakaoSignup(@RequestBody SignupRequestDto requestDto) {

        // requestDto 로 데이터 받아와서 accountId 반환
        Long accountId = authService.kakaoSignUp(requestDto);
        System.out.println(accountId);
        // 최초 가입자에게는 RefreshToken, AccessToken 모두 발급

   //     TokenDto tokenDto = securityService.signup(accountId);

        // AccessToken 은 header 에 세팅하고, refreshToken 은 httpOnly 쿠키로 세팅
        SignupResponseDto signUpResponseDto = new SignupResponseDto();
        HttpHeaders headers = new HttpHeaders();
     ResponseCookie cookie = ResponseCookie.from("RefreshToken", tokenDto.getRefreshToken())
                .maxAge(60*60*24*7) // 쿠키 유효기간 7일로 설정했음
                .path("/")
                .secure(true)
                .sameSite("None")
                .httpOnly(true)
                .build();
     //   headers.add("Set-Cookie", cookie.toString());
     //   headers.add("Authorization", tokenDto.getAccessToken());

        signUpResponseDto.setResult("가입이 완료되었습니다.");
        return ResponseEntity.ok().headers(headers).body(signUpResponseDto);
    }*/
}
