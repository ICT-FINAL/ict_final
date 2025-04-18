package com.ict.serv.service;

import com.ict.serv.entity.submenu.SubMenu;
import com.ict.serv.repository.SubMenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubMenuService {
    private final SubMenuRepository repo;
    public SubMenu saveSubMenu(SubMenu submenu) {
        return repo.save(submenu);
    }

    public List<SubMenu> getAllSubMenu() {
        return repo.findAllByOrderByStartDateDesc();
    }
}
