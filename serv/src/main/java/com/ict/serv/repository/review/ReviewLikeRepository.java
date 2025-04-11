package com.ict.serv.repository.review;

import com.ict.serv.entity.review.ReviewLike;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {


    int countByReviewId(Long reviewId);

    boolean existsByUserIdAndReviewId(Long userId, Long reviewId);
}
