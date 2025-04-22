package com.ict.serv.controller.recommend;

import com.ict.serv.dto.recommend.WishRecommendRequest;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import com.ict.serv.entity.wish.Wishlist;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.ProductService;
import com.ict.serv.service.RecommendService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/recommend")
public class RecommendController {
    private final RecommendService recommendService;
    private final InteractService interactService;
    private final ProductService productService;

    @PostMapping("/getDefaultRecommend")
    public Product getDefaultRecommend(@AuthenticationPrincipal UserDetails userDetails, @RequestBody WishRecommendRequest productIdList) {
        User user = interactService.selectUserByName(userDetails.getUsername());

        List<Wishlist> wish_list = recommendService.getWishListByUser(user);

        int count = 0;
        boolean isDuplicate = false;
        Product product = null;

        List<Integer> indices = new ArrayList<>();
        for (int i = 0; i < wish_list.size(); i++) {
            indices.add(i);
        }
        Collections.shuffle(indices);

        for (int index : indices) {
            Wishlist wish = wish_list.get(index);

            isDuplicate = false;
            for (Long productId : productIdList.getProductIds()) {
                if (productId.equals(wish.getProduct().getId())) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                product = productService.selectProduct(wish.getProduct().getId()).get();
                break;
            }
        }

        System.out.println(productIdList);
        return product;
    }

    @PostMapping("/getWishRecommend")
    public Product getWishRecommend(@AuthenticationPrincipal UserDetails userDetails, @RequestBody WishRecommendRequest productIdList) {
        User user = interactService.selectUserByName(userDetails.getUsername());

        List<Wishlist> wish_list = recommendService.getWishListByUser(user);

        int count = 0;
        boolean isDuplicate = false;
        Product product = null;

        List<Integer> indices = new ArrayList<>();
        for (int i = 0; i < wish_list.size(); i++) {
            indices.add(i);
        }
        Collections.shuffle(indices);

        for (int index : indices) {
            Wishlist wish = wish_list.get(index);

            isDuplicate = false;
            for (Long productId : productIdList.getProductIds()) {
                if (productId.equals(wish.getProduct().getId())) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                product = productService.selectProduct(wish.getProduct().getId()).get();
                break;
            }
        }

        System.out.println(productIdList);
        return product;
    }
}
