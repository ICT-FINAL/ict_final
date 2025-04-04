package com.ict.serv.service;

import com.ict.serv.controller.product.ProductPagingVO;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.product.ProductImage;
import com.ict.serv.repository.product.ProductImageRepository;
import com.ict.serv.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository repo;
    private final ProductImageRepository image_repo;
    public Product saveProduct(Product product){
        return repo.save(product);
    }

    public void saveProductImage(ProductImage productImage) {
        image_repo.save(productImage);
    }

    public List<ProductImage> getImages(Product product) {
        return image_repo.findAllByProduct(product);
    }

    public int totalRecord(ProductPagingVO pvo){
        return repo.countByProductNameContaining(pvo.getSearchWord());
    }

    public List<Product> getProductList(ProductPagingVO pvo) {
        return repo.findAllByProductNameContainingAndEventCategoryContainingAndTargetCategoryContainingAndProductCategoryContaining(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(), pvo.getProductCategory(), PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
    }
}
