package com.ict.serv.service;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import com.ict.serv.entity.wish.Wishlist;
import com.ict.serv.repository.RecommendRepository;
import com.ict.serv.repository.WishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class RecommendService {
    private final RecommendRepository recommendRepository;
    private final WishRepository wishRepository;

    public Product getWishProduct(User user) {

        return null;
    }

    public List<Wishlist> getWishListByUser(User user) {
        return wishRepository.findByUser(user);
    }
}
