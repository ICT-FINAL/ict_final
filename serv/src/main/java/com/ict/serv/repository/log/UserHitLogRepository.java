package com.ict.serv.repository.log;

import com.ict.serv.entity.log.user.UserHitLog;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface UserHitLogRepository extends JpaRepository<UserHitLog, Long> {
    boolean existsByUserAndProductAndDateBetween(User user, Product product, LocalDateTime start, LocalDateTime end);
    boolean existsByIpAndProductAndDateBetween(String ip, Product product, LocalDateTime start, LocalDateTime end);

    List<UserHitLog> findAllByUser(User user);
}
