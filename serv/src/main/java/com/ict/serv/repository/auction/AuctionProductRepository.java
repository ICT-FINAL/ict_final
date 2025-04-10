package com.ict.serv.repository.auction;


import com.ict.serv.entity.auction.AuctionProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuctionProductRepository extends JpaRepository<AuctionProduct, Long> {
}
