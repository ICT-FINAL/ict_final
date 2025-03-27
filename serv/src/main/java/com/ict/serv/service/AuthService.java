package com.ict.serv.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ict.serv.dto.*;
import com.ict.serv.entity.Account;
import com.ict.serv.repository.AccountRepository;
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
    private final AccountRepository accountRepository;

    @Value("${kakao.client-id}")
    String KAKAO_CLIENT_ID;

    @Value("${kakao.redirect-uri}")
    String KAKAO_REDIRECT_URI;

    public KakaoTokenDto getKakaoAccessToken(String code) {

        RestTemplate rt = new RestTemplate(); //통신용
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        // HttpBody 객체 생성
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code"); //카카오 공식문서 기준 authorization_code 로 고정
        params.add("client_id", KAKAO_CLIENT_ID); //카카오 앱 REST API 키
        params.add("redirect_uri", KAKAO_REDIRECT_URI);
        params.add("code", code); //인가 코드 요청시 받은 인가 코드값, 프론트에서 받아오는 그 코드

        // 헤더와 바디 합치기 위해 HttpEntity 객체 생성
        HttpEntity<MultiValueMap<String, String>> kakaoTokenRequest = new HttpEntity<>(params, headers);
        System.out.println(kakaoTokenRequest);

        // 카카오로부터 Access token 수신
        ResponseEntity<String> accessTokenResponse = rt.exchange(
                "https://kauth.kakao.com/oauth/token",
                HttpMethod.POST,
                kakaoTokenRequest,
                String.class
        );

        // JSON Parsing (-> KakaoTokenDto)
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

        // POST 방식으로 API 서버에 요청 보내고, response 받아옴
        ResponseEntity<String> accountInfoResponse = rt.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.POST,
                accountInfoRequest,
                String.class
        );

        // 응답 상태 코드 로그 출력
        System.out.println("카카오 응답 상태 코드: " + accountInfoResponse.getStatusCode());
        System.out.println("카카오 응답 본문: " + accountInfoResponse.getBody());

        // JSON Parsing (-> kakaoAccountDto)
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
        // Account 객체에 매핑
        return Account.builder()
                .id(kakaoId)
                .email(email)
                .nickname(nickname)
                .loginType("USER")
                .picture(picture)
                .build();
    }

    public Account kakaoSignup(String kakaoAccessToken) {
        System.out.println(kakaoAccessToken);

        // kakaoAccessToken 으로 카카오 회원정보 받아옴
        KakaoAccountDto kakaoAccountDto = getKakaoInfo(kakaoAccessToken);

        // kakao_account 가 null 인지 체크
        if (kakaoAccountDto.getKakao_account() == null) {
            // kakao_account 가 null 이면 로그인 실패 처리
            System.out.println("카카오 계정 정보가 없습니다.");
            throw new IllegalArgumentException("카카오 계정 정보가 없습니다.");
        }

        // kakao_account 가 null 이 아닌 경우 이메일을 가져올 수 있음
        String kakaoEmail = kakaoAccountDto.getKakao_account().getEmail();

        if (kakaoEmail == null || kakaoEmail.isEmpty()) {
            System.out.println("카카오 이메일이 존재하지 않습니다.");
            throw new IllegalArgumentException("카카오 이메일이 존재하지 않습니다.");
        }

        // kakaoAccountDto 를 Account 로 매핑
        Account selectedAccount = mapKakaoInfo(kakaoAccountDto);
        System.out.println("수신된 account 정보 : " + selectedAccount);
        LoginResponseDto loginResponseDto = new LoginResponseDto();
        loginResponseDto.setKakaoAccessToken(kakaoAccessToken);

        return selectedAccount;
    }
/*
    public Long kakaoSignUp(SignupRequestDto requestDto) {

        KakaoAccountDto kakaoAccountDto = getKakaoInfo(requestDto.getKakaoAccessToken());
        Account account = mapKakaoInfo(kakaoAccountDto);

        // 닉네임, 프로필사진 set
        String accountName = requestDto.getAccountName();
        String accountPicture = requestDto.getPicture();
        account.setAccountName(accountName);
        account.setPicture(accountPicture);

        // DB에 save
        accountRepository.save(account);

        // 회원가입 결과로 회원가입한 accountId 리턴
        return account.getId();
    }*/
}
