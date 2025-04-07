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

    // 장바구니에서 특정 상품 삭제
    @Transactional
    public void deleteBasketItems(User user, List<Long> basketNos) {
        List<Basket> basketsToDelete = basketRepository.findByUserNoAndIdIn(user, basketNos);
        basketRepository.deleteAll(basketsToDelete);
    }
}
