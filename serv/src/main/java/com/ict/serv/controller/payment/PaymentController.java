package com.ict.serv.controller.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody Map<String, String> requestMap) {
        String secretKey = "test_sk_d46qopOB8972zE2BNblgVZmM75y0"; // 토스 시크릿키
        String paymentKey = requestMap.get("paymentKey");
        String orderId = requestMap.get("orderId");
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
            ResponseEntity<String> tossResponse = restTemplate.postForEntity(
                    "https://api.tosspayments.com/v1/payments/confirm",
                    request,
                    String.class
            );

            return ResponseEntity.ok(tossResponse.getBody());
            
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류: " + ex.getMessage());
        }
    }
}