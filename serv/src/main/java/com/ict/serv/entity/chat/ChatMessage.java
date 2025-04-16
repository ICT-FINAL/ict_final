package com.ict.serv.entity.chat;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="sender")
    private User sender;

    private String message;

    private LocalDateTime sendTime;

    private boolean isRead = false;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "room_id")
    private ChatRoom room;
}
