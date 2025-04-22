package com.ict.serv.repository.order;

import com.ict.serv.entity.order.AuctionOrder;
import com.ict.serv.entity.order.OrderState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuctionOrderRepository extends JpaRepository<AuctionOrder, Long> {
    List<AuctionOrder> findAllByState(OrderState orderState);
}
