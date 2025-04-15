package com.ict.serv.repository.order;

import com.ict.serv.entity.order.OrderGroup;
import com.ict.serv.entity.order.OrderState;
import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.product.HotCategoryDTO;
import com.ict.serv.entity.user.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface OrderRepository extends JpaRepository<Orders, Long> {
    int countIdByUser(User user);

    List<Orders> findAllByUserOrderByStartDateDesc(User user, PageRequest of);

    List<Orders> findByUserAndProductId(User user, Long productId);

    List<Orders> findAllByOrderGroup(OrderGroup orderGroup);

    List<Orders> findAllByProductIdOrderByStartDateDesc(Long id);

    @Query(value = "SELECT p.product_category, COUNT(*) AS count " +
            "FROM orders o " +
            "JOIN order_group og ON o.order_group_id = og.order_group_id " +
            "JOIN product p ON o.product_id = p.product_id " +
            "WHERE og.state = 'PAID' " +
            "AND o.start_date >= NOW() - INTERVAL 14 DAY " +
            "GROUP BY p.product_category " +
            "ORDER BY count DESC " +
            "LIMIT 6", nativeQuery = true)
    List<Object[]> countProductCategoryFromPaidOrdersWithinTwoWeeks();
}
