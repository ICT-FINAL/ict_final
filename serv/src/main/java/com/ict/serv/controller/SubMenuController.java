package com.ict.serv.controller;

import com.ict.serv.entity.submenu.SubMenu;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.SubMenuService;
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
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/submenu")
public class SubMenuController {
    private final InteractService interactService;
    private final SubMenuService submenuService;

    @PostMapping("/write")
    @Transactional(rollbackFor = {RuntimeException.class, SQLException.class})
    public ResponseEntity<String> write(SubMenu submenu, MultipartFile file) {
        try{
            String startDate = submenu.getStartDate();
            String endDate = submenu.getEndDate();

            submenu.setStartDate(startDate);
            submenu.setEndDate(endDate);

            SubMenu savedSubMenu = submenuService.saveSubMenu(submenu);
            String uploadDir = System.getProperty("user.dir") + "/uploads/submenu/" + savedSubMenu.getId();
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
            savedSubMenu.setFilename(destFile.getName());

            submenuService.saveSubMenu(savedSubMenu);
            return ResponseEntity.ok("서브메뉴 등록 성공");
        } catch (Exception e) {
            e.printStackTrace();
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서브메뉴 등록 실패");
        }
    }
    @GetMapping("/getSubMenuList")
    public List<SubMenu> getSubMenuList(){
        return submenuService.getAllSubMenu();
    }
}
