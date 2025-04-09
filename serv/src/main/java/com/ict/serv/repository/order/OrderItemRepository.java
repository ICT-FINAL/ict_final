package com.ict.serv.repository.order;

import com.ict.serv.entity.order.OrderItem;
import com.ict.serv.entity.order.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findAllByOrder(Orders orders);
}
