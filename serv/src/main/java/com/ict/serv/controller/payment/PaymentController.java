package com.ict.serv.controller.payment;

import com.ict.serv.entity.auction.*;
import com.ict.serv.entity.coupon.Coupon;
import com.ict.serv.entity.coupon.CouponState;
import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.order.*;
import com.ict.serv.entity.product.OptionCategory;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.product.ProductState;
import com.ict.serv.service.*;
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
    private final CouponService couponService;
    private final AuctionService auctionService;
    private final InteractService interactService;

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
                Product product = productService.selectProduct(orders.getProductId()).get();
                for (OrderItem item : items) {
                    OptionCategory optionCategory = productService.selectOptionCategory(item.getOptionCategoryId()).get();
                    int quantity = optionCategory.getQuantity() - item.getQuantity();
                    product.setQuantity(product.getQuantity() - item.getQuantity());
                    optionCategory.setQuantity(quantity);
                    productService.saveOptionCategory(optionCategory);
                }
                productService.saveProduct(product);
            }
            Long couponId = Long.valueOf(requestMap.get("couponId"));
            if(couponId!=0) {
                Coupon coupon = couponService.selectCoupon(couponId).get();
                coupon.setState(CouponState.EXPIRED);
                couponService.saveCoupon(coupon);
            }
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        }

    }

    @PostMapping("/auction/confirm")
    public ResponseEntity<?> auctionConfirmPayment(@RequestBody Map<String, String> requestMap) {
        String secretKey = "test_sk_d46qopOB8972zE2BNblgVZmM75y0"; // 시크릿 키
        String paymentKey = requestMap.get("paymentKey");
        String orderId = requestMap.get("orderId");
        String iid = requestMap.get("iid");
        AuctionOrder auctionOrder = orderService.selectAuctionOrder(Long.valueOf(iid)).get();
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

            auctionOrder.setState(OrderState.PAID);
            AuctionProduct auctionProduct = auctionService.getAuctionProduct(auctionOrder.getAuctionProductId()).get();
            AuctionRoom auctionRoom = auctionService.findAuctionRoomByAuctionProduct(auctionProduct).get(0);
            auctionProduct.setState(ProductState.SOLDOUT);
            auctionRoom.setState(AuctionState.CLOSED);
            auctionService.saveAuctionProduct(auctionProduct);
            auctionService.saveAuctionRoom(auctionRoom);
            List<AuctionBid> bidList = auctionService.findAuctionBidByRoomAndState(auctionRoom, BidState.LIVE);
            for(AuctionBid bid: bidList) {
                bid.setState(BidState.DEAD);
                auctionService.updateBid(bid);
                Message msg = new Message();
                msg.setUserFrom(auctionProduct.getSellerNo());
                msg.setUserTo(bid.getUser());
                msg.setSubject("입찰이 취소처리 되었습니다.");
                msg.setComment("'" + auctionProduct.getProductName()+"' 물품의 입찰이 취소되었습니다. \n보증금은 1일 내 환불처리 됩니다.");
                interactService.sendMessage(msg);
            }
            List<AuctionBid> buyerList = auctionService.findAuctionBidByRoomAndState(auctionRoom,BidState.SUCCESS);
            if(!buyerList.isEmpty()) {
                AuctionBid bbb = buyerList.get(0);
                bbb.setState(BidState.PAID);
                auctionService.updateBid(bbb);
            }
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        }

    }
}
