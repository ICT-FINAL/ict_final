package com.ict.serv.controller.chat;

import com.ict.serv.entity.chat.ChatDTO;
import com.ict.serv.entity.chat.ChatRoom;
import com.ict.serv.entity.chat.ChatState;
import com.ict.serv.entity.product.Product;
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

//    @GetMapping("/createChatRoom")
//    public String createChatRoom(@AuthenticationPrincipal UserDetails userDetails, Long productId) {
//        User user = interactService.selectUserByName(userDetails.getUsername());
//        ChatRoom room = chatService.findRoom(user, productId);
//
//        if (room != null && room.getState() != ChatState.CLOSED) return room.getChatRoomId();
//        else return chatService.createRoom(user, productId);
//    }

    @GetMapping("/createChatRoom")
    public String createChatRoom(@AuthenticationPrincipal UserDetails userDetails, Long userId, Long productId) {
        User creater = interactService.selectUserByName(userDetails.getUsername());
        User target = interactService.selectUser(userId);
        ChatRoom room1 = chatService.findRoom(creater, target, productId);
        ChatRoom room2 = chatService.findRoom(target, creater, productId);

        if (room1 != null && room1.getState() != ChatState.CLOSED) return room1.getChatRoomId();
        else if (room2 != null && room2.getState() != ChatState.CLOSED) return room2.getChatRoomId();
        else return chatService.createRoom(creater, target, productId);
    }

    @GetMapping("/getChatRoom/{roomId}")
    public ResponseEntity<ChatRoom> getChatRoom(@PathVariable String roomId){
        return ResponseEntity.ok(chatService.getChatRoom(roomId).get());
    }

    @GetMapping("/chatRoomList")
    public ResponseEntity<List<ChatRoom>> chatRoomList(@AuthenticationPrincipal UserDetails userDetails, String tab) {
        User user = interactService.selectUserByName(userDetails.getUsername());

        if (tab.equals("default")) return ResponseEntity.ok(chatService.getChatRoomList(user));
        else return ResponseEntity.ok(chatService.getProductChatRoomList(user));
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

    @PostMapping("/leaveChatRoom/{roomId}")
    public ResponseEntity<?> leaveChatRoom(@PathVariable String roomId,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        chatService.leaveChatRoom(roomId, user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unreadChatCount")
    public int unreadChatCount(@AuthenticationPrincipal UserDetails userDetails) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        return chatService.getUnreadChatCount(user);
    }
}
