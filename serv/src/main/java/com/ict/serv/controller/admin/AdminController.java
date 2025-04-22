package com.ict.serv.controller.admin;

import com.ict.serv.entity.Authority;
import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.entity.Inquiries.InquiryPagingVO;
import com.ict.serv.entity.Inquiries.InquiryState;
import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.product.Option;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.product.ProductState;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.report.ReportSort;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.UserRepository;
import com.ict.serv.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.awt.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/admin")
public class AdminController {
    private final AdminService service;
    private final AuthService auth_service;
    private final InteractService inter_service;
    private final InquiryService inquiryService;
    private final UserRepository userRepository;
    private final ProductService productService;

    @GetMapping("/reportList")
    public Map reportList(PagingVO pvo){
        //System.out.println("reportList"+pvo);
        pvo.setOnePageRecord(5);
        pvo.setTotalRecord(service.totalRecord(pvo));
        Map map = new HashMap();
        map.put("pvo", pvo);
        map.put("reportList", service.getAllReport(pvo, pvo.getState()));

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
        System.out.println(inquiryList.get(0).getInquiryStatus() + ":" +inquiryList.size());
        return map;
    }

    @GetMapping("/reportApprove")
    public String reportApprove(@AuthenticationPrincipal UserDetails userDetails, Long toId, Long fromId, Long reportId, ReportSort sort, Long sortId, String approveType, String comment) {
        User user = inter_service.selectUser(toId);
        Product product = productService.selectProduct(sortId).get();

        Report report = inter_service.selectReport(reportId).get();
        report.setReportText(comment);
        report.setSort(sort);
        report.setSortId(sortId);

        if(sort != null && sort.toString().equals("USER")) {
            if (approveType != null && approveType.equals("신고 취소")) {
                System.out.println("유저 신고 취소");
            } else
                user.setAuthority(Authority.ROLE_BANNED);
        } else if(sort != null && sort.toString().equals("PRODUCT")){
            if (approveType != null && approveType.equals("신고 취소")) {
                System.out.println("상품 신고 취소");
            }else
                product.setState(ProductState.PAUSE);
        }else if(sort !=null && sort.toString().equals("REVIEW")){
            if (approveType != null && approveType.equals("신고 취소")) {
                System.out.println("리뷰 신고 취소");
            }else
                product.setState(ProductState.PAUSE);
        }

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSS");
        String formattedDate = now.format(formatter);

        report.setEndDate(formattedDate);
        report.setState(ReportState.COMPLETE);
        report.setReportResult(approveType);
        inter_service.sendReport(report);
        auth_service.saveUser(user);
        User from_user = inter_service.selectUser(fromId);
        Message msg = new Message();
        msg.setSubject("'"+user.getUsername()+"'님에 대한 신고 처리가 완료되었습니다.");
        msg.setComment("자세한 처리 내용은 마이페이지>신고내역을 확인해주세요.");
        msg.setUserTo(from_user);
        msg.setUserFrom(inter_service.selectUserByName(userDetails.getUsername()));
        inter_service.sendMessage(msg);

        return "ok";
    }

    @GetMapping("/getUsers")
    public ResponseEntity<Map<String, Object>> getUsersWithSearch(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String authority
    ) {
        Map<String, Object> response = new HashMap<>();
        long totalUserCount = userRepository.countByAuthority(Authority.ROLE_USER);
        response.put("totalCount", totalUserCount);

        if (keyword == null) keyword = "";
        keyword = keyword.trim();

        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "id"));
        Page<User> userPage;

        if (authority == null || "전체".equals(authority)) {
            userPage = userRepository.findByUseridContainingOrUsernameContaining(keyword, keyword, pageable);
        } else {
            Authority auth;
            try {
                if ("관리자".equals(authority)) auth = Authority.ROLE_ADMIN;
                else if ("사용자".equals(authority)) auth = Authority.ROLE_USER;
                else throw new IllegalArgumentException();
            } catch (Exception e) {
                response.put("message", "잘못된 권한 필터입니다.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            userPage = userRepository.findByAuthorityAndUseridContainingOrAuthorityAndUsernameContaining(
                    auth, keyword, auth, keyword, pageable);
        }

        response.put("users", userPage.getContent());
        response.put("selectedCount", userPage.getTotalElements());
        response.put("totalPage", userPage.getTotalPages());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}

