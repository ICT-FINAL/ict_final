package com.ict.serv.entity.product;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "PRODUCT_OPTION")
public class Option {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OPTION_ID")
    private Long id;

    @Column(name = "option_name")
    private String optionName;  // ex) 빨강 , 파랑

    @ManyToOne
    @JoinColumn(name = "PRODUCT_ID")
    private Product product;

    @OneToMany(mappedBy = "option", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    List<OptionCategory> subOptionCategories;
}