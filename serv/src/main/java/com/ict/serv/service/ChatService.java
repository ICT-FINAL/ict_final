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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                .sender(user)
                .message(message)
                .sendTime(LocalDateTime.now())
                .build();

        chat = chatRepository.save(chat);

        room.setLastChat(chat);
        room.setState(ChatState.ACTIVE);
        chatRoomRepository.save(room);

        return chat;
    }

    public Optional<ChatRoom> getChatRoom(String roomId) {
        return chatRoomRepository.findById(roomId);
    }

    public List<ChatDTO> getChatList(String roomId) {
        ChatRoom room = getChatRoom(roomId).orElseThrow();
        List<ChatMessage> messages = chatRepository.findByRoomOrderBySendTimeAsc(room);

        return messages.stream().map(chat -> {
            User sender = chat.getSender();
            UserResponseDto urd = new UserResponseDto();
            urd.setId(sender.getId());
            urd.setUserid(sender.getUserid());
            urd.setUsername(sender.getUsername());
            urd.setImgUrl(sender.getProfileImageUrl());

            ChatDTO dto = new ChatDTO();
            dto.setId(chat.getId());
            dto.setRoomId(roomId);
            dto.setMessage(chat.getMessage());
            dto.setRead(chat.isRead());
            dto.setSendTime(chat.getSendTime());
            dto.setUrd(urd);

            return dto;
        }).collect(Collectors.toList());
    }

    public ChatRoom findRoom(User user, Long productId) {
        return chatRoomRepository.findByBuyerAndProductId(user, productId);
    }

    public List<ChatRoom> getChatRoomList(User user) {
        return chatRoomRepository.findByBuyerAndStateNotOrderByLastChatSendTimeDesc(user, ChatState.CLOSED);
    }

    public List<ChatRoom> getSellerChatRoomList(User user) {
        return chatRoomRepository.findByProductInAndStateOrderByLastChat_SendTimeDesc(productRepository.findAllBySellerNo_Id(user.getId()), ChatState.ACTIVE);
    }

    public void markChatAsRead(Long id, User user) {
        ChatMessage message = chatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("메시지 없음"));

        if (!message.getSender().equals(user)) {
            message.setRead(true);
            chatRepository.save(message);
        }
    }
    @Transactional
    public void markAllAsRead(String roomId, User user) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방 없음"));

        // user가 보낸 게 아닌, 즉 user가 "받은 메시지" 중 isRead == false
        List<ChatMessage> unreadMessages = chatRepository
                .findByRoomAndSenderNotAndIsReadFalse(room, user);

        for (ChatMessage msg : unreadMessages) {
            msg.setRead(true);
        }

        chatRepository.saveAll(unreadMessages);
    }

    public boolean hasUnreadMessages(String roomId, User user) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방 없음"));

        return chatRepository.existsByRoomAndSenderNotAndIsReadFalse(room, user);
    }

    public void leaveChatRoom(String roomId) {
        chatRoomRepository.updateChatRoomStateToLeft(roomId);
    }
}
