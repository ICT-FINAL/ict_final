package com.ict.serv.repository.auction;

import com.ict.serv.entity.auction.AuctionRoom;
import com.ict.serv.entity.auction.AuctionState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuctionRepository extends JpaRepository<AuctionRoom, String> {
    List<AuctionRoom> findByState(AuctionState state);
}
