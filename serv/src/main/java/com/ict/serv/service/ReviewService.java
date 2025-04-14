package com.ict.serv.service;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.review.Review;
import com.ict.serv.entity.review.ReviewLike;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.review.ReviewLikeRepository;
import com.ict.serv.repository.review.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {
    private final ReviewRepository repository;
    private final ReviewLikeRepository like_repository;

    public Review saveReview(Review review) {
        return repository.save(review);
    }


    public boolean selectCheckReview(User user, Product product) {
        return repository.findByUserAndProduct(user, product).isPresent();
    }

    public List<Review> productReviewList(Product product) {
        return repository.findByProduct(product);
    }

    public ReviewLike likeInsert(ReviewLike reviewLike) {
        return like_repository.save(reviewLike);
    }

    public int getLikeCountByReviewId(Long reviewId) {
        return like_repository.countByReviewId(reviewId);
    }

    public boolean isUserLikedReview(Long userId, Long reviewId) {
        return like_repository.existsByUserIdAndReviewId(userId, reviewId);
    }

    public int likeDelete(Review review, User user) {
        return like_repository.deleteByReviewAndUser(review, user);
    }
}
