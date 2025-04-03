package com.ict.serv.service;

import com.ict.serv.controller.admin.PagingVO;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MypageService {
    private final ReportRepository report_repo;
    public List<Report> getReportByUserFrom(User user, PagingVO pvo) {
        return report_repo.findAllByUserFromOrderByCreateDateDesc(user, PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
    }
    public int totalReportRecord(User user){
        return report_repo.countIdByUserFrom(user);
    }
}
