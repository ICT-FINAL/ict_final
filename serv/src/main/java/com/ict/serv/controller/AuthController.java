package com.ict.serv.controller;

import com.ict.serv.dto.*;
import com.ict.serv.entity.user.Account;
import com.ict.serv.entity.Authority;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.UserRepository;
import com.ict.serv.service.AuthService;
import com.ict.serv.service.MailService;
import com.ict.serv.util.JwtProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.ict.serv.dto.EmailRequestDto;




import java.io.File;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    private final MailService mailService;
    private UserRepository userRepository;

    // ✅ 이메일 인증번호 저장 (HashMap 사용)
    private final Map<String, String> verificationCodes = new HashMap<>();

    // ✅ 누락된 파라미터 처리
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, String>> handleMissingParams(MissingServletRequestParameterException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getParameterName() + " 파라미터가 누락되었습니다."));
    }

    // ✅ 이메일 인증번호 전송
    @PostMapping("/auth/send-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody EmailRequestDto request) {
        try {
            authService.sendVerificationCode(request.getEmail());
            return ResponseEntity.ok("인증번호가 전송되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("이메일 전송 실패: " + Optional.ofNullable(e.getMessage()).orElse("알 수 없는 오류"));
        }
    }

    // ✅ 아이디 찾기 - 인증번호 확인 후 아이디 반환
    @PostMapping("/auth/find-id/verify")
    public ResponseEntity<Map<String, String>> verifyCodeAndFindId(@RequestParam String email, @RequestParam String code) {
        if (!authService.verifyCode(email, code)) {
            return ResponseEntity.badRequest().body(Map.of("message", "인증번호가 올바르지 않습니다."));
        }

        User user = authService.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "해당 이메일로 가입된 계정을 찾을 수 없습니다."));
        }

        return ResponseEntity.ok(Map.of(
                "message", "아이디를 찾았습니다.",
                "userid", user.getUserid()
        ));
    }

    // ✅ 비밀번호 재설정 - 인증번호 요청
    @PostMapping("/auth/reset-password/request")
    public ResponseEntity<Map<String, String>> requestPasswordReset(@RequestParam String userid, @RequestParam String email) {
        User user = authService.findByUserid(userid);

        // 유저가 존재하지 않거나 이메일이 일치하지 않을 경우
        if (user == null || !user.getEmail().equals(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "아이디와 이메일이 일치하지 않습니다."));
        }

        String verificationCode = authService.sendVerificationCode(email);
        return ResponseEntity.ok(Map.of("message", "비밀번호 재설정 인증번호가 이메일로 전송되었습니다."));
    }

    // ✅ 비밀번호 재설정 - 인증번호 확인
    @PostMapping("/auth/reset-password/verify")
    public ResponseEntity<Map<String, String>> verifyResetCode(@RequestParam String email, @RequestParam String code) {
        if (!authService.verifyCode(email, code)) {
            return ResponseEntity.badRequest().body(Map.of("message", "인증번호가 올바르지 않습니다."));
        }
        return ResponseEntity.ok(Map.of("message", "인증 성공"));
    }

    // ✅ 비밀번호 재설정 - 최종 비밀번호 변경
    @PostMapping("/auth/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String email, @RequestParam String newPassword) {
        User user = authService.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 이메일의 사용자를 찾을 수 없습니다.");
        }
        user.setUserpw(passwordEncoder.encode(newPassword));
        authService.saveUser(user);
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }

    // 🔹 6자리 인증번호 생성 메서드
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 100000 ~ 999999
        return String.valueOf(code);
    }

    @PostMapping("/verify-code")
    public ResponseEntity<String> verifyCode(
            @RequestParam("email") String email,
            @RequestParam("code") String code) {

        boolean isValid = authService.verifyCode(email, code);
        if (isValid) {
            return ResponseEntity.ok("인증번호가 확인되었습니다.");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증번호가 올바르지 않습니다.");
        }
    }


    @GetMapping("/auth/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        System.out.println("📌 Received Token: " + token);  // 로그 추가

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        // "Bearer " 제거 후 실제 JWT 추출
        token = token.substring(7);
        System.out.println("📌 Extracted Token: " + token);  // 로그 추가

        String userid = jwtProvider.getUseridFromToken(token);

        User user = authService.findByUserid(userid);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("유저 정보 없음");
        }

        return ResponseEntity.ok(new UserResponseDto(user.getUserid(), user.getUsername(), user.getEmail(), user.getUploadedProfileUrl()));
    }


//    @GetMapping("/auth/me")
//    public ResponseEntity<?> getCurrentUser(HttpSession session) {
//        // 세션에서 JWT 가져오기
//        String token = (String) session.getAttribute("JWT");
//
//        if (token == null) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 필요");
//        }
//
//        // JWT에서 사용자 아이디 추출
//        String userid = jwtProvider.getUseridFromToken(token);
//
//        // 유저 정보 조회
//        User user = authService.findByUserid(userid);
//
//        if (user == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("유저 정보 없음");
//        }
//
//        // 유저 정보 반환 (비밀번호 제외)
//        return ResponseEntity.ok(new UserResponseDto(user.getUserid(), user.getUsername(), user.getEmail(), user.getUploadedProfileUrl()));
//    }

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
        KakaoTokenDto kakaoTokenDto = authService.getKakaoAccessToken(code);
        String kakaoAccessToken = kakaoTokenDto.getAccess_token();

        Account account = authService.kakaoSignup(kakaoAccessToken);
        return account;
    }
    @GetMapping("/signup/google")
    public Account googleSignup(HttpServletRequest request) {
        String code = request.getParameter("code");
        String accessToken = authService.getGoogleAccessToken(code);
        Map<String, Object> googleUserInfo = authService.getGoogleUserInfo(accessToken);

        String googleId = googleUserInfo.get("id").toString();
        String email = googleUserInfo.get("email").toString();
        String name = googleUserInfo.get("name").toString();
        String profileImage = googleUserInfo.get("picture").toString();
        if(authService.findUserByEmail(email) != null) return null;
        Account account = new Account();
        account.setNickname(name);
        account.setPicture(profileImage);
        account.setEmail(email);
        return account;
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
