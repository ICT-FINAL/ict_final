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
    public void cancelOrder(Long id) {
        Orders order = orderService.selectOrders(id).get();
        order.setState(OrderState.CANCELED);
        orderService.insertOrder(order);
    }

    @PostMapping("/setOrder")
    public Orders setOrder(@AuthenticationPrincipal UserDetails userDetails, @RequestBody OrderRequest or) {
        Orders order = new Orders();
        order.setUser(interactService.selectUserByName(userDetails.getUsername()));
        order.setState(OrderState.BEFORE);
        order.setRequest(or.getReq());
        Address address = new Address();
        address.setId(Long.valueOf(or.getAddrId()));
        order.setAddress(address);
        order.setOrderNum(or.getOrderId());
        order.setCouponDiscount(or.getCouponDiscount());
        order.setShippingFee(or.getShippingFee());
        OptionCategory occ = productService.selectOptionCategory(or.getOptions().get(0).getOptionCategoryId()).get();
        order.setProductId(occ.getOption().getProduct().getId());
        Orders savedOrder = orderService.insertOrder(order);

        for(OrderRequestDto ord : or.getOptions()) {
            OrderItem orderItem = new OrderItem();
            OptionCategory opt_c = productService.selectOptionCategory(ord.getOptionCategoryId()).get();
            Option opt = opt_c.getOption();
            Product n_p = opt.getProduct();
            int price = n_p.getPrice();
            orderItem.setPrice(price);
            orderItem.setQuantity(ord.getQuantity());
            orderItem.setDiscountRate(n_p.getDiscountRate());
            orderItem.setRefundState(RefundState.NONE);
            orderItem.setOrder(savedOrder);
            orderItem.setOptionCategoryId(ord.getOptionCategoryId());
            orderItem.setProductName(n_p.getProductName());
            orderItem.setOptionCategoryName(opt_c.getCategoryName());
            orderItem.setOptionName(opt.getOptionName());
            orderItem.setAdditionalFee(opt_c.getAdditionalPrice());
            savedOrder.getOrderItems().add(orderItem);
            orderService.insertOrderItem(orderItem);
        }
        return orderService.selectOrders(savedOrder.getId()).get();
    }

    @GetMapping("/orderList")
    public Map orderList(@AuthenticationPrincipal UserDetails userDetails, OrderPagingVO pvo) {
        pvo.setOnePageRecord(5);
        User user = interactService.selectUserByName(userDetails.getUsername());
        pvo.setTotalRecord(orderService.totalOrderCount(user, pvo));
        Map map = new HashMap();
        map.put("pvo", pvo);
        map.put("orderList", orderService.getOrderByUser(user,pvo));

        return map;
    }

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
    }
}
