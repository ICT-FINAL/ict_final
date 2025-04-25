package com.ict.serv.repository.auction;


import com.ict.serv.entity.auction.AuctionBid;
import com.ict.serv.entity.auction.AuctionRoom;
import com.ict.serv.entity.auction.BidState;
import com.ict.serv.entity.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Map;

public interface AuctionBidRepository extends JpaRepository<AuctionBid, Long> {
    List<AuctionBid> findByRoomOrderByBidTimeAsc(AuctionRoom room);
    void deleteByRoom_RoomId(String roomId);

    int countIdByUser(User user);

    int countIdByUserAndState(User user, BidState state);

    List<AuctionBid> findAllByUserAndStateOrderByIdDesc(User user, BidState state, PageRequest of);

    List<AuctionBid> findAllByUserOrderByIdDesc(User user, PageRequest of);

    List<AuctionBid> findAllByRoomAndState(AuctionRoom room, BidState state);

    List<AuctionBid> findByStateAndUserAndRoom(BidState bidState, User user, AuctionRoom room);
}
