package com.ict.serv.service;

import com.ict.serv.dto.shipping.ShippingStatusDto;
import com.ict.serv.entity.shipping.DeliveryInfo;
import com.ict.serv.repository.DeliveryInfoRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class ShippingService {

    private final DeliveryInfoRepository deliveryInfoRepository;

    public ShippingService(DeliveryInfoRepository deliveryInfoRepository) {
        this.deliveryInfoRepository = deliveryInfoRepository;
    }

    public ShippingStatusDto trackShipment(String invoiceNumber) {
        DeliveryInfo delivery = deliveryInfoRepository.findByInvoiceNumber(invoiceNumber);

        if (delivery == null) {
            delivery = new DeliveryInfo();
            delivery.setInvoiceNumber(invoiceNumber);
            delivery.setOrderNumber("ORD-" + invoiceNumber.substring(0, 6));
            delivery.setSender("ICT 쇼핑몰");
            delivery.setReceiver("홍길동");
            delivery.setStatus("배송 준비 중");
            delivery.setLocation("물류센터");
            delivery.setTimestamp(LocalDateTime.now());
            deliveryInfoRepository.save(delivery);
        }

        ShippingStatusDto dto = new ShippingStatusDto();
        dto.setInvoiceNumber(delivery.getInvoiceNumber());
        dto.setSender(delivery.getSender());
        dto.setReceiver(delivery.getReceiver());
        dto.setStatus(delivery.getStatus());
        dto.setLocation(delivery.getLocation());
        dto.setTimestamp(delivery.getTimestamp());
        return dto;
    }

    public DeliveryInfo createDeliveryAfterPayment(String orderNumber, String receiverName) {
        DeliveryInfo delivery = new DeliveryInfo();
        delivery.setInvoiceNumber(UUID.randomUUID().toString().replaceAll("-", "").substring(0, 12));
        delivery.setOrderNumber(orderNumber);
        delivery.setSender("ICT 쇼핑몰");
        delivery.setReceiver(receiverName);
        delivery.setStatus("배송 준비 중");
        delivery.setLocation("물류센터");
        delivery.setTimestamp(LocalDateTime.now());
        return deliveryInfoRepository.save(delivery);
    }

    public DeliveryInfo updateShippingStatus(String invoiceNumber, String status, String location) {
        DeliveryInfo delivery = deliveryInfoRepository.findByInvoiceNumber(invoiceNumber);
        if (delivery != null) {
            delivery.setStatus(status);
            delivery.setLocation(location);
            delivery.setTimestamp(LocalDateTime.now());
            return deliveryInfoRepository.save(delivery);
        }
        return null;
    }

    @Scheduled(fixedRate = 60000) // 1분
    public void autoUpdateShippingStatus() {
        List<DeliveryInfo> deliveries = deliveryInfoRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        for (DeliveryInfo delivery : deliveries) {
            long minutes = ChronoUnit.MINUTES.between(delivery.getTimestamp(), now);
            if ("배송 준비 중".equals(delivery.getStatus()) && minutes >= 1) {
                delivery.setStatus("배송 중");
                delivery.setLocation("배송차량");
                delivery.setTimestamp(now);
                deliveryInfoRepository.save(delivery);
            } else if ("배송 중".equals(delivery.getStatus()) && minutes >= 2) {
                delivery.setStatus("배송 완료");
                delivery.setLocation("수령 완료");
                delivery.setTimestamp(now);
                deliveryInfoRepository.save(delivery);
            }
        }
    }

    // 애플리케이션 시작 시 로깅 (옵션)
    @PostConstruct
    public void init() {
        System.out.println("[배송 서비스 초기화] 자동 상태 갱신 활성화됨");
    }
}
