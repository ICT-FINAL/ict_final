package com.ict.serv.entity.basket;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Data
@Entity
@Table
@AllArgsConstructor
@NoArgsConstructor
public class Basket {
    @Id
    @Column(name="basket_no")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="product_no")
    private Product productNo;

    @ManyToOne
    @JoinColumn(name="user_no")
    private User userNo;

    @Column(name="basket_quantity", nullable=false)
    private int basketQuantity;

    @CreationTimestamp
    @Column(name="create_date", columnDefinition = "DATETIME default now()")
    private String createDate;

    @CreationTimestamp
    @Column(name = "update_date", columnDefinition = "DATETIME default now()")
    private String updateDate;

}
