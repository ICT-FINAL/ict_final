package com.ict.serv.repository.order;

import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.user.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Orders, Long> {
    int countIdByUser(User user);

    List<Orders> findAllByUserOrderByStartDateDesc(User user, PageRequest of);

    List<Orders> findByUserAndProductId(User user, Long productId);
}
