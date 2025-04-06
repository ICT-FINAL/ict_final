package com.ict.serv.controller.auction;

import com.ict.serv.entity.auction.AuctionBid;
import com.ict.serv.entity.auction.AuctionRoom;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.AuctionService;
import com.ict.serv.service.InteractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auction")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuctionController {

    private final AuctionService service;
    private final InteractService inter_service;
    @GetMapping("/createRoom")
    public ResponseEntity<Map<String, String>> createRoom(String subject, String userid) {

        String roomId = service.createRoom(inter_service.selectUserByName(userid), subject);
        Map<String, String> response = new HashMap<>();
        response.put("roomId", roomId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<AuctionRoom>> getRooms() {
        return ResponseEntity.ok(
                service.getOpenRooms());
    }

    @GetMapping("/bids/{roomId}")
    public ResponseEntity<List<AuctionBid>> getBids(@PathVariable String roomId) {
        return ResponseEntity.ok(service.getBids(roomId));
    }

    @GetMapping("/room/delete/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String roomId) {
        service.deleteRoom(roomId);
        return ResponseEntity.ok().build();
    }
}
