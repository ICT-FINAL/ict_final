package com.ict.serv.repository.product;

import com.ict.serv.entity.product.Product;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    int countByProductNameContaining(String searchWord);

    List<Product> findAllByProductNameContainingAndEventCategoryContainingAndTargetCategoryContainingAndProductCategoryContaining(String searchWord, String eventCategory, String targetCategory, String productCategory, PageRequest of);

    @Query(value = "SELECT COUNT(*) " +
            "FROM product p " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% " +
            "AND p.product_category IN (:productCategories)",
            nativeQuery = true)
    int countProductsAllCategory(
            @Param("keyword") String keyword,
            @Param("eventCategory") String eventCategory,
            @Param("targetCategory") String targetCategory,
            @Param("productCategories") List<String> productCategories
    );

    @Query(value = "SELECT * " +
            "FROM product p " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% " +
            "AND p.product_category IN (:productCategories)",
            nativeQuery = true)
    List<Product> findProductsAllCategory(
            @Param("keyword") String keyword,
            @Param("eventCategory") String eventCategory,
            @Param("targetCategory") String targetCategory,
            @Param("productCategories") List<String> productCategories
            , PageRequest of
    );

    @Query(value = "SELECT COUNT(*) " +
            "FROM product p " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory%",
            nativeQuery = true)
    int countProductsNoCategory(@Param("keyword") String keyword,
                                @Param("eventCategory") String eventCategory,
                                @Param("targetCategory") String targetCategory);

    @Query(value = "SELECT * " +
            "FROM product p " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory%",
            nativeQuery = true)
    List<Product> findProductsNoCategory(@Param("keyword") String keyword,
                                         @Param("eventCategory") String eventCategory,
                                         @Param("targetCategory") String targetCategory, PageRequest of);


    // List<Product> findAllByProductNameContaining(String searchWord, PageRequest of);
}
