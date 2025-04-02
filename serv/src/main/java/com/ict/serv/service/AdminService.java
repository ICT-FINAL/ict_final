package com.ict.serv.service;

import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final ReportRepository report_repo;
    public List<Report> getAllReport(){
        return report_repo.findAllByStateOrderByIdDesc(ReportState.READABLE);
    }
}
