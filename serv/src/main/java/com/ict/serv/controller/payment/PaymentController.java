package com.ict.serv.controller.payment;

import com.ict.serv.entity.order.OrderGroup;
import com.ict.serv.entity.order.OrderItem;
import com.ict.serv.entity.order.OrderState;
import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.product.OptionCategory;
import com.ict.serv.service.OrderService;
import com.ict.serv.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payment")
@CrossOrigin(origins = "*")
public class PaymentController {
    private final OrderService orderService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ProductService productService;
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody Map<String, String> requestMap) {
        String secretKey = "test_sk_d46qopOB8972zE2BNblgVZmM75y0"; // 시크릿 키
        String paymentKey = requestMap.get("paymentKey");
        String orderId = requestMap.get("orderId");
        String iid = requestMap.get("iid");

        //Orders orders = orderService.selectOrders(Long.valueOf(iid)).get();
        OrderGroup orderGroup = orderService.selectOrderGroup(Long.valueOf(iid)).get();
        int amount = Integer.parseInt(requestMap.get("amount"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(secretKey, "");

        Map<String, Object> payload = new HashMap<>();
        payload.put("paymentKey", paymentKey);
        payload.put("orderId", orderId);
        payload.put("amount", amount);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.tosspayments.com/v1/payments/confirm",
                    request,
                    String.class
            );

            // 주문 상태는 OrderGroup 단위로 변경
            orderGroup.setState(OrderState.PAID);

            // 재고 차감
            List<Orders> ordersList = orderService.selectOrdersByOrderGroup(orderGroup);
            for(Orders orders:ordersList) {
                List<OrderItem> items = orderService.selectOrderItemList(orders);
                for (OrderItem item : items) {
                    OptionCategory optionCategory = productService.selectOptionCategory(item.getOptionCategoryId()).get();
                    int quantity = optionCategory.getQuantity() - item.getQuantity();
                    optionCategory.setQuantity(quantity);
                    productService.saveOptionCategory(optionCategory);
                }
            }

            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        }

    }
}
