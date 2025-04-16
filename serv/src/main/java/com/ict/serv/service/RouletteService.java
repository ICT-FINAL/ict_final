package com.ict.serv.service;

import com.ict.serv.entity.PointType;
import com.ict.serv.entity.UserPoint;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.UserPointRepository;
import com.ict.serv.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class RouletteService {

    private static final Logger log = LoggerFactory.getLogger(RouletteService.class);

    private final UserRepository userRepository;
    private final UserPointRepository userPointRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // 현재 로그인한 사용자의 ID를 SecurityContext에서 가져오는 메서드
    private String getUserIdFromSecurityContext() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        log.error("Principal is not UserDetails: {}", principal);
        return null;
    }

    // 사용자 ID로 User 객체 가져오기
    private User getUserByUserId(String userId) {
        return userRepository.findByEmail(getEmailByUserId(userId));
    }

    // 사용자 ID로 이메일을 가져오는 메서드
    private String getEmailByUserId(String userId) {
        try {
            return entityManager.createQuery("SELECT u.email FROM User u WHERE u.userid = :userId", String.class)
                    .setParameter("userId", userId)
                    .getSingleResult();
        } catch (Exception e) {
            log.error("Failed to find email for userId: {}, error: {}", userId, e.getMessage());
            return null;
        }
    }

    // 오늘 룰렛을 돌릴 수 있는지 확인하는 메서드
    public boolean canSpinToday() {
        String userId = getUserIdFromSecurityContext();
        if (userId == null) return false;

        User user = getUserByUserId(userId);
        if (user == null) return false;

        UserPoint userPoint = userPointRepository.findByUserId(user.getId()).orElse(null);
        if (userPoint == null) return true;

        LocalDate lastSpinDate = userPoint.getLastSpinDate();
        return lastSpinDate == null || !lastSpinDate.equals(LocalDate.now());
    }

    // 룰렛을 돌리고 포인트를 추가하는 메서드
    @Transactional
    public String spinAndAddPoint() {
        String userId = getUserIdFromSecurityContext();
        if (userId == null) throw new RuntimeException("Authentication failed: No userId found");

        User user = getUserByUserId(userId);
        if (user == null) throw new RuntimeException("User not found for userId: " + userId);

        // 사용자의 포인트 정보가 없다면 새로 생성
        UserPoint userPoint = userPointRepository.findByUserId(user.getId())
                .orElseGet(() -> new UserPoint(user.getId(), 0, null, PointType.ROULETTE));

        // 오늘 이미 룰렛을 돌렸다면 예외 발생
        if (userPoint.getLastSpinDate() != null && userPoint.getLastSpinDate().equals(LocalDate.now())) {
            throw new IllegalStateException("오늘 이미 돌렸습니다.");
        }

        // 룰렛 보상 항목
        String[] rewards = {"10% COUPON", "1,000P", "20% COUPON", "500P", "꽝", "2000P", "30% COUPON", "1500P"};
        String reward = rewards[new Random().nextInt(rewards.length)];

        // 기본 100P 적립
        int pointsToAdd = 100;

        // 보상에 따른 추가 포인트
        if (reward.equals("1,000P")) {
            // 1000P가 당첨되면 1100P 적립
            pointsToAdd = 1100;
        } else if (reward.equals("500P")) {
            // 500P가 당첨되면 600P 적립
            pointsToAdd = 600;
        } else if (reward.equals("2000P")) {
            // 2000P가 당첨되면 2100P 적립
            pointsToAdd = 2100;
        } else if (reward.equals("1500P")) {
            // 1500P가 당첨되면 1600P 적립
            pointsToAdd = 1600;
        } else if (reward.equals("꽝") || reward.contains("COUPON")) {
            // 꽝이나 쿠폰이 당첨되면 100P만 적립
            pointsToAdd = 100;
        }

        // 포인트 업데이트
        userPoint.setPoint(userPoint.getPoint() + pointsToAdd); // 계산된 포인트 적립
        userPoint.setLastSpinDate(LocalDate.now()); // 오늘 날짜 기록

        try {
            userPointRepository.save(userPoint);
            user.setGradePoint(user.getGradePoint()+100);
            userRepository.save(user);
        } catch (Exception e) {
            log.error("Failed to save UserPoint for userId: {}, error: {}", user.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to save points: " + e.getMessage());
        }

        return reward;  // 룰렛 보상 반환
    }
}

