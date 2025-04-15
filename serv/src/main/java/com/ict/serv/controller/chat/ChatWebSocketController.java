package com.ict.serv.controller.chat;

import com.ict.serv.dto.UserResponseDto;
import com.ict.serv.entity.chat.ChatDTO;
import com.ict.serv.entity.chat.ChatMessage;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.ChatService;
import com.ict.serv.service.InteractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@RequiredArgsConstructor
@Controller
public class ChatWebSocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final InteractService interactService;

    @MessageMapping("/chat/{roomId}")
    public void handleChat(@DestinationVariable String roomId, @Payload ChatDTO chat) {
        User user = interactService.selectUserByName(chat.getUrd().getUserid());
        ChatMessage saved = chatService.saveChat(chat.getRoomId(), user, chat.getMessage());

        ChatDTO response = new ChatDTO();
        response.setRoomId(chat.getRoomId());
        response.setMessage(saved.getMessage());
        response.setSendTime(saved.getSendTime());

        UserResponseDto urd = new UserResponseDto();
        urd.setId(user.getId());
        urd.setUserid(user.getUserid());
        urd.setUsername(user.getUsername());
        response.setUrd(urd);

        messagingTemplate.convertAndSend("/topic/chat/" + roomId, response);
    }
}
