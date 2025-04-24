package com.ict.serv.repository;

import com.ict.serv.entity.coupon.Coupon;
import com.ict.serv.entity.coupon.CouponState;
import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    List<Coupon> findAllByTypeAndUser(String type, User user);

    List<Coupon> findAllByStateAndUser(CouponState state, User user);

    int countIdByUser(User user);

    int countIdByUserAndState(User user, CouponState state);

    List<Coupon> findAllByUserAndStateOrderByIdDesc(User user, CouponState state);

    List<Coupon> findAllByUserOrderByIdDesc(User user);
}
