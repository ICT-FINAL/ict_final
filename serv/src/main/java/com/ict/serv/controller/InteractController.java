package com.ict.serv.controller;

import com.ict.serv.dto.UserResponseDto;
import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.message.MessageResponseDTO;
import com.ict.serv.entity.message.MessageState;
import com.ict.serv.entity.report.Report;
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
    @GetMapping("/readMessage")
    public String readMessage(Long id) {
        Message msg = service.selectMessage(id);
        msg.setState(MessageState.READ);
        service.sendMessage(msg);
        return "ok";
    }
    @GetMapping("/deleteMessage")
    public String deleteMessage(Long id) {
        service.deleteMessage(id);
        return "ok";
    }
    @GetMapping("/allDelete")
    public String allDelete(@AuthenticationPrincipal UserDetails userDetails) {
        User user = service.selectUserByName(userDetails.getUsername());
        List<Message> msg_list = service.getMessageList(service.selectUserByName(userDetails.getUsername()));
        for(Message msg : msg_list) {
            if(msg.getState() == MessageState.READ) {
                service.deleteMessage(msg.getId());
            }
        }
        return "ok";
    }
    @GetMapping("/allRead")
    public String allRead(@AuthenticationPrincipal UserDetails userDetails) {
        User user = service.selectUserByName(userDetails.getUsername());
        List<Message> msg_list = service.getMessageList(service.selectUserByName(userDetails.getUsername()));
        for(Message msg : msg_list) {
            msg.setState(MessageState.READ);
            service.sendMessage(msg);
        }
        return "ok";
    }
    @GetMapping("/sendReport")
    public String sendReport(@AuthenticationPrincipal UserDetails userDetails, Long toId, String reportType, String comment) {
        Report report = new Report();
        report.setComment(comment);
        report.setReportUser(service.selectUser(toId));
        report.setUserFrom(service.selectUserByName(userDetails.getUsername()));
        report.setReportType(reportType);
        /*
        msg.setSubject(subject);
        msg.setComment(comment);
        msg.setUserTo(service.selectUser(toId));
        msg.setUserFrom(service.selectUserByName(userDetails.getUsername()));*/
        service.sendReport(report);
        return "ok";
    }

    @GetMapping("/getUserInfo")
    public UserResponseDto getUserInfo(Long id) {
        User user = service.selectUser(id);
        UserResponseDto response = new UserResponseDto();
        response.setId(id);
        response.setUserid(user.getUserid());
        response.setImgUrl(user.getProfileImageUrl());
        response.setEmail(user.getEmail());
        response.setUsername(user.getUsername());

        return response;
    }
}
