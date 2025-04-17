package com.ict.serv.controller;

import com.ict.serv.entity.log.search.KeywordDTO;
import com.ict.serv.service.LogService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/log")
public class LogController {
    private final LogService logService;

    @GetMapping("/searchRank")
    public List<KeywordDTO> getSearchRank(@RequestParam(defaultValue = "3") int hours,
                                    @RequestParam(defaultValue = "10") int topN) {
        return logService.getRealtimeKeywordRank(hours, topN);
    }
}
