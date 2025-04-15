package com.ict.serv.controller;

import com.ict.serv.entity.PointType;
import com.ict.serv.entity.UserPoint;
import com.ict.serv.entity.coupon.Coupon;
import com.ict.serv.entity.coupon.CouponState;
import com.ict.serv.entity.event.Event;
import com.ict.serv.entity.event.Melon;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.UserPointRepository;
import com.ict.serv.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/event")
public class EventController {
    private final InteractService interactService;
    private final EventService eventService;
    private final RouletteService rouletteService;
    private final UserPointRepository userPointRepository;
    private final CouponService couponService;
    private final AuthService authService;

    @PostMapping("/write")
    @Transactional(rollbackFor = {RuntimeException.class, SQLException.class})
    public ResponseEntity<String> write(Event event, MultipartFile file, @AuthenticationPrincipal UserDetails userDetails) {
        try{
            User writer = interactService.selectUserByName(userDetails.getUsername());
            event.setUser(writer);
            String startDate = event.getStartDate();
            String endDate = event.getEndDate();

            event.setStartDate(startDate);
            event.setEndDate(endDate);

            Event savedEvent = eventService.saveEvent(event);
            String uploadDir = System.getProperty("user.dir") + "/uploads/event/" + savedEvent.getId();
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();
            String originalFilename = file.getOriginalFilename();
            File destFile = new File(uploadDir, originalFilename);
            int point = originalFilename.lastIndexOf(".");
            String baseName = originalFilename.substring(0, point);
            String extension = originalFilename.substring(point + 1);

            int count = 1;
            while (destFile.exists()) {
                String newFilename = baseName + "(" + count + ")." + extension;
                destFile = new File(uploadDir, newFilename);
                count++;
            }
            file.transferTo(destFile);
            savedEvent.setFilename(destFile.getName());

            eventService.saveEvent(savedEvent);
            return ResponseEntity.ok("이벤트 등록 성공");
        } catch (Exception e) {
            e.printStackTrace();
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("이벤트 등록 실패");
        }
    }
    @GetMapping("/getEventList")
    public List<Event> getEventList(){
        return eventService.getAllEvent();
    }

    @GetMapping("/melonRank")
    public String melonRank(@AuthenticationPrincipal UserDetails userDetails, Melon melon) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        if(couponService.selectUserPointByMelon(PointType.MELON,user)==null) {
            user.setGradePoint(user.getGradePoint()+ melon.getScore());
            UserPoint user_point = new UserPoint(user.getId(), melon.getScore(), LocalDate.now(), PointType.MELON);
            userPointRepository.save(user_point);
            authService.saveUser(user);
        }
        melon.setUser(user);
        melon.setStartDate(LocalDateTime.now());
        eventService.saveMelon(melon);
        if(!couponService.findCouponByType("melon",user).isEmpty()) return "이미 쿠폰을 지급받으셨습니다.";
        Coupon coupon = new Coupon();
        coupon.setType("melon");
        coupon.setCouponName("멜론 게임 쿠폰");
        coupon.setUser(user);
        coupon.setState(CouponState.AVAILABLE);
        coupon.setStartDate(LocalDateTime.now());
        coupon.setEndDate(LocalDateTime.now().plusYears(1));
        if(melon.getScore() >= 100) {
            coupon.setDiscount(1000);
            couponService.saveCoupon(coupon);
            return "1000원 쿠폰이 지급되었습니다.";
        }
        return "ok";
    }
    @GetMapping("/getMelonRank")
    public List<Melon> getMelonRank() {
        return eventService.getMelonList();
    }
}
