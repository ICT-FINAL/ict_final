package com.ict.serv.controller.stats;

import com.ict.serv.entity.order.OrderGroup;
import com.ict.serv.entity.sales.CategorySalesDTO;
import com.ict.serv.entity.sales.SalesStatsDTO;
import com.ict.serv.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    @GetMapping("/category")
    public ResponseEntity<List<CategorySalesDTO>> getSalesByCategory() {
        return ResponseEntity.ok(orderService.getSalesByCategory());
    }

    @GetMapping("/event")
    public ResponseEntity<List<CategorySalesDTO>> getByEventCategory() {
        return ResponseEntity.ok(orderService.getSalesByEventCategory());
    }

    @GetMapping("/target")
    public ResponseEntity<List<CategorySalesDTO>> getByTargetCategory() {
        return ResponseEntity.ok(orderService.getSalesByTargetCategory());
    }
}
