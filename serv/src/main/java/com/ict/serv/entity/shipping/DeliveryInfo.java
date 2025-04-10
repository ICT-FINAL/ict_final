package com.ict.serv.entity.shipping;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class DeliveryInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String invoiceNumber;
    private String orderNumber;
    private String sender;
    private String receiver;
    private String status;
    private String location;
    private LocalDateTime timestamp;
}