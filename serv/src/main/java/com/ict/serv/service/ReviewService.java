package com.ict.serv.service;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.review.Review;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.review.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository repository;

    public Review saveReview(Review review) {
        return repository.save(review);
    }


    public boolean selectCheckReview(User user, Product product) {
        return repository.findByUserAndProduct(user, product).isPresent();
    }

    public List<Review> productReviewList(Product product) {
        return repository.findByProduct(product);
    }
}
