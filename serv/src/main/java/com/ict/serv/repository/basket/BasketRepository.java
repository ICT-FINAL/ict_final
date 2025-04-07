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

//    // 특정 사용자의 특정 상품 조회 (중복 방지)
//    Basket findByUserNoAndProductNo(User user, Long productNo);
//
//    // 특정 사용자의 장바구니 전체 삭제
//    void deleteByUserNo(User user);
//
//    // 특정 사용자의 특정 상품 삭제
//    void deleteByUserNoAndProductNo(User user, Product productNo);
}
