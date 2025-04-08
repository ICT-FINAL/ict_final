package com.ict.serv.repository.basket;

import com.ict.serv.entity.basket.Basket;
import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BasketRepository extends JpaRepository<Basket, Long> {

    // 특정 사용자의 장바구니 목록 조회
    List<Basket> findByUserNo(User user);

    List<Basket> findByUserNoAndIdIn(User user, List<Long> ids);
}
