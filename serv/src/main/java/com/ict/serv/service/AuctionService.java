package com.ict.serv.service;

import com.ict.serv.context.ApplicationContextProvider;
import com.ict.serv.entity.Authority;
import com.ict.serv.entity.auction.*;
import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.MessageRepository;
import com.ict.serv.repository.UserRepository;
import com.ict.serv.repository.auction.AuctionBidRepository;
import com.ict.serv.repository.auction.AuctionProductRepository;
import com.ict.serv.repository.auction.AuctionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.*;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final AuctionBidRepository bidRepository;
    private final AuctionProductRepository auctionProductRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final ConcurrentHashMap<String, ScheduledFuture<?>> endTasks = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;

    public String createRoom(User user, String subject, AuctionWriteRequest req, AuctionProduct product) {
        String roomId = UUID.randomUUID().toString();

        int rawIncrement = (req.getFirstPrice() + req.getBuyNowPrice()) / 20;
        int minBidIncrement = ((rawIncrement + 99) / 100) * 100;

        AuctionRoom room = AuctionRoom.builder()
                .roomId(roomId)
                .state(AuctionState.OPEN)
                .subject(subject)
                .createdAt(LocalDateTime.now())
                .lastBidTime(LocalDateTime.now())
                .endTime(req.getEndTime())
                .minBidIncrement(minBidIncrement)
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
        List<AuctionBid> bidList = bidRepository.findByRoomOrderByBidTimeAsc(room);
        Message sender = new Message();
        List<User> admins = userRepository.findUserByAuthority(Authority.ROLE_ADMIN);
        for(User admin: admins) {
            sender.setUserFrom(admin);
            sender.setUserTo(room.getAuctionProduct().getSellerNo());
            sender.setSubject("새로운 입찰이 등록 되었습니다.");
            sender.setComment("'" + room.getAuctionProduct().getProductName()+"'"+": "+ price+"원"+"  \n상세 내용은 마이페이지 > 판매 입찰 내역 에서 확인해주세요.");
            messageRepository.save(sender);
            break;
        }
        for(AuctionBid mini: bidList) {
            if(mini.getState() == BidState.LIVE) {
                Message msg = new Message();
                msg.setUserFrom(room.getAuctionProduct().getSellerNo());
                msg.setUserTo(mini.getUser());
                msg.setSubject("입찰이 취소처리 되었습니다.");
                msg.setComment("'" + room.getAuctionProduct().getProductName()+"' 물품의 입찰이 취소되었습니다. \n보증금은 1일 내 환불처리 됩니다.");
                messageRepository.save(msg);
                mini.setState(BidState.DEAD);
                bidRepository.save(mini);
            }
        }
        AuctionBid bid = AuctionBid.builder()
                .room(room)
                .user(user)
                .price(price)
                .bidTime(LocalDateTime.now())
                .state(BidState.LIVE)
                .build();

        bidRepository.save(bid);
        room.setLastBidTime(LocalDateTime.now());

        LocalDateTime now = LocalDateTime.now();
        if (room.getEndTime().isBefore(now.plusMinutes(5))) {
            room.setEndTime(room.getEndTime().plusMinutes(1));
        }
        room.setCurrentPrice(price);
        room.setHighestBidderId(user.getId());
        room.setHit(bidList.size()+1);
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

    public Optional<AuctionRoom> getAuctionRoom(String roomId) {
        return auctionRepository.findById(roomId);
    }
    public Optional<AuctionProduct> getAuctionProduct(Long id) {
        return auctionProductRepository.findById(id);
    }
}
