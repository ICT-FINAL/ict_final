package com.ict.serv.service;

import com.ict.serv.controller.admin.PagingVO;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final ReportRepository report_repo;
    public Optional<Report> selectReport(Long id) {
        return report_repo.findById(id);
    }
    public void deleteReport(Long id) {
        report_repo.deleteById(id);
    }
    public List<Report> getAllReport(PagingVO pvo, ReportState state){
        boolean no_word = pvo.getSearchWord() == null || pvo.getSearchWord().isEmpty();
        boolean no_cat = pvo.getCategory()==null || pvo.getCategory().isEmpty();
        if(no_word && no_cat) {
            return report_repo.findAllByStateOrderByIdDesc(state, PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
        }
        else if(no_word){
            return report_repo.findAllByStateAndReportTypeContainingOrderByIdDesc(state,pvo.getCategory(),PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
        }else if(no_cat) {
            return report_repo.findAllIdByStateAndContainingSearchWord(state,pvo.getSearchWord(),PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
        }
        else {
            return report_repo.findAllByStateAndReportTypeContainingAndSearchWord(state,pvo.getCategory(),pvo.getSearchWord(),PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
        }
    }

    public int totalRecord(PagingVO pvo, ReportState state) {
        boolean no_word = pvo.getSearchWord() == null || pvo.getSearchWord().isEmpty();
        boolean no_cat = pvo.getCategory()==null || pvo.getCategory().isEmpty();
        if (no_word && no_cat){
            return report_repo.countIdByState(state);
        }
        else if(no_word) {
            return report_repo.countIdByStateAndReportTypeContaining(state,pvo.getCategory());
        } else if(no_cat){
            return report_repo.countIdByStateAndContainingSearchWord(state,pvo.getSearchWord());
        }
        else {
            return report_repo.countIdByStateAndReportTypeContainingAndSearchWord(state,pvo.getCategory(),pvo.getSearchWord());
        }
    }
}
