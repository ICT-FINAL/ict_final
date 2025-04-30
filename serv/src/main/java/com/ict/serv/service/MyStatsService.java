package com.ict.serv.service;

import com.ict.serv.entity.UserPoint;
import com.ict.serv.repository.FollowRepository;
import com.ict.serv.repository.inquiry.InquiryRepository;
import com.ict.serv.repository.log.SearchLogRepository;
import com.ict.serv.repository.log.UserJoinLogRepository;
import com.ict.serv.repository.review.ReviewRepository;
import com.ict.serv.repository.UserPointRepository;
import com.ict.serv.repository.WishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MyStatsService {
    private final ReviewRepository reviewRepository;
    private final InquiryRepository inquiryRepository;
    private final WishRepository wishRepository;
    private final UserPointRepository userPointRepository;
    private final SearchLogRepository searchLogRepository;
    private final FollowRepository followRepository;
    private final UserJoinLogRepository userJoinLogRepository;


    public Long getReviewCount(Long userId, int year, Integer month) {
        return reviewRepository.countByUserIdAndDate(userId, year, month);
    }

    public Long getInquiryCount(Long userId, int year, Integer month) {
        return inquiryRepository.countByUserIdAndDate(userId, year, month);
    }

    public Long getWishlistCount(Long userId, int year, Integer month) {
        return wishRepository.countByUserIdAndDate(userId, year, month);
    }

    public List<UserPoint> getUserPointHistory(Long userId, int year, Integer month) {
        return userPointRepository.findAllByUserIdAndDate(userId, year, month);
    }

    public List<Object[]> getTopSearchWords(Long userId, int year, Integer month) {
        return searchLogRepository.findTopKeywordsByUserIdAndDate(userId, year, month, PageRequest.of(0, 5));
    }

    public Map<String, Long> getCategorySearchRate(Long userId, int year, Integer month) {
        Map<String, Long> result = new HashMap<>();
        List<Object[]> rawResult = searchLogRepository.findCategorySearchCountsByUserIdAndDate(userId, year, month);
        for (Object[] row : rawResult) {
            String category = (String) row[0];
            Long count = (Long) row[1];
            result.put(category, count);
        }
        return result;
    }

    public Long getFollowerCount(Long userId, int year, Integer month) {
        return followRepository.countFollowersByUserIdAndDate(userId, year, month);
    }

    public Long getFollowingCount(Long userId, int year, Integer month) {
        return followRepository.countFollowingByUserIdAndDate(userId, year, month);
    }

    public Long getMonthlyAccessCount(Long userId, int year, Integer month) {
        return userJoinLogRepository.countUserAccessByYearAndMonth(userId, year, month);
    }
}
