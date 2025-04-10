package com.ict.serv.controller.shipping;

import com.ict.serv.dto.shipping.ShippingStatusDto;
import com.ict.serv.entity.shipping.DeliveryInfo;
import com.ict.serv.service.ShippingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/shipping")
public class ShippingController {

    private final ShippingService shippingService;

    public ShippingController(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    @GetMapping("/track")
    public ResponseEntity<ShippingStatusDto> trackShipment(@RequestParam String invoiceNumber) {
        ShippingStatusDto status = shippingService.trackShipment(invoiceNumber);
        return ResponseEntity.ok(status);
    }

    @PostMapping("/create-after-payment")
    public ResponseEntity<DeliveryInfo> createDelivery(@RequestParam String orderNumber,
                                                       @RequestParam String receiverName) {
        DeliveryInfo info = shippingService.createDeliveryAfterPayment(orderNumber, receiverName);
        return ResponseEntity.ok(info);
    }

    @PutMapping("/update-status")
    public ResponseEntity<DeliveryInfo> updateStatus(@RequestParam String invoiceNumber,
                                                     @RequestParam String status,
                                                     @RequestParam String location) {
        DeliveryInfo updated = shippingService.updateShippingStatus(invoiceNumber, status, location);
        return ResponseEntity.ok(updated);
    }
}