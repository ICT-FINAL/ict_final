package com.ict.serv.controller.basket;

import com.ict.serv.entity.user.User;
import com.ict.serv.service.BasketService;
import com.ict.serv.service.InteractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/basket")
public class BasketController {

    private final InteractService interactService;
    private final BasketService basketService;

    @GetMapping("/list")
    public ResponseEntity<List<Map<String, Object>>> getBasketItems(@AuthenticationPrincipal UserDetails userDetails) {

        User user = interactService.selectUserByName(userDetails.getUsername());
        List<Map<String, Object>> basketItems = basketService.getBasketItems(user);

        return ResponseEntity.ok(basketItems);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteBasketItems(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, List<Long>> requestBody) {

        List<Long> basketNos = requestBody.get("basketNos");
        if (basketNos == null || basketNos.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = interactService.selectUserByName(userDetails.getUsername());
        basketService.deleteBasketItems(user, basketNos);

        return ResponseEntity.ok().build();
    }
}
