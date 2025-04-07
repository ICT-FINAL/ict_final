package com.ict.serv.service;

import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.entity.Inquiries.InquiryImage;
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


    @Value("${upload.path.inquiry}")
    private String uploadPath;

    @Transactional
    public Inquiry createInquiryWithImages(Inquiry inquiry, List<MultipartFile> images) throws IOException {

        Inquiry savedInquiry = inquiryRepository.save(inquiry);

        if (images != null && !images.isEmpty()) {
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            List<InquiryImage> inquiryImages = new ArrayList<>();
            for (MultipartFile imageFile : images) {
                if (!imageFile.isEmpty()) {
                    String originalFileName = imageFile.getOriginalFilename();
                    String fileExtension = "";
                    if (originalFileName != null && originalFileName.contains(".")) {
                        fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
                    }
                    String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
                    String filePath = uploadPath + File.separator + uniqueFileName;


                    Path destinationPath = Paths.get(filePath);
                    Files.copy(imageFile.getInputStream(), destinationPath);

                    InquiryImage inquiryImage = new InquiryImage();
                    inquiryImage.setFilename(uniqueFileName);
                    inquiryImage.setSize((int) imageFile.getSize());
                    inquiryImage.setInquiry(savedInquiry);

                    inquiryImages.add(inquiryImage);
                }
            }
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
