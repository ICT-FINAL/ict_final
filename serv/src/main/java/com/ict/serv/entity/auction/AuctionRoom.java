package com.ict.serv.entity.auction;

import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionRoom {
    @Id
    private String roomId;

    @Enumerated(EnumType.STRING)
    private AuctionState state;

    private String subject;

    @ManyToOne
    @JoinColumn(name = "seller_no")
    private User seller;

    private LocalDateTime createdAt;

    @Column(name = "last_bid_time")
    private LocalDateTime lastBidTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;
}
