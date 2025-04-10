package com.ict.serv.dto.shipping;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ShippingStatusDto {
    private String invoiceNumber;
    private String sender;
    private String receiver;
    private String status;
    private String location;
    private LocalDateTime timestamp;
}