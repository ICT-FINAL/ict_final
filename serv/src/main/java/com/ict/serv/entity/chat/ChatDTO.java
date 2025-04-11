package com.ict.serv.entity.chat;

import com.ict.serv.dto.UserResponseDto;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ChatDTO {
    private String message;
    UserResponseDto urd;
    private String roomId;
}
