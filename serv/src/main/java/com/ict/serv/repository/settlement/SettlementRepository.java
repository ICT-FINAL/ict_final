package com.ict.serv.repository.settlement;

import com.ict.serv.entity.order.Orders;

public interface SettlementRepository {
    boolean existsByOrders(Orders order);
}
