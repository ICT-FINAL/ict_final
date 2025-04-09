package com.ict.serv.controller;

import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.entity.Inquiries.InquiryState;
import com.ict.serv.entity.Inquiries.Response;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.UserRepository;
import com.ict.serv.repository.inquiry.InquiryRepository;
import com.ict.serv.service.InquiryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RequestMapping("/inquiry")
@RequiredArgsConstructor
@RestController
@Slf4j
public class InquiryController {
    private final InquiryService inquiryService;
    private final UserRepository userRepository;
    private final InquiryRepository inquiryRepository;


    @PostMapping("/inquiryWriteOk")
    public ResponseEntity<String> InquiryWriteOk(
            @RequestParam("inquiry_subject")String inquirySubject,
            @RequestParam("inquiry_type") String inquiryType,
            @RequestParam("inquiry_content") String inquiryContent,
            @RequestParam("user_id") Long userId,
            @RequestParam(value="inquiry_image", required = false) List<MultipartFile> images
            ){
            try{
                Optional<User> userOptional = userRepository.findById(userId);
                if (userOptional.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("no user");
                }
                User user = userOptional.get();

                Inquiry inquiry = new Inquiry();
                inquiry.setInquirySubject(inquirySubject);
                inquiry.setInquiryType(inquiryType);
                inquiry.setInquiryContent(inquiryContent);
                inquiry.setUser(user);
                inquiry.setInquiryWritedate(LocalDateTime.now());
                inquiry.setInquiryStatus(InquiryState.NOANSWER);

                Inquiry result = inquiryService.createInquiryWithImages(inquiry, images);

                if (result == null || result.getId() == null || result.getId() == 0) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("");
                } else {
                    return ResponseEntity.ok("ok");
                }
                }catch(Exception e){
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("err" + e.getMessage());
            }
        }
        @GetMapping("/inquiryList")
        public ResponseEntity<?> getMyInquiries(@AuthenticationPrincipal UserDetails userDetails) {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증.");
            }
            String currentUsername =  userDetails.getUsername();

            User currentUser = userRepository.findUserByUserid(currentUsername);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("");
            }
            try {
                List<Inquiry> inquiries = inquiryRepository.findByUserOrderByInquiryWritedateDesc(currentUser);
                return ResponseEntity.ok(inquiries);

            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("");
            }
        }
    }

