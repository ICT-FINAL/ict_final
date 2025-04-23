package com.ict.serv.schdule;

import com.ict.serv.service.AuctionService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Component
public class InitScheduler {
    private final AuctionService auctionService;

    @PostConstruct
    public void init() {
        System.out.println("[PostConstruct] 서버 시작됨! 현재 시간: " + LocalDateTime.now());
        auctionScheduler();
    }
    /*
    @Scheduled(fixedRate = 3000)
    public void runEvery10Minutes() {
        System.out.println("[Scheduled] 3초마다 실행됨! 현재 시간: " + LocalDateTime.now());
    }*/

    @Scheduled(fixedRate = 30000)
    public void auctionScheduler() { //30초마다 옥션 감지
        auctionService.closeAllAuctionIfClosed();
    }
}
