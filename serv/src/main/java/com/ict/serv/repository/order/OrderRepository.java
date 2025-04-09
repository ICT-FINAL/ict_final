package com.ict.serv.repository.order;

import com.ict.serv.entity.order.OrderState;
import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Orders, Long> {
    int countIdByUser(User user);

    List<Orders> findAllByUserOrderByStartDateDesc(User user, PageRequest of);

    int countIdByUserAndState(User user, OrderState state);

    List<Orders> findAllByUserAndStateOrderByStartDateDesc(User user, OrderState state, PageRequest of);

    List<Orders> findAllByProductIdAndState(Long id, OrderState orderState);
}
