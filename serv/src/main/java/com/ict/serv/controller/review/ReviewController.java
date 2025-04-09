package com.ict.serv.controller.review;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.review.Review;
import com.ict.serv.entity.review.ReviewDTO;
import com.ict.serv.entity.review.ReviewImage;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.ProductService;
import com.ict.serv.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
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
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/review")
public class ReviewController {
    private final ReviewService service;
    private final InteractService interactService;

    // 후기등록
    @PostMapping("/write")
    @Transactional(rollbackFor = {RuntimeException.class, SQLException.class})
    public ResponseEntity<String> write(@AuthenticationPrincipal UserDetails userDetails, ReviewDTO reviewDTO, @RequestParam("files") MultipartFile[] files){

        List<File> savedFiles = new ArrayList<>();

        Review review = new Review();

        System.out.println("============");
        System.out.println(reviewDTO);
        review.setReviewContent(reviewDTO.getReviewContent());
        review.setUser(interactService.selectUserByName(userDetails.getUsername()));

        Product product = new Product();
        product.setId(reviewDTO.getProductId());
        review.setProduct(product);

        Review savedReview = service.saveReview(review);

        try {
            //Review savedReview = service.saveReview(review);

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

            // 에러나면 첨부파일된 것은 모두 지워줘야 한다.

            // 롤백처리
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

            return ResponseEntity.badRequest().body("fail"); //글등록실패
        }
    }

}
