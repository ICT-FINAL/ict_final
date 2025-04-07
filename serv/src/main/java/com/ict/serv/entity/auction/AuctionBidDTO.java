package com.ict.serv.entity.auction;

import com.ict.serv.dto.UserResponseDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuctionBidDTO {
    private String userid;
    private int price;
    UserResponseDto urd;
}