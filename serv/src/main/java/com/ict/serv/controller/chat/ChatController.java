package com.ict.serv.controller.chat;

import com.ict.serv.entity.chat.ChatRoom;
import com.ict.serv.service.ChatService;
import com.ict.serv.service.InteractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {
    private final ChatService chatService;
    private final InteractService interactService;

    @GetMapping("/createChatRoom")
    public String createChatRoom(@AuthenticationPrincipal UserDetails userDetails, Long productId) {
        return chatService.createRoom(interactService.selectUserByName(userDetails.getUsername()), productId);
    }

}
