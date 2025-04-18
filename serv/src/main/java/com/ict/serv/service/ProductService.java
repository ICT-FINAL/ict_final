package com.ict.serv.service;

import com.ict.serv.controller.product.ProductPagingVO;
import com.ict.serv.entity.product.Option;
import com.ict.serv.entity.product.OptionCategory;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.product.ProductImage;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.product.OptionCategoryRepository;
import com.ict.serv.repository.product.OptionRepository;
import com.ict.serv.repository.product.ProductImageRepository;
import com.ict.serv.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository repo;
    private final ProductImageRepository image_repo;
    private final OptionRepository optionRepository;
    private final OptionCategoryRepository optionCategoryRepository;

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
    public int searchCountAll(ProductPagingVO pvo, List<String> categories) {
        if(categories.isEmpty()|| categories.get(0).isEmpty()) return repo.countProductsNoCategory(pvo.getSearchWord(),pvo.getEventCategory(),pvo.getTargetCategory());
        else return repo.countProductsAllCategory(pvo.getSearchWord(),pvo.getEventCategory(),pvo.getTargetCategory(), categories);
    }
    public List<Product> searchAll(ProductPagingVO pvo, List<String> categories) {
        if(categories.isEmpty() || categories.get(0).isEmpty()) {
            return repo.findProductsNoCategory(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(), PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord()));
        }else return repo.findProductsAllCategory(pvo.getSearchWord(),pvo.getEventCategory(),pvo.getTargetCategory(), categories,PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
    }

    public List<Product> searchAllNoPaging(List<String> categories) {
        return repo.findProductsAllCategoryNoPaging(categories);
    }

    public Option saveOption(Option option) {
        return optionRepository.save(option);
    }
    public OptionCategory saveOptionCategory(OptionCategory optionCategory) {
        return optionCategoryRepository.save(optionCategory);
    }

    public Optional<Product> selectProduct(Long id) {
        return repo.findById(id);
    }

    public List<Option> selectOptions(Product product){
        return optionRepository.findByProduct(product);
    }

    public Optional<OptionCategory> selectOptionCategory(Long id) { return optionCategoryRepository.findById(id);}

    public List<Product> selectProductByUser(User user) { return repo.findAllBySellerNo(user);}

    public List<Product> getRAWList(){ return repo.findTop10PopularProductsByRating(); }
}
