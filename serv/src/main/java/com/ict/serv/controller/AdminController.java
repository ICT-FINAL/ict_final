package com.ict.serv.controller;

import com.ict.serv.entity.report.Report;
import com.ict.serv.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/admin")
public class AdminController {
    private final AdminService service;

    @GetMapping("/reportList")
    public List<Report> reportList(){
        return service.getAllReport();
    }
}
