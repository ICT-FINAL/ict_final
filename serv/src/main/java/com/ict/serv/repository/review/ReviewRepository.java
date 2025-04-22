package com.ict.serv.repository.review;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.review.Review;
import com.ict.serv.entity.user.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByUserAndProduct(User user, Product product);

    List<Review> findByProduct(Product product);

    List<Review> findByUser(User user);

    List<Review> findByOrderByReviewWritedateDesc();

    @Query("SELECT r.product.id, AVG(CAST(r.rate AS double)), COUNT(r) FROM Review r GROUP BY r.product.id")
    List<Object[]> getAvgAndCountByProduct();
}
