package com.ict.serv.service;

import com.ict.serv.entity.order.*;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.order.OrderGroupRepository;
import com.ict.serv.repository.order.OrderItemRepository;
import com.ict.serv.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository order_repo;
    private final OrderItemRepository order_item_repo;
    private final OrderGroupRepository order_group_repo;

    public Orders insertOrder(Orders orders) {
        return order_repo.save(orders);
    }

    public OrderItem insertOrderItem(OrderItem orderItem) {
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

    public List<Orders> selectCheckPurchase(User user, Long productId) {
        return order_repo.findByUserAndProductId(user, productId);
    }

    public OrderGroup saveOrderGroup(OrderGroup orderGroup) {
        return order_group_repo.save(orderGroup);
    }

    public Optional<OrderGroup> selectOrderGroup(Long id) {
        return order_group_repo.findById(id);
    }

    public List<Orders> selectOrdersByOrderGroup(OrderGroup orderGroup) {
        return order_repo.findAllByOrderGroup(orderGroup);
    }

    public int totalOrderCount(User user, OrderPagingVO pvo) {
        if(pvo.getState() == null) return order_group_repo.countIdByUser(user);
        return order_group_repo.countIdByUserAndState(user, pvo.getState());
    }

    public List<OrderGroup> getOrderByUser(User user, OrderPagingVO pvo) {
        if(pvo.getState() == null) return order_group_repo.findAllByUserOrderByOrderDateDesc(user,PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
        return order_group_repo.findAllByUserAndStateOrderByOrderDateDesc(user,pvo.getState(),PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
    }

    public List<Orders> getOrderByProduct(Long id) {
        return order_repo.findAllByProductIdOrderByStartDateDesc(id);
    }
}
