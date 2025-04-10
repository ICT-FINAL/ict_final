package com.ict.serv.service;

import com.ict.serv.entity.basket.Basket;
import com.ict.serv.entity.product.Option;
import com.ict.serv.entity.product.OptionCategory;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.basket.BasketRepository;
import com.ict.serv.repository.product.OptionCategoryRepository;
import com.ict.serv.repository.product.OptionRepository;
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
    private final OptionRepository optionRepository;
    private final OptionCategoryRepository optionCategoryRepository;

    public List<Map<String, Object>> getBasketItems(User user) {
        List<Basket> baskets = basketRepository.findByUserNo(user);

        return baskets.stream().map(basket -> {
            Map<String, Object> item = new HashMap<>();
            Product product = basket.getProductNo();
            item.put("basketNo", basket.getId());
            OptionCategory opt_c = basket.getOption_no();
            Option opt = opt_c.getOption();
            Product prod = opt.getProduct();
            System.out.println(prod.getSellerNo() + "!!!!");
            item.put("sellerNo", prod.getSellerNo());
            item.put("quantity", basket.getBasketQuantity());
            return item;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteBasketItems(User user, List<Long> basketNos) {
        List<Basket> basketsToDelete = basketRepository.findByUserNoAndIdIn(user, basketNos);
        basketRepository.deleteAll(basketsToDelete);
    }

    public void insertBasket(Basket basket) {
        basketRepository.save(basket);
    }
}
