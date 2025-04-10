package com.ict.serv.repository;

import com.ict.serv.entity.shipping.DeliveryInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryInfoRepository extends JpaRepository<DeliveryInfo, Long> {
    DeliveryInfo findByInvoiceNumber(String invoiceNumber);
    List<DeliveryInfo> findAll();
}
