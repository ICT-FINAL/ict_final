package com.ict.serv.dto;

import com.ict.serv.entity.Account;
import lombok.Data;

@Data
public class SignupResponseDto {

    Account account;
    String result;
}
