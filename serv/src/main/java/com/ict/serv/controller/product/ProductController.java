package com.ict.serv.controller.product;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.product.ProductImage;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.ProductService;
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
@RequestMapping("/product")
public class ProductController {
    private final InteractService interactService;
    private final ProductService service;

    @PostMapping("/write")
    @Transactional(rollbackFor = {RuntimeException.class, SQLException.class})
    public ResponseEntity<String> write(Product product, @RequestParam("files") MultipartFile[] files,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        List<File> savedFiles = new ArrayList<>();
        try {
            User seller = interactService.selectUserByName(userDetails.getUsername());
            product.setSellerNo(seller);

            product.setImages(new ArrayList<>());

            Product savedProduct = service.saveProduct(product);

            String uploadDir = System.getProperty("user.dir") + "/uploads/product/" + savedProduct.getId();
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            for (MultipartFile file : files) {
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

                ProductImage productImage = new ProductImage();
                productImage.setFilename(destFile.getName());
                productImage.setSize((int) destFile.length());
                productImage.setProduct(savedProduct);

                savedProduct.getImages().add(productImage);
            }

            service.saveProduct(savedProduct);

            return ResponseEntity.ok("상품 등록 성공");
        } catch (Exception e) {
            e.printStackTrace();
            for (File delFile : savedFiles) {
                delFile.delete();
            }
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("상품 등록 실패");
        }
    }

    @GetMapping("/search")
    public Map<String, Object> searchProducts(ProductPagingVO pvo) {
        pvo.setOnePageRecord(10);
        pvo.setTotalRecord(service.totalRecord(pvo));
        List<Product> productList = service.getProductList(pvo);

        Map<String, Object> result = new HashMap<>();
        result.put("productList",productList);
        result.put("pvo",pvo);
        return result;
    }
}
