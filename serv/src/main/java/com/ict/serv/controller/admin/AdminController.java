package com.ict.serv.controller.admin;

import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.service.AdminService;
import com.ict.serv.service.InteractService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
