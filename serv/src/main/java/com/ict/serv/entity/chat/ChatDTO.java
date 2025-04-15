package com.ict.serv.entity.chat;

import com.ict.serv.dto.UserResponseDto;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class ChatDTO {
    private String roomId;
    private String message;
    UserResponseDto urd;
    private LocalDateTime sendTime;
}
