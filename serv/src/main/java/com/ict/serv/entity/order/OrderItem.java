package com.ict.serv.entity.order;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ORDER_ITEM_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ORDER_ID")
    @JsonBackReference
    private Orders order;

    private int price;

    @Column(name="additional_fee")
    private int additionalFee;

    @Column(name="discount_rate")
    private int discountRate;

    private int quantity;

    @Column(name="option_category_id")
    private Long optionCategoryId;

    @Column(name="product_name")
    private String productName;

    @Column(name="option_name")
    private String optionName;

    @Column(name="option_category_name")
    private String optionCategoryName;

    @Column(name="refund_state")
    @Enumerated(EnumType.STRING)
    RefundState refundState=RefundState.NONE;
}
