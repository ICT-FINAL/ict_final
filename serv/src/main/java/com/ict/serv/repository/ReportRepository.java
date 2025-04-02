package com.ict.serv.repository;

import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.report.ReportState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    /*
    List<Message> findAllByUserTo(User user);
    Message findMessageById(Long id);

    List<Message> findAllByUserToOrderByIdDesc(User user);*/
    List<Report> findAllByStateOrderByIdDesc(ReportState state);
}
