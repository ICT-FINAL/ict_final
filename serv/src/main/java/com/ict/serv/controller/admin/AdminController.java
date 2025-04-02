package com.ict.serv.controller.admin;

import com.ict.serv.entity.Authority;
import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.AdminService;
import com.ict.serv.service.AuthService;
import com.ict.serv.service.InteractService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/admin")
public class AdminController {
    private final AdminService service;
    private final InteractService inter_service;
    private final AuthService auth_service;

    @GetMapping("/reportList")
    public Map reportList(String type, PagingVO pvo){
        pvo.setOnePageRecord(5);
        System.out.println(service.totalRecord(pvo,ReportState.valueOf(type)));
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
    @GetMapping("/reportApprove")
    public String reportApprove(@AuthenticationPrincipal UserDetails userDetails, Long toId, Long fromId, Long reportId, String approveType, String comment) {
        System.out.println(toId);
        System.out.println(reportId);
        User user = inter_service.selectUser(toId);
        user.setAuthority(Authority.ROLE_BANNED);
        Report report = inter_service.selectReport(reportId).get();
        report.setReportText(comment);

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
}
