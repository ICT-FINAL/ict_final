package com.ict.serv.service;

import com.ict.serv.entity.UserPoint;
import com.ict.serv.entity.order.OrderItem;
import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.order.ShippingState;
import com.ict.serv.entity.sales.CouponUsageDTO;
import com.ict.serv.entity.sales.DailySalesDTO;
import com.ict.serv.entity.sales.PurchaseStatsDTO;
import com.ict.serv.entity.sales.SellerSalesSummaryDTO;
import com.ict.serv.repository.*;
import com.ict.serv.repository.inquiry.InquiryRepository;
import com.ict.serv.repository.log.SearchLogRepository;
import com.ict.serv.repository.log.UserJoinLogRepository;
import com.ict.serv.repository.order.OrderItemRepository;
import com.ict.serv.repository.review.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

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
    private final MyStatsRepository myStatsRepository;
    private final CouponRepository couponRepository;
    private final OrderItemRepository orderItemRepository;

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

    public List<PurchaseStatsDTO> getMonthlyPurchaseStats(Long userId, int year, Integer month) {
        // 1. 사용자 ID로 SETTLED 상태의 주문들을 조회 (조건 1)
        List<Orders> ordersList = myStatsRepository.findByUserIdAndShippingState(userId, ShippingState.SETTLED);

        // 2. 연도-월별 통계를 누적할 맵 (키: YearMonth, 값: PurchaseStatsDTO)
        Map<YearMonth, PurchaseStatsDTO> statsMap = new LinkedHashMap<>();

        // 3. 주문 목록 순회
        for (Orders order : ordersList) {
            // 주문의 연도와 월 추출 (예: LocalDateTime orderDate가 있다고 가정)
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime dateTime = LocalDateTime.parse(order.getStartDate(), formatter);
            if (dateTime.getYear() != year) continue;
            if (month != null && dateTime.getMonthValue() != month) continue;
            YearMonth yearMonth = YearMonth.from(dateTime);

            // 해당 연도-월 키에 대한 DTO 생성 또는 가져오기
            PurchaseStatsDTO statsDTO = statsMap.get(yearMonth);
            if (statsDTO == null) {
                // 처음 등장하는 Year-Month이면 새로운 DTO 생성 (주문 수 0, 금액 0으로 초기화)
                statsDTO = new PurchaseStatsDTO(yearMonth.getYear(), yearMonth.getMonthValue(), 0, BigDecimal.ZERO);
                statsMap.put(yearMonth, statsDTO);
            }

            // 4. 주문 수 증가 (각 주문당 1 증가, 조건 3: 같은 주문은 한 번만 센다)
            statsDTO.setOrderCount(statsDTO.getOrderCount() + 1);

            // 5. 해당 주문의 총 금액 계산 (주문에 속한 모든 OrderItem의 금액 합산, 조건 2)
            BigDecimal orderTotal = BigDecimal.ZERO;
            for (OrderItem item : order.getOrderItems()) {
                // (price * (100 - discountRate) / 100 + additionalFee) * quantity 계산
                int quantity = item.getQuantity();
                int additionalFee = item.getAdditionalFee();
                BigDecimal priceAfterDiscount = BigDecimal.valueOf(item.getPrice())
                        .multiply(BigDecimal.valueOf(100 - item.getDiscountRate()))
                        .divide(BigDecimal.valueOf(100));

                BigDecimal totalItemPrice = priceAfterDiscount
                        .add(BigDecimal.valueOf(additionalFee))
                        .multiply(BigDecimal.valueOf(quantity));
                orderTotal = orderTotal.add(totalItemPrice);
            }

            // 6. 연도-월 그룹의 총 금액에 이번 주문의 금액을 추가
            statsDTO.setTotalAmount(statsDTO.getTotalAmount().add(orderTotal));
        }

        // 7. Map의 값들을 리스트로 변환하여 반환 (必要시 연도/월 순으로 정렬)
        List<PurchaseStatsDTO> resultList = new ArrayList<>(statsMap.values());
        // 연도, 월 오름차순 정렬 (옵션)
        resultList.sort(Comparator.comparing(PurchaseStatsDTO::getYear)
                .thenComparing(PurchaseStatsDTO::getMonth));
        return resultList;
    }
    public Map<String, Long> getCategoryPurchaseStats(Long userId, int year, Integer month) {
        List<Orders> orders = myStatsRepository.findByUserIdAndShippingState(userId, ShippingState.SETTLED);

        Map<String, Long> categoryMap = new HashMap<>();

        for (Orders order : orders) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime dateTime = LocalDateTime.parse(order.getStartDate(), formatter);
            if (dateTime.getYear() != year) continue;
            if (month != null && dateTime.getMonthValue() != month) continue;
            String category = order.getProduct().getProductCategory(); // 일반 상품 기준

            long orderTotal = 0;

            for (OrderItem item : order.getOrderItems()) {
                long itemPrice = item.getPrice();
                int discountRate = item.getDiscountRate();
                long afterDiscount = itemPrice * (100 - discountRate) / 100;
                afterDiscount += item.getAdditionalFee();
                orderTotal += afterDiscount * item.getQuantity();
            }

            orderTotal += order.getShippingFee(); // 배송비 포함

            categoryMap.merge(category, orderTotal, Long::sum);
        }

        return categoryMap;
    }
    public Map<String, Object> getUsedCouponStats(Long userId, int year, Integer month) {
        List<Object[]> raw = couponRepository.getUsedCouponStatsByUser(userId);
        long count = 0;
        long totalDiscount = 0;

        for (Object[] row : raw) {
            int rowYear = (Integer) row[0];
            int rowMonth = (Integer) row[1];
            if (rowYear == year && (month == null || rowMonth == month)) {
                count += ((Number) row[2]).longValue();
                totalDiscount += ((Number) row[3]).longValue();
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("couponCount", count);
        result.put("totalDiscount", totalDiscount);
        return result;
    }
    public SellerSalesSummaryDTO getSalesSummary(Long sellerId, String startDate, String endDate) {
        return orderItemRepository.getSalesSummaryBySellerAndDate(sellerId, startDate, endDate);
    }
    public List<DailySalesDTO> getDailySales(Long sellerId, String start, String end) {
        List<Object[]> raw = orderItemRepository.getDailySalesNative(sellerId, start, end);
        return raw.stream()
                .map(row -> new DailySalesDTO((String) row[0], ((Number) row[1]).longValue()))
                .collect(Collectors.toList());
    }
}
