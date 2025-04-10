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
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BasketService {
    private final BasketRepository basketRepository;
    private final ProductRepository productRepository;
    private final OptionRepository optionRepository;
    private final OptionCategoryRepository optionCategoryRepository;

    public void insertBasket(Basket basket) {
        basketRepository.save(basket);
    }

    public List<Map<String, Object>> getBasketItems(User user) {
        List<Basket> baskets = basketRepository.findByUserNo(user);

        return baskets.stream().map(basket -> {
            Map<String, Object> item = new HashMap<>();
            Product product = basket.getProductNo();
            item.put("basketNo", basket.getId());
            OptionCategory opt_c = basket.getOption_no();
            item.put("categoryName",opt_c.getCategoryName());
            item.put("categoryQuantity",opt_c.getQuantity());
            item.put("additionalPrice",opt_c.getAdditionalPrice());
            Option opt = opt_c.getOption();
            item.put("optionName",opt.getOptionName());
            Product prod = opt.getProduct();
            item.put("productImage",prod.getImages().get(0).getFilename());
            item.put("productNo",prod.getId());
            item.put("productDiscountRate", prod.getDiscountRate());
            item.put("productPrice",prod.getPrice());
            item.put("productShippingFee",prod.getShippingFee());
            item.put("productName",prod.getProductName());
            item.put("sellerNo", prod.getSellerNo().getId());
            item.put("sellerName",prod.getSellerNo().getUsername());
            item.put("quantity", basket.getBasketQuantity());
            item.put("optionCategoryId", opt_c.getId());
            System.out.println("items!!!!"+item);
            return item;
        }).collect(Collectors.toList());
    }

    @Transactional
    public boolean updateBasketItemQuantity(User user, Long basketNo, int quantity) {
        Optional<Basket> optionalBasket = basketRepository.findByIdAndUserNo(basketNo, user);
        if (optionalBasket.isPresent()) {
            Basket basket = optionalBasket.get();
            basket.setBasketQuantity(quantity);
            return true;
        }
        return false;
    }

    @Transactional
    public void deleteBasketItems(User user, List<Long> basketNos) {
        List<Basket> basketsToDelete = basketRepository.findByUserNoAndIdIn(user, basketNos);
        basketRepository.deleteAll(basketsToDelete);
    }
}
