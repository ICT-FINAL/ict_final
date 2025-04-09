package com.ict.serv.service;

import com.ict.serv.context.ApplicationContextProvider;
import com.ict.serv.entity.auction.*;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.auction.AuctionBidRepository;
import com.ict.serv.repository.auction.AuctionProductRepository;
import com.ict.serv.repository.auction.AuctionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final AuctionBidRepository bidRepository;
    private final AuctionProductRepository auctionProductRepository;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final ConcurrentHashMap<String, ScheduledFuture<?>> endTasks = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;

    public String createRoom(User user, String subject, AuctionWriteRequest req, AuctionProduct product) {
        String roomId = UUID.randomUUID().toString();
        AuctionRoom room = AuctionRoom.builder()
                .roomId(roomId)
                .state(AuctionState.OPEN)
                .subject(subject)
                .createdAt(LocalDateTime.now())
                .lastBidTime(LocalDateTime.now())
                .endTime(req.getEndTime())
                .minBidIncrement(1000)
                .firstPrice(req.getFirstPrice())
                .buyNowPrice(req.getBuyNowPrice())
                .currentPrice(req.getFirstPrice())
                .deposit(req.getDeposit())
                .auctionProduct(product)
                .build();
        auctionRepository.save(room);

        scheduleAuctionEnd(roomId);

        return roomId;
    }

    public List<AuctionRoom> getOpenRooms() {
        return auctionRepository.findByState(AuctionState.OPEN);
    }

    public void saveBid(String roomId, User user, int price) {
        AuctionRoom room = auctionRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        AuctionBid bid = AuctionBid.builder()
                .room(room)
                .user(user)
                .price(price)
                .bidTime(LocalDateTime.now())
                .build();

        bidRepository.save(bid);
        room.setLastBidTime(LocalDateTime.now());

        LocalDateTime now = LocalDateTime.now();
        if (room.getEndTime().isBefore(now.plusMinutes(5))) {
            room.setEndTime(room.getEndTime().plusMinutes(1));
        }

        auctionRepository.save(room);

        scheduleAuctionEnd(roomId);
    }

    @Transactional
    public void closeAuctionRoom(String roomId) {
        AuctionRoom room = auctionRepository.findById(roomId).orElse(null);
        if (room != null && room.getState() == AuctionState.OPEN) {
            if (LocalDateTime.now().isAfter(room.getEndTime())) {
                room.setState(AuctionState.CLOSED);
                auctionRepository.save(room);
                messagingTemplate.convertAndSend("/topic/auction/" + roomId + "/end", "경매 종료");
                System.out.println("경매 종료");
            } else {
                scheduleAuctionEnd(roomId); // 재입찰
            }
        }
    }

    private void scheduleAuctionEnd(String roomId) {
        if (endTasks.containsKey(roomId)) {
            endTasks.get(roomId).cancel(false);
        }

        AuctionRoom room = auctionRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        long delay = java.time.Duration.between(LocalDateTime.now(), room.getEndTime()).toMillis();

        if (delay <= 0) {
            closeAuctionRoom(roomId);
            return;
        }

        ScheduledFuture<?> future = scheduler.schedule(() -> {
            try {
                AuctionService proxy = ApplicationContextProvider.getBean(AuctionService.class);
                proxy.closeAuctionRoom(roomId);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }, delay, TimeUnit.MILLISECONDS);

        endTasks.put(roomId, future);
    }

    public List<AuctionBid> getBids(String roomId) {
        AuctionRoom room = auctionRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        return bidRepository.findByRoomOrderByBidTimeAsc(room);
    }

    @Transactional
    public void deleteRoom(String roomId) {
        bidRepository.deleteByRoom_RoomId(roomId);
        auctionRepository.deleteById(roomId);
    }

    public AuctionProduct saveAuctionProduct(AuctionProduct auctionProduct) {
        return auctionProductRepository.save(auctionProduct);
    }
}
