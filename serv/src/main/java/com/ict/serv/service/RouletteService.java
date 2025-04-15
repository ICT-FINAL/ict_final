package com.ict.serv.service;

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

    private String getUserIdFromSecurityContext() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        log.error("Principal is not UserDetails: {}", principal);
        return null;
    }

    private User getUserByUserId(String userId) {
        return userRepository.findByEmail(getEmailByUserId(userId));
    }

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

    @Transactional
    public String spinAndAddPoint() {
        String userId = getUserIdFromSecurityContext();
        if (userId == null) throw new RuntimeException("Authentication failed: No userId found");

        User user = getUserByUserId(userId);
        if (user == null) throw new RuntimeException("User not found for userId: " + userId);

        UserPoint userPoint = userPointRepository.findByUserId(user.getId())
                .orElseGet(() -> new UserPoint(user.getId(), 0, null));

        if (userPoint.getLastSpinDate() != null && userPoint.getLastSpinDate().equals(LocalDate.now())) {
            throw new IllegalStateException("오늘 이미 돌렸습니다.");
        }

        String[] rewards = {"1000원 쿠폰", "꽝", "100원 쿠폰", "꽝", "100원 쿠폰", "꽝", "꽝", "꽝", "5000원 쿠폰"};
        String reward = rewards[new Random().nextInt(rewards.length)];

        userPoint.setPoint(userPoint.getPoint() + 100);
        userPoint.setLastSpinDate(LocalDate.now());

        try {
            userPointRepository.save(userPoint);
        } catch (Exception e) {
            log.error("Failed to save UserPoint for userId: {}, error: {}", user.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to save points: " + e.getMessage());
        }

        return reward;
    }
}
