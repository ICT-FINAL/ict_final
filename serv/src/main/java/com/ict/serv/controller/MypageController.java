package com.ict.serv.controller;

import com.ict.serv.controller.admin.PagingVO;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.entity.user.Address;
import com.ict.serv.entity.user.Guestbook;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.MypageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@RequestMapping("/mypage")
public class MypageController {
    private final MypageService service;
    private final InteractService interactService;

    @GetMapping("/reportList")
    public Map reportList(@AuthenticationPrincipal UserDetails userDetails, PagingVO pvo) {
        pvo.setOnePageRecord(5);
        User user = interactService.selectUserByName(userDetails.getUsername());
        pvo.setTotalRecord(service.totalReportRecord(user));
        Map map = new HashMap();
        map.put("pvo", pvo);
        map.put("reportList", service.getReportByUserFrom(user,pvo));

        return map;
    }

    @GetMapping("/guestbookList")
    public List<Guestbook> guestbookList(User user) {
        return service.selectGuestbookAll(user);
    }

    @GetMapping("/replyList/{id}")
    public List<Guestbook> replyList(@PathVariable int id) {
        return service.selectReplyAll(id);
    }

    @PostMapping("/guestbookWrite")
    public void guestbookWrite(@RequestBody Guestbook guestbook) {
        service.insertGuestbook(guestbook);
    }

    @GetMapping("/guestbookDelete/{id}")
    public void guestbookDelete(@PathVariable int id) {
        service.deleteGuestbook(service.selectGuestbookById(id).get());
    }

    @GetMapping("/productList/{id}")
    public List<Product> productList(@PathVariable long id) {
        return service.selectProductBySellerNo(id);
    }

    @GetMapping("/myInfoCount")
    public Map<String, Integer> myInfoCount(User user) {
        int followerCount = interactService.getFollowerList(user.getId()).size();
        int followingCount = interactService.getFollowingList(user.getId()).size();
        int wishCount = service.getWishCount(user.getId());

        Map<String, Integer> info = new HashMap<>();
        info.put("followerCount", followerCount);
        info.put("followingCount", followingCount);
        info.put("wishCount", wishCount);

        return info;
    }

    @GetMapping("/myFollow")
    public Map<String, List<User>> myFollow(User user) {
        List<User> followerList = interactService.getFollowerList(user.getId());
        List<User> followingList = interactService.getFollowingList(user.getId());

        Map<String, List<User>> myFollow = new HashMap<>();
        myFollow.put("followerList", followerList);
        myFollow.put("followingList", followingList);

        return myFollow;
    }

    @GetMapping("/getAddrList")
    public List<Address> getAddrList(@AuthenticationPrincipal UserDetails userDetails) {
        return service.getAddrList(interactService.selectUserByName(userDetails.getUsername()));
    }
    @PostMapping("/insertAddrList")
    public Address insertAddrList(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Address address) {
        address.setUser(interactService.selectUserByName(userDetails.getUsername()));
        address.setCreatedDate(LocalDateTime.now());
        address.setModifiedDate(LocalDateTime.now());

        System.out.println(address);
        return service.insertAddress(address);
    }
}
