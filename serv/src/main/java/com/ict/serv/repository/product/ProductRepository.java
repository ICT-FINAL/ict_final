package com.ict.serv.repository.product;

import com.ict.serv.entity.product.Product;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    int countByProductNameContaining(String searchWord);

    List<Product> findAllByProductNameContainingAndEventCategoryContainingAndTargetCategoryContainingAndProductCategoryContaining(String searchWord, String eventCategory, String targetCategory, String productCategory, PageRequest of);

    List<Product> findAllBySellerNo_Id(long id);


    // List<Product> findAllByProductNameContaining(String searchWord, PageRequest of);
}
