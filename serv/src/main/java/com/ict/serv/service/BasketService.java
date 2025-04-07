package com.ict.serv.service;

import com.ict.serv.entity.basket.Basket;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.basket.BasketRepository;
import com.ict.serv.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BasketService {
    private final BasketRepository basketRepository;
    private final ProductRepository productRepository;

    // 특정 사용자의 장바구니 목록 조회
    public List<Map<String, Object>> getBasketItems(User user) {
        List<Basket> baskets = basketRepository.findByUserNo(user);

        return baskets.stream().map(basket -> {
            Map<String, Object> item = new HashMap<>();
            Product product = basket.getProductNo();
            item.put("basketNo", basket.getId());
            item.put("sellerNo", product);
            item.put("quantity", basket.getBasketQuantity());
            return item;
        }).collect(Collectors.toList());
    }

//    // 장바구니에 상품 추가 (이미 있으면 수량 증가)
//    @Transactional
//    public void addToBasket(User user, Long productNo, int quantity) {
//        Product product = productRepository.findById(productNo)
//                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
//
//        Basket existingBasket = basketRepository.findByUserNoAndProductNo(user, productNo);
//
//        if (existingBasket != null) {
//            existingBasket.setBasketQuantity(existingBasket.getBasketQuantity() + quantity);
//        } else {
//            Basket basket = new Basket();
//            basket.setUserNo(user);
//            basket.setProductNo(product);
//            basket.setBasketQuantity(quantity);
//            basketRepository.save(basket);
//        }
//    }
//
//    // 장바구니에서 특정 상품 삭제
//    @Transactional
//    public void removeFromBasket(User user, Long productNo) {
//        basketRepository.deleteByUserNoAndProductNo(user, productNo);
//    }
//
//    // 장바구니 전체 비우기
//    @Transactional
//    public void clearBasket(User user) {
//        basketRepository.deleteByUserNo(user);
//    }

}
