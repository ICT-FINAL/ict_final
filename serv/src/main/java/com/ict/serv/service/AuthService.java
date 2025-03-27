package com.ict.serv.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ict.serv.dto.*;
import com.ict.serv.entity.Account;
import com.ict.serv.entity.User;
import com.ict.serv.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    @Value("${kakao.client-id}")
    String KAKAO_CLIENT_ID;

    @Value("${kakao.redirect-uri}")
    String KAKAO_REDIRECT_URI;

    public User findByUserid(String userid) {
        return (User) userRepository.findByUserid(userid)
                .orElse(null);
    }

    public KakaoTokenDto getKakaoAccessToken(String code) {

        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", KAKAO_CLIENT_ID);
        params.add("redirect_uri", KAKAO_REDIRECT_URI);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> kakaoTokenRequest = new HttpEntity<>(params, headers);
        System.out.println(kakaoTokenRequest);

        ResponseEntity<String> accessTokenResponse = rt.exchange(
                "https://kauth.kakao.com/oauth/token",
                HttpMethod.POST,
                kakaoTokenRequest,
                String.class
        );

        ObjectMapper objectMapper = new ObjectMapper();
        KakaoTokenDto kakaoTokenDto = null;
        try {
            kakaoTokenDto = objectMapper.readValue(accessTokenResponse.getBody(), KakaoTokenDto.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return kakaoTokenDto;
    }

    public KakaoAccountDto getKakaoInfo(String kakaoAccessToken) {

        RestTemplate rt = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + kakaoAccessToken);
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        HttpEntity<MultiValueMap<String, String>> accountInfoRequest = new HttpEntity<>(headers);

        ResponseEntity<String> accountInfoResponse = rt.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.POST,
                accountInfoRequest,
                String.class
        );

        // 응답 상태 코드 로그 출력
        System.out.println("카카오 응답 상태 코드: " + accountInfoResponse.getStatusCode());
        System.out.println("카카오 응답 본문: " + accountInfoResponse.getBody());

        ObjectMapper objectMapper = new ObjectMapper();
        KakaoAccountDto kakaoAccountDto = null;
        try {
            kakaoAccountDto = objectMapper.readValue(accountInfoResponse.getBody(), KakaoAccountDto.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        // kakaoAccountDto가 제대로 파싱되었는지 확인
        if (kakaoAccountDto == null) {
            System.out.println("카카오 계정 정보 파싱 실패");
        } else {
            System.out.println("카카오 계정 정보 파싱 성공");
        }

        return kakaoAccountDto;
    }

    public Account mapKakaoInfo(KakaoAccountDto accountDto) {
        Long kakaoId = accountDto.getId();
        String email = accountDto.getKakao_account().getEmail();
        String nickname = accountDto.getKakao_account().getProfile().getNickname();
        String picture = accountDto.getKakao_account().getProfile().getProfile_image_url();
        System.out.println("매핑한 정보 : " + email + ", " + nickname);
        return Account.builder()
                .id(kakaoId)
                .email(email)
                .nickname(nickname)
                .loginType("USER")
                .picture(picture)
                .build();
    }

    public Account kakaoSignup(String kakaoAccessToken) {
        KakaoAccountDto kakaoAccountDto = getKakaoInfo(kakaoAccessToken);

        if (kakaoAccountDto.getKakao_account() == null) {
            System.out.println("카카오 계정 정보가 없습니다.");
            throw new IllegalArgumentException("카카오 계정 정보가 없습니다.");
        }

        String kakaoEmail = kakaoAccountDto.getKakao_account().getEmail();

        if (kakaoEmail == null || kakaoEmail.isEmpty()) {
            System.out.println("카카오 이메일이 존재하지 않습니다.");
            throw new IllegalArgumentException("카카오 이메일이 존재하지 않습니다.");
        }
        User result = userRepository.findByEmail(kakaoEmail);
        if(result != null) return null;
        Account selectedAccount = mapKakaoInfo(kakaoAccountDto);
        System.out.println("수신된 account 정보 : " + selectedAccount);
        SignupResponseDto loginResponseDto = new SignupResponseDto();
        loginResponseDto.setKakaoAccessToken(kakaoAccessToken);

        return selectedAccount;
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }
}
