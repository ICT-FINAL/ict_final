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
        Map map = new HashMap();
        map.put("pvo", pvo);
        map.put("orderList", orderService.getOrderByUser(user, pvo));

        return map;
    }

    /*
    @GetMapping("/sellList")
    public List<Orders> sellList(@AuthenticationPrincipal UserDetails userDetails) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        List<Product> productList = productService.selectProductByUser(user);
        List<Orders> orders = new ArrayList<>();
        for(Product product : productList) {
            List<Orders> ods = orderService.getOrderByProduct(product.getId());
            orders.addAll(ods);
        }
        return orders;
    }*/
}
