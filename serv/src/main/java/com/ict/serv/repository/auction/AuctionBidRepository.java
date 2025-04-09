package com.ict.serv.repository.auction;


import com.ict.serv.entity.auction.AuctionBid;
import com.ict.serv.entity.auction.AuctionRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuctionBidRepository extends JpaRepository<AuctionBid, Long> {
    List<AuctionBid> findByRoomOrderByBidTimeAsc(AuctionRoom room);
    void deleteByRoom_RoomId(String roomId);
}
