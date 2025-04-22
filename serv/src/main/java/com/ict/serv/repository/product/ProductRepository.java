package com.ict.serv.repository.product;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    int countByProductNameContaining(String searchWord);

    List<Product> findAllByProductNameContainingAndEventCategoryContainingAndTargetCategoryContainingAndProductCategoryContaining(String searchWord, String eventCategory, String targetCategory, String productCategory, PageRequest of);

    List<Product> findAllBySellerNo_Id(long id);
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
            "AND p.product_category IN (:productCategories) ORDER BY DESC p.product_id",
            nativeQuery = true)
    List<Product> findProductsAllCategory(
            @Param("keyword") String keyword,
            @Param("eventCategory") String eventCategory,
            @Param("targetCategory") String targetCategory,
            @Param("productCategories") List<String> productCategories
            , PageRequest of
    );

    @Query(value = "SELECT * " +
            "FROM product p " +
            "WHERE p.product_category IN (:productCategories)",
            nativeQuery = true)
    List<Product> findProductsAllCategoryNoPaging(@Param("productCategories") List<String> productCategories);

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
            "AND p.target_category LIKE %:targetCategory% ORDER BY p.product_id DESC",
            nativeQuery = true)
    List<Product> findProductsNoCategory(@Param("keyword") String keyword,
                                         @Param("eventCategory") String eventCategory,
                                         @Param("targetCategory") String targetCategory, PageRequest of);

    List<Product> findAllBySellerNo(User user);


    @Query("""
        SELECT p
        FROM Product p
        WHERE p.rating >= 3.5
        ORDER BY 
            (SELECT COUNT(r) FROM Review r WHERE r.product = p) +
            (SELECT COUNT(w) FROM Wishlist w WHERE w.product = p) 
        DESC
        """)
    List<Product> findTop10PopularProductsByRating();

    Product findProductById(Long id);

}
