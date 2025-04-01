package com.ict.serv.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String userid;
    private String username;
    private String email;
    private String imgUrl;
}