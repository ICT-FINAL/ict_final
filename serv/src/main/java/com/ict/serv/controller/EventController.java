package com.ict.serv.controller;

import com.ict.serv.entity.event.Event;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.EventService;
import com.ict.serv.service.InteractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.sql.SQLException;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/event")
public class EventController {
    private final InteractService interactService;
    private final EventService eventService;

    @PostMapping("/write")
    @Transactional(rollbackFor = {RuntimeException.class, SQLException.class})
    public ResponseEntity<String> write(Event event, MultipartFile file, @AuthenticationPrincipal UserDetails userDetails) {
        try{
            User writer = interactService.selectUserByName(userDetails.getUsername());
            event.setUser(writer);
            Event savedEvent = eventService.saveEvent(event);
            String uploadDir = System.getProperty("user.dir") + "/uploads/event/" + savedEvent.getId();
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();
            String originalFilename = file.getOriginalFilename();
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
            file.transferTo(destFile);
            savedEvent.setFilename(destFile.getName());

            eventService.saveEvent(savedEvent);
            return ResponseEntity.ok("상품 등록 성공");
        } catch (Exception e) {
            e.printStackTrace();
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("상품 등록 실패");
        }
    }
}
