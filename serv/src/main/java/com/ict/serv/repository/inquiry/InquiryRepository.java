package com.ict.serv.repository.inquiry;

import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    List<Inquiry> findByUserOrderByInquiryWritedateDesc(User currentUser);
}
