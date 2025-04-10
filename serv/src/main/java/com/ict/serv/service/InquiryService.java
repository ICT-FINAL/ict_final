package com.ict.serv.service;

import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.entity.Inquiries.InquiryImage;
import com.ict.serv.entity.product.ProductImage;
import com.ict.serv.repository.inquiry.InquiryImageRepository;
import com.ict.serv.repository.inquiry.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final InquiryImageRepository inquiryImageRepository;




    @Transactional
    public Inquiry createInquiryWithImages(Inquiry inquiry, List<MultipartFile> images) throws IOException {
        List<File> savedFiles = new ArrayList<>();
        Inquiry savedInquiry = inquiryRepository.save(inquiry);
        String uploadDir = System.getProperty("user.dir") + "/uploads/inquiry/" + savedInquiry.getId();
        File dir = new File(uploadDir);
        if (images != null && !images.isEmpty()) {
            if (!dir.exists()) {
                dir.mkdirs();
            }

            List<InquiryImage> inquiryImages = new ArrayList<>();
            for (MultipartFile image : images) {
                if (image.isEmpty()) continue;
                String originalFilename = image.getOriginalFilename();
                if (originalFilename == null) continue;

                File destFile = new File(uploadDir, originalFilename);
                int point = originalFilename.lastIndexOf(".");
                String baseName = originalFilename.substring(0, point);
                String extension = originalFilename.substring(point + 1);

                int count = 1;
                while (destFile.exists()) {
                    String newFilename = baseName + "(" + count + ")." + extension;
                    destFile = new File(uploadDir, newFilename);
                    count++;
                }
                image.transferTo(destFile);
                savedFiles.add(destFile);
                InquiryImage inquiryImage = new InquiryImage();
                inquiryImage.setFilename(destFile.getName());
                inquiryImage.setSize((int) destFile.length());
                inquiryImage.setInquiry(savedInquiry);


                savedInquiry.getImages().add(inquiryImage);
            }
            inquiryRepository.save(savedInquiry);
            if (!inquiryImages.isEmpty()) {
                inquiryImageRepository.saveAll(inquiryImages);
            }
        }

        return savedInquiry;
    }

    public Inquiry InquiryInsert(Inquiry inquiry){
        return inquiryRepository.save(inquiry);
    }
}
