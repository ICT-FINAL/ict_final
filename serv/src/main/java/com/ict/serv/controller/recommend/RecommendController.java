package com.ict.serv.controller.recommend;

import com.ict.serv.controller.product.ProductPagingVO;
import com.ict.serv.dto.recommend.WishRecommendRequest;
import com.ict.serv.entity.basket.Basket;
import com.ict.serv.entity.log.search.SearchLog;
import com.ict.serv.entity.log.user.UserHitLog;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import com.ict.serv.entity.wish.Wishlist;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.LogService;
import com.ict.serv.service.ProductService;
import com.ict.serv.service.RecommendService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/recommend")
public class RecommendController {
    private final RecommendService recommendService;
    private final InteractService interactService;
    private final ProductService productService;
    private final LogService logService;

    @PostMapping("/getDefaultRecommend")
    public Product getDefaultRecommend(@AuthenticationPrincipal UserDetails userDetails,
                                       @RequestBody WishRecommendRequest productIdList) {
        User user = interactService.selectUserByName(userDetails.getUsername());

        List<Product> all_product_list = productService.selectAllProduct();

        Collections.shuffle(all_product_list);

        for (Product p : all_product_list) {
            boolean isDuplicate = false;
            for (Long id : productIdList.getProductIds()) {
                if (p.getId().equals(id)) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                return p;
            }
        }

        throw new RuntimeException("추천 가능한 상품이 없습니다.");
    }

    @PostMapping("/getWishRecommend")
    public Product getWishRecommend(@AuthenticationPrincipal UserDetails userDetails, @RequestBody WishRecommendRequest productIdList) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        List<Wishlist> wish_list = recommendService.getWishListByUser(user);


        Product product = null;

        List<Integer> indices = new ArrayList<>();
        for (int i = 0; i < wish_list.size(); i++) {
            indices.add(i);
        }
        Collections.shuffle(indices);

        for (int index : indices) {
            Wishlist wish = wish_list.get(index);

            boolean isDuplicate = false;
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

        return product;
    }

    @PostMapping("/getBasketRecommend")
    public Product getBasketRecommend(@AuthenticationPrincipal UserDetails userDetails, @RequestBody WishRecommendRequest productIdList) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        List<Basket> basket_list = recommendService.getBasketsByUser(user);

        Product product = null;

        List<Integer> indices = new ArrayList<>();
        for (int i = 0; i < basket_list.size(); i++) {
            indices.add(i);
        }
        Collections.shuffle(indices);

        for (int index : indices) {
            Basket basket = basket_list.get(index);

            boolean isDuplicate = false;
            for (Long productId : productIdList.getProductIds()) {
                if (productId.equals(basket.getOptionNo().getOption().getProduct().getId())) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                product = productService.selectProduct(basket.getOptionNo().getOption().getProduct().getId()).get();
                break;
            }
        }

        return product;
    }

    @PostMapping("/getHitRecommend")
    public Product getHitRecommend(@AuthenticationPrincipal UserDetails userDetails, @RequestBody WishRecommendRequest productIdList) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        List<UserHitLog> hit_list = logService.getHitList(user);

        Product product = null;

        List<Integer> indices = new ArrayList<>();
        for (int i = 0; i < hit_list.size(); i++) {
            indices.add(i);
        }
        Collections.shuffle(indices);

        for (int index : indices) {
            UserHitLog hitLog = hit_list.get(index);

            boolean isDuplicate = false;
            for (Long productId : productIdList.getProductIds()) {
                if (productId.equals(hitLog.getProduct().getId())) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                product = productService.selectProduct(hitLog.getProduct().getId()).get();
                break;
            }
        }

        return product;
    }

    @PostMapping("/getSearchRecommend")
    public Product getSearchRecommend(@AuthenticationPrincipal UserDetails userDetails, @RequestBody WishRecommendRequest productIdList) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        List<SearchLog> search_list = logService.getSearchList(user);
        List<Product> filtered_list = new ArrayList<>();

        for (SearchLog search : search_list) {
            ProductPagingVO pvo = new ProductPagingVO();
            String[] pc = search.getProductCategory().split(",");
            List<String> categories = new ArrayList<>(Arrays.asList(pc));

            pvo.setSearchWord(search.getSearchWord());
            pvo.setEventCategory(search.getEventCategory());
            pvo.setTargetCategory(search.getTargetCategory());
            pvo.setSort("주문 많은 순");

            List<Product> searched = productService.searchAll(pvo, categories);
            if (!searched.isEmpty()) {
                filtered_list.addAll(searched);
            }
        }

        List<Integer> indices = new ArrayList<>();
        for (int i = 0; i < filtered_list.size(); i++) {
            indices.add(i);
        }
        Collections.shuffle(indices);

        for (int index : indices) {
            Product product = filtered_list.get(index);

            boolean isDuplicate = false;
            for (Long productId : productIdList.getProductIds()) {
                if (productId.equals(product.getId())) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                return product;
            }
        }

        return null;
    }
}
