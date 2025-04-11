package com.ict.serv.repository.inquiry;

import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long>, JpaSpecificationExecutor<Inquiry> {

    List<Inquiry> findByUserOrderByInquiryWritedateDesc(User currentUser, PageRequest pageRequest);

    long countByUser(User currentUser);
}
