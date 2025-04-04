package com.ict.serv.controller;

import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/inquiry")
@RequiredArgsConstructor
@RestController
public class InquiryController {
//    private final InquiryService service;
//
//    public String InquiryWriteOk(@RequestBody Inquiry inquiry){
//        Inquiry result = service.InquiryInsert(inquiry);
////        //if(result =null || result.getId()==0){
////            return "cancel";
////        }else{
////            return "ok";
////        }
//    }
}
