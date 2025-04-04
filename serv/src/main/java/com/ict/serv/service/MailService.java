package com.ict.serv.service;

import com.ict.serv.config.GoogleOAuthConfig;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final GoogleOAuthConfig googleOAuthConfig;

    public boolean sendVerificationCode(String email, String code) {
        try {
            String subject = "인증번호 확인";
            String message = "인증번호: " + code;
            sendEmail(email, subject, message);
            return true;
        } catch (Exception e) {
            log.error("이메일 전송 실패: {}", e.getMessage());
            throw new RuntimeException("이메일 전송 실패: " + e.getMessage());
        }
    }

    private void sendEmail(String recipientEmail, String subject, String body) {
        String accessToken = googleOAuthConfig.getAccessToken();
        if (accessToken == null || accessToken.isEmpty()) {
            log.error("액세스 토큰이 없어 이메일 전송 실패");
            return;
        }

        Properties props = new Properties();
        props.put("mail.smtp.auth.mechanisms", "XOAUTH2");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(googleOAuthConfig.getEmail(), accessToken);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(googleOAuthConfig.getEmail()));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientEmail));
            message.setSubject(subject);
            message.setText(body);
            Transport.send(message);
            log.info("📩 이메일 전송 성공: {}", recipientEmail);
        } catch (MessagingException e) {
            log.error("이메일 전송 오류", e);
            throw new RuntimeException("이메일 전송 실패");
        }
    }

    public void sendFindIdEmail(String email, String userId) {
        String subject = "아이디 찾기 안내";
        String message = "회원님의 아이디는 [" + userId + "] 입니다.";
        sendEmail(email, subject, message);
    }

    public void sendPasswordResetEmail(String email, String code) {
        String subject = "비밀번호 재설정 인증번호";
        String message = "비밀번호 재설정을 위한 인증번호: " + code;
        sendEmail(email, subject, message);
    }

    public String generateVerificationCode() {
        return String.valueOf((int) (Math.random() * 900000) + 100000);
    }
}
