package com.ict.serv.service;

import com.ict.serv.entity.order.*;
import com.ict.serv.entity.product.HotCategoryDTO;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.order.AuctionOrderRepository;
import com.ict.serv.repository.order.OrderGroupRepository;
import com.ict.serv.repository.order.OrderItemRepository;
import com.ict.serv.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository order_repo;
    private final OrderItemRepository order_item_repo;
    private final OrderGroupRepository order_group_repo;
    private final AuctionOrderRepository auctionOrderRepository;

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
    public List<HotCategoryDTO> getHotCategory() {
        List<Object[]> result = order_repo.countProductCategoryFromPaidOrdersWithinTwoWeeks();

        List<HotCategoryDTO> hotCategoryList = new ArrayList<>();
        for (Object[] row : result) {
            String productCategory = (String) row[0];
            Long count = (Long) row[1];

            HotCategoryDTO dto = new HotCategoryDTO();
            dto.setProductCategory(productCategory);
            dto.setCount(count);

            hotCategoryList.add(dto);
        }

        return hotCategoryList;
    }

    public AuctionOrder saveAuctionOrder(AuctionOrder auctionOrder) { return auctionOrderRepository.save(auctionOrder); }
    public Optional<AuctionOrder> selectAuctionOrder(Long id) { return auctionOrderRepository.findById(id);}
}
