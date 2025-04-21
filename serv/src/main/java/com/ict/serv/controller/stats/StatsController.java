package com.ict.serv.controller.stats;

import com.ict.serv.entity.order.OrderGroup;
import com.ict.serv.entity.sales.SalesStatsDTO;
import com.ict.serv.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/stats")
@RequiredArgsConstructor
@RestController
@CrossOrigin(origins = "*")
public class StatsController {
    private final OrderService orderService;

    @GetMapping("/sales")
    public List<SalesStatsDTO> sales() {
        return orderService.getDailySalesStats();
    }
}
