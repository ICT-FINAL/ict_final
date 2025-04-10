package com.ict.serv.service;


import com.ict.serv.controller.admin.PagingVO;
import com.ict.serv.entity.order.OrderItem;
import com.ict.serv.entity.order.OrderPagingVO;
import com.ict.serv.entity.order.OrderState;
import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.user.User;
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
    public int totalOrderCount(User user, OrderPagingVO pvo){
        if(pvo.getState() == null) return order_repo.countIdByUser(user);
        else return order_repo.countIdByUserAndState(user, pvo.getState());
    }
    public List<Orders> getOrderByUser(User user, OrderPagingVO pvo) {
        if(pvo.getState() == null) return order_repo.findAllByUserOrderByStartDateDesc(user, PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
        else return order_repo.findAllByUserAndStateOrderByStartDateDesc(user,pvo.getState(), PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
    }

    public List<Orders> getOrderByProduct(Long id) {
        return order_repo.findAllByProductIdAndState(id, OrderState.PAID);
    }

    public List<Orders> selectCheckPurchase(User user, Long productId) {
        return order_repo.findByUserAndProductId(user, productId);
    }
}
