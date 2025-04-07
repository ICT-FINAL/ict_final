package com.ict.serv.controller;

import com.ict.serv.controller.admin.PagingVO;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.entity.user.Guestbook;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.MypageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
        System.out.println(user);
        List<Guestbook> result = service.selectGuestbookAll(user);
        System.out.println("result=>" + result);
        return result;
    }

    @PostMapping("/guestbookWrite")
    public void guestbookWrite(@RequestBody Guestbook guestbook) {
        System.out.println(guestbook);
        service.insertGuestbook(guestbook);
    }

    @GetMapping("/guestbookDelete/{id}")
    public void guestbookDelete(@PathVariable int id) {
        service.deleteGuestbook(service.selectGuestbookById(id).get());
    }

    @GetMapping("/productList/{id}")
    public List<Product> productList(@PathVariable long id) {
        List<Product> result = service.selectProductBySellerNo(id);

        return result;
    }
}
