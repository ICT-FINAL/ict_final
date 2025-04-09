package com.ict.serv.repository.order;

import com.ict.serv.entity.order.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Orders, Long> {
}
