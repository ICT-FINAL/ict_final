package com.ict.serv.controller;

import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.message.MessageResponseDTO;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.InteractService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@RequestMapping("/interact")
public class InteractController {
    private final InteractService service;

    @GetMapping("/getToUser")
    public MessageResponseDTO getToUser(Long toId) {
        User user = service.selectUser(toId);
        return new MessageResponseDTO(user.getId(),user.getUsername(),user.getUserid(),user.getProfileImageUrl());
    }

    @GetMapping("/sendMessage")
    public String sendMessage(@AuthenticationPrincipal UserDetails userDetails, Long toId, String subject, String comment) {
        Message msg = new Message();
        msg.setSubject(subject);
        msg.setComment(comment);
        msg.setUserTo(service.selectUser(toId));
        msg.setUserFrom(service.selectUserByName(userDetails.getUsername()));
        service.sendMessage(msg);
        return "ok";
    }

    @GetMapping("/getMessageList")
    public List<Message> getMessageList(@AuthenticationPrincipal UserDetails userDetails){
        return service.getMessageList(service.selectUserByName(userDetails.getUsername()));
    }
}
