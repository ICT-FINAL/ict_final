package com.ict.serv.controller;

import com.ict.serv.controller.admin.PagingVO;
import com.ict.serv.dto.OrderRequest;
import com.ict.serv.dto.OrderRequestDto;
import com.ict.serv.entity.order.*;
import com.ict.serv.entity.product.Option;
import com.ict.serv.entity.product.OptionCategory;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.Address;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.OrderService;
import com.ict.serv.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.checkerframework.checker.units.qual.A;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@RequestMapping("/order")
public class OrderController {
    private final InteractService interactService;
    private final OrderService orderService;
    private final ProductService productService;

    @GetMapping("/cancel")
    public void cancelOrder(@RequestParam Long orderGroupId) {
        OrderGroup orderGroup = orderService.selectOrderGroup(orderGroupId)
                .orElseThrow(() -> new RuntimeException("주문 그룹이 존재하지 않습니다."));

        orderGroup.setState(OrderState.CANCELED);
        orderService.saveOrderGroup(orderGroup); // 변경 감지로 orders까지 반영
    }

    @GetMapping("auctionCancel")
    public void auctionCancel(@RequestParam Long orderId) {
        AuctionOrder auctionOrder = orderService.selectAuctionOrder(orderId).orElseThrow(() -> new RuntimeException("주문이 없습니다."));
        auctionOrder.setState(OrderState.CANCELED);
        orderService.saveAuctionOrder(auctionOrder);
    }

    @PostMapping("/setAuctionOrder")
    public AuctionOrder setAuctionOrder(@AuthenticationPrincipal UserDetails userDetails, @RequestBody AuctionOrderRequest request) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        Address address = new Address();
        address.setId(Long.valueOf(request.getAddrId()));

        AuctionOrder order = new AuctionOrder();
        order.setAuctionProductId(request.getProductId());
        order.setUser(user);
        order.setState(OrderState.BEFORE);
        order.setTotalPrice(request.getTotalPrice());
        order.setTotalShippingFee(request.getShippingFee());
        return orderService.saveAuctionOrder(order);
    }

    @PostMapping("/setOrder")
    public OrderGroup setOrder(@AuthenticationPrincipal UserDetails userDetails, @RequestBody OrderRequest or) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        Address address = new Address();
        address.setId(Long.valueOf(or.getAddrId()));

        OrderGroup orderGroup = new OrderGroup();
        orderGroup.setUser(user);
        orderGroup.setState(OrderState.BEFORE);
        orderGroup.setTotalPrice(0);
        orderGroup.setTotalShippingFee(0);
        orderGroup.setOrders(new ArrayList<>());
        orderGroup.setCouponDiscount(or.getCouponDiscount());
        Map<Long, List<OrderRequestDto>> groupedByProduct = new HashMap<>();

        for (OrderRequestDto ord : or.getOptions()) {
            Long productId = productService.selectOptionCategory(ord.getOptionCategoryId())
                    .orElseThrow()
                    .getOption()
                    .getProduct()
                    .getId();
            groupedByProduct.computeIfAbsent(productId, k -> new ArrayList<>()).add(ord);
        }

        int index = 1;
        int totalPrice = 0;
        int totalShipping = 0;

        for (Map.Entry<Long, List<OrderRequestDto>> entry : groupedByProduct.entrySet()) {
            Long productId = entry.getKey();
            List<OrderRequestDto> orderDtos = entry.getValue();

            Orders order = new Orders();
            order.setUser(user);
            order.setRequest(or.getReq());
            order.setAddress(address);
            order.setOrderNum(or.getOrderId() + "-" + index++);
            order.setShippingFee(orderDtos.stream().mapToInt(OrderRequestDto::getShippingFee).sum());
            order.setProductId(productId);
            order.setOrderGroup(orderGroup);
            order.setOrderItems(new ArrayList<>());
            order.setShippingState(ShippingState.BEFORE);
            int orderTotal = 0;

            for (OrderRequestDto ord : orderDtos) {
                OptionCategory optCat = productService.selectOptionCategory(ord.getOptionCategoryId()).orElseThrow();
                Option opt = optCat.getOption();
                Product prod = opt.getProduct();

                int originPrice = prod.getPrice();
                int discountRate = prod.getDiscountRate();
                int discountedPrice = (int) Math.round(originPrice * (1 - discountRate / 100.0));
                int additional = optCat.getAdditionalPrice();
                int quantity = ord.getQuantity();
                int itemTotal = (discountedPrice + additional) * quantity;

                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setQuantity(quantity);
                item.setPrice(originPrice);
                item.setDiscountRate(discountRate);
                item.setRefundState(RefundState.NONE);
                item.setOptionCategoryId(ord.getOptionCategoryId());
                item.setProductName(prod.getProductName());
                item.setOptionName(opt.getOptionName());
                item.setOptionCategoryName(optCat.getCategoryName());
                item.setAdditionalFee(additional);
                order.getOrderItems().add(item);
                orderTotal += itemTotal;
            }

            totalPrice += orderTotal;
            totalShipping += order.getShippingFee();
            orderGroup.getOrders().add(order);
        }

        orderGroup.setTotalPrice(totalPrice);
        orderGroup.setTotalShippingFee(totalShipping);

        return orderService.saveOrderGroup(orderGroup);
    }



    @GetMapping("/orderList")
    public Map orderList(@AuthenticationPrincipal UserDetails userDetails, OrderPagingVO pvo) {
        pvo.setOnePageRecord(5);
        User user = interactService.selectUserByName(userDetails.getUsername());
        pvo.setTotalRecord(orderService.totalOrderCount(user, pvo));
        List<OrderGroup> og = orderService.getOrderByUser(user, pvo);
        List<OrderGroupDTO> ogdto = new ArrayList<>();
        for(OrderGroup group: og) {
            OrderGroupDTO ogd = new OrderGroupDTO();
            ogd.setOrderDate(group.getOrderDate());
            ogd.setState(group.getState());
            ogd.setTotalPrice(group.getTotalPrice());
            ogd.setTotalShippingFee(group.getTotalShippingFee());
            ogd.setCouponDiscount(group.getCouponDiscount());
            ogd.setId(group.getId());
            ogd.setUser(group.getUser());
            List<OrdersDTO> ordersDTO = new ArrayList<>();
            for(Orders order : group.getOrders()) {
                OrdersDTO odd = new OrdersDTO();
                odd.setFilename(productService.selectProduct(order.getProductId()).get().getImages().get(0).getFilename());
                odd.setOrderItems(order.getOrderItems());
                odd.setAddress(order.getAddress());
                odd.setOrderNum(order.getOrderNum());
                odd.setOrderGroup(order.getOrderGroup());
                odd.setRequest(order.getRequest());
                odd.setModifiedDate(order.getModifiedDate());
                odd.setShippingState(order.getShippingState());
                odd.setProductId(order.getProductId());
                odd.setId(order.getId());
                odd.setUser(order.getUser());
                odd.setStartDate(order.getStartDate());
                odd.setShippingFee(order.getShippingFee());
                ordersDTO.add(odd);
            }
            ogd.setOrders(ordersDTO);
            ogdto.add(ogd);
        }
        Map map = new HashMap();
        map.put("pvo", pvo);
        map.put("orderList", ogdto);

        return map;
    }

    @GetMapping("/sellList")
    public Map sellList(@AuthenticationPrincipal UserDetails userDetails, ShippingState shippingState) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        List<Product> products = productService.selectProductByUser(user);
        List<String> filenameList = new ArrayList<>();
        List<Orders> orders = new ArrayList<>();
        if(shippingState == null)
            for(Product product:products) {
                List<Orders> order = orderService.getOrderByProduct(product.getId());
                for(Orders mini:order) {
                    if(mini.getOrderGroup().getState()==OrderState.PAID) {
                        orders.add(mini);
                        if(product.getImages().isEmpty()) filenameList.add("");
                        else filenameList.add(product.getImages().get(0).getFilename());
                    }
                }
            }
        else
            for(Product product:products) {
                List<Orders> order = orderService.getOrderByProduct(product.getId());
                for(Orders mini:order) {
                    if(mini.getOrderGroup().getState()==OrderState.PAID && shippingState == mini.getShippingState()) {
                        orders.add(mini);
                        if(product.getImages().isEmpty()) filenameList.add("");
                        else filenameList.add(product.getImages().get(0).getFilename());
                    }
                }
            }
        Map map = new HashMap();
        map.put("orderList", orders);
        map.put("filenameList", filenameList);
        return map;
    }

}
