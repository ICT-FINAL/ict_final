package com.ict.serv.controller;

import com.ict.serv.controller.admin.PagingVO;
import com.ict.serv.dto.UserPwdModDto;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.entity.user.Address;
import com.ict.serv.entity.user.Guestbook;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.AuthService;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.MypageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.sql.SQLOutput;
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
    private final AuthService authService;

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

    /* 개인 정보 수정 */
    @GetMapping("/getUser")
    public Optional<User> getUser(@AuthenticationPrincipal UserDetails userDetails){
        User user = interactService.selectUserByName(userDetails.getUsername());
        System.out.println(user.getId());

        Optional<User> getUserInfo = service.selectUserInfo(user);

        return getUserInfo;
    }

    @PostMapping("/editInfo")
    public ResponseEntity<String> editInfo(@AuthenticationPrincipal UserDetails userDetails, @RequestBody User user){
        User updated_user = interactService.selectUserByName(userDetails.getUsername());
        updated_user.setAddress(user.getAddress());
        updated_user.setZipcode(user.getZipcode());
        updated_user.setAddressDetail(user.getAddressDetail());
        updated_user.setUsername(user.getUsername());
        authService.saveUser(updated_user);
        return ResponseEntity.ok("수정 완료");
    }

    @PostMapping("/pwdCheck")
    public ResponseEntity<String> pwdCheck(@AuthenticationPrincipal UserDetails userDetails, @RequestBody UserPwdModDto userPwdModDto){
        System.out.println(userPwdModDto.toString());

        User user = new User();
        user.setId(userPwdModDto.getUserId());

        Optional<User> selectUser = service.selectUserInfo(user);

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String encodedPassword = encoder.encode(userPwdModDto.getModUserPw()); // 비밀번호 암호화

        if(encodedPassword.equals(selectUser.get().getUserpw())){ // 비밀번호가 같은지 확인
            System.out.println("비밀번호가 같습니다.");
        }

        System.out.println(selectUser.toString());

        return  ResponseEntity.ok("비밀번호 변경 백엔드 연결");
    }
}
