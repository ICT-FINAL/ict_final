package com.ict.serv.service;

import com.ict.serv.entity.review.Review;
import com.ict.serv.repository.review.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository repository;

    public Review saveReview(Review review) {
        return repository.save(review);
    }
}
