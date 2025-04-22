package com.ict.serv.controller;

import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.order.Shipping;
import com.ict.serv.entity.order.ShippingRequestDTO;
import com.ict.serv.entity.order.ShippingState;
import com.ict.serv.service.OrderService;
import com.ict.serv.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@RequestMapping("/shipping")
public class ShippingController {
    private final ShippingService shippingService;
    private final OrderService orderService;

    @PostMapping("/setShipping")
    public String setShipping(@RequestBody ShippingRequestDTO request) {
        shippingService.startShipping(request);
        return "배송 시작!";
    }
    @GetMapping("/finishShipping")
    public String finishShipping(Long orderId) {
        Orders orders = orderService.selectOrders(orderId).get();
        List<Shipping> shippingList = shippingService.selectShippingByOrders(orders);
        for(Shipping shipping: shippingList) {
            shipping.setState(ShippingState.FINISH);
            shipping.setEnd_time(LocalDateTime.now());

            orders.setShippingState(ShippingState.FINISH);
            shippingService.saveOrderAndShipping(shipping,orders);
        }
        return "ok";
    }
}
