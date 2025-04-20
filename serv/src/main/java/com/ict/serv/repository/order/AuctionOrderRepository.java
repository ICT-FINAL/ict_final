package com.ict.serv.repository.order;

import com.ict.serv.entity.order.AuctionOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuctionOrderRepository extends JpaRepository<AuctionOrder, Long> {
}
