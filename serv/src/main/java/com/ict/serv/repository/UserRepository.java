package com.ict.serv.repository;

import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<Object> findByUserid(String userid);
    User findByEmail(String email);
    User findUserById(long id);
    User findUserByUserid(String userid);
}
