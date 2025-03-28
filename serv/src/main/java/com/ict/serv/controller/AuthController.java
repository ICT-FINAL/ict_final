package com.ict.serv.controller;

import com.ict.serv.dto.*;
import com.ict.serv.entity.user.Account;
import com.ict.serv.entity.Authority;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.AuthService;
import com.ict.serv.util.JwtProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;



import java.io.File;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @GetMapping("/auth/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        // 세션에서 JWT 가져오기
        String token = (String) session.getAttribute("JWT");

        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 필요");
        }

        // JWT에서 사용자 아이디 추출
        String userid = jwtProvider.getUseridFromToken(token);

        // 유저 정보 조회
        User user = authService.findByUserid(userid);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("유저 정보 없음");
        }

        // 유저 정보 반환 (비밀번호 제외)
        return ResponseEntity.ok(new UserResponseDto(user.getUserid(), user.getUsername(), user.getEmail(), user.getUploadedProfileUrl()));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto loginRequest, HttpServletRequest request) {
        User user = authService.findByUserid(loginRequest.getUserid());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유저가 존재하지 않습니다.");
        }

        if (!passwordEncoder.matches(loginRequest.getUserpw(), user.getUserpw())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호가 일치하지 않습니다.");
        }

        String token = jwtProvider.createToken(user.getUserid());

        HttpSession session = request.getSession();
        session.setAttribute("JWT", token);

        UserResponseDto userResponse = new UserResponseDto(
                user.getUserid(),
                user.getUsername(),
                user.getEmail(),
                user.getUploadedProfileUrl()
        );
        return ResponseEntity.ok(new LoginResponseDto(token, "로그인 성공", userResponse));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);

        SecurityContextHolder.clearContext();

        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");

        return ResponseEntity.ok("로그아웃 성공");
    }

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
    @GetMapping("/signup/google")
    public Account googleSignup(HttpServletRequest request) {
        String code = request.getParameter("code");
        System.out.println(code);
        String accessToken = authService.getGoogleAccessToken(code);
        Map<String, Object> googleUserInfo = authService.getGoogleUserInfo(accessToken);
        System.out.println("Google 사용자 정보: " + googleUserInfo);

        String googleId = googleUserInfo.get("id").toString();
        String email = googleUserInfo.get("email").toString();
        String name = googleUserInfo.get("name").toString();
        String profileImage = googleUserInfo.get("picture").toString();
        if(authService.findUserByEmail(email) != null) return null;
        Account account = new Account();
        account.setNickname(name);
        account.setPicture(profileImage);
        account.setEmail(email);
        // 3. DB에 회원 정보 저장 or 로그인 처리
       // Account account = userService.googleSignup(googleId, email, name, profileImage);
        return account;
        /*
        KakaoTokenDto kakaoTokenDto = authService.getKakaoAccessToken(code);
        System.out.println("kakaoTokenDto: " + kakaoTokenDto);
        String kakaoAccessToken = kakaoTokenDto.getAccess_token();
        System.out.println("kakaoAccessToken: " + kakaoAccessToken);

        Account account = authService.kakaoSignup(kakaoAccessToken);
        return account;*/
    }

    @PostMapping("/signup/doSignUp")
    public ResponseEntity<String> doSignUp(@RequestParam("userid") String userid, @RequestParam("username") String username, @RequestParam("email") String email, @RequestParam("userpw") String userpw, @RequestParam(value = "profileImage", required = false) MultipartFile profileImage, @RequestParam(value = "kakaoProfileUrl", required = false) String kakaoProfileUrl) {
        try {
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            String encryptedPassword = passwordEncoder.encode(userpw);

            String uploadDir = System.getProperty("user.dir") + "/uploads/user/profile";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String uploadedProfileUrl = null;

            if (profileImage != null && !profileImage.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + profileImage.getOriginalFilename();
                File dest = new File(uploadDir, fileName);
                profileImage.transferTo(dest);
                uploadedProfileUrl = "/uploads/user/profile/" + fileName;
            }

            String finalProfileUrl = (uploadedProfileUrl != null) ? uploadedProfileUrl : kakaoProfileUrl;

            User newUser = User.builder()
                    .userid(userid)
                    .username(username)
                    .email(email)
                    .userpw(encryptedPassword)
                    .kakaoProfileUrl(kakaoProfileUrl)
                    .uploadedProfileUrl(finalProfileUrl)
                    .authority(Authority.ROLE_USER)
                    .build();

            authService.saveUser(newUser);

            return ResponseEntity.ok("회원가입 성공");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 실패: " + e.getMessage());
        }
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
