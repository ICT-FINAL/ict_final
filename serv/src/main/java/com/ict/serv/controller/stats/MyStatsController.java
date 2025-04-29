package com.ict.serv.controller.stats;

import com.ict.serv.entity.UserPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.ict.serv.service.MyStatsService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mystats")
@CrossOrigin(origins = "*")
public class MyStatsController {
    private final MyStatsService myStatsService;

    @GetMapping("/activity/{userId}")
    public Map<String, Object> getMyActivity(
            @PathVariable Long userId,
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> result = new HashMap<>();
        result.put("reviewCount", myStatsService.getReviewCount(userId, year, month));
        result.put("inquiryCount", myStatsService.getInquiryCount(userId, year, month));
        result.put("wishlistCount", myStatsService.getWishlistCount(userId, year, month));
        result.put("userPointHistory", myStatsService.getUserPointHistory(userId, year, month));
        result.put("followerCount", myStatsService.getFollowerCount(userId, year, month));
        result.put("followingCount", myStatsService.getFollowingCount(userId, year, month));
        result.put("monthlyAccessCount", myStatsService.getMonthlyAccessCount(userId, year, month));

        List<Map<String, Object>> topSearchWords = myStatsService.getTopSearchWords(userId, year, month).stream()
                .map(obj -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("searchWord", obj[0]);
                    map.put("count", obj[1]);
                    return map;
                }).collect(Collectors.toList());
        result.put("topSearchWords", topSearchWords);

        result.put("categorySearchRate", myStatsService.getCategorySearchRate(userId, year, month));

        return result;
    }
}
