package com.ict.serv.service;


import com.ict.serv.entity.order.OrderItem;
import com.ict.serv.entity.order.Orders;
import com.ict.serv.repository.order.OrderItemRepository;
import com.ict.serv.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository order_repo;
    private final OrderItemRepository order_item_repo;

    public Orders insertOrder(Orders orders) {
        return order_repo.save(orders);
    }
    public OrderItem insertOrderItem(OrderItem orderItem){
        return order_item_repo.save(orderItem);
    }
    public Optional<Orders> selectOrders(Long id) {
        return order_repo.findById(id);
    }
    public List<OrderItem> selectOrderItemList(Orders orders) {
        return order_item_repo.findAllByOrder(orders);
    }
    public Optional<OrderItem> selectOrderItem(Long id) {
        return order_item_repo.findById(id);
    }
}
