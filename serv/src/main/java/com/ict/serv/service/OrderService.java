package com.ict.serv.service;

import com.ict.serv.entity.order.*;
import com.ict.serv.entity.product.HotCategoryDTO;
import com.ict.serv.entity.sales.CategorySalesDTO;
import com.ict.serv.entity.sales.SalesStatsDTO;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.order.AuctionOrderRepository;
import com.ict.serv.repository.order.OrderGroupRepository;
import com.ict.serv.repository.order.OrderItemRepository;
import com.ict.serv.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository order_repo;
    private final OrderItemRepository order_item_repo;
    private final OrderGroupRepository order_group_repo;
    private final AuctionOrderRepository auctionOrderRepository;
    private final OrderRepository orderRepository;

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
        return order_repo.findAllByProductIdOrderByIdDesc(id);
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

    public List<OrderGroup> selectAllOrderGroup() {
        return order_group_repo.findAllByState(OrderState.PAID);
    }
    public List<SalesStatsDTO> getDailySalesStats() {
        List<OrderGroup> orderGroups = order_group_repo.findAllByState(OrderState.PAID);
        List<AuctionOrder> auctionOrders = auctionOrderRepository.findAllByState(OrderState.PAID);

        Map<String, SalesStatsDTO> statsMap = new HashMap<>();

        for (OrderGroup group : orderGroups) {
            String date = group.getOrderDate().substring(0, 10);

            statsMap.compute(date, (key, existing) -> {
                if (existing == null) {
                    return new SalesStatsDTO(
                            date,
                            1,
                            group.getTotalPrice(),
                            group.getTotalShippingFee(),
                            group.getCouponDiscount(),
                            group.getTotalPrice() + group.getTotalShippingFee() - group.getCouponDiscount()
                    );
                } else {
                    existing.setOrders(existing.getOrders() + 1);
                    existing.setTotalPrice(existing.getTotalPrice() + group.getTotalPrice());
                    existing.setShippingCost(existing.getShippingCost() + group.getTotalShippingFee());
                    existing.setCouponDiscount(existing.getCouponDiscount() + group.getCouponDiscount());
                    existing.setTotalSales(existing.getTotalPrice() + existing.getShippingCost() - existing.getCouponDiscount());
                    return existing;
                }
            });
        }

        for (AuctionOrder order : auctionOrders) {
            String date = order.getOrderDate().substring(0, 10);

            statsMap.compute(date, (key, existing) -> {
                if (existing == null) {
                    return new SalesStatsDTO(
                            date,
                            1,
                            order.getTotalPrice(),
                            order.getTotalShippingFee(),
                            0,
                            order.getTotalPrice() + order.getTotalShippingFee()
                    );
                } else {
                    existing.setOrders(existing.getOrders() + 1);
                    existing.setTotalPrice(existing.getTotalPrice() + order.getTotalPrice());
                    existing.setShippingCost(existing.getShippingCost() + order.getTotalShippingFee());
                    // 쿠폰 없음이므로 변화 없음
                    existing.setTotalSales(existing.getTotalPrice() + existing.getShippingCost() - existing.getCouponDiscount());
                    return existing;
                }
            });
        }

        return new ArrayList<>(statsMap.values()).stream()
                .sorted(Comparator.comparing(SalesStatsDTO::getDate))
                .collect(Collectors.toList());
    }
    public List<CategorySalesDTO> getSalesByCategory() {
        List<Object[]> raw = orderRepository.getSalesDataByCategory();
        return raw.stream()
                .map(row -> new CategorySalesDTO(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        ((Number) row[2]).longValue()
                ))
                .collect(Collectors.toList());
    }

    public List<CategorySalesDTO> getSalesByEventCategory() {
        return toDTO(orderRepository.getSalesByEventCategory());
    }

    public List<CategorySalesDTO> getSalesByTargetCategory() {
        return toDTO(orderRepository.getSalesByTargetCategory());
    }

    private List<CategorySalesDTO> toDTO(List<Object[]> raw) {
        return raw.stream()
                .map(row -> new CategorySalesDTO(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        ((Number) row[2]).longValue()
                ))
                .collect(Collectors.toList());
    }
}
