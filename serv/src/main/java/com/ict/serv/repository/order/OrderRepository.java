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
import java.util.Map;

public interface OrderRepository extends JpaRepository<Orders, Long> {
    int countIdByUser(User user);

    List<Orders> findAllByUserOrderByStartDateDesc(User user, PageRequest of);

    List<Orders> findByUserAndProductId(User user, Long productId);

    List<Orders> findAllByOrderGroup(OrderGroup orderGroup);

    @Query(value = "SELECT p.product_category, COUNT(*) AS count " +
            "FROM orders o " +
            "JOIN order_group og ON o.order_group_id = og.order_group_id " +
            "JOIN product p ON o.product_id = p.product_id " +
            "WHERE og.state = 'PAID' " +
            "OR og.state = 'PARTRETURNED' " +
            "AND o.start_date >= NOW() - INTERVAL 14 DAY " +
            "GROUP BY p.product_category " +
            "ORDER BY count DESC " +
            "LIMIT 6", nativeQuery = true)
    List<Object[]> countProductCategoryFromPaidOrdersWithinTwoWeeks();

    @Query(value = """
    SELECT p.product_category AS category,
           SUM(oi.quantity) AS total_quantity,
           SUM(oi.quantity * p.price) AS total_revenue
    FROM order_item oi
    JOIN option_category oc ON oi.option_category_id = oc.option_category_id
    JOIN product_option o ON oc.option_id = o.option_id
    JOIN product p ON o.product_id = p.product_id
    JOIN orders ord ON oi.order_id = ord.order_id
    JOIN order_group og ON ord.order_group_id = og.order_group_id
    WHERE og.state IN ('PAID', 'PARTRETURNED')
    GROUP BY p.product_category
""", nativeQuery = true)
    List<Object[]> getSalesDataByCategory();

    @Query(value = """
    SELECT p.event_category AS category,
           SUM(oi.quantity) AS total_quantity,
           SUM(oi.quantity * p.price) AS total_revenue
    FROM order_item oi
    JOIN option_category oc ON oi.option_category_id = oc.option_category_id
    JOIN product_option po ON oc.option_id = po.option_id
    JOIN product p ON po.product_id = p.product_id
    JOIN orders o ON oi.order_id = o.order_id
    JOIN order_group og ON o.order_group_id = og.order_group_id
    WHERE og.state IN ('PAID', 'PARTRETURNED')
    GROUP BY p.event_category
""", nativeQuery = true)
    List<Object[]> getSalesByEventCategory();

    @Query(value = """
    SELECT p.target_category AS category,
           SUM(oi.quantity) AS total_quantity,
           SUM(oi.quantity * p.price) AS total_revenue
    FROM order_item oi
    JOIN option_category oc ON oi.option_category_id = oc.option_category_id
    JOIN product_option po ON oc.option_id = po.option_id
    JOIN product p ON po.product_id = p.product_id
    JOIN orders o ON oi.order_id = o.order_id
    JOIN order_group og ON o.order_group_id = og.order_group_id
    WHERE og.state IN ('PAID', 'PARTRETURNED')
    GROUP BY p.target_category
""", nativeQuery = true)
    List<Object[]> getSalesByTargetCategory();

    @Query("SELECT oi.product.id, COUNT(oi) FROM OrderItem oi GROUP BY oi.product.id")
    List<Object[]> countAllGroupedByProduct();

    List<Orders> findAllByProductIdOrderByIdDesc(Long id);
}
