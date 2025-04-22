package com.ict.serv.repository.log;

import com.ict.serv.entity.log.user.UserJoinLog;
import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface UserJoinLogRepository extends JpaRepository<UserJoinLog, Long> {
    boolean existsByUserAndDateBetween(User user, LocalDateTime start, LocalDateTime end);
}
