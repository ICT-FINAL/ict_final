package com.ict.serv.controller;

import com.ict.serv.entity.order.ShippingRequestDTO;
import com.ict.serv.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@RequestMapping("/shipping")
public class ShippingController {
    private final ShippingService shippingService;

    @PostMapping("/setShipping")
    public String setShipping(@RequestBody ShippingRequestDTO request) {
        shippingService.startShipping(request);
        return "배송 시작!";
    }
}
