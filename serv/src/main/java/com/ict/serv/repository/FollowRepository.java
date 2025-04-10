package com.ict.serv.repository;

import com.ict.serv.entity.user.Follow;
import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Integer> {
    Follow findByUserFromAndUserTo(User userFrom, User userTo);

    List<Follow> findByUserTo(User user);

    List<Follow> findByUserFrom(User user);
}
