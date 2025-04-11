package com.ict.serv.service;

import com.ict.serv.entity.auction.AuctionRoom;
import com.ict.serv.entity.auction.AuctionState;
import com.ict.serv.entity.chat.ChatRoom;
import com.ict.serv.entity.chat.ChatState;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.chat.ChatRepository;
import com.ict.serv.repository.chat.ChatRoomRepository;
import com.ict.serv.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRepository chatRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ProductRepository productRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public String createRoom(User buyer, Long productId) {
        String roomId = UUID.randomUUID().toString();

        ChatRoom room = ChatRoom.builder()
                .chatRoomId(roomId)
                .state(ChatState.OPEN)
                .product(productRepository.getReferenceById(productId))
                .createdAt(LocalDateTime.now())
                .build();
        chatRoomRepository.save(room);

        return roomId;
    }

}
