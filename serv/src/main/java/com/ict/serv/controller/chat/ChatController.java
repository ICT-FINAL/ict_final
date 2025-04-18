package com.ict.serv.controller.chat;

import com.ict.serv.entity.chat.ChatDTO;
import com.ict.serv.entity.chat.ChatRoom;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.ChatService;
import com.ict.serv.service.InteractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {
    private final ChatService chatService;
    private final InteractService interactService;

    @GetMapping("/createChatRoom")
    public String createChatRoom(@AuthenticationPrincipal UserDetails userDetails, Long productId) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        ChatRoom room = chatService.findRoom(user, productId);

        if (room != null) return room.getChatRoomId();
        else return chatService.createRoom(user, productId);
    }

    @GetMapping("/getChatRoom/{roomId}")
    public ResponseEntity<ChatRoom> getChatRoom(@PathVariable String roomId){
        return ResponseEntity.ok(chatService.getChatRoom(roomId).get());
    }

    @GetMapping("/chatRoomList")
    public ResponseEntity<List<ChatRoom>> chatRoomList(@AuthenticationPrincipal UserDetails userDetails, String role) {
        User user = interactService.selectUserByName(userDetails.getUsername());

        if (role.equals("buyer")) return ResponseEntity.ok(chatService.getChatRoomList(user));
        else return ResponseEntity.ok(chatService.getSellerChatRoomList(user));
    }

    @GetMapping("/getChatList/{roomId}")
    public ResponseEntity<List<ChatDTO>> getChatList(@PathVariable String roomId) {
        return ResponseEntity.ok(chatService.getChatList(roomId));
    }

    @PostMapping("/read/{id}")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = interactService.selectUserByName(userDetails.getUsername());

        chatService.markChatAsRead(id, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read/room/{roomId}")
    public ResponseEntity<?> markRoomMessagesAsRead(
            @PathVariable String roomId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = interactService.selectUserByName(userDetails.getUsername());
        chatService.markAllAsRead(roomId, user);
        return ResponseEntity.ok().build();
    }
}
