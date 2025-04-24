package com.ict.serv.repository;

import com.ict.serv.entity.PointType;
import com.ict.serv.entity.UserPoint;
import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserPointRepository extends JpaRepository<UserPoint, Long> {
    List<UserPoint> findByUserId(Long userId);

    List<UserPoint> findByTypeAndUserIdAndLastSpinDate(PointType type, Long userId, LocalDate now);
}
