package com.ict.serv.controller.review;

import com.ict.serv.dto.ReviewResponseDto;
import com.ict.serv.entity.order.OrderState;
import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.review.Review;
import com.ict.serv.entity.review.ReviewDTO;
import com.ict.serv.entity.review.ReviewImage;
import com.ict.serv.entity.review.ReviewLike;
import com.ict.serv.entity.user.User;
import com.ict.serv.entity.wish.Wishlist;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.OrderService;
import com.ict.serv.service.ProductService;
import com.ict.serv.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/review")
public class ReviewController {
    private final ReviewService service;
    private final InteractService interactService;
    private final OrderService orderService;
    private final ReviewService reviewService;

    // 후기등록
    @PostMapping("/write")
    @Transactional(rollbackFor = {RuntimeException.class, SQLException.class})
    public ResponseEntity<String> write(@AuthenticationPrincipal UserDetails userDetails, ReviewDTO reviewDTO, @RequestParam("files") MultipartFile[] files){

        List<File> savedFiles = new ArrayList<>();

        Review review = new Review();

        review.setReviewContent(reviewDTO.getReviewContent());
        review.setUser(interactService.selectUserByName(userDetails.getUsername()));
        review.setRate(reviewDTO.getRate());

        Product product = new Product();
        product.setId(reviewDTO.getProductId());
        review.setProduct(product);

        try {
            Review savedReview = service.saveReview(review);
            String uploadDir = System.getProperty("user.dir") + "/uploads/review/" + savedReview.getId();
            File dir = new File(uploadDir);
            if(!dir.exists()) dir.mkdirs();
            for(MultipartFile file : files){
                if (file.isEmpty()) continue;
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null) continue;

                File destFile = new File(uploadDir, originalFilename);
                int point = originalFilename.lastIndexOf(".");
                String baseName = originalFilename.substring(0, point);
                String extension = originalFilename.substring(point + 1);

                int count = 1;
                while (destFile.exists()) {
                    String newFilename = baseName + "(" + count + ")." + extension;
                    destFile = new File(uploadDir, newFilename);
                    count++;
                }
                file.transferTo(destFile);
                savedFiles.add(destFile);

                ReviewImage reviewImage = new ReviewImage();
                reviewImage.setFilename(destFile.getName());
                reviewImage.setSize((int) destFile.length());
                reviewImage.setReview(savedReview);

                savedReview.getImages().add(reviewImage);
            }

            service.saveReview(savedReview);

            return ResponseEntity.ok("후기 등록 성공");
        } catch (Exception e) {
            e.printStackTrace();

            for (File delFile : savedFiles) {
                delFile.delete();
            }
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly(); // 롤백
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("후기 등록 실패");
        }
    }

    // 내가 이 상품을 구매한 사람이 맞는지 체크 (후기버튼 보이기 위해)
    @GetMapping("/checkPurchase")
    public ReviewResponseDto checkPurchase(@RequestParam Long userId, @RequestParam Long productId){
        User user = new User();
        user.setId(userId);

        List<Orders> orders = orderService.selectCheckPurchase(user, productId);
        boolean orderIsOk = false;
        for(Orders order:orders) {
            orderIsOk= orderService.selectOrderGroup(order.getOrderGroup().getId()).get().getState() == OrderState.PAID;
        }

        // 리뷰를 이미 쓴 사람인지 체크!
        Product product = new Product();
        product.setId(productId);

        boolean reviewIsOk = reviewService.selectCheckReview(user, product);

        return new ReviewResponseDto(orderIsOk, reviewIsOk);
    }

    @GetMapping("/productReviewList")
    public ResponseEntity<?> productReviewList(Long productId){
        Product product = new Product();
        product.setId(productId);

        List<Review> reviewList = reviewService.productReviewList(product);

        if (reviewList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("리뷰가 없습니다.");
        }

        return ResponseEntity.ok(reviewList);
    }

    @PostMapping("/like")
    public ResponseEntity<Map<String, Object>> like(@RequestParam("reviewId") Long reviewId, @RequestParam("userId") Long userId) {
        System.out.println("reviewId: " + reviewId);
        System.out.println("userId: " + userId);

        User user = new User();
        user.setId(userId);

        Review review = new Review();
        review.setId(reviewId);

        ReviewLike reviewLike = new ReviewLike();
        reviewLike.setUser(user);
        reviewLike.setReview(review);

        // 좋아요 저장
        ReviewLike result = service.likeInsert(reviewLike);

        // 최신 좋아요 개수 가져오기
        int updatedLikes = service.getLikeCountByReviewId(reviewId);
        System.out.println("111111111111111");
        System.out.println(updatedLikes);
        System.out.println("111111111111111");

        boolean liked = service.isUserLikedReview(userId, reviewId); // 유저가 좋아요 했는지 확인
        System.out.println("222222222222222222");
        System.out.println(liked);
        System.out.println("222222222222222222");

        // 프론트에 보낼 데이터 구성
        Map<String, Object> response = new HashMap<>();
        response.put("likes", updatedLikes);
        response.put("liked", liked);

        return ResponseEntity.ok(response);
    }

}
