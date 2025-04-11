package com.ict.serv.entity.chat;

import com.ict.serv.entity.product.Product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    @Id
    private String chatRoomId;

    @Enumerated(EnumType.STRING)
    private ChatState state;

    @ManyToOne
    @JoinColumn(name="product_id")
    private Product product;

    private LocalDateTime createdAt;

    @Column(name = "last_chat_time")
    private LocalDateTime lastChatTime;
}
