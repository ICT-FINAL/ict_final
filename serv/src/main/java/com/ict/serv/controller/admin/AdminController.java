package com.ict.serv.controller.admin;

import com.ict.serv.entity.Authority;
import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.entity.Inquiries.InquiryPagingVO;
import com.ict.serv.entity.Inquiries.InquiryState;
import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.UserRepository;
import com.ict.serv.service.AdminService;
import com.ict.serv.service.InquiryService;
import com.ict.serv.service.InteractService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/admin")
public class AdminController {
    private final AdminService service;
    private final InteractService inter_service;
    private final InquiryService inquiryService;
    private final UserRepository userRepository;

    @GetMapping("/reportList")
    public Map reportList(String type, PagingVO pvo){
        pvo.setOnePageRecord(5);
        pvo.setTotalRecord(service.totalRecord(pvo,ReportState.valueOf(type)));
        Map map = new HashMap();
        map.put("pvo", pvo);
        map.put("reportList", service.getAllReport(pvo, ReportState.valueOf(type)));

        return map;
    }
    @GetMapping("/changeState")
    public String changeState(String state, Long id) {
        Report report = service.selectReport(id).get();
        report.setState(ReportState.valueOf(state));
        inter_service.sendReport(report);
        return "ok";
    }
    @GetMapping("/delReport")
    public String delReport(Long id) {
        service.deleteReport(id);
        return "ok";
    }
    @GetMapping("/inquiryList")
    public Map<String, Object> getAllInquiries(
            @RequestParam(value = "status") String statusStr,
            @RequestParam(value = "inquiryType", required = false, defaultValue = "") String inquiryType,
            @ModelAttribute InquiryPagingVO pvo) {
        InquiryState status;
        try {
            status = InquiryState.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", "Invalid status value: " + statusStr);
            errorMap.put("inquiryList", List.of());
            pvo.setNowPage(pvo.getNowPage());
            pvo.setTotalRecord(0);
            errorMap.put("pvo", pvo);
            return errorMap;
        }

        pvo.setNowPage(pvo.getNowPage());

        try {
            long totalRecord = service.countAdminInquiries(status, inquiryType);
            pvo.setTotalRecord((int) totalRecord);
        } catch (Exception e) {
            pvo.setTotalRecord(0);
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", "Error counting inquiries.");
            errorMap.put("inquiryList", List.of());
            errorMap.put("pvo", pvo);
            return errorMap;
        }

        List<Inquiry> inquiryList;
        try {
            inquiryList = service.getAdminInquiryList(pvo, status, inquiryType);
        } catch (Exception e) {
            inquiryList = List.of();
        }

        Map<String, Object> map = new HashMap<>();
        map.put("pvo", pvo);
        map.put("inquiryList", inquiryList);

        return map;
    }

    @GetMapping("/getUsers")
    public ResponseEntity<Map<String, Object>> getUsersWithSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String authority
    ) {
        List<User> users;
        Map<String, Object> response = new HashMap<>();

        long totalUserCount = userRepository.countByAuthority(Authority.ROLE_USER);
        response.put("total", totalUserCount);

        if(keyword == null && authority == null) {
            users = userRepository.findAll();
        }
        else if ("전체".equals(authority)) {
          users = userRepository.findByUseridContainingOrUsernameContaining(keyword, keyword);
        } else if ("관리자".equals(authority)) {
            Authority adminAuthority = Authority.ROLE_ADMIN;
            users = userRepository.findByAuthorityAndUseridContainingOrAuthorityAndUsernameContaining(
                    adminAuthority, keyword, adminAuthority, keyword);
        } else if ("사용자".equals(authority)) {
            Authority adminAuthority = Authority.ROLE_USER;
            users = userRepository.findByAuthorityAndUseridContainingOrAuthorityAndUsernameContaining(
                    adminAuthority, keyword, adminAuthority, keyword);
        } else {
            response.put("message", "잘못된 권한 필터입니다.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
        response.put("users", users);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}

