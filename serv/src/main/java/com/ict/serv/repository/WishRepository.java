package com.ict.serv.repository;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import com.ict.serv.entity.wish.Wishlist;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WishRepository extends JpaRepository<Wishlist, Long> {
    Wishlist findByUser_IdAndProduct_Id(Long userId, Long productId);

    int countIdByUser(User user);

    List<Wishlist> findAllByUserOrderByIdDesc(User user, PageRequest of);

    @Query(value = "SELECT COUNT(*) " +
            "FROM product p " +
            "JOIN wishlist w ON p.product_id = w.product_no " +
            "WHERE p.seller_no = :sellerId", nativeQuery = true)
    int countWishBySeller(@Param("sellerId") Long sellerId);

    int countIdByProduct(Product product);

    List<Wishlist> findByUser(User user);
}
