package com.ict.serv.service;

import com.ict.serv.dto.UserResponseDto;
import com.ict.serv.entity.chat.ChatDTO;
import com.ict.serv.entity.chat.ChatMessage;
import com.ict.serv.entity.chat.ChatRoom;
import com.ict.serv.entity.chat.ChatState;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.chat.ChatRepository;
import com.ict.serv.repository.chat.ChatRoomRepository;
import com.ict.serv.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
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
                .buyer(buyer)
                .createdAt(LocalDateTime.now())
                .build();
        chatRoomRepository.save(room);

        return roomId;
    }

    public ChatMessage saveChat(String roomId, User user, String message) {
        ChatRoom room =  getChatRoom(roomId).get();

        ChatMessage chat = ChatMessage.builder()
                .room(room)
                .buyer(user)
                .message(message)
                .sendTime(LocalDateTime.now())
                .build();

        room.setLastChatTime(LocalDateTime.now());
        room.setState(ChatState.ACTIVE);
        chatRoomRepository.save(room);

        return chatRepository.save(chat);
    }

    public Optional<ChatRoom> getChatRoom(String roomId) {
        return chatRoomRepository.findById(roomId);
    }

    public List<ChatDTO> getChatList(String roomId) {
        ChatRoom room = getChatRoom(roomId).orElseThrow();
        List<ChatMessage> messages = chatRepository.findByRoomOrderBySendTimeAsc(room);

        return messages.stream().map(chat -> {
            User buyer = chat.getBuyer();
            UserResponseDto urd = new UserResponseDto();
            urd.setId(buyer.getId());
            urd.setUserid(buyer.getUserid());
            urd.setUsername(buyer.getUsername());
            urd.setImgUrl(buyer.getProfileImageUrl());

            ChatDTO dto = new ChatDTO();
            dto.setRoomId(roomId);
            dto.setMessage(chat.getMessage());
            dto.setSendTime(chat.getSendTime());
            dto.setUrd(urd);

            return dto;
        }).collect(Collectors.toList());
    }

    public ChatRoom findRoom(User user, Long productId) {
        return chatRoomRepository.findByBuyerAndProductId(user, productId);
    }

    public List<ChatRoom> getChatRoomList(User user) {
        return chatRoomRepository.findByBuyerAndState(user, ChatState.ACTIVE);
    }

    public List<ChatRoom> getSellerChatRoomList(User user) {
        return chatRoomRepository.findByProductInAndState(productRepository.findAllBySellerNo_Id(user.getId()), ChatState.ACTIVE);
    }
}
