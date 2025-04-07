package com.ict.serv.repository;

import com.ict.serv.entity.user.User;
import com.ict.serv.entity.wish.Wishlist;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WishRepository extends JpaRepository<Wishlist, Long> {
    Wishlist findByUser_IdAndProduct_Id(Long userId, Long productId);

    int countIdByUser(User user);

    List<Wishlist> findAllByUserOrderByIdDesc(User user, PageRequest of);
}
