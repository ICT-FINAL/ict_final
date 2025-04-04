package com.ict.serv.service;

import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.repository.EventRepository;
import com.ict.serv.repository.inquiry.InquiryImageRepository;
import com.ict.serv.repository.inquiry.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InquiryService {
    private final InquiryRepository inquiryRepository;
    private final InquiryImageRepository inquiryImageRepository;
    public Inquiry InquiryInsert(Inquiry inquiry){
        return inquiryRepository.save(inquiry);
    }
}
