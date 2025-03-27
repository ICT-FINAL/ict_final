package com.ict.serv.dto;

import com.ict.serv.entity.Account;
import lombok.Data;

@Data
public class LoginResponseDto {

    public boolean loginSuccess;
    public Account account;
    public String kakaoAccessToken;
}
